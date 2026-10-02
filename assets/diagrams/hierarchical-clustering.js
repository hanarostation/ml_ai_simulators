/* 계층형 군집분석 — 알고리즘 구성도 (강의 필기자료 양식으로 새로 설계)
   손계산 예제: 점 5개 P1(2,2) P2(4,2) P3(5,4) P4(8,3) P5(8,4) · 유클리드 거리 */
(function () {
  var PTS = [[2, 2], [4, 2], [5, 4], [8, 3], [8, 4]];
  var D = [
    [0, 2.00, 3.61, 6.08, 6.32],
    [2.00, 0, 2.24, 4.12, 4.47],
    [3.61, 2.24, 0, 3.16, 3.00],
    [6.08, 4.12, 3.16, 0, 1.00],
    [6.32, 4.47, 3.00, 1.00, 0]
  ];
  var f2 = function (v) { return v === 0 ? "0" : v.toFixed(2); };

  /* 작은 산점도: 점 5개 (x 1~9, y 1~5) */
  function scatter(k, x0, y0, w, h, o) {
    o = o || {};
    var sx = function (v) { return x0 + (v - 1) / 8 * w; }, sy = function (v) { return y0 + h - (v - 1) / 4 * h; };
    for (var gx = 1; gx <= 9; gx++) k.raw('<line class="dg-axis" x1="' + sx(gx) + '" y1="' + y0 + '" x2="' + sx(gx) + '" y2="' + (y0 + h) + '" style="opacity:.35"/>');
    for (var gy = 1; gy <= 5; gy++) k.raw('<line class="dg-axis" x1="' + x0 + '" y1="' + sy(gy) + '" x2="' + (x0 + w) + '" y2="' + sy(gy) + '" style="opacity:.35"/>');
    k.axes(x0, y0, w, h);
    if (o.groups) o.groups.forEach(function (g) {
      k.rect(sx(g.x1), sy(g.y2), sx(g.x2) - sx(g.x1), sy(g.y1) - sy(g.y2), { tone: g.tone, fill: "mid", r: 14, opacity: 0.55 });
    });
    PTS.forEach(function (p, i) {
      var tn = o.tones ? o.tones[i] : "blue";
      k.circle(sx(p[0]), sy(p[1]), 7, { tone: tn, fill: "solid" });
      var dx = o.lab && o.lab[i] ? o.lab[i][0] : 10, dy = o.lab && o.lab[i] ? o.lab[i][1] : -9;
      k.text(sx(p[0]) + dx, sy(p[1]) + dy, "P" + (i + 1), { size: 12.5, weight: 800, tone: tn, anchor: dx < 0 ? "end" : "start" });
    });
    return { sx: sx, sy: sy };
  }

  /* 덴드로그램 그리기: leaves 순서 x, merges [{a:[x],b:[x],h}] */
  function dendro(k, x0, yBase, unit, leafX, merges, tone) {
    var pos = {}, top = {};
    leafX.forEach(function (lx, i) { pos["P" + (i + 1)] = lx; top["P" + (i + 1)] = 0; });
    merges.forEach(function (m) {
      var xa = pos[m.a], xb = pos[m.b], ya = yBase - top[m.a] * unit, yb = yBase - top[m.b] * unit, yh = yBase - m.h * unit;
      k.path("M" + xa + " " + ya + " V" + yh + " H" + xb + " V" + yb, { tone: m.tone || tone, width: 2.6 });
      pos[m.id] = (xa + xb) / 2; top[m.id] = m.h;
      if (m.label) {
        if (m.mid) k.text((xa + xb) / 2, yh - 7, m.label, { size: 12, weight: 800, anchor: "middle", tone: m.tone || tone });
        else k.text(Math.min(xa, xb) - 5, yh + 4, m.label, { size: 12, weight: 800, anchor: "end", tone: m.tone || tone });
      }
    });
  }

  /* ------------------------------------------------------------------ (1) */
  DSDiagram.register({
    id: "hierarchical-clustering-1", sim: "hierarchical-clustering", order: 1,
    title: "계층형 군집 (1) — 가장 가까운 두 군집을 하나씩 합치기", short: "병합 과정과 덴드로그램",
    sub: "병합적(Agglomerative) 방법 · 점 5개 손계산 예제(단일 연결) · 거리 행렬을 한 칸씩 줄이며 n − 1번 합치면 나무(덴드로그램)가 완성된다",
    label: "Machine Learning",
    draw: function (k) {
      /* ① 데이터와 거리 행렬 */
      k.section(40, 152, "① 데이터 5개와 거리 행렬");
      k.panel(40, 168, 400, 440, { tone: "blue", tinted: true });
      scatter(k, 66, 186, 220, 120, { lab: [[-10, -9], [10, 18], [10, -9], [-10, 18], [10, -9]] });
      k.text(176, 326, "x₁ (같은 척도로 맞춘 검사 수치 1)", { size: 11.5, anchor: "middle", color: "muted" });
      k.table(300, 184, [56, 70], [["점", "(x₁, x₂)"], ["P1", "(2, 2)"], ["P2", "(4, 2)"], ["P3", "(5, 4)"], ["P4", "(8, 3)"], ["P5", "(8, 4)"]], { rh: 23, size: 12.5 });
      k.matrix(116, 372, D, { cw: 58, ch: 30, size: 13.5, fmt: f2, rows: ["P1", "P2", "P3", "P4", "P5"], cols: ["P1", "P2", "P3", "P4", "P5"],
        tones: function (i, j, v) { return i === j ? null : (v === 1 ? "blue" : null); },
        fills: function (i, j, v) { return i === j ? "plain" : (v === 1 ? "solid" : "plain"); } });
      k.text(240, 352, "유클리드 거리 d(Pi, Pj)", { size: 13, weight: 800, anchor: "middle", color: "ink" });
      k.para(60, 548, 370, "예) d(P2, P3) = √((5−4)² + (4−2)²) = √5 = **2.24** · 대칭 행렬이라 위·아래 삼각형이 같다", { size: 12.5, color: "ink", lh: 19 });
      k.note(56, 576, 368, 26, { tone: "blue", title: "가장 작은 값 1.00 → P4와 P5를 먼저 합친다", size: 13 });

      /* ② 행렬 줄이기 */
      k.section(470, 152, "② 합칠 때마다 행렬이 한 칸씩 줄어든다");
      var step = function (y, n, title, txt, M, rows, hi, upd) {
        k.panel(470, y, 430, n === 4 ? 172 : n === 3 ? 140 : 108, { tone: "teal", head: "soft", title: title, headH: 28, titleSize: 14 });
        k.matrix(516, y + 54, M, { cw: 46, ch: 26, size: 12.5, fmt: f2, rows: rows, cols: rows.map(function (r) { return r.length > 4 ? r.replace("P", "") : r; }),
          tones: function (i, j, v) { if (i === j) return null; if (hi && ((i === hi[0] && j === hi[1]) || (i === hi[1] && j === hi[0]))) return "blue"; if (i === upd || j === upd) return "teal"; return null; },
          fills: function (i, j) { if (i === j) return "plain"; if (hi && ((i === hi[0] && j === hi[1]) || (i === hi[1] && j === hi[0]))) return "solid"; return (i === upd || j === upd) ? "tone" : "plain"; } });
        var tx = 516 + rows.length * 46 + 16;
        k.lines(tx, y + 62, txt, { size: 12.5, lh: 19, color: "ink" });
      };
      step(168, 4, "병합 1 · P4 + P5 (높이 1.00)", ["P45 행 갱신 (단일 = min)", "P1: min(6.08, 6.32) = 6.08", "P2: min(4.12, 4.47) = 4.12", "P3: min(3.16, 3.00) = 3.00", { t: "다음 최소 2.00 → P1 + P2", tone: "blue", weight: 800 }],
        [[0, 2, 3.61, 6.08], [2, 0, 2.24, 4.12], [3.61, 2.24, 0, 3.00], [6.08, 4.12, 3.00, 0]], ["P1", "P2", "P3", "P45"], [0, 1], 3);
      step(350, 3, "병합 2 · P1 + P2 (높이 2.00)", ["P3: min(3.61, 2.24) = 2.24", "P45: min(6.08, 4.12) = 4.12", { t: "다음 최소 2.24 → P3 + P12", tone: "blue", weight: 800 }],
        [[0, 2.24, 4.12], [2.24, 0, 3.00], [4.12, 3.00, 0]], ["P12", "P3", "P45"], [0, 1], 0);
      step(500, 2, "병합 3 · P3 + {P1,P2} (높이 2.24)", ["P45: min(4.12, 3.00) = 3.00", { t: "병합 4 · 전체 하나 (높이 3.00)", tone: "blue", weight: 800 }],
        [[0, 3.00], [3.00, 0]], ["P123", "P45"], [0, 1], 0);

      /* ③ 덴드로그램 */
      k.section(930, 152, "③ 덴드로그램과 자르기");
      k.panel(930, 168, 310, 440, { tone: "gray" });
      var base = 470, unit = 80, lx = [1008, 1054, 1100, 1164, 1210];
      k.raw('<line class="dg-axis" x1="958" y1="' + base + '" x2="958" y2="' + (base - 3.3 * unit) + '"/>');
      [0, 1, 2, 3].forEach(function (h) {
        k.raw('<line class="dg-axis" x1="954" y1="' + (base - h * unit) + '" x2="958" y2="' + (base - h * unit) + '"/>');
        k.text(950, base - h * unit + 4, String(h), { size: 11.5, anchor: "end", color: "muted" });
      });
      k.text(944, 192, "높이", { size: 11.5, color: "muted" });
      dendro(k, 0, base, unit, lx, [
        { a: "P4", b: "P5", h: 1.00, id: "c45", label: "1.00", tone: "blue" },
        { a: "P1", b: "P2", h: 2.00, id: "c12", label: "2.00", tone: "blue" },
        { a: "c12", b: "P3", h: 2.236, id: "c123", label: "2.24", tone: "blue" },
        { a: "c123", b: "c45", h: 3.00, id: "all", label: "3.00", tone: "ink", mid: true }
      ], "blue");
      lx.forEach(function (x, i) { k.text(x, base + 20, "P" + (i + 1), { size: 12.5, weight: 800, anchor: "middle", color: "ink" }); });
      k.arrow(962, base - 2.6 * unit, 1232, base - 2.6 * unit, { tone: "red", dash: true, width: 2, head: false });
      k.text(966, base - 2.6 * unit - 7, "t = 2.6", { size: 12, weight: 800, tone: "red" });
      k.box(946, 504, 278, 92, { tone: "red", fill: "soft", align: "left", valign: "top", title: "자른 선 아래 가지 = 군집", size: 13.5,
        lines: [{ t: "선이 세로선 2개를 지남 → k = 2", size: 12.5 }, { t: "{P1, P2, P3} · {P4, P5}", size: 12.5, weight: 800 }, { t: "fcluster(Z, t=2.6, criterion=\"distance\")", size: 11.5, color: "muted" }] });

      /* 하단: 알고리즘 흐름 */
      k.flow(40, 640, [
        { t: "거리 행렬", s: "n × n 모든 쌍", tone: "blue" },
        { t: "최소 쌍 찾기", s: "가장 가까운 두 군집", tone: "blue" },
        { t: "합치기", s: "높이 = 그 거리", tone: "teal" },
        { t: "거리 갱신", s: "연결법 규칙(min·max·평균)", tone: "teal" },
        { t: "n − 1번 반복", s: "군집 1개가 될 때까지", tone: "purple" },
        { t: "덴드로그램 자르기", s: "높이 t 또는 군집 수 k", tone: "green" }
      ], { w: 1200, h: 50, gap: 22 });
    }
  });

  /* ------------------------------------------------------------------ (2) */
  DSDiagram.register({
    id: "hierarchical-clustering-2", sim: "hierarchical-clustering", order: 2,
    title: "계층형 군집 (2) — 두 군집 사이 거리를 재는 5가지 연결법", short: "연결법 5가지 비교",
    sub: "같은 점 5개 · 병합 1·2(P4+P5, P1+P2)는 모두 같고, 세 번째에 P3를 어느 쪽에 붙일지가 연결법마다 갈린다",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 결정 순간 — P3는 A = {P1, P2}와 B = {P4, P5} 중 어디로?");
      k.panel(40, 168, 290, 236, { tone: "gray", tinted: true });
      var S = scatter(k, 66, 196, 240, 140, { tones: ["blue", "blue", "purple", "orange", "orange"],
        groups: [{ x1: 1.55, y1: 1.55, x2: 4.45, y2: 2.45, tone: "blue" }, { x1: 7.55, y1: 2.55, x2: 8.45, y2: 4.45, tone: "orange" }],
        lab: [[-10, -10], [10, 18], [10, -10], [-12, 18], [-12, -8]] });
      k.text(66, 362, "A = {P1, P2}", { size: 13, weight: 800, tone: "blue" });
      k.text(310, 362, "B = {P4, P5}", { size: 13, weight: 800, tone: "orange", anchor: "end" });
      k.text(185, 386, "중심 cA = (3, 2) · cB = (8, 3.5)", { size: 12, anchor: "middle", color: "muted" });

      var cards = [
        { n: "단일 연결", e: "Single", f: "min d(a, b)", a: "min(3.61, 2.24) = 2.24", b: "min(3.16, 3.00) = 3.00", r: "A로 · 2.24", tone: "blue", win: "A" },
        { n: "완전 연결", e: "Complete", f: "max d(a, b)", a: "max(3.61, 2.24) = 3.61", b: "max(3.16, 3.00) = 3.16", r: "B로 · 3.16", tone: "orange", win: "B" },
        { n: "평균 연결", e: "Average", f: "모든 쌍 거리의 평균", a: "(3.61 + 2.24) / 2 = 2.92", b: "(3.16 + 3.00) / 2 = 3.08", r: "A로 · 2.92", tone: "blue", win: "A" },
        { n: "중심 연결", e: "Centroid", f: "‖cA − cB‖", a: "‖(5,4) − (3,2)‖ = 2.83", b: "‖(5,4) − (8,3.5)‖ = 3.04", r: "A로 · 2.83", tone: "blue", win: "A" },
        { n: "Ward", e: "ΔSSE 최소", f: "|A||B|/(|A|+|B|)·‖cA − cB‖²", a: "2/3 × 8 = 5.33", b: "2/3 × 9.25 = 6.17", r: "A로 · ΔSSE 5.33", tone: "blue", win: "A" }
      ];
      var cx = 346, cw = 172, gap = 6;
      cards.forEach(function (c, i) {
        var x = cx + i * (cw + gap);
        k.panel(x, 168, cw, 236, { tone: i === 1 ? "orange" : "purple", head: "solid", title: c.n, headH: 32, titleSize: 15 });
        k.text(x + 12, 222, c.e, { size: 12, weight: 700, color: "muted" });
        k.text(x + cw / 2, 248, c.f, { size: c.f.length > 14 ? 11.5 : 13, weight: 800, anchor: "middle", color: "ink" });
        k.text(x + 12, 278, "P3 ↔ A", { size: 12, weight: 800, tone: "blue" });
        k.text(x + 12, 297, c.a, { size: 12, color: "ink" });
        k.text(x + 12, 324, "P3 ↔ B", { size: 12, weight: 800, tone: "orange" });
        k.text(x + 12, 343, c.b, { size: 12, color: "ink" });
        k.box(x + 10, 360, cw - 20, 32, { tone: c.win === "A" ? "blue" : "orange", fill: "solid", title: c.r, size: 13, r: 7 });
      });

      k.section(40, 440, "② 병합 높이 기록 (scipy linkage의 Z 세 번째 열)");
      k.table(56, 454, [140, 96, 96, 140, 70, 230], [
        ["연결법", "병합 1", "병합 2", "병합 3", "병합 4", "k = 2로 자르면"],
        ["단일 single", "P4+P5 1.00", "P1+P2 2.00", { t: "P3 → A 2.24", tone: "blue" }, "3.00", "{P1,P2,P3} · {P4,P5}"],
        ["완전 complete", "1.00", "2.00", { t: "P3 → B 3.16", tone: "orange" }, "6.32", { t: "{P1,P2} · {P3,P4,P5}", tone: "orange" }],
        ["평균 average", "1.00", "2.00", { t: "P3 → A 2.92", tone: "blue" }, "4.53", "{P1,P2,P3} · {P4,P5}"],
        ["중심 centroid", "1.00", "2.00", { t: "P3 → A 2.83", tone: "blue" }, "4.41", "{P1,P2,P3} · {P4,P5}"],
        ["Ward", "1.00", "2.00", { t: "P3 → A 3.27", tone: "blue" }, "6.84", "{P1,P2,P3} · {P4,P5}"]
      ], { rh: 26, size: 12.5 });
      k.text(56, 640, "Ward 높이 = √(2 · ΔSSE) — scipy 기준 (예: √(2 × 5.33) = 3.27)", { size: 12, color: "muted" });

      k.section(870, 440, "③ 연결법별 성격");
      var notes = [
        ["blue", "단일 · 사슬 효과", "점 하나만 이어져도 합침 → 띠 모양 OK, 잡음에 약함"],
        ["orange", "완전 · 둥글고 촘촘", "가장 먼 쌍 기준 → 비슷한 크기의 덩어리, 이상값에 민감"],
        ["purple", "평균 · 중간 성격", "모든 쌍의 평균(UPGMA) → 단일과 완전의 절충"],
        ["red", "중심 · 높이 역전 가능", "합친 뒤 높이가 이전보다 낮아질 수 있음 (inversion)"],
        ["green", "Ward · K-means와 비슷", "SSE 증가가 가장 작은 쌍 → 유클리드 거리에서만"]
      ];
      notes.forEach(function (nt, i) { k.note(870, 452 + i * 49, 370, 45, { tone: nt[0], title: nt[1], body: nt[2], size: 13, bodySize: 11.5 }); });
      k.code(56, 656, 790, 40, ["Z = linkage(X_std, method=\"ward\")   # single · complete · average · centroid · ward"], { size: 12.5 });
    }
  });

  /* ------------------------------------------------------------------ (3) */
  DSDiagram.register({
    id: "hierarchical-clustering-3", sim: "hierarchical-clustering", order: 3,
    title: "계층형 군집 (3) — 분할적 DIANA: 분파 떼어 내기", short: "분할적 DIANA",
    sub: "Divisive Analysis · 같은 점 5개를 한 군집으로 시작해 지름이 가장 큰 군집을 둘로 나누는 일을 반복 (병합의 반대 방향)",
    label: "Machine Learning",
    draw: function (k) {
      k.flow(40, 132, [
        { t: "① 지름 최대 군집 고르기", s: "지름 = 가장 먼 두 점 거리", tone: "blue" },
        { t: "② 분파 시작", s: "평균 거리가 가장 큰 점", tone: "orange" },
        { t: "③ 점 옮기기", s: "D = a − b > 0 인 점", tone: "teal" },
        { t: "④ 옮길 점 없음", s: "한 번의 분할 끝 → ①로", tone: "purple" }
      ], { w: 1200, h: 48, gap: 30 });

      k.section(40, 218, "① 첫 분할 — 전체 지름 d(P1, P5) = 6.32");
      k.table(56, 232, [70, 260, 82], [
        ["점", "다른 4점과의 평균 거리", "평균"],
        [{ t: "P1", tone: "orange" }, "(2.00 + 3.61 + 6.08 + 6.32) / 4", { t: "4.50", tone: "orange", weight: 800 }],
        ["P2", "(2.00 + 2.24 + 4.12 + 4.47) / 4", "3.21"],
        ["P3", "(3.61 + 2.24 + 3.16 + 3.00) / 4", "3.00"],
        ["P4", "(6.08 + 4.12 + 3.16 + 1.00) / 4", "3.59"],
        ["P5", "(6.32 + 4.47 + 3.00 + 1.00) / 4", "3.70"]
      ], { rh: 25, size: 12.5 });
      k.note(56, 392, 412, 30, { tone: "orange", title: "가장 동떨어진 P1이 분파(splinter)의 첫 점", size: 13 });

      k.section(500, 218, "② 남은 점을 분파로 옮기기", { sub: "a = 남은 쪽과의 평균 거리 · b = 분파 쪽과의 평균 거리" });
      var hdr = ["점", "a", "b", "D = a − b"];
      var block = function (x, title, rows, tone) {
        k.panel(x, 232, 240, 190, { tone: tone, head: "soft", title: title, headH: 28, titleSize: 13.5 });
        k.table(x + 6, 266, [40, 48, 48, 92], [hdr].concat(rows), { rh: 24, size: 12.5 });
      };
      var mv = function (s) { return { t: s, tone: "teal", weight: 800 }; }, ng = function (s) { return { t: s, color: "muted" }; };
      block(500, "분파 {P1}", [["P2", "3.61", "2.00", mv("+1.61 이동")], ["P3", "2.80", "3.61", ng("−0.81")], ["P4", "2.76", "6.08", ng("−3.32")], ["P5", "2.82", "6.32", ng("−3.50")]], "teal");
      block(746, "분파 {P1, P2}", [["P3", "3.08", "2.92", mv("+0.16 이동")], ["P4", "2.08", "5.10", ng("−3.02")], ["P5", "2.00", "5.40", ng("−3.40")]], "teal");
      block(992, "분파 {P1, P2, P3}", [["P4", "1.00", "4.46", ng("−3.46")], ["P5", "1.00", "4.60", ng("−3.60")], [{ t: "D > 0 없음", tone: "purple" }, "", "", { t: "분할 끝", tone: "purple", weight: 800 }]], "purple");
      k.text(1240, 444, "결과: {P1, P2, P3} | {P4, P5} · 높이 = 지름 6.32", { size: 13, weight: 800, anchor: "end", tone: "purple" });

      k.section(40, 470, "③ 다음 분할부터");
      k.box(56, 486, 412, 112, { tone: "blue", fill: "tone", align: "left", valign: "top", title: "지름 비교: {P1,P2,P3} 3.61 > {P4,P5} 1.00", size: 13.5,
        lines: [{ t: "평균 거리 P1 2.80 · P2 2.12 · P3 2.92 → P3이 분파", size: 12.5 },
          { t: "P2: a 2.00 − b 2.24 = −0.24 · P1: −1.61 → 이동 없음", size: 12.5 },
          { t: "→ {P1, P2} | {P3} (높이 3.61)", size: 12.5, weight: 800 },
          { t: "이후 {P1, P2} 2.00 · {P4, P5} 1.00 순서로 끝까지", size: 12.5 }] });
      k.note(56, 606, 412, 44, { tone: "purple", title: "한 번 나눈 것은 다시 합치지 않는다", body: "병합적도 한 번 합친 것은 되돌리지 않음 (탐욕적 결정)", size: 13, bodySize: 11.5 });
      k.note(56, 654, 412, 44, { tone: "red", title: "D = a − b > 0 이 기준", body: "남은 쪽보다 분파 쪽에 평균적으로 더 가까우면 옮긴다", size: 13, bodySize: 11.5 });

      k.section(500, 470, "④ DIANA 덴드로그램");
      k.panel(500, 486, 330, 214, { tone: "gray" });
      var base = 664, unit = 24, lx = [596, 644, 692, 760, 806];
      [0, 2, 4, 6].forEach(function (h) { k.text(530, base - h * unit + 4, String(h), { size: 11.5, anchor: "end", color: "muted" }); k.raw('<line class="dg-axis" x1="534" y1="' + (base - h * unit) + '" x2="538" y2="' + (base - h * unit) + '"/>'); });
      k.raw('<line class="dg-axis" x1="538" y1="' + base + '" x2="538" y2="' + (base - 6.6 * unit) + '"/>');
      dendro(k, 0, base, unit, lx, [
        { a: "P4", b: "P5", h: 1.00, id: "c45", label: "1.00", tone: "purple" },
        { a: "P1", b: "P2", h: 2.00, id: "c12", label: "2.00", tone: "purple" },
        { a: "c12", b: "P3", h: 3.606, id: "c123", label: "3.61", tone: "purple" },
        { a: "c123", b: "c45", h: 6.325, id: "all", label: "6.32 (첫 분할)", tone: "orange", mid: true }
      ], "purple");
      lx.forEach(function (x, i) { k.text(x, base + 20, "P" + (i + 1), { size: 12.5, weight: 800, anchor: "middle", color: "ink" }); });

      k.section(860, 470, "⑤ 병합적 vs 분할적");
      k.table(866, 484, [104, 134, 134], [
        ["구분", "병합적 (AGNES)", "분할적 (DIANA)"],
        ["방향", "아래 → 위", "위 → 아래"],
        ["시작", "점마다 군집 n개", "전체 군집 1개"],
        ["한 단계", "가장 가까운 쌍 합침", "지름 큰 군집 나눔"],
        ["P3의 자리", "단일: P1·P2 쪽", "P1·P2 쪽"],
        ["강점", "작은 구조가 정확", "큰 구조가 정확"],
        ["계산", "거리 행렬 O(n²)", "분할마다 O(n²)"]
      ], { rh: 25, size: 12.5 });
      k.text(1240, 690, "scikit-learn에는 DIANA가 없어 직접 구현", { size: 12, anchor: "end", color: "muted" });
    }
  });
})();
