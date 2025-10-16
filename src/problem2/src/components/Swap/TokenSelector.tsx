import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type TokenPriceWithIcon } from "@/services/api/model";
import { Search, ChevronDown } from "lucide-react";
import { useBalances } from "@/hooks/useBalances";
import { formatCurrency } from "@/lib/utils";

type TokenSelectorProps = {
  tokens: TokenPriceWithIcon[] | undefined;
  isLoading: boolean;
  selectedToken: string;
  onSelectToken: (token: string) => void;
  label?: string;
};

export function TokenSelector({
  tokens,
  isLoading,
  selectedToken,
  onSelectToken,
  label = "Select token",
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: balances = [] } = useBalances();

  const selectedTokenData = tokens?.find(
    (t) => t.currency.toUpperCase() === selectedToken.toUpperCase()
  );

  const filteredTokens = tokens
    ?.filter((t) => t.currency.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      // Check if user has balance for each token
      const aBalance = balances.find(
        (bal) => bal.symbol.toUpperCase() === a.currency.toUpperCase()
      );
      const bBalance = balances.find(
        (bal) => bal.symbol.toUpperCase() === b.currency.toUpperCase()
      );

      const hasABalance = aBalance && aBalance.amount > 0;
      const hasBBalance = bBalance && bBalance.amount > 0;

      // Sort tokens with balance first
      if (hasABalance && !hasBBalance) return -1;
      if (!hasABalance && hasBBalance) return 1;

      // If both have balance or both don't, maintain alphabetical order
      return a.currency.localeCompare(b.currency);
    });

  const handleSelect = (token: string) => {
    onSelectToken(token);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl bg-accent/50 px-3 py-2 hover:bg-accent transition-colors"
      >
        {selectedTokenData ? (
          <>
            <img
              src={selectedTokenData.icon}
              alt={selectedTokenData.currency}
              className="size-6 rounded-full"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <span className="font-semibold">{selectedTokenData.currency}</span>
          </>
        ) : (
          <span className="text-muted-foreground">{label}</span>
        )}
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search name or paste address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading tokens...
              </div>
            )}

            {!isLoading && filteredTokens?.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No tokens found
              </div>
            )}

            {filteredTokens?.map((token) => {
              const userBalance = balances.find(
                (b) => b.symbol.toUpperCase() === token.currency.toUpperCase()
              );
              const hasBalance = userBalance && userBalance.amount > 0;
              const balanceUsdValue = hasBalance
                ? userBalance.amount * token.price
                : 0;

              return (
                <button
                  key={token.currency}
                  onClick={() => handleSelect(token.currency)}
                  className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={token.icon}
                      alt={token.currency}
                      className="size-8 rounded-full"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="text-left">
                      <div className="font-semibold">{token.currency}</div>
                      <div className="text-xs text-muted-foreground">
                        {token.currency}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {hasBalance ? (
                      <>
                        <div className="font-semibold">
                          ${formatCurrency(balanceUsdValue)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${formatCurrency(userBalance.amount)}
                        </div>
                      </>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
