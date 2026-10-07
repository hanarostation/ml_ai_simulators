/* Multi-armed Bandit — 알고리즘 구성도 (시뮬레이터 기본값: 치료법 5종 p = .30 .55 .45 .70 .60, seed 7, ε = 0.10, c = 0.50, d = 0.99) */
DSDiagram.register({
  id: "multi-armed-bandit-1", sim: "multi-armed-bandit", order: 1,
  title: "Bandit (1) — 문제 정의와 ε-greedy", short: "문제 정의 · ε-greedy",
  sub: "성공률을 모르는 k개의 팔 중 하나를 매번 골라 보상을 받으며, 탐험(정보 수집)과 활용(이득)의 균형을 배우는 1-상태 강화학습",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 문제 구조 */
    k.section(40, 152, "① 문제 구조 — 상태는 하나, 행동 = 팔 선택, 보상 = 성공 1 / 실패 0", { tone: "blue" });
    k.panel(40, 166, 1200, 162, { tone: "blue", tinted: true });
    var ag = k.box(64, 196, 200, 100, { tone: "orange", fill: "plain", title: "에이전트", size: 17, lines: [{ t: "추정값 Q(a) · 횟수 N(a)", size: 12.5, color: "muted" }, { t: "또는 사후분포 Beta(α, β)", size: 12.5, color: "muted" }] });
    var en = k.box(500, 196, 220, 100, { tone: "blue", fill: "plain", title: "환경 (팔 k = 5)", size: 17, lines: [{ t: "치료법 A~E", size: 12.5, color: "muted" }, { t: "실제 성공률 p_a는 숨김", size: 12.5, color: "muted" }] });
    k.arrow(264, 218, 500, 218, { tone: "orange", width: 2.4, label: "행동 aₜ = 치료법 하나 선택" });
    k.arrow(500, 276, 264, 276, { tone: "green", width: 2.4, label: "보상 rₜ ~ Bernoulli(p_a)", labelDy: 30 });
    k.text(382, 252, "t = 1 … T 반복", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });
    k.matrix(770, 222, [[0.30, 0.55, 0.45, 0.70, 0.60]], { cw: 62, ch: 36, size: 15, cols: ["A", "B", "C", "D", "E"], fmt: function (v) { return v.toFixed(2); },
      tones: function (i, j) { return j === 3 ? "green" : "gray"; }, fills: function (i, j) { return j === 3 ? "mid" : "plain"; } });
    k.text(770, 190, "실제 성공률 (시뮬레이터 '치료법 5종')", { size: 13, weight: 800, color: "ink" });
    k.text(1086, 245, "최적 팔 D", { size: 13, weight: 800, tone: "green" });
    k.text(1086, 263, "p* = 0.70", { size: 12.5, tone: "green" });
    k.formula(770, 270, 450, 46, "목표 Σ rₜ 최대  ⇔  후회 = T·p* − Σ p_aₜ 최소", { size: 15 });

    /* ② ε-greedy 흐름 */
    k.section(40, 366, "② ε-greedy — 확률 ε로 탐험, 1 − ε로 활용", { tone: "orange" });
    k.panel(40, 380, 760, 238, { tone: "orange", tinted: true });
    var u = k.box(60, 452, 132, 64, { tone: "gray", fill: "plain", title: "난수 u", sub: "u ~ U(0, 1)", size: 15 });
    var dc = k.box(222, 452, 120, 64, { tone: "ink", fill: "plain", title: "u < ε ?", sub: "ε = 0.10", size: 15 });
    var ex = k.box(386, 398, 176, 64, { tone: "amber", title: "탐험", sub: "팔을 무작위로", size: 15 });
    var xp = k.box(386, 506, 176, 64, { tone: "orange", title: "활용", sub: "argmax Q(a) (동점은 무작위)", size: 15 });
    var rw = k.box(600, 452, 180, 64, { tone: "green", title: "보상 r 관찰", sub: "성공 1 · 실패 0", size: 15 });
    k.link(u.r, dc.l, { tone: "gray" });
    k.arrow(342, 470, 386, 432, { tone: "amber", label: "예", labelDx: -10 });
    k.arrow(342, 498, 386, 536, { tone: "orange", label: "아니오", labelDx: -14, labelDy: 30 });
    k.arrow(562, 430, 600, 470, { tone: "gray" });
    k.arrow(562, 538, 600, 498, { tone: "gray" });
    k.formula(60, 580, 720, 30, "N(a) ← N(a) + 1 ,   **Q(a) ← Q(a) + ( r − Q(a) ) / N(a)**   (표본 평균의 증분 갱신)", { size: 14, weight: 600, tone: "purple" });

    /* 숫자로 따라가기 */
    k.panel(816, 380, 424, 238, { tone: "purple", head: "soft", title: "숫자로 따라가기 — 시뮬레이터 t = 25", right: "seed 7" });
    var Q = [0.600, 0.000, 0.000, 0.500, 0.786], N = [5, 2, 2, 2, 14], P = [0.30, 0.55, 0.45, 0.70, 0.60];
    var bx = 846, by = 432, bh = 92, bw = 34, gap = 30;
    k.axes(bx - 8, by, 5 * (bw + gap) + 4, bh);
    Q.forEach(function (q, i) {
      var x = bx + i * (bw + gap), h = q * bh;
      if (h > 0) k.rect(x, by + bh - h, bw, h, { tone: i === 0 ? "orange" : "purple", fill: "solid", r: 2 });
      k.path("M" + (x - 6) + " " + (by + bh - P[i] * bh) + " H" + (x + bw + 6), { tone: "gray", width: 1.6, dash: "4 3" });
      k.text(x + bw / 2, by + bh - h - 6, q.toFixed(2), { size: 11.5, weight: 700, anchor: "middle", tone: i === 0 ? "orange" : "purple" });
      k.text(x + bw / 2, by + bh + 16, "ABCDE"[i] + " n=" + N[i], { size: 11.5, anchor: "middle", color: "muted" });
    });
    k.lines(1172, 446, [{ t: "막대 Q", tone: "purple", weight: 700 }, { t: "점선 p", color: "muted" }], { size: 11.5, lh: 18, anchor: "middle" });
    k.lines(834, 560, [
      { t: "u = 0.085 < ε = 0.10 → **탐험**: 치료법 A, r = 1", size: 12.5 },
      { t: "Q(A) ← 0.500 + (1 − 0.500) / 5 = **0.600**", size: 12.5, tone: "purple", color: "tone" },
      { t: "D(최적)는 2번만 당겨 0.50 — 탐험이 더 필요", size: 12, color: "muted" }
    ], { lh: 19 });

    /* ③ ε 고르기 */
    k.section(40, 650, "③ ε 고르기", { tone: "amber" });
    k.note(176, 632, 344, 62, { tone: "amber", title: "ε가 크면", body: "정보는 많지만 끝까지 ε만큼 손해 (후회 직선 증가)" });
    k.note(536, 632, 344, 62, { tone: "red", title: "ε = 0 (탐욕)", body: "초반 운에 따라 나쁜 팔에 갇힘 — 탐험이 0" });
    k.note(896, 632, 344, 62, { tone: "green", title: "ε 감쇠 εₜ = max(0.01, dᵗ)", body: "처음엔 많이 탐험, 점점 활용으로 (d = 0.99)" });
  }
});

