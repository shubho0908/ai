# Agentic Chat with LangGraph

An intelligent multi-agent chat system built with LangGraph that intelligently routes between conversational AI and tool-enabled agents based on query context. Features comprehensive Notion integration, movie search capabilities, and web search functionality.

## Features

- **Intelligent Query Routing**: Automatically determines whether to use conversational AI or tool-enabled agents
- **Multi-Tool Integration**: Seamlessly integrates 15+ tools across different domains
- **Notion Workspace Management**: Complete CRUD operations for pages, databases, and content blocks
- **Movie Information System**: Comprehensive movie search and information retrieval
- **Web Search Capabilities**: Real-time web search through Tavily integration
- **State Management**: Robust conversation state handling with LangGraph
- **Type-Safe Operations**: Full TypeScript support with Zod validation

## Architecture

### Core Components

- **`chat.ts`**: Main chat application with LangGraph workflow orchestration
- **`notion-tools.ts`**: Comprehensive Notion API tool implementations (13 tools)

### Workflow Structure

<img width="2040" height="2344" alt="image" src="https://github.com/user-attachments/assets/d2b2d5aa-221f-4c01-ad8f-dbe3b05b6ec3" />


### Flow Description

1. **START**: Entry point with user message
2. **decideBehavior**: Intelligent routing based on query context
   - Routes to `chat_agent` for normal conversations
   - Routes to `tool_agent` for queries requiring external data/actions
3. **chat_agent**: Handles conversational queries directly → END
4. **tool_agent**: Processes tool-requiring queries with access to all integrated tools
5. **toolsCondition**: Determines if tools need to be executed
6. **tools**: Executes appropriate tools, then loops back to tool_agent
7. **END**: Returns final response to user

## Available Tools

### Notion Tools (13 comprehensive tools)

#### Page Operations
- **`createNotionPage`**: Create new pages with titles, content, and properties
- **`readNotionPage`**: Retrieve page content and metadata
- **`updateNotionPage`**: Modify page properties and content
- **`deleteNotionPage`**: Archive/delete pages

#### Database Operations
- **`createNotionDatabase`**: Create databases with custom schemas
- **`readNotionDatabase`**: Retrieve database structure and properties
- **`queryNotionDatabase`**: Query database entries with filtering and sorting
- **`updateNotionDatabase`**: Modify database structure and properties

#### Content Block Operations
- **`addNotionBlocks`**: Add various content blocks (paragraphs, headings, lists, quotes)
- **`readNotionBlocks`**: Retrieve content blocks from pages
- **`updateNotionBlock`**: Modify existing content blocks
- **`deleteNotionBlock`**: Remove content blocks

#### Workspace Operations
- **`searchNotion`**: Search across entire Notion workspace

### Movie Search Tool
- **`movieFinder`**: Search movies using OMDb API
  - Comprehensive movie data including title, year, IMDb ID, poster
  - Handles actor, director, and general cinema queries
  - Returns top 5 relevant results with detailed information

### Web Search Tool
- **`TavilySearch`**: Real-time web search capabilities
  - Current events and news
  - Research and fact-checking
  - General information retrieval

## Usage

### Prerequisites
- Node.js 18+
- Required API keys in `.env`:
  - `OPENAI_SECRET_KEY`: OpenAI API key
  - `NOTION_TOKEN`: Notion integration token
  - `TAVILY_API_KEY`: Tavily search API key

### Environment Configuration
```env
OPENAI_SECRET_KEY=your_openai_api_key_here
NOTION_TOKEN=your_notion_integration_token
TAVILY_API_KEY=your_tavily_api_key
```

### Running the Chat System

```bash
# From the langgraph directory
npx tsx chat.ts

# Or from the root directory
npx tsx langgraph/chat.ts
```

## Example Interactions

### Normal Conversations
```
> Hello! How are you today?
> What's the weather like?
> Tell me a joke
```

### Movie Queries (Auto-routed to movieFinder)
```
> Find movies starring Leonardo DiCaprio
> What are some good sci-fi films from 2023?
> Tell me about the movie Inception
> Search for Bollywood movies about love
```

### Notion Operations (Auto-routed to Notion tools)
```
> Create a new page in my Notes database about project planning
> Search my Notion workspace for todos
> Add a bullet list to my meeting notes page
> Create a database for tracking expenses
> Find all pages about machine learning
```

### Web Search Queries (Auto-routed to TavilySearch)
```
> What's the latest news about AI?
> Search for recent developments in quantum computing
> Find current information about climate change
> What happened in the stock market today?
```

