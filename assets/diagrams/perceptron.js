/* 퍼셉트론 — 알고리즘 구성도 (강의 필기자료 '신경망 복습 (1) 구성 요소' 양식) */
(function () {
  "use strict";
  var LABEL = "Neural Network Model";

  /* 원 둘레에서 시작·끝나는 선분 */
  function seg(a, b, ra, rb) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    return [a[0] + dx / L * ra, a[1] + dy / L * ra, b[0] - dx / L * rb, b[1] - dy / L * rb];
  }
  /* 0~1 입력 평면 (−0.4 ~ 1.4 범위) */
  function plane(k, x, y, s, o) {
    o = o || {};
    var lo = -0.4, hi = 1.4;
    var X = function (v) { return x + (v - lo) / (hi - lo) * s; };
    var Y = function (v) { return y + s - (v - lo) / (hi - lo) * s; };
    k.rect(x, y, s, s, { tone: "gray", fill: "tone", r: 4 });
    k.path("M" + X(0) + " " + y + " V" + (y + s) + " M" + x + " " + Y(0) + " H" + (x + s), { tone: "gray", width: 1, dash: "3 3" });
    (o.lines || []).forEach(function (ln) {
      /* a·u + b·v + c = 0 를 평면 범위 안에서 */
      var a = ln[0], b = ln[1], c = ln[2], pts = [];
      [[lo, null], [hi, null]].forEach(function (p) { if (b !== 0) { var v = -(a * p[0] + c) / b; if (v >= lo - 1e-9 && v <= hi + 1e-9) pts.push([p[0], v]); } });
      [[null, lo], [null, hi]].forEach(function (p) { if (a !== 0) { var u = -(b * p[1] + c) / a; if (u > lo + 1e-9 && u < hi - 1e-9) pts.push([u, p[1]]); } });
      if (pts.length >= 2) k.path("M" + X(pts[0][0]) + " " + Y(pts[0][1]) + " L" + X(pts[1][0]) + " " + Y(pts[1][1]), { tone: ln[3] || "ink", width: 2.4, dash: ln[4] });
    });
    (o.pts || []).forEach(function (p) {
      var cx = X(p[0]), cy = Y(p[1]), r = o.r || 7;
      if (p[2]) k.circle(cx, cy, r, { tone: "blue", fill: "solid" });
      else k.rect(cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7, { tone: "orange", fill: "solid", r: 1.5 });
      if (p[3]) k.text(cx + (p[4] || 0), cy + (p[5] || 0), p[3], { size: 11.5, weight: 700, anchor: "middle", color: "muted" });
    });
    if (o.xl) k.text(x + s / 2, y + s + 16, o.xl, { size: 11.5, anchor: "middle", color: "muted" });
    return { X: X, Y: Y };
  }

  /* ---------------- (1) 노드 하나의 계산 ---------------- */
  DSDiagram.register({
    id: "perceptron-1", sim: "perceptron", order: 1,
    title: "퍼셉트론 (1) — 노드 하나의 계산", short: "노드 하나의 계산",
    sub: "입력 × 가중치를 모두 더하고(Σ) bias를 더한 z를 활성 함수에 넣어 출력 y를 낸다 — 신경망을 이루는 가장 작은 단위",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 노드 하나의 내부 — 가중치(Weight)와 활성 함수(Activation)", { tone: "green" });
      k.panel(40, 164, 752, 252, { tone: "green", tinted: true });
      var S = [452, 280], ins = [["x₁ 발열", 1, 0.6, "w₁"], ["x₂ 기침", 0, 0.4, "w₂"], ["x₃ 호흡곤란", 1, 0.9, "w₃"]];
      ins.forEach(function (it, i) {
        var p = [176, 206 + i * 74], e = seg(p, S, 24, 40);
        k.arrow(e[0], e[1], e[2], e[3], { tone: "blue", width: 1.2 + it[2] * 2.6 });
        var t = 0.42, cx = e[0] + (e[2] - e[0]) * t, cy = e[1] + (e[3] - e[1]) * t;
        k.box(cx - 40, cy - 13, 80, 26, { tone: "green", fill: "tone", title: it[3] + " = " + it[2], size: 13.5, r: 6 });
        k.circle(p[0], p[1], 24, { tone: "blue", fill: it[1] ? "tone" : "plain", label: String(it[1]), size: 18 });
        k.text(p[0] - 34, p[1] + 5, it[0], { size: 13.5, weight: 700, anchor: "end", color: "ink" });
      });
      k.circle(S[0], 192, 16, { tone: "orange", fill: "tone", label: "b", size: 15 });
      k.text(S[0] + 26, 197, "편향(bias) b = −1", { size: 13.5, weight: 700, tone: "orange" });
      k.arrow(S[0], 209, S[0], 238, { tone: "orange", width: 2 });
      k.circle(S[0], S[1], 40, { tone: "green", fill: "tone", label: "Σ", size: 28 });
      k.text(S[0], 342, "가중합 z = 0.5", { size: 14, weight: 800, anchor: "middle", tone: "green" });
      k.arrow(494, S[1], 548, S[1], { tone: "blue", width: 2.6 });
      k.box(552, 245, 118, 70, { tone: "purple", title: "활성 함수", sub: "f(z) = step(z)", size: 15 });
      k.arrow(672, S[1], 712, S[1], { tone: "blue", width: 2.6 });
      k.circle(744, S[1], 28, { tone: "blue", fill: "solid", label: "1", size: 19 });
      k.text(744, 333, "출력 y", { size: 13, weight: 700, anchor: "middle", color: "ink" });
      k.text(744, 351, "검사 필요", { size: 13, weight: 800, anchor: "middle", tone: "blue" });
      k.formula(214, 368, 492, 36, "z = 0.6×1 + 0.4×0 + 0.9×1 + (−1) = **0.5**", { size: 15, tone: "green" });

      k.panel(808, 164, 432, 252, { tone: "purple", head: "solid", title: "같은 z = 0.5, 활성 함수만 바꾸면", right: "출력 모양" });
      k.table(820, 208, [92, 124, 66, 126], [
        ["함수", "식", "f(0.5)", "읽는 법"],
        [{ t: "계단", tone: "ink" }, "z > 0 → 1", { t: "1", weight: 800 }, "0/1 결정"],
        [{ t: "Sigmoid", tone: "blue" }, "1 / (1 + e⁻ᶻ)", { t: "0.622", weight: 800 }, "0~1 확률처럼"],
        [{ t: "tanh", tone: "green" }, "tanh(z)", { t: "0.462", weight: 800 }, "−1 ~ 1"],
        [{ t: "ReLU", tone: "red" }, "max(0, z)", { t: "0.5", weight: 800 }, "0 이상 크기"]
      ], { rh: 29, size: 13 });
      k.note(820, 360, 408, 44, { tone: "purple", title: "네 함수 모두 z > 0 이면 '필요' 쪽", body: "다른 것은 출력의 모양 · (1, 1, 0)은 z = 0.0 → 경계 위라 계단은 0", size: 13, bodySize: 12 });

      k.section(40, 448, "② 활성 함수 4종 — 같은 z, 다른 출력 모양", { tone: "purple" });
      var acts = [
        { n: "계단 (Step)", f: function (z) { return z > 0 ? 1 : 0; }, lo: -0.25, hi: 1.25, t: "ink", r: "원 퍼셉트론", v: "f(0.5) = 1", d: "0 또는 1 · 미분 불가" },
        { n: "Sigmoid", f: function (z) { return 1 / (1 + Math.exp(-z)); }, lo: -0.25, hi: 1.25, t: "blue", r: "0 ~ 1", v: "f(0.5) = 0.622", d: "양 끝 기울기 → 0 (소실)" },
        { n: "tanh", f: function (z) { return Math.tanh(z); }, lo: -1.25, hi: 1.25, t: "green", r: "−1 ~ 1", v: "f(0.5) = 0.462", d: "중심 0 · 끝은 여전히 포화" },
        { n: "ReLU", f: function (z) { return Math.max(0, z); }, lo: -0.6, hi: 4.2, t: "red", r: "max(0, z)", v: "f(0.5) = 0.5", d: "양수 기울기 1 · 계산 단순" }
      ];
      acts.forEach(function (a, i) {
        var x = 40 + i * 212, y = 462;
        k.panel(x, y, 200, 172, { tone: a.t, head: "soft", title: a.n, right: a.r, titleSize: 14.5 });
        var px = x + 18, py = y + 46, pw = 164, ph = 70;
        var X = function (z) { return px + (z + 4) / 8 * pw; }, Y = function (v) { return py + ph - (v - a.lo) / (a.hi - a.lo) * ph; };
        k.path("M" + px + " " + Y(0) + " H" + (px + pw) + " M" + X(0) + " " + py + " V" + (py + ph), { tone: "gray", width: 1 });
        var d = "";
        for (var s = 0; s <= 80; s++) {
          var z = -4 + 8 * s / 80;
          if (a.t === "ink" && s === 40) { d += " L" + X(0).toFixed(1) + " " + Y(0).toFixed(1) + " M" + X(0).toFixed(1) + " " + Y(1).toFixed(1); continue; }
          d += (s ? " L" : "M") + X(z).toFixed(1) + " " + Y(Math.min(a.hi, a.f(z))).toFixed(1);
        }
        k.path(d, { tone: a.t, width: 2.6 });
        k.circle(X(0.5), Y(a.f(0.5)), 5, { tone: a.t, fill: "solid" });
        k.text(x + 100, y + 138, a.v, { size: 13.5, weight: 800, anchor: "middle", tone: a.t });
        k.text(x + 100, y + 160, a.d, { size: 12, anchor: "middle", color: "muted" });
      });

      k.section(888, 448, "③ 왜 「비선형」이어야 하나", { tone: "red" });
      k.panel(888, 462, 352, 172, { tone: "red", tinted: true });
      k.lines(904, 490, [
        { t: "선형 f(x) = ax + b 를 두 층 쌓으면", color: "ink", weight: 700 },
        { t: "f₂(f₁(x)) = a₂(a₁x + b₁) + b₂", color: "ink" },
        { t: "         = **(a₂a₁)**x + **(a₂b₁ + b₂)**", color: "ink" },
        { t: "→ 여전히 1차식: 100층도 1층과 같다", tone: "red", weight: 800 },
        { t: "비선형 f가 있어야 층마다 경계를 꺾고", color: "muted" },
        { t: "쌓은 만큼 표현력이 늘어난다", color: "muted" }
      ], { size: 13.5, lh: 23 });

      k.flow(40, 652, [
        { t: "입력 x", tone: "blue" }, { t: "× 가중치 w", tone: "green" }, { t: "Σ 가중합 + b", tone: "green" },
        { t: "활성 함수 f(z)", tone: "purple" }, { t: "출력 y → 다음 층 입력", tone: "blue" }
      ], { label: "노드 계산 순서", h: 38, w: 1200 });
    }
  });

  /* ---------------- (2) 논리 게이트와 학습 규칙 ---------------- */
  DSDiagram.register({
    id: "perceptron-2", sim: "perceptron", order: 2,
    title: "퍼셉트론 (2) — 논리 게이트와 학습 규칙", short: "논리 게이트 · 학습 규칙",
    sub: "가중치와 bias만 바꾸면 같은 노드가 AND · OR · NAND가 되고, 틀린 샘플을 만날 때마다 w ← w + η(y − ŷ)x 로 경계선을 옮긴다",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 가중치로 만드는 논리 게이트 — 입력 2개 · 계단 함수", { sub: "결정 경계 w₁x₁ + w₂x₂ + b = 0" });
      var G = [
        { n: "AND", w: [1, 1, -1.5], y: [0, 0, 0, 1], z: ["−1.5", "−0.5", "−0.5", "0.5"], t: "blue", note: "둘 다 1일 때만 1" },
        { n: "OR", w: [1, 1, -0.5], y: [0, 1, 1, 1], z: ["−0.5", "0.5", "0.5", "1.5"], t: "teal", note: "하나라도 1이면 1" },
        { n: "NAND", w: [-1, -1, 1.5], y: [1, 1, 1, 0], z: ["1.5", "0.5", "0.5", "−0.5"], t: "purple", note: "AND의 반대 (부호 뒤집기)" }
      ];
      var X4 = [[0, 0], [0, 1], [1, 0], [1, 1]];
      G.forEach(function (g, i) {
        var x = 40 + i * 406, w = 394;
        var f = function (v) { return v < 0 ? "−" + Math.abs(v) : String(v); };
        k.panel(x, 164, w, 228, { tone: g.t, head: "solid", title: g.n, right: "w = (" + f(g.w[0]) + ", " + f(g.w[1]) + ") · b = " + f(g.w[2]) });
        var rows = [["x₁", "x₂", "z", "ŷ"]];
        X4.forEach(function (p, j) { rows.push([String(p[0]), String(p[1]), { t: g.z[j], mono: true }, { t: String(g.y[j]), weight: 800, tone: g.y[j] ? "blue" : "orange" }]); });
        k.table(x + 14, 210, [40, 40, 64, 40], rows, { rh: 27, size: 13.5, firstBold: false });
        k.text(x + 14, 366, g.note, { size: 12.5, weight: 700, tone: g.t });
        plane(k, x + 222, 208, 150, { pts: X4.map(function (p, j) { return [p[0], p[1], g.y[j]]; }), lines: [[g.w[0], g.w[1], g.w[2], g.t]], xl: "x₁ →  (세로 x₂)" });
      });

      k.section(40, 424, "② 퍼셉트론 학습 규칙 — 틀린 샘플을 만날 때만 고친다", { tone: "red" });
      k.formula(40, 438, 420, 62, "ŷ = step(w₁x₁ + w₂x₂ + b)\nw ← w + **η(y − ŷ)x** ,   b ← b + **η(y − ŷ)**", { size: 15, tone: "red" });
      k.box(40, 510, 420, 38, { tone: "gray", fill: "soft", align: "left", title: "맞힘  y − ŷ = 0  →  그대로 둔다", size: 13.5 });
      k.box(40, 556, 420, 38, { tone: "blue", align: "left", title: "y = 1 인데 ŷ = 0  →  +ηx 쪽으로 (z를 키움)", size: 13.5 });
      k.box(40, 602, 420, 38, { tone: "orange", align: "left", title: "y = 0 인데 ŷ = 1  →  −ηx 쪽으로 (z를 줄임)", size: 13.5 });

      k.panel(478, 438, 476, 202, { tone: "gray", head: "soft", title: "AND 학습 따라가기", right: "시작 w = (0, 0) · b = 0 · η = 0.1" });
      k.table(490, 478, [44, 66, 34, 50, 34, 52, 172], [
        ["에폭", "샘플 x", "y", "z", "ŷ", "y − ŷ", "갱신 후 (w₁, w₂, b)"],
        ["1", "(1, 1)", "1", { t: "0.0", mono: true }, "0", { t: "+1", tone: "blue", weight: 800 }, { t: "(0.1, 0.1, 0.1)", mono: true }],
        ["2", "(0, 0)", "0", { t: "0.1", mono: true }, "1", { t: "−1", tone: "orange", weight: 800 }, { t: "(0.1, 0.1, 0.0)", mono: true }],
        ["2", "(0, 1)", "0", { t: "0.1", mono: true }, "1", { t: "−1", tone: "orange", weight: 800 }, { t: "(0.1, 0.0, −0.1)", mono: true }],
        ["2", "(1, 1)", "1", { t: "0.0", mono: true }, "0", { t: "+1", tone: "blue", weight: 800 }, { t: "(0.2, 0.1, 0.0)", mono: true }],
        ["6", { t: "4개 모두 맞힘 → 수렴", weight: 700 }, "", "", "", "", { t: "(0.2, 0.1, −0.2)", mono: true, tone: "green", weight: 800 }]
      ], { rh: 26, size: 12.5, firstBold: false });

      k.panel(970, 438, 270, 202, { tone: "gray", head: "soft", title: "에폭별 갱신 횟수", right: "총 10회" });
      k.bars(996, 488, 228, 112, [1, 3, 3, 2, 1, 0], { labels: ["1", "2", "3", "4", "5", "6"], tones: ["red", "red", "red", "red", "red", "green"], max: 3, gap: 12, size: 12 });
      k.text(1110, 632, "에폭 (0회 = 수렴)", { size: 11.5, anchor: "middle", color: "muted" });

      k.note(40, 654, 914, 40, { tone: "green", title: "수렴 정리 (Novikoff, 1962) — 직선으로 나뉘는 데이터면 갱신은 유한 번, 최대 (R/γ)²번 뒤 반드시 멈춘다", size: 13.5 });
      k.note(970, 654, 270, 40, { tone: "red", title: "XOR은 직선으로 못 나눔 → (3)", size: 13.5 });
    }
  });

  /* ---------------- (3) XOR과 다층 퍼셉트론 ---------------- */
  DSDiagram.register({
    id: "perceptron-3", sim: "perceptron", order: 3,
    title: "퍼셉트론 (3) — XOR과 다층 퍼셉트론", short: "XOR과 다층 퍼셉트론",
    sub: "직선 하나로는 XOR을 나눌 수 없지만, 은닉 노드 2개(OR · NAND)를 거쳐 AND로 모으면 풀린다 — XOR = AND(OR, NAND)",
    label: LABEL,
    draw: function (k) {
      var X4 = [[0, 0], [0, 1], [1, 0], [1, 1]], XOR = [0, 1, 1, 0];
      k.section(40, 150, "① 단층으로는 안 된다", { tone: "red" });
      k.panel(40, 164, 300, 290, { tone: "red", tinted: true });
      plane(k, 76, 184, 190, { r: 9, pts: X4.map(function (p, j) { return [p[0], p[1], XOR[j], "(" + p[0] + "," + p[1] + ")", 0, 26]; }), lines: [[1, 1, -0.5, "gray", "6 5"], [1, -1, 0, "gray", "6 5"]] });
      k.text(286, 228, "XOR", { size: 15, weight: 800, tone: "red" });
      k.text(286, 248, "0·1·1·0", { size: 12.5, color: "muted" });
      k.lines(58, 410, [
        { t: "어떤 직선을 그어도 ● 1과 ■ 0이", color: "ink", weight: 700 },
        { t: "한쪽에 모이지 않는다 (선형 분리 불가)", tone: "red", weight: 700 }
      ], { size: 13, lh: 21 });

      k.section(360, 150, "② 은닉층 2노드로 XOR 만들기", { tone: "blue" });
      k.panel(360, 164, 520, 290, { tone: "blue", tinted: true });
      var I = [[420, 240], [420, 380]], H = [[650, 240], [650, 380]], O = [820, 310];
      var E = [
        [I[0], H[0], "1"], [I[1], H[0], "1"], [I[0], H[1], "−1"], [I[1], H[1], "−1"],
        [H[0], O, "1"], [H[1], O, "1"]
      ];
      E.forEach(function (e, i) {
        var s = seg(e[0], e[1], 26, 28);
        k.arrow(s[0], s[1], s[2], s[3], { tone: "blue", width: 2 });
        var t = i < 4 ? (i === 1 || i === 2 ? 0.3 : 0.5) : 0.5;
        var cx = s[0] + (s[2] - s[0]) * t, cy = s[1] + (s[3] - s[1]) * t;
        var pos = e[2].indexOf("−") >= 0;
        k.box(cx - 22, cy - 12, 44, 24, { tone: pos ? "orange" : "green", fill: "plain", title: e[2], size: 13, r: 5 });
      });
      k.circle(I[0][0], I[0][1], 26, { tone: "gray", fill: "tone", label: "x₁", size: 16 });
      k.circle(I[1][0], I[1][1], 26, { tone: "gray", fill: "tone", label: "x₂", size: 16 });
      k.circle(H[0][0], H[0][1], 28, { tone: "teal", fill: "tone", label: "h₁", size: 16 });
      k.circle(H[1][0], H[1][1], 28, { tone: "purple", fill: "tone", label: "h₂", size: 16 });
      k.circle(O[0], O[1], 28, { tone: "blue", fill: "solid", label: "y", size: 17 });
      k.text(650, 196, "h₁ = OR  (b = −0.5)", { size: 13, weight: 800, anchor: "middle", tone: "teal" });
      k.text(650, 432, "h₂ = NAND  (b = 1.5)", { size: 13, weight: 800, anchor: "middle", tone: "purple" });
      k.text(820, 360, "y = AND", { size: 13, weight: 800, anchor: "middle", tone: "blue" });
      k.text(820, 378, "(b = −1.5)", { size: 12, anchor: "middle", color: "muted" });
      k.text(420, 196, "입력층", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });
      k.text(420, 432, "계단 함수", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });
      k.text(820, 196, "출력층", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });

      k.section(900, 150, "③ 진리표로 확인", { tone: "green" });
      k.panel(900, 164, 340, 290, { tone: "green", tinted: true });
      var rows = [["x₁", "x₂", "h₁ OR", "h₂ NAND", "y AND"]];
      X4.forEach(function (p, j) {
        var h1 = p[0] || p[1] ? 1 : 0, h2 = p[0] && p[1] ? 0 : 1;
        rows.push([String(p[0]), String(p[1]), { t: String(h1), tone: "teal", weight: 800 }, { t: String(h2), tone: "purple", weight: 800 }, { t: String(XOR[j]), tone: XOR[j] ? "blue" : "orange", weight: 800 }]);
      });
      k.table(914, 182, [40, 40, 70, 84, 80], rows, { rh: 32, size: 14, firstBold: false });
      k.lines(916, 370, [
        { t: "y 열 = 0 · 1 · 1 · 0 = XOR", tone: "green", weight: 800 },
        { t: "예) (1,1): h₁ = 1, h₂ = 0", color: "ink" },
        { t: "     → 1 + 0 − 1.5 = −0.5 → y = 0", color: "ink" }
      ], { size: 13, lh: 22 });

      k.section(40, 486, "④ 은닉층이 하는 일 — 점을 새 공간으로 옮겨 직선 하나로 나뉘게 만든다", { tone: "purple" });
      k.panel(40, 500, 760, 200, { tone: "purple", tinted: true });
      plane(k, 74, 516, 150, { pts: X4.map(function (p, j) { return [p[0], p[1], XOR[j]]; }), lines: [[1, 1, -0.5, "teal"], [-1, -1, 1.5, "purple"]], xl: "입력 공간 (x₁, x₂)" });
      k.text(240, 548, "직선 두 개가", { size: 12.5, color: "muted" });
      k.text(240, 566, "띠를 만듦", { size: 12.5, color: "muted" });
      k.arrow(240, 600, 330, 600, { tone: "purple", width: 2.6, label: "은닉층 변환", labelSize: 12.5 });
      var hidPts = X4.map(function (p, j) { var h1 = p[0] || p[1] ? 1 : 0, h2 = p[0] && p[1] ? 0 : 1; return [h1, h2, XOR[j]]; });
      plane(k, 352, 516, 150, { pts: hidPts, lines: [[1, 1, -1.5, "blue"]], xl: "은닉 공간 (h₁, h₂)" });
      k.text(520, 560, "(0,1)·(1,0) 두 점이", { size: 12.5, color: "muted" });
      k.text(520, 578, "(1,1) 한 곳으로 모임", { size: 12.5, color: "muted" });
      k.text(520, 604, "→ 직선 h₁ + h₂ = 1.5", { size: 13, weight: 800, tone: "blue" });
      k.text(520, 624, "하나로 나뉨 (출력 AND)", { size: 13, weight: 800, tone: "blue" });
      k.text(520, 656, "■ (0,0) → (0,1)", { size: 12, color: "muted" });
      k.text(520, 674, "■ (1,1) → (1,0)", { size: 12, color: "muted" });

      k.panel(816, 500, 424, 200, { tone: "gray", head: "soft", title: "단층 vs 다층 퍼셉트론 (MLP)" });
      k.table(828, 544, [118, 136, 146], [
        ["", "단층", "다층 (은닉층 ≥ 1)"],
        ["결정 경계", "직선 하나", "꺾인 경계 · 영역"],
        ["XOR", { t: "불가", tone: "red", weight: 800 }, { t: "가능", tone: "green", weight: 800 }],
        ["학습 방법", "퍼셉트론 규칙", "역전파 (Backprop)"],
        ["활성 함수", "계단", "미분 가능한 비선형"]
      ], { rh: 29, size: 13 });
    }
  });
})();
