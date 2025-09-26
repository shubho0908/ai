import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ResearchState } from "./types.js";
import { baseModel, modelWithTools, toolNode } from "./models.js";
import { addThinkingStep, callAndValidate } from "./utils.js";
import {
  researchGatePrompt,
  llmSystemPrompt,
  evalSystemPrompt
} from "./prompts.js";
import { ResearchGateSchema, LLMOutputSchema, EvalOutputSchema } from "./types.js";

interface SearchResult {
  query: string;
  numResults: number;
  responseTime: number;
}

export async function researchGateNode(state: typeof ResearchState.State) {
  let thinking = addThinkingStep(
    state,
    'researchGate',
    'initialization',
    `Starting evaluation of query: "${state.query}"`
  );

  console.log("\n🧠:", thinking["researchGate"].steps[0].content);


  // Analyze query complexity
  thinking = addThinkingStep(
    state,
    'researchGate',
    'analysis',
    'Analyzing query characteristics:\n• Length and complexity\n• Domain specificity\n• Temporal requirements\n• Knowledge type needed'
  );

  console.log("\n🧠:", thinking["researchGate"].steps[0].content);


  thinking = addThinkingStep(
    state,
    'researchGate',
    'decision_making',
    'Determining if this query requires:\n• Real-time/current information\n• Specialized domain knowledge\n• Multiple source validation\n• Or can be answered from existing knowledge'
  );

  console.log("\n🧠:", thinking["researchGate"].steps[0].content);


  const gateResult = await callAndValidate(
    baseModel,
    researchGatePrompt,
    ResearchGateSchema,
    state.query
  );

  // Add decision reasoning
  thinking = addThinkingStep(
    state,
    'researchGate',
    'decision',
    `Decision: ${gateResult.shouldResearch ? 'RESEARCH REQUIRED' : 'DIRECT LLM SUFFICIENT'}\n\nReasoning: ${gateResult.reason}`
  );
  console.log("\n🧠:", thinking["researchGate"].steps[0].content);

  thinking = addThinkingStep(
    state,
    'researchGate',
    'completion',
    `Gate evaluation complete. Next step: ${gateResult.shouldResearch ? 'Proceed to research planning' : 'Direct to LLM response'}`
  );

  console.log("\n🧠:", thinking["researchGate"].steps[0].content);

  return {
    shouldResearch: gateResult.shouldResearch,
    gateReason: gateResult.reason,
  };
}

export async function directLLMNode(state: typeof ResearchState.State) {
  let thinking = addThinkingStep(
    state,
    'directLLM',
    'initialization',
    `Generating direct response for: "${state.query}"\n\nThis query was deemed suitable for direct LLM response because: ${state.gateReason || 'No research required'}`
  );

  console.log("\n🧠:", thinking["directLLM"].steps[0].content);


  thinking = addThinkingStep(
    state,
    'directLLM',
    'processing',
    'Accessing internal knowledge base and generating comprehensive response...'
  );

  console.log("\n🧠:", thinking["directLLM"].steps[0].content);

  const llmResult = await callAndValidate(
    baseModel,
    llmSystemPrompt,
    LLMOutputSchema,
    state.query
  );

  thinking = addThinkingStep(
    state,
    'directLLM',
    'assessment',
    `Response generated with confidence level: ${llmResult.confidence}\n\nValidating response quality and completeness...`
  );

  console.log("\n🧠:", thinking["directLLM"].steps[0].content);


  thinking = addThinkingStep(
    state,
    'directLLM',
    'completion',
    `Direct LLM response complete. Response length: ${llmResult.answer.length} characters`
  );

  console.log("\n🧠:", thinking["directLLM"].steps[0].content);

  return {
    finalResponse: llmResult.answer,
  };
}

