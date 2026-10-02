/* 신경망 최적화 기법 — 알고리즘 구성도 (강의 필기자료 '신경망 복습 (3) 최적화 기법' 양식) */
(function () {
  "use strict";
  var LABEL = "Neural Network Model";

  /* 작은 분포 곡선: shape(u) (u = −1~1) 를 폭 w, 높이 h 로 */
  function curve(k, cx, base, w, h, shape, tone, fill) {
    var d = "M" + (cx - w / 2) + " " + base;
    for (var i = 0; i <= 48; i++) {
      var u = -1 + 2 * i / 48;
      d += " L" + (cx + u * w / 2).toFixed(1) + " " + (base - Math.min(1, shape(u)) * h).toFixed(1);
    }
    d += " L" + (cx + w / 2) + " " + base + " Z";
    k.path(d, { tone: tone, fill: fill || "tone", width: 2 });
    k.path("M" + (cx - w / 2 - 4) + " " + base + " H" + (cx + w / 2 + 4), { tone: "gray", width: 1 });
  }
  function gauss(sd, amp) { return function (u) { return amp * Math.exp(-(u * u) / (2 * sd * sd)); }; }

  /* 신경망 그림 (층별 노드 수, 꺼진 노드 목록 "l-i") */
  function net(k, x0, y0, w, h, sizes, off, tone) {
    var P = sizes.map(function (n, l) {
      var x = x0 + l * w / (sizes.length - 1), gap = h / 4.4;
      return Array.apply(null, Array(n)).map(function (_, i) { return [x, y0 + h / 2 + (i - (n - 1) / 2) * gap]; });
    });
    var isOff = function (l, i) { return off.indexOf(l + "-" + i) >= 0; };
    for (var l = 0; l < P.length - 1; l++) P[l].forEach(function (a, i) { P[l + 1].forEach(function (b, j) {
      if (isOff(l, i) || isOff(l + 1, j)) return;
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
      k.arrow(a[0] + dx / L * 13, a[1] + dy / L * 13, b[0] - dx / L * 13, b[1] - dy / L * 13, { tone: tone, width: 1, head: false });
    }); });
    P.forEach(function (col, l) { col.forEach(function (p, i) {
      if (isOff(l, i)) {
        k.circle(p[0], p[1], 13, { tone: "red", fill: "tone" });
        k.text(p[0], p[1] + 5, "✕", { size: 14, weight: 800, anchor: "middle", tone: "red" });
      } else k.circle(p[0], p[1], 13, { tone: l === 0 || l === P.length - 1 ? "gray" : tone, fill: l === P.length - 1 ? "mid" : "tone" });
    }); });
  }

  /* ---------------- (1) 가중치 초기화 · 배치 정규화 ---------------- */
  DSDiagram.register({
    id: "nn-optimization-1", sim: "nn-optimization", order: 1,
    title: "신경망 최적화 (1) — 가중치 초기화와 배치 정규화", short: "가중치 초기화 · 배치 정규화",
    sub: "층을 지나도 활성값 분포가 무너지지 않게 — 시작 크기를 입력 수 n_in에 맞추고(초기화), 미니배치마다 평균 0 · 분산 1로 다시 맞춘다(BN)",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 가중치 초기화 (Weight Initialization)", { tone: "blue" });
      k.panel(40, 164, 590, 474, { tone: "blue", tinted: true });
      k.text(56, 190, "tanh · 폭 128 · 10층에 표준정규 입력을 통과시킨 활성값 분포 (학습 전)", { size: 12.5, color: "muted" });
      var rows = [
        { t: "너무 작게  σ = 0.01", d: "층마다 0으로 쪼그라듦 (붕괴) → 기울기도 사라짐", tone: "red",
          s: [gauss(0.3, 1), gauss(0.3, 0.45), gauss(0.3, 0.12)] },
        { t: "너무 크게  σ = 1.0", d: "tanh 출력이 ±1에 몰림 (포화) → 기울기 0", tone: "orange",
          s: [function (u) { return 0.25 + 0.6 * Math.pow(Math.abs(u), 6); }, function (u) { return 0.12 + 0.9 * Math.pow(Math.abs(u), 10); }, function (u) { return 0.05 + Math.pow(Math.abs(u), 16); }] },
        { t: "Xavier  σ = √(2/(n_in + n_out))", d: "층을 지나도 종 모양 유지", tone: "blue",
          s: [gauss(0.32, 0.9), gauss(0.3, 0.85), gauss(0.29, 0.82)] }
      ];
      rows.forEach(function (r, i) {
        var y = 204 + i * 106;
        k.text(56, y + 18, r.t, { size: 14, weight: 800, tone: r.tone });
        k.text(56, y + 38, r.d, { size: 12.5, color: "muted" });
        ["L1", "L5", "L10"].forEach(function (n, j) {
          var cx = 372 + j * 92;
          curve(k, cx, y + 76, 78, 62, r.s[j], r.tone);
          k.text(cx, y + 94, n, { size: 11.5, anchor: "middle", color: "muted" });
        });
      });
      k.table(52, 516, [118, 160, 150, 136], [
        ["방식", "표준편차 σ", "폭 128 예", "맞는 활성 함수"],
        [{ t: "Xavier (Glorot)", tone: "blue" }, "√(2 / (n_in + n_out))", { t: "√(2/256) = 0.0884", mono: true }, "tanh · sigmoid"],
        [{ t: "He", tone: "purple" }, "√(2 / n_in)", { t: "√(2/128) = 0.125", mono: true }, "ReLU (절반이 0)"]
      ], { rh: 30, size: 12.5, firstBold: false });
      k.text(56, 628, "He가 2배 큰 분산을 쓰는 이유: ReLU가 음수 절반을 0으로 만들어 분산이 반으로 줄기 때문", { size: 12.5, weight: 700, tone: "purple" });

      k.section(646, 150, "② 배치 정규화 (Batch Normalization)", { tone: "green" });
      k.panel(646, 164, 594, 474, { tone: "green", tinted: true });
      curve(k, 734, 270, 120, 70, function (u) { var v = (u + 0.55) / 0.28; return Math.exp(-v * v / 2) * 0.9 + 0.25 * Math.exp(-Math.pow((u - 0.3) / 0.35, 2) / 2); }, "red");
      k.text(734, 290, "치우친 분포", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });
      k.text(734, 196, "한 배치(batch)의 활성값", { size: 12.5, anchor: "middle", color: "muted" });
      k.arrow(800, 236, 880, 236, { tone: "green", width: 2.4 });
      k.box(884, 210, 100, 52, { tone: "green", fill: "solid", title: "BN", sub: "γ · β 학습", size: 18 });
      k.arrow(988, 236, 1066, 236, { tone: "green", width: 2.4 });
      curve(k, 1140, 270, 120, 70, gauss(0.33, 0.95), "green");
      k.text(1140, 290, "평균 0 · 분산 1", { size: 12.5, weight: 700, anchor: "middle", tone: "green" });

      k.text(662, 326, "4개짜리 미니 배치 예 (ε = 0.001)", { size: 13.5, weight: 800, color: "ink" });
      k.matrix(722, 344, [[2, 4, 6, 8]], { cw: 58, ch: 32, rows: ["x"], tone: "red", fill: "tone" });
      k.arrow(962, 360, 994, 360, { tone: "green", width: 2.2 });
      k.matrix(1000, 344, [["−1.342", "−0.447", "0.447", "1.342"]], { cw: 56, ch: 32, rows: [""], tone: "green", fill: "tone", size: 12.5 });
      k.text(1112, 336, "x̂", { size: 14, weight: 800, anchor: "middle", tone: "green" });
      k.lines(662, 406, [
        "① μ_B = (2 + 4 + 6 + 8) / 4 = **5**",
        "② σ²_B = ((−3)² + (−1)² + 1² + 3²) / 4 = **5**",
        "③ x̂ = (x − μ_B) / √(σ²_B + ε) = (x − 5) / 2.236",
        "④ y = γ · x̂ + β   (γ = 1, β = 0 에서 시작해 학습으로 조정)"
      ], { size: 13.5, lh: 24, color: "ink" });
      k.note(662, 512, 562, 52, { tone: "teal", title: "학습 때 = 그 배치의 μ_B · σ²_B 사용", body: "이동 평균도 함께 갱신: μ_run ← 0.99·μ_run + 0.01·μ_B  (momentum 0.99)", size: 13.5, bodySize: 12.5 });
      k.note(662, 572, 562, 52, { tone: "purple", title: "추론 때 = 이동 평균 통계 사용", body: "같은 입력이면 배치 동료와 상관없이 항상 같은 출력", size: 13.5, bodySize: 12.5 });

      k.flow(40, 656, [
        { t: "Dense", tone: "blue" }, { t: "BatchNormalization", tone: "green" }, { t: "Activation (ReLU)", tone: "purple" },
        { t: "Dropout", tone: "orange" }, { t: "Dense", tone: "blue" }
      ], { label: "Keras 층 순서", h: 38, w: 1200 });
    }
  });

  /* ---------------- (2) 드롭아웃 · Gradient Clipping ---------------- */
  DSDiagram.register({
    id: "nn-optimization-2", sim: "nn-optimization", order: 2,
    title: "신경망 최적화 (2) — 드롭아웃과 기울기 자르기", short: "드롭아웃 · Gradient Clipping",
    sub: "드롭아웃은 학습 스텝마다 노드를 무작위로 꺼서 과적합을 막고, Gradient Clipping은 기울기가 임계값을 넘으면 잘라 한 스텝의 보폭을 제한한다",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 드롭아웃 (Dropout) — p = 0.5", { tone: "orange" });
      k.panel(40, 164, 590, 474, { tone: "orange", tinted: true });
      k.text(170, 192, "학습 스텝마다 (training=True)", { size: 13, weight: 800, anchor: "middle", tone: "orange" });
      net(k, 64, 204, 216, 150, [3, 4, 4, 2], ["1-1", "1-3", "2-0", "2-2"], "orange");
      k.text(470, 192, "추론 (예측) — 끄지 않음", { size: 13, weight: 800, anchor: "middle", tone: "blue" });
      net(k, 364, 204, 216, 150, [3, 4, 4, 2], [], "blue");
      k.text(170, 384, "✕ = 이번 스텝에서 꺼진 노드 (매번 다름)", { size: 12, anchor: "middle", color: "muted" });

      k.text(56, 420, "은닉 노드 4개의 출력에 적용 (inverted dropout)", { size: 13.5, weight: 800, color: "ink" });
      k.matrix(120, 438, [[0.8, 0.2, 0.6, 0.4]], { cw: 48, ch: 30, rows: ["활성값 a"], tone: "blue", fill: "tone", size: 13.5 });
      k.text(330, 458, "×", { size: 18, weight: 800, anchor: "middle", color: "ink" });
      k.matrix(350, 438, [[1, 0, 1, 0]], { cw: 34, ch: 30, tones: function (i, j, v) { return v ? "green" : "red"; }, fill: "tone", size: 13.5 });
      k.text(400, 494, "마스크", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(500, 458, "× 1/(1−p) = ×2", { size: 13, weight: 800, tone: "orange" });
      k.arrow(150, 476, 150, 500, { tone: "orange", width: 2 });
      k.matrix(120, 506, [[1.6, 0, 1.2, 0]], { cw: 48, ch: 30, rows: ["다음 층으로"], tones: function (i, j, v) { return v ? "orange" : "red"; }, fill: "tone", size: 13.5 });
      k.lines(330, 520, [{ t: "살아남은 노드를 2배로 키움", weight: 700, color: "ink" }, { t: "→ 기대값 E = (1 − p) · a/(1 − p) = a", tone: "orange", weight: 700 }], { size: 12.5, lh: 19 });
      k.bullets(56, 576, 560, [
        "특정 노드에 기대지 못하게 → 매번 다른 작은 망을 학습하는 효과",
        "점 30개 + 128 × 128 망 실험: p = 0.2 · 0.5 에서 val 손실 상승이 줄어듦",
        "추론 때 스케일 보정이 필요 없음 — 학습 때 이미 1/(1 − p) 를 곱했기 때문"
      ], { size: 12.5, lh: 20, tone: "orange" });

      k.section(646, 150, "② Gradient Clipping — 임계값 c = 1", { tone: "amber" });
      k.panel(646, 164, 594, 474, { tone: "amber", tinted: true });
      var ox = 690, oy = 330, u = 86;
      var X = function (v) { return ox + v * u; }, Y = function (v) { return oy - v * u; };
      k.path("M" + X(-0.3) + " " + oy + " H" + X(3.3) + " M" + ox + " " + Y(-0.35) + " V" + Y(1.4), { tone: "gray", width: 1 });
      k.path("M" + X(1) + " " + oy + " A" + u + " " + u + " 0 0 0 " + ox + " " + Y(1), { tone: "blue", width: 1.4, dash: "5 4" });
      k.path("M" + X(1) + " " + Y(-0.3) + " V" + Y(1) + " H" + X(-0.3), { tone: "orange", width: 1.4, dash: "5 4" });
      k.arrow(ox, oy, X(3), Y(0.8), { tone: "gray", width: 2.2, dash: true });
      k.arrow(ox, oy, X(1), Y(0.8), { tone: "orange", width: 3 });
      k.arrow(ox, oy, X(0.966), Y(0.258), { tone: "blue", width: 3 });
      k.text(X(3) + 8, Y(0.8) + 5, "g = (3, 0.8)", { size: 13, weight: 800, color: "muted" });
      k.text(X(1) + 8, Y(0.8) - 10, "clipvalue (1, 0.8)", { size: 12.5, weight: 800, tone: "orange" });
      k.text(X(1.05) + 4, Y(0.258) + 18, "clipnorm (0.966, 0.258)", { size: 12.5, weight: 800, tone: "blue" });
      k.text(ox - 6, oy + 16, "0", { size: 11.5, anchor: "end", color: "muted" });
      k.lines(662, 372, [
        "‖g‖ = √(3² + 0.8²) = **3.105** > c = 1",
        { t: "clipnorm : g × c/‖g‖ = (0.966, 0.258) → 방향 유지, 길이만 1", tone: "blue" },
        { t: "clipvalue : 원소마다 [−1, 1] 로 자름 = (1, 0.8) → 방향이 바뀜", tone: "orange" }
      ], { size: 13, lh: 22, color: "ink" });

      var cx0 = 690, cy0 = 458, cw = 520, ch = 100;
      k.axes(cx0, cy0, cw, ch, { x: "학습 스텝 →", y: "기울기 크기 ‖g‖" });
      var g = [0.6, 0.8, 0.7, 1.9, 0.9, 0.7, 3.2, 1.0, 0.8, 0.6, 2.6, 0.9, 0.7, 0.8, 4.1, 1.1, 0.8, 0.7, 0.6, 0.9];
      var GX = function (i) { return cx0 + 14 + i * (cw - 28) / (g.length - 1); }, GY = function (v) { return cy0 + ch - v / 4.4 * ch; };
      var d1 = "", d2 = "";
      g.forEach(function (v, i) { d1 += (i ? " L" : "M") + GX(i).toFixed(1) + " " + GY(v).toFixed(1); d2 += (i ? " L" : "M") + GX(i).toFixed(1) + " " + GY(Math.min(1, v)).toFixed(1); });
      k.path(d1, { tone: "gray", width: 1.6, dash: "5 4" });
      k.path("M" + cx0 + " " + GY(1) + " H" + (cx0 + cw), { tone: "red", width: 1.4, dash: "3 3" });
      k.path(d2, { tone: "amber", width: 2.8 });
      k.text(cx0 + cw - 4, GY(1) - 6, "임계값 c", { size: 12, weight: 800, anchor: "end", tone: "red" });
      k.text(GX(14) + 10, GY(4.1) + 12, "폭발한 기울기", { size: 12, color: "muted" });
      k.bullets(662, 602, 560, [
        "점선 = 원래 크기 · 실선 = 자른 뒤 → 한 번에 멀리 튀거나 NaN이 되는 것을 막음",
        "global_clipnorm = 전체 가중치를 한 벡터로 보고 자름 (RNN에서 특히 중요)"
      ], { size: 12.5, lh: 20, tone: "amber" });

      k.code(40, 652, 590, 44, ["x = layers.Dropout(0.5)(x)          # 은닉층 활성 함수 뒤"], { size: 13 });
      k.code(646, 652, 594, 44, ["opt = keras.optimizers.Adam(clipnorm=1.0)   # 옵티마이저 인자"], { size: 13 });
    }
  });

  /* ---------------- (3) 고속 옵티마이저 ---------------- */
  DSDiagram.register({
    id: "nn-optimization-3", sim: "nn-optimization", order: 3,
    title: "신경망 최적화 (3) — 고속 옵티마이저", short: "고속 옵티마이저",
    sub: "길쭉한 그릇 f = 0.05x² + 2.2y² (세로가 44배 가파름) · 시작점 (−5.2, 1.6) · η = 0.3 — 지그재그 대신 곧장 최솟값으로",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 손실 등고선 위의 경로 (30 스텝)", { tone: "purple" });
      k.panel(40, 164, 640, 360, { tone: "purple", tinted: true });
      var cx = 360, cy = 340, sc = 48;
      var PX = function (x) { return cx + x * sc; }, PY = function (y) { return cy - y * sc; };
      [0.1, 0.5, 1.5, 3, 5, 7, 9].forEach(function (c) {
        var xm = Math.min(6.2, Math.sqrt(c / 0.05)), top = "", bot = "";
        for (var i = 0; i <= 60; i++) {
          var x = -xm + 2 * xm * i / 60, yv = Math.sqrt(Math.max(0, (c - 0.05 * x * x) / 2.2));
          top += (i ? " L" : "M") + PX(x).toFixed(1) + " " + PY(yv).toFixed(1);
          bot += (i ? " L" : "M") + PX(x).toFixed(1) + " " + PY(-yv).toFixed(1);
        }
        k.path(top, { tone: "gray", width: 1 }); k.path(bot, { tone: "gray", width: 1 });
      });
      var grad = function (x, y) { return [0.1 * x, 4.4 * y]; }, lr = 0.3, N = 30;
      function run(kind) {
        var x = -5.2, y = 1.6, v = [0, 0], m = [0, 0], s = [0, 0], pts = [[x, y]];
        for (var t = 1; t <= N; t++) {
          var g = grad(x, y);
          if (kind === "sgd") { x -= lr * g[0]; y -= lr * g[1]; }
          else if (kind === "mom") { v = [0.9 * v[0] - lr * g[0], 0.9 * v[1] - lr * g[1]]; x += v[0]; y += v[1]; }
          else {
            m = [0.9 * m[0] + 0.1 * g[0], 0.9 * m[1] + 0.1 * g[1]]; s = [0.999 * s[0] + 0.001 * g[0] * g[0], 0.999 * s[1] + 0.001 * g[1] * g[1]];
            var c1 = 1 - Math.pow(0.9, t), c2 = 1 - Math.pow(0.999, t);
            x -= lr * (m[0] / c1) / (Math.sqrt(s[0] / c2) + 1e-7); y -= lr * (m[1] / c1) / (Math.sqrt(s[1] / c2) + 1e-7);
          }
          pts.push([x, y]);
        }
        return pts;
      }
      [["mom", "blue", 1.5], ["sgd", "red", 2.2], ["adam", "green", 2.4]].forEach(function (o) {
        var p = run(o[0]), d = "";
        p.forEach(function (q, i) { d += (i ? " L" : "M") + PX(q[0]).toFixed(1) + " " + PY(q[1]).toFixed(1); });
        k.path(d, { tone: o[1], width: o[2] });
        p.forEach(function (q, i) { if (i) k.circle(PX(q[0]), PY(q[1]), 2.4, { tone: o[1], fill: "solid" }); });
      });
      k.circle(PX(-5.2), PY(1.6), 6, { tone: "ink", fill: "solid" });
      k.text(PX(-5.2) - 2, PY(1.6) - 12, "시작 (−5.2, 1.6)", { size: 12.5, weight: 700, color: "ink" });
      k.text(PX(0), PY(0) + 5, "★", { size: 18, anchor: "middle", tone: "amber" });
      var cxp = 56;
      [["SGD — 가로로 느림", "red"], ["Momentum — 관성 · 출렁임", "blue"], ["Adam — 방향별 보폭", "green"], ["★ 최솟값 (0, 0)", "amber"]].forEach(function (c) {
        cxp += k.chip(cxp, 486, c[0], { tone: c[1], size: 12 }) + 8;
      });

      k.section(696, 150, "② 갱신 규칙 (g = ∂L/∂w)", { tone: "purple" });
      var R = [
        ["SGD", "w ← w − η·g", "기울기 그대로 · 가파른 방향으로 크게 튐", "red"],
        ["Momentum", "v ← 0.9v − η·g ,  w ← w + v", "이전 이동을 누적한 관성 → 지그재그 상쇄", "blue"],
        ["Nesterov", "g 를 미리 가 본 w + 0.9v 에서 계산", "관성으로 갈 곳을 먼저 보고 보정", "teal"],
        ["RMSProp", "s ← 0.9s + 0.1g² ,  w ← w − η·g / √s", "기울기가 큰 방향은 보폭을 줄임", "orange"],
        ["Adam", "m ← 0.9m + 0.1g ,  s ← 0.999s + 0.001g²\nw ← w − η·m̂ / √ŝ  (m̂, ŝ = 편향 보정)", "Momentum + RMSProp · 기본 선택", "green"]
      ];
      var yy = 166;
      R.forEach(function (r) {
        var h = r[1].indexOf("\n") >= 0 ? 82 : 62;
        k.panel(696, yy, 544, h, { tone: r[3], tinted: true });
        k.text(712, yy + 24, r[0], { size: 15, weight: 800, tone: r[3] });
        k.text(816, yy + 24, r[2], { size: 12.5, color: "muted" });
        r[1].split("\n").forEach(function (l, i) { k.text(712, yy + 47 + i * 21, l, { size: 14, weight: 700, color: "ink" }); });
        yy += h + 6;
      });

      k.section(40, 556, "③ 첫 스텝 직접 계산 — g = (0.1x, 4.4y) = (−0.52, 7.04),  시작 f = 6.984", { tone: "orange" });
      k.table(40, 570, [250, 420, 170, 360], [
        ["옵티마이저", "첫 스텝", "새 위치", "f · 해석"],
        [{ t: "SGD = Momentum = Nesterov", tone: "red" }, "(−5.2, 1.6) − 0.3 × (−0.52, 7.04)", { t: "(−5.044, −0.512)", mono: true }, "1.849 · y는 0을 넘어 반대편, x는 0.156만"],
        [{ t: "RMSProp", tone: "orange" }, "s = 0.1g² → 보폭 0.3 / √0.1 = 0.949 (두 방향 같음)", { t: "(−4.251, 0.651)", mono: true }, "1.837 · 가로로도 크게 이동"],
        [{ t: "Adam", tone: "green" }, "m̂ = g , ŝ = g² → 보폭 = η = 0.3 (두 방향 같음)", { t: "(−4.900, 1.300)", mono: true }, "4.919 · 첫 스텝은 작지만 방향이 고름"]
      ], { rh: 30, size: 12.5, firstBold: false });
    }
  });

  /* ---------------- (4) 조기 종료 · L2 규제 · 정리 ---------------- */
  DSDiagram.register({
    id: "nn-optimization-4", sim: "nn-optimization", order: 4,
    title: "신경망 최적화 (4) — 조기 종료 · L2 규제와 기법 정리", short: "조기 종료 · L2 · 정리",
    sub: "과적합이 시작되면 train 손실은 계속 내려가도 val 손실은 올라간다 — 나빠지기 전에 멈추고(EarlyStopping), 가중치를 작게 눌러(L2) 외우기를 막는다",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 조기 종료 (EarlyStopping) — patience 20", { tone: "teal" });
      k.panel(40, 164, 640, 290, { tone: "teal", tinted: true });
      var px = 92, py = 186, pw = 560, ph = 200, E = 400;
      var tr = function (e) { return 0.03 + 0.66 * Math.exp(-e / 55); };
      var va = function (e) { return 0.2 + 0.5 * Math.exp(-e / 32) + 0.5 * Math.pow(e / E, 2); };
      var X = function (e) { return px + e / E * pw; }, Y = function (v) { return py + ph - v / 0.8 * ph; };
      var best = 0, bv = 9;
      for (var e = 0; e <= E; e++) if (va(e) < bv) { bv = va(e); best = e; }
      var stop = best + 20;
      k.rect(X(best), py, X(stop) - X(best), ph, { tone: "teal", fill: "tone" });
      k.axes(px, py, pw, ph, { x: "에포크 →", y: "손실" });
      var d1 = "", d2 = "", d3 = "";
      for (var i = 0; i <= 100; i++) {
        var ee = E * i / 100;
        d1 += (i ? " L" : "M") + X(ee).toFixed(1) + " " + Y(tr(ee)).toFixed(1);
        if (ee <= stop) d2 += (d2 ? " L" : "M") + X(ee).toFixed(1) + " " + Y(va(ee)).toFixed(1);
        if (ee >= stop - 4) d3 += (d3 ? " L" : "M") + X(ee).toFixed(1) + " " + Y(va(ee)).toFixed(1);
      }
      k.path(d3, { tone: "gray", width: 1.6, dash: "2 4" });
      k.path(d1, { tone: "blue", width: 2.2, dash: "6 4" });
      k.path(d2, { tone: "orange", width: 2.8 });
      k.path("M" + X(stop) + " " + py + " V" + (py + ph), { tone: "red", width: 1.8, dash: "5 4" });
      k.circle(X(best), Y(bv), 6, { tone: "green", fill: "solid" });
      k.text(286, 262, "최저 val = 되돌아갈 가중치", { size: 12, weight: 800, tone: "green" });
      k.arrow(300, 268, X(best) + 6, Y(bv) - 6, { tone: "green", width: 1.4 });
      k.text(X(stop) + 6, py + 16, "멈춘 에포크", { size: 12, weight: 800, tone: "red" });
      k.text(X(stop) + 6, py + 32, "= 최저 + patience 20", { size: 12, color: "muted" });
      k.text(X(330), Y(va(330)) - 24, "멈추지 않았다면", { size: 12, anchor: "middle", color: "muted" });
      k.text(X(300), Y(tr(300)) - 10, "train 손실", { size: 12, weight: 700, anchor: "middle", tone: "blue" });
      k.text(X(20) + 4, Y(va(20)) - 30, "val 손실", { size: 12, weight: 700, tone: "orange" });
      k.text(56, 440, "monitor = val_loss · restore_best_weights = True → 최저 val 시점의 가중치로 되돌림", { size: 12.5, weight: 700, tone: "teal" });

      k.section(696, 150, "② L2 규제 — kernel_regularizer = l2(λ)", { tone: "purple" });
      k.panel(696, 164, 544, 290, { tone: "purple", tinted: true });
      k.formula(712, 180, 512, 62, "학습이 줄이는 값 = BCE + **λ · Σ w²**\n∂/∂w (λw²) = **2λw** → 매 스텝 w를 0 쪽으로 당김", { size: 14.5, tone: "purple" });
      k.lines(712, 270, [
        "예) λ = 0.01, w = 0.5 → 벌점 0.01 × 0.25 = **0.0025**",
        "     추가 기울기 2 × 0.01 × 0.5 = **0.01** (큰 w일수록 크게)"
      ], { size: 13, lh: 22, color: "ink" });
      curve(k, 840, 420, 220, 90, gauss(0.42, 0.62), "gray", "mid");
      curve(k, 840, 420, 220, 90, gauss(0.16, 1), "purple");
      k.text(966, 352, "가중치 분포", { size: 12.5, weight: 800, color: "ink" });
      k.text(966, 374, "λ = 0 : 넓게 퍼짐", { size: 12.5, color: "muted" });
      k.text(966, 396, "λ = 0.01 : 0 근처로 모임", { size: 12.5, weight: 700, tone: "purple" });
      k.text(966, 418, "→ 경계가 매끈해지고 격차 감소", { size: 12.5, weight: 700, tone: "purple" });

      k.section(40, 486, "③ 신경망 최적화 기법 정리", { tone: "ink" });
      k.table(40, 498, [158, 340, 282, 420], [
        ["기법", "무엇을 해결하나", "어디에 넣나", "Keras 코드 한 줄"],
        [{ t: "가중치 초기화", tone: "blue" }, "활성값 · 기울기가 0으로 사라지거나 폭발", "Dense · Conv 층의 인자", { t: 'kernel_initializer="he_normal"', mono: true }],
        [{ t: "배치 정규화", tone: "green" }, "층 입력 분포 흔들림 · 높은 학습률에서 불안정", "Dense · Conv 뒤, 활성 함수 앞", { t: "BatchNormalization()", mono: true }],
        [{ t: "드롭아웃", tone: "orange" }, "작은 데이터에서 과적합 (특정 노드 의존)", "은닉층 활성 함수 뒤", { t: "Dropout(0.5)", mono: true }],
        [{ t: "옵티마이저", tone: "purple" }, "지그재그 · 느린 수렴 · 안장점에서 정체", "compile()의 optimizer", { t: "optimizer=Adam(learning_rate=1e-3)", mono: true }],
        [{ t: "Gradient Clipping", tone: "amber" }, "기울기 폭발 → 가중치가 튀고 손실 NaN", "옵티마이저의 인자", { t: "Adam(clipnorm=1.0)", mono: true }],
        [{ t: "조기 종료", tone: "teal" }, "과적합이 시작된 뒤에도 계속 학습", "fit()의 callbacks", { t: "EarlyStopping(patience=10, restore_best_weights=True)", mono: true, size: 11.5 }],
        [{ t: "L2 규제", tone: "pink" }, "큰 가중치로 훈련 데이터를 외우는 과적합", "Dense · Conv 층의 인자", { t: "kernel_regularizer=l2(1e-4)", mono: true }]
      ], { rh: 25, size: 12.5, firstBold: false });
    }
  });
})();
