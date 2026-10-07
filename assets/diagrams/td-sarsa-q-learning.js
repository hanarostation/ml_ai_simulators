/* TD(0) → SARSA → Q-learning — 알고리즘 구성도 (시뮬레이터 기본 예제와 같은 숫자: 무작위 걷기 seed 27 · CliffWalking α 0.5, ε 0.1, 500 에피소드, seed 1) */
DSDiagram.register({
  id: "td-sarsa-q-learning-1", sim: "td-sarsa-q-learning", order: 1,
  title: "TD 학습 (1) — TD(0) 부트스트래핑", short: "TD(0) 부트스트래핑",
  sub: "에피소드 끝을 기다리지 않고 ‘보상 + 다음 상태의 추정값’으로 한 걸음마다 갱신 · 무작위 걷기 5상태, α = 0.1, γ = 1",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 갱신식 */
    k.section(40, 152, "① TD(0) 갱신식 — 타깃과 TD 오차", { tone: "pink" });
    k.panel(40, 166, 590, 150, { tone: "pink", tinted: true });
    k.formula(60, 182, 550, 50, "V(Sₜ) ← V(Sₜ) + α [ **Rₜ₊₁ + γ · V(Sₜ₊₁)** − V(Sₜ) ]", { size: 18 });
    k.chip(70, 246, "TD 타깃 = Rₜ₊₁ + γ · V(Sₜ₊₁)", { tone: "pink", size: 13 });
    k.chip(330, 246, "TD 오차 δₜ = 타깃 − V(Sₜ)", { tone: "red", size: 13 });
    k.text(70, 298, "다음 상태의 ‘추정값’을 빌려 와 타깃을 만든다 = 부트스트래핑", { size: 13, weight: 700, color: "ink" });

    /* ② MC vs TD 백업 */
    k.section(650, 152, "② 무엇을 기다리나 — MC vs TD", { tone: "purple" });
    k.panel(650, 166, 590, 150, { tone: "purple", tinted: true });
    var row = function (y, n, tone, lab, note) {
      for (var i = 0; i < n; i++) {
        k.circle(690 + i * 62, y, 14, { tone: i === 0 ? "blue" : "gray", fill: i === 0 ? "tone" : "plain" });
        if (i < n - 1) k.arrow(704 + i * 62, y, 738 + i * 62, y, { tone: "gray", width: 1.6, headSize: 7 });
      }
      k.text(690 + (n - 1) * 62 + 26, y + 5, lab, { size: 13, weight: 800, tone: tone });
      k.text(690 + (n - 1) * 62 + 26, y + 23, note, { size: 12, color: "muted" });
    };
    row(206, 5, "purple", "MC: 실제 리턴 Gₜ", "… 종료까지 기다림 · 편향 없음 · 분산 큼");
    row(272, 2, "pink", "TD: Rₜ₊₁ + γ · V(Sₜ₊₁)", "한 걸음만 보고 바로 갱신 · 처음엔 편향 · 분산 작음 · 끝나지 않는 과제도 가능");

    /* ③ 무작위 걷기 예제 */
    k.section(40, 352, "③ 무작위 걷기 — 처음 두 에피소드를 숫자로 (seed 27)", { tone: "blue" });
    k.panel(40, 366, 1200, 262, { tone: "blue", tinted: true });
    var names = ["끝", "A", "B", "C", "D", "E", "끝"];
    for (var i = 0; i < 7; i++) {
      var cx = 80 + i * 66;
      if (i === 0 || i === 6) k.box(cx - 24, 382, 48, 34, { tone: "gray", fill: "soft", title: i ? "+1" : "0", size: 14, r: 6 });
      else k.circle(cx, 399, 18, { tone: "blue", fill: i === 3 ? "tone" : "plain", label: names[i], size: 15 });
      if (i < 6) k.arrow(cx + (i === 0 ? 26 : 20), 399, cx + 66 - (i === 5 ? 26 : 20), 399, { tone: "gray", width: 1.4, headSize: 6, both: true });
    }
    k.text(278, 440, "C에서 시작 · 좌우 반반 · 오른쪽 끝 +1 · 참값 V = 1/6 … 5/6", { size: 12.5, anchor: "middle", color: "muted" });

    k.table(56, 456, [92, 82, 120, 62, 160], [
      ["에피소드", "전이", "타깃 r + V(S′)", "δ", "TD 갱신"],
      [{ t: "1", tone: "blue" }, "C→D, D→E", "0 + 0.5 = 0.5", "0", "변화 없음"],
      ["", { t: "E→끝", tone: "green" }, { t: "1 + 0 = 1", tone: "pink" }, { t: "0.5", tone: "red" }, { t: "V(E) = 0.5 + 0.1×0.5 = 0.55", tone: "purple" }],
      [{ t: "2", tone: "blue" }, "C→D→C→D", "0 + 0.5 = 0.5", "0", "변화 없음"],
      ["", "D→E", { t: "0 + 0.55 = 0.55", tone: "pink" }, { t: "0.05", tone: "red" }, { t: "V(D) = 0.505", tone: "purple" }],
      ["", { t: "E→끝", tone: "green" }, { t: "1 + 0 = 1", tone: "pink" }, { t: "0.45", tone: "red" }, { t: "V(E) = 0.595", tone: "purple" }]
    ], { rh: 27, size: 12.5 });

    var vals = [[0.5, 0.5, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5, 0.55], [0.5, 0.5, 0.55, 0.55, 0.55], [0.5, 0.5, 0.5, 0.505, 0.595], [0.5, 0.5, 0.595, 0.595, 0.595]];
    k.matrix(720, 404, vals, { cw: 72, ch: 30, size: 13.5, mono: true, cols: ["A", "B", "C", "D", "E"], rows: ["처음", "1회 뒤 TD", "1회 뒤 MC", "2회 뒤 TD", "2회 뒤 MC"],
      fmt: function (v) { return String(v); },
      tones: function (r, c, v) { return v === 0.5 ? null : (r % 2 ? "purple" : "teal"); } });
    k.text(900, 574, "TD는 보상 정보가 한 칸씩 뒤로 전파 · MC는 지나온 칸 전부를 한 번에", { size: 12.5, weight: 700, anchor: "middle", color: "ink" });
    k.text(900, 594, "참값 1/6 = 0.167 · 2/6 = 0.333 · 3/6 = 0.5 · 4/6 = 0.667 · 5/6 = 0.833", { size: 12, anchor: "middle", color: "muted" });
    k.text(900, 614, "모든 V는 0.5에서 시작 · MC는 첫 방문 · 같은 에피소드 · 고정 α = 0.1", { size: 12, anchor: "middle", color: "muted" });

    k.note(40, 642, 1200, 58, { tone: "pink", title: "100 에피소드 뒤 RMS 오차 (100번 반복 평균) — TD α 0.05: 0.037 · α 0.1: 0.057  vs  MC α 0.02: 0.082 · α 0.04: 0.064",
      body: "같은 경험량에서 TD가 대체로 더 빨리 정확해진다 (Sutton & Barto 예제 6.2). α가 크면 빨리 내려가지만 바닥이 높아진다." });
  }
});

