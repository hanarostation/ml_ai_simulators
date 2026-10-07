/* Monte Carlo 학습 — 알고리즘 구성도 (시뮬레이터 기본 예제와 같은 숫자: GridWorld 4×4 · γ = 0.9 · 경로 9→10→9→5→4→0) */
DSDiagram.register({
  id: "monte-carlo-1", sim: "monte-carlo", order: 1,
  title: "Monte Carlo (1) — 리턴 G와 MC 예측", short: "리턴 계산과 MC 예측",
  sub: "모델(전이 확률) 없이, 에피소드를 끝까지 해 본 뒤 실제로 받은 리턴 G의 평균으로 V(s)를 추정한다",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 루프 */
    k.section(40, 152, "① 에이전트–환경 루프와 리턴 G", { tone: "orange" });
    k.panel(40, 166, 420, 306, { tone: "gray", tinted: true });
    var ag = k.box(60, 196, 150, 62, { tone: "orange", title: "에이전트", sub: "정책 π(a | s)", size: 16 });
    var en = k.box(290, 196, 150, 62, { tone: "blue", title: "환경", sub: "전이 확률은 모름", size: 16 });
    k.arrow(210, 210, 290, 210, { tone: "orange", width: 2.2 });
    k.text(250, 202, "행동 Aₜ", { size: 12.5, weight: 700, anchor: "middle", tone: "orange" });
    k.arrow(290, 244, 210, 244, { tone: "green", width: 2.2 });
    k.text(250, 268, "보상 Rₜ₊₁ · 상태 Sₜ₊₁", { size: 12, weight: 700, anchor: "middle", tone: "green" });
    k.text(60, 302, "에피소드 = S₀, A₀, R₁, S₁, A₁, R₂, …, 종료 상태", { size: 13, weight: 700, color: "ink" });
    k.formula(60, 314, 380, 62, "Gₜ = Rₜ₊₁ + γRₜ₊₂ + γ²Rₜ₊₃ + …\n= Rₜ₊₁ + γ · Gₜ₊₁   (종료 뒤 G = 0)", { size: 14.5, tone: "purple" });
    k.bullets(60, 402, 390, [
      { t: "V(s) ≈ 상태 s에서 받은 G들의 **평균**", tone: "purple" },
      { t: "필요한 것은 경험(표본)뿐 — P(s′|s,a)는 몰라도 됨", tone: "blue" },
      { t: "단, 에피소드가 끝나야 G를 알 수 있음", tone: "red" }
    ], { size: 13, lh: 21 });

    /* ② 강의 예제 */
    k.section(480, 152, "② 강의 예제 — 기록하고, 뒤에서부터 G 계산 (γ = 0.9)", { tone: "purple" });
    k.panel(480, 166, 760, 306, { tone: "purple", tinted: true });
    var gx = 500, gy = 196, c = 44;
    for (var s = 0; s < 16; s++) {
      var r = Math.floor(s / 4), cc = s % 4, x = gx + cc * c, y = gy + r * c;
      if (s === 0 || s === 15) k.rect(x, y, c, c, { tone: "green", fill: "tone" });
      else if (s === 9) k.rect(x, y, c, c, { tone: "blue", fill: "tone" });
      k.rect(x, y, c, c, { tone: "gray", fill: "none" });
      k.text(x + c - 5, y + 14, String(s), { size: 11.5, anchor: "end", color: "muted" });
    }
    k.text(gx + 8, gy + 18, "G", { size: 13, weight: 800, tone: "green" });
    k.text(gx + 3 * c + 8, gy + 3 * c + 18, "G", { size: 13, weight: 800, tone: "green" });
    k.text(gx + c + 8, gy + 2 * c + 18, "S", { size: 13, weight: 800, tone: "blue" });
    var C = function (st) { return [gx + (st % 4) * c + c / 2, gy + Math.floor(st / 4) * c + c / 2]; };
    var p9 = C(9), p10 = C(10), p5 = C(5), p4 = C(4), p0 = C(0);
    k.arrow(p9[0], p9[1] - 6, p10[0] - 6, p10[1] - 6, { tone: "orange", width: 2.4, headSize: 9 });
    k.arrow(p10[0], p10[1] + 6, p9[0] + 6, p9[1] + 6, { tone: "orange", width: 2.4, headSize: 9 });
    k.arrow(p9[0] - 4, p9[1] - 2, p5[0] - 4, p5[1] + 8, { tone: "orange", width: 2.4, headSize: 9 });
    k.arrow(p5[0] - 4, p5[1], p4[0] + 8, p4[1], { tone: "orange", width: 2.4, headSize: 9 });
    k.arrow(p4[0], p4[1] - 4, p0[0], p0[1] + 10, { tone: "orange", width: 2.4, headSize: 9 });
    k.text(gx + 88, gy + 4 * c + 22, "9 → 10 → 9 → 5 → 4 → 0 (종료)", { size: 12.5, weight: 700, anchor: "middle", tone: "orange" });
    k.text(gx + 88, gy + 4 * c + 40, "매 걸음 보상 −1 · T = 5", { size: 12, anchor: "middle", color: "muted" });
    k.text(gx + 88, gy + 4 * c + 58, "두 모서리(G) = 종료 상태", { size: 12, anchor: "middle", color: "muted" });

    k.table(704, 184, [40, 70, 66, 84, 96, 80], [
      ["t", "Sₜ", "Aₜ", "Rₜ₊₁", "Gₜ", "방문"],
      [{ t: "0", mono: true }, { t: "9", tone: "blue" }, { t: "→", tone: "orange" }, { t: "−1", tone: "red", mono: true }, { t: "−4.0951", tone: "purple", mono: true }, { t: "첫 방문", tone: "teal" }],
      [{ t: "1", mono: true }, { t: "10", tone: "blue" }, { t: "←", tone: "orange" }, { t: "−1", tone: "red", mono: true }, { t: "−3.439", tone: "purple", mono: true }, { t: "첫 방문", tone: "teal" }],
      [{ t: "2", mono: true }, { t: "9", tone: "blue" }, { t: "↑", tone: "orange" }, { t: "−1", tone: "red", mono: true }, { t: "−2.71", tone: "purple", mono: true }, { t: "재방문", tone: "pink" }],
      [{ t: "3", mono: true }, { t: "5", tone: "blue" }, { t: "←", tone: "orange" }, { t: "−1", tone: "red", mono: true }, { t: "−1.9", tone: "purple", mono: true }, { t: "첫 방문", tone: "teal" }],
      [{ t: "4", mono: true }, { t: "4", tone: "blue" }, { t: "↑", tone: "orange" }, { t: "−1", tone: "red", mono: true }, { t: "−1", tone: "purple", mono: true }, { t: "첫 방문", tone: "teal" }]
    ], { rh: 27, size: 13 });
    k.rect(704, 350, 520, 114, { tone: "pink", fill: "none", r: 8 });
    k.text(718, 372, "뒤에서부터: Gₜ = Rₜ₊₁ + γ · Gₜ₊₁", { size: 13.5, weight: 800, color: "ink" });
    k.lines(718, 396, ["G₄ = −1 + 0.9 × 0 = −1", "G₃ = −1 + 0.9 × (−1) = −1.9", "G₂ = −1 + 0.9 × (−1.9) = −2.71"], { size: 12.5, lh: 21, color: "ink" });
    k.lines(966, 396, ["G₁ = −1 + 0.9 × (−2.71) = −3.439", { t: "G₀ = −1 + 0.9 × (−3.439) = **−4.0951**", tone: "red", color: "tone" }, { t: "← 시작 상태 9의 리턴", tone: "red", color: "tone" }], { size: 12.5, lh: 21, color: "ink" });
    k.arrow(1180, 340, 1180, 216, { tone: "pink", width: 2, label: "", headSize: 9 });
    k.text(1190, 282, "역순", { size: 12, weight: 700, tone: "pink" });

    /* ③ 첫 방문 vs 모든 방문 */
    k.section(40, 508, "③ 첫 방문 vs 모든 방문 — 상태 9는 t = 0, 2에 두 번 방문", { tone: "teal" });
    k.box(40, 522, 380, 112, { tone: "teal", align: "left", valign: "top", title: "첫 방문 MC (First-visit)", size: 15,
      lines: [{ t: "에피소드에서 처음 방문한 t = 0의 G만 사용", size: 13 }, { t: "표본 = **−4.0951** (상태당 1개)", size: 13.5, weight: 700, color: "ink" }, { t: "에피소드끼리 독립 → 편향 없는 평균", size: 12.5, color: "muted" }] });
    k.box(436, 522, 380, 112, { tone: "pink", align: "left", valign: "top", title: "모든 방문 MC (Every-visit)", size: 15,
      lines: [{ t: "방문할 때마다의 G를 모두 사용", size: 13 }, { t: "(−4.0951 + (−2.71)) / 2 = **−3.4026**", size: 13.5, weight: 700, color: "ink" }, { t: "표본은 많지만 서로 상관 · 점근적으로 편향 없음", size: 12.5, color: "muted" }] });
    k.box(832, 522, 408, 112, { tone: "purple", align: "left", valign: "top", title: "증분 평균으로 갱신", size: 15,
      lines: [{ t: "N(s) ← N(s) + 1,  V(s) ← V(s) + (1 / N(s)) · (G − V(s))", size: 12.5, color: "ink" }, { t: "고정 α: V ← V + α (G − V) — 최근 리턴에 더 가중", size: 12.5 }, { t: "γ = 1 · 무작위 정책의 참값 V(9) = −20 (DP 검산)", size: 12.5, color: "muted" }] });

    k.flow(40, 652, [
      { t: "에피소드 끝까지 진행", tone: "orange" }, { t: "G를 뒤에서부터 계산", tone: "pink" }, { t: "상태별 G 모으기", tone: "teal" }, { t: "평균 → V(s)", tone: "purple" }, { t: "정책 개선 (제어)", tone: "amber" }
    ], { label: "MC 흐름", h: 40, w: 1200, size: 13.5 });
  }
});

