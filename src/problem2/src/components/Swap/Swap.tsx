import { useTokens } from "@/hooks/useTokens";
import { useState } from "react";
import { useSwap } from "@/hooks/useSwap";
import { useBalances, useUpdateBalances } from "@/hooks/useBalances";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelector } from "@/components/Swap/TokenSelector";
import { SwapSettings } from "@/components/Swap/SwapSettings";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  X,
} from "lucide-react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import SwapPreviewDialog from "@/components/Swap/SwapPreviewDialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Swap() {
  const { data: tokens, isLoading } = useTokens();
  const {
    from,
    to,
    amountIn,
    settings,
    setSettings,
    quote,
    amountOut,
    toPrice,
    fromPrice,
    handleChangeFromAmount,
    handleChangeToAmount,
    handleSwapDirection,
    handleFromTokenSelect,
    handleToTokenSelect,
  } = useSwap();
  const { data: balances = [] } = useBalances();
  const { mutate: updateBalances, isPending: isUpdating } = useUpdateBalances();
  const queryClient = useQueryClient();
  // Local UI state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fromBalance = balances.find((b) => b.symbol === from);
  const toBalance = balances.find((b) => b.symbol === to);

  const handleConfirmSwap = () => {
    updateBalances(
      {
        fromSymbol: from,
        toSymbol: to,
        amountIn,
        amountOut,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["balances"] });
          setIsPreviewOpen(false);

          const fromToken = tokens?.find((t) => t.currency === from);
          const toToken = tokens?.find((t) => t.currency === to);

          const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

          toast.custom(
            (t) => (
              <div className="flex flex-col gap-2 w-full bg-accent p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold">Swap Successful!</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    {fromToken?.icon && (
                      <img
                        src={fromToken.icon}
                        alt={from}
                        className="size-4 rounded-full"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                    <span>
                      {formatNumber(Number(amountIn))} {from}
                    </span>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <div className="flex items-center gap-1">
                    {toToken?.icon && (
                      <img
                        src={toToken.icon}
                        alt={to}
                        className="size-4 rounded-full"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                    <span>
                      {formatNumber(Number(amountOut))} {to}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toast.dismiss(t);
                    window.open(`https://etherscan.io/tx/${txHash}`, "_blank");
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  <ExternalLink className="size-3" />
                  <span>View on Explorer</span>
                </button>
                <Button
                  variant="ghost"
                  onClick={() => toast.dismiss(t)}
                  className="absolute top-2 right-2 rounded-full"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ),
            {
              duration: 6000,
              className: "group",
            }
          );
        },
        onError: (error) => {
          toast.error("Swap Failed", {
            description:
              error instanceof Error
                ? error.message
                : "An error occurred during the swap",
            duration: 5000,
          });
        },
      }
    );
  };

  const exceedsBalance =
    !!fromBalance && Number(amountIn || 0) > fromBalance.amount;

  return (
    <div className="mx-auto w-full max-w-[480px] p-4">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="rounded-xl bg-accent/50 px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors">
              Swap
            </button>
            <button className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Limit
            </button>
          </div>

          <div className="flex items-center gap-2">
            <SwapSettings settings={settings} onSettingsChange={setSettings} />
          </div>
        </div>

        {/* From Token */}
        <div className="mb-1 rounded-2xl border border-border bg-accent/30 p-4 flex flex-col items-start">
          <div className="mb-2 flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">You pay</span>
            {fromBalance && fromBalance.amount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {[25, 50, 75].map((percent) => (
                  <button
                    key={percent}
                    onClick={() =>
                      handleChangeFromAmount(
                        formatNumber((fromBalance.amount * percent) / 100)
                      )
                    }
                    className="rounded-lg bg-accent/50 px-2 py-1 text-xs font-medium hover:bg-accent transition-colors"
                  >
                    {percent}%
                  </button>
                ))}
                <button
                  onClick={() =>
                    handleChangeFromAmount(fromBalance.amount.toString())
                  }
                  className="rounded-lg bg-accent/50 px-2 py-1 text-xs font-medium hover:bg-accent transition-colors"
                >
                  Max
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 w-full">
            <Input
              type="text"
              inputMode="decimal"
              value={amountIn}
              onChange={(e) => handleChangeFromAmount(e.target.value)}
              placeholder="0.0"
              className="border-0 bg-transparent p-0 md:text-3xl font-semibold outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <TokenSelector
              tokens={tokens}
              isLoading={isLoading}
              selectedToken={from}
              onSelectToken={handleFromTokenSelect}
            />
          </div>

          <div className="mt-1 text-sm text-muted-foreground w-full flex justify-between">
            <span>~${formatCurrency(Number(amountIn) * fromPrice || 0)}</span>
            <span>
              {formatCurrency(fromBalance?.amount || 0)} {from}
            </span>
          </div>
        </div>

        {/* Swap Direction Button */}
        <div className="relative flex justify-center -my-5 z-10">
          <button
            onClick={handleSwapDirection}
            className="rounded-xl border-4 border-card bg-accent p-2 hover:bg-accent/80 transition-colors"
          >
            <ArrowDown className="size-5" />
          </button>
        </div>

        {/* To Token */}
        <div className="mb-4 rounded-2xl border border-border bg-accent/30 p-4 flex flex-col items-start">
          <div className="mb-2 flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">You receive</span>
          </div>
          <div className="flex items-center gap-3 w-full">
            <Input
              type="text"
              inputMode="decimal"
              value={amountOut}
              onChange={(e) => handleChangeToAmount(e.target.value)}
              placeholder="0.0"
              className="border-0 bg-transparent p-0 md:text-3xl font-semibold outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <TokenSelector
              tokens={tokens}
              isLoading={isLoading}
              selectedToken={to}
              onSelectToken={handleToTokenSelect}
            />
          </div>

          <div className="mt-1 text-sm text-muted-foreground w-full flex justify-between">
            <span>~${formatCurrency(Number(amountOut) * toPrice)}</span>
            <span>
              {formatCurrency(toBalance?.amount || 0)} {to}
            </span>
          </div>
        </div>

        {/* Quote Details */}
        {quote && (
          <div className="mb-4 space-y-2 rounded-xl bg-accent/30 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium">
                1 {from} = {quote.rate.toFixed(6)} {to}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price Impact</span>
              <Badge
                variant={quote.priceImpactPct > 5 ? "destructive" : "secondary"}
                className={cn(
                  quote.priceImpactPct > 1 &&
                    quote.priceImpactPct <= 5 &&
                    "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                )}
              >
                {quote.priceImpactPct < 0.01
                  ? "< 0.01%"
                  : `${quote.priceImpactPct.toFixed(2)}%`}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Minimum received (after slippage)
              </span>
              <span className="font-medium">
                {quote.minOut.toFixed(6)} {to}
              </span>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          disabled={!quote || quote.exceedsImpact || exceedsBalance}
          onClick={() => setIsPreviewOpen(true)}
        >
          {!amountIn
            ? "Enter an amount"
            : exceedsBalance
            ? "Insufficient balance"
            : quote?.exceedsImpact
            ? "Price impact too high"
            : "Swap"}
        </Button>

        <SwapPreviewDialog
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          from={from}
          to={to}
          amountIn={amountIn}
          amountOut={amountOut}
          quote={quote}
          isLoading={isUpdating}
          onConfirm={handleConfirmSwap}
        />
      </div>
    </div>
  );
}

export default Swap;
