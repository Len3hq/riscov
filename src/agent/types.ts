import type { ChatCompletionTool } from "openai/resources/chat/completions";

export interface ToolDefinition {
  spec: ChatCompletionTool;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export type Rating = "Green" | "Yellow" | "Red";

export interface ToolCallRecord {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
  tookMs: number;
}

export interface WatcherResult {
  asset: string;
  rating: Rating;
  reasoning: string;
  evidenceCited: string[];
  toolCalls: ToolCallRecord[];
  modelTurns: number;
  timestamp: string;
}
