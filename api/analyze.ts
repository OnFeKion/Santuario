import { analyzeEmotionAndAroma } from "../src/lib/aromaAnalyzer";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb",
    },
  },
};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      notHeard: false,
      errorCode: "METHOD_NOT_ALLOWED",
      error: "Método não permitido. Use POST em /api/analyze.",
    });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const result = await analyzeEmotionAndAroma({
      base64Audio: body?.audioBase64,
      mimeType: body?.mimeType,
      clientTranscription: body?.transcription,
    });

    return res.status(result.status).json(result.body);
  } catch (err: any) {
    return res.status(500).json({
      notHeard: false,
      errorCode: "ANALYSIS_FAILED",
      error: err?.message || "Erro interno ao processar o áudio.",
    });
  }
}
