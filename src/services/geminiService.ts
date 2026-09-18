import { AROMAS_LIST } from "../constants";
import { AnalysisResult } from "../types";

const fallbackResult: AnalysisResult = {
  emotion: { label: "Equilíbrio", description: "Pausa necessária para o coração e acolhimento do momento presente." },
  aroma: AROMAS_LIST[0],
  aromaExplanation: "Escolhemos um aroma suave para trazer estabilidade e paz ao seu momento.",
  alternatives: [
    {
      aroma: AROMAS_LIST[1] || AROMAS_LIST[0],
      reason: "Excelente para relaxamento suave e alívio de tensões do cotidiano."
    },
    {
      aroma: AROMAS_LIST[2] || AROMAS_LIST[0],
      reason: "Ajuda a restaurar o equilíbrio e acolhe em momentos de sobrecarga."
    },
    {
      aroma: AROMAS_LIST[3] || AROMAS_LIST[0],
      reason: "Proporciona suavidade e conforto emocional profundo."
    }
  ],
  usageMethod: "A cada 3 horas, respire calmamente próximo ao aroma por 1 minuto.",
  quote: "Que a suavidade do aroma traga clareza para o seu dia.",
  transcription: "Não foi possível transcrever, mas sua voz foi ouvida e sua energia acolhida."
};

export async function analyzeMoodFromAudio(audioBlob: Blob, clientTranscription?: string): Promise<AnalysisResult> {
  try {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    if (clientTranscription && clientTranscription.trim()) {
      formData.append("transcription", clientTranscription.trim());
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.warn(`[Client] Servidor retornou status ${response.status}: ${response.statusText}`);
      return {
        ...fallbackResult,
        transcription: clientTranscription?.trim() || fallbackResult.transcription
      };
    }

    const data = await response.json();
    return data as AnalysisResult;
  } catch (error) {
    console.error("[Client] Erro ao comunicar com /api/analyze:", error);
    return {
      ...fallbackResult,
      transcription: clientTranscription?.trim() || fallbackResult.transcription
    };
  }
}