DSDiagram.register({
  id: "multi-armed-bandit-2", sim: "multi-armed-bandit", order: 2,
  title: "Bandit (2) — UCB와 Thompson Sampling", short: "UCB · Thompson",
  sub: "불확실성을 다루는 두 방법: 덜 당긴 팔에 보너스를 얹는 낙관(UCB) · 사후분포에서 뽑아 고르는 확률 일치(Thompson)",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ---------- UCB ---------- */
    k.panel(40, 132, 590, 486, { tone: "blue", head: "solid", title: "UCB (Upper Confidence Bound)", right: "시뮬레이터 t = 25 · c = 0.50" });
    k.formula(60, 180, 550, 44, "aₜ = argmax [ **Q(a)** + c · √( ln t / N(a) ) ]", { size: 17 });
    k.text(60, 246, "N(a) = 0 → 보너스 ∞ (먼저 한 번씩) · 덜 당긴 팔 = 불확실 = 보너스 큼", { size: 12.5, color: "muted" });
    var N = [2, 3, 4, 4, 11], Q = [0, 1 / 3, 0.25, 0.5, 6 / 11], B = N.map(function (n) { return 0.5 * Math.sqrt(Math.log(25) / n); });
    var bx = 92, by = 266, bh = 150, sc = bh / 1.0, bw = 46, gap = 52;
    k.axes(bx - 10, by, 5 * (bw + gap) - 20, bh);
    k.text(bx - 16, by + 4, "1.0", { size: 11.5, anchor: "end", color: "muted" });
    k.text(bx - 16, by + bh + 4, "0", { size: 11.5, anchor: "end", color: "muted" });
    Q.forEach(function (q, i) {
      var x = bx + i * (bw + gap), hq = q * sc, hb = B[i] * sc;
      if (hq > 0) k.rect(x, by + bh - hq, bw, hq, { tone: "purple", fill: "solid", r: 0 });
      k.rect(x, by + bh - hq - hb, bw, hb, { tone: "amber", fill: "tone", r: 0 });
      if (i === 3) k.rect(x - 3, by + bh - hq - hb - 3, bw + 6, hq + hb + 3, { tone: "orange", fill: "none" });
      k.text(x + bw / 2, by + bh - hq - hb - 8, (q + B[i]).toFixed(3), { size: 12, weight: 800, anchor: "middle", tone: i === 3 ? "orange" : "ink", color: i === 3 ? "tone" : "ink" });
      k.text(x + bw / 2, by + bh + 17, "ABCDE"[i] + " · n=" + N[i], { size: 11.5, anchor: "middle", color: "muted" });
    });
    k.lines(588, 300, [{ t: "보너스", tone: "amber", weight: 800 }, { t: "Q(a)", tone: "purple", weight: 800 }], { size: 12, lh: 20, anchor: "end" });
    k.table(60, 448, [70, 60, 80, 150, 90], [
      ["팔", "N", "Q", "0.5·√(ln 25 / N)", "UCB"],
      ["A", { t: "2", mono: true }, { t: "0.000", mono: true }, { t: "0.634", mono: true }, { t: "0.634", mono: true }],
      ["B", { t: "3", mono: true }, { t: "0.333", mono: true }, { t: "0.518", mono: true }, { t: "0.851", mono: true }],
      [{ t: "D (선택)", tone: "orange" }, { t: "4", mono: true }, { t: "0.500", mono: true }, { t: "0.449", mono: true }, { t: "0.949", mono: true, tone: "orange" }]
    ], { rh: 26, size: 12.5 });
    k.lines(60, 568, [
      { t: "D: 0.500 + 0.5 × √(3.219 / 4) = 0.500 + 0.449 = **0.949** (최대) → r = 1", size: 12.5 },
      { t: "같은 N이면 보너스가 같아 Q로 결정 (C 0.699 vs D 0.949)", size: 12, color: "muted" }
    ], { lh: 21 });

    /* ---------- Thompson ---------- */
    k.panel(650, 132, 590, 486, { tone: "teal", head: "solid", title: "Thompson Sampling", right: "시뮬레이터 t = 25 · 사전 Beta(1, 1)" });
    k.formula(670, 180, 550, 44, "θ̃_a ~ Beta(α_a, β_a) ,   aₜ = argmax θ̃_a", { size: 17 });
    k.text(670, 244, "성공이면 α + 1, 실패면 β + 1 · 평균 = α / (α + β) · 많이 당길수록 분포가 좁아짐", { size: 12.5, color: "muted" });
    /* 베타 곡선 (A·D·E) */
    function lg(x) { var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
      x -= 1; var s = c[0], t = x + 7.5; for (var i = 1; i < 9; i++) s += c[i] / (x + i); return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(s); }
    function pdf(x, a, b) { return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lg(a) - lg(b) + lg(a + b)); }
    var gx = 700, gy = 284, gw = 500, gh = 128;
    k.axes(gx, gy, gw, gh);
    [0, 0.25, 0.5, 0.75, 1].forEach(function (v) { k.text(gx + v * gw, gy + gh + 16, v.toFixed(2), { size: 11.5, anchor: "middle", color: "muted" }); });
    var curves = [{ a: 1, b: 3, tone: "gray", th: 0.478, lab: "A Beta(1,3)" }, { a: 5, b: 5, tone: "orange", th: 0.661, lab: "D Beta(5,5)" }, { a: 9, b: 3, tone: "purple", th: 0.524, lab: "E Beta(9,3)" }];
    curves.forEach(function (c, ci) {
      var d = "", mx = 3.6;
      for (var i = 0; i <= 100; i++) { var x = 0.005 + 0.99 * i / 100, y = pdf(x, c.a, c.b); d += (i ? " L" : "M") + (gx + x * gw).toFixed(1) + " " + (gy + gh - Math.min(y, mx) / mx * (gh - 6)).toFixed(1); }
      k.path(d, { tone: c.tone, width: 2.4 });
      k.circle(gx + c.th * gw, gy + gh, 5.5, { tone: c.tone, fill: "solid" });
      k.text(680 + ci * 186, 270, c.lab + " · θ̃ = " + c.th.toFixed(3), { size: 12, weight: 700, tone: c.tone });
    });
    k.text(gx + 6, gy + gh - 8, "● = 뽑은 θ̃", { size: 11.5, color: "muted" });
    k.table(670, 448, [90, 56, 56, 110, 140], [
      ["팔", "α", "β", "평균", "뽑은 θ̃"],
      ["A · B · C", { t: "1", mono: true }, { t: "3", mono: true }, { t: "0.250", mono: true }, { t: ".478 .104 .293", mono: true }],
      [{ t: "D (선택)", tone: "orange" }, { t: "5", mono: true }, { t: "5", mono: true }, { t: "0.500", mono: true }, { t: "0.661", mono: true, tone: "orange" }],
      ["E", { t: "9", mono: true }, { t: "3", mono: true }, { t: "0.750", mono: true }, { t: "0.524", mono: true }]
    ], { rh: 26, size: 12.5 });
    k.lines(670, 568, [
      { t: "D의 θ̃ 0.661이 최대 → r = 1 → **Beta(5, 5) → Beta(6, 5)**, 평균 0.500 → 0.545", size: 12.5 },
      { t: "E는 평균이 더 높지만 이번엔 작은 값을 뽑음 — 불확실한 팔도 기회를 얻음", size: 12, color: "muted" }
    ], { lh: 21 });

    /* 정리 */
    k.note(40, 634, 590, 62, { tone: "blue", title: "UCB = 불확실성 앞에서 낙관", body: "결정적(같은 상태면 같은 선택) · c가 크면 탐험 ↑ · 이론값 c = √2, 실전은 더 작게 조정" });
    k.note(650, 634, 590, 62, { tone: "teal", title: "Thompson = 최적일 확률만큼 선택", body: "확률적 · 사전분포로 지식 반영 가능 · 하이퍼파라미터가 거의 없음" });
  }
});

