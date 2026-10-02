/* 특성 공학 Pipeline — 알고리즘 구성도 (강의 필기자료 '특성 공학 (Feature Engineering)' · '지도학습의 실무적 절차 6단계' 양식,
   시뮬레이터 기본 예제: 환자 Train 12행 · Test 4행, 수치 3열(나이·혈당·BMI) + 범주 3열(성별·흡연·지역)) */
(function () {
  var L = "Machine Learning";

  /* ---------------- (1) 전체 구조 ---------------- */
  DSDiagram.register({
    id: "feature-pipeline-1", sim: "feature-pipeline", order: 1,
    title: "특성 공학 (1) — Pipeline 전체 구조", short: "Pipeline 전체 구조",
    sub: "학습의 목적에 맞게 데이터를 깔끔하게 다듬는 작업 — Scikit-Learn에서는 Pipeline 구조로 학습과 동시에 처리",
    label: L,
    draw: function (k) {
      k.panel(40, 126, 1200, 216, { tone: "gray", tinted: true });
      var tr = k.box(58, 176, 150, 68, { tone: "blue", fill: "solid", title: "Train Set", sub: "환자 12행 · X 6열", size: 18 });
      k.raw('<g class="dg-t-purple"><rect class="dg-box dg-box--ghost dg-box--dash" x="238" y="138" width="830" height="134" rx="12"/></g>');
      k.text(256, 162, "교차 검증 × 하이퍼파라미터 튜닝", { size: 15, weight: 800, tone: "purple" });
      k.text(1052, 162, "GridSearchCV(pipe, param_grid, cv=5)", { size: 12.5, anchor: "end", color: "muted", mono: true });
      k.box(256, 172, 794, 88, { tone: "purple", fill: "ghost", r: 10 });
      k.text(270, 190, "Pipeline", { size: 12.5, weight: 800, tone: "purple", mono: true });
      var st = [["결측값 대치", "SimpleImputer", "teal"], ["스케일링 · 인코딩", "Scaler · Encoder", "blue"], ["특성 선택", "SelectKBest", "orange"], ["불균형 샘플링 *", "SMOTE 등", "orange"], ["모델 학습", "Estimator.fit", "purple"]];
      var bx = [];
      st.forEach(function (s, i) {
        var b = k.box(270 + i * 156, 198, 136, 52, { tone: s[2], fill: i === 4 ? "solid" : "plain", title: s[0], sub: s[1], size: 13.5, mono: true });
        if (i) k.link([bx[i - 1].r[0] + 2, bx[i - 1].cy], [b.l[0] - 2, b.cy], { tone: "gray", width: 1.6 });
        bx.push(b);
      });
      k.link([tr.r[0] + 2, tr.cy], [236, tr.cy], { tone: "blue", width: 2.4 });
      var best = k.box(1098, 176, 128, 68, { tone: "purple", fill: "solid", title: "최적 Pipeline", sub: "전처리 + 모델", size: 15 });
      k.link([1070, best.cy], [best.l[0] - 2, best.cy], { tone: "purple", width: 2.4 });
      var nw = k.box(58, 286, 150, 44, { tone: "orange", fill: "plain", title: "새로운 데이터", sub: "결측값 포함 가능", size: 14 });
      var res = k.box(1098, 286, 128, 44, { tone: "orange", fill: "solid", title: "예측 / 분류 결과", size: 13.5 });
      k.arrow(nw.r[0] + 4, nw.cy, res.l[0] - 4, res.cy, { tone: "orange", dash: true, width: 2, label: "학습 때 fit된 전처리 규칙을 그대로 transform → predict()", labelSize: 14, labelDy: -5 });

      k.circle(52, 362, 9, { tone: "teal", fill: "solid", label: "i", size: 12 });
      k.text(68, 367, "**Pipeline의 장점 :** 전처리의 fit이 매 fold의 Train 부분에서만 수행 → Validation · Test 정보가 새어 들어가지 않음 (데이터 누수 방지)", { size: 14, color: "ink" });

      /* 6가지 기법 카드 */
      var cards = [
        ["스케일링 & 인코딩", "Scaling & Encoding", "blue", "숫자의 스케일을 맞추고 문자 범주를 숫자로 바꿔 학습에 사용"],
        ["결측값 대치", "Imputation", "teal", "결측값을 Train에서 배운 값으로 채움 → 새 데이터에 결측이 있어도 예측 가능"],
        ["교차 검증", "Cross Validation", "purple", "Train을 K조각으로 나눠 번갈아 검증 · Validation은 학습 과정에 참여, Test는 끝까지 격리"],
        ["하이퍼파라미터 튜닝", "Hyperparameter Tuning", "purple", "사용자가 정하는 설정값의 조합을 교차 검증 점수로 비교해 고름"],
        ["불균형 데이터 샘플링", "Imbalanced Data Sampling · 분류", "orange", "목표변수 비율이 깨진 경우 적은 쪽을 늘리거나 많은 쪽을 줄여 비율을 맞춤"],
        ["특성 선택", "Feature Selection", "orange", "목표변수와 관련이 큰 X를 사용자가 지정한 개수만큼 선택"]
      ];
      cards.forEach(function (c, i) {
        var x = 40 + (i % 3) * 405, y = 384 + Math.floor(i / 3) * 154, w = 390, h = 144;
        k.raw('<g class="dg-t-' + c[2] + '"><rect class="dg-box dg-box--plain" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10" style="stroke-width:2"/></g>');
        k.rect(x + 10, y + 10, 150, h - 20, { tone: c[2], fill: "tone", r: 6 });
        k.text(x + 172, y + 32, c[0], { size: 16, weight: 800, tone: c[2] });
        k.text(x + 172, y + 50, c[1], { size: 11.5, weight: 700, color: "muted" });
        k.para(x + 172, y + 74, w - 200, c[3], { size: 12.5, lh: 18, color: "ink" });
        var ix = x + 18, iy = y + 18;
        if (i === 0) {
          k.lines(ix, iy + 16, [{ t: "나이 45", weight: 700 }, { t: "→ (45 − 51.9) / 10.87", size: 11.5 }, { t: "= −0.63", tone: "blue", color: "tone", weight: 800 }], { size: 12.5, lh: 19 });
          k.lines(ix, iy + 84, [{ t: "성별 '남'", weight: 700 }, { t: "→ [1, 0]", tone: "blue", color: "tone", weight: 800 }], { size: 12.5, lh: 19 });
        } else if (i === 1) {
          k.matrix(ix + 4, iy + 6, [[45], [62], ["NaN"], [38]], { cw: 52, ch: 22, size: 12, tones: function (r) { return r === 2 ? "red" : "gray"; }, fills: function () { return "tone"; } });
          k.arrow(ix + 60, iy + 50, ix + 76, iy + 50, { tone: "teal", width: 1.6 });
          k.matrix(ix + 80, iy + 6, [[45], [62], [51.9], [38]], { cw: 52, ch: 22, size: 12, tones: function (r) { return r === 2 ? "teal" : "gray"; }, fills: function (r) { return r === 2 ? "solid" : "tone"; } });
          k.text(ix + 66, iy + 114, "Train 나이 평균 51.9", { size: 11.5, anchor: "middle", weight: 700, tone: "teal" });
        } else if (i === 2) {
          for (var r = 0; r < 4; r++) for (var q = 0; q < 5; q++) {
            var v = q === 4 ? "gray" : (q === r ? "purple" : "purple");
            k.rect(ix + 2 + q * 26, iy + 10 + r * 24, 21, 19, { tone: v, fill: q === 4 ? "mid" : (q === r ? "solid" : "tone"), r: 3 });
          }
          k.text(ix + 40, iy + 114, "Validation", { size: 11.5, weight: 700, anchor: "middle", tone: "purple" });
          k.text(ix + 116, iy + 114, "Test", { size: 11.5, weight: 700, anchor: "middle", tone: "red" });
        } else if (i === 3) {
          [["model__C", 0.15], ["select__k", 0.5], ["scaler", 0.8]].forEach(function (sl, j) {
            var yy = iy + 18 + j * 38;
            k.text(ix, yy, sl[0], { size: 11.5, mono: true, color: "ink" });
            k.rect(ix, yy + 8, 126, 5, { tone: "purple", fill: "tone", r: 2 });
            k.rect(ix, yy + 8, 126 * sl[1], 5, { tone: "purple", fill: "solid", r: 2 });
            k.circle(ix + 126 * sl[1], yy + 10.5, 7, { tone: "purple", fill: "plain" });
          });
        } else if (i === 4) {
          k.text(ix + 62, iy + 14, "Train y  7 : 5 → 7 : 7", { size: 11.5, weight: 700, anchor: "middle", tone: "orange" });
          k.rect(ix + 8, iy + 26, 22, 60, { tone: "blue", fill: "solid", r: 2 }); k.rect(ix + 32, iy + 43, 22, 43, { tone: "orange", fill: "solid", r: 2 });
          k.arrow(ix + 60, iy + 58, ix + 76, iy + 58, { tone: "orange", width: 1.6 });
          k.rect(ix + 82, iy + 26, 22, 60, { tone: "blue", fill: "solid", r: 2 }); k.rect(ix + 106, iy + 26, 22, 60, { tone: "orange", fill: "solid", r: 2 });
          k.text(ix + 31, iy + 114, "원본", { size: 11.5, anchor: "middle", color: "muted" });
          k.text(ix + 105, iy + 114, "Over 후", { size: 11.5, anchor: "middle", color: "muted" });
        } else {
          [["BMI", 27.2, 1], ["나이", 11.0, 1], ["혈당", 5.1, 1], ["대구", 3.9, 1], ["남", 3.5, 1], ["여", 3.5, 1], ["부산", 1.7, 0]].forEach(function (f, j) {
            var yy = iy + 2 + j * 13.5;
            k.text(ix + 26, yy + 11, f[0], { size: 11.5, anchor: "end", color: "muted" });
            k.rect(ix + 30, yy + 2, Math.max(3, f[1] / 27.2 * 96), 10, { tone: f[2] ? "orange" : "gray", fill: f[2] ? "solid" : "tone", r: 2 });
          });
          k.text(ix + 66, iy + 114, "F 점수 · k = 6 선택", { size: 11.5, weight: 700, anchor: "middle", tone: "orange" });
        }
      });
      k.text(1240, 700, "* 샘플링 단계를 Pipeline에 넣을 때는 imbalanced-learn(imblearn)의 Pipeline 사용", { size: 11.5, anchor: "end", color: "muted" });
    }
  });

  /* ---------------- (2) 환자 표가 통과하는 모습 ---------------- */
  DSDiagram.register({
    id: "feature-pipeline-2", sim: "feature-pipeline", order: 2,
    title: "특성 공학 (2) — 환자 표가 Pipeline을 통과하는 모습", short: "환자 표 따라가기",
    sub: "Train 12행으로 fit → 대치값 · 평균 · 표준편차 · 카테고리 · 선택 열을 배우고, 같은 규칙으로 transform — 수치 대치 mean · StandardScaler · OneHotEncoder · k = 6",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 원본 Train (앞 4행)");
      k.table(56, 166, [44, 58, 58, 58, 58, 76, 58, 40], [
        ["#", "나이", "혈당", "BMI", "성별", "흡연", "지역", "y"],
        ["1", "45", "102", "24.1", "남", "현재", "서울", "0"],
        ["2", "62", "128", "27.5", "여", "비흡연", "경기", "1"],
        ["3", { t: "NaN", tone: "red", weight: 800 }, "95", "22.8", "남", "과거", "부산", "0"],
        ["4", "38", "88", "21.0", "여", { t: "NaN", tone: "red", weight: 800 }, "서울", "0"]
      ], { rh: 28, size: 13 });
      k.text(56, 318, "Train 12행 중 나이 결측 2개(#3, #8), 흡연 결측 2개(#4, #11)", { size: 12, color: "muted" });
      k.text(56, 344, "→ transform 후: 수치 3열 + One-Hot 9열 = 12열", { size: 13, weight: 800, tone: "blue" });

      k.arrow(522, 236, 566, 236, { tone: "purple", width: 2.4, label: "fit" });
      k.section(576, 152, "② fit이 Train에서 배운 규칙");
      k.table(592, 166, [92, 104, 100, 100, 252], [
        ["수치 열", "대치값 (mean)", "평균 μ", "표준편차 σ", "z = (x − μ) / σ  예"],
        ["나이", { t: "51.90", tone: "teal", weight: 800 }, "51.90", "10.87", "(45 − 51.90) / 10.87 = −0.63"],
        ["혈당", "127.58", "127.58", "57.42", "(102 − 127.58) / 57.42 = −0.45"],
        ["BMI", "25.35", "25.35", "2.99", "(24.1 − 25.35) / 2.99 = −0.42"]
      ], { rh: 26, size: 13 });
      k.table(592, 280, [92, 140, 416], [
        ["범주 열", "대치값 (최빈값)", "categories_ → One-Hot 열"],
        ["성별", { t: "남", tone: "teal", weight: 700 }, "남, 여 → 2열"],
        ["흡연", { t: "비흡연", tone: "teal", weight: 700 }, "과거, 비흡연, 현재 → 3열"],
        ["지역", { t: "경기", tone: "teal", weight: 700 }, "경기, 대구, 부산, 서울 → 4열"]
      ], { rh: 24, size: 13 });

      k.section(40, 398, "③ transform 결과 (12열)와 특성 선택 — SelectKBest(f_classif, k = 6)");
      var Z = [[-0.63, -0.45, -0.42, 1, 0, 0, 0, 1, 0, 0, 0, 1], [0.93, 0.01, 0.72, 0, 1, 0, 1, 0, 1, 0, 0, 0], [0.00, -0.57, -0.85, 1, 0, 1, 0, 0, 0, 0, 1, 0], [-1.28, -0.69, -1.45, 0, 1, 0, 1, 0, 0, 0, 0, 1]];
      var Fs = [10.974, 5.074, 27.233, 3.462, 3.462, 0.057, 1.096, 0.938, 0.145, 3.889, 1.667, 0.606];
      var sel = [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0];
      var cols = ["나이", "혈당", "BMI", "남", "여", "과거", "비흡연", "현재", "경기", "대구", "부산", "서울"];
      var data = Z.concat([Fs]);
      var mx = 140, cw = 66;
      [["수치 (스케일링)", 0, 3, "blue"], ["성별", 3, 2, "gray"], ["흡연", 5, 3, "gray"], ["지역", 8, 4, "gray"]].forEach(function (g) {
        k.rect(mx + g[1] * cw + 2, 418, g[2] * cw - 4, 4, { tone: g[3], fill: "solid", r: 2 });
        k.text(mx + (g[1] + g[2] / 2) * cw, 436, g[0], { size: 11.5, weight: 700, anchor: "middle", color: "muted" });
      });
      k.matrix(mx, 462, data, { cw: cw, ch: 27, size: 13, cols: cols, rows: ["#1", "#2", "#3", "#4", "F 점수"],
        tones: function (i, j) { return i === 4 ? (sel[j] ? "orange" : "gray") : (sel[j] ? "blue" : "gray"); },
        fills: function (i, j) { return i === 4 ? (sel[j] ? "solid" : "tone") : (sel[j] ? "tone" : "plain"); },
        fmt: function (v, i) { return i === 4 ? v.toFixed(2) : (Math.abs(v) < 1e-9 ? "0" : (v % 1 === 0 ? String(v) : v.toFixed(2).replace("-", "−"))); } });
      k.text(mx + 7 * cw, 618, "주황 = F 점수 상위 6열 선택 → 나이 · 혈당 · BMI · 성별_남 · 성별_여 · 지역_대구", { size: 12.5, weight: 700, anchor: "middle", tone: "orange" });
      k.note(960, 462, 280, 64, { tone: "teal", title: "#3 나이 NaN → 51.90 → z = 0.00", body: "대치값이 평균이라 표준화하면 정확히 0" });
      k.note(960, 534, 280, 64, { tone: "blue", title: "#4 흡연 NaN → '비흡연'", body: "최빈값 대치 후 One-Hot → [0, 1, 0]" });

      k.section(40, 654, "④ 모델 fit");
      k.flow(176, 636, [
        { t: "LogisticRegression C = 1.0", s: "선택된 6열로 학습", tone: "purple" },
        { t: "Train 정확도 12 / 12 = 100%", s: "학습 성능", tone: "blue" },
        { t: "Test 4행 정확도 3 / 4 = 75%", s: "#13 P = 0.338 → 0 (실제 1)", tone: "orange" },
        { t: "새 환자 → predict", s: "transform만, 다시 fit 안 함", tone: "green", fill: "solid" }
      ], { w: 1064, h: 52, gap: 22, size: 13 });
    }
  });

  /* ---------------- (3) 누수 · 교차검증 × 튜닝 ---------------- */
  DSDiagram.register({
    id: "feature-pipeline-3", sim: "feature-pipeline", order: 3,
    title: "특성 공학 (3) — 데이터 누수 방지와 교차검증 × 튜닝", short: "누수 방지 · 교차검증",
    sub: "지도학습 절차 6단계 중 특성 공학은 4단계 '학습' 안에서 fit 직전에 일어난다 — 전처리 fit은 반드시 Train 부분에서만",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 지도학습의 실무적 절차 6단계");
      var steps = [["STEP 01", "데이터 핸들링", "불러오기 · 정리 · 병합", "blue"], ["STEP 02", "Y · X 지정", "y = 질환, X = 나머지 6열", "blue"], ["STEP 03", "Train / Test 분할", "Test는 끝까지 잠금", "teal"],
        ["STEP 04", "학습 수행", "특성 공학 → fit (Pipeline)", "purple"], ["STEP 05", "성능 평가", "학습 성능 vs 일반화 성능", "orange"], ["STEP 06", "새 데이터 입력", ".pkl 저장 → predict()", "green"]];
      steps.forEach(function (s, i) {
        var x = 40 + i * 203, w = 186;
        k.panel(x, 166, w, 90, { tone: s[3], head: "solid", title: s[0], titleSize: 13, headH: 28 });
        k.text(x + 14, 220, s[1], { size: 15, weight: 800, tone: s[3] });
        k.text(x + 14, 242, s[2], { size: 12, color: "ink", weight: i === 3 ? 800 : 400 });
        if (i < 5) k.arrow(x + w + 2, 209, x + 201, 209, { tone: "gray", width: 1.6, headSize: 7 });
      });

      /* ② 누수 */
      k.section(40, 290, "② 데이터 누수 — 순서가 점수를 바꾼다");
      k.panel(40, 304, 580, 116, { tone: "red", head: "solid", title: "잘못: 전체 16행으로 fit → 분할", headH: 30 });
      k.lines(58, 358, ["Test 4행(#13~#16)이 스케일링 fit에 들어감", { t: "혈당 평균 127.58 → **124.25** 로 바뀜 = Test를 미리 본 것", tone: "red", color: "tone" }, { t: "(1531 + 457) / 16 = 124.25", color: "muted", size: 12 }], { size: 13.5, lh: 22 });
      k.panel(40, 430, 580, 84, { tone: "green", head: "solid", title: "올바름: 분할 → Train 12행으로만 fit", headH: 30 });
      k.text(58, 484, "pipe.fit(X_train, y_train) → pipe.score(X_test, y_test)  · 순서가 자동으로 지켜짐", { size: 13, color: "ink" });
      k.text(58, 546, "실험: 순수 잡음 1000열 · y 무작위(50 : 50) · 80명 · SelectKBest(k=10)", { size: 12.5, weight: 700, color: "ink" });
      var bars = [["잘못된 순서 (전체로 선택 → CV)", 78.8, "red"], ["올바른 순서 (Pipeline 안에서 CV)", 56.3, "green"], ["실제 성능 (새 데이터 2,000명)", 49.8, "gray"]];
      bars.forEach(function (b, i) {
        var y = 560 + i * 34;
        k.text(58, y + 18, b[0], { size: 12.5, color: "ink" });
        k.rect(300, y + 4, b[1] / 100 * 260, 22, { tone: b[2], fill: "solid", r: 3 });
        k.text(612, y + 20, b[1].toFixed(1) + "%", { size: 13, weight: 800, anchor: "end", tone: b[2] });
      });
      k.path("M" + (300 + 130) + " 556 V666", { tone: "gray", width: 1.2, dash: "4 3" });
      k.text(430, 682, "찍기 50%", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(620, 700, "y를 쓰는 단계(특성 선택 · 샘플링)에서 누수가 특히 크다 — 28.9%p 부풀림", { size: 12.5, weight: 800, anchor: "end", tone: "red" });

      /* ③ GridSearchCV */
      k.section(650, 290, "③ GridSearchCV — 조합마다 K번 fit → 평균으로 고르기");
      k.formula(650, 304, 590, 52, "C [0.01, 0.1, 1.0] × scaler [Std, MinMax] × k [3, 5, 8] = 18조합\n18조합 × 5 fold = **90번 fit** + 최적 조합 refit 1번", { size: 13, align: "left" });
      for (var r = 0; r < 5; r++) {
        for (var q = 0; q < 5; q++) {
          var v = q === r;
          k.rect(666 + q * 58, 372 + r * 26, 54, 21, { tone: v ? "teal" : "blue", fill: v ? "solid" : "tone", r: 3 });
          k.text(666 + q * 58 + 27, 372 + r * 26 + 15, v ? "Valid" : "Train", { size: 11.5, weight: 700, anchor: "middle", color: v ? "on" : "ink" });
        }
      }
      k.rect(966, 372, 64, 125, { tone: "gray", fill: "mid", r: 6 });
      k.text(998, 430, "Test", { size: 13, weight: 800, anchor: "middle", color: "ink" });
      k.text(998, 450, "학습 X", { size: 11.5, weight: 700, anchor: "middle", tone: "red" });
      k.text(806, 516, "fold마다 Pipeline 전체를 Train 부분으로 새로 fit", { size: 12, anchor: "middle", color: "muted" });
      k.box(1046, 372, 194, 125, { tone: "purple", fill: "tone", title: "최적 조합", lines: [{ t: "C = 0.1", size: 13 }, { t: "StandardScaler", size: 13 }, { t: "k = 8", size: 13 }, { t: "CV 평균 0.713", size: 13, weight: 800, tone: "purple" }], size: 15 });
      k.text(1240, 516, "데이터 200행 → Train 160 / Test 40", { size: 11.5, anchor: "end", color: "muted" });

      k.table(666, 536, [200, 130, 130, 114], [
        ["점수", "학습 성능", "일반화 성능", "차이"],
        ["시뮬레이터 (C = 0.1)", "74.4%", "57.5%", "16.9%p"],
        [{ t: "강의 예 (과적합)", tone: "orange" }, "97%", "55%", { t: "42%p", tone: "orange", weight: 800 }]
      ], { rh: 28, size: 13 });
      k.note(650, 630, 590, 62, { tone: "purple", title: "Validation은 학습 과정에 참여, Test는 끝까지 격리", body: "best_estimator_ = 전처리 규칙 + 모델 → joblib.dump 후 새 데이터에 predict만 호출" });
    }
  });
})();
