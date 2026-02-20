"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import type { Experiment } from "@/lib/experiments";
import { getDefaultValues } from "@/lib/experiments";

type InteractivePromptProps = {
  experiment: Experiment;
  onValuesChange?: (valuesA: Record<string, string>, valuesB: Record<string, string>) => void;
};

// ── Inline input components ──

function InlineText({
  value,
  onChange,
  isBias,
  highlightColor,
}: {
  value: string;
  onChange: (v: string) => void;
  isBias?: boolean;
  highlightColor: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  // Sync React state → DOM only when they diverge (e.g. reset button)
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const bgClass = isBias ? highlightColor : "bg-slate-50";

  return (
    <span
      ref={(el) => {
        ref.current = el;
        if (el && el.textContent !== value) el.textContent = value;
      }}
      contentEditable
      suppressContentEditableWarning
      onInput={() => {
        if (ref.current) onChange(ref.current.textContent || "");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/\n/g, " ");
        document.execCommand("insertText", false, text);
      }}
      className={`text-sm font-mono ${bgClass} rounded px-0.5 py-0 border-b border-dotted border-slate-300 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-solid focus:border-slate-400 focus:ring-1 focus:ring-slate-300 ${isBias ? "border-current" : ""}`}
    />
  );
}

function InlineNumber({
  value,
  onChange,
  isBias,
  highlightColor,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  isBias?: boolean;
  highlightColor: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const bgClass = isBias ? highlightColor : "bg-slate-50";

  return (
    <span
      ref={(el) => {
        ref.current = el;
        if (el && el.textContent !== value) el.textContent = value;
      }}
      contentEditable
      suppressContentEditableWarning
      onInput={() => {
        if (ref.current) onChange(ref.current.textContent || "");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/[\n\r]/g, "");
        document.execCommand("insertText", false, text);
      }}
      className={`text-sm font-mono ${bgClass} rounded px-0.5 py-0 border-b border-dotted border-slate-300 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-solid focus:border-slate-400 focus:ring-1 focus:ring-slate-300 ${isBias ? "border-current" : ""}`}
    />
  );
}

function InlineCurrency({
  value,
  onChange,
  isBias,
  highlightColor,
}: {
  value: string;
  onChange: (v: string) => void;
  isBias?: boolean;
  highlightColor: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const bgClass = isBias ? highlightColor : "bg-slate-50";

  return (
    <span>
      <span className="text-sm font-mono text-slate-500">$</span>
      <span
        ref={(el) => {
          ref.current = el;
          if (el && el.textContent !== value) el.textContent = value;
        }}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (ref.current) onChange(ref.current.textContent || "");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain").replace(/\n/g, " ");
          document.execCommand("insertText", false, text);
        }}
        className={`text-sm font-mono ${bgClass} rounded px-0.5 py-0 border-b border-dotted border-slate-300 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-solid focus:border-slate-400 focus:ring-1 focus:ring-slate-300 ${isBias ? "border-current" : ""}`}
      />
    </span>
  );
}

function InlineSelect({
  value,
  onChange,
  options,
  isBias,
  highlightColor,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  isBias?: boolean;
  highlightColor: string;
}) {
  const bgClass = isBias ? highlightColor : "bg-slate-50";

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`text-sm font-mono ${bgClass} rounded px-0.5 py-0 border-b border-dotted border-slate-300 outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-solid focus:border-slate-400 focus:ring-1 focus:ring-slate-300 cursor-pointer ${isBias ? "border-current" : ""}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function InlineTextarea({
  value,
  onChange,
  isBias,
  highlightColor,
}: {
  value: string;
  onChange: (v: string) => void;
  isBias?: boolean;
  highlightColor: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  const bgClass = isBias
    ? `${highlightColor} border-current`
    : "bg-slate-50 border-slate-200";

  return (
    <span className="block">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full text-sm font-mono ${bgClass} rounded-md px-3 py-2 my-1 border outline-none transition-all hover:bg-slate-100 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 resize-none overflow-hidden leading-relaxed`}
        rows={3}
      />
    </span>
  );
}

// ── Helpers ──

function isHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, "");
  if (alphaChars.length < 2) return false;
  if (alphaChars === alphaChars.toUpperCase()) return true;
  return /^[A-Z]{2,}(\s+[&]?\s*[A-Z]{2,})+/.test(trimmed);
}

function StyledText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const isBullet = /^\s*[•\-\*]\s/.test(line);
        return (
          <span key={i}>
            {i > 0 && "\n"}
            {isHeaderLine(line) ? (
              <span className="font-semibold text-slate-900 tracking-wide">
                {line}
              </span>
            ) : isBullet ? (
              <span className="inline-block pl-5" style={{ textIndent: "-1.25rem" }}>
                {line}
              </span>
            ) : (
              line
            )}
          </span>
        );
      })}
    </>
  );
}

// ── RenderedTemplate ──

