/* 랜덤포레스트 — 알고리즘 구성도 (시뮬레이터 기본 예제: 환자 표 20행 · 트리 #1, 환자 210명 · 특성 8개, 반달 데이터 B=20) */
(function () {
  var L = "Machine Learning";

  /* ---------------- (1) 부트스트랩 ---------------- */
  DSDiagram.register({
    id: "random-forest-1", sim: "random-forest", order: 1,
    title: "랜덤포레스트 (1) — 부트스트랩 샘플링과 OOB", short: "부트스트랩과 OOB",
    sub: "Bagging · 트리마다 학습 행을 복원추출로 새로 뽑아 서로 다른 데이터로 키운다 — 환자 표 20행, 트리 #1 예제",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 숲의 구조 — 같은 데이터에서 서로 다른 트리 B그루");
      k.panel(40, 168, 1200, 150, { tone: "blue", tinted: true });
      var data = k.box(64, 196, 178, 96, { tone: "blue", fill: "solid", title: "학습 데이터", sub: "환자 n행 · 특성 8개", size: 17 });
      var ys = [182, 228, 274], names = ["부트스트랩 #1", "부트스트랩 #2", "부트스트랩 #B"], tn = ["트리 #1", "트리 #2", "트리 #B"];
      var trees = [];
      ys.forEach(function (y, i) {
        var b = k.box(318, y, 206, 36, { tone: "orange", fill: "tone", title: names[i] + "  (n번 복원추출)", size: 13 });
        var t = k.box(600, y, 206, 36, { tone: "blue", fill: "plain", title: tn[i] + "  (노드마다 특성 k개)", size: 13 });
        k.arrow(data.r[0] + 4, data.cy, b.l[0] - 4, b.cy, { tone: "orange", width: 1.8 });
        k.link([b.r[0] + 4, b.cy], [t.l[0] - 4, t.cy], { tone: "gray", width: 1.6 });
        trees.push(t);
      });
      var agg = k.box(884, 206, 162, 76, { tone: "purple", fill: "tone", title: "모으기", lines: [{ t: "다수결 · 확률 평균", size: 13 }], size: 16 });
      trees.forEach(function (t) { k.arrow(t.r[0] + 4, t.cy, agg.l[0] - 4, agg.cy, { tone: "purple", width: 1.6 }); });
      var out = k.box(1084, 216, 132, 56, { tone: "green", fill: "solid", title: "예측", sub: "질환 0 / 1", size: 16 });
      k.link([agg.r[0] + 4, agg.cy], [out.l[0] - 4, out.cy], { tone: "green" });

      k.section(40, 352, "② 트리 #1의 학습 데이터 — 20행에서 20번 복원추출");
      k.text(590, 352, "한 행을 뽑아 적고 다시 제자리에 넣는다 → 같은 행이 여러 번, 안 뽑히는 행도 생김", { size: 13, color: "muted" });
      var draws = [15, 15, 9, 1, 12, 17, 3, 12, 13, 18, 19, 17, 17, 20, 5, 20, 11, 19, 11, 2];
      var cnt = []; for (var i = 0; i < 20; i++) cnt.push(0);
      draws.forEach(function (d) { cnt[d - 1]++; });
      var seen = {};
      var dt = draws.map(function (d) { var r = seen[d] ? "amber" : "blue"; seen[d] = 1; return r; });
      var cols = []; for (var c = 1; c <= 20; c++) cols.push(String(c));
      k.matrix(176, 394, [draws], { cw: 42, ch: 30, size: 14, cols: cols.map(function (c) { return c + "회"; }), rows: ["뽑은 행 번호"], tones: function (i, j) { return dt[j]; }, fills: function (i, j) { return dt[j] === "amber" ? "mid" : "tone"; } });
      k.matrix(176, 458, [cnt], { cw: 42, ch: 30, size: 14, cols: cols, rows: ["행별 뽑힌 횟수"], tones: function (i, j, v) { return v === 0 ? "teal" : "blue"; }, fills: function (i, j, v) { return v === 0 ? "mid" : v >= 2 ? "mid" : "tone"; }, fmt: function (v) { return v === 0 ? "OOB" : "×" + v; } });
      k.text(176, 520, "윗줄: 칸 위 = 몇 번째 뽑기, 이미 나온 행이 또 뽑히면 노란 칸   ·   아랫줄: 칸 위 = 환자 행 번호 1~20", { size: 12, color: "muted" });
      k.note(1046, 380, 194, 52, { tone: "blue", title: "in-bag 13행 (65%)", body: "트리 #1이 학습에 쓰는 행" });
      k.note(1046, 440, 194, 68, { tone: "teal", title: "OOB 7행 (35%)", body: "4 · 6 · 7 · 8 · 10 · 14 · 16번 = 트리 #1이 못 본 문제" });

      k.section(40, 562, "③ 왜 약 63.2%인가");
      k.formula(40, 576, 600, 74, "P(한 행이 n번 모두 안 뽑힘) = (1 − 1/n)ⁿ\nn = 20 → 0.95²⁰ = **0.358**   ·   n → ∞ → 1/e = **0.368**", { size: 16 });
      k.box(660, 576, 280, 74, { tone: "blue", fill: "tone", title: "in-bag ≈ 63.2%", sub: "20행이면 이론값 64.2% · 트리 #1은 13/20", size: 16 });
      k.box(960, 576, 280, 74, { tone: "teal", fill: "tone", title: "OOB ≈ 36.8%", sub: "트리마다 다른 행 → 검증 데이터처럼 채점 (3장)", size: 16 });
      k.flow(40, 664, ["부트스트랩 (행)", "특성 무작위 (열)", "트리 B그루 학습", "다수결 · 확률 평균", "OOB 오차로 평가"], { label: "랜덤포레스트 순서", h: 34, size: 13 });
    }
  });

  /* ---------------- (2) 특성 무작위 선택 ---------------- */
  DSDiagram.register({
    id: "random-forest-2", sim: "random-forest", order: 2,
    title: "랜덤포레스트 (2) — 노드마다 특성 무작위 선택", short: "특성 무작위 선택",
    sub: "max_features · 분할할 때마다 특성 일부만 후보로 보게 해서 트리끼리 덜 닮게 만든다 — 환자 훈련 데이터 210명 · 특성 8개",
    label: L,
    draw: function (k) {
      k.section(40, 152, "① 한 노드에서 일어나는 일 — max_features = sqrt → 8개 중 2개만 후보");
      k.panel(40, 168, 1200, 222, { tone: "blue", tinted: true });
      var feats = ["나이", "BMI", "혈당", "혈압", "콜레", "흡연", "운동", "가족력"], pick = { 1: 1, 3: 1 };
      k.text(64, 200, "전체 특성 8개", { size: 13, weight: 800, color: "ink" });
      feats.forEach(function (f, i) {
        var x = 64 + (i % 4) * 92, y = 212 + Math.floor(i / 4) * 40;
        k.box(x, y, 82, 30, { tone: pick[i] ? "purple" : "gray", fill: pick[i] ? "solid" : "soft", title: f, size: 13, r: 15 });
      });
      k.text(64, 312, "이번 노드에서 무작위로 고른 후보 = BMI · 혈압 (보라)", { size: 12.5, color: "muted" });
      k.text(64, 334, "다음 노드에서는 다시 새로 2개를 뽑는다", { size: 12.5, color: "muted" });
      k.text(64, 362, "→ 트리마다 · 노드마다 보는 특성이 달라진다", { size: 13, weight: 800, tone: "purple" });
      k.arrow(442, 262, 494, 262, { tone: "purple", label: "후보만 비교" });

      /* 지니 계산 미니 트리 (시뮬레이터 2번 탭 루트 노드) */
      var par = k.box(520, 184, 268, 58, { tone: "blue", fill: "plain", title: "부모 노드  n = 210", sub: "없음 123 · 있음 87  →  지니 0.4853", size: 14 });
      var lf = k.box(506, 300, 200, 70, { tone: "blue", fill: "tone", title: "BMI ≤ 27.55", lines: [{ t: "n=162 (116 / 46)", size: 12.5 }, { t: "지니 0.4066", size: 12.5, weight: 700 }], size: 14 });
      var rt = k.box(724, 300, 200, 70, { tone: "orange", fill: "tone", title: "BMI > 27.55", lines: [{ t: "n=48 (7 / 41)", size: 12.5 }, { t: "지니 0.2491", size: 12.5, weight: 700 }], size: 14 });
      k.arrow(610, 242, 606, 298, { tone: "blue" }); k.arrow(700, 242, 824, 298, { tone: "orange" });
      k.box(946, 184, 278, 186, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "지니 불순도로 기준 고르기", titleColor: "ink", size: 14.5, subSize: 13,
        lines: [{ t: "지니 = 1 − p₀² − p₁²" }, { t: "부모 1 − (123/210)² − (87/210)² = 0.4853" }, { t: "가중 평균 = 162/210 × 0.4066", tone: "blue" }, { t: "  + 48/210 × 0.2491 = 0.3706", tone: "blue" }, { t: "불순도 감소 = 0.4853 − 0.3706 = **0.1147**", tone: "purple" }, { t: "후보 2개 중 감소가 큰 기준을 채택", color: "muted" }] });

      k.section(40, 424, "② max_features 값 (특성 p = 8)");
      k.table(56, 438, [150, 130, 260], [
        ["설정", "후보 수 k", "의미"],
        ["\"sqrt\" (분류 기본)", "⌊√8⌋ = 2", "가장 강한 무작위성"],
        ["\"log2\"", "⌊log₂8⌋ = 3", "중간"],
        ["None (전체)", "8", "= 배깅한 결정 트리"],
        ["정수 3", "3", "직접 지정"]
      ], { rh: 28, size: 13 });
      k.note(56, 588, 540, 52, { tone: "purple", title: "k를 줄이면", body: "트리 한 그루는 약해지지만 서로 덜 닮아 평균의 오차가 더 잘 상쇄된다" });

      k.section(640, 424, "③ 무작위성이 다양성을 만든다 — 트리 40그루 실험");
      k.table(656, 438, [80, 110, 140, 80, 88, 86], [
        ["k", "뿌리 종류", "최다 뿌리 특성", "상관 ρ", "1그루", "숲"],
        ["1", "7종", "나이 30%", "0.216", "65.1%", "73.3%"],
        ["2 sqrt", "8종", "혈압 30%", "0.251", "66.3%", "72.2%"],
        [{ t: "3 log2", tone: "purple" }, "5종", "혈당 43%", "0.298", "68.8%", { t: "83.3%", tone: "purple", weight: 800 }],
        ["8 전체", "3종", "혈당 88%", "0.379", "70.4%", "81.1%"]
      ], { rh: 28, size: 13 });
      k.text(656, 590, "ρ = 트리 두 그루 예측의 상관 평균 · 1그루 / 숲 = 검증 정확도 (검증 90명)", { size: 12, color: "muted" });
      k.text(656, 612, "전체(k=8)를 보면 88%의 트리가 혈당으로 시작 → 모두 비슷한 트리", { size: 12.5, weight: 700, tone: "red" });

      k.formula(40, 650, 1200, 46, "트리 B그루 평균의 분산 = **ρσ²** + (1 − ρ)σ² / B     →  B = 100일 때  ρ = 0.379 → 0.385σ²  ·  ρ = 0.251 → 0.258σ²   (ρσ² 아래로는 안 내려감)", { size: 15 });
    }
  });

  /* ---------------- (3) 다수결 · OOB · 중요도 ---------------- */
  DSDiagram.register({
    id: "random-forest-3", sim: "random-forest", order: 3,
    title: "랜덤포레스트 (3) — 다수결 · OOB 오차 · 특성 중요도", short: "다수결 · OOB · 중요도",
    sub: "트리 B그루의 표를 모으고, 각 행은 그 행을 안 본 트리로만 채점하며, 특성이 얼마나 중요했는지 두 방식으로 잰다",
    label: L,
    draw: function (k) {
      /* ① 다수결 */
      k.section(40, 152, "① 예측 — 트리 20그루의 투표");
      k.panel(40, 168, 380, 268, { tone: "purple", head: "soft", title: "반달 데이터 · 위치 (−0.84, 0.72)", tinted: false });
      for (var i = 0; i < 20; i++) {
        var on = i < 12, x = 64 + (i % 10) * 34, y = 220 + Math.floor(i / 10) * 38;
        k.rect(x, y, 28, 30, { tone: on ? "orange" : "blue", fill: on ? "solid" : "tone", r: 5 });
        k.text(x + 14, y + 20, String(i + 1), { size: 12, weight: 700, anchor: "middle", color: on ? "on" : "ink" });
      }
      k.text(64, 312, "주황 = 클래스 1에 투표 12표 · 파랑 = 클래스 0에 8표", { size: 12.5, color: "muted" });
      k.box(60, 326, 340, 44, { tone: "orange", fill: "tone", title: "다수결 12 : 8 → 투표 비율 0.600", size: 14 });
      k.box(60, 378, 340, 44, { tone: "purple", fill: "tone", title: "확률 평균 12.00 / 20 = 0.600 → 1", sub: "scikit-learn predict_proba 방식", size: 13.5, subSize: 11.5 });

      /* ② OOB */
      k.section(440, 152, "② OOB 오차 — 검증 데이터 없이 채점");
      k.panel(440, 168, 400, 268, { tone: "teal", head: "soft", title: "훈련 행 1 (정답 1) · 이 행이 OOB인 트리", tinted: false });
      var tr = ["#1", "#2", "#9", "#10", "#15", "#16", "#20"], pv = [1, 1, 0, 1, 0, 1, 1];
      k.matrix(470, 238, [pv], { cw: 48, ch: 32, cols: tr, size: 14, tones: function (a, j, v) { return v ? "orange" : "blue"; } });
      k.text(470, 290, "20그루 중 7그루(35%)가 행 1을 학습에 쓰지 않았다", { size: 12.5, color: "muted" });
      k.formula(458, 302, 364, 40, "OOB 확률 = 5.00 / 7 = **0.714** → 예측 1 (맞음)", { size: 14.5 });
      k.formula(458, 352, 364, 58, "OOB 오차 = 틀린 행 / 채점 가능한 행\n= 16 / 168 = **0.0952**", { size: 14.5 });
      k.text(640, 428, "같은 숲의 검증 오차 9.7% 와 거의 같다", { size: 12.5, weight: 700, anchor: "middle", tone: "teal" });

      /* ③ 중요도 */
      k.section(860, 152, "③ 특성 중요도 — 100그루");
      k.panel(860, 168, 380, 268, { tone: "orange", head: "soft", title: "MDI  vs  순열 중요도 (검증)", tinted: false });
      var F = [["혈당", 0.247, 0.116], ["BMI", 0.170, 0.022], ["수축기 혈압", 0.152, 0.011], ["나이", 0.126, 0.013], ["무작위 번호", 0.097, -0.018], ["콜레스테롤", 0.092, -0.020]];
      k.text(1010, 226, "MDI", { size: 12, weight: 800, tone: "blue", anchor: "middle" });
      k.text(1160, 226, "순열", { size: 12, weight: 800, tone: "orange", anchor: "middle" });
      F.forEach(function (f, j) {
        var y = 236 + j * 30, noise = f[0] === "무작위 번호";
        k.text(966, y + 15, f[0], { size: 12.5, anchor: "end", weight: noise ? 800 : 400, tone: noise ? "red" : null, color: noise ? "tone" : "ink" });
        k.rect(974, y + 3, f[1] / 0.25 * 70, 16, { tone: "blue", fill: "solid", r: 2 });
        k.text(974 + f[1] / 0.25 * 70 + 4, y + 15, f[1].toFixed(3), { size: 11.5, color: "muted" });
        var base = 1136, w = f[2] / 0.12 * 50;
        k.rect(w >= 0 ? base : base + w, y + 3, Math.max(Math.abs(w), 1.5), 16, { tone: "orange", fill: "solid", r: 2 });
        k.text(w >= 0 ? base + w + 4 : base + 4, y + 15, (f[2] < 0 ? "−" : "") + Math.abs(f[2]).toFixed(3), { size: 11.5, color: "muted" });
      });
      k.path("M1136 232 V418", { tone: "gray", width: 1 });
      k.text(1050, 428, "잡음 열이 MDI 5위, 순열 중요도는 0 아래", { size: 12.5, weight: 700, anchor: "middle", tone: "red" });

      /* ④ 비교 */
      k.section(40, 474, "④ 정리 — 결정 트리 · 배깅 · 랜덤포레스트");
      k.table(56, 488, [170, 230, 250, 290, 244], [
        ["구분", "행 (데이터)", "열 (특성)", "효과", "평가"],
        ["결정 트리", "전체 1번", "노드마다 전부", "깊으면 분산 큼 (과적합)", "검증 데이터"],
        ["배깅", "부트스트랩 B번", "노드마다 전부 (k = p)", "분산 ↓, 트리끼리 닮음 (ρ 큼)", "OOB 가능"],
        [{ t: "랜덤포레스트", tone: "purple" }, "부트스트랩 B번", "노드마다 k개 (sqrt)", "ρ ↓ → 평균의 분산 더 ↓", "OOB · 두 가지 중요도"]
      ], { rh: 30, size: 13.5 });
      k.note(40, 622, 590, 72, { tone: "blue", title: "MDI (feature_importances_)", body: "분할마다 줄인 지니 × 노드 크기를 특성별로 더함 (합 = 1)\n훈련 중에 계산 → 값 종류가 많은 잡음 열이 부풀려질 수 있음" });
      k.note(650, 622, 590, 72, { tone: "orange", title: "순열 중요도 (permutation_importance)", body: "검증 데이터에서 그 열만 무작위로 섞은 뒤 정확도가 얼마나 떨어지는지\n정답과 무관한 열은 0 근처 → 잡음을 가려낸다" });
    }
  });
})();
