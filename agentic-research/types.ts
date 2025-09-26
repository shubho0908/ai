import { z } from "zod";
import { Annotation } from "@langchain/langgraph";

export const ResearchState = Annotation.Root({
  query: Annotation<string>(),
  shouldResearch: Annotation<boolean>(),
  gateReason: Annotation<string>(),
  researchOutput: Annotation<any>(),
  evalOutput: Annotation<any>(),
  finalResponse: Annotation<string>(),
  messages: Annotation<any[]>(),
  attempts: Annotation<number>(),
  strictnessLevel: Annotation<number>(),
});

export const ResearchTaskSchema = z.object({
  step: z.number(),
  action: z.string(),
  rationale: z.string(),
});

export const ResearchOutputSchema = z.object({
  reasoning: z.string(),
  tasks: z.array(ResearchTaskSchema),
  citations: z.array(z.string()).optional(),
  response: z.string(),
});

export const EvalOutputSchema = z.object({
  isRelevant: z.boolean(),
  feedback: z.string(),
  rewrittenPrompt: z.string().optional(),
});

export const LLMOutputSchema = z.object({
  answer: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
});

export const ResearchGateSchema = z.object({
  shouldResearch: z.boolean(),
  reason: z.string(),
});