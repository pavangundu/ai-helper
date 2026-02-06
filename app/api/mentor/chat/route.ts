import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Roadmap } from "@/models/Roadmap";

export async function POST(req: Request) {
  try {
    console.log("Mentor Chat: Request Received");
    const { message, previousMessages, userEmail } = await req.json();

    console.log("Mentor Chat: Connecting DB...");
    await dbConnect();

    // Fetch user context if email provided
    let userContext = "";
    if (userEmail) {
      console.log(`Mentor Chat: API for User ${userEmail}`);
      const user = await User.findOne({ email: userEmail });
      if (user) {
        userContext += `User Name: ${user.name}\nTarget Role: ${user.targetRole}\nCurrent Level: ${user.currentLevel}\nStreak: ${user.streak} days\n`;

        // Get today's task from active roadmap if exists
        const roadmap = await Roadmap.findOne({ userId: user._id as any, status: 'active' });
        if (roadmap) {
          userContext += `They are following a ${user.goalTimeline} roadmap.\n`;
        }
      }
    }

    // Construct history for context
    let history = "";
    if (previousMessages && Array.isArray(previousMessages)) {
      history = previousMessages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    }

    const prompt = `
      You are an expert AI Placement Mentor named "Guide". Your job is to help students with their career preparation.
      
      Student Context:
      ${userContext}
      
      Current Question: "${message}"
      
      Previous conversation:
      ${history}
      
      Guidelines:
      - You KNOW the student's name and goals. Use them to personalize advice.
      - If they ask about coding, provide code examples and explanations.
      - If they feel demotivated, provide encouragement based on their streak.
      - Be concise, professional, and friendly.
      `;

    console.log("Mentor Chat: Calling Gemini...");
    const apiKey = req.headers.get("x-gemini-api-key") || undefined;
    const model = getGeminiModel(apiKey);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Mentor Chat: Gemini Responded");

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error("Mentor Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response" },
      { status: 500 }
    );
  }
}
