/* 불균형 데이터 샘플링 — 알고리즘 구성도 (시뮬레이터 기본 예제: 혈당·BMI → 질환, 학습 정상 160 · 질환 16 (1:10), 검증 정상 500 · 질환 50, seed 42) */
(function () {
  var L = "Machine Learning";

  function ring(k, x, y, r, tn, dash) {
    k.raw('<g class="dg-t-' + tn + '"><circle class="dg-stroke" cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:none;stroke-width:2;' + (dash ? "stroke-dasharray:" + dash : "") + '"/></g>');
  }
  /* 혼동행렬: [[TN, FP], [FN, TP]] */
  function cm(k, x, y, m, title, tn) {
    k.matrix(x, y, m, { cw: 64, ch: 34, size: 15, rows: ["실제 정상", "실제 질환"], cols: ["예측 정상", "예측 질환"], title: title, titleTone: tn,
      tones: function (i, j) { return i === j ? (i ? "green" : "blue") : (i ? "red" : "amber"); },
      fills: function (i, j) { return i === 1 && j === 0 ? "mid" : "tone"; } });
  }

  /* ---------------- (1) 문제 · Over ---------------- */
  DSDiagram.register({
    id: "imbalanced-sampling-1", sim: "imbalanced-sampling", order: 1,
    title: "불균형 데이터 샘플링 (1) — 정확도의 함정 · Over", short: "문제 · Over Sampling",
    sub: "질환(소수)이 정상(다수)보다 훨씬 적으면 '전부 정상'이라고 해도 정확도가 높다 → 소수 클래스를 늘려 비율을 맞춘다 — 혈당·BMI → 질환",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 문제 — 학습 데이터 질환 16 : 정상 160 (1 : 10)");
      k.panel(40, 168, 580, 236, { tone: "red", tinted: true });
      k.text(60, 198, "학습 데이터", { size: 13, weight: 800, color: "ink" });
      k.rect(60, 210, 320, 24, { tone: "blue", fill: "solid", r: 3 }); k.text(390, 228, "정상 160", { size: 13, weight: 700, tone: "blue" });
      k.rect(60, 240, 32, 24, { tone: "orange", fill: "solid", r: 3 }); k.text(102, 258, "질환 16", { size: 13, weight: 700, tone: "orange" });
      cm(k, 156, 318, [[494, 6], [35, 15]], "원본으로 학습 → 검증 550명", "red");
      k.box(310, 300, 290, 94, { tone: "red", fill: "plain", r: 8, align: "left", valign: "top", title: "정확도 92.5% 인데", titleColor: "ink", size: 14,
        lines: [{ t: "재현율 15 / 50 = **30.0%** → 질환 35명 놓침", tone: "red" }, { t: "'모두 정상'이라고만 해도 500/550 = 90.9%", color: "muted" }] });
      k.text(460, 228, "검증도 500 : 50", { size: 12.5, color: "muted" });
      k.text(460, 258, "같은 1 : 10 비율", { size: 12.5, color: "muted" });

      k.section(640, 152, "② Over Sampling — 소수 클래스 늘리기");
      k.panel(640, 168, 600, 236, { tone: "orange", tinted: true });
      /* SMOTE 그림 (배치는 개념도, 계산 숫자는 시뮬레이터 마지막 생성 단계) */
      var xi = [750, 300], xn = [805, 250], lam = 0.48, xw = [xi[0] + lam * (xn[0] - xi[0]), xi[1] + lam * (xn[1] - xi[1])];
      ring(k, xi[0], xi[1], 80, "purple", "5 4");
      [[680, 215], [858, 282], [862, 368], [662, 330]].forEach(function (q) { k.circle(q[0], q[1], 6, { tone: "blue", fill: "tone" }); });
      [[702, 262], [712, 345], [738, 236], [790, 350]].forEach(function (q) { k.circle(q[0], q[1], 7, { tone: "orange", fill: "solid" }); });
      k.path("M" + xi[0] + " " + xi[1] + " L" + xn[0] + " " + xn[1], { tone: "purple", width: 2, dash: "5 3" });
      k.circle(xi[0], xi[1], 8, { tone: "orange", fill: "solid" });
      k.circle(xn[0], xn[1], 8, { tone: "orange", fill: "solid" });
      k.circle(xw[0], xw[1], 8, { tone: "purple", fill: "solid" });
      k.text(xi[0] - 4, xi[1] + 26, "x_i #160", { size: 12, weight: 800, tone: "orange", anchor: "middle" });
      k.text(xn[0] + 8, xn[1] - 16, "x_nn #168", { size: 12, weight: 800, tone: "orange" });
      k.text(xw[0] + 12, xw[1] + 12, "새 점", { size: 12, weight: 800, tone: "purple" });
      k.text(660, 196, "SMOTE · k_neighbors = 5", { size: 13, weight: 800, tone: "purple" });
      k.text(660, 396, "점선 원 = 소수 이웃 5개", { size: 11.5, color: "muted" });
      k.box(890, 186, 336, 120, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "x_new = x_i + λ · (x_nn − x_i)", titleColor: "ink", size: 14, subSize: 12,
        lines: [{ t: "λ = 0.480 (0~1 균등 난수)", size: 12.5 }, { t: "혈당 107.3 + 0.480×(109.4 − 107.3) = 108.3", tone: "purple", size: 12.5 }, { t: "BMI 22.2 + 0.480×(24.0 − 22.2) = 23.1", tone: "purple", size: 12.5 }, { t: "→ 두 소수 점을 잇는 선분 위", color: "muted", size: 12.5 }] });
      k.box(890, 316, 150, 74, { tone: "orange", fill: "tone", title: "RandomOver", lines: [{ t: "소수 점 그대로 복제", size: 12 }, { t: "→ 같은 점 반복", size: 12 }], size: 13.5 });
      k.box(1050, 316, 176, 74, { tone: "purple", fill: "tone", title: "Borderline / ADASYN", lines: [{ t: "경계 근처 · 어려운 점", size: 12 }, { t: "에서 더 많이 생성", size: 12 }], size: 12.5 });

      k.section(40, 440, "③ 몇 개를 만들고, 무엇이 달라지나");
      k.formula(40, 456, 580, 62, "생성 수 = int(N다수 × sampling_strategy − N소수)\n= int(160 × 1.0 − 16) = **144** → 질환 160 : 정상 160", { size: 15 });
      k.text(56, 540, "sampling_strategy = 0.5 이면 int(160 × 0.5 − 16) = 64개 → 질환 80 : 정상 160", { size: 12.5, color: "muted" });
      cm(k, 156, 594, [[405, 95], [5, 45]], "SMOTE 후 학습 → 같은 검증 550명", "purple");
      k.box(310, 576, 310, 102, { tone: "purple", fill: "plain", r: 8, align: "left", valign: "top", title: "놓친 질환 35명 → 5명", titleColor: "ink", size: 14,
        lines: [{ t: "재현율 30.0% → **90.0%**", tone: "green" }, { t: "정밀도 71.4% → 32.1% (오경보 95명)", tone: "red" }, { t: "정확도는 오히려 92.5% → 81.8%", color: "muted" }] });

      k.table(656, 456, [180, 92, 104, 92, 116], [
        ["검증 지표 (질환 = 양성)", "원본", "RandomOver", "SMOTE", "class_weight"],
        ["정확도", "92.5%", "82.4%", "81.8%", "81.6%"],
        [{ t: "재현율 (민감도)", tone: "green" }, "30.0%", "88.0%", { t: "90.0%", weight: 800 }, "90.0%"],
        ["정밀도", "71.4%", "32.6%", "32.1%", "31.9%"],
        ["F1", "42.3%", "47.6%", "47.4%", "47.1%"],
        [{ t: "balanced accuracy", tone: "purple" }, "64.4%", "84.9%", { t: "85.5%", weight: 800 }, "85.4%"]
      ], { rh: 30, size: 13 });
      k.note(656, 646, 584, 50, { tone: "purple", title: "불균형 데이터는 정확도 대신 재현율 · F1 · balanced accuracy", body: "balanced accuracy = (재현율 + 특이도) / 2 = (0.90 + 405/500) / 2 = 0.855" });
    }
  });

  /* ---------------- (2) Under ---------------- */
  DSDiagram.register({
    id: "imbalanced-sampling-2", sim: "imbalanced-sampling", order: 2,
    title: "불균형 데이터 샘플링 (2) — Under Sampling", short: "Under Sampling",
    sub: "다수 클래스(정상) 점을 지워 비율을 맞추거나, 두 클래스가 맞닿은 경계의 점을 지워 데이터를 '청소'한다 — 학습 정상 160 · 질환 16",
    label: L,
    draw: function (k) {
      /* ① RandomUnder */
      k.section(40, 152, "① RandomUnderSampler");
      k.panel(40, 168, 380, 268, { tone: "blue", tinted: true });
      k.text(60, 198, "다수 클래스에서 무작위로 남길 수만큼 고름", { size: 13, weight: 800, color: "ink" });
      k.text(60, 228, "전", { size: 12.5, weight: 800, color: "muted" });
      k.rect(84, 214, 300, 20, { tone: "blue", fill: "solid", r: 3 });
      k.rect(84, 238, 30, 20, { tone: "orange", fill: "solid", r: 3 });
      k.text(60, 300, "후", { size: 12.5, weight: 800, color: "muted" });
      k.rect(84, 286, 30, 20, { tone: "blue", fill: "solid", r: 3 }); k.rect(114, 286, 270, 20, { tone: "gray", fill: "tone", r: 3 });
      k.text(249, 301, "144개 버림", { size: 12, weight: 700, anchor: "middle", tone: "red" });
      k.rect(84, 310, 30, 20, { tone: "orange", fill: "solid", r: 3 });
      k.text(124, 252, "160 : 16", { size: 12.5, weight: 700, color: "ink" });
      k.text(124, 325, "16 : 16", { size: 12.5, weight: 700, color: "ink" });
      k.formula(56, 344, 348, 40, "남길 수 = int(N소수 / α) = int(16 / 1.0) = **16**", { size: 13.5 });
      k.text(60, 412, "빠르고 단순 · 정보 손실이 크다 (데이터의 90% 버림)", { size: 12.5, weight: 700, tone: "red" });

      /* ② Tomek */
      k.section(440, 152, "② TomekLinks — 경계 청소");
      k.panel(440, 168, 400, 268, { tone: "purple", tinted: true });
      k.formula(456, 182, 368, 54, "(a, b)가 Tomek 링크 ⇔ y_a ≠ y_b\n그리고 NN(a) = b, NN(b) = a", { size: 14 });
      var A = [560, 300], B = [640, 300];
      k.circle(500, 272, 7, { tone: "blue", fill: "tone" }); k.circle(486, 330, 7, { tone: "blue", fill: "tone" }); k.circle(492, 384, 7, { tone: "blue", fill: "tone" });
      k.circle(700, 270, 7, { tone: "orange", fill: "solid" }); k.circle(712, 336, 7, { tone: "orange", fill: "solid" });
      k.path("M" + A[0] + " " + A[1] + " L" + B[0] + " " + B[1], { tone: "purple", width: 3 });
      k.circle(A[0], A[1], 9, { tone: "blue", fill: "tone" });
      ring(k, A[0], A[1], 15, "red");
      k.circle(B[0], B[1], 9, { tone: "orange", fill: "solid" });
      k.text(A[0], A[1] + 34, "#132 정상", { size: 12, weight: 800, anchor: "middle", tone: "red" });
      k.text(A[0], A[1] + 50, "(109.2, 24.0)", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(B[0] + 4, B[1] + 34, "#168 질환", { size: 12, weight: 800, anchor: "middle", tone: "orange" });
      k.text(B[0] + 4, B[1] + 50, "(109.4, 24.0)", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(600, 276, "거리 0.015", { size: 11.5, weight: 700, anchor: "middle", tone: "purple" });
      k.lines(740, 270, ["서로 최근접", "클래스 다름", { t: "→ 다수 쪽 제거", tone: "red", color: "tone", weight: 800 }], { size: 12.5, lh: 20 });
      k.text(640, 412, "링크 8쌍 → 정상 8개 제거 → 152 : 16 (비율은 거의 그대로)", { size: 12.5, weight: 700, anchor: "middle", tone: "purple" });

      /* ③ 그 밖의 기법 */
      k.section(860, 152, "③ 이웃 · 군집 기반 기법");
      k.panel(860, 168, 380, 268, { tone: "teal", tinted: true });
      k.box(876, 184, 348, 76, { tone: "teal", fill: "plain", r: 8, align: "left", valign: "top", title: "NearMiss (version 1, n_neighbors 3)", titleColor: "ink", size: 13.5, subSize: 12,
        lines: [{ t: "가까운 질환 3개와의 평균 거리가 작은 정상 점부터" }, { t: "16개만 남김 → 경계 근처 정상만 남는다" }] });
      k.box(876, 268, 348, 76, { tone: "teal", fill: "plain", r: 8, align: "left", valign: "top", title: "EditedNearestNeighbours (ENN)", titleColor: "ink", size: 13.5, subSize: 12,
        lines: [{ t: "이웃 3개의 다수결과 클래스가 다른 점을 제거" }, { t: "'mode' 다수결 · 'all' 하나라도 다르면 제거" }] });
      k.box(876, 352, 348, 70, { tone: "teal", fill: "plain", r: 8, align: "left", valign: "top", title: "ClusterCentroids", titleColor: "ink", size: 13.5, subSize: 12,
        lines: [{ t: "정상 160개를 KMeans 중심 16개로 대체" }] });

      /* ④ 결과 */
      k.section(40, 470, "④ 원본 분포 그대로인 검증 550명으로 평가");
      k.table(56, 484, [200, 120, 110, 110, 110, 150], [
        ["기법", "학습 정상 : 질환", "재현율", "정밀도", "F1", "balanced acc"],
        ["원본", "160 : 16", "30.0%", "71.4%", "42.3%", "64.4%"],
        [{ t: "RandomUnderSampler", tone: "blue" }, "16 : 16", "76.0%", "28.6%", "41.5%", "78.5%"],
        [{ t: "TomekLinks", tone: "purple" }, "152 : 16", "34.0%", "60.7%", "43.6%", "65.9%"],
        [{ t: "NearMiss (v1)", tone: "teal" }, "16 : 16", "64.0%", "41.6%", { t: "50.4%", weight: 800 }, "77.5%"]
      ], { rh: 31, size: 13.5 });
      k.note(880, 484, 360, 58, { tone: "red", title: "버리는 만큼 정보도 사라진다", body: "다수 점 144개를 버리면 정상 영역 모양이 거칠어진다" });
      k.note(880, 550, 360, 58, { tone: "purple", title: "Tomek은 개수 맞추기가 아니다", body: "경계만 정리 → 보통 SMOTE와 묶어 쓴다 (3장)" });
      k.note(880, 616, 360, 58, { tone: "green", title: "데이터가 아주 많을 때 유리", body: "다수 클래스가 수십만 건이면 학습 시간도 줄어든다" });
      k.text(56, 672, "검증 세트는 샘플링하지 않는다 — 정상 500 · 질환 50 (실제 병원 분포)", { size: 12.5, weight: 700, tone: "teal" });
    }
  });

  /* ---------------- (3) Combine · 순서 ---------------- */
  DSDiagram.register({
    id: "imbalanced-sampling-3", sim: "imbalanced-sampling", order: 3,
    title: "불균형 데이터 샘플링 (3) — Combine · 사용 순서", short: "Combine · 누수 방지",
    sub: "SMOTE로 늘린 뒤 경계를 청소하고, 샘플링은 반드시 분할 뒤 학습 부분에서만 — imblearn Pipeline이 fold마다 자동으로 처리",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① Combine — 늘린 뒤 경계 청소");
      k.panel(40, 168, 1200, 186, { tone: "orange", tinted: true });
      k.text(60, 200, "SMOTETomek", { size: 15, weight: 800, tone: "purple" });
      var y1 = 210;
      var s0 = k.box(60, y1, 170, 52, { tone: "gray", fill: "plain", title: "원본", sub: "정상 160 : 질환 16", size: 14 });
      var s1 = k.box(290, y1, 240, 52, { tone: "orange", fill: "tone", title: "① SMOTE +144", sub: "int(160 × 1.0 − 16) = 144", size: 14 });
      var s2 = k.box(590, y1, 170, 52, { tone: "gray", fill: "plain", title: "160 : 160", sub: "1 : 1", size: 14 });
      var s3 = k.box(820, y1, 240, 52, { tone: "purple", fill: "tone", title: "② Tomek 12쌍 양쪽 제거", sub: "sampling_strategy='all' · 24개", size: 13.5 });
      var s4 = k.box(1100, y1, 120, 52, { tone: "green", fill: "solid", title: "148 : 148", size: 15 });
      [[s0, s1], [s1, s2], [s2, s3], [s3, s4]].forEach(function (p) { k.link([p[0].r[0] + 3, p[0].cy], [p[1].l[0] - 3, p[1].cy], { tone: "gray" }); });
      k.text(60, 296, "SMOTEENN", { size: 15, weight: 800, tone: "teal" });
      var y2 = 306;
      var t0 = k.box(60, y2, 170, 36, { tone: "gray", fill: "plain", title: "160 : 16", size: 14 });
      var t1 = k.box(290, y2, 240, 36, { tone: "orange", fill: "tone", title: "① SMOTE +144", size: 14 });
      var t2 = k.box(590, y2, 170, 36, { tone: "gray", fill: "plain", title: "160 : 160", size: 14 });
      var t3 = k.box(820, y2, 240, 36, { tone: "teal", fill: "tone", title: "② ENN 78개 제거 ('all', 이웃 3)", size: 13 });
      var t4 = k.box(1100, y2, 120, 36, { tone: "green", fill: "solid", title: "118 : 124", size: 15 });
      [[t0, t1], [t1, t2], [t2, t3], [t3, t4]].forEach(function (p) { k.link([p[0].r[0] + 3, p[0].cy], [p[1].l[0] - 3, p[1].cy], { tone: "gray" }); });
      k.text(1220, 290, "정리 기법이라 1 : 1이 정확히 안 맞는 것이 정상", { size: 12, anchor: "end", color: "muted" });

      k.section(40, 388, "② 모든 기법 비교 — 검증 550명");
      k.table(56, 402, [170, 84, 84, 74, 104], [
        ["기법", "재현율", "정밀도", "F1", "bal. acc"],
        ["원본", "30.0%", "71.4%", "42.3%", "64.4%"],
        [{ t: "SMOTE", tone: "orange" }, "90.0%", "32.1%", "47.4%", "85.5%"],
        [{ t: "RandomUnder", tone: "blue" }, "76.0%", "28.6%", "41.5%", "78.5%"],
        [{ t: "SMOTETomek", tone: "purple" }, "92.0%", "31.1%", "46.5%", { t: "85.8%", weight: 800 }],
        [{ t: "SMOTEENN", tone: "teal" }, { t: "98.0%", weight: 800 }, "26.2%", "41.4%", "85.2%"],
        ["class_weight", "90.0%", "31.9%", "47.1%", "85.4%"]
      ], { rh: 29, size: 13 });
      k.text(56, 626, "재현율과 정밀도는 맞바꾸는 관계 — 놓치면 안 되는 질환이면 재현율 우선", { size: 12.5, weight: 700, tone: "red" });
      k.note(40, 640, 540, 56, { tone: "green", title: "대안: class_weight='balanced'", body: "데이터는 그대로 두고 손실에서 소수 클래스 가중치를 키움 — 점을 만들지 않음" });

      k.section(600, 388, "③ 반드시 지킬 것 — 샘플링은 학습 데이터에만");
      k.panel(600, 402, 640, 92, { tone: "red", head: "solid", title: "잘못: 샘플링 → 분할 (데이터 누수)", headH: 30 });
      k.flow(616, 444, [{ t: "전체 데이터", tone: "gray" }, { t: "SMOTE (전체에)", tone: "orange" }, { t: "train_test_split", tone: "red" }, { t: "점수 부풀림", tone: "red" }], { w: 608, h: 36, gap: 20, size: 12.5 });
      k.panel(600, 504, 640, 92, { tone: "green", head: "solid", title: "올바름: 분할 → 학습 부분만 샘플링 → 원본 분포로 평가", headH: 30 });
      k.flow(616, 546, [{ t: "split (stratify=y)", tone: "blue" }, { t: "Train만 SMOTE", tone: "purple" }, { t: "model.fit", tone: "blue" }, { t: "원본 Test로 평가", tone: "teal" }], { w: 608, h: 36, gap: 20, size: 12.5 });
      k.code(600, 606, 640, 92, [
        "from imblearn.pipeline import Pipeline   # sklearn 아닌 imblearn",
        "pipe = Pipeline([('scaler', StandardScaler()), ('smote', SMOTE(k_neighbors=5)),",
        "                 ('model', LogisticRegression())])",
        "cross_validate(pipe, X_train, y_train, cv=5)   # fold마다 학습 부분만 샘플링"
      ], { size: 12 });
    }
  });
})();
