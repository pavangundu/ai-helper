
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    // We can't list models directly via the simple SDK wrapper easily in all versions, 
    // but we can try a fetch to the REST API directly to be sure.

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    return NextResponse.json({
      models: data,
      keyConfigured: !!apiKey,
      keyLength: apiKey.length
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
