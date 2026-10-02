/* 부스팅 계열 — 알고리즘 구성도 (시뮬레이터 기본 예제: 나이·혈당 → 질환, 학습 120개(질환 51) · 검증 80개, 선택한 점 #103) */
(function () {
  var L = "Machine Learning";

  /* ε → α 곡선 (AdaBoost) */
  function alphaCurve(k, x, y, w, h) {
    k.axes(x, y, w, h, { y: "α" });
    k.text(x + w, y + h + 34, "가중 오류 ε", { size: 12, anchor: "end", color: "muted" });
    var X = function (e) { return x + e / 0.5 * w; }, Y = function (a) { return y + h - a / 2 * h; };
    var d = "";
    for (var e = 0.02; e <= 0.5001; e += 0.01) { var a = 0.5 * Math.log((1 - e) / e); d += (d ? " L" : "M") + X(e).toFixed(1) + " " + Y(a).toFixed(1); }
    k.path(d, { tone: "purple", width: 2.5 });
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(function (t) { k.text(X(t), y + h + 16, String(t), { size: 11.5, anchor: "middle", color: "muted" }); });
    [0, 1, 2].forEach(function (t) { k.text(x - 6, Y(t) + 4, String(t), { size: 11.5, anchor: "end", color: "muted" }); });
    var ex = X(0.1417), ey = Y(0.9008);
    k.path("M" + ex + " " + (y + h) + " V" + ey + " H" + x, { tone: "orange", width: 1.2, dash: "4 3" });
    k.circle(ex, ey, 6, { tone: "orange", fill: "solid" });
    k.text(ex + 12, ey - 8, "라운드 1: ε = 0.1417 → α = 0.9008", { size: 12.5, weight: 800, tone: "orange" });
    k.text(X(0.5) - 4, Y(1.55), "ε = 0.5 → α = 0 (동전 던지기 수준)", { size: 11.5, anchor: "end", color: "muted" });
  }

  /* ---------------- (1) AdaBoost ---------------- */
  DSDiagram.register({
    id: "boosting-1", sim: "boosting", order: 1,
    title: "부스팅 (1) — AdaBoost: 틀린 점의 가중치를 키운다", short: "AdaBoost",
    sub: "약한 학습기(결정 그루터기)를 차례로 만들며, 앞 학습기가 틀린 점에 더 큰 가중치를 줘 다음 학습기가 그 점을 보게 한다",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 순차 학습 구조 — SAMME · 결정 그루터기 (깊이 1)");
      k.panel(40, 168, 1200, 122, { tone: "blue", tinted: true });
      k.flow(60, 186, [
        { t: "가중치 초기화", s: "wᵢ = 1/n = 1/120", tone: "blue" },
        { t: "그루터기 hₘ 학습", s: "가중치 wᵢ 반영", tone: "purple" },
        { t: "가중 오류 εₘ", s: "틀린 점의 w 합", tone: "orange" },
        { t: "학습기 가중치 αₘ", s: "η · ½ ln((1−ε)/ε)", tone: "orange" },
        { t: "가중치 갱신", s: "틀린 점 ↑ · 맞은 점 ↓", tone: "red" },
        { t: "최종 분류기", s: "H(x) = sign(Σ αₘhₘ(x))", tone: "green", fill: "solid" }
      ], { w: 1160, h: 58, gap: 26, size: 14 });
      k.arrow(950, 246, 420, 246, { tone: "red", dash: true, width: 1.6, via: [[950, 264], [420, 264]], label: "다음 라운드 m = 2 … M 반복", labelDy: 43 });

      k.section(40, 312, "② 라운드 1 계산 — 학습 120개 · η = 1.0");
      k.table(56, 326, [140, 330, 190], [
        ["단계", "식", "값"],
        ["① 그루터기 h₁", "혈당 ≤ 132.9 → 0,  그 외 → 1", "틀린 점 17 / 120"],
        ["② 가중 오류 ε₁", "Σ틀린 wᵢ = 17 × (1/120)", { t: "0.1417", weight: 800 }],
        ["③ 학습기 가중치 α₁", "½ ln(0.8583 / 0.1417)", { t: "0.9008", weight: 800, tone: "orange" }],
        ["④ 가중치 갱신", "틀린 점 × e^α  ·  맞은 점 × e^−α", "× 2.4615  ·  × 0.4063"],
        ["⑤ 정규화 Z₁", "ε·e^α + (1−ε)·e^−α", "0.6974"]
      ], { rh: 31, size: 13 });
      /* 가중치 그림 */
      k.text(56, 538, "갱신 전", { size: 12.5, weight: 800, color: "ink" });
      k.text(56, 580, "갱신 후", { size: 12.5, weight: 800, color: "ink" });
      for (var i = 0; i < 12; i++) {
        var bad = i === 2 || i === 7;
        k.circle(150 + i * 36, 534, 7, { tone: "gray", fill: "tone" });
        k.circle(150 + i * 36, 576, bad ? 11 : 4.5, { tone: bad ? "red" : "blue", fill: bad ? "solid" : "tone" });
      }
      k.text(590, 538, "모든 점 0.0083", { size: 12.5, color: "muted" });
      k.text(590, 572, "틀린 점 0.0294", { size: 12.5, weight: 800, tone: "red" });
      k.text(590, 590, "맞은 점 0.0049", { size: 12.5, tone: "blue" });

      k.panel(740, 300, 500, 300, { tone: "purple", head: "soft", title: "학습기 가중치 α = ½ ln((1 − ε) / ε)", tinted: false });
      alphaCurve(k, 790, 352, 410, 196);

      k.section(40, 630, "③ 점 #103 추적");
      k.flow(232, 614, [
        { t: "59세 · 혈당 128 · 실제 1", tone: "gray" },
        { t: "h₁(x) = −1  틀림", tone: "red" },
        { t: "w: 0.0083 → 0.0294", tone: "red" },
        { t: "F₁ = −0.901 → H = −1", tone: "purple" },
        { t: "다음 그루터기가 집중", tone: "blue" }
      ], { w: 1008, h: 34, gap: 20, size: 12.5 });
      k.text(1240, 686, "틀린 점 가중치 합 0.1417 → 0.5000 (η = 1이면 언제나 0.5) · scikit-learn SAMME의 estimator_weights_ = 2α", { size: 12, anchor: "end", color: "muted" });
    }
  });

  /* ---------------- (2) Gradient Boosting ---------------- */
  DSDiagram.register({
    id: "boosting-2", sim: "boosting", order: 2,
    title: "부스팅 (2) — Gradient Boosting: 잔차에 트리 잇기", short: "Gradient Boosting",
    sub: "상수 F₀에서 출발해 매 라운드 손실의 음의 기울기(잔차)에 얕은 회귀 트리를 맞추고 학습률 η만큼 조금씩 더한다",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 구조 — 잔차를 맞추는 트리를 차례로 더하기");
      k.panel(40, 168, 1200, 98, { tone: "blue", tinted: true });
      k.flow(60, 188, [
        { t: "F₀ = 상수", s: "log(p̄ / (1 − p̄))", tone: "blue" },
        { t: "잔차 rᵢ = yᵢ − pᵢ", s: "= −∂L/∂F (음의 기울기)", tone: "red" },
        { t: "회귀 트리 hₘ", s: "rᵢ에 맞춤 · 깊이 2", tone: "purple" },
        { t: "잎 값 γ", s: "Σr / Σp(1−p)", tone: "purple" },
        { t: "Fₘ = Fₘ₋₁ + η·hₘ", s: "η = 0.10 · 100 라운드", tone: "green", fill: "solid" }
      ], { w: 1160, h: 58, gap: 28, size: 14 });

      k.section(40, 302, "② 라운드 1의 회귀 트리 — 120점의 잔차를 4개 잎으로");
      var root = k.box(300, 320, 200, 44, { tone: "purple", fill: "solid", title: "혈당 ≤ 132.9", size: 15 });
      var a = k.box(110, 392, 190, 40, { tone: "purple", fill: "tone", title: "혈당 ≤ 117.3", size: 14 });
      var b = k.box(500, 392, 190, 40, { tone: "purple", fill: "tone", title: "나이 ≤ 39.0", size: 14 });
      k.arrow(360, 364, 220, 390, { tone: "gray", label: "예", labelDx: -14 });
      k.arrow(440, 364, 580, 390, { tone: "gray", label: "아니오", labelDx: 20 });
      var leaves = [
        ["44점", "Σr = −18.700", "Σp(1−p) = 10.752", "γ = −1.739", "blue"],
        ["14점 (#103)", "Σr = −2.950", "Σp(1−p) = 3.421", "γ = −0.862", "blue"],
        ["21점", "Σr = 0.075", "Σp(1−p) = 5.132", "γ = 0.015", "gray"],
        ["41점", "Σr = 21.575", "Σp(1−p) = 10.019", "γ = 2.153", "orange"]
      ];
      var lx = [40, 222, 410, 592];
      leaves.forEach(function (l, i) {
        k.box(lx[i], 466, 172, 104, { tone: l[4], fill: "tone", r: 8, title: l[0], lines: [{ t: l[1], size: 12.5 }, { t: l[2], size: 12.5 }, { t: l[3], size: 14, weight: 800, tone: l[4] }], size: 13.5 });
      });
      k.arrow(170, 432, 126, 464, { tone: "gray" }); k.arrow(240, 432, 308, 464, { tone: "gray" });
      k.arrow(560, 432, 496, 464, { tone: "gray" }); k.arrow(630, 432, 678, 464, { tone: "gray" });
      k.text(404, 592, "잔차 합 −18.700 − 2.950 + 0.075 + 21.575 = 0 (F₀가 평균 로그 오즈라서)", { size: 12.5, anchor: "middle", color: "muted" });

      k.panel(790, 290, 450, 162, { tone: "red", head: "soft", title: "출발점과 잔차 — 질환 51 / 120", tinted: false });
      k.lines(810, 352, [
        "p̄ = 51 / 120 = 0.425",
        { t: "F₀ = log(0.425 / 0.575) = **−0.302**", tone: "blue", color: "tone" },
        { t: "y = 1인 점: r = 1 − 0.425 = **0.575**", tone: "red", color: "tone" },
        { t: "y = 0인 점: r = 0 − 0.425 = **−0.425**", tone: "red", color: "tone" }
      ], { size: 14, lh: 24 });

      k.panel(790, 464, 450, 130, { tone: "purple", head: "soft", title: "점 #103 (실제 1) · 라운드 1", tinted: false });
      k.lines(810, 524, [
        "잔차 r = 0.575 이지만 이 점의 잎 γ = −0.862",
        "F₁ = −0.302 + 0.10 × (−0.862) = **−0.389**",
        { t: "p = σ(−0.389) = 0.404 → 아직 질환 0으로 예측", tone: "purple", color: "tone" }
      ], { size: 14, lh: 24 });

      k.section(40, 630, "③ 손실별 잔차");
      k.table(212, 610, [170, 210, 220, 300, 128], [
        ["손실", "L(y, F)", "트리가 맞출 값", "잎 값", "갱신"],
        ["제곱 오차 (회귀)", "½(y − F)²", "y − F (잔차)", "잎 잔차 평균", "F + η·γ"],
        ["로그 손실 (분류)", "−[y ln p + (1−y) ln(1−p)]", "y − p,  p = σ(F)", "Σr / Σp(1−p)  (뉴턴 스텝)", "F + η·γ"]
      ], { rh: 28, size: 12.5 });
    }
  });

  /* ---------------- (3) XGBoost ---------------- */
  DSDiagram.register({
    id: "boosting-3", sim: "boosting", order: 3,
    title: "부스팅 (3) — XGBoost: 2차 근사 · 규제 · Gain", short: "XGBoost",
    sub: "손실을 기울기 g와 헤시안 h로 2차 근사하고, 규제 λ·γ가 들어간 식으로 잎 값과 분할 이득을 바로 계산한다 — η 0.30 · 깊이 3 · λ 1 · γ 0",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 목적함수와 세 가지 식");
      k.formula(40, 166, 1200, 44, "Obj ≈ Σᵢ [ **gᵢ** f(xᵢ) + ½ **hᵢ** f(xᵢ)² ] + **γ**T + ½**λ** Σⱼ wⱼ²   ·   분류: gᵢ = pᵢ − yᵢ,  hᵢ = pᵢ(1 − pᵢ)", { size: 16 });
      k.box(40, 220, 388, 70, { tone: "blue", fill: "tone", title: "잎 값  w* = −G / (H + λ)", sub: "G = Σg, H = Σh (잎에 든 점)", size: 16 });
      k.box(446, 220, 476, 70, { tone: "purple", fill: "tone", title: "Gain [·] = G_L²/(H_L+λ) + G_R²/(H_R+λ) − G²/(H+λ)", sub: "[·] < γ 이면 가지치기 (xgboost 구현, ½ 생략)", size: 15 });
      k.box(940, 220, 300, 70, { tone: "red", fill: "tone", title: "규제 3종", sub: "λ(L2) · γ(분할 최소 이득) · min_child_weight(H 하한)", size: 16 });

      k.section(40, 326, "② 루트 노드 분할 — 120점, G = 0.000, H = 29.325");
      k.table(56, 340, [140, 82, 82, 86, 82, 90, 60], [
        ["분할 기준", "G_L", "H_L", "G_R", "H_R", "[·]", "판정"],
        [{ t: "혈당 ≤ 132.9", tone: "purple" }, "21.650", "14.174", "−21.650", "15.151", { t: "59.911", weight: 800, tone: "purple" }, { t: "최선", tone: "purple", weight: 800 }],
        ["혈당 ≤ 130.4", "21.225", "13.929", "−21.225", "15.396", "57.652", "후보"],
        ["혈당 ≤ 134.5", "21.075", "14.418", "−21.075", "14.907", "56.730", "후보"],
        ["혈당 ≤ 146.7", "20.900", "16.617", "−20.900", "12.708", "56.661", "후보"]
      ], { rh: 29, size: 13 });
      k.formula(40, 496, 640, 64, "[·] = 21.650² / (14.174 + 1) + 21.650² / (15.151 + 1) − 0² / (29.325 + 1)\n= 30.890 + 29.021 − 0 = **59.911**", { size: 14.5 });
      k.text(56, 582, "H = 120 × 0.425 × 0.575 = 29.325 · G = Σ(p − y) = 120 × 0.425 − 51 = 0 · 후보 119개 중 상위 4개", { size: 12, color: "muted" });

      k.section(720, 326, "③ 잎 값 — 점 #103의 잎 (5점)");
      k.panel(720, 340, 520, 132, { tone: "blue", tinted: true });
      k.lines(740, 370, [
        "g = 0.425 − 1 = −0.575,   h = 0.425 × 0.575 = 0.244",
        "잎: G = −0.875,  H = 1.222,  λ = 1.0",
        { t: "w* = 0.875 / (1.222 + 1) = 0.875 / 2.222 = **0.394**", tone: "blue", color: "tone" },
        { t: "F₁ = −0.302 + 0.30 × 0.394 = −0.184 → p = 0.454", tone: "purple", color: "tone" }
      ], { size: 14, lh: 26 });

      k.section(720, 506, "④ 결측값 기본 방향 — 혈당 10개를 지웠을 때");
      k.table(736, 520, [150, 140, 150, 64], [
        ["분할 기준", "결측 → 왼쪽", "결측 → 오른쪽", "방향"],
        ["혈당 ≤ 132.9", { t: "55.234", weight: 800, tone: "teal" }, "54.444", { t: "왼쪽", tone: "teal", weight: 800 }],
        ["혈당 ≤ 128.0", "51.474", { t: "51.711", weight: 800, tone: "teal" }, { t: "오른쪽", tone: "teal", weight: 800 }]
      ], { rh: 28, size: 13 });
      k.text(736, 622, "G결측 = 0.250, H결측 = 2.444를 양쪽에 넣어 보고 큰 쪽을 저장", { size: 12, color: "muted" });

      k.flow(40, 650, [
        { t: "g, h 계산", tone: "red" }, { t: "후보마다 [·] 계산", tone: "purple" }, { t: "[·] < γ 가지치기", tone: "purple" },
        { t: "잎 값 w* = −G/(H+λ)", tone: "blue" }, { t: "F ← F + η·w*", tone: "green" }
      ], { label: "한 라운드", h: 36, size: 13 });
    }
  });

  /* ---------------- (4) LightGBM ---------------- */
  DSDiagram.register({
    id: "boosting-4", sim: "boosting", order: 4,
    title: "부스팅 (4) — LightGBM: 히스토그램 · 리프 중심 · GOSS", short: "LightGBM · 비교",
    sub: "XGBoost와 같은 2차 근사를 쓰되, 분할 후보를 구간으로 줄이고 이득이 큰 잎부터 키우며 기울기 작은 점은 덜 쓴다 — 잎 8 · max_bin 16",
    label: L,
    draw: function (k) {
      /* ① 히스토그램 */
      k.section(40, 152, "① 히스토그램 분할 (max_bin)");
      k.panel(40, 168, 390, 262, { tone: "blue", tinted: true });
      k.text(60, 196, "정확 탐색: 고유값 120개 → 경계 119개", { size: 13, weight: 800, color: "ink" });
      for (var i = 0; i < 120; i++) k.rect(60 + i * 2.9, 206, 1.4, 22, { tone: "gray", fill: "solid" });
      k.text(60, 256, "히스토그램: 구간 16개 → 경계 15개", { size: 13, weight: 800, tone: "blue" });
      for (var j = 0; j < 16; j++) k.rect(60 + j * 21.75, 266, 19.5, 22, { tone: "blue", fill: j % 2 ? "mid" : "tone", r: 2 });
      k.table(56, 304, [120, 120, 110], [
        ["방식", "최선 분할", "[·] (λ = 0)"],
        ["정확 탐색", "혈당 ≤ 132.9", "64.006"],
        [{ t: "히스토그램", tone: "blue" }, "혈당 ≤ 146.7", { t: "60.660", weight: 800, tone: "blue" }]
      ], { rh: 27, size: 13 });
      k.text(60, 412, "정확 대비 94.8% · 후보 수는 데이터 수가 아니라 구간 수", { size: 12, color: "muted" });

      /* ② 성장 방식 */
      k.section(450, 152, "② 레벨 중심 vs 리프 중심 성장");
      k.panel(450, 168, 400, 262, { tone: "purple", tinted: true });
      function tree(ox, title, nodes, tn) {
        k.text(ox + 90, 196, title, { size: 13, weight: 800, anchor: "middle", tone: tn });
        nodes.forEach(function (nd) {
          if (nd.p) k.path("M" + nd.p[0] + " " + (nd.p[1] + 11) + " L" + nd.x + " " + (nd.y - 11), { tone: "gray", width: 1.4 });
        });
        nodes.forEach(function (nd) { k.circle(nd.x, nd.y, 11, { tone: nd.s ? tn : "gray", fill: nd.s ? "solid" : "tone", label: nd.s || "", size: 11.5 }); });
      }
      var lv = [{ x: 560, y: 222, s: "1" }, { x: 516, y: 272, s: "2", p: [560, 222] }, { x: 604, y: 272, s: "3", p: [560, 222] },
        { x: 494, y: 322, p: [516, 272] }, { x: 538, y: 322, p: [516, 272] }, { x: 582, y: 322, p: [604, 272] }, { x: 626, y: 322, p: [604, 272] }];
      lv.forEach(function (n) { n.x -= 10; if (n.p) n.p = [n.p[0] - 10, n.p[1]]; });
      tree(460, "레벨 중심 (XGBoost 기본)", lv, "teal");
      var lf = [{ x: 750, y: 222, s: "1" }, { x: 706, y: 272, p: [750, 222] }, { x: 794, y: 272, s: "2", p: [750, 222] },
        { x: 772, y: 322, p: [794, 272] }, { x: 816, y: 322, s: "3", p: [794, 272] }, { x: 794, y: 372, p: [816, 322] }, { x: 838, y: 372, p: [816, 322] }];
      lf.forEach(function (n) { n.x -= 22; if (n.p) n.p = [n.p[0] - 22, n.p[1]]; });
      tree(650, "리프 중심 (LightGBM)", lf, "purple");
      k.text(550, 364, "한 층을 모두 나눈 뒤 다음 층", { size: 12, weight: 700, anchor: "middle", tone: "teal" });
      k.text(670, 402, "Gain 큰 잎만 계속", { size: 12, weight: 700, anchor: "middle", tone: "purple" });
      k.text(650, 422, "숫자 = 나눈 순서 · 같은 잎 4개 · 리프 중심은 num_leaves로 제한", { size: 12, anchor: "middle", color: "muted" });

      /* ③ GOSS */
      k.section(870, 152, "③ GOSS — 기울기 기반 샘플링");
      k.panel(870, 168, 370, 262, { tone: "orange", tinted: true });
      k.text(890, 196, "|g| 큰 순서로 정렬한 학습점 120개", { size: 13, weight: 800, color: "ink" });
      k.rect(890, 208, 66, 26, { tone: "purple", fill: "solid", r: 3 });
      k.rect(956, 208, 264, 26, { tone: "gray", fill: "tone", r: 3 });
      for (var g = 0; g < 12; g++) k.rect(962 + g * 21.5, 212, 9, 18, { tone: "orange", fill: "solid", r: 2 });
      k.text(923, 252, "상위 24", { size: 12, weight: 800, anchor: "middle", tone: "purple" });
      k.text(1088, 252, "나머지 96 중 12개 무작위", { size: 12, weight: 800, anchor: "middle", tone: "orange" });
      k.lines(890, 282, [
        "a = 0.20 → 상위 a·n = **24개** 모두 유지",
        "b = 0.10 → 나머지에서 b·n = **12개**",
        { t: "뽑은 점의 g, h × (1 − a)/b = **8.00**", tone: "orange", color: "tone" },
        "→ 12개가 96개 전체의 합을 대신함",
        { t: "이번 트리에 쓰는 점 36 / 120 (30%)", tone: "purple", color: "tone", weight: 800 }
      ], { size: 13, lh: 25 });

      /* ④ 비교 */
      k.section(40, 464, "④ 네 알고리즘 비교 — 같은 데이터 · 100 라운드");
      k.table(56, 478, [150, 200, 170, 180, 190, 140, 134], [
        ["알고리즘", "다음 학습기에 주는 신호", "손실", "분할 탐색", "트리 성장 · 결측", "현재 설정", "검증 정확도"],
        [{ t: "AdaBoost", tone: "red" }, "샘플 가중치 wᵢ", "지수 손실", "정확 (모든 경계)", "깊이 1 · 결측 대치 필요", "η 1.0, 깊이 1", "87.5%"],
        [{ t: "Gradient Boosting", tone: "blue" }, "잔차 (음의 기울기)", "미분 가능한 손실", "정확 (모든 경계)", "깊이 제한 · 대치 필요", "η 0.1, 깊이 2", { t: "96.3%", weight: 800 }],
        [{ t: "XGBoost", tone: "purple" }, "g + h (2차 근사)", "2차 근사 + λ·γ", "exact / hist", "레벨 중심 · 기본 방향", "η 0.3, 깊이 3", "91.3%"],
        [{ t: "LightGBM", tone: "teal" }, "g + h, GOSS 가중", "2차 근사", "히스토그램", "리프 중심 · 기본 방향", "η 0.1, 잎 8", "88.8%"]
      ], { rh: 30, size: 13 });
      k.text(1240, 650, "학습 120개 · 검증 80개 · 정확도 차이는 데이터와 설정에 따라 바뀐다 (시뮬레이터 [새 데이터 뽑기]로 확인)", { size: 12, anchor: "end", color: "muted" });
      k.note(40, 664, 1200, 34, { tone: "teal", title: "LightGBM이 큰 데이터에서 빠른 이유 = 히스토그램 + GOSS + EFB(희소 특성 묶음) · 작은 데이터에서는 차이가 작다", size: 13 });
    }
  });
})();
