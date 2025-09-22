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
You are a very powerful AI Assistant named as Jarvis. Your tasks is to help users with their queries.
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
            model: "gpt-5-nano-2025-08-07",
            messages: messages
        });

        const assistantMessage = response.choices[0]?.message?.content;
        if (!assistantMessage) {
            console.log("No response received");
            return;
        }

        console.log(assistantMessage)


    } catch (error) {
        console.error("Error:", error);
    }

    rl.close();
}

main().catch(console.error);