DSDiagram.register({
  id: "multi-armed-bandit-3", sim: "multi-armed-bandit", order: 3,
  title: "Bandit (3) — 누적 후회로 비교하기", short: "누적 후회 비교",
  sub: "한 번의 실험은 운에 흔들리므로 같은 환경을 여러 번 반복해 평균 누적 후회와 최적 팔 선택 비율로 비교한다",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 비교 실험 — 치료법 5종 · 200회 평균 · T = 1000", { tone: "orange" });
    k.panel(40, 166, 740, 300, { tone: "orange", tinted: true });
    var rows = [
      ["알고리즘", "설정", "누적 후회", "최적 팔 비율", "마지막 100걸음"],
      [{ t: "무작위", tone: "gray" }, "배우지 않음", { t: "179.4", mono: true }, { t: "20.1%", mono: true }, { t: "20.4%", mono: true }],
      [{ t: "탐욕", tone: "red" }, "ε = 0", { t: "138.1", mono: true }, { t: "28.0%", mono: true }, { t: "28.0%", mono: true }],
      [{ t: "ε-greedy", tone: "orange" }, "ε = 0.10", { t: "43.2", mono: true }, { t: "72.3%", mono: true }, { t: "85.5%", mono: true }],
      [{ t: "ε 감쇠", tone: "amber" }, "max(0.01, 0.99ᵗ)", { t: "33.6", mono: true }, { t: "78.8%", mono: true }, { t: "88.2%", mono: true }],
      [{ t: "UCB", tone: "blue" }, "c = 0.50", { t: "25.1", mono: true, weight: 800 }, { t: "83.1%", mono: true }, { t: "92.0%", mono: true }],
      [{ t: "Thompson", tone: "teal" }, "Beta(1, 1)", { t: "29.5", mono: true }, { t: "80.7%", mono: true }, { t: "94.2%", mono: true }]
    ];
    k.table(60, 182, [130, 170, 110, 130, 150], rows, { rh: 32, size: 13.5 });
    k.text(60, 436, "최적 팔만 당겼을 때 기대 총 보상 = 1000 × 0.70 = 700 · 후회 = 700 − (얻은 기대 보상)", { size: 12.5, color: "muted" });
    k.text(60, 456, "독립 검산(numpy, 다른 난수): 무작위 180.0 · 탐욕 146.4 · ε 42.4 · 감쇠 34.6 · UCB 26.0 · Thompson 33.6", { size: 12, color: "muted" });

    k.panel(800, 166, 440, 300, { tone: "gray", head: "soft", title: "평균 누적 후회 (T = 1000)" });
    k.bars(836, 222, 384, 196, [179.4, 138.1, 43.2, 33.6, 25.1, 29.5], { tones: ["gray", "red", "orange", "amber", "blue", "teal"], labels: ["무작위", "탐욕", "ε", "감쇠", "UCB", "TS"], fmt: function (v) { return v.toFixed(1); }, gap: 14 });

    k.section(40, 502, "② 후회가 자라는 모양", { tone: "purple" });
    k.panel(40, 516, 560, 110, { tone: "purple", tinted: true });
    k.axes(70, 530, 210, 80, { x: "t", y: "" });
    k.path("M70 610 L280 534", { tone: "gray", width: 2.4 });
    k.path("M70 610 L280 578", { tone: "orange", width: 2.4 });
    k.path("M70 610 C 110 584, 160 576, 280 570", { tone: "teal", width: 2.4 });
    k.lines(300, 546, [
      { t: "직선 (기울기 큼): 무작위 · 탐욕 — 배우지 못함", tone: "gray", color: "tone", size: 12.5 },
      { t: "직선 (기울기 작음): 고정 ε — 끝까지 ε만큼 손해", tone: "orange", color: "tone", size: 12.5 },
      { t: "꺾임 (≈ log T): ε 감쇠 · UCB · Thompson", tone: "teal", color: "tone", size: 12.5 }
    ], { lh: 24 });

    k.section(640, 502, "③ 의료 현장에 옮길 때", { tone: "red" });
    k.note(640, 516, 296, 52, { tone: "green", title: "적응형 임상시험 · 알림 최적화", body: "좋아 보이는 쪽에 더 많이 배정" });
    k.note(944, 516, 296, 52, { tone: "blue", title: "Contextual Bandit (LinUCB)", body: "환자 특성(맥락)을 함께 써서 개인화" });
    k.note(640, 574, 296, 52, { tone: "red", title: "윤리 · 통계 설계 필수", body: "사전 등록, 안전성 중간 분석, 사람 검토" });
    k.note(944, 574, 296, 52, { tone: "amber", title: "차이가 작으면 오래 걸림", body: "문구 10종 예: T = 1000으로는 순위가 흔들림" });

    k.flow(40, 650, [
      { t: "팔 · 보상 정의", s: "k개 · 0/1", tone: "blue" },
      { t: "알고리즘 선택", s: "ε · UCB · Thompson", tone: "orange" },
      { t: "반복 실험", s: "같은 난수표로 공정 비교", tone: "purple" },
      { t: "후회 · 최적 비율", s: "평균으로 비교", tone: "teal" },
      { t: "현장 적용", s: "윤리 심의 · 모니터링", tone: "green" }
    ], { w: 1200, h: 46 });
  }
});
