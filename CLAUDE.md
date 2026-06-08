# CLAUDE.md

직업계고 1학년 「국어 × 디자인」 읽기 독해 수업(2026 AI 징검다리) 산출물 작업 공간.
산출물: AI 독해 도우미 웹앱(구현 완료) · 학생 활동지(.docx) · 수업 PPT(.pptx).

## 웹앱 (구현 완료)
- `api/analyze.js` + `public/index.html`. OpenAI **`gpt-5.4-mini`** (Chat Completions).
- GPT-5 mini 규칙: `max_completion_tokens` 사용, `temperature` 미지원, `response_format: json_object`.
- 키는 `process.env.OPENAI_API_KEY`로 백엔드에서만. 모델 override는 `.env`의 `OPENAI_MODEL`.

## 하네스: 수업 산출물 제작

**목표:** 활동지(.docx)·수업 PPT(.pptx)를 다중 에이전트로 병렬 제작·검증한다.

**트리거:** 활동지/PPT 등 수업 산출물 제작·수정 요청 시 `korean-lesson-materials` 스킬을 사용하라. (예: "수업 자료 만들어줘", "활동지랑 PPT", "다중에이전트 실행", "PPT 표지만 다시", "재실행") 단순 질문은 직접 응답.

**공통 맥락(SSOT):** `00_시작하기.md` — 쉬운 한국어·격려 톤, 성취기준 [10공국1-02-03], AI 윤리·개인정보 3원칙. 명세는 `02_활동지.md`(활동지)·`03_PPT.md`(PPT).

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-08 | 초기 구성 | 전체(에이전트 3·스킬 4) | 활동지·PPT 다중 에이전트 제작 |