function RenderedTemplate({
  experiment,
  version,
  highlightColor,
  values,
  otherValues,
  onChange,
}: {
  experiment: Experiment;
  version: "A" | "B";
  highlightColor: string;
  values: Record<string, string>;
  otherValues: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}) {
  const fieldMap = new Map(experiment.fields.map((f) => [f.id, f]));
  const parts = experiment.promptTemplate.split(/(\{\{\w+\}\})/);

  return (
    <div className="whitespace-pre-wrap break-words text-sm text-slate-500 font-mono leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\{\{(\w+)\}\}$/);
        if (match) {
          const fieldId = match[1];
          const field = fieldMap.get(fieldId);
          if (!field) return <span key={i}>{part}</span>;

          const value = values[fieldId] ?? "";
          const otherValue = otherValues[fieldId] ?? "";
          const isDifferent = value !== otherValue;
          const isBias = isDifferent;

          if (field.inputType === "textarea") {
            return (
              <InlineTextarea
                key={i}
                value={value}
                onChange={(v) => onChange(fieldId, v)}
                isBias={isBias}
                highlightColor={highlightColor}
              />
            );
          }

          if (field.inputType === "select" && field.options) {
            return (
              <InlineSelect
                key={i}
                value={value}
                onChange={(v) => onChange(fieldId, v)}
                options={field.options}
                isBias={isBias}
                highlightColor={highlightColor}
              />
            );
          }

          if (field.inputType === "currency") {
            return (
              <InlineCurrency
                key={i}
                value={value}
                onChange={(v) => onChange(fieldId, v)}
                isBias={isBias}
                highlightColor={highlightColor}
              />
            );
          }

          if (field.inputType === "number") {
            return (
              <InlineNumber
                key={i}
                value={value}
                onChange={(v) => onChange(fieldId, v)}
                min={field.min}
                max={field.max}
                isBias={isBias}
                highlightColor={highlightColor}
              />
            );
          }

          // Default: text
          return (
            <InlineText
              key={i}
              value={value}
              onChange={(v) => onChange(fieldId, v)}
              isBias={isBias}
              highlightColor={highlightColor}
            />
          );
        }
        return <StyledText key={i} text={part} />;
      })}
    </div>
  );
}

// ── Main component ──

export function InteractivePrompt({ experiment, onValuesChange }: InteractivePromptProps) {
  const [valuesA, setValuesA] = useState<Record<string, string>>(() =>
    getDefaultValues(experiment.fields, "A")
  );
  const [valuesB, setValuesB] = useState<Record<string, string>>(() =>
    getDefaultValues(experiment.fields, "B")
  );

  // Notify parent of value changes
  const prevValuesRef = useRef({ a: valuesA, b: valuesB });
  useEffect(() => {
    if (prevValuesRef.current.a !== valuesA || prevValuesRef.current.b !== valuesB) {
      prevValuesRef.current = { a: valuesA, b: valuesB };
      onValuesChange?.(valuesA, valuesB);
    }
  }, [valuesA, valuesB, onValuesChange]);

  const handleChangeA = useCallback((fieldId: string, value: string) => {
    setValuesA((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleChangeB = useCallback((fieldId: string, value: string) => {
    setValuesB((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const resetA = useCallback(() => {
    setValuesA(getDefaultValues(experiment.fields, "A"));
  }, [experiment.fields]);

  const resetB = useCallback(() => {
    setValuesB(getDefaultValues(experiment.fields, "B"));
  }, [experiment.fields]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      {/* System prompt */}
      <div className="border-b border-slate-100">
        <pre className="whitespace-pre-wrap px-4 py-4 text-sm text-slate-600 font-mono leading-relaxed bg-slate-50/50">
          {experiment.systemPrompt}
        </pre>
      </div>

      {/* Side-by-side prompt versions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Version A */}
        <div>
          <div className="px-4 py-2 border-b border-slate-100 bg-violet-50/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-violet-700">
                Version A
              </span>
              <span className="text-xs text-violet-500 ml-1.5">
                {experiment.versionA.label}
              </span>
            </div>
            <button
              onClick={resetA}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
          <div className="px-4 py-4">
            <RenderedTemplate
              experiment={experiment}
              version="A"
              highlightColor="bg-violet-100 text-violet-900"
              values={valuesA}
              otherValues={valuesB}
              onChange={handleChangeA}
            />
          </div>
        </div>

        {/* Version B */}
        <div>
          <div className="px-4 py-2 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-700">
                Version B
              </span>
              <span className="text-xs text-amber-500 ml-1.5">
                {experiment.versionB.label}
              </span>
            </div>
            <button
              onClick={resetB}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
          <div className="px-4 py-4">
            <RenderedTemplate
              experiment={experiment}
              version="B"
              highlightColor="bg-amber-100 text-amber-900"
              values={valuesB}
              otherValues={valuesA}
              onChange={handleChangeB}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
