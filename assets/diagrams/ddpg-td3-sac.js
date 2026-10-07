/* 연속 행동 off-policy (DDPG → TD3 → SAC) — 알고리즘 구성도 4장
   예제 숫자는 시뮬레이터 화면과 같은 설정(θ = 40°, Q* 설명용 함수, TD3 평활화 σ̃ 0.2·c 0.5, SAC μ 0.3·σ 0.5·ε 0.8, 학습 비교 seed 2)을 파이썬으로 검산한 값 */
DSDiagram.register({
  id: "ddpg-td3-sac-1", sim: "ddpg-td3-sac", order: 1,
  title: "연속 제어 (1) — DDPG 결정적 actor·critic", short: "DDPG",
  sub: "연속 행동 off-policy · DDPG(Deep Deterministic Policy Gradient) — actor가 행동을 직접 내고, critic의 기울기 ∇a Q 방향으로 actor를 민다",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 왜 actor인가 */
    k.section(40, 152, "① 연속 행동에서는 argmax를 못 쓴다", { tone: "orange" });
    k.panel(40, 166, 400, 176, { tone: "orange", tinted: true });
    k.box(58, 182, 170, 66, { tone: "gray", fill: "plain", title: "DQN (이산 행동)", sub: "행동 3개 → Q 3개 중 최대", size: 14, subSize: 12 });
    k.box(252, 182, 170, 66, { tone: "orange", title: "연속 행동 (토크)", sub: "−2 ~ 2 사이 무한히 많음", size: 14, subSize: 12 });
    k.lines(58, 274, [
      { t: "격자로 쪼개면 관절 수만큼 곱으로 폭발", weight: 700, color: "ink" },
      { t: "HalfCheetah 관절 6개 × 11칸 = 11⁶ = **1,771,561**개", color: "muted" },
      { t: "→ actor μθ(s)가 행동 벡터를 바로 출력", weight: 700, tone: "orange" }
    ], { size: 13.5, lh: 22 });

    /* ② 구조 */
    k.section(466, 152, "② 구성 — 네트워크 4개 + 재현 버퍼", { tone: "blue" });
    k.panel(466, 166, 774, 176, { tone: "blue", tinted: true });
    var buf = k.box(484, 222, 118, 64, { tone: "gray", fill: "plain", title: "재현 버퍼", sub: "(s, a, r, s′)", size: 14, subSize: 12 });
    var act = k.box(650, 180, 168, 56, { tone: "orange", title: "actor μθ(s)", sub: "상태 → 행동 하나", size: 14, subSize: 12 });
    var cri = k.box(650, 272, 168, 56, { tone: "purple", title: "critic Qφ(s, a)", sub: "상태·행동 → 가치", size: 14, subSize: 12 });
    var tact = k.box(880, 180, 168, 56, { tone: "pink", fill: "plain", title: "타깃 actor μθ′", sub: "a′ = μθ′(s′)", size: 14, subSize: 12 });
    var tcri = k.box(880, 272, 168, 56, { tone: "pink", fill: "plain", title: "타깃 critic Qφ′", sub: "y = r + γQφ′(s′, a′)", size: 14, subSize: 12 });
    var env = k.box(1100, 222, 122, 64, { tone: "blue", fill: "plain", title: "환경", sub: "a + 탐험 잡음", size: 14, subSize: 12 });
    k.arrow(602, 240, 650, 212, { tone: "gray", width: 1.6 });
    k.arrow(602, 268, 650, 296, { tone: "gray", width: 1.6 });
    k.arrow(734, 272, 734, 236, { tone: "purple", width: 2, label: "∇aQ", labelDx: 26, labelDy: 14 });
    k.arrow(880, 300, 818, 300, { tone: "pink", width: 2 });
    k.arrow(964, 236, 964, 272, { tone: "pink", width: 2 });
    k.arrow(818, 192, 880, 192, { tone: "gray", width: 1.4, dash: true, label: "τ 복사", labelDy: 2 });
    k.arrow(818, 318, 880, 318, { tone: "gray", width: 1.4, dash: true, label: "τ 복사", labelDy: 18 });
    k.arrow(1048, 208, 1100, 240, { tone: "orange", width: 1.6 });
    k.text(1161, 312, "경험 저장 → 버퍼", { size: 12, anchor: "middle", color: "muted" });

    /* ③ 숫자로 */
    k.section(40, 378, "③ 결정적 정책 기울기를 숫자로 — θ = 40°, ω = 0 (시뮬레이터와 같은 설명용 Q*)", { tone: "purple" });
    k.panel(40, 392, 760, 222, { tone: "purple", tinted: true });
    k.box(56, 406, 360, 196, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "1. 순전파", titleColor: "ink", size: 15, lines: [
      { t: "s = (cos θ, sin θ, ω) = (0.766, 0.643, 0)", size: 13 },
      { t: "actor: a = tanh(wᵀs + b)", size: 13 },
      { t: "      w = (0.2, −0.5, 0.1), b = 0", size: 13 },
      { t: "wᵀs = 0.153 − 0.321 = −0.168 → a = **−0.167**", size: 14, tone: "orange" },
      { t: "critic: Q = −(θ² + 0.1ω²) − 3(a − a*)²", size: 13 },
      { t: "a* = tanh(−1.2 sin θ) = −0.648", size: 13 },
      { t: "Q = −0.487 − 3 × 0.481² = **−1.182**", size: 14, tone: "purple" }
    ] });
    k.box(428, 406, 358, 196, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "2. 연쇄 법칙 → 갱신 (lr 0.1)", titleColor: "ink", size: 15, lines: [
      { t: "∇a Q = −6(a − a*) = −6 × 0.481 = **−2.887**", size: 14, tone: "purple" },
      { t: "∂a/∂b = 1 − a² = 0.972,  ∂a/∂w = (1 − a²)·s", size: 14 },
      { t: "∇b J = −2.887 × 0.972 = −2.806", size: 14 },
      { t: "∇w J = (−2.150, −1.804, 0)", size: 14 },
      { t: "θ ← θ + 0.1·∇θ J", size: 14 },
      { t: "a: −0.167 → **−0.623**,  Q: −1.182 → **−0.489**", size: 14, tone: "orange" }
    ] });
    k.panel(820, 392, 420, 222, { tone: "pink", head: "solid", title: "critic 목표 · 타깃 · 탐험" });
    k.lines(838, 452, [
      { t: "y = r + γ · Qφ′(s′, μθ′(s′))", weight: 700, color: "ink" },
      { t: "  = −0.53 + 0.99 × (−12.4) = **−12.806**", tone: "pink" },
      { t: "L(φ) = 평균[(Qφ(s, a) − y)²]", color: "ink" },
      { t: "θ′ ← τθ + (1 − τ)θ′,  τ = 0.005", weight: 700, color: "ink" },
      { t: "  예) 0.005 × 0.80 + 0.995 × 0.50 = **0.5015**", tone: "pink" },
      { t: "a = clip(μθ(s) + 잡음, −1, 1)  (OU · 가우시안)", weight: 700, tone: "amber" },
      { t: "평가할 때는 잡음 없이 μθ(s)", color: "muted" }
    ], { size: 13, lh: 22 });

    k.flow(40, 640, [
      { t: "상태 s 관찰", tone: "blue" }, { t: "a = μ(s) + 잡음", tone: "orange" }, { t: "버퍼에 저장", tone: "gray" },
      { t: "미니배치 추출", tone: "gray" }, { t: "critic: (Q − y)²", tone: "purple" }, { t: "actor: ∇aQ·∇θμ", tone: "orange" }, { t: "soft update τ", tone: "pink" }
    ], { label: "한 걸음", h: 40, gap: 20, size: 13 });
  }
});

