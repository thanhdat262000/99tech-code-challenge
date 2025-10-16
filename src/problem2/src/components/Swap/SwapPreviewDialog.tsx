import { ArrowDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useTokens } from "@/hooks/useTokens";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: string;
  to: string;
  amountIn: string;
  amountOut: string;
  quote:
    | {
        rate: number;
        priceImpactPct: number;
        minOut: number;
        usdValue: number;
      }
    | undefined;
  onConfirm?: () => void;
  isLoading?: boolean;
};

export function SwapPreviewDialog({
  open,
  onOpenChange,
  from,
  to,
  amountIn,
  amountOut,
  quote,
  onConfirm,
  isLoading = false,
}: Props) {
  const { data: tokens } = useTokens();
  const fromToken = tokens?.find(
    (t) => t.currency.toUpperCase() === from.toUpperCase()
  );
  const toToken = tokens?.find(
    (t) => t.currency.toUpperCase() === to.toUpperCase()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Preview swap</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">You pay</span>
              <span className="text-2xl font-semibold">
                {formatCurrency(Number(amountIn) || 0)} {from}
              </span>
              <span className="text-muted-foreground text-sm">
                ${formatCurrency(Number(amountIn) * (fromToken?.price || 0))}
              </span>
            </div>
            {fromToken?.icon && (
              <img
                src={fromToken.icon}
                alt={from}
                className="size-10 rounded-full"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <div className="flex justify-start">
            <div className="px-2">
              <ArrowDown className="size-5" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm">
                You receive (est.)
              </span>
              <span className="text-2xl font-semibold">
                {quote ? amountOut : "0.000000"} {to}
              </span>
              <span className="text-muted-foreground text-sm">
                ~$
                {((Number(amountOut) || 0) * (toToken?.price || 0)).toFixed(2)}
              </span>
            </div>
            {toToken?.icon && (
              <img
                src={toToken.icon}
                alt={to}
                className="size-10 rounded-full"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <div className="rounded-xl bg-accent/30 p-3 text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">
                1 {from} = {quote?.rate.toFixed(6)} {to}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price impact</span>
              <span
                className={cn(
                  "font-medium",
                  quote && quote.priceImpactPct > 5
                    ? "text-destructive"
                    : quote && quote.priceImpactPct > 1
                    ? "text-yellow-600 dark:text-yellow-400"
                    : ""
                )}
              >
                {quote
                  ? quote.priceImpactPct < 0.01
                    ? "< 0.01%"
                    : `${quote.priceImpactPct.toFixed(2)}%`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Minimum received</span>
              <span className="font-medium">
                {quote ? quote.minOut.toFixed(6) : "-"} {to}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="text-lg w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Swapping…</span>
              </>
            ) : (
              <span>Confirm and swap</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SwapPreviewDialog;
