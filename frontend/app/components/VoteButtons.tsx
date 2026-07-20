"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { daoContract } from "@/lib/contract";

export function VoteButtons({
  proposalId,
  onVoted,
}: {
  proposalId: number;
  onVoted?: () => void;
}) {
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      onVoted?.();
      reset();
    }
  }, [isSuccess]);

  const vote = (support: boolean) => {
    writeContract({
      ...daoContract,
      functionName: "vote",
      args: [BigInt(proposalId), support],
    });
  };

  const busy = isPending || isConfirming;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => vote(true)}
        disabled={busy}
        className="text-xs tracking-widest uppercase border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-40"
      >
        Vote For
      </button>
      <button
        onClick={() => vote(false)}
        disabled={busy}
        className="text-xs tracking-widest uppercase border border-neutral-300 text-neutral-500 px-4 py-2 hover:border-neutral-900 hover:text-neutral-900 transition-colors disabled:opacity-40"
      >
        Vote Against
      </button>
      {error && (
        <span className="text-xs text-neutral-500">
          {error.message.slice(0, 60)}
        </span>
      )}
    </div>
  );
}
