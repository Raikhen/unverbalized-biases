"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODELS } from "@/lib/experiments";

export type RunConfig = {
  model: string;
  rollouts: number;
};

type ConfigPanelProps = {
  onConfigChange: (config: RunConfig) => void;
  defaultModel?: string;
};

export function ConfigPanel({ onConfigChange, defaultModel }: ConfigPanelProps) {
  const [model, setModel] = useState<string>(defaultModel ?? MODELS[0].id);
  const [rollouts, setRollouts] = useState(20);

  const handleModelChange = (m: string) => {
    setModel(m);
    onConfigChange({ model: m, rollouts });
  };

  const handleRolloutsChange = (v: number) => {
    setRollouts(v);
    onConfigChange({ model, rollouts: v });
  };

  return (
    <div className="flex items-stretch justify-between rounded-lg border border-slate-200 bg-white px-5 py-3">
      {/* Model */}
      <div className="flex flex-col justify-between">
        <label className="block text-xs font-medium text-slate-500 mb-1.5">Model</label>
        <Select value={model} onValueChange={handleModelChange}>
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rollouts */}
      <div className="flex flex-col justify-between">
        <label className="block text-xs font-medium text-slate-500 mb-1.5">Rollouts</label>
        <div className="flex items-center gap-2 w-48">
          <Slider
            value={[rollouts]}
            onValueChange={([v]) => handleRolloutsChange(v)}
            min={10}
            max={50}
            step={5}
            className="flex-1"
          />
          <span className="text-sm text-slate-500 w-6 text-right tabular-nums">
            {rollouts}
          </span>
        </div>
      </div>
    </div>
  );
}
