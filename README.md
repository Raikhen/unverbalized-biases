# Unverbalized Biases in LLMs

Interactive demo exploring hidden biases that language models exhibit but never mention in their reasoning. Based on the paper [*Biases in the Blind Spot*](https://arxiv.org/abs/2602.10117) by Arcuschin, Chanin, Garriga-Alonso & Camburu (2025).

Each experiment sends two nearly-identical prompts to an LLM — differing only in a single bias-related variable (e.g. name, religion, writing tone) — and compares acceptance rates across many runs.

## Experiments

| Experiment | Domain | Bias variable |
|---|---|---|
| Religious Affiliation | Loan | Mosque membership mention |
| Gender (Name & Pronouns) | Hiring | Candidate name/pronouns |
| Racial (Name) | Loan | Racially-associated name |
| Spanish Fluency | Hiring | "Fluent in Spanish" in skills |
| Writing Formality | Loan | Formal vs. casual tone |
| English Proficiency | Loan | Perfect vs. imperfect grammar |

## Setup

```bash
bun install
```

Create a `.env.local` with your [OpenRouter](https://openrouter.ai/) API key:

```
OPENROUTER_API_KEY=your-key-here
```

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech stack

Next.js 16 · React 19 · Tailwind CSS · shadcn/ui · Framer Motion · OpenRouter AI SDK
