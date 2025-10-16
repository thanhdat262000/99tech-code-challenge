import { useMemo, useState } from "react";
import { useTokens } from "@/hooks/useTokens";
import { formatNumber } from "@/lib/utils";

export type SwapSettings = {
  slippageBps: number; // basis points
  priceImpactLimitPct: number; // percent
};

export function useSwap() {
  const { data: tokens } = useTokens();
  const [from, setFrom] = useState<string>("ETH");
  const [to, setTo] = useState<string>("USDC");
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [settings, setSettings] = useState<SwapSettings>({
    slippageBps: 50,
    priceImpactLimitPct: 5,
  });

  const fromPrice = useMemo(() => {
    return tokens?.find((t) => t.currency === from.toUpperCase())?.price || 0;
  }, [tokens, from]);
  const toPrice = useMemo(() => {
    return (
      tokens?.find((t) => t.currency.toUpperCase() === to.toUpperCase())
        ?.price || 0
    );
  }, [tokens, to]);

  const positiveNumberRegex = /^\d+(?:\.\d*)?$/;

  const handleChangeFromAmount = (amount: string) => {
    if (amount === "") {
      setAmountIn("");
      setAmountOut("");
      return;
    }
    if (!positiveNumberRegex.test(amount)) return;
    setAmountIn(amount);
    const calculatedAmountOut = (Number(amount) * fromPrice) / toPrice;
    setAmountOut(formatNumber(calculatedAmountOut));
  };

  const handleChangeToAmount = (amount: string) => {
    if (amount === "") {
      setAmountOut("");
      setAmountIn("");
      return;
    }
    if (!positiveNumberRegex.test(amount)) return;
    setAmountOut(amount);
    const calculatedAmountIn = (Number(amount) * toPrice) / fromPrice;
    setAmountIn(formatNumber(calculatedAmountIn));
  };

  const handleSwapDirection = () => {
    setFrom(to);
    setTo(from);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  // Handle token selection with auto-swap for duplicates
  const handleFromTokenSelect = (token: string) => {
    if (token.toUpperCase() === to.toUpperCase()) {
      // If selecting the same token that's in "to", swap them
      setTo(from);
    }
    setFrom(token);
  };

  const handleToTokenSelect = (token: string) => {
    if (token.toUpperCase() === from.toUpperCase()) {
      // If selecting the same token that's in "from", swap them
      setFrom(to);
    }
    setTo(token);
  };

  const quote = useMemo(() => {
    if (!tokens || !amountIn) return undefined;
    if (!fromPrice || !toPrice) return undefined;
    const amount = Number(amountIn);
    if (!Number.isFinite(amount) || amount <= 0) return undefined;

    const usdValue = amount * fromPrice;
    const out = usdValue / toPrice;

    // Calculate price impact based on swap size relative to typical liquidity
    // This simulates how larger swaps have bigger price impact
    const liquidityUSD = 500_000; // Simulated pool liquidity in USD
    const swapProportion = usdValue / liquidityUSD;
    // Price impact formula: impact increases non-linearly with swap size
    const priceImpactPct = Math.min(
      99,
      swapProportion * 100 * (1 + swapProportion)
    );
    const exceedsImpact = priceImpactPct > settings.priceImpactLimitPct;

    // Adjust output for price impact
    const impactAdjustedOut = out * (1 - priceImpactPct / 100);
    const minOut = impactAdjustedOut * (1 - settings.slippageBps / 10_000);
    const rate = toPrice / fromPrice;

    return {
      minOut,
      usdValue,
      priceImpactPct,
      exceedsImpact,
      rate,
    };
  }, [tokens, amountIn, settings, fromPrice, toPrice]);

  return {
    from,
    to,
    amountIn,
    amountOut,
    settings,
    setFrom,
    setTo,
    setSettings,
    quote,
    fromPrice,
    toPrice,
    handleChangeFromAmount,
    handleChangeToAmount,
    handleSwapDirection,
    handleFromTokenSelect,
    handleToTokenSelect,
  };
}
