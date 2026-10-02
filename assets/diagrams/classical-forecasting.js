/* 전통적 시계열 모형 (Naive · ETS · Theta) — 알고리즘 구성도
   색: 학습(관측) = 파랑, 예측 = 주황, 실제(검증) = 회색 */
(function () {
  var LABEL = "Time Series";

  /* 작은 그래프 도구: 좌표 변환 + 선 + 점 */
  function plot(o) {
    return {
      X: function (t) { return o.x + (t - o.x0) / (o.x1 - o.x0) * o.w; },
      Y: function (v) { return o.y + o.h - (v - o.y0) / (o.y1 - o.y0) * o.h; }
    };
  }
  function line(k, P, ts, vs, o) {
    var d = "";
    ts.forEach(function (t, i) { d += (i ? " L" : "M") + P.X(t).toFixed(1) + " " + P.Y(vs[i]).toFixed(1); });
    k.path(d, o);
  }
  function dots(k, P, ts, vs, tone, r) {
    ts.forEach(function (t, i) { k.circle(P.X(t), P.Y(vs[i]), r || 3.4, { tone: tone, fill: "solid" }); });
  }

  var Y8 = [10, 7, 5, 9, 14, 10, 8, 13];
  var T8 = [1, 2, 3, 4, 5, 6, 7, 8];

  /* ------------------------------------------------------------ (1) 나이브 계열 */
  DSDiagram.register({
    id: "classical-forecasting-1", sim: "classical-forecasting", order: 1,
    title: "전통적 시계열 예측 (1) — Naive 계열: 예측값은 어디서 오는가", short: "Naive 계열 기준선",
    sub: "가장 단순한 네 가지 기준선 · 복잡한 모형은 이 기준선을 이겨야 쓸 의미가 있다 (설명용 분기 데이터 8개, 계절 주기 m = 4)",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 같은 학습 데이터 y(1…8) = 10, 7, 5, 9, 14, 10, 8, 13 → 다음 4개 시점 예측", { tone: "blue" });
      var M = [
        { name: "Naive", right: "마지막 값 그대로", tone: "teal", f: "ŷ(T+k) = y(T)\n= y(8) = 13", fc: [13, 13, 13, 13],
          res: "ŷ(T+1…T+4) = 13, 13, 13, 13", d1: "가장 최근 관측 하나만 사용", d2: "무작위 보행(병상 점유율)에 강함" },
        { name: "Seasonal Naive", right: "한 주기 전 같은 때", tone: "purple", f: "ŷ(T+k) = y(T+k−m)\nm = 4 → y(5), y(6), y(7), y(8)", fc: [14, 10, 8, 13],
          res: "ŷ(T+1…T+4) = 14, 10, 8, 13", d1: "작년 같은 달의 값을 그대로 복사", d2: "계절성이 뚜렷한 ILI · 응급실 내원" },
        { name: "Drift", right: "첫 값→끝 값 기울기", tone: "amber", f: "ŷ(T+k) = y(T) + k·c\nc = (13 − 10) / 7 = 0.43", fc: [13.43, 13.86, 14.29, 14.71],
          res: "ŷ = 13.43, 13.86, 14.29, 14.71", d1: "평균 기울기 c로 직선 연장", d2: "꾸준한 추세(CGM 사용자 수)" },
        { name: "Mean", right: "전체 평균", tone: "green", f: "ŷ(T+k) = ȳ\nȳ = 76 / 8 = 9.5", fc: [9.5, 9.5, 9.5, 9.5],
          res: "ŷ(T+1…T+4) = 9.5 (모든 k)", d1: "학습 구간 전체의 평균", d2: "수준이 변하지 않는 데이터" }
      ];
      M.forEach(function (m, i) {
        var px = 40 + i * 303, pw = 291;
        k.panel(px, 166, pw, 282, { tone: m.tone, head: "solid", title: m.name, right: m.right, tinted: true });
        k.formula(px + 12, 210, pw - 24, 46, m.f, { size: 13.5 });
        var gx = px + 34, gy = 268, gw = 240, gh = 92;
        k.axes(gx - 8, gy - 4, gw + 12, gh + 8);
        var P = plot({ x: gx, y: gy, w: gw, h: gh, x0: 1, x1: 12, y0: 3, y1: 16 });
        k.path("M" + P.X(8.5) + " " + (gy - 4) + " V" + (gy + gh + 4), { tone: "gray", dash: "4 4", width: 1.2 });
        if (m.name === "Drift") line(k, P, [1, 12], [10, 10 + 11 * 3 / 7], { tone: "amber", dash: "3 4", width: 1.6 });
        if (m.name === "Mean") line(k, P, [1, 12], [9.5, 9.5], { tone: "green", dash: "3 4", width: 1.6 });
        line(k, P, T8, Y8, { tone: "blue", width: 2.2 });
        dots(k, P, T8, Y8, "blue", 3.2);
        if (m.name === "Naive") k.arrow(P.X(8) + 4, P.Y(13) - 6, P.X(12) - 4, P.Y(13) - 8, { tone: "teal", curve: -14, width: 1.6, headSize: 7 });
        if (m.name === "Seasonal Naive") [5, 6, 7, 8].forEach(function (s, j) {
          k.arrow(P.X(s), P.Y(Y8[s - 1]) - 5, P.X(s + 4), P.Y(m.fc[j]) - 6, { tone: "purple", curve: -20, width: 1.3, headSize: 6 });
        });
        line(k, P, [8, 9, 10, 11, 12], [13].concat(m.fc), { tone: "orange", width: 2, dash: "5 3" });
        dots(k, P, [9, 10, 11, 12], m.fc, "orange", 3.6);
        k.text(gx + 2, gy + gh + 22, "학습 (T = 8)", { size: 11.5, color: "muted", tone: "blue" });
        k.text(gx + gw, gy + gh + 22, "예측 T+1…T+4", { size: 11.5, anchor: "end", tone: "orange", weight: 700 });
        k.text(px + 14, 400, m.res, { size: 13, weight: 800, tone: "orange" });
        k.text(px + 14, 419, m.d1, { size: 12, color: "ink" });
        k.text(px + 14, 437, m.d2, { size: 12, color: "muted" });
      });

      k.section(40, 482, "② 예측 구간 — 잔차의 표준편차 σ̂로 폭을 정한다", { tone: "orange" });
      k.table(48, 496, [150, 196, 196], [
        ["방법", "k단계 표준오차 σ̂ₖ", "k가 커질 때"],
        ["Naive", "σ̂ · √k", "제곱근 속도로 계속 넓어짐"],
        ["Seasonal Naive", "σ̂ · √(⌊(k−1)/m⌋ + 1)", "한 주기마다 계단식"],
        ["Drift", "σ̂ · √(k · (1 + k/(n−1)))", "기울기 불확실성까지 더함"],
        ["Mean", "σ̂ · √(1 + 1/n)", "k와 무관하게 일정"]
      ], { rh: 25, size: 12.5, tones: function (i) { return ["", "teal", "purple", "amber", "green"][i]; } });
      k.text(48, 640, "80% 구간 = ŷ ± 1.28·σ̂ₖ   ·   95% 구간 = ŷ ± 1.96·σ̂ₖ   (잔차가 독립 · 정규분포라는 가정)", { size: 12.5, weight: 700, color: "ink" });
      k.box(604, 496, 216, 146, { tone: "teal", fill: "soft", align: "left", valign: "top", title: "Naive로 계산해 보기", size: 13.5, r: 8,
        lines: [{ t: "잔차 y(t) − y(t−1)", size: 12, color: "muted" }, { t: "−3, −2, 4, 5, −4, −2, 5", size: 12.5, weight: 700 },
          { t: "σ̂ = √(평균 잔차²) = 3.76", size: 12.5, weight: 700, tone: "teal" }, { t: "95% 반폭 k=1 : ±7.37", size: 12.5, tone: "orange", weight: 700 },
          { t: "95% 반폭 k=4 : ±14.74", size: 12.5, tone: "orange", weight: 700 }] });

      k.section(850, 482, "③ MASE — 척도 없는 점수", { tone: "purple" });
      k.text(850, 512, "분모 = 학습 구간 시즌 나이브의 1단계 오차 |y(t) − y(t−4)|", { size: 12, color: "muted" });
      k.matrix(906, 536, [[4, 3, 3, 4]], { cw: 52, ch: 32, cols: ["t=5", "t=6", "t=7", "t=8"], tone: "purple", size: 14 });
      k.text(1122, 557, "평균 3.5", { size: 14, weight: 800, tone: "purple" });
      k.formula(850, 582, 390, 34, "MASE = 검증 구간 MAE ÷ 3.5", { size: 14.5 });
      k.text(850, 640, "예) 검증 MAE 2.8 → MASE 0.8 < 1 → 시즌 나이브보다 낫다", { size: 12.5, weight: 700, tone: "green" });

      k.flow(40, 660, [{ t: "기준선 4개 적합", tone: "blue" }, { t: "잔차 σ̂ → 예측 구간", tone: "orange" }, { t: "검증 구간 MAE · MASE", tone: "gray" }, { t: "ETS · Theta와 같은 표에서 비교", tone: "purple" }], { h: 34, label: "실습 순서", size: 13 });
    }
  });

  /* ------------------------------------------------------------ (2) 지수평활 ETS */
  DSDiagram.register({
    id: "classical-forecasting-2", sim: "classical-forecasting", order: 2,
    title: "전통적 시계열 예측 (2) — 지수평활 ETS: 한 시점씩 갱신", short: "지수평활 ETS",
    sub: "새 관측이 들어올 때마다 오차의 α만큼만 고쳐 쓰는 갱신 규칙 · 성분(ℓ, b, s)을 하나씩 더해 SES → Holt → Holt-Winters",
    label: LABEL,
    draw: function (k) {
      /* ① 가중치 */
      k.section(40, 150, "① SES 예측 = 과거 관측의 가중 평균", { tone: "blue" });
      k.formula(40, 166, 400, 40, "ŷ(T+1) = α·y(T) + α(1−α)·y(T−1) + α(1−α)²·y(T−2) + …", { size: 12.5 });
      var w = [0.3, 0.21, 0.147, 0.103, 0.072, 0.05];
      var bx = 70, by = 222, bh = 118, bw = 360;
      k.axes(bx, by, bw, bh);
      w.forEach(function (v, i) {
        var h = v / 0.3 * (bh - 30), x = bx + 16 + i * 56;
        k.rect(x, by + bh - h, 38, h, { tone: i === 0 ? "orange" : "blue", fill: "solid", r: 3 });
        k.text(x + 19, by + bh - h - 6, v.toFixed(i < 2 ? 2 : 3), { size: 12, weight: 700, anchor: "middle", tone: i === 0 ? "orange" : "blue" });
        k.text(x + 19, by + bh + 17, i === 0 ? "y(T)" : "y(T−" + i + ")", { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.text(bx + bw, by + 12, "α = 0.3 (시뮬레이터 기본값)", { size: 12, anchor: "end", weight: 700, tone: "blue" });
      k.text(bx + bw, by + 30, "가중치 α(1−α)ʲ — 합 = 1", { size: 12, anchor: "end", color: "muted" });
      k.note(40, 372, 400, 46, { tone: "orange", title: "α가 크면 최근 값에 민첩, 작으면 매끄럽게", body: "α = 1 이면 Naive(마지막 값)와 같아진다" });

      /* ② 한 시점씩 */
      k.section(470, 150, "② 한 시점씩 따라가기 — ℓₜ = ℓₜ₋₁ + α · (yₜ − ℓₜ₋₁)", { tone: "blue" });
      var rows = [["t", "관측 y", "예측 ŷ = ℓₜ₋₁", "오차 e", "갱신 ℓₜ"],
        ["1", "10", "10.00", "0.00", "10.00"], ["2", "7", "10.00", "−3.00", "9.10"], ["3", "5", "9.10", "−4.10", "7.87"],
        ["4", "9", "7.87", "1.13", "8.21"], ["5", "14", "8.21", "5.79", "9.95"], ["6", "10", "9.95", "0.05", "9.96"],
        ["7", "8", "9.96", "−1.96", "9.37"], ["8", "13", "9.37", "3.63", "10.46"]];
      k.table(478, 166, [44, 82, 130, 92, 100], rows.map(function (r, i) {
        if (!i) return r;
        return [r[0], { t: r[1], tone: "blue", weight: 700 }, { t: r[2], color: "ink" }, { t: r[3], tone: "red" }, { t: r[4], tone: "blue", weight: 800 }];
      }), { rh: 24.5, size: 12.5, firstBold: false });
      k.box(478, 392, 448, 30, { tone: "orange", fill: "tone", title: "ŷ(T+1) = ŷ(T+2) = … = ℓ₈ = 10.46  (SES 예측은 수평선)", size: 13, r: 6 });
      k.box(946, 166, 294, 256, { tone: "gray", fill: "plain", align: "left", valign: "top", title: "읽는 법", titleColor: "ink", size: 14, r: 8,
        lines: [{ t: "초기값 ℓ₀ = y(1) = 10", size: 12.5 }, { t: "t = 2 : 예측 10 → 실제 7 (오차 −3)", size: 12.5 },
          { t: "→ ℓ = 10 + 0.3 × (−3) = 9.10", size: 12.5, tone: "blue", weight: 700 },
          { t: "t = 5 : 예측 8.21 → 실제 14", size: 12.5 }, { t: "→ ℓ = 8.21 + 0.3 × 5.79 = 9.95", size: 12.5, tone: "blue", weight: 700 },
          { t: "오차를 다 믿지 않고 30%만 반영", size: 12.5, tone: "orange", weight: 700 },
          { t: "적합값 = 한 시점 앞 예측 → 잔차로 σ̂", size: 12, color: "muted" },
          { t: "α는 [자동 최적화]가 학습 SSE 최소로", size: 12, color: "muted" }, { t: "고른다 (격자 + 넬더–미드)", size: 12, color: "muted" }] });

      /* ③ 성분 추가 */
      k.section(40, 456, "③ 성분을 하나씩 더한다 — 갱신식 (가법 계절 기준)", { tone: "purple" });
      var C = [
        { t: "SES  ETS(A,N,N)", tone: "blue", l: ["ℓₜ = α·yₜ + (1−α)·ℓₜ₋₁", "ŷ(T+k) = ℓ(T)"], p: "α" },
        { t: "Holt  ETS(A,A,N)", tone: "teal", l: ["ℓₜ = α·yₜ + (1−α)(ℓₜ₋₁ + bₜ₋₁)", "bₜ = β(ℓₜ − ℓₜ₋₁) + (1−β)·bₜ₋₁", "ŷ(T+k) = ℓ(T) + k·b(T)"], p: "+ β 기울기" },
        { t: "Holt-Winters  ETS(A,A,A)", tone: "purple", l: ["ℓₜ = α(yₜ − sₜ₋ₘ) + (1−α)(ℓₜ₋₁ + bₜ₋₁)", "sₜ = γ(yₜ − ℓₜ₋₁ − bₜ₋₁) + (1−γ)·sₜ₋ₘ", "ŷ(T+k) = ℓ(T) + k·b(T) + s(같은 계절)"], p: "+ γ 계절" }
      ];
      var bxs = [];
      C.forEach(function (c, i) {
        var x = 40 + i * 300, wd = i === 2 ? 340 : 270;
        if (i === 2) x = 640;
        if (i === 1) x = 330;
        var b = k.box(x, 472, i === 0 ? 270 : (i === 1 ? 290 : 330), 112, { tone: c.tone, fill: "tone", align: "left", valign: "top", title: c.t, size: 14, r: 8,
          lines: c.l.map(function (s) { return { t: s, size: 12.5, color: "ink" }; }) });
        bxs.push(b);
        k.chip(x + (i === 0 ? 270 : (i === 1 ? 290 : 330)) - 10, 478, c.p, { tone: c.tone, solid: true, size: 11.5, h: 22, anchor: "end" });
      });
      k.link(bxs[0].r, bxs[1].l, { tone: "gray" });
      k.link(bxs[1].r, bxs[2].l, { tone: "gray" });
      k.box(990, 472, 250, 52, { tone: "amber", fill: "tone", align: "left", title: "감쇠 추세 φ (damped)", sub: "ŷ = ℓ + (φ + φ² + … + φᵏ)·b", size: 13.5, r: 8 });
      k.box(990, 532, 250, 52, { tone: "red", fill: "tone", align: "left", title: "승법 계절 ETS(A,A,M)", sub: "yₜ ÷ sₜ₋ₘ · 진폭이 수준에 비례", size: 13.5, r: 8 });

      /* ④ 표 */
      k.section(40, 616, "④ ETS(E, T, S) 표기", { tone: "gray", sub: "E 오차 · T 추세 · S 계절 — N 없음 · A 가법 · Ad 감쇠 · M 승법" });
      k.table(48, 628, [150, 290, 170, 274, 290], [
        ["표기", "statsmodels ExponentialSmoothing", "이름", "자동 추정", "주의"],
        ["(A,N,N)  (A,A,N)", "trend=None / 'add'", "SES · Holt", "α·β·γ·φ = 학습 SSE 최소", "E가 A든 M이든 점 예측은 같음"],
        ["(A,A,A)  (A,A,M)", "seasonal='add' / 'mul', m", "Holt-Winters", "초기값 ℓ₀·b₀·s₀ = 처음 두 계절", "다른 것은 예측 구간뿐"]
      ], { rh: 23, size: 12 });
    }
  });

  /* ------------------------------------------------------------ (3) Theta */
  DSDiagram.register({
    id: "classical-forecasting-3", sim: "classical-forecasting", order: 3,
    title: "전통적 시계열 예측 (3) — Theta: 두 θ선으로 나눠 예측하고 평균", short: "Theta 방법",
    sub: "θ = 0 선(직선 추세, 장기) + θ = 2 선(굴곡 2배, 단기) → 각각 예측해 평균 · M3 예측 대회에서 단순하지만 매우 강했던 방법",
    label: LABEL,
    draw: function (k) {
      k.flow(40, 132, [
        { t: "① 계절성 검정", s: "ACF(m) 검정", tone: "gray" },
        { t: "② 계절 조정", s: "고전적 분해로 계절 지수 제거", tone: "purple" },
        { t: "③ θ선 두 개", s: "θ=0 회귀 직선 · θ=2 굴곡 2배", tone: "blue" },
        { t: "④ 각각 예측", s: "직선 연장 · SES", tone: "teal" },
        { t: "⑤ 평균 → 계절 복원", s: "½ · ½ 결합 후 지수 곱하기", tone: "orange" }
      ], { h: 48, size: 13.5 });

      /* 그래프 */
      k.section(40, 218, "③ θ선 분해 — y = 10, 12, 11, 14, 13, 16", { tone: "blue" });
      var L = [10.095, 11.124, 12.152, 13.181, 14.21, 15.238], Z = [9.905, 12.876, 9.848, 14.819, 11.79, 16.762], y = [10, 12, 11, 14, 13, 16];
      var gx = 82, gy = 248, gw = 470, gh = 200;
      k.axes(gx - 10, gy - 6, gw + 20, gh + 12, { x: "t", y: "y" });
      var P = plot({ x: gx, y: gy, w: gw, h: gh, x0: 1, x1: 10.6, y0: 9, y1: 19 });
      var ts = [1, 2, 3, 4, 5, 6];
      k.path("M" + P.X(6.5) + " " + (gy - 6) + " V" + (gy + gh + 6), { tone: "gray", dash: "4 4", width: 1.2 });
      line(k, P, [1, 9], [10.095, 10.095 + 8 * 1.0286], { tone: "purple", width: 2, dash: "6 4" });
      line(k, P, ts, Z, { tone: "teal", width: 2 });
      line(k, P, ts, y, { tone: "blue", width: 2.6 });
      dots(k, P, ts, y, "blue", 3.6);
      k.path("M" + P.X(6) + " " + P.Y(14.508) + " H" + P.X(9), { tone: "teal", dash: "3 3", width: 1.6 });
      line(k, P, [7, 8, 9], [15.388, 15.902, 16.416], { tone: "orange", width: 2.6 });
      dots(k, P, [7, 8, 9], [15.388, 15.902, 16.416], "orange", 4);
      [["원 시계열 (θ = 1)", "blue", ""], ["θ = 0 선 Lₜ (회귀 직선)", "purple", "6 4"], ["θ = 2 선 Zₜ = 2yₜ − Lₜ", "teal", ""]].forEach(function (lg, i) {
        var ly = gy + 6 + i * 20;
        k.path("M" + (gx + 6) + " " + ly + " H" + (gx + 30), { tone: lg[1], width: 2.4, dash: lg[2] || null });
        k.text(gx + 38, ly + 4.5, lg[0], { size: 12, weight: 700, tone: lg[1] });
      });
      k.text(P.X(9) + 10, P.Y(18.32) + 4, "직선 L", { size: 12, weight: 700, tone: "purple" });
      k.text(P.X(9) + 10, P.Y(16.42) + 4, "평균 ŷ", { size: 12.5, weight: 800, tone: "orange" });
      k.text(P.X(9) + 10, P.Y(14.51) + 4, "SES(Z) 14.51", { size: 12, weight: 700, tone: "teal" });
      k.text(P.X(3.5), gy + gh + 26, "학습 t = 1…6", { size: 11.5, anchor: "middle", tone: "blue", color: "tone" });
      k.text(P.X(8), gy + gh + 26, "예측 k = 1, 2, 3", { size: 11.5, anchor: "middle", tone: "orange", weight: 700 });

      /* 숫자 표 */
      k.section(600, 218, "④ ⑤ 숫자로 따라가기 (α = 0.5)", { tone: "teal" });
      k.text(600, 244, "최소제곱 직선 Lₜ = 10.10 + 1.03·(t−1)", { size: 13, weight: 800, tone: "purple" });
      k.matrix(668, 270, [[10, 12, 11, 14, 13, 16], [10.10, 11.12, 12.15, 13.18, 14.21, 15.24], [9.90, 12.88, 9.85, 14.82, 11.79, 16.76]], {
        cw: 58, ch: 28, size: 12.5, rows: ["y", "L (θ=0)", "Z (θ=2)"], cols: ["t=1", "2", "3", "4", "5", "6"],
        tones: function (i) { return ["blue", "purple", "teal"][i]; }, fmt: function (v, i) { return i ? v.toFixed(2) : v; } });
      k.table(608, 368, [70, 150, 150, 160], [
        ["k", "직선 L(6+k)", "SES(Z) 수준", "평균 = 예측 ŷ"],
        ["1", "16.27", "14.51", { t: "15.39", tone: "orange", weight: 800 }],
        ["2", "17.30", "14.51", { t: "15.90", tone: "orange", weight: 800 }],
        ["3", "18.32", "14.51", { t: "16.42", tone: "orange", weight: 800 }]
      ], { rh: 24, size: 12.5 });
      k.text(1240, 486, "ŷ = ½·L(T+k) + ½·SES(Zₜ)  (θ = 2)", { size: 12.5, weight: 800, anchor: "end", tone: "orange" });

      /* 아래 */
      k.section(40, 522, "θ선의 일반식과 같은 예측을 내는 다른 표현", { tone: "purple" });
      k.box(40, 538, 380, 110, { tone: "purple", fill: "tone", align: "left", valign: "top", title: "일반화된 θ선", size: 14, r: 8,
        lines: [{ t: "Zθ(t) = θ·yₜ + (1−θ)·Lₜ", size: 13, weight: 700 }, { t: "θ = 0 → 직선 · θ = 1 → 원 시계열", size: 12.5 },
          { t: "θ > 1 → 직선에서 벗어난 굴곡이 θ배", size: 12.5 }, { t: "어느 θ선이든 평균 · 기울기는 원 시계열과 같다", size: 12, color: "muted" }] });
      k.box(436, 538, 404, 110, { tone: "teal", fill: "tone", align: "left", valign: "top", title: "Theta = SES + 절반 기울기 drift", size: 14, r: 8,
        lines: [{ t: "ŷ = ℓ(T) + (b₀/2)·[(k−1) + 1/α − (1−α)ⁿ/α]", size: 12.5, weight: 700 }, { t: "y의 SES 수준 ℓ(T) = 14.375, b₀ = 1.029", size: 12.5 },
          { t: "k = 1 → 14.375 + 0.514 × 1.969 = 15.39 (같음)", size: 12.5, tone: "orange", weight: 700 }, { t: "statsmodels ThetaModel이 쓰는 식 (Hyndman & Billah)", size: 12, color: "muted" }] });
      k.box(856, 538, 384, 110, { tone: "gray", fill: "soft", align: "left", valign: "top", title: "② 고전적 분해 (계절 데이터일 때)", size: 14, r: 8,
        lines: [{ t: "중심 이동평균(2×m) → 추세 Tₜ", size: 12.5 }, { t: "y ÷ T 를 같은 계절끼리 평균 → 계절 지수 S", size: 12.5 },
          { t: "승법 y = T × S × R · 가법 y = T + S + R", size: 12.5 }, { t: "모든 y > 0 이면 승법으로 조정 후 Theta", size: 12, color: "muted" }] });
      k.flow(40, 662, [{ t: "y ÷ 계절 지수", tone: "purple" }, { t: "θ=0 · θ=2 예측", tone: "blue" }, { t: "½ + ½ 평균", tone: "orange" }, { t: "× 계절 지수 → 최종 ŷ", tone: "orange" }], { h: 32, label: "계절 데이터 전체 흐름", size: 13 });
    }
  });
})();
