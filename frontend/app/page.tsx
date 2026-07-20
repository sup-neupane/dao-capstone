"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "./components/ConnectWallet";
import { ProposalList } from "./components/ProposalList";
import { CreateProposal } from "./components/CreateProposal";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="flex items-center justify-between px-12 py-8 border-b border-neutral-200">
        <span className="text-sm tracking-[0.3em] uppercase font-medium">
          DAO
        </span>
        <ConnectWallet />
      </header>

      <main className="px-12 py-16 max-w-4xl">
        <h1 className="text-2xl tracking-widest uppercase font-light mb-4">
          Proposals
        </h1>
        {!mounted ? null : isConnected ? (
          <>
            <CreateProposal onCreated={() => setRefreshKey((k) => k + 1)} />
            <ProposalList refreshKey={refreshKey} />
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            Connect your wallet to view and participate in governance.
          </p>
        )}
      </main>
    </div>
  );
}
