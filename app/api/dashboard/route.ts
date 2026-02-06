
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

    // RETROACTIVE BADGE CHECK
    let badgeUpdated = false;
    if (user.streak >= 7 && !user.badges.includes("streak_7")) {
      user.badges.push("streak_7");
      badgeUpdated = true;
    }
    if (badgeUpdated) {
      await user.save();
    }

    // Fix query type: Force cast to any to bypass strict type check on filter
    const roadmap = await Roadmap.findOne({ userId: user._id as any, status: 'active' });

    let currentTask = null;

    if (roadmap) {
      // Find the first day that is not fully completed
      let found = false;

      for (const month of roadmap.months) {
        for (const week of month.weeks) {
          for (const day of week.dailyTasks) {
            if (!day.isCompleted) {
              // Manually construct object to avoid .toObject() lint error on subdocument
              currentTask = {
                day: day.day,
                title: day.title,
                description: day.description,
                aptitudeTask: day.aptitudeTask,
                dsaTask: day.dsaTask,
                coreTask: day.coreTask,
                isCompleted: day.isCompleted,
                resources: day.resources,
                month: month.month,
                week: week.week
              };
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }
    }

    // CALCULATE PROGRESS
    let totalDays = 0;
    let completedAptitude = 0;
    let completedDsa = 0;
    let completedCore = 0;

    if (roadmap && roadmap.months) {
      for (const month of roadmap.months) {
        if (!month.weeks) continue;
        for (const week of month.weeks) {
          if (!week.dailyTasks) continue;
          for (const day of week.dailyTasks) {
            totalDays++;
            const res = day.resources || [];
            if (res.includes("completed_aptitude")) completedAptitude++;
            if (res.includes("completed_dsa")) completedDsa++;
            if (res.includes("completed_core")) completedCore++;
          }
        }
      }
    }

    const progress = {
      aptitude: totalDays > 0 ? Math.round((completedAptitude / totalDays) * 100) : 0,
      dsa: totalDays > 0 ? Math.round((completedDsa / totalDays) * 100) : 0,
      core: totalDays > 0 ? Math.round((completedCore / totalDays) * 100) : 0
    };

    return NextResponse.json({
      user: {
        streak: user.streak,
        shields: user.shields,
        points: user.points,
        name: user.name,
        badges: user.badges, // Return badges
        image: user.image,
        totalStudyTime: user.totalStudyTime
      },
      roadmapId: (roadmap as any)?._id,
      currentTask,
      progress
    });

  } catch (error) {
    console.error("Dashboard Data Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
