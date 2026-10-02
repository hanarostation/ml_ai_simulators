/* ARIMA 계열 (AR · MA · ARIMA · SARIMAX · VAR) — 알고리즘 구성도
   색: 학습(관측) = 파랑, 예측 = 주황, 실제(검증) = 회색, 충격 ε = 호박색 */
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
  function dots(k, P, ts, vs, tone, r) {
    ts.forEach(function (t, i) { k.circle(P.X(t), P.Y(vs[i]), r || 3.4, { tone: tone, fill: "solid" }); });
  }
  /* 부호 있는 막대 (ACF · PACF · 임펄스 반응) */
  function sbars(k, x, y, w, h, vals, o) {
    o = o || {};
    var mx = o.max || 1, mn = o.min == null ? 0 : o.min, z = y + h * mx / (mx - mn), n = vals.length;
    var bw = o.barW || 18, step = w / n;
    k.path("M" + x + " " + z + " H" + (x + w), { tone: "gray", width: 1.2 });
    vals.forEach(function (v, i) {
      var cx = x + step * (i + 0.5), bh = Math.abs(v) / (mx - mn) * h, tn = o.tones ? o.tones(i, v) : (o.tone || "blue");
      if (bh > 0.5) k.rect(cx - bw / 2, v >= 0 ? z - bh : z, bw, bh, { tone: tn, fill: "solid", r: 2 });
      if (o.vals !== false) k.text(cx, v >= 0 ? z - bh - 5 : z + bh + 13, o.fmt ? o.fmt(v) : v, { size: 11.5, weight: 700, anchor: "middle", tone: Math.abs(v) < 1e-9 ? "gray" : tn });
      if (o.labels) k.text(cx, mn < 0 && o.zl !== false ? (v < 0 ? z - 5 : z + 14) : y + h + 16, o.labels[i], { size: 11.5, anchor: "middle", color: "muted" });
    });
  }
  var f2 = function (v) { return Math.abs(v) < 1e-9 ? "0" : v.toFixed(2).replace("-", "−"); };

  /* ------------------------------------------------------------ (1) AR · MA */
  DSDiagram.register({
    id: "arima-1", sim: "arima", order: 1,
    title: "ARIMA 계열 (1) — AR(p) · MA(q): 과거 값이냐, 과거 충격이냐", short: "AR · MA",
    sub: "AR = 과거 관측값의 가중합, MA = 과거 충격(예측 오차 ε)의 가중합 · 시뮬레이터 기본값 AR(2) φ = 0.5, 0.3 (시간별 심박수) · MA(1) θ = 0.7 (응급실 대기시간)",
    label: LABEL,
    draw: function (k) {
      var S = [
        { px: 40, tone: "blue", title: "AR(p) — 자기회귀 (AutoRegressive)", right: "과거 값이 현재를 설명",
          f: "yₜ = c + φ₁·yₜ₋₁ + φ₂·yₜ₋₂ + εₜ    (φ₁ = 0.5, φ₂ = 0.3)",
          nodes: [["yₜ₋₂", "blue", "0.3"], ["yₜ₋₁", "blue", "0.5"], ["εₜ", "amber", "1"]],
          psi: [1, 0.5, 0.55, 0.425, 0.378, 0.316], psiNote: "ψ = 1, 0.5, 0.55, 0.43 … 천천히 줄지만 0이 되지 않음",
          acf: [0.714, 0.657, 0.543, 0.469, 0.397, 0.339], pacf: [0.714, 0.3, 0, 0, 0, 0],
          acfN: "천천히 감소", pacfN: "p = 2 뒤에서 끊김", acfT: "gray", pacfT: "blue",
          cond: "정상성: 1 − 0.5z − 0.3z² = 0 의 근 |z| = 1.17, 2.84 > 1 (단위원 밖) → 정상" },
        { px: 650, tone: "purple", title: "MA(q) — 이동평균 (Moving Average)", right: "과거 충격이 현재를 설명",
          f: "yₜ = μ + εₜ + θ₁·εₜ₋₁    (θ₁ = 0.7)",
          nodes: [["εₜ₋₂", "amber", "0"], ["εₜ₋₁", "amber", "0.7"], ["εₜ", "amber", "1"]],
          psi: [1, 0.7, 0, 0, 0, 0], psiNote: "ψ = 1, 0.7 다음 바로 0 — 충격은 q = 1 시점만 남음",
          acf: [0.47, 0, 0, 0, 0, 0], pacf: [0.47, -0.283, 0.186, -0.126, 0.087, -0.06],
          acfN: "q = 1 뒤에서 끊김", pacfN: "천천히 감소 (부호 교대)", acfT: "purple", pacfT: "gray",
          cond: "MA는 항상 정상 · 가역성 |θ₁| = 0.7 < 1 → 관측 y로 충격 ε를 되살릴 수 있음" }
      ];
      S.forEach(function (s, si) {
        var px = s.px;
        k.panel(px, 130, 590, 392, { tone: s.tone, head: "solid", title: s.title, right: s.right, tinted: true });
        k.formula(px + 16, 174, 558, 36, s.f, { size: 14.5 });
        /* 노드 연결도 */
        var top = 250, yx = px + 140, yy = 326;
        s.nodes.forEach(function (nd, i) {
          var cx = px + 50 + i * 90, on = nd[2] !== "0", tn = on ? (nd[1] === "amber" ? "amber" : s.tone) : "gray";
          var ex = yx + (i - 1) * 16, ey = yy - 24 + Math.abs(i - 1) * 6;
          k.arrow(cx + (1 - i) * 6, top + 22, ex, ey, { tone: tn, dash: !on, width: on ? 2 : 1.4, headSize: 8 });
          k.circle(cx, top, 22, { tone: nd[1], fill: "mid", label: nd[0], size: 13 });
          var mxp = (cx + ex) / 2, myp = (top + 22 + ey) / 2 + 4;
          k.text(i === 0 ? mxp - 14 : i === 1 ? mxp + 8 : mxp + 14, myp, on ? "× " + nd[2] : "영향 없음", { size: 12, weight: 800, anchor: i === 0 ? "end" : "start", tone: tn });
        });
        k.circle(yx, yy, 24, { tone: s.tone, fill: "solid", label: "yₜ", size: 15 });
        k.text(px + 16, 374, si ? "충격 ε = 그 시점의 예측 못 한 부분 (백색잡음)" : "어제 · 그제 값이 오늘 값을 끌어당김", { size: 11.5, color: "muted" });
        /* 임펄스 반응 */
        k.text(px + 300, 232, "충격 ε 하나의 영향 ψⱼ (임펄스 반응)", { size: 13, weight: 800, tone: s.tone });
        sbars(k, px + 300, 250, 270, 74, s.psi, { tone: "amber", max: 1.18, labels: ["j=0", "1", "2", "3", "4", "5"], fmt: f2, barW: 22 });
        k.text(px + 300, 362, s.psiNote, { size: 11.5, color: "muted" });
        /* ACF · PACF */
        [["ACF (자기상관)", s.acf, s.acfN, s.acfT, 16], ["PACF (편자기상관)", s.pacf, s.pacfN, s.pacfT, 306]].forEach(function (g) {
          var gx = px + g[4];
          k.text(gx, 392, g[0], { size: 13, weight: 800, color: "ink" });
          k.text(gx + 268, 392, g[2], { size: 12, weight: 800, anchor: "end", tone: g[3] });
          var neg = g[1].some(function (v) { return v < 0; });
          sbars(k, gx, 404, 268, neg ? 62 : 58, g[1], { tone: g[3], min: neg ? -0.4 : 0, max: 0.8, labels: ["1", "2", "3", "4", "5", "6"], fmt: f2, barW: 20 });
        });
        k.note(px + 16, 494, 558, 22, { tone: s.tone, title: s.cond, size: 12 });
      });

      k.section(40, 556, "③ 차수 고르기 지문 — 표본 ACF · PACF가 신뢰 한계 ±1.96/√n 밖으로 나오는 모양", { tone: "gray" });
      k.table(48, 568, [150, 250, 250, 530], [
        ["모형", "ACF", "PACF", "적합 방법 (시뮬레이터 → statsmodels)"],
        ["AR(p)", "천천히 감소 (지수 · 진동)", { t: "p 뒤에서 끊김", tone: "blue", weight: 800 }, "최소제곱 OLS → AutoReg(trend='c')"],
        ["MA(q)", { t: "q 뒤에서 끊김", tone: "purple", weight: 800 }, "천천히 감소", "조건부 최소제곱 CSS 반복 계산 (ε를 직접 볼 수 없음) → ARIMA MLE"],
        ["ARMA(p, q)", "천천히 감소", "천천히 감소", "끊기는 곳이 없으면 AIC · BIC 격자로 (p, q) 선택"],
        ["백색잡음", "모두 한계 안", "모두 한계 안", "더 설명할 패턴이 없음 = 잔차가 도달해야 할 목표"]
      ], { rh: 24, size: 12.5, tones: function (i) { return ["", "blue", "purple", "teal", "gray"][i]; } });
    }
  });

  /* ------------------------------------------------------------ (2) ARIMA */
  DSDiagram.register({
    id: "arima-2", sim: "arima", order: 2,
    title: "ARIMA 계열 (2) — ARIMA(p, d, q): 차분하고 되돌리기", short: "ARIMA 차분 · 예측",
    sub: "추세가 있으면 평균이 변해 정상성이 깨진다 → d번 차분해 ARMA로 적합 → 예측값을 누적해 원래 단위로 · 예: 일별 병상 점유율, ARIMA(1,1,0) + 표류",
    label: LABEL,
    draw: function (k) {
      var fl = k.flow(40, 132, [
        { t: "① 정상성 확인", s: "그림 · ADF 검정", tone: "blue" },
        { t: "② 차분 d", s: "추세 제거", tone: "blue" },
        { t: "③ ACF / PACF", s: "p, q 후보 · AIC", tone: "purple" },
        { t: "④ 적합", s: "계수 추정 (CSS · MLE)", tone: "teal" },
        { t: "⑤ 잔차 진단", s: "Ljung–Box · 잔차 ACF", tone: "red" },
        { t: "⑥ 예측", s: "적분 · 구간 · 지표", tone: "orange" }
      ], { h: 46, size: 13.5 });
      k.arrow(fl[4].cx, 179, fl[2].cx, 179, { tone: "red", dash: true, width: 1.6, via: [[fl[4].cx, 196], [fl[2].cx, 196]] });
      k.text((fl[4].cx + fl[2].cx) / 2, 212, "잔차가 백색잡음이 아니면 ③으로 돌아가 차수를 다시 고른다 (Box–Jenkins 반복)", { size: 12, weight: 700, anchor: "middle", tone: "red" });

      /* 차분 */
      k.section(40, 246, "①② 차분: Δyₜ = yₜ − yₜ₋₁", { tone: "blue", sub: "추세(평균 이동)가 사라지는지 확인" });
      var y = [78.0, 79.5, 80.4, 82.0, 82.6, 84.1], d = ["–", 1.5, 0.9, 1.6, 0.6, 1.5];
      k.matrix(124, 280, [y.map(function (v) { return v.toFixed(1); }), d.map(function (v) { return typeof v === "number" ? v.toFixed(1) : v; })], {
        cw: 62, ch: 30, size: 13.5, rows: ["yₜ (%)", "Δyₜ"], cols: ["t=1", "2", "3", "4", "5", "6"],
        tones: function (i) { return i ? "teal" : "blue"; } });
      k.text(512, 312, "79.5 − 78.0", { size: 13, weight: 700, tone: "teal" });
      k.text(512, 332, "= 1.5", { size: 13, weight: 800, tone: "teal" });
      /* 작은 그림 두 개 */
      var A = plot({ x: 60, y: 372, w: 230, h: 72, x0: 1, x1: 30, y0: 74, y1: 92 });
      var trend = [], dif = [], tt = [];
      for (var t = 1; t <= 30; t++) { tt.push(t); trend.push(76 + 0.5 * t + 1.4 * Math.sin(t * 1.3) + 0.8 * Math.cos(t * 2.7)); }
      for (t = 2; t <= 30; t++) dif.push(trend[t - 1] - trend[t - 2]);
      k.axes(52, 366, 246, 84);
      line(k, A, tt, trend, { tone: "blue", width: 2 });
      k.text(56, 470, "원본: 평균이 계속 오름 → 비정상", { size: 12, weight: 700, tone: "blue" });
      var B = plot({ x: 342, y: 372, w: 230, h: 72, x0: 2, x1: 30, y0: -4, y1: 5 });
      k.axes(334, 366, 246, 84);
      k.path("M342 " + B.Y(0.5).toFixed(1) + " H572", { tone: "gray", dash: "4 4", width: 1.2 });
      line(k, B, tt.slice(1), dif, { tone: "teal", width: 2 });
      k.text(338, 470, "1회 차분: 일정한 평균 주변 → 정상", { size: 12, weight: 700, tone: "teal" });
      k.note(40, 486, 560, 46, { tone: "blue", title: "ADF 검정  H₀: 단위근이 있다 (비정상)", body: "p < 0.05 이면 기각 → 정상 · 원본이 기각 안 되면 차분 후 다시 검정 (2회 이상은 드묾)" });

      /* 적합 · 예측 */
      k.section(640, 246, "④⑥ 적합 → 예측: 차분 예측을 누적(적분)", { tone: "orange" });
      k.formula(640, 262, 600, 34, "Δyₜ = c + φ·Δyₜ₋₁ + εₜ   (설명용 c = 0.6, φ = 0.4)", { size: 14 });
      k.table(648, 304, [40, 196, 196], [
        ["k", "차분 예측 Δŷ", "원래 단위 ŷ = 직전 + Δŷ"],
        ["1", "0.6 + 0.4 × 1.50 = 1.20", { t: "84.1 + 1.20 = 85.30", tone: "orange", weight: 800 }],
        ["2", "0.6 + 0.4 × 1.20 = 1.08", { t: "85.30 + 1.08 = 86.38", tone: "orange", weight: 800 }],
        ["3", "0.6 + 0.4 × 1.08 = 1.03", { t: "86.38 + 1.03 = 87.41", tone: "orange", weight: 800 }]
      ], { rh: 25, size: 12.5 });
      var C = plot({ x: 1104, y: 310, w: 130, h: 84, x0: 1, x1: 9, y0: 77, y1: 91 });
      k.axes(1098, 304, 140, 96);
      var ft = [6, 7, 8, 9], fv = [84.1, 85.3, 86.38, 87.41];
      var se = [0, 1.2, 2.2, 3.1], up = "", lo = "";
      ft.forEach(function (t, i) { up += (i ? " L" : "M") + C.X(t).toFixed(1) + " " + C.Y(fv[i] + se[i]).toFixed(1); });
      for (var j = 3; j >= 0; j--) lo += " L" + C.X(ft[j]).toFixed(1) + " " + C.Y(fv[j] - se[j]).toFixed(1);
      k.path(up + lo + " Z", { tone: "orange", fill: "tone" });
      line(k, C, [1, 2, 3, 4, 5, 6], y, { tone: "blue", width: 2 });
      line(k, C, ft, fv, { tone: "orange", width: 2 });
      line(k, C, [6, 7, 8, 9], [84.1, 84.9, 86.6, 86.9], { tone: "gray", width: 1.6, dash: "3 3" });
      k.text(1168, 418, "학습 · 예측 · 실제", { size: 11.5, anchor: "middle", color: "muted" });
      k.note(640, 434, 600, 46, { tone: "orange", title: "예측 구간이 멀수록 빨리 넓어짐", body: "차분 예측의 오차가 누적(적분)되기 때문 · 80% = ŷ ± 1.28σ̂ₖ, 95% = ŷ ± 1.96σ̂ₖ" });
      k.code(640, 488, 600, 44, ["res = ARIMA(train, order=(1, 1, 0), trend=\"t\").fit()   # d=1 + 표류", "fc = res.get_forecast(30)   # fc.predicted_mean, fc.conf_int()"], { size: 12 });

      /* 아래 세 상자 */
      k.section(40, 566, "③⑤ 차수 선택과 잔차 진단", { tone: "purple" });
      k.box(40, 580, 390, 100, { tone: "purple", fill: "tone", align: "left", valign: "top", title: "정보 기준 격자 (auto_arima 흉내)", size: 14, r: 8,
        lines: [{ t: "AIC = −2·logL + 2k", size: 13.5, weight: 700 }, { t: "BIC = −2·logL + k·ln(n)", size: 13.5, weight: 700 },
          { t: "작을수록 좋음 · BIC는 계수 하나에 더 큰 벌점", size: 12.5, color: "muted" }] });
      k.box(446, 580, 410, 100, { tone: "red", fill: "tone", align: "left", valign: "top", title: "Ljung–Box 검정 (잔차)", size: 14, r: 8,
        lines: [{ t: "Q = n(n+2) · Σ rₖ² / (n − k)  ~  χ²(h − p − q)", size: 13, weight: 700 }, { t: "H₀: 잔차 자기상관이 모두 0 (백색잡음)", size: 12.5 },
          { t: "p > 0.05 → 통과 · p < 0.05 → 남은 패턴 있음", size: 12, color: "muted" }] });
      k.box(872, 580, 368, 100, { tone: "gray", fill: "soft", align: "left", valign: "top", title: "평가 지표 (검증 구간 h개)", size: 14, r: 8,
        lines: [{ t: "MAE · RMSE · MAPE · sMAPE", size: 13, weight: 700 }, { t: "MASE = MAE ÷ 학습 구간 나이브 MAE", size: 12.5 },
          { t: "MASE < 1 → 나이브보다 낫다", size: 12, color: "muted" }] });
    }
  });

  /* ------------------------------------------------------------ (3) SARIMAX */
  DSDiagram.register({
    id: "arima-3", sim: "arima", order: 3,
    title: "ARIMA 계열 (3) — SARIMAX: 계절 차분 + 외생 변수 X", short: "SARIMAX",
    sub: "같은 계절끼리 빼서 계절 패턴을 지우고, 기온 같은 바깥 변수 X를 회귀항으로 더한다 · 예: 월별 ILI 의사환자 분율(‰), s = 12, X = 월평균 기온",
    label: LABEL,
    draw: function (k) {
      /* 표기 */
      k.section(40, 150, "① 표기 읽기 — SARIMAX(p, d, q)(P, D, Q, s) + X", { tone: "blue" });
      var parts = [["p", "AR 차수", "yₜ₋₁ …", "blue"], ["d", "차분", "yₜ − yₜ₋₁", "blue"], ["q", "MA 차수", "εₜ₋₁ …", "blue"],
        ["P", "계절 AR", "yₜ₋ₛ, yₜ₋₂ₛ", "purple"], ["D", "계절 차분", "yₜ − yₜ₋ₛ", "purple"], ["Q", "계절 MA", "εₜ₋ₛ …", "purple"],
        ["s", "주기", "월별 12 · 일별 7", "teal"], ["X", "외생 변수", "β·xₜ (기온)", "orange"]];
      parts.forEach(function (p, i) {
        var x = 40 + i * 151;
        k.box(x, 166, 141, 66, { tone: p[3], fill: i === 7 ? "tone" : "tone", title: p[0] + "  " + p[1], sub: p[2], size: 14.5, subSize: 12.5, r: 8 });
      });
      k.text(40 + 3 * 151 - 5, 252, "비계절 부분 (p, d, q)", { size: 12, weight: 700, anchor: "end", tone: "blue" });
      k.text(40 + 3 * 151 + 5, 252, "계절 부분 (P, D, Q)ₛ — 같은 일을 시차 s 간격으로", { size: 12, weight: 700, tone: "purple" });
      k.text(1240, 252, "시뮬레이터 기본: (1,0,0)(0,1,1)₁₂ + X", { size: 12, weight: 800, anchor: "end", tone: "orange" });

      /* 계절 차분 */
      k.section(40, 290, "② 계절 차분 (1 − B¹²)yₜ = yₜ − yₜ₋₁₂ — 작년 같은 달을 뺀다", { tone: "purple" });
      var y1 = [4.6, 3.7, 2.4, 1.5, 1.1, 0.9, 0.8, 1.0, 1.2, 1.6, 2.3, 3.8], y2 = [5.1, 4.1, 2.7, 1.7, 1.2, 1.0, 0.9, 1.1, 1.3, 1.8, 2.6, 4.3];
      var sd = y2.map(function (v, i) { return Math.round((v - y1[i]) * 10) / 10; });
      var mx = 150, cw = 66;
      k.matrix(mx, 322, [y1, y2, sd], { cw: cw, ch: 30, size: 13.5, rows: ["1년차 yₜ₋₁₂", "2년차 yₜ", "차분"], cols: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
        tones: function (i) { return i === 2 ? "purple" : "blue"; }, fills: function (i, j) { return i === 2 ? "tone" : (j < 2 || j > 10 ? "mid" : "tone"); },
        fmt: function (v) { return v.toFixed(1); } });
      k.text(mx + 12 * cw + 14, 344, "겨울 정점", { size: 12, weight: 700, tone: "blue" });
      k.text(mx + 12 * cw + 14, 374, "그대로 반복", { size: 12, weight: 700, tone: "blue" });
      k.text(mx + 12 * cw + 14, 404, "0.1 ~ 0.5 : 계절 모양이", { size: 12, weight: 700, tone: "purple" });
      k.text(mx + 12 * cw + 14, 422, "사라지고 작은 증가만 남음", { size: 12, weight: 700, tone: "purple" });

      /* ACF 스파이크 + X */
      k.section(40, 462, "③ 계절 차수 P, Q 고르기", { tone: "purple" });
      var acf = [0.42, 0.1, 0.02, -0.03, 0, 0, 0, 0, 0, 0, 0.05, -0.38, 0.08];
      k.text(40, 486, "계절 차분 후 ACF 모양 (개념도)", { size: 12, color: "muted" });
      sbars(k, 56, 498, 440, 100, acf, { min: -0.5, max: 0.6, barW: 18, vals: false,
        tones: function (i) { return i === 11 ? "purple" : (i === 0 ? "blue" : "gray"); },
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"] });
      [0.18, -0.18].forEach(function (b) { var yy = 498 + 100 * 0.6 / 1.1 - b / 1.1 * 100; k.path("M56 " + yy.toFixed(1) + " H496", { tone: "red", dash: "4 4", width: 1.1 }); });
      k.text(496, 498 + 100 * 0.6 / 1.1 - 0.18 / 1.1 * 100 - 5, "신뢰 한계 ±1.96/√n", { size: 11.5, anchor: "end", tone: "red" });
      k.box(510, 486, 300, 120, { tone: "gray", fill: "plain", align: "left", valign: "top", title: "읽는 법", titleColor: "ink", size: 13.5, r: 8,
        lines: [{ t: "시차 1 스파이크 → 비계절 p 또는 q", size: 12.5, tone: "blue", weight: 700 }, { t: "시차 12 스파이크 하나 → 계절 Q = 1", size: 12.5, tone: "purple", weight: 700 },
          { t: "12, 24, 36 … 천천히 감소 → 계절 P", size: 12.5 }, { t: "잔차 ACF가 모두 한계 안이면 완성", size: 12, color: "muted" }] });

      k.section(840, 462, "④ 외생 변수 X", { tone: "orange" });
      k.formula(840, 476, 400, 50, "yₜ = β·xₜ + uₜ\nuₜ ~ SARIMA(1,0,0)(0,1,1)₁₂", { size: 14 });
      k.box(840, 534, 400, 72, { tone: "orange", fill: "tone", align: "left", valign: "top", title: "β = −0.3 : 기온 1°C ↑ → ILI 0.3‰ ↓", size: 13.5, r: 8,
        lines: [{ t: "평년보다 2°C 따뜻한 시나리오 → ILI −0.3 × 2 = −0.6‰", size: 12.5 }] });
      k.note(40, 626, 600, 50, { tone: "red", title: "예측할 때는 미래 X가 필요하다", body: "미래 기온을 모르면 예측 불가 → 기상 예보 · 평년값 · 시나리오 값을 넣는다" });
      k.flow(660, 630, [{ t: "계절 차분", tone: "purple" }, { t: "ACF로 P, Q", tone: "purple" }, { t: "X 넣고 적합", tone: "orange" }, { t: "미래 X로 예측", tone: "orange" }], { w: 580, h: 42, gap: 18, size: 13 });
    }
  });

  /* ------------------------------------------------------------ (4) VAR */
  DSDiagram.register({
    id: "arima-4", sim: "arima", order: 4,
    title: "ARIMA 계열 (4) — VAR: 두 시계열이 서로의 과거를 본다", short: "VAR 다변량",
    sub: "식 하나에 변수 하나 · 모든 식이 모든 변수의 과거를 설명 변수로 쓴다 · 예: 주별 기온 편차(°C)와 ILI 편차(‰), 시뮬레이터 기본 계수 A₁",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① yₜ = c + A₁·yₜ₋₁ + uₜ — 행렬 한 번 곱하기", { tone: "blue" });
      k.text(70, 186, "A₁", { size: 15, weight: 800, anchor: "middle", tone: "blue" });
      k.matrix(96, 196, [[0.7, 0], [-0.25, 0.6]], { cw: 70, ch: 40, size: 16, rows: ["기온 식", "ILI 식"], cols: ["기온ₜ₋₁", "ILIₜ₋₁"],
        tones: function (i, j) { return i === 1 && j === 0 ? "orange" : (i === j ? "blue" : "gray"); }, fmt: f2 });
      k.text(256, 224, "×", { size: 26, weight: 700, anchor: "middle", color: "ink" });
      k.matrix(282, 196, [[-2.0], [0.5]], { cw: 70, ch: 40, size: 16, cols: ["yₜ₋₁"], tone: "gray", fmt: function (v) { return v.toFixed(1).replace("-", "−"); } });
      k.text(374, 224, "=", { size: 26, weight: 700, anchor: "middle", color: "ink" });
      k.matrix(398, 196, [[-1.4], [0.8]], { cw: 70, ch: 40, size: 16, cols: ["ŷₜ"], tone: "orange", fills: function () { return "mid"; }, fmt: function (v) { return v.toFixed(1).replace("-", "−"); } });
      k.box(40, 296, 540, 76, { tone: "gray", fill: "plain", align: "left", valign: "top", title: "지난주: 기온 −2.0°C (추움), ILI +0.5‰", titleColor: "ink", size: 13.5, r: 8,
        lines: [{ t: "기온 = 0.7 × (−2.0) + 0 × 0.5 = −1.4", size: 12.5, tone: "blue", weight: 700 },
          { t: "ILI = −0.25 × (−2.0) + 0.6 × 0.5 = 0.5 + 0.3 = 0.8  → 추위가 ILI를 올림", size: 12.5, tone: "orange", weight: 700 }] });

      /* 연결도 */
      k.section(620, 150, "② 누가 누구를 설명하나 — 그랜저 인과", { tone: "purple" });
      var n1 = k.box(650, 176, 130, 50, { tone: "blue", fill: "tone", title: "기온ₜ₋₁", size: 15 }),
        n2 = k.box(650, 290, 130, 50, { tone: "blue", fill: "tone", title: "ILIₜ₋₁", size: 15 }),
        m1 = k.box(960, 176, 130, 50, { tone: "blue", fill: "solid", title: "기온ₜ", size: 15 }),
        m2 = k.box(960, 290, 130, 50, { tone: "blue", fill: "solid", title: "ILIₜ", size: 15 });
      k.link(n1.r, m1.l, { tone: "blue", width: 2.4, label: "a₁₁ = 0.7" });
      k.link(n2.r, m2.l, { tone: "blue", width: 2.4, label: "a₂₂ = 0.6", labelDy: 30 });
      k.arrow(n1.r[0], n1.r[1] + 12, m2.l[0], m2.l[1] - 12, { tone: "orange", width: 2.6 });
      k.text(880, 246, "a₂₁ = −0.25", { size: 13, weight: 800, tone: "orange" });
      k.text(788, 278, "ILIₜ₋₁ → 기온ₜ", { size: 12, color: "muted" });
      k.text(788, 294, "a₁₂ = 0 (없음)", { size: 12, weight: 700, color: "muted" });
      k.box(1110, 176, 130, 164, { tone: "purple", fill: "tone", align: "left", valign: "top", title: "그랜저 F검정", size: 13, r: 8,
        lines: [{ t: "기온 → ILI", size: 12.5, weight: 800, tone: "orange" }, { t: "도움 됨 (a₂₁ ≠ 0)", size: 12 },
          { t: "ILI → 기온", size: 12.5, weight: 800, color: "muted" }, { t: "도움 안 됨", size: 12 }, { t: "(a₁₂ = 0)", size: 12 }] });
      k.note(620, 352, 620, 22, { tone: "purple", title: "인과 = '예측에 도움이 되는가' — 실제 원인 관계를 증명하지는 않는다", size: 12 });

      /* 정상성 · IRF */
      k.section(40, 410, "③ 정상성 — A₁의 고윳값", { tone: "teal" });
      var cx = 150, cy = 518, R = 70;
      k.circle(cx, cy, R, { tone: "gray", fill: "plain" });
      k.path("M" + (cx - R - 10) + " " + cy + " H" + (cx + R + 10) + " M" + cx + " " + (cy - R - 10) + " V" + (cy + R + 10), { tone: "gray", width: 1, dash: "3 3" });
      k.circle(cx + 0.6 * R, cy, 6, { tone: "teal", fill: "solid" });
      k.circle(cx + 0.7 * R, cy, 6, { tone: "teal", fill: "solid" });
      k.text(cx + 0.65 * R, cy - 14, "0.6  0.7", { size: 12.5, weight: 800, anchor: "middle", tone: "teal" });
      k.text(cx, cy + R + 22, "단위원 (|λ| = 1)", { size: 12, anchor: "middle", color: "muted" });
      k.box(262, 440, 318, 140, { tone: "teal", fill: "tone", align: "left", valign: "top", title: "|λ| < 1 이면 정상 VAR", size: 14, r: 8,
        lines: [{ t: "A₁이 아래 삼각 → 고윳값 = 대각 0.7, 0.6", size: 12.5 }, { t: "모두 단위원 안 → 충격이 시간이 지나며 사라짐", size: 12.5 },
          { t: "|λ| ≥ 1 이면 발산 → 차분 · 공적분(VECM) 검토", size: 12.5, tone: "red", weight: 700 }, { t: "시차 p는 select_order의 AIC · BIC로", size: 12, color: "muted" }] });

      k.section(620, 410, "④ 충격반응함수 (IRF) — 기온에 단위 충격 1을 주면", { tone: "orange" });
      var irf1 = [1, 0.7, 0.49, 0.343, 0.24], irf2 = [0, -0.25, -0.325, -0.318, -0.276];
      sbars(k, 636, 446, 280, 104, irf1, { tone: "blue", min: 0, max: 1.1, labels: ["0", "1", "2", "3", "4"], fmt: f2, barW: 26 });
      k.text(776, 438, "기온 반응: 0.7ʲ 로 줄어듦", { size: 12.5, weight: 800, anchor: "middle", tone: "blue" });
      sbars(k, 946, 456, 280, 92, irf2, { tone: "orange", min: -0.45, max: 0.15, zl: false, labels: ["0", "1", "2", "3", "4"], fmt: f2, barW: 26 });
      k.text(1086, 438, "ILI 반응: 한 주 뒤부터 −, 2주째 최대", { size: 12.5, weight: 800, anchor: "middle", tone: "orange" });
      k.text(1240, 590, "Aʲ의 첫 열 · 시뮬레이터 기본은 촐레스키 직교화 1σ 충격(모양은 비슷)", { size: 11.5, anchor: "end", color: "muted" });

      k.flow(40, 640, [{ t: "정상성 확인", s: "고윳값 |λ| < 1", tone: "teal" }, { t: "시차 p 선택", s: "select_order (AIC)", tone: "purple" },
        { t: "식마다 OLS", s: "VAR(df).fit(p)", tone: "blue" }, { t: "그랜저 · IRF", s: "해석", tone: "purple" }, { t: "두 시계열 동시 예측", s: "forecast(y, h)", tone: "orange" }], { h: 46, size: 13.5 });
    }
  });
})();
