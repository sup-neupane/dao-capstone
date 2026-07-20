"use client";

import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { daoContract } from "@/lib/contract";

export function CreateProposal({ onCreated }: { onCreated?: () => void }) {
  const [description, setDescription] = useState("");
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
      setDescription("");
      onCreated?.();
      reset();
    }
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    writeContract({
      ...daoContract,
      functionName: "propose",
      args: [description],
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-12 pb-12 border-b border-neutral-200"
    >
      <label className="block text-xs tracking-widest uppercase text-neutral-500 mb-3">
        New Proposal
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the proposal..."
        rows={3}
        className="w-full border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:border-neutral-900 resize-none"
      />
      <div className="flex items-center justify-between mt-3">
        <button
          type="submit"
          disabled={isPending || isConfirming || !description.trim()}
          className="text-xs tracking-widest uppercase border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-40"
        >
          {isPending
            ? "Confirm in wallet..."
            : isConfirming
              ? "Submitting..."
              : "Submit Proposal"}
        </button>
        {error && (
          <span className="text-xs text-neutral-500">
            {error.message.slice(0, 80)}
          </span>
        )}
      </div>
    </form>
  );
}
