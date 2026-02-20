import { ExternalLink } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 text-sm font-medium tracking-widest text-slate-500 uppercase">
          Interactive Demo
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Unverbalized Biases in LLMs
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
          Language models make biased decisions — but never mention the biasing
          factor in their reasoning. Explore this phenomenon across hiring, loan
          approval, and admissions tasks.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="https://arxiv.org/abs/2602.10117"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Read the Paper
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href="https://github.com/FlyingPumba/biases-in-the-blind-spot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            GitHub Repository
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Based on &ldquo;Biases in the Blind Spot&rdquo; by Arcuschin, Chanin,
          Garriga-Alonso &amp; Camburu (2025)
        </p>
      </div>
    </section>
  );
}
