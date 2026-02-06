
import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const prompt = `
    Create a 5-question multiple choice aptitude quiz about "${topic}".
    The questions should be suitable for a placement exam (Quantitative/Logical).
    
    Output strictly valid JSON with this format:
    {
      "questions": [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option B",
          "explanation": "Brief explanation of why B is correct."
        }
      ]
    }
    `;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(jsonStr));

  } catch (error: any) {
    console.error("Quiz Gen Error:", error);

    // FALLBACK: If API quota is over (429) or any other error, return mock data
    // so the user can still test the UI.
    const mockQuestions = {
      questions: [
        {
          question: "Which number logically follows this series: 4, 6, 9, 6, 14, 6, ...?",
          options: ["6", "17", "19", "21"],
          correctAnswer: "19",
          explanation: "The series alternates. 4+5=9, 9+5=14, 14+5=19. The number 6 remains constant."
        },
        {
          question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
          options: ["120 metres", "180 metres", "324 metres", "150 metres"],
          correctAnswer: "150 metres",
          explanation: "Speed = (60 * 5/18) m/sec = 50/3 m/sec. Length = Speed * Time = (50/3) * 9 = 150 meters."
        },
        {
          question: "Find the odd one out: 3, 5, 11, 14, 17, 21",
          options: ["21", "17", "14", "3"],
          correctAnswer: "14",
          explanation: "All other numbers are odd numbers. 14 is the only even number."
        },
        {
          question: "If A is the brother of B; B is the sister of C; and C is the father of D, how is D related to A?",
          options: ["Brother", "Sister", "Nephew", "Cannot be determined"],
          correctAnswer: "Cannot be determined",
          explanation: "D's gender is not known. D could be the Nephew or Niece of A."
        },
        {
          question: "A clock is started at noon. By 10 minutes past 5, the hour hand has turned through:",
          options: ["145°", "150°", "155°", "160°"],
          correctAnswer: "155°",
          explanation: "Angle traced by hour hand in 12 hrs = 360°. In 5 hrs 10 min (31/6 hrs), angle = 360/12 * 31/6 = 155°."
        }
      ]
    };

    console.log("Using Mock Data due to API Error");
    return NextResponse.json(mockQuestions);
  }
}
