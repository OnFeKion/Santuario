import { GoogleGenAI } from "@google/genai";

interface AromaItem {
  id: string;
  name: string;
  category: string;
  benefits: string;
  notes: string;
  intensity: number;
  tags: string[];
  imageUrl: string;
}

const AROMAS_LIST: AromaItem[] = [
  { id: "lavanda", name: "Lavanda", category: "Serenidade e Repouso", benefits: "Acalma mentes agitadas, induz ao sono tranquilo e dissipa a ansiedade e o pânico.", notes: "Floral, Doce, Suave", intensity: 65, tags: ["Calma", "Sono", "Paz", "Alívio", "Perdão", "Serenidade"], imageUrl: "/images/aromas/lavanda.jpg" },
  { id: "camomila", name: "Camomila", category: "Acalento e Suavidade", benefits: "Alivia ansiedade, tensão emocional, aflição e sentimentos de abandono.", notes: "Doce, Herbáceo, Frutado", intensity: 55, tags: ["Ansiedade", "Relaxamento", "Compaixão", "Aflição"], imageUrl: "/images/aromas/camomila.jpg" },
  { id: "hortela", name: "Hortelã", category: "Foco e Despertar", benefits: "Combate cansaço físico e mental, acalma inquietação e estimula a concentração lúcida.", notes: "Mentolado Fresco, Vigoroso", intensity: 85, tags: ["Cansaço", "Concentração", "Agitação", "Inquietação"], imageUrl: "/images/aromas/hortela.jpg" },
  { id: "baunilha", name: "Baunilha", category: "Conforto e Doçura", benefits: "Acolhe a tristeza profunda, decepções e carência, trazendo calor e sensação de pertencimento.", notes: "Doce, Quente, Envolvente", intensity: 80, tags: ["Tristeza", "Conforto", "Acolhimento", "Pertencimento", "Carência"], imageUrl: "/images/aromas/baunilha.jpg" },
  { id: "sandalo", name: "Sândalo", category: "Paz Interior e Equilíbrio", benefits: "Dissipa raiva, angústia e mágoas, restaurando a paciência, harmonia e aceitação.", notes: "Amadeirado Nobre, Terroso", intensity: 75, tags: ["Raiva", "Paciência", "Harmonia", "Aceitação", "Angústia"], imageUrl: "/images/aromas/sandalo.jpg" },
  { id: "cedro", name: "Cedro", category: "Segurança e Estrutura", benefits: "Enraíza a autoconfiança, combate medo e insegurança, promovendo perseverança firme.", notes: "Amadeirado Seco, Resinoso", intensity: 70, tags: ["Medo", "Insegurança", "Segurança", "Autoconfiança", "Perseverança"], imageUrl: "/images/aromas/cedro.jpg" },
  { id: "rosa", name: "Rosa", category: "Amor e Sensibilidade", benefits: "Acolhe o coração partido, dissipa timidez e vergonha, despertando amor, afeto e generosidade.", notes: "Floral Nobre, Delicado, Aveludado", intensity: 90, tags: ["Amor", "Romance", "Generosidade", "Encanto", "Altruísmo"], imageUrl: "/images/aromas/rosa.jpg" },
  { id: "laranja", name: "Laranja", category: "Alegria e Luminosidade", benefits: "Irradia felicidade espontânea, vitalidade, amizade acolhedora e solidariedade.", notes: "Cítrico Solar, Doce, Fresco", intensity: 75, tags: ["Felicidade", "Vitalidade", "Amizade", "Solidariedade"], imageUrl: "/images/aromas/laranja.jpg" },
  { id: "bergamota", name: "Bergamota", category: "Leveza e Renascimento", benefits: "Dissipa o desânimo e a apatia, restaurando a leveza interior e a confiança alegre.", notes: "Cítrico Fino, Toque Floral", intensity: 75, tags: ["Desânimo", "Leveza", "Apatia", "Confiança"], imageUrl: "/images/aromas/bergamota.jpg" },
  { id: "alecrim", name: "Alecrim", category: "Clareza e Motivação", benefits: "Desperta a mente, elimina confusão e dispersão, impulsionando foco e motivação ativa.", notes: "Herbáceo Fresco, Estimulante", intensity: 80, tags: ["Foco", "Motivação", "Clareza", "Confusão"], imageUrl: "/images/aromas/alecrim.jpg" },
  { id: "limao", name: "Limão", category: "Energia e Purificação", benefits: "Desperta a energia vital, combate tédio e descontentamento, convidando à renovação e recomeço.", notes: "Cítrico Puro, Vibrante, Refrescante", intensity: 85, tags: ["Energia", "Renovação", "Recomeço", "Descontentamento"], imageUrl: "/images/aromas/limao.jpg" },
  { id: "ylangylang", name: "Ylang-ylang", category: "Sensualidade e Desaceleração", benefits: "Alivia estresse e tensão nervosa, despertando fascinação, paixão e entrega aos sentidos.", notes: "Floral Exótico, Doce, Marcante", intensity: 90, tags: ["Estresse", "Paixão", "Fascinação", "Desejo"], imageUrl: "/images/aromas/ylangylang.jpg" },
  { id: "jasmim", name: "Jasmim", category: "Acolhimento e Fascínio", benefits: "Preenche a solidão e sensação de rejeição com profunda admiração, encantamento e intimidade calorosa.", notes: "Floral Nobre, Exótico, Noturno", intensity: 95, tags: ["Solidão", "Encantamento", "Rejeição", "Intimidade", "Fascínio"], imageUrl: "/images/aromas/jasmim.jpg" },
  { id: "eucalipto", name: "Eucalipto", category: "Expansão e Libertação", benefits: "Dissipa frustração, irritação e tensão acumulada, abrindo espaço para frescor mental e respiração ampla.", notes: "Cânforaceo, Refrescante, Penetrante", intensity: 85, tags: ["Frustração", "Irritação", "Frescor", "Tensão", "Alarme"], imageUrl: "/images/aromas/eucalipto.jpg" },
  { id: "canela", name: "Canela", category: "Calor e Afeto", benefits: "Aquece a saudade e a nostalgia, dissipa ciúmes e arrependimento com calor estimulante.", notes: "Especiado Quente, Intenso", intensity: 95, tags: ["Saudade", "Nostalgia", "Desejo", "Calor"], imageUrl: "/images/aromas/canela.jpg" },
  { id: "verbena", name: "Verbena", category: "Inspiração e Fluidez", benefits: "Acende a criatividade, curiosidade intelectual e inspiração artística e mental.", notes: "Cítrico Herbáceo, Nobre, Fresco", intensity: 75, tags: ["Criatividade", "Curiosidade", "Inspiração"], imageUrl: "/images/aromas/verbena.jpg" },
  { id: "flor_de_laranjeira", name: "Flor de laranjeira", category: "Esperança e Encanto", benefits: "Desperta esperança luminosa, profunda gratidão e ampara a vulnerabilidade emocional.", notes: "Floral Suave, Cítrico Delicado", intensity: 75, tags: ["Esperança", "Gratidão", "Vulnerabilidade", "Encantamento"], imageUrl: "/images/aromas/flor_de_laranjeira.jpg" },
  { id: "patchouli", name: "Patchouli", category: "Presença e Firmeza", benefits: "Fortalece a confiança e o ancoramento, dissolvendo ressentimentos e medos interiores.", notes: "Terroso Intenso, Amadeirado, Úmido", intensity: 85, tags: ["Confiança", "Ressentimento", "Presença"], imageUrl: "/images/aromas/patchouli.jpg" },
  { id: "gengibre", name: "Gengibre", category: "Coragem e Impulso", benefits: "Desperta coragem indômita, determinação, superação de obstáculos e espírito de aventura.", notes: "Picante, Quente, Estimulante", intensity: 90, tags: ["Coragem", "Determinação", "Superação", "Aventura"], imageUrl: "/images/aromas/gengibre.jpg" },
  { id: "cha_verde", name: "Chá verde", category: "Serenidade e Harmonia", benefits: "Induz à paz contemplativa, paciência reflexiva, serenidade e equilíbrio interior.", notes: "Verde Puro, Herbáceo Sutil", intensity: 60, tags: ["Paz", "Serenidade", "Espera", "Humildade"], imageUrl: "/images/aromas/cha_verde.jpg" },
  { id: "tangerina", name: "Tangerina", category: "Alegria e Descontração", benefits: "Desperta o riso sincero, leveza descontraída, otimismo e expectativa positiva.", notes: "Cítrico Frutado, Espumante, Doce", intensity: 70, tags: ["Alegria", "Descontração", "Expectativa", "Surpresa"], imageUrl: "/images/aromas/tangerina.jpg" },
  { id: "capim_limao", name: "Capim-limão", category: "Liberdade e Descoberta", benefits: "Estimula a curiosidade viva, sensação de liberdade e renovação lúcida das ideias.", notes: "Cítrico Herbáceo, Limpo, Verde", intensity: 80, tags: ["Curiosidade", "Liberdade", "Frescor"], imageUrl: "/images/aromas/capim_limao.jpg" },
  { id: "grapefruit", name: "Grapefruit", category: "Empolgação e Euforia", benefits: "Desperta empolgação vibrante, euforia sadia, surpresa estimulante e ânimo elevado.", notes: "Cítrico Amargo-Doce, Revigorante", intensity: 75, tags: ["Empolgação", "Euforia", "Surpresa"], imageUrl: "/images/aromas/grapefruit.jpg" },
  { id: "vetiver", name: "Vetiver", category: "Equilíbrio e Estabilidade", benefits: "Resgata estabilidade em momentos de dúvida e desespero, promovendo persistência serena.", notes: "Amadeirado Úmido, Terroso Profundo, Raiz", intensity: 85, tags: ["Equilíbrio", "Persistência", "Dúvida", "Estabilidade"], imageUrl: "/images/aromas/vetiver.jpg" },
  { id: "iris", name: "Íris", category: "Introspecção e Dignidade", benefits: "Acolhe a melancolia e introspecção silenciosa, restaurando nobreza interior e calma reflexiva.", notes: "Floral Terroso Nobre, Atalcado", intensity: 70, tags: ["Introspecção", "Melancolia", "Dignidade"], imageUrl: "/images/aromas/iris.jpg" },
  { id: "coco", name: "Coco", category: "Prazer e Acolhimento", benefits: "Nutre a carência afetiva com sensação de prazer descontraído, aconchego e ternura leve.", notes: "Gourmand Cremoso, Doce Suave, Tropical", intensity: 75, tags: ["Prazer", "Carência", "Aconchego"], imageUrl: "/images/aromas/coco.jpg" },
  { id: "mirra", name: "Mirra", category: "Perdão e Transmutação", benefits: "Auxilia na transmutação de culpas e arrependimentos profundos, abrindo espaço para autoperdão e paz.", notes: "Resinoso Quente, Balsâmico, Nobre", intensity: 80, tags: ["Culpa", "Arrependimento", "Perdão"], imageUrl: "/images/aromas/mirra.jpg" },
];

