/* n-step TD · TD(λ) — 알고리즘 구성도
   예제 숫자: γ = 0.9, 3걸음 뒤 +1로 끝나는 작은 에피소드 (V(S_t)=0.3, V(S_t+1)=0.5, V(S_t+2)=0.7)
   19-상태 랜덤 워크 결과: 시뮬레이터 기본값(30회 반복 · seed 1 · 처음 10 에피소드 평균 RMS) */
(function () {
  var LBL = "Reinforcement Learning";

  /* 백업 다이어그램 한 열 */
  function backupCol(k, x, y0, steps, o) {
    o = o || {};
    var y = y0, gap = 46;
    k.circle(x, y, 9, { tone: "blue", fill: "plain" });
    for (var i = 0; i < steps; i++) {
      k.path("M" + x + " " + (y + 9) + " V" + (y + 19), { tone: "gray", width: 1.6 });
      k.circle(x, y + 23, 4.5, { tone: "orange", fill: "solid" });
      k.path("M" + x + " " + (y + 28) + " V" + (y + gap - 9), { tone: "gray", width: 1.6 });
      y += gap;
      var last = i === steps - 1;
      if (o.dots && i === steps - 2) { k.text(x, y + 6, "⋮", { size: 18, anchor: "middle", color: "muted" }); continue; }
      if (last && o.term) k.rect(x - 9, y - 9, 18, 18, { tone: "ink", fill: "solid", r: 2 });
      else if (last) k.circle(x, y, 9, { tone: "purple", fill: "solid" });
      else k.circle(x, y, 9, { tone: "blue", fill: "plain" });
    }
  }

  DSDiagram.register({
    id: "n-step-td-lambda-1", sim: "n-step-td-lambda", order: 1,
    title: "n-step TD (1) — TD(0)와 MC 사이의 수익", short: "n-step 수익",
    sub: "n걸음까지는 실제로 받은 보상을 더하고, 그다음은 추정값 V로 마감(부트스트랩)한 목표값으로 V(S_t)를 갱신",
    label: LBL,
    draw: function (k) {
      /* ① 백업 다이어그램 */
      k.section(40, 152, "① 백업 다이어그램 — 목표값을 몇 걸음으로 만드나");
      k.panel(40, 166, 560, 282, { tone: "blue", tinted: true });
      var cols = [["1-step", "TD(0)", 1], ["2-step", "", 2], ["3-step", "", 3], ["n-step", "", 4, { dots: true }], ["∞-step", "MC", 4, { dots: true, term: true }]];
      cols.forEach(function (c, i) {
        var x = 100 + i * 110;
        backupCol(k, x, 196, c[2], c[3]);
        k.text(x, 404, c[0], { size: 14, weight: 800, anchor: "middle", color: "ink" });
        if (c[1]) k.text(x, 424, c[1], { size: 12.5, weight: 700, anchor: "middle", tone: i === 0 ? "purple" : "gray" });
      });
      k.text(320, 438, "○ 상태(파랑) · ● 행동(주황) · 보라 = V로 마감 · ■ = 에피소드 끝", { size: 11.5, anchor: "middle", color: "muted" });

      /* ② 식 + 예제 */
      k.section(620, 152, "② n-step 수익과 갱신 — 예제로 계산", { tone: "purple" });
      k.panel(620, 166, 620, 282, { tone: "purple", tinted: true });
      k.formula(636, 178, 588, 34, "G_t^(n) = R_t+1 + γR_t+2 + … + γ^(n−1)·R_t+n + **γ^n·V(S_t+n)**", { size: 14.5, mono: true });
      /* 작은 에피소드 */
      var bx = 640, by = 226, bw = 96, gp = 54;
      var st = [["S_t", "V = 0.3"], ["S_t+1", "V = 0.5"], ["S_t+2", "V = 0.7"], ["끝", "종료"]];
      st.forEach(function (s, i) {
        k.box(bx + i * (bw + gp), by, bw, 44, { tone: i === 3 ? "gray" : "blue", fill: i === 3 ? "soft" : "tone", title: s[0], sub: s[1], size: 13.5, subSize: 11.5, r: 8 });
        if (i < 3) k.arrow(bx + i * (bw + gp) + bw + 3, by + 22, bx + (i + 1) * (bw + gp) - 3, by + 22, { tone: "green", width: 1.6, label: i === 2 ? "R = +1" : "R = 0", labelSize: 11.5 });
      });
      k.table(636, 284, [70, 380, 138], [
        ["n", "목표값 계산 (γ = 0.9)", "G_t^(n)"],
        ["1", "0 + 0.9 × V(S_t+1) = 0.9 × 0.5", { t: "0.450", mono: true }],
        ["2", "0 + 0.9 × 0 + 0.81 × V(S_t+2) = 0.81 × 0.7", { t: "0.567", mono: true }],
        ["3 = MC", "0 + 0 + 0.81 × 1 (끝까지 실제 보상)", { t: "0.810", mono: true, tone: "green" }]
      ], { rh: 28, size: 12.5 });
      k.text(636, 432, "갱신 (n = 2, α = 0.1): V(S_t) ← 0.3 + 0.1 × (0.567 − 0.3) = **0.3267**", { size: 13, color: "ink" });

      /* ③ 19-상태 랜덤 워크 */
      k.section(40, 484, "③ 19-상태 랜덤 워크 — 가운데 n이 가장 빨리 배운다", { tone: "orange", sub: "각 n에서 가장 좋은 α · 처음 10 에피소드 평균 RMS 오차 (30회 반복)" });
      k.panel(40, 498, 760, 150, { tone: "orange", tinted: true });
      var ns = ["1", "2", "4", "8", "16", "32", "64", "128", "256", "512"], rms = [0.345, 0.279, 0.268, 0.282, 0.315, 0.369, 0.420, 0.478, 0.503, 0.507];
      k.bars(70, 512, 710, 110, rms, { labels: ns.map(function (v) { return "n=" + v; }), tones: rms.map(function (v, i) { return i === 2 ? "orange" : "gray"; }), fmt: function (v) { return v.toFixed(3); }, max: 0.56, gap: 14, size: 11.5 });

      k.panel(820, 498, 420, 150, { tone: "red", tinted: true });
      k.text(838, 524, "편향 ↔ 분산 (상태 2, 다시 굴리기 1,000번)", { size: 14, weight: 800, tone: "red" });
      k.table(838, 534, [120, 120, 140], [
        ["n", "|편향|", "표준편차"],
        ["1 (TD)", { t: "0.670", mono: true }, { t: "0.126", mono: true }],
        ["4", { t: "0.454", mono: true }, { t: "0.464", mono: true }],
        ["∞ (MC)", { t: "0.032", mono: true }, { t: "0.640", mono: true }]
      ], { rh: 24, size: 12.5 });
      k.text(838, 640, "n↑ → V의 오차를 덜 물려받지만 보상의 흔들림이 커짐", { size: 11.5, color: "muted" });

      k.flow(40, 664, [{ t: "TD(0) · n = 1", tone: "purple" }, { t: "n-step · 1 < n < T", tone: "orange" }, { t: "MC · n ≥ T − t", tone: "green" }, { t: "λ-수익 = 모든 n의 가중 평균", tone: "pink" }], { label: "정리", h: 34 });
    }
  });

  DSDiagram.register({
    id: "n-step-td-lambda-2", sim: "n-step-td-lambda", order: 2,
    title: "TD(λ) (2) — λ-수익(전방)과 적격 흔적(후방)", short: "λ-수익과 흔적",
    sub: "모든 n-step 수익을 (1−λ)λ^(n−1)로 섞은 λ-수익, 그리고 그 갱신을 매 걸음 바로 하는 적격 흔적 z",
    label: LBL,
    draw: function (k) {
      /* ① 가중치 */
      k.section(40, 152, "① 가중치 (1−λ)λ^(n−1) — 합은 항상 1", { tone: "purple" });
      k.panel(40, 166, 580, 300, { tone: "purple", tinted: true });
      var w = [0.2, 0.16, 0.128, 0.102, 0.082, 0.066, 0.052, 0.042];
      k.text(60, 192, "λ = 0.8 일 때 n = 1 … 8의 가중치", { size: 13, weight: 800, color: "ink" });
      k.bars(64, 200, 300, 140, w, { labels: ["1", "2", "3", "4", "5", "6", "7", "8"], tones: "purple", fmt: function (v) { return v.toFixed(2); }, max: 0.24, gap: 8, size: 11.5 });
      k.text(214, 372, "n →  (반감기 ln½ / ln 0.8 = 3.1걸음)", { size: 11.5, anchor: "middle", color: "muted" });
      k.box(388, 196, 216, 168, { tone: "purple", fill: "plain", align: "left", valign: "top", title: "예제 (①번 장, λ = 0.5)", titleColor: "ink", size: 13.5,
        lines: [
          { t: "0.50 × G^(1) = 0.50 × 0.450", size: 12.5 },
          { t: "0.25 × G^(2) = 0.25 × 0.567", size: 12.5 },
          { t: "0.25 × G_t   = 0.25 × 0.810", size: 12.5, tone: "green" },
          { t: "남는 몫 λ^(T−t−1) = 0.5² → MC", size: 11.5, color: "muted" },
          { t: "G_t^λ = **0.56925**", size: 13.5, weight: 700, tone: "red" }
        ] });
      k.formula(56, 392, 548, 30, "G_t^λ = (1−λ) Σ λ^(n−1) G_t^(n) + λ^(T−t−1) G_t", { size: 13.5, mono: true });
      k.formula(56, 428, 548, 30, "재귀식: G_t^λ = R_t+1 + γ[(1−λ)V(S_t+1) + λ·G_t+1^λ]", { size: 13.5, mono: true });

      /* ② 전방 vs 후방 */
      k.section(640, 152, "② 전방 관점 = 후방 관점 (오프라인 갱신의 합이 같음)", { tone: "teal" });
      k.panel(640, 166, 600, 300, { tone: "teal", tinted: true });
      var y0 = 224;
      ["S_t", "S_t+1", "S_t+2", "끝"].forEach(function (s, i) { k.circle(700 + i * 120, y0, 23, { tone: i === 3 ? "gray" : "blue", fill: i === 3 ? "tone" : "plain", label: s, size: 11.5 }); });
      k.arrow(722, y0 - 14, 1038, y0 - 14, { tone: "purple", curve: -34, label: "전방: 미래 보상을 기다려 G^λ", labelSize: 12 });
      k.arrow(1058, y0 + 24, 708, y0 + 24, { tone: "red", curve: -30, label: "후방: δ를 지나온 상태에 (γλ)^k 만큼", labelSize: 12, labelDy: 26 });
      k.formula(656, 296, 568, 30, "G_t^λ − V(S_t) = Σ_k (γλ)^(k−t) · δ_k    (V 고정)", { size: 13.5, mono: true });
      k.table(656, 334, [120, 260, 188], [
        ["δ", "R + γV(S′) − V(S)", "값"],
        ["δ_t", "0 + 0.9×0.5 − 0.3", { t: "0.150", mono: true }],
        ["δ_t+1", "0 + 0.9×0.7 − 0.5", { t: "0.130", mono: true }],
        ["δ_t+2", "1 + 0 − 0.7", { t: "0.300", mono: true }]
      ], { rh: 24, size: 12.5 });
      k.text(656, 452, "γλ = 0.45: 0.150 + 0.45×0.130 + 0.2025×0.300 = **0.26925** = 0.56925 − 0.3", { size: 12.5, color: "ink" });

      /* ③ 흔적 */
      k.section(40, 500, "③ 적격 흔적 z — 매 걸음 γλ배로 줄이고, 방문하면 올린다", { tone: "red" });
      k.panel(40, 514, 600, 136, { tone: "red", tinted: true });
      k.table(56, 524, [150, 100, 100, 100, 110], [
        ["시점 (γλ = 0.8)", "t=0 방문", "t=1 방문", "t=2", "t=3 방문"],
        [{ t: "누적 z ← γλz + 1", tone: "teal" }, { t: "1.000", mono: true }, { t: "1.800", mono: true }, { t: "1.440", mono: true }, { t: "2.152", mono: true }],
        [{ t: "교체 z ← 1", tone: "amber" }, { t: "1.000", mono: true }, { t: "1.000", mono: true }, { t: "0.800", mono: true }, { t: "1.000", mono: true }]
      ], { rh: 30, size: 12.5 });
      k.text(56, 638, "누적은 자주 밟은 상태일수록 커져 큰 α에서 발산할 수 있고, 교체는 1로 덮어 안정적", { size: 11.5, color: "muted" });

      k.panel(660, 514, 580, 136, { tone: "gray" });
      k.code(672, 524, 556, 116, [
        "z = np.zeros(n_states)            # 에피소드마다 0에서",
        "delta = r + gamma * V[s2] - V[s]   # TD 오차",
        "z *= gamma * lam;  z[s] += 1       # 흔적 갱신 (누적)",
        "V += alpha * delta * z             # 모든 상태를 한꺼번에"
      ], { size: 12.5 });

      k.flow(40, 664, [{ t: "λ = 0 → TD(0)", tone: "purple" }, { t: "0 < λ < 1 → n-step 섞기", tone: "pink" }, { t: "λ = 1 (γ=1) → MC", tone: "green" }, { t: "최적 λ ≈ 0.8 (랜덤 워크)", tone: "orange" }], { label: "λ의 의미", h: 34 });
    }
  });

  DSDiagram.register({
    id: "n-step-td-lambda-3", sim: "n-step-td-lambda", order: 3,
    title: "SARSA(λ) (3) — 경로 전체를 한 번에 배우기", short: "SARSA(λ)와 결과 비교",
    sub: "Q(s,a)마다 적격 흔적 z(s,a)를 두고, 목표에 닿는 순간 δ를 흔적이 남은 모든 (s,a)에 나눠 준다",
    label: LBL,
    draw: function (k) {
      k.section(40, 152, "① SARSA(λ) 한 걸음", { tone: "orange" });
      k.panel(40, 166, 560, 244, { tone: "orange", tinted: true });
      var steps = [
        ["1", "행동 선택", "S′에서 ε-greedy로 A′", "orange"],
        ["2", "TD 오차", "δ = R + γQ(S′,A′) − Q(S,A)", "red"],
        ["3", "흔적 표시", "z(S,·) = 0, z(S,A) = 1 (교체)", "teal"],
        ["4", "모두 갱신", "Q ← Q + α·δ·z  (흔적 있는 쌍 전부)", "purple"],
        ["5", "흔적 감소", "z ← γλ·z, S ← S′, A ← A′", "gray"]
      ];
      steps.forEach(function (s, i) {
        var y = 180 + i * 44;
        k.circle(70, y + 18, 13, { tone: s[3], fill: "solid", label: s[0], size: 13 });
        k.box(94, y, 490, 36, { tone: s[3], fill: "plain", align: "left", title: s[1] + "   ", size: 13.5, r: 8 });
        k.text(220, y + 23, s[2], { size: 13, mono: true, color: "ink" });
      });

      k.section(620, 152, "② 첫 에피소드 한 번으로 바뀐 Q(s,a)", { tone: "purple", sub: "87걸음 · γ 0.95 · α 0.5" });
      k.panel(620, 166, 620, 244, { tone: "purple", tinted: true });
      [["1-step SARSA", "1쌍", "목표 바로 앞 한 쌍만", "gray"], ["10-step SARSA", "9쌍", "마지막 10걸음 (겹친 쌍 제외)", "orange"], ["SARSA(λ = 0.9)", "30쌍", "흔적이 남은 경로 전체", "purple"]].forEach(function (c, i) {
        var x = 640 + i * 198;
        k.box(x, 188, 182, 150, { tone: c[3], fill: i === 2 ? "tone" : "plain", title: c[0], size: 14,
          lines: [{ t: c[1], size: 30, weight: 800, tone: c[3] }, { t: c[2], size: 12, color: "muted" }] });
      });
      k.text(930, 372, "보상이 목표에서만 나오면 1-step은 한 에피소드에 한 칸씩만 가치를 뒤로 전한다", { size: 12.5, anchor: "middle", color: "ink" });
      k.text(930, 394, "학습 곡선: SARSA(λ)는 두 번째 에피소드부터 최단 14걸음 근처로 떨어짐", { size: 12.5, anchor: "middle", tone: "purple", weight: 700 });

      k.section(40, 444, "③ 19-상태 랜덤 워크 — 방법별 가장 좋은 설정 (30회 반복 · 처음 10 에피소드 평균 RMS)", { tone: "blue" });
      k.panel(40, 458, 760, 192, { tone: "blue", tinted: true });
      k.table(56, 470, [210, 150, 110, 140, 110], [
        ["방법", "가장 좋은 설정", "α", "RMS 오차", "n=1 · λ=0일 때"],
        ["n-step TD", "n = 4", { t: "0.40", mono: true }, { t: "0.268", mono: true }, { t: "0.345", mono: true }],
        ["오프라인 λ-수익", "λ = 0.8", { t: "0.35", mono: true }, { t: "0.270", mono: true }, { t: "0.369", mono: true }],
        ["TD(λ) 누적 흔적", "λ = 0.8", { t: "0.30", mono: true }, { t: "0.269", mono: true }, { t: "0.345", mono: true }],
        [{ t: "TD(λ) 교체 흔적", tone: "blue" }, "λ = 0.8", { t: "0.50", mono: true }, { t: "0.255", mono: true, tone: "blue" }, { t: "0.345", mono: true }]
      ], { rh: 30, size: 13 });
      k.text(56, 638, "오른쪽 끝 칸 = 같은 방식에서 n = 1(λ = 0, 곧 TD(0))일 때의 최저 오차. 오프라인 방식은 갱신을 에피소드 끝에 모아 적용", { size: 11.5, color: "muted" });

      k.note(820, 458, 420, 58, { tone: "red", title: "누적 흔적 + 큰 α → 발산", body: "λ ≥ 0.9에서 α를 키우면 오차가 폭발 (2번 탭 누적 흔적 곡선)" });
      k.note(820, 524, 420, 58, { tone: "teal", title: "교체 흔적은 큰 α에서도 안정", body: "같은 상태를 여러 번 밟아도 z ≤ 1" });
      k.note(820, 590, 420, 60, { tone: "orange", title: "중간이 가장 좋다", body: "n ≈ 4, λ ≈ 0.8 — 순수 TD(0)나 MC보다 빠르게 배움" });

      k.flow(40, 664, [{ t: "MC", s: "끝까지 기다림", tone: "green" }, { t: "n-step / λ-수익", s: "전방 관점", tone: "pink" }, { t: "TD(λ) 흔적", s: "후방 관점 · 온라인", tone: "teal" }, { t: "SARSA(λ)", s: "제어로 확장", tone: "purple" }], { label: "흐름", h: 36 });
    }
  });
})();
