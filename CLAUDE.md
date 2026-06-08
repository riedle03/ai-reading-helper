# CLAUDE.md

직업계고 1학년 「국어 × 디자인」 읽기 독해 수업(2026 AI 징검다리) 작업 공간.
**산출물 3종:** AI 독해 도우미 웹앱(배포 완료) · 학생 활동지(.docx) · 수업 PPT(.pptx).

## 명령어
```bash
# 웹앱 — 로컬 실행 / 배포
npm install
npx vercel dev                      # http://localhost:3000
git push origin main                # → Vercel 자동 배포 (직접 vercel --prod 금지)

# 수업 산출물 (재)생성  ※ Windows 콘솔 한글 깨지면 앞에 PYTHONUTF8=1
python materials/make_worksheet.py  # → materials/output/활동지_디자인직무읽기.docx
python materials/make_slides.py     # → materials/output/수업PPT_디자인직무읽기.pptx
```

## 배포 (라이브)
- **학생 주소:** https://ai-reading-helper-five.vercel.app (로그인 불필요·공개)
- **GitHub:** https://github.com/riedle03/ai-reading-helper (Public) — `main` 푸시 시 Vercel 자동 배포
- **환경변수(Vercel):** `OPENAI_API_KEY`, `OPENAI_MODEL` — Prod/Preview/Dev 등록됨
- 로컬 키는 `.env`에만(=.gitignore 제외, 절대 커밋 금지). PPT 4번 슬라이드에 학생 주소 QR 포함.

## 구조
```
api/analyze.js        백엔드 — OpenAI 호출 (키 숨김)
public/index.html     프런트 — 원문 입력 + 4영역 결과(어휘/요약/핵심어/질문)
materials/            make_worksheet.py · make_slides.py (출력은 output/, gitignore)
00_시작하기.md         공통 맥락(SSOT)  /  01·02·03_*.md  각 산출물 명세
.claude/              하네스 (에이전트 3 · 스킬 4)
```

## 웹앱 핵심 (gpt-5 mini 규칙 — 중요)
- OpenAI **`gpt-5.4-mini`**, Chat Completions, `response_format: json_object`.
- GPT-5 mini 계열은 `max_completion_tokens` 사용(`max_tokens` 아님), **`temperature` 미지원**(넣으면 오류).
- 키는 `process.env.OPENAI_API_KEY`로 백엔드에서만. 모델 override는 `OPENAI_MODEL`.

## 하네스: 수업 산출물 제작
**트리거:** 활동지/PPT 제작·수정 요청 시 `korean-lesson-materials` 스킬 사용. (예: "수업 자료 만들어줘", "활동지랑 PPT", "다중에이전트 실행", "PPT 표지만 다시", "재실행") 단순 질문은 직접 응답.
**SSOT:** `00_시작하기.md`(쉬운 한국어·격려 톤, 성취기준 [10공국1-02-03], AI 윤리·개인정보 3원칙). 명세 = `02_활동지.md`·`03_PPT.md`.

## Gotchas
- **한글 콘솔 깨짐**: Windows에서 python `print`/`curl`로 한글 보낼 때 cp949로 깨짐. 검증은 `PYTHONUTF8=1` 또는 UTF-8 파일(`--data-binary @file`)로. 앱·산출물 자체는 정상.
- **Vercel 보호**: 해시가 붙은 미리보기 URL은 로그인 보호(401), 운영 도메인(`-five`)은 공개. 학생 배포는 운영 도메인 사용.
- **OpenAI 한도**: 공개 API이므로 platform.openai.com/settings/organization/limits 에서 월 예산($10) 설정 권장(대시보드 전용, 코드/CLI 불가).

## 변경 이력
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-06-08 | 초기 구성 | 전체(에이전트 3·스킬 4) | 활동지·PPT 다중 에이전트 제작 |
| 2026-06-08 | 웹앱 gpt-5.4-mini 구현 | api/analyze.js·public | 독해 도우미 백엔드/프런트 |
| 2026-06-08 | GitHub→Vercel 배포·라이브 검증 | 배포 | 학생 공개 서비스 가동 |
| 2026-06-08 | PPT 4번 QR·주소 삽입 | make_slides.py | 학생 접속 동선 |
