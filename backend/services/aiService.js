import OpenAI from "openai";

// Lazily instantiate the OpenAI client only when needed, so the app doesn't crash on boot if the key is missing and the provider is Gemini instead.
let openaiClient = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
};


// Sends the full conversation history to OpenAI's Chat Completions API and returns the assistant's reply text.
// @param {Array<{role: string, content: string}>} history
const getOpenAIReply = async (history) => {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful, friendly AI assistant inside a college demo chat application. Keep answers clear and concise.",
      },
      ...history,
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return completion.choices[0].message.content;
};


// Sends the conversation history to Google's Gemini API using a plain fetch call (keeps the project dependency-light).
/*
@param {Array<{role: string, content: string}>} history
@returns {Promise<string>} the AI's reply text
*/
// A detailed system prompt produces much more accurate, well-structured answers
const GEMINI_SYSTEM_PROMPT = `You are a knowledgeable, helpful, and friendly AI assistant inside a chat application.

Follow these rules for every response:
- Be accurate and factual. If you are unsure about something, say so clearly instead of guessing.
- Be concise but complete — answer the question fully without unnecessary filler sentences.
- Use markdown formatting where it helps readability: use **bold** for key terms, bullet points for lists, and code blocks (\`\`\`) for any code or commands.
- If the user sends a multi-line message, address every part of it.
- Match the language of the user — if they write in Hindi, reply in Hindi; if English, reply in English.
- Be conversational and warm in tone, not robotic.`;

const getGeminiReply = async (history) => {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  // Gemini expects "user"/"model" roles instead of "user"/"assistant"
  const contents = history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // system_instruction sets the AI's behaviour for the whole conversation
      system_instruction: {
        parts: [{ text: GEMINI_SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.4,       
        maxOutputTokens: 2048,  
        topP: 0.9,              
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I could not generate a response.";
};

/**
 * Unified entry point used by the controller. Picks the provider based on the AI_PROVIDER environment variable so the same route code works with either OpenAI or Gemini.
 * @param {Array<{role: string, content: string}>} history - full conversation so far
 * @returns {Promise<string>} the AI's reply text
 */
export const getAIReply = async (history) => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  try {
    if (provider === "gemini") {
      return await getGeminiReply(history);
    }
    return await getOpenAIReply(history);
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw new Error("The AI service is currently unavailable. Please try again later.");
  }
};
