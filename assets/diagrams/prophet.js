/* Prophet — 알고리즘 구성도
   색: 학습 데이터 = 파랑, 예측 = 주황, 실제 = 회색, 추세 = 보라, 주간 = 청록, 연간 = 호박, 휴일 = 자주(pink) (시뮬레이터와 같은 색) */
(function () {
  var LABEL = "Time Series";

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
  /* 예제 데이터를 만든 숨은 성분 (시뮬레이터 genER 과 같은 식) — i = 2023-01-01부터 지난 날 수 */
  var CP1 = 425, CP2 = 821, W = 2 * Math.PI / 365.25;
  var WEEK = [-10, 18, 6, -1, -4, -2, -7];            /* 일 월 화 수 목 금 토 */
  function day(y, m, d) { return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2023, 0, 1)) / 864e5); }
  function trend(i) { return 110 + 0.012 * i + 0.05 * Math.max(0, i - CP1) - 0.045 * Math.max(0, i - CP2); }
  function yearly(i) { return 14 * Math.cos(W * (i - 14)) + 5 * Math.cos(2 * W * (i - 205)); }
  function dow(i) { return (i + 0) % 7; }              /* 2023-01-01 = 일요일 → 0 */
  var HOLS = [day(2023, 1, 22), day(2024, 2, 10), day(2025, 1, 29), day(2023, 9, 29), day(2024, 9, 17)];
  var HEFF = { "-1": 22, "0": 48, "1": 30, "2": -14 };
  function hol(i) { var s = 0; HOLS.forEach(function (h) { var o = i - h; if (HEFF[o] != null) s += HEFF[o]; }); return s; }
  function noise(i) { return ((i * 37 + 11) % 13 - 6) * 1.1 + ((i * 17) % 5 - 2) * 0.8; }

  /* ------------------------------------------------------------ (1) 성분 쌓기 */
  DSDiagram.register({
    id: "prophet-1", sim: "prophet", order: 1,
    title: "Prophet (1) — 성분을 더해 만드는 예측", short: "성분으로 쌓기",
    sub: "y(t) = g(t) 추세 + s(t) 계절성(주간 · 연간) + h(t) 휴일 효과 + ε · 예: 일별 응급실 내원 환자 수 (2023-01-01 ~ 2025-09-30)",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 성분 그림 (plot_components) — 예제 데이터를 만든 숨은 성분", { tone: "purple" });
      var LX = 40, CX = 214, CW = 480;
      function strip(y, h, name, sub, tone) {
        k.box(LX, y, 156, h, { tone: tone, fill: "tone", title: name, sub: sub, size: 14, subSize: 11.5, r: 8 });
        k.axes(CX - 6, y, CW + 12, h);
      }
      /* 추세 */
      strip(166, 70, "g(t) 추세", "구간 선형 · 변화점 2곳", "purple");
      var P = plot({ x: CX, y: 172, w: CW, h: 58, x0: 0, x1: 1003, y0: 105, y1: 146 }), ts = [], vs = [];
      for (var i = 0; i <= 1003; i += 17) { ts.push(i); vs.push(trend(i)); }
      ts.push(1003); vs.push(trend(1003));
      line(k, P, ts, vs, { tone: "purple", width: 2.4 });
      [CP1, CP2].forEach(function (c) { k.path("M" + P.X(c).toFixed(1) + " 170 V232", { tone: "red", dash: "4 3", width: 1.2 }); });
      k.text(P.X(CP1) + 6, 229, "변화점 2024-03", { size: 11.5, tone: "red" });
      k.text(P.X(CP2) - 6, 229, "2025-04", { size: 11.5, anchor: "end", tone: "red" });
      k.text(CX + 4, 208, "110명", { size: 11.5, color: "muted" });
      k.text(CX + CW, 200, "143명", { size: 11.5, anchor: "end", color: "muted" });
      k.text(117, 249, "+", { size: 20, weight: 800, anchor: "middle", color: "ink" });
      /* 주간 */
      strip(256, 70, "s(t) 주간", "P = 7 · 요일 효과", "teal");
      var dn = ["일", "월", "화", "수", "목", "금", "토"], z = 256 + 36;
      k.path("M" + CX + " " + z + " H" + (CX + CW), { tone: "gray", width: 1 });
      WEEK.forEach(function (v, j) {
        var bx = CX + 16 + j * 66, bh = Math.abs(v) * 1.6;
        k.rect(bx, v >= 0 ? z - bh : z, 34, bh, { tone: "teal", fill: "solid", r: 2 });
        k.text(bx + 17, v >= 0 ? z - bh - 3 : z + bh + 11, (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v), { size: 11.5, weight: 700, anchor: "middle", tone: "teal" });
        k.text(bx + 17, v >= 0 ? z + 13 : z - 4, dn[j], { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.text(117, 339, "+", { size: 20, weight: 800, anchor: "middle", color: "ink" });
      /* 연간 */
      strip(346, 70, "s(t) 연간", "P = 365.25 · 겨울 높음", "amber");
      var Q = plot({ x: CX, y: 352, w: CW, h: 58, x0: 0, x1: 364, y0: -20, y1: 20 }); ts = []; vs = [];
      for (i = 0; i <= 364; i += 4) { ts.push(i); vs.push(yearly(i)); }
      k.path("M" + CX + " " + Q.Y(0).toFixed(1) + " H" + (CX + CW), { tone: "gray", width: 1, dash: "3 3" });
      line(k, Q, ts, vs, { tone: "amber", width: 2.4 });
      [["1월", 0], ["4월", 90], ["7월", 181], ["10월", 273]].forEach(function (m) { k.text(Q.X(m[1]) + 4, 414, m[0], { size: 11.5, color: "muted" }); });
      k.text(117, 429, "+", { size: 20, weight: 800, anchor: "middle", color: "ink" });
      /* 휴일 */
      strip(436, 70, "h(t) 휴일", "설날 · 추석 앞뒤 창", "pink");
      var hz = 436 + 48, ho = [["−1일", 22], ["당일", 48], ["+1일", 30], ["+2일", -14]];
      k.path("M" + CX + " " + hz + " H" + (CX + CW), { tone: "gray", width: 1 });
      ho.forEach(function (h, j) {
        var bx = CX + 40 + j * 110, bh = Math.abs(h[1]) * 0.78;
        k.rect(bx, h[1] >= 0 ? hz - bh : hz, 44, bh, { tone: "pink", fill: "solid", r: 2 });
        k.text(bx + 52, h[1] >= 0 ? hz - bh + 12 : hz + 12, (h[1] > 0 ? "+" : "−") + Math.abs(h[1]), { size: 12, weight: 800, tone: "pink" });
        k.text(bx + 22, h[1] >= 0 ? hz + 14 : hz - 4, h[0], { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.text(117, 524, "=", { size: 20, weight: 800, anchor: "middle", color: "ink" });
      /* 합 */
      k.box(LX, 530, 156, 76, { tone: "orange", fill: "tone", title: "ŷ(t) 예측선", sub: "성분의 합 · 점 = 실제 내원", size: 14, subSize: 11.5, r: 8 });
      k.axes(CX - 6, 530, CW + 12, 76);
      var a = day(2024, 1, 20), b = day(2024, 2, 29), R = plot({ x: CX, y: 536, w: CW, h: 64, x0: a, x1: b, y0: 95, y1: 180 });
      ts = []; vs = []; var dv = [];
      for (i = a; i <= b; i++) { ts.push(i); var m = trend(i) + WEEK[dow(i)] + yearly(i) + hol(i); vs.push(m); dv.push(m + noise(i)); }
      ts.forEach(function (t, j) { k.circle(R.X(t), R.Y(dv[j]), 2.6, { tone: "blue", fill: "solid" }); });
      line(k, R, ts, vs, { tone: "orange", width: 2 });
      k.text(R.X(day(2024, 2, 10)) + 8, 548, "설날 급증", { size: 11.5, weight: 800, tone: "pink" });
      k.text(CX + 4, 620, "2024-01-20", { size: 11.5, color: "muted" });
      k.text(CX + CW, 620, "2024-02-29", { size: 11.5, anchor: "end", color: "muted" });

      /* ② 하루 계산 */
      k.section(730, 150, "② 하루 값 계산 — 2024-02-10 (토, 설날 당일)", { tone: "orange" });
      var rows = [["g(t) 추세", "110 + 0.012 × 405일 (첫 변화점 전)", "114.86", "purple"],
        ["+ s 주간 (토요일)", "요일 효과", "−7.00", "teal"],
        ["+ s 연간 (2월 초)", "14·cos(…) + 5·cos(…)", "+16.78", "amber"],
        ["+ h 휴일 (설날_+0)", "명절 당일 효과", "+48.00", "pink"]];
      rows.forEach(function (r, j) {
        var y = 168 + j * 48;
        k.box(730, y, 510, 40, { tone: r[3], fill: "tone", align: "left", title: r[0], size: 14, r: 8 });
        k.text(940, y + 25, r[1], { size: 12, color: "muted" });
        k.text(1226, y + 26, r[2], { size: 16, weight: 800, anchor: "end", tone: r[3] });
      });
      k.box(730, 362, 510, 46, { tone: "orange", fill: "solid", align: "left", title: "= ŷ(2024-02-10) = 172.64명", size: 17, r: 8 });
      k.text(730, 430, "숨은 정답 성분의 합 (잡음 ε 제외) · Prophet이 추정한 성분도 이 값에 가깝게 나온다", { size: 12, color: "muted" });

      /* ③ 회귀 */
      k.section(730, 470, "③ 사실은 회귀 하나 — 설계 행렬의 열 묶음", { tone: "blue" });
      var segs = [["t", 2, "gray", "k, m"], ["a(t) 변화점", 25, "purple", "δ"], ["주간 6", 6, "teal", "β"], ["연간 20", 20, "amber", "β"], ["휴일 7", 7, "pink", "κ"]];
      var sx = 730, unit = 510 / 60;
      segs.forEach(function (sg) {
        var w = sg[1] * unit;
        k.rect(sx, 486, w - 2, 34, { tone: sg[2], fill: "tone", r: 4 });
        if (w > 40) k.text(sx + w / 2, 508, sg[0], { size: 12, weight: 800, anchor: "middle", tone: sg[2] });
        k.text(sx + w / 2, 538, sg[3], { size: 13, weight: 800, anchor: "middle", tone: sg[2] });
        sx += w;
      });
      k.text(1240, 560, "열 60개 = 2 + 변화점 25 + 주간 2×3 + 연간 2×10 + 휴일 7", { size: 12, anchor: "end", color: "muted" });
      k.table(738, 570, [190, 312], [
        ["사전분포 (규제)", "기본값 · 클수록 유연"],
        ["δ ~ Laplace(0, τ)", "changepoint_prior_scale τ = 0.05"],
        ["β, κ ~ Normal(0, σ²)", "seasonality · holidays_prior_scale = 10"]
      ], { rh: 24, size: 12.5 });

      k.flow(40, 654, [{ t: "df (ds, y)", tone: "blue" }, { t: "Prophet(holidays=…)", tone: "purple" }, { t: "fit — MAP 추정", tone: "purple" },
        { t: "make_future_dataframe(90)", tone: "gray" }, { t: "predict → yhat · 구간", tone: "orange" }], { h: 36, size: 13 });
    }
  });

  /* ------------------------------------------------------------ (2) 추세 · 계절성 */
  DSDiagram.register({
    id: "prophet-2", sim: "prophet", order: 2,
    title: "Prophet (2) — 추세의 변화점과 푸리에 계절성", short: "변화점 · 푸리에 계절성",
    sub: "추세는 변화점에서 기울기가 바뀌는 꺾은선, 계절성은 사인 · 코사인의 합 — 둘 다 고정된 기저에 계수를 곱하는 회귀",
    label: LABEL,
    draw: function (k) {
      /* ① 추세 */
      k.section(40, 150, "① 추세 g(t) — 구간 선형 + 변화점", { tone: "purple" });
      var gx = 70, gy = 180, gw = 530, gh = 136;
      k.axes(gx - 8, gy - 6, gw + 16, gh + 12);
      var P = plot({ x: gx, y: gy, w: gw, h: gh, x0: 0, x1: 1003, y0: 90, y1: 175 });
      for (var c = 0; c < 25; c++) { var cx = P.X(1003 * 0.8 * (c + 1) / 26); k.path("M" + cx.toFixed(1) + " " + gy + " V" + (gy + gh), { tone: "gray", dash: "2 4", width: 1 }); }
      for (var i = 0; i <= 1003; i += 6) k.circle(P.X(i), P.Y(trend(i) + yearly(i) + WEEK[dow(i)] * 0.6 + noise(i)), 1.6, { tone: "blue", fill: "solid" });
      var ts = [0, CP1, CP2, 1003];
      line(k, P, ts, ts.map(trend), { tone: "purple", width: 3 });
      [CP1, CP2].forEach(function (cp) { k.path("M" + P.X(cp).toFixed(1) + " " + gy + " V" + (gy + gh), { tone: "red", dash: "5 3", width: 1.8 }); });
      k.path("M" + P.X(1003 * 0.8).toFixed(1) + " " + (gy - 6) + " V" + (gy + gh + 6), { tone: "ink", width: 1.2 });
      k.text(P.X(1003 * 0.8) - 6, gy - 10, "앞 80% (changepoint_range)", { size: 11.5, anchor: "end", color: "muted" });
      k.text(gx - 8, gy + gh + 22, "점선 = 변화점 후보 25개 · 빨강 = |δ|가 살아남은 변화점 · 보라 = 추세", { size: 11.5, color: "muted" });
      k.formula(40, 350, 580, 38, "g(t) = (k + a(t)ᵀδ)·t + (m + a(t)ᵀγ),   γⱼ = −sⱼ·δⱼ", { size: 15 });
      k.text(40, 416, "a(t)", { size: 13, weight: 800, tone: "purple" });
      for (var j = 0; j < 25; j++) k.box(78 + j * 20, 402, 18, 20, { tone: j < 9 ? "purple" : "gray", fill: j < 9 ? "solid" : "plain", title: j < 9 ? "1" : "0", size: 11.5, r: 3 });
      k.text(582, 438, "시점 t가 이미 지난 변화점 칸만 1 → 그 δ만 기울기에 더해짐", { size: 12, anchor: "end", color: "muted" });
      k.table(48, 450, [190, 150, 230], [
        ["changepoint_prior_scale", "추세 모양", "부작용"],
        ["0.001", "거의 직선 (뻣뻣)", "실제 변화를 놓침"],
        ["0.05 (기본)", "꼭 필요한 곳만 꺾임", "—"],
        ["0.5", "자주 꺾임 (유연)", "과적합 · 미래 구간이 크게 벌어짐"]
      ], { rh: 25, size: 12.5, tones: function (i) { return ["", "gray", "purple", "red"][i]; } });
      k.note(40, 558, 580, 46, { tone: "purple", title: "로지스틱 성장 g(t) = C / (1 + e^(−k(t − m)))", body: "병상 수처럼 상한이 있는 데이터 · cap(C)과 floor 열을 직접 넣어야 한다" });
      k.note(40, 612, 580, 46, { tone: "orange", title: "미래 추세의 불확실성", body: "미래에도 같은 빈도로 변화점이 생긴다고 보고 크기를 Laplace(0, 평균|δ|)에서 뽑음" });

      /* ② 푸리에 */
      k.section(660, 150, "② 계절성 s(t) — 푸리에 급수", { tone: "teal" });
      k.formula(660, 166, 580, 40, "s(t) = Σₙ₌₁ᴺ [ aₙ·cos(2πnt/P) + bₙ·sin(2πnt/P) ]", { size: 15 });
      /* 기저 곡선 */
      var bx = 690, by = 226, bw = 250, bh = 110;
      k.text(bx - 10, by - 4, "기저 sin(2πnt/7) — 고정된 곡선", { size: 12, weight: 800, tone: "teal" });
      k.axes(bx - 8, by + 4, bw + 16, bh);
      var B = plot({ x: bx, y: by + 10, w: bw, h: bh - 16, x0: 0, x1: 7, y0: -1.15, y1: 1.15 });
      [[1, "", 2.4], [2, "6 3", 1.8], [3, "2 3", 1.6]].forEach(function (nn) {
        var tt = [], vv = []; for (var x = 0; x <= 7.001; x += 0.1) { tt.push(x); vv.push(Math.sin(2 * Math.PI * nn[0] * x / 7)); }
        line(k, B, tt, vv, { tone: "teal", width: nn[2], dash: nn[1] || null });
      });
      k.text(bx + bw - 2, by + bh + 20, "n = 1 실선 · 2 긴 점선 · 3 짧은 점선", { size: 11.5, anchor: "end", color: "muted" });
      /* 주간 패턴 맞추기 */
      var cx0 = 990, cw0 = 240;
      k.text(cx0 - 6, by - 4, "N = 3 → 요일 효과 7개를 정확히", { size: 12, weight: 800, tone: "teal" });
      k.axes(cx0 - 8, by + 4, cw0 + 16, bh);
      var C = plot({ x: cx0 + 12, y: by + 10, w: cw0 - 24, h: bh - 16, x0: 0, x1: 6, y0: -14, y1: 22 });
      var an = [0, 0, 0, 0], bn = [0, 0, 0, 0];
      for (var n = 1; n <= 3; n++) for (var q = 0; q < 7; q++) { an[n] += 2 / 7 * WEEK[q] * Math.cos(2 * Math.PI * n * q / 7); bn[n] += 2 / 7 * WEEK[q] * Math.sin(2 * Math.PI * n * q / 7); }
      k.path("M" + cx0 + " " + C.Y(0).toFixed(1) + " H" + (cx0 + cw0), { tone: "gray", width: 1 });
      WEEK.forEach(function (v, q) {
        var x = C.X(q), y0 = C.Y(0), y1 = C.Y(v);
        k.rect(x - 9, Math.min(y0, y1), 18, Math.abs(y1 - y0), { tone: "teal", fill: "tone", r: 2 });
        k.text(x, by + bh + 20, ["일", "월", "화", "수", "목", "금", "토"][q], { size: 11.5, anchor: "middle", color: "muted" });
      });
      var tt2 = [], vv2 = [];
      for (var x2 = 0; x2 <= 6.001; x2 += 0.05) { var sv = 0; for (n = 1; n <= 3; n++) sv += an[n] * Math.cos(2 * Math.PI * n * x2 / 7) + bn[n] * Math.sin(2 * Math.PI * n * x2 / 7); tt2.push(x2); vv2.push(sv); }
      line(k, C, tt2, vv2, { tone: "teal", width: 2.4 });

      k.text(660, 384, "열 만들기 — t = 1일일 때 (주간 P = 7)", { size: 13, weight: 800, color: "ink" });
      k.table(668, 394, [60, 170, 170], [
        ["n", "cos(2πn·1/7)", "sin(2πn·1/7)"],
        ["1", "0.623", "0.782"], ["2", "−0.223", "0.975"], ["3", "−0.901", "0.434"]
      ], { rh: 24, size: 12.5 });
      k.box(1084, 384, 156, 106, { tone: "teal", fill: "tone", align: "left", valign: "top", title: "열 개수 = 2N", size: 13.5, r: 8,
        lines: [{ t: "주간 N=3 → 6열", size: 12.5 }, { t: "연간 N=10 → 20열", size: 12.5 }, { t: "월 N=5 → 10열", size: 12.5 }] });
      k.note(660, 506, 580, 46, { tone: "red", title: "N(fourier_order)이 크면 과적합", body: "학습 오차는 계속 줄지만 떼어 둔 마지막 180일의 검증 오차는 다시 커진다" });
      k.note(660, 560, 580, 46, { tone: "amber", title: "가법 y = g + s  vs  승법 y = g·(1 + s)", body: "추세가 오를 때 요일 차이도 커지면 seasonality_mode='multiplicative'" });
      k.code(660, 614, 580, 42, ["m.add_seasonality(name=\"monthly\", period=30.5, fourier_order=5)"], { size: 12.5 });
    }
  });

  /* ------------------------------------------------------------ (3) 휴일 · 예측 · 교차검증 */
  DSDiagram.register({
    id: "prophet-3", sim: "prophet", order: 3,
    title: "Prophet (3) — 휴일 효과, 예측 구간, 교차검증", short: "휴일 · 예측 · 교차검증",
    sub: "휴일 창의 날짜마다 0/1 열을 붙여 효과를 따로 추정 · 예측 구간은 추세 경로 + 잡음의 표본 분위수 · cross_validation으로 예측 거리별 오차",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 휴일 표 (holidays 데이터프레임) → 지시 행렬 → 효과 계수", { tone: "pink" });
      k.table(48, 164, [96, 270, 66, 66, 160], [
        ["holiday", "ds (시뮬레이터 날짜)", "lower", "upper", "만들어지는 열"],
        [{ t: "설날", tone: "pink", weight: 800 }, "2023-01-22 · 2024-02-10 · 2025-01-29", "−1", "+1", "설날_-1 · _+0 · _+1"],
        [{ t: "추석", tone: "pink", weight: 800 }, "2023-09-29 · 2024-09-17 · 2025-10-06", "−1", "+1", "추석_-1 · _+0 · _+1"],
        [{ t: "크리스마스", tone: "pink", weight: 800 }, "매년 12-25", "0", "0", "크리스마스_+0"]
      ], { rh: 26, size: 12.5, firstBold: false });
      k.text(48, 290, "미래 명절(2025-10-06 추석)도 표에 있어야 예측에 반영된다", { size: 12, weight: 700, tone: "red" });

      k.matrix(780, 190, [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]], { cw: 70, ch: 22, size: 12.5,
        rows: ["02-08(목)", "02-09(금)", "02-10(토)", "02-11(일)", "02-12(월)"], cols: ["설날_-1", "설날_+0", "설날_+1"],
        tones: function (i, j, v) { return v ? "pink" : "gray"; }, fills: function (i, j, v) { return v ? "solid" : "plain"; } });
      k.text(885, 316, "2024년 설날 주변 지시 행렬", { size: 11.5, anchor: "middle", color: "muted" });
      var ex = 1012, ez = 266;
      k.text(ex, 178, "숨은 효과 (명)", { size: 12, weight: 800, tone: "pink" });
      k.path("M" + ex + " " + ez + " H1240", { tone: "gray", width: 1 });
      [["−1", 22], ["+0", 48], ["+1", 30], ["+2", -14]].forEach(function (e, j) {
        var x = ex + 8 + j * 56, h = Math.abs(e[1]) * 1.4;
        k.rect(x, e[1] >= 0 ? ez - h : ez, 30, h, { tone: "pink", fill: j === 3 ? "tone" : "solid", r: 2 });
        k.text(x + 15, e[1] >= 0 ? ez - h - 4 : ez + h + 13, (e[1] > 0 ? "+" : "−") + Math.abs(e[1]), { size: 11.5, weight: 800, anchor: "middle", tone: "pink" });
        k.text(x + 15, e[1] >= 0 ? ez + 14 : ez - 5, e[0], { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.text(1240, 316, "+2일(−14)은 창을 넓혀야 잡힌다", { size: 11.5, anchor: "end", color: "muted" });

      /* ② 예측 구간 */
      k.section(40, 350, "② 예측 구간 — yhat · yhat_lower · yhat_upper", { tone: "orange" });
      var gx = 60, gy = 372, gw = 540, gh = 150;
      k.axes(gx - 8, gy - 4, gw + 16, gh + 8);
      var a = day(2025, 4, 1), e = day(2025, 9, 30), f = e + 90;
      var P = plot({ x: gx, y: gy, w: gw, h: gh, x0: a, x1: f, y0: 100, y1: 190 });
      var up = "", lo = "", ft = [], fv = [];
      for (var i = e; i <= f; i += 3) { var m = trend(i) + yearly(i) + 2; ft.push(i); fv.push(m); }
      ft.forEach(function (t, j) { var s = 8 + 0.18 * (t - e); up += (j ? " L" : "M") + P.X(t).toFixed(1) + " " + P.Y(fv[j] + s).toFixed(1); });
      for (var j2 = ft.length - 1; j2 >= 0; j2--) { var s2 = 8 + 0.18 * (ft[j2] - e); lo += " L" + P.X(ft[j2]).toFixed(1) + " " + P.Y(fv[j2] - s2).toFixed(1); }
      k.path(up + lo + " Z", { tone: "orange", fill: "tone" });
      for (i = a; i <= e; i += 2) k.circle(P.X(i), P.Y(trend(i) + yearly(i) + WEEK[dow(i)] * 0.6 + noise(i)), 1.7, { tone: "blue", fill: "solid" });
      var act = []; for (i = e + 1; i <= f; i += 3) act.push([i, trend(i) + yearly(i) + WEEK[dow(i)] * 0.6 + noise(i) + (i > day(2025, 10, 4) && i < day(2025, 10, 9) ? 30 : 0)]);
      line(k, P, act.map(function (p) { return p[0]; }), act.map(function (p) { return p[1]; }), { tone: "gray", width: 1.4, dash: "3 3" });
      line(k, P, ft, fv, { tone: "orange", width: 2.4 });
      k.path("M" + P.X(e).toFixed(1) + " " + (gy - 4) + " V" + (gy + gh + 4), { tone: "gray", dash: "4 4", width: 1.2 });
      k.text(P.X(e) - 6, gy + 12, "학습 끝 2025-09-30", { size: 11.5, anchor: "end", color: "muted" });
      k.text(P.X(f) - 4, P.Y(fv[fv.length - 1] + 26) , "80% 구간", { size: 12, weight: 800, anchor: "end", tone: "orange" });
      k.text(gx + 4, gy + gh + 20, "파랑 = 학습 · 주황 = yhat과 구간 · 회색 점선 = 실제 미래", { size: 11.5, color: "muted" });
      k.box(40, 554, 580, 92, { tone: "orange", fill: "tone", align: "left", valign: "top", title: "구간의 재료 (interval_width = 0.8)", size: 14, r: 8,
        lines: [{ t: "① 미래 추세 경로를 여러 개 표본 (미래 변화점을 포아송으로 뽑음)", size: 12.5 }, { t: "② 각 경로에 관측 잡음 σ를 더한 뒤 10% · 90% 분위수", size: 12.5 },
          { t: "MAP 적합에서는 계절성 계수의 불확실성은 들어가지 않는다", size: 12, color: "muted" }] });

      /* ③ 교차검증 */
      k.section(660, 350, "③ cross_validation(initial, period, horizon)", { tone: "blue" });
      k.text(660, 376, "initial = 730일 · period = 45일 · horizon = 90일 → 컷오프 5개", { size: 12.5, weight: 700, color: "ink" });
      var T0 = 0, T1 = 1003, X0 = 760, XW = 470;
      function tx(d) { return X0 + (d - T0) / (T1 - T0) * XW; }
      var cuts = [[day(2025, 1, 3), "2025-01-03"], [day(2025, 2, 17), "02-17"], [day(2025, 4, 3), "04-03"], [day(2025, 5, 18), "05-18"], [day(2025, 7, 2), "07-02"]];
      k.rect(tx(0), 390, tx(730) - tx(0), 8, { tone: "gray", fill: "tone", r: 2 });
      k.text(tx(365), 412, "initial 730일", { size: 11.5, anchor: "middle", color: "muted" });
      cuts.forEach(function (c, j) {
        var y = 420 + j * 22;
        k.text(X0 - 10, y + 12, c[1], { size: 11.5, anchor: "end", color: "muted" });
        k.rect(tx(0), y, tx(c[0]) - tx(0), 16, { tone: "blue", fill: "solid", r: 2 });
        k.rect(tx(c[0]) + 1, y, tx(c[0] + 90) - tx(c[0]) - 1, 16, { tone: "orange", fill: "solid", r: 2 });
      });
      k.text(X0, 546, "2023-01", { size: 11.5, color: "muted" });
      k.text(X0 + XW, 546, "2025-09", { size: 11.5, anchor: "end", color: "muted" });
      k.box(660, 554, 580, 92, { tone: "blue", fill: "tone", align: "left", valign: "top", title: "컷오프마다 다시 적합 → 다음 90일 예측", size: 14, r: 8,
        lines: [{ t: "마지막 컷오프 = 마지막 날짜 − horizon, 거기서 45일씩 거슬러 올라감", size: 12.5 },
          { t: "performance_metrics: 예측 거리별 MAPE · RMSE · MAE · 구간 포함률", size: 12.5 },
          { t: "rolling_window = 0.1 로 가까운 거리끼리 묶어 평균", size: 12, color: "muted" }] });
      k.flow(40, 660, [{ t: "격자 탐색", tone: "purple" }, { t: "cps 0.001 · 0.01 · 0.1 · 0.5", tone: "purple" }, { t: "× sps 0.01 · 0.1 · 1 · 10", tone: "purple" }, { t: "16개 조합 교차검증 RMSE", tone: "blue" }, { t: "최소 조합으로 다시 적합", tone: "orange" }], { h: 32, size: 12.5 });
    }
  });
})();
