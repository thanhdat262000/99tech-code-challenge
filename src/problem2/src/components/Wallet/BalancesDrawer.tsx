import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBalances } from "@/hooks/useBalances";
import { useTokens } from "@/hooks/useTokens";
import { Badge } from "@/components/ui/badge";
import { formatAddress, formatCurrency } from "@/lib/utils";
import { Copy, Check, Power } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "../ui/button";

type BalancesDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BalancesDrawer({ open, onOpenChange }: BalancesDrawerProps) {
  const { data: balances = [] } = useBalances();
  const { address } = useAccount();
  const { data: tokens } = useTokens();
  const [copied, setCopied] = useState(false);
  const { disconnect } = useDisconnect();

  const handleCopy = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onOpenChange(false);
  };

  const totalUsdValue = balances.reduce((sum, b) => {
    const tokenData = tokens?.find((t) => t.currency === b.symbol);
    return sum + (tokenData ? b.amount * tokenData.price : 0);
  }, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96">
        <SheetHeader className="pb-0">
          <SheetTitle className="text-2xl">Your Wallet</SheetTitle>
          <SheetDescription>
            {address && (
              <div className="mt-3 mb-4 flex items-center justify-between rounded-lg bg-accent/30 p-3">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                    <span className="font-medium text-foreground">
                      {formatAddress(address)}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? (
                      <Check className="size-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <Button
                  variant="ghost"
                  className="rounded-full size-8"
                  onClick={handleDisconnect}
                >
                  <Power className="size-6 text-muted-foreground" />
                </Button>
              </div>
            )}
            <div className="mt-4 mb-2">
              <div className="text-3xl font-bold text-foreground">
                ${formatCurrency(totalUsdValue)}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-600 dark:text-green-400"
                >
                  +2.26$ (3,06%)
                </Badge>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 overflow-y-auto">
          <div className="space-y-2">
            {balances.map((b) => {
              const tokenData = tokens?.find((t) => t.currency === b.symbol);
              const usdValue = tokenData ? b.amount * tokenData.price : 0;
              const changePercent = (Math.random() * 8 - 1).toFixed(2);
              const isPositive = parseFloat(changePercent) >= 0;

              return (
                <div
                  key={b.symbol}
                  className="flex items-center justify-between rounded-lg hover:bg-accent p-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={tokenData?.icon}
                      className="size-10 rounded-full"
                      alt={b.symbol}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div>
                      <div className="font-semibold">{b.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(b.amount)} {b.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${formatCurrency(usdValue)}
                    </div>
                    <div
                      className={`text-xs ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive ? "▲" : "▼"}{" "}
                      {Math.abs(parseFloat(changePercent))}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
