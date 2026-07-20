import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

// Anvil's default local chain. Not one of wagmi's built-in chains,
// so we define it explicitly to match what `anvil` actually runs.
export const anvilLocal = defineChain({
  id: 31337,
  name: "Anvil Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
});

export const wagmiConfig = createConfig({
  chains: [anvilLocal],
  connectors: [injected()],
  transports: {
    [anvilLocal.id]: http(),
  },
});
