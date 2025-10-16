import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";

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

const STORAGE_KEY = "balances";

function readBalances(): FixedBalance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FixedBalance[];
  } catch {
    // ignore and fall back to seed
  }
  // seed storage on first run
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE));
  return [...SAMPLE];
}

function writeBalances(balances: FixedBalance[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(balances));
}

export function useBalances() {
  const { isConnected } = useAccount();

  return useQuery<FixedBalance[]>({
    queryKey: ["balances"],
    queryFn: async () => {
      if (!isConnected) {
        return [];
      }
      return readBalances();
    },
    enabled: isConnected,
  });
}

type UpdateArgs = {
  fromSymbol: string;
  toSymbol: string;
  amountIn: string;
  amountOut: string;
};

export function useUpdateBalances() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fromSymbol,
      toSymbol,
      amountIn,
      amountOut,
    }: UpdateArgs) => {
      // simulate network delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const inAmount = Number(amountIn) || 0;
      const outAmount = Number(amountOut) || 0;
      const current = readBalances();

      const next: FixedBalance[] = [...current];

      const fromIndex = next.findIndex((b) => b.symbol === fromSymbol);
      if (fromIndex >= 0) {
        next[fromIndex] = {
          symbol: next[fromIndex].symbol,
          amount: Math.max(0, next[fromIndex].amount - inAmount),
        };
      } else {
        next.push({ symbol: fromSymbol, amount: Math.max(0, -inAmount) });
      }

      const toIndex = next.findIndex((b) => b.symbol === toSymbol);
      if (toIndex >= 0) {
        next[toIndex] = {
          symbol: next[toIndex].symbol,
          amount: next[toIndex].amount + outAmount,
        };
      } else {
        next.push({ symbol: toSymbol, amount: outAmount });
      }

      writeBalances(next);
      return next;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["balances"], data);
    },
  });
}
