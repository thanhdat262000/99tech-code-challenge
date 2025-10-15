// Define blockchain types for better type safety
type Blockchain = "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // added blockchain field
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: Blockchain): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  const sortedAndFormattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances
      .filter((balance) => {
        const balancePriority = getPriority(balance.blockchain);
        // Only show balances with positive amounts and valid priority
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs, rhs) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);

        return leftPriority - rightPriority; // sort by priority
      })
      .map(
        (balance): FormattedWalletBalance => ({
          ...balance,
          formatted: balance.amount.toFixed(2), // Add precision to toFixed
        })
      );
  }, [balances]); // Remove prices dependency since it's not used in the computation

  const rows = useMemo(() => {
    return sortedAndFormattedBalances.map((balance) => {
      const price = prices[balance.currency];
      const usdValue = price ? price * balance.amount : 0; // Add guard for missing price

      return (
        <WalletRow
          key={`${balance.currency}-${balance.blockchain}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [sortedAndFormattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};