DSDiagram.register({
  id: "ddpg-td3-sac-2", sim: "ddpg-td3-sac", order: 2,
  title: "연속 제어 (2) — TD3 세 가지 보완", short: "TD3",
  sub: "연속 행동 off-policy · TD3(Twin Delayed DDPG) — critic 두 개의 최솟값 + 지연된 actor 갱신 + 목표 행동 평활화",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① Clipped Double Q */
    k.section(40, 152, "① Clipped Double Q — 목표는 두 critic 중 작은 값", { tone: "purple" });
    k.panel(40, 166, 590, 300, { tone: "purple", tinted: true });
    var q1 = k.box(60, 186, 150, 58, { tone: "purple", title: "Q′₁(s′, ã)", sub: "−11.8", size: 14, subSize: 14 });
    var q2 = k.box(60, 258, 150, 58, { tone: "purple", title: "Q′₂(s′, ã)", sub: "−12.6", size: 14, subSize: 14 });
    var mn = k.box(254, 222, 130, 58, { tone: "pink", title: "min", sub: "−12.6", size: 15, subSize: 14 });
    k.arrow(210, 215, 254, 242, { tone: "gray", width: 1.6 });
    k.arrow(210, 287, 254, 262, { tone: "gray", width: 1.6 });
    k.box(422, 214, 192, 74, { tone: "pink", fill: "plain", align: "left", title: "y = r + γ · min", size: 14, lines: [{ t: "−0.53 + 0.99 × (−12.6)", size: 12.5 }, { t: "= **−13.004**", size: 13, tone: "pink" }] });
    k.arrow(384, 251, 422, 251, { tone: "pink", width: 1.8 });
    k.text(60, 346, "왜 필요한가 — 오차가 섞인 critic의 최댓값은 위로 치우친다", { size: 13.5, weight: 800, color: "ink" });
    k.table(60, 358, [250, 170, 130], [
      ["후보 10개 · 오차 N(0,1) · 40만 번", "목표에 쓴 값", "평균 편향"],
      ["DDPG식: Q₁(a*), a* = argmax Q₁", "critic 하나", { t: "+1.538", tone: "red", weight: 800 }],
      ["TD3식: min(Q₁, Q₂)(a*)", "작은 쪽", { t: "−0.045", tone: "teal", weight: 800 }]
    ], { rh: 26, size: 12.5 });
    k.text(60, 456, "편향 b가 부트스트랩으로 쌓이면 약 b / (1 − γ) — γ 0.99에서 100배", { size: 12.5, tone: "red", weight: 700 });

    /* ② 지연 */
    k.section(650, 152, "② Delayed Policy Update — d = 2", { tone: "orange" });
    k.panel(650, 166, 590, 132, { tone: "orange", tinted: true });
    var rows = [["critic Q₁·Q₂", "purple", function () { return true; }], ["actor μ", "orange", function (t) { return t % 2 === 0; }], ["타깃 soft update", "pink", function (t) { return t % 2 === 0; }]];
    rows.forEach(function (r, ri) {
      var y = 182 + ri * 30;
      k.text(668, y + 16, r[0], { size: 12.5, weight: 700, color: "ink" });
      for (var t = 1; t <= 10; t++) k.rect(800 + (t - 1) * 42, y, 36, 22, { tone: r[1], fill: r[2](t) ? "solid" : "tone", r: 4 });
    });
    k.text(668, 284, "critic 10번 갱신하는 동안 actor·타깃은 5번 — 덜 흔들리는 ∇aQ를 보고 정책을 바꾼다", { size: 12.5, color: "muted" });

    /* ③ 평활화 */
    k.section(650, 330, "③ Target Policy Smoothing — 목표 행동에 잘린 잡음", { tone: "teal" });
    k.panel(650, 344, 590, 122, { tone: "teal", tinted: true });
    k.formula(666, 358, 558, 34, "ã = clip( μθ′(s′) + clip(ε, −c, c), −1, 1 ),  ε ~ N(0, σ̃²)", { size: 14, weight: 700 });
    k.lines(668, 414, [
      { t: "critic 오차 봉우리 위의 a′ = 0.35:  Q′(a′) = **1.638** → 평활화 평균 **0.556**", tone: "teal" },
      { t: "(σ̃ = 0.2, c = 0.5) · 봉우리 없는 실제 값 0.438 — 오차를 약 90% 줄임", color: "muted" }
    ], { size: 13, lh: 22 });

    /* ④ 비교 */
    k.section(40, 500, "④ DDPG → TD3 에서 바뀐 것", { tone: "blue" });
    k.table(56, 514, [180, 330, 360, 314], [
      ["항목", "DDPG", "TD3", "효과"],
      ["critic", "1개", "2개 · 목표는 min(Q′₁, Q′₂)", "과대평가 억제"],
      ["actor·타깃 갱신", "매 걸음", "d = 2 걸음마다", "덜 흔들리는 critic을 따라감"],
      ["목표 행동", "μθ′(s′) 그대로", "μθ′(s′) + clip(N(0, 0.2²), −0.5, 0.5)", "뾰족한 Q 오차를 무디게"],
      ["actor 기울기", "∇a Q₁ · ∇θ μ", "∇a Q₁ · ∇θ μ (Q₁만 사용)", "계산은 같음"]
    ], { rh: 26, size: 12.5, tones: function (i) { return i === 1 ? "purple" : i === 2 ? "orange" : i === 3 ? "teal" : "blue"; } });
    k.code(56, 652, 1184, 46, [
      "model = TD3(\"MlpPolicy\", env, action_noise=NormalActionNoise(np.zeros(1), 0.1 * np.ones(1)),",
      "            policy_delay=2, target_policy_noise=0.2, target_noise_clip=0.5)   # ① critic 2개는 기본"
    ], { size: 12.5 });
  }
});

