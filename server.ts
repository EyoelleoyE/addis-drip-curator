import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Vibe Assistant API with Google Search Grounding for real-time Addis fashion trends
app.post("/api/vibe-assistant", async (req, res) => {
  try {
    const { messages, currentItem } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const client = getGeminiClient();

    // Build the prompt including the current item context if any
    let systemInstruction = `You are "VIBE ASSISTANT", the ultimate high-end streetwear concierge and style curator for "VIBE VAULT", an elite Addis Ababa curated streetwear brand.
Your tone is hyper-premium, sleek, ultra-modern, aesthetic-conscious, and speaks fluent Gen Z streetwear fashion culture (using terms like 'vault', 'drop', 'dripping', 'curation', 'vanity', 'gatekeep', 'fit', 'silhouette').
You are helping Addis Ababa's most stylish clientele curate elite fits.
Provide styling advice, accessory matches, and keep them hyped about status and exclusivity.
Since you represent Addis Ababa elite fashion, understand local context (Addis Ababa, Bole, ETB currency, Ethiopian high fashion scene, custom knitwear, Habesha fabrics fused with street wear) but with a global street-luxury appeal.
Always be helpful, crisp, concise, and incredibly stylish. No emojis except for occasional minimal high-end sparkles or slate icons (✨, ⚡, ✦, 📦). Do not use cheesy conversational filler. Keep it high fashion.`;

    if (currentItem) {
      systemInstruction += `\n\nThe client is currently interested in the following item: "${currentItem.name}" priced at ${currentItem.price} ETB. Help them style this look, suggest what to pair it with (shoes, cargo pants, sunglasses, bucket hats), and convince them to secure it with a status-driven appeal.`;
    }

    // Format history for generateContent
    const contents = messages.map(m => {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      };
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "Connection to the vault was interrupted. Try again, fashionista.";
    
    // Extract grounding URLs if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks ? chunks.map((c: any) => ({
      title: c.web?.title || "Search Source",
      url: c.web?.uri || ""
    })).filter((s: any) => s.url) : [];

    res.json({ text, sources });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred with the Vibe Assistant",
      details: "Check if your GEMINI_API_KEY is configured in Settings > Secrets."
    });
  }
});

// Vite middleware and asset routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vibe Vault custom server listening on port ${PORT}`);
  });
}

startServer();
