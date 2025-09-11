# Chain of Thoughts (CoT)

A simple implementation of Chain of Thoughts reasoning pattern for AI assistants. This project demonstrates how to structure AI responses into clear, step-by-step reasoning processes.

## Overview

The Chain of Thoughts approach breaks down complex problem-solving into transparent, sequential steps that make the AI's reasoning process visible to users. This implementation uses a 4-step framework: START → THINK → PLAN → OUTPUT.

## Features

- **Structured Reasoning**: Clear 4-step problem-solving approach
- **Interactive CLI**: Real-time conversation interface
- **JSON-Based Responses**: Structured output format for easy parsing
- **General Purpose**: Works with any type of query or problem
- **Simple Implementation**: Minimal setup and dependencies

## Architecture

### Core Components

- **`cot.ts`**: Main implementation with CLI interface and reasoning logic

### Reasoning Framework

1. **START**: Analyze and understand the user's query
2. **THINK**: Consider possible approaches to solve the problem
3. **PLAN**: Execute the chosen approach step-by-step
4. **OUTPUT**: Provide the final answer or solution

## Usage

### Prerequisites
- Node.js 18+
- OpenAI API key configured in `.env`

### Running the CoT Assistant

```bash
# From the root directory
npx tsx chain-of-thoughts/cot.ts
```

### Example Interaction

```
Enter your query: What's the third angle in a triangle if two angles are 60° and 30°?

START: Hey! I can help you with your query.

THINK: Okay, so the user wants my help to solve a mathematical question about finding the third angle in a triangle.

PLAN: Let the unknown angle be (x), then according to the triangle angle sum formula: 60 + 30 + x = 180, so x = 180 - 90 = 90

OUTPUT: The third angle is 90°.

✅ All steps completed!
```

## System Prompt

The assistant operates under the "Jarvis" persona and follows strict guidelines:

- Responds only in JSON format with "step" and "content" fields
- Always processes queries through all 4 steps
- Maintains clarity and logical flow between steps
- Provides helpful, accurate responses

## Response Format

Each step returns a JSON object:

```json
{ "step": "START", "content": "Understanding your query..." }
{ "step": "THINK", "content": "Analyzing possible approaches..." }
{ "step": "PLAN", "content": "Executing solution step-by-step..." }
{ "step": "OUTPUT", "content": "Final answer or result" }
```

## Configuration

### Environment Variables
```env
OPENAI_SECRET_KEY=your_openai_api_key_here
```

### Model Settings
- Uses GPT-5-nano model for fast reasoning
- Single-turn conversation processing
- JSON extraction and parsing from responses

## Use Cases

### Mathematical Problems
```
Query: Solve 2x + 5 = 15
Response: Step-by-step algebraic solution
```

### Logic Puzzles
```
Query: If all roses are flowers and some flowers are red, can we say all roses are red?
Response: Logical reasoning through syllogisms
```

### General Questions
```
Query: How does photosynthesis work?
Response: Scientific explanation broken down into clear steps
```

### Creative Tasks
```
Query: Write a haiku about programming
Response: Creative process from concept to final poem
```

## Implementation Details

### JSON Parsing
- Extracts multiple JSON objects from AI responses
- Robust error handling for malformed JSON
- Sequential processing of reasoning steps

### CLI Interface
- Simple readline interface for user input
- Clear step-by-step output formatting
- Completion indicators and error handling

### Error Handling
- Graceful handling of API errors
- JSON parsing error recovery
- User-friendly error messages

## Extending the Framework

### Adding New Step Types
Modify the system prompt to include additional reasoning steps:
```
5. VERIFY - Double-check the solution
6. REFLECT - Consider alternative approaches
```

### Custom Personas
Replace the "Jarvis" persona with domain-specific assistants:
- Math tutor for educational content
- Code reviewer for programming tasks
- Creative writer for storytelling

### Multi-Turn Conversations
Extend the implementation to support:
- Conversation history
- Follow-up questions
- Context preservation across queries

## Benefits of Chain of Thoughts

1. **Transparency**: Users see exactly how the AI reaches conclusions
2. **Trust**: Clear reasoning builds confidence in AI responses
3. **Learning**: Users can understand problem-solving approaches
4. **Debugging**: Easy to identify where reasoning might go wrong
5. **Consistency**: Structured approach ensures reliable outputs

## Limitations

- Single-turn conversations only
- No conversation history
- Simple JSON extraction (may miss complex responses)
- No tool integration or external data access

## Future Enhancements

- **Multi-turn support**: Conversation continuity
- **Tool integration**: Access to external APIs and data
- **Verification steps**: Self-checking mechanisms
- **Visual reasoning**: Diagram and chart generation
- **Domain specialization**: Subject-specific reasoning patterns