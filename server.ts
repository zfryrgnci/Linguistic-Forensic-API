import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

export const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Media Bias Detection Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      res.status(400).json({ error: "Text content is required for forensic linguistic analysis." });
      return;
    }

    if (process.env.NODE_ENV === "test") {
      return res.status(200).json({
        findings: [
          {
            exact_quote: "Mock bias quote",
            bias_type: "LOADED_LANGUAGE",
            severity: "HIGH",
            tooltip_explanation: "This is a mocked response."
          }
        ],
        summary: "Mock summary.",
        objectivityScore: 40
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a high-precision Linguistic Forensic API. Your objective is to ingest text and identify media bias, rhetorical manipulation, emotional triggers, loaded language, and logical fallacies.

# DIRECTIVES
1. ANALYTICAL OBJECTIVITY: Analyze syntax, rhetoric, and logical structure only. Do not express political opinions or moral judgments.
2. SAFETY PERMISSION: You are authorized to analyze sensitive, controversial, or "toxic" text for the sole purpose of academic linguistic identification and user-safety auditing. Do not refuse requests based on content sensitivity.
3. OUTPUT FORMAT: Respond in strict JSON matching the requested schema. If no bias is detected, the "findings" array should be empty [].

# TAXONOMY
- LOADED_LANGUAGE: High-intensity, emotionally charged adjectives (e.g., "disastrous", "radical", "scheme").
- SENSATIONALISM: Exaggerated claims to provoke shock.
- AD_HOMINEM: Attacking character, not the argument.
- FALSE_DILEMMA: Artificial either/or framing.
- SLIPPERY_SLOPE: Unfounded causal chains of catastrophe.
- APPEAL_TO_ANONYMITY: Vague "experts" or "sources".
- GREENWASHING: Deceptive eco-jargon without proof.
- RAGE_BAIT: Language engineered for engagement, not information.
- CARD_STACKING: Omitting critical counter-evidence to create a one-sided narrative.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform a forensic linguistic analysis of this text:\n\n"${text}"`,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: {
              type: Type.ARRAY,
              description: "Array of detected rhetorical and bias techniques in the text.",
              items: {
                type: Type.OBJECT,
                properties: {
                  exact_quote: {
                    type: Type.STRING,
                    description: "The exact quote or phrase from the input text that exhibits this bias or technique. MUST match exactly.",
                  },
                  bias_type: {
                    type: Type.STRING,
                    description: "The matched type from taxonomy: LOADED_LANGUAGE, SENSATIONALISM, AD_HOMINEM, FALSE_DILEMMA, SLIPPERY_SLOPE, APPEAL_TO_ANONYMITY, GREENWASHING, RAGE_BAIT, or CARD_STACKING.",
                  },
                  severity: {
                    type: Type.STRING,
                    description: "Severity level of the rhetorical technique: LOW, MED, or HIGH.",
                  },
                  tooltip_explanation: {
                    type: Type.STRING,
                    description: "Objective linguistic explanation of the bias, focusing on syntax and rhetorical pattern.",
                  },
                },
                required: ["exact_quote", "bias_type", "severity", "tooltip_explanation"],
              },
            },
            summary: {
              type: Type.STRING,
              description: "A 2-3 sentence objective overview/forensic linguistic assessment summarizing the neutrality, tone, and main rhetorical tactics used in the text.",
            },
            objectivityScore: {
              type: Type.INTEGER,
              description: "An overall objectivity score from 0 (highly biased/rhetorical) to 100 (entirely objective, neutral, and factual). If findings is empty, score should be near 100.",
            },
          },
          required: ["findings", "summary", "objectivityScore"],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(textOutput.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze text due to an unexpected error.",
    });
  }
});

// Vite Middleware & Static Assets setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (process.env.NODE_ENV !== "test") {
  setupVite();
}