const OFFICIAL_SENTIMENT_TO_AROMA: Record<string, string> = {
  Calma: "lavanda", Ansiedade: "camomila", Cansaço: "hortela", Tristeza: "baunilha", Raiva: "sandalo",
  Medo: "cedro", Amor: "rosa", Felicidade: "laranja", Desânimo: "bergamota", Foco: "alecrim",
  Energia: "limao", Estresse: "ylangylang", Solidão: "jasmim", Frustração: "eucalipto", Saudade: "canela",
  Criatividade: "verbena", Esperança: "flor_de_laranjeira", Confiança: "patchouli", Coragem: "gengibre",
  Concentração: "hortela", Relaxamento: "camomila", Sono: "lavanda", Motivação: "alecrim", Conforto: "baunilha",
  Romance: "rosa", Paz: "cha_verde", Alegria: "tangerina", Irritação: "eucalipto", Insegurança: "cedro",
  Nostalgia: "canela", Curiosidade: "capim_limao", Empolgação: "grapefruit", Paciência: "sandalo",
  Equilíbrio: "vetiver", Renovação: "limao", Acolhimento: "baunilha", Determinação: "gengibre",
  Serenidade: "lavanda", Clareza: "alecrim", Leveza: "bergamota", Vitalidade: "laranja",
  Introspecção: "iris", Encantamento: "jasmim", Segurança: "cedro", Gratidão: "flor_de_laranjeira",
  Prazer: "coco", Liberdade: "capim_limao", Harmonia: "sandalo", Frescor: "eucalipto",
  Descontração: "tangerina", Culpa: "mirra", Vergonha: "rosa", Inveja: "limao", Ciúme: "canela",
  Orgulho: "cedro", Alívio: "lavanda", Tensão: "eucalipto", Agitação: "hortela", Impaciência: "gengibre",
  Confusão: "alecrim", Dúvida: "vetiver", Decepção: "baunilha", Fracasso: "sandalo", Rejeição: "jasmim",
  Abandono: "camomila", Carência: "baunilha", Admiração: "jasmim", Encanto: "rosa",
  Fascinação: "ylangylang", Surpresa: "grapefruit", Perseverança: "cedro", Compaixão: "camomila",
  Empatia: "lavanda", Generosidade: "rosa", Amizade: "laranja", Pertencimento: "baunilha",
  Intimidade: "jasmim", Paixão: "ylangylang", Desejo: "canela", Espera: "cha_verde",
  Expectativa: "tangerina", Inquietação: "hortela", Vulnerabilidade: "flor_de_laranjeira",
  Melancolia: "iris", Desespero: "vetiver", Angústia: "sandalo", Pânico: "lavanda",
  Incerteza: "cedro", Apatia: "bergamota", Tédio: "limao", Frieza: "eucalipto",
  Ressentimento: "patchouli", Arrependimento: "mirra", Perdão: "lavanda", Aceitação: "sandalo",
  Superação: "gengibre", Recomeço: "limao", Tranquilidade: "lavanda", Euforia: "grapefruit",
  Apreensão: "cedro", Desconfiança: "vetiver", Timidez: "rosa", Humildade: "cha_verde",
  Satisfação: "baunilha", Descontentamento: "limao", Mágoa: "sandalo", Aflição: "camomila",
  Alarme: "eucalipto", Excitação: "gengibre", Fascínio: "jasmim", Altruísmo: "rosa",
  Solidariedade: "laranja", Autoconfiança: "cedro", Persistência: "vetiver", Humilhação: "iris",
  Inspiração: "verbena", Respeito: "cedro", Aventura: "gengibre",
};

