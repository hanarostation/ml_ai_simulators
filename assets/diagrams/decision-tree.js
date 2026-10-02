/* 의사결정나무 — 알고리즘 구성도 (분류 트리 · 회귀 트리 · 과적합과 가지치기)
   예제 숫자 = 시뮬레이터 기본 화면 (분류 seed 1 · 50명, 회귀 seed 5 · 40명, 가지치기 seed 3 · 160명, 회귀 과적합 seed 11 · 120명) */
(function () {
  /* 트리 노드 상자 */
  function node(k, x, y, w, h, o) {
    return k.box(x, y, w, h, { tone: o.tone, fill: o.fill || "tone", title: o.title, lines: o.lines, size: o.size || 14, r: 8 });
  }

  DSDiagram.register({
    id: "decision-tree-1", sim: "decision-tree", order: 1,
    title: "의사결정나무 (1) — 분류 트리: 지니 불순도와 정보 이득", short: "분류: 지니 · 정보 이득",
    sub: "Decision Tree Classifier · 특성 하나 · 기준값 하나로 둘로 나눠 자식 노드가 한 클래스로 몰릴수록 좋은 분할 — 모든 후보 중 정보 이득이 가장 큰 것을 고른다 (50명)",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 분할 하나 계산하기 — 나이 ≤ 45");
      k.panel(40, 168, 600, 330, { tone: "blue", tinted: true });
      var P = node(k, 230, 182, 220, 64, { tone: "gray", fill: "plain", title: "부모 50명", lines: [{ t: "정상 22 / 질환 28 · 지니 0.493", size: 12.5 }] });
      var L = node(k, 70, 290, 220, 64, { tone: "blue", title: "나이 ≤ 45 → 12명", lines: [{ t: "정상 8 / 질환 4 · 지니 0.444", size: 12.5 }] });
      var R = node(k, 390, 290, 220, 64, { tone: "orange", title: "나이 > 45 → 38명", lines: [{ t: "정상 14 / 질환 24 · 지니 0.465", size: 12.5 }] });
      k.arrow(P.cx - 40, P.y + P.h, L.cx, L.y, { tone: "blue", label: "예", labelDx: -14 });
      k.arrow(P.cx + 40, P.y + P.h, R.cx, R.y, { tone: "orange", label: "아니오", labelDx: 18 });
      k.lines(60, 378, [
        "지니 = 1 − Σ pₖ²",
        "부모  1 − (22/50)² − (28/50)² = 1 − 0.1936 − 0.3136 = **0.493**",
        "왼쪽  1 − (8/12)² − (4/12)² = 1 − 0.4444 − 0.1111 = **0.444**",
        "오른쪽  1 − (14/38)² − (24/38)² = 1 − 0.1357 − 0.3989 = **0.465**"
      ], { size: 13, lh: 21 });
      k.formula(56, 448, 568, 44, "가중 지니 = 12/50 × 0.444 + 38/50 × 0.465 = 0.460\n정보 이득 = 0.493 − 0.460 = **0.032**", { size: 12.5 });

      k.section(660, 152, "② 엔트로피로 재면 (같은 분할)");
      k.formula(660, 168, 580, 44, "엔트로피 = −Σ pₖ · log₂ pₖ   (0 = 순수, 2클래스 최대 1)", { size: 14 });
      k.table(676, 222, [150, 140, 260], [
        ["노드", "엔트로피", "계산"],
        ["부모 (22 / 28)", "0.990", "−0.44·log₂0.44 − 0.56·log₂0.56"],
        ["왼쪽 (8 / 4)", "0.918", "가중 = 12/50 × 0.918"],
        ["오른쪽 (14 / 24)", "0.949", "　　 + 38/50 × 0.949 = 0.942"],
        [{ t: "정보 이득", tone: "purple" }, { t: "0.048", tone: "purple", weight: 800 }, "0.990 − 0.942 (지니와 순위는 대개 같음)"]
      ], { rh: 26, size: 12.5 });

      k.section(660, 392, "③ 모든 후보 중 이득 최대");
      k.text(676, 414, "후보 기준값 = 정렬한 값들의 가운데 지점 (scikit-learn과 같음)", { size: 12, color: "muted" });
      k.bars(700, 422, 400, 60, [0.032, 0.074, 0.209], { tones: ["gray", "blue", "green"], max: 0.24, fmt: function (v) { return v.toFixed(3); }, gap: 30 });
      var bw3 = (400 - 30 * 4) / 3, bc = function (i) { return 700 + 30 + i * (bw3 + 30) + bw3 / 2; };
      k.text(bc(0), 498, "나이 ≤ 45", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(bc(1), 498, "나이 ≤ 50.5", { size: 11.5, anchor: "middle", color: "muted" });
      k.text(bc(2), 498, "BMI ≤ 25.45", { size: 11.5, anchor: "middle", tone: "green", weight: 800 });
      k.text(676, 522, "특성마다 최적 기준값을 찾고, 그중 이득이 가장 큰 BMI ≤ 25.45가 뿌리", { size: 12.5, weight: 700, tone: "green" });

      k.section(40, 530, "④ 고른 분할로 만든 뿌리 — 2번 화면의 첫 단계");
      var r0 = node(k, 230, 540, 250, 50, { tone: "ink", fill: "plain", title: "BMI ≤ 25.45", lines: [{ t: "샘플 50 · 값 [22, 28] · gini 0.493", size: 12 }], size: 13.5 });
      var r1 = node(k, 56, 616, 270, 54, { tone: "blue", title: "잎 → 정상", lines: [{ t: "샘플 15 · [14, 1] · gini 0.124", size: 12 }], size: 13.5 });
      var r2 = node(k, 384, 616, 270, 54, { tone: "orange", title: "잎 → 질환", lines: [{ t: "샘플 35 · [8, 27] · gini 0.353", size: 12 }], size: 13.5 });
      k.arrow(r0.cx - 40, r0.y + r0.h, r1.cx, r1.y, { tone: "blue" });
      k.arrow(r0.cx + 40, r0.y + r0.h, r2.cx, r2.y, { tone: "orange" });
      k.formula(676, 540, 564, 60, "가중 지니 = 15/50 × 0.124 + 35/50 × 0.353 = 0.284\n정보 이득 = 0.493 − 0.284 = **0.209**", { size: 13.5 });
      k.flow(676, 616, [
        { t: "모든 특성 × 기준값", tone: "blue" }, { t: "이득 최대 분할", tone: "purple" }, { t: "자식마다 반복", tone: "orange" }, { t: "잎 = 다수 클래스", tone: "green" }
      ], { w: 564, h: 54, gap: 16, size: 12.5 });
    }
  });

  DSDiagram.register({
    id: "decision-tree-2", sim: "decision-tree", order: 2,
    title: "의사결정나무 (2) — 회귀 트리: MSE 감소와 계단 예측", short: "회귀: MSE 감소",
    sub: "Decision Tree Regressor · 잎에 든 값의 평균으로 예측 — 좋은 분할 = 양쪽 평균 주변으로 점이 모여 MSE(분산)가 가장 많이 줄어드는 분할 (나이 → 수축기 혈압, 40명)",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 분할 하나 계산하기 — 나이 ≤ 40");
      k.panel(40, 168, 600, 290, { tone: "blue", tinted: true });
      var P = node(k, 220, 182, 240, 60, { tone: "gray", fill: "plain", title: "부모 40명 · 평균 131.6", lines: [{ t: "MSE = 11,987.4 / 40 = 299.7", size: 12.5 }] });
      var L = node(k, 60, 280, 250, 60, { tone: "blue", title: "나이 ≤ 40 → 11명 · 평균 110.9", lines: [{ t: "MSE = 417.3 / 11 = 37.9", size: 12.5 }], size: 13.5 });
      var R = node(k, 370, 280, 250, 60, { tone: "orange", title: "나이 > 40 → 29명 · 평균 139.5", lines: [{ t: "MSE = 5,039.2 / 29 = 173.8", size: 12.5 }], size: 13.5 });
      k.arrow(P.cx - 40, 242, L.cx, 280, { tone: "blue" }); k.arrow(P.cx + 40, 242, R.cx, 280, { tone: "orange" });
      k.lines(60, 368, [
        "MSE(노드) = (1/n) Σ (y − ȳ)²  ← 잎의 예측값 = 평균 ȳ",
        "가중 MSE = 11/40 × 37.9 + 29/40 × 173.8 = **136.4**",
        { t: "MSE 감소 = 299.7 − 136.4 = **163.3** (부모의 54.5%)", tone: "blue", color: "tone" }
      ], { size: 13, lh: 24 });
      k.text(60, 446, "가중 MSE × n = 양쪽 평균선에서 잰 잔차 제곱합 → 최소인 분할을 고름", { size: 12, color: "muted" });

      k.section(660, 152, "② 최적 분할 나이 ≤ 51.5 → 예측선은 계단");
      k.panel(660, 168, 580, 290, { tone: "gray" });
      var x0 = 700, y0 = 190, w = 330, h = 210;
      var PX = function (a) { return x0 + (a - 20) / 62 * w; }, PY = function (v) { return y0 + h - (v - 95) / 70 * h; };
      k.axes(x0, y0, w, h, { x: "나이", y: "혈압" });
      var pts = [[22, 108], [25, 103], [29, 117], [33, 112], [36, 120], [40, 107], [43, 119], [46, 115], [49, 125], [51, 118],
        [53, 140], [56, 136], [58, 151], [61, 143], [64, 155], [67, 138], [70, 152], [73, 147], [76, 160], [79, 148]];
      pts.forEach(function (p) { k.circle(PX(p[0]), PY(p[1]), 4.5, { tone: p[0] <= 51.5 ? "blue" : "orange", fill: "solid" }); });
      k.path("M" + PX(20) + " " + PY(131.6) + " H" + PX(82), { tone: "gray", width: 1.6, dash: "5 4" });
      k.path("M" + PX(20) + " " + PY(114.8) + " H" + PX(51.5) + " V" + PY(145.4) + " H" + PX(82), { tone: "purple", width: 3 });
      k.path("M" + PX(51.5) + " " + (y0 + h) + " V" + y0, { tone: "red", width: 1.4, dash: "4 4" });
      k.text(PX(51.5) + 6, y0 + 14, "나이 ≤ 51.5", { size: 12, weight: 800, tone: "red" });
      k.text(PX(21), PY(114.8) - 8, "114.8", { size: 12, weight: 800, tone: "purple" });
      k.text(PX(81), PY(145.4) + 18, "145.4", { size: 12, weight: 800, anchor: "end", tone: "purple" });
      k.text(PX(81), PY(131.6) + 16, "부모 평균 131.6", { size: 11.5, anchor: "end", color: "muted" });
      k.lines(1048, 206, [
        { t: "왼쪽 18명", weight: 800, tone: "blue", color: "tone" }, "평균 114.8", "MSE 53.9",
        { t: "오른쪽 22명", weight: 800, tone: "orange", color: "tone" }, "평균 145.4", "MSE 81.3",
        { t: "가중 MSE 69.0", weight: 800 }, { t: "감소 230.7", weight: 800, tone: "green", color: "tone" }, { t: "학습 R² 0.770", tone: "green", color: "tone" }
      ], { size: 12.5, lh: 21 });
      k.text(676, 446, "18/40 × 53.9 + 22/40 × 81.3 = 69.0 · R² = 1 − 69.0/299.7 = 0.770 (그림은 개념도)", { size: 12, color: "muted" });

      k.section(40, 492, "③ 분류 트리 vs 회귀 트리 — 나누는 방법은 같고, 잎의 값과 분할 기준만 다르다");
      k.table(56, 506, [150, 500, 518], [
        ["구분", "분류 트리 (DecisionTreeClassifier)", "회귀 트리 (DecisionTreeRegressor)"],
        ["맞히는 값", "범주 (질환 여부 0 / 1)", "숫자 (수축기 혈압, 연간 의료비)"],
        ["잎의 예측값", "다수 클래스 (확률 = 클래스 비율)", "잎에 든 샘플의 평균"],
        ["분할 기준", "지니 1 − Σp² 또는 엔트로피 −Σp·log₂p", "MSE(분산) (1/n)·Σ(y − ȳ)²  (criterion=\"squared_error\")"],
        ["좋은 분할", "정보 이득 = 부모 불순도 − 가중 자식 불순도 최대", "MSE 감소 = 부모 MSE − 가중 자식 MSE 최대"],
        ["예측의 모양", "축에 평행한 사각형 영역", "계단 함수 (학습 구간 밖에서는 끝 계단 값만 반복)"],
        ["과적합 신호", "학습 정확도 1.0, 검증 정확도 하락", "학습 MSE → 0, 검증 MSE 상승"]
      ], { rh: 27, size: 12.5 });
    }
  });

  DSDiagram.register({
    id: "decision-tree-3", sim: "decision-tree", order: 3,
    title: "의사결정나무 (3) — 과적합과 가지치기 · 특성 중요도", short: "가지치기 · 중요도",
    sub: "나무는 끝까지 자라면 잡음까지 외운다 — 깊이 · 잎 크기로 미리 멈추고(사전 가지치기) 검증 성능으로 깊이를 고른다 · 중요도 = 불순도 감소의 합",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 멈춤 조건 (사전 가지치기)");
      [["max_depth", "최대 깊이 (화면 기본 3)", "blue"], ["min_samples_split", "나눌 최소 샘플 (2)", "purple"], ["min_samples_leaf", "잎의 최소 샘플 (1)", "teal"], ["순수한 노드", "한 클래스뿐이면 멈춤", "gray"]].forEach(function (c, i) {
        k.box(40 + i * 152, 168, 148, 64, { tone: c[2], title: c[0], sub: c[1], size: 11.5, subSize: 11.5 });
      });
      k.note(40, 244, 600, 46, { tone: "red", title: "사후 가지치기: 다 키운 뒤 잘라 내기 → ccp_alpha (비용 복잡도)", size: 13 });

      k.section(660, 152, "② 분류: max_depth별 정확도 (160명, 라벨 잡음 12%)");
      k.panel(660, 168, 580, 296, { tone: "gray" });
      var x0 = 710, y0 = 190, w = 300, h = 200;
      var DX = function (d) { return x0 + (d - 1) / 11 * w; }, AY = function (a) { return y0 + h - (a - 0.6) / 0.42 * h; };
      k.axes(x0, y0, w, h);
      [0.6, 0.7, 0.8, 0.9, 1.0].forEach(function (t) { k.text(x0 - 6, AY(t) + 4, t.toFixed(1), { size: 11.5, anchor: "end", color: "muted" }); k.path("M" + x0 + " " + AY(t) + " H" + (x0 + w), { tone: "gray", width: 0.8, dash: "2 4" }); });
      [1, 3, 6, 9, 12].forEach(function (t) { k.text(DX(t), y0 + h + 16, String(t), { size: 11.5, anchor: "middle", color: "muted" }); });
      k.text(x0 + w, y0 + h + 32, "max_depth", { size: 12, anchor: "end", color: "muted" });
      var TR = [0.777, 0.821, 0.902, 0.911, 0.946, 0.955, 0.973, 0.991, 0.991, 1.0, 1.0, 1.0], VA = [0.646, 0.646, 0.854, 0.833, 0.833, 0.833, 0.813, 0.792, 0.792, 0.792, 0.792, 0.792];
      [[TR, "blue"], [VA, "orange"]].forEach(function (c) {
        k.path(c[0].map(function (v, i) { return (i ? "L" : "M") + DX(i + 1).toFixed(1) + " " + AY(v).toFixed(1); }).join(" "), { tone: c[1], width: 2.6 });
        c[0].forEach(function (v, i) { k.circle(DX(i + 1), AY(v), 3.5, { tone: c[1], fill: "solid" }); });
      });
      k.raw('<g class="dg-t-green"><circle class="dg-stroke" cx="' + DX(3).toFixed(1) + '" cy="' + AY(0.854).toFixed(1) + '" r="9" style="fill:none;stroke-width:2"/></g>');
      k.text(DX(3.2), AY(0.765), "검증 최고 0.854 (깊이 3)", { size: 12, weight: 800, tone: "green" });
      k.lines(1030, 210, [
        { t: "━ 학습", weight: 800, tone: "blue", color: "tone" },
        { t: "━ 검증", weight: 800, tone: "orange", color: "tone" },
        { t: "깊이 3: 검증 최고", tone: "green", color: "tone", weight: 800 },
        "깊이 3: 0.902 / 0.854",
        "　잎 8개 · 차이 0.048",
        { t: "깊이 12: 1.000 / 0.792", tone: "red", color: "tone", weight: 800 },
        "　잡음까지 외움 (잎 27개)"
      ], { size: 12.5, lh: 22 });
      k.text(676, 448, "학습 112명 / 검증 48명 · 깊이 10 이후는 잎이 모두 순수해 더 자라지 않음", { size: 11.5, color: "muted" });

      k.section(40, 324, "③ 회귀: 깊을수록 점 하나하나를 따라가는 계단 (120명)");
      k.table(56, 340, [130, 110, 110, 110, 140], [
        ["max_depth", "학습 MSE", "검증 MSE", "계단 수", "판단"],
        ["1", "68.1", "56.0", "2", { t: "과소적합", tone: "purple" }],
        [{ t: "2", tone: "green" }, "22.8", { t: "26.8", tone: "green", weight: 800 }, "4", { t: "검증 최저 · R² 0.889", tone: "green" }],
        ["3", "19.5", "29.8", "8", "적당"],
        [{ t: "12", tone: "red" }, "11.6", { t: "41.8", tone: "red", weight: 800 }, "45", { t: "과적합", tone: "red" }],
        [{ t: "선형회귀", tone: "gray" }, "31.7", "43.8", "직선", "계단형 관계를 못 담음"]
      ], { rh: 22, size: 12.5 });

      k.section(40, 494, "④ 특성 중요도 — 불순도 감소의 합 (분류, 깊이 4 트리 · 분할 11개)");
      k.formula(40, 510, 1200, 44, "중요도(특성) = Σ 그 특성으로 나눈 노드 t  (Nₜ/N) × [ I(t) − (N_L/Nₜ)·I(L) − (N_R/Nₜ)·I(R) ]  → 합이 1이 되도록 나눔", { size: 13.5 });
      k.table(56, 566, [70, 130, 60, 100, 140], [
        ["노드", "조건", "Nₜ", "gini I(t)", "기여 (Nₜ/N)·감소"],
        ["#0", "BMI ≤ 27.85", "112", "0.473", { t: "0.1264", tone: "blue", weight: 800 }],
        ["#4", "나이 ≤ 52.5", "23", "0.454", { t: "0.0773", tone: "orange", weight: 800 }],
        ["#2", "나이 ≤ 48", "34", "0.360", { t: "0.0643", tone: "orange", weight: 800 }],
        ["…", "나머지 8개 분할", "", "", { t: "작은 기여", color: "muted" }]
      ], { rh: 25, size: 12.5 });
      k.formula(600, 566, 330, 62, "#0: 112/112 × (0.473 − 0.347) = 0.126\n#4: 23/112 × (0.454 − 0.077) = 0.077", { size: 13 });
      k.bars(960, 570, 260, 100, [0.498, 0.502], { labels: ["나이 (합 0.1736)", "BMI (합 0.1751)"], tones: ["orange", "blue"], max: 0.6, fmt: function (v) { return v.toFixed(3); }, gap: 40 });
      k.text(600, 652, "뿌리 근처(샘플이 많은) 분할의 기여가 큼", { size: 12.5, weight: 700, tone: "purple" });
      k.text(600, 674, "중요도는 '얼마나 쓰였나'이지 인과 효과가 아님", { size: 12.5, weight: 700, color: "muted" });
    }
  });
})();
