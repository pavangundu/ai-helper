import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Roadmap } from "@/models/Roadmap";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Delete the User
    await User.deleteOne({ email });

    // 3. Delete associated Roadmaps
    await Roadmap.deleteMany({ userId: user._id as any });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });

  } catch (error) {
    console.error("Delete Account Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
