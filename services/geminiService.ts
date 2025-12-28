
import { GoogleGenAI, Type } from "@google/genai";
import { SongData } from "../types";

/**
 * Serviço de Integração com Gemini API
 * Responsável por traduzir conceitos musicais em sequências de milissegundos
 * que o motor de vibração do hardware possa interpretar.
 */

// Em ambiente Vite, usamos import.meta.env.VITE_GEMINI_API_KEY
// Fallback para process.env para compatibilidade com outros ambientes
const API_KEY = (import.meta.env?.VITE_GEMINI_API_KEY as string) || (process.env.API_KEY as string) || "";

const genAI = new GoogleGenAI(API_KEY);

const songSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Nome oficial da música" },
    artist: { type: Type.STRING, description: "Nome do artista ou banda" },
    vibrationPattern: {
      type: Type.ARRAY,
      items: { type: Type.NUMBER },
      description: "Sequência alternada [Vibração_ms, Pausa_ms]. Use valores >300 para batidas fortes e <150 para batidas rápidas."
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "4 opções de nomes de músicas (1 correta, 3 plausíveis do mesmo gênero)."
    }
  },
  required: ["title", "artist", "vibrationPattern", "options"]
};

export const getSongChallenge = async (customQuery?: string, useThinking: boolean = false): Promise<SongData> => {
  // Seleção dinâmica de modelo baseada na complexidade
  // gemini-2.0-flash-thinking-exp-1219 é o modelo atual com capacidades de raciocínio
  const modelName = useThinking ? 'gemini-2.0-flash-thinking-exp-1219' : 'gemini-2.0-flash';
  
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: songSchema,
    },
    systemInstruction: `Você é um Engenheiro de Haptics especializado em Teoria Musical.
    
    OBJETIVO: Traduzir o 'hook' rítmico mais icônico de uma música para um padrão de vibração.
    
    REGRAS DE COMPOSIÇÃO:
    - KICK (Bumbo): 400ms a 600ms de vibração.
    - SNARE (Caixa): 150ms a 250ms de vibração.
    - HI-HAT (Pratos): 50ms a 100ms de vibração.
    - SILÊNCIO: Use pausas entre 200ms e 800ms para manter o groove.
    
    A saída DEVE ser um loop rítmico reconhecível que capture a 'alma' da percussão da música.`
  });

  const prompt = customQuery 
    ? `Crie um desafio hático baseado na música ou artista: "${customQuery}".`
    : "Escolha uma música pop, rock ou eletrônica mundialmente famosa com um ritmo de bateria muito distinto.";

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const data = JSON.parse(text);
    
    // Garante que o padrão termina em uma pausa para looping suave
    if (data.vibrationPattern.length % 2 !== 0) {
        data.vibrationPattern.push(600); 
    }
    return data;
  } catch (e) {
    console.error("Erro ao processar resposta da IA:", e);
    // Fallback de segurança em caso de erro na geração
    return {
      title: "Another One Bites the Dust",
      artist: "Queen",
      vibrationPattern: [400, 200, 400, 200, 400, 500, 400, 100, 400, 1000],
      options: ["Another One Bites the Dust", "Under Pressure", "We Will Rock You", "Radio Ga Ga"]
    };
  }
};