DSDiagram.register({
  id: "ddpg-td3-sac-3", sim: "ddpg-td3-sac", order: 3,
  title: "연속 제어 (3) — SAC 최대 엔트로피", short: "SAC",
  sub: "연속 행동 off-policy · SAC(Soft Actor-Critic) — 보상과 함께 정책의 무작위성(엔트로피)도 최대화 — 실무에서 가장 많이 쓰는 연속 제어 알고리즘",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.formula(40, 132, 1200, 40, "J(π) = Σt E[ r(st, at) + **α · H(π(·|st))** ],    H = −E[ log π(a|s) ]   — 많이 받되, 가능한 한 다양하게", { size: 16, weight: 700 });

    /* ① tanh-가우시안 */
    k.section(40, 206, "① 확률적 actor — tanh-가우시안 + 재매개변수화", { tone: "teal" });
    k.panel(40, 220, 590, 262, { tone: "teal", tinted: true });
    k.box(58, 236, 150, 50, { tone: "teal", title: "actor", sub: "μ = 0.30, σ = 0.50", size: 14, subSize: 12 });
    k.box(240, 236, 168, 50, { tone: "amber", title: "u = μ + σ·ε", sub: "ε = 0.8 ~ N(0, 1)", size: 14, subSize: 12 });
    k.box(440, 236, 172, 50, { tone: "orange", title: "a = tanh(u)", sub: "−1 ~ 1로 누름", size: 14, subSize: 12 });
    k.arrow(208, 261, 240, 261, { tone: "gray", width: 1.6 }); k.arrow(408, 261, 440, 261, { tone: "gray", width: 1.6 });
    k.box(58, 300, 554, 168, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "숫자로 (시뮬레이터 기본값)", titleColor: "ink", size: 13.5, lines: [
      { t: "u = 0.30 + 0.50 × 0.80 = 0.700  →  a = tanh(0.700) = **0.6044**  (토크 2a = 1.21)", size: 13.5, tone: "orange" },
      { t: "log N(u; μ, σ²) = −ε²/2 − log σ − ½ log 2π = −0.320 + 0.693 − 0.919 = −0.5458", size: 12.5 },
      { t: "tanh 보정  −log(1 − a²) = −log(1 − 0.3653) = +0.4545", size: 12.5 },
      { t: "log π(a|s) = −0.5458 + 0.4545 = **−0.0913**", size: 13.5, tone: "teal" },
      { t: "이 표본이 목적 함수에 주는 엔트로피 몫: −α·log π = 0.2 × 0.0913 = +0.018", size: 12.5, tone: "amber" },
      { t: "∂a/∂μ = 1 − a² = 0.635,  ∂a/∂log σ = (1 − a²)·σ·ε = 0.254  → ε 고정, 기울기는 μ·σ로", size: 12.5 }
    ] });

    /* ② critic · actor 손실 */
    k.section(650, 206, "② soft 목표값과 손실", { tone: "purple" });
    k.panel(650, 220, 590, 262, { tone: "purple", tinted: true });
    k.lines(668, 254, [
      { t: "critic 목표 (타깃 actor 없음, 다음 행동은 현재 정책에서 뽑음)", weight: 800, color: "ink" },
      { t: "y = r + γ · ( min j Qφ′j(s′, ã′) − α · log π(ã′|s′) )", weight: 700, tone: "purple" },
      { t: "  = −0.53 + 0.99 × (−12.6 − 0.2 × (−0.0913)) = **−12.986**", tone: "purple" },
      { t: "actor 손실", weight: 800, color: "ink" },
      { t: "Lπ = E[ α · log π(ã|s) − min j Qφj(s, ã) ]", weight: 700, tone: "orange" },
      { t: "  Q는 크게, log π는 작게(= 넓게) — α가 저울추", color: "muted" },
      { t: "쌍둥이 critic + min은 TD3와 같음 · 평가할 때는 tanh(μ)", color: "muted" }
    ], { size: 13.5, lh: 25 });

    /* ③ α 자동 조절 */
    k.section(40, 516, "③ 온도 α 자동 조절 — 목표 엔트로피 H̄ = −(행동 차원)", { tone: "amber" });
    k.formula(40, 530, 590, 34, "Lα = E[ −log α · ( log π(ã|s) + H̄ ) ]", { size: 15, weight: 700 });
    k.note(40, 576, 290, 56, { tone: "red", title: "엔트로피 H < H̄ (너무 좁음)", body: "→ α를 키워 더 퍼지게" });
    k.note(340, 576, 290, 56, { tone: "blue", title: "엔트로피 H > H̄ (너무 넓음)", body: "→ α를 줄여 보상에 집중" });
    k.text(40, 656, "Pendulum (이 페이지, seed 2, 50 에피소드): α 0.199 → 0.215, 엔트로피 0.50 → −1.00 (H̄ = −1)", { size: 12.5, weight: 700, tone: "amber" });

    k.section(650, 516, "④ 왜 실무 기본값인가", { tone: "green" });
    k.bullets(668, 552, 570, [
      { t: "탐험이 목적 함수 안에 — 잡음을 따로 설계할 필요 없음", tone: "green" },
      { t: "α 자동 조절로 보상 크기가 달라도 설정 손볼 일이 적음", tone: "green" },
      { t: "확률적 정책 + 쌍둥이 critic → seed마다 결과가 덜 흔들림", tone: "green" },
      { t: "off-policy라 재현 버퍼로 표본 효율이 좋음 (로봇·제어)", tone: "green" }
    ], { size: 13.5, lh: 26 });
    k.code(650, 660, 590, 40, ["model = SAC(\"MlpPolicy\", env, ent_coef=\"auto\", target_entropy=\"auto\")"], { size: 12.5 });
  }
});

