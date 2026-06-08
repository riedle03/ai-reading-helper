// ============================================================
// AI 독해 도우미 — 분석 API (서버리스 함수 / 키 숨김용 백엔드)
// ------------------------------------------------------------
// 역할: 학생이 보낸 글을 OpenAI로 분석해 JSON으로 돌려준다.
//       OpenAI 키는 절대 프런트엔드로 보내지 않고, 이 서버 함수 안에서만 사용한다.
//       (프런트엔드는 같은 도메인의 /api/analyze 만 호출 → CORS 불필요)
//
// 모델: gpt-5.4-mini (Chat Completions)
//   - GPT-5 mini 계열은 max_completion_tokens 사용. temperature 미지원.
//   - response_format: { type: "json_object" } 로 구조화 출력.
//
// 요청  POST /api/analyze
//   { "text": "분석할 디자인 직무 글" }
//
// 응답  200 (성공)
//   {
//     "vocab":     [ { "word": "용어", "meaning": "쉬운 풀이" }, ... ],
//     "summaries": [ { "paragraph": 1, "summary": "문단 요약" }, ... ],
//     "keywords":  [ "핵심어1", "핵심어2", ... ],
//     "questions": [ { "q": "질문", "answer": "모범답안", "hint": "힌트" }, ... ]
//   }
// ============================================================

import OpenAI from "openai";

const MAX_INPUT_CHARS = 8000;

const SYSTEM_PROMPT = `당신은 직업계고 1학년 학생의 읽기를 돕는 친절한 국어 선생님입니다.
학생이 붙여넣은 '디자인 직무 관련 글'을 분석해, 반드시 아래 JSON 형식으로만 답하세요.
모든 설명은 직업계고 1학년이 이해할 수 있는 쉬운 한국어로, 짧고 또렷하게 씁니다.

JSON 형식(이 키들만, 다른 텍스트 없이):
{
  "vocab":     [ { "word": "글 속 어려운 낱말/전문용어", "meaning": "쉬운 뜻풀이" } ],
  "summaries": [ { "paragraph": 1, "summary": "그 문단의 한두 문장 요약" } ],
  "keywords":  [ "글에서 중요한 핵심어" ],
  "questions": [ { "q": "이해 점검 질문", "answer": "모범답안", "hint": "막혔을 때 볼 힌트" } ]
}

규칙:
- vocab: 정말 어려운 낱말만 3~8개. 쉬운 낱말은 넣지 않습니다.
- summaries: 원문 문단 순서대로, paragraph 는 1부터 시작하는 문단 번호.
- keywords: 5~10개, 글에 실제로 나온 핵심어.
- questions: 3~5개. answer 는 모범답안, hint 는 답을 바로 알려주지 않는 살짝 도움말.
- 글에 없는 내용을 지어내지 마세요. 모르면 비워 둡니다.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  // 키 존재 확인
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "서버에 OPENAI_API_KEY가 설정되지 않았습니다." });
  }

  // 입력 검증
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    return res.status(400).json({ error: "분석할 글을 입력해 주세요." });
  }
  if (text.length > MAX_INPUT_CHARS) {
    return res.status(400).json({
      error: `글이 너무 깁니다. ${MAX_INPUT_CHARS.toLocaleString()}자 이내로 줄여 주세요. (현재 ${text.length.toLocaleString()}자)`,
    });
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID,
  });

  try {
    const completion = await client.chat.completions.create({
      model,
      // GPT-5 mini 계열은 max_completion_tokens 사용. temperature 미지원.
      max_completion_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return res.status(502).json({ error: "AI 응답이 비어 있습니다. 잠시 후 다시 시도해 주세요." });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "AI 응답을 해석하지 못했습니다. 다시 시도해 주세요." });
    }

    // 형식 정규화 — 누락된 키는 빈 배열로 채워 프런트엔드가 안전하게 렌더하도록.
    return res.status(200).json({
      vocab: Array.isArray(parsed.vocab) ? parsed.vocab : [],
      summaries: Array.isArray(parsed.summaries) ? parsed.summaries : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return res.status(502).json({ error: `분석 중 오류가 발생했습니다: ${msg}` });
  }
}
