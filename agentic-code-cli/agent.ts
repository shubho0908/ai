import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z } from "zod";
import { AgentResponseSchema } from "./types.ts";
import { executeTool } from "./tools.ts";
import { SYSTEM_PROMPT } from "./prompts.ts";

export async function processQuery(userQuery: string, apiKey: string): Promise<void> {
    const client = new OpenAI({ apiKey });
    
    let messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        {
            role: "user",
            content: userQuery
        }
    ];

    let isCompleted = false;
    let allToolResults: string[] = [];

    while (!isCompleted) {
        try {
            const response = await client.chat.completions.create({
                model: "gpt-5-nano-2025-08-07",
                messages: messages,
            });

            const assistantMessage = response.choices[0]?.message?.content || "";
            if (!assistantMessage) {
                console.log("No response received");
                break;
            }

            let parsedResponse: any;
            try {
                parsedResponse = JSON.parse(assistantMessage);
            } catch (jsonError) {
                console.error("JSON Parse Error:", jsonError);
                console.error("Raw response:", assistantMessage);
                break;
            }
            
            console.log("Parsed response steps:", JSON.stringify(parsedResponse.steps, null, 2));
            const validatedResponse = AgentResponseSchema.parse(parsedResponse);
            
            if (allToolResults.length === 0) {
                console.log("\n🤖 Agent Processing:\n");
            }
            
            let toolResults: string[] = [];
            
            for (const step of validatedResponse.steps) {
                switch (step.step) {
                    case "START":
                    case "THINK": 
                    case "PLAN":
                        console.log(`${step.step}: ${step.content}`);
                        break;
                    case "TOOL":
                        console.log(`${step.step}: Using ${step.tool} with input:`, step.input);
                        try {
                            const toolResult = await executeTool(step.tool!, step.input!);
                            toolResults.push(toolResult);
                            allToolResults.push(toolResult);
                        } catch (error) {
                            const errorMsg = `Tool Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
                            toolResults.push(errorMsg);
                            allToolResults.push(errorMsg);
                            console.error(errorMsg);
                        }
                        break;
                    case "OUTPUT":
                        if (toolResults.length > 0) {
                            console.log(`${step.step}: ${toolResults.join('\n\n')}`);
                        } else {
                            console.log(`${step.step}: ${step.content}`);
                        }
                        break;
                }
                console.log("--------------------------");
            }

            isCompleted = validatedResponse.isCompleted;

            if (!isCompleted && allToolResults.length > 0) {
                messages.push({
                    role: "assistant",
                    content: assistantMessage
                });
                messages.push({
                    role: "user", 
                    content: `Tool results: ${allToolResults.join('\n\n')}\n\nContinue with the next steps to complete the task.`
                });
            }
            
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Validation error:", error.issues);
            } else {
                console.error("Error:", error);
            }
            break;
        }
    }

    console.log("\n✅ All steps completed!");
}