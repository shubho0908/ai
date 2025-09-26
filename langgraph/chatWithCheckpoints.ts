import { ChatOpenAI } from "@langchain/openai";
import { MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config()


// Create chat model
const chatModel = new ChatOpenAI({
    model: process.env.OPENAI_MODEL,
    apiKey: process.env.OPENAI_SECRET_KEY
});

// Chat agent for conversations
async function chatAgent(state: typeof MessagesAnnotation.State) {
    const response = await chatModel.invoke(state.messages);
    return { messages: [response] };
}

// Build the workflow graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("chat_agent", chatAgent)
    .addEdge(START, "chat_agent")
    .addEdge("chat_agent", END);

// MongoDB connection string - update with your credentials
const MONGODB_URI = process.env.MONGODB_URI as string;
const client = new MongoClient(MONGODB_URI);
const checkpointer = new MongoDBSaver({ client, dbName: "langgraph" });
export const agenticChatApp = workflow.compile({ checkpointer });

const config = { configurable: { thread_id: "me" } }; //unique id


/*
Workflow Structure:
==================

START
  |
  v
chat_agent
  |
  v
 END

Flow Description:
- START: Entry point with user message
- chat_agent: Handles all conversations using the OpenAI model
- END: Final response returned to user

This is a simple chat workflow without any external tools or capabilities.
*/

// Utility function to run the chat
export async function runChat(message: string) {
    const initialState = {
        messages: [new HumanMessage(message)]
    };

    const result = await agenticChatApp.invoke(initialState, config);
    return result.messages[result.messages.length - 1].content;
}

async function main() {
    console.log("=== Simple Chat Demo ===");

    // Normal chat
    console.log("\n1. Chat:");
    const chatResponse = await runChat("do u know me and what I do?");
    console.log("Response:", chatResponse);
}

main().catch(console.error);