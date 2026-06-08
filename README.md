# AI 독해 도우미 (직업계고 국어 × 디자인)

2026 「AI 징검다리」 프로그램 — 디자인 직무 글 읽기 독해 수업을 위한 작업 공간입니다.
**실제 구현은 Claude Code로** 진행합니다. 이 저장소에는 환경 세팅과 구현용 프롬프트가 들어 있습니다.

## 폴더 구조
```
ai-reading-helper/
├── README.md            ← 이 문서
├── .env.example         ← OpenAI 키 설정 예시 (.env 로 복사해 사용)
├── .gitignore
├── package.json
├── vercel.json
├── public/
│   └── index.html       ← 프런트엔드 (스텁 → 01_웹앱.md로 구현)
├── api/
│   └── analyze.js       ← 백엔드 서버리스 함수 (키 숨김, 스텁 → 01_웹앱.md로 구현)
├── materials/
│   └── requirements.txt ← 활동지/PPT 생성용 파이썬 라이브러리
└── prompts/
    ├── 00_시작하기.md    ← 먼저 읽기 (공통 맥락·작업 순서)
    ├── 01_웹앱.md        ← 웹앱 구현 프롬프트
    ├── 02_활동지.md      ← 활동지(.docx) 프롬프트
    └── 03_PPT.md         ← 수업 PPT(.pptx) 프롬프트
```

## 시작하기
1. 이 폴더를 열고 Claude Code를 실행합니다.
2. `prompts/00_시작하기.md` 를 먼저 읽습니다.
3. `prompts/01 → 02 → 03` 순서대로 내용을 복사해 Claude Code에 붙여넣어 구현합니다.

## 웹앱 키 설정 & 배포 (OpenAI / Vercel 기준)
1. https://platform.openai.com 에서 API 키 발급
2. `.env.example` 을 `.env` 로 복사하고 `OPENAI_API_KEY` 입력 (`.env` 는 깃에 올라가지 않음)
3. 로컬 테스트: `npx vercel dev` → http://localhost:3000
4. 배포: `npx vercel` → Vercel 대시보드에서 환경변수 `OPENAI_API_KEY`, `OPENAI_MODEL` 등록
5. 배포 URL을 학생에게 QR/링크로 공유 (PPT 4번 슬라이드에 넣을 자리 있음)

## 비용 / 모델
- 기본 모델은 저렴한 `gpt-4o-mini` 로 설정. 최신 모델명·단가는 platform.openai.com/docs/models 에서 확인 후 `.env`의 `OPENAI_MODEL` 교체.
- 학급 규모 사용이면 비용은 대체로 소액이나, 사용량·예산은 OpenAI 대시보드에서 한도(usage limit)를 걸어 관리하세요.

## 개인정보 · AI 윤리 (수업과 연결)
- 학생 입력 텍스트는 분석을 위해 OpenAI로 전송됩니다. **이름·연락처 등 개인정보 입력 금지**를 화면과 수업에서 안내하세요.
- 서울시교육청 'AI·에듀테크 공교육 도입 및 활용' 기준에 맞춰 사용 범위를 점검하세요.
- "AI는 틀릴 수 있으니 원문과 대조", "보조 도구로만 활용" 원칙을 수업·활동지·PPT에 일관되게 담았습니다.
