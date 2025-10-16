import { Settings2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SwapSettings as SwapSettingsType } from "@/hooks/useSwap";

type SwapSettingsProps = {
  settings: SwapSettingsType;
  onSettingsChange: (settings: SwapSettingsType) => void;
};

export function SwapSettings({
  settings,
  onSettingsChange,
}: SwapSettingsProps) {
  const slippagePercent = settings.slippageBps / 100;

  const handleSlippageChange = (value: string) => {
    // Allow empty string or valid decimal numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onSettingsChange({
          ...settings,
          slippageBps: Math.round(numValue * 100),
        });
      } else if (value === "") {
        onSettingsChange({
          ...settings,
          slippageBps: 0,
        });
      }
    }
  };

  const setPresetSlippage = (bps: number) => {
    onSettingsChange({
      ...settings,
      slippageBps: bps,
    });
  };

  const isHighSlippage = slippagePercent > 1;
  const isVeryHighSlippage = slippagePercent > 5;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
          <Settings2 className="size-5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-semibold">Swap Settings</h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Slippage tolerance</span>
            </div>

            <div className="flex gap-2">
              {[10, 50, 100].map((bps) => (
                <button
                  key={bps}
                  onClick={() => setPresetSlippage(bps)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    settings.slippageBps === bps
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent hover:bg-accent/80"
                  )}
                >
                  {bps / 100}%
                </button>
              ))}
            </div>

            <div className="relative">
              <Input
                type="text"
                inputMode="decimal"
                value={slippagePercent || ""}
                onChange={(e) => handleSlippageChange(e.target.value)}
                placeholder="0.50"
                className={cn(
                  "pr-8",
                  isVeryHighSlippage &&
                    "border-red-500 focus-visible:ring-red-500",
                  isHighSlippage &&
                    !isVeryHighSlippage &&
                    "border-yellow-500 focus-visible:ring-yellow-500"
                )}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>

            {isVeryHighSlippage && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
                ⚠️ Your transaction may be frontrun due to high slippage
                tolerance
              </div>
            )}

            {isHighSlippage && !isVeryHighSlippage && (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ High slippage tolerance. Your transaction may be frontrun
              </div>
            )}

            {slippagePercent > 0 && slippagePercent < 0.05 && (
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-600 dark:text-yellow-400">
                ⚠️ Your transaction may fail due to low slippage tolerance
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
