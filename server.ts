import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import { AROMAS_LIST } from "./src/constants";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Server] GEMINI_API_KEY não configurada no ambiente.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const fallbackResult = {
  emotion: {
    label: "Pausa e Centramento",
    description: "Pausa restauradora necessária para acolher o coração e desacelerar o ritmo mental."
  },
  aroma: AROMAS_LIST[0],
  aromaExplanation: "Escolhemos a Lavanda para trazer estabilidade, alívio de tensões e serenidade imediata.",
  alternatives: [
    {
      aroma: AROMAS_LIST.find(a => a.id === "camomila") || AROMAS_LIST[1],
      reason: "Excelente para acalmar a mente agitada e dissolver preocupações do cotidiano."
    },
    {
      aroma: AROMAS_LIST.find(a => a.id === "sandalo") || AROMAS_LIST[4],
      reason: "Aquece e reduz pensamentos excessivos, promovendo presença e centramento."
    },
    {
      aroma: AROMAS_LIST.find(a => a.id === "bergamota") || AROMAS_LIST[8],
      reason: "Traz leveza e conforto emocional para renovar a energia com suavidade."
    }
  ],
  usageMethod: "A cada 3 horas, aplique 2 gotas nos pulsos ou no difusor e respire calmamente por 1 minuto.",
  quote: "Que a suavidade do aroma traga clareza e repouso para o seu coração.",
  transcription: "Sua voz foi acolhida e seus sentimentos foram compreendidos."
};

function buildTailoredAnalysis(userSpeechText: string) {
  const text = (userSpeechText || "").toLowerCase();
  const transcription = userSpeechText.trim() || "Relato do seu dia acolhido com carinho.";

  // Helper para buscar aroma
  const getAroma = (id: string) => AROMAS_LIST.find(a => a.id === id) || AROMAS_LIST[0];

  // 1. Esgotamento / Burnout / Sobrecarga
  if (
    text.includes("esgot") ||
    text.includes("burnout") ||
    text.includes("exaust") ||
    text.includes("sobrecarg") ||
    text.includes("limite") ||
    text.includes("puxado") ||
    text.includes("acabado") ||
    text.includes("nao aguento")
  ) {
    const main = getAroma("neroli");
    return {
      emotion: {
        label: "Esgotamento e Sobrecarga",
        description: "Sentimento de sobrecarga profunda e exigência excessiva, pedindo restauração e acolhimento urgente."
      },
      aroma: main,
      aromaExplanation: "O Neroli atua como um bálsamo restaurador imediato em momentos de colapso emocional e fadiga extrema.",
      alternatives: [
        { aroma: getAroma("melissa"), reason: "Acalma angústias silenciosas e suaviza a tensão nervosa acumulada." },
        { aroma: getAroma("sandalo"), reason: "Promove centramento e interrompe o turbilhão de pensamentos exaustivos." },
        { aroma: getAroma("bergamota"), reason: "Devolve uma sensação sutil de esperança e alívio para o peito pesado." }
      ],
      usageMethod: "Ao longo do dia, coloque 2 gotas nos pulsos a cada 3 horas, aproxime das narinas e inale profundamente 4 vezes de olhos fechados.",
      quote: "Descansar não é desistir; é o gesto sagrado de permitir que suas forças renasçam.",
      transcription
    };
  }

  // 2. Ansiedade / Tensão / Medo / Pânico / Nervosismo
  if (
    text.includes("ansied") ||
    text.includes("ansios") ||
    text.includes("nervos") ||
    text.includes("medo") ||
    text.includes("panico") ||
    text.includes("tens") ||
    text.includes("pressao") ||
    text.includes("agitad") ||
    text.includes("acelerad") ||
    text.includes("preocup")
  ) {
    const main = getAroma("camomila");
    return {
      emotion: {
        label: "Ansiedade e Tensão Acumulada",
        description: "Mente inquieta e respiração encurtada pela sobrecarga de preocupações e ritmo acelerado."
      },
      aroma: main,
      aromaExplanation: "A Camomila desacelera o sistema nervoso, suaviza a irritação interna e alivia o nó de aperto no peito.",
      alternatives: [
        { aroma: getAroma("lavanda"), reason: "Reduz a hiperatividade mental e restaura o compasso calmo da respiração." },
        { aroma: getAroma("olibano"), reason: "Cria um escudo de serenidade e dissolve a sensação de inquietação e medo." },
        { aroma: getAroma("cedro"), reason: "Oferece estrutura, firmeza emocional e sensação de segurança interior." }
      ],
      usageMethod: "A cada 2 horas, pingue 1 gota na palma das mãos, esfregue suavemente e inale em forma de concha por 30 segundos, soltando os ombros.",
      quote: "A cada expiração suave, solte tudo aquilo que não pertence ao seu momento presente.",
      transcription
    };
  }

  // 3. Tristeza / Desânimo / Melancolia / Solidão / Choro
  if (
    text.includes("trist") ||
    text.includes("desanim") ||
    text.includes("chor") ||
    text.includes("vazio") ||
    text.includes("solit") ||
    text.includes("sozinho") ||
    text.includes("pesado") ||
    text.includes("machuc") ||
    text.includes("mago")
  ) {
    const main = getAroma("bergamota");
    return {
      emotion: {
        label: "Desânimo e Sensibilidade Emocional",
        description: "Coração pesado e sensação de melancolia, necessitando de calor, otimismo e abraço caloroso."
      },
      aroma: main,
      aromaExplanation: "A Bergamota dissipa a névoa do desânimo com seu toque solar cítrico que reacende a leveza no peito.",
      alternatives: [
        { aroma: getAroma("laranja_doce"), reason: "Traz calor, alegria espontânea e sensação reconfortante de acolhimento." },
        { aroma: getAroma("rosa"), reason: "Acolhe corações magoados e envolve a vulnerabilidade com ternura profunda." },
        { aroma: getAroma("mandarina"), reason: "Suaviza a melancolia trazendo a simplicidade e a pureza de um sorriso leve." }
      ],
      usageMethod: "Pela manhã e no meio da tarde, inale o aroma por 3 respirações lentas para reabrir a sensação de vitalidade e afeto.",
      quote: "Permita-se sentir, sabendo que as nuvens passam e o sol sempre volta a aquecer o seu dia.",
      transcription
    };
  }

  // 4. Falta de foco / Dispersão / Confusão / Mente cheia
  if (
    text.includes("foco") ||
    text.includes("concentr") ||
    text.includes("dispers") ||
    text.includes("confus") ||
    text.includes("cabeca cheia") ||
    text.includes("bloque") ||
    text.includes("estud")
  ) {
    const main = getAroma("louro");
    return {
      emotion: {
        label: "Dispersão e Névoa Mental",
        description: "Dificuldade de canalizar a atenção e excesso de estímulos fragmentando o raciocínio."
      },
      aroma: main,
      aromaExplanation: "O Louro proporciona autoconfiança lúcida, cortando a confusão mental para tomadas de decisão seguras.",
      alternatives: [
        { aroma: getAroma("lemongrass"), reason: "Promove renovação imediata e clareza refrescante para recomeçar tarefas." },
        { aroma: getAroma("limao"), reason: "Estimula o raciocínio lógico e dissipa a sensação de lentidão intelectual." },
        { aroma: getAroma("alecrim_cineol"), reason: "Potencializa a memória de trabalho e desperta a concentração profunda." }
      ],
      usageMethod: "No início de cada período de trabalho ou estudo, inale diretamente do frasco por 5 respirações compassadas.",
      quote: "A clareza nasce quando escolhemos colocar toda a nossa presença em uma única respiração por vez.",
      transcription
    };
  }

  // 5. Cansaço / Sono / Insônia / Noite ruim
  if (
    text.includes("sono") ||
    text.includes("insonia") ||
    text.includes("dormir") ||
    text.includes("madrugad") ||
    text.includes("cansad") ||
    text.includes("fadiga") ||
    text.includes("pesadelo")
  ) {
    const main = getAroma("sandalo");
    return {
      emotion: {
        label: "Inquietação e Dificuldade de Desconectar",
        description: "O corpo pede repouso enquanto a mente ainda permanece em estado de vigília e tensão."
      },
      aroma: main,
      aromaExplanation: "O Sândalo desacelera as ondas cerebrais, criando um porto seguro amadeirado propício para o descanso.",
      alternatives: [
        { aroma: getAroma("lavanda"), reason: "Reduz comprovadamente os níveis de cortisol preparando o corpo para o adormecer." },
        { aroma: getAroma("manjerona"), reason: "Alivia a rigidez muscular na nuca e ombros acumulada pelas noites mal dormidas." },
        { aroma: getAroma("melissa"), reason: "Desarma o sobressalto mental e acolhe a noite com serenidade restauradora." }
      ],
      usageMethod: "Ao entardecer e antes de se deitar, aplique 2 gotas diluídas no peito e na sola dos pés, respirando com suavidade.",
      quote: "A noite é um convite para soltar o controle e confiar que o descanso cuidará do amanhã.",
      transcription
    };
  }

  // 6. Irritação / Raiva / Impaciência / Estresse de trânsito ou discussões
  if (
    text.includes("raiva") ||
    text.includes("irrit") ||
    text.includes("paciencia") ||
    text.includes("briga") ||
    text.includes("discuss") ||
    text.includes("explod") ||
    text.includes("odio") ||
    text.includes("furios")
  ) {
    const main = getAroma("camomila_romana");
    return {
      emotion: {
        label: "Irritação e Sobrecarga Reativa",
        description: "Paciência fragilizada por excesso de atritos, precisando de frescor para desarmar a reatividade."
      },
      aroma: main,
      aromaExplanation: "A Camomila Romana acalma a raiva contida e devolve a tolerância suave diante de situações desafiadoras.",
      alternatives: [
        { aroma: getAroma("clary_sage"), reason: "Equilibra os picos de tensão emocional e restaura a estabilidade interna." },
        { aroma: getAroma("bergamota"), reason: "Dissolve a rigidez mental com leveza e serenidade acolhedora." },
        { aroma: getAroma("lavanda"), reason: "Reduz a pulsação nervosa e convida os músculos a relaxarem por completo." }
      ],
      usageMethod: "Quando sentir o calor da irritação surgir, respire o aroma pausadamente por 1 minuto, expirando lentamente pela boca.",
      quote: "A serenidade não é a ausência de atrito, mas a escolha sábia de preservar a sua paz interior.",
      transcription
    };
  }

  // 7. Padrão acolhedor
  return {
    emotion: {
      label: "Necessidade de Pausa e Centramento",
      description: "Um dia repleto de acontecimentos que pede um momento íntimo de silêncio e acolhimento."
    },
    aroma: getAroma("lavanda"),
    aromaExplanation: "A Lavanda foi selecionada para criar uma ponte harmoniosa entre a rotina agitada e o seu bem-estar pessoal.",
    alternatives: [
      { aroma: getAroma("camomila"), reason: "Ajuda a dissolver pequenas tensões e preserva a calma no seu dia a dia." },
      { aroma: getAroma("bergamota"), reason: "Traz uma dose de otimismo e renovação para inspirar novos ares." },
      { aroma: getAroma("sandalo"), reason: "Oferece profundidade e presença tranquila para o seu momento presente." }
    ],
    usageMethod: "A cada 3 horas, reserve 2 minutos para fechar os olhos e inalar o aroma com lentidão e presença.",
    quote: "Acolha a sua história hoje: cada suspiro de calma constrói um refúgio de paz dentro de você.",
    transcription
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para JSON e dados codificados
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // --- API Routes ---

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

      if (!base64Audio && !clientTranscription) {
        return res.status(400).json({ error: "Nenhum áudio ou relato fornecido para análise." });
      }

      const client = getAI();
      const aromasInfo = AROMAS_LIST.map(a => `${a.id}: ${a.name} (${a.category}) - ${a.benefits}`).join("\n");
      const cleanMimeType = mimeType.split(";")[0].trim() || "audio/webm";

      let effectiveTranscription = clientTranscription;

      // Se o cliente não forneceu a transcrição via Web Speech API e temos o áudio, tentamos transcrever com Gemini
      if (!effectiveTranscription && client && base64Audio) {
        try {
          console.log("[Server] Tentando transcrever áudio com gemini-3.5-transcribe...");
          const transcribeRes = await Promise.race([
            client.models.generateContent({
              model: "gemini-3.5-transcribe",
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        mimeType: cleanMimeType,
                        data: base64Audio
                      }
                    }
                  ]
                }
              ]
            }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout transcribe")), 3500))
          ]);
          if (transcribeRes.text && transcribeRes.text.trim()) {
            effectiveTranscription = transcribeRes.text.trim();
            console.log("[Server] Transcrição obtida via gemini-3.5-transcribe:", effectiveTranscription);
          }
        } catch (err: any) {
          console.warn("[Server] gemini-3.5-transcribe falhou ou timeout:", err?.message);
        }
      }

      // Se temos o cliente Gemini configurado, tentamos a análise inteligente via modelo cascade
      if (client) {
        const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.6-flash"];
        
        for (const modelName of candidateModels) {
          try {
            console.log(`[Server] Tentando análise emocional com ${modelName}...`);

            const parts: any[] = [];
            let promptText = "";

            if (effectiveTranscription) {
              promptText = `
Você é um aromaterapeuta e terapeuta integrativo profundamente acolhedor, empático e perspicaz.
Analise este relato pessoal de como foi o dia da pessoa:
"${effectiveTranscription}"

Siga estritamente estas diretrizes:
1. CLASSIFIQUE o estado emocional predominante (nome do sentimento e uma breve descrição sensível do que ela está vivenciando).
2. SELECIONE o aroma PRINCIPAL MAIS adequado da lista abaixo seguindo estas REGRAS:
   - NÃO escolha "Lavanda" ou "Alecrim" como padrão genérico. Seja cirúrgico e empático.
   - SÓ recomende "Alecrim" se detectar explicitamente baixa energia, cansaço físico ou lentidão motora/mental.
   - Se houver esgotamento emocional, sobrecarga ou "burnout", priorize aromas restauradores e profundos (como Neroli, Melissa, Sândalo ou Manjerona).
   - Se houver tristeza ou carência, priorize Bergamota, Laranja-doce ou Rosa.
   - Se houver dispersão ou falta de foco, priorize Louro, Lemongrass ou Limão.
3. EXPLIQUE em uma frase clara e humana por que esse aroma principal é a melhor escolha para esse momento.
4. SELECIONE EXATAMENTE 3 AROMAS ALTERNATIVOS DIFERENTES da lista, caso ela não tenha o principal em mãos. Para cada um, forneça a justificativa de substituição.
5. MÉTODO DE USO: Crie um método personalizado para o usuário utilizar este aroma ao longo do dia, sendo bem específico (ex: "A cada 3 horas, aplique 2 gotas nos pulsos...", "Pela manhã e ao entardecer..."). O método deve focar em como usar o aroma no decorrer do dia para cuidar do estado emocional detectado.
6. Crie uma FRASE CURTA E POÉTICA de acolhimento e carinho para a pessoa.
7. Mantenha a TRANSCRIÇÃO fiel do que foi dito.

Lista de Aromas e Categorias Disponíveis:
${aromasInfo}

Responda ESTRITAMENTE em formato JSON com esta estrutura:
{
  "emotionLabel": "string",
  "emotionDescription": "string",
  "aromaId": "string (deve ser um dos ids da lista acima)",
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
            } else {
              // Sem texto transcrito prévio, envia o áudio diretamente
              promptText = `
Você é um aromaterapeuta e terapeuta integrativo profundamente acolhedor, empático e perspicaz.
Analise a voz e o relato contido no áudio anexo sobre como foi o dia da pessoa.

Siga estritamente estas diretrizes:
1. TRANSCREVA com máxima fidelidade o que a pessoa falou.
2. CLASSIFIQUE o estado emocional predominante (nome do sentimento e uma breve descrição do que percebeu na voz/fala).
3. SELECIONE o aroma PRINCIPAL MAIS adequado da lista abaixo (não use Lavanda ou Alecrim como padrão genérico).
4. EXPLIQUE em uma frase por que esse aroma principal é a melhor escolha.
5. SELECIONE EXATAMENTE 3 AROMAS ALTERNATIVOS DIFERENTES com a respectiva justificativa.
6. MÉTODO DE USO: Crie uma rotina personalizada de como usar o aroma ao longo do dia para tratar esse estado emocional.
7. FRASE POÉTICA: Uma mensagem curta e bonita de acolhimento.

Lista de Aromas Disponíveis:
${aromasInfo}

Responda ESTRITAMENTE em formato JSON com:
{
  "emotionLabel": "string",
  "emotionDescription": "string",
  "aromaId": "string (um id da lista)",
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
              parts.push({
                inlineData: {
                  mimeType: cleanMimeType,
                  data: base64Audio
                }
              });
            }

            const response = await Promise.race([
              client.models.generateContent({
                model: modelName,
                contents: [{ parts }],
                config: {
                  responseMimeType: "application/json"
                }
              }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), 4500))
            ]);

            const responseText = response.text;
            if (!responseText) {
              continue;
            }

            const parsed = JSON.parse(responseText);
            if (!parsed.emotionLabel || !parsed.aromaId) {
              continue;
            }

            const selectedAroma = AROMAS_LIST.find(a => a.id === parsed.aromaId) || AROMAS_LIST[0];

            // Mapeia e garante exatamente 3 alternativas distintas
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

            // Preenche até 3 se faltar
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

            console.log(`[Server] Sucesso com ${modelName}! Emoção: ${parsed.emotionLabel}, Aroma: ${selectedAroma.name}`);

            return res.json({
              emotion: {
                label: parsed.emotionLabel,
                description: parsed.emotionDescription || `Sentimento percebido com clareza em seu relato.`
              },
              aroma: selectedAroma,
              aromaExplanation: parsed.aromaExplanation || selectedAroma.benefits,
              alternatives: alternatives.slice(0, 3),
              usageMethod: parsed.usageMethod || "Aplique 2 gotas nos pulsos a cada 3 horas e respire profundamente.",
              quote: parsed.quote || "Que este aroma renove suas energias e traga leveza ao seu caminhar.",
              transcription: parsed.transcription || effectiveTranscription || "Sua voz foi ouvida e sua energia acolhida."
            });
          } catch (modelErr: any) {
            console.warn(`[Server] Falha no modelo ${modelName}:`, modelErr?.message || modelErr);
          }
        }
      }

      // Se a IA externa estiver temporariamente indisponível ou em alta demanda (503):
      // Usamos nossa análise clínica de aromaterapia personalizada baseada nas palavras ditas pela pessoa
      console.log("[Server] Gerando análise terapêutica sob medida para o relato...");
      const tailored = buildTailoredAnalysis(effectiveTranscription);
      return res.json(tailored);
    } catch (error) {
      console.error("[Server] Erro geral na análise:", error);
      return res.json(fallbackResult);
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
