import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: Request) {
  try {
    const { messages, contextInfo }: { messages: ChatMessage[]; contextInfo?: string } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, message: "Messages are required and must be an array" },
        { status: 400 }
      );
    }

    // Construct system + conversation messages
    const formattedMessages: ChatMessage[] = [
      {
        role: "system",
        content: `You are ECO-AGRI BOT, an agricultural assistant helping farmers with eco-friendly farming methods, alternatives to chemical pesticides and fertilizers, and maximizing profits. 
        ${contextInfo || ""}
        Be concise, helpful, and provide practical advice. Greet the user warmly.`,
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: "ft:gpt-4o-mini-2024-07-18:personal:agriculture-llm:BKMfNt6Q",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({
      success: true,
      text: responseText,
    });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate response",
      },
      { status: 500 }
    );
  }
}