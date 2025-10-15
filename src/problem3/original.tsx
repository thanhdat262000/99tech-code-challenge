interface WalletBalance {
  currency: string;
  amount: number;
  //lack blockchain field
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props; // children is unused
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    // blockchain is any
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

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain); // blockchain is not in type
        if (lhsPriority > -99) {
          // lhsPriority is undefined; likely meant balancePriority
          if (balance.amount <= 0) {
            // negative amounts should be filtered out
            return true;
          }
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
      });
  }, [balances, prices]); // price is not used inside

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(), // `toFixed()` with no precision may be misleading
    };
  }); // formattedBalances never used

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      // sortedBalances should be formattedBalances
      const usdValue = prices[balance.currency] * balance.amount; // no guard for missing price; can be NaN
      return (
        <WalletRow
          className={classes.row} // classes is not defined in scope
          key={index} // using index as key may be unstable for reorders
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    }
  );

  return <div {...rest}>{rows}</div>;
};
