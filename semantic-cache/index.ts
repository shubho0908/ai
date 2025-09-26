import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import dotenv from "dotenv";
import { createInterface } from "readline";
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const qdrantClient = new QdrantClient({ url: "http://localhost:6333" });
const CACHE_COLLECTION_NAME = "semantic_cache";
const EMBEDDING_MODEL = "text-embedding-3-large";
const SIMILARITY_THRESHOLD = 0.70;

const SYSTEM_PROMPT = `
You are a very powerful AI Assistant named Jarvis. Your task is to help users with their queries.
`;

async function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Ensure collection exists - fixed syntax
async function ensureCollection(embeddingDimension: number) {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === CACHE_COLLECTION_NAME
    );

    if (!exists) {
      console.log(`Creating collection "${CACHE_COLLECTION_NAME}" with dimension ${embeddingDimension}`);
      await qdrantClient.createCollection(CACHE_COLLECTION_NAME, {
        vectors: {
          size: embeddingDimension,
          distance: "Cosine",
        },
      });
      console.log("✅ Collection created successfully");
    } else {
      console.log("✅ Collection already exists");
    }
  } catch (error) {
    console.error("Error ensuring collection:", error);
    throw error;
  }
}

// Generate response with LLM
async function generateResponseWithLLM(userQuery: string): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: userQuery,
    },
  ];

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL, 
    messages,
  });

  return response.choices[0]?.message?.content || "No response";
}

// Generate embedding once and reuse
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embeddingResponse = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Search semantic cache
async function searchSemanticCache(queryEmbedding: number[]): Promise<string | null> {
  try {
    const searchResult = await qdrantClient.search(CACHE_COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: 1,
      with_payload: true,
    });

    if (
      searchResult.length > 0 &&
      searchResult[0].score !== undefined &&
      searchResult[0].score >= SIMILARITY_THRESHOLD
    ) {
      console.log(`✅ Cache hit (similarity: ${searchResult[0].score.toFixed(3)})`);
      return searchResult[0].payload?.answer as string;
    }

    return null; // Cache miss
  } catch (error) {
    console.error("Error searching semantic cache:", error);
    return null;
  }
}

// Add to semantic cache
async function addToSemanticCache(userQuery: string, answer: string, queryEmbedding: number[]): Promise<void> {
  try {
    await qdrantClient.upsert(CACHE_COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id: Date.now(),
          vector: queryEmbedding,
          payload: { 
            question: userQuery, 
            answer: answer,
            timestamp: new Date().toISOString()
          },
        },
      ],
    });

    console.log("💾 Added to semantic cache");
  } catch (error) {
    console.error("Error adding to semantic cache:", error);
  }
}

async function main() {
  try {
    const userQuery = await askQuestion("Enter your query: ");

    // Generate embedding once
    console.log("🔄 Generating embedding...");
    const queryEmbedding = await generateEmbedding(userQuery);
    
    // Ensure collection exists first
    await ensureCollection(queryEmbedding.length);
    
    // Try to get answer from semantic cache
    console.log("🔍 Searching cache...");
    const cachedAnswer = await searchSemanticCache(queryEmbedding);
    
    if (cachedAnswer) {
      console.log("\n" + cachedAnswer);
    } else {
      // Cache miss - generate new response
      console.log("⚠️ Cache miss. Generating new response...");
      const newAnswer = await generateResponseWithLLM(userQuery);
      
      // Add to cache using pre-computed embedding (async)
      addToSemanticCache(userQuery, newAnswer, queryEmbedding).catch(console.error);
      
      console.log("✨ New response:");
      console.log(newAnswer);
    }
  } catch (error) {
    console.error("Error in main:", error);
  } finally {
    rl.close();
  }
}

main().catch(console.error);