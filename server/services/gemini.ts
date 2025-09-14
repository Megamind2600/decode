import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface QuestionEvaluation {
  score: number;
  positiveComment: string;
  improvementComment: string;
  structureScore: number;
  contentScore: number;
  communicationScore: number;
}

export async function evaluateAnswer(question: string, answer: string, nearest_text: string): Promise<QuestionEvaluation> {
  try {
    const systemPrompt = `You are an expert interview coach and evaluator. 
Analyze the candidate's answer to the interview question and provide detailed feedback.
Rate the answer on a scale of 1-10 and provide constructive feedback.

Evaluate based on:
1. Structure (STAR method, CIRCLE method, AARM method, logical flow)
2. Content (relevant examples, specific details)
3. Communication (clarity, confidence, professionalism)

Respond with JSON in this exact format:
{
  "score": number (1-10),
  "positiveComment": "What the candidate did well",
  "improvementComment": "Areas for improvement and specific suggestions",
  "structureScore": number (1-10),
  "contentScore": number (1-10),
  "communicationScore": number (1-10)
}`;

    const prompt = `Interview Question: ${question}

Candidate's Answer: ${answer}

Text from book decode and conquer relevant to this question: ${nearest_text}

Please evaluate this answer and provide detailed feedback.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            positiveComment: { type: "string" },
            improvementComment: { type: "string" },
            structureScore: { type: "number" },
            contentScore: { type: "number" },
            communicationScore: { type: "number" },
          },
          required: ["score", "positiveComment", "improvementComment", "structureScore", "contentScore", "communicationScore"],
        },
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const evaluation: QuestionEvaluation = JSON.parse(rawJson);
      // Ensure scores are within valid range
      evaluation.score = Math.max(1, Math.min(10, evaluation.score));
      evaluation.structureScore = Math.max(1, Math.min(10, evaluation.structureScore));
      evaluation.contentScore = Math.max(1, Math.min(10, evaluation.contentScore));
      evaluation.communicationScore = Math.max(1, Math.min(10, evaluation.communicationScore));
      return evaluation;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Failed to evaluate answer:", error);
    // Return a default evaluation in case of error
    return {
      score: 5,
      positiveComment: "Thank you for your response. We're having technical difficulties with the evaluation system, but we appreciate your effort.",
      improvementComment: "Please try again later when our evaluation system is fully operational.",
      structureScore: 5,
      contentScore: 5,
      communicationScore: 5,
    };
  }
}
