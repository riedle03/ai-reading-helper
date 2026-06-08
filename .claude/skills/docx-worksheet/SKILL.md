---
name: docx-worksheet
description: 직업계고 1학년 국어×디자인 읽기 수업용 인쇄 활동지(.docx)를 python-docx로 만드는 방법. 한글 폰트(맑은 고딕) 안 깨지게 지정, 손으로 쓰는 표/빈칸, 머리말 음영, A4 세로 레이아웃 패턴. 활동지·워크시트·.docx·학습지 제작을 요청하거나 02_활동지.md 작업 시 사용. "활동지 다시", "표 칸 추가", "줄간격 넓혀" 같은 후속 수정도 포함.
---

# docx-worksheet — python-docx 활동지 제작

직업계고 1학년이 펜으로 채우는 인쇄용 A4 활동지를 만드는 방법론. 명세는 항상 `02_활동지.md`가 SSOT다.

## 왜 이렇게 하나
- **한글 폰트를 명시 지정하는 이유**: python-docx 기본 폰트는 한글 글리프가 없어 인쇄 시 깨지거나 네모(□)로 나온다. `맑은 고딕`을 라틴·East Asian 양쪽에 걸어야 안전하다.
- **표 행 높이를 키우는 이유**: 학생이 손으로 쓰는 활동지다. 화면용 표 높이로는 답을 쓸 칸이 없다.
- **머리말만 옅은 음영**: 인쇄·복사가 잘 되도록 과한 색은 피하고 구역 구분만 한다.

## 핵심 패턴

### 1. 한글 폰트 안 깨지게 (필수)
```python
from docx import Document
from docx.shared import Pt
from docx.oxml.ns import qn

def set_korean_font(run, name="맑은 고딕", size=11, bold=False):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    # East Asian 글꼴 속성까지 지정해야 한글이 깨지지 않는다
    run._element.rPr.rFonts.set(qn('w:eastAsia'), name)

# 문서 기본 스타일에도 한글 폰트 적용
doc = Document()
style = doc.styles['Normal']
style.font.name = "맑은 고딕"
style.element.rPr.rFonts.set(qn('w:eastAsia'), "맑은 고딕")
style.font.size = Pt(11)
```

### 2. A4 세로 + 여백
```python
from docx.shared import Mm
sec = doc.sections[0]
sec.page_width, sec.page_height = Mm(210), Mm(297)
sec.top_margin = sec.bottom_margin = Mm(15)
sec.left_margin = sec.right_margin = Mm(18)
```

### 3. 머리말 음영 박스 (구역 구분)
```python
from docx.oxml import OxmlElement
def shade_cell(cell, fill="EFEFEF"):
    sh = OxmlElement('w:shd'); sh.set(qn('w:fill'), fill)
    cell._tc.get_or_add_tcPr().append(sh)
```
머리말은 1×1 또는 1×N 표에 옅은 회색(EFEFEF) 음영으로. 제목·학습목표·학번/이름/날짜 칸.

### 4. 손으로 쓰는 표 (행 높이 확보)
```python
from docx.enum.table import WD_ROW_HEIGHT_RULE
def add_write_table(doc, headers, rows=4, row_h_mm=12):
    t = doc.add_table(rows=1, cols=len(headers)); t.style = "Table Grid"
    for i, h in enumerate(headers):
        r = t.rows[0].cells[i].paragraphs[0].add_run(h); set_korean_font(r, bold=True)
    for _ in range(rows):
        row = t.add_row(); row.height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST; row.height = Mm(row_h_mm)
    return t
```
- 빈칸이 많은 표(스스로 읽기, 어휘 정리)는 행 높이 12~16mm.
- "내 말로 다시 쓰기" 칸은 더 넉넉히.

## 02_활동지.md 필수 항목 (빠뜨리지 말 것)
머리말(제목「디자인 직무 글, 제대로 읽기」·학습목표 한 줄·학번/이름/날짜) → 0.오늘 읽을 글(빈 박스/별지 안내) → 1.스스로 읽기(낱말|짐작한 뜻) → 2.AI 도우미 활용(어휘 3열표 / 문단요약표+"베끼지 말고 내 말로" 안내 / 핵심어 3~5개) → 3.핵심 정리(중심내용·의도·직무적용) → 4.이해 점검(질문·내 답 2~3칸) → 5.한 문장 요약 → 6.성찰(SEL/AI윤리: 도움된 점·아쉬운 점·앞으로 활용법).

각 항목마다 짧고 친절한 안내 문구를 붙인다(쉬운 한국어, 격려 톤).

## 출력
- 스크립트 `materials/make_worksheet.py`, 산출물 `materials/output/활동지_디자인직무읽기.docx`
- `os.makedirs("materials/output", exist_ok=True)` 로 출력 폴더 보장
- 1~2장 분량. 실행 후 `print`로 저장 경로 안내.

## 완료 기준
실행하면 docx가 생성되고, 위 7개 구역이 모두 표/박스로 들어가며, 한글이 깨지지 않고, 손으로 쓸 빈칸이 충분하다.
