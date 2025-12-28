
import { GoogleGenAI, Type } from "@google/genai";
import { SongData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const songSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    artist: { type: Type.STRING },
    vibrationPattern: {
      type: Type.ARRAY,
      items: { type: Type.NUMBER },
      description: "Sequence of alternating [vibration_ms, pause_ms]. MUST follow a percussive logic."
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4 options including the correct one. Make them plausible within the same genre."
    }
  },
  required: ["title", "artist", "vibrationPattern", "options"]
};

export const getSongChallenge = async (customQuery?: string, useThinking: boolean = false): Promise<SongData> => {
  const modelName = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    responseMimeType: "application/json",
    responseSchema: songSchema,
    systemInstruction: `You are a World-Class Haptic Composer.
    
    TASK: Convert a song's iconic percussion or vocal rhythm into a vibration pattern.
    
    PATTERN FORMAT: [Vibrate_ms, Pause_ms, Vibrate_ms, Pause_ms...]
    
    RHYTHM DICTIONARY:
    - Kick/Bass: 400-600ms (Heavy)
    - Snare/Clap: 150-250ms (Sharp)
    - Hi-Hat/Ghost Note: 50-100ms (Rapid)
    - Syncopated Gaps: 300-900ms
    
    STRICT RULE: The pattern must be recognizable. If the user provides a genre/artist, pick their most rhythmically famous song.
    
    Example: 'Another One Bites the Dust' by Queen.
    Pattern: [500, 200, 500, 200, 500, 400, 500, 100, 500, 1200]`
  };

  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const prompt = customQuery 
    ? `Create a haptic challenge based on: "${customQuery}". If it's a genre or artist, pick a specific famous song.`
    : "Pick a random globally famous pop, rock, or electronic song with a very distinct drum loop.";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: config,
  });

  try {
    const data = JSON.parse(response.text);
    if (data.vibrationPattern.length % 2 !== 0) {
        data.vibrationPattern.push(800); 
    }
    return data;
  } catch (e) {
    console.error("Gemini Parsing Error:", e);
    return {
      title: "Uptown Funk",
      artist: "Mark Ronson ft. Bruno Mars",
      vibrationPattern: [200, 150, 200, 400, 600, 650, 200, 150, 200, 950],
      options: ["Uptown Funk", "Treasure", "24K Magic", "Locked Out of Heaven"]
    };
  }
};
