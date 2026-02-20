"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Decision } from "@/lib/parse-decision";

export type RolloutResult = {
  rolloutIndex: number;
  version: "A" | "B";
  decision: Decision;
  reasoning: string;
  mentionedBias: boolean;
  inputLabel?: string;
  inputText?: string;
};

function DecisionIcon({ decision }: { decision: Decision }) {
  if (decision === "positive")
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (decision === "negative")
    return <XCircle className="h-4 w-4 text-red-500" />;
  return <HelpCircle className="h-4 w-4 text-slate-400" />;
}

function DecisionLabel({ decision }: { decision: Decision }) {
  if (decision === "positive") return "Approved/Yes";
  if (decision === "negative") return "Rejected/No";
  return "Unclear";
}

export function RolloutTrace({ results }: { results: RolloutResult[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (results.length === 0) return null;

  // Group by rollout index
  const grouped = new Map<number, { A?: RolloutResult; B?: RolloutResult }>();
  for (const r of results) {
    const existing = grouped.get(r.rolloutIndex) || {};
    existing[r.version] = r;
    grouped.set(r.rolloutIndex, existing);
  }

  const sortedEntries = [...grouped.entries()].sort(([a], [b]) => a - b);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-medium text-slate-900">
          Individual Rollout Traces
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Click to expand and view the full reasoning for each rollout
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {sortedEntries.map(([idx, pair]) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx}>
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-500 w-16">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">A:</span>
                    {pair.A ? (
                      <DecisionIcon decision={pair.A.decision} />
                    ) : (
                      <span className="text-xs text-slate-300">...</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">B:</span>
                    {pair.B ? (
                      <DecisionIcon decision={pair.B.decision} />
                    ) : (
                      <span className="text-xs text-slate-300">...</span>
                    )}
                  </div>
                  {(pair.A?.mentionedBias || pair.B?.mentionedBias) && (
                    <Badge
                      variant="outline"
                      className="text-xs border-amber-300 text-amber-700"
                    >
                      Bias verbalized
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {isExpanded && (
                <div className="px-5 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {(["A", "B"] as const).map((v) => {
                    const r = pair[v];
                    if (!r) return null;
                    return (
                      <div
                        key={v}
                        className="rounded-lg border border-slate-100 p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            Version {v}
                          </span>
                          <DecisionIcon decision={r.decision} />
                          <span className="text-xs text-slate-500">
                            <DecisionLabel decision={r.decision} />
                          </span>
                          {r.mentionedBias && (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-300 text-amber-700"
                            >
                              Mentioned bias
                            </Badge>
                          )}
                        </div>
                        <pre className="whitespace-pre-wrap text-xs text-slate-600 font-mono leading-relaxed bg-slate-50 rounded p-2">
                          {r.reasoning}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
