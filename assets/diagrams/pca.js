/* PCA 차원 축소 — 알고리즘 구성도 (강의 필기자료 양식으로 새로 설계)
   손계산 예제 = 시뮬레이터 2번 화면 '손계산 예제 5명' (수축기·이완기 혈압)
   고차원 예제 = 시뮬레이터 3번 화면 기본값 (건강검진 10항목 · 200명 · 표준화 · 80% 기준) */
(function () {
  var XC = [[-10, -4], [0, 1], [10, 6], [-20, -14], [20, 11]];     /* 중심화한 5명 */
  var V1 = [0.8558, 0.5173];

  /* 중심화 데이터를 축 u(각도 th)에 사영한 그림 */
  function projPlot(k, x0, y0, w, h, th, tone, label) {
    var s = 4.6, cx = x0 + w / 2, cy = y0 + h / 2;
    var X = function (v) { return cx + v * s; }, Y = function (v) { return cy - v * s; };
    k.raw('<line class="dg-axis" x1="' + x0 + '" y1="' + cy + '" x2="' + (x0 + w) + '" y2="' + cy + '" style="opacity:.55"/>');
    k.raw('<line class="dg-axis" x1="' + cx + '" y1="' + y0 + '" x2="' + cx + '" y2="' + (y0 + h) + '" style="opacity:.55"/>');
    var u = [Math.cos(th * Math.PI / 180), Math.sin(th * Math.PI / 180)], L = 30;
    k.path("M" + X(-L * u[0]) + " " + Y(-L * u[1]) + " L" + X(L * u[0]) + " " + Y(L * u[1]), { tone: tone, width: 2.6 });
    k.text(X(L * u[0]) - 4, Y(L * u[1]) - 8, label, { size: 12.5, weight: 800, anchor: "end", tone: tone });
    XC.forEach(function (p) {
      var z = p[0] * u[0] + p[1] * u[1], f = [z * u[0], z * u[1]];
      k.path("M" + X(p[0]) + " " + Y(p[1]) + " L" + X(f[0]) + " " + Y(f[1]), { tone: "red", width: 1.8 });
      k.circle(X(f[0]), Y(f[1]), 3.5, { tone: tone, fill: "solid" });
      k.circle(X(p[0]), Y(p[1]), 6, { tone: "blue", fill: "solid" });
    });
  }

  /* ------------------------------------------------------------------ (1) */
  DSDiagram.register({
    id: "pca-1", sim: "pca", order: 1,
    title: "PCA (1) — 가장 넓게 퍼진 방향으로 새 축 잡기", short: "분산 최대 = 오차 최소",
    sub: "수축기·이완기 혈압 5명(평균을 빼서 원점으로) · 평균을 지나는 축 u = (cos θ, sin θ)에 점을 사영하고, 사영 분산과 수선 길이를 비교",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 축을 돌려 보기 — 같은 점, 다른 축");
      [[0, "θ = 0° (수축기 축 그대로)", "gray", "250.00", "92.50"], [31.15, "θ = 31.2° (PC1)", "purple", "340.67", "1.83"]].forEach(function (c, i) {
        var x = 40 + i * 300;
        k.panel(x, 168, 288, 300, { tone: c[2], head: i ? "solid" : "soft", title: c[1], headH: 30, titleSize: 14 });
        projPlot(k, x + 14, 206, 260, 170, c[0], c[2], i ? "PC1" : "u");
        k.box(x + 14, 388, 260, 66, { tone: c[2], fill: i ? "tone" : "soft", size: 13.5, title: "사영 분산 Var(z) = " + c[3], lines: [{ t: "재구성 오차 Σd²/(n−1) = " + c[4], tone: "red", weight: 800, size: 13 }] });
      });

      k.section(660, 152, "② 각도에 따른 두 값 — 합은 언제나 342.5");
      k.panel(660, 168, 580, 300, { tone: "gray" });
      var gx = 716, gy = 196, gw = 500, gh = 220;
      var tx = function (t) { return gx + t / 180 * gw; }, ty = function (v) { return gy + gh - v / 360 * gh; };
      k.axes(gx, gy, gw, gh);
      [0, 45, 90, 135, 180].forEach(function (t) { k.text(tx(t), gy + gh + 16, t + "°", { size: 11.5, anchor: "middle", color: "muted" }); });
      [0, 100, 200, 300].forEach(function (v) { k.text(gx - 6, ty(v) + 4, String(v), { size: 11.5, anchor: "end", color: "muted" }); });
      var dv = "", de = "";
      for (var i = 0; i <= 90; i++) {
        var t = i * 2, r = t * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        var v = 250 * c * c + 300 * s * c + 92.5 * s * s;
        dv += (i ? " L" : "M") + tx(t).toFixed(1) + " " + ty(v).toFixed(1);
        de += (i ? " L" : "M") + tx(t).toFixed(1) + " " + ty(342.5 - v).toFixed(1);
      }
      k.path(dv, { tone: "purple", width: 2.6 });
      k.path(de, { tone: "red", width: 2.6 });
      k.raw('<line class="dg-axis" x1="' + tx(31.15) + '" y1="' + gy + '" x2="' + tx(31.15) + '" y2="' + (gy + gh) + '" style="stroke-dasharray:4 4"/>');
      k.raw('<line class="dg-axis" x1="' + tx(121.15) + '" y1="' + gy + '" x2="' + tx(121.15) + '" y2="' + (gy + gh) + '" style="stroke-dasharray:4 4"/>');
      k.circle(tx(31.15), ty(340.67), 6, { tone: "purple", fill: "solid" });
      k.circle(tx(31.15), ty(1.83), 6, { tone: "red", fill: "solid" });
      k.text(tx(31.15) + 10, ty(340.67) + 4, "PC1 31.2° · 분산 최대 340.67", { size: 12, weight: 800, tone: "purple" });
      k.text(tx(31.15) + 10, ty(1.83) - 8, "오차 최소 1.83", { size: 12, weight: 800, tone: "red" });
      k.text(tx(121.15) + 8, gy + 14, "PC2 121.2° (직교)", { size: 12, weight: 700, color: "muted" });
      var cw1 = k.chip(716, 438, "사영 분산 Var(z)", { tone: "purple", size: 12, h: 24 });
      k.chip(716 + cw1 + 10, 438, "재구성 오차 Σd²/(n−1)", { tone: "red", size: 12, h: 24 });
      k.text(1224, 455, "가로축: 축 각도 θ", { size: 11.5, anchor: "end", color: "muted" });

      k.section(40, 504, "③ 왜 같은 축인가 — 직각삼각형");
      k.formula(56, 520, 584, 46, "‖x̃‖² = z² + d²  →  Var(z) + 오차 = 총분산 tr(Σ) = 250 + 92.5 = 342.5", { size: 14.5 });
      k.table(56, 580, [120, 116, 116, 116, 116], [
        ["축 각도 θ", "0°", "31.2° (PC1)", "60°", "90°"],
        ["사영 분산", "250.00", { t: "340.67", tone: "purple", weight: 800 }, "261.78", "92.50"],
        ["재구성 오차", "92.50", { t: "1.83", tone: "red", weight: 800 }, "80.72", "250.00"]
      ], { rh: 26, size: 12.5 });
      k.text(56, 692, "z = x̃ · u (축 위 좌표, 주성분 점수) · d = 점에서 축까지 수선 길이", { size: 12, color: "muted" });

      k.section(660, 504, "④ PCA의 세 가지 약속");
      k.note(660, 520, 580, 50, { tone: "blue", title: "먼저 평균을 뺀다 (중심화)", body: "축은 항상 데이터의 중심 x̄ = (130, 84)를 지난다 · 단위가 다르면 표준화까지", size: 13.5, bodySize: 12 });
      k.note(660, 578, 580, 50, { tone: "purple", title: "다음 축은 앞 축과 직교하면서 남은 분산이 최대인 방향", body: "PC2 = PC1 + 90° · 새 좌표 z₁, z₂는 서로 상관 0", size: 13.5, bodySize: 12 });
      k.note(660, 636, 580, 50, { tone: "orange", title: "라벨을 보지 않는다 (비지도)", body: "분산이 큰 방향이 분류에 꼭 유용한 것은 아님 → 시뮬레이터 5번 화면", size: 13.5, bodySize: 12 });
    }
  });

  /* ------------------------------------------------------------------ (2) */
  DSDiagram.register({
    id: "pca-2", sim: "pca", order: 2,
    title: "PCA (2) — 공분산 행렬 → 고유값 분해 → 투영", short: "고유값 분해 숫자로 따라가기",
    sub: "시뮬레이터 2번 화면 '손계산 예제 5명' · 열 = 수축기, 이완기 (mmHg) · 두 변수 단위가 같아 표준화 단계는 건너뜀",
    label: "Machine Learning",
    draw: function (k) {
      k.flow(40, 126, [
        { t: "원자료 X", tone: "gray" }, { t: "① 중심화", tone: "blue" }, { t: "② 표준화 (선택)", tone: "gray", fill: "soft" },
        { t: "③ 공분산 행렬", tone: "teal" }, { t: "④ 고유값 분해", tone: "purple" }, { t: "⑤ 투영 Z = X̃V", tone: "orange" }, { t: "⑥ 설명 분산 비율", tone: "green" }
      ], { w: 1200, h: 36, gap: 16, size: 12.5 });

      var X = [[120, 80], [130, 85], [140, 90], [110, 70], [150, 95]];
      var rl = ["#1", "#2", "#3", "#4", "#5"];
      k.section(40, 200, "① 중심화  X̃ = X − x̄", { tone: "blue" });
      k.matrix(84, 252, X, { cw: 50, ch: 26, size: 13, rows: rl, cols: ["수축기", "이완기"], tone: "blue", fill: "plain", title: "X (5×2)" });
      k.text(206, 322, "−", { size: 22, weight: 800, anchor: "middle", color: "ink" });
      k.matrix(222, 302, [[130, 84]], { cw: 50, ch: 30, size: 13.5, tone: "blue", fill: "tone", title: "x̄" });
      k.text(342, 322, "=", { size: 22, weight: 800, anchor: "middle", color: "ink" });
      k.matrix(362, 252, XC, { cw: 50, ch: 26, size: 13, tones: function () { return "blue"; }, fills: function () { return "tone"; }, title: "X̃", fmt: function (v) { return String(v).replace("-", "−"); } });
      k.lines(486, 276, ["열 합 = (0, 0)", "모양은 그대로,", "위치만 원점으로", { t: "x̄ = ΣX / n", color: "muted" }], { size: 12.5, lh: 20 });

      k.section(640, 200, "③ 공분산 행렬  Σ = X̃ᵀX̃ / (n − 1)", { tone: "teal" });
      k.matrix(684, 254, [[1000, 600], [600, 370]], { cw: 60, ch: 30, size: 14, tones: function () { return "teal"; }, fills: function (i, j) { return i === j ? "tone" : "plain"; }, title: "X̃ᵀX̃" });
      k.text(842, 290, "÷ 4 =", { size: 18, weight: 800, anchor: "middle", tone: "teal" });
      k.matrix(880, 254, [[250, 150], [150, 92.5]], { cw: 62, ch: 30, size: 14, tones: function () { return "teal"; }, fills: function (i, j) { return i === j ? "mid" : "tone"; }, title: "Σ" });
      k.box(1022, 228, 218, 132, { tone: "teal", fill: "soft", align: "left", valign: "top", size: 13, title: "읽는 법", lines: [
        { t: "대각선 = 분산 (250, 92.5)", size: 12.5 }, { t: "비대각 = 공분산 150", size: 12.5 }, { t: "예) Σx̃ỹ = 40+0+60+280+220", size: 12 }, { t: "= 600 → 상관 0.986", size: 12, weight: 800 }] });
      k.text(684, 346, "n − 1 = 4로 나눔 (scikit-learn explained_variance_와 같은 기준)", { size: 12, color: "muted" });

      k.section(40, 412, "④ 고유값 분해  Σv = λv", { tone: "purple" });
      k.panel(40, 426, 600, 180, { tone: "purple", tinted: true });
      k.lines(60, 452, [
        "det(Σ − λI) = (250 − λ)(92.5 − λ) − 150² = 0",
        "λ² − 342.5 λ + 625 = 0   (tr = 342.5, det = 625)",
        "λ = 171.25 ± √(171.25² − 625) = 171.25 ± 169.42",
        { t: "λ₁ = 340.67  ·  λ₂ = 1.83", tone: "purple", weight: 800, size: 15 },
        "v₁ ∝ (b, λ₁ − a) = (150, 90.67) → 길이 1로: (0.856, 0.517)",
        "v₂ ⟂ v₁ → (−0.517, 0.856) · PC1 각도 = 31.15°",
        { t: "검산 Σv₁ = (291.55, 176.22) = 340.67 × (0.856, 0.517)", tone: "teal", weight: 700 }
      ], { size: 13, lh: 22 });

      k.section(670, 412, "⑤ 투영  Z = X̃V", { tone: "orange" });
      k.matrix(712, 448, [[-10.63, 1.75], [0.52, 0.86], [11.66, -0.04], [-24.36, -1.64], [22.81, -0.93]], { cw: 70, ch: 26, size: 13, rows: rl, cols: ["z₁ (PC1)", "z₂ (PC2)"],
        tones: function (i, j) { return j ? "gray" : "orange"; }, fills: function (i, j) { return j ? "plain" : "tone"; }, fmt: function (v) { return v.toFixed(2).replace("-", "−"); } });
      k.lines(876, 462, [
        "V = [v₁ v₂] (열 = 고유벡터)",
        { t: "Var(z₁) = 340.67 = λ₁", tone: "orange", weight: 800 },
        { t: "Var(z₂) = 1.83 = λ₂", color: "muted" },
        { t: "Cov(z₁, z₂) = 0 → 서로 독립인 새 축", weight: 700 },
        { t: "#1: (−10)(0.856) + (−4)(0.517) = −10.63", size: 12, color: "muted" }
      ], { size: 13, lh: 24 });

      k.section(40, 640, "⑥ 설명 분산 비율", { tone: "green" });
      var bx = 236, bw = 400;
      k.rect(bx, 626, bw * 0.9946, 26, { tone: "green", fill: "solid", r: 4 });
      k.rect(bx + bw * 0.9946, 626, bw * 0.0054 + 2, 26, { tone: "gray", fill: "solid", r: 2 });
      k.text(bx + 12, 644, "PC1 340.67 / 342.5 = 99.46%", { size: 12.5, weight: 800, color: "on" });
      k.text(56, 682, "PC2 1.83 / 342.5 = 0.54% → PC1 하나만 남겨도(2D → 1D) 분산 99.5% 보존", { size: 12.5, color: "ink" });
      k.code(670, 626, 570, 70, [
        "pca = PCA(n_components=1).fit(X)        # 중심화는 PCA 안에서 자동",
        "pca.explained_variance_         # [340.67]  ← λ₁",
        "pca.components_                 # [[0.856, 0.517]]  ← v₁ᵀ"
      ], { size: 12 });
    }
  });

  /* ------------------------------------------------------------------ (3) */
  var VARS = ["나이", "BMI", "허리둘레", "수축기혈압", "이완기혈압", "공복혈당", "총콜레스테롤", "LDL", "HDL", "중성지방"];
  var LOAD = [[0.28, 0.49, 0.18], [0.37, -0.13, -0.24], [0.37, -0.15, -0.25], [0.31, 0.45, 0.08], [0.31, 0.46, 0.08],
    [0.37, -0.05, -0.14], [0.26, -0.26, 0.56], [0.23, -0.37, 0.53], [-0.27, 0.21, 0.46], [0.36, -0.24, -0.02]];
  DSDiagram.register({
    id: "pca-3", sim: "pca", order: 3,
    title: "PCA (3) — 건강검진 10항목을 3개 주성분으로", short: "고차원 축소 · 복원 · 한계",
    sub: "시뮬레이터 3·4번 화면 기본값 · 가상 수검자 200명 · 표준화 후 PCA · 누적 설명 분산 80% 기준 → 성분 3개 · 복원 오차와 한계까지",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 스크리 도표 — 몇 개 남길까");
      k.panel(40, 168, 380, 290, { tone: "gray" });
      var gx = 92, gy = 196, gw = 300, gh = 200, Y = function (v) { return gy + gh - v / 100 * gh; };
      k.axes(gx, gy, gw, gh);
      [0, 50, 100].forEach(function (v) { k.text(gx - 6, Y(v) + 4, v + "%", { size: 11.5, anchor: "end", color: "muted" }); });
      var vals = [56.2, 16.9, 14.3, 12.7], cum = [56.2, 73.1, 87.3, 100], lab = ["PC1", "PC2", "PC3", "PC4~10"];
      var bw = 52, step = 72, px = [];
      vals.forEach(function (v, i) {
        var x = gx + 16 + i * step; px.push(x + bw / 2);
        k.rect(x, Y(v), bw, Y(0) - Y(v), { tone: i < 3 ? "purple" : "gray", fill: "solid", r: 3 });
        k.text(x + bw / 2, Y(v) + 17, v.toFixed(1) + "%", { size: 12, weight: 800, anchor: "middle", color: "on" });
        k.text(x + bw / 2, gy + gh + 16, lab[i], { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.raw('<line class="dg-axis" x1="' + gx + '" y1="' + Y(80) + '" x2="' + (gx + gw) + '" y2="' + Y(80) + '" style="stroke-dasharray:5 4"/>');
      k.text(gx + 6, Y(80) - 6, "80% 기준", { size: 11.5, weight: 700, color: "muted" });
      k.path("M" + px.map(function (x, i) { return x + " " + Y(cum[i]); }).join(" L"), { tone: "red", width: 2.2 });
      px.forEach(function (x, i) { k.circle(x, Y(cum[i]), 4.5, { tone: "red", fill: "solid" }); });
      k.text(px[2] - 8, Y(87.3) - 10, "누적 87.3%", { size: 12, weight: 800, tone: "red", anchor: "end" });
      k.text(56, 436, "λ₁ = 5.645 · λ₂ = 1.698 · λ₃ = 1.435 · 나머지 7개 합 1.273", { size: 12, color: "ink" });

      k.section(450, 152, "② 로딩 — 변수가 각 성분에 기여하는 정도");
      var tn = function (i, j, v) { return v >= 0 ? "blue" : "orange"; };
      var fl = function (i, j, v) { var a = Math.abs(v); return a >= 0.44 ? "solid" : a >= 0.3 ? "mid" : a >= 0.15 ? "tone" : "plain"; };
      k.matrix(556, 186, LOAD, { cw: 64, ch: 25, size: 12.5, rows: VARS, cols: ["PC1", "PC2", "PC3"], tones: tn, fills: fl, fmt: function (v) { return v.toFixed(2).replace("-", "−"); } });
      k.text(652, 450, "파랑 +, 주황 −, 진할수록 큼 (components_)", { size: 11.5, anchor: "middle", color: "muted" });
      k.box(762, 186, 186, 76, { tone: "blue", fill: "tone", align: "left", valign: "top", size: 13, title: "PC1 = 대사 위험 전반", lines: [{ t: "허리·BMI·혈당·중성지방 +", size: 12 }, { t: "HDL만 − (좋은 콜레스테롤)", size: 12 }] });
      k.box(762, 270, 186, 76, { tone: "purple", fill: "tone", align: "left", valign: "top", size: 13, title: "PC2 = 나이·혈압 축", lines: [{ t: "나이 0.49 · 혈압 0.45~0.46", size: 12 }, { t: "LDL·중성지방은 −", size: 12 }] });
      k.box(762, 354, 186, 76, { tone: "teal", fill: "tone", align: "left", valign: "top", size: 13, title: "PC3 = 지질 축", lines: [{ t: "총콜레스테롤 0.56", size: 12 }, { t: "LDL 0.53 · HDL 0.46", size: 12 }] });

      k.section(978, 152, "③ 표준화 끔 vs 켬");
      k.table(984, 168, [92, 82, 82], [
        ["", "끔", "켬"],
        ["PC1 설명", "74.7%", { t: "56.2%", tone: "blue", weight: 800 }],
        ["PC1 최대", { t: "중성지방", tone: "red" }, "허리둘레"],
        ["", { t: "0.86", tone: "red" }, "0.37"],
        ["90% 성분 수", "3", "4"]
      ], { rh: 26, size: 12.5 });
      k.box(984, 310, 256, 120, { tone: "red", fill: "soft", align: "left", valign: "top", size: 13, title: "단위가 큰 변수가 독차지", lines: [
        { t: "원래 단위에서 중성지방이", size: 12 }, { t: "전체 분산의 57.2% → PC1을", size: 12 }, { t: "거의 혼자 차지 (0.86)", size: 12 }, { t: "→ 단위가 다르면 표준화 먼저", size: 12, weight: 800 }] });

      k.section(40, 494, "④ 복원과 정보 손실");
      k.formula(56, 510, 584, 40, "X̂ = Z_k V_kᵀ × σ + μ   (z → 원래 단위로 되돌리기)", { size: 15 });
      k.lines(56, 576, [
        "1번 수검자: 10개 값 → z = (−2.606, −1.155, −0.811) 3개로 압축",
        { t: "전체 재구성 오차 1.2725 = 버린 고유값 합 λ₄ + … + λ₁₀", tone: "red", weight: 800 },
        "잃은 분산 12.7% = 1.2725 / 10.05 (k = 10이면 오차 0, 완전 복원)",
        { t: "inverse_transform(Z)  ·  재구성 오차가 큰 사람 = 이상값 후보", color: "muted" }
      ], { size: 12.5, lh: 22 });

      k.section(670, 494, "⑤ PCA의 한계와 대안");
      k.note(670, 510, 570, 56, { tone: "red", title: "휘어진 구조는 직선 축으로 못 편다", body: "동심원·스위스롤 → 커널 PCA(kernel=\"rbf\") · t-SNE · UMAP (시각화용)", size: 13.5, bodySize: 12 });
      k.note(670, 574, 570, 56, { tone: "orange", title: "분산이 크다고 분류에 유용하지 않다", body: "집단이 분산이 작은 방향으로 갈라지면 PC1만 남길 때 겹침 → LDA(라벨 사용)", size: 13.5, bodySize: 12 });
      k.note(670, 638, 570, 56, { tone: "purple", title: "성분 해석이 어렵다", body: "변수 10개의 가중합 · 부호는 임의(−v도 정답) · 로딩으로 의미를 붙여 읽기", size: 13.5, bodySize: 12 });
    }
  });
})();
