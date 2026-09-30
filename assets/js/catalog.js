/* =====================================================================
   시뮬레이터 목록 — 메인 페이지(index.html)의 탭과 카드가 이 목록으로 그려집니다.

   ▶ 새 시뮬레이터 추가하는 법
     1) templates/simulator-template.html 을 복사해
        simulators/<분류 폴더>/<파일명>.html 로 저장하고 내용을 채웁니다.
     2) 아래 SIMULATORS 배열에 항목 하나를 추가합니다.
        - category : "ml" | "nn" | "cv" | "nlp"  (CATEGORIES의 id)
        - href     : index.html 기준 상대 경로
        - title / summary / tags : 카드에 보이는 글
        - requires : (선택) TensorFlow.js를 쓰면 "tfjs"
        - glyph    : (선택) 카드 그림 이름 (index.html의 GLYPHS). 없으면 분류 기본 그림
   ===================================================================== */

window.DS_CATEGORIES = [
  { id: "ml",  label: "머신러닝",   en: "Machine Learning",  folder: "simulators/ml/",
    blurb: "회귀·분류·군집 같은 고전 머신러닝 알고리즘이 데이터를 학습하는 과정을 조작하며 봅니다." },
  { id: "nn",  label: "신경망",     en: "Neural Networks",   folder: "simulators/nn/",
    blurb: "퍼셉트론부터 역전파까지, 신경망 안에서 숫자가 어떻게 흘러가고 바뀌는지 따라갑니다." },
  { id: "cv",  label: "컴퓨터 비전", en: "Computer Vision",   folder: "simulators/cv/",
    blurb: "합성곱·풀링·객체 탐지처럼 이미지를 다루는 모델의 계산을 눈으로 확인합니다." },
  { id: "nlp", label: "자연어처리",  en: "NLP", folder: "simulators/nlp/",
    blurb: "토픽 모델링, Seq2Seq, Attention, 트랜스포머까지 문장을 다루는 모델을 한 단계씩 풀어 봅니다." }
];

window.DS_SIMULATORS = [
  {
    id: "lda-gibbs-sampling",
    category: "nlp",
    href: "simulators/nlp/lda-gibbs-sampling.html",
    title: "LDA 깁스 샘플링",
    summary: "문서 3개·주제 2개로 단어의 주제 딱지를 떼고, 두 확률을 곱해 주사위로 새 주제를 뽑는 과정을 한 단계씩 따라갑니다.",
    tags: ["토픽 모델링", "LDA", "깁스 샘플링"],
    glyph: "lda"
  },
  {
    id: "seq2seq-attention",
    category: "nlp",
    href: "simulators/nlp/seq2seq-attention.html",
    title: "Seq2Seq · Attention",
    summary: "글자 단위 영→한 번역 모델을 브라우저에서 직접 학습하고, 인코더 → 컨텍스트 → 디코더 계산을 시점별로 비교합니다.",
    tags: ["Seq2Seq", "LSTM", "Attention", "Teacher Forcing"],
    requires: "tfjs",
    glyph: "s2s"
  },
  {
    id: "transformer",
    category: "nlp",
    href: "simulators/nlp/transformer.html",
    title: "트랜스포머",
    summary: "작은 Transformer 챗봇을 학습시키며 전체 흐름을 따라가고, 위치 인코딩과 Attention 실험실에서 값을 직접 바꿔 봅니다.",
    tags: ["Transformer", "Positional Encoding", "Self-Attention"],
    requires: "tfjs",
    glyph: "tr"
  }
];
