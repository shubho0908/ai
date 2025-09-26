import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { Memory } from 'mem0ai/oss';
import dotenv from "dotenv";
import { createInterface } from "readline";

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY
});

const config = {
    vectorStore: {
        provider: 'qdrant',
        config: {
            collectionName: 'my-memories',
            embeddingModelDims: 1536,
            host: 'localhost',
            port: 6333,
        },
    },
    embedder: {
        provider: 'openai',
        config: {
            model: 'text-embedding-3-small',
            apiKey: process.env.OPENAI_SECRET_KEY
        }
    },
    enableGraph: true,
    graphStore: {
        provider: "neo4j",
        config: {
            url: process.env.NEO4J_URI as string,
            username: process.env.NEO4J_USERNAME as string,
            password: process.env.NEO4J_PASSWORD as string,
        }
    },
    llm: {
        provider: 'openai',
        config: {
            model: process.env.OPENAI_MODEL,
            apiKey: process.env.OPENAI_SECRET_KEY
        }
    }
};

const memory = new Memory(config);

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const SYSTEM_PROMPT = `
- You are a very powerful AI Assistant with memory capabilities.
- You can remember past conversations and user preferences.
- Always respond helpfully and remember context from previous interactions.
- If relevant memories exist, incorporate the needed or related memory to the query (not every) naturally into your responses.
`;

interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: Date;
}

let conversationHistory: ChatMessage[] = [];

function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function retrieveMemories(query: string, userId: string): Promise<string[]> {
    try {
        const memories = await memory.search(query, { userId });
        if (Array.isArray(memories.results)) {
            return memories.results.map((m) => m.memory || '');
        }
        return [];
    } catch (error) {
        console.log("No memories found or error retrieving memories:", error);
        return [];
    }
}

async function storeMemory(content: string, userId: string, metadata: any = {}): Promise<void> {
    try {
        await memory.add(content, {
            userId,
            metadata: {
                timestamp: new Date().toISOString(),
                ...metadata
            }
        });
    } catch (error) {
        console.error("Error storing memory:", error);
    }
}

async function chat(userInput: string, userId: string): Promise<string> {
    const relevantMemories = await retrieveMemories(userInput, userId);
    let systemPrompt = SYSTEM_PROMPT;
    if (relevantMemories.length > 0) {
        systemPrompt += `\n\nRelevant memories from past conversations:\n${relevantMemories.join('\n')}`;
    }

    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: systemPrompt
        },
        ...conversationHistory.slice(-10).map(msg => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content
        })),
        {
            role: "user",
            content: userInput
        }
    ];

    try {
        const response = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: messages
        });

        const assistantMessage = response.choices[0]?.message?.content;
        if (!assistantMessage) {
            return "Sorry, I couldn't generate a response.";
        }

        conversationHistory.push(
            { role: "user", content: userInput, timestamp: new Date() },
            { role: "assistant", content: assistantMessage, timestamp: new Date() }
        );

        await storeMemory(`User: ${userInput}\nAssistant: ${assistantMessage}`, userId);

        return assistantMessage;

    } catch (error) {
        console.error("Error in chat:", error);
        return "Sorry, there was an error processing your request.";
    }
}

async function startChat(): Promise<void> {
    const userId = "shubho";

    console.log("🤖 Chat with Memory Assistant initialized!");
    console.log("Type 'exit' to quit\n");

    while (true) {
        const userInput = await askQuestion("You: ");

        if (userInput.toLowerCase() === 'exit') {
            console.log("👋 Goodbye!");
            break;
        }

        console.log("🤖 Thinking...");
        const response = await chat(userInput, userId);
        console.log(`Assistant: ${response}\n`);
    }

    rl.close();
}

startChat().catch(console.error);