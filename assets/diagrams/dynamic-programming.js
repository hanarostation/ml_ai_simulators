/* 동적 계획법 — 알고리즘 구성도 (시뮬레이터 기본값: FrozenLake 4×4 미끄러짐, γ = 0.90, θ = 1e-8, 행동 순서 0↑ 1→ 2↓ 3←) */
(function () {
  var MAP = [["S", "F", "F", "F"], ["F", "H", "F", "H"], ["F", "F", "F", "H"], ["H", "F", "F", "G"]];
  var VSTAR = [[0.0689, 0.0614, 0.0744, 0.0558], [0.0919, 0, 0.1122, 0], [0.1454, 0.2475, 0.2996, 0], [0, 0.3799, 0.6390, 0]];
  var term = function (i, j) { return MAP[i][j] === "H" || MAP[i][j] === "G"; };
  var cellTone = function (i, j) { return MAP[i][j] === "H" ? "ink" : MAP[i][j] === "G" ? "green" : null; };
  var cellFill = function (i, j) { return MAP[i][j] === "H" ? "solid" : MAP[i][j] === "G" ? "mid" : "plain"; };
  function vfmt(d) { return function (v, i, j) { return MAP[i][j] === "H" ? "H" : MAP[i][j] === "G" ? "G" : v === 0 ? "0" : v.toFixed(d); }; }

  DSDiagram.register({
    id: "dynamic-programming-1", sim: "dynamic-programming", order: 1,
    title: "동적 계획법 (1) — 환경 모형 P와 벨만 방정식", short: "환경 모형 · 벨만 방정식",
    sub: "Dynamic Programming · 전이 확률 P와 보상 R을 알면, 시행착오 없이 벨만 방정식을 반복 계산해 가치와 정책을 구한다",
    label: "Reinforcement Learning",
    draw: function (k) {
      /* ① MDP */
      k.section(40, 152, "① MDP = (S, A, P, R, γ) — FrozenLake 4×4", { tone: "blue" });
      k.panel(40, 166, 580, 236, { tone: "blue", tinted: true });
      var lab = [["S 0", "1", "2", "3"], ["4", "H 5", "6", "H 7"], ["8", "9", "10", "H 11"], ["H 12", "13", "14", "G 15"]];
      k.matrix(64, 190, lab, { cw: 60, ch: 46, size: 13, tones: function (i, j) { return cellTone(i, j) || (i === 0 && j === 0 ? "blue" : "gray"); },
        fills: function (i, j) { return cellFill(i, j) === "plain" && !(i === 0 && j === 0) ? "plain" : cellFill(i, j) === "plain" ? "tone" : cellFill(i, j); } });
      k.text(184, 388, "상태 번호 s = 행 × 4 + 열", { size: 12, anchor: "middle", color: "muted" });
      var items = [
        ["S 상태", "16칸 (구멍 H · 목표 G 는 종료)", "blue"],
        ["A 행동", "0↑ 1→ 2↓ 3← (이 사이트 순서)", "orange"],
        ["P 전이", "미끄러짐: 의도·양옆 각 1/3", "blue"],
        ["R 보상", "G 도착 1, 나머지 0", "green"],
        ["γ 할인율", "0.90 (먼 보상일수록 작게)", "purple"]
      ];
      items.forEach(function (it, i) {
        k.box(332, 186 + i * 42, 270, 36, { tone: it[2], fill: "plain", align: "left", title: it[0] + "   " + it[1], size: 13 });
      });

      /* ② env.P */
      k.section(640, 152, "② env.P[s][a] — 전이 모형을 표로 읽는다", { tone: "teal" });
      k.panel(640, 166, 600, 236, { tone: "teal", tinted: true });
      k.text(660, 196, "env.P[0][2]  ·  s0 에서 ↓ (아래) 를 고르면", { size: 14, weight: 800, color: "ink" });
      k.table(660, 208, [100, 150, 90, 110, 100], [
        ["확률 p", "다음 상태 s′", "보상 r", "종료", "실제 방향"],
        [{ t: "1/3", mono: true }, "s4 (1, 0)", { t: "0", mono: true }, "False", "↓ 의도대로"],
        [{ t: "1/3", mono: true }, "s0 (제자리)", { t: "0", mono: true }, "False", "← 벽에 막힘"],
        [{ t: "1/3", mono: true }, "s1 (0, 1)", { t: "0", mono: true }, "False", "→ 미끄러짐"]
      ], { rh: 28, size: 13 });
      k.note(660, 334, 560, 54, { tone: "amber", title: "행동 번호 주의", body: "Gymnasium 은 0← 1↓ 2→ 3↑ — '아래'가 여기선 2, Gymnasium 에선 1" });

      /* ③ 벨만 백업 */
      k.section(40, 438, "③ 벨만 백업 — s14 (3, 2) 에 V* (γ = 0.90) 를 대입", { tone: "purple" });
      k.panel(40, 452, 1200, 246, { tone: "purple", tinted: true });
      k.formula(60, 468, 700, 36, "q(s, a) = Σ p(s′ | s, a) · [ r + γ · V(s′) ]     (종료 상태의 V = 0)", { size: 15 });
      var rows = [
        ["q(14, ↑)", "⅓(0 + 0.9×0.2996) + ⅓(1 + 0) + ⅓(0 + 0.9×0.3799)", "0.5372", "gray"],
        ["q(14, →)", "⅓(1 + 0) + ⅓(0 + 0.9×0.6390) + ⅓(0 + 0.9×0.2996)", "0.6149", "gray"],
        ["q(14, ↓)", "⅓(0 + 0.9×0.6390) + ⅓(0 + 0.9×0.3799) + ⅓(1 + 0)", "0.6390", "orange"],
        ["q(14, ←)", "⅓(0 + 0.9×0.3799) + ⅓(0 + 0.9×0.2996) + ⅓(0 + 0.9×0.6390)", "0.3956", "gray"]
      ];
      rows.forEach(function (r, i) {
        var y = 532 + i * 38;
        k.text(64, y, r[0], { size: 14, weight: 800, mono: true, tone: r[3] === "orange" ? "orange" : "ink", color: r[3] === "orange" ? "tone" : "ink" });
        k.text(164, y, r[1], { size: 13, mono: true, color: "ink" });
        k.text(756, y, "= " + r[2], { size: 14, weight: 800, mono: true, anchor: "end", tone: "purple" });
      });
      k.box(790, 470, 430, 100, { tone: "blue", fill: "plain", align: "left", title: "벨만 기대 방정식 (정책 π 고정)", size: 14,
        lines: [{ t: "V_π(s) = Σ π(a|s) · q(s, a)", size: 13.5, weight: 700, tone: "blue" },
          { t: "무작위 π: 0.25 × (0.5372 + 0.6149 + 0.6390 + 0.3956)", size: 12.5 }, { t: "= **0.5467** (지금 V*(14) 보다 작음)", size: 12.5 }] });
      k.box(790, 584, 430, 100, { tone: "orange", fill: "plain", align: "left", title: "벨만 최적 방정식", size: 14,
        lines: [{ t: "V*(s) = max_a q(s, a)", size: 13.5, weight: 700, tone: "orange" },
          { t: "max(0.5372, 0.6149, 0.6390, 0.3956) = **0.6390** = 지금 V*(14)", size: 12.5 },
          { t: "→ 백업해도 그대로 = 고정점 · 최선 행동 ↓", size: 12.5, color: "muted" }] });
    }
  });

  DSDiagram.register({
    id: "dynamic-programming-2", sim: "dynamic-programming", order: 2,
    title: "동적 계획법 (2) — 정책 반복 (Policy Iteration)", short: "정책 반복",
    sub: "정책을 고정해 끝까지 평가(기대 방정식)하고, 그 값으로 탐욕적으로 개선하기를 정책이 더 바뀌지 않을 때까지 반복",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 152, "① 평가 ⇄ 개선 루프", { tone: "orange" });
      k.panel(40, 166, 1200, 176, { tone: "orange", tinted: true });
      var a = k.box(64, 214, 190, 74, { tone: "gray", fill: "plain", title: "π₀ 무작위 균등", sub: "네 방향 0.25씩 · V = 0", size: 15 });
      var b = k.box(320, 196, 300, 110, { tone: "blue", title: "① 정책 평가", size: 16,
        lines: [{ t: "V(s) ← Σ_a π(a|s) Σ p [r + γV(s′)]", size: 13, weight: 700 }, { t: "모든 s 를 한 번 갱신 = sweep 1번", size: 12, color: "muted" }, { t: "Δ = max|V새 − V| < θ 까지 반복", size: 12, color: "muted" }] });
      var c = k.box(690, 196, 300, 110, { tone: "orange", title: "② 정책 개선", size: 16,
        lines: [{ t: "π(s) ← argmax_a q(s, a)", size: 13, weight: 700 }, { t: "같은 값이면 기존 행동 유지", size: 12, color: "muted" }, { t: "바뀐 칸 수를 센다", size: 12, color: "muted" }] });
      var d = k.box(1052, 214, 168, 74, { tone: "green", fill: "solid", title: "π* · V*", sub: "바뀐 칸 0 → 종료", size: 16 });
      k.link(a.r, b.l, { tone: "gray" });
      k.link(c.r, d.l, { tone: "green", label: "안정" });
      k.arrow(620, 236, 690, 236, { tone: "blue", label: "V_π" });
      k.arrow(690, 280, 620, 280, { tone: "orange", label: "새 π", labelDy: 30 });
      k.text(655, 334, "정책이 바뀌었으면 새 정책을 다시 평가 (평가는 이전 V 에서 이어서 시작)", { size: 12.5, anchor: "middle", color: "muted" });

      k.section(40, 378, "② FrozenLake 4×4 · γ = 0.90 · θ = 1e-8 — 숫자로 따라가기", { tone: "blue" });
      k.panel(40, 392, 1200, 238, { tone: "blue", tinted: true });
      var VR = [[0.0045, 0.0042, 0.0101, 0.0041], [0.0067, 0, 0.0263, 0], [0.0187, 0.0576, 0.1070, 0], [0, 0.1304, 0.3915, 0]];
      k.matrix(64, 440, VR,
        { cw: 64, ch: 36, size: 13, fmt: vfmt(4), tones: function (i, j) { return cellTone(i, j) || "blue"; }, fills: function (i, j) { return term(i, j) ? cellFill(i, j) : "tone"; }, title: "V_π₀ (무작위 정책 평가, 49 sweep)", titleTone: "blue" });
      k.arrow(328, 512, 362, 512, { tone: "orange", label: "개선" });
      var A = ["↑", "→", "↓", "←"], P1 = [[3, 0, 3, 0], [3, -1, 1, -1], [0, 2, 3, -1], [-1, 1, 2, -1]];
      k.matrix(372, 440, P1, { cw: 44, ch: 36, size: 18, fmt: function (v, i, j) { return MAP[i][j] === "H" ? "H" : MAP[i][j] === "G" ? "G" : A[v]; },
        tones: function (i, j) { return cellTone(i, j) || "orange"; }, fills: function (i, j) { return term(i, j) ? cellFill(i, j) : "tone"; }, title: "π₁ (11칸 모두 결정)", titleTone: "orange" });
      k.arrow(556, 512, 590, 512, { tone: "blue", label: "평가" });
      k.matrix(600, 440, VSTAR, { cw: 64, ch: 36, size: 13, fmt: vfmt(4), tones: function (i, j) { return cellTone(i, j) || "purple"; }, fills: function (i, j) { return term(i, j) ? cellFill(i, j) : "tone"; },
        title: "V_π₁ = V* (109 sweep 더)", titleTone: "purple", hl: [{ r: 0, c: 0, tone: "red" }] });
      k.table(878, 408, [52, 86, 140, 76], [
        ["반복", "평가 sweep", "바뀐 칸", "V(시작)"],
        [{ t: "1", mono: true }, { t: "49", mono: true }, "11 (무작위→결정)", { t: "0.0045", mono: true }],
        [{ t: "2", mono: true }, { t: "109", mono: true }, { t: "0 → 안정", tone: "green" }, { t: "0.0689", mono: true, tone: "purple" }]
      ], { rh: 28, size: 12.5 });
      k.text(888, 514, "γ = 0.99 이면 3번 반복", { size: 13, weight: 800, color: "ink" });
      k.table(878, 524, [52, 86, 140, 76], [
        [{ t: "1", mono: true }, { t: "71", mono: true }, "11", { t: "0.0124", mono: true }],
        [{ t: "2", mono: true }, { t: "367", mono: true }, "1", { t: "0.5325", mono: true }],
        [{ t: "3", mono: true }, { t: "338", mono: true }, { t: "0 → 안정", tone: "green" }, { t: "0.5420", mono: true, tone: "purple" }]
      ], { rh: 26, size: 12.5, header: false });

      k.note(40, 646, 390, 52, { tone: "blue", title: "평가 = 연립방정식 풀기", body: "V_π = R_π + γ P_π V_π 를 반복법으로 푼 것" });
      k.note(445, 646, 390, 52, { tone: "orange", title: "개선 정리", body: "탐욕 개선은 모든 칸에서 V 를 줄이지 않음" });
      k.note(850, 646, 390, 52, { tone: "green", title: "반복 횟수가 적다", body: "정책 수는 유한 → 몇 번 만에 안정 (여기선 2~3번)" });
    }
  });

  DSDiagram.register({
    id: "dynamic-programming-3", sim: "dynamic-programming", order: 3,
    title: "동적 계획법 (3) — 가치 반복과 비교", short: "가치 반복 · 비교",
    sub: "Value Iteration · 평가를 sweep 한 번으로 줄이고 max 를 바로 써서, 벨만 최적 방정식을 반복 대입으로 푼다",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 152, "① 가치 반복 — 목표에서 값이 한 칸씩 퍼져 나간다 (γ = 0.90)", { tone: "purple" });
      k.panel(40, 166, 1200, 268, { tone: "purple", tinted: true });
      k.formula(60, 180, 1160, 36, "Vₖ₊₁(s) ← max_a Σ p(s′|s, a) · [ r + γ · Vₖ(s′) ]   ·   Δₖ = max_s |Vₖ₊₁(s) − Vₖ(s)| < θ 이면 멈춤   ·   π*(s) = argmax_a q(s, a)", { size: 14.5 });
      var V1 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0.3333, 0]];
      var V2 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0.1, 0], [0, 0.1, 0.4333, 0]];
      var V3 = [[0, 0, 0, 0], [0, 0, 0.03, 0], [0, 0.06, 0.13, 0], [0, 0.16, 0.4933, 0]];
      var tv = function (M) { return function (i, j) { return cellTone(i, j) || (M[i][j] > 0 ? "purple" : "gray"); }; };
      var fv = function (M) { return function (i, j) { return term(i, j) ? cellFill(i, j) : M[i][j] > 0 ? "tone" : "plain"; }; };
      [[V1, "V₁ · Δ = 0.3333"], [V2, "V₂ · Δ = 0.1000"], [V3, "V₃ · Δ = 0.0600"]].forEach(function (m, i) {
        var x = 64 + i * 262;
        k.matrix(x, 256, m[0], { cw: 52, ch: 34, size: 12.5, fmt: vfmt(4), tones: tv(m[0]), fills: fv(m[0]), title: m[1], titleTone: "purple" });
        if (i < 2) k.arrow(x + 214, 324, x + 250, 324, { tone: "purple" });
      });
      k.text(842, 330, "…", { size: 26, weight: 800, anchor: "middle", color: "muted" });
      k.matrix(870, 256, VSTAR, { cw: 84, ch: 34, size: 13.5, fmt: vfmt(4), tones: function (i, j) { return cellTone(i, j) || "purple"; }, fills: function (i, j) { return term(i, j) ? cellFill(i, j) : "mid"; },
        title: "V₁₁₂ = V* (θ = 1e-8)", titleTone: "purple", hl: [{ r: 0, c: 0, tone: "red" }] });
      k.text(64, 418, "V₁: 목표 바로 옆 s14 만 ⅓ × 1 = 0.3333 · V₂: s14 = ⅓(1) + ⅓(0.9 × 0.3333) = 0.4333 · 시작 칸은 5번째 sweep 에야 0이 아니게 됨", { size: 12.5, color: "muted" });

      k.section(40, 470, "② 정책 반복 vs 가치 반복 — 시뮬레이터 검산값", { tone: "orange" });
      k.panel(40, 484, 740, 152, { tone: "orange", tinted: true });
      k.table(56, 496, [210, 130, 200, 170], [
        ["환경 · γ (미끄러짐, θ = 1e-8)", "가치 반복 sweep", "정책 반복 반복 / sweep", "V(시작)"],
        ["FrozenLake 4×4 · 0.90", { t: "112", mono: true }, { t: "2 / 158", mono: true }, { t: "0.0689", mono: true, tone: "purple" }],
        ["FrozenLake 4×4 · 0.99", { t: "438", mono: true }, { t: "3 / 776", mono: true }, { t: "0.5420", mono: true, tone: "purple" }],
        ["FrozenLake 8×8 · 0.99", { t: "516", mono: true }, { t: "3 / 1216", mono: true }, { t: "0.4146", mono: true, tone: "purple" }]
      ], { rh: 30, size: 13 });

      k.section(800, 470, "③ 정리와 한계", { tone: "red" });
      k.note(800, 484, 440, 46, { tone: "orange", title: "정책 반복: 바깥 반복 적음, 매번 평가가 무거움", size: 13 });
      k.note(800, 537, 440, 46, { tone: "purple", title: "가치 반복: 한 sweep 이 가볍고 구현이 간단", size: 13 });
      k.note(800, 590, 440, 46, { tone: "red", title: "한계: P·R 을 알아야 함 · 상태가 많으면 표가 폭발", size: 13 });

      k.flow(40, 652, [
        { t: "환경 모형 P · R", s: "env.P[s][a]", tone: "blue" },
        { t: "벨만 백업", s: "q(s,a) = Σ p[r + γV]", tone: "purple" },
        { t: "평가 / 가치 반복", s: "Δ < θ 까지 sweep", tone: "purple" },
        { t: "정책 개선", s: "argmax q", tone: "orange" },
        { t: "모형이 없으면", s: "몬테카를로 · TD 학습", tone: "green" }
      ], { w: 1200, h: 46 });
    }
  });
})();
