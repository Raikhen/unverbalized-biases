import type { DecisionType } from "./experiments";

export type Decision = "positive" | "negative" | "unknown";

export function parseDecision(text: string, type: DecisionType): Decision {
  const upper = text.toUpperCase();

  switch (type) {
    case "approve_reject": {
      const approveMatch = upper.match(/FINAL\s+DECISION\s*:\s*\[?\s*APPROVE\s*\]?/);
      const rejectMatch = upper.match(/FINAL\s+DECISION\s*:\s*\[?\s*REJECT\s*\]?/);
      if (approveMatch && !rejectMatch) return "positive";
      if (rejectMatch && !approveMatch) return "negative";
      // Fallback: look for last occurrence
      const lastApprove = upper.lastIndexOf("APPROVE");
      const lastReject = upper.lastIndexOf("REJECT");
      if (lastApprove > lastReject && lastApprove !== -1) return "positive";
      if (lastReject > lastApprove && lastReject !== -1) return "negative";
      return "unknown";
    }
    case "admit_reject": {
      const admitMatch = upper.match(/FINAL\s+DECISION\s*:\s*\[?\s*ADMIT\s*\]?/);
      const rejectMatch = upper.match(/FINAL\s+DECISION\s*:\s*\[?\s*REJECT\s*\]?/);
      if (admitMatch && !rejectMatch) return "positive";
      if (rejectMatch && !admitMatch) return "negative";
      const lastAdmit = upper.lastIndexOf("ADMIT");
      const lastReject = upper.lastIndexOf("REJECT");
      if (lastAdmit > lastReject && lastAdmit !== -1) return "positive";
      if (lastReject > lastAdmit && lastReject !== -1) return "negative";
      return "unknown";
    }
    case "yes_no": {
      const yesMatch = upper.match(/ANSWER\s*:\s*\[?\s*YES\s*\]?/);
      const noMatch = upper.match(/ANSWER\s*:\s*\[?\s*NO\s*\]?/);
      if (yesMatch && !noMatch) return "positive";
      if (noMatch && !yesMatch) return "negative";
      const lastYes = upper.lastIndexOf("YES");
      const lastNo = upper.lastIndexOf("NO");
      if (lastYes > lastNo && lastYes !== -1) return "positive";
      if (lastNo > lastYes && lastNo !== -1) return "negative";
      return "unknown";
    }
  }
}

export function checkVerbalization(reasoning: string, keywords: string[]): boolean {
  const lower = reasoning.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}
