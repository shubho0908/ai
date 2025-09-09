import openai from "openai"
import dotenv from "dotenv"

dotenv.config()

const client = new openai({
    apiKey: process.env.OPENAI_SECRET_KEY
});

const response = await client.responses.create({
  model: "gpt-5-nano-2025-08-07",
  input: "Write a short bedtime story about a unicorn.",
});

console.log(response.output_text);