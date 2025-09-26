import openai from "openai"
import dotenv from "dotenv"

dotenv.config()

const client = new openai({
    apiKey: process.env.OPENAI_SECRET_KEY
});

const response = await client.responses.create({
  model: process.env.OPENAI_MODEL,
  input: "Write a short bedtime story about a unicorn.",
});

console.log(response.output_text);