export async function researchPlanningNode(state: typeof ResearchState.State) {

  let thinking = addThinkingStep(
    state,
    'researchPlanning',
    'initialization',
    `Planning research strategy for: "${state.query}"\n\nQuery requires research because: ${state.gateReason || 'Complex information needed'}`
  );

  console.log("\n🧠:", thinking["researchPlanning"].steps[0].content);

  thinking = addThinkingStep(
    state,
    'researchPlanning',
    'strategy',
    'Developing research strategy:\n• Identifying key concepts to search\n• Determining search query variations\n• Planning information synthesis approach'
  );
  console.log("\n🧠:", thinking["researchPlanning"].steps[0].content);


  thinking = addThinkingStep(
    state,
    'researchPlanning',
    'query_generation',
    'Generating search queries to cover:\n• Core topic areas\n• Related concepts\n• Current developments\n• Multiple perspectives'
  );

  console.log("\n🧠:", thinking["researchPlanning"].steps[0].content);

  const planningPrompt = `
  Create a research plan for: "${state.query}"
  
  You have access to a search tool. Based on the query, determine what searches need to be performed.
  Use the tavily_search_results_json tool to search for relevant information.
  
  Make sure to call the search tool with appropriate queries to gather comprehensive information.
  `;

  const response = await modelWithTools.invoke([
    new SystemMessage("You are a research planner. Use the search tool to gather information for the user's query."),
    new HumanMessage(planningPrompt),
  ]);

  const toolCallsCount = response.tool_calls?.length || 0;

  thinking = addThinkingStep(
    state,
    'researchPlanning',
    'plan_created',
    `Research plan created with ${toolCallsCount} search operations:\n${response.tool_calls?.map((call, i) => `${i + 1}. ${call.name}: ${JSON.stringify(call.args)}`).join('\n') || 'No tool calls generated'}`
  );

  console.log("\n🧠:", thinking["researchPlanning"].steps[0].content);

  thinking = addThinkingStep(
    state,
    'researchPlanning',
    'completion',
    `Planning complete. Ready to execute ${toolCallsCount} search operations.`
  );

  console.log("\n🧠:", thinking["researchPlanning"].steps[0].content);

  return {
    messages: [response],
  };
}

export async function researchExecutionNode(state: typeof ResearchState.State) {
  let thinking = addThinkingStep(
    state,
    'researchExecution',
    'initialization',
    'Beginning research execution phase...\n\nValidating research plan and preparing to execute searches.'
  );

  console.log("\n🧠:", thinking["researchExecution"].steps[0].content);


  // The ToolNode expects the last message to be an AIMessage with tool_calls
  const lastMessage = state.messages?.[state.messages.length - 1];

  if (!lastMessage?.tool_calls || lastMessage.tool_calls.length === 0) {
    console.log("No tool calls found, skipping tool execution");
    return {
      messages: state.messages || [],
    };
  }

  console.log(`Executing ${lastMessage.tool_calls.length} tool calls...`);

  // Execute the tools
  const toolResults = await toolNode.invoke({
    messages: state.messages || [],
  });

  const searchSummary = toolResults.messages.map((msg: { content: string }) => {
    try {
      const content = JSON.parse(msg.content);
      return {
        query: content.query,
        numResults: content.results?.length || 0,
        responseTime: content.response_time
      } as SearchResult;
    } catch (e) {
      return null;
    }
  }).filter((result: SearchResult | null): result is SearchResult => result !== null);

  const summaryText = searchSummary
    .map((s: SearchResult) => `• Query: "${s.query}" (${s.numResults} results, ${s.responseTime}s)`)
    .join('\n');

  thinking = addThinkingStep(
    state,
    'researchExecution',
    'results_analysis',
    `Search execution completed:\n${summaryText}\n\nPreparing results for evaluation...`
  );

  console.log("\n🧠:", thinking["researchExecution"].steps[0].content);

  thinking = addThinkingStep(
    state,
    'researchExecution',
    'completion',
    `Research execution phase complete. Results ready for quality evaluation.`
  );

  console.log("\n🧠:", thinking["researchExecution"].steps[0].content);

  return {
    messages: [...(state.messages || []), ...toolResults.messages],
  };
}

