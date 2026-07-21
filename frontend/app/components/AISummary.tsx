"use client";

import { useState } from "react";

type SummaryResult = {
  summary: string;
  risks: string[];
  category: string;
};

export function AISummary({ description }: { description: string }) {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate summary");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <span className="text-xs tracking-widest uppercase text-neutral-500 block mb-2">
          AI Summary — {result.category}
        </span>
        <p className="text-sm mb-3">{result.summary}</p>
        {result.risks.length > 0 && (
          <ul className="text-xs text-neutral-500 space-y-1">
            {result.risks.map((risk, i) => (
              <li key={i}>— {risk}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleSummarize}
        disabled={isLoading}
        className="text-xs tracking-widest uppercase text-neutral-500 hover:text-neutral-900 transition-colors disabled:opacity-40"
      >
        {isLoading ? "Analyzing..." : "Summarize with AI"}
      </button>
      {error && <p className="text-xs text-neutral-500 mt-2">{error}</p>}
    </div>
  );
}
