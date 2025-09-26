# GenAI Agents Collection

A collection of AI agents and automation tools built with modern AI models. This repository contains various specialized agents for different use cases, each with their own implementation and documentation.

## Table of Contents

- [GenAI Agents Collection](#genai-agents-collection)
  - [Table of Contents](#table-of-contents)
  - [Projects](#projects)
    - [Agentic Systems](#agentic-systems)
    - [Reasoning Patterns](#reasoning-patterns)
    - [Graph-Based Agents](#graph-based-agents)
    - [Retrieval-Augmented Generation (RAG)](#retrieval-augmented-generation-rag)
    - [Caching](#caching)
  - [Getting Started](#getting-started)
  - [Common Dependencies](#common-dependencies)
  - [Infrastructure](#infrastructure)

## Projects

### Agentic Systems

| Project                       | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Agentic Code CLI**          | An intelligent coding assistant that can perform file system operations and coding tasks.                 |
| **Agentic Research Workflow** | A multi-step agentic workflow for conducting research using LangGraph.                                    |
| **Gmail Agent**               | A specialized AI agent for Gmail automation and email management.                                         |

### Reasoning Patterns

| Project                  | Description                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **Chain of Thoughts (CoT)** | A simple implementation of the Chain of Thoughts reasoning pattern for AI assistants.      |

### Graph-Based Agents

| Project                        | Description                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **LangGraph Agentic Chat**     | An intelligent multi-agent chat system built with LangGraph that intelligently routes between conversational AI and tool-enabled agents. |
| **Memory with Graph Database** | An AI Assistant with advanced memory capabilities using a vector store and graph database.                |

### Retrieval-Augmented Generation (RAG)

| Project               | Description                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **RAG with LangChain** | A Retrieval-Augmented Generation (RAG) system built with LangChain for document indexing and intelligent querying. |

### Caching

| Project           | Description                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Semantic Cache** | A smart caching solution that uses semantic similarity to cache and retrieve AI-generated responses.      |

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

### Qdrant Setup
The project uses Qdrant for vector storage. The `docker-compose.yml` file provides:
- Qdrant vector database
- Persistent data volumes

### Environment Variables
Required environment variables in `.env`:
```
OPENAI_SECRET_KEY=your_openai_key
MONGODB_URI=mongodb://root:password123@localhost:27017/langgraph?authSource=admin
QDRANT_URL=http://localhost:6333
```
