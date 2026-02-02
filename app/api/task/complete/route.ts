import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Roadmap } from "@/models/Roadmap";

export async function POST(req: Request) {
  try {
    const { email, roadmapId, month, week, day, taskType } = await req.json();

    await dbConnect();

    // 1. Find the roadmap
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });

    // 2. Find the specific day task object
    const mIndex = roadmap.months.findIndex((m: any) => m.month === month);
    const wIndex = roadmap.months[mIndex].weeks.findIndex((w: any) => w.week === week);
    const dIndex = roadmap.months[mIndex].weeks[wIndex].dailyTasks.findIndex((d: any) => d.day === day);

    if (mIndex === -1 || wIndex === -1 || dIndex === -1) {
      return NextResponse.json({ error: "Task day not found" }, { status: 404 });
    }

    const taskDay = roadmap.months[mIndex].weeks[wIndex].dailyTasks[dIndex];

    // 3. Mark specific subtask as done
    const flag = `completed_${taskType}`;
    if (!taskDay.resources) taskDay.resources = [];

    if (!taskDay.resources.includes(flag)) {
      taskDay.resources.push(flag);
    }

    // 4. Check if ALL 3 are done
    const isAptitudeDone = taskDay.resources.includes("completed_aptitude");
    const isDsaDone = taskDay.resources.includes("completed_dsa");
    const isCoreDone = taskDay.resources.includes("completed_core");

    let streakIncremented = false;

    if (isAptitudeDone && isDsaDone && isCoreDone && !taskDay.isCompleted) {
      taskDay.isCompleted = true; // Mark full day as complete

      // Streak Logic: ONLY runs when the FULL DAY is completed
      const user = await User.findOne({ email });
      if (user) {
        const today = new Date();
        const lastInc = user.lastStreakIncrement ? new Date(user.lastStreakIncrement) : null;

        const isSameDay = lastInc &&
          lastInc.getDate() === today.getDate() &&
          lastInc.getMonth() === today.getMonth() &&
          lastInc.getFullYear() === today.getFullYear();

        if (!isSameDay) {
          user.streak = (user.streak || 0) + 1;
          user.lastStreakIncrement = today;
          streakIncremented = true;

          // Badge: Week Warrior (7 Day Streak)
          if (user.streak >= 7 && !user.badges.includes("streak_7")) {
            user.badges.push("streak_7");
          }
        }

        // Badge: Early Bird (Finished before 9 AM)
        const currentHour = new Date().getHours();
        if (currentHour < 9 && !user.badges.includes("early_bird")) {
          user.badges.push("early_bird");
        }

        user.points = (user.points || 0) + 50; // Bonus for full day
        await user.save();
      }
    }

    // Always update study time (Points for individual tasks could be added here if desired, keeping it simple for now)
    const user = await User.findOne({ email });
    if (user) {
      if (!user.totalStudyTime) {
        user.totalStudyTime = { aptitude: 0, dsa: 0, core: 0 };
      }
      if (taskType === "aptitude") user.totalStudyTime.aptitude += 10;
      if (taskType === "dsa") user.totalStudyTime.dsa += 20;
      if (taskType === "core") user.totalStudyTime.core += 30;

      // Individual task points? User said "only 1 streak boost... points" logic is vague but user focused on streak.
      // Reverting to previous state where maybe points were added? 
      // Safe to give small points for activity, but streak is strictly gated.
      user.points = (user.points || 0) + 10;

      await user.save();
    }

    // Save roadmap
    roadmap.markModified('months');
    await roadmap.save();

    return NextResponse.json({
      success: true,
      dayCompleted: taskDay.isCompleted,
      streakIncremented
    });

  } catch (error) {
    console.error("Task Complete Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