const EMOTIONS_GUIDE = Object.entries(OFFICIAL_SENTIMENT_TO_AROMA)
  .map(([feeling, aromaId]) => {
    const aroma = AROMAS_LIST.find((a) => a.id === aromaId);
    return `- ${feeling} -> ${aroma?.name || aromaId} (id: "${aromaId}")`;
  })
  .join("\n");

const AROMAS_CATALOG = AROMAS_LIST.map(
  (a) => `- id: "${a.id}", nome: "${a.name}", categoria: "${a.category}", benefícios: "${a.benefits}"`
).join("\n");

function normalizeAudioMimeType(mimeType?: string): string {
  const base = (mimeType || "").split(";")[0].trim().toLowerCase();
  if (!base || base === "application/octet-stream") return "audio/webm";
  if (base === "video/mp4") return "audio/mp4";
  if (base === "video/webm") return "audio/webm";
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

async function readJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString("utf8"));
    } catch {
      return {};
    }
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

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
    const body = await readJsonBody(req);
    const base64Audio = String(body?.audioBase64 || "").trim();
    const clientTranscription = String(body?.transcription || "").trim();
    const mimeType = String(body?.mimeType || "audio/webm");

    const hasAudio = base64Audio.length > 500;
    const hasText = clientTranscription.length > 0;

    if (!hasAudio && !hasText) {
      return res.status(200).json({
        notHeard: true,
        errorCode: "NOT_HEARD",
        notHeardMessage:
          "Não consegui ouvir nada. Por favor, grave novamente falando mais próximo ao microfone.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        notHeard: false,
        errorCode: "MISSING_API_KEY",
        error:
          "A chave GEMINI_API_KEY não está configurada nas variáveis de ambiente do servidor.",
      });
    }

    const client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const candidateModels = ["gemini-4-hydrogen", "gemini-3.1-flash-lite"];
    let lastErrorStatus = 500;
    let lastErrorMessage = "";

    for (const modelName of candidateModels) {
      try {
        const parts: any[] = [];

        if (hasAudio) {
          parts.push({
            inlineData: {
              mimeType: normalizeAudioMimeType(mimeType),
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
          return res.status(200).json({
            notHeard: true,
            errorCode: "NOT_HEARD",
            notHeardMessage:
              parsed.notHeardMessage ||
              "Não consegui ouvir ou compreender o que você disse. Por favor, tente gravar novamente.",
          });
        }

        if (!parsed.aromaId || !parsed.emotionLabel) {
          continue;
        }

        const selectedAroma =
          AROMAS_LIST.find((a) => a.id === parsed.aromaId) || AROMAS_LIST[0];

        const alternatives: Array<{ aroma: AromaItem; reason: string }> = [];
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

        return res.status(200).json({
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
        });
      } catch (err: any) {
        const msg = String(err?.message || err || "");
        lastErrorMessage = msg;

        if (
          msg.includes("API_KEY_INVALID") ||
          msg.includes("PERMISSION_DENIED") ||
          msg.includes("403")
        ) {
          return res.status(403).json({
            notHeard: false,
            errorCode: "INVALID_API_KEY",
            error:
              "A chave GEMINI_API_KEY no servidor é inválida ou não tem permissão para acessar a API Gemini.",
          });
        }

        if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
          lastErrorStatus = 429;
        }
      }
    }

    if (lastErrorStatus === 429) {
      return res.status(429).json({
        notHeard: false,
        errorCode: "QUOTA_EXCEEDED",
        error:
          "O limite temporário de requisições da API Gemini foi atingido. Aguarde alguns instantes e tente novamente.",
      });
    }

    return res.status(502).json({
      notHeard: false,
      errorCode: "ANALYSIS_FAILED",
      error: lastErrorMessage
        ? `Não foi possível processar a análise na IA (${lastErrorMessage.slice(0, 140)}). Tente novamente.`
        : "Não foi possível processar a análise na IA no momento. Tente novamente em instantes.",
    });
  } catch (err: any) {
    return res.status(500).json({
      notHeard: false,
      errorCode: "ANALYSIS_FAILED",
      error: err?.message || "Erro interno ao processar o áudio.",
    });
  }
}
