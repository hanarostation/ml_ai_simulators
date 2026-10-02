/* 비계층형 군집분석 — 알고리즘 구성도 (강의 필기자료 양식으로 새로 설계)
   손계산 예제는 작은 점 묶음으로 따로 만들고, 시뮬레이터 기본 설정(점 150개 · 표준화 z · k = 3 등)은 메모로 표시 */
(function () {
  /* 미니 산점도. o: x:[lo,hi] y:[lo,hi] w h grid(눈금 간격) */
  function plot(k, x0, y0, w, h, o) {
    var xr = o.x, yr = o.y;
    var sx = function (v) { return x0 + (v - xr[0]) / (xr[1] - xr[0]) * w; };
    var sy = function (v) { return y0 + h - (v - yr[0]) / (yr[1] - yr[0]) * h; };
    var g = o.grid || 1;
    for (var gx = Math.ceil(xr[0]); gx <= xr[1]; gx += g) k.raw('<line class="dg-axis" x1="' + sx(gx) + '" y1="' + y0 + '" x2="' + sx(gx) + '" y2="' + (y0 + h) + '" style="opacity:.3"/>');
    for (var gy = Math.ceil(yr[0]); gy <= yr[1]; gy += g) k.raw('<line class="dg-axis" x1="' + x0 + '" y1="' + sy(gy) + '" x2="' + (x0 + w) + '" y2="' + sy(gy) + '" style="opacity:.3"/>');
    k.axes(x0, y0, w, h);
    return { sx: sx, sy: sy };
  }
  function dia(k, x, y, r, tone, fill) {
    k.path("M" + x + " " + (y - r) + " L" + (x + r) + " " + y + " L" + x + " " + (y + r) + " L" + (x - r) + " " + y + " Z", { tone: tone, fill: fill || "solid" });
  }

  /* ------------------------------------------------------------------ (1) K-means */
  var KX = [[1, 1], [2, 1], [1, 2], [4, 3], [5, 4], [5, 5]];
  DSDiagram.register({
    id: "partitional-clustering-1", sim: "partitional-clustering", order: 1,
    title: "비계층형 군집 (1) — K-means: 할당과 갱신을 번갈아 반복", short: "K-means · K-means++",
    sub: "점 6개 · k = 2 손계산 예제 · 초기 중심을 일부러 한쪽(P1, P2)에 몰아 두어도 몇 번의 반복으로 제자리를 찾아간다",
    label: "Machine Learning",
    draw: function (k) {
      k.flow(40, 128, [
        { t: "k와 초기 중심 k개", s: "무작위 · K-means++ · 직접", tone: "gray" },
        { t: "① 할당", s: "점마다 가장 가까운 중심으로", tone: "blue" },
        { t: "② 갱신", s: "중심 = 군집에 속한 점의 평균", tone: "teal" },
        { t: "수렴 확인", s: "할당이 하나도 안 바뀌면 끝", tone: "green" }
      ], { w: 1200, h: 46, gap: 30 });
      k.arrow(980, 176, 470, 176, { tone: "teal", curve: -14, dash: true, width: 1.6 });
      k.text(725, 196, "바뀐 점이 있으면 ①로", { size: 12, weight: 700, anchor: "middle", tone: "teal" });

      k.section(40, 228, "① 반복 과정 — 점 6개, 초기 중심 c₁ = P1, c₂ = P2");
      var iters = [
        { C: [[1, 1], [2, 1]], N: [[1, 1.5], [4, 3.25]], L: [0, 1, 0, 1, 1, 1], t: "반복 1", c: "WCSS 52.00 → 갱신 후 15.25" },
        { C: [[1, 1.5], [4, 3.25]], N: [[1.33, 1.33], [4.67, 4]], L: [0, 0, 0, 1, 1, 1], t: "반복 2", c: "P2가 C1로 이동 · 7.44 → 4.00" },
        { C: [[1.33, 1.33], [4.67, 4]], N: null, L: [0, 0, 0, 1, 1, 1], t: "반복 3", c: "바뀐 점 0개 → 수렴 · WCSS 4.00" }
      ];
      var TN = ["blue", "orange"];
      iters.forEach(function (it, i) {
        var px = 40 + i * 250;
        k.panel(px, 244, 238, 212, { tone: i === 2 ? "green" : "gray", head: "soft", title: it.t, right: i === 2 ? "수렴" : "할당 → 갱신", headH: 28, titleSize: 14 });
        var P = plot(k, px + 44, 284, 150, 130, { x: [0.5, 5.5], y: [0.5, 5.5] });
        KX.forEach(function (p, j) {
          k.circle(P.sx(p[0]), P.sy(p[1]), 6, { tone: TN[it.L[j]], fill: "solid" });
          if (i === 0) k.text(P.sx(p[0]) + (j === 0 || j === 2 ? -9 : 9), P.sy(p[1]) - 7, "P" + (j + 1), { size: 11.5, weight: 700, anchor: j === 0 || j === 2 ? "end" : "start", color: "muted" });
        });
        it.C.forEach(function (c, j) {
          dia(k, P.sx(c[0]), P.sy(c[1]), 9, TN[j], "tone");
          if (it.N) {
            var nx = P.sx(it.N[j][0]), ny = P.sy(it.N[j][1]), ox = P.sx(c[0]), oy = P.sy(c[1]);
            if (Math.hypot(nx - ox, ny - oy) > 14) k.arrow(ox, oy, nx, ny, { tone: TN[j], width: 2 });
            dia(k, nx, ny, 8, TN[j], "solid");
          } else dia(k, P.sx(c[0]), P.sy(c[1]), 8, TN[j], "solid");
        });
        k.text(px + 119, 442, it.c, { size: 12, weight: 800, anchor: "middle", tone: i === 2 ? "green" : "ink", color: i === 2 ? "tone" : "ink" });
      });

      k.section(790, 228, "② 반복 1을 숫자로", { sub: "c₁ = (1, 1) · c₂ = (2, 1)" });
      k.table(796, 244, [56, 80, 104, 104, 70], [
        ["점", "좌표", "d²(c₁)", "d²(c₂)", "할당"],
        ["P1", "(1, 1)", { t: "0", tone: "blue", weight: 800 }, "1", { t: "C1", tone: "blue" }],
        ["P2", "(2, 1)", "1", { t: "0", tone: "orange", weight: 800 }, { t: "C2", tone: "orange" }],
        ["P3", "(1, 2)", { t: "1", tone: "blue", weight: 800 }, "2", { t: "C1", tone: "blue" }],
        ["P4", "(4, 3)", "13", { t: "8", tone: "orange", weight: 800 }, { t: "C2", tone: "orange" }],
        ["P5", "(5, 4)", "25", { t: "18", tone: "orange", weight: 800 }, { t: "C2", tone: "orange" }],
        ["P6", "(5, 5)", "32", { t: "25", tone: "orange", weight: 800 }, { t: "C2", tone: "orange" }]
      ], { rh: 24, size: 12.5 });
      k.box(796, 418, 444, 46, { tone: "teal", fill: "tone", align: "left", size: 12.5,
        title: "갱신  c₁ = 평균(P1, P3) = (1, 1.5)", lines: [{ t: "        c₂ = 평균(P2, P4, P5, P6) = (4, 3.25)", tone: "teal", weight: 800, size: 12.5 }] });

      k.section(40, 494, "③ K-means++ — 두 번째 중심은 D(x)²에 비례해 뽑는다");
      k.text(56, 524, "첫 중심 = P1 (무작위). D(x) = 가장 가까운 기존 중심까지 거리", { size: 12.5, color: "ink" });
      k.bars(70, 540, 420, 120, [0, 1, 1, 13, 25, 32], { labels: ["P1", "P2", "P3", "P4", "P5", "P6"], tones: ["gray", "gray", "gray", "purple", "purple", "purple"], gap: 18, size: 12 });
      k.text(500, 560, "합 72", { size: 12.5, weight: 800, color: "ink" });
      k.lines(500, 584, [{ t: "P4 13/72 = 18%", tone: "purple" }, { t: "P5 25/72 = 35%", tone: "purple" }, { t: "P6 32/72 = 44%", tone: "purple", weight: 800 }, { t: "P2·P3 각 1.4%", color: "muted" }], { size: 12.5, lh: 20 });
      k.text(56, 692, "멀리 떨어진 점일수록 다음 중심이 되기 쉽다 → 중심이 한쪽에 몰리는 초기화를 피함", { size: 12.5, weight: 700, tone: "purple" });

      k.section(660, 494, "④ 목적함수 WCSS와 주의점");
      k.formula(660, 508, 580, 38, "WCSS = Σₖ Σ(x ∈ Cₖ) ‖x − μₖ‖²   (inertia)", { size: 15 });
      k.note(660, 552, 580, 44, { tone: "red", title: "국소 최적", body: "시작점에 따라 다른 답에 멈춤 → n_init번 다시 실행해 WCSS가 가장 작은 결과를 남김", size: 13, bodySize: 11.5 });
      k.note(660, 600, 580, 44, { tone: "orange", title: "k를 미리 정해야 하고, 둥근 덩어리를 가정", body: "달 모양·동심원은 실패 → 밀도 기반(DBSCAN) 또는 GMM", size: 13, bodySize: 11.5 });
      k.note(660, 648, 580, 44, { tone: "blue", title: "거리 기반이라 표준화가 먼저", body: "시뮬레이터 기본: 점 150개(표준화 z) · k = 3 · 초기화 seed 0 · n_init 10", size: 13, bodySize: 11.5 });
    }
  });

  /* ------------------------------------------------------------------ (2) K-medoids */
  var MX = [[1, 1], [2, 1], [1, 2], [4, 3], [5, 4], [5, 5], [10, 4]];
  DSDiagram.register({
    id: "partitional-clustering-2", sim: "partitional-clustering", order: 2,
    title: "비계층형 군집 (2) — K-medoids(PAM): 실제 점이 중심", short: "K-medoids (PAM)",
    sub: "앞의 점 6개 + 이상값 P7(10, 4) · k = 2 · 중심(메도이드)은 반드시 데이터 점 중 하나, 목표는 총 거리 TD 최소",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 데이터와 결과 — 평균 중심 vs 메도이드");
      k.panel(40, 168, 400, 270, { tone: "gray", tinted: true });
      var P = plot(k, 70, 184, 350, 186, { x: [0, 11], y: [0, 6] });
      MX.forEach(function (p, j) {
        var tn = j < 3 ? "blue" : (j === 6 ? "red" : "orange");
        k.circle(P.sx(p[0]), P.sy(p[1]), 6.5, { tone: tn, fill: "solid" });
        var up = (j === 3 || j === 1), left = (j === 6 || j === 4);
        var dx = left ? (j === 4 ? -15 : -10) : (j === 0 ? 15 : 9), dy = up ? 17 : (j === 4 || j === 0 ? -11 : -8);
        k.text(P.sx(p[0]) + dx, P.sy(p[1]) + dy, "P" + (j + 1), { size: 11.5, weight: 700, color: "muted", anchor: left ? "end" : "start" });
      });
      k.circle(P.sx(5), P.sy(4), 12, { tone: "orange", fill: "plain" });
      k.circle(P.sx(1), P.sy(1), 12, { tone: "blue", fill: "plain" });
      dia(k, P.sx(6), P.sy(4), 9, "red", "tone");
      k.arrow(P.sx(4.67), P.sy(2), P.sx(6), P.sy(2), { tone: "red", width: 1.8 });
      k.text(P.sx(6.2), P.sy(2) + 4, "P7이 평균을 끌어당김", { size: 11.5, weight: 700, tone: "red" });
      k.lines(56, 392, [
        { t: "◇ K-means 평균 중심: (6.00, 4.00)", tone: "red", weight: 800 },
        { t: "    P7을 빼면 (4.67, 4.00) → 오른쪽으로 1.33 이동", color: "muted" },
        { t: "○ PAM 메도이드: P5 (5, 4) · P1 (1, 1) = 실제 환자", tone: "orange", weight: 800 }
      ], { size: 12.5, lh: 19 });

      k.section(470, 152, "② BUILD — 처음 메도이드 k개를 욕심껏 고르기");
      k.table(476, 166, [48, 60, 60, 60, 60, 60, 60, 66], [
        ["", "P1", "P2", "P3", "P4", "P5", "P6", "P7"],
        ["1번째", "25.75", "23.03", "24.27", { t: "19.33", tone: "teal", weight: 800 }, "21.13", "23.99", "43.43"],
        ["2번째", { t: "7.60", tone: "teal", weight: 800 }, "7.18", "7.18", "선택됨", "3.73", "3.63", "6.08"]
      ], { rh: 26, size: 12.5 });
      k.lines(476, 260, [
        "1번째: 모든 점까지 거리 합이 가장 작은 점 → **P4** (19.33)",
        "2번째: 추가했을 때 총 거리가 가장 많이 줄어드는 점 → **P1** (7.60 감소)",
        { t: "BUILD 결과 메도이드 {P4, P1} · TD = 19.33 − 7.60 = 11.73", tone: "teal", weight: 800 }
      ], { size: 12.5, lh: 21 });

      k.section(470, 350, "③ SWAP — 메도이드 m과 비메도이드 o를 바꿔 보기");
      k.table(476, 364, [100, 70, 150], [
        ["교환 (m → o)", "ΔTD", "판정"],
        ["P4 → P5", { t: "−2.32", tone: "green", weight: 800 }, { t: "최대 감소 → 교환", tone: "green" }],
        ["P4 → P6", "−1.40", "줄지만 덜 줄어듦"],
        ["P1 → P2", "+0.41", { t: "늘어남", color: "muted" }],
        ["P1 → P7", "+1.51", { t: "늘어남", color: "muted" }]
      ], { rh: 24, size: 12.5 });
      k.box(812, 364, 428, 120, { tone: "green", fill: "tone", align: "left", valign: "top", size: 13.5,
        title: "교환 후 메도이드 {P5, P1} · TD = 9.41", lines: [
          { t: "C1 {P1, P2, P3}: 0 + 1.00 + 1.00 = 2.00", size: 12.5 },
          { t: "C2 {P4, P5, P6, P7}: 1.41 + 0 + 1.00 + 5.00 = 7.41", size: 12.5 },
          { t: "다시 2·k·(n−k) = 20가지를 모두 따져도 ΔTD < 0 없음", size: 12.5 },
          { t: "→ 종료 (최소 ΔTD = +0.41)", size: 12.5, weight: 800 }] });

      k.section(40, 528, "④ K-means vs K-medoids");
      k.table(56, 542, [170, 330, 330, 354], [
        ["구분", "K-means", "K-medoids (PAM)", "언제 쓰나"],
        ["중심", "군집 평균 (데이터에 없는 점)", "실제 데이터 점 (메도이드)", "대표 환자 한 명을 보여 줘야 할 때 PAM"],
        ["목표", "WCSS = 제곱 거리 합 최소", "TD = 거리 합 최소 (제곱 아님)", "이상값이 섞였을 때 PAM"],
        ["거리", "유클리드 (평균과 짝)", "아무 거리 행렬이나 가능", "범주·맨해튼 등 다른 거리일 때 PAM"],
        ["계산", "빠름 · 큰 데이터 OK", "SWAP 한 번에 k(n−k)쌍 → 느림", "점 수천 개 이상이면 K-means·CLARA"]
      ], { rh: 27, size: 12.5 });
      k.text(1240, 694, "시뮬레이터: 교환(SWAP) 비용 표에서 ΔTD 상위 후보를 확인", { size: 12, anchor: "end", color: "muted" });
    }
  });

  /* ------------------------------------------------------------------ (3) DBSCAN · Mean Shift */
  var DB = [[1, 1], [2, 1], [1, 2], [2, 2], [3.2, 2.6], [6, 1], [7, 1], [6.5, 2], [4.5, 4]];
  var DBT = ["core", "core", "core", "core", "border", "core", "core", "core", "noise"];
  var DBN = [4, 4, 4, 5, 2, 3, 3, 3, 1];
  DSDiagram.register({
    id: "partitional-clustering-3", sim: "partitional-clustering", order: 3,
    title: "비계층형 군집 (3) — 밀도 기반: DBSCAN과 Mean Shift", short: "DBSCAN · Mean Shift",
    sub: "k를 정하지 않는다 · DBSCAN은 '반경 안 이웃 수'로 핵심점을 이어 붙이고, Mean Shift는 창의 평균을 따라 밀도 봉우리로 오른다",
    label: "Machine Learning",
    draw: function (k) {
      /* DBSCAN */
      k.panel(40, 128, 610, 572, { tone: "blue", head: "solid", title: "DBSCAN", right: "eps = 1.5 · min_samples = 3 (자기 자신 포함)" });
      k.section(56, 192, "① 이웃 세기 → 점 분류", { size: 17 });
      var P = plot(k, 76, 208, 300, 214, { x: [0, 8], y: [0, 6] });
      var r = 1.5 / 8 * 300, ry = 1.5 / 6 * 214;
      [3, 7].forEach(function (i) { k.raw('<g class="dg-t-blue"><ellipse class="dg-stroke" cx="' + P.sx(DB[i][0]) + '" cy="' + P.sy(DB[i][1]) + '" rx="' + r + '" ry="' + ry + '" style="stroke-dasharray:5 4;opacity:.8"/></g>'); });
      k.raw('<g class="dg-t-red"><ellipse class="dg-stroke" cx="' + P.sx(4.5) + '" cy="' + P.sy(4) + '" rx="' + r + '" ry="' + ry + '" style="stroke-dasharray:5 4;opacity:.8"/></g>');
      DB.forEach(function (p, i) {
        var t = DBT[i], tn = t === "noise" ? "red" : (i >= 5 && i <= 7 ? "orange" : "blue");
        k.circle(P.sx(p[0]), P.sy(p[1]), t === "core" ? 7 : 6, { tone: tn, fill: t === "core" ? "solid" : "plain" });
        var lx = i === 4 ? 10 : (i === 0 || i === 2 ? -10 : 10), ly = (i === 0 || i === 1 || i === 5 || i === 6) ? 18 : -9;
        k.text(P.sx(p[0]) + lx, P.sy(p[1]) + ly, "P" + (i + 1), { size: 11.5, weight: 700, color: "muted", anchor: lx < 0 ? "end" : "start" });
      });
      k.table(398, 206, [58, 56, 118], [
        ["점", "이웃 수", "분류"],
        ["P1~P3", "4", { t: "핵심 core", tone: "blue" }],
        ["P4", "5", { t: "핵심 core", tone: "blue" }],
        ["P5", "2", { t: "경계 border", tone: "teal" }],
        ["P6~P8", "3", { t: "핵심 core", tone: "orange" }],
        ["P9", "1", { t: "잡음 noise (−1)", tone: "red" }]
      ], { rh: 26, size: 12.5 });
      k.para(398, 380, 236, "P5: 이웃이 P4 하나뿐(2 < 3)이라 핵심은 아니지만 핵심점 P4의 반경 안 → 경계점", { size: 12, lh: 18, color: "ink" });

      k.section(56, 452, "② 핵심점끼리 이어 군집 확장", { size: 17 });
      k.flow(56, 468, [
        { t: "핵심점 하나에서 시작", tone: "blue" },
        { t: "반경 안 점을 같은 군집으로", tone: "blue" },
        { t: "그중 핵심점이면 계속 확장", tone: "teal" }
      ], { w: 578, h: 40, gap: 22, size: 12.5 });
      k.box(56, 522, 284, 66, { tone: "blue", fill: "tone", title: "C1 = {P1, P2, P3, P4, P5}", sub: "P5는 경계점으로 끝에 붙음", size: 13.5 });
      k.box(350, 522, 284, 66, { tone: "orange", fill: "tone", title: "C2 = {P6, P7, P8}", sub: "P9는 어느 반경에도 없음 → 잡음", size: 13.5 });
      k.note(56, 600, 578, 44, { tone: "green", title: "장점: 모양이 자유롭고 잡음을 따로 뺀다", body: "달 모양·동심원도 분리 · 군집 수는 결과로 나옴", size: 13, bodySize: 11.5 });
      k.note(56, 650, 578, 44, { tone: "red", title: "약점: 밀도가 다른 군집이 섞이면 eps 하나로 안 됨", body: "k-거리 그래프의 꺾이는 곳으로 eps를 고름 · 시뮬레이터 기본 eps 0.4 · min_samples 5", size: 13, bodySize: 11.5 });

      /* Mean Shift */
      k.panel(670, 128, 570, 572, { tone: "purple", head: "solid", title: "Mean Shift", right: "평평한 커널 · bandwidth h = 2" });
      k.section(686, 192, "③ 창 평균으로 이동 — 1차원으로 줄여 본 예", { size: 17 });
      var xs = [1, 2, 3, 3.5, 4, 8, 9, 9.5];
      var ax = function (v) { return 706 + v * 50; };
      var line = function (y, lo, hi, m, label, tone) {
        k.raw('<line class="dg-axis" x1="' + ax(0) + '" y1="' + y + '" x2="' + ax(10.3) + '" y2="' + y + '"/>');
        k.rect(ax(Math.max(lo, 0)), y - 13, ax(Math.min(hi, 10.3)) - ax(Math.max(lo, 0)), 26, { tone: tone, fill: "mid", r: 6, opacity: 0.7 });
        xs.forEach(function (v) { var inw = v >= lo - 1e-9 && v <= hi + 1e-9; k.circle(ax(v), y, 5.5, { tone: inw ? tone : "gray", fill: inw ? "solid" : "plain" }); });
        dia(k, ax(m), y - 22, 7, tone, "solid");
        k.text(ax(m) + (m > 6 ? -10 : 10), y - 18, label, { size: 12, weight: 800, tone: tone, anchor: m > 6 ? "end" : "start" });
      };
      [0, 2, 4, 6, 8, 10].forEach(function (v) { k.text(ax(v), 226, String(v), { size: 11.5, anchor: "middle", color: "muted" }); });
      line(262, -1, 3, 2.0, "시작 1 → 창 [−1, 3] 평균 2.0", "purple");
      line(316, 0, 4, 2.7, "창 [0, 4] 평균 (1+2+3+3.5+4)/5 = 2.7", "purple");
      line(370, 6, 10, 8.83, "시작 8 → 창 [6, 10] 평균 8.83", "teal");
      k.text(686, 412, "2.7 · 8.83에서는 창 안의 점이 그대로라 평균도 그대로 → 이동 0 → 멈춤(봉우리)", { size: 12.5, weight: 700, color: "ink" });

      k.section(686, 452, "④ 봉우리 합치기 → 라벨", { size: 17 });
      k.flow(686, 468, [
        { t: "모든 점에서 출발", tone: "purple" },
        { t: "봉우리에 도착", tone: "purple" },
        { t: "h 안 봉우리 합침", tone: "teal" },
        { t: "가장 가까운 봉우리", tone: "green" }
      ], { w: 538, h: 40, gap: 18, size: 12.5 });
      k.box(686, 522, 538, 66, { tone: "purple", fill: "tone", title: "봉우리 2개: 2.7 ← {1, 2, 3, 3.5, 4} · 8.83 ← {8, 9, 9.5}", sub: "군집 수 = 도착한 봉우리 수 (h가 작으면 많아지고, 크면 적어짐)", size: 13.5 });
      k.note(686, 600, 538, 44, { tone: "purple", title: "bandwidth h가 유일한 핵심 설정", body: "estimate_bandwidth(X, quantile=0.3) = 30% 이웃까지 거리의 평균", size: 13, bodySize: 11.5 });
      k.note(686, 650, 538, 44, { tone: "red", title: "약점: 점마다 반복 이동 → 점이 많으면 느림", body: "시뮬레이터 기본 h = 1.2 (둥근 3덩어리) · 밀도(KDE) 등고선과 함께 보기", size: 13, bodySize: 11.5 });
    }
  });

  /* ------------------------------------------------------------------ (4) GMM · 비교 */
  DSDiagram.register({
    id: "partitional-clustering-4", sim: "partitional-clustering", order: 4,
    title: "비계층형 군집 (4) — GMM(EM): 확률로 나누기", short: "GMM (EM) · 비교",
    sub: "가우스 분포 k개의 혼합으로 데이터를 설명 · E-단계(소속 확률) ↔ M-단계(분포 다시 맞추기) 반복 · 1차원 점 6개 예제",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① E-단계 — 점마다 소속 확률(책임도) γ");
      k.panel(40, 168, 600, 244, { tone: "gray", tinted: true });
      /* 두 정규분포 곡선 */
      var ax = function (v) { return 70 + v * 64; }, base = 300, amp = 260;
      var curve = function (mu, sd, pi) {
        var d = "";
        for (var i = 0; i <= 80; i++) { var v = -0.2 + i * 8.6 / 80, y = pi * Math.exp(-0.5 * Math.pow((v - mu) / sd, 2)) / (sd * Math.sqrt(2 * Math.PI)); d += (i ? " L" : "M") + ax(v).toFixed(1) + " " + (base - y * amp).toFixed(1); }
        return d;
      };
      k.raw('<line class="dg-axis" x1="' + ax(-0.2) + '" y1="' + base + '" x2="' + ax(8.4) + '" y2="' + base + '"/>');
      k.path(curve(2, 1, 0.5), { tone: "blue", width: 2.4 });
      k.path(curve(6, 1, 0.5), { tone: "orange", width: 2.4 });
      k.text(ax(2), 182 + 20, "성분 1: μ 2 · σ 1 · π 0.5", { size: 12, weight: 800, anchor: "middle", tone: "blue" });
      k.text(ax(6), 182 + 20, "성분 2: μ 6 · σ 1 · π 0.5", { size: 12, weight: 800, anchor: "middle", tone: "orange" });
      var X = [1, 2, 3.5, 4, 6, 7], G = [1.00, 1.00, 0.88, 0.50, 0.00, 0.00];
      [0, 2, 4, 6, 8].forEach(function (v) { k.text(ax(v), base + 18, String(v), { size: 11.5, anchor: "middle", color: "muted" }); });
      X.forEach(function (v, i) { k.circle(ax(v), base, 6, { tone: G[i] > 0.6 ? "blue" : G[i] < 0.4 ? "orange" : "purple", fill: "solid" }); });
      k.table(66, 330, [96, 68, 68, 68, 68, 68, 68], [
        ["x", "1", "2", "3.5", "4", "6", "7"],
        ["γ(성분 1)", "1.00", "1.00", { t: "0.88", tone: "purple", weight: 800 }, { t: "0.50", tone: "purple", weight: 800 }, "0.00", "0.00"]
      ], { rh: 24, size: 12.5 });
      k.text(66, 400, "예) x = 3.5: 0.5·N(3.5|2,1) = 0.0648, 0.5·N(3.5|6,1) = 0.0088 → 0.0648 / 0.0736 = 0.88", { size: 12, color: "ink" });

      k.section(670, 152, "② M-단계 — γ를 가중치로 분포 다시 맞추기");
      k.table(676, 168, [120, 210, 108, 108], [
        ["모수", "식", "성분 1", "성분 2"],
        ["Nₖ (유효 개수)", "Σ γ (점들의 γ 합)", "3.38", "2.62"],
        ["πₖ (비율)", "Nₖ / n", "0.56", "0.44"],
        ["μₖ (평균)", "Σ γ · x / Nₖ", "2.39", "5.89"],
        ["σₖ² (분산)", "Σ γ · (x − μₖ)² / Nₖ", "1.32", "1.42"]
      ], { rh: 27, size: 12.5 });
      k.box(676, 312, 546, 44, { tone: "green", fill: "tone", size: 13.5, title: "로그우도 log L: −12.98 → −12.44 (EM은 반복마다 커지거나 그대로)" });
      k.text(676, 384, "증가폭이 tol(1e−3)보다 작아지면 수렴 · 결과 = 소속 확률 γ (하드 라벨은 argmax)", { size: 12.5, color: "ink" });
      k.text(676, 404, "2차원 full 공분산: 성분마다 평균 2 + 공분산 3 + 비율 1 → 모수 p = 6k − 1", { size: 12.5, color: "muted" });

      k.section(40, 440, "③ 군집 수 고르기");
      k.box(56, 454, 186, 92, { tone: "blue", fill: "tone", title: "엘보 (WCSS)", lines: [{ t: "k를 늘려 가며 WCSS", size: 12 }, { t: "꺾이는 곳(팔꿈치)", size: 12 }, { t: "K-means 계열", size: 12, color: "muted" }], size: 14 });
      k.box(250, 454, 186, 92, { tone: "teal", fill: "tone", title: "실루엣 (−1~1)", lines: [{ t: "s = (b − a) / max(a, b)", size: 12 }, { t: "앞 예제 P1: a 1.00 · b 4.75", size: 12 }, { t: "→ s = 0.79 (클수록 좋음)", size: 12, weight: 800 }], size: 14 });
      k.box(444, 454, 196, 92, { tone: "purple", fill: "tone", title: "BIC (작을수록)", lines: [{ t: "−2 log L + p · ln n", size: 12 }, { t: "모수가 많으면 벌점", size: 12 }, { t: "GMM 성분 수", size: 12, color: "muted" }], size: 14 });

      k.section(670, 440, "④ 하드 vs 소프트");
      k.box(676, 454, 270, 92, { tone: "gray", fill: "soft", title: "K-means (하드)", lines: [{ t: "점마다 군집 하나", size: 12 }, { t: "둥근 덩어리 · 경계는 직선", size: 12 }, { t: "x = 4 → 둘 중 하나로 단정", size: 12, color: "muted" }], size: 14 });
      k.box(954, 454, 270, 92, { tone: "purple", fill: "tone", title: "GMM (소프트)", lines: [{ t: "점마다 소속 확률", size: 12 }, { t: "타원 모양 · 크기 다른 군집", size: 12 }, { t: "x = 4 → 50% · 50% (불확실)", size: 12, weight: 800 }], size: 14 });

      k.section(40, 578, "⑤ 6가지 알고리즘 한 줄 비교");
      k.table(56, 590, [160, 270, 110, 340, 300], [
        ["알고리즘", "기준", "k 지정", "모양 · 이상값", "핵심 설정"],
        ["K-means / ++", "평균 중심까지 제곱 거리", "필요", "둥근 덩어리 · 이상값 약함", "k · 초기화 · n_init"],
        ["K-medoids", "메도이드까지 거리 합", "필요", "둥근 덩어리 · 이상값 강함", "k · 거리 정의"],
        ["DBSCAN · Mean Shift", "밀도 (이웃 수 · 창 평균)", "불필요", "자유로운 모양 · 잡음 분리", "eps·min_samples · bandwidth"],
        ["GMM (EM)", "가우스 혼합의 우도 최대", "필요", "타원 · 크기 다른 군집 · 소프트", "k · 공분산 유형(full 등)"]
      ], { rh: 21, size: 12 });
    }
  });
})();
