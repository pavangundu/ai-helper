
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API Key required" }, { status: 400 });
    }

    const envPath = path.join(process.cwd(), ".env.local");

    // Read existing file
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    // Check if GEMINI_API_KEY exists
    const keyRegex = /^GEMINI_API_KEY=.*$/m;

    if (keyRegex.test(envContent)) {
      // Replace existing key
      envContent = envContent.replace(keyRegex, `GEMINI_API_KEY=${apiKey}`);
    } else {
      // Append new key
      envContent += `\nGEMINI_API_KEY=${apiKey}`;
    }

    // Write back to file
    fs.writeFileSync(envPath, envContent, "utf-8");

    // Update current process env (though server restart is usually needed for full effect)
    process.env.GEMINI_API_KEY = apiKey;

    return NextResponse.json({ message: "API Key saved globally. Server may restart." });

  } catch (error: any) {
    console.error("Error saving API Key:", error);
    return NextResponse.json({ error: "Failed to save API Key" }, { status: 500 });
  }
}
