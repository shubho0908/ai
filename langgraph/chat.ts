import { TavilySearch } from "@langchain/tavily";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
import { notionTools } from "./notion-tools.js";

dotenv.config()

const movieTool = tool(
    async (input) => {
        const { query } = input as { query: string };
        try {
            console.log("Movie tool called 🚀");

            const response = await fetch(
                `https://www.omdbapi.com/?apikey=trilogy&s=${encodeURIComponent(query)}&type=movie`
            );

            if (!response.ok) {
                return `Error fetching movie data: ${response.status} ${response.statusText}`;
            }

            const data = await response.json();

            if (data.Response === "False") {
                return `No movies found for query: "${query}". ${data.Error || ''}`;
            }

            if (!data.Search || data.Search.length === 0) {
                return `No movies found for query: "${query}"`;
            }

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

// Function to determine if query needs tools
function needsTools(messages: any[]): boolean {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();

    const toolIndicators = [
        'search', 'find', 'look up', 'what is', 'who is', 'when did', 'where is',
        'current', 'latest', 'recent', 'news', 'weather', 'today', 'price',
        'information about', 'tell me about', 'research', 'facts about',
        'movie', 'movies', 'film', 'films', 'cinema', 'actor', 'actress',
        'director', 'bollywood', 'hollywood', 'series', 'show', 'tv show',
        'notion', 'create page', 'create database', 'add block', 'update page',
        'delete page', 'query database', 'search notion', 'read page',
        'database', 'table', 'workspace', 'organize', 'notes', 'todo',
        'project', 'task', 'wiki', 'knowledge base'
    ];

    return toolIndicators.some(indicator => content.includes(indicator));
}

// Router function
function decideBehavior(state: typeof MessagesAnnotation.State): string {
    return needsTools(state.messages) ? "tool_agent" : "chat_agent";
}

// Chat agent for normal conversations
async function chatAgent(state: typeof MessagesAnnotation.State) {
    const response = await chatModel.invoke(state.messages);
    return { messages: [response] };
}

// Tool agent with all tool capabilities
async function toolAgent(state: typeof MessagesAnnotation.State) {
    const response = await toolModel.invoke(state.messages);
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

/*
Workflow Structure:
==================

START
  |
  v
decideBehavior (conditional)
  |                    |
  v                    v
chat_agent          tool_agent
  |                    |
  v                    v (toolsCondition)
 END              tools OR END
                    |
                    v
                tool_agent (loop back)

Flow Description:
- START: Entry point with user message
- decideBehavior: Routes to chat_agent (normal conversation) or tool_agent (queries needing tools)
- chat_agent: Handles regular conversations, goes directly to END
- tool_agent: Handles queries requiring external data with access to TavilySearch, movieTool, and comprehensive Notion tools
- toolsCondition: Checks if tool_agent wants to use tools
- tools: Executes appropriate tool, then loops back to tool_agent
- END: Final response returned to user

Tool Selection:
- AI automatically chooses the right tool based on query context and tool descriptions
- TavilySearch: Used for general web search, news, current events, research
- movieTool: Triggered for ANY movie, film, cinema, actor-related queries
- Notion Tools (13 comprehensive tools):
  * Pages: createNotionPage, readNotionPage, updateNotionPage, deleteNotionPage
  * Databases: createNotionDatabase, readNotionDatabase, queryNotionDatabase, updateNotionDatabase
  * Blocks: addNotionBlocks, readNotionBlocks, updateNotionBlock, deleteNotionBlock
  * Search: searchNotion (across entire workspace)
  * Triggered by: notion, create, add, find, search, database, table, notes, tasks, todo, organize, workspace queries
*/

// Utility function to run the chat
export async function runChat(message: string) {
    const initialState = {
        messages: [new HumanMessage(message)]
    };

    const result = await agenticChatApp.invoke(initialState);
    return result.messages[result.messages.length - 1].content;
}

async function main() {
    console.log("=== Agentic Chat Demo ===");

    // Normal chat
    console.log("\n1. Normal Chat:");
    const chatResponse = await runChat("Hello! How are you today?");
    console.log("Response:", chatResponse);

    // Search query
    console.log("\n2. Search Query:");
    const searchResponse = await runChat("create a page in anywhere u want in my notion Notes page/db (url = https://www.notion.so/Notes-1555484ebb068099bd52f960a6df4d71), should have 5 theories by Einstein with proper headings and quotes blocks.");
    console.log("Response:", searchResponse);
}

main().catch(console.error);