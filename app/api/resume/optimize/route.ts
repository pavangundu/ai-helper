import { getGeminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { resumeData, jobDescription } = await req.json();

    if (!resumeData || !jobDescription) {
      return NextResponse.json(
        { error: "Missing resume data or job description" },
        { status: 400 }
      );
    }

    const prompt = `
        You are an expert Resume Optimizer. Your task is to tailor the provided Resume JSON to the specific Job Description (JD).

        **JOB DESCRIPTION:**
        "${jobDescription}"

        **CURRENT RESUME JSON:**
        ${JSON.stringify(resumeData)}

        **INSTRUCTIONS:**
        1. **OBJECTIVE**: Rewrite the 'careerObjective' to align with the JD's keywords and role requirements.
        2. **SKILLS**: Update the 'skills' to be an ARRAY of objects: [{ "category": "Category Name", "items": "Skill1, Skill2" }].
          - Create logical categories (e.g., "Languages", "Web Technologies", "Tools"). 
          - Reorder/Add skills relevant to the JD.
        3. **PROJECTS**: Update 'projects' to be an ARRAY of objects: [{ "name": "Project Name", "date": "Date", "points": ["Bullet 1", "Bullet 2"] }].
          - **If projects exist**: Optimize the 'points' array to match JD keywords.
          - **If projects are EMPTY**: GENERATE 2-3 relevant projects. Include realistic 'name', 'date', and 3-4 strong 'points'.
        4. **CERTIFICATIONS**:
          - **If certifications exist**: Reorder for relevance to JD.
          - **If certifications are EMPTY**: SUGGEST 2-3 standard certifications (e.g., AWS, Azure, Google, Meta, etc.) that are highly relevant to the JD.
        5. **DO NOT CHANGE**: 
          - 'fullName', 'email', 'phone', 'linkedin', 'github' (Keep these as provided, even if empty).
          - 'education' array.
        
        **OUTPUT:**
        - Return ONLY the valid JSON object of the updated resume. DONT use markdown code blocks.
        - Ensure 'points' in projects is ALWAYS an array of strings.
      `;

    const apiKey = req.headers.get("x-gemini-api-key") || undefined;
    const model = getGeminiModel(apiKey);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI Raw Response:", text);

    // Cleanup markdown if present
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // Validate JSON
    try {
      const optimizedResume = JSON.parse(cleanedText);
      return NextResponse.json(optimizedResume);
    } catch (e) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json({ error: "AI produced invalid JSON. Check server logs." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Optimization Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to optimize resume" },
      { status: 500 }
    );
  }
}
