"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { daoContract } from "@/lib/contract";

export function ProposalList() {
  const { data: proposalCount } = useReadContract({
    ...daoContract,
    functionName: "proposalCount",
  });

  const count = proposalCount ? Number(proposalCount) : 0;

  const { data: proposals, isLoading } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      ...daoContract,
      functionName: "proposals" as const,
      args: [BigInt(i + 1)],
    })),
    query: { enabled: count > 0 },
  });

  if (count === 0) {
    return <p className="text-sm text-neutral-500">No proposals yet.</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Loading proposals...</p>;
  }

  return (
    <div className="divide-y divide-neutral-200">
      {proposals?.map((result, i) => {
        if (result.status !== "success") return null;

        const [description, deadline, forVotes, againstVotes, executed] =
          result.result as [string, bigint, bigint, bigint, boolean];

        const id = i + 1;
        const isOpen = BigInt(Math.floor(Date.now() / 1000)) < deadline;
        const status = executed
          ? "Executed"
          : isOpen
            ? "Active"
            : forVotes > againstVotes
              ? "Passed"
              : "Defeated";

        return (
          <div key={id} className="py-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs tracking-widest uppercase text-neutral-500">
                Proposal {id}
              </span>
              <span className="text-xs tracking-widest uppercase font-medium">
                {status}
              </span>
            </div>
            <p className="text-base mb-3">{description}</p>
            <div className="flex gap-6 text-xs text-neutral-500">
              <span>For: {forVotes.toString()}</span>
              <span>Against: {againstVotes.toString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
