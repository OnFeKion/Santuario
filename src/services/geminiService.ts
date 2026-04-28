import { GoogleGenAI, Type } from "@google/genai";
import { AROMAS_LIST } from "../constants";
import { AnalysisResult } from "../types";

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string)?.split(',')[1];
      if (base64) resolve(base64);
      else reject("Fail to convert to base64");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function analyzeMoodFromAudio(audioBlob: Blob): Promise<AnalysisResult> {
  const client = getAI();
  const aromasInfo = AROMAS_LIST.map(a => `${a.id}: ${a.name} (${a.category})`).join('\n');
  
  console.log("Iniciando análise nativa de áudio com Gemini 3 Flash...");
  const base64Audio = await blobToBase64(audioBlob);

  const prompt = `
    Analise o áudio anexo e siga estritamente estas etapas:

    1. CLASSIFIQUE o estado emocional predominante (nome do sentimento e uma breve descrição do que foi percebido na voz/fala).
    2. SELECIONE o aroma MAIS adequado da lista abaixo seguindo estas REGRAS DE OURO:
       - NÃO escolha "Lavanda" ou "Alecrim" como padrão. Seja específico.
       - SÓ recomende "Alecrim" se detectar explicitamente baixa energia, cansaço físico ou necessidade de estímulo motor/mental.
       - Se houver esgotamento emocional ou "burnout", priorize aromas restauradores e profundamente calmantes (como Neroli, Melissa ou Sândalo).
    3. EXPLIQUE em exatamente uma linha o porquê da escolha desse aroma para esse estado emocional.
    4. MÉTODOS DE USO: Crie um método personalizado para o usuário utilizar este aroma ao longo do dia, sendo bem específico (ex: "De uma em uma hora, cheire e fungue por 3 segundos até esvaziar o pulmão", "Coloque 2 gotas no pulso a cada 4 horas e respire profundamente"). O método deve focar em como usar o aroma ao decorrer do dia para tratar o estado emocional detectado.
    5. Crie uma FRASE CURTA E BONITA (poética) para o usuário.
    6. Forneça uma TRANSCRIÇÃO fiel do que foi dito.

    Lista de Aromas e Categorias:
    ${aromasInfo}
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: audioBlob.type || "audio/webm",
                data: base64Audio
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionLabel: { type: Type.STRING },
            emotionDescription: { type: Type.STRING },
            aromaId: { type: Type.STRING },
            aromaExplanation: { type: Type.STRING },
            usageMethod: { type: Type.STRING },
            quote: { type: Type.STRING },
            transcription: { type: Type.STRING }
          },
          required: ["emotionLabel", "emotionDescription", "aromaId", "aromaExplanation", "usageMethod", "quote", "transcription"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Resposta vazia da IA");
    
    const parsed = JSON.parse(responseText);
    const selectedAroma = AROMAS_LIST.find(a => a.id === parsed.aromaId) || AROMAS_LIST[0];

    return {
      emotion: {
        label: parsed.emotionLabel,
        description: parsed.emotionDescription
      },
      aroma: selectedAroma,
      aromaExplanation: parsed.aromaExplanation,
      usageMethod: parsed.usageMethod,
      quote: parsed.quote,
      transcription: parsed.transcription
    };
  } catch (error: any) {
    console.error("Erro na análise Gemini:", error);
    return {
      emotion: { label: "Equilíbrio", description: "Pausa necessária para o coração." },
      aroma: AROMAS_LIST[0],
      aromaExplanation: "Escolhemos um aroma suave para trazer estabilidade ao seu momento.",
      usageMethod: "A cada 3 horas, respire calmamente próximo ao aroma por 1 minuto.",
      quote: "Que a suavidade do aroma traga clareza para o seu dia.",
      transcription: "Não foi possível transcrever, mas sua voz foi ouvida e sua energia acolhida."
    };
  }
}
