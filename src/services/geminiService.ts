import { GoogleGenAI } from "@google/genai";
import { HealthData } from "./healthSimulation";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getHealthInsights = async (history: HealthData[]) => {
  if (!process.env.GEMINI_API_KEY) {
    return "Gemini API key is not configured. Please add it in the settings.";
  }

  const recentData = history.slice(-10);
  const prompt = `
    Analyze the following health data from a wearable device and provide a brief, professional health insight and one recommendation.
    
    Data History (last 10 readings):
    ${JSON.stringify(recentData.map(d => ({
      hr: d.heartRate,
      spo2: d.spo2,
      temp: d.temperature,
      steps: d.steps
    })))}
    
    Current Status:
    - Heart Rate: ${recentData[recentData.length-1].heartRate} BPM
    - SpO2: ${recentData[recentData.length-1].spo2}%
    - Temperature: ${recentData[recentData.length-1].temperature}°C
    - Steps: ${recentData[recentData.length-1].steps}
    
    Format the response as a short paragraph. Keep it under 100 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to Gemini API. Please try again later.";
  }
};
