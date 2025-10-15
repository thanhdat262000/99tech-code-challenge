import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { BalancesDrawer } from "@/components/BalancesDrawer";
import { formatAddress } from "@/lib/utils";

export function Header() {
  const { address, isConnected } = useAccount();
  const [balancesOpen, setBalancesOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              SwapDEX
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && address ? (
              <button
                onClick={() => setBalancesOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-accent/50 px-4 py-2 hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="size-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                <span className="font-medium">{formatAddress(address)}</span>
              </button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </header>

      <BalancesDrawer open={balancesOpen} onOpenChange={setBalancesOpen} />
    </>
  );
}
