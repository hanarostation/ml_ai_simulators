/* =====================================================================
   시뮬레이터 목록 — 메인 페이지(index.html)의 탭과 카드가 이 목록으로 그려집니다.

   ▶ 새 시뮬레이터 추가하는 법
     1) templates/simulator-template.html 을 복사해
        simulators/<분류 폴더>/<파일명>.html 로 저장하고 내용을 채웁니다.
     2) 아래 SIMULATORS 배열에 항목 하나를 추가합니다.
        - category : "ml" | "nn" | "cv" | "nlp" | "ts"  (CATEGORIES의 id)
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
    blurb: "토픽 모델링, Seq2Seq, Attention, 트랜스포머까지 문장을 다루는 모델을 한 단계씩 풀어 봅니다." },
  { id: "ts",  label: "시계열 분석", en: "Time Series", folder: "simulators/ts/",
    blurb: "추세·계절성 분해부터 ETS·ARIMA·Prophet, 롤링 예측까지 시간 순서가 있는 데이터를 예측하는 과정을 따라갑니다." }
];

window.DS_SIMULATORS = [
  /* ---------- 머신러닝 ---------- */
  {
    id: "linear-regression",
    category: "ml",
    href: "simulators/ml/linear-regression.html",
    title: "선형회귀 (최소제곱법 · 경사하강법)",
    summary: "잔차 제곱을 실제 정사각형으로 그려 최소제곱 직선을 찾고, 손실 곡면 위에서 경사하강법이 같은 답에 도달하는 과정을 학습률·배치·스케일링을 바꿔 가며 확인합니다.",
    tags: ["선형회귀", "최소제곱법", "경사하강법", "특성 스케일링"],
    glyph: "linreg"
  },
  {
    id: "logistic-regression",
    category: "ml",
    href: "simulators/ml/logistic-regression.html",
    title: "로지스틱 회귀",
    summary: "시그모이드로 질환 확률을 모델링하고, 오즈·계수 해석, 로그손실과 경사하강법, 결정 경계와 L2 규제, 임계값·ROC까지 검진 데이터로 직접 조작합니다.",
    tags: ["시그모이드", "로그손실", "결정 경계", "ROC · AUC"],
    glyph: "logreg"
  },
  {
    id: "knn",
    category: "ml",
    href: "simulators/ml/knn.html",
    title: "KNN (k-최근접 이웃)",
    summary: "새 환자와 가장 가까운 k명의 다수결로 진단을 예측합니다. 거리 종류·가중치, k에 따른 결정 경계와 과적합, 스케일링이 필요한 이유, KNN 회귀, 차원의 저주까지 조작합니다.",
    tags: ["분류 · 회귀", "거리 기반", "스케일링", "차원의 저주"],
    glyph: "knn"
  },
  {
    id: "svm",
    category: "ml",
    href: "simulators/ml/svm.html",
    title: "SVM (분류 · 회귀)",
    summary: "점을 옮기며 서포트 벡터만 경계를 정한다는 것을 확인하고, C·커널·γ·ε를 바꿔 마진과 ε-튜브의 변화를 봅니다. 쌍대 문제를 SMO로 푸는 과정과 다중 클래스까지 다룹니다.",
    tags: ["서포트 벡터", "커널 트릭", "SMO", "ε-튜브"],
    glyph: "svm"
  },
  {
    id: "decision-tree",
    category: "ml",
    href: "simulators/ml/decision-tree.html",
    title: "의사결정나무 (분류 · 회귀)",
    summary: "지니·엔트로피와 MSE 감소로 최적 기준값을 찾고, 나무가 한 노드씩 자라며 영역과 계단 예측선이 생기는 과정, 깊이에 따른 과적합을 분류·회귀 파트로 나눠 확인합니다.",
    tags: ["의사결정나무", "지니 불순도", "회귀 트리", "과적합"],
    glyph: "tree"
  },
  {
    id: "random-forest",
    category: "ml",
    href: "simulators/ml/random-forest.html",
    title: "랜덤포레스트",
    summary: "부트스트랩과 노드별 특성 무작위 선택으로 서로 다른 트리를 키우고, 투표로 경계가 매끄러워지는 과정과 OOB 오차·특성 중요도를 확인합니다.",
    tags: ["앙상블", "배깅", "OOB", "특성 중요도"],
    glyph: "forest"
  },
  {
    id: "boosting",
    category: "ml",
    href: "simulators/ml/boosting.html",
    title: "부스팅 계열 (AdaBoost · GBM · XGBoost · LightGBM)",
    summary: "같은 데이터로 네 가지 부스팅을 바꿔 가며 라운드마다 약한 학습기가 배우는 것을 따라갑니다. 샘플 가중치 갱신, 잔차, XGBoost의 g·h·Gain과 가지치기, LightGBM의 히스토그램·리프 중심 성장·GOSS를 숫자로 확인합니다.",
    tags: ["앙상블", "AdaBoost", "XGBoost", "LightGBM"],
    glyph: "boost"
  },
  {
    id: "hierarchical-clustering",
    category: "ml",
    href: "simulators/ml/hierarchical-clustering.html",
    title: "계층형 군집분석",
    summary: "단일·완전·평균·중심·Ward 연결과 분할적 DIANA로 병합(분할) 과정을 한 단계씩 따라가고, 덴드로그램을 잘라 실루엣·엘보로 군집 수를 정합니다.",
    tags: ["비지도 학습", "덴드로그램", "연결법 비교", "실루엣"],
    glyph: "hclust"
  },
  {
    id: "partitional-clustering",
    category: "ml",
    href: "simulators/ml/partitional-clustering.html",
    title: "비계층형 군집분석",
    summary: "K-means, K-means++, K-medoids, DBSCAN, Mean Shift, GMM(EM)의 반복 과정을 단계별로 따라가고, 엘보·실루엣·BIC로 군집 수를 고르며 같은 데이터에서 비교합니다.",
    tags: ["비지도 학습", "K-means", "DBSCAN", "GMM"],
    glyph: "pclust"
  },
  {
    id: "pca",
    category: "ml",
    href: "simulators/ml/pca.html",
    title: "PCA 차원 축소",
    summary: "축을 직접 돌려 분산 최대와 재구성 오차 최소가 같은 축임을 확인하고, 공분산 행렬의 고유값 분해부터 건강검진 데이터의 축소·복원, PCA의 한계까지 살펴봅니다.",
    tags: ["PCA", "고유값 분해", "차원 축소", "비지도 학습"],
    glyph: "pca"
  },
  {
    id: "association-rules",
    category: "ml",
    href: "simulators/ml/association-rules.html",
    title: "연관분석 (Apriori · FP-Growth)",
    summary: "환자 동반 진단 데이터로 지지도·신뢰도·향상도를 직접 세어 보고, Apriori의 후보 생성·가지치기와 FP-트리 구축·채굴을 한 단계씩 따라갑니다.",
    tags: ["연관규칙", "Apriori", "FP-Growth", "향상도"],
    glyph: "assoc"
  },
  {
    id: "imbalanced-sampling",
    category: "ml",
    href: "simulators/ml/imbalanced-sampling.html",
    title: "불균형 데이터 샘플링",
    summary: "SMOTE·ADASYN·Tomek·NearMiss 등 Over / Under / Combine 샘플링이 점을 어떻게 만들고 지우는지 한 단계씩 보고, 원본 분포 검증 세트에서 재현율·F1 변화를 비교합니다.",
    tags: ["불균형 데이터", "SMOTE", "imbalanced-learn", "데이터 누수"],
    glyph: "imb"
  },
  {
    id: "feature-pipeline",
    category: "ml",
    href: "simulators/ml/feature-pipeline.html",
    title: "특성공학 파이프라인",
    summary: "결측 대치 → 스케일링·인코딩 → 특성 선택 → 모델이 환자 표에서 단계마다 어떻게 바뀌는지 따라가고, fit·transform의 차이와 데이터 누수, GridSearchCV를 직접 돌려 봅니다.",
    tags: ["Pipeline", "ColumnTransformer", "데이터 누수", "GridSearchCV"],
    glyph: "pipe"
  },

  /* ---------- 신경망 ---------- */
  {
    id: "perceptron",
    category: "nn",
    href: "simulators/nn/perceptron.html",
    title: "퍼셉트론",
    summary: "노드 하나의 가중합과 활성 함수, 논리 게이트, 틀린 점마다 경계가 움직이는 학습 규칙을 따라가고, XOR을 은닉층으로 푸는 과정과 선형 붕괴를 확인합니다.",
    tags: ["퍼셉트론", "학습 규칙", "XOR · MLP", "활성 함수"],
    glyph: "perceptron"
  },
  {
    id: "backpropagation",
    category: "nn",
    href: "simulators/nn/backpropagation.html",
    title: "순전파 · 역전파 가중치 갱신",
    summary: "작은 신경망의 순전파·손실·역전파(연쇄 법칙)·가중치 갱신을 숫자 하나하나 따라가고, 학습 루프, 기울기 소실·폭발, 계산 그래프까지 조작해 봅니다.",
    tags: ["역전파", "연쇄 법칙", "학습 루프", "기울기 소실"],
    glyph: "backprop"
  },
  {
    id: "nn-playground",
    category: "nn",
    href: "simulators/nn/nn-playground.html",
    title: "신경망 구조 · 하이퍼파라미터 실험실",
    summary: "노드·층·활성 함수·학습률·배치·L2를 바꿔 학습시키고 손실·정확도·파라미터 수·시간을 기록해 비교합니다. 한 변수만 바꾸는 자동 스윕도 지원합니다.",
    tags: ["하이퍼파라미터", "과적합", "활성 함수", "성능 비교"],
    glyph: "playground"
  },
  {
    id: "nn-optimization",
    category: "nn",
    href: "simulators/nn/nn-optimization.html",
    title: "신경망 최적화 기법",
    summary: "가중치 초기화, 배치 정규화, 드롭아웃, 옵티마이저, Gradient Clipping, 조기 종료·L2 규제를 켜고 끄며 활성값 분포·기울기·손실 곡선이 어떻게 달라지는지 확인합니다.",
    tags: ["배치 정규화", "드롭아웃", "옵티마이저", "가중치 초기화"],
    glyph: "optim"
  },

  /* ---------- 컴퓨터 비전 ---------- */
  {
    id: "cnn-conv-pooling",
    category: "cv",
    href: "simulators/cv/cnn-conv-pooling.html",
    title: "CNN 합성곱 · 풀링",
    summary: "3×3 필터가 입력 위를 한 칸씩 미끄러지며 곱하고 더하는 과정과 최대·평균 풀링을 강의 예제 숫자로 따라가고, 실제 이미지의 특성맵과 CNN 전체 구조까지 확인합니다.",
    tags: ["합성곱", "풀링", "특성맵", "CNN 구조"],
    glyph: "cnn"
  },
  {
    id: "resnet-skip-connection",
    category: "cv",
    href: "simulators/cv/resnet-skip-connection.html",
    title: "ResNet 스킵 커넥션",
    summary: "잔차 블록 y = F(x) + x 안을 들여다보고, plain과 residual을 깊게 쌓았을 때 신호·기울기·훈련 손실이 어떻게 달라지는지 비교합니다.",
    tags: ["ResNet", "스킵 커넥션", "기울기 소실", "퇴화 문제"],
    glyph: "resnet"
  },
  {
    id: "image-augmentation",
    category: "cv",
    href: "simulators/cv/image-augmentation.html",
    title: "이미지 증강",
    summary: "회전·이동·확대, 밝기·대비·노이즈, Random Erasing·Mixup·CutMix를 의료영상 모사 이미지에 걸어 보고, 에폭마다 달라지는 실시간 증강과 Keras 코드까지 확인합니다.",
    tags: ["데이터 증강", "Keras", "의료영상", "정칙화"],
    glyph: "aug"
  },
  {
    id: "detection-metrics",
    category: "cv",
    href: "simulators/cv/detection-metrics.html",
    title: "객체 탐지 평가 지표",
    summary: "요추 MRI 모사 영상 위에서 IoU, TP·FP·FN 매칭, NMS를 한 단계씩 따라가고, PR 곡선으로 AP·mAP를, FROC로 허용 오탐 수 대비 민감도를 계산합니다.",
    tags: ["IoU", "NMS", "AP · mAP", "FROC"],
    glyph: "detmetric"
  },
  {
    id: "yolo-how-it-works",
    category: "cv",
    href: "simulators/cv/yolo-how-it-works.html",
    title: "YOLO 작동 원리",
    summary: "YOLOv8n이 영상을 8,400칸(P3·P4·P5)으로 나눠 DFL로 박스를 디코딩하고, conf·NMS로 거르고, TAL로 정답을 배정해 학습하는 과정을 직접 조작해 봅니다.",
    tags: ["YOLOv8", "Anchor-free", "DFL", "TAL"],
    glyph: "yolo"
  },

  /* ---------- 자연어처리 ---------- */
  {
    id: "word2vec",
    category: "nlp",
    href: "simulators/nlp/word2vec.html",
    title: "Word2Vec (Skip-gram · CBOW)",
    summary: "윈도를 밀며 학습 샘플을 만들고, 한 샘플의 순전파·역전파를 숫자로 따라간 뒤, 단어 벡터가 지도 위에서 비슷한 단어끼리 모이는 과정을 봅니다. Skip-gram과 CBOW를 골라 비교합니다.",
    tags: ["단어 임베딩", "Skip-gram", "CBOW", "네거티브 샘플링"],
    glyph: "w2v"
  },
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
    id: "rnn-family",
    category: "nlp",
    href: "simulators/nlp/rnn-family.html",
    title: "RNN 계열 모형",
    summary: "SimpleRNN · LSTM · GRU · 양방향 · Stacked RNN을 골라 의료 문장을 한 시점씩 읽으며 게이트와 은닉 상태를 실제 숫자로 따라가고, 기억 감쇠·파라미터 수·출력 shape을 비교합니다.",
    tags: ["RNN", "LSTM · GRU", "양방향 · Stacked", "게이트"],
    glyph: "rnn"
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
  },

  /* ---------- 시계열 분석 ---------- */
  {
    id: "classical-forecasting",
    category: "ts",
    href: "simulators/ts/classical-forecasting.html",
    title: "전통적 시계열 모형 (Naive · ETS · Theta)",
    summary: "나이브 계열·지수평활(SES·Holt·Holt-Winters)·Theta가 예측값을 어디서 가져오는지 한 단계씩 따라가고, 시계열 분해와 MAE·RMSE·MAPE·MASE로 모든 모형을 비교합니다.",
    tags: ["시계열 예측", "지수평활", "Theta", "MASE"],
    glyph: "ets"
  },
  {
    id: "arima",
    category: "ts",
    href: "simulators/ts/arima.html",
    title: "ARIMA 계열 (AR · MA · ARIMA · SARIMAX · VAR)",
    summary: "정상성 확인, 차분, ACF/PACF로 차수 고르기, 적합, 잔차 진단, 예측까지 Box–Jenkins 순서를 따라가고, 외생 변수 효과와 VAR의 그랜저 인과·충격반응을 확인합니다.",
    tags: ["ARIMA · SARIMAX", "ACF/PACF", "단위근 검정", "VAR"],
    glyph: "arima"
  },
  {
    id: "rolling-prediction",
    category: "ts",
    href: "simulators/ts/rolling-prediction.html",
    title: "롤링 예측 (Time Shift · Walk-forward)",
    summary: "shift로 시계열을 지도학습 표로 바꾸고, 예측 원점을 한 칸씩 굴리며 학습 → 예측 → 실제값 공개 → 오차 기록을 반복합니다. TimeSeriesSplit과 다중 스텝 전략도 비교합니다.",
    tags: ["Time Shift", "워크포워드 검증", "TimeSeriesSplit", "데이터 누수"],
    glyph: "rolling"
  },
  {
    id: "prophet",
    category: "ts",
    href: "simulators/ts/prophet.html",
    title: "Prophet 시계열 모형",
    summary: "응급실 일별 내원 수를 추세·변화점, 푸리에 계절성, 명절 효과로 나눠 하나씩 쌓아 보고, 예측 구간과 교차검증·하이퍼파라미터 튜닝까지 확인합니다.",
    tags: ["Prophet", "변화점", "푸리에 계절성", "교차검증"],
    glyph: "prophet"
  }
];
