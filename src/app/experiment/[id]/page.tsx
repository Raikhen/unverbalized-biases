"use client";

import { use, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, BookOpen, Play, Loader2 } from "lucide-react";
import { getExperiment, getDefaultValues, renderPromptText, domainColors, domainLabels } from "@/lib/experiments";
import { InteractivePrompt } from "@/components/interactive-prompt";
import { ConfigPanel } from "@/components/config-panel";
import type { RunConfig } from "@/components/config-panel";
import { ResultsDashboard } from "@/components/results-dashboard";
import type { RolloutResult } from "@/components/rollout-trace";

export default function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const experiment = getExperiment(id);
  const [results, setResults] = useState<RolloutResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalRollouts, setTotalRollouts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showFinding, setShowFinding] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const valuesRef = useRef<{ a: Record<string, string>; b: Record<string, string> }>({
    a: experiment ? getDefaultValues(experiment.fields, "A") : {},
    b: experiment ? getDefaultValues(experiment.fields, "B") : {},
  });
  const configRef = useRef<RunConfig>({
    model: experiment?.defaultModel ?? "gpt-4o",
    rollouts: 20,
  });

  const handleValuesChange = useCallback((valuesA: Record<string, string>, valuesB: Record<string, string>) => {
    valuesRef.current = { a: valuesA, b: valuesB };
  }, []);

  const handleRun = useCallback(
    async (config: RunConfig) => {
      if (!experiment) return;

      if (abortRef.current) abortRef.current.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      setResults([]);
      setIsRunning(true);
      setTotalRollouts(config.rollouts);
      setError(null);

      const requestBody = {
        experimentId: experiment.id,
        model: config.model,
        rollouts: config.rollouts,
        textA: renderPromptText(experiment.promptTemplate, experiment.fields, valuesRef.current.a),
        textB: renderPromptText(experiment.promptTemplate, experiment.fields, valuesRef.current.b),
      };

      try {
        const response = await fetch("/api/run-experiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: abort.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          setError(
            (errData as { error?: string })?.error ||
              `Request failed: ${response.status}`
          );
          setIsRunning(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setError("No response stream");
          setIsRunning(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "result") {
                setResults((prev) => [
                  ...prev,
                  {
                    rolloutIndex: event.rolloutIndex,
                    version: event.version,
                    decision: event.decision,
                    reasoning: event.reasoning,
                    mentionedBias: event.mentionedBias,
                  },
                ]);
              } else if (event.type === "error") {
                console.error("Rollout error:", event.error);
                setError((prev) => prev || event.error);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        setIsRunning(false);
      }
    },
    [experiment]
  );

  if (!experiment) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Experiment not found
        </h1>
        <Link
          href="/"
          className="mt-4 inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to experiments
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      {/* Compact header */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-400 hover:text-slate-600 mb-4"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="ghost" className={domainColors[experiment.domain]}>
            {domainLabels[experiment.domain]}
          </Badge>
          <Badge variant="ghost" className="bg-slate-200 text-slate-700">
            {experiment.biasCategory}
          </Badge>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
              {experiment.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-3xl">
              {experiment.description}
            </p>
          </div>
          <Dialog open={showFinding} onOpenChange={setShowFinding}>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-slate-300 bg-white px-4 py-2 text-slate-700 shadow-sm hover:bg-slate-50 hover:scale-[1.02] transition-all"
              onClick={() => setShowFinding(true)}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Paper finding
            </Button>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  Paper Finding
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500">
                  {experiment.paperReference}
                </DialogDescription>
              </DialogHeader>

              {/* Key stat callout */}
              {experiment.paperData.keyStat && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3.5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xl font-bold text-slate-900 font-mono">
                      {experiment.paperData.keyStat.value}
                    </span>
                    <span className="text-sm text-slate-500">
                      {experiment.paperData.keyStat.label.toLowerCase()}
                    </span>
                  </div>
                  {experiment.paperData.keyStat.detail && (
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      {experiment.paperData.keyStat.detail}
                    </p>
                  )}
                </div>
              )}

              {/* Finding text */}
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {experiment.finding}
              </p>

              {/* Data table from paper */}
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-slate-700">
                  {experiment.paperData.tableTitle}
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="text-left font-medium text-slate-500 px-3 py-2">
                          Concept
                        </th>
                        {experiment.paperData.models.map((m) => (
                          <th
                            key={m}
                            className="text-center font-medium text-slate-500 px-2 py-2 min-w-[60px]"
                          >
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {experiment.paperData.rows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b last:border-b-0 border-slate-100"
                        >
                          <td className="px-3 py-2 text-slate-700">
                            {row.label}
                          </td>
                          {row.values.map((v, j) => (
                            <td key={j} className="text-center px-2 py-2 font-mono">
                              {v === null ? (
                                <span className="text-slate-300">–</span>
                              ) : v.startsWith("+") ? (
                                <span className="text-emerald-700">{v}</span>
                              ) : v.startsWith("−") ? (
                                <span className="text-red-600">{v}</span>
                              ) : (
                                <span className="text-slate-700">{v}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {experiment.paperData.footnote && (
                  <p className="text-xs text-slate-400">
                    {experiment.paperData.footnote}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Config bar */}
      <div className="mb-4">
        <ConfigPanel
          onConfigChange={(config) => { configRef.current = config; }}
          defaultModel={experiment.defaultModel}
        />
      </div>

      {/* Interactive prompt */}
      <div className="mb-4">
        <InteractivePrompt experiment={experiment} onValuesChange={handleValuesChange} />
      </div>

      {/* Run button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => handleRun(configRef.current)}
          disabled={isRunning}
          size="sm"
          className="h-8"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Run
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Compact results strip */}
      <div className="mb-8">
        <ResultsDashboard
          experiment={experiment}
          results={results}
          totalRollouts={totalRollouts}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}
