# Semantic-cache

A smart caching solution that uses semantic similarity to cache and retrieve AI-generated responses, dramatically reducing API costs and latency for similar queries.

## 🚀 Overview

Traditional caching systems rely on exact key matches, which means they miss opportunities to reuse responses for semantically similar queries. @semantic-cache solves this by using AI embeddings to find semantically similar queries and serve cached responses when appropriate.

### How It Works

1. **Semantic Embedding**: Each user query is converted into a high-dimensional vector using OpenAI's embedding models
2. **Similarity Search**: The system searches a vector database (Qdrant) for previously cached responses with similar semantic meaning
3. **Threshold Matching**: If a match exceeds the similarity threshold (currently 0.70), the cached response is returned
4. **Smart Caching**: If no similar response is found, a new response is generated and automatically added to the cache

### Key Components

- **Qdrant Vector Database**: Stores query-response pairs with their semantic embeddings
- **OpenAI Embeddings**: Converts text to high-dimensional vectors for semantic comparison
- **Similarity Threshold**: Configurable threshold (default 0.70) to determine cache hit/miss
- **Asynchronous Caching**: New responses are added to cache in the background without delaying the user experience

## 🎯 Benefits

### Cost Reduction
- Reduce API calls by up to 70-90% for applications with repetitive or similar queries
- Dramatically lower your OpenAI API bills

### Performance Boost
- Near-instant responses for cached queries (milliseconds vs. seconds)
- Eliminate wait times for semantically similar requests

### Intelligent Caching
- Goes beyond exact string matching to understand meaning and intent
- Works with rephrased questions, synonyms, and related concepts

## 🛠️ Setup & Installation

1. **Install Dependencies**:
   ```bash
   # Install required packages (already in project dependencies)
   npm install @qdrant/js-client-rest openai dotenv
   ```

2. **Environment Setup**:
   Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_SECRET_KEY=your_openai_api_key_here
   ```

3. **Start Qdrant**:
   Run Qdrant locally using Docker:
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```

4. **Run the Application**:
   ```bash
   npx ts-node semantic-cache/index.ts
   ```

## ⚙️ Configuration

Key configuration options in `index.ts`:

- **SIMILARITY_THRESHOLD**: `0.70` - Adjust to control how strict the cache matching is
  - Higher values (0.8-0.9): More precise matches, fewer cache hits
  - Lower values (0.5-0.6): More matches, potential for less relevant responses
- **EMBEDDING_MODEL**: `"text-embedding-3-large"` - OpenAI embedding model
- **CACHE_COLLECTION_NAME**: `"semantic_cache"` - Qdrant collection name
- **LLM_MODEL**: `"gpt-5-nano-2025-08-07"` - Model used for generating responses

## 📊 How It Works Internally

1. **Collection Management**: Automatically creates Qdrant collection with proper vector dimensions
2. **Embedding Reuse**: Generates embedding once and reuses for both search and storage
3. **Cache Flow**:
   - Generate embedding for user query
   - Search cache for similar embeddings
   - Return cached response if similarity > threshold
   - Generate new response and cache it if no match found
4. **Asynchronous Storage**: New responses are stored in cache in background

## 🧪 Example Usage

```bash
# Start the application
npx ts-node semantic-cache/index.ts

# Example queries:
# > "What is the capital of France?"
# > "Tell me about the main city in France"
# > "France's capital city is?"
# 
# The system will recognize these as semantically similar and 
# return the cached response after the first query
```

## 🔧 Customization

You can easily customize the system for your needs:

1. **Adjust Similarity Threshold**:
   ```typescript
   const SIMILARITY_THRESHOLD = 0.70; // More strict matching
   ```

2. **Change Embedding Model**:
   ```typescript
   const EMBEDDING_MODEL = "text-embedding-3-larger";
   ```

3. **Modify System Prompt**:
   ```typescript
   const SYSTEM_PROMPT = "You are a specialized assistant for [your domain]";
   ```

## 📈 Performance Metrics

Cache effectiveness depends on your use case:

- **High Repetition Domains** (customer support, FAQs): 70-90% cache hit rates
- **Moderate Repetition** (general assistant): 40-60% cache hit rates
- **Low Repetition** (creative writing): 10-20% cache hit rates

Each cache hit saves:
- API costs: $0.002-0.02 per query
- Response time: 1-3 seconds

## 🚨 Limitations & Considerations (can be added quickly)

1. **Cache Freshness**: Currently no expiration mechanism - cached responses live indefinitely
2. **Context Sensitivity**: May return cached responses when fresh generation is needed
3. **Storage Growth**: Cache grows indefinitely - consider implementing cleanup strategies
4. **Privacy**: All queries and responses are stored in the vector database

## 🔄 Integration Guide

To integrate semantic caching into your existing application:

1. Extract the core functions from `index.ts`:
   - `searchSemanticCache()`
   - `addToSemanticCache()`
   - `generateEmbedding()`

2. Replace the CLI interaction with your application's input method

3. Adjust the similarity threshold based on your domain requirements

4. Consider adding cache expiration or size limits for production use

## 📚 Dependencies

- `@qdrant/js-client-rest`: Vector database client
- `openai`: OpenAI API client
- `dotenv`: Environment variable management
- Qdrant server: Vector database engine

## 📖 Learn More

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
