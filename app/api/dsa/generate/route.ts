
import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
    Generate a unique Coding Interview Problem about "${topic}".
    Difficulty: Medium.
    
    Output strictly valid JSON:
    {
      "title": "Problem Title",
      "difficulty": "Medium",
      "description": "Clear problem statement...",
      "examples": [
        "Input: [1,2,3] -> Output: [1,3,2]",
        "Input: [] -> Output: []"
      ],
      "hint": "One sentence hint.",
      "starterCode": "// function solve(arr) { ... }"
    }
    `;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(jsonStr));

  } catch (error) {
    console.error("DSA Gen Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
