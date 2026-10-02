/* 선형회귀 — 알고리즘 구성도 (최소제곱법 · 경사하강법 · 다중 회귀)
   예제 숫자 = 시뮬레이터 기본 화면(선형 프리셋, seed 7, 30명) */
(function () {
  var AX = [31, 58, 66, 74, 68, 60, 66, 46, 50, 58, 46, 42, 60, 34, 60, 33, 70, 62, 56, 35, 64, 56, 41, 45, 69, 64, 51, 56, 52, 58];
  var AY = [97.9, 151.7, 137.4, 151.2, 143.8, 131.2, 146.7, 140.1, 122.7, 153.7, 130.0, 120.5, 148.3, 109.4, 136.1, 126.8, 151.2, 154.4, 143.0, 114.9, 146.4, 146.5, 132.3, 122.1, 157.0, 134.7, 140.7, 136.4, 127.2, 133.1];
  var B0 = 83.027113, B1 = 0.9789;

  /* ① 산점도 + 직선 + 잔차 제곱 (작은 그림) */
  function scatter(k, x0, y0, w, h) {
    var xmin = 28, xmax = 78, ymin = 90, ymax = 165;
    var px = function (v) { return x0 + (v - xmin) / (xmax - xmin) * w; };
    var py = function (v) { return y0 + h - (v - ymin) / (ymax - ymin) * h; };
    k.axes(x0, y0, w, h, { y: "수축기 혈압 y (mmHg)" });
    k.text(x0 + w, y0 + h + 34, "나이 x (세)", { size: 12, anchor: "end", color: "muted" });
    [40, 50, 60, 70].forEach(function (t) { k.text(px(t), y0 + h + 16, String(t), { size: 11.5, anchor: "middle", color: "muted" }); });
    [100, 120, 140, 160].forEach(function (t) { k.text(x0 - 6, py(t) + 4, String(t), { size: 11.5, anchor: "end", color: "muted" }); });
    /* 잔차 제곱 (잔차가 큰 세 점) */
    [0, 7, 9].forEach(function (i) {
      var yh = B0 + B1 * AX[i], side = Math.abs(py(AY[i]) - py(yh));
      var top = Math.min(py(AY[i]), py(yh));
      k.rect(px(AX[i]), top, side, side, { tone: "orange", fill: "tone", opacity: 0.85 });
      k.path("M" + px(AX[i]) + " " + py(AY[i]) + " V" + py(yh), { tone: "orange", width: 1.6 });
    });
    k.path("M" + px(xmin) + " " + py(110 + 0.35 * xmin) + " L" + px(xmax) + " " + py(110 + 0.35 * xmax), { tone: "gray", width: 2, dash: "6 5" });
    k.path("M" + px(xmin) + " " + py(B0 + B1 * xmin) + " L" + px(xmax) + " " + py(B0 + B1 * xmax), { tone: "blue", width: 2.6 });
    AX.forEach(function (v, i) { k.circle(px(v), py(AY[i]), 4, { tone: "blue", fill: "solid" }); });
  }

  DSDiagram.register({
    id: "linear-regression-1", sim: "linear-regression", order: 1,
    title: "선형회귀 (1) — 최소제곱법: 잔차 제곱합이 가장 작은 직선", short: "최소제곱법(OLS)",
    sub: "Ordinary Least Squares · 나이 x로 수축기 혈압 y를 예측하는 직선 ŷ = b0 + b1·x 를 잔차 제곱합(SSE) 최소 조건으로 한 번에 계산 (환자 30명)",
    label: "Machine Learning",
    draw: function (k) {
      /* ① 데이터와 잔차 */
      k.section(40, 152, "① 데이터 · 직선 · 잔차");
      k.panel(40, 168, 400, 316, { tone: "blue", tinted: true });
      scatter(k, 100, 200, 318, 190);
      k.lines(60, 440, [
        { t: "**파랑 실선** 최소제곱 직선  ŷ = 83.03 + 0.979·x", tone: "blue", color: "tone" },
        { t: "**회색 점선** 처음 직선  ŷ = 110 + 0.35·x", color: "muted" },
        { t: "**주황 사각형** 잔차² (한 변 = 잔차 e)", tone: "orange", color: "tone" }
      ], { size: 12.5, lh: 18 });

      /* ② 단순회귀 공식 */
      k.section(460, 152, "② 단순회귀 공식 — 숫자로");
      k.panel(460, 168, 380, 316, { tone: "blue", head: "solid", title: "b1 = Sxy / Sxx,  b0 = ȳ − b1·x̄", right: "n = 30" });
      k.lines(478, 230, [
        "x̄ = Σx / n = 1,631 / 30 = **54.367**",
        "ȳ = Σy / n = 4,087.4 / 30 = **136.247**",
        "Sxy = Σ(x − x̄)(y − ȳ) = 3,988.99",
        "Sxx = Σ(x − x̄)² = 4,074.97"
      ], { size: 14, lh: 26 });
      k.formula(476, 336, 348, 40, "b1 = 3,988.99 / 4,074.97 = **0.9789**", { size: 15 });
      k.formula(476, 384, 348, 40, "b0 = 136.247 − 0.9789 × 54.367 = **83.027**", { size: 15 });
      k.text(650, 456, "나이 1세 ↑ → 혈압 약 0.98 mmHg ↑", { size: 13.5, weight: 800, anchor: "middle", tone: "blue" });

      /* ③ 정규방정식 */
      k.section(860, 152, "③ 정규방정식  β = (XᵀX)⁻¹Xᵀy");
      k.panel(860, 168, 380, 316, { tone: "purple", tinted: true });
      k.text(878, 196, "X = [1, x]  (30 × 2)", { size: 13, weight: 700, color: "muted" });
      k.matrix(936, 226, [["30", "1,631"], ["1,631", "92,747"]], { cw: 74, ch: 30, size: 13.5, tone: "purple", fill: "tone", title: "XᵀX", titleTone: "purple" });
      k.matrix(1132, 226, [["4,087.4"], ["226,207.3"]], { cw: 90, ch: 30, size: 13.5, tone: "blue", fill: "tone", title: "Xᵀy", titleTone: "blue" });
      k.text(1102, 270, "·", { size: 22, weight: 800, anchor: "middle", color: "muted" });
      k.text(878, 316, "det(XᵀX) = 30 × 92,747 − 1,631² = 122,249", { size: 12.5, color: "muted" });
      k.matrix(936, 354, [["0.7587", "−0.01334"], ["−0.01334", "0.000245"]], { cw: 80, ch: 30, size: 13, tone: "purple", fill: "mid", title: "(XᵀX)⁻¹", titleTone: "purple" });
      k.text(1112, 375, "→", { size: 20, weight: 800, anchor: "middle", color: "muted" });
      k.matrix(1140, 354, [["83.027"], ["0.9789"]], { cw: 80, ch: 30, size: 14, tone: "green", fill: "tone", title: "β = [b0, b1]", titleTone: "green" });
      k.text(1050, 454, "공식 ②와 같은 해 = 2 × 2 정규방정식을 손으로 푼 것", { size: 12.5, weight: 700, anchor: "middle", tone: "purple" });

      /* ④ 평가 */
      k.section(40, 518, "④ 얼마나 잘 맞나 — 같은 데이터, 두 직선");
      k.table(56, 532, [150, 150, 150], [
        ["지표", "처음 직선", "최소제곱 직선"],
        ["SSE = Σe²", "5,164.3", { t: "1,989.5", tone: "blue", weight: 800 }],
        ["MSE = SSE / n", "172.14", { t: "66.32", tone: "blue", weight: 800 }],
        ["RMSE = √MSE", "13.12", { t: "8.14 mmHg", tone: "blue", weight: 800 }],
        ["R²", "0.124", { t: "0.662", tone: "blue", weight: 800 }]
      ], { rh: 22, size: 12.5 });
      k.formula(530, 532, 330, 54, "SST = Σ(y − ȳ)² = 5,894.29\nR² = 1 − 1,989.47 / 5,894.29 = **0.6625**", { size: 13.5 });
      k.note(530, 594, 330, 48, { tone: "red", title: "제곱의 함정 — 이상값에 끌려감", body: "가장 큰 e² 한 개가 SSE의 12.0% (평균 몫 1/30 = 3.3%)", size: 13, bodySize: 12 });
      k.note(880, 532, 360, 52, { tone: "teal", title: "SSE를 b0, b1로 미분해 0으로 놓기", body: "∂SSE/∂b0 = 0, ∂SSE/∂b1 = 0 → XᵀXβ = Xᵀy", size: 13, bodySize: 12 });
      k.note(880, 590, 360, 52, { tone: "green", title: "새 환자 예측 (활용)", body: "나이 60세 → ŷ = 83.03 + 0.979 × 60 = 141.8 mmHg", size: 13, bodySize: 12 });

      k.flow(40, 656, [
        { t: "데이터 (x, y)", tone: "blue" }, { t: "직선 ŷ = b0 + b1x", tone: "gray" }, { t: "잔차 e = y − ŷ", tone: "orange" },
        { t: "SSE = Σe² 최소", tone: "orange" }, { t: "정규방정식 풀기", tone: "purple" }, { t: "R² · RMSE 평가", tone: "teal" }, { t: "predict", tone: "green" }
      ], { h: 36, gap: 20, size: 13 });
    }
  });

  DSDiagram.register({
    id: "linear-regression-2", sim: "linear-regression", order: 2,
    title: "선형회귀 (2) — 경사하강법: 손실 곡면을 따라 내려가기", short: "경사하강법(GD)",
    sub: "Gradient Descent · 손실 L = MSE의 기울기 반대 방향으로 조금씩 반복 갱신 → 최소제곱법과 같은 답 (같은 30명, 나이는 표준화)",
    label: "Machine Learning",
    draw: function (k) {
      /* ① 반복 루프 */
      k.section(40, 152, "① 한 스텝의 구성 — 예측 → 오차 → 기울기 → 갱신을 반복");
      var bx = [
        { t: "초기값", s: "w0 = 0, w1 = 0", tone: "gray" },
        { t: "예측", s: "ŷ = w0 + w1·z", tone: "blue" },
        { t: "오차", s: "e = ŷ − y", tone: "orange" },
        { t: "기울기", s: "∂L/∂w0, ∂L/∂w1", tone: "red" },
        { t: "갱신", s: "w ← w − η·∇L", tone: "purple" }
      ];
      var bs = [];
      bx.forEach(function (b, i) {
        bs.push(k.box(40 + i * 172, 170, 150, 58, { tone: b.tone, title: b.t, sub: b.s, size: 15, subSize: 12.5 }));
        if (i) k.link(bs[i - 1].r, bs[i].l, { tone: "gray" });
      });
      k.arrow(bs[4].cx, 228, bs[1].cx, 228, { via: [[bs[4].cx, 250], [bs[1].cx, 250]], tone: "purple", dash: true });
      k.text((bs[1].cx + bs[4].cx) / 2, 266, "멈춤 조건(최대 반복 · OLS 해와의 거리)까지 반복", { size: 12.5, weight: 700, anchor: "middle", tone: "purple" });
      k.formula(906, 166, 334, 96, "L = (1/n) Σ (ŷᵢ − yᵢ)²\n∂L/∂w0 = (2/n) Σ eᵢ\n∂L/∂w1 = (2/n) Σ eᵢ·zᵢ", { size: 14.5, align: "left" });

      /* ② 첫 스텝 숫자 */
      k.section(40, 306, "② 첫 스텝을 숫자로 (η = 0.1, 배치 GD)");
      k.panel(40, 322, 600, 378, { tone: "blue", tinted: true });
      k.lines(58, 350, [
        "표준화  z = (x − 54.367) / 11.655",
        "시작 (w0, w1) = (0, 0) → 모든 ŷ = 0, MSE = 18,759.6"
      ], { size: 13.5, lh: 23 });
      k.box(56, 392, 278, 74, { tone: "red", fill: "plain", align: "left", valign: "top", title: "기울기 (전체 30명)", size: 13.5, titleColor: "ink",
        lines: [{ t: "∂L/∂w0 = (2/30) × (−4,087.4) = −272.49", size: 12.5 }, { t: "∂L/∂w1 = (2/30) × (−342.26) = −22.82", size: 12.5 }] });
      k.box(346, 392, 278, 74, { tone: "purple", fill: "plain", align: "left", valign: "top", title: "갱신 w ← w − η·기울기", size: 13.5, titleColor: "ink",
        lines: [{ t: "w0 = 0 − 0.1 × (−272.49) = 27.25", size: 12.5 }, { t: "w1 = 0 − 0.1 × (−22.82) = 2.282", size: 12.5 }] });
      k.table(56, 478, [110, 120, 120, 214], [
        ["반복 t", "w0", "w1", "MSE (전체)"],
        ["0", "0", "0", "18,759.6"],
        ["1", "27.25", "2.282", "12,030.0"],
        ["2", "49.05", "4.107", "7,723.1"],
        ["3", "66.49", "5.567", "4,966.7"],
        [{ t: "51 (멈춤)", tone: "green" }, { t: "136.25", tone: "green", weight: 800 }, { t: "11.409", tone: "green", weight: 800 }, { t: "66.32 = OLS 최소 MSE", tone: "green", weight: 800 }]
      ], { rh: 22, size: 12.5 });
      k.formula(56, 616, 568, 70, "원래 단위로:  b1 = w1 / s = 11.409 / 11.655 = **0.9789**\nb0 = w0 − b1·x̄ = 136.247 − 0.9789 × 54.367 = **83.027**  (OLS와 같음)", { size: 13, align: "left" });

      /* ③ 등고선 */
      k.section(660, 306, "③ 스케일링 — 등고선 모양이 수렴 속도를 정한다");
      k.panel(660, 322, 580, 196, { tone: "gray" });
      function contour(cx, cy, rx, ry, rot, tn) {
        [1, 0.72, 0.46, 0.22].forEach(function (f) {
          k.raw('<g class="dg-t-' + tn + '"><ellipse class="dg-stroke" cx="' + cx + '" cy="' + cy + '" rx="' + (rx * f) + '" ry="' + (ry * f) + '" transform="rotate(' + rot + " " + cx + " " + cy + ')" style="fill:none"/></g>');
        });
        k.circle(cx, cy, 4.5, { tone: "green", fill: "solid" });
      }
      contour(790, 410, 74, 70, 0, "blue");
      k.arrow(728, 352, 745, 368, { tone: "purple", width: 2 }); k.arrow(745, 368, 786, 406, { tone: "purple", width: 2 });
      k.circle(728, 352, 4, { tone: "purple", fill: "solid" });
      k.text(790, 508, "스케일링 켬 · κ = 1.00 · 51번", { size: 12.5, weight: 800, anchor: "middle", tone: "blue" });
      contour(1080, 410, 136, 18, -32, "red");
      k.path("M965 352 L1000 392 L1010 360 L1036 396 L1044 372 L1062 402 L1068 390", { tone: "purple", width: 2 });
      k.circle(965, 352, 4, { tone: "purple", fill: "solid" });
      k.text(1080, 508, "스케일링 끔 · κ = 70,408 · 지그재그", { size: 12.5, weight: 800, anchor: "middle", tone: "red" });

      /* ④ 학습률 · 배치 */
      k.section(660, 548, "④ 학습률 η와 배치 크기");
      k.box(660, 562, 186, 62, { tone: "amber", title: "너무 작음 η = 0.01", sub: "200번 후에도 MSE 72.10", size: 13, subSize: 12 });
      k.box(857, 562, 186, 62, { tone: "green", title: "적당 η = 0.1", sub: "51번 만에 OLS 해 도착", size: 13, subSize: 12 });
      k.box(1054, 562, 186, 62, { tone: "red", title: "발산 η = 1.05", sub: "경계 2/λmax = 1.00 초과", size: 13, subSize: 12 });
      k.table(660, 634, [160, 180, 240], [
        ["한 스텝에 쓰는 데이터", "배치 GD 30명 전부", "미니배치 m명 · SGD 1명"],
        ["경로", "매끄럽게 내려감", "빠르지만 해 주변에서 흔들림"]
      ], { rh: 22, size: 12 });
    }
  });

  DSDiagram.register({
    id: "linear-regression-3", sim: "linear-regression", order: 3,
    title: "선형회귀 (3) — 두 방법 비교와 다중 회귀", short: "비교 · 다중 회귀",
    sub: "정규방정식(닫힌 해)과 경사하강법(반복 해)의 선택 기준, 특성이 둘이면 직선 대신 평면 ŷ = b0 + b1·나이 + b2·BMI",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 최소제곱법(정규방정식) vs 경사하강법");
      k.table(56, 168, [150, 300, 330], [
        ["항목", "최소제곱법 (정규방정식)", "경사하강법"],
        ["계산 방식", "미분 = 0을 한 번에 풀기 β = (XᵀX)⁻¹Xᵀy", "β ← β − η∇L 을 조금씩 반복"],
        ["계산량", "O(np² + p³)", "O(k·n·p)  (k = 반복 수)"],
        ["하이퍼파라미터", "없음", "학습률 η, 반복 수, 배치 크기"],
        ["특성 스케일링", "필요 없음 (같은 직선)", "사실상 필수 (조건수 ↓ → 빨리 수렴)"],
        ["답", "정확한 해", "근사 해 (멈춘 시점까지)"],
        ["잘 맞는 상황", "특성 수가 적당할 때", "데이터가 아주 크거나 계속 들어올 때"],
        ["scikit-learn", { t: "LinearRegression", mono: true }, { t: "SGDRegressor", mono: true }]
      ], { rh: 27, size: 12.5 });
      k.note(860, 168, 380, 62, { tone: "purple", title: "규모 예시  n = 10,000 · p = 10 · k = 100", body: "OLS ≈ np² + p³ = 1.0×10⁶,  GD ≈ k·n·p = 1.0×10⁷ → 특성이 적으면 한 번에 푸는 편이 빠름", size: 13, bodySize: 12 });
      k.note(860, 240, 380, 62, { tone: "red", title: "XᵀX가 특이(역행렬 없음)할 때", body: "특성끼리 완전히 겹치면 역행렬 불가 → 유사역행렬(lstsq · SVD)이나 릿지", size: 13, bodySize: 12 });
      k.note(860, 312, 380, 62, { tone: "teal", title: "같은 30명에서 두 방법의 답", body: "OLS (83.027, 0.9789) · GD 51번 반복 후 (83.026, 0.9789)", size: 13, bodySize: 12 });

      k.section(40, 418, "② 다중 회귀 — 특성 2개면 평면");
      k.panel(40, 434, 700, 266, { tone: "blue", head: "solid", title: "가상 환자 60명 · 나이–BMI 상관 r = 0.70", right: "참값 b(나이) 0.55 · b(BMI) 1.60" });
      k.table(56, 480, [190, 90, 110, 110, 80], [
        ["모형", "b0", "b(나이)", "b(BMI)", "R²"],
        ["단순: 나이만", "83.68", { t: "0.859", tone: "red", weight: 800 }, "—", "0.649"],
        ["단순: BMI만", "57.83", "—", { t: "2.823", tone: "red", weight: 800 }, "0.624"],
        [{ t: "다중: 나이 + BMI", tone: "blue" }, "61.17", { t: "0.529", tone: "blue", weight: 800 }, { t: "1.589", tone: "blue", weight: 800 }, { t: "0.751", weight: 800 }]
      ], { rh: 26, size: 12.5 });
      k.bullets(56, 604, 670, [
        { t: "나이만 넣으면 BMI의 효과까지 떠안아 기울기가 0.859로 부풀려짐 (상관된 변수가 빠진 탓)", tone: "red" },
        { t: "함께 넣으면 0.529 = BMI를 고정했을 때 나이 1세당 효과 → 참값 0.55에 가까움", tone: "blue" },
        { t: "R²는 0.649 → 0.751로 상승 · 계수 해석은 '다른 특성을 고정했을 때'", tone: "green" }
      ], { size: 12.5, lh: 22 });

      k.section(760, 418, "③ 정규방정식 3 × 3");
      k.matrix(790, 460, [["60", "3,113", "1,497.3"], ["3,113", "172,547", "79,978.3"], ["1,497.3", "79,978.3", "38,348.6"]], { cw: 82, ch: 28, size: 12.5, tone: "purple", fill: "tone", title: "XᵀX", titleTone: "purple" });
      k.matrix(1060, 460, [["7,695.9"], ["408,770.5"], ["194,827.1"]], { cw: 84, ch: 28, size: 12.5, tone: "blue", fill: "tone", title: "Xᵀy", titleTone: "blue" });
      k.matrix(1160, 460, [["61.17"], ["0.529"], ["1.589"]], { cw: 66, ch: 28, size: 13, tone: "green", fill: "tone", title: "β", titleTone: "green" });
      k.text(1152, 506, "→", { size: 15, weight: 800, anchor: "middle", color: "muted" });
      k.code(760, 566, 480, 134, [
        "from sklearn.linear_model import LinearRegression",
        "X = df[[\"나이\", \"BMI\"]]; y = df[\"수축기혈압\"]",
        "m = LinearRegression().fit(X, y)    # 정규방정식 계열",
        "m.intercept_, m.coef_   # 61.17, [0.529, 1.589]",
        "m.predict(X_new)        # 새 환자의 혈압 예측"
      ], { size: 12.5 });
    }
  });
})();
