
import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiModel(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("No API Key provided. Please set GEMINI_API_KEY env var or pass it dynamically.");
  }
  const genAI = new GoogleGenerativeAI(key);
  // "gemini-2.5-flash" is confirmed available for this user key
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

export interface UserProfile {
  targetRole: string;
  coreSkill: string;
  currentLevel: string;
  dailyStudyTime: number;
  goalTimeline: string;
}

export async function generateRoadmap(profile: UserProfile, apiKey?: string) {
  // We limit to 1 month for now to avoid token limits, or we use 1.5-flash which handles more.
  // Let's ask for the full timeline but keep descriptions concise.
  const prompt = `
    Create a complete study roadmap for a "${profile.targetRole}" (Level: ${profile.currentLevel}).
    Focus: ${profile.coreSkill}. Time: ${profile.dailyStudyTime} min/day. Total Duration: ${profile.goalTimeline}.
    
    IMPORTANT: You must generate a roadmap for the ENTIRE duration (${profile.goalTimeline}). 
    If 3 months, generate 3 months. If 6 months, generate 6 months.

    STRICT SYLLABUS (Select topics from here):
    
    1. APTITUDE (Arithmetic & Reasoning):
       - Arithmetic: Time & Distance, Percentages, SI/CI, Profit & Loss, Partnership, Ratio & Proportion, Time & Work, Averages, Mixture & Alligation.
       - Reasoning: Number Series, Coding & Decoding, Directions, Seating Arrangement, Blood Relations, Clocks, Calendars, Counting Figures, Mirror Images, Charts, Simplifications.
    
    2. DSA (Data Structures & Algorithms):
       - Basics, Sorting (Bubble/Merge/Quick), Arrays, Binary Search, Strings, Linked Lists, Recursion, Bit Manipulation, Stack & Queue, Sliding Window, Heaps, Greedy, Trees, BST, Graphs, DP, Tries.

    3. CORE SKILL:
       - Specific to "${profile.coreSkill}" (e.g. if Python -> Syntax, OOPs, Django, etc).

    Ensure:
    - "aptitudeTask": Must be from the APTITUDE list above. (NOT Code).
    - "dsaTask": Must be from the DSA list above.
    - "coreTask": Specific to ${profile.coreSkill}.
    
    Output JSON with this structure:
    {
      "months": [
        {
          "month": 1,
          "weeks": [
            {
              "week": 1,
              "theme": "Theme Name",
              "goals": ["Goal 1"],
              "dailyTasks": [ // 7 days
                {
                  "day": 1,
                  "title": "Task Title",
                  "description": "Brief description",
                  "aptitudeTask": "Topic: General Aptitude / Logic / Verbal (NOT technical code)",
                  "dsaTask": "Topic: Data Structures & Algorithms",
                  "coreTask": "Topic: Core Tech Stack (e.g. React, Python)",
                  "resources": []
                }
              ]
            }
          ]
        }
      ]
    }
    
    CRITICAL:
    - Generate content for ALL months in the timeline.
    - KEEP STRINGS SHORT to prevent timeouts, but cover the full duration.
    - Return ONLY valid JSON.
    `;

  try {
    const model = getGeminiModel(apiKey);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("--- GEMINI RAW RESPONSE ---");
    console.log(text.substring(0, 500) + "..."); // Log first 500 chars
    console.log("---------------------------");

    // Clean up markdown if present
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    // If it's a parsing error, log the invalid JSON
    if (error instanceof SyntaxError) {
      console.error("Invalid JSON received from AI");
    }
    throw new Error("Failed to generate roadmap via AI");
  }
}
