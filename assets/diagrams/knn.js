/* KNN — 알고리즘 구성도 (다수결 분류 · k와 스케일링 · 회귀와 계산 비용)
   예제 숫자 = 시뮬레이터 기본 화면 (seed 1 · 80명, 새 환자 혈당 131 · BMI 25.5, k = 5) */
(function () {
  var D = [[80, 25.2], [120, 26.0], [140, 28.1], [182, 30.8], [114, 25.7], [120, 24.8], [110, 31.0], [119, 33.6], [103, 19.4], [129, 24.9], [95, 23.2], [102, 26.2],
    [104, 22.1], [155, 24.7], [104, 31.1], [133, 23.7], [89, 20.0], [108, 16.9], [95, 24.3], [66, 21.0], [129, 29.8], [91, 19.6], [95, 27.4], [174, 28.4],
    [147, 38.8], [83, 20.8], [175, 33.8], [156, 25.8], [113, 25.0], [91, 22.6], [83, 16.8], [117, 24.9], [125, 26.0], [94, 20.9], [89, 19.9], [168, 33.8],
    [108, 23.7], [100, 25.6], [143, 28.4], [161, 34.8], [90, 23.9], [110, 26.3], [76, 20.6], [104, 24.6], [136, 22.3], [121, 26.7], [131, 28.8], [148, 26.8],
    [66, 20.6], [102, 27.2], [127, 30.0], [156, 33.5], [149, 27.2], [132, 28.7], [92, 26.8], [98, 22.0], [100, 21.7], [160, 25.9], [88, 18.4], [100, 24.0],
    [82, 23.7], [97, 21.8], [96, 23.4], [93, 23.6], [143, 30.3], [116, 27.5], [124, 29.5], [99, 26.6], [112, 23.5], [119, 26.9], [142, 31.3], [119, 23.6],
    [123, 27.1], [159, 32.0], [88, 23.1], [124, 26.5], [152, 23.3], [157, 37.2], [73, 26.0], [114, 34.4]];
  var Y = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0,
    1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1];
  var MU = [116.6, 25.96], SD = [27.2606, 4.4881], Q = [(131 - MU[0]) / SD[0], (25.5 - MU[1]) / SD[1]];

  DSDiagram.register({
    id: "knn-1", sim: "knn", order: 1,
    title: "KNN (1) — 가까운 이웃의 다수결", short: "가까운 이웃의 다수결",
    sub: "K-Nearest Neighbors · 새 환자(공복혈당 131, BMI 25.5)와 저장된 80명의 거리를 재서, 가장 가까운 k = 5명의 투표로 정상/당뇨를 정한다",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 예측 한 번의 과정 — 학습(fit)은 저장뿐, 계산은 예측 때");
      k.flow(40, 168, [
        { t: "표준화", s: "z = (x − 평균) / 표준편차", tone: "blue" },
        { t: "거리 계산", s: "80명 모두와 d(새 환자, xᵢ)", tone: "blue" },
        { t: "가까운 순 정렬", s: "거리 오름차순", tone: "purple" },
        { t: "k = 5명 투표", s: "uniform: 1표씩", tone: "orange" },
        { t: "예측 · 확률", s: "당뇨 · [0.4, 0.6]", tone: "green" }
      ], { h: 52, gap: 26, size: 14 });

      /* ② 그림 */
      k.section(40, 262, "② 표준화 공간에서 본 이웃 (확대)");
      k.panel(40, 278, 330, 330, { tone: "gray" });
      var cx0 = 60, cy0 = 296, S = 220, zx0 = -0.12, zy1 = 0.6;
      var px = function (z) { return cx0 + (z - zx0) * S; }, py = function (z) { return cy0 + (zy1 - z) * S; };
      var r5 = 0.4186;
      k.raw('<g class="dg-t-purple"><circle class="dg-stroke" cx="' + px(Q[0]).toFixed(1) + '" cy="' + py(Q[1]).toFixed(1) + '" r="' + (r5 * S).toFixed(1) + '" style="fill:none;stroke-dasharray:6 5"/></g>');
      D.forEach(function (p, i) {
        var z1 = (p[0] - MU[0]) / SD[0], z2 = (p[1] - MU[1]) / SD[1];
        var X = px(z1), Yp = py(z2);
        if (X < 50 || X > 360 || Yp < 288 || Yp > 572) return;
        k.circle(X, Yp, 5, { tone: Y[i] ? "orange" : "blue", fill: "solid" });
        if ([9, 32, 75, 15, 1].indexOf(i) >= 0) k.raw('<g class="dg-t-purple"><circle class="dg-stroke" cx="' + X.toFixed(1) + '" cy="' + Yp.toFixed(1) + '" r="9" style="fill:none;stroke-width:2"/></g>');
      });
      var sx = px(Q[0]), sy = py(Q[1]), st = "";
      for (var a = 0; a < 10; a++) { var rr = a % 2 ? 4.5 : 11, an = -Math.PI / 2 + a * Math.PI / 5; st += (a ? "L" : "M") + (sx + rr * Math.cos(an)).toFixed(1) + " " + (sy + rr * Math.sin(an)).toFixed(1); }
      k.path(st + "Z", { tone: "ink", fill: "solid" });
      k.text(sx + 92, sy + 104, "5번째 이웃까지 반경 0.419", { size: 12, weight: 700, anchor: "middle", tone: "purple" });
      k.text(56, 590, "● 정상", { size: 12, weight: 700, tone: "blue" });
      k.text(116, 590, "● 당뇨", { size: 12, weight: 700, tone: "orange" });
      k.text(176, 590, "★ 새 환자   ◯ 투표하는 5명", { size: 12, weight: 700, color: "muted" });

      /* ③ 계산 */
      k.section(390, 262, "③ 거리 계산과 순위 (유클리드)");
      k.formula(390, 278, 420, 58, "z₁ = (131 − 116.60) / 27.26 = **0.528**\nz₂ = (25.5 − 25.96) / 4.49 = **−0.102**", { size: 13.5 });
      k.formula(390, 344, 420, 40, "#9: d = √(0.073² + 0.134²) = **0.152**", { size: 13.5 });
      var rows = [["순위", "인덱스", "클래스", "혈당", "BMI", "거리 d"]];
      [[1, "#9", 0, 129, 24.9, "0.152"], [2, "#32", 1, 125, 26.0, "0.247"], [3, "#75", 1, 124, 26.5, "0.340"], [4, "#15", 1, 133, 23.7, "0.408"],
       [5, "#1", 0, 120, 26.0, "0.419"], [6, "#5", 0, 120, 24.8, "0.433"], [7, "#45", 1, 121, 26.7, "0.454"]].forEach(function (r) {
        var cls = r[2] ? { t: "당뇨", tone: "orange", weight: 800 } : { t: "정상", tone: "blue", weight: 800 };
        rows.push([r[0] <= 5 ? String(r[0]) : { t: String(r[0]), color: "muted" }, r[1], cls, String(r[3]), r[4].toFixed(1), r[0] <= 5 ? { t: r[5], weight: 800 } : { t: r[5], color: "muted" }]);
      });
      k.table(398, 394, [56, 74, 70, 64, 64, 80], rows, { rh: 25, size: 12.5 });
      k.path("M398 594 H806", { tone: "purple", width: 2, dash: "6 4" });
      k.text(806, 609, "↑ k = 5명만 투표", { size: 12, weight: 800, anchor: "end", tone: "purple" });

      /* ④ 투표 */
      k.section(830, 262, "④ 투표 → 예측");
      k.box(830, 278, 410, 104, { tone: "orange", align: "left", valign: "top", title: "uniform (1표씩) → 당뇨", size: 15,
        lines: [{ t: "정상 2표 (#9, #1) → 2/5 = 0.400" }, { t: "당뇨 3표 (#32, #75, #15) → 3/5 = 0.600" }, { t: "predict_proba = [0.400, 0.600]", tone: "orange", weight: 800 }] });
      k.box(830, 392, 410, 104, { tone: "purple", fill: "plain", align: "left", valign: "top", title: "distance (1/d 가중) → 당뇨", titleColor: "ink", size: 15,
        lines: [{ t: "정상 1/0.152 + 1/0.419 = 6.558 + 2.389 = 8.947" }, { t: "당뇨 4.054 + 2.941 + 2.453 = 9.448" }, { t: "확률 8.947/18.395 : 9.448/18.395 = 0.486 : 0.514", tone: "purple", weight: 700 }] });
      k.table(830, 508, [110, 150, 150], [
        ["거리", "같은 거리 모양", "5명 투표 (정상:당뇨)"],
        ["유클리드 p=2", "원  √(Δ₁² + Δ₂²)", "2 : 3 → 당뇨"],
        ["맨해튼 p=1", "마름모  |Δ₁| + |Δ₂|", "2 : 3 → 당뇨"],
        ["체비쇼프 p=∞", "정사각형  max|Δ|", "1 : 4 → 당뇨"]
      ], { rh: 24, size: 12 });

      k.note(40, 626, 590, 60, { tone: "blue", title: "k는 홀수로 — 2클래스 다수결에서 동점 방지", body: "거리가 같으면 인덱스가 작은 점이 먼저 · 두 특성은 반드시 같은 눈금(표준화)으로 맞춘 뒤 거리를 잼", size: 13, bodySize: 12 });
      k.note(650, 626, 590, 60, { tone: "red", title: "민코프스키 거리  d = (|Δ₁|ᵖ + |Δ₂|ᵖ)^(1/p)", body: "p = 1 맨해튼 · p = 2 유클리드 · p → ∞ 체비쇼프 — 척도가 바뀌면 이웃도 바뀔 수 있음", size: 13, bodySize: 12 });
    }
  });

  DSDiagram.register({
    id: "knn-2", sim: "knn", order: 2,
    title: "KNN (2) — k 고르기와 스케일링", short: "k 선택 · 스케일링",
    sub: "k는 모델의 복잡도 손잡이 — 교차검증으로 고르고, 단위가 큰 특성이 거리를 독차지하지 않도록 반드시 스케일링한다",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① k에 따른 학습 · 검증 정확도 (80명, 5겹 교차검증)");
      k.panel(40, 168, 600, 290, { tone: "gray" });
      var x0 = 100, y0 = 196, w = 330, h = 200, K = function (v) { return x0 + (v - 1) / 29 * w; }, A = function (v) { return y0 + h - (v - 85) / 16 * h; };
      k.axes(x0, y0, w, h);
      [86, 90, 95, 100].forEach(function (t) { k.text(x0 - 6, A(t) + 4, t + "%", { size: 11.5, anchor: "end", color: "muted" }); k.path("M" + x0 + " " + A(t) + " H" + (x0 + w), { tone: "gray", width: 0.8, dash: "2 4" }); });
      [1, 5, 7, 15, 30].forEach(function (t) { k.text(K(t), y0 + h + 16, String(t), { size: 11.5, anchor: "middle", color: "muted" }); });
      k.text(x0 + w, y0 + h + 34, "이웃 수 k", { size: 12, anchor: "end", color: "muted" });
      var tr = [[1, 100], [5, 93.8], [7, 95.0], [15, 92.5], [30, 91.3]], va = [[1, 91.3], [5, 93.8], [7, 90.0], [15, 96.3], [30, 91.3]];
      k.path(tr.map(function (p, i) { return (i ? "L" : "M") + K(p[0]).toFixed(1) + " " + A(p[1]).toFixed(1); }).join(" "), { tone: "blue", width: 2.6 });
      k.path(va.map(function (p, i) { return (i ? "L" : "M") + K(p[0]).toFixed(1) + " " + A(p[1]).toFixed(1); }).join(" "), { tone: "orange", width: 2.6 });
      tr.forEach(function (p) { k.circle(K(p[0]), A(p[1]), 4, { tone: "blue", fill: "solid" }); });
      va.forEach(function (p) { k.circle(K(p[0]), A(p[1]), 4, { tone: "orange", fill: "solid" }); });
      k.circle(K(15), A(96.3), 9, { tone: "green", fill: "plain" });
      k.text(K(15), A(96.3) - 14, "최적 k = 15 · 96.3%", { size: 12, weight: 800, anchor: "middle", tone: "green" });
      k.text(K(1) + 6, y0 + 14, "← 과적합", { size: 12, weight: 800, tone: "red" });
      k.text(x0 + w - 4, y0 + 14, "과소적합 →", { size: 12, weight: 800, anchor: "end", tone: "purple" });
      k.lines(450, 214, [{ t: "━ 학습", tone: "blue", color: "tone", weight: 800 }, { t: "━ 검증", tone: "orange", color: "tone", weight: 800 }], { size: 12.5, lh: 20 });
      k.table(450, 262, [60, 60, 60], [["k", "학습", "검증"], ["1", "100.0", "91.3"], ["5", "93.8", "93.8"], ["7", "95.0", "90.0"], [{ t: "15", tone: "green" }, "92.5", { t: "96.3", tone: "green", weight: 800 }], ["30", "91.3", "91.3"]], { rh: 22, size: 12 });
      k.text(450, 412, "k = 7: 학습−검증 차이 5.0%p", { size: 12, weight: 700, color: "muted" });
      k.text(450, 432, "k = n(80)이면 늘 다수 클래스만", { size: 12, weight: 700, color: "muted" });

      k.section(660, 152, "② k 고르기 — 교차검증 + Pipeline");
      k.panel(660, 168, 580, 290, { tone: "purple", tinted: true });
      for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) {
        k.box(680 + c * 64, 186 + r * 30, 60, 26, { tone: r === c ? "teal" : "blue", fill: r === c ? "solid" : "tone", title: r === c ? "검증" : "학습", size: 11.5, r: 4 });
      }
      k.text(680, 352, "폴드마다: StandardScaler.fit(학습 부분만) → KNN → 검증 정확도", { size: 12, weight: 700, tone: "purple" });
      k.formula(680, 362, 540, 40, "검증 정확도(k) = (1/5) Σ 폴드별 정확도,  최적 k = argmax", { size: 13 });
      k.lines(1010, 200, [
        { t: "작은 k", weight: 800, tone: "red", color: "tone" },
        "점 하나하나에 맞춘 들쭉날쭉한 경계",
        "학습 100%, 분산 큼",
        { t: "큰 k", weight: 800, tone: "purple", color: "tone" },
        "넓은 동네 평균 → 매끄러운 경계",
        "세부를 놓침, 편향 큼"
      ], { size: 12, lh: 22 });
      k.note(680, 410, 540, 40, { tone: "red", title: "스케일러를 전체 데이터에 먼저 fit하면 검증 정보가 새어 들어감 (누수)", size: 12.5 });

      k.section(40, 490, "③ 스케일링이 필요한 이유 — 연봉(만원)과 BMI로 고혈압 분류");
      k.panel(40, 506, 1200, 194, { tone: "blue", tinted: true });
      k.formula(56, 522, 540, 60, "스케일링 없이 1위 이웃까지  d = √((−29)² + 5.6²)\n= √(841.0 + 31.36) = **29.54**  ← 연봉 차이가 거의 전부", { size: 13.5 });
      k.lines(56, 604, [
        "표준편차: 연봉 1,413.0만원 vs BMI 4.40 → 분산 비 약 10만 : 1",
        "StandardScaler  z = (x − 평균) / 표준편차",
        "MinMaxScaler  x′ = (x − 최솟값) / (최댓값 − 최솟값)"
      ], { size: 12.5, lh: 22 });
      var bx = 620, by = 530, bw = 230;
      k.text(bx, by, "거리²에서 차지하는 몫 (모든 점 쌍)", { size: 12.5, weight: 800, color: "ink" });
      [["스케일링 없음", 100, 0], ["StandardScaler", 50, 50], ["MinMaxScaler", 53.2, 46.8]].forEach(function (r, i) {
        var yy = by + 14 + i * 30;
        k.text(bx, yy + 15, r[0], { size: 12, color: "muted" });
        k.rect(bx + 110, yy, bw * r[1] / 100, 20, { tone: "orange", fill: "solid", r: 3 });
        if (r[2]) k.rect(bx + 110 + bw * r[1] / 100, yy, bw * r[2] / 100, 20, { tone: "blue", fill: "solid", r: 3 });
        k.text(bx + 116, yy + 15, r[1].toFixed(1) + "%", { size: 11.5, weight: 800, color: "on" });
        if (r[2]) k.text(bx + 110 + bw - 6, yy + 15, r[2].toFixed(1) + "%", { size: 11.5, weight: 800, anchor: "end", color: "on" });
      });
      k.text(bx, by + 116, "주황 = 연봉 차이²   파랑 = BMI 차이²", { size: 12, color: "muted" });
      k.table(990, 522, [130, 110], [
        ["스케일링", "검증 정확도 (k = 5)"],
        ["없음", { t: "53.8%", tone: "red", weight: 800 }],
        ["StandardScaler", { t: "83.8%", tone: "green", weight: 800 }],
        ["MinMaxScaler", { t: "82.5%", tone: "green", weight: 800 }]
      ], { rh: 26, size: 12.5 });
      k.text(1225, 660, "고혈압과 무관한 연봉으로 이웃을 고르면", { size: 12, weight: 700, anchor: "end", tone: "red" });
      k.text(1225, 680, "정확도 53.8% → 표준화 후 +30.0%p", { size: 12, weight: 800, anchor: "end", tone: "green" });
    }
  });

  DSDiagram.register({
    id: "knn-3", sim: "knn", order: 3,
    title: "KNN (3) — KNN 회귀 · 계산 비용 · 차원의 저주", short: "회귀 · 비용 · 차원",
    sub: "회귀는 이웃 값의 평균으로 예측(계단 모양) · 게으른 학습이라 예측 비용이 데이터 수에 비례 · 차원이 높으면 '가장 가까운'이 의미를 잃는다",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① KNN 회귀 — 나이 50세의 수축기 혈압 (학습 40명, k = 5)");
      k.panel(40, 168, 640, 310, { tone: "blue", tinted: true });
      k.table(56, 182, [70, 80, 80, 130, 110], [
        ["순위", "인덱스", "나이", "거리 |x − xᵢ|", "혈압 yᵢ"],
        ["1", "#24", "47.6", "2.4", "126"], ["2", "#21", "53.5", "3.5", "125"], ["3", "#18", "54.4", "4.4", "120"],
        ["4", "#39", "54.8", "4.8", "110"], ["5", "#12", "55.9", "5.9", "116"]
      ], { rh: 22, size: 12.5 });
      k.formula(56, 324, 608, 58, "uniform:  ŷ = (126 + 125 + 120 + 110 + 116) / 5 = 597 / 5 = **119.40 mmHg**\ndistance:  ŷ = Σ(yᵢ/dᵢ) / Σ(1/dᵢ) = **120.89 mmHg**  (가까운 47.6세의 126에 더 끌림)", { size: 13 });
      k.table(56, 392, [150, 110, 110, 230], [
        ["k", "학습 MSE", "검증 MSE", "모양"],
        ["1", "0.0", { t: "96.1", tone: "red", weight: 800 }, "점마다 계단 → 과적합"],
        ["5", "37.1", "56.3", "계단이 넓어짐"],
        [{ t: "7 (최적)", tone: "green" }, "—", { t: "51.1", tone: "green", weight: 800 }, "검증 MSE 최소"]
      ], { rh: 20, size: 12 });

      /* 계단 스케치 */
      k.section(700, 152, "② 예측선 = 계단 함수");
      k.panel(700, 168, 540, 310, { tone: "gray" });
      var x0 = 740, y0 = 190, w = 470, h = 240;
      k.axes(x0, y0, w, h, { x: "나이", y: "혈압" });
      var pts = [[22, 104], [27, 112], [31, 103], [36, 115], [40, 108], [44, 121], [47.6, 126], [53.5, 125], [54.4, 120], [54.8, 110], [55.9, 116], [60, 131], [64, 127], [68, 138], [72, 133], [77, 144]];
      var PX = function (v) { return x0 + (v - 18) / 64 * w; }, PY = function (v) { return y0 + h - (v - 95) / 55 * h; };
      var stp = [[18, 108.6], [33, 112.4], [42, 119.2], [49.8, 119.4], [57, 124.6], [62, 130.4], [70, 135], [82, 135]];
      var d = "";
      stp.forEach(function (s, i) { if (i < stp.length - 1) d += (i ? " L" : "M") + PX(s[0]).toFixed(1) + " " + PY(s[1]).toFixed(1) + " L" + PX(stp[i + 1][0]).toFixed(1) + " " + PY(s[1]).toFixed(1); });
      k.path(d, { tone: "purple", width: 2.6 });
      pts.forEach(function (p) { k.circle(PX(p[0]), PY(p[1]), 4.5, { tone: "blue", fill: "solid" }); });
      k.path("M" + PX(50) + " " + (y0 + h) + " V" + y0, { tone: "orange", width: 1.6, dash: "4 4" });
      k.circle(PX(50), PY(119.4), 6, { tone: "orange", fill: "solid" });
      k.text(PX(50) + 10, PY(119.4) + 24, "x = 50 → 119.4", { size: 12.5, weight: 800, tone: "orange" });
      k.text(x0 + 10, y0 + 14, "이웃 집합이 바뀌는 곳에서만 값이 바뀜 (그림은 개념도)", { size: 12, weight: 700, tone: "purple" });

      k.section(40, 510, "③ 게으른 학습 (lazy learning) — n = 10,000, d = 10, 새 환자 m = 100");
      k.table(56, 524, [170, 170, 260, 220], [
        ["모델", "학습 (fit)", "예측 m = 100명", "저장해 둘 것"],
        [{ t: "KNN (게으른)", tone: "orange" }, "데이터 저장뿐", { t: "100 × 10,000 × 10 = 1.0×10⁷", tone: "orange", weight: 800 }, "학습 데이터 100,000개 숫자"],
        [{ t: "로지스틱 (열심)", tone: "blue" }, "경사하강 · 뉴턴법", "100 × 10 = 1,000번 곱셈", "계수 11개"]
      ], { rh: 26, size: 12.5 });
      k.note(56, 616, 820, 70, { tone: "purple", title: "예측 비용 ∝ m × n × d → KNN / 로지스틱 = n = 10,000배", body: "데이터가 10배 늘면 예측도 10배 느려짐 · KD-tree · Ball tree는 멀리 있는 덩어리를 건너뛰어 저차원(대략 d ≤ 20)에서 빠름 (algorithm=\"auto\")", size: 13, bodySize: 12 });

      k.section(900, 510, "④ 차원의 저주");
      k.text(900, 532, "최근접 ÷ 최원 거리 (점 500개, 질의 20개 평균)", { size: 12, weight: 700, color: "muted" });
      k.bars(930, 546, 290, 116, [0.001, 0.019, 0.300, 0.708], { labels: ["d = 1", "d = 2", "d = 10", "d = 100"], tones: ["blue", "blue", "orange", "red"], max: 1, fmt: function (v) { return v.toFixed(3); }, gap: 22 });
      k.text(1225, 694, "1에 가까울수록 모두 비슷하게 멂 → 특성 선택 · PCA", { size: 12, weight: 700, anchor: "end", tone: "red" });
    }
  });
})();
