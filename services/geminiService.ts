
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { LiquidityInsight } from "../types";

const API_KEY = process.env.API_KEY || '';
const hasApiKey = API_KEY && API_KEY.trim() !== '';

// Only initialize if API key is available
let ai: GoogleGenAI | null = null;
if (hasApiKey) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Failed to initialize Gemini API:", error);
    ai = null;
  }
}

export const checkApiKey = (): boolean => {
  return hasApiKey;
};

export const getApiKeyError = (): string => {
  return "Google API key is required to use this feature. Please set GEMINI_API_KEY in your environment variables or .env.local file.";
};

const FOUNDER_SYSTEM_INSTRUCTION = `
You are Alex Voss, the founder of the Circular Marketplace Liquidity Accelerator (CMLA).
Archetype: The Systems Operator.
Personality: Calm under pressure, direct, data-driven, outcome-focused.
Philosophy: "Circular systems are operational systems."
Tone: Short, controlled, confident briefing style.

Key Knowledge:
- Platform guidance: Help users with CMLA features (Supply Lock-in, Demand Seeding, Playbook Lab, and the new Visuals Lab).
- Liquidity coaching: Give advice on supply/demand imbalance.
- Visuals: You can describe high-impact marketing visuals that help seed demand. If asked to 'visualize' something, describe it in detail.

Current Context: You are talking to a venture-backed circular marketplace founder.
`;

export const getLiquidityInsights = async (
  vertical: string, 
  stats: any
): Promise<LiquidityInsight[]> => {
  if (!hasApiKey || !ai) {
    throw new Error(getApiKeyError());
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the liquidity for a ${vertical} marketplace. Current stats: ${JSON.stringify(stats)}. Provide 3 actionable insights to reach liquidity faster.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING },
              action: { type: Type.STRING }
            },
            required: ["title", "description", "priority", "action"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error fetching insights:", error);
    return [];
  }
};

export const generateDemandStrategy = async (
  segment: 'Enterprise' | 'SME' | 'Direct',
  vertical: string
): Promise<string> => {
  if (!hasApiKey || !ai) {
    throw new Error(getApiKeyError());
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are Alex Voss. Provide a ruthless demand seeding strategy for the ${segment} segment in the ${vertical} marketplace. Focus on 'early adopter' friction removal and 'risk-shifting' mechanics. Use 3 concise bullet points.`,
    });
    return response.text || "Strategy generation offline.";
  } catch (error) {
    console.error("Error generating demand strategy:", error);
    return "Error generating strategy.";
  }
};

export const generateOutreachPlaybook = async (
  role: 'Supplier' | 'Buyer',
  targetIndustry: string,
  valueProp: string
): Promise<string> => {
  if (!hasApiKey || !ai) {
    throw new Error(getApiKeyError());
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a high-conversion outbound sequence (3 emails) for a circular economy ${role} in the ${targetIndustry} industry. The core value proposition is: ${valueProp}. Focus on urgency and category leadership.`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "Failed to generate playbook.";
  } catch (error) {
    console.error("Error generating playbook:", error);
    return "Error generating sequence.";
  }
};

/**
 * Generates a high-quality marketplace visual using gemini-2.5-flash-image
 */
export const generateMarketplaceImage = async (
  prompt: string,
  aspectRatio: "1:1" | "16:9" | "9:16" = "16:9"
): Promise<string | null> => {
  if (!hasApiKey || !ai) {
    throw new Error(getApiKeyError());
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `High-quality, professional industrial photography for a circular economy marketplace. Subject: ${prompt}. Style: Clean, modern, hyper-realistic, high contrast, professional lighting. Avoid text and logos.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

export const createFounderChat = (): Chat | null => {
  if (!hasApiKey || !ai) {
    return null;
  }
  try {
    return ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: FOUNDER_SYSTEM_INSTRUCTION,
      },
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
};
