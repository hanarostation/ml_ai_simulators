/* 연관분석 (Apriori · FP-Growth) — 알고리즘 구성도 (강의 필기자료 양식으로 새로 설계)
   예제 = 시뮬레이터 '기본 12건' 동반 진단 데이터 · 최소 지지도 0.25 (3건) · 최소 신뢰도 0.6 · 최소 향상도 1.2 */
(function () {
  var T = [["고혈압", "당뇨", "고지혈증"], ["고혈압", "당뇨", "고지혈증", "비만"], ["고혈압", "당뇨", "고지혈증"], ["고혈압", "고지혈증", "수면무호흡"],
    ["고혈압", "당뇨"], ["비만", "지방간", "수면무호흡"], ["비만", "지방간"], ["고혈압", "비만", "지방간", "수면무호흡"], ["고혈압", "수면무호흡"],
    ["고혈압", "비만"], ["당뇨", "비만", "지방간"], ["고혈압", "수면무호흡"]];
  var has = function (t, s) { return s.every(function (x) { return t.indexOf(x) >= 0; }); };

  /* ------------------------------------------------------------------ (1) */
  DSDiagram.register({
    id: "association-rules-1", sim: "association-rules", order: 1,
    title: "연관분석 (1) — 지지도 · 신뢰도 · 향상도", short: "규칙의 세 가지 지표",
    sub: "환자 12명의 동반 진단을 '거래'로 보고 규칙 A → B (A가 있으면 B도 있다)를 표에서 직접 세어 본다 · 시뮬레이터 기본 12건",
    label: "Machine Learning",
    draw: function (k) {
      var A = ["고혈압", "고지혈증"], B = ["당뇨"];
      k.section(40, 152, "① 거래 표 · A = {고혈압, 고지혈증}");
      var y0 = 168, rh = 23.5;
      T.forEach(function (t, i) {
        var a = has(t, A), b = has(t, B);
        if (a || b) k.rect(48, y0 + rh * (i + 1), 440, rh, { tone: a && b ? "teal" : a ? "blue" : "orange", fill: a && b ? "mid" : "tone", r: 3 });
      });
      var rows = [["#", "동반 진단 (항목 집합)", "A", "B"]];
      T.forEach(function (t, i) { rows.push(["T" + (i + 1), t.join(", "), has(t, A) ? { t: "●", tone: "blue" } : "", has(t, B) ? { t: "●", tone: "orange" } : ""]); });
      k.table(48, y0, [52, 316, 36, 36], rows, { rh: rh, size: 12.5 });
      k.chip(56, 488, "A와 B 모두 3건", { tone: "teal", size: 12, h: 24 });
      k.chip(186, 488, "A만 1건", { tone: "blue", size: 12, h: 24 });
      k.chip(268, 488, "B만 2건", { tone: "orange", size: 12, h: 24 });
      k.text(488, 505, "N = 12", { size: 13, weight: 800, anchor: "end", color: "ink" });

      k.section(520, 152, "② 규칙 A → B = {당뇨}의 세 지표");
      var cards = [
        { t: "지지도 support", q: "얼마나 자주?", f: "P(A ∩ B) = n(A∪B) / N", v: "3 / 12 = 0.25", tone: "blue", note: "최소 지지도 0.25 (3건) 이상만 남김" },
        { t: "신뢰도 confidence", q: "A일 때 B일 확률", f: "P(B | A) = n(A∪B) / n(A)", v: "3 / 4 = 0.75", tone: "teal", note: "A 환자 4명 중 3명이 당뇨" },
        { t: "향상도 lift", q: "우연보다 몇 배?", f: "conf / P(B) = 0.75 / (5/12)", v: "0.75 / 0.417 = 1.80", tone: "purple", note: "전체 당뇨 비율 41.7%보다 1.8배" }
      ];
      cards.forEach(function (c, i) {
        var y = 168 + i * 104;
        k.panel(520, y, 440, 96, { tone: c.tone, head: "none" });
        k.rect(520, y, 6, 96, { tone: c.tone, fill: "solid", r: 3 });
        k.text(540, y + 26, c.t, { size: 15, weight: 800, tone: c.tone });
        k.text(944, y + 26, c.q, { size: 12.5, weight: 700, anchor: "end", color: "muted" });
        k.text(540, y + 52, c.f, { size: 13.5, color: "ink" });
        k.text(944, y + 52, c.v, { size: 15, weight: 800, anchor: "end", tone: c.tone });
        k.text(540, y + 80, c.note, { size: 12, color: "muted" });
      });
      k.box(990, 168, 250, 304, { tone: "gray", fill: "soft", align: "left", valign: "top", size: 14, title: "보조 지표", lines: [
        { t: "leverage", size: 13, weight: 800, tone: "blue" },
        { t: "sup(A∪B) − sup(A)·sup(B)", size: 12 },
        { t: "= 0.25 − 0.333 × 0.417 = 0.111", size: 12 },
        { t: "0보다 크면 함께 더 자주 나옴", size: 12, color: "muted" },
        { t: "conviction", size: 13, weight: 800, tone: "purple" },
        { t: "(1 − sup(B)) / (1 − conf)", size: 12 },
        { t: "= 0.583 / 0.25 = 2.33", size: 12 },
        { t: "신뢰도 1이면 무한대", size: 12, color: "muted" },
        { t: "방향이 있다", size: 13, weight: 800, tone: "orange" },
        { t: "A → B와 B → A는 신뢰도가 다름", size: 12 },
        { t: "향상도·leverage는 대칭", size: 12, color: "muted" }
      ] });

      k.section(40, 556, "③ 신뢰도만 보면 속는다 — 향상도로 확인");
      k.table(56, 572, [210, 96, 104, 96, 320], [
        ["규칙", "지지도", "신뢰도", "향상도", "해석"],
        [{ t: "{고혈압, 고지혈증} → {당뇨}", tone: "green" }, "0.25", "0.75", { t: "1.80", tone: "green", weight: 800 }, "강한 양의 연관 · 기준 통과"],
        [{ t: "{수면무호흡} → {고혈압}", tone: "orange" }, "0.33", { t: "0.80", weight: 800 }, { t: "1.07", tone: "orange", weight: 800 }, "고혈압이 원래 75%로 흔해서 생긴 착시"],
        [{ t: "{지방간} → {고혈압}", tone: "red" }, "0.08", "0.25", { t: "0.33", tone: "red", weight: 800 }, "음의 연관 (함께 덜 나옴)"]
      ], { rh: 27, size: 12.5 });
      k.note(900, 572, 340, 36, { tone: "green", title: "lift > 1 → 양의 연관 (함께 더 자주)", size: 13 });
      k.note(900, 614, 340, 36, { tone: "gray", title: "lift = 1 → 독립 (관계 없음)", size: 13 });
      k.note(900, 656, 340, 36, { tone: "red", title: "lift < 1 → 음의 연관 (함께 덜)", size: 13 });
    }
  });

  /* ------------------------------------------------------------------ (2) */
  DSDiagram.register({
    id: "association-rules-2", sim: "association-rules", order: 2,
    title: "연관분석 (2) — Apriori를 단계별로 따라가기", short: "Apriori 단계별",
    sub: "핵심 성질: 빈발 집합의 부분집합은 모두 빈발 → 부분집합 하나라도 빈발이 아니면 세 보지도 않고 버린다 · 최소 지지도 3건",
    label: "Machine Learning",
    draw: function (k) {
      k.flow(40, 126, [
        { t: "Cₖ 후보 만들기", s: "Lₖ₋₁ 끼리 결합 (join)", tone: "blue" },
        { t: "가지치기 (prune)", s: "부분집합이 비빈발이면 제거", tone: "red" },
        { t: "세기 (스캔)", s: "데이터를 한 번 훑어 개수", tone: "orange" },
        { t: "거르기 → Lₖ", s: "3건 이상만 빈발 집합", tone: "green" }
      ], { w: 1200, h: 46, gap: 30 });

      /* k = 1 */
      k.section(40, 214, "① k = 1 — 항목 6개 모두 3건 이상");
      k.table(56, 228, [96, 46], [["항목", "개수"], ["고혈압", { t: "9", weight: 800 }], ["비만", "6"], ["당뇨", "5"], ["수면무호흡", "5"], ["고지혈증", "4"], ["지방간", "4"]], { rh: 25, size: 12.5 });
      k.box(214, 228, 196, 64, { tone: "green", fill: "tone", title: "L₁ = 6개", sub: "스캔 1번 · 센 후보 6개", size: 14 });
      k.para(214, 318, 196, "통풍 · 골다공증 등은 12건에 한 번도 없어 후보에서 빠짐", { size: 12, lh: 18, color: "muted" });

      /* k = 2 */
      k.section(440, 214, "② k = 2 — 후보 15개 (6C2) 세기");
      var C2 = [["고혈압+당뇨", 4], ["고혈압+고지혈증", 4], ["고혈압+비만", 3], ["고혈압+수면무호흡", 4], ["당뇨+고지혈증", 3], ["비만+지방간", 4],
        ["고혈압+지방간", 1], ["당뇨+비만", 2], ["당뇨+지방간", 1], ["당뇨+수면무호흡", 0], ["고지혈증+비만", 1], ["고지혈증+지방간", 0], ["고지혈증+수면무호흡", 1], ["비만+수면무호흡", 2], ["지방간+수면무호흡", 2]];
      C2.forEach(function (c, i) {
        var col = i < 8 ? 0 : 1, row = col ? i - 8 : i, x = 456 + col * 196, y = 230 + row * 25, ok = c[1] >= 3;
        k.box(x, y, 186, 22, { tone: ok ? "green" : "gray", fill: ok ? "tone" : "ghost", r: 5 });
        k.text(x + 10, y + 15.5, c[0], { size: 12, weight: ok ? 800 : 400, tone: ok ? "green" : null, color: ok ? "tone" : "muted" });
        k.text(x + 176, y + 15.5, String(c[1]), { size: 12.5, weight: 800, anchor: "end", tone: ok ? "green" : null, color: ok ? "tone" : "muted" });
      });
      k.box(652, 410, 186, 22, { tone: "green", fill: "solid", title: "L₂ = 6개 (3건 이상)", size: 12.5, r: 5 });
      k.text(456, 448, "k = 2는 부분집합(항목 1개)이 모두 빈발이라 가지치기 0개", { size: 12, color: "muted" });

      /* k = 3 */
      k.section(870, 214, "③ k = 3 — 결합 6개 → 가지치기 5개");
      var C3 = [["고혈압+당뇨+고지혈증", "세기 → 3건", "green"], ["고혈압+당뇨+비만", "당뇨+비만 2건", "red"], ["고혈압+당뇨+수면무호흡", "당뇨+수면무호흡 0건", "red"],
        ["고혈압+고지혈증+비만", "고지혈증+비만 1건", "red"], ["고혈압+고지혈증+수면무호흡", "고지혈증+수면 1건", "red"], ["고혈압+비만+수면무호흡", "비만+수면무호흡 2건", "red"]];
      C3.forEach(function (c, i) {
        var y = 230 + i * 34, ok = c[2] === "green";
        k.box(886, y, 354, 30, { tone: c[2], fill: ok ? "tone" : "ghost", r: 6 });
        k.text(898, y + 19.5, c[0], { size: 12, weight: 800, tone: c[2] });
        k.text(1230, y + 19.5, ok ? c[1] : "✕ " + c[1], { size: 11.5, anchor: "end", tone: ok ? "green" : null, color: ok ? "tone" : "muted" });
      });
      k.box(886, 438, 354, 30, { tone: "green", fill: "solid", title: "L₃ = {고혈압, 당뇨, 고지혈증} 3건", size: 12.5, r: 6 });
      k.text(886, 488, "k = 4: L₃가 1개뿐이라 결합할 짝이 없음 → 종료", { size: 12, weight: 700, color: "ink" });

      /* 요약 · 규칙 */
      k.section(40, 528, "④ 한 번에 보기");
      k.table(56, 542, [100, 90, 90, 90, 100], [
        ["", "k = 1", "k = 2", "k = 3", "합계"],
        ["결합 후보", "6", "15", "6", "27"],
        ["가지치기", "0", "0", { t: "5", tone: "red", weight: 800 }, { t: "5", tone: "red" }],
        ["실제로 셈", "6", "15", "1", { t: "22 (스캔 3번)", weight: 800 }],
        ["빈발 집합", "6", "6", "1", { t: "13", tone: "green", weight: 800 }]
      ], { rh: 27, size: 12.5 });

      k.section(560, 528, "⑤ 빈발 집합 → 규칙 (신뢰도 0.6 · 향상도 1.2 이상)");
      k.table(576, 542, [262, 84, 84, 84, 150], [
        ["{고혈압, 당뇨, 고지혈증}을 A ∪ B로 나누기", "지지도", "신뢰도", "향상도", "판정"],
        ["{고지혈증} → {고혈압, 당뇨}", "0.25", "0.75", { t: "2.25", weight: 800 }, { t: "통과", tone: "green" }],
        ["{고혈압, 고지혈증} → {당뇨}", "0.25", "0.75", { t: "1.80", weight: 800 }, { t: "통과", tone: "green" }],
        ["{당뇨, 고지혈증} → {고혈압}", "0.25", "1.00", "1.33", { t: "통과", tone: "green" }],
        ["{고혈압} → {당뇨, 고지혈증}", "0.25", { t: "0.33", tone: "red" }, "1.33", { t: "신뢰도 미달", tone: "red" }]
      ], { rh: 27, size: 12.5 });
      k.text(1240, 694, "빈발 집합 7개(크기 2 이상)에서 규칙 18개 → 기준 통과 10개", { size: 12, anchor: "end", color: "muted" });
    }
  });

  /* ------------------------------------------------------------------ (3) */
  DSDiagram.register({
    id: "association-rules-3", sim: "association-rules", order: 3,
    title: "연관분석 (3) — FP-Growth: 두 번 스캔 · 트리로 압축", short: "FP-Growth",
    sub: "후보를 만들지 않는다 · 빈도순으로 정렬한 거래를 공통 접두사끼리 겹쳐 FP-트리 하나에 담고, 아래 항목부터 조건부 트리로 채굴",
    label: "Machine Learning",
    draw: function (k) {
      k.section(40, 152, "① 빈도 세기");
      var HD = [["고혈압", 9, "blue"], ["비만", 6, "orange"], ["당뇨", 5, "purple"], ["수면무호흡", 5, "teal"], ["고지혈증", 4, "red"], ["지방간", 4, "amber"]];
      k.table(56, 166, [104, 50], [["항목", "개수"]].concat(HD.map(function (h) { return [{ t: h[0], tone: h[2] }, String(h[1])]; })), { rh: 25, size: 12.5 });
      k.para(56, 352, 170, "같은 개수면 원래 항목 순서 · 3건 미만 항목은 여기서 버림", { size: 12, lh: 18, color: "muted" });

      k.section(250, 152, "② 빈도순으로 정렬");
      var S = [["고혈압", "당뇨", "고지혈증"], ["고혈압", "비만", "당뇨", "고지혈증"], ["고혈압", "당뇨", "고지혈증"], ["고혈압", "수면무호흡", "고지혈증"], ["고혈압", "당뇨"], ["비만", "수면무호흡", "지방간"],
        ["비만", "지방간"], ["고혈압", "비만", "수면무호흡", "지방간"], ["고혈압", "수면무호흡"], ["고혈압", "비만"], ["비만", "당뇨", "지방간"], ["고혈압", "수면무호흡"]];
      S.forEach(function (t, i) {
        var y = 182 + i * 21.5;
        k.text(266, y, "T" + (i + 1), { size: 12, weight: 800, color: "muted" });
        k.text(300, y, t.join(" → "), { size: 12, color: "ink" });
      });

      k.section(560, 152, "③ 스캔 2 — FP-트리 (노드 = 항목 : 개수)");
      k.panel(560, 166, 680, 300, { tone: "gray" });
      var cx = [604, 700, 820, 950, 1100], tone = { "고혈압": "blue", "비만": "orange", "당뇨": "purple", "수면무호흡": "teal", "고지혈증": "red", "지방간": "amber" };
      var N = [
        { id: "a", p: "root", d: 1, r: 0, t: "고혈압", c: 9 }, { id: "a1", p: "a", d: 2, r: 0, t: "당뇨", c: 3 }, { id: "a11", p: "a1", d: 3, r: 0, t: "고지혈증", c: 2 },
        { id: "a2", p: "a", d: 2, r: 1, t: "비만", c: 3 }, { id: "a21", p: "a2", d: 3, r: 1, t: "당뇨", c: 1 }, { id: "a211", p: "a21", d: 4, r: 1, t: "고지혈증", c: 1 },
        { id: "a22", p: "a2", d: 3, r: 2, t: "수면무호흡", c: 1 }, { id: "a221", p: "a22", d: 4, r: 2, t: "지방간", c: 1 },
        { id: "a3", p: "a", d: 2, r: 3, t: "수면무호흡", c: 3 }, { id: "a31", p: "a3", d: 3, r: 3, t: "고지혈증", c: 1 },
        { id: "b", p: "root", d: 1, r: 4, t: "비만", c: 3 }, { id: "b1", p: "b", d: 2, r: 4, t: "수면무호흡", c: 1 }, { id: "b11", p: "b1", d: 3, r: 4, t: "지방간", c: 1 },
        { id: "b2", p: "b", d: 2, r: 5, t: "지방간", c: 1 }, { id: "b3", p: "b", d: 2, r: 6, t: "당뇨", c: 1 }, { id: "b31", p: "b3", d: 3, r: 6, t: "지방간", c: 1 }
      ];
      var pos = {}, bw = 108, bh = 28; cx = [600, 650, 790, 930, 1070];
      N.forEach(function (n) { pos[n.id] = { x: cx[n.d], y: 190 + n.r * 37 }; });
      pos.root = { x: 602, y: 190 + 2 * 37 };
      N.forEach(function (n) {
        var p = pos[n.p], q = pos[n.id];
        var sx = n.p === "root" ? p.x + 26 : p.x + bw, sy = n.p === "root" ? p.y + bh / 2 : p.y + bh / 2;
        k.path("M" + sx + " " + sy + " C" + (sx + 16) + " " + sy + " " + (q.x - 16) + " " + (q.y + bh / 2) + " " + q.x + " " + (q.y + bh / 2), { tone: "gray", width: 1.6 });
      });
      k.box(pos.root.x - 26, pos.root.y, 52, bh, { tone: "ink", fill: "solid", title: "root", size: 12, r: 6 });
      N.forEach(function (n) {
        var q = pos[n.id], hot = n.t === "고지혈증";
        k.box(q.x, q.y, bw, bh, { tone: tone[n.t], fill: hot ? "solid" : "tone", title: n.t + " : " + n.c, size: 12.5, r: 6, thick: hot });
      });
      k.text(1226, 456, "노드 16개 · 공통 접두사 공유 (고혈압 9건이 노드 하나)", { size: 12, anchor: "end", color: "muted" });

      k.section(40, 500, "④ 채굴 예 — 고지혈증 (헤더 아래쪽부터)");
      k.panel(40, 516, 700, 184, { tone: "red", tinted: true });
      k.text(60, 544, "조건부 패턴 베이스 (고지혈증 노드에서 root까지 올라간 경로)", { size: 13, weight: 800, tone: "red" });
      k.lines(60, 570, ["{고혈압, 당뇨} : 2", "{고혈압, 비만, 당뇨} : 1", "{고혈압, 수면무호흡} : 1"], { size: 13, lh: 22, color: "ink" });
      k.lines(300, 570, ["경로 안 개수 합", { t: "고혈압 4 · 당뇨 3 → 남김", tone: "green", weight: 800 }, { t: "비만 1 · 수면무호흡 1 → 버림", color: "muted" }], { size: 13, lh: 22 });
      k.box(540, 556, 90, 30, { tone: "blue", fill: "tone", title: "고혈압 : 4", size: 12.5, r: 6 });
      k.box(640, 556, 84, 30, { tone: "purple", fill: "tone", title: "당뇨 : 3", size: 12.5, r: 6 });
      k.arrow(630, 571, 640, 571, { tone: "gray", width: 1.6, headSize: 6 });
      k.text(632, 604, "조건부 FP-트리", { size: 12, weight: 700, anchor: "middle", color: "muted" });
      k.box(60, 640, 664, 44, { tone: "green", fill: "tone", size: 13, title: "{고지혈증} 4 · {고혈압, 고지혈증} 4 · {당뇨, 고지혈증} 3 · {고혈압, 당뇨, 고지혈증} 3" });

      k.section(770, 500, "⑤ Apriori와 비교 (같은 데이터 · 같은 기준)");
      k.table(786, 516, [118, 162, 174], [
        ["", "Apriori", "FP-Growth"],
        ["데이터 스캔", "3번 (k마다 1번)", { t: "2번", tone: "green", weight: 800 }],
        ["후보 생성", "27개 결합 · 22개 셈", { t: "없음", tone: "green", weight: 800 }],
        ["메모리", "후보 집합 목록", "FP-트리 (노드 16개)"],
        ["빈발 집합", "13개", "13개 (결과 동일)"],
        ["잘 맞는 경우", "작은 데이터 · 설명용", "큰 데이터 · 긴 거래"]
      ], { rh: 27, size: 12.5 });
      k.text(1240, 694, "mlxtend: apriori() / fpgrowth() → association_rules()", { size: 12, anchor: "end", color: "muted" });
    }
  });
})();
