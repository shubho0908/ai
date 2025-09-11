import dotenv from "dotenv";
import { createInterface } from "readline";
import { processQuery } from "./agent.ts";

dotenv.config();

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

async function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    const userQuery = await askQuestion("> ");
    
    if (!process.env.OPENAI_SECRET_KEY) {
        console.error("OPENAI_SECRET_KEY environment variable is required");
        rl.close();
        return;
    }
    
    await processQuery(userQuery, process.env.OPENAI_SECRET_KEY);
    rl.close();
}

main().catch(console.error);