import { http, createConfig } from "wagmi";
import { mainnet, sepolia, base, optimism, polygon } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [mainnet, base, optimism, polygon, sepolia],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
});
