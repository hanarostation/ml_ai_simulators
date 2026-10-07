/* Multi-agent RL (MADDPG · QMIX) — 알고리즘 구성도
   숫자는 시뮬레이터 기본값에서 계산한 값 (행렬 게임 독립 정책 기울기 η 1 · QMIX 2단계 게임 seed 1 · simple_spread 축소판) */
(function () {
  var M = "−";
  function n(v) { return String(v).replace(/-/g, M); }

  /* ---------- 1. 설정 · 비정상성 · CTDE ---------- */
  DSDiagram.register({
    id: "multi-agent-rl-1", sim: "multi-agent-rl", order: 1,
    title: "Multi-agent RL (1) — 설정 · 비정상성 · CTDE", short: "설정 · 비정상성 · CTDE",
    sub: "여러 에이전트가 동시에 배우면 상대가 곧 환경 — 독립 학습은 목표가 움직이고, CTDE는 학습 때만 전체를 보고 실행은 각자 한다",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 150, "① 세 가지 설정 — 보상 관계가 학습 결과를 바꾼다");
      var P = [
        { x: 40, tone: "green", t: "협력 (r₁ = r₂)", g: "조율 게임 · 같은 프로토콜", m: [["4, 4", "0, 0"], ["0, 0", "2, 2"]], rows: ["A", "B"], res: "독립 학습 (0.35, 0.30)에서 → (B, B) = 2", res2: "더 좋은 (A, A) = 4를 놓침" },
        { x: 448, tone: "red", t: "경쟁 (r₁ = −r₂)", g: "동전 맞추기", m: [["1, −1", "−1, 1"], ["−1, 1", "1, −1"]], rows: ["앞", "뒤"], res: "독립 학습 → 서로 쫓으며 순환", res2: "400단계 뒤에도 수렴하지 않음" },
        { x: 856, tone: "orange", t: "혼합 (그 밖)", g: "죄수의 딜레마", m: [["3, 3", "0, 5"], ["5, 0", "1, 1"]], rows: ["협력", "배신"], res: "독립 학습 → (배신, 배신) = 1, 1", res2: "함께 협력(3, 3)보다 둘 다 손해" }
      ];
      P.forEach(function (p) {
        k.panel(p.x, 164, 384, 172, { tone: p.tone, head: "solid", title: p.t, right: p.g, tinted: true });
        k.text(p.x + 24 + 58 + 58, 216, "에이전트 2 →", { size: 11.5, color: "muted", anchor: "middle" });
        k.matrix(p.x + 82, 250, p.m, { cw: 58, ch: 26, size: 12.5, rows: p.rows, cols: p.rows, tones: function (i, j) { return i === j ? p.tone : "gray"; }, fills: function () { return "plain"; } });
        var hh = k.para(p.x + 214, 238, 158, p.res, { size: 12, weight: 700, tone: p.tone, lh: 18 });
        k.para(p.x + 214, 238 + hh + 4, 158, p.res2, { size: 12, color: "muted", lh: 18 });
        k.text(p.x + 20, 316, "칸 = (r₁, r₂) · 행 = 에이전트 1", { size: 11.5, color: "muted" });
      });

      k.section(40, 372, "② 비정상성 — 동전 맞추기 (독립 정책 기울기, η = 1)", { tone: "purple" });
      k.panel(40, 386, 600, 216, { tone: "purple", tinted: true });
      k.table(58, 398, [90, 140, 140, 210], [
        ["단계", "p₁ = P(1이 앞)", "p₂ = P(2가 앞)", "Q₁(앞) − Q₁(뒤) = 4p₂ − 2"],
        ["0", "0.800", "0.350", { t: n("-0.600") + "  → 뒤가 좋음", tone: "red" }],
        ["10", "0.247", "0.190", { t: n("-1.238"), tone: "red" }],
        ["20", "0.171", "0.801", { t: "+1.206  → 앞이 좋음", tone: "blue" }],
        ["30", "0.808", "0.865", { t: "+1.459", tone: "blue" }],
        ["40", "0.903", "0.245", { t: n("-1.019") + "  → 다시 뒤", tone: "red" }]
      ], { rh: 26, size: 12.5 });
      k.text(58, 586, "에이전트 2가 바뀌면 같은 행동의 가치 부호가 뒤집힌다 → 학습 목표가 계속 움직인다", { size: 12.5, weight: 700, tone: "purple" });

      k.section(664, 372, "③ CTDE — 학습은 중앙에서, 실행은 각자", { tone: "teal" });
      k.panel(664, 386, 576, 216, { tone: "teal", tinted: true });
      var c = k.box(900, 404, 320, 62, { tone: "purple", title: "중앙 critic · 믹서 (학습 때만)", sub: "전체 상태 s + 모든 행동 (a₁, a₂)", size: 13.5, subSize: 11.5 });
      var a1 = k.box(684, 404, 180, 52, { tone: "blue", title: "π₁(o₁) / Q₁(o₁,·)", size: 13 });
      var a2 = k.box(684, 470, 180, 52, { tone: "orange", title: "π₂(o₂) / Q₂(o₂,·)", size: 13 });
      k.arrow(866, 430, 898, 430, { tone: "orange" }); k.arrow(866, 496, 1000, 470, { tone: "orange" });
      k.arrow(1060, 468, 866, 506, { tone: "pink", dash: true, curve: -14, label: "학습 신호", labelDy: 30 });
      k.table(684, 534, [180, 110, 110, 136], [
        ["|A| = 5", "N = 2", "N = 5", "N = 10"],
        ["완전 중앙 |A|ᴺ", "25", "3,125", "9,765,625"],
        ["가치 분해 N·|A|", "10", "25", "50"]
      ], { rh: 21, size: 12 });

      k.section(40, 640, "④ 흐름", { tone: "ink" });
      k.flow(130, 622, [{ t: "각자 관측 oᵢ", tone: "blue" }, { t: "각자 행동 aᵢ", tone: "orange" }, { t: "공동 행동 → 팀/개별 보상", tone: "green" }, { t: "중앙 critic·믹서로 학습", tone: "purple" }, { t: "실행은 πᵢ(oᵢ)만", tone: "teal" }], { w: 1110, h: 36, gap: 20, size: 12.5 });
    }
  });

  /* ---------- 2. VDN · QMIX ---------- */
  DSDiagram.register({
    id: "multi-agent-rl-2", sim: "multi-agent-rl", order: 2,
    title: "Multi-agent RL (2) — VDN과 QMIX 가치 분해", short: "VDN · QMIX 가치 분해",
    sub: "팀 가치 Q_tot을 에이전트별 Qᵢ로 나눈다 — VDN은 합, QMIX는 하이퍼네트워크가 만든 비음수 가중치의 단조 믹서",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 150, "① 구조 — 각자 argmax 하면 팀 argmax (분산 실행 가능)");
      var q1 = k.box(40, 168, 150, 50, { tone: "blue", title: "Q₁(o₁, a₁)", sub: "에이전트 망 1", size: 14, subSize: 11.5 });
      var q2 = k.box(40, 230, 150, 50, { tone: "orange", title: "Q₂(o₂, a₂)", sub: "에이전트 망 2", size: 14, subSize: 11.5 });
      var mx = k.box(250, 182, 250, 84, { tone: "purple", title: "믹서", sub: "h = ELU(|W₁|ᵀ[Q₁,Q₂] + b₁) · Q_tot = |w₂|ᵀh + b₂", size: 14, subSize: 11.5 });
      var hy = k.box(250, 284, 250, 40, { tone: "purple", fill: "plain", dash: true, title: "하이퍼네트워크(s) → W₁, b₁, w₂, b₂", size: 12.5 });
      var qt = k.box(560, 196, 120, 56, { tone: "purple", fill: "solid", title: "Q_tot", size: 16 });
      k.link(q1.r, [250, 210], { tone: "blue" }); k.link(q2.r, [250, 240], { tone: "orange" }); k.link(mx.r, qt.l, { tone: "purple" }); k.arrow(375, 284, 375, 268, { tone: "purple", dash: true });
      k.formula(712, 168, 528, 46, "VDN: Q_tot = Q₁ + Q₂", { size: 15 });
      k.formula(712, 222, 528, 46, "QMIX: **∂Q_tot / ∂Qᵢ ≥ 0** (|W| 덕분)", { size: 15 });
      k.text(712, 296, "공통 학습: y = r + γ · Q_tot(s′, argmax Q₁′, argmax Q₂′), L = (Q_tot − y)²", { size: 12.5, color: "muted" });
      k.text(712, 318, "→ 팀 TD 오차 하나를 각 에이전트 Q로 역전파 (공 나누기, credit assignment)", { size: 12.5, color: "muted" });

      k.section(40, 360, "② QMIX 논문의 2단계 게임 — 실제 학습 결과 (모든 공동 행동 균등, 3000회, seed 1)", { tone: "purple" });
      k.panel(40, 374, 820, 244, { tone: "purple", tinted: true });
      var cols = ["a₂=0", "a₂=1"], rows = ["a₁=0", "a₁=1"];
      function mat(x, y, data, title, tone, hl) {
        k.matrix(x, y, data, { cw: 54, ch: 28, size: 13, rows: rows, cols: cols, title: title, titleTone: tone, fmt: n,
          tones: function (i, j) { return hl && hl[0] === i && hl[1] === j ? tone : "gray"; }, fills: function (i, j) { return hl && hl[0] === i && hl[1] === j ? "tone" : "plain"; } });
      }
      k.text(60, 396, "상태 1: 에이전트 1의 행동 0 → 2A (모두 7), 1 → 2B", { size: 12.5, weight: 700, color: "ink" });
      mat(110, 448, [["0", "1"], ["1", "8"]], "실제 2B 보상", "green", [1, 1]);
      mat(110, 544, [["7", "7"], ["8", "8"]], "실제 상태 1 (다음 최선 포함)", "green", [1, 0]);
      mat(370, 448, [["-1.50", "2.50"], ["2.50", "6.50"]], "VDN 2B Q_tot", "teal", [1, 1]);
      mat(370, 544, [["7.00", "7.00"], ["6.50", "6.50"]], "VDN 상태 1 Q_tot", "teal", [0, 0]);
      mat(630, 448, [["0.00", "1.00"], ["1.00", "8.00"]], "QMIX 2B Q_tot", "purple", [1, 1]);
      mat(630, 544, [["7.00", "7.00"], ["8.00", "8.00"]], "QMIX 상태 1 Q_tot", "purple", [1, 0]);
      k.text(398, 612, "합으로는 8을 6.5로 낮게 맞춤 → 2A 선택 → 보상 **7**", { size: 12, tone: "teal", anchor: "middle" });
      k.text(668, 612, "정확히 표현 → 2B → 보상 **8**", { size: 12, tone: "purple", anchor: "middle" });

      k.section(884, 360, "③ 한계 — 단조성으로도 못 푸는 보상", { tone: "red" });
      k.panel(884, 374, 356, 244, { tone: "red", tinted: true });
      k.table(898, 386, [118, 70, 70, 74], [
        ["게임 (seed 1)", "VDN", "QMIX", "최선"],
        ["Climbing", "(c,c) 5", "(b,c) 6", "(a,a) 11"],
        ["비단조", "(B,B) 0", "(B,C) 0", "(A,A) 8"]
      ], { rh: 26, size: 12 });
      k.note(898, 476, 328, 58, { tone: "red", title: "'상대가 A일 때만 A가 좋다'", body: "한 에이전트의 Q만 올려서는 표현 불가 → 둘 다 실패" });
      k.note(898, 544, 328, 56, { tone: "gray", title: "확장", body: "QTRAN · Weighted QMIX · QPLEX" });

      k.section(40, 664, "④ 협력 격자 (분산 관측 · seed 20개 × 3묶음)", { tone: "ink" });
      k.table(560, 636, [150, 170, 170, 150], [
        ["", "독립 Q", "VDN", "QMIX-lite"],
        ["평가 결과 바뀐 횟수", "79 · 81 · 97", "50 · 51 · 52", "41 · 34 · 41"],
        ["최적 7걸음 도달 (/20)", "19 · 17 · 19", "19 · 19 · 19", "17 · 17 · 18"]
      ], { rh: 20, size: 12 });
    }
  });

  /* ---------- 3. MADDPG ---------- */
  DSDiagram.register({
    id: "multi-agent-rl-3", sim: "multi-agent-rl", order: 3,
    title: "Multi-agent RL (3) — MADDPG 중앙 critic", short: "MADDPG 중앙 critic",
    sub: "Multi-Agent DDPG · 연속 행동의 행위자는 자기 관측만, critic은 학습 때 모든 관측과 행동을 본다 (simple_spread 축소판)",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 150, "① 구조 — 에이전트마다 행위자 μᵢ와 중앙 critic Qᵢ");
      k.panel(40, 164, 760, 250, { tone: "blue", tinted: true });
      var o1 = k.box(60, 186, 120, 46, { tone: "blue", fill: "plain", title: "o₁ (8개)", size: 13.5 });
      var o2 = k.box(60, 330, 120, 46, { tone: "orange", fill: "plain", title: "o₂ (8개)", size: 13.5 });
      var m1 = k.box(230, 180, 170, 58, { tone: "blue", title: "행위자 μ₁", sub: "8 → 32 → 32 → 2 (tanh)", size: 14, subSize: 11.5 });
      var m2 = k.box(230, 324, 170, 58, { tone: "orange", title: "행위자 μ₂", sub: "8 → 32 → 32 → 2 (tanh)", size: 14, subSize: 11.5 });
      k.link(o1.r, m1.l, { tone: "blue" }); k.link(o2.r, m2.l, { tone: "orange" });
      var c1 = k.box(530, 196, 250, 58, { tone: "purple", title: "critic Q₁(x, a₁, a₂)", sub: "입력 20 = o₁ + o₂ + a₁ + a₂", size: 14, subSize: 11.5 });
      var c2 = k.box(530, 300, 250, 58, { tone: "purple", title: "critic Q₂(x, a₁, a₂)", sub: "독립 DDPG라면 입력 10 = o₂ + a₂", size: 14, subSize: 11.5 });
      k.arrow(402, 209, 526, 220, { tone: "orange", width: 1.6 }); k.arrow(402, 216, 526, 316, { tone: "orange", width: 1.6 });
      k.arrow(402, 353, 526, 336, { tone: "orange", width: 1.6 }); k.arrow(402, 346, 526, 242, { tone: "orange", width: 1.6 });
      k.text(452, 204, "a₁", { size: 13, weight: 800, tone: "orange" }); k.text(452, 372, "a₂", { size: 13, weight: 800, tone: "orange" });
      k.arrow(560, 256, 360, 240, { tone: "pink", dash: true, curve: -18 });
      k.text(236, 286, "∇a₁Q₁ → 행위자 1 학습 신호", { size: 12, weight: 700, tone: "pink" });
      k.text(60, 400, "실행: μᵢ(oᵢ)만 사용 · 학습: critic이 x = [o₁, o₂]와 모든 행동을 봄 → 상대 정책 변화가 critic 입력에 반영", { size: 12, color: "muted" });

      k.section(824, 150, "② 갱신식", { tone: "purple" });
      k.panel(824, 164, 416, 250, { tone: "purple", tinted: true });
      k.lines(842, 196, [
        { t: "critic (목표망 ′ 사용)", weight: 800, tone: "purple" },
        { t: "y = r + γ · Q′ᵢ(x′, μ′₁(o′₁), μ′₂(o′₂))" },
        { t: "L(Qᵢ) = E_batch [ (Qᵢ(x, a₁, a₂) − y)² ]" },
        { t: "actor", weight: 800, tone: "blue" },
        { t: "∇θᵢ J = E[ ∇θᵢ μᵢ(oᵢ) · ∇aᵢ Qᵢ(x, …, aᵢ = μᵢ(oᵢ), …) ]" },
        { t: "목표망", weight: 800, tone: "teal" },
        { t: "θ′ ← τθ + (1 − τ)θ′  (τ = 0.01)" },
        { t: "탐험: aᵢ = μᵢ(oᵢ) + N(0, σ²), σ 0.5 → 0.1", tone: "amber" }
      ], { size: 12.5, lh: 25 });

      k.section(40, 450, "③ 과제와 결과 — simple_spread 축소판 (브라우저용)", { tone: "green" });
      k.panel(40, 464, 760, 148, { tone: "green", tinted: true });
      k.table(58, 474, [210, 500], [
        ["항목", "설정"],
        ["세계 · 행동", "[−1, 1]² · 2차원 속도 −1~1 · p ← p + 0.1·a · 25걸음"],
        ["팀 보상", "−Σ_목표 (가장 가까운 로봇까지 거리) − 충돌 0.5"],
        ["축소", "목표 2곳 고정 (−0.5, 0.4) · (0.5, −0.4) · 은닉 32 · 배치 32 · 400에피소드"]
      ], { rh: 27, size: 12.5 });
      k.bars(860, 470, 360, 130, [34.9, 8.5, 5.9], { labels: ["무작위 정책", "MADDPG (seed 1)", "직선 이동 기준"], tones: ["gray", "purple", "green"], fmt: function (v) { return M + v; }, max: 36, barW: 70, gap: 40 });
      k.text(1040, 462, "평균 에피소드 리턴 (막대 = 크기, 작을수록 좋음)", { size: 11.5, color: "muted", anchor: "middle" });

      k.section(40, 650, "④ 흐름", { tone: "ink" });
      k.flow(130, 632, [{ t: "잡음 탐험으로 수집", tone: "amber" }, { t: "재현 버퍼 50,000", tone: "gray" }, { t: "중앙 critic 갱신", tone: "purple" }, { t: "행위자: ∇aQ 방향", tone: "blue" }, { t: "목표망 soft update", tone: "teal" }, { t: "분산 실행 μᵢ(oᵢ)", tone: "green" }], { w: 1110, h: 36, gap: 16, size: 12 });
    }
  });
})();
