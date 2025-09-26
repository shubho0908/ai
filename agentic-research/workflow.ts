import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchState } from "./types.js";
import {
  researchGateNode,
  directLLMNode,
  researchPlanningNode,
  researchExecutionNode,
  evaluationNode,
  synthesisNode,
} from "./nodes.js";

export function shouldUseResearch(state: typeof ResearchState.State) {
  return state.shouldResearch ? "research_planning" : "direct_llm";
}

export function shouldRetry(state: typeof ResearchState.State) {
  const attempts = state.attempts || 0;
  
  // Always proceed to synthesis after 3 attempts
  if (attempts >= 3) {
    console.log("Maximum attempts reached (3). Proceeding with synthesis.");
    return "synthesis";
  }

  // Retry if evaluation is not relevant and we haven't hit max attempts
  if (!state.evalOutput?.isRelevant) {
    console.log(`Retrying research (attempt ${attempts + 1} of 3)`);
    return "research_planning";
  }

  return "synthesis";
}

export function shouldCallTools(state: typeof ResearchState.State) {
  const lastMessage = state.messages?.[state.messages.length - 1];
  if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
    return "research_execution";
  }
  return "evaluation";
}

export function createResearchWorkflow() {
  const workflow = new StateGraph(ResearchState)
    // Add nodes
    .addNode("research_gate", researchGateNode)
    .addNode("direct_llm", directLLMNode)
    .addNode("research_planning", researchPlanningNode)
    .addNode("research_execution", researchExecutionNode)
    .addNode("evaluation", evaluationNode)
    .addNode("synthesis", synthesisNode)
    
    // Add edges
    .addEdge(START, "research_gate")
    .addConditionalEdges("research_gate", shouldUseResearch)
    .addEdge("direct_llm", END)
    .addConditionalEdges("research_planning", shouldCallTools)
    .addEdge("research_execution", "evaluation")
    .addConditionalEdges("evaluation", shouldRetry)
    .addEdge("synthesis", END);

  return workflow.compile();
}