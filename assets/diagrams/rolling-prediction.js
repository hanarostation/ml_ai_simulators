/* 롤링 예측 (Time Shift · Walk-forward) — 알고리즘 구성도
   색: 학습 = 파랑, 예측(목표) = 주황, 실제 = 회색, 누수 · NaN = 빨강, 롤링 특성 = 보라, 달력 특성 = 청록 */
(function () {
  var LABEL = "Time Series";
  var NaN_ = "NaN";

  /* ------------------------------------------------------------ (1) Time Shift */
  DSDiagram.register({
    id: "rolling-prediction-1", sim: "rolling-prediction", order: 1,
    title: "롤링 예측 (1) — Time Shift: 시계열을 지도학습 표로", short: "Time Shift 표 만들기",
    sub: "행 하나 = 하루 t · 특성은 shift(k)로 과거를 아래로 밀고, 목표는 shift(−h)로 미래를 위로 당긴다 · 예: 일별 응급실 내원 환자 수 (2026-07-01부터, seed 7)",
    label: LABEL,
    draw: function (k) {
      k.section(40, 150, "① 시뮬레이터 표의 앞 8일 (lag K = 3, 롤링 창 w = 3, 목표 h = 3)", { tone: "blue" });
      var rows = [
        ["07-01(수)", 120, NaN_, NaN_, NaN_, NaN_, 0, 120, 121, 108],
        ["07-02(목)", 121, 120, NaN_, NaN_, NaN_, 0, 121, 108, 122],
        ["07-03(금)", 108, 121, 120, NaN_, NaN_, 0, 108, 122, 128],
        ["07-04(토)", 122, 108, 121, 120, "116.33", 1, 122, 128, 130],
        ["07-05(일)", 128, 122, 108, 121, "117.00", 1, 128, 130, 115],
        ["07-06(월)", 130, 128, 122, 108, "119.33", 0, 130, 115, 126],
        ["07-07(화)", 115, 130, 128, 122, "126.67", 0, 115, 126, 114],
        ["07-08(수)", 126, 115, 130, 128, "124.33", 0, 126, 114, 109]];
      var colTone = ["gray", "blue", "blue", "blue", "purple", "teal", "orange", "orange", "orange"];
      var mx = 124, my = 222, cw = 70, ch = 28;
      var names = ["y", "lag_1", "lag_2", "lag_3", "roll_3", "주말", "y_h1", "y_h2", "y_h3"];
      var expr = ["원본", "shift(1)", "shift(2)", "shift(3)", "직전 3일 평균", "dow ≥ 5", "shift(0)", "shift(−1)", "shift(−2)"];
      /* 묶음 머리 */
      [[0, 1, "원본", "gray"], [1, 5, "특성 X — 모두 t−1까지의 값", "blue"], [6, 3, "목표 Y — y(t), y(t+1), y(t+2)", "orange"]].forEach(function (g) {
        var x1 = mx + g[0] * cw + 3, x2 = mx + (g[0] + g[1]) * cw - 3;
        k.path("M" + x1 + " 180 H" + x2, { tone: g[3], width: 3 });
        k.text((x1 + x2) / 2, 174, g[2], { size: 12.5, weight: 800, anchor: "middle", tone: g[3] });
      });
      names.forEach(function (nm, j) {
        k.text(mx + j * cw + cw / 2, 198, nm, { size: 12.5, weight: 800, anchor: "middle", tone: colTone[j] });
        k.text(mx + j * cw + cw / 2, 214, expr[j], { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.matrix(mx, my, rows.map(function (r) { return r.slice(1); }), { cw: cw, ch: ch, size: 13, rows: rows.map(function (r) { return r[0]; }),
        tones: function (i, j, v) { return v === NaN_ ? "red" : colTone[j]; },
        fills: function (i, j, v) { return v === NaN_ ? "tone" : (j === 0 ? "plain" : "tone"); },
        hl: [{ r: 3, c: 0, cs: 9, tone: "ink" }] });
      k.text(mx, my + 8 * ch + 22, "07-04(토) 행: 특성 108 · 121 · 120 (어제 · 그제 · 사흘 전), 116.33, 주말 1 → 목표 122 · 128 · 130", { size: 12.5, weight: 700, color: "ink" });
      k.text(mx, my + 8 * ch + 42, "앞쪽 K = 3행은 lag가 NaN, 끝쪽 h − 1 = 2행은 목표가 NaN → dropna()로 지우고 학습", { size: 12.5, tone: "red", weight: 700 });

      /* 오른쪽: shift 방향 */
      k.section(800, 150, "② shift 방향", { tone: "purple" });
      var sx = [980, 826, 1134], sy = 196, sw = 78, sh = 26;
      var cols = [[120, 121, 108, 122, 128], [NaN_, NaN_, 120, 121, 108], [121, 108, 122, 128, 130]];
      var hd = [["y", "gray"], ["y.shift(2)", "blue"], ["y.shift(−1)", "orange"]];
      cols.forEach(function (c, ci) {
        k.text(sx[ci] + sw / 2, sy - 10, hd[ci][0], { size: 13, weight: 800, anchor: "middle", tone: hd[ci][1], mono: true });
        k.matrix(sx[ci], sy, c.map(function (v) { return [v]; }), { cw: sw, ch: sh, size: 13, tones: function (i, j, v) { return v === NaN_ ? "red" : hd[ci][1]; },
          fills: function (i, j, v) { return v === NaN_ || ci ? "tone" : "plain"; } });
      });
      k.arrow(sx[0] - 4, sy + 13, sx[1] + sw + 4, sy + 2 * sh + 13, { tone: "blue", width: 2, curve: 8 });
      k.text((sx[1] + sw + sx[0]) / 2, sy + 4 * sh + 14, "2칸 ↓ 과거", { size: 12, weight: 800, anchor: "middle", tone: "blue" });
      k.arrow(sx[0] + sw + 4, sy + sh + 13, sx[2] - 4, sy + 13, { tone: "orange", width: 2, curve: 8 });
      k.text((sx[0] + sw + sx[2]) / 2, sy + 4 * sh + 14, "1칸 ↑ 미래", { size: 12, weight: 800, anchor: "middle", tone: "orange" });
      k.text(1020, sy + 5 * sh + 22, "특성 = 아래로 밀기 · 목표 = 위로 당기기", { size: 12.5, weight: 700, anchor: "middle", color: "ink" });

      /* 누수 */
      k.section(800, 384, "③ 누수 경고: 롤링 특성은 shift(1) 먼저", { tone: "red" });
      k.box(800, 400, 440, 92, { tone: "red", fill: "tone", align: "left", valign: "top", title: "잘못  y.rolling(3).mean()", size: 14, r: 8,
        lines: [{ t: "07-04 값 = (121 + 108 + 122) / 3 = 117.00", size: 12.5, weight: 700 }, { t: "목표 y(t) = 122가 1/3 섞임 → 검증 점수만 좋아짐", size: 12.5 },
          { t: "center=True 는 미래 y(t+1)까지 섞는다", size: 12.5 }] });
      k.box(800, 502, 440, 74, { tone: "green", fill: "tone", align: "left", valign: "top", title: "올바름  y.shift(1).rolling(3).mean()", size: 14, r: 8,
        lines: [{ t: "07-04 값 = (120 + 121 + 108) / 3 = 116.33", size: 12.5, weight: 700 }, { t: "t−1까지만 사용 → 예측하는 날에도 만들 수 있음", size: 12.5 }] });

      /* 코드 */
      k.section(40, 518, "④ pandas 코드 — 시뮬레이터 [코드] 탭과 같은 규칙", { tone: "gray" });
      k.code(40, 532, 740, 128, [
        "df = pd.read_csv(\"er_visits.csv\", parse_dates=[\"date\"], index_col=\"date\")",
        "for k in range(1, 4):  df[f\"lag_{k}\"] = df[\"y\"].shift(k)        # 과거를 아래로",
        "df[\"roll_mean_3\"] = df[\"y\"].shift(1).rolling(3).mean()           # shift(1) 먼저!",
        "df[\"is_weekend\"] = (df.index.dayofweek >= 5).astype(int)         # 달력 특성",
        "for h in range(1, 4):  df[f\"y_h{h}\"] = df[\"y\"].shift(-(h - 1))  # 미래를 위로",
        "df = df.dropna()   # 앞 K행 · 끝 h−1행 삭제 → X, Y 로 학습"
      ], { size: 12.5 });
      k.flow(800, 594, [{ t: "shift 특성", tone: "blue" }, { t: "dropna", tone: "red" }, { t: "시간순 분할", tone: "gray" }], { w: 440, h: 34, gap: 20, size: 13 });
      k.note(800, 640, 440, 48, { tone: "orange", title: "다중 출력 목표 y_h1 … y_h3", body: "한 행에서 오늘 · 내일 · 모레를 함께 맞히는 표가 된다", size: 13 });
    }
  });

  /* ------------------------------------------------------------ (2) 분할 */
  DSDiagram.register({
    id: "rolling-prediction-2", sim: "rolling-prediction", order: 2,
    title: "롤링 예측 (2) — 분할: 무작위 금지, 학습은 항상 과거", short: "TimeSeriesSplit 분할",
    sub: "칸 하나 = 시간 순서대로 놓인 표본 하나(왼쪽이 과거) · 시뮬레이터 기본 n = 30, n_splits = 5 · 인덱스는 scikit-learn TimeSeriesSplit과 같은 규칙",
    label: LABEL,
    draw: function (k) {
      var X0 = 196, CW = 22, GAP = 2, n = 30;
      function row(y, role, lab, right, rtone) {
        k.text(X0 - 12, y + 13, lab, { size: 12, weight: 700, anchor: "end", color: "muted" });
        for (var i = 0; i < n; i++) {
          var r = role(i), tn = r === "tr" ? "blue" : r === "te" ? "orange" : r === "lk" ? "red" : r === "gap" ? "gray" : "gray";
          k.rect(X0 + i * (CW + GAP), y, CW, 18, { tone: tn, fill: r === "tr" || r === "te" || r === "lk" ? "solid" : r === "gap" ? "mid" : "tone", r: 3 });
        }
        if (right) k.text(X0 + n * (CW + GAP) + 10, y + 13, right, { size: 12, weight: 700, tone: rtone || "gray" });
      }
      /* 범례 */
      [["학습 train", "blue", "solid"], ["평가 test", "orange", "solid"], ["test보다 미래인 학습 (누수)", "red", "solid"], ["gap (버림)", "gray", "mid"], ["사용 안 함", "gray", "tone"]].forEach(function (lg, i) {
        var x = [196, 330, 464, 700, 830][i];
        k.rect(x, 128, 16, 14, { tone: lg[1], fill: lg[2], r: 3 });
        k.text(x + 22, 140, lg[0], { size: 12, color: "ink" });
      });

      k.section(40, 174, "① 무작위 K-fold (KFold(5, shuffle=True)) — 시계열에서 금지", { tone: "red" });
      var te = [6, 11, 17, 22, 25, 28];
      row(186, function (i) { return te.indexOf(i) >= 0 ? "te" : (i > 6 ? "lk" : "tr"); }, "fold 예", "미래로 학습 18칸", "red");
      k.text(X0, 226, "test(6칸) 중 가장 이른 칸보다 미래인 학습 표본 18칸 → \"내일을 알고 어제를 맞히는\" 셈 → 검증 점수가 실제 운영보다 좋게 나온다", { size: 12, color: "muted" });

      k.section(40, 262, "② TimeSeriesSplit(n_splits=5) — 확장 창 (expanding)", { tone: "blue" });
      for (var f = 1; f <= 5; f++) (function (f) {
        row(250 + f * 24, function (i) { return i < 5 * f ? "tr" : i < 5 * f + 5 ? "te" : "no"; }, "fold " + f, "train [0–" + (5 * f - 1) + "] · test [" + 5 * f + "–" + (5 * f + 4) + "]", "blue");
      })(f);

      k.section(40, 410, "③ max_train_size=10 — 고정(이동) 창 (sliding)", { tone: "purple" });
      for (f = 1; f <= 5; f++) (function (f) {
        var lo = Math.max(0, 5 * f - 10);
        row(398 + f * 24, function (i) { return i >= lo && i < 5 * f ? "tr" : i >= 5 * f && i < 5 * f + 5 ? "te" : "no"; }, "fold " + f, "train [" + lo + "–" + (5 * f - 1) + "] · test [" + 5 * f + "–" + (5 * f + 4) + "]", "purple");
      })(f);

      k.section(40, 558, "④ gap=2 — 학습 끝과 평가 시작 사이를 비운다 (fold 5)", { tone: "gray" });
      row(570, function (i) { return i < 23 ? "tr" : i < 25 ? "gap" : "te"; }, "fold 5", "train [0–22] · gap 23, 24", "gray");

      /* 아래 정리 */
      k.box(40, 598, 390, 94, { tone: "blue", fill: "tone", align: "left", valign: "top", title: "인덱스 규칙", size: 14, r: 8,
        lines: [{ t: "test_size = n // (n_splits + 1) = 30 // 6 = 5", size: 12.5, weight: 700 }, { t: "fold i : test = 마지막에서 거꾸로 5칸씩", size: 12.5 },
          { t: "train = test 시작 − gap 앞까지 전부", size: 12.5 }] });
      k.box(446, 598, 390, 94, { tone: "purple", fill: "tone", align: "left", valign: "top", title: "확장 vs 고정 창", size: 14, r: 8,
        lines: [{ t: "확장: 데이터가 쌓일수록 학습이 길어짐", size: 12.5 }, { t: "고정: 최근 패턴만 반영", size: 12.5 },
          { t: "구조가 자주 바뀌면 고정 창이 유리", size: 12.5, weight: 700 }] });
      k.box(852, 598, 388, 94, { tone: "gray", fill: "soft", align: "left", valign: "top", title: "gap은 언제?", size: 14, r: 8,
        lines: [{ t: "긴 롤링 창 특성이 경계를 넘을 때", size: 12.5 }, { t: "예측을 며칠 뒤에 쓰는 경우 (보고 지연)", size: 12.5 },
          { t: "경계 근처 정보 섞임을 막는다", size: 12.5, weight: 700 }] });
    }
  });

  /* ------------------------------------------------------------ (3) 워크포워드 */
  DSDiagram.register({
    id: "rolling-prediction-3", sim: "rolling-prediction", order: 3,
    title: "롤링 예측 (3) — 워크포워드 예측과 다중 스텝 전략", short: "워크포워드 · 다중 스텝",
    sub: "예측 원점을 한 칸씩 굴리며 학습 → 예측 → 실제값 공개 → 오차 기록 · 시뮬레이터 기본: 선형회귀(lag 7), 초기 학습 70일, h = 7일, 원점 간격 1일, 매 스텝 재학습",
    label: LABEL,
    draw: function (k) {
      /* ① 루프 */
      k.section(40, 150, "① 한 원점에서 하는 일 — 네 단계를 원점마다 반복", { tone: "blue" });
      var st = [["① 학습", "원점까지의 데이터", "blue"], ["② h스텝 예측", "ŷ(T+1) … ŷ(T+7)", "orange"], ["③ 실제값 공개", "y(T+1) … y(T+7)", "gray"], ["④ 오차 기록", "그 원점의 MAE", "red"]];
      var bx = [];
      st.forEach(function (s, i) { bx.push(k.box(40 + i * 146, 166, 128, 54, { tone: s[2], fill: "tone", title: s[0], sub: s[1], size: 14, subSize: 11.5, r: 8 })); });
      for (var i = 0; i < 3; i++) k.link(bx[i].r, bx[i + 1].l, { tone: "gray" });
      k.arrow(bx[3].cx, 221, bx[0].cx, 221, { tone: "blue", dash: true, width: 1.6, via: [[bx[3].cx, 238], [bx[0].cx, 238]] });
      k.text((bx[0].cx + bx[3].cx) / 2, 252, "원점 T를 한 칸 뒤로 → 다시 ①", { size: 12, weight: 800, anchor: "middle", tone: "blue" });

      /* 계단 그림 */
      var G0 = 70, CW = 9;
      for (var o = 0; o < 4; o++) {
        var y = 272 + o * 26;
        k.text(G0 - 10, y + 13, "원점 " + (o + 1), { size: 11.5, anchor: "end", color: "muted" });
        for (var t = 0; t < 52; t++) {
          var trN = 36 + o, tn = t < trN ? "blue" : t < trN + 7 ? "orange" : null;
          if (tn) k.rect(G0 + t * (CW + 1), y, CW, 18, { tone: tn, fill: "solid", r: 1.5 });
          else k.rect(G0 + t * (CW + 1), y, CW, 18, { tone: "gray", fill: "tone", r: 1.5 });
        }
      }
      k.text(G0, 396, "파랑 = 그 원점의 학습 구간(확장 창) · 주황 = 예측 7일 · 원점마다 MAE를 모아 평균", { size: 12, color: "muted" });

      /* ② 재학습 */
      k.section(40, 434, "② 재학습 주기 · 학습 창", { tone: "purple" });
      k.table(48, 446, [118, 230, 210], [
        ["재학습", "하는 일", "특징"],
        ["매 스텝", "원점마다 계수 다시 추정", "가장 정확 · 계산 많음"],
        ["매 k스텝", "k일마다 재추정, 사이엔 입력만", "실무 절충 (주 1회 등)"],
        ["한 번만", "처음 계수 고정, 새 값만 입력", "빠름 · 구조 변화에 약함"],
        ["확장 / 고정 창", "처음부터 전부 / 최근 L일만", "고정 창 = 최근 패턴 우선"]
      ], { rh: 26, size: 12.5, tones: function (i) { return ["", "purple", "purple", "purple", "blue"][i]; } });
      k.note(40, 586, 560, 46, { tone: "green", title: "실무에서는", body: "새 내원 수가 집계되면 예측을 다시 계산 · 계수 재학습은 정해진 주기로" });
      k.note(40, 640, 560, 48, { tone: "red", title: "한 번 예측 vs 롤링 예측은 다른 문제", body: "30일을 한 번에 맞힌 점수와 하루씩 갱신한 1스텝 점수는 섞어 비교 금지" });

      /* ③ 다중 스텝 */
      k.section(640, 150, "③ h스텝을 어떻게 예측할까 — 세 가지 전략", { tone: "orange" });
      function cells(x, y, items) {
        items.forEach(function (it, i) {
          var w = it[2] || 72;
          k.box(x, y, w, 28, { tone: it[1], fill: it[3] || "tone", dash: !!it[4], title: it[0], size: 12, r: 5 });
          x += w + 6;
        });
        return x;
      }
      /* 재귀 */
      k.panel(640, 166, 600, 160, { tone: "orange", head: "soft", title: "재귀 (recursive) — 1스텝 모형 하나", right: "오차가 되먹임되어 쌓임", tinted: true });
      var x1 = cells(660, 214, [["y(T−1)", "blue"], ["y(T)", "blue"]]);
      k.arrow(x1, 228, x1 + 30, 228, { tone: "gray" });
      cells(x1 + 36, 214, [["ŷ(T+1)", "orange", 70, "solid"]]);
      var x2 = cells(660, 252, [["y(T)", "blue"], ["ŷ(T+1)", "orange", 70, "tone", true]]);
      k.arrow(x2, 266, x2 + 30, 266, { tone: "gray" });
      cells(x2 + 36, 252, [["ŷ(T+2)", "orange", 70, "solid"]]);
      var x3 = cells(660, 290, [["ŷ(T+1)", "orange", 70, "tone", true], ["ŷ(T+2)", "orange", 70, "tone", true]]);
      k.arrow(x3, 304, x3 + 30, 304, { tone: "gray" });
      cells(x3 + 36, 290, [["ŷ(T+3)", "orange", 70, "solid"]]);
      k.text(1000, 232, "점선 칸 = 앞에서 예측한 값을", { size: 12, color: "muted" });
      k.text(1000, 250, "입력 창에 다시 넣음", { size: 12, color: "muted" });
      k.text(1000, 278, "모형 1개 · 먼 스텝일수록", { size: 12, weight: 700, tone: "orange" });
      k.text(1000, 296, "앞 단계 오차가 누적", { size: 12, weight: 700, tone: "orange" });

      /* 직접 */
      k.panel(640, 336, 600, 120, { tone: "purple", head: "soft", title: "직접 (direct) — 스텝마다 모형을 따로", right: "모형 h개 · 먼 h일수록 학습 행 감소", tinted: true });
      [["모형₁", "ŷ(T+1)"], ["모형₂", "ŷ(T+2)"], ["모형₃", "ŷ(T+3)"]].forEach(function (m, i) {
        var yy = 380 + i * 24;
        k.text(660, yy + 15, "실제 lag  y(T−6 … T)", { size: 12, tone: "blue", weight: 700 });
        k.arrow(808, yy + 11, 836, yy + 11, { tone: "gray", width: 1.4, headSize: 6 });
        k.text(842, yy + 15, m[0], { size: 12, weight: 800, tone: "purple" });
        k.arrow(892, yy + 11, 920, yy + 11, { tone: "gray", width: 1.4, headSize: 6 });
        k.text(926, yy + 15, m[1], { size: 12, weight: 800, tone: "orange" });
      });
      k.text(1020, 400, "예측값을 되먹이지 않아", { size: 12, color: "muted" });
      k.text(1020, 418, "오차가 쌓이지 않는다", { size: 12, color: "muted" });

      /* MIMO */
      k.panel(640, 466, 600, 92, { tone: "teal", head: "soft", title: "다중 출력 (MIMO) — 출력 h개를 한 번에", right: "목표 h개가 모두 있는 행만 사용", tinted: true });
      k.text(660, 530, "실제 lag  y(T−6 … T)", { size: 12, tone: "blue", weight: 700 });
      k.arrow(808, 526, 836, 526, { tone: "gray", width: 1.4, headSize: 6 });
      k.text(842, 530, "모형 1개", { size: 12, weight: 800, tone: "teal" });
      k.arrow(904, 526, 932, 526, { tone: "gray", width: 1.4, headSize: 6 });
      cells(938, 512, [["ŷ(T+1)", "orange", 66, "solid"], ["…", "orange", 34, "solid"], ["ŷ(T+7)", "orange", 66, "solid"]]);
      k.text(1240, 576, "선형회귀에서는 출력별 최소제곱이 독립 → 직접 전략과 거의 같다", { size: 12, anchor: "end", color: "muted" });

      k.flow(640, 590, [{ t: "shift 표", tone: "blue" }, { t: "TimeSeriesSplit", tone: "gray" }, { t: "워크포워드", tone: "orange" }, { t: "MAE · MASE 기록", tone: "red" }], { w: 600, h: 34, gap: 20, size: 13 });
      k.note(640, 636, 600, 50, { tone: "gray", title: "MASE = MAE ÷ 초기 학습 구간 나이브 1스텝 MAE", body: "1보다 작으면 \"어제 값 그대로\"보다 낫다", size: 13 });
    }
  });
})();
