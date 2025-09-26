import { TavilySearch } from "@langchain/tavily";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage, BaseMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
import { notionTools } from "./notion-tools.js";
import { createInterface } from 'readline';

dotenv.config()

function addThinkingStep(message: string) {
    console.log(`🤖 ${message}`);
}

const movieTool = tool(
    async (input) => {
        const { query } = input as { query: string };
        try {
            addThinkingStep("Searching for movies 🎬");

            const response = await fetch(
                `https://www.omdbapi.com/?apikey=trilogy&s=${encodeURIComponent(query)}&type=movie`
            );

            if (!response.ok) {
                return `Error fetching movie data: ${response.status} ${response.statusText}`;
            }

            const data = await response.json();
            addThinkingStep("Processing movie search results 🎥");

            if (data.Response === "False") {
                addThinkingStep("No movies found 😕");
                return `No movies found for query: "${query}". ${data.Error || ''}`;
            }

            if (!data.Search || data.Search.length === 0) {
                addThinkingStep("No movies found 😕");
                return `No movies found for query: "${query}"`;
            }

            addThinkingStep("Found matching movies 🎬");

            const movies = data.Search.slice(0, 5).map((movie: any) => ({
                title: movie.Title,
                year: movie.Year,
                imdbID: movie.imdbID,
                type: movie.Type,
                poster: movie.Poster !== 'N/A' ? movie.Poster : null
            }));

            return JSON.stringify({
                query,
                total_results: data.totalResults,
                movies
            }, null, 2);
        } catch (error) {
            return `Error searching for movies: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
    {
        name: "movieFinder",
        description: "ALWAYS use this tool for ANY movie-related query. Search for movies using OMDb API. Provides comprehensive movie data including title, year, IMDb ID, and poster. Use this for all movie searches, questions about films, actors, or any cinema-related queries.",
        schema: z.object({
            query: z.string().describe("The movie title or search query to find movies")
        })
    }
);

const tools = [new TavilySearch({ maxResults: 3 }), movieTool, ...notionTools];
const toolNode = new ToolNode(tools);

// Create models for different scenarios
const chatModel = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_SECRET_KEY
});

const toolModel = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_SECRET_KEY
}).bindTools(tools);

async function decideBehavior(state: typeof MessagesAnnotation.State): Promise<string> {
    try {
        const messages = state.messages;
        const currentQuery = messages[messages.length - 1].content;
        
        // Get recent conversation context (last 6 messages or all if fewer)
        const recentMessages = messages.slice(-6);
        const conversationContext = recentMessages
            .map(msg => `${msg._getType()}: ${msg.content}`)
            .join('\n');
        
        const routingPrompt = `Based on the conversation context and current query, does this need external tools (search, movies, notion)?

CONVERSATION CONTEXT:
${conversationContext}

CURRENT QUERY: ${currentQuery}

Consider:
- If discussing movies, actors, films → needs movie tool
- If asking about current events, news, research → needs search tool  
- If mentioning notion, databases, notes, tasks → needs notion tools
- If following up on previous tool usage → likely needs tools
- If general conversation, opinions, explanations → chat only

Answer only "tools" or "chat":`;

        const decision = await chatModel.invoke([new HumanMessage(routingPrompt)]);
        const route = decision.content.toString().toLowerCase().includes("tools") ? "tool_agent" : "chat_agent";
        addThinkingStep(`Route: ${route} (Context: ${recentMessages.length} messages)`);
        return route;
    } catch (error) {
        addThinkingStep("Routing error, defaulting to tool_agent");
        return "tool_agent";
    }
}

async function chatAgent(state: typeof MessagesAnnotation.State) {
    addThinkingStep("Processing with chat agent 💭");
    const response = await chatModel.invoke(state.messages);
    addThinkingStep("Chat response ready ✨");
    return { messages: [response] };
}

async function toolAgent(state: typeof MessagesAnnotation.State) {
    addThinkingStep("Processing with tool agent 🛠️");
    const response = await toolModel.invoke(state.messages);
    addThinkingStep("Tool agent response ready 🎯");
    return { messages: [response] };
}

// Build the workflow graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("chat_agent", chatAgent)
    .addNode("tool_agent", toolAgent)
    .addNode("tools", toolNode)
    .addConditionalEdges(START, decideBehavior, {
        "chat_agent": "chat_agent",
        "tool_agent": "tool_agent"
    })
    .addConditionalEdges("tool_agent", toolsCondition)
    .addEdge("tools", "tool_agent")
    .addEdge("chat_agent", END);

export const agenticChatApp = workflow.compile();

async function runChat(message: string, history: BaseMessage[] = []) {
    try {
        addThinkingStep("Starting new chat interaction 🆕");
        const messages = [...history, new HumanMessage(message)];
        const result = await agenticChatApp.invoke({ messages });
        addThinkingStep("Chat interaction complete ✅");
        return [...messages, ...result.messages];
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(`Chat error: ${error.message}`);
        } else {
            console.log('An unknown error occurred');
        }
        return [...history, new HumanMessage(message)]; 
    }
}

// Terminal interface
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

export async function startChat() {
    console.log("🤖 Chat started. Type 'exit' to quit.");
    let history: BaseMessage[] = [];

    const askQuestion = () => {
        rl.question('\nYou: ', async (input: string) => {
            if (input.toLowerCase().trim() === 'exit') {
                console.log("Goodbye!");
                rl.close();
                process.exit(0);
                return;
            }

            if (input.trim()) {
                try {
                    const newHistory = await runChat(input, history);
                    history = newHistory;
                    
                    const lastMessage = history[history.length - 1];
                    console.log(`\nAssistant: ${lastMessage.content}`);
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        console.log(`Error: ${error.message}`);
                    } else {
                        console.log('An unknown error occurred');
                    }
                }
            }

            askQuestion();
        });
    };

    askQuestion();
}

startChat().catch(console.error);