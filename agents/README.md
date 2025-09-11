# Gmail Agent

A specialized AI agent for Gmail automation and email management. This agent provides a natural language interface to Gmail operations while following a structured reasoning approach.

## Features

- **Gmail Integration**: Read, write, and delete emails through natural language commands
- **Structured Processing**: Follows START → THINK → PLAN → TOOL → OUTPUT workflow
- **Mock Implementation**: Currently uses mock data for development and testing
- **Type-Safe Operations**: Full TypeScript support with Zod validation
- **Natural Language Parsing**: Understands various email-related queries

## Architecture

### Core Components

- **`agent.ts`**: Main agent processing logic with conversation loop
- **`gmail.agent.ts`**: CLI interface for Gmail operations
- **`prompts.ts`**: System prompts and agent instructions  
- **`tools.ts`**: Email operation implementations (currently mock)
- **`types.ts`**: TypeScript definitions and Zod schemas
- **`constant.ts`**: Mock email data for testing

### Agent Workflow

1. **START**: Analyze and understand the user's query
2. **THINK**: Consider possible approaches to fulfill the request
3. **PLAN**: Plan the execution approach
4. **TOOL**: Execute email operations using available tools
5. **OUTPUT**: Provide final response to the user

## Available Tools

### Email Operations

- **`read_emails`**: Read specified number of latest emails
  - Parameters: `{ num: number }`
  - Example: "Show me my latest 5 emails"

- **`read_emails_from_user`**: Read emails from specific sender
  - Parameters: `{ email: string }`
  - Example: "What emails did I get from john@example.com?"

- **`write_email`**: Send an email
  - Parameters: `{ email: string, subject: string, content: string }`
  - Example: "Send an email to alice@company.com about the meeting"

- **`delete_email`**: Delete an email by ID
  - Parameters: `{ id: string }`
  - Example: "Delete email with ID msg_abc123"

## Usage

### Prerequisites
- Node.js 18+
- OpenAI API key configured in `.env`

### Running the Gmail Agent

```bash
# From the root directory
npx tsx agents/gmail.agent.ts
```

### Example Interactions

```
> Show me my latest 3 emails

> Read emails from sarah@company.com

> Send an email to team@company.com with subject "Weekly Update" and content "Here's our progress this week..."

> Delete the email with ID msg_xyz789
```

## Email Writing Guidelines

The agent handles various email writing patterns:

### Structured Input
```
Send email to john@example.com:
Subject: Meeting Tomorrow
Content: Don't forget about our 2 PM meeting
```

### Natural Language
```
Send an email to alice@company.com about the project deadline
```

### Simple Address
```
Send an email to support@company.com
```

## Configuration

### Environment Variables
```env
OPENAI_SECRET_KEY=your_openai_api_key_here
```

### Model Configuration
- Uses GPT-5-nano model for fast responses
- JSON schema validation for structured outputs
- Conversation context maintained across interactions

## Mock Implementation

Currently uses mock data for development:
- Pre-defined email dataset in `constant.ts`
- Simulated email operations with realistic responses
- Console logging for write/delete operations
- Unique ID generation for new emails

### Sample Mock Emails
The agent comes with sample emails from various senders including:
- Work colleagues and managers
- External partners and clients
- System notifications
- Newsletter subscriptions

## Response Format

All responses follow this JSON structure:

```json
{
  "steps": [
    {
      "step": "START",
      "content": "Understanding the query"
    },
    {
      "step": "THINK", 
      "content": "Analyzing approaches"
    },
    {
      "step": "PLAN",
      "content": "Execution plan"
    },
    {
      "step": "TOOL",
      "tool": "read_emails",
      "input": { "num": 5 }
    },
    {
      "step": "OUTPUT",
      "content": "Final results"
    }
  ],
  "isCompleted": true
}
```

## Security & Privacy

- Currently operates on mock data only
- No actual Gmail API integration (ready for implementation)
- Secure handling of email addresses and content
- Input validation and sanitization

## Future Enhancements

### Gmail API Integration
- OAuth2 authentication setup
- Real Gmail API operations
- Attachment handling
- Advanced search and filtering

### Extended Features
- Email threading and conversation support
- Calendar integration
- Contact management
- Email templates and automation rules

## Error Handling

- Graceful handling of invalid email addresses
- Missing parameter validation
- Tool execution error recovery
- User-friendly error messages

## Extending the Agent

### Adding New Tools
1. Define input schema in `types.ts`
2. Add tool implementation in `tools.ts`
3. Update system prompt in `prompts.ts`
4. Add tool validation in agent processing

### Customizing Behavior
- Modify system prompt for different email styles
- Adjust mock data in `constant.ts`
- Update response templates and formatting

## Limitations

- Mock implementation only (no real Gmail access)
- Single conversation session
- Limited to predefined email operations
- No attachment support in current version