DSDiagram.register({
  id: "ddpg-td3-sac-4", sim: "ddpg-td3-sac", order: 4,
  title: "연속 제어 (4) — 비교와 실무 선택", short: "비교와 선택",
  sub: "같은 틀(재현 버퍼 + actor + critic + 타깃)에서 무엇을 바꿨나 · 브라우저 Pendulum 결과와 MuJoCo 로봇 과제",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 세 알고리즘 한눈에", { tone: "blue" });
    k.table(56, 166, [170, 300, 330, 384], [
      ["", "DDPG (2015)", "TD3 (2018)", "SAC (2018)"],
      ["정책", "결정적 μθ(s)", "결정적 μθ(s)", "확률적 tanh-가우시안"],
      ["critic", "1개", "2개, 목표는 min", "2개, 목표는 min − α log π"],
      ["탐험", "행동 + OU · 가우시안 잡음", "행동 + 가우시안 잡음", "정책 자체의 무작위성 + 엔트로피 보너스"],
      ["타깃 네트워크", "actor · critic", "actor · critic (d 걸음마다)", "critic만"],
      ["주요 설정", "잡음 크기, lr", "잡음, d, σ̃, c", "대부분 기본값 (α 자동)"],
      ["언제", "개념 학습 · 기준선", "결정적 정책이 필요할 때", "연속 제어의 첫 선택"]
    ], { rh: 27, size: 13, tones: function () { return "blue"; } });
    k.rect(56 + 170, 166, 300, 27, { tone: "pink", fill: "mid", r: 4, opacity: 0.3 });
    k.rect(56 + 470, 166, 330, 27, { tone: "purple", fill: "mid", r: 4, opacity: 0.3 });
    k.rect(56 + 800, 166, 384, 27, { tone: "teal", fill: "mid", r: 4, opacity: 0.3 });


    k.section(40, 384, "② Pendulum — 브라우저 학습 결과 (seed 2)", { tone: "teal" });
    k.panel(40, 398, 590, 216, { tone: "teal", tinted: true });
    k.table(56, 412, [110, 170, 150, 140], [
      ["", "최근 5회 평균 > −300", "평가 (10개 시작)", "계산 시간"],
      [{ t: "DDPG", tone: "pink" }, "22번째 에피소드", "−132.8", "약 17초"],
      [{ t: "TD3", tone: "purple" }, "34번째 에피소드", "−150.5", "약 20초"],
      [{ t: "SAC", tone: "teal" }, "26번째 에피소드", "−135.7", "약 28초"]
    ], { rh: 28, size: 13 });
    k.para(58, 556, 500, "은닉층 32·32, 배치 64, 버퍼 30,000. Pendulum은 쉬운 과제라 DDPG도 잘 풀린다 — 차이는 고차원 로봇 과제와 여러 seed에서 커진다. 계산 시간은 측정 환경에 따라 다름.", { size: 12.5, color: "muted" });

    k.section(650, 384, "③ MuJoCo 로봇 과제의 크기 (개념)", { tone: "orange" });
    k.panel(650, 398, 590, 216, { tone: "orange", tinted: true });
    k.table(666, 412, [170, 110, 110, 168], [
      ["환경", "상태 차원", "행동 차원", "성격"],
      ["Pendulum-v1", "3", "1", "스윙업"],
      ["Hopper-v4", "11", "3", "한 다리 뛰기"],
      ["HalfCheetah-v4", "17", "6", "달리기"],
      ["Ant-v4", "27", "8", "네 다리"],
      ["Humanoid-v4", "376", "17", "사람형"]
    ], { rh: 27, size: 12.5 });
    k.text(666, 600, "HalfCheetah 보상 = 앞쪽 속도 − 0.1·Σa² · 보통 1백만 걸음 학습", { size: 12.5, color: "muted" });

    k.section(40, 648, "④ 실무 순서", { tone: "green" });
    k.flow(200, 628, [
      { t: "SAC로 시작", s: "기본값 · α 자동", tone: "green" }, { t: "관측·보상 정규화", s: "불안정하면 먼저 점검", tone: "gray" },
      { t: "seed 3~5개 평균", s: "한 번 결과로 판단 금지", tone: "blue" }, { t: "결정적 정책 필요 → TD3", s: "추론 단순", tone: "purple" }, { t: "시뮬레이터 → 실제", s: "안전 제약·사람 감독", tone: "red" }
    ], { h: 50, gap: 18, size: 13 });
  }
});
