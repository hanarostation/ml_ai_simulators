/* 하이퍼파라미터 튜닝 — 알고리즘 구성도 (문제 정의 · 격자와 무작위 · 베이즈 최적화 · 비교와 튜닝 과적합)
   예제 숫자 = 시뮬레이터 기본 화면 (당뇨 150명 · RBF 커널 릿지 · 5겹 층화 CV AUC · 예산 25회 · seed 10개) */
(function () {
  var LAB = "Machine Learning";

  /* 슬라이드 1 ─ 문제 정의 */
  DSDiagram.register({
    id: "hyperparameter-tuning-1", sim: "hyperparameter-tuning", order: 1,
    title: "하이퍼파라미터 튜닝 (1) — 탐색 공간 · 목적 함수 · 예산", short: "문제 정의",
    sub: "학습이 정하는 파라미터와 달리 C · γ는 사람이 정한다 — 교차검증 점수 f(C, γ)를 최대로 만드는 값을 적은 평가로 찾는 블랙박스 최적화",
    label: LAB,
    draw: function (k) {
      k.section(40, 152, "① 파라미터 vs 하이퍼파라미터", { tone: "purple" });
      k.box(40, 168, 380, 60, { tone: "blue", title: "파라미터 α₁ … α₁₅₀", sub: "fit()이 데이터로 계산 · 학습 손실 최소화", size: 15 });
      k.box(40, 238, 380, 60, { tone: "purple", title: "하이퍼파라미터 C, γ", sub: "학습 전에 지정 · 검증 점수 최대화", size: 15 });
      k.formula(40, 308, 380, 80, "K(x, z) = exp(−γ‖x − z‖²)\nα = (K + I / C)⁻¹ y ,   y = ±1\nf(x) = Σ αᵢ K(xᵢ, x) > 0 → 당뇨", { size: 13.5 });

      k.section(450, 152, "② 탐색 공간 — 자료형 · 범위 · 눈금", { tone: "purple" });
      k.table(450, 166, [104, 64, 132, 70], [
        ["이름", "자료형", "범위 · 후보", "눈금"],
        [{ t: "C", tone: "purple" }, "연속", "10⁻² ~ 10⁴", "로그"],
        [{ t: "γ (gamma)", tone: "purple" }, "연속", "10⁻³ ~ 10¹", "로그"],
        ["max_depth", "정수", "2 ~ 12", "선형"],
        ["kernel", "범주", "rbf · poly", "—"]
      ], { rh: 25, size: 12.5 });
      var sx0 = 530, sx1 = 812, X = function (u) { return sx0 + u * (sx1 - sx0); };
      var linU = [0, 0.8495, 0.8997, 0.9290, 0.9498, 0.9659, 0.9791, 0.9903, 1];
      [[316, "선형 간격", linU, "orange"], [356, "로그 간격", [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], "blue"]].forEach(function (r) {
        k.text(450, r[0] + 4, r[1], { size: 12.5, weight: 800, tone: r[3] });
        k.path("M" + sx0 + " " + r[0] + " H" + sx1, { tone: "gray", width: 1.4 });
        r[2].forEach(function (u) { k.circle(X(u), r[0], 5, { tone: r[3], fill: "solid" }); });
      });
      [-2, 0, 2, 4].forEach(function (t, i) { k.text(X(i / 3), 384, "10" + ["⁻²", "⁰", "²", "⁴"][i], { size: 11.5, anchor: "middle", color: "muted", mono: true }); });
      k.text(450, 404, "같은 9개 — 선형은 10⁻² ~ 10³ 구간에 1개뿐", { size: 12.5, weight: 700, tone: "red" });

      k.section(850, 152, "③ 목적 함수 = 5겹 교차검증 AUC", { tone: "teal" });
      var M = [], i, j;
      for (i = 0; i < 5; i++) { M.push([]); for (j = 0; j < 5; j++) M[i].push(i === j ? "검증" : "학습"); }
      k.matrix(906, 172, M, { cw: 64, ch: 25, size: 12, rows: ["1회", "2회", "3회", "4회", "5회"],
        tones: function (a, b) { return a === b ? "teal" : "blue"; }, fills: function (a, b) { return a === b ? "solid" : "tone"; } });
      k.formula(850, 308, 390, 80, "f(C, γ) = (1/5) · Σₖ AUCₖ\n학습 4겹으로 fit → k번째 겹으로 채점\n평가 1회 = 학습 **5번**", { size: 13.5 });

      k.section(40, 446, "④ 점수 지형 — 숫자로 (당뇨 150명)", { tone: "teal" });
      k.table(56, 460, [150, 110, 320], [
        ["(C, γ)", "5겹 AUC", "비고"],
        ["(10, 1)", "0.7223", "시작 화면 점 · 지도 전체의 상위 74.6%"],
        ["(0.01, 10)", "0.6850", "γ가 너무 큼 → 영향 반경이 좁아 과적합"],
        ["(1, 0.1)", "0.8709", "고원(꼭대기 근처 넓은 영역) 안"],
        [{ t: "(0.19, 0.05)", tone: "teal" }, { t: "0.8750", weight: 800 }, "정밀 최적 · 지도 41 × 41 = 1681점 최고 0.8740"]
      ], { rh: 27, size: 12.5 });
      k.note(56, 600, 580, 32, { tone: "red", title: "폴드 점수 표준오차 ≈ 0.033 → 0.003 차이는 잡음 수준", size: 12.5 });

      k.section(660, 446, "⑤ 평가 예산과 비용", { tone: "orange" });
      k.table(676, 460, [110, 170, 284], [
        ["예산 n", "학습 횟수 n × 5", "학습 1회 = 1분이면"],
        ["10", "50", "50분"],
        ["25", "125", "2.1시간"],
        ["100", "500", "8.3시간"],
        ["1,000", "5,000", { t: "3.5일", tone: "red" }]
      ], { rh: 27, size: 12.5 });
      k.note(676, 600, 564, 32, { tone: "orange", title: "기울기 없음 + 한 번에 비쌈 → 평가 횟수를 아끼는 탐색이 핵심", size: 12.5 });

      k.flow(40, 652, [
        { t: "탐색 공간 정의", tone: "purple" }, { t: "후보 고르기", tone: "purple" }, { t: "K겹 CV로 평가", tone: "teal" },
        { t: "최고 설정 선택", tone: "purple" }, { t: "전체로 재학습", tone: "blue" }, { t: "테스트 1회 평가", tone: "orange" }
      ], { h: 38, gap: 22, size: 13.5 });
    }
  });

  /* 슬라이드 2 ─ 격자 vs 무작위 */
  function scatterPanel(k, x0, y0, pts, tone, title) {
    var W = 250, H = 170, cy0 = y0 + 62;
    k.text(x0, y0 - 6, title, { size: 14, weight: 800, tone: tone });
    /* 중요한 축의 점수 곡선 */
    var f = function (u) { return Math.exp(-0.5 * Math.pow((u - 0.62) / 0.11, 2)); };
    var d = "", s;
    for (s = 0; s <= 50; s++) { var u = s / 50; d += (s ? "L" : "M") + (x0 + u * W).toFixed(1) + " " + (y0 + 46 - f(u) * 40).toFixed(1); }
    k.path("M" + x0 + " " + (y0 + 46) + " H" + (x0 + W), { tone: "gray", width: 1 });
    k.path(d, { tone: "gray", width: 2 });
    k.rect(x0, cy0, W, H, { tone: "gray", fill: "tone" });
    k.raw('<g class="dg-t-gray"><rect class="dg-stroke" x="' + x0 + '" y="' + cy0 + '" width="' + W + '" height="' + H + '" style="fill:none"/></g>');
    pts.forEach(function (p) {
      var px = x0 + p[0] * W, py = cy0 + (1 - p[1]) * H;
      k.circle(px, py, 4.5, { tone: tone, fill: "solid" });
      k.path("M" + px.toFixed(1) + " " + (cy0 + H) + " V" + (cy0 + H + 10), { tone: tone, width: 2 });
      k.circle(px, y0 + 46 - f(p[0]) * 40, 3.2, { tone: tone, fill: "solid" });
    });
    k.text(x0 + W, cy0 + H + 26, "중요한 축 →", { size: 11.5, anchor: "end", color: "muted" });
    k.text(x0 - 6, cy0 + 12, "덜 중요", { size: 11.5, anchor: "end", color: "muted" });
  }
  DSDiagram.register({
    id: "hyperparameter-tuning-2", sim: "hyperparameter-tuning", order: 2,
    title: "하이퍼파라미터 튜닝 (2) — 격자 탐색 vs 무작위 탐색", short: "격자 vs 무작위",
    sub: "Grid Search · Random Search — 격자는 축마다 k개 후보의 모든 조합(kᵈ), 무작위는 분포에서 n개를 뽑는다 — 같은 25번이라도 중요한 축에서 시험하는 값은 5개 vs 25개",
    label: LAB,
    draw: function (k) {
      k.section(40, 152, "① 같은 25번, 축에 투영하면 (Bergstra & Bengio, 2012)", { tone: "orange" });
      var g = [], r = [], a, b, seed = 7;
      for (a = 0; a < 5; a++) for (b = 0; b < 5; b++) g.push([0.04 + a * 0.23, 0.06 + b * 0.22]);
      var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (a = 0; a < 25; a++) r.push([0.03 + 0.94 * rnd(), 0.04 + 0.92 * rnd()]);
      scatterPanel(k, 96, 192, g, "blue", "격자 5 × 5 = 25");
      scatterPanel(k, 420, 192, r, "orange", "무작위 25 (로그 균등)");
      k.table(56, 468, [130, 110, 110, 100, 100], [
        ["", "C 축 값 수", "γ 축 값 수", "최고 AUC", "최적과 차이"],
        [{ t: "격자 5 × 5", tone: "blue" }, "5", "5", "0.8719", "0.0031"],
        [{ t: "무작위 25", tone: "orange" }, "25", "25", "0.8748", "0.0002"]
      ], { rh: 26, size: 12.5 });
      k.note(56, 556, 550, 46, { tone: "orange", title: "당뇨 CV: γ 축이 C 축보다 18.7배 중요 (투영 곡선 폭)", body: "덜 중요한 축에 쓴 평가가 낭비되지 않는다 — 무작위는 중요한 축 값을 n개 시험", size: 13 });

      k.section(680, 152, "② 차원의 저주 — 축마다 k = 5", { tone: "red" });
      k.table(696, 166, [70, 110, 130, 234], [
        ["축 d", "평가 수 5ᵈ", "학습 × 5겹", "학습 1회 1분이면"],
        ["2", "25", "125", "2.1시간"],
        ["3", "125", "625", "10.4시간"],
        ["4", "625", "3,125", "2.2일"],
        ["5", "3,125", "15,625", "10.9일"],
        ["6", "15,625", "78,125", { t: "54.3일", tone: "red" }]
      ], { rh: 25, size: 12.5 });

      k.section(680, 352, "③ 상위 5% 영역을 한 번이라도 맞힐 확률", { tone: "orange" });
      k.formula(696, 366, 544, 44, "P = 1 − (1 − q)ⁿ ,  q = 0.05  →  95% 이상: n ≥ ln 0.05 / ln 0.95 = **59**", { size: 13.5 });
      k.bars(716, 424, 300, 150, [0.401, 0.723, 0.952], { labels: ["n = 10", "n = 25", "n = 59"], tones: ["orange", "orange", "red"], max: 1, fmt: function (v) { return v.toFixed(3); }, gap: 26 });
      k.lines(1040, 452, [
        { t: "차원 수와 무관한 공식", weight: 800 },
        "점 하나가 상위 q% 영역에",
        "들어갈 확률 = q 라고 가정",
        { t: "→ 같은 분포로 뽑을 때만 성립", tone: "orange", weight: 700 },
        { t: "균등 분포로 C를 뽑으면", color: "muted" },
        { t: "C ≥ 10²일 확률 99.0%", tone: "red", weight: 700 }
      ], { size: 12.5, lh: 21 });

      k.flow(40, 652, [
        { t: "GridSearchCV", s: "param_grid · np.logspace", tone: "blue" },
        { t: "평가 수 = Π kᵢ", s: "축 추가마다 k배", tone: "red" },
        { t: "RandomizedSearchCV", s: "n_iter로 예산 지정", tone: "orange" },
        { t: "scipy.stats.loguniform", s: "배수로 효과가 바뀌는 값", tone: "orange" }
      ], { h: 46, gap: 24, size: 13.5 });
    }
  });

  /* 슬라이드 3 ─ 베이즈 최적화 */
  DSDiagram.register({
    id: "hyperparameter-tuning-3", sim: "hyperparameter-tuning", order: 3,
    title: "하이퍼파라미터 튜닝 (3) — 베이즈 최적화: GP + 획득 함수", short: "베이즈 최적화",
    sub: "Bayesian Search — 지금까지의 평가로 점수 지형을 가우스 과정(GP)으로 추정(μ, σ)하고, 획득 함수가 가장 큰 곳을 다음에 평가 — 좋을 것 같은 곳과 모르는 곳 사이의 절충",
    label: LAB,
    draw: function (k) {
      k.section(40, 152, "① 반복 루프", { tone: "purple" });
      var b1 = k.box(40, 176, 170, 62, { tone: "purple", title: "① GP 적합", sub: "μ(x), σ(x) 추정", size: 15 });
      var b2 = k.box(250, 176, 170, 62, { tone: "amber", title: "② 획득 함수 최대화", sub: "다음 점 x* 고르기", size: 14.5 });
      var b3 = k.box(250, 300, 170, 62, { tone: "teal", title: "③ K겹 CV 평가", sub: "f(x*) — 비싼 단계", size: 15 });
      var b4 = k.box(40, 300, 170, 62, { tone: "blue", title: "④ 데이터 갱신", sub: "(x*, f(x*)) 추가", size: 15 });
      k.link(b1.r, b2.l, { tone: "gray" }); k.link(b2.b, b3.t, { tone: "gray" }); k.link(b3.l, b4.r, { tone: "gray" }); k.link(b4.t, b1.b, { tone: "gray" });
      k.text(230, 274, "예산까지 반복", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });
      k.chip(40, 378, "시작: 초기 무작위 n₀점 (기본 5) → ①", { tone: "purple" });

      k.section(450, 152, "② 1차원 단면 (개념 그림)", { tone: "purple" });
      var x0 = 470, x1 = 830, yT = 180, yB = 300, X = function (u) { return x0 + u * (x1 - x0); };
      var mu = function (u) { return 0.36 + 0.36 * Math.exp(-Math.pow((u - 0.42) / 0.2, 2)) + 0.06 * Math.sin(6 * u); };
      var obs = [0.08, 0.3, 0.47, 0.86].map(function (x) { return [x, mu(x)]; });
      var sd = function (u) { var m = 1; obs.forEach(function (o) { m = Math.min(m, Math.abs(u - o[0])); }); return 0.03 + 0.5 * Math.min(1, m / 0.22); };
      var Y = function (v) { return yB - v * (yB - yT); };
      var up = "", dn = "", mm = "", s, u;
      for (s = 0; s <= 60; s++) { u = s / 60; up += (s ? "L" : "M") + X(u).toFixed(1) + " " + Y(Math.min(1.05, mu(u) + sd(u) * 0.6)).toFixed(1); mm += (s ? "L" : "M") + X(u).toFixed(1) + " " + Y(mu(u)).toFixed(1); }
      for (s = 60; s >= 0; s--) { u = s / 60; dn += "L" + X(u).toFixed(1) + " " + Y(Math.max(-0.05, mu(u) - sd(u) * 0.6)).toFixed(1); }
      k.path(up + dn + "Z", { tone: "purple", fill: "tone" });
      k.path(mm, { tone: "purple", width: 2.6 });
      obs.forEach(function (o) { k.circle(X(o[0]), Y(o[1]), 5, { tone: "ink", fill: "solid" }); });
      var acq = function (u) { return Math.max(0, (mu(u) - 0.66) * 0.9 + sd(u) * 0.45); };
      var best = 0, bu = 0, ad = "", aT = 318, aB = 386;
      for (s = 0; s <= 60; s++) { u = s / 60; if (acq(u) > best) { best = acq(u); bu = u; } }
      for (s = 0; s <= 60; s++) { u = s / 60; ad += (s ? "L" : "M") + X(u).toFixed(1) + " " + (aB - acq(u) / best * (aB - aT)).toFixed(1); }
      k.axes(x0, yT - 6, x1 - x0, yB - yT + 12);
      k.axes(x0, aT - 4, x1 - x0, aB - aT + 4);
      k.path(ad, { tone: "amber", width: 2.6 });
      k.path("M" + X(bu).toFixed(1) + " " + yT + " V" + aB, { tone: "amber", width: 1.6, dash: "5 4" });
      k.circle(X(bu), aT, 5, { tone: "amber", fill: "solid" });
      k.text(x1 + 6, Y(mu(1)) + 4, "μ", { size: 13, weight: 800, tone: "purple" });
      k.text(x1 + 6, Y(mu(1) + sd(1) * 0.6) - 2, "± 2σ", { size: 12, weight: 700, tone: "purple" });
      k.text(x1 + 6, aB - 6, "EI", { size: 13, weight: 800, tone: "amber" });
      k.text(X(bu) + 8, aT + 4, "x* (다음 평가)", { size: 12, weight: 700, tone: "amber" });
      k.text(470, 408, "점 = 관측 · 띠가 넓은 곳 = 모르는 곳", { size: 12, color: "muted" });

      k.section(880, 152, "③ 획득 함수 (최대화)", { tone: "amber" });
      k.formula(880, 166, 360, 112, "z = (μ̃ − f̃* − ξ) / σ̃\n**EI** = (μ̃ − f̃* − ξ)·Φ(z) + σ̃·φ(z)\n**PI** = Φ(z)\n**UCB** = μ̃ + κ·σ̃", { size: 13.5, align: "left" });
      k.bullets(888, 302, 352, [
        { t: "f̃* = 지금까지 최고 (y 표준화)", tone: "gray" },
        { t: "μ 높은 곳 = 활용 (exploitation)", tone: "purple" },
        { t: "σ 큰 곳 = 탐색 (exploration)", tone: "amber" },
        { t: "κ · ξ ↑ → 탐색 쪽으로", tone: "amber" }
      ], { size: 12.5, lh: 22 });

      k.section(40, 446, "④ 숫자로 — 관측 5개 · Matérn 5/2 (ℓ = 0.3, 0.25) · σₙ² = 0.01 · ξ = 0.01", { tone: "purple" });
      k.table(56, 460, [118, 76, 76, 80, 80, 86, 80, 80, 80, 80, 100], [
        ["후보 x", "μ", "σ", "μ̃", "σ̃", "z", "Φ(z)", "φ(z)", "EI", "PI", "UCB κ=1.96"],
        [{ t: "A (0.5, 0.5)", tone: "purple" }, "0.8917", "0.0148", "1.1345", "0.3236", "−0.5905", "0.2774", "0.3351", "0.0554", { t: "0.2774", weight: 800 }, "1.7688"],
        [{ t: "B (0.9, 0.9)", tone: "amber" }, "0.8502", "0.0447", "0.2228", "0.9807", "−1.1245", "0.1304", "0.2120", { t: "0.0641", weight: 800 }, "0.1304", { t: "2.1449", weight: 800 }]
      ], { rh: 26, size: 12.5 });
      k.formula(56, 548, 640, 52, "ȳ = 0.84, s_y = 0.0456, f̃* = 1.3156 (y = 0.90)\nEI(B) = (0.2228 − 1.3156 − 0.01)·0.1304 + 0.9807·0.2120 = **0.0641**", { size: 13, align: "left" });
      k.note(716, 548, 524, 52, { tone: "amber", title: "PI → A (μ가 높은 곳, 활용) · EI · UCB → B (σ가 큰 곳, 탐색)", body: "같은 GP라도 획득 함수에 따라 다음 점이 달라진다 · scikit-learn · scipy로 검산", size: 13 });

      k.flow(40, 652, [
        { t: "BayesSearchCV", s: "scikit-optimize · GP · gp_hedge", tone: "purple" },
        { t: "Optuna TPE", s: "l(x) / g(x)가 큰 곳", tone: "purple" },
        { t: "Optuna GPSampler", s: "GP 기반 베이즈 최적화", tone: "purple" },
        { t: "초기 무작위 점", s: "n_initial_points · n_startup_trials", tone: "orange" }
      ], { h: 46, gap: 24, size: 13.5 });
    }
  });

  /* 슬라이드 4 ─ 비교와 튜닝 과적합 */
  DSDiagram.register({
    id: "hyperparameter-tuning-4", sim: "hyperparameter-tuning", order: 4,
    title: "하이퍼파라미터 튜닝 (4) — 같은 예산 비교와 튜닝 과적합", short: "비교 · 중첩 CV",
    sub: "평가 25회 · seed 10개 평균 — 어느 방법이 이기는지는 점수 지형에 달렸고, 고를 때 본 최고 검증 점수는 실제 성능보다 높게 나온다",
    label: LAB,
    draw: function (k) {
      k.section(40, 152, "① 같은 예산 25회 — 최종 최고 점수 (seed 10개 평균)", { tone: "purple" });
      k.table(56, 166, [190, 100, 110, 100, 100, 584], [
        ["목적 함수", "정밀 최적", "격자 5 × 5", "무작위", "베이즈", "해석"],
        ["당뇨 5겹 CV AUC", "0.8750", "0.8719", "0.8699", "0.8709", "넓은 고원 → 차이 0.002 < 폴드 표준오차 0.033, 사실상 같음"],
        ["한 축만 중요", "0.9700", { t: "0.6620", tone: "red" }, "0.9232", { t: "0.9678", weight: 800 }, "격자는 중요한 축 값 5개뿐 → 봉우리를 건너뜀"],
        ["Branin (−f)", "−0.398", "−2.501", "−2.348", { t: "−0.556", weight: 800 }, "매끄러운 지형 → GP가 빠르게 좁혀 감"],
        ["봉우리 여럿", "1.001", "0.764", "0.757", { t: "0.727", tone: "red" }, "좁은 봉우리는 모두 놓침 · 베이즈는 넓은 언덕에 갇히기도 (ξ · κ ↑)"]
      ], { rh: 28, size: 12.5 });

      k.section(40, 334, "② 튜닝 과적합 — CV 최고 vs 독립 테스트 600명", { tone: "red" });
      k.table(56, 348, [110, 120, 150, 120], [
        ["방법", "CV 최고", "테스트 600명", "낙관 편향"],
        [{ t: "격자", tone: "blue" }, "0.8719", "0.8374", { t: "+0.0346", tone: "red" }],
        [{ t: "무작위", tone: "orange" }, "0.8699", "0.8377", { t: "+0.0321", tone: "red" }],
        [{ t: "베이즈", tone: "purple" }, "0.8709", "0.8375", { t: "+0.0333", tone: "red" }]
      ], { rh: 27, size: 12.5 });
      k.note(56, 470, 520, 96, { tone: "red", title: "왜 높게 나오나", body: "가장 높은 검증 점수를 고르면 운 좋게 높게 나온 값도\n함께 고르게 된다. 평가를 늘리면 CV 최고는 계속 오르지만\n테스트 점수는 곧 멈춘다 → 튜닝에 쓴 점수를\n최종 성능으로 보고하지 않는다.", size: 13.5, bodySize: 12.5 });

      k.section(620, 334, "③ 중첩 교차검증 (바깥 5겹 × 안쪽 4겹 무작위 15회)", { tone: "teal" });
      var M = [], i, j;
      for (i = 0; i < 5; i++) { M.push([]); for (j = 0; j < 5; j++) M[i].push(i === j ? "평가" : "튜닝"); }
      k.matrix(696, 352, M, { cw: 64, ch: 25, size: 12, rows: ["바깥 1", "바깥 2", "바깥 3", "바깥 4", "바깥 5"],
        tones: function (a, b) { return a === b ? "teal" : "purple"; }, fills: function (a, b) { return a === b ? "solid" : "tone"; } });
      k.lines(1036, 370, [
        { t: "안쪽 = 튜닝 (CV로 C · γ 선택)", tone: "purple", weight: 700 },
        { t: "바깥 = 평가 (튜닝에 안 쓴 겹)", tone: "teal", weight: 700 },
        { t: "겹마다 고른 C · γ가 다를 수 있음", color: "muted" }
      ], { size: 12.5, lh: 22 });
      k.table(636, 494, [210, 130, 264], [
        ["추정 방식", "AUC", "의미"],
        ["안쪽 CV 최고 평균", "0.8635", { t: "낙관적 (튜닝에 쓴 점수)", tone: "red" }],
        [{ t: "중첩 CV", tone: "teal" }, { t: "0.8411 ± 0.0535", weight: 800 }, "튜닝 절차 전체의 성능"],
        ["독립 테스트 600명", "0.8377", "참고 — 중첩 CV와 가까움"]
      ], { rh: 27, size: 12.5 });

      k.flow(40, 652, [
        { t: "안쪽 CV로 튜닝", tone: "purple" }, { t: "고른 설정으로 학습", tone: "blue" }, { t: "바깥 겹으로 채점", tone: "teal" },
        { t: "보고 = 바깥 평균", tone: "orange" }, { t: "최종: 전체로 재튜닝 · 재학습", tone: "green" }
      ], { h: 38, gap: 22, size: 13.5 });
    }
  });
})();
