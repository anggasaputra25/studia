import { GoogleGenAI } from "@google/genai";


export const genAI = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
})