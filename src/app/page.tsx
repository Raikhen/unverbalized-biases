import { Hero } from "@/components/hero";
import { ExperimentCard } from "@/components/experiment-card";
import { experiments } from "@/lib/experiments";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">
          Experiments
        </h2>
        <p className="text-slate-500 mb-8 max-w-2xl">
          Each experiment tests a specific bias by running two nearly-identical
          prompts against an LLM many times and comparing acceptance rates.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {experiments.map((exp) => (
            <ExperimentCard key={exp.id} experiment={exp} />
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-slate-500">
            Based on{" "}
            <a
              href="https://arxiv.org/abs/2602.10117"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-700"
            >
              &ldquo;Biases in the Blind Spot&rdquo;
            </a>{" "}
            by Arcuschin, Chanin, Garriga-Alonso &amp; Camburu (2025)
          </p>
          <p className="mt-2 text-xs text-slate-400">
            This is an educational and research tool. Results may vary across
            runs and models.
          </p>
        </div>
      </footer>
    </div>
  );
}
