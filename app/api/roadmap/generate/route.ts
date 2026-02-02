
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Roadmap } from "@/models/Roadmap";
import { generateRoadmap } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if roadmap already exists
    const existingRoadmap = await Roadmap.findOne({ userId: user._id as any, status: 'active' });
    if (existingRoadmap) {
      return NextResponse.json({ message: "Roadmap already exists", roadmapId: (existingRoadmap as any)._id }, { status: 200 });
    }

    // Generate Roadmap via AI
    const profile = {
      targetRole: user.targetRole || "Software Developer",
      coreSkill: user.coreSkill || "General Programming",
      currentLevel: user.currentLevel || "Beginner",
      dailyStudyTime: user.dailyStudyTime || 60,
      goalTimeline: user.goalTimeline || "3 months"
    };

    const roadmapData = await generateRoadmap(profile);

    // Save to DB
    const newRoadmap = await Roadmap.create({
      userId: user._id as any,
      role: user.targetRole,
      months: roadmapData.months
    });

    return NextResponse.json(
      { message: "Roadmap generated successfully", roadmapId: (newRoadmap as any)._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Roadmap Generation API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
