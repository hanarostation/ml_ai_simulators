/* LLM 정렬 (RLHF · DPO · GRPO) — 알고리즘 구성도
   예제 숫자는 시뮬레이터 기본값(전체 시드 7)에서 나온 값과 같다: 학습 쌍 1번, 보상 해킹 표(두통약 질문), β 비교, DPO 300단계 후 학습 쌍 1번, GRPO 그룹(G = 8), 비교 탭 결과 */
DSDiagram.register({
  id: "llm-alignment-1", sim: "llm-alignment", order: 1,
  title: "LLM 정렬 (1) — 파이프라인과 토큰 생성 MDP", short: "파이프라인 · 토큰 MDP",
  sub: "사전학습 → SFT → 선호 데이터 → RLHF · DPO · GRPO — 시뮬레이터는 어휘 13개짜리 장난감 언어 모형으로 줄여 브라우저에서 직접 학습",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 파이프라인 */
    k.section(40, 152, "① 정렬 파이프라인 — 말을 배우고, 지시를 따르고, 사람의 선호에 맞춘다");
    k.panel(40, 166, 1200, 196, { tone: "gray", tinted: true });
    var pre = k.box(60, 236, 150, 62, { tone: "blue", title: "사전학습", sub: "다음 토큰 예측 · 대량 텍스트", size: 15 });
    var sft = k.box(240, 236, 150, 62, { tone: "orange", title: "SFT", sub: "시연 데이터 → 기준 π_ref", size: 15 });
    var pref = k.box(420, 236, 160, 62, { tone: "blue", title: "선호 데이터", sub: "(x, y_w ≻ y_l) 쌍", size: 15 });
    var rm = k.box(640, 180, 170, 52, { tone: "green", title: "보상 모델 r_φ", sub: "Bradley–Terry", size: 14 });
    var ppo = k.box(850, 180, 170, 52, { tone: "orange", title: "PPO", sub: "보상 − β·KL · 가치망", size: 14 });
    var dpo = k.box(640, 241, 380, 52, { tone: "orange", title: "DPO", sub: "선호 쌍의 로그 확률 비율로 바로 분류 손실", size: 14 });
    var ver = k.box(640, 302, 170, 52, { tone: "green", title: "검증 보상", sub: "정답 · 형식 규칙", size: 14 });
    var gr = k.box(850, 302, 170, 52, { tone: "orange", title: "GRPO", sub: "G개 그룹 비교 · 가치망 없음", size: 14 });
    var out = k.box(1062, 236, 160, 62, { tone: "teal", fill: "solid", title: "정렬된 정책 π_θ", sub: "SFT 대비 승률로 평가", size: 15 });
    k.link(pre.r, sft.l, { tone: "gray" }); k.link(sft.r, pref.l, { tone: "gray" });
    k.arrow(580, 258, 638, 206, { tone: "gray" }); k.link(pref.r, dpo.l, { tone: "gray" });
    k.arrow(315, 298, 638, 328, { tone: "gray", via: [[315, 328]] });
    k.text(470, 322, "프롬프트 + SFT 정책", { size: 12, weight: 700, color: "muted", anchor: "middle" });
    k.link(rm.r, ppo.l, { tone: "gray" }); k.link(ver.r, gr.l, { tone: "gray" });
    k.arrow(1020, 206, 1060, 252, { tone: "gray" }); k.link(dpo.r, out.l, { tone: "gray" }); k.arrow(1020, 328, 1060, 282, { tone: "gray" });
    k.text(560, 194, "RLHF", { size: 13, weight: 800, tone: "orange", anchor: "middle" });

    /* ② 토큰 생성 = MDP */
    k.section(40, 400, "② 토큰 생성 = 강화학습 문제", { tone: "orange" });
    k.panel(40, 414, 590, 232, { tone: "orange", tinted: true });
    k.table(56, 426, [128, 430], [
      ["RL 요소", "언어 모형에서"],
      ["상태 s_t", "질문 x + 지금까지 쓴 토큰 y_<t"],
      ["행동 a_t", "다음 토큰 y_t (어휘 13개 중 하나)"],
      ["정책 π_θ", "softmax(로짓) — 언어 모형 그 자체"],
      ["전이", "고른 토큰을 이어 붙임 (결정적)"],
      ["보상", "응답이 끝날 때 r(x, y) 한 번"],
      ["RLHF 추가", "토큰마다 −β·(log π_θ − log π_ref)"]
    ], { rh: 30, size: 13.5, tones: function (i) { return ["", "blue", "orange", "orange", "blue", "green", "pink"][i]; } });

    /* ③ 장난감 언어 모형 */
    k.section(660, 400, "③ 시뮬레이터의 장난감 언어 모형", { tone: "purple" });
    k.panel(660, 414, 580, 232, { tone: "purple", tinted: true });
    var a1 = k.box(678, 432, 156, 92, { tone: "blue", fill: "plain", title: "입력 37", size: 14, align: "left", valign: "top",
      lines: [{ t: "질문 4 + 위치 6", size: 12 }, { t: "직전 토큰 14", size: 12 }, { t: "쓴 토큰 개수 13", size: 12 }] });
    var a2 = k.box(866, 448, 120, 60, { tone: "purple", title: "은닉 32", sub: "tanh", size: 14 });
    var a3 = k.box(1018, 448, 204, 60, { tone: "orange", title: "로짓 13 → softmax", sub: "다음 토큰 확률", size: 14 });
    k.link(a1.r, a2.l, { tone: "blue" }); k.link(a2.r, a3.l, { tone: "blue" });
    k.text(680, 548, "파라미터: (37·32 + 32) + (32·13 + 13) = 1,216 + 429 = **1,645**개", { size: 13.5, color: "ink" });
    k.text(680, 574, "SFT 모형, 질문 1 · t = 0 의 다음 토큰 확률", { size: 12.5, weight: 700, tone: "purple" });
    var pr = [["안녕하세요.", 0.564], ["걱정되셨죠.", 0.195], ["하루 3회까지 드세요.", 0.105], ["좋은 질문이에요!", 0.070]];
    pr.forEach(function (q, i) {
      var x = 680 + (i % 2) * 280, y = 588 + Math.floor(i / 2) * 26;
      k.text(x + 140, y + 13, q[0], { size: 12, anchor: "end", color: "ink" });
      k.rect(x + 148, y + 3, 90 * q[1] / 0.564, 13, { tone: "orange", fill: "solid", r: 2 });
      k.text(x + 152 + 90 * q[1] / 0.564, y + 14, q[1].toFixed(3), { size: 11.5, color: "muted", mono: true });
    });

    k.flow(40, 662, [
      { t: "질문 x", tone: "blue" }, { t: "π_θ가 토큰 생성", tone: "orange" }, { t: "응답 y", tone: "blue" },
      { t: "보상 · 선호 신호", tone: "green" }, { t: "정책 갱신 · KL 제약", tone: "purple" }
    ], { label: "한 번의 정렬 반복", h: 34, w: 1200 });
  }
});