DSDiagram.register({
  id: "monte-carlo-2", sim: "monte-carlo", order: 2,
  title: "Monte Carlo (2) — ε-탐욕 MC 제어", short: "ε-탐욕 MC 제어",
  sub: "모델이 없으므로 V 대신 행동 가치 Q(s, a)를 평균하고, 에피소드마다 평가와 개선을 번갈아 한다 (일반화된 정책 반복)",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① GPI */
    k.section(40, 152, "① 평가 ⇄ 개선 (GPI)", { tone: "purple" });
    k.panel(40, 166, 570, 262, { tone: "purple", tinted: true });
    var ev = k.box(70, 194, 220, 82, { tone: "purple", title: "평가 (Evaluation)", sub: "Q(s, a) ← 방문한 (s, a)의 리턴 평균", size: 15 });
    var im = k.box(360, 194, 220, 82, { tone: "orange", title: "개선 (Improvement)", sub: "π ← ε-탐욕(Q)", size: 15 });
    k.arrow(290, 214, 360, 214, { tone: "purple", width: 2.2, label: "Q", labelDy: -2 });
    k.arrow(360, 258, 290, 258, { tone: "orange", width: 2.2, label: "π", labelDy: 30 });
    k.box(70, 300, 510, 112, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "왜 V가 아니라 Q인가?", titleColor: "ink", size: 14,
      lines: [
        { t: "V만 알면 행동을 고를 때 argmax_a Σ P(s′|s,a)[r + γV(s′)] — 모델 P가 필요", size: 12.5 },
        { t: "Q(s, a)를 직접 배우면 argmax_a Q(s, a)로 바로 고름 → 모델 불필요", size: 12.5, tone: "purple" },
        { t: "한 에피소드마다 Q 갱신 → 곧바로 정책 개선 (완전히 수렴할 때까지 기다리지 않음)", size: 12.5 }
      ] });

    /* ② ε-탐욕 */
    k.section(630, 152, "② ε-탐욕 정책 — 모든 행동을 계속 시도", { tone: "amber" });
    k.panel(630, 166, 610, 262, { tone: "amber", tinted: true });
    k.bars(660, 196, 260, 190, [0.925, 0.025, 0.025, 0.025], { labels: ["탐욕 a*", "나머지", "나머지", "나머지"], tones: ["orange", "amber", "amber", "amber"], fmt: function (v) { return v.toFixed(3); }, max: 1, size: 12.5 });
    k.text(790, 190, "ε = 0.1, 행동 4개", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });
    k.formula(950, 196, 270, 66, "π(a*|s) = 1 − ε + ε/|A| = 0.925\nπ(a|s) = ε/|A| = 0.025", { size: 13.5, tone: "orange" });
    k.bullets(950, 292, 272, [
      { t: "처음 Q = 0이어도 다른 행동의 리턴을 언젠가 보게 됨", tone: "amber" },
      { t: "ε을 1 → 0.05로 줄이면 점점 탐욕에 가까워짐 (GLIE)", tone: "amber" },
      { t: "on-policy: ε-탐욕 자신의 가치를 배움", tone: "orange" }
    ], { size: 12.5, lh: 19 });

    /* ③ 의사 코드 */
    k.section(40, 462, "③ 의사 코드 — On-policy 첫 방문 MC 제어", { tone: "blue" });
    k.code(40, 476, 640, 166, [
      "Q(s,a) = 0,  N(s,a) = 0                     # 모든 s, a",
      "for 에피소드 = 1, 2, …:",
      "    ε-탐욕(Q)으로 S₀ A₀ R₁ … 종료까지 생성    # 에피소드 1개",
      "    G = 0",
      "    for t = T−1 … 0:                          # 뒤에서부터",
      "        G = γ·G + R(t+1)",
      "        if (S(t), A(t))가 이번 에피소드 첫 방문:",
      "            N += 1;  Q += (G − Q) / N         # 또는 α"
    ], { size: 12.5 });

    /* ④ 결과 */
    k.section(700, 462, "④ FrozenLake 4×4 (미끄러짐) — DP로 검산", { tone: "green" });
    k.panel(700, 476, 540, 166, { tone: "green", tinted: true });
    k.table(716, 486, [196, 312], [
      ["설정 / 지표", "값"],
      ["MC 제어 설정", "γ 0.99 · ε 0.1 · 표본 평균 · 1만 에피소드"],
      [{ t: "탐욕 정책의 V^π(s₀)", tone: "teal" }, "0.5325 (seed 3) — env.P로 정책 평가"],
      [{ t: "최적 V*(s₀)", tone: "ink" }, "0.5420 (가치 반복)"],
      [{ t: "seed 1~5의 V^π(s₀)", tone: "red" }, "0.385 · 0.385 · 0.532 · 0.365 · 0.520"]
    ], { rh: 29, size: 12.5 });

    k.flow(40, 660, [
      { t: "ε-탐욕으로 에피소드", tone: "orange" }, { t: "G 거꾸로 계산", tone: "pink" }, { t: "Q(s, a) 평균 갱신", tone: "purple" }, { t: "π ← ε-탐욕(Q)", tone: "amber" }, { t: "반복 → Q*, π*", tone: "green" }
    ], { label: "MC 제어", h: 36, w: 1200, size: 13.5 });
  }
});

