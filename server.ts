import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { AROMAS_LIST } from "./src/constants";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function normalizeText(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getAroma(id: string) {
  return AROMAS_LIST.find(a => a.id === id) || AROMAS_LIST[0];
}

// Análise clínica de aromaterapia baseada nas opções reais cadastradas no código
function buildTailoredAnalysis(userSpeechText: string) {
  const norm = normalizeText(userSpeechText);
  const transcription = userSpeechText.trim() || "Relato de voz acolhido com carinho.";

  // 1. Falta de foco / Desfocado / Dispersão / Concentração / Estudos (Categoria: Foco e clareza)
  if (
    norm.includes("desfoc") ||
    norm.includes("foco") ||
    norm.includes("concentr") ||
    norm.includes("dispers") ||
    norm.includes("distrai") ||
    norm.includes("confus") ||
    norm.includes("estud") ||
    norm.includes("cabeca cheia") ||
    norm.includes("mente cheia") ||
    norm.includes("procrastin") ||
    norm.includes("memoria") ||
    norm.includes("atencao")
  ) {
    return {
      emotion: {
        label: "Falta de Foco e Dispersão",
        description: "Dificuldade de canalizar a atenção, com a mente dispersa e excesso de estímulos dispersivos."
      },
      aroma: getAroma("louro"),
      aromaExplanation: "O Louro traz clareza imediata e decisão mental, auxiliando a mente a sair da névoa e recuperar a concentração segura.",
      alternatives: [
        { aroma: getAroma("alecrim_cineol"), reason: "Estimula diretamente a memória de trabalho e o foco cognitivo prolongado." },
        { aroma: getAroma("lemongrass"), reason: "Promove renovação lúcida e frescor para recomeçar tarefas dispersas." },
        { aroma: getAroma("peppermint"), reason: "Desperta a mente de forma rápida contra o bloqueio intelectual." }
      ],
      usageMethod: "Inale diretamente do frasco por 5 respirações profundas antes de iniciar suas atividades e estudos.",
      quote: "A clareza nasce quando escolhemos colocar toda a nossa presença em uma única respiração por vez.",
      transcription
    };
  }

  // 2. Raiva / Irritação / Estresse / Impaciência / Briga (Categoria: Irritação e TPM)
  if (
    norm.includes("raiv") ||
    norm.includes("irrit") ||
    norm.includes("estress") ||
    norm.includes("paciencia") ||
    norm.includes("briga") ||
    norm.includes("discuss") ||
    norm.includes("explod") ||
    norm.includes("odio") ||
    norm.includes("chefe")
  ) {
    return {
      emotion: {
        label: "Irritação e Estresse Acumulado",
        description: "Paciência fragilizada por atritos ou exigências excessivas, pedindo alívio da raiva e serenidade."
      },
      aroma: getAroma("camomila_romana"),
      aromaExplanation: "A Camomila Romana é a essência mais indicada para desarmar a raiva contida e acalmar reações exacerbadas de atrito.",
      alternatives: [
        { aroma: getAroma("clary_sage"), reason: "Estabiliza oscilações de humor e alivia picos de tensão emocional." },
        { aroma: getAroma("manjerona"), reason: "Dissolve a rigidez muscular na nuca e ombros provocada pelo estresse." },
        { aroma: getAroma("bergamota"), reason: "Dissipa a contrariedade com leveza e serenidade acolhedora." }
      ],
      usageMethod: "Ao sentir o calor da irritação subir, inale o aroma pausadamente por 1 minuto, soltando os ombros a cada expiração.",
      quote: "A serenidade não é a ausência de atrito, mas a escolha consciente de preservar a sua paz interior.",
      transcription
    };
  }

  // 3. Esgotamento / Burnout / Sobrecarga Extrema (Categoria: Calma e redução de ansiedade)
  if (
    norm.includes("esgot") ||
    norm.includes("burnout") ||
    norm.includes("sobrecarg") ||
    norm.includes("exaust") ||
    norm.includes("limite") ||
    norm.includes("puxado") ||
    norm.includes("acabad") ||
    norm.includes("nao aguent")
  ) {
    return {
      emotion: {
        label: "Esgotamento e Sobrecarga",
        description: "Sentimento de exigência excessiva e fadiga profunda, clamando por pausa restauradora imediata."
      },
      aroma: getAroma("neroli"),
      aromaExplanation: "O Neroli é o grande bálsamo para momentos de sobrecarga e colapso emocional, trazendo reconexão suave e alívio profundo.",
      alternatives: [
        { aroma: getAroma("melissa"), reason: "Acalma angústias e suaviza o aperto interior causado pelo excesso de pressão." },
        { aroma: getAroma("sandalo"), reason: "Interrompe pensamentos acelerados e ancora na presença tranquila." },
        { aroma: getAroma("manjerona"), reason: "Alivia a exaustão acumulada e relaxa as tensões musculares do corpo." }
      ],
      usageMethod: "A cada 3 horas, aplique 2 gotas nos pulsos, aproxime do nariz e faça 4 respirações lentas de olhos fechados.",
      quote: "Descansar não é desistir; é o gesto sagrado de permitir que suas forças renasçam.",
      transcription
    };
  }

  // 4. Cansaço Físico / Falta de Energia / Fadiga / Preguiça (Categoria: Energia e motivação)
  if (
    norm.includes("cansad") ||
    norm.includes("fadiga") ||
    norm.includes("moleza") ||
    norm.includes("preguic") ||
    norm.includes("desmotivad") ||
    norm.includes("sem energia") ||
    norm.includes("apatic") ||
    norm.includes("sono")
  ) {
    return {
      emotion: {
        label: "Cansaço e Baixa Vitalidade",
        description: "O corpo e a mente sentem o peso do desgaste diário, carecendo de um despertar revigorante de disposição."
      },
      aroma: getAroma("alecrim"),
      aromaExplanation: "O Alecrim é o clássico revigorante natural que combate a fadiga mental, desperta o ânimo e renova a vitalidade corporal.",
      alternatives: [
        { aroma: getAroma("hortela_pimenta"), reason: "Proporciona um choque imediato de frescor mentolado contra a sonolência e lentidão." },
        { aroma: getAroma("limao"), reason: "Estimula a energia e dissipa o cansaço mental com vivacidade cítrica." },
        { aroma: getAroma("gengibre"), reason: "Aquece a circulação e estimula a determinação com calor energizante." }
      ],
      usageMethod: "Ao levantar e no início da tarde, esfregue 1 gota entre as mãos e inale vigorosamente para despertar a prontidão.",
      quote: "A vida se renova no movimento: sinta o ar fresco reativar cada fibra da sua disposição.",
      transcription
    };
  }

  // 5. Tristeza / Desânimo / Melancolia / Choro (Categoria: Tristeza e acolhimento emocional)
  if (
    norm.includes("trist") ||
    norm.includes("desanim") ||
    norm.includes("chor") ||
    norm.includes("vazio") ||
    norm.includes("solit") ||
    norm.includes("sozinh") ||
    norm.includes("machuc") ||
    norm.includes("mago") ||
    norm.includes("luto")
  ) {
    return {
      emotion: {
        label: "Desânimo e Sensibilidade Emocional",
        description: "Coração pesado e sensibilidade aflorada, necessitando de calor, conforto e aconchego acolhedor."
      },
      aroma: getAroma("bergamota"),
      aromaExplanation: "A Bergamota dissipa a névoa da tristeza com sua luminosidade cítrica solar, devolvendo a esperança ao coração.",
      alternatives: [
        { aroma: getAroma("rosa"), reason: "Acolhe corações magoados com ternura profunda e amparo incondicional." },
        { aroma: getAroma("laranja_doce"), reason: "Traz calor, alegria espontânea e sensação aconchegante de otimismo." },
        { aroma: getAroma("geranio"), reason: "Harmoniza oscilações emocionais com suavidade feminina e equilibrante." }
      ],
      usageMethod: "Pela manhã e no meio da tarde, inale o aroma por 3 respirações profundas para reaquecer o peito com otimismo.",
      quote: "Permita-se sentir com ternura: as nuvens passam e a sua luz interior sempre volta a aquecer o seu dia.",
      transcription
    };
  }

  // 6. Ansiedade / Inquietação / Taquicardia / Nervosismo (Categoria: Calma e redução de ansiedade)
  if (
    norm.includes("ansied") ||
    norm.includes("ansios") ||
    norm.includes("agitad") ||
    norm.includes("acelerad") ||
    norm.includes("preocup") ||
    norm.includes("panico") ||
    norm.includes("tens")
  ) {
    return {
      emotion: {
        label: "Ansiedade e Inquietação",
        description: "Mente acelerada e ritmo inquieto por excesso de preocupações, pedindo centramento e calmaria compassada."
      },
      aroma: getAroma("camomila"),
      aromaExplanation: "A Camomila desacelera o sistema nervoso com doçura acolhedora, aliviando o aperto no peito e as inquietações.",
      alternatives: [
        { aroma: getAroma("sandalo"), reason: "Ancora a mente no presente e reduz pensamentos repetitivos acelerados." },
        { aroma: getAroma("olibano"), reason: "Expande a respiração torácica e dissolve sentimentos de medo e angústia." },
        { aroma: getAroma("cedro"), reason: "Traz sustentação firme e estabilidade interior diante de momentos de instabilidade." }
      ],
      usageMethod: "A cada 2 horas, pingue 1 gota na palma das mãos, una em forma de concha e inale suavemente por 30 segundos.",
      quote: "Inspire paz, expire o controle. O seu momento presente é seguro e acolhedor.",
      transcription
    };
  }

  // 7. Padrão neutro / Equilíbrio (Categoria: Foco e clareza com Louro)
  return {
    emotion: {
      label: "Foco e Clareza Mental",
      description: "Momento propício para organizar pensamentos, dissolver a dispersão e renovar a presença."
    },
    aroma: getAroma("louro"),
    aromaExplanation: "O Louro auxilia na organização das ideias e no fortalecimento da atenção lúcida e confiante.",
    alternatives: [
      { aroma: getAroma("lemongrass"), reason: "Traz frescor estimulante e clareza para recomeçar o dia com disposição." },
      { aroma: getAroma("sandalo"), reason: "Oferece presença serena e centramento para o seu equilíbrio interior." },
      { aroma: getAroma("alecrim_cineol"), reason: "Potencializa a memória e a produtividade mental focada." }
    ],
    usageMethod: "Inale suavemente próximo ao início de suas tarefas para centrar sua mente com clareza.",
    quote: "A clareza nasce quando escolhemos colocar toda a nossa presença em uma única respiração por vez.",
    transcription
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "santuario-api" });
  });

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

      const client = getAI();
      const aromasInfo = AROMAS_LIST.map(a => `- ${a.id}: ${a.name} [Categoria: ${a.category}] (Benefícios: ${a.benefits})`).join("\n");

      // Se temos o cliente Gemini e texto ou áudio
      if (client && (clientTranscription || base64Audio)) {
        const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest"];

        for (const modelName of candidateModels) {
          try {
            const parts: any[] = [];

            // Se não temos transcrição do cliente mas temos áudio, anexa áudio inline
            if (!clientTranscription && base64Audio) {
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
Você é um aromaterapeuta e terapeuta integrativo de alta sensibilidade e conhecimento.
Analise a mensagem ou relato sobre como foi o dia da pessoa:
${clientTranscription ? `"${clientTranscription}"` : "Ouça o áudio anexo com máxima atenção aos sentimentos e transcreva as palavras ditas."}

DIRETRIZES FUNDAMENTAIS PARA ANÁLISE EMOCIONAL E AROMATERAPIA:
1. TRANSCRIÇÃO:
   - Forneça a transcrição precisa do relato em português.

2. CLASSIFICAÇÃO DA SENSAÇÃO E EMOÇÃO:
   - Identifique com exatidão o estado (ex: "Falta de Foco e Dispersão", "Irritação e Estresse Acumulado", "Esgotamento e Sobrecarga", "Cansaço e Baixa Vitalidade", "Desânimo e Sensibilidade Emocional", "Ansiedade e Inquietação").

3. SELEÇÃO DO AROMA PRINCIPAL (ESTRITAMENTE CONFORME AS OPÇÕES E CATEGORIAS DO CATÁLOGO):
   - Se for FALTA DE FOCO, DESFOCADO, DISPERSÃO, ESTUDOS ou MENTE CHEIA:
     O aroma DEVE ser da categoria "Foco e clareza": "louro", "lemongrass", "alecrim_cineol" ou "peppermint".
     NUNCA escolha bergamota ou lavanda para falta de foco.
   - Se for RAIVA, IRRITAÇÃO, BRIGA ou ESTRESSE:
     O aroma DEVE ser da categoria "Irritação e TPM": "camomila_romana" ou "clary_sage".
   - Se for ESGOTAMENTO, SOBRECARGA ou BURNOUT:
     O aroma DEVE ser "neroli", "melissa", "sandalo" ou "manjerona".
   - Se for CANSAÇO FÍSICO, FALTA DE ENERGIA ou FADIGA:
     O aroma DEVE ser da categoria "Energia e motivação": "alecrim", "hortela_pimenta", "limao" ou "gengibre".
   - Se for TRISTEZA, DESÂNIMO, CHORO ou LUTO:
     O aroma DEVE ser da categoria "Tristeza e acolhimento emocional": "bergamota", "rosa" ou "laranja_doce".
   - Se for ANSIEDADE, NERVOSISMO ou INQUIETAÇÃO:
     O aroma DEVE ser da categoria "Calma e redução de ansiedade": "camomila" ou "sandalo".
   - O aromaId DEVE ser exatamente um dos IDs da lista abaixo.

4. 3 OPÇÕES ALTERNATIVAS DISTINTAS:
   - Selecione exatamente 3 aromas alternativos diferentes do principal da lista abaixo com justificativa.

5. RITUAL E MÉTODO DE USO AO LONGO DO DIA:
   - Instrução prática personalizada de uso durante o dia.

6. FRASE POÉTICA:
   - Uma mensagem curta, poética e acolhedora.

LISTA DE AROMAS DISPONÍVEIS:
${aromasInfo}

Responda ESTRITAMENTE em formato JSON com:
{
  "emotionLabel": "string",
  "emotionDescription": "string",
  "aromaId": "string",
  "aromaExplanation": "string",
  "alternativeAromas": [
    { "aromaId": "string", "reason": "string" },
    { "aromaId": "string", "reason": "string" },
    { "aromaId": "string", "reason": "string" }
  ],
  "usageMethod": "string",
  "quote": "string",
  "transcription": "string"
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
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 12000))
            ]);

            const responseText = response.text;
            if (!responseText) continue;

            const parsed = JSON.parse(responseText);
            if (!parsed.emotionLabel || !parsed.aromaId) continue;

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

            const finalTranscription = parsed.transcription || clientTranscription || "Relato de voz acolhido.";

            return res.json({
              emotion: {
                label: parsed.emotionLabel,
                description: parsed.emotionDescription || "Sentimento identificado a partir do seu relato."
              },
              aroma: selectedAroma,
              aromaExplanation: parsed.aromaExplanation || selectedAroma.benefits,
              alternatives: alternatives.slice(0, 3),
              usageMethod: parsed.usageMethod || "Aplique 2 gotas nos pulsos a cada 3 horas e inale profundamente.",
              quote: parsed.quote || "Permita que o aroma conduza seu dia à serenidade e clareza.",
              transcription: finalTranscription
            });
          } catch (_) {
            // Continua silenciosamente para o próximo modelo sem poluir logs
          }
        }
      }

      // Análise estruturada caso a API externa não responda
      const tailored = buildTailoredAnalysis(clientTranscription);
      return res.json(tailored);
    } catch (_) {
      const fallback = buildTailoredAnalysis("");
      return res.json(fallback);
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