DSDiagram.register({
  id: "llm-alignment-2", sim: "llm-alignment", order: 2,
  title: "LLM 정렬 (2) — 보상 모델과 RLHF (PPO)", short: "보상 모델 · PPO",
  sub: "선호 쌍으로 보상 모델을 학습하고, 정책이 직접 응답을 만들며 '보상 − β·KL'을 최대화 — β가 작으면 보상 해킹",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① Bradley–Terry */
    k.section(40, 152, "① 보상 모델 — Bradley–Terry 숫자로 따라가기", { tone: "green" });
    k.panel(40, 166, 590, 300, { tone: "green", tinted: true });
    k.formula(56, 180, 558, 40, "P(y_w ≻ y_l) = σ(r_w − r_l),   손실 = −log σ(r_w − r_l)", { size: 15 });
    k.text(58, 244, "질문: 두통약은 하루에 몇 번 먹어도 되나요?", { size: 13, weight: 700, color: "ink" });
    k.box(56, 254, 558, 52, { tone: "teal", fill: "plain", align: "left", title: "y_w  안녕하세요. · 좋은 질문이에요! · 하루 3회까지 드세요. · 의료진과 상담하세요.", size: 12.5,
      lines: [{ t: "r_w = 0.345 + 0.091 + 2.562 + 1.172 ≈ **4.169**   (정답 품질 3.5)", size: 12.5 }] });
    k.box(56, 314, 558, 52, { tone: "red", fill: "plain", align: "left", title: "y_l  하루 3회까지 드세요. · 감사합니다.", size: 12.5,
      lines: [{ t: "r_l = 2.562 − 0.231 = **2.331**   (정답 품질 2.3)", size: 12.5 }] });
    k.box(56, 376, 558, 74, { tone: "green", fill: "tone", align: "left", valign: "top", title: "r_w − r_l = 1.839 → σ(1.839) = 0.8628 → 손실 −log 0.8628 = 0.1476", size: 13.5,
      lines: [{ t: "r(x, y) = Σ w[x, 토큰] × 개수 (파라미터 52개) · 학습 쌍 320 · 검증 정확도 88.8%", size: 12.5, color: "muted" }] });

    /* ② 보상 해킹 */
    k.section(660, 152, "② 보상 해킹 — 보상은 오르는데 품질은 떨어진다", { tone: "red" });
    k.panel(660, 166, 580, 300, { tone: "red", tinted: true });
    k.text(676, 194, "'안녕하세요. 하루 3회까지 드세요.' 뒤에 같은 문장을 k번 덧붙이면", { size: 13, weight: 700, color: "ink" });
    k.table(676, 206, [70, 170, 150, 150], [
      ["k", "문장 수", "보상 모델 r", "숨은 정답 품질"],
      ["0", "2", { t: "2.91", mono: true }, { t: "2.5", mono: true, tone: "green" }],
      ["1", "3", { t: "5.47", mono: true }, { t: "1.3", mono: true, tone: "green" }],
      ["2", "4", { t: "8.03", mono: true }, { t: "0.1", mono: true }],
      ["3", "5", { t: "10.59", mono: true }, { t: "−1.7", mono: true, tone: "red" }],
      ["4", "6 (끝나지 않음)", { t: "13.15", mono: true }, { t: "−4.0", mono: true, tone: "red" }]
    ], { rh: 30, size: 13 });
    k.note(676, 392, 548, 64, { tone: "red", title: "왜? 보상 모델은 반복을 본 적이 없다", body: "SFT 응답은 거의 반복하지 않으므로 '반복 = 감점'을 배우지 못함 → 가중치가 큰 문장을 반복할수록 r이 선형으로 증가 (+2.562씩)" });

    /* ③ PPO */
    k.section(40, 500, "③ RLHF 목적과 PPO — 메모리에 모형 4개", { tone: "orange" });
    k.panel(40, 514, 760, 186, { tone: "orange", tinted: true });
    k.formula(56, 526, 728, 64, "max E[ r_φ(x, y) ] − β · KL( π_θ ‖ π_ref )\n토큰 보상 r_t = −β(log π_θ − log π_ref) + [t = T]·r_φ  →  GAE 이점 → PPO-clip", { size: 14.5 });
    var m = [["정책 π_θ", "학습", "orange"], ["기준 π_ref", "고정 (SFT)", "gray"], ["보상 r_φ", "고정", "green"], ["가치 V", "학습", "purple"]];
    m.forEach(function (q, i) { k.box(56 + i * 184, 604, 168, 50, { tone: q[2], fill: i === 1 ? "soft" : "tone", title: q[0], sub: q[1], size: 14 }); });
    k.text(56, 682, "매 반복 질문마다 응답 12개를 새로 생성(온라인) · 4 에폭 · 클립 ε = 0.2", { size: 12.5, color: "muted" });

    k.section(830, 500, "④ β 비교 (60반복, 마지막 5반복 평균)", { tone: "purple" });
    k.panel(830, 514, 410, 186, { tone: "purple", tinted: true });
    k.table(846, 526, [70, 96, 86, 136], [
      ["β", "보상 r", "KL", "정답 품질"],
      [{ t: "0.1", tone: "red" }, { t: "17.11", mono: true }, { t: "41.39", mono: true }, { t: "−5.41 반복", mono: true, tone: "red" }],
      [{ t: "0.3", tone: "orange" }, { t: "12.86", mono: true }, { t: "20.77", mono: true }, { t: "−1.77", mono: true, tone: "red" }],
      [{ t: "0.8", tone: "blue" }, { t: "4.79", mono: true }, { t: "1.33", mono: true }, { t: "2.65", mono: true, tone: "green" }]
    ], { rh: 30, size: 13 });
    k.text(846, 668, "SFT 정답 품질 1.50 · β가 작을수록 KL↑ 보상↑ 품질↓", { size: 12.5, weight: 700, tone: "purple" });
  }
});

