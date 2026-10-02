import { AnalysisResult } from "../types";

export async function analyzeMoodFromAudio(
  audioBlob?: Blob | null,
  clientTranscription?: string
): Promise<AnalysisResult> {
  try {
    const formData = new FormData();
    if (audioBlob && audioBlob.size > 0) {
      formData.append("audio", audioBlob, "recording.webm");
    }
    if (clientTranscription && clientTranscription.trim()) {
      formData.append("transcription", clientTranscription.trim());
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return data as AnalysisResult;
    }
  } catch (_) {
    // Falha de rede tratada sem poluir logs
  }

  // Quando não for possível escutar ou analisar, NÃO chuta aromas: pede para repetir
  return {
    notHeard: true,
    notHeardMessage: "Não consegui ouvir ou interpretar o seu relato. Por favor, tente falar novamente mais próximo ao microfone."
  };
}
