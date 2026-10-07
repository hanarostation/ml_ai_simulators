/* Actor-Critic · A2C/A3C · GAE — 알고리즘 구성도 3장
   숫자: 시뮬레이터 4번 탭 기본값(격자 3×4, seed 1로 300 에피소드 학습한 정책·V̂, γ = 0.9, 에피소드 seed 13),
         3번 탭 기본값(일꾼 4 · 속도 차이 0.4 · seed 1), 5번 탭 실험(seed 200개) */
DSDiagram.register({
  id: "actor-critic-1", sim: "actor-critic", order: 1,
  title: "Actor-Critic (1) — 구조와 TD 오차", short: "구조와 TD 오차",
  sub: "Actor는 정책 π(a|s)를, Critic은 가치 V(s)를 학습 · 한 걸음의 TD 오차 δ가 Advantage 추정치가 되어 둘을 함께 갱신한다",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 구조 — 두 개의 망, 하나의 신호 δ", { tone: "pink" });
    k.panel(40, 166, 640, 300, { tone: "gray", tinted: true });
    var env = k.box(64, 268, 150, 92, { tone: "blue", title: "환경", sub: "상태 s → s′ · 보상 r", size: 16 });
    var act = k.box(290, 190, 200, 86, { tone: "orange", title: "Actor π_θ(a|s)", sub: "무엇을 할까 · softmax", size: 15.5 });
    var cri = k.box(290, 356, 200, 86, { tone: "purple", title: "Critic V_φ(s)", sub: "얼마나 좋은가 · 회귀", size: 15.5, lines: [{ t: "V(s), V(s′) → δ", size: 12.5, tone: "purple", weight: 700 }] });
    var td = k.box(548, 278, 112, 72, { tone: "pink", title: "δ", sub: "TD 오차", size: 20, subSize: 12, r: 36 });
    k.arrow(214, 296, 288, 240, { tone: "blue", label: "s", labelDx: -10 });
    k.arrow(214, 332, 288, 392, { tone: "blue", label: "s, s′", labelDx: -14, labelDy: 18 });
    k.arrow(290, 206, 140, 266, { tone: "orange", via: [[140, 206]], label: "" });
    k.text(150, 196, "행동 a", { size: 13, weight: 800, tone: "orange" });
    k.arrow(490, 400, 566, 352, { tone: "purple" });
    k.arrow(604, 278, 492, 222, { tone: "pink", curve: -20 });
    k.text(560, 222, "δ·∇log π", { size: 12.5, weight: 800, tone: "pink" });
    k.arrow(640, 350, 492, 430, { tone: "pink", curve: 26 });
    k.text(590, 446, "δ² ↓", { size: 12.5, weight: 800, tone: "pink" });
    k.text(64, 392, "r", { size: 13, weight: 800, tone: "green" });
    k.arrow(76, 362, 288, 420, { tone: "green", dash: true, via: [[76, 420]] });

    k.section(704, 152, "② 한 걸음 숫자 예 (격자 3×4, γ = 0.9)", { tone: "pink" });
    k.panel(704, 166, 536, 300, { tone: "pink", tinted: true });
    k.text(724, 196, "s = (2,0) S칸 → a = ↑ → s′ = (1,0), r = −0.04", { size: 13.5, weight: 700, color: "ink" });
    k.text(724, 220, "학습된 Critic: V̂(s) = 0.3868, V̂(s′) = 0.5071", { size: 13, color: "muted" });
    k.formula(724, 234, 496, 40, "δ = −0.04 + 0.9 × 0.5071 − 0.3868 = **0.0296**", { size: 15, mono: true });
    k.text(724, 298, "Critic (α_c = 0.1)", { size: 13.5, weight: 800, tone: "purple" });
    k.text(724, 320, "V(s) ← 0.3868 + 0.1 × 0.0296 = 0.3898", { size: 13, mono: true, color: "ink" });
    k.text(724, 352, "Actor (α_a = 0.5) · π(·|s) = [0.9536, 0.0103, 0.0140, 0.0220]", { size: 13, weight: 800, tone: "orange" });
    k.text(724, 374, "θ(s,↑) += 0.5 × 0.0296 × (1 − 0.9536) = +0.0007", { size: 13, mono: true, color: "ink" });
    k.text(724, 396, "다른 행동 θ(s,a) −= 0.5 × 0.0296 × π(a|s)", { size: 13, mono: true, color: "ink" });
    k.text(724, 428, "δ > 0 → '생각보다 좋았다' → ↑ 확률 ↑, V(s) ↑", { size: 13, weight: 700, tone: "pink" });
    k.text(724, 452, "δ < 0 → '생각보다 나빴다' → 그 행동 확률 ↓", { size: 13, weight: 700, color: "muted" });

    k.section(40, 500, "③ Advantage A(s,a) = Q(s,a) − V(s) — 시작 칸 (2,0)의 참값", { tone: "purple" });
    k.table(40, 514, [120, 120, 130, 170], [
      ["행동", "π(a|s)", "Qπ(s,a)", "Aπ = Q − Vπ"],
      ["↑", "0.9536", "0.3503", { t: "+0.0042", tone: "blue" }],
      ["→", "0.0103", "0.2060", { t: "−0.1401", tone: "red" }],
      ["↓", "0.0140", "0.2619", { t: "−0.0842", tone: "red" }],
      ["←", "0.0220", "0.2825", { t: "−0.0636", tone: "red" }]
    ], { rh: 26, size: 13 });
    k.text(40, 672, "Vπ(2,0) = 0.3461 · Σ_a π(a|s)·Aπ(s,a) = 0", { size: 12.5, color: "muted" });
    k.note(600, 514, 640, 58, { tone: "purple", title: "E[δ | s,a] = Σ P(s′|s,a)(r + γVπ(s′)) − Vπ(s) = Aπ(s,a)", body: "참 V를 쓰면 δ 한 번은 Advantage의 편향 없는 샘플 — 실제로는 V̂ 오차만큼 편향", bodySize: 12 });
    k.note(600, 582, 640, 58, { tone: "orange", title: "REINFORCE와 차이: G_t 대신 r + γV̂(s′)", body: "에피소드 끝까지 기다리지 않고 매 걸음 갱신 · 분산 ↓ · 대신 Critic 오차의 편향", bodySize: 12 });
    k.flow(600, 652, [{ t: "행동 a ∼ π", tone: "orange" }, { t: "r, s′ 관측", tone: "blue" }, { t: "δ 계산", tone: "pink" }, { t: "V, π 갱신", tone: "purple" }], { w: 640, h: 34, size: 13, gap: 20 });
  }
});