## Intelligent Routing System

The system uses sophisticated query analysis to determine routing:

### Tool Indicators
Queries containing these keywords trigger tool-enabled agents:
- **Search & Research**: search, find, look up, current, latest, news, research
- **Movie & Entertainment**: movie, film, cinema, actor, director, bollywood, hollywood
- **Notion Operations**: notion, create, database, page, notes, todo, organize, workspace
- **Information Retrieval**: what is, who is, when did, where is, information about

### Routing Logic
```typescript
function needsTools(messages: any[]): boolean {
    const content = lastMessage.content.toLowerCase();
    return toolIndicators.some(indicator => content.includes(indicator));
}
```

## Model Configuration

- **Primary Model**: GPT-5-nano-2025-08-07
- **Optimized Performance**: Fast response times with high accuracy
- **Tool Binding**: Automatic tool selection based on query context
- **Context Preservation**: Maintains conversation history throughout interactions

## Notion Integration Features

### Workspace Management
- Create and manage pages with rich content
- Build databases with custom properties and schemas
- Query databases with complex filtering and sorting
- Full CRUD operations on all Notion objects

### Content Creation
- Support for all Notion block types (paragraphs, headings, lists, quotes, code)
- Rich text formatting and styling
- Nested content structures
- Bulk content operations

### Advanced Querying
- Complex database queries with filters
- Full-text search across workspace
- Property-based filtering and sorting
- Pagination support for large datasets

## Movie Search Capabilities

### Comprehensive Movie Data
- Title, year, IMDb ID, type, poster
- Search by title, actor, director, genre
- Support for multiple movie databases
- Detailed error handling and validation

### Search Features
```typescript
// Example movie search response
{
    "query": "Leonardo DiCaprio",
    "total_results": "50",
    "movies": [
        {
            "title": "Inception",
            "year": "2010",
            "imdbID": "tt1375666",
            "type": "movie",
            "poster": "https://example.com/poster.jpg"
        }
        // ... more results
    ]
}
```

## Error Handling & Validation

- **Type Safety**: Comprehensive TypeScript definitions with Zod schemas
- **API Error Recovery**: Graceful handling of API failures and rate limits
- **Input Validation**: Automatic validation of tool inputs and parameters
- **User-Friendly Messages**: Clear error messages and troubleshooting guidance

## Performance Optimization

- **Parallel Tool Execution**: Efficient handling of multiple tool calls
- **Context Management**: Optimized memory usage for long conversations
- **Caching**: Intelligent caching of frequently accessed data
- **Rate Limiting**: Respectful API usage with built-in throttling

## Extending the System

### Adding New Tools
1. Create tool implementation with Zod schema
2. Add to tools array in `chat.ts`
3. Update routing indicators if needed
4. Test tool integration

### Custom Notion Operations
```typescript
// Example: Custom tool for specific workflow
export const customNotionTool = tool(
    async (input) => {
        // Implementation
    },
    {
        name: "customOperation",
        description: "Custom Notion workflow",
        schema: z.object({
            // Parameters
        })
    }
);
```

### Workflow Modifications
- Modify routing logic in `decideBehavior` function
- Add new agent types for specialized workflows
- Extend conditional routing for complex scenarios
- Implement custom state management patterns

## Security & Best Practices

- **API Key Management**: Secure handling of sensitive credentials
- **Input Sanitization**: Validation of all user inputs and tool parameters
- **Rate Limiting**: Respectful API usage patterns
- **Error Isolation**: Preventing tool errors from affecting system stability

## Troubleshooting

### Common Issues
- **API Key Errors**: Verify all required environment variables are set
- **Rate Limiting**: Implement exponential backoff for API calls
- **Tool Failures**: Check tool-specific error messages and logs
- **Routing Issues**: Verify query indicators match expected patterns

### Debug Mode
```typescript
// Enable detailed logging
console.log("Tool selected:", toolName);
console.log("Query analysis:", queryAnalysis);
console.log("Routing decision:", routingDecision);
```

## Future Enhancements

### Additional Integrations
- Google Calendar and Gmail APIs
- Slack and Discord integrations
- GitHub repository management
- Database connectivity (PostgreSQL, MongoDB)

### Advanced Features
- Multi-language support
- Voice interaction capabilities
- Advanced analytics and reporting
- Custom workflow automation

### Performance Improvements
- Response streaming for long operations
- Advanced caching strategies
- Distributed tool execution
- Real-time collaboration features
