import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { config } from "../config.ts";
import { allTools } from "../tools/index.ts";
import type { Rating, ToolCallRecord, ToolDefinition, WatcherResult } from "./types.ts";

const SYSTEM_PROMPT = `You are Riscov's Watcher: an experienced on-chain risk analyst, not a rule engine.

Your job: figure out how risky the given asset is RIGHT NOW, and explain why in plain English.

Rules you must follow:
- Decide for yourself which tools to call and in what order. Nobody has told you a fixed checklist.
- Follow up on red flags the way a human analyst would. If one signal looks concerning (e.g. thin or dropping liquidity), call more tools — especially searchRecentActivity and getPastIncidentPatterns — before concluding, instead of stopping at the first number.
- The SAME raw signal can mean different things in different contexts. A 3-day-old token with thin liquidity is normal. An established token that suddenly loses 80% of its liquidity overnight is not the same situation, even though "liquidity is low/dropping" is true in both cases. Your job is to tell these apart, not to apply one cutoff to both.
- Use getPastIncidentPatterns to check whether current evidence matches a known bad pattern (e.g. coordinated liquidity withdrawal) rather than a benign explanation (e.g. early-stage volatility). Cite the specific pattern by name if it applies.
- Never produce a rating that could be reproduced by a simple if-statement on one number. Your reasoning must weigh multiple pieces of evidence together, in context.
- When you're done, call concludeRating exactly once with your rating (Green/Yellow/Red), your reasoning (referencing the SPECIFIC evidence you weighed and how it fits together — not a templated per-signal list), and the evidence you cited.
- Call at least one evidence tool before concluding. Don't guess.`;

function toOpenAiTools(tools: Record<string, ToolDefinition>) {
  return Object.values(tools).map((t) => t.spec);
}

export interface RunWatcherOptions {
  asset: string;
  tools?: Record<string, ToolDefinition>;
  maxTurns?: number;
  extraContext?: string;
}

export async function runWatcher(options: RunWatcherOptions): Promise<WatcherResult> {
  const { asset, tools = allTools, maxTurns = 8, extraContext } = options;

  if (!config.openai.apiKey) {
    throw new Error("Missing OPENAI_API_KEY — set it in .env before running the Watcher.");
  }

  const client = new OpenAI({ apiKey: config.openai.apiKey });

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Assess the current risk of asset "${asset}".${
        extraContext ? `\n\nAdditional context: ${extraContext}` : ""
      }`,
    },
  ];

  const toolCallLog: ToolCallRecord[] = [];
  let conclusion: { rating: Rating; reasoning: string; evidenceCited: string[] } | null = null;
  let turns = 0;

  while (turns < maxTurns && !conclusion) {
    turns++;
    const forceConclude = turns === maxTurns;

    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages,
      tools: toOpenAiTools(tools),
      tool_choice: forceConclude ? { type: "function", function: { name: "concludeRating" } } : "auto",
    });

    const choice = response.choices[0];
    if (!choice) throw new Error("OpenAI returned no choices");
    const message = choice.message;
    messages.push(message);

    if (!message.tool_calls || message.tool_calls.length === 0) {
      // Model spoke without calling a tool — nudge it back toward concluding via a tool call.
      messages.push({
        role: "user",
        content:
          "Please continue by calling a tool, or call concludeRating if you have enough evidence to conclude.",
      });
      continue;
    }

    for (const call of message.tool_calls) {
      if (call.type !== "function") continue;
      const name = call.function.name;
      const tool = tools[name];
      if (!tool) {
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify({ error: `Unknown tool "${name}"` }),
        });
        continue;
      }

      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        // leave args empty if the model produced malformed JSON
      }

      const started = Date.now();
      let result: unknown;
      try {
        result = await tool.handler(args);
      } catch (err) {
        result = { error: err instanceof Error ? err.message : String(err) };
      }
      const tookMs = Date.now() - started;

      if (name !== "concludeRating") {
        toolCallLog.push({ tool: name, args, result, tookMs });
      } else {
        const rating = args.rating as Rating;
        const reasoning = String(args.reasoning ?? "");
        const evidenceCited = Array.isArray(args.evidenceCited)
          ? args.evidenceCited.map(String)
          : [];
        conclusion = { rating, reasoning, evidenceCited };
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  if (!conclusion) {
    throw new Error(
      `Watcher failed to reach a conclusion for "${asset}" within ${maxTurns} turns.`
    );
  }

  return {
    asset,
    rating: conclusion.rating,
    reasoning: conclusion.reasoning,
    evidenceCited: conclusion.evidenceCited,
    toolCalls: toolCallLog,
    modelTurns: turns,
    timestamp: new Date().toISOString(),
  };
}
