"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Experiment } from "@/lib/experiments";
import type { RolloutResult } from "@/components/rollout-trace";
import type { Decision } from "@/lib/parse-decision";

type ResultsDashboardProps = {
  experiment: Experiment;
  results: RolloutResult[];
  totalRollouts: number;
  isRunning: boolean;
};

function DecisionIcon({ decision }: { decision: Decision }) {
  if (decision === "positive")
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  if (decision === "negative")
    return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  return <HelpCircle className="h-3.5 w-3.5 text-slate-400" />;
}

function DecisionLabel({ decision }: { decision: Decision }) {
  if (decision === "positive") return "Approved/Yes";
  if (decision === "negative") return "Rejected/No";
  return "Unclear";
}

export function ResultsDashboard({
  experiment,
  results,
  totalRollouts,
  isRunning,
}: ResultsDashboardProps) {
  const [expandedRollout, setExpandedRollout] = useState<number | null>(null);

  const versionAResults = results.filter((r) => r.version === "A");
  const versionBResults = results.filter((r) => r.version === "B");

  const aPositive = versionAResults.filter((r) => r.decision === "positive").length;
  const bPositive = versionBResults.filter((r) => r.decision === "positive").length;
  const aTotal = versionAResults.length;
  const bTotal = versionBResults.length;

  const aRate = aTotal > 0 ? aPositive / aTotal : 0;
  const bRate = bTotal > 0 ? bPositive / bTotal : 0;
  const diff = aRate - bRate;

  const completedRollouts = Math.min(aTotal, bTotal);
  const progressPercent = totalRollouts > 0 ? (completedRollouts / totalRollouts) * 100 : 0;

  const verbalizationCount = results.filter((r) => r.mentionedBias).length;
  const verbalizationRate =
    results.length > 0 ? (verbalizationCount / results.length) * 100 : 0;

  const positiveLabel =
    experiment.parseDecision === "yes_no" ? "Advanced" : "Approved";

  if (results.length === 0 && !isRunning) return null;

  // Rollout trace grouping
  const grouped = new Map<number, { A?: RolloutResult; B?: RolloutResult }>();
  for (const r of results) {
    const existing = grouped.get(r.rolloutIndex) || {};
    existing[r.version] = r;
    grouped.set(r.rolloutIndex, existing);
  }
  const sortedEntries = [...grouped.entries()].sort(([a], [b]) => a - b);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      {/* Progress strip */}
      <div className="flex items-center gap-4 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {isRunning ? (
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
          ) : (
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
          <span className="text-sm text-slate-600 tabular-nums">
            {completedRollouts}/{totalRollouts}
          </span>
        </div>

        {aTotal > 0 && bTotal > 0 && (
          <>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">
                A: <span className="font-medium text-blue-600">{(aRate * 100).toFixed(1)}%</span>
              </span>
              <span className="text-slate-500">
                B: <span className="font-medium text-slate-700">{(bRate * 100).toFixed(1)}%</span>
              </span>
              <span
                className={`font-semibold ${
                  Math.abs(diff) < 0.01
                    ? "text-slate-400"
                    : diff > 0
                      ? "text-emerald-600"
                      : "text-red-600"
                }`}
              >
                {diff > 0 ? "+" : ""}
                {(diff * 100).toFixed(1)}pp
              </span>
            </div>

            {results.length >= 4 && (
              <span className="text-xs text-amber-600 tabular-nums">
                Verb: {verbalizationRate.toFixed(0)}%
              </span>
            )}
          </>
        )}

        <div className="flex-1 max-w-32">
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      </div>

      {/* Details — always visible */}
      <div className="border-t border-slate-100 p-4 space-y-4">
        {/* Rate cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-0.5 truncate">
              A: {experiment.versionA.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-blue-600">
                {aTotal > 0 ? `${(aRate * 100).toFixed(1)}%` : "—"}
              </span>
              <span className="text-xs text-slate-400">
                {aPositive}/{aTotal} {positiveLabel.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-0.5 truncate">
              B: {experiment.versionB.label}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-slate-700">
                {bTotal > 0 ? `${(bRate * 100).toFixed(1)}%` : "—"}
              </span>
              <span className="text-xs text-slate-400">
                {bPositive}/{bTotal} {positiveLabel.toLowerCase()}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-500 mb-0.5">
              Difference (A − B)
            </p>
            <span
              className={`text-xl font-bold ${
                Math.abs(diff) < 0.01
                  ? "text-slate-400"
                  : diff > 0
                    ? "text-emerald-600"
                    : "text-red-600"
              }`}
            >
              {diff > 0 ? "+" : ""}
              {(diff * 100).toFixed(1)}pp
            </span>
            {completedRollouts >= 10 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {Math.abs(diff) >= 0.03
                  ? "Substantial difference"
                  : Math.abs(diff) >= 0.01
                    ? "Minor difference"
                    : "No meaningful difference"}
              </p>
            )}
          </div>
        </div>

        {/* Bar chart */}
        {aTotal > 0 && bTotal > 0 && (
          <div className="space-y-2">
            <BarRow
              label={`A: ${experiment.versionA.label}`}
              rate={aRate}
              color="bg-blue-500"
            />
            <BarRow
              label={`B: ${experiment.versionB.label}`}
              rate={bRate}
              color="bg-slate-500"
            />
          </div>
        )}

        {/* Verbalization */}
        {results.length > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-100 px-3 py-2">
            <span className="text-sm font-medium text-amber-800">
              Verbalization: {verbalizationRate.toFixed(1)}%
            </span>
            <span className="text-xs text-amber-600">
              ({verbalizationCount}/{results.length} mentioned bias factor)
              {verbalizationRate < 20 && results.length >= 10 && (
                <span className="font-medium"> — largely unverbalized</span>
              )}
            </span>
          </div>
        )}

        {/* Rollout traces — always visible */}
        {results.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">
              Rollout Traces
            </h4>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
              {sortedEntries.map(([idx, pair]) => {
                const isRolloutExpanded = expandedRollout === idx;
                return (
                  <div key={idx}>
                    <button
                      onClick={() =>
                        setExpandedRollout(isRolloutExpanded ? null : idx)
                      }
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400 w-8 shrink-0">
                          #{idx + 1}
                        </span>
                        {pair.A?.inputLabel && (
                          <span className="text-xs text-slate-500 truncate max-w-[140px]">
                            ({pair.A.inputLabel})
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">A:</span>
                          {pair.A ? (
                            <DecisionIcon decision={pair.A.decision} />
                          ) : (
                            <span className="text-xs text-slate-300">...</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
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
                            className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-700"
                          >
                            Verbalized
                          </Badge>
                        )}
                      </div>
                      {isRolloutExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                    {isRolloutExpanded && (
                      <div className="px-3 pb-3 space-y-2">
                        {/* Input texts (diverse mode) */}
                        {(pair.A?.inputText || pair.B?.inputText) && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            {(["A", "B"] as const).map((v) => {
                              const r = pair[v];
                              if (!r?.inputText) return null;
                              return (
                                <div
                                  key={v}
                                  className="rounded-md border border-slate-200 bg-slate-50 p-2"
                                >
                                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                    Input {v}
                                  </span>
                                  <pre className="mt-1 whitespace-pre-wrap text-xs text-slate-600 font-mono leading-relaxed max-h-48 overflow-y-auto">
                                    {r.inputText}
                                  </pre>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* Reasoning */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {(["A", "B"] as const).map((v) => {
                            const r = pair[v];
                            if (!r) return null;
                            return (
                              <div
                                key={v}
                                className="rounded-md border border-slate-100 p-2"
                              >
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span className="text-xs font-medium text-slate-600">
                                    Version {v}
                                  </span>
                                  <DecisionIcon decision={r.decision} />
                                  <span className="text-[10px] text-slate-400">
                                    <DecisionLabel decision={r.decision} />
                                  </span>
                                  {r.mentionedBias && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1 py-0 border-amber-300 text-amber-700"
                                    >
                                      Mentioned
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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BarRow({
  label,
  rate,
  color,
}: {
  label: string;
  rate: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-medium text-slate-700 tabular-nums">
          {(rate * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-4 w-full rounded-full bg-slate-100">
        <motion.div
          className={`h-4 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(rate * 100, 0.5)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
