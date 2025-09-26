import readline from "readline";
import { createResearchWorkflow } from "./workflow.js";

async function handleUserQuery(query: string) {
  console.log(`\n🚀 Starting research workflow for: "${query}"`);
  
  const workflow = createResearchWorkflow();
  
  const result = await workflow.invoke({
    query: query,
  });

  console.log("\n" + "=".repeat(60));
  console.log("📋 FINAL RESULT:");
  console.log("=".repeat(60));
  console.log(result.finalResponse);
  console.log("=".repeat(60));
  
  return result;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🔬 Research Workflow System");
console.log("=" .repeat(40));

rl.question("Enter your query: ", async (query) => {
  try {
    await handleUserQuery(query);
  } catch (error) {
    console.error("❌ Error:", error);
  }
  rl.close();
});

export { handleUserQuery };