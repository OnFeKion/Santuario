import { GoogleGenAI } from "@google/genai";
import { AROMAS_LIST, OFFICIAL_SENTIMENT_TO_AROMA } from "../constants";

const EMOTIONS_GUIDE = Object.entries(OFFICIAL_SENTIMENT_TO_AROMA)
  .map(([feeling, aromaId]) => {
    const aroma = AROMAS_LIST.find((a) => a.id === aromaId);
    return `- ${feeling} -> ${aroma?.name || aromaId} (id: "${aromaId}")`;
  })
  .join("\n");

const AROMAS_CATALOG = AROMAS_LIST.map(
  (a) => `- id: "${a.id}", nome: "${a.name}", categoria: "${a.category}", benefícios: "${a.benefits}"`
).join("\n");

function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function normalizeAudioMimeType(mimeType?: string): string {
  const base = (mimeType || "").split(";")[0].trim().toLowerCase();
  if (!base || base === "application/octet-stream") {
    return "audio/webm";
  }
  if (base === "video/mp4") {
    return "audio/mp4";
  }
  if (base === "video/webm") {
    return "audio/webm";
  }
  return base;
}

function parseJsonResponse(text: string): any {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

export interface AnalyzeInput {
  base64Audio?: string;
  mimeType?: string;
  clientTranscription?: string;
}

export interface AnalyzeOutput {
  status: number;
  body: Record<string, any>;
}

export async function analyzeEmotionAndAroma(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const base64Audio = (input.base64Audio || "").trim();
  const clientTranscription = (input.clientTranscription || "").trim();
  const hasAudio = base64Audio.length > 500;
  const hasText = clientTranscription.length > 0;

  if (!hasAudio && !hasText) {
    return {
      status: 200,
      body: {
        notHeard: true,
        errorCode: "NOT_HEARD",
        notHeardMessage:
          "Não consegui ouvir nada. Por favor, grave novamente falando mais próximo ao microfone.",
      },
    };
  }

  const client = getAI();
  if (!client) {
    return {
      status: 500,
      body: {
        notHeard: false,
        errorCode: "MISSING_API_KEY",
        error:
          "A chave GEMINI_API_KEY não está configurada nas variáveis de ambiente do servidor.",
      },
    };
  }

  const candidateModels = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
  let lastErrorStatus = 500;
  let lastErrorMessage = "";

  for (const modelName of candidateModels) {
    try {
      const parts: any[] = [];

      if (hasAudio) {
        parts.push({
          inlineData: {
            mimeType: normalizeAudioMimeType(input.mimeType),
            data: base64Audio,
          },
        });
      }

      const inputContext = hasAudio
        ? hasText
          ? `Ouça atentamente o áudio anexo gravado pelo usuário. Como apoio adicional, o navegador captou a seguinte transcrição preliminar (use o áudio como fonte principal caso haja divergência): "${clientTranscription}"`
          : "Ouça atentamente o áudio anexo gravado pelo usuário."
        : `O usuário relatou o seguinte texto: "${clientTranscription}"`;

      const promptText = `
Você é um aromaterapeuta e terapeuta integrativo de alta sensibilidade e escuta profunda.
Sua missão é ESCUTAR e INTERPRETAR profundamente o estado emocional e mental da pessoa ATRAVÉS DA IA (compreensão semântica, tom de voz, pausas e sentimentos expressos), NUNCA por regras mecânicas de palavras-chave.

${inputContext}

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
            responseMimeType: "application/json",
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 25000)
        ),
      ]);

      const responseText = response.text;
      if (!responseText) continue;

      const parsed = parseJsonResponse(responseText);

      if (parsed.notHeard === true) {
        return {
          status: 200,
          body: {
            notHeard: true,
            errorCode: "NOT_HEARD",
            notHeardMessage:
              parsed.notHeardMessage ||
              "Não consegui ouvir ou compreender o que você disse. Por favor, tente gravar novamente.",
          },
        };
      }

      if (!parsed.aromaId || !parsed.emotionLabel) {
        continue;
      }

      const selectedAroma =
        AROMAS_LIST.find((a) => a.id === parsed.aromaId) || AROMAS_LIST[0];

      const alternatives: Array<{ aroma: any; reason: string }> = [];
      if (Array.isArray(parsed.alternativeAromas)) {
        for (const alt of parsed.alternativeAromas) {
          if (
            alt?.aromaId &&
            alt.aromaId !== selectedAroma.id &&
            !alternatives.some((a) => a.aroma.id === alt.aromaId)
          ) {
            const found = AROMAS_LIST.find((a) => a.id === alt.aromaId);
            if (found) {
              alternatives.push({
                aroma: found,
                reason: alt.reason || found.benefits,
              });
            }
          }
        }
      }

      if (alternatives.length < 3) {
        for (const extra of AROMAS_LIST) {
          if (alternatives.length >= 3) break;
          if (
            extra.id !== selectedAroma.id &&
            !alternatives.some((alt) => alt.aroma.id === extra.id)
          ) {
            alternatives.push({
              aroma: extra,
              reason: extra.benefits,
            });
          }
        }
      }

      const finalTranscription =
        parsed.transcription ||
        clientTranscription ||
        "Relato de voz acolhido com sucesso.";

      return {
        status: 200,
        body: {
          notHeard: false,
          emotion: {
            label: parsed.emotionLabel,
            description:
              parsed.emotionDescription ||
              "Sensação acolhida e interpretada pela aromaterapia.",
          },
          aroma: selectedAroma,
          aromaExplanation: parsed.aromaExplanation || selectedAroma.benefits,
          alternatives: alternatives.slice(0, 3),
          usageMethod:
            parsed.usageMethod ||
            "Aplique 2 gotas nos pulsos ou difusor pessoal e inale profundamente 3 vezes ao dia.",
          quote:
            parsed.quote ||
            "Cada respiração é uma oportunidade de renovar suas energias e encontrar harmonia.",
          transcription: finalTranscription,
        },
      };
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      lastErrorMessage = msg;

      if (
        msg.includes("API_KEY_INVALID") ||
        msg.includes("PERMISSION_DENIED") ||
        msg.includes("403")
      ) {
        lastErrorStatus = 403;
        return {
          status: 403,
          body: {
            notHeard: false,
            errorCode: "INVALID_API_KEY",
            error:
              "A chave GEMINI_API_KEY no servidor é inválida ou não tem permissão para acessar a API Gemini.",
          },
        };
      }

      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
        lastErrorStatus = 429;
      }
    }
  }

  if (lastErrorStatus === 429) {
    return {
      status: 429,
      body: {
        notHeard: false,
        errorCode: "QUOTA_EXCEEDED",
        error:
          "O limite temporário de requisições da API Gemini foi atingido. Aguarde alguns instantes e tente novamente.",
      },
    };
  }

  return {
    status: 502,
    body: {
      notHeard: false,
      errorCode: "ANALYSIS_FAILED",
      error: lastErrorMessage
        ? `Não foi possível processar a análise na IA (${lastErrorMessage.slice(0, 140)}). Tente novamente.`
        : "Não foi possível processar a análise na IA no momento. Tente novamente em instantes.",
    },
  };
}
