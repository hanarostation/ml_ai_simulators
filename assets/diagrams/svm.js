/* SVM — 알고리즘 구성도 (SVC 최대 마진 · 소프트 마진과 커널 · 쌍대와 다중 클래스 · SVR)
   예제 숫자 = 시뮬레이터 기본 화면 (SVC 16명 · 소프트 마진 seed 1 · SVR 30명 ε = 5, C = 10) */
(function () {
  var W1 = 1.484, W2 = 1.062, B = -0.134;

  /* z 좌표 그림 */
  function svcPlot(k, x0, y0, S) {
    var lim = 2.2;
    var px = function (z) { return x0 + (z + lim) * S; }, py = function (z) { return y0 + (lim - z) * S; };
    var size = 2 * lim * S;
    k.axes(x0, y0, size, size);
    k.text(x0 + size, y0 + size + 18, "z₁ = (혈당 − 120) / 25", { size: 12, anchor: "end", color: "muted" });
    k.text(x0 - 4, y0 - 8, "z₂ = (BMI − 26) / 4", { size: 12, color: "muted" });
    function line(c, tn, dash, wd) {
      var za = -lim, zb = lim;
      var ya = (c - B - W1 * za) / W2, yb = (c - B - W1 * zb) / W2;
      /* 창 안으로 자르기 */
      var pts, t0 = 0, t1 = 1, dz = zb - za, dy = yb - ya;
      [[-dz, za + lim], [dz, lim - za], [-dy, ya + lim], [dy, lim - ya]].forEach(function (pq) {
        if (pq[0] === 0) return; var r = pq[1] / pq[0];
        if (pq[0] < 0) t0 = Math.max(t0, r); else t1 = Math.min(t1, r);
      });
      pts = [[za + t0 * dz, ya + t0 * dy], [za + t1 * dz, ya + t1 * dy]];
      k.path("M" + px(pts[0][0]).toFixed(1) + " " + py(pts[0][1]).toFixed(1) + " L" + px(pts[1][0]).toFixed(1) + " " + py(pts[1][1]).toFixed(1), { tone: tn, width: wd, dash: dash });
    }
    line(1, "orange", "7 5", 1.8); line(-1, "blue", "7 5", 1.8); line(0, "ink", null, 2.8);
    var neg = [[-1.6, 0.2], [-1.0, -0.6], [-0.4, -1.6], [-1.8, 1.2], [-0.6, -1.0], [0.2, -1.9]];
    var pos = [[0.9, 0.6], [1.5, 0.2], [0.6, 1.5], [1.2, 1.2], [1.8, -0.5], [0.3, 1.9], [1.0, 1.8]];
    var sv = [[-1.12, 0.75, -1, "#7"], [0.4, -1.375, -1, "#9"], [0.12, 0.9, 1, "#14"]];
    neg.forEach(function (p) { k.circle(px(p[0]), py(p[1]), 6, { tone: "blue", fill: "solid" }); });
    pos.forEach(function (p) { k.circle(px(p[0]), py(p[1]), 6, { tone: "orange", fill: "solid" }); });
    sv.forEach(function (p) {
      k.circle(px(p[0]), py(p[1]), 6, { tone: p[2] > 0 ? "orange" : "blue", fill: "solid" });
      k.raw('<g class="dg-t-ink"><circle class="dg-stroke" cx="' + px(p[0]).toFixed(1) + '" cy="' + py(p[1]).toFixed(1) + '" r="11" style="fill:none;stroke-width:2"/></g>');
    });
    k.text(px(-1.12) - 16, py(0.75) + 4, "#7", { size: 12, weight: 800, anchor: "end", tone: "blue" });
    k.text(px(0.4) + 16, py(-1.375) + 4, "#9", { size: 12, weight: 800, tone: "blue" });
    k.text(px(0.12) - 16, py(0.9) - 6, "#14", { size: 12, weight: 800, anchor: "end", tone: "orange" });
    /* 마진 폭 화살표 (법선 방향) */
    var nw = Math.hypot(W1, W2), ux = W1 / nw, uy = W2 / nw, c0 = [1.0, (0 - B - W1 * 1.0) / W2];
    var mid = [c0[0], c0[1]];
    var a = [mid[0] - ux / nw, mid[1] - uy / nw], b = [mid[0] + ux / nw, mid[1] + uy / nw];
    k.arrow(px(a[0]), py(a[1]), px(b[0]), py(b[1]), { tone: "purple", width: 2.2, both: true });
    return { px: px, py: py };
  }

  DSDiagram.register({
    id: "svm-1", sim: "svm", order: 1,
    title: "SVM (1) — SVC: 최대 마진 초평면과 서포트 벡터", short: "SVC 최대 마진",
    sub: "Support Vector Classifier · 두 클래스를 가르는 직선 중 가장 가까운 점까지의 폭(마진)이 가장 넓은 직선 — 경계는 서포트 벡터 몇 점만으로 정해진다 (16명)",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 최대 마진 초평면 (혈당 · BMI 표준화)");
      k.panel(40, 168, 470, 444, { tone: "gray" });
      svcPlot(k, 90, 196, 80);
      k.lines(60, 588, [{ t: "실선 w·z + b = 0 · 점선 w·z + b = ±1 · 테두리 = 서포트 벡터", color: "muted" },
        { t: "보라 화살표 = 마진 폭 2/‖w‖ = 1.096", tone: "purple", color: "tone", weight: 800 }], { size: 12, lh: 17 });

      k.section(530, 152, "② 최적화 문제 (하드 마진)");
      k.formula(530, 168, 340, 84, "min  ½‖w‖²\nsubject to  yᵢ (w·xᵢ + b) ≥ 1", { size: 16 });
      k.bullets(546, 276, 330, [
        { t: "‖w‖를 줄일수록 마진 폭 2/‖w‖가 넓어짐", tone: "purple" },
        { t: "모든 점이 자기 쪽 점선 바깥에 있어야 함", tone: "blue" },
        { t: "실제로는 쌍대 문제를 SMO로 풀어 αᵢ를 구함", tone: "gray" }
      ], { size: 12.5, lh: 22 });

      k.section(890, 152, "③ 학습 결과 — 숫자로");
      k.panel(890, 168, 350, 168, { tone: "blue", head: "solid", title: "w = (1.484, 1.062),  b = −0.134", right: "" });
      k.lines(906, 228, [
        "‖w‖ = √(1.484² + 1.062²) = **1.825**",
        "마진 폭 = 2 / 1.825 = **1.096**",
        "결정 경계: 1.484·z₁ + 1.062·z₂ − 0.134 = 0",
        { t: "예측 = sign(f(x)) · 서포트 벡터 3개 / 16명", tone: "blue", color: "tone", weight: 700 }
      ], { size: 13, lh: 25 });

      k.section(530, 372, "④ 서포트 벡터만이 경계를 만든다");
      k.table(546, 386, [56, 70, 64, 130, 50, 74, 80], [
        ["#", "혈당", "BMI", "z = (z₁, z₂)", "y", "α", "y·f(x)"],
        ["7", "92", "29.0", "(−1.12, 0.75)", { t: "−1", tone: "blue" }, "1.283", { t: "1.000", weight: 800 }],
        ["9", "130", "20.5", "(0.40, −1.375)", { t: "−1", tone: "blue" }, "0.382", { t: "1.000", weight: 800 }],
        ["14", "123", "29.6", "(0.12, 0.90)", { t: "+1", tone: "orange" }, "1.665", { t: "1.000", weight: 800 }]
      ], { rh: 26, size: 12.5 });
      k.formula(546, 500, 694, 74, "w = Σ αᵢ yᵢ zᵢ = −1.283·(−1.12, 0.75) − 0.382·(0.40, −1.375) + 1.665·(0.12, 0.90)\n= (1.437 − 0.153 + 0.200,  −0.962 + 0.525 + 1.499) ≈ **(1.484, 1.062)**", { size: 13.5 });
      k.note(546, 582, 340, 30, { tone: "green", title: "Σ αᵢyᵢ = −1.283 − 0.382 + 1.665 = 0", size: 12.5 });
      k.note(900, 582, 340, 30, { tone: "red", title: "나머지 13명은 α = 0 → 옮겨도 경계 그대로", size: 12.5 });

      k.flow(40, 646, [
        { t: "데이터 (x, y = ±1)", tone: "blue" }, { t: "표준화", tone: "blue" }, { t: "쌍대 문제 · SMO", tone: "purple" },
        { t: "α > 0 = 서포트 벡터", tone: "orange" }, { t: "w, b 계산", tone: "purple" }, { t: "sign(f(x)) 예측", tone: "green" }
      ], { h: 40, gap: 22, size: 13.5 });
    }
  });

  DSDiagram.register({
    id: "svm-2", sim: "svm", order: 2,
    title: "SVM (2) — SVC: 소프트 마진 C와 커널 트릭", short: "소프트 마진 · 커널",
    sub: "겹치는 데이터는 여유 변수 ξ로 마진 위반을 허용(C가 저울) · 직선으로 안 되면 커널로 높은 차원의 내적을 계산해 경계를 휘게 한다",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 소프트 마진 — 힌지 손실과 C");
      k.formula(40, 168, 580, 58, "min  ½‖w‖² + C · Σ ξᵢ ,    ξᵢ = max(0, 1 − yᵢ·f(xᵢ))  (힌지 손실)", { size: 14.5 });
      k.panel(40, 236, 580, 178, { tone: "orange", tinted: true });
      var hx = 70, hy = 252, hw = 200, hh = 130;
      k.axes(hx, hy, hw, hh);
      var X = function (v) { return hx + (v + 1) / 3 * hw; }, Yh = function (v) { return hy + hh - v / 2 * (hh - 6); };
      k.path("M" + X(-1) + " " + Yh(2) + " L" + X(1) + " " + Yh(0) + " L" + X(2) + " " + Yh(0), { tone: "orange", width: 3 });
      k.path("M" + X(1) + " " + (hy + hh) + " V" + hy, { tone: "gray", width: 1, dash: "3 4" });
      k.path("M" + X(0) + " " + (hy + hh) + " V" + hy, { tone: "gray", width: 1, dash: "3 4" });
      k.text(X(1), hy + hh + 15, "1", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(X(0), hy + hh + 15, "0", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(hx + hw, hy + hh + 30, "y·f(x)", { size: 12, anchor: "end", color: "muted" });
      k.text(X(-0.5), hy + hh - 8, "ξ > 1 오분류", { size: 12, weight: 700, anchor: "middle", tone: "red" });
      k.text(X(1) + 6, hy + 44, "ξ = 0 (마진 밖)", { size: 12, weight: 700, tone: "green" });
      k.lines(300, 262, [
        { t: "C = 1:  2.908 + 1 × 6.183 ≈ 9.09", weight: 800 },
        "w = (2.120, 1.150) · 마진 폭 0.829",
        "ξ > 0: 12명 · 오분류(ξ > 1): 2명",
        { t: "학습 95.0% · 검증 89.0%", tone: "orange", color: "tone", weight: 700 }
      ], { size: 12.5, lh: 21 });
      k.table(300, 336, [80, 120, 100], [["C", "마진 폭", "서포트 벡터"], ["0.01", "5.84 (넓음)", "40개"], ["1000", "0.07 (좁음)", "4개"]], { rh: 24, size: 12 });

      k.section(640, 152, "② 커널 트릭 — 2D 원형 → 3D 평면");
      k.panel(640, 168, 600, 246, { tone: "teal", tinted: true });
      var cx = 740, cy = 290;
      k.raw('<g class="dg-t-teal"><circle class="dg-stroke" cx="' + cx + '" cy="' + cy + '" r="58" style="fill:none;stroke-dasharray:6 5;stroke-width:2"/></g>');
      [[0, 0], [20, -14], [-22, 10], [10, 26], [-14, -24], [28, 12], [-30, -6]].forEach(function (p) { k.circle(cx + p[0], cy + p[1], 5, { tone: "blue", fill: "solid" }); });
      for (var i = 0; i < 12; i++) { var an = i / 12 * Math.PI * 2; k.circle(cx + Math.cos(an) * 86, cy + Math.sin(an) * 86, 5, { tone: "orange", fill: "solid" }); }
      k.text(cx, 192, "원래 공간 (x₁, x₂): 직선 불가", { size: 12, weight: 800, anchor: "middle", tone: "teal" });
      k.arrow(840, 290, 890, 290, { tone: "teal", width: 2.4, label: "φ" });
      /* 3D 느낌: 바닥 + 높이 */
      k.path("M900 360 L1080 360 L1130 320 L950 320 Z", { tone: "gray", fill: "tone" });
      [[960, 350], [990, 340], [1010, 352], [1040, 342], [975, 330]].forEach(function (p) { k.circle(p[0], p[1] - 4, 5, { tone: "blue", fill: "solid" }); });
      [[930, 230], [1000, 214], [1070, 226], [1110, 244], [960, 210], [1040, 206]].forEach(function (p) { k.circle(p[0], p[1], 5, { tone: "orange", fill: "solid" }); });
      k.path("M905 290 L1085 290 L1135 262 L955 262 Z", { tone: "purple", fill: "tone", opacity: 0.9 });
      k.path("M905 290 L1085 290 L1135 262 L955 262 Z", { tone: "purple" });
      k.text(1150, 280, "평면 하나로", { size: 12, weight: 800, tone: "purple" });
      k.text(1150, 296, "분리", { size: 12, weight: 800, tone: "purple" });
      k.text(1020, 192, "세 번째 축 x₁² + x₂²", { size: 12, weight: 800, anchor: "middle", tone: "teal" });
      k.para(656, 386, 570, "평면 0.19x₁ + 0.41x₂ + 2.84(x₁² + x₂²) − 5.02 = 0 → 바닥으로 내리면 반지름 1.33인 원", { size: 12.5, weight: 700, color: "ink" });

      k.section(40, 446, "③ 커널 함수 K(x, z) — 옮기지 않고 내적만 계산");
      k.table(56, 460, [110, 230, 230], [
        ["커널", "K(x, z)", "경계 모양"],
        ["선형", "x · z", "직선 (초평면)"],
        ["다항", "(γ·x·z + r)^d", "d = 2면 원 · 타원"],
        [{ t: "RBF", tone: "teal" }, "exp(−γ‖x − z‖²)", "점 주변의 섬 · 곡선 경계"]
      ], { rh: 25, size: 12.5 });
      k.formula(56, 572, 570, 50, "RBF γ = 1:  ‖x − z‖² = 0 → 1,  1 → 0.368,  4 → 0.018", { size: 13.5 });
      k.formula(56, 630, 570, 56, "f(x) = Σ αᵢyᵢ·K(xᵢ, x) + b   (원형 데이터: SV 41개, b = 0.633)\n학습 98.0% · 검증 97.5%", { size: 13 });

      k.section(660, 446, "④ γ × C 격자 탐색 (RBF, 검증 정확도 %)");
      var g = [[57.5, 57.5, 57.5, 67.5, 93.8, 96.3], [71.3, 71.3, 93.8, 95.0, 96.3, 97.5], [92.5, 95.0, 97.5, 97.5, 92.5, 92.5], [93.8, 93.8, 96.3, 95.0, 95.0, 95.0], [88.8, 88.8, 81.3, 82.5, 82.5, 82.5]];
      k.matrix(740, 486, g, { cw: 72, ch: 30, size: 13, fmt: function (v) { return v.toFixed(1); }, cols: ["C 0.01", "0.1", "1", "10", "100", "1000"], rows: ["γ 0.01", "0.1", "1", "10", "100"],
        tones: function (i, j, v) { return v >= 97.5 ? "green" : v >= 93 ? "teal" : v >= 85 ? "amber" : "red"; }, fills: function (i, j, v) { return v >= 97.5 ? "mid" : "tone"; } });
      k.text(740, 652, "최고 97.5% (γ = 0.1 · C = 1000 등) · γ 큼 = 점마다 섬(과적합)", { size: 12, weight: 700, tone: "green" });
      k.text(740, 672, "γ 작음 = 거의 직선(과소적합) → C가 아주 커야 겨우 곡선", { size: 12, weight: 700, color: "muted" });
    }
  });

  DSDiagram.register({
    id: "svm-3", sim: "svm", order: 3,
    title: "SVM (3) — 쌍대 문제 · SMO · 다중 클래스 · 확률", short: "쌍대 · 다중 클래스",
    sub: "SVM은 실제로 α에 대한 쌍대 문제를 SMO로 한 쌍씩 풀고, 3개 이상 클래스는 이진 SVM의 투표(OvO)로, 확률은 시그모이드 보정(Platt)으로 만든다",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 쌍대 문제 (Dual)");
      k.formula(40, 168, 600, 84, "max W(α) = Σ αᵢ − ½ Σᵢ Σⱼ αᵢαⱼ yᵢyⱼ K(xᵢ, xⱼ)\n조건: 0 ≤ αᵢ ≤ C,   Σ αᵢyᵢ = 0", { size: 15 });
      k.box(40, 264, 190, 64, { tone: "gray", title: "α = 0", sub: "마진 밖 · 비서포트", size: 14 });
      k.box(245, 264, 190, 64, { tone: "blue", title: "0 < α < C", sub: "마진 위 서포트 벡터", size: 14 });
      k.box(450, 264, 190, 64, { tone: "red", title: "α = C", sub: "마진 안 · 오분류", size: 14 });
      k.text(340, 350, "데이터는 K(xᵢ, xⱼ) = 내적으로만 등장 → 커널로 바꿔 끼우기만 하면 됨", { size: 12.5, weight: 700, anchor: "middle", tone: "purple" });

      k.section(660, 152, "② SMO — 두 α씩 해석적으로 갱신");
      var f = [
        { t: "KKT 위반이 가장 큰 두 α 선택", tone: "red" },
        { t: "두 α만 갱신 (Σαᵢyᵢ = 0 유지)", tone: "purple" },
        { t: "0 ≤ α ≤ C로 자르고 b 갱신", tone: "blue" },
        { t: "W(α) 증가 → 위반 없으면 멈춤", tone: "green" }
      ];
      var pos = [[660, 168], [956, 168], [956, 252], [660, 252]];
      f.forEach(function (it, i) {
        k.box(pos[i][0], pos[i][1], 284, 64, { tone: it.tone, title: (i + 1) + ". " + it.t, size: 13.5 });
      });
      k.arrow(945, 200, 955, 200, { tone: "gray" });
      k.arrow(1098, 233, 1098, 251, { tone: "gray" });
      k.arrow(955, 284, 945, 284, { tone: "gray" });
      k.arrow(802, 251, 802, 233, { tone: "gray", dash: true });
      k.text(812, 246, "반복", { size: 12, weight: 700, tone: "gray" });
      k.text(950, 350, "왜 두 개씩? Σαᵢyᵢ = 0을 지키려면 하나만 바꿀 수 없음 (scikit-learn libsvm과 같은 규칙)", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });

      k.section(40, 388, "③ 세 클래스 — 일대일(OvO) 투표");
      k.panel(40, 404, 600, 296, { tone: "orange", tinted: true });
      k.text(56, 432, "x = (혈당 133, BMI 26.8) · 선형 · C = 1 · 이진 SVM K(K−1)/2 = 3개", { size: 12.5, weight: 700, color: "ink" });
      k.table(56, 446, [210, 100, 150], [
        ["쌍 (a | b)", "f(x)", "투표 (f > 0 → a)"],
        ["정상 | 당뇨 전단계", "−2.068", { t: "당뇨 전단계", tone: "purple", weight: 800 }],
        ["정상 | 당뇨", "−0.985", { t: "당뇨", tone: "red", weight: 800 }],
        ["당뇨 전단계 | 당뇨", "0.291", { t: "당뇨 전단계", tone: "purple", weight: 800 }]
      ], { rh: 27, size: 12.5 });
      k.box(56, 568, 568, 46, { tone: "purple", fill: "solid", title: "득표 정상 0 · 당뇨 전단계 2 · 당뇨 1 → 당뇨 전단계", size: 14 });
      k.bullets(56, 642, 568, [
        { t: "OvR: 클래스마다 '이 클래스 vs 나머지' SVM 3개 → f가 가장 큰 클래스", tone: "orange" },
        { t: "동점이면 번호가 앞선 클래스 (libsvm) · 학습 정확도 96.7%, SV 18개", tone: "gray" }
      ], { size: 12.5, lh: 22 });

      k.section(660, 388, "④ f(x) → 확률 (Platt scaling)");
      k.panel(660, 404, 580, 296, { tone: "teal", tinted: true });
      k.formula(676, 418, 548, 46, "P(질환 | x) = 1 / (1 + exp(A·f + B)),   A = −1.388, B = 0.147", { size: 13.5 });
      var x0 = 710, y0 = 482, w = 300, h = 170;
      k.axes(x0, y0, w, h);
      var FX = function (v) { return x0 + (v + 4) / 8 * w; }, FY = function (p) { return y0 + h - p * (h - 10); };
      var d = "";
      for (var v = -4; v <= 4.001; v += 0.2) d += (v === -4 ? "M" : " L") + FX(v).toFixed(1) + " " + FY(1 / (1 + Math.exp(-1.388 * v + 0.147))).toFixed(1);
      k.path(d, { tone: "teal", width: 3 });
      [[-1, 0.177], [0, 0.463], [1, 0.776]].forEach(function (q) {
        k.circle(FX(q[0]), FY(q[1]), 5, { tone: "orange", fill: "solid" });
        k.text(FX(q[0]) + 8, FY(q[1]) + 16, q[1].toFixed(3), { size: 12, weight: 800, tone: "orange" });
      });
      [-4, -2, 0, 2, 4].forEach(function (t) { k.text(FX(t), y0 + h + 16, String(t), { size: 11.5, anchor: "middle", color: "muted" }); });
      k.text(x0 + w, y0 + h + 32, "결정 함수 값 f(x)", { size: 12, anchor: "end", color: "muted" });
      k.lines(1030, 500, [
        { t: "f = −1 → 0.177", tone: "orange", color: "tone", weight: 700 },
        { t: "f = 0 → 0.463", tone: "orange", color: "tone", weight: 700 },
        { t: "f = 1 → 0.776", tone: "orange", color: "tone", weight: 700 },
        { t: "f는 거리 비슷한 값", color: "muted" },
        { t: "확률이 아님 →", color: "muted" },
        { t: "probability=True", color: "muted" },
        { t: "(내부 5겹 CV로 A, B)", color: "muted" }
      ], { size: 12.5, lh: 23 });
    }
  });

  DSDiagram.register({
    id: "svm-4", sim: "svm", order: 4,
    title: "SVM (4) — SVR: ±ε 튜브 안의 오차는 봐주는 회귀", short: "SVR ε-튜브",
    sub: "Support Vector Regression · 회귀선 둘레 폭 ±ε의 튜브 안 오차는 0, 튜브 밖 점만 손실 — 나이로 수축기 혈압 예측 (30명, ε = 5 mmHg, C = 10)",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① ε-튜브와 서포트 벡터");
      k.panel(40, 168, 560, 330, { tone: "gray" });
      var x0 = 90, y0 = 190, w = 480, h = 250;
      var PX = function (a) { return x0 + (a - 25) / 55 * w; }, PY = function (v) { return y0 + h - (v - 95) / 65 * h; };
      var f = function (a) { return 9.439 * (a - 50) / 15 + 122.63; };
      k.raw('<g class="dg-t-purple"><path class="dg-shape dg-shape--f" d="M' + PX(25) + " " + PY(f(25) + 5) + " L" + PX(80) + " " + PY(f(80) + 5) + " L" + PX(80) + " " + PY(f(80) - 5) + " L" + PX(25) + " " + PY(f(25) - 5) + 'Z"/></g>');
      k.axes(x0, y0, w, h, { x: "나이", y: "수축기 혈압" });
      k.path("M" + PX(25) + " " + PY(f(25) + 5) + " L" + PX(80) + " " + PY(f(80) + 5), { tone: "purple", width: 1.4, dash: "6 4" });
      k.path("M" + PX(25) + " " + PY(f(25) - 5) + " L" + PX(80) + " " + PY(f(80) - 5), { tone: "purple", width: 1.4, dash: "6 4" });
      k.path("M" + PX(25) + " " + PY(f(25)) + " L" + PX(80) + " " + PY(f(80)), { tone: "purple", width: 3 });
      var inT = [[30, 108], [36, 112], [41, 117], [46, 118], [52, 125], [57, 127], [62, 131], [66, 132], [71, 138], [75, 140]];
      var onT = [[44, f(44) + 5], [68, f(68) - 5]];
      var outT = [[33, 121], [39, 104], [49, 132], [55, 113], [60, 141], [64, 120], [73, 149], [77, 133]];
      inT.forEach(function (p) { k.circle(PX(p[0]), PY(p[1]), 5, { tone: "gray", fill: "mid" }); });
      onT.forEach(function (p) { k.circle(PX(p[0]), PY(p[1]), 6, { tone: "teal", fill: "solid" }); });
      outT.forEach(function (p) {
        k.path("M" + PX(p[0]) + " " + PY(p[1]) + " V" + PY(f(p[0]) + (p[1] > f(p[0]) ? 5 : -5)), { tone: "red", width: 1.6 });
        k.circle(PX(p[0]), PY(p[1]), 6, { tone: "red", fill: "solid" });
      });
      k.text(PX(27), PY(150), "±ε = 5 mmHg 튜브", { size: 12, weight: 800, tone: "purple" });
      k.text(56, 470, "● 튜브 안 (α = 0)", { size: 12, weight: 700, color: "muted" });
      k.text(182, 470, "● 경계 위 (0 < α < C)", { size: 12, weight: 700, tone: "teal" });
      k.text(330, 470, "● 튜브 밖 (α = C, 빨간 선 = ξ)", { size: 12, weight: 700, tone: "red" });
      k.text(590, 486, "그림은 개념도", { size: 11.5, anchor: "end", color: "faint" });

      k.section(620, 152, "② 목적식과 결과 (선형 커널)");
      k.formula(620, 168, 620, 84, "Lε(y, f) = max(0, |y − f(x)| − ε)\nmin ½‖w‖² + C · Σ(ξᵢ + ξᵢ*)", { size: 15 });
      k.lines(636, 284, [
        "f(x) = 9.439 · (나이 − 50)/15 + 122.63",
        "→ 기울기 9.439 / 15 = **0.629 mmHg/세**",
        "½‖w‖² = ½ × 9.439² = 44.55",
        "목적식 = 44.55 + 10 × 47.87 ≈ 523.2",
        { t: "서포트 벡터 17 / 30 (경계 위 2 · 튜브 밖 15) · 튜브 안 13명", tone: "purple", color: "tone", weight: 700 },
        { t: "ε ↑ → 튜브가 넓어져 SV ↓, 선이 평평해짐", color: "muted" }
      ], { size: 13, lh: 24 });

      k.section(40, 530, "③ 이상값 하나 (나이 30, 혈압 230)를 넣으면");
      k.table(56, 544, [190, 180, 170, 90], [
        ["모델", "기울기 전 → 후 (mmHg/세)", "30세 예측 전 → 후", "변화"],
        [{ t: "SVR (C = 10, ε = 4)", tone: "purple" }, "0.610 → 0.600", "111.9 → 112.3", { t: "+0.4", tone: "green", weight: 800 }],
        [{ t: "최소제곱", tone: "red" }, "0.622 → 0.319", "112.0 → 123.2", { t: "+11.3", tone: "red", weight: 800 }]
      ], { rh: 28, size: 12.5 });
      k.note(56, 640, 630, 50, { tone: "purple", title: "이상값의 쌍대 계수 αᵢ − αᵢ* = 10.000 = 상한 C", body: "한 점의 영향력이 C로 묶임 · 제곱 손실은 상한이 없어 잔차²만큼 끌려감", size: 13, bodySize: 12 });

      k.section(710, 530, "④ 쌍대로 대입 — 나이 60세 (C = 2, ε = 4, 10명)");
      k.formula(710, 544, 530, 40, "f(x) = Σ (αᵢ − αᵢ*) · K(xᵢ, x) + b,   K = zᵢ · z,  z = 0.667", { size: 13 });
      k.table(726, 592, [160, 70, 170, 80], [
        ["(αᵢ − αᵢ*) × K", "값", "(αᵢ − αᵢ*) × K", "값"],
        ["(0 − 2) × (−0.711)", "+1.422", "(0 − 0.375) × 0.489", "−0.183"],
        ["(2 − 0) × (−0.089)", "−0.178", "(0.375 − 0) × 0.756", "+0.284"],
        ["(2 − 0) × 0.622", "+1.244", "(0 − 2) × (−0.622)", "+1.244"]
      ], { rh: 22, size: 12, firstBold: false });
      k.text(1225, 694, "합 +3.83, b = 124.08 → f(60) ≈ 127.9 mmHg", { size: 13, weight: 800, anchor: "end", tone: "purple" });
    }
  });
})();
