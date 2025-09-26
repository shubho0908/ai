# Agentic Research Workflow

This project implements a sophisticated, multi-step agentic workflow for conducting research based on a user's query. It uses the LangGraph library to create a robust, stateful graph that can dynamically decide whether to perform web research or answer directly from a Large Language Model (LLM). The workflow is designed to be resilient, with built-in evaluation and retry mechanisms to ensure high-quality, relevant results.

## Core Concept

The fundamental idea is to create an autonomous agent that mimics a human research process. When given a query, it doesn't just blindly search the web. Instead, it first assesses the query's nature.
- Is it a simple question that an LLM already knows?
- Or does it require up-to-date information, complex reasoning, or evidence from multiple sources?

Based on this initial assessment, the agent follows one of two paths: a direct answer or a full-fledged research loop.

## The Workflow Graph

The agent's logic is structured as a state graph. Each step in the graph is a "node" that performs a specific task. The agent transitions between these nodes based on the outcome of the previous step.

Here is a simplified visualization of the workflow:

```
[START]
   |
   v
[Research Gate] --(No Research Needed)--> [Direct LLM] --> [END]
   |
(Research Needed)
   |
   v
[Research Planning]
   |
   v
[Research Execution]
   |
   v
[Evaluation] --(Results Insufficient & Retries < 3)--> [Research Planning]
   |
(Results Sufficient or Max Retries)
   |
   v
[Synthesis]
   |
   v
[END]
```

---

## In-Depth Node Descriptions

Each node in the graph has a distinct responsibility.

### 1. `research_gate`
- **Purpose:** The gatekeeper of the workflow. It decides if the user's query warrants external research.
- **Process:**
    - It analyzes the query's characteristics: complexity, need for current information, and domain specificity.
    - It uses an LLM with a specific prompt (`researchGatePrompt`) to make a `true/false` decision on whether to proceed with research.
- **Output:** A boolean `shouldResearch` flag and the reasoning behind the decision.

### 2. `direct_llm`
- **Purpose:** To provide a quick, direct answer for simple queries.
- **Process:**
    - This node is activated if the `research_gate` decides research is unnecessary.
    - It sends the query to a standard LLM (`llmSystemPrompt`) to generate an answer from its internal knowledge.
- **Output:** The final answer to the user's query.

### 3. `research_planning`
- **Purpose:** To create a strategic plan for how to conduct the research.
- **Process:**
    - If the `research_gate` decides research is needed, this node takes over.
    - It breaks down the user's query into key concepts.
    - It uses an LLM equipped with a search tool (`TavilySearch`) to generate a list of precise search queries. This plan is structured as a series of "tool calls."
- **Output:** A list of planned search operations (tool calls) to be executed.

### 4. `research_execution`
- **Purpose:** To execute the search plan and gather information.
- **Process:**
    - This node receives the tool calls from the planning stage.
    - It invokes the `TavilySearch` tool for each query, collecting the results from the web.
- **Output:** A list of search results, which are added to the workflow's state.

### 5. `evaluation`
- **Purpose:** To critically assess the quality and relevance of the gathered research. This is a crucial step for ensuring the final output is reliable.
- **Process:**
    - The node analyzes the content of the search results against the original query.
    - It uses an LLM with a specialized `evalSystemPrompt` to determine if the results are sufficient.
    - **Adaptive Strictness:** The evaluation becomes stricter with each retry. If the first attempt's results are poor, the evaluation criteria for the second attempt are raised, demanding more comprehensive and higher-quality sources.
- **Output:**
    - A boolean `isRelevant` flag.
    - Detailed feedback on the quality of the research.
    - If the results are insufficient, it can even generate a rewritten, improved prompt for the next research attempt.

### 6. `synthesis`
- **Purpose:** To combine the validated research findings into a single, comprehensive answer.
- **Process:**
    - This node is activated once the `evaluation` node confirms the research is satisfactory (or if the maximum number of retries has been reached).
    - It provides an LLM with the original query and all the verified search results.
    - The LLM's task is to synthesize this information into a clear, well-structured, and detailed response.
- **Output:** The final, research-backed answer to the user's query.

---

## Project Structure

- **`index.ts`**: The entry point for running the workflow from the command line.
- **`workflow.ts`**: Defines the `StateGraph` and the conditional logic that dictates the flow between nodes.
- **`nodes.ts`**: Contains the core logic for each of the nodes described above.
- **`models.ts`**: Initializes the `ChatOpenAI` models and the `TavilySearch` tool.
- **`prompts.ts`**: A library of all system prompts used by the LLMs at different stages of the workflow.
- **`types.ts`**: Defines the shape of the workflow's state (`ResearchState`) and the expected schemas for LLM outputs using `zod`.
- **`utils.ts`**: Helper functions, including `callAndValidate` for robustly calling the LLM and parsing its output, and `addThinkingStep` for logging the agent's internal monologue.

## How to Run

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Set up environment variables:**
    - Create a `.env` file in the root of the `agentic-research` directory.
    - Add your OpenAI API key:
      ```
      OPENAI_API_KEY="your_api_key_here"
      ```
3.  **Run the workflow:**
    ```bash
    pnpm research
    ```
    You will be prompted to enter a query. The agent will then execute the workflow and print the final result.
