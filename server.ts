import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { AROMAS_LIST, OFFICIAL_SENTIMENT_TO_AROMA } from "./src/constants";

const PORT = 3000;
const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 }
});

function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// Formatação da tabela oficial de sentimentos e aromas para o prompt da IA
const EMOTIONS_GUIDE = Object.entries(OFFICIAL_SENTIMENT_TO_AROMA)
  .map(([feeling, aromaId]) => {
    const aroma = AROMAS_LIST.find(a => a.id === aromaId);
    return `- ${feeling} -> ${aroma?.name || aromaId} (id: "${aromaId}")`;
  })
  .join("\n");

const AROMAS_CATALOG = AROMAS_LIST.map(a => 
  `- id: "${a.id}", nome: "${a.name}", categoria: "${a.category}", benefícios: "${a.benefits}"`
).join("\n");

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
      let clientTranscription = (req.body?.transcription || "").trim();

      if (req.file) {
        base64Audio = req.file.buffer.toString("base64");
        mimeType = req.file.mimetype || "audio/webm";
      } else if (req.body?.audioBase64) {
        base64Audio = req.body.audioBase64;
        mimeType = req.body.mimeType || "audio/webm";
      }

      // Se não há texto e não há áudio, ou áudio é menor que cabeçalho vazio (menos de 800 bytes)
      const hasAudio = base64Audio && base64Audio.length > 1000;
      const hasText = clientTranscription.length > 0;

      if (!hasAudio && !hasText) {
        return res.json({
          notHeard: true,
          notHeardMessage: "Não consegui ouvir nada. Por favor, grave novamente falando mais perto do microfone."
        });
      }

      const client = getAI();
      if (!client) {
        return res.json({
          notHeard: true,
          notHeardMessage: "Serviço de inteligência temporariamente indisponível. Por favor, tente novamente em instantes."
        });
      }

      const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest"];

      for (const modelName of candidateModels) {
        try {
          const parts: any[] = [];

          if (hasAudio) {
            let cleanMimeType = (mimeType || "").split(";")[0].trim().toLowerCase();
            if (!cleanMimeType || cleanMimeType === "application/octet-stream") {
              cleanMimeType = "audio/webm";
            }
            parts.push({
              inlineData: {
                mimeType: cleanMimeType,
                data: base64Audio
              }
            });
          }

          const promptText = `
Você é um aromaterapeuta e terapeuta integrativo de alta sensibilidade e escuta profunda.
Sua missão é ESCUTAR e INTERPRETAR profundamente o estado emocional e mental da pessoa ATRAVÉS DA IA (compreensão semântica, tom de voz, pausas e sentimentos expressos), NUNCA por regras mecânicas de palavras-chave.

${hasText ? `O usuário transcreveu ou digitou o seguinte relato: "${clientTranscription}"` : 'Ouça atentamente o áudio anexo gravado pelo usuário.'}

DIRETRIZES DE ESCUTA E DECISÃO:
1. SE NÃO CONSEGUIR ESCUTAR OU COMPREENDER NADA:
   - Se o áudio for silêncio, ruído ambiente sem palavras, respiração vazia, inaudível, ou se o usuário não falou nada compreensível:
   - NÃO CHUTE NENHUM AROMA! Você DEVE pedir para a pessoa repetir.
   - Responda estritamente:
   {
     "notHeard": true,
     "notHeardMessage": "Não consegui ouvir ou compreender o que você disse. Por favor, tente gravar novamente falando com calma mais próximo ao microfone."
   }

2. SE HOUVER RELATO COMPREENSÍVEL:
   - Defina "notHeard": false.
   - Forneça a transcrição fiel do que a pessoa expressou.
   - Identifique com profundidade o sentimento/emoção vivido (ex: Ansiedade, Cansaço, Desânimo, Foco, Raiva, Solidão, Tristeza, Culpa, etc.).
   - SELECIONE O AROMA PRINCIPAL RIGOROSAMENTE DA TABELA OFICIAL ABAIXO.
   - O "aromaId" DEVE ser obrigatoriamente um dos 27 IDs da lista.

TABELA OFICIAL DE CORRESPONDÊNCIA (SENTIMENTO -> AROMA):
${EMOTIONS_GUIDE}

LISTA COMPLETA DOS 27 AROMAS VÁLIDOS:
${AROMAS_CATALOG}

3. 3 ALTERNATIVAS COMPLEMENTARES:
   - Selecione exatamente 3 outros aromas diferentes do principal, escolhidos estritamente entre os 27 da lista, justificando o benefício terapêutico complementar de cada um para o momento da pessoa.

4. RITUAL E MÉTODO DE USO:
   - Instrução prática e reconfortante de como inalar ou usar o aroma ao longo do dia.

5. FRASE INSPIRADORA:
   - Uma mensagem poética, acolhedora e positiva sobre o estado da pessoa.

RESPONDA EXCLUSIVAMENTE EM FORMATO JSON:
{
  "notHeard": false,
  "transcription": "string com o que a pessoa falou",
  "emotionLabel": "string com a sensação ou emoção identificada",
  "emotionDescription": "string acolhedora descrevendo o que a pessoa está sentindo",
  "aromaId": "id do aroma principal escolhido estritamente da lista",
  "aromaExplanation": "explicação terapêutica sensível e personalizada de como este aroma ajuda neste momento",
  "alternativeAromas": [
    { "aromaId": "id da alternativa 1", "reason": "motivo terapêutico" },
    { "aromaId": "id da alternativa 2", "reason": "motivo terapêutico" },
    { "aromaId": "id da alternativa 3", "reason": "motivo terapêutico" }
  ],
  "usageMethod": "string com o ritual de uso recomendado",
  "quote": "string com frase poética e acolhedora"
}
`;
          parts.push({ text: promptText });

          const response = await Promise.race([
            client.models.generateContent({
              model: modelName,
              contents: [{ parts }],
              config: {
                responseMimeType: "application/json"
              }
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 14000))
          ]);

          const responseText = response.text;
          if (!responseText) continue;

          const parsed = JSON.parse(responseText);

          // Se a IA determinou que não foi possível ouvir nada ou está vazio
          if (parsed.notHeard === true) {
            return res.json({
              notHeard: true,
              notHeardMessage: parsed.notHeardMessage || "Não consegui ouvir ou compreender o que você disse. Por favor, tente gravar novamente."
            });
          }

          if (!parsed.aromaId || !parsed.emotionLabel) {
            continue;
          }

          const selectedAroma = AROMAS_LIST.find(a => a.id === parsed.aromaId) || AROMAS_LIST[0];

          const alternatives: Array<{ aroma: any; reason: string }> = [];
          if (Array.isArray(parsed.alternativeAromas)) {
            for (const alt of parsed.alternativeAromas) {
              if (alt?.aromaId && alt.aromaId !== selectedAroma.id && !alternatives.some(a => a.aroma.id === alt.aromaId)) {
                const found = AROMAS_LIST.find(a => a.id === alt.aromaId);
                if (found) {
                  alternatives.push({
                    aroma: found,
                    reason: alt.reason || found.benefits
                  });
                }
              }
            }
          }

          // Garante exatamente 3 alternativas distintas
          if (alternatives.length < 3) {
            for (const extra of AROMAS_LIST) {
              if (alternatives.length >= 3) break;
              if (extra.id !== selectedAroma.id && !alternatives.some(alt => alt.aroma.id === extra.id)) {
                alternatives.push({
                  aroma: extra,
                  reason: extra.benefits
                });
              }
            }
          }

          const finalTranscription = parsed.transcription || clientTranscription || "Relato de voz acolhido com sucesso.";

          return res.json({
            notHeard: false,
            emotion: {
              label: parsed.emotionLabel,
              description: parsed.emotionDescription || "Sensação acolhida e interpretada pela aromaterapia."
            },
            aroma: selectedAroma,
            aromaExplanation: parsed.aromaExplanation || selectedAroma.benefits,
            alternatives: alternatives.slice(0, 3),
            usageMethod: parsed.usageMethod || "Aplique 2 gotas nos pulsos ou difusor pessoal e inale profundamente 3 vezes ao dia.",
            quote: parsed.quote || "Cada respiração é uma oportunidade de renovar suas energias e encontrar harmonia.",
            transcription: finalTranscription
          });
        } catch (_) {
          // Continua silenciosamente para o próximo modelo candidato
        }
      }

      // Se nenhum modelo conseguiu interpretar ou se o áudio não pôde ser decifrado
      return res.json({
        notHeard: true,
        notHeardMessage: "Não consegui ouvir ou interpretar com clareza o seu relato. Por favor, tente gravar novamente falando mais perto do microfone."
      });
    } catch (_) {
      return res.json({
        notHeard: true,
        notHeardMessage: "Não consegui escutar seu relato. Por favor, tente falar novamente com clareza."
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
