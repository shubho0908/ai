# GenAI Agents Collection

A collection of AI agents and automation tools built with modern AI models. This repository contains various specialized agents for different use cases, each with their own implementation and documentation.

## Overview

This project serves as a playground and collection for experimenting with AI agents, automation tools, and generative AI applications. Each subdirectory contains a self-contained project with its own specific purpose and documentation.

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/shubho0908/gen-ai.git
cd gen-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start MongoDB with Docker (for LangGraph checkpoints):
```bash
docker-compose up -d mongodb
```

5. Explore individual projects - each folder contains its own README with specific setup and usage instructions.

## Features

### LangGraph with MongoDB Checkpoints
- **Location**: `langgraph/chatWithCheckpoints.ts`
- **Description**: Chat agent with persistent conversation history stored in MongoDB
- **Features**:
  - Persistent conversation memory across sessions
  - MongoDB-backed checkpointing for reliability
  - Docker Compose setup for easy MongoDB deployment
  - Thread-based conversation isolation

#### Running the LangGraph Chat
```bash
# Start MongoDB
docker-compose up -d mongodb

# Run the chat application
pnpm start
```

### Memory with Graph Database
- **Location**: `memories/memoryWithGraph.ts`
- **Description**: AI Assistant with advanced memory capabilities using vector store and graph database
- **Features**:
  - Vector-based memory storage with Qdrant
  - Graph-based memory connections with Neo4j
  - Contextual memory retrieval and storage
  - Persistent conversation history with semantic understanding
  - Intelligent memory filtering based on query relevance

#### Setup Requirements
1. **Qdrant**: Vector database for embedding storage
2. **Neo4j**: Graph database for memory relationships
3. **OpenAI API**: For embeddings and chat completions

#### Environment Variables
```bash
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
OPENAI_SECRET_KEY=your_openai_key
```

#### Running the Memory Chat
```bash
# Start Qdrant and Neo4j services
docker-compose up -d qdrant neo4j

# Run the memory chat application
npx tsx memories/memoryWithGraph.ts
```

## Common Dependencies

- **openai**: OpenAI API client
- **@langchain/langgraph**: LangGraph for building stateful AI agents
- **@langchain/langgraph-checkpoint-mongodb**: MongoDB checkpointer for persistent memory
- **mem0ai**: Memory management with vector and graph storage capabilities
- **mongodb**: MongoDB driver for database operations
- **zod**: TypeScript-first schema validation
- **dotenv**: Environment variable management

## Infrastructure

### MongoDB Setup
The project uses MongoDB for persistent conversation memory. The `docker-compose.yml` file provides:
- MongoDB 7.0 with authentication
- Persistent data volumes
- Network isolation
- Default credentials: `root/password123`

### Environment Variables
Required environment variables in `.env`:
```
OPENAI_SECRET_KEY=your_openai_key
MONGODB_URI=mongodb://root:password123@localhost:27017/langgraph?authSource=admin
```

## Project Philosophy

- **Modular Design**: Each agent/tool is self-contained
- **Type Safety**: Full TypeScript support
- **Extensible**: Easy to add new agents and tools
- **Well-Documented**: Each project includes comprehensive documentation

## Contributing

1. Fork the repository
2. Create a feature branch for new agents or improvements
3. Add proper documentation for new projects
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