DSDiagram.register({
  id: "td-sarsa-q-learning-2", sim: "td-sarsa-q-learning", order: 2,
  title: "TD 학습 (2) — SARSA vs Q-learning", short: "SARSA vs Q-learning",
  sub: "같은 TD 갱신 Q(s, a) ← Q + α[타깃 − Q], 다른 것은 타깃 속 ‘다음 행동의 가치’ 하나 — 실제로 할 행동 vs 최선의 행동",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 두 알고리즘 */
    k.section(40, 152, "① 타깃 하나 차이", { tone: "teal" });
    k.panel(40, 166, 590, 214, { tone: "teal", head: "solid", title: "SARSA — on-policy", right: "행동 정책 = 학습 정책 (ε-탐욕)", tinted: true });
    k.formula(58, 214, 554, 44, "Q(s,a) ← Q(s,a) + α [ r + γ · **Q(s′, a′)** − Q(s,a) ]", { size: 15.5, tone: "teal" });
    var ch = [["S", "blue"], ["A", "orange"], ["R", "green"], ["S′", "blue"], ["A′", "orange"]], x = 60;
    ch.forEach(function (c) { x += k.chip(x, 272, c[0], { tone: c[1], solid: true, size: 13.5, w: 46 }) + 8; });
    k.text(330, 290, "← 갱신에 다섯 개 필요 = SARSA", { size: 12.5, weight: 700, color: "muted" });
    k.bullets(60, 326, 560, [
      { t: "a′ = ε-탐욕이 실제로 고른 다음 행동 (탐험 포함)", tone: "orange" },
      { t: "탐험 중 실수의 위험까지 Q에 반영 → 안전한 정책", tone: "teal" }
    ], { size: 13, lh: 22 });

    k.panel(650, 166, 590, 214, { tone: "pink", head: "solid", title: "Q-learning — off-policy", right: "행동: ε-탐욕 · 학습: 탐욕", tinted: true });
    k.formula(668, 214, 554, 44, "Q(s,a) ← Q(s,a) + α [ r + γ · **maxₐ′ Q(s′, a′)** − Q(s,a) ]", { size: 15.5, tone: "pink" });
    x = 670;
    [["S", "blue"], ["A", "orange"], ["R", "green"], ["S′", "blue"]].forEach(function (c) { x += k.chip(x, 272, c[0], { tone: c[1], solid: true, size: 13.5, w: 46 }) + 8; });
    k.chip(x, 272, "max Q(S′, ·)", { tone: "pink", size: 13.5 });
    k.bullets(670, 326, 560, [
      { t: "다음에 실제로 할 행동과 무관하게 최댓값을 사용", tone: "pink" },
      { t: "최적 Q*를 직접 배움 · 과거 경험 재사용 가능 (→ DQN)", tone: "purple" }
    ], { size: 13, lh: 22 });

    /* ② 같은 전이, 세 타깃 */
    k.section(40, 418, "② 같은 전이, 세 가지 타깃 — 절벽 바로 위 칸 (r = −1, γ = 1, α = 0.5, ε = 0.1, Q(s,a) = −9)", { tone: "pink" });
    k.matrix(140, 466, [[-9.5, -8, -100, -10.2]], { cw: 74, ch: 40, size: 15, mono: true, cols: ["↑", "→", "↓ 절벽", "←"], rows: ["Q(s′, ·)"],
      fmt: function (v) { return String(v).replace("-", "−"); },
      tones: function (r, c) { return c === 0 ? "orange" : c === 1 ? "pink" : c === 2 ? "red" : null; },
      hl: [{ r: 0, c: 0, tone: "orange" }, { r: 0, c: 1, tone: "pink" }] });
    k.text(140, 530, "주황 = SARSA의 a′ (탐험으로 ↑가 뽑힘)", { size: 12.5, weight: 700, tone: "orange" });
    k.text(140, 550, "분홍 = 최댓값 (→)", { size: 12.5, weight: 700, tone: "pink" });
    k.text(140, 570, "π(→) = 1 − ε + ε/4 = 0.925, 나머지 0.025", { size: 12.5, color: "muted" });

    var res = [
      ["SARSA", "teal", "−1 + Q(s′, ↑) = −1 + (−9.5)", "−10.5", "−9 + 0.5 × (−1.5) = **−9.75**"],
      ["Q-learning", "pink", "−1 + max = −1 + (−8)", "−9", "−9 + 0.5 × 0 = **−9**"],
      ["Expected SARSA", "purple", "−1 + Σπ Q = −1 + (−10.3925)", "−11.3925", "−9 + 0.5 × (−2.3925) = **−10.196**"]
    ];
    res.forEach(function (r, i) {
      k.box(480 + i * 254, 444, 242, 132, { tone: r[1], align: "left", valign: "top", title: r[0], size: 15,
        lines: [{ t: r[2], size: 12.5, color: "ink" }, { t: "타깃 = " + r[3], size: 13, weight: 700, tone: "red" }, { t: "새 Q = " + r[4], size: 12.5, color: "ink" }] });
    });
    k.note(40, 598, 1200, 54, { tone: "purple", title: "Expected SARSA: Σ π(a′|s′) Q(s′, a′) = 0.925 × (−8) + 0.025 × (−9.5 − 100 − 10.2) = −10.3925",
      body: "a′를 뽑는 운 대신 기댓값을 써서 SARSA보다 분산이 작다. ε = 0이면 Q-learning과 같아진다." });
    k.flow(40, 664, [
      { t: "ε-탐욕으로 a 실행", tone: "orange" }, { t: "r, s′ 관측", tone: "green" }, { t: "타깃 계산 (세 방식)", tone: "pink" }, { t: "δ = 타깃 − Q(s,a)", tone: "red" }, { t: "Q(s,a) += α δ", tone: "purple" }
    ], { label: "한 걸음", h: 36, w: 1200, size: 13 });
  }
});

