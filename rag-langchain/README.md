# RAG LangChain

A Retrieval-Augmented Generation (RAG) system built with LangChain for document indexing and intelligent querying. This implementation demonstrates how to build a knowledge retrieval system using PDF documents and vector search capabilities.

## Features

- **PDF Document Processing**: Load and process PDF documents for indexing
- **Vector Embeddings**: Generate embeddings using OpenAI's text-embedding-3-large model
- **Vector Database**: Store and retrieve embeddings using Qdrant vector database
- **Intelligent Chunking**: Split documents using RecursiveCharacterTextSplitter with overlap
- **Similarity Search**: Find relevant document chunks based on user queries
- **Context-Aware Responses**: Generate answers using retrieved context and GPT-5-nano

## Architecture

### Core Components

- **`indexing.ts`**: Document processing and vector store creation
- **`retrieval.ts`**: Interactive CLI for querying the indexed documents

### RAG Workflow

1. **Document Loading**: Load PDF document using PDFLoader
2. **Text Splitting**: Chunk documents with configurable size and overlap
3. **Embedding Generation**: Create vector embeddings for each chunk
4. **Vector Storage**: Store embeddings in Qdrant collection
5. **Query Processing**: Convert user queries to embeddings for similarity search
6. **Context Retrieval**: Find most relevant document chunks
7. **Response Generation**: Generate contextual answers using retrieved information

## Configuration

### Environment Variables
```env
OPENAI_SECRET_KEY=your_openai_api_key_here
QDRANT_URL=your_qdrant_instance_url
```

### Document Processing Settings
- **Chunk Size**: 1000 characters per chunk
- **Chunk Overlap**: 200 characters between chunks
- **Embedding Model**: text-embedding-3-large
- **Collection Name**: rag-langchain

## Usage

### Prerequisites
- Node.js 18+
- OpenAI API key
- Qdrant vector database instance
- PDF document in root directory (`geeta.pdf`)

### Document Indexing

First, index your PDF document:

```bash
# From the rag-langchain directory
npx tsx indexing.ts
```

This will:
- Load the PDF document
- Split it into manageable chunks
- Generate embeddings for each chunk
- Store embeddings in Qdrant collection

### Document Querying

After indexing, start the interactive query interface:

```bash
# From the rag-langchain directory
npx tsx retrieval.ts
```

### Example Interactions

```
🤖 RAG Chat initialized. Type your query:
> What is the main theme of the document?

📄 Found 3 relevant documents:

🤖 Assistant:
Based on the retrieved context from pages 15, 23, and 41, the main theme discusses...
```

## Technical Details

### Embedding Configuration
- **Model**: OpenAI text-embedding-3-large
- **Dimensions**: 3072 (default for the model)
- **Similarity Metric**: Cosine similarity (Qdrant default)

### Text Splitting Strategy
- **Method**: RecursiveCharacterTextSplitter
- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters
- **Preserves**: Document structure and context

### Similarity Search Parameters
- **Results**: Top 3 most relevant chunks
- **Threshold**: Not explicitly set (returns top-k)
- **Metadata**: Includes page numbers for source attribution

## Response Format

The system provides:
- Number of relevant documents found
- Page number references for each source
- Contextual answers based on retrieved information
- Clear indication when context doesn't contain relevant information

## Error Handling

- **File Loading**: Graceful handling of missing PDF files
- **API Errors**: Proper error messages for OpenAI and Qdrant failures
- **Empty Queries**: Validation for user input
- **Connection Issues**: Network error handling for external services

## Extending the System

### Adding New Document Types
1. Import appropriate LangChain loaders (TextLoader, CSVLoader, etc.)
2. Update the loader configuration in `indexing.ts`
3. Adjust text splitting parameters if needed

### Customizing Retrieval
- Modify similarity search parameters (k-value, score threshold)
- Adjust chunk overlap and size for different document types
- Implement different embedding models

### Advanced Features
- **Multi-document Support**: Index multiple documents in the same collection
- **Metadata Filtering**: Add filters based on document metadata
- **Conversation Memory**: Maintain chat history for follow-up questions
- **Re-ranking**: Implement secondary ranking of retrieved results

## Performance Considerations

### Indexing Performance
- Large PDFs may take time to process
- Consider batching for multiple documents
- Monitor embedding API rate limits

### Query Performance
- Similarity search is typically sub-second
- Consider caching for repeated queries
- Optimize Qdrant configuration for your use case

## Limitations

- **Single Document**: Currently configured for one PDF file
- **Static Collection**: No dynamic document updates
- **Basic Chunking**: Uses character-based splitting only
- **Single Session**: No conversation history persistence
- **Language**: Optimized for English text processing

## Future Enhancements

- Multi-document indexing and querying
- Dynamic document updates and re-indexing
- Conversation history and context awareness
- Advanced chunking strategies (semantic, paragraph-based)
- Document metadata enrichment and filtering
- Performance metrics and query analytics