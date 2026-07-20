"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="text-xs tracking-widest uppercase border border-neutral-900 px-4 py-2 opacity-40"
      >
        Connect Wallet
      </button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-xs tracking-widest uppercase text-neutral-500">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-xs tracking-widest uppercase border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="text-xs tracking-widest uppercase border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-40"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