DSDiagram.register({
  id: "td-sarsa-q-learning-3", sim: "td-sarsa-q-learning", order: 3,
  title: "TD 학습 (3) — CliffWalking 비교", short: "CliffWalking 비교",
  sub: "α = 0.5 · ε = 0.1 · 500 에피소드 · seed 1 — 같은 조건에서 SARSA는 안전한 위쪽 길, Q-learning은 절벽 끝 최단 길",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 학습이 끝난 뒤의 탐욕 경로", { tone: "teal" });
    var gx = 40, gy = 170, c = 58;
    for (var s = 0; s < 48; s++) {
      var r = Math.floor(s / 12), cc = s % 12, x = gx + cc * c, y = gy + r * c;
      if (s >= 37 && s <= 46) k.rect(x, y, c, c, { tone: "red", fill: "tone" });
      else if (s === 47) k.rect(x, y, c, c, { tone: "green", fill: "tone" });
      else if (s === 36) k.rect(x, y, c, c, { tone: "blue", fill: "tone" });
      k.rect(x, y, c, c, { tone: "gray", fill: "none" });
    }
    k.text(gx + 8, gy + 3 * c + 20, "S", { size: 15, weight: 800, tone: "blue" });
    k.text(gx + 11 * c + 8, gy + 3 * c + 20, "G", { size: 15, weight: 800, tone: "green" });
    k.text(gx + 6 * c, gy + 3 * c + 35, "절벽: −100, 시작점으로", { size: 13, weight: 800, anchor: "middle", tone: "red" });
    var P = function (st, off) { return (gx + (st % 12) * c + c / 2 + off) + " " + (gy + Math.floor(st / 12) * c + c / 2 + off); };
    var sar = [36, 24, 12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 22, 23, 35, 47], ql = [36, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 47];
    k.path("M" + sar.map(function (st) { return P(st, -5); }).join(" L"), { tone: "teal", width: 4 });
    k.path("M" + ql.map(function (st) { return P(st, 5); }).join(" L"), { tone: "pink", width: 4 });
    k.text(gx + 3 * c, gy + c + 34, "SARSA 17걸음 (리턴 −17) — 맨 윗줄로 돌아감", { size: 13.5, weight: 800, tone: "teal" });
    k.text(gx + 3 * c, gy + 2 * c + 20, "Q-learning 13걸음 (리턴 −13 = 최적) — 절벽 바로 위", { size: 13.5, weight: 800, tone: "pink" });

    k.section(770, 152, "② 결과 (시뮬레이터와 같은 숫자)", { tone: "pink" });
    k.table(770, 166, [150, 104, 104, 112], [
      ["알고리즘", "최근 100 평균", "탐욕 경로", "절벽 추락"],
      [{ t: "SARSA", tone: "teal" }, { t: "−28.2", mono: true }, "17걸음", { t: "46번", mono: true }],
      [{ t: "Q-learning", tone: "pink" }, { t: "−50.1", mono: true }, "13걸음", { t: "162번", mono: true }],
      [{ t: "Expected SARSA", tone: "purple" }, { t: "−16.9", mono: true }, "15걸음", { t: "35번", mono: true }]
    ], { rh: 32, size: 13 });
    k.text(770, 318, "최근 100 평균 = 학습 중(ε-탐욕) 에피소드 리턴 · 추락 = 500 에피소드 전체", { size: 12, color: "muted" });
    k.text(770, 338, "같은 seed면 시뮬레이터에서 똑같이 재현됨", { size: 12, color: "muted" });

    k.section(40, 438, "③ 왜 길이 갈리나", { tone: "orange" });
    k.box(40, 452, 560, 120, { tone: "teal", align: "left", valign: "top", title: "SARSA: 절벽 옆 칸의 Q에 ‘ε 확률로 떨어질 위험’이 들어감", size: 14,
      lines: [{ t: "타깃 Q(s′, a′)의 a′가 가끔 무작위(↓) → −100이 섞인 평균", size: 12.5 }, { t: "→ 절벽에서 멀리 떨어진 맨 윗줄이 ‘실제로는’ 더 안전", size: 12.5, color: "ink" }, { t: "학습 중 성적이 좋다 (−28.2 > −50.1)", size: 12.5, tone: "teal" }] });
    k.box(616, 452, 624, 120, { tone: "pink", align: "left", valign: "top", title: "Q-learning: ‘앞으로는 최선만 한다’고 가정한 가치", size: 14,
      lines: [{ t: "타깃 max Q(s′, ·)에는 떨어지는 행동이 안 들어감 → 절벽 끝 최단 경로", size: 12.5 }, { t: "→ 탐험하며 걷는 동안에는 자주 떨어짐 (162번)", size: 12.5, color: "ink" }, { t: "ε을 0으로 두고 시험하면 −13으로 최고", size: 12.5, tone: "pink" }] });

    k.section(40, 606, "④ ε에 따른 최근 100 평균 (seed 1)", { tone: "amber" });
    k.table(40, 620, [150, 120, 120, 120, 120], [
      ["ε", "0", "0.05", "0.1", "0.2"],
      [{ t: "SARSA", tone: "teal" }, { t: "−13.0", mono: true }, { t: "−19.1", mono: true }, { t: "−28.2", mono: true }, { t: "−35.6", mono: true }],
      [{ t: "Q-learning", tone: "pink" }, { t: "−13.0", mono: true }, { t: "−21.0", mono: true }, { t: "−50.1", mono: true }, { t: "−98.4", mono: true }]
    ], { rh: 26, size: 13 });
    k.note(690, 620, 550, 78, { tone: "amber", title: "ε → 0이면 차이가 사라진다 (0 → 1.9 → 21.9 → 62.8)", body: "ε = 0이면 a′ = argmax라 두 타깃이 같다. 학습 중 성적(SARSA 유리)과 학습 후 정책(Q-learning 유리)은 다른 질문." });
  }
});