export async function evaluationNode(state: typeof ResearchState.State) {
  const currentAttempt = (state.attempts || 0) + 1;
  const strictnessLevel = Math.min((state.strictnessLevel || 0) + 1, 2);

  let thinking = addThinkingStep(
    state,
    'evaluation',
    'initialization',
    `Starting evaluation phase (Attempt ${currentAttempt}, Strictness Level ${strictnessLevel})\n\nAssessing research quality and completeness...`
  );

  console.log("\n🧠:", thinking["evaluation"].steps[0].content);

  // Extract search results from messages
  const searchResults = state.messages
    ?.filter(msg => msg._getType() === "tool")
    ?.map(msg => msg.content)
    ?.join("\n");

  if (!searchResults) {
    thinking = addThinkingStep(
      state,
      'evaluation',
      'no_results',
      'No search results found to evaluate. This indicates a research execution failure.'
    );

    console.log("\n🧠:", thinking["evaluation"].steps[0].content);

    thinking = addThinkingStep(
      state,
      'evaluation',
      'retry_decision',
      `Preparing for retry with improved search strategy.\n• Attempt count: ${currentAttempt}\n• Strictness level: ${strictnessLevel}`
    );

    console.log("\n🧠:", thinking["evaluation"].steps[0].content);


    return {
      evalOutput: {
        isRelevant: false,
        feedback: "No search results were obtained",
        rewrittenPrompt: `Please search for information about: ${state.query}`
      },
      attempts: (state.attempts || 0) + 1,
      strictnessLevel: Math.min((state.strictnessLevel || 0) + 1, 2),
    };
  }

  thinking = addThinkingStep(
    state,
    'evaluation',
    'content_analysis',
    `Analyzing search results:\n• Content length: ${searchResults.length} characters\n• Number of sources: ${state.messages?.filter(msg => msg._getType() === "tool").length || 0}\n• Evaluating relevance and completeness...`
  );

  console.log("\n🧠:", thinking["evaluation"].steps[0].content);


  const evalInput = `
  Query: ${state.query}
  Search Results: ${searchResults}
  Current Attempt: ${currentAttempt}
  Strictness Level: ${strictnessLevel}
  
  Evaluate if the search results are relevant and sufficient to answer the query.
  `;

  thinking = addThinkingStep(
    state,
    'evaluation',
    'llm_evaluation',
    `Submitting results to LLM evaluator with:\n• Strictness level ${strictnessLevel}\n• Attempt context: ${currentAttempt}\n• Comprehensive relevance criteria`
  );

  console.log("\n🧠:", thinking["evaluation"].steps[0].content);


  const evalResult = await callAndValidate(
    baseModel,
    evalSystemPrompt,
    EvalOutputSchema,
    evalInput
  );

  thinking = addThinkingStep(
    state,
    'evaluation',
    'evaluation_result',
    `Evaluation complete:\n• Relevant: ${evalResult.isRelevant}\n• Quality assessment: ${evalResult.feedback}\n${evalResult.rewrittenPrompt ? `• Suggested improvement: ${evalResult.rewrittenPrompt}` : ''}`
  );

  console.log("\n🧠:", thinking["evaluation"].steps[0].content);


  thinking = addThinkingStep(
    state,
    'evaluation',
    'decision',
    evalResult.isRelevant
      ? 'Results deemed sufficient. Proceeding to synthesis phase.'
      : `Results insufficient. ${currentAttempt >= 3 ? 'Maximum attempts reached - proceeding with available data.' : 'Preparing for research retry with improved strategy.'}`
  );

  console.log("\n🧠:", thinking["evaluation"].steps[0].content);

  return {
    evalOutput: evalResult,
    attempts: currentAttempt,
    strictnessLevel,
    thinking,
  };
}

export async function synthesisNode(state: typeof ResearchState.State) {
  console.log("\n🔄 Synthesis Node - Creating final response...");

  // Extract search results from messages
  const searchResults = state.messages
    ?.filter(msg => msg._getType() === "tool")
    ?.map(msg => `Search Result: ${msg.content}`)
    ?.join("\n\n");

  const synthesisPrompt = `
  Based on the research conducted, provide a comprehensive answer to: "${state.query}"
  
  ${searchResults ? `Research findings:\n${searchResults}` : 'No search results available.'}
  
  Provide a clear, well-structured response with proper citations where applicable.
  `;

  const response = await baseModel.invoke([
    new SystemMessage("You are a research synthesizer. Create clear, comprehensive responses based on research findings. Cite sources when available."),
    new HumanMessage(synthesisPrompt),
  ]);

  return {
    finalResponse: response.content as string,
  };
}