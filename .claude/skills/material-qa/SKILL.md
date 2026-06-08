---
name: material-qa
description: 활동지(.docx)·PPT(.pptx) 산출물이 명세대로 만들어졌는지 검증하는 방법. 파일 존재·열림·한글 깨짐·명세 항목 충족을 python-docx/python-pptx로 텍스트 추출해 교차 비교. 산출물 검증·QA·품질 점검을 요청하거나 활동지/PPT 생성 직후 사용.
---

# material-qa — 산출물 검증 방법론

"파일이 생겼다"가 아니라 "명세 항목이 실제로 들어갔다"를 확인한다. 추출 → 명세 대조가 핵심.

## 왜 이렇게 하나
- 빌더가 스크립트를 돌려 "성공"이라 해도, 명세 항목 일부가 누락되거나 한글이 깨졌을 수 있다. 산출물을 직접 열어 텍스트를 뽑아 대조해야 진짜 검증이다.
- 읽기 전용 추정은 금물 — 실제로 스크립트를 실행해 내용을 읽는다.

## 검증 스크립트 패턴

### docx 텍스트 추출
```python
from docx import Document
d = Document("materials/output/활동지_디자인직무읽기.docx")
paras = [p.text for p in d.paragraphs if p.text.strip()]
tables = [[c.text for row in t.rows for c in row.cells] for t in d.tables]
print("문단수:", len(paras), "표수:", len(d.tables))
print("\n".join(paras)[:1500])
```

### pptx 텍스트 추출
```python
from pptx import Presentation
p = Presentation("materials/output/수업PPT_디자인직무읽기.pptx")
print("슬라이드수:", len(p.slides))
for i, s in enumerate(p.slides, 1):
    txt = " | ".join(sh.text_frame.text for sh in s.shapes if sh.has_text_frame and sh.text_frame.text.strip())
    print(f"{i}: {txt[:120]}")
```

### 한글 깨짐 의심 탐지
- 추출 텍스트에 `□`(U+25A1) 또는 비정상 치환 문자가 다수면 폰트 깨짐 의심으로 보고.
- 폰트 지정 확인: docx run의 `rFonts eastAsia`, pptx run의 `a:ea typeface`가 `맑은 고딕`인지 표본 점검.

## 체크리스트

### 활동지(.docx)
- [ ] 파일 존재 + 정상 열림(예외 없이 추출됨)
- [ ] 머리말(제목·학습목표·학번/이름/날짜) 존재
- [ ] 7개 구역 모두 존재: 0.오늘읽을글 / 1.스스로읽기 / 2.AI도우미활용(어휘·문단요약·핵심어) / 3.핵심정리 / 4.이해점검 / 5.한문장요약 / 6.성찰
- [ ] "AI 요약을 그대로 베끼지 말고 자기 말로" 안내 문구 포함
- [ ] 손으로 쓸 표/빈칸 존재(표 ≥ 3개 권장)
- [ ] 한글 깨짐 없음

### PPT(.pptx)
- [ ] 파일 존재 + 슬라이드 11장
- [ ] 1~11 주제가 명세 순서와 일치(표지→동기→목표→소개→주의점→활동1~4→정리→다음시간)
- [ ] 4번에 웹앱 주소/QR placeholder 텍스트 존재
- [ ] 5번에 AI 주의점 4개(개인정보·오류·보조도구·베끼지말기) 반영
- [ ] 16:9 (slide_width=12192000 EMU 근처) + 한글 깨짐 없음

## 출력
`_workspace/04_material-qa_report.md`에 산출물별 PASS/FAIL 표 + 체크리스트 결과 + 결함 목록(위치·근거) + 어느 builder가 무엇을 고칠지 권고. 통과 항목도 함께 적어 신뢰를 준다.

## 원칙
검증만 한다. 산출물을 수정·삭제하지 않는다. 결함은 해당 builder에게 넘긴다.
