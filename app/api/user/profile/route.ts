
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Roadmap } from "@/models/Roadmap";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { email, ...updateData } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required to identify user" },
        { status: 400 }
      );
    }

    // Force reset of progress stats
    const resetData = {
      ...updateData,
      streak: 0,
      shields: 0,
      points: 0,
      totalStudyTime: { aptitude: 0, dsa: 0, core: 0 },
      lastActiveDate: new Date() // Reset active date to now
    };

    const user = await User.findOneAndUpdate(
      { email },
      { $set: resetData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete existing roadmaps to trigger regeneration
    await Roadmap.deleteMany({ userId: user._id as any });

    return NextResponse.json(
      { message: "Profile updated and progress reset successfully", user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { error: `Profile Update Failed: ${error.message}` },
      { status: 500 }
    );
  }
}
