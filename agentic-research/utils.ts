import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

export async function callAndValidate<T extends z.ZodTypeAny>(
  model: ChatOpenAI,
  systemPrompt: string,
  schema: T,
  userContent: string
): Promise<z.infer<T>> {
  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userContent),
  ];

  const response = await model.invoke(messages);
  
  try {
    const parsed = JSON.parse(response.content as string);
    return schema.parse(parsed);
  } catch (err) {
    console.error("❌ Parsing/Validation error:", err);
    console.log("Raw output:", response.content);
    throw err;
  }
}

export function addThinkingStep(state: any, nodeId: string, step: string, content: string) {
  const thinking = state.thinking || {};
  if (!thinking[nodeId]) {
    thinking[nodeId] = { steps: [], timestamp: new Date().toISOString() };
  }
  thinking[nodeId].steps.push({
    step,
    content,
    timestamp: new Date().toISOString()
  });
  return thinking;
}