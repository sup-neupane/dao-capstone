"use client";

import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { daoContract } from "@/lib/contract";

export function ExecuteButton({
  proposalId,
  onExecuted,
}: {
  proposalId: number;
  onExecuted?: () => void;
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
      onExecuted?.();
      reset();
    }
  }, [isSuccess]);

  const handleExecute = () => {
    writeContract({
      ...daoContract,
      functionName: "execute",
      args: [BigInt(proposalId)],
    });
  };

  const busy = isPending || isConfirming;

  return (
    <div className="mt-3">
      <button
        onClick={handleExecute}
        disabled={busy}
        className="text-xs tracking-widest uppercase border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-40"
      >
        {isPending
          ? "Confirm in wallet..."
          : isConfirming
            ? "Executing..."
            : "Execute"}
      </button>
      {error && (
        <p className="text-xs text-neutral-500 mt-2">
          {error.message.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
