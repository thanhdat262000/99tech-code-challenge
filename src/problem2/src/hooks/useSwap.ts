import { useMemo, useState } from "react";
import type { TokenPrice } from "@/hooks/useTokens";

export type SwapSettings = {
  slippageBps: number; // basis points
  priceImpactLimitPct: number; // percent
};

export function useSwap(prices: TokenPrice[] | undefined) {
  const [from, setFrom] = useState<string>("ETH");
  const [to, setTo] = useState<string>("USDC");
  const [amountIn, setAmountIn] = useState<string>("");
  const [settings, setSettings] = useState<SwapSettings>({
    slippageBps: 50,
    priceImpactLimitPct: 5,
  });

  const quote = useMemo(() => {
    if (!prices || !amountIn) return undefined;
    const map = new Map(prices.map((p) => [p.currency.toUpperCase(), p.price]));
    const fromPrice = map.get(from.toUpperCase());
    const toPrice = map.get(to.toUpperCase());
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
      out: impactAdjustedOut,
      minOut,
      usdValue,
      priceImpactPct,
      exceedsImpact,
      rate,
    };
  }, [prices, from, to, amountIn, settings]);

  return {
    from,
    to,
    amountIn,
    settings,
    setFrom,
    setTo,
    setAmountIn,
    setSettings,
    quote,
  };
}