DSDiagram.register({
  id: "actor-critic-2", sim: "actor-critic", order: 2,
  title: "Actor-Critic (2) — A2C 동기 vs A3C 비동기", short: "A2C vs A3C",
  sub: "여러 환경을 동시에 굴려 데이터 상관을 줄인다 · A2C는 모아서 한 번에(동기), A3C는 일꾼마다 끝나는 즉시(비동기) 전역 θ에 반영",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① A2C */
    k.section(40, 152, "① A2C — N개 환경 × n걸음을 모아 한 번 업데이트", { tone: "orange" });
    k.panel(40, 166, 590, 330, { tone: "orange", tinted: true });
    for (var i = 0; i < 4; i++) {
      var y = 186 + i * 50;
      k.box(60, y, 110, 38, { tone: "blue", title: "env " + i, size: 13.5 });
      for (var t = 0; t < 5; t++) k.rect(182 + t * 30, y + 8, 24, 22, { tone: t === 4 ? "purple" : "orange", fill: "mid", r: 4 });
      k.arrow(336, y + 19, 366, 300, { tone: "gray", width: 1.3, headSize: 6 });
    }
    k.text(115, 392, "… N = 8", { size: 13, weight: 700, color: "muted", anchor: "middle" });
    k.text(258, 392, "n = 5걸음 (보라 = V로 부트스트랩)", { size: 12, color: "muted", anchor: "middle" });
    var b1 = k.box(370, 262, 116, 76, { tone: "pink", title: "배치 40개", sub: "N × n 전이", size: 14.5 });
    var b2 = k.box(504, 262, 110, 76, { tone: "purple", title: "업데이트 1회", sub: "평균 기울기", size: 14.5 });
    k.link(b1.r, b2.l, { tone: "gray" });
    k.arrow(559, 262, 115, 184, { tone: "orange", via: [[559, 178], [115, 178]], dash: true });
    k.text(552, 250, "갱신된 θ를 모든 환경이 공유", { size: 12, weight: 700, tone: "orange", anchor: "end" });
    k.formula(60, 414, 550, 34, "Â_t = r_t+1 + γr_t+2 + … + γ^(n−t)·V(s_n) − V(s_t)  (λ = 1)", { size: 13, mono: true });
    k.text(60, 476, "L = −Σ Â·log π(a|s) + (V − V^targ)² − β·H(π) · 브라우저: Actor 0.001 / Critic 0.005", { size: 12.5, color: "muted" });

    /* ② A3C */
    k.section(654, 152, "② A3C — 일꾼마다 받아 가고, 끝나면 바로 반영", { tone: "pink" });
    k.panel(654, 166, 586, 330, { tone: "pink", tinted: true });
    k.text(674, 194, "전역 θ", { size: 13, weight: 800, color: "ink" });
    k.path("M770 190 H1220", { tone: "gray", width: 1.5 });
    var lanes = [["일꾼 0 ×1.22", 6.7], ["일꾼 1 ×1.56", 8.6], ["일꾼 2 ×0.75", 4.1], ["일꾼 3 ×1.63", 9.0]];
    var sc = 450 / 40, marks = [];
    lanes.forEach(function (ln, i) {
      var yy = 222 + i * 40, x = 0;
      k.text(674, yy + 5, ln[0], { size: 11.5, weight: 700, color: "muted" });
      while (x + ln[1] <= 40) {
        var xa = 770 + x * sc, w = ln[1] * sc;
        k.rect(xa + 1, yy - 7, w * 0.8 - 1, 14, { tone: "orange", fill: "mid", r: 2 });
        k.rect(xa + w * 0.8, yy - 7, w * 0.2 - 1, 14, { tone: "purple", fill: "mid", r: 2 });
        marks.push(xa + w);
        k.circle(xa + w, yy, 4.5, { tone: "pink", fill: "solid" });
        x += ln[1];
      }
    });
    marks.forEach(function (m) { k.circle(m, 190, 3, { tone: "pink", fill: "solid" }); });
    k.text(770, 392, "주황 = 롤아웃(5걸음) · 보라 = 기울기 계산 · 분홍 = 전역 θ에 반영", { size: 12, color: "muted" });
    k.box(674, 404, 270, 76, { tone: "pink", fill: "plain", align: "left", valign: "top", r: 8, title: "staleness = 반영 버전 − 받아 간 버전", titleColor: "ink", size: 12.5,
      lines: [{ t: "일꾼 4개 → 평균 **3.00** (= K − 1)", size: 12.5 }, { t: "낡은 θ로 계산한 기울기가 섞임", size: 12, color: "muted" }] });
    k.box(956, 404, 264, 76, { tone: "orange", fill: "plain", align: "left", valign: "top", r: 8, title: "같은 일꾼 속도로 비교 (개념)", titleColor: "ink", size: 12.5,
      lines: [{ t: "동기: 느린 일꾼 대기 **21.0%**", size: 12.5 }, { t: "처리 걸음 비 비동기 : 동기 = 1.39 : 1", size: 12, color: "muted" }] });

    /* ③ 비교 */
    k.section(40, 530, "③ 정리", { tone: "gray" });
    k.table(40, 544, [210, 470, 520], [
      ["항목", "A2C (Advantage Actor-Critic, 동기)", "A3C (Asynchronous A3C, 비동기)"],
      ["업데이트", "장벽(barrier)에서 N×n개를 모아 1회", "일꾼이 끝날 때마다 즉시 · 잠금 없이 공유 θ에 반영"],
      ["상관 줄이기", "N개 환경의 서로 다른 상태가 한 배치에", "일꾼마다 다른 탐험 경로 · 다른 시점"],
      ["단점", "가장 느린 환경을 기다림", "staleness · 재현이 어려움"],
      ["브라우저 결과", "N 8 · n 5: seed 1~7 모두 약 10만~16만 걸음에 평균 475", "일꾼 4 · seed 1~3: 약 8만~12만 걸음에 평균 475 (가상 시간)"]
    ], { rh: 27, size: 12.5 });
  }
});

