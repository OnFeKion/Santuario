import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { analyzeEmotionAndAroma } from "./src/lib/aromaAnalyzer";

const PORT = 3000;
const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Servir imagens estáticas de aromas
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));

  // API de análise de relato emocional e aromaterapia exclusivamente via IA
  app.post("/api/analyze", upload.single("audio") as any, async (req: any, res: any) => {
    try {
      let base64Audio = "";
      let mimeType = "audio/webm";
      const clientTranscription = (req.body?.transcription || "").trim();

      if (req.file) {
        base64Audio = req.file.buffer.toString("base64");
        mimeType = req.file.mimetype || "audio/webm";
      } else if (req.body?.audioBase64) {
        base64Audio = req.body.audioBase64;
        mimeType = req.body.mimeType || "audio/webm";
      }

      const result = await analyzeEmotionAndAroma({
        base64Audio,
        mimeType,
        clientTranscription,
      });

      return res.status(result.status).json(result.body);
    } catch (err: any) {
      return res.status(500).json({
        notHeard: false,
        errorCode: "ANALYSIS_FAILED",
        error: err?.message || "Erro interno ao analisar o relato.",
      });
    }
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