DSDiagram.register({
  id: "td-sarsa-q-learning-4", sim: "td-sarsa-q-learning", order: 4,
  title: "TD 학습 (4) — 정리와 FrozenLake", short: "정리 · FrozenLake",
  sub: "MC · TD(0) · SARSA · Q-learning · Expected SARSA를 한 표로 · 미끄러운 FrozenLake 4×4에서 DP 최적값과 검산",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 한눈에 비교", { tone: "blue" });
    k.table(40, 166, [170, 92, 250, 160, 120, 408], [
      ["방법", "배우는 값", "타깃", "정책 구분", "갱신 시점", "특징"],
      [{ t: "Monte Carlo", tone: "purple" }, "V 또는 Q", "Gₜ (실제 리턴)", "on (IS로 off 가능)", "에피소드 끝", "편향 없음 · 분산 큼 · 에피소드가 끝나야 함"],
      [{ t: "TD(0)", tone: "pink" }, "V", "R + γV(S′)", "예측 (정책 고정)", "매 걸음", "부트스트래핑 · 분산 작음 · 처음엔 편향"],
      [{ t: "SARSA", tone: "teal" }, "Q", "R + γQ(S′, A′)", "on-policy", "매 걸음", "탐험 위험까지 반영 → 학습 중 안전"],
      [{ t: "Q-learning", tone: "pink" }, "Q", "R + γ max Q(S′, ·)", "off-policy", "매 걸음", "Q*를 직접 · 경험 재사용 가능 → DQN의 바탕"],
      [{ t: "Expected SARSA", tone: "purple" }, "Q", "R + γ Σ π(a′|S′) Q(S′, a′)", "on / off 모두", "매 걸음", "a′ 표본 대신 기댓값 → 분산 작음, 계산은 조금 더"]
    ], { rh: 31, size: 13 });

    k.section(40, 380, "② Q-learning 의사 코드", { tone: "pink" });
    k.code(40, 394, 560, 196, [
      "Q(s,a) = 0                          # 모든 s, a",
      "for 에피소드:",
      "    s = env.reset()",
      "    while 종료 아님:",
      "        a = ε-탐욕(Q, s)              # 행동 정책",
      "        s′, r, done = env.step(a)",
      "        타깃 = r + (0 if done else γ·max Q(s′,·))",
      "        Q(s,a) += α · (타깃 − Q(s,a))",
      "        s = s′                        # SARSA: a = a′"
    ], { size: 12.5 });

    k.section(620, 380, "③ FrozenLake 4×4 (미끄러짐) — 실습 탭 기본값", { tone: "green" });
    k.panel(620, 394, 620, 196, { tone: "green", tinted: true });
    k.text(640, 420, "α = 0.1 · γ = 0.99 · ε 1 → 0.05 (60% 지점까지) · 5,000 에피소드 · seed 1", { size: 12.5, color: "muted" });
    k.bars(650, 440, 380, 126, [0.5325, 0.5420, 0.5314, 0.5420], { labels: ["SARSA", "Q-learning", "Expected", "V* (DP)"], tones: ["teal", "pink", "purple", "gray"], max: 0.6, fmt: function (v) { return v.toFixed(4); }, size: 12.5 });
    k.lines(1050, 452, [
      { t: "탐욕 정책의 V^π(s₀)", size: 13, weight: 800, color: "ink" },
      { t: "env.P로 정책 평가", size: 12, color: "muted" },
      { t: "시험 성공률 (ε = 0, 1,000번)", size: 12.5, weight: 700, color: "ink" },
      { t: "SARSA 73.8%", size: 12.5, tone: "teal", color: "tone" },
      { t: "Q-learning 73.8%", size: 12.5, tone: "pink", color: "tone" },
      { t: "Expected 72.8%", size: 12.5, tone: "purple", color: "tone" }
    ], { lh: 21 });

    k.note(40, 606, 1200, 40, { tone: "amber", title: "V*는 ‘할인된’ 성공 확률 — 미끄러운 얼음에서는 최적 정책도 매번 성공하지 못한다 (γ 0.9: 0.0689 · γ 0.99: 0.5420 · 8×8: 0.4146)" });
    k.flow(40, 660, [
      { t: "TD(0) 예측", tone: "pink" }, { t: "SARSA (on)", tone: "teal" }, { t: "Q-learning (off)", tone: "pink" }, { t: "Expected SARSA", tone: "purple" }, { t: "DQN: 신경망 + 리플레이", tone: "blue" }
    ], { label: "다음 단계", h: 36, w: 1200, size: 13.5 });
  }
});