DSDiagram.register({
  id: "actor-critic-3", sim: "actor-critic", order: 3,
  title: "Actor-Critic (3) — GAE와 엔트로피 보너스", short: "GAE와 엔트로피",
  sub: "Generalized Advantage Estimation · TD 오차 δ를 (γλ)^l로 가중합해 1-step TD(λ = 0)와 몬테카를로(λ = 1) 사이를 고른다",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① δ 표 — 실제 에피소드 (격자 3×4, 학습된 V̂, γ = 0.9, λ = 0.9 → γλ = 0.81)", { tone: "teal" });
    k.table(40, 166, [56, 96, 90, 96, 104, 120, 110, 104, 140, 140, 144], [
      ["t", "s_t", "a_t", "r_t+1", "V̂(s_t)", "V̂(s_t+1)", "δ_t", "(γλ)^t", "Â (λ = 0)", "Â (λ = 0.9)", "Â (λ = 1)"],
      ["0", "(2,0)", "↑", "−0.04", "0.3868", "0.5071", "0.0296", "1.0000", "0.0296", { t: "−0.0318", tone: "teal" }, "−0.0428"],
      ["1", "(1,0)", "↑", "−0.04", "0.5071", "0.6515", "0.0393", "0.8100", "0.0393", "−0.0757", "−0.0804"],
      ["2", "(0,0)", "→", "−0.04", "0.6515", "0.7611", "−0.0066", "0.6561", "−0.0066", "−0.1420", "−0.1330"],
      ["3", "(0,1)", "→", "−0.04", "0.7611", "0.9315", "0.0372", "0.5314", "0.0372", "−0.1672", "−0.1405"],
      ["4", "(0,2)", "→ *", "−0.04", "0.9315", "0.3051", { t: "−0.6969", tone: "red" }, "0.4305", "−0.6969", "−0.2524", "−0.1975"],
      ["5", "(1,2)", "↑", "−0.04", "0.3051", "0.9315", { t: "0.4932", tone: "blue" }, "0.3487", "0.4932", "0.5487", "0.5549"],
      ["6", "(0,2)", "→", "+1", "0.9315", "0 (끝)", "0.0685", "0.2824", "0.0685", "0.0685", "0.0685"]
    ], { rh: 23, size: 12.5, firstBold: false });
    k.text(40, 366, "* 오른쪽을 골랐지만 10% 확률로 아래 (1,2)로 미끄러짐 → δ가 크게 음수, 다음 걸음에서 회복", { size: 12, color: "muted" });
    k.formula(40, 376, 1200, 34, "Â_0 = 0.0296 + 0.81×0.0393 + 0.81²×(−0.0066) + 0.81³×0.0372 + 0.81⁴×(−0.6969) + 0.81⁵×0.4932 + 0.81⁶×0.0685 = **−0.0318**", { size: 13.5, mono: true });

    k.section(40, 436, "② λ = 편향–분산 손잡이", { tone: "purple" });
    k.panel(40, 450, 600, 196, { tone: "purple", tinted: true });
    k.text(624, 436, "s₀ = (2,2), a₀ = ↑ · 3,000 에피소드", { size: 12, color: "muted", anchor: "end" });
    k.table(56, 462, [110, 110, 110, 110, 140], [
      ["λ", "편향²", "분산", "MSE", "의미"],
      [{ t: "0", tone: "red" }, "0.0486", "0.0358", "0.0845", "1-step TD"],
      [{ t: "0.15", tone: "purple" }, "0.0379", "0.0421", "**0.0800**", "MSE 최소"],
      [{ t: "0.5", tone: "gray" }, "0.0165", "0.0922", "0.1088", ""],
      [{ t: "0.9", tone: "gray" }, "0.0010", "0.2342", "0.2352", ""],
      [{ t: "1", tone: "blue" }, "0.0000", "0.3013", "0.3013", "몬테카를로"]
    ], { rh: 25, size: 12.5 });
    k.text(56, 630, "λ = 0: Â = δ_t (V̂ 오차만큼 편향) · λ = 1: Â = G_t − V̂(s_t) (편향 0, 분산 최대)", { size: 12, color: "muted" });

    k.section(664, 436, "③ 엔트로피 보너스 −β·H(π)", { tone: "amber" });
    k.panel(664, 450, 576, 196, { tone: "amber", tinted: true });
    k.text(684, 476, "z = [2, 0, −1] → π = [0.8438, 0.1142, 0.0420]", { size: 13, mono: true, color: "ink" });
    k.text(684, 498, "H = −Σ π ln π = 0.5243 (최대 ln 3 = 1.0986)", { size: 13, mono: true, color: "ink" });
    k.text(684, 520, "∂H/∂z = −π(ln π + H) = [−0.2991, 0.1879, 0.1111]", { size: 13, mono: true, tone: "amber", weight: 700 });
    k.text(684, 546, "탐험이 필요한 문제 (seed 200개): 최적 행동을 고른 비율", { size: 12.5, weight: 700, color: "ink" });
    k.bars(700, 554, 520, 70, [87.0, 94.5, 80.5, 54.5], { labels: ["β = 0", "β = 0.05", "β = 0.2", "β = 0.5"], tones: ["red", "amber", "gray", "purple"], fmt: function (v) { return v.toFixed(1) + "%"; }, barW: 80, gap: 46, size: 12, max: 100 });

    k.flow(40, 664, [
      { t: "N개 환경 롤아웃", tone: "blue" }, { t: "δ_t = r + γV(s′) − V(s)", tone: "pink" }, { t: "Â = Σ(γλ)ˡδ", tone: "teal" },
      { t: "손실: 정책 + 가치 − βH", tone: "red" }, { t: "θ, φ 갱신", tone: "orange" }
    ], { h: 34, size: 12.5, gap: 20 });
  }
});
