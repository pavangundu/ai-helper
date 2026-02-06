
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Roadmap } from "@/models/Roadmap";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const roadmap = await Roadmap.findOne({ userId: user._id as any, status: 'active' });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    // Calculate overall progress
    let totalSubTasks = 0;
    let completedSubTasks = 0;

    if (roadmap.months) {
      for (const month of roadmap.months) {
        if (!month.weeks) continue;
        for (const week of month.weeks) {
          if (!week.dailyTasks) continue;
          for (const day of week.dailyTasks) {
            // Each day has 3 tasks: Aptitude, DSA, Core
            totalSubTasks += 3;

            const res = day.resources || [];
            if (res.includes("completed_aptitude")) completedSubTasks++;
            if (res.includes("completed_dsa")) completedSubTasks++;
            if (res.includes("completed_core")) completedSubTasks++;
          }
        }
      }
    }

    const percentCompleted = totalSubTasks > 0
      ? Math.round((completedSubTasks / totalSubTasks) * 100)
      : 0;

    return NextResponse.json({
      roadmap,
      percentCompleted
    });

  } catch (error) {
    console.error("Roadmap Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
