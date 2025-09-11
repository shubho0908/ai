import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { createInterface } from "readline";
import dotenv from "dotenv";

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
    console.log("🤖 RAG Chat initialized. Type your query:");
    
    // Create vector embeddings 
    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-large",
        apiKey: process.env.OPENAI_SECRET_KEY
    });

    // Get vector data from existing collection
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        collectionName: "rag-langchain"
    });

    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_SECRET_KEY
    });

    const userQuery = await askQuestion("> ");
    
    if (!userQuery.trim()) {
        console.log("Please provide a query");
        rl.close();
        return;
    }

    try {
        // Perform similarity search with user query (only get related result from chunks)
        const docs = await vectorStore.similaritySearch(userQuery, 3);
        
        console.log(`\n📄 Found ${docs.length} relevant documents:\n`);
        
        // Create context from retrieved documents
        const context = docs.map((doc, index) => 
            `Document ${index + 1} (Page ${doc.metadata?.loc?.pageNumber || 'Unknown'}):\n${doc.pageContent}`
        ).join('\n\n');

        // Create chat completion with context
        const response = await openai.chat.completions.create({
            model: "gpt-5-nano-2025-08-07",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Use the provided context to answer the user's question. Always include page numbers in your response when referencing information from the documents. If the context doesn't contain relevant information, say so."
                },
                {
                    role: "user",
                    content: `Context:\n${context}\n\nQuestion: ${userQuery}`
                }
            ]
        });

        console.log("🤖 Assistant:");
        console.log(response.choices[0]?.message?.content || "No response generated");
        
    } catch (error) {
        console.error("Error:", error);
    }
    
    rl.close();
}

main().catch(console.error);