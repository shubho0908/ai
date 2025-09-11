# Agentic Code CLI

An intelligent coding assistant that can perform file system operations and coding tasks through natural language interactions. The agent follows a structured approach to break down tasks and execute them step by step.

## Features

- **Natural Language Processing**: Accepts coding queries in plain English
- **File System Operations**: Complete CRUD operations for files and folders
- **Structured Reasoning**: Follows START → THINK → PLAN → TOOL → OUTPUT workflow
- **Interactive CLI**: Real-time conversation with the AI agent
- **Code Quality Standards**: Enforces clean, readable code with best practices
- **Type Safety**: Full TypeScript support with Zod schema validation

## Architecture

### Core Components

- **`agent.ts`**: Main agent processing logic and conversation loop
- **`code.agent.ts`**: CLI interface and user interaction handler  
- **`prompts.ts`**: System prompts and agent instructions
- **`tools.ts`**: File system operation implementations
- **`types.ts`**: TypeScript definitions and Zod schemas

### Agent Workflow

1. **START**: Brief description of the task
2. **THINK**: Reasoning process and analysis
3. **PLAN**: Step-by-step execution plan
4. **TOOL**: Execute specific file operations
5. **OUTPUT**: Results and summary

## Available Tools

### File Operations
- **`readFile`**: Read content from a file
- **`writeFile`**: Create new file or overwrite existing
- **`updateFile`**: Find and replace content in files
- **`deleteFile`**: Remove files from filesystem

### Folder Operations  
- **`readFolder`**: List directory contents
- **`createFolder`**: Create new directories (recursive)
- **`deleteFolder`**: Remove directories and contents

## Usage

### Prerequisites
- Node.js 18+
- OpenAI API key configured in `.env`

### Running the Agent

```bash
# From the root directory
npx tsx agentic-code-cli/code.agent.ts
```

### Example Interactions

```
> Create a TypeScript interface for a User with name, email, and age properties

> Read the package.json file and update the version to 2.0.0

> Create a new folder called 'components' and add a React component file

> Refactor all console.log statements to use a proper logger
```

## Configuration

The agent uses GPT-5-nano model and requires:

```env
OPENAI_SECRET_KEY=your_openai_api_key_here
```

## Code Quality Standards

The agent enforces:
- Clean, readable code with consistent indentation
- Modern ES6+ features (const/let, arrow functions, template literals)
- Proper TypeScript types and interfaces
- Meaningful variable and function names
- Consistent quote styles and formatting
- Error handling and input validation
- Cross-browser compatibility considerations
- Accessibility standards for web code

## Response Format

All agent responses follow this JSON structure:

```json
{
  "steps": [
    {
      "step": "START",
      "content": "Task description"
    },
    {
      "step": "THINK", 
      "content": "Reasoning process"
    },
    {
      "step": "PLAN",
      "content": "Execution plan"
    },
    {
      "step": "TOOL",
      "tool": "toolName",
      "input": { "param": "value" }
    },
    {
      "step": "OUTPUT",
      "content": "Results"
    }
  ],
  "isCompleted": true
}
```

## Error Handling

- Graceful handling of file system errors
- Input validation using Zod schemas
- Detailed error messages and suggestions
- Automatic directory creation when needed

## Extending the Agent

### Adding New Tools

1. Define input schema in `types.ts`
2. Add tool implementation in `tools.ts`  
3. Update system prompt in `prompts.ts`
4. Add case handler in `executeTool` function

### Customizing Behavior

- Modify system prompt for different coding styles
- Adjust model parameters in `agent.ts`
- Add new file operation patterns in `tools.ts`

## Limitations

- Requires internet connection for OpenAI API
- File operations are limited to local filesystem
- No built-in code execution or compilation
- Single conversation session (no persistence)