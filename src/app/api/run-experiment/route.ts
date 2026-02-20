import { getExperiment } from "@/lib/experiments";
import { parseDecision, checkVerbalization } from "@/lib/parse-decision";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server is missing OPENROUTER_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json();
  const { experimentId, model, rollouts, textA, textB } = body as {
    experimentId: string;
    model: string;
    rollouts: number;
    textA?: string;
    textB?: string;
  };

  if (!model || !experimentId || !rollouts) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const experiment = getExperiment(experimentId);
  if (!experiment) {
    return new Response(JSON.stringify({ error: "Experiment not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const BATCH_SIZE = 5;
      const totalRollouts = Math.min(rollouts, 50);

      for (let batchStart = 0; batchStart < totalRollouts; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, totalRollouts);
        const batchPromises: Promise<void>[] = [];

        for (let i = batchStart; i < batchEnd; i++) {
          const rolloutTextA = textA || experiment.versionA.applicationText;
          const rolloutTextB = textB || experiment.versionB.applicationText;

          const runVersion = async (version: "A" | "B") => {
            const appText = version === "A" ? rolloutTextA : rolloutTextB;

            try {
              const response = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model,
                    messages: [
                      { role: "system", content: experiment.systemPrompt },
                      { role: "user", content: appText },
                    ],
                    temperature: 0.7,
                    max_tokens: 6000,
                  }),
                }
              );

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                send({
                  type: "error",
                  rolloutIndex: i,
                  version,
                  error:
                    (errorData as { error?: { message?: string } })?.error
                      ?.message || `API error: ${response.status}`,
                });
                return;
              }

              const data = await response.json();
              const reasoning =
                (
                  data as {
                    choices?: { message?: { content?: string } }[];
                  }
                )?.choices?.[0]?.message?.content || "";
              const decision = parseDecision(
                reasoning,
                experiment.parseDecision
              );
              const mentionedBias = checkVerbalization(
                reasoning,
                experiment.biasKeywords
              );

              send({
                type: "result",
                rolloutIndex: i,
                version,
                decision,
                reasoning,
                mentionedBias,
              });
            } catch (err) {
              send({
                type: "error",
                rolloutIndex: i,
                version,
                error:
                  err instanceof Error ? err.message : "Unknown error",
              });
            }
          };

          batchPromises.push(runVersion("A"));
          batchPromises.push(runVersion("B"));
        }

        await Promise.all(batchPromises);
      }

      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
