/* 순전파 · 역전파 — 알고리즘 구성도 (강의 필기자료 '신경망 복습 (2) 작동 원리' 양식)
   예제: Mazur 2-2-2 신경망 (x = (0.05, 0.10), t = (0.01, 0.99), 은닉·출력 sigmoid, MSE ½(ŷ − t)², η = 0.5) */
(function () {
  "use strict";
  var LABEL = "Neural Network Model";
  function seg(a, b, ra, rb) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [a[0] + dx / L * ra, a[1] + dy / L * ra, b[0] - dx / L * rb, b[1] - dy / L * rb];
  }

  /* ---------------- (1) 순전파 ---------------- */
  DSDiagram.register({
    id: "backpropagation-1", sim: "backpropagation", order: 1,
    title: "역전파 (1) — 순전파: 숫자로 따라가기", short: "순전파 숫자 따라가기",
    sub: "2-2-2 신경망 예제 · 입력 x = (0.05, 0.10), 정답 t = (0.01, 0.99) · 은닉층 · 출력층 모두 sigmoid · 손실 MSE ½(ŷ − t)²",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 순전파 (Feedforward) — 입력이 층을 타고 가며 예측값과 손실을 계산", { tone: "blue" });
      k.panel(40, 164, 780, 334, { tone: "blue", tinted: true });
      k.arrow(64, 210, 796, 210, { tone: "blue", width: 3, label: "Feedforward (순전파) — 입력 x → 은닉층 → 출력층 → 예측값 ŷ → 손실 L", labelSize: 13.5 });
      var XI = 120, XH = 372, XO = 612, Y = [298, 406];
      [["입력층", XI], ["은닉층 (σ)", XH], ["출력층 (σ)", XO], ["손실", 748]].forEach(function (c) {
        k.text(c[1], 236, c[0], { size: 12.5, weight: 800, anchor: "middle", color: "muted" });
      });
      var W1 = [["w₁ = 0.15", 0, 0], ["w₂ = 0.20", 1, 0], ["w₃ = 0.25", 0, 1], ["w₄ = 0.30", 1, 1]];
      var W2 = [["w₅ = 0.40", 0, 0], ["w₆ = 0.45", 1, 0], ["w₇ = 0.50", 0, 1], ["w₈ = 0.55", 1, 1]];
      function edges(list, xa, xb) {
        list.forEach(function (e) {
          var a = [xa, Y[e[1]]], b = [xb, Y[e[2]]], s = seg(a, b, 30, 31);
          k.arrow(s[0], s[1], s[2], s[3], { tone: "blue", width: 1.8 });
        });
        list.forEach(function (e) {
          var a = [xa, Y[e[1]]], b = [xb, Y[e[2]]], t = 0.33;
          var cx = a[0] + (b[0] - a[0]) * t, cy = a[1] + (b[1] - a[1]) * t;
          k.box(cx - 40, cy - 11, 80, 22, { tone: "green", fill: "plain", title: e[0], size: 12.5, r: 5 });
        });
      }
      edges(W1, XI, XH); edges(W2, XH, XO);
      k.circle(XI, Y[0], 30, { tone: "gray", fill: "tone", label: "0.05", size: 15 });
      k.circle(XI, Y[1], 30, { tone: "gray", fill: "tone", label: "0.10", size: 15 });
      k.circle(XH, Y[0], 30, { tone: "blue", fill: "tone", label: "0.5933", size: 13.5 });
      k.circle(XH, Y[1], 30, { tone: "blue", fill: "tone", label: "0.5969", size: 13.5 });
      k.circle(XO, Y[0], 30, { tone: "blue", fill: "solid", label: "0.7514", size: 13.5 });
      k.circle(XO, Y[1], 30, { tone: "blue", fill: "solid", label: "0.7729", size: 13.5 });
      k.text(XI, 260, "x₁", { size: 14, weight: 800, anchor: "middle", color: "ink" });
      k.text(XI, 456, "x₂", { size: 14, weight: 800, anchor: "middle", color: "ink" });
      k.text(XH, 260, "h₁ · b₁ = 0.35", { size: 13, weight: 800, anchor: "middle", tone: "blue" });
      k.text(XH, 456, "h₂ · b₂ = 0.35", { size: 13, weight: 800, anchor: "middle", tone: "blue" });
      k.text(XO, 260, "ŷ₁ · b₃ = 0.60", { size: 13, weight: 800, anchor: "middle", tone: "blue" });
      k.text(XO, 456, "ŷ₂ · b₄ = 0.60", { size: 13, weight: 800, anchor: "middle", tone: "blue" });
      k.arrow(642, Y[0], 688, Y[0], { tone: "blue", width: 2.4 });
      k.arrow(642, Y[1], 688, Y[1], { tone: "blue", width: 2.4 });
      k.box(690, 256, 118, 194, { tone: "red", title: "손실 함수", size: 14, lines: [
        { t: "t₁ = 0.01", color: "muted", size: 13 }, { t: "L₁ = 0.2748", tone: "red", weight: 700, size: 13 },
        { t: "t₂ = 0.99", color: "muted", size: 13 }, { t: "L₂ = 0.0236", tone: "red", weight: 700, size: 13 },
        { t: "L = 0.2984", tone: "red", weight: 800, size: 14.5 }] });
      k.arrow(796, 484, 64, 484, { tone: "red", width: 3, label: "Backpropagation (역전파) — 손실의 기울기를 출력층 → 입력층 방향으로 전달하며 Weight 갱신 · (2)", labelSize: 13 });

      k.panel(836, 164, 404, 334, { tone: "blue", head: "solid", title: "순전파 계산 전개", right: "σ(z) = 1 / (1 + e⁻ᶻ)" });
      k.lines(852, 222, [
        { t: "① 은닉층 가중합  z = Σ w·x + b", tone: "blue", weight: 800 },
        "z(h₁) = 0.15×0.05 + 0.20×0.10 + 0.35 = **0.3775**",
        "z(h₂) = 0.25×0.05 + 0.30×0.10 + 0.35 = **0.3925**",
        { t: "② 활성값  a = σ(z)", tone: "blue", weight: 800 },
        "a(h₁) = σ(0.3775) = **0.5933** ,  a(h₂) = **0.5969**",
        { t: "③ 출력층", tone: "blue", weight: 800 },
        "z(o₁) = 0.40×0.5933 + 0.45×0.5969 + 0.60 = 1.1059",
        "  → ŷ₁ = σ(1.1059) = **0.7514**",
        "z(o₂) = 0.50×0.5933 + 0.55×0.5969 + 0.60 = 1.2249",
        "  → ŷ₂ = σ(1.2249) = **0.7729**",
        { t: "④ 손실  L = Σ ½(ŷ − t)²", tone: "red", weight: 800 },
        "½(0.7514 − 0.01)² + ½(0.7729 − 0.99)²",
        { t: "= 0.2748 + 0.0236 = **0.2984**", tone: "red", weight: 700 }
      ], { size: 13, lh: 20.5, color: "ink" });

      k.section(40, 530, "② Training Loop — 이 왕복을 반복하는 것이 「학습」", { tone: "green" });
      var steps = [
        ["1  초기화", "Weight를 임의의 값으로 시작", "gray"],
        ["2  순전파", "ŷ = (0.7514, 0.7729)", "blue"],
        ["3  손실 계산", "L = 0.2984 (실제값과 비교)", "orange"],
        ["4  역전파 · 갱신", "w ← w − η·∂L/∂w  (η = 0.5)", "red"],
        ["5  반복", "1회 갱신 뒤 L = 0.2805", "green"]
      ];
      var bx = [];
      steps.forEach(function (s, i) {
        var x = 40 + i * 245;
        bx.push(k.box(x, 544, 220, 60, { tone: s[2], title: s[0], sub: s[1], size: 15, subSize: 12.5 }));
        if (i) k.arrow(x - 22, 574, x - 3, 574, { tone: "gray", width: 1.8 });
      });
      k.arrow(bx[4].cx, 606, bx[1].cx, 606, { tone: "green", dash: true, width: 1.8, via: [[bx[4].cx, 622], [bx[1].cx, 622]] });
      k.text((bx[4].cx + bx[1].cx) / 2, 641, "2 → 3 → 4 반복 (1 Epoch = 전체 학습 데이터를 한 바퀴)", { size: 12.5, weight: 800, anchor: "middle", tone: "green" });
      k.note(40, 656, 1200, 38, { tone: "gray", title: "Loss = 샘플 하나의 오차 · Cost = 전체 평균 손실 — 신경망 출력의 제어 지표이자, 각 노드의 Weight가 갱신되는 근거", size: 13.5 });
    }
  });

  /* ---------------- (2) 역전파 · 갱신 ---------------- */
  DSDiagram.register({
    id: "backpropagation-2", sim: "backpropagation", order: 2,
    title: "역전파 (2) — 연쇄 법칙으로 기울기를 거꾸로 전달", short: "연쇄 법칙 · 가중치 갱신",
    sub: "∂L/∂w = 상류에서 온 기울기 × 로컬 기울기 · 출력층 δ를 먼저 구하고 가중치를 거슬러 은닉층 δ를 만든 뒤, w ← w − η·∂L/∂w (η = 0.5)",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 출력층 가중치 w₅ (h₁ → o₁) — 로컬 기울기 세 개를 곱한다", { tone: "red" });
      k.panel(40, 164, 1200, 212, { tone: "gray", tinted: true });
      var B = [
        k.box(60, 200, 130, 56, { tone: "green", title: "w₅ = 0.40", sub: "가중치", size: 15 }),
        k.box(340, 200, 150, 56, { tone: "gray", fill: "plain", title: "z(o₁) = 1.1059", sub: "가중합", size: 15 }),
        k.box(640, 200, 140, 56, { tone: "blue", title: "ŷ₁ = 0.7514", sub: "출력 σ(z)", size: 15 }),
        k.box(930, 200, 130, 56, { tone: "red", title: "L₁ = 0.2748", sub: "½(ŷ₁ − t₁)²", size: 15 })
      ];
      var fwd = ["× a(h₁) + … + b₃", "σ(z)", "½(ŷ − t)²"];
      var bwd = ["∂z/∂w₅ = a(h₁) = 0.5933", "σ′ = ŷ(1 − ŷ) = 0.1868", "∂L/∂ŷ₁ = ŷ₁ − t₁ = 0.7414"];
      for (var i = 0; i < 3; i++) {
        var a = B[i], b = B[i + 1];
        k.arrow(a.x + a.w + 4, 216, b.x - 4, 216, { tone: "blue", width: 2.2, label: fwd[i], labelSize: 12.5 });
        k.arrow(b.x - 4, 242, a.x + a.w + 4, 242, { tone: "red", width: 2.6, label: bwd[i], labelSize: 12.5, labelDy: 30 });
      }
      k.chip(1084, 206, "순전파 값", { tone: "blue", size: 12.5 });
      k.chip(1084, 238, "역전파 기울기", { tone: "red", size: 12.5, solid: true });
      k.formula(60, 296, 760, 62, "∂L/∂w₅ = **0.7414** × **0.1868** × **0.5933** = **0.0822**\nw₅ ← 0.40 − 0.5 × 0.0822 = **0.3589**", { size: 15.5, tone: "red" });
      k.note(840, 296, 384, 62, { tone: "red", title: "출력층 δ = ∂L/∂z = (ŷ − t) · ŷ(1 − ŷ)", body: "δ(o₁) = 0.7414 × 0.1868 = 0.1385\nδ(o₂) = (0.7729 − 0.99) × 0.1755 = −0.0381", size: 13.5, bodySize: 12.5 });

      k.section(40, 406, "② 은닉층 가중치 w₁ (x₁ → h₁) — 두 출력의 기울기를 더한다", { tone: "red" });
      k.panel(40, 420, 600, 230, { tone: "red", tinted: true });
      var X1 = [100, 490], H1 = [300, 490], O1 = [540, 446], O2 = [540, 534];
      [[X1, H1], [H1, O1], [H1, O2]].forEach(function (p) { var s = seg(p[0], p[1], 24, 24); k.arrow(s[0], s[1], s[2], s[3], { tone: "gray", width: 1.2, head: false, dash: true }); });
      var s1 = seg(O1, H1, 26, 26), s2 = seg(O2, H1, 26, 26), s3 = seg(H1, X1, 26, 26);
      k.arrow(s1[0], s1[1] - 6, s1[2], s1[3] - 6, { tone: "red", width: 2.8 });
      k.arrow(s2[0], s2[1] + 6, s2[2], s2[3] + 6, { tone: "red", width: 2.8 });
      k.arrow(s3[0], s3[1], s3[2], s3[3], { tone: "red", width: 2.8 });
      k.text(400, 446, "δ(o₁)·w₅ = 0.1385 × 0.40", { size: 12.5, weight: 700, anchor: "middle", tone: "red" });
      k.text(400, 554, "δ(o₂)·w₇ = −0.0381 × 0.50", { size: 12.5, weight: 700, anchor: "middle", tone: "red" });
      k.text(200, 480, "× x₁ = 0.05", { size: 12.5, weight: 700, anchor: "middle", tone: "red" });
      k.circle(X1[0], X1[1], 24, { tone: "gray", fill: "tone", label: "x₁", size: 15 });
      k.circle(H1[0], H1[1], 24, { tone: "blue", fill: "tone", label: "h₁", size: 15 });
      k.circle(O1[0], O1[1], 24, { tone: "blue", fill: "solid", label: "o₁", size: 15 });
      k.circle(O2[0], O2[1], 24, { tone: "blue", fill: "solid", label: "o₂", size: 15 });
      k.lines(60, 588, [
        "∂L/∂a(h₁) = δ(o₁)·w₅ + δ(o₂)·w₇ = 0.0554 + (−0.0190) = **0.0364**",
        "δ(h₁) = 0.0364 × a(h₁)(1 − a(h₁)) = 0.0364 × 0.2413 = **0.00877**",
        { t: "∂L/∂w₁ = 0.00877 × 0.05 = **0.000439**  →  w₁ ← 0.15 − 0.5 × 0.000439 = **0.149781**", tone: "red" }
      ], { size: 12.5, lh: 21, color: "ink" });

      k.section(656, 406, "③ 모든 가중치를 한 번에 갱신 (η = 0.5)", { tone: "purple" });
      k.panel(656, 420, 584, 230, { tone: "purple", tinted: true });
      var R = [
        ["w₁", "x₁ → h₁", "0.15", "0.0004386", "−0.0002193", "0.149781"],
        ["w₂", "x₂ → h₁", "0.20", "0.0008771", "−0.0004386", "0.199561"],
        ["w₃", "x₁ → h₂", "0.25", "0.0004977", "−0.0002489", "0.249751"],
        ["w₄", "x₂ → h₂", "0.30", "0.0009954", "−0.0004977", "0.299502"],
        ["w₅", "h₁ → o₁", "0.40", "0.08217", "−0.04108", "0.358916"],
        ["w₆", "h₂ → o₁", "0.45", "0.08267", "−0.04133", "0.408666"],
        ["w₇", "h₁ → o₂", "0.50", "−0.02260", "+0.01130", "0.511301"],
        ["w₈", "h₂ → o₂", "0.55", "−0.02274", "+0.01137", "0.561370"]
      ].map(function (r) {
        var up = r[4][0] === "+";
        return [r[0], r[1], { t: r[2], mono: true }, { t: r[3], mono: true, tone: "red" }, { t: r[4], mono: true, tone: up ? "blue" : "orange" }, { t: r[5], mono: true, weight: 800 }];
      });
      k.table(668, 428, [44, 88, 56, 112, 120, 116], [["", "연결", "값", "∂L/∂w", "변화 −η·∂L/∂w", "새 값"]].concat(R), { rh: 24.5, size: 12.5 });

      k.note(40, 662, 1200, 36, { tone: "green", title: "갱신한 가중치로 같은 입력을 다시 순전파 → L = 0.2984 → 0.2805 (편향 b₁~b₄도 ∂L/∂b = δ로 함께 갱신 · 편향을 고정하면 0.2910)", size: 13.5 });
    }
  });

  /* ---------------- (3) 계산 그래프와 기울기 소실 ---------------- */
  DSDiagram.register({
    id: "backpropagation-3", sim: "backpropagation", order: 3,
    title: "역전파 (3) — 계산 그래프와 기울기 소실 · 폭발", short: "계산 그래프 · 기울기 소실",
    sub: "한 뉴런 y = σ(w·x + b), L = (y − t)² 를 노드로 쪼개면 역전파는 「상류 기울기 × 로컬 기울기」의 반복 — 층이 깊어지면 이 곱이 0 또는 무한대로",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 계산 그래프 — x = 2, w = 0.5, b = −0.5, t = 1", { tone: "blue" });
      k.text(1240, 150, "위 파랑 = 순방향 값 · 아래 빨강 = 역방향 기울기 ∂L/∂(·)", { size: 13.5, anchor: "end", color: "muted" });
      k.panel(40, 164, 1200, 246, { tone: "gray", tinted: true });
      var CY = 280;
      var bx = k.box(56, 196, 160, 52, { tone: "blue", fill: "plain", title: "x = 2", size: 15, lines: [{ t: "∂L/∂x = −0.0887", tone: "red", weight: 700, size: 12.5 }] });
      var bw = k.box(56, 312, 160, 52, { tone: "blue", fill: "plain", title: "w = 0.5", size: 15, lines: [{ t: "∂L/∂w = −0.3549", tone: "red", weight: 800, size: 12.5 }] });
      var M = [310, CY], A = [510, CY], S = [710, CY], Q = [910, CY];
      k.arrow(bx.r[0] + 2, bx.r[1], M[0] - 26, M[1] - 10, { tone: "blue", width: 2 });
      k.arrow(bw.r[0] + 2, bw.r[1], M[0] - 26, M[1] + 10, { tone: "blue", width: 2 });
      var bb = k.box(430, 176, 160, 50, { tone: "blue", fill: "plain", title: "b = −0.5", size: 15, lines: [{ t: "∂L/∂b = −0.1774", tone: "red", weight: 700, size: 12.5 }] });
      k.arrow(A[0], bb.b[1] + 2, A[0], A[1] - 30, { tone: "blue", width: 2 });
      var tb = k.box(850, 186, 120, 36, { tone: "gray", fill: "plain", title: "정답 t = 1", size: 14 });
      k.arrow(Q[0], tb.b[1] + 2, Q[0], Q[1] - 32, { tone: "gray", width: 1.8 });
      var Lb = k.box(1070, CY - 30, 150, 60, { tone: "red", title: "L = 0.1425", sub: "제곱 오차", size: 16 });
      var chain = [[M, A, "u = w·x = 1.0", "∂L/∂u = −0.1774"], [A, S, "z = u + b = 0.5", "∂L/∂z = −0.1774"], [S, Q, "y = σ(z) = 0.6225", "∂L/∂y = −0.7551"], [Q, [Lb.x + 30, CY], "L = 0.1425", "1"]];
      chain.forEach(function (c) {
        var x1 = c[0][0] + 30, x2 = c[1][0] - 30;
        k.arrow(x1, CY - 8, x2 - 2, CY - 8, { tone: "blue", width: 2.2, label: c[2], labelSize: 12.5 });
        k.arrow(x2 - 2, CY + 8, x1, CY + 8, { tone: "red", width: 2.6, label: c[3], labelSize: 12.5, labelDy: 32 });
      });
      [[M, "×", "∂u/∂w = x · ∂u/∂x = w"], [A, "+", "로컬 기울기 1, 1"], [S, "σ", "σ(1 − σ) = 0.2350"], [Q, "(y−t)²", "2(y − t) = −0.7551"]].forEach(function (n) {
        k.circle(n[0][0], n[0][1], 28, { tone: "purple", fill: "tone", label: n[1], size: n[1].length > 2 ? 12.5 : 20 });
        k.text(n[0][0], CY + 64, n[2], { size: 12, weight: 700, anchor: "middle", color: "muted" });
      });
      k.formula(236, 362, 808, 38, "∂L/∂w = ∂L/∂y × σ′(z) × x = (−0.7551) × 0.2350 × 2 = **−0.3549**  → 상류 × 로컬을 노드마다 반복", { size: 14.5, tone: "red" });

      k.section(40, 442, "② 노드별 규칙", { tone: "purple" });
      k.panel(40, 456, 560, 176, { tone: "purple", tinted: true });
      k.table(52, 466, [88, 108, 150, 196], [
        ["노드", "순방향", "로컬 기울기", "역방향에서 하는 일"],
        ["곱셈 ×", "u = w·x", "∂u/∂w = x, ∂u/∂x = w", "상대편 값을 곱해 보냄"],
        ["덧셈 +", "z = u + b", "1, 1", "받은 기울기를 그대로 나눠 줌"],
        ["σ", "y = σ(z)", { t: "σ(1 − σ) ≤ 0.25", tone: "red", weight: 700 }, "최대 0.25배로 줄여 보냄"],
        ["제곱 오차", "L = (y − t)²", "2(y − t)", "오차에 비례한 기울기 시작"]
      ], { rh: 31, size: 12.5 });

      k.section(616, 442, "③ 층이 깊어지면 — 곱이 쌓인다", { tone: "red" });
      k.panel(616, 456, 304, 176, { tone: "blue", head: "soft", title: "Gradient Vanishing", right: "×0.25 씩" });
      k.bars(640, 500, 264, 88, [0.00098, 0.0039, 0.0156, 0.0625, 0.25, 1], { labels: ["L1", "L2", "L3", "L4", "L5", "L6"], tones: "blue", fmt: function (v) { return v >= 0.25 ? String(v) : v.toFixed(3); }, gap: 9, size: 11.5 });
      k.text(640, 626, "입력층 쪽", { size: 11.5, color: "muted" });
      k.text(904, 626, "출력층 쪽", { size: 11.5, anchor: "end", color: "muted" });
      k.panel(936, 456, 304, 176, { tone: "orange", head: "soft", title: "Gradient Exploding", right: "×2 씩" });
      k.bars(960, 500, 264, 88, [32, 16, 8, 4, 2, 1], { labels: ["L1", "L2", "L3", "L4", "L5", "L6"], tones: "orange", gap: 9, size: 11.5 });
      k.text(960, 626, "입력층 쪽", { size: 11.5, color: "muted" });
      k.text(1224, 626, "출력층 쪽", { size: 11.5, anchor: "end", color: "muted" });

      k.note(40, 648, 740, 46, { tone: "blue", title: "막는 도구 — ReLU(양수 기울기 1) · He / Xavier 초기화 · 배치 정규화 · Gradient Clipping", body: "「신경망 최적화」 시뮬레이터의 기법 대부분이 이 두 문제를 막기 위한 것", size: 13.5, bodySize: 12.5 });
      k.note(796, 648, 444, 46, { tone: "red", title: "과적합과 다름 — 학습 단계부터 실패", body: "소실: 앞쪽 Weight가 안 바뀜 · 폭발: 손실이 NaN으로 발산", size: 13.5, bodySize: 12.5 });
    }
  });
})();
