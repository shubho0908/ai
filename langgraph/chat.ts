import { TavilySearch } from "@langchain/tavily";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv"

dotenv.config()

// Define the tools for the agent to use
const tools = [new TavilySearch({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

// Create models for different scenarios
const chatModel = new ChatOpenAI({
    model: "gpt-5-nano-2025-08-07",
    apiKey: process.env.OPENAI_SECRET_KEY
});

const searchModel = new ChatOpenAI({
    model: "gpt-5-nano-2025-08-07",
    apiKey: process.env.OPENAI_SECRET_KEY
}).bindTools(tools);

// Function to determine if query needs search capabilities
function shouldUseSearch(messages: any[]): boolean {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();

    const searchIndicators = [
        'search', 'find', 'look up', 'what is', 'who is', 'when did', 'where is',
        'current', 'latest', 'recent', 'news', 'weather', 'today', 'price',
        'information about', 'tell me about', 'research', 'facts about'
    ];

    return searchIndicators.some(indicator => content.includes(indicator));
}

// Router function to decide between chat and search
function decideBehavior(state: typeof MessagesAnnotation.State): string {
    return shouldUseSearch(state.messages) ? "search_agent" : "chat_agent";
}

// Chat agent for normal conversations
async function chatAgent(state: typeof MessagesAnnotation.State) {
    const response = await chatModel.invoke(state.messages);
    return { messages: [response] };
}

// Search agent with tool capabilities
async function searchAgent(state: typeof MessagesAnnotation.State) {
    const response = await searchModel.invoke(state.messages);
    return { messages: [response] };
}

// Build the workflow graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("chat_agent", chatAgent)
    .addNode("search_agent", searchAgent)
    .addNode("tools", toolNode)
    .addConditionalEdges(START, decideBehavior, {
        "chat_agent": "chat_agent",
        "search_agent": "search_agent"
    })
    .addConditionalEdges("search_agent", toolsCondition)
    .addEdge("tools", "search_agent")
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
chat_agent          search_agent
  |                    |
  v                    v (toolsCondition)
 END              tools OR END
                    |
                    v
                search_agent (loop back)

Flow Description:
- START: Entry point with user message
- decideBehavior: Routes to chat_agent (normal conversation) or search_agent (search queries)
- chat_agent: Handles regular conversations, goes directly to END
- search_agent: Handles search queries with tool capabilities
- toolsCondition: Checks if search_agent wants to use tools
- tools: Executes TavilySearch if needed, then loops back to search_agent
- END: Final response returned to user
*/

// Utility function to run the chat
export async function runChat(message: string) {
    const initialState = {
        messages: [new HumanMessage(message)]
    };

    const result = await agenticChatApp.invoke(initialState);
    return result.messages[result.messages.length - 1].content;
}

// Example usage
async function main() {
    console.log("=== Agentic Chat Demo ===");

    // Normal chat
    console.log("\n1. Normal Chat:");
    const chatResponse = await runChat("Hello! How are you today?");
    console.log("Response:", chatResponse);

    // Search query
    console.log("\n2. Search Query:");
    const searchResponse = await runChat("What is the latest news about OpenAI?");
    console.log("Response:", searchResponse);

    // Another normal chat
    console.log("\n3. Normal Chat:");
    const chat2Response = await runChat("Can you help me understand JavaScript closures?");
    console.log("Response:", chat2Response);
}

main().catch(console.error);