DSDiagram.register({
  id: "monte-carlo-3", sim: "monte-carlo", order: 3,
  title: "Monte Carlo (3) — 분산과 중요도 샘플링", short: "분산 · 중요도 샘플링",
  sub: "MC 리턴은 편향이 없지만 분산이 크다 · 다른 정책 b로 모은 경험으로 π를 평가하려면 확률 비율 ρ로 다시 가중한다",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 비교표 */
    k.section(40, 152, "① DP · MC · TD — 무엇을 타깃으로 쓰는가", { tone: "blue" });
    k.table(40, 166, [150, 160, 150, 160, 100, 100], [
      ["방법", "모델 P 필요", "갱신 시점", "타깃", "편향", "분산"],
      [{ t: "DP", tone: "gray" }, "필요 (env.P)", "전체 상태 반복", "Σ P [r + γV(s′)]", "—", "—"],
      [{ t: "Monte Carlo", tone: "purple" }, "불필요 (경험)", "에피소드 끝", { t: "실제 리턴 Gₜ", tone: "purple" }, { t: "없음", tone: "green" }, { t: "큼", tone: "red" }],
      [{ t: "TD(0)", tone: "pink" }, "불필요 (경험)", "매 걸음", { t: "R + γV(S′)", tone: "pink" }, { t: "있음", tone: "red" }, { t: "작음", tone: "green" }]
    ], { rh: 30, size: 13 });

    /* ② 분산 숫자 */
    k.section(880, 152, "② 분산 실험 (시뮬레이터 기본값)", { tone: "red" });
    k.panel(880, 166, 360, 120, { tone: "red", tinted: true });
    k.lines(898, 194, [
      { t: "GridWorld · 무작위 정책 · γ = 0.9 · 20회 × 300 에피소드", size: 12, color: "muted" },
      { t: "참값 V(9) = −7.181 (DP) · G₀ 표준편차 σ = 2.433", size: 12.5, color: "ink" },
      { t: "표본 평균의 흔들림 ≈ σ/√N = 2.433/√300 = **0.140**", size: 12.5, tone: "teal", color: "tone" },
      { t: "고정 α = 0.1의 흔들림 ≈ σ√(α/(2−α)) = **0.558**", size: 12.5, tone: "pink", color: "tone" }
    ], { lh: 22 });

    /* ③ 중요도 샘플링 */
    k.section(40, 330, "③ 오프폴리시 MC — b로 모으고 π를 평가", { tone: "orange" });
    k.panel(40, 344, 520, 290, { tone: "orange", tinted: true });
    /* 상태 1개 MDP */
    k.box(60, 420, 90, 46, { tone: "gray", fill: "soft", title: "종료", size: 13.5 });
    k.circle(300, 443, 32, { tone: "blue", fill: "tone", label: "s", size: 16 });
    k.box(450, 420, 90, 46, { tone: "gray", fill: "soft", title: "종료", size: 13.5 });
    k.arrow(268, 443, 152, 443, { tone: "orange", width: 2.2 });
    k.text(210, 434, "← 0.1, r = +1", { size: 12, weight: 700, anchor: "middle", tone: "green" });
    k.arrow(332, 443, 448, 443, { tone: "gray", width: 2 });
    k.text(390, 434, "→ r = 0", { size: 12, weight: 700, anchor: "middle", color: "muted" });
    k.arrow(282, 416, 318, 416, { tone: "orange", width: 2, curve: -46 });
    k.text(300, 372, "← 0.9 제자리, r = 0", { size: 12, weight: 700, anchor: "middle", tone: "orange" });
    k.lines(60, 504, [
      { t: "목표 π: 항상 ←  (참값 v_π(s) = 1)", size: 13, weight: 700, color: "ink" },
      { t: "행동 b: ←, → 각 0.5  ·  γ = 1", size: 13, color: "ink" },
      { t: "ρ = Π π(A|S) / b(A|S) → ← 하나마다 ×2, → 가 나오면 0", size: 13, tone: "orange", color: "tone" },
      { t: "보통 IS: V = Σ ρG / n  — 편향 없음, 분산 무한대 가능", size: 13, tone: "pink", color: "tone" },
      { t: "가중 IS: V = Σ ρG / Σ ρ — 약간의 편향, 분산 작음", size: 13, tone: "teal", color: "tone" }
    ], { lh: 24 });

    k.section(580, 330, "④ 실험 1에서 ρ > 0이었던 에피소드 (seed 1)", { tone: "teal" });
    k.table(580, 344, [92, 108, 40, 96, 166, 158], [
      ["에피소드 n", "b의 행동", "G", "ρ", "보통 Σ ρG / n", "가중 Σ ρG / Σ ρ"],
      [{ t: "20", mono: true }, { t: "← ← ←", tone: "orange" }, "1", { t: "2³ = 8", mono: true }, { t: "8 / 20 = 0.400", tone: "pink", mono: true }, { t: "8 / 8 = 1.000", tone: "teal", mono: true }],
      [{ t: "25", mono: true }, { t: "← × 7", tone: "orange" }, "1", { t: "2⁷ = 128", mono: true }, { t: "136 / 25 = 5.440", tone: "pink", mono: true }, { t: "136 / 136 = 1.000", tone: "teal", mono: true }],
      [{ t: "41", mono: true }, { t: "← ←", tone: "orange" }, "1", { t: "2² = 4", mono: true }, { t: "140 / 41 = 3.415", tone: "pink", mono: true }, { t: "140 / 140 = 1.000", tone: "teal", mono: true }]
    ], { rh: 30, size: 13 });
    k.note(580, 478, 660, 70, { tone: "pink", title: "보통 IS는 드문 긴 ← 에피소드 하나(ρ = 128)에 끌려 5.44까지 튄다", body: "ρ의 기댓값은 1이지만 분산이 무한대라 10만 에피소드 뒤에도 출렁인다. ρ = 0인 에피소드는 0을 더할 뿐." });
    k.note(580, 560, 660, 70, { tone: "teal", title: "가중 IS는 첫 ρ > 0 에피소드부터 1.000 — 실무(오프폴리시 MC 제어)의 기본", body: "ρ > 0이면 ←로만 끝났으므로 G = 1 → Σ ρG / Σ ρ = 1. 보통은 작은 편향이 있으나 표본이 늘면 사라진다." });

    k.flow(40, 656, [
      { t: "b로 에피소드 수집", tone: "orange" }, { t: "ρ = Π π / b 계산", tone: "amber" }, { t: "ρ · G로 다시 가중", tone: "pink" }, { t: "보통 / 가중 평균", tone: "teal" }, { t: "π의 가치 추정", tone: "purple" }
    ], { label: "오프폴리시", h: 36, w: 1200, size: 13.5 });
  }
});
