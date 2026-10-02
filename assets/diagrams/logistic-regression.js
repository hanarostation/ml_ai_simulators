/* 로지스틱 회귀 — 알고리즘 구성도 (시그모이드 · 로그손실 · 결정 경계와 ROC)
   예제 숫자 = 시뮬레이터 기본 화면 (1번: 40명, b0 = −4, b1 = 0.03 · 3번: 60명 · 4번: 300명) */
(function () {
  function sig(z) { return 1 / (1 + Math.exp(-z)); }

  DSDiagram.register({
    id: "logistic-regression-1", sim: "logistic-regression", order: 1,
    title: "로지스틱 회귀 (1) — 직선을 시그모이드로 눌러 확률로", short: "시그모이드와 로그 오즈",
    sub: "Logistic Regression · 공복혈당 x로 당뇨 여부(y = 0/1)를 예측 — 선형 결합 z를 시그모이드에 넣어 0~1 확률 p로 바꾼다 (환자 40명)",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 계산 순서 — 혈당 140인 환자 한 명 (b0 = −4, b1 = 0.03)");
      var a = k.box(40, 170, 170, 70, { tone: "blue", fill: "plain", title: "입력 x", sub: "공복혈당 140 mg/dL", size: 15, subSize: 12.5 });
      var b = k.box(246, 170, 230, 70, { tone: "blue", title: "선형 결합 (로그 오즈)", sub: "z = −4 + 0.03 × 140 = 0.200", size: 15, subSize: 12.5 });
      var c = k.box(512, 170, 236, 70, { tone: "purple", title: "시그모이드 σ(z)", sub: "p = 1 / (1 + e^−0.2) = 0.5498", size: 15, subSize: 12.5 });
      var d = k.box(784, 170, 200, 70, { tone: "orange", title: "임계값 t = 0.5", sub: "0.5498 ≥ 0.5", size: 15, subSize: 12.5 });
      var e = k.box(1020, 170, 220, 70, { tone: "green", fill: "solid", title: "예측 1 (당뇨)", sub: "predict_proba = 0.55", size: 15, subSize: 12.5 });
      k.link(a.r, b.l, { tone: "gray" }); k.link(b.r, c.l, { tone: "gray" }); k.link(c.r, d.l, { tone: "gray" }); k.link(d.r, e.l, { tone: "gray" });

      /* ② 그래프 */
      k.section(40, 286, "② 왜 직선이 아니라 S자인가");
      k.panel(40, 302, 470, 300, { tone: "gray" });
      var x0 = 96, y0 = 330, w = 390, h = 220, xm = 60, xM = 240, ym = -0.3, yM = 1.5;
      var px = function (v) { return x0 + (v - xm) / (xM - xm) * w; };
      var py = function (v) { return y0 + h - (v - ym) / (yM - ym) * h; };
      k.rect(x0, y0, w, py(1) - y0, { tone: "red", fill: "tone", opacity: 0.7 });
      k.rect(x0, py(0), w, y0 + h - py(0), { tone: "red", fill: "tone", opacity: 0.7 });
      k.axes(x0, y0, w, h);
      [0, 0.5, 1].forEach(function (t) {
        k.path("M" + x0 + " " + py(t) + " H" + (x0 + w), { tone: "gray", width: 1, dash: "3 4" });
        k.text(x0 - 6, py(t) + 4, String(t), { size: 11.5, anchor: "end", color: "muted" });
      });
      [80, 140, 200].forEach(function (t) { k.text(px(t), y0 + h + 16, String(t), { size: 11.5, anchor: "middle", color: "muted" }); });
      k.text(x0 + w, y0 + h + 32, "공복혈당 x", { size: 12, anchor: "end", color: "muted" });
      k.path("M" + px(60) + " " + py(-0.820 + 0.00961 * 60) + " L" + px(240) + " " + py(-0.820 + 0.00961 * 240), { tone: "red", width: 2.2, dash: "7 5" });
      var d1 = "";
      for (var v = 60; v <= 240; v += 4) d1 += (v === 60 ? "M" : " L") + px(v).toFixed(1) + " " + py(sig(-4 + 0.03 * v)).toFixed(1);
      k.path(d1, { tone: "purple", width: 3 });
      k.circle(px(140), py(0.5498), 5, { tone: "purple", fill: "solid" });
      k.circle(px(133.3), py(0.5), 4, { tone: "orange", fill: "solid" });
      k.text(px(64), py(1.3), "선형회귀 ŷ = 1.486 (x = 240)", { size: 12, weight: 700, tone: "red" });
      k.text(px(236), py(-0.2), "ŷ = −0.243 (x = 60)", { size: 12, weight: 700, anchor: "end", tone: "red" });
      k.text(px(236), py(0.64), "σ(z)는 늘 0~1", { size: 12.5, weight: 800, anchor: "end", tone: "purple" });
      k.text(px(136), py(0.38), "p = 0.5 ↔ x = 133.3", { size: 12, weight: 700, tone: "orange" });
      k.text(56, 590, "빨간 띠 = 확률로는 불가능한 영역 (0 미만 · 1 초과)", { size: 12.5, weight: 700, tone: "red" });

      /* ③ 세 가지 눈금 */
      k.section(530, 286, "③ 확률 · 오즈 · 로그 오즈 — 세 가지 눈금");
      var rows = [["혈당 x", "z = 로그 오즈", "p = σ(z)", "오즈 p/(1−p)", "선형회귀 ŷ"]];
      [[80, "−1.600", "0.1680", "0.202", "−0.051"], [100, "−1.000", "0.2689", "0.368", "0.141"], [120, "−0.400", "0.4013", "0.670", "0.333"],
       [140, "0.200", "0.5498", "1.221", "0.525"], [160, "0.800", "0.6900", "2.226", "0.717"], [180, "1.400", "0.8022", "4.055", "0.910"],
       [200, "2.000", "0.8808", "7.389", "1.102"], [220, "2.600", "0.9309", "13.464", "1.294"]].forEach(function (r) {
        var bad = r[4][0] === "−" || parseFloat(r[4]) > 1;
        rows.push([r[0] === 140 ? { t: "140 ◀", tone: "purple" } : String(r[0]), r[1], { t: r[2], tone: "purple", weight: 700 }, r[3], bad ? { t: r[4], tone: "red", weight: 800 } : r[4]]);
      });
      k.table(546, 302, [110, 140, 120, 140, 130], rows, { rh: 25, size: 12.5 });
      k.formula(546, 534, 330, 68, "오즈 = p / (1 − p)\nln(오즈) = z = b0 + b1·x", { size: 14 });
      k.note(890, 534, 350, 68, { tone: "blue", title: "계수 해석 — 오즈비 e^b1", body: "혈당 +1 → 오즈 × e^0.03 = 1.0305 (+3.0%)\n혈당 +10 → 오즈 × e^0.3 = 1.350", size: 13, bodySize: 12 });

      k.flow(40, 640, [
        { t: "데이터 (x, y = 0/1)", tone: "blue" }, { t: "z = b0 + b1·x", tone: "blue" }, { t: "p = σ(z)", tone: "purple" },
        { t: "로그손실 최소화", tone: "red" }, { t: "임계값 t로 0/1", tone: "orange" }, { t: "predict_proba", tone: "green" }
      ], { h: 40, gap: 24, size: 13.5 });
    }
  });

  DSDiagram.register({
    id: "logistic-regression-2", sim: "logistic-regression", order: 2,
    title: "로지스틱 회귀 (2) — 로그손실과 경사하강법", short: "로그손실과 학습",
    sub: "Log Loss · 정답 쪽 확률이 낮을수록 손실이 가파르게 커지는 볼록 함수 — 최소화 = 우도 최대화 (같은 40명, 혈당은 표준화 x̃)",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 로그손실 (Binary Cross Entropy)");
      k.formula(40, 168, 560, 54, "L = −(1/n) Σ [ yᵢ·log pᵢ + (1 − yᵢ)·log(1 − pᵢ) ]", { size: 16 });
      k.table(56, 234, [180, 120, 120, 120], [
        ["정답 쪽 확률", "0.9", "0.5", "0.1"],
        ["손실 −log(정답 쪽 p)", { t: "0.105", tone: "green", weight: 800 }, { t: "0.693", tone: "orange", weight: 800 }, { t: "2.303", tone: "red", weight: 800 }]
      ], { rh: 26, size: 12.5 });
      k.bullets(56, 312, 540, [
        { t: "y = 1 이면 −log p, y = 0 이면 −log(1 − p) 만 남음", tone: "blue" },
        { t: "확신하고 틀릴수록 손실이 끝없이 커짐 → 강한 학습 신호", tone: "red" }
      ], { size: 12.5, lh: 21 });

      k.section(640, 152, "② 왜 MSE가 아니라 로그손실인가");
      k.panel(640, 168, 600, 186, { tone: "gray" });
      var gx = 676, gy = 186, gw = 250, gh = 130;
      k.axes(gx, gy, gw, gh);
      var dl = "", dm = "";
      for (var i = 0; i <= 50; i++) {
        var w1 = -10 + i * 0.4, zz = w1, pl = Math.log(1 + Math.exp(-zz)) / Math.log(1 + Math.exp(10)), pm = Math.pow(1 - 1 / (1 + Math.exp(-zz)), 2);
        var X = gx + i / 50 * gw;
        dl += (i ? " L" : "M") + X.toFixed(1) + " " + (gy + gh - pl * (gh - 8)).toFixed(1);
        dm += (i ? " L" : "M") + X.toFixed(1) + " " + (gy + gh - pm * (gh - 8) * 0.75).toFixed(1);
      }
      k.path(dl, { tone: "blue", width: 2.6 });
      k.path(dm, { tone: "red", width: 2.4, dash: "6 4" });
      k.text(gx + gw, gy + gh + 16, "w1 (왼쪽 = 크게 틀린 쪽)", { size: 11.5, anchor: "end", color: "muted" });
      k.text(gx + 14, gy + 14, "로그손실: 계속 가파름", { size: 12, weight: 800, tone: "blue" });
      k.text(gx + 14, gy + 66, "MSE: 평평 → 기울기 ≈ 0", { size: 12, weight: 800, tone: "red" });
      k.lines(950, 200, [
        { t: "w1 = −10 (크게 틀림)", weight: 800 },
        { t: "로그손실 6.59 → 되돌아오라는 신호", tone: "blue", color: "tone" },
        { t: "MSE 0.722 근처에서 멈춤", tone: "red", color: "tone" },
        { t: "w1 = 1.54 (최적) → 로그손실 0.425", tone: "green", color: "tone", weight: 800 },
        { t: "로그손실 = 볼록 · 시그모이드+MSE = 비볼록", color: "muted" }
      ], { size: 12.5, lh: 24 });

      /* ③ 한 스텝 */
      k.section(40, 384, "③ 경사하강 한 스텝 — 시작 w = (0, 0), η = 0.5");
      k.panel(40, 400, 760, 300, { tone: "blue", tinted: true });
      k.box(56, 414, 360, 136, { tone: "gray", fill: "plain", align: "left", valign: "top", title: "37번째 환자 (혈당 170, y = 0)", titleColor: "ink", size: 13.5,
        lines: [{ t: "x̃ = (170 − 116.5) / 28.51 = 1.875", size: 12.5 }, { t: "z = 0 + 0 × 1.875 = 0 → p = σ(0) = 0.5", size: 12.5 },
          { t: "손실 = −log(1 − 0.5) = 0.6931", size: 12.5, tone: "red" }, { t: "오차 p − y = 0.5 · (p − y)·x̃ = 0.937", size: 12.5, tone: "orange" }] });
      k.box(428, 414, 356, 136, { tone: "red", fill: "plain", align: "left", valign: "top", title: "전체 평균 기울기 (n = 40, 당뇨 12명)", titleColor: "ink", size: 13.5,
        lines: [{ t: "∂L/∂w0 = (1/n)Σ(p − y) = 0.5 − 12/40 = 0.2000", size: 12.5 }, { t: "∂L/∂w1 = (1/n)Σ(p − y)·x̃ = −0.2739", size: 12.5 },
          { t: "→ 선형회귀와 같은 모양: 오차 × 입력", size: 12.5, tone: "blue" }] });
      k.formula(56, 562, 728, 64, "w0 ← 0 − 0.5 × 0.2000 = **−0.1000**,   w1 ← 0 − 0.5 × (−0.2739) = **0.1370**\n원래 단위로:  b1 = w1 / σ,  b0 = w0 − w1·μ / σ", { size: 14 });
      k.flow(56, 640, [
        { t: "p = σ(w0 + w1x̃)", tone: "purple" }, { t: "오차 p − y", tone: "orange" }, { t: "기울기 평균", tone: "red" }, { t: "w ← w − η∇L", tone: "blue" }
      ], { w: 728, h: 40, gap: 22, size: 13 });

      /* ④ 최대우도 */
      k.section(820, 384, "④ 최대우도 관점");
      k.panel(820, 400, 420, 300, { tone: "purple", head: "solid", title: "로그손실 최소 = 우도 최대", right: "MLE" });
      k.formula(836, 448, 388, 58, "우도 = Π pᵢ^yᵢ (1 − pᵢ)^(1−yᵢ)\n= e^(−n × 로그손실)", { size: 14 });
      k.table(836, 518, [150, 110, 128], [
        ["상태", "로그손실", "우도"],
        ["시작 (모두 p = 0.5)", "0.6931", "2^−40 = 9.09×10⁻¹³"],
        [{ t: "최소점 (MLE)", tone: "purple" }, { t: "0.4255", weight: 800 }, { t: "≈ 4×10⁻⁸", weight: 800 }]
      ], { rh: 26, size: 12 });
      k.note(836, 610, 388, 74, { tone: "green", title: "최소점에서의 성적 (40명)", body: "0.5 기준 32/40 정답 · 로그손실이 볼록이라 어디서 출발해도 같은 최소점에 도착", size: 13, bodySize: 12 });
    }
  });

  DSDiagram.register({
    id: "logistic-regression-3", sim: "logistic-regression", order: 3,
    title: "로지스틱 회귀 (3) — 결정 경계 · 임계값 · ROC", short: "결정 경계와 ROC",
    sub: "나이·BMI 두 특성의 결정 경계(z = 0)와 혼동행렬, 임계값을 옮길 때의 민감도·특이도 교환과 ROC 곡선 (60명 · 검진 300명)",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 두 특성의 결정 경계 (표준화 → LogisticRegression C = 1)");
      k.panel(40, 168, 640, 230, { tone: "blue", tinted: true });
      var x0 = 70, y0 = 186, w = 230, h = 180;
      k.raw('<g class="dg-t-orange"><path class="dg-shape dg-shape--f" d="M' + (x0 + 40) + " " + y0 + " L" + (x0 + w) + " " + y0 + " L" + (x0 + w) + " " + (y0 + 120) + 'Z" opacity="0.9"/></g>');
      k.axes(x0, y0, w, h, { x: "나이", y: "BMI" });
      k.path("M" + (x0 + 40) + " " + y0 + " L" + (x0 + w) + " " + (y0 + 120), { tone: "ink", width: 2.4 });
      [[100, 300], [120, 330], [96, 270], [140, 340], [170, 320], [128, 288], [210, 350], [150, 300]].forEach(function (p) { k.circle(p[0], p[1], 4.5, { tone: "blue", fill: "solid" }); });
      [[240, 235], [275, 255], [215, 225], [285, 280], [195, 215], [260, 250], [180, 202]].forEach(function (p) { k.circle(p[0], p[1], 4.5, { tone: "orange", fill: "solid" }); });
      k.text(x0 + w - 6, y0 + 20, "p ≥ 0.5 → 질환", { size: 12, weight: 800, anchor: "end", tone: "orange" });
      k.text(x0 + 70, y0 + h - 10, "정상 쪽", { size: 12, weight: 800, tone: "blue" });
      k.lines(330, 200, [
        "u = (나이 − 46.16)/12.68,  v = (BMI − 25.79)/4.55",
        { t: "z = −0.463 + **1.557**·u + **1.080**·v", weight: 700, size: 14 },
        { t: "원래 단위 z = −12.255 + 0.1229·나이 + 0.2374·BMI", size: 13 },
        { t: "오즈비: 나이 +1세 → × 1.131,  BMI +1 → × 1.268", tone: "blue", color: "tone" },
        "경계 z = 0 ⇔ BMI = (12.255 − 0.1229·나이) / 0.2374",
        { t: "예) 나이 50세 → 경계 BMI 25.74 (이보다 크면 질환)", tone: "orange", color: "tone" },
        { t: "C = 1/λ: 작을수록 강한 L2 규제 → ‖w‖ ↓, 완만한 경계", color: "muted" }
      ], { size: 12.5, lh: 25 });

      k.section(700, 152, "② 혼동행렬 (60명, t = 0.5)");
      k.matrix(780, 196, [["31", "3"], ["4", "22"]], { cw: 92, ch: 44, size: 18, cols: ["예측 정상", "예측 질환"], rows: ["실제 정상", "실제 질환"],
        tones: function (i, j) { return i === j ? "green" : "red"; }, fill: "tone" });
      k.text(826, 312, "TN · FP / FN · TP", { size: 12, anchor: "middle", color: "muted", weight: 700 });
      k.table(990, 178, [120, 120], [
        ["지표", "값"],
        ["정확도", "53/60 = 0.883"],
        ["정밀도", "22/25 = 0.880"],
        ["재현율", "22/26 = 0.846"],
        ["F1", "0.863"],
        ["로그손실", "0.3285"]
      ], { rh: 26, size: 12.5 });
      k.note(700, 340, 540, 58, { tone: "orange", title: "predict()는 0.5 고정 → 임계값은 predict_proba로 직접", body: "proba = model.predict_proba(X)[:, 1];  pred = (proba >= t)", size: 13, bodySize: 12 });

      k.section(40, 430, "③ 임계값을 옮기면 — 검진 300명 (질환 80명)");
      k.panel(40, 446, 760, 254, { tone: "gray" });
      k.table(56, 460, [150, 130, 130, 140, 170], [
        ["임계값 t", "TP / FN", "FP / TN", "민감도 (재현율)", "특이도 · 정밀도"],
        ["0.5 (기본)", "54 / 26", "11 / 209", { t: "67.5%", weight: 800 }, "95.0% · 83.1%"],
        [{ t: "0.194 (비용 최소)", tone: "orange" }, "72 / 8", "53 / 167", { t: "90.0%", tone: "orange", weight: 800 }, "75.9% · 57.6%"]
      ], { rh: 28, size: 12.5 });
      k.formula(56, 558, 728, 66, "총비용 = 5 × FN + 1 × FP   (환자 1명을 놓치는 비용 = 위양성 5명분)\nt = 0.5 → 5 × 26 + 11 = **141**  ·  t = 0.194 → 5 × 8 + 53 = **93**", { size: 14 });
      k.bullets(56, 648, 728, [
        { t: "선별검사는 민감도 우선 → t를 낮춤 (늘어난 위양성은 2차 검사로 거름) · 확진·수술 결정은 t를 높여 정밀도 확보", tone: "orange" },
        { t: "이론상 최적 t = 1 / (1 + 5) = 0.167 (확률이 잘 보정된 경우) — 임계값은 모델이 아니라 사용 목적이 정함", tone: "purple" }
      ], { size: 12.5, lh: 22 });

      k.section(820, 430, "④ ROC 곡선");
      k.panel(820, 446, 420, 254, { tone: "teal", tinted: true });
      var rx = 872, ry = 466, rw = 180, rh = 180;
      k.axes(rx, ry, rw, rh);
      k.path("M" + rx + " " + (ry + rh) + " L" + (rx + rw) + " " + ry, { tone: "gray", width: 1.4, dash: "4 4" });
      var roc = [[0, 0], [0.02, 0.45], [0.05, 0.675], [0.1, 0.78], [0.2, 0.87], [0.4, 0.95], [0.7, 0.99], [1, 1]];
      k.path(roc.map(function (q, i) { return (i ? "L" : "M") + (rx + q[0] * rw).toFixed(1) + " " + (ry + rh - q[1] * rh).toFixed(1); }).join(" "), { tone: "teal", width: 3 });
      k.circle(rx + 0.05 * rw, ry + rh - 0.675 * rh, 5.5, { tone: "orange", fill: "solid" });
      k.text(rx + 0.05 * rw + 14, ry + rh - 0.675 * rh + 22, "t = 0.5", { size: 12, weight: 800, tone: "orange" });
      k.text(rx + rw, ry + rh + 16, "FPR = 1 − 특이도", { size: 11.5, anchor: "end", color: "muted" });
      k.text(rx - 8, ry - 6, "TPR", { size: 11.5, color: "muted" });
      k.lines(1072, 494, [
        { t: "AUC = 0.899", weight: 800, size: 16, tone: "teal", color: "tone" },
        "무작위 = 0.5",
        "현재 점 (0.05, 0.675)",
        { t: "AUC = 무작위 한 쌍에서", color: "muted" },
        { t: "질환자의 p가 더 클 확률", color: "muted" },
        { t: "불균형 → PR 곡선도", color: "muted" },
        { t: "함께 (AP = 0.833)", color: "muted" }
      ], { size: 12.5, lh: 23 });
    }
  });
})();
