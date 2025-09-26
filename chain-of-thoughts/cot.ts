import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import dotenv from "dotenv";
import { createInterface } from "readline";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY
});

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const SYSTEM_PROMPT = `
- You are a very powerful AI Assistant named as Jarvis. Your tasks is to help users with their queries.
- You have to follow a proper steps to work on any kinda query from user.
- STEPS:
1. START - Gets the query from the user, analyze and understand whats the user wanna ask you to do.
2. THINK - Think of the possible approaches to work on that query and fulfill it for the user.
3. PLAN - Execute what you've planned or thought as of now to help the user with their query.
4. OUTPUT - Provide the user with the response.

IMPORTANT: Always respond with a JSON object containing "step" and "content" fields.

EXAMPLE:
{ "step": "START", "content": "Hey! I can help you with your query." }
{ "step": "THINK", "content": "Okay, so the user wants my help to solve a mathematical question" }
{ "step": "PLAN", "content": "Let the unknown angle be (x), then according to the formula: 60 + x + 30 = 180" }
{ "step": "OUTPUT", "content": "The ∠B is 90 deg." }
`;

async function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    const userQuery = await askQuestion("Enter your query: ");
    
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        {
            role: "user",
            content: userQuery
        }
    ];

    try {
        const response = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: messages
        });

        const assistantMessage = response.choices[0]?.message?.content;
        if (!assistantMessage) {
            console.log("No response received");
            return;
        }

        const jsonMatches = assistantMessage.match(/\{[^}]*\}/g);
        
        if (jsonMatches) {
            for (const jsonString of jsonMatches) {
                try {
                    const parsed = JSON.parse(jsonString);
                    console.log(parsed.content, "\n\n ----END----");
                    
                } catch (e) {
                    continue;
                }
            }
        }
        
        console.log("\n✅ All steps completed!");

    } catch (error) {
        console.error("Error:", error);
    }

    rl.close();
}

main().catch(console.error);