DSDiagram.register({
  id: "llm-alignment-3", sim: "llm-alignment", order: 3,
  title: "LLM 정렬 (3) — DPO 숫자로 따라가기", short: "DPO 계산",
  sub: "Direct Preference Optimization · 보상 모델과 생성 없이, 선호 쌍의 로그 확률 비율만으로 분류 손실을 최소화 (β = 0.3, 300단계 학습 후 학습 쌍 1번)",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 유도 */
    k.section(40, 152, "① 보상 모델이 사라지는 이유", { tone: "blue" });
    k.panel(40, 166, 1200, 120, { tone: "blue", tinted: true });
    var s1 = k.box(56, 182, 270, 88, { tone: "blue", fill: "plain", title: "KL 제약 최적 정책", sub: "π*(y|x) ∝ π_ref(y|x)·exp(r(x,y)/β)", size: 14, subSize: 12.5 });
    var s2 = k.box(366, 182, 300, 88, { tone: "purple", fill: "plain", title: "보상을 정책으로 표현", sub: "r = β·log(π*/π_ref) + β·log Z(x)", size: 14, subSize: 12.5 });
    var s3 = k.box(706, 182, 518, 88, { tone: "orange", title: "Bradley–Terry에 대입 → Z(x) 소거", size: 14, subSize: 12.5,
      lines: [{ t: "L_DPO = −log σ( β·[ log(π_θ/π_ref)(y_w) − log(π_θ/π_ref)(y_l) ] )", size: 13, weight: 700 }] });
    k.link(s1.r, s2.l, { tone: "blue" }); k.link(s2.r, s3.l, { tone: "blue" });

    /* ② 항목별 계산 */
    k.section(40, 322, "② 항목별 계산 — 실제 숫자", { tone: "orange" });
    k.panel(40, 336, 760, 300, { tone: "orange", tinted: true });
    k.text(56, 362, "x: 두통약은 하루에 몇 번 먹어도 되나요?", { size: 13, weight: 700, color: "ink" });
    k.text(56, 384, "y_w: 안녕하세요. · 좋은 질문이에요! · 하루 3회까지 드세요. · 의료진과 상담하세요. · <끝>", { size: 12.5, tone: "teal" });
    k.text(56, 404, "y_l: 하루 3회까지 드세요. · 감사합니다. · <끝>", { size: 12.5, tone: "red" });
    k.table(56, 416, [206, 296, 226], [
      ["항목", "y_w (선호)", "y_l (비선호)"],
      ["토큰별 log π_θ", { t: "−0.589 −2.389 −0.006 −0.230 −0.437", mono: true, size: 12 }, { t: "−2.575 −4.075 −0.001", mono: true, size: 12 }],
      ["log π_θ(y|x) = 합", { t: "−3.6508", mono: true }, { t: "−6.6505", mono: true }],
      ["log π_ref(y|x) (고정)", { t: "−4.4851", mono: true }, { t: "−4.0167", mono: true }],
      ["로그 비율 log(π_θ/π_ref)", { t: "+0.8343", mono: true, tone: "green" }, { t: "−2.6337", mono: true, tone: "red" }],
      ["암묵적 보상 r̂ = β × 비율", { t: "+0.2503", mono: true, tone: "green" }, { t: "−0.7901", mono: true, tone: "red" }]
    ], { rh: 31, size: 13 });
    k.text(60, 622, "학습 전(π_θ = π_ref)에는 두 로그 비율이 0 → z = 0 → 손실 = ln 2 = 0.6931", { size: 12.5, color: "muted" });

    /* ③ 손실 */
    k.section(830, 322, "③ 손실과 기울기", { tone: "red" });
    k.panel(830, 336, 410, 300, { tone: "red", tinted: true });
    k.box(846, 352, 378, 132, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "z = β·[ (+0.8343) − (−2.6337) ]", titleColor: "ink", size: 15.5,
      lines: [{ t: "= 0.3 × 3.4681 = **1.0404**", size: 15 }, { t: "σ(z) = 1 / (1 + e^−1.0404) = **0.7389**", size: 15 }, { t: "L_DPO = −log 0.7389 = **0.3025**", size: 15, tone: "red" }] });
    k.box(846, 496, 378, 124, { tone: "purple", fill: "plain", r: 8, align: "left", valign: "top", title: "기울기 크기 β(1 − σ) = 0.0783", titleColor: "ink", size: 15,
      lines: [{ t: "∂L/∂log π_θ(y_w) = −0.0783 → y_w 확률 ↑", size: 14, tone: "teal" }, { t: "∂L/∂log π_θ(y_l) = +0.0783 → y_l 확률 ↓", size: 14, tone: "red" },
        { t: "σ(z)가 1에 가까울수록 (이미 잘 맞힌 쌍) 기울기가 작아진다", size: 12, color: "muted" }] });

    /* 하단 */
    k.flow(40, 662, [
      { t: "선호 쌍 (x, y_w, y_l)", tone: "blue" }, { t: "log π_θ · log π_ref", tone: "orange" }, { t: "비율 차 × β = z", tone: "purple" },
      { t: "−log σ(z)", tone: "red" }, { t: "300단계 → 승률 0.767", tone: "green" }
    ], { label: "DPO 한 단계", h: 34, w: 1200 });
  }
});

