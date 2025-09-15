# Chat with Memory

A conversational AI assistant with persistent memory capabilities using Mem0 and OpenAI.

## What is AI Memory?

Most AI agents are **stateless** - they process queries and forget everything afterward, even with large context windows. This creates challenges:
- No continuity across conversations
- Inability to learn user preferences
- High token usage from repeating context
- Lack of personalization

## Types of Memory

**Mem0** addresses these challenges by implementing different memory types:

1. **Working Memory**: Short-term session awareness for current conversation
2. **Factual Memory**: Long-term structured knowledge storage
3. **Episodic Memory**: Records of specific past conversations and interactions
4. **Semantic Memory**: General knowledge built over time from patterns

## How Mem0 Solves Memory Challenges

Unlike traditional retrieval methods (RAG), Mem0 focuses on **continuity**:
- ✅ Stores decisions, preferences, and evolving context
- ✅ Enables persistent memory across interactions
- ✅ Reduces token usage through intelligent memory retention
- ✅ Provides sub-50ms latency for smooth user experiences
- ✅ Scales from prototypes to production with just 4 lines of code

*"Mem0 gives AI agents memory so they can remember, learn, and evolve across interactions"*

## Features

- **Persistent Memory**: Stores and retrieves conversation context across sessions
- **Vector Search**: Uses Qdrant vector database for semantic memory retrieval
- **Interactive Chat**: Command-line interface for real-time conversations
- **Context Awareness**: Incorporates relevant memories into responses

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   OPENAI_SECRET_KEY=your_openai_api_key
   ```

3. Start Qdrant vector database:
   ```bash
   docker run -p 6333:6333 qdrant/qdrant
   ```

## Usage

```bash
npm run dev memories/chatWithMemory.ts
```

The assistant will start an interactive chat session where you can:
- Ask questions and have natural conversations
- Build up memory context over time
- Reference past conversations automatically

Type `exit` to quit the session.

## Configuration

The system uses:
- **Vector Store**: Qdrant (localhost:6333)
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: GPT-5-nano-2025-08-07
- **Collection**: my-memories

## Important Notes

⚠️ **Production Usage**: The current implementation uses a hardcoded user ID (`"shubho"`) for testing. In production applications, you should:
- Use the user's official/unique identifier (user ID, email, or account ID)
- Implement proper authentication and user session management
- Ensure user data isolation and privacy

## Memory Management

- Memories are automatically stored after each conversation
- Relevant memories are retrieved based on semantic similarity
- Conversation history is limited to the last 10 messages for context