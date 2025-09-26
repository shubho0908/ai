import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import { createInterface } from "readline";
import { CohereRerank } from "@langchain/cohere";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";

dotenv.config();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
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

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
    apiKey: process.env.OPENAI_SECRET_KEY,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "rag-langchain",
  });

  const cohereRerank = new CohereRerank({
    model: "rerank-english-v3.0",
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET_KEY,
  });

  const userQuery = await askQuestion("> ");
  if (!userQuery.trim()) {
    console.log("Please provide a query");
    rl.close();
    return;
  }

  try {
    // Step 1: Retrieve top 5 documents by similarity
    const docs = await vectorStore.similaritySearch(userQuery, 5);

    // Step 2: Format documents for reranking
    const formattedDocs = docs.map(
      (doc) => new Document({ pageContent: doc.pageContent, metadata: doc.metadata })
    );

    // Step 3: Rerank documents using Cohere and select top 3
    const rerankedDocs = await cohereRerank.rerank(formattedDocs, userQuery, { topN: 3 });

    console.log(`\n📄 Found ${rerankedDocs.length} most relevant documents:\n`);

const context = rerankedDocs
  .map((rerank, index: number) => {
    const doc = formattedDocs[rerank.index];
    return `Document ${index + 1} (Page ${doc.metadata?.loc?.pageNumber || "Unknown"}):\n${doc.pageContent}`;
  })
  .join("\n\n");


    // Step 4: Generate response with OpenAI
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Use the provided context to answer the user's question. Always include page numbers in your response when referencing information from the documents. If the context doesn't contain relevant information, say so.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${userQuery}`,
        },
      ],
    });

    console.log("🤖 Assistant:");
    console.log(response.choices[0]?.message?.content || "No response generated");
  } catch (error) {
    console.error("Error:", error);
  }

  rl.close();
}

main().catch(console.error);
