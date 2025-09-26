import { ChatOpenAI } from "@langchain/openai";
import { TavilySearch } from "@langchain/tavily";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";

dotenv.config();

export const researchTools = [
  new TavilySearch({ 
    maxResults: 5,
  })
];

export const baseModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

// Model with tools bound for research
export const modelWithTools = baseModel.bindTools(researchTools);
export const toolNode = new ToolNode(researchTools);