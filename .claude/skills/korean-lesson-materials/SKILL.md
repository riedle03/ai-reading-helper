---
name: korean-lesson-materials
description: 직업계고 1학년 국어×디자인 읽기 독해 수업 산출물(활동지 .docx + 수업 PPT .pptx)을 다중 에이전트로 제작·검증하는 오케스트레이터. worksheet-builder·slide-builder를 병렬 실행하고 material-qa로 검증한다. "수업 자료 만들어줘", "활동지랑 PPT", "교안 제작", "다중에이전트 실행", 02/03 프롬프트 작업 시 사용. 후속 — "활동지만 다시", "PPT 표지 수정", "재실행", "결과 보완", "QA 다시"도 모두 이 스킬.
---

# korean-lesson-materials — 수업 산출물 제작 오케스트레이터

직업계고 1학년 「국어 × 디자인」 읽기 독해 수업의 **활동지(.docx)와 PPT(.pptx)**를 다중 에이전트로 만든다.

**실행 모드: 서브 에이전트 (팬아웃/팬인 + 생성-검증).** 두 산출물은 독립적이고 공통 맥락만 파일로 공유하므로 팀 통신 오버헤드 없이 병렬 생성 후 QA로 검증한다.

## 팀 구성
| 에이전트 | 타입 | 역할 | 산출물 |
|----------|------|------|--------|
| worksheet-builder | general-purpose(opus) | 활동지 제작 | `materials/output/활동지_디자인직무읽기.docx` |
| slide-builder | general-purpose(opus) | PPT 제작 | `materials/output/수업PPT_디자인직무읽기.pptx` |
| material-qa | general-purpose(opus) | 산출물 검증 | `_workspace/04_material-qa_report.md` |

모든 Agent 호출에 `model: "opus"` 명시.

## Phase 0: 컨텍스트 확인 (시작 시 항상)
1. `_workspace/` 존재 + 사용자가 **부분 수정** 요청(예: "PPT 표지만") → **부분 재실행**: 해당 builder만 호출, QA 재실행.
2. `_workspace/` 존재 + **새 입력/전면 개정** → 기존을 `_workspace_prev/`로 옮기고 **새 실행**.
3. `_workspace/` 미존재 → **초기 실행**(아래 전체 흐름).

## Phase 1: 공통 맥락 브리프 작성
오케스트레이터가 `00_시작하기.md`에서 공통 맥락을 뽑아 `_workspace/00_shared-brief.md`로 저장한다(톤=쉬운 한국어·격려, 성취기준 [10공국1-02-03], AI 윤리·개인정보 3원칙). 두 builder가 이 파일을 공유 입력으로 읽는다.

## Phase 2: 병렬 생성 (팬아웃)
worksheet-builder와 slide-builder를 **동시에**(한 메시지에 두 Agent 호출, `run_in_background` 또는 병렬) 호출한다.
- 각 builder에 전달: 담당 명세 파일(02 또는 03), `_workspace/00_shared-brief.md`, 해당 스킬 경로(`.claude/skills/docx-worksheet` 또는 `pptx-slides`).
- 각자 스크립트 작성 → 실행 → 산출물 생성 → 로그 기록.

## Phase 3: 검증 (팬인 + 생성-검증)
두 builder 완료 후 material-qa를 호출한다.
- 입력: 두 산출물 경로 + 명세(02/03) + `material-qa` 스킬.
- 출력: `_workspace/04_material-qa_report.md`.

## Phase 4: 결함 수정 루프
QA가 FAIL/결함을 보고하면 해당 builder만 다시 호출해 그 결함만 수정 → QA 재검증. 모든 항목 PASS면 종료.

## 데이터 전달
- **파일 기반**(주): `materials/`(스크립트·산출물) + `_workspace/`(브리프·로그·QA리포트). 중간 파일 보존.
- **반환값 기반**(보조): 각 서브 에이전트가 핵심 요약을 메인에 반환.
- 파일명: `{phase}_{agent}_{artifact}.{ext}` (예: `02_worksheet-builder_log.md`).

## 에러 핸들링
- 한 builder 실패 시: 1회 재시도. 재실패면 그 산출물 없이 진행하고 최종 보고에 누락 명시(다른 산출물은 계속).
- python 라이브러리 미설치: builder가 `pip install` 후 재시도(이미 설치 확인됨: python-docx, python-pptx).
- QA가 산출물을 못 열면: 파일 손상으로 보고, 해당 builder 재실행.

## 완료 보고
사용자에게: 산출물 2종 경로 + QA PASS/FAIL 요약 + 실행 방법 한 줄 + "개선할 부분 있나요?" 피드백 요청(Phase 7 진화).

## 테스트 시나리오
- **정상**: 초기 실행 → 브리프 작성 → 두 builder 병렬 생성 → QA 전부 PASS → 2종 산출물 보고.
- **에러**: slide-builder가 폰트 깨짐 FAIL → slide-builder만 재호출해 폰트 지정 수정 → QA 재검증 PASS.
- **후속**: "활동지 성찰 칸 더 키워줘" → 부분 재실행(worksheet-builder만) → QA 재검증.
