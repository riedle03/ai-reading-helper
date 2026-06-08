---
name: pptx-slides
description: 직업계고 1학년 국어×디자인 읽기 수업용 슬라이드(.pptx, 11장, 16:9)를 python-pptx로 만드는 방법. 한글 폰트(맑은 고딕) 안 깨지게, 제목/본문 위계, 네이비·블루 단일 톤, 큰 글씨·넉넉한 여백, 4번 슬라이드 QR placeholder 패턴. 수업 PPT·슬라이드·프레젠테이션 제작을 요청하거나 03_PPT.md 작업 시 사용. "표지만 다시", "슬라이드 추가", "글씨 키워" 같은 후속 수정도 포함.
---

# pptx-slides — python-pptx 수업 슬라이드 제작

교사가 교실 앞에서 띄우는 수업용 슬라이드 11장(16:9)을 만드는 방법론. 명세는 항상 `03_PPT.md`가 SSOT다.

## 왜 이렇게 하나
- **모든 run에 한글 폰트 지정**: python-pptx도 East Asian 폰트를 따로 안 걸면 한글이 깨진다. run마다 `맑은 고딕`을 라틴·eastAsia 양쪽에 건다.
- **글머리 3~5개·큰 글씨**: 교실 뒤에서도 읽혀야 한다. 글이 많으면 슬라이드를 쪼개지 말고 핵심만 남긴다.
- **단일 톤**: 네이비/블루 포인트 하나로 통일해 차분하게. 슬라이드마다 색이 바뀌면 산만하다.

## 핵심 패턴

### 1. 16:9 캔버스
```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.oxml.ns import qn

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
NAVY = RGBColor(0x1F, 0x3A, 0x5F); BLUE = RGBColor(0x2D, 0x6C, 0xDF); INK = RGBColor(0x22, 0x2A, 0x33)
```

### 2. 한글 폰트 안 깨지게 (필수 — 모든 run에)
```python
def set_font(run, size, color=INK, bold=False, name="맑은 고딕"):
    run.font.size = Pt(size); run.font.bold = bold
    run.font.color.rgb = color; run.font.name = name
    run.font._rPr.set(qn('a:ea'), name)  # East Asian 폰트
    ea = run.font._rPr.find(qn('a:ea'))
    if ea is None:
        ea = run.font._rPr.makeelement(qn('a:ea'), {}); run.font._rPr.append(ea)
    ea.set('typeface', name)
```
실무 안전판: `run.font.name="맑은 고딕"` 설정 후 rPr에 `<a:ea typeface="맑은 고딕"/>`를 보장한다.

### 3. 빈 레이아웃 + 텍스트박스 (일관 제어)
```python
blank = prs.slide_layouts[6]
def add_slide():
    return prs.slides.add_slide(blank)

def add_textbox(slide, l, t, w, h):
    tb = slide.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    return tf
```

### 4. 제목/본문 위계
- 제목: 32~40pt bold, NAVY. 본문 글머리: 22~26pt, INK.
- 상단 컬러 바(NAVY 얇은 사각형)나 좌측 강조선으로 제목 영역을 분리하면 위계가 또렷하다.
- 활동 슬라이드(6~9)는 좌상단에 번호 배지(원/둥근 사각 + "활동 N")로 단계가 한눈에 보이게.

### 5. 4번 슬라이드 QR placeholder
```python
# 점선 테두리 사각형 + 안내 텍스트
ph = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(9.5), Inches(2.2), Inches(2.6), Inches(2.6))
# fill 없음/연회색, 안에 "여기에 웹앱 주소·QR" 텍스트
```
웹앱 주소와 QR 들어갈 자리임을 텍스트로 분명히 표기.

## 03_PPT.md 슬라이드 11장 (순서·주제 고정)
1.표지 2.디자인 현장의 '읽기'(동기) 3.오늘의 목표 4.AI 독해 도우미 소개(+QR자리) 5.AI 사용 주의점(개인정보·오류·보조도구·베끼지말기) 6.활동1 스스로읽기 7.활동2 AI비계 8.활동3 핵심정리 9.활동4 짝·모둠점검 10.정리(한문장요약+소감) 11.다음시간.

5번 주의점·관련 슬라이드에 AI 윤리/개인정보 원칙을 일관되게 담는다.

## 출력
- 스크립트 `materials/make_slides.py`, 산출물 `materials/output/수업PPT_디자인직무읽기.pptx`
- `os.makedirs("materials/output", exist_ok=True)`, 실행 후 저장 경로 print.

## 완료 기준
실행하면 11장 pptx가 생성되고, 순서·주제가 명세와 일치하며, 한글이 깨지지 않고, 4번에 QR 자리가 있고, 글씨가 크고 톤이 통일돼 있다.
