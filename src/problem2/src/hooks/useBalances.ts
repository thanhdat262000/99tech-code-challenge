import { useMemo } from "react";

export type FixedBalance = {
  symbol: string;
  amount: number;
};

const SAMPLE: FixedBalance[] = [
  { symbol: "ETH", amount: 1.2345 },
  { symbol: "USDC", amount: 1234.56 },
  { symbol: "WBTC", amount: 0.0567 },
  { symbol: "BLUR", amount: 4200 },
  { symbol: "ATOM", amount: 150 },
  { symbol: "OKB", amount: 100 },
  { symbol: "GMX", amount: 100 },
  { symbol: "LUNA", amount: 10000 },
];

export function useBalances() {
  return useMemo(() => SAMPLE, []);
}
