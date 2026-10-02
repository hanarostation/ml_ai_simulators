/* 신경망 구조 · 하이퍼파라미터 실험실 — 알고리즘 구성도 (강의 필기자료 '신경망 복습 (1)·(2)' 양식) */
(function () {
  "use strict";
  var LABEL = "Neural Network Model";

  /* ---------------- (1) 구조와 파라미터 수 ---------------- */
  DSDiagram.register({
    id: "nn-playground-1", sim: "nn-playground", order: 1,
    title: "신경망 구조 실험실 (1) — 층 · 노드와 학습 한 단계", short: "층 · 노드 · 학습 한 단계",
    sub: "기본 설정: 원형 데이터 400점 (train 60 : validation 40) · 입력 x₁, x₂ · 은닉층 4-4 ReLU · 출력 sigmoid 1개 · Adam η = 0.03 · 배치 16",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 층(Layer)과 노드(Node) — 기본 구조 2-4-4-1", { tone: "blue" });
      k.panel(40, 164, 770, 292, { tone: "blue", tinted: true });
      k.arrow(70, 200, 790, 200, { tone: "blue", width: 3, label: "Feedforward — 입력 특성 x → 은닉층에서 특징 추출 → 출력 확률 p", labelSize: 13 });
      var cols = [
        { x: 130, ys: [298, 352], t: "gray", lab: ["x₁", "x₂"], name: "입력층 · 특성 2" },
        { x: 330, ys: [250, 300, 350, 400], t: "blue", name: "은닉층 1 · ReLU 4" },
        { x: 530, ys: [250, 300, 350, 400], t: "blue", name: "은닉층 2 · ReLU 4" },
        { x: 720, ys: [325], t: "blue", solid: true, lab: ["p"], name: "출력층 · sigmoid 1" }
      ];
      for (var c = 0; c < 3; c++) {
        var A = cols[c], B = cols[c + 1];
        A.ys.forEach(function (ya) { B.ys.forEach(function (yb) {
          var dx = B.x - A.x, dy = yb - ya, L = Math.hypot(dx, dy);
          k.arrow(A.x + dx / L * 18, ya + dy / L * 18, B.x - dx / L * 18, yb - dy / L * 18, { tone: "blue", width: 1.1, head: false });
        }); });
      }
      cols.forEach(function (col) {
        col.ys.forEach(function (y, i) {
          k.circle(col.x, y, 18, { tone: col.t, fill: col.solid ? "solid" : "tone", label: col.lab ? col.lab[i] : "", size: 14 });
        });
        k.text(col.x, 444, col.name, { size: 12.5, weight: 800, anchor: "middle", color: "ink" });
      });
      [[230, "2×4 + 4 = 12"], [430, "4×4 + 4 = 20"], [625, "4×1 + 1 = 5"]].forEach(function (p) {
        k.chip(p[0], 216, p[1], { tone: "purple", size: 12.5, h: 24, anchor: "middle" });
      });

      k.panel(826, 164, 414, 292, { tone: "purple", head: "solid", title: "파라미터 수 = Σ (입력 × 출력 + 편향)" });
      k.formula(842, 210, 382, 58, "(2×4 + 4) + (4×4 + 4) + (4×1 + 1)\n= 12 + 20 + 5 = **37개**", { size: 15, tone: "purple" });
      k.table(842, 280, [290, 92], [
        ["구조 (입력-은닉…-출력)", "파라미터"],
        ["은닉 1층 · 2노드 (2-2-1)", { t: "9", mono: true }],
        [{ t: "기본 (2-4-4-1)", tone: "purple" }, { t: "37", mono: true, weight: 800 }],
        ["은닉 3층 · 8노드 (2-8-8-8-1)", { t: "177", mono: true }],
        ["특성 7개 + 8-8-8 (7-8-8-8-1)", { t: "217", mono: true }]
      ], { rh: 27, size: 13, firstBold: false });
      k.text(842, 438, "노드 · 층 ↑ → 더 복잡한 경계 · 대신 과적합 위험 ↑", { size: 12.5, weight: 800, tone: "purple" });

      k.section(40, 488, "② 학습 한 단계 — 미니배치마다 순전파 → 손실 → 역전파 → 갱신", { tone: "green" });
      var st = [
        ["미니배치 16점", "train 240점을 섞어 나눔", "gray"],
        ["순전파", "은닉 ReLU → p = σ(z)", "blue"],
        ["손실 계산", "BCE + λ·Σw²", "orange"],
        ["역전파", "∂L/∂w 를 층마다 거꾸로", "red"],
        ["Adam 갱신", "w ← w − η·(보정된 기울기)", "purple"]
      ], bx = [];
      st.forEach(function (s, i) {
        var x = 40 + i * 245;
        bx.push(k.box(x, 502, 220, 56, { tone: s[2], title: s[0], sub: s[1], size: 15, subSize: 12.5 }));
        if (i) k.arrow(x - 22, 530, x - 3, 530, { tone: i === 4 ? "red" : "gray", width: 1.8 });
      });
      k.arrow(bx[4].cx, 560, bx[0].cx, 560, { tone: "green", dash: true, width: 1.8, via: [[bx[4].cx, 576], [bx[0].cx, 576]] });
      k.text(640, 594, "반복 — 1 에폭 = 240 ÷ 16 = 15번 갱신 · 설정을 바꾸면 가중치를 새로 초기화 (같은 seed = 같은 결과)", { size: 12.5, weight: 800, anchor: "middle", tone: "green" });

      k.panel(40, 612, 592, 88, { tone: "orange", head: "soft", title: "손실 = 이진 교차 엔트로피 (BCE)", headH: 30, titleSize: 14 });
      k.text(56, 664, "BCE = −(1/n) Σ [ y·log p + (1 − y)·log(1 − p) ]", { size: 13.5, weight: 700, color: "ink" });
      k.text(56, 688, "정답 1일 때  p = 0.9 → 0.105 · p = 0.5 → 0.693 (찍기 수준) · p = 0.2 → 1.609", { size: 12.5, color: "muted" });
      k.panel(648, 612, 592, 88, { tone: "blue", head: "soft", title: "은닉층 활성 함수", headH: 30, titleSize: 14 });
      [["**ReLU** 깊어도 기울기 유지 · 죽은 뉴런 주의", 664, 664], ["**tanh** 매끈 · 중심 0", 980, 664],
       ["**sigmoid** 깊으면 기울기 소실", 664, 688], ["**linear** 층을 쌓아도 직선 경계", 980, 688]].forEach(function (a) {
        k.text(a[1], a[2], a[0], { size: 12.5, color: "ink" });
      });
      
    }
  });

  /* ---------------- (2) 하이퍼파라미터와 진단 ---------------- */
  DSDiagram.register({
    id: "nn-playground-2", sim: "nn-playground", order: 2,
    title: "신경망 구조 실험실 (2) — 하이퍼파라미터 진단", short: "하이퍼파라미터 · 곡선 진단",
    sub: "한 번에 한 변수만 바꾸고(같은 데이터 · 같은 seed · 같은 에폭) train / validation 곡선으로 과소적합 · 과적합 · 발산을 판정한다",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 하이퍼파라미터 — 너무 크면 · 너무 작으면", { tone: "purple" });
      k.panel(40, 164, 1200, 258, { tone: "purple", tinted: true });
      k.table(52, 172, [124, 84, 370, 338, 262], [
        ["변수", "기본값", "크게 · 강하게", "작게 · 약하게", "함께 볼 것"],
        ["노드 수", "4", "경계가 복잡해짐 · 파라미터 ↑ · 과적합 위험", "경계가 단순 · 과소적합 위험", "파라미터 수 · train 정확도"],
        ["층 수", "2", "꺾인 경계를 조합 · 너무 깊으면 기울기 소실", "직선에 가까운 경계", "결정 경계 모양"],
        ["활성 함수", "ReLU", "sigmoid를 깊게 쌓으면 기울기 소실", "linear면 층을 쌓아도 직선 경계", "손실이 0.693에 머무는지"],
        ["학습률 η", "0.03", "골짜기를 넘어 튀다 발산 · 죽은 뉴런", "300 에폭 뒤에도 손실이 그대로", "손실 곡선의 기울기"],
        ["배치 크기", "16", "에폭당 갱신 수 ↓ · 안정적이지만 느림", "갱신마다 흔들림(잡음) ↑", "에폭당 갱신 = 240 ÷ 배치"],
        ["L2 규제 λ", "0", "경계가 지나치게 단순 (과소적합)", "잡음까지 외움 (과적합)", "train − val 격차"],
        ["옵티마이저", "Adam", "Adam · Momentum: 빨리 수렴, 큰 η에서 발산 주의", "SGD: 기울기 그대로 · 단순하지만 느림", "같은 에폭의 손실 비교"]
      ], { rh: 30.5, size: 13, tones: function () { return "purple"; } });

      k.section(40, 456, "② 학습 곡선으로 진단 — 판정 배지 기준", { tone: "orange", sub: "실선 = train 손실 · 점선 = validation 손실" });
      var D = [
        { n: "양호", t: "green", tr: function (s) { return 0.06 + 0.66 * Math.exp(-5 * s); }, va: function (s) { return 0.11 + 0.64 * Math.exp(-4.5 * s); },
          c: ["아래 세 가지에 해당하지 않음", "train · val이 함께 낮게 수렴"] },
        { n: "과소적합 의심", t: "amber", tr: function (s) { return 0.55 + 0.18 * Math.exp(-7 * s); }, va: function (s) { return 0.59 + 0.16 * Math.exp(-7 * s); },
          c: ["train 정확도 < 80%", "→ 노드 · 층 늘리기, 더 학습"] },
        { n: "과적합 의심", t: "orange", tr: function (s) { return 0.03 + 0.69 * Math.exp(-5 * s); }, va: function (s) { return 0.2 + 0.55 * Math.exp(-7 * s) + 0.42 * s * s; },
          c: ["정확도 격차 ≥ 5%p 또는", "val − train 손실 ≥ 0.10 → L2 · 작은 모형"] },
        { n: "발산", t: "red", tr: function (s) { return 0.7 - 0.25 * s + 1.1 * s * s * s + 0.08 * Math.sin(s * 40); }, va: function (s) { return 0.72 - 0.2 * s + 1.15 * s * s * s + 0.08 * Math.sin(s * 40 + 1); },
          c: ["손실 NaN · ∞ 또는 마지막 train 손실", "≥ 처음 × 1.5 (≥ 1) → 학습률 낮추기"], cut: 0.82 }
      ];
      D.forEach(function (d, i) {
        var x = 40 + i * 306.7, w = 293;
        k.panel(x, 470, w, 172, { tone: d.t, head: "soft", title: d.n, headH: 30, titleSize: 14.5 });
        var px = x + 30, py = 510, pw = w - 50, ph = 70, end = d.cut || 1;
        k.axes(px, py, pw, ph);
        var X = function (s) { return px + s * pw; }, Y = function (v) { return py + ph - Math.min(1.15, v) / 1.15 * ph; };
        [[d.tr, "ink", null], [d.va, d.t, "6 4"]].forEach(function (cv) {
          var p = "";
          for (var j = 0; j <= 60; j++) { var s = end * j / 60; p += (j ? " L" : "M") + X(s).toFixed(1) + " " + Y(cv[0](s)).toFixed(1); }
          k.path(p, { tone: cv[1], width: 2.4, dash: cv[2] });
        });
        if (d.cut) k.text(X(end) + 10, Y(d.tr(end)) + 6, "✕ NaN", { size: 12.5, weight: 800, tone: "red" });
        k.text(px - 6, py + 4, "손실", { size: 11.5, anchor: "end", color: "muted" });
        k.text(px + pw, py + ph + 14, "에폭 →", { size: 11.5, anchor: "end", color: "muted" });
        k.text(x + 14, 616, d.c[0], { size: 12.5, weight: 700, color: "ink" });
        k.text(x + 14, 634, d.c[1], { size: 12.5, color: "muted" });
      });

      k.flow(40, 656, [
        { t: "기준 설정 학습 · 기록", tone: "gray" }, { t: "한 변수만 바꾸기", tone: "purple" }, { t: "같은 데이터 · seed · 에폭", tone: "blue" },
        { t: "기록 표 · 곡선 겹쳐 비교", tone: "teal" }, { t: "seed 3회 평균 ± 표준편차", tone: "green" }
      ], { label: "실험 설계", h: 38, w: 1200 });
    }
  });
})();
