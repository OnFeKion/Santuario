import { AnalysisResult } from "../types";

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const commaIndex = result.indexOf(",");
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      } else {
        reject(new Error("Falha ao ler áudio gravado."));
      }
    };
    reader.onerror = () => reject(new Error("Erro ao converter áudio."));
    reader.readAsDataURL(blob);
  });
}

export async function analyzeMoodFromAudio(
  audioBlob?: Blob | null,
  clientTranscription?: string
): Promise<AnalysisResult> {
  try {
    let audioBase64 = "";
    let mimeType = "audio/webm";

    if (audioBlob && audioBlob.size > 0) {
      mimeType = audioBlob.type || "audio/webm";
      audioBase64 = await blobToBase64(audioBlob);
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audioBase64,
        mimeType,
        transcription: clientTranscription?.trim() || "",
      }),
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (response.ok && data) {
      return data as AnalysisResult;
    }

    if (response.status === 404 || response.status === 405) {
      return {
        notHeard: false,
        errorCode: "API_UNAVAILABLE",
        error:
          "A rota /api/analyze não foi encontrada neste servidor. Verifique se o backend ou as Serverless Functions (/api) estão publicadas corretamente.",
      };
    }

    if (data && (data.error || data.notHeardMessage)) {
      return {
        notHeard: Boolean(data.notHeard),
        notHeardMessage: data.notHeardMessage,
        errorCode: data.errorCode || "ANALYSIS_FAILED",
        error: data.error,
      };
    }

    return {
      notHeard: false,
      errorCode: "ANALYSIS_FAILED",
      error: `Erro HTTP ${response.status} ao comunicar com o servidor de análise.`,
    };
  } catch (err: any) {
    return {
      notHeard: false,
      errorCode: "NETWORK_ERROR",
      error:
        "Não foi possível conectar ao servidor de análise. Verifique sua conexão com a internet e tente novamente.",
    };
  }
}