DSDiagram.register({
  id: "llm-alignment-4", sim: "llm-alignment", order: 4,
  title: "LLM 정렬 (4) — GRPO와 세 방법 비교", short: "GRPO · 비교",
  sub: "Group Relative Policy Optimization · 질문마다 G개를 뽑아 그룹 평균과 비교 — 가치망 없이 검증 가능한 보상(정답 · 형식)으로 학습",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 그룹 이점 */
    k.section(40, 152, "① 한 그룹의 상대 이점 (질문 1 · G = 8 · 검증 보상)", { tone: "green" });
    k.panel(40, 166, 760, 254, { tone: "green", tinted: true });
    var r = [1.5, -0.5, 0.5, 1.5, 0.5, 1.5, -0.5, 1.5], A = [0.904, -1.507, -0.301, 0.904, -0.301, 0.904, -1.507, 0.904];
    var neg = function (v) { return String(v).replace("-", "−"); };
    k.matrix(160, 208, [r, A], { cw: 76, ch: 34, size: 14, mono: true, rows: ["보상 r_i", "이점 A_i"], cols: ["o1", "o2", "o3", "o4", "o5", "o6", "o7", "o8"], fmt: function (v, i) { return neg(i ? v.toFixed(3) : v.toFixed(1)); },
      tones: function (i, j, v) { return v > 0 ? "green" : v < 0 ? "red" : "gray"; } });
    k.text(56, 302, "r_i = 정답(+1) + 형식(+0.5) + 위험(−1) · 예) o2는 '마음껏 드셔도 돼요' 포함 → 0 + 0.5 − 1 = −0.5", { size: 12.5, color: "muted" });
    k.formula(56, 316, 728, 92, "mean = (1.5 − 0.5 + 0.5 + 1.5 + 0.5 + 1.5 − 0.5 + 1.5) / 8 = 0.75\nstd = √( Σ(r_i − mean)² / 8 ) = √(5.5 / 8) = 0.8292\nA_1 = (1.5 − 0.75) / 0.8292 = 0.904  ·  A_2 = (−0.5 − 0.75) / 0.8292 = −1.507\nΣ A_i = 0 → 평균보다 좋은 응답 ↑, 나쁜 응답 ↓ (모두 같으면 A = 0 → 신호 없음)", { size: 13, weight: 600, align: "left" });

    /* ② 목적 */
    k.section(830, 152, "② GRPO 목적", { tone: "orange" });
    k.panel(830, 166, 410, 254, { tone: "orange", tinted: true });
    k.box(846, 182, 378, 92, { tone: "orange", fill: "plain", r: 8, align: "left", valign: "top", title: "(1/G) Σ_i (1/|o_i|) Σ_t", titleColor: "ink", size: 14,
      lines: [{ t: "[ min(ρA_i, clip(ρ, 1±ε)A_i) − β·D_KL ]", size: 13.5, weight: 700 }, { t: "응답의 모든 토큰에 같은 A_i", size: 12, color: "muted" }] });
    k.box(846, 284, 378, 58, { tone: "pink", fill: "plain", r: 8, align: "left", title: "D_KL = π_ref/π_θ − log(π_ref/π_θ) − 1", titleColor: "ink", size: 13.5, sub: "토큰별 k3 추정량 · 항상 0 이상" });
    k.note(846, 352, 378, 54, { tone: "green", title: "가치망 대신 그룹 평균이 기준선", body: "메모리: 정책 · 기준 (+ 보상 모델이면 3개)" });

    /* ③ 비교 */
    k.section(40, 454, "③ 세 방법 비교 — 장난감 과제 실측 (시드 7 · 기본 설정 · SFT끼리 0.493)", { tone: "purple" });
    k.table(40, 466, [196, 330, 330, 344], [
      ["구분", "RLHF (PPO)", "DPO", "GRPO"],
      ["메모리의 모형", "4 — 정책 · 기준 · 보상 · 가치", "2 — 정책 · 기준", "3 — 정책 · 기준 · 보상 (규칙이면 2)"],
      ["데이터 · 생성", "선호 쌍 + 프롬프트 · 온라인 생성", "선호 쌍만 · 생성 없음", "프롬프트 + 검증기 · 질문마다 G개"],
      ["순전파 횟수 (실측)", { t: "146,564", mono: true }, { t: "77,342", mono: true }, { t: "46,076", mono: true }],
      ["KL · 정답 품질", { t: "1.39 · 2.71", mono: true }, { t: "1.75 · 2.93", mono: true }, { t: "0.73 · 2.60", mono: true }],
      ["SFT 대비 승률", { t: "0.729", mono: true, tone: "orange" }, { t: "0.767", mono: true, tone: "teal" }, { t: "0.677", mono: true, tone: "purple" }],
      ["주의할 점", "보상 해킹 · 하이퍼파라미터 많음", "분포 밖 일반화 · y_w 확률도 하락", "보상이 검사하는 것만 배움"]
    ], { rh: 26, size: 13 });
    k.text(40, 684, "대표 사례", { size: 14, weight: 800, color: "ink" });
    var cx = 130;
    [["PPO — InstructGPT · ChatGPT", "orange", 270], ["DPO — Zephyr · Llama 3 사후학습", "teal", 310], ["GRPO — DeepSeekMath · DeepSeek-R1", "purple", 350]].forEach(function (c) { cx += k.chip(cx, 666, c[0], { tone: c[1], size: 13.5, h: 28, w: c[2] }) + 16; });
  }
});
