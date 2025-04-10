import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client with AIMLAPI
const client = new OpenAI({
  baseURL: "https://api.aimlapi.com/v1",
  apiKey: process.env.AIMLAPI_KEY || "",
})

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ success: false, message: "Image data is required" }, { status: 400 })
    }

    // For production, you would use a vision model to validate the image
    // Here's how you could do it with AIMLAPI's vision capabilities:
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an agricultural image validator. Your task is to determine if an image shows a crop or plant that could be analyzed for agricultural purposes.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Is this image of a crop or plant that could be analyzed for agricultural purposes? Answer only with 'yes' or 'no'.",
              },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 10,
      })

      const answer = response.choices[0]?.message?.content?.toLowerCase() || ""
      const isCrop = answer.includes("yes")

      return NextResponse.json({
        success: true,
        isCrop,
      })
    } catch (error) {
      console.error("Error validating with AIMLAPI:", error)
      // Fallback to simple validation if API fails
      return NextResponse.json({
        success: true,
        isCrop: true, // Default to true to allow analysis
      })
    }
  } catch (error) {
    console.error("Error validating crop image:", error)
    return NextResponse.json({ success: false, message: "Failed to validate image" }, { status: 500 })
  }
}
