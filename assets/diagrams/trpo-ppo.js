/* TRPO → PPO — 알고리즘 구성도 (시뮬레이터 trpo-ppo.html 과 같은 예제 숫자) */
(function () {
  var LABEL = "Reinforcement Learning";
  var neg = function (v, d) { var s = Math.abs(v).toFixed(d == null ? 3 : d); return (v < 0 && +s !== 0 ? "−" : "") + s; };
  var sgn = function (v, d) { return (v > 0 ? "+" : "") + neg(v, d); };
  function sig(t) { return 1 / (1 + Math.exp(-t)); }
  function Jc(t) { var p = sig(t); return -2 * (2 - p) / (p * (1 - p)); }
  function pol(a, b) { var e0 = Math.exp(a), e1 = Math.exp(b), s = e0 + e1 + 1; return [e0 / s, e1 / s, 1 / s]; }
  function klv(p, q) { var s = 0; for (var i = 0; i < 3; i++) s += p[i] * Math.log(p[i] / q[i]); return s; }

  /* ---------------------------------------------------------------- 1 */
  DSDiagram.register({
    id: "trpo-ppo-1", sim: "trpo-ppo", order: 1,
    title: "TRPO → PPO (1) — 왜 업데이트 폭을 제한하나", short: "폭 제한의 이유",
    sub: "정책 경사는 지금 정책 근처에서만 맞는 방향 · 큰 걸음은 성능 붕괴, 옛 데이터 재사용에는 중요도 비율이 필요",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 짧은 복도 — 큰 걸음은 최적점을 넘는다", { tone: "red" });
      k.panel(40, 164, 610, 368, { tone: "red", tinted: true });
      /* 복도 */
      var cx = 62, cy = 182, cw = 64;
      [["S", "blue", "시작"], ["반대", "pink", "→ 누르면 ←"], ["", "gray", ""], ["G", "green", "도착"]].forEach(function (c, i) {
        k.box(cx + i * (cw + 6), cy, cw, 40, { tone: c[1], fill: i === 2 ? "plain" : "tone", title: c[0], size: 14, r: 6 });
        if (c[2]) k.text(cx + i * (cw + 6) + cw / 2, cy + 56, c[2], { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.text(356, 198, "세 칸을 구별 못 함 → 모든 칸에서 같은 p(→)", { size: 12.5, weight: 700, color: "ink" });
      k.text(356, 218, "매 걸음 보상 −1 · p(→) = σ(θ)", { size: 12.5, color: "muted" });
      k.text(356, 236, "J(p) = −2(2 − p) / (p(1 − p))", { size: 12.5, weight: 700, tone: "purple" });
      /* J(θ) 곡선 */
      var x0 = 92, x1 = 392, y0 = 270, y1 = 496, tl = -4, th = 4, jl = -60, jh = -8;
      var X = function (t) { return x0 + (x1 - x0) * (t - tl) / (th - tl); }, Y = function (j) { return y0 + (y1 - y0) * (jh - Math.max(j, jl - 4)) / (jh - jl); };
      k.axes(x0, y0, x1 - x0, y1 - y0, { y: "J(θ)" });
      k.text(x1 + 4, y1 - 6, "θ", { size: 12, color: "muted" });
      [-50, -30, -10].forEach(function (v) { k.text(x0 - 6, Y(v) + 4, neg(v, 0), { size: 11.5, anchor: "end", color: "muted" }); });
      [-4, -2, 0, 2, 4].forEach(function (v) { k.text(X(v), y1 + 16, neg(v, 0), { size: 11.5, anchor: "middle", color: "muted" }); });
      var d = "", t;
      for (t = -2.95; t <= 3.95; t += 0.05) { var j = Jc(t); if (j < jl - 4) continue; d += (d ? " L" : "M") + X(t).toFixed(1) + " " + Y(j).toFixed(1); }
      k.path(d, { tone: "purple", width: 2.6 });
      var t0 = -1.5, g0 = 17.4805, t1 = 2.8701;
      k.path("M" + X(-3.3) + " " + Y(Jc(t0) + g0 * (-3.3 - t0)) + " L" + X(-0.45) + " " + Y(Jc(t0) + g0 * (-0.45 - t0)), { tone: "pink", width: 1.6, dash: "6 5" });
      var ts = Math.log((2 - Math.SQRT2) / (Math.SQRT2 - 1));
      k.path("M" + X(ts) + " " + y0 + " V" + y1, { tone: "gray", width: 1.2, dash: "3 4" });
      k.text(X(ts) + 4, y0 + 12, "최적 p = 0.586", { size: 11.5, color: "muted" });
      k.arrow(X(t0), Y(Jc(t0)), X(t1) - 4, Y(-41.51) - 2, { tone: "orange", width: 2.2 });
      k.circle(X(t0), Y(Jc(t0)), 5.5, { tone: "blue", fill: "solid" });
      k.circle(X(t1), Y(-41.51), 5.5, { tone: "orange", fill: "solid" });
      k.text(X(t0) - 10, Y(Jc(t0)) + 18, "θ_old", { size: 12, weight: 800, tone: "blue", anchor: "end" });
      k.text(X(t1) + 10, Y(-41.51) + 4, "θ_new", { size: 12, weight: 800, tone: "orange" });
      k.text(X(-3.2), Y(-17), "1차 근사", { size: 11.5, weight: 700, tone: "pink" });
      /* 숫자 */
      k.box(410, 262, 228, 252, { tone: "gray", fill: "plain", align: "left", valign: "top", title: "α = 0.25 한 걸음", titleColor: "ink", size: 14, r: 8,
        lines: [
          { t: "θ_old = −1.5 → p(→) = 0.182", size: 12 },
          { t: "∇J = 17.48", size: 12 },
          { t: "Δθ = 0.25 × 17.48 = 4.37", size: 12 },
          { t: "θ_new = 2.87 → p(→) = 0.946", size: 12, tone: "orange" },
          { t: "예측 ΔJ = 17.48 × 4.37 = +76.39", size: 12, tone: "pink" },
          { t: "실제 J: −24.37 → −41.51", size: 12, weight: 700, tone: "red" },
          { t: "실제 ΔJ = −17.13 (붕괴)", size: 12, weight: 700, tone: "red" },
          { t: "KL(π_old ‖ π_new) = 1.927", size: 12 },
          { t: "α = 0.05면 J = −14.55 (개선)", size: 12, weight: 700, tone: "green" }
        ] });

      k.section(670, 150, "② 중요도 비율 · 대리 목적 — 옛 데이터로 새 정책 평가", { tone: "orange" });
      k.panel(670, 164, 570, 368, { tone: "orange", tinted: true });
      k.formula(686, 178, 538, 58, "r(θ) = π_θ(a|s) / π_old(a|s)\nL(θ) = E_old[ r(θ) · A ]   (θ = θ_old에서 ∇L = 정책 경사)", { size: 14 });
      k.text(686, 256, "치료 선택: π = softmax(θ_A, θ_B, 0) · π_old = 균등 1/3 · b = 0.565 · θ_new = θ_old + 4·ĝ", { size: 12, color: "muted" });
      var rows = [["#", "행동", "A = R − b", "π_new", "r", "r · A"]];
      var B = [[0, 0.055], [1, 0.345], [2, -0.385], [1, 0.135], [0, -0.155], [2, -0.215], [1, 0.265], [0, -0.045]];
      var pn = pol(-0.0725, 0.3725), names = ["치료 A", "치료 B", "치료 C"], tn = ["blue", "orange", "purple"];
      B.forEach(function (b, i) { var r = pn[b[0]] * 3; rows.push([String(i + 1), { t: names[b[0]], tone: tn[b[0]], weight: 700 }, { t: sgn(b[1], 3), tone: b[1] >= 0 ? "green" : "red", mono: true }, { t: pn[b[0]].toFixed(3), mono: true }, { t: r.toFixed(3), mono: true, weight: 700 }, { t: sgn(r * b[1], 4), mono: true }]); });
      k.table(686, 266, [40, 96, 116, 96, 90, 100], rows, { rh: 25, size: 12.5 });
      k.note(686, 498 - 2, 538, 30, { tone: "orange", title: "L̂ = 평균 r·A = +0.0384  vs  실제 ΔJ = +0.0305  ·  KL = 0.0197", size: 13 });

      k.section(40, 568, "③ 그래서 정책이 한 번에 바뀌는 폭을 제한한다", { tone: "purple" });
      k.flow(40, 584, [
        { t: "정책 경사", s: "REINFORCE · A2C (데이터 1번)", tone: "gray", fill: "soft" },
        { t: "중요도 비율 r(θ)", s: "옛 데이터 재사용", tone: "orange" },
        { t: "TRPO", s: "KL ≤ δ 제약 · 2차 미분", tone: "blue" },
        { t: "PPO", s: "r을 [1−ε, 1+ε]로 클립", tone: "orange", fill: "mid" },
        { t: "RLHF의 PPO", s: "보상 − β·KL(π ‖ π_ref)", tone: "pink" }
      ], { w: 1200, h: 50 });
      k.note(40, 650, 1200, 50, { tone: "purple", title: "TRPO 하한 정리:  J(π_new) ≥ J(π_old) + L(π_new) − C · max KL(π_old ‖ π_new)", body: "대리 목적 L을 올리면서 KL을 작게 유지하면 실제 성능 개선이 보장된다 — TRPO는 KL을 제약으로, PPO는 클립 또는 KL 벌점으로 이 아이디어를 구현한다." });
    }
  });

  /* ---------------------------------------------------------------- 2 */
  DSDiagram.register({
    id: "trpo-ppo-2", sim: "trpo-ppo", order: 2,
    title: "TRPO → PPO (2) — 신뢰 영역과 자연 경사", short: "TRPO 신뢰 영역",
    sub: "Trust Region Policy Optimization · 치료 선택 정책(θ_A, θ_B), 출발점 (1.5, −1), δ = 0.05 를 기대값으로 정확히 계산",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 문제 정식화 → 근사 → 닫힌 해", { tone: "blue" });
      k.formula(40, 164, 1200, 46, "최대화 L(θ)  제약 KL(π_old ‖ π_θ) ≤ δ   →   L ≈ gᵀΔθ,  KL ≈ ½ ΔθᵀFΔθ   →   **Δθ = √( 2δ / gᵀF⁻¹g ) · F⁻¹g**", { size: 16 });

      k.section(40, 246, "② 파라미터 평면에서 본 한 걸음", { tone: "pink" });
      k.panel(40, 260, 420, 400, { tone: "pink", tinted: true });
      /* 평면: θ_A ∈ [0, 3], θ_B ∈ [−2.5, 0.8] */
      var px0 = 76, px1 = 440, py0 = 278, py1 = 560, a0 = -0.6, a1 = 3.4, b0 = -3.5, b1 = 0.9;
      var X = function (a) { return px0 + (px1 - px0) * (a - a0) / (a1 - a0); }, Y = function (b) { return py1 - (py1 - py0) * (b - b0) / (b1 - b0); };
      k.axes(px0, py0, px1 - px0, py1 - py0, {});
      k.text(px1, py1 + 16, "θ_A →", { size: 12, anchor: "end", color: "muted" });
      k.text(px0 + 6, py0 + 14, "θ_B ↑", { size: 12, color: "muted" });
      var c = [1.5, -1], p0 = pol(c[0], c[1]), dd = "", qd = "", F = [[p0[0] * (1 - p0[0]), -p0[0] * p0[1]], [-p0[0] * p0[1], p0[1] * (1 - p0[1])]];
      for (var i = 0; i <= 90; i++) {
        var an = i / 90 * Math.PI * 2, u = [Math.cos(an), Math.sin(an)], lo = 0, hi = 10;
        for (var it = 0; it < 40; it++) { var m = (lo + hi) / 2; if (klv(p0, pol(c[0] + m * u[0], c[1] + m * u[1])) < 0.05) lo = m; else hi = m; }
        dd += (i ? " L" : "M") + X(c[0] + lo * u[0]).toFixed(1) + " " + Y(c[1] + lo * u[1]).toFixed(1);
        var q = u[0] * (F[0][0] * u[0] + F[0][1] * u[1]) + u[1] * (F[1][0] * u[0] + F[1][1] * u[1]), rq = Math.sqrt(0.1 / q);
        qd += (i ? " L" : "M") + X(c[0] + rq * u[0]).toFixed(1) + " " + Y(c[1] + rq * u[1]).toFixed(1);
      }
      k.path(qd, { tone: "gray", width: 1.5, dash: "5 4" });
      k.path(dd, { tone: "pink", width: 2.6 });
      k.arrow(X(1.5), Y(-1), X(2.329), Y(-0.580), { tone: "gray", width: 2.4 });
      k.arrow(X(1.5), Y(-1), X(2.241), Y(0.235), { tone: "orange", width: 3 });
      k.circle(X(1.5), Y(-1), 6, { tone: "blue", fill: "solid" });
      k.text(X(1.5) - 10, Y(-1) + 20, "θ_old (1.5, −1)", { size: 12, weight: 800, tone: "blue", anchor: "middle" });
      k.text(X(2.30), Y(-0.45) - 6, "일반 경사 g", { size: 12, weight: 700, color: "muted", anchor: "start" });
      k.text(X(2.24) + 8, Y(0.235) + 4, "자연 경사 F⁻¹g", { size: 12, weight: 800, tone: "orange" });
      k.text(px0 - 20, py1 + 40, "분홍 = 실제 KL = 0.05 경계", { size: 12, weight: 700, tone: "pink" });
      k.text(px0 - 20, py1 + 60, "점선 = 2차 근사 ½ΔθᵀFΔθ = 0.05", { size: 12, color: "muted" });
      k.text(px0 - 20, py1 + 80, "π_old = (0.766, 0.063, 0.171)", { size: 12, color: "muted" });

      k.section(480, 246, "③ 숫자로 따라가기", { tone: "blue" });
      k.panel(480, 260, 760, 400, { tone: "blue", tinted: true });
      k.text(498, 290, "1. 경사와 피셔 행렬", { size: 14, weight: 800, tone: "blue" });
      k.text(498, 314, "g = ( π_A(μ_A − J), π_B(μ_B − J) ) = (0.0297, 0.0150)", { size: 12.5, color: "ink" });
      k.text(498, 334, "J(θ_old) = 0.5113 · F = E[∇log π ∇log πᵀ] = diag(π) − ππᵀ", { size: 12.5, color: "muted" });
      k.matrix(540, 352, [["0.1792", "−0.0482"], ["−0.0482", "0.0589"]], { cw: 74, ch: 28, size: 13, mono: true, tone: "purple", rows: ["F =", ""] });
      k.text(498, 434, "2. 켤레 기울기법(CG) F x = g", { size: 14, weight: 800, tone: "blue" });
      k.table(498, 446, [70, 150, 150], [["k", "x_k", "‖g − F x_k‖"], ["0", { t: "(0, 0)", mono: true }, { t: "0.0333", mono: true }], ["1", { t: "(0.256, 0.130)", mono: true }, { t: "0.0221", mono: true }], ["2", { t: "(0.300, 0.500)", mono: true, weight: 800 }, { t: "≈ 0", mono: true }]], { rh: 26, size: 12.5 });
      k.note(498, 560, 370, 84, { tone: "orange", title: "자연 경사 x = F⁻¹g = (0.30, 0.50)", body: "이 문제에서는 어디서 출발해도 (μ_A − μ_C, μ_B − μ_C) 로 같다. 일반 경사 g는 A 쪽을, 자연 경사는 B 쪽을 가리킨다." });
      k.text(892, 290, "3. 걸음 크기", { size: 14, weight: 800, tone: "blue" });
      k.lines(892, 314, [
        { t: "xᵀF x = gᵀx = 0.01640" },
        { t: "β = √(2 × 0.05 / 0.01640) = **2.469**" },
        { t: "Δθ = β·x = (0.741, 1.235)" },
        { t: "예상 개선 gᵀΔθ = +0.0405" }
      ], { size: 12.5, lh: 21, color: "ink" });
      k.text(892, 412, "4. 선 탐색 (0.5^j 씩 줄이기)", { size: 14, weight: 800, tone: "blue" });
      k.table(892, 424, [36, 70, 92, 92], [["j", "비율", "실제 KL", "개선 ΔL"], ["0", { t: "1.000", mono: true }, { t: "0.0450", mono: true }, { t: "+0.0347", mono: true, tone: "green" }]], { rh: 26, size: 12.5 });
      k.text(892, 496, "KL ≤ 0.05 이고 개선 > 0 → j = 0 채택", { size: 12.5, weight: 700, tone: "green" });
      k.note(892, 512, 332, 132, { tone: "red", title: "2차 근사가 KL을 낮게 볼 때", body: "출발점 (−2, −2)에서는 j = 0 의 실제 KL이 0.0590 > 0.05 라 거절되고, 절반(j = 1)에서 KL 0.0136 · 개선 +0.0305 로 채택된다. 선 탐색이 근사 오차를 막아 준다." });

      k.note(40, 672, 1200, 28, { tone: "gray", title: "실제 TRPO: F를 만들지 않고 KL의 헤시안–벡터 곱 F·v 만 계산해 CG 10회 + 선 탐색 → 정확하지만 2차 미분이 필요하고 무겁다 → PPO", size: 13 });
    }
  });

  /* ---------------------------------------------------------------- 3 */
  DSDiagram.register({
    id: "trpo-ppo-3", sim: "trpo-ppo", order: 3,
    title: "TRPO → PPO (3) — PPO-Clip 목적 함수", short: "PPO-Clip",
    sub: "Proximal Policy Optimization · 비율 r을 [1−ε, 1+ε] 밖으로 밀어도 이득이 없게 만든 1차 미분 방법 (ε = 0.2)",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① L^CLIP = E[ min( r·A , clip(r, 1−ε, 1+ε)·A ) ]", { tone: "orange" });
      [[1, 40, "A > 0 : 좋았던 행동 → 1+ε 까지만 올림"], [-1, 340, "A < 0 : 나빴던 행동 → 1−ε 까지만 내림"]].forEach(function (cfg) {
        var A = cfg[0], ox = cfg[1], w = 286, x0 = ox + 30, x1 = ox + w - 10, y0 = 196, y1 = 380, eps = 0.2;
        k.panel(ox, 164, w, 246, { tone: A > 0 ? "green" : "red", tinted: true });
        var X = function (r) { return x0 + (x1 - x0) * r / 2; }, Y = A > 0 ? function (v) { return y1 - (y1 - y0) * v / 2; } : function (v) { return y0 + (y1 - y0) * (-v) / 2; };
        var zx0 = A > 0 ? X(1 + eps) : X(0), zx1 = A > 0 ? X(2) : X(1 - eps);
        k.rect(zx0, y0, zx1 - zx0, y1 - y0, { tone: "red", fill: "tone" });
        k.axes(x0, y0, x1 - x0, y1 - y0, {});
        k.path("M" + X(0) + " " + Y(0) + " L" + X(2) + " " + Y(2 * A), { tone: "gray", width: 1.5, dash: "6 5" });
        var dd = "", r;
        for (r = 0; r <= 2.0001; r += 0.05) { var v = Math.min(r * A, Math.max(1 - eps, Math.min(1 + eps, r)) * A); dd += (r ? " L" : "M") + X(r).toFixed(1) + " " + Y(v).toFixed(1); }
        k.path(dd, { tone: "orange", width: 3 });
        [[1 - eps, "0.8"], [1, "1"], [1 + eps, "1.2"]].forEach(function (q) { k.text(X(q[0]), y1 + 16, q[1], { size: 11.5, anchor: "middle", color: "muted" }); });
        k.text(x1, y1 + 16, "r", { size: 12, anchor: "end", color: "muted" });
        k.text(ox + 14, 188, cfg[2], { size: 12, weight: 800, tone: A > 0 ? "green" : "red" });
        k.text(A > 0 ? X(1.6) : X(0.4), A > 0 ? y1 - 20 : y0 + 22, "기울기 0", { size: 12, weight: 800, tone: "red", anchor: "middle" });
        k.text(A > 0 ? X(0.45) : X(1.5), A > 0 ? y0 + 26 : y0 + 28, A > 0 ? "r·A (점선)" : "r↑ (나빠지는 쪽)은", { size: 11.5, color: "muted", anchor: "middle" });
        if (A < 0) k.text(X(1.5), y0 + 46, "클립 없이 그대로 벌", { size: 11.5, color: "muted", anchor: "middle" });
      });
      k.note(40, 420, 586, 64, { tone: "orange", title: "비관적 하한 (pessimistic bound)", body: "min 덕분에 이득은 클립되고 손해는 그대로 반영 → 같은 배치로 K 에포크 반복해도 정책이 멀리 가지 않는다." });

      k.section(646, 150, "② 배치 표본별 클리핑 (2번 탭 예제 배치, α = 4)", { tone: "red" });
      var B = [[0, 0.055], [1, 0.345], [2, -0.385], [1, 0.135], [0, -0.155], [2, -0.215], [1, 0.265], [0, -0.045]];
      var pn = pol(-0.0725, 0.3725), names = ["치료 A", "치료 B", "치료 C"], tn = ["blue", "orange", "purple"];
      var rows = [["#", "행동", "A", "r", "r·A", "clip(r)·A", "min", "상태"]];
      B.forEach(function (b, i) {
        var r = pn[b[0]] * 3, c = Math.max(0.8, Math.min(1.2, r)), cl = (b[1] > 0 && r > 1.2) || (b[1] < 0 && r < 0.8);
        rows.push([String(i + 1), { t: names[b[0]], tone: tn[b[0]], weight: 700 }, { t: sgn(b[1], 3), mono: true, tone: b[1] >= 0 ? "green" : "red" }, { t: r.toFixed(3), mono: true, weight: 700 },
          { t: sgn(r * b[1], 4), mono: true }, { t: sgn(c * b[1], 4), mono: true }, { t: sgn(Math.min(r * b[1], c * b[1]), 4), mono: true }, cl ? { t: "클립 · 0", tone: "red", weight: 800 } : { t: "학습", tone: "green", weight: 700 }]);
      });
      k.table(646, 164, [28, 70, 72, 62, 76, 86, 76, 124], rows, { rh: 24.5, size: 12.5 });
      var sx = 646;
      [["L^CPI", "+0.0384"], ["L^CLIP", "+0.0303"], ["clip fraction", "0.375"], ["approx KL", "0.0213"], ["정확한 KL", "0.0197"]].forEach(function (s, i) {
        k.box(sx + i * 120, 398, 112, 52, { tone: i === 1 ? "orange" : "gray", fill: i === 1 ? "tone" : "plain", title: s[1], sub: s[0], size: 15, subSize: 11.5, r: 8 });
      });
      k.text(646, 470, "π_new = (0.275, 0.429, 0.296) · B 표본(A > 0, r = 1.288)은 1.2를 넘어 기울기 0", { size: 12, color: "muted" });

      k.section(40, 508, "③ 전체 손실과 변형", { tone: "purple" });
      k.formula(40, 522, 1200, 40, "L(θ) = L^CLIP(θ) − c₁ · (V_θ(s) − G)² + c₂ · H[π_θ(·|s)]     (c₁ = 0.5 가치 손실, c₂ = 0~0.01 엔트로피 보너스)", { size: 15 });
      k.table(40, 574, [190, 330, 300, 380], [
        ["방법", "폭을 제한하는 방법", "계산", "특징"],
        [{ t: "TRPO", tone: "blue", weight: 800 }, "KL(π_old ‖ π) ≤ δ  (하드 제약)", "자연 경사 + CG + 선 탐색", "이론 보장 · 구현 복잡 · 2차 미분"],
        [{ t: "PPO-Clip", tone: "orange", weight: 800 }, "r을 [1−ε, 1+ε]로 클립 (ε = 0.2)", "1차 미분 · 미니배치 K 에포크", "실무 표준 (SB3·CleanRL 기본)"],
        [{ t: "PPO-KL 벌점", tone: "teal", weight: 800 }, "E[r·A] − β·KL,  β 적응 조정", "KL > 1.5·d → β×2,  < d/1.5 → β÷2", "RLHF의 KL 벌점과 같은 발상"]
      ], { rh: 30, size: 13 });
    }
  });

  /* ---------------------------------------------------------------- 4 */
  DSDiagram.register({
    id: "trpo-ppo-4", sim: "trpo-ppo", order: 4,
    title: "TRPO → PPO (4) — PPO 학습 루프와 RLHF", short: "학습 루프 · RLHF",
    sub: "수집 → GAE → K 에포크 미니배치 최적화 → 진단 지표 확인, 그리고 같은 PPO가 LLM을 사람 선호에 맞추는 방식",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 업데이트 한 번의 흐름 (CartPole 기본 설정)", { tone: "blue" });
      var bx = [
        { t: "1. 수집", s: "π_old로 n_steps = 512 걸음", l: "s, a, r, log π_old, V", tone: "blue" },
        { t: "2. GAE 이점", s: "γ = 0.99 · λ = 0.95", l: "A_t = δ_t + γλ·A_{t+1}", tone: "purple" },
        { t: "3. K 에포크 최적화", s: "K = 10 · 미니배치 64", l: "L^CLIP − c₁L^VF + c₂H", tone: "orange" },
        { t: "4. 진단", s: "approx KL · clip fraction", l: "엔트로피 · 설명 분산", tone: "teal" }
      ], bw = 270, gap = 40, i, boxes = [];
      for (i = 0; i < 4; i++) {
        boxes.push(k.box(40 + i * (bw + gap), 166, bw, 78, { tone: bx[i].tone, title: bx[i].t, sub: bx[i].s, size: 15, subSize: 12, lines: [{ t: bx[i].l, size: 12.5, weight: 700, color: "ink" }] }));
        if (i) k.link(boxes[i - 1].r, boxes[i].l, { tone: "gray" });
      }
      k.arrow(boxes[3].b[0], 244, boxes[0].b[0], 244, { via: [[boxes[3].b[0], 264], [boxes[0].b[0], 264]], tone: "gray", dash: true });
      k.text(640, 280, "θ_old ← θ  (새 정책으로 다시 수집)", { size: 12.5, weight: 700, color: "muted", anchor: "middle" });
      k.formula(40, 292, 1200, 34, "δ_t = r_t + γ·V(s_{t+1})·(1 − done) − V(s_t)     ·     r(θ) = exp(log π_θ − log π_old)     ·     A는 미니배치마다 평균 0, 표준편차 1로 정규화", { size: 13.5, weight: 600 });

      k.section(40, 362, "② 실무자가 보는 진단 지표", { tone: "teal" });
      k.table(40, 376, [150, 250, 120, 260], [
        ["지표", "계산", "보통", "이상 신호 → 조치"],
        [{ t: "approx KL", tone: "pink", weight: 800 }, "평균[(r − 1) − log r]", "0.01~0.02", "0.05 이상 → lr·K ↓, target_kl"],
        [{ t: "clip fraction", tone: "red", weight: 800 }, "|r − 1| > ε 비율", "0.05~0.3", "계속 0.3↑ → 업데이트 과대"],
        [{ t: "엔트로피", tone: "amber", weight: 800 }, "−Σ π log π (최대 ln 2)", "서서히 ↓", "급락 + 낮은 성능 → c₂ ↑"],
        [{ t: "explained var.", tone: "purple", weight: 800 }, "1 − Var(G − V) / Var(G)", "0 → 1", "음수 지속 → 가치망 점검"]
      ], { rh: 29, size: 12.5 });
      k.note(40, 534, 780, 48, { tone: "orange", title: "클립을 끄면? (5번 탭 비교, 같은 seed)", body: "클립 없이 K = 10으로 재사용하면 approx KL이 크게 튀고 보상이 무너진다 — 폭 제한이 표본 재사용을 가능하게 한다." });

      k.section(840, 362, "③ RLHF에서의 PPO", { tone: "pink" });
      k.panel(840, 376, 400, 206, { tone: "pink", tinted: true });
      k.lines(856, 402, [
        { t: "**정책** = LLM · **행동** = 다음 토큰", tone: "orange" },
        { t: "**상태** = 프롬프트 + 지금까지의 토큰", tone: "blue" },
        { t: "**보상** = 보상 모형 점수 (마지막 토큰)", tone: "green" },
        { t: "  − β · (log π_θ − log π_ref)  (토큰마다)", tone: "pink" },
        { t: "**가치** = 가치 헤드 · **π_ref** = SFT 모형(고정)", tone: "purple" }
      ], { size: 12.5, lh: 22 });
      k.text(856, 520, "메모리에 4개 모형: 정책 · 기준 · 보상 · 가치", { size: 12.5, weight: 700, color: "ink" });
      k.text(856, 544, "최적 정책 π* ∝ π_ref · exp(R / β)", { size: 12.5, weight: 700, tone: "pink" });
      k.text(856, 566, "β↓ → 보상 해킹 · β↑ → SFT에서 못 벗어남", { size: 12, color: "muted" });

      k.section(40, 608, "④ 미니 RLHF (두 토큰 응답, 모의 점수): β에 따른 최적 정책", { tone: "green" });
      k.table(40, 618, [190, 200, 200, 160, 450], [
        ["β", "E[보상 모형 점수]", "E[의료진 평가 품질]", "KL(π ‖ π_ref)", "해석"],
        [{ t: "0.02", mono: true }, { t: "0.949", mono: true }, { t: "0.349", mono: true, tone: "red" }, { t: "3.041", mono: true }, { t: "\"100% 확실해요\"에 몰림 (99%) — 보상 해킹", tone: "red" }],
        [{ t: "0.2", mono: true }, { t: "0.790", mono: true }, { t: "0.511", mono: true, tone: "green", weight: 800 }, { t: "0.650", mono: true }, { t: "품질 최고 — 보상과 KL의 균형", tone: "green" }],
        [{ t: "2  (SFT: 0.418 · 0.333)", mono: true }, { t: "0.488", mono: true }, { t: "0.380", mono: true }, { t: "0.017", mono: true }, { t: "거의 SFT 그대로", color: "muted" }]
      ], { rh: 20, size: 12 });
    }
  });
})();
