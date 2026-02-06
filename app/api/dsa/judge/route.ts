
import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { code, problem, language = "javascript" } = await req.json();

    const prompt = `
    You are an automated coding judge.
    
    Problem Title: ${problem.title}
    Problem Description: ${problem.description}
    Data Structures / Constraints: Based on description.
    
    User Submitted Code (${language}):
    ${code}
    
    Task:
    1. Analyze the logic of the user's code.
    2. Verify if it solves the problem correctly.
    3. Check for edge cases and efficiency.
    4. Ignore minor syntax errors if the logic is clearly correct (pseudo-code handling).
    
    Output strictly valid JSON:
    {
      "passed": true/false,
      "feedback": "Short feedback on correctness, time complexity, or bug.",
      "score": 0-100
    }
    `;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(jsonStr));

  } catch (error) {
    console.error("Judge Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
