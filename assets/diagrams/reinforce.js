/* REINFORCE (정책 경사) — 알고리즘 구성도 3장
   숫자: 시뮬레이터 1번 탭 기본값 θ = [1, 0, −0.5], μ = [1, 2, 0.5], α = 0.1 / 5번 탭 방식의 5걸음 예제(γ = 0.9) / 4번 탭 기본 비교 실행 결과 */
DSDiagram.register({
  id: "reinforce-1", sim: "reinforce", order: 1,
  title: "REINFORCE (1) — 정책 경사 정리", short: "정책 경사 정리",
  sub: "Policy Gradient Theorem · 기대 리턴 J(θ)를 정책 파라미터 θ로 직접 미분하고, log 미분 트릭으로 샘플 평균 꼴을 만든다",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① 유도 */
    k.section(40, 152, "① 6단계 유도 — 기울기를 '기댓값' 꼴로", { tone: "orange" });
    k.panel(40, 166, 660, 400, { tone: "orange", tinted: true });
    var rows = [
      ["목표", "J(θ) = E_τ[ R(τ) ] = Σ_τ p_θ(τ)·R(τ)", "궤적 확률 p_θ(τ)가 정책에 달려 있음", "gray"],
      ["미분", "∇J = Σ_τ ∇p_θ(τ)·R(τ)", "∇p는 확률×값 꼴이 아님 → 샘플로 못 구함", "gray"],
      ["log 트릭", "∇p = p·∇log p  ⇒  ∇J = E_τ[ ∇log p_θ(τ)·R(τ) ]", "다시 기댓값 → 에피소드를 뽑아 평균", "orange"],
      ["궤적 분해", "∇log p_θ(τ) = Σ_t ∇log π_θ(a_t|s_t)", "ρ(s₀)·P(s′|s,a)는 θ와 무관 → 환경 모형 불필요", "blue"],
      ["인과성", "∇J = E[ Σ_t ∇log π_θ(a_t|s_t)·G_t ]", "G_t = Σ_k≥t γ^(k−t)·r_k+1 (그 이후 보상만)", "purple"],
      ["baseline", "∇J = E[ Σ_t ∇log π_θ(a_t|s_t)·(G_t − b(s_t)) ]", "E_a[∇log π·b(s)] = b(s)·∇Σπ = 0 → 편향 없음", "pink"]
    ];
    rows.forEach(function (r, i) {
      var y = 182 + i * 62;
      k.circle(70, y + 24, 15, { tone: r[3], fill: "solid", label: String(i + 1), size: 14 });
      k.text(96, y + 14, r[0], { size: 13, weight: 800, tone: r[3] });
      k.text(190, y + 17, r[1], { size: 14.5, weight: 700, color: "ink", mono: true });
      k.text(190, y + 39, r[2], { size: 12.5, color: "muted" });
      if (i < rows.length - 1) k.arrow(70, y + 41, 70, y + 66, { tone: "gray", width: 1.4, headSize: 6 });
    });

    /* ② 숫자 예 */
    k.section(724, 152, "② 숫자로 — 3개 행동 softmax 정책", { tone: "orange" });
    k.panel(724, 166, 516, 400, { tone: "gray" });
    k.text(744, 196, "θ = [1.0, 0.0, −0.5] · 평균 보상 μ = [1.0, 2.0, 0.5]", { size: 13.5, weight: 700, color: "ink" });
    k.text(744, 220, "e^θ = [2.7183, 1.0000, 0.6065] · 합 4.3248", { size: 13, color: "muted", mono: true });
    k.matrix(800, 250, [[0.6285, 0.2312, 0.1402]], { cw: 96, ch: 32, size: 14, cols: ["A", "B", "C"], rows: ["π(a)"], tones: function () { return "orange"; } });
    k.text(744, 312, "∇θ log π(a) = e_a − π", { size: 13.5, weight: 800, tone: "orange" });
    k.matrix(800, 340, [[0.3715, -0.2312, -0.1402], [-0.6285, 0.7688, -0.1402], [-0.6285, -0.2312, 0.8598]], { cw: 96, ch: 28, size: 13.5,
      cols: ["∂/∂θ_A", "∂/∂θ_B", "∂/∂θ_C"], rows: ["a = A", "a = B", "a = C"], fmt: function (v) { return String(v).replace("-", "−"); },
      tones: function (i, j, v) { return v > 0 ? "blue" : "red"; }, hl: [{ r: 1, c: 0, cs: 3, tone: "orange" }] });
    k.text(744, 444, "참 기울기 ∇J = π ⊙ (μ − J),  J = Σπμ = 1.1611", { size: 13, color: "ink", mono: true });
    k.text(744, 465, "∇J = [−0.1013, **0.1940**, −0.0927]  → B를 늘리는 방향", { size: 13, color: "ink", mono: true });
    k.box(744, 476, 476, 80, { tone: "orange", fill: "plain", align: "left", valign: "top", r: 8, title: "B를 뽑아 r = 2 · α = 0.1 · b = 0", titleColor: "ink", size: 13.5,
      lines: [{ t: "g = (2 − 0)·[−0.6285, 0.7688, −0.1402] = [−1.2571, 1.5376, −0.2805]", size: 12.5 },
        { t: "θ ← θ + 0.1·g = [0.8743, 0.1538, −0.5280] → π(B) 0.2312 → **0.2808**", size: 12.5, tone: "orange" }] });

    /* ③ 정리 */
    k.section(40, 596, "③ 핵심");
    k.note(40, 608, 390, 46, { tone: "blue", title: "환경 모형을 몰라도 된다", body: "∇log π만 있으면 됨 — model-free", bodySize: 12 });
    k.note(445, 608, 390, 46, { tone: "orange", title: "샘플 평균으로 추정 (몬테카를로)", body: "오차는 1/√N로 줄어듦 — 분산이 크다", bodySize: 12 });
    k.note(850, 608, 390, 46, { tone: "pink", title: "baseline은 평균을 안 바꾼다", body: "Σ_a π(a)∇log π(a) = [0, 0, 0] (검산)", bodySize: 12 });
    k.flow(40, 664, [{ t: "에피소드 수집", tone: "blue" }, { t: "G_t 계산", tone: "purple" }, { t: "Â_t = G_t − b", tone: "pink" }, { t: "손실 −Σ Â_t log π", tone: "red" }, { t: "θ 경사 상승", tone: "orange" }], { h: 32, size: 13 });
  }
});

DSDiagram.register({
  id: "reinforce-2", sim: "reinforce", order: 2,
  title: "REINFORCE (2) — 알고리즘과 크레딧 할당", short: "알고리즘과 크레딧 할당",
  sub: "Monte-Carlo Policy Gradient · 에피소드를 끝까지 진행한 뒤, 각 행동에 그 이후의 리턴 G_t만큼 책임(credit)을 나눠 준다",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 한 번의 업데이트 — 에피소드 단위 (CartPole 예)", { tone: "orange" });
    k.panel(40, 166, 1200, 150, { tone: "orange", tinted: true });
    var st = [
      { t: "정책 π_θ(a|s)", s: "4 → 32 → 2 softmax", tone: "orange" },
      { t: "에피소드 수집", s: "s₀,a₀,r₁, … ,s_T", tone: "blue" },
      { t: "returns-to-go", s: "G_t = r_t+1 + γG_t+1", tone: "purple" },
      { t: "가중치 Â_t", s: "G_t − b 또는 정규화", tone: "pink" },
      { t: "손실", s: "−Σ Â_t log π(a_t|s_t)", tone: "red" },
      { t: "Adam 한 걸음", s: "lr 0.005", tone: "orange" }
    ];
    var bw = 172, gap = 33, x0 = 62, bx = [];
    st.forEach(function (s, i) {
      bx.push(k.box(x0 + i * (bw + gap), 196, bw, 64, { tone: s.tone, title: s.t, sub: s.s, size: 14.5, subSize: 12 }));
      if (i) k.arrow(x0 + i * (bw + gap) - gap + 3, 228, x0 + i * (bw + gap) - 3, 228, { tone: "gray", width: 1.6, headSize: 7 });
    });
    k.arrow(bx[5].cx, 262, bx[0].cx, 262, { tone: "orange", via: [[bx[5].cx, 298], [bx[0].cx, 298]], dash: true });
    k.text(640, 286, "갱신된 정책으로 다음 에피소드 — 매번 새 데이터 (on-policy, 재사용 불가)", { size: 12.5, weight: 700, anchor: "middle", tone: "orange" });

    k.section(40, 350, "② 크레딧 할당 — 보상은 매 걸음 +1, 넘어지게 만든 행동은?", { tone: "purple" });
    k.panel(40, 364, 640, 248, { tone: "purple", tinted: true });
    k.text(60, 392, "5걸음 만에 넘어진 에피소드 · γ = 0.9", { size: 13.5, weight: 800, color: "ink" });
    k.table(60, 404, [80, 90, 120, 120, 200], [
      ["t", "r_t+1", "R(τ) = G₀", "G_t", "정규화 (G_t − 2.629)/1.095"],
      ["0", "1", "4.095", "4.095", { t: "+1.339", tone: "blue" }],
      ["1", "1", "4.095", "3.439", { t: "+0.740", tone: "blue" }],
      ["2", "1", "4.095", "2.710", { t: "+0.074", tone: "blue" }],
      ["3", "1", "4.095", "1.900", { t: "−0.665", tone: "red" }],
      ["4", "1", "4.095", "1.000", { t: "−1.487", tone: "red" }]
    ], { rh: 25, size: 12.5 });
    k.bullets(60, 572, 600, [
      { t: "R(τ) 전체: 모든 행동이 같은 몫 → 무엇이 잘했는지 구분 못 함", tone: "gray" },
      { t: "G_t + 정규화: 마지막 행동은 음수 → 넘어지게 만든 행동 확률 ↓", tone: "purple" }
    ], { size: 12.5, lh: 19 });

    k.section(704, 350, "③ PyTorch 핵심 코드", { tone: "gray" });
    k.code(704, 364, 536, 248, [
      "dist = Categorical(logits=policy(s))",
      "a = dist.sample();  logps.append(dist.log_prob(a))",
      "...                              # 에피소드 끝까지",
      "G, returns = 0.0, []",
      "for r in reversed(rewards):      # returns-to-go",
      "    G = r + gamma * G",
      "    returns.insert(0, G)",
      "R = torch.tensor(returns)",
      "adv = (R - R.mean()) / (R.std() + 1e-8)   # 정규화",
      "loss = -(torch.stack(logps) * adv).sum()",
      "opt.zero_grad(); loss.backward(); opt.step()"
    ], { size: 12.5 });

    k.section(40, 642, "④ 성질");
    k.note(40, 654, 390, 46, { tone: "green", title: "편향 없음 (Unbiased)", body: "실제 리턴 G_t 사용 — 가치 추정 오차 없음", bodySize: 12 });
    k.note(445, 654, 390, 46, { tone: "red", title: "분산이 큼 · 표본 효율 낮음", body: "한 에피소드 운에 따라 기울기가 크게 흔들림", bodySize: 12 });
    k.note(850, 654, 390, 46, { tone: "amber", title: "브라우저 기본 설정 결과", body: "seed 1~3 모두 400~500 에피소드 안에 500걸음", bodySize: 12 });
  }
});

DSDiagram.register({
  id: "reinforce-3", sim: "reinforce", order: 3,
  title: "REINFORCE (3) — baseline과 기울기 분산", short: "baseline과 분산",
  sub: "Baseline · 상태에만 의존하는 b(s)를 G_t에서 빼면 기울기의 평균은 그대로, 분산만 줄어든다 → Advantage · Actor-Critic으로",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 왜 평균이 그대로인가", { tone: "pink" });
    k.panel(40, 166, 560, 196, { tone: "pink", tinted: true });
    k.formula(60, 184, 520, 40, "E_a∼π[ ∇log π(a|s)·b(s) ] = b(s)·∇Σ_a π(a|s) = b(s)·∇1 = **0**", { size: 14.5 });
    k.text(60, 252, "3개 행동 예 (π = [0.6285, 0.2312, 0.1402]):", { size: 13, weight: 700, color: "ink" });
    k.text(60, 276, "0.6285·[0.3715, −0.2312, −0.1402]", { size: 12.5, mono: true, color: "muted" });
    k.text(60, 296, "+ 0.2312·[−0.6285, 0.7688, −0.1402] + 0.1402·[−0.6285, −0.2312, 0.8598]", { size: 12, mono: true, color: "muted" });
    k.text(60, 320, "= [0.0000, 0.0000, 0.0000]", { size: 13.5, mono: true, weight: 700, tone: "pink" });
    k.text(60, 346, "→ 어떤 b를 빼도 E[g] = ∇J = [−0.1013, 0.1940, −0.0927] 그대로", { size: 12.5, weight: 700, color: "ink" });

    k.section(624, 152, "② 정확한 분산 — 한 번 뽑은 g = (r − b)·∇log π(a)", { tone: "purple" });
    k.panel(624, 166, 616, 196, { tone: "purple", tinted: true });
    k.bars(660, 190, 300, 150, [1.0481, 0.1834, 0.1758], { labels: ["b = 0", "b = E[r] = 1.161", "b* = 1.281"], tones: ["red", "amber", "purple"], fmt: function (v) { return v.toFixed(4); }, barW: 70, gap: 22, size: 12.5 });
    k.text(984, 200, "tr Var[g] =", { size: 13, weight: 800, color: "ink" });
    k.text(984, 222, "Σ π(a)·(μ(a) − b)²·‖∇log π(a)‖²", { size: 12, mono: true, color: "muted" }); k.text(984, 240, "  − ‖∇J‖²", { size: 12, mono: true, color: "muted" });
    k.text(984, 266, "E[r]를 빼면 **82.5% 감소**", { size: 13.5, tone: "amber", weight: 700 });
    k.text(984, 290, "최적 b* = Σπμ‖∇logπ‖² / Σπ‖∇logπ‖²", { size: 12, mono: true, color: "muted" });
    k.text(984, 312, "→ 분산 최소 0.1758", { size: 13, tone: "purple", weight: 700 });
    k.text(984, 340, "기울기 방향(평균)은 세 경우 모두 같음", { size: 12, color: "muted" });

    k.section(40, 396, "③ baseline 종류와 CartPole 측정 (시뮬레이터 4번 탭 기본 실행: seed 1~3 · 250 에피소드)", { tone: "orange" });
    k.table(40, 410, [210, 330, 160, 180, 320], [
      ["baseline", "Â_t", "전체 평균 보상", "기울기 분산", "특징"],
      [{ t: "없음", tone: "red" }, "G_t", "187.3", "× 1.00", "보상이 모두 +1 → 모든 행동 강화"],
      [{ t: "평균 리턴", tone: "amber" }, "G_t − b̄ (지난 에피소드 이동평균)", "316.4", "× 0.27", "가장 단순, 상수라 상태 차이 무시"],
      [{ t: "학습된 V(s)", tone: "purple" }, "G_t − V_φ(s_t) · (V − G_t)² 학습", "274.4", "× 0.26", "상태별 기대치 → Advantage 추정"],
      [{ t: "정규화", tone: "blue" }, "(G_t − 평균)/표준편차 (배치 안)", "–", "–", "스케일까지 맞춤 · 3번 탭 기본값"]
    ], { rh: 30, size: 13 });
    k.text(40, 580, "기울기 분산 = 같은 정책·같은 16개 에피소드에 세 추정량을 적용해 잰 tr Cov(g)의 (없음 대비) 비. CartPole 상태에는 '남은 시간'이 없어 V(s)와 상수 baseline의 차이는 작다.", { size: 12.5, color: "muted" });

    k.section(40, 622, "④ 다음 단계 — G_t 대신 추정치로", { tone: "teal" });
    k.flow(40, 640, [
      { t: "REINFORCE", s: "Â = G_t (MC)", tone: "orange" },
      { t: "+ baseline", s: "Â = G_t − V(s)", tone: "purple" },
      { t: "Actor-Critic", s: "Â = r + γV(s′) − V(s)", tone: "pink" },
      { t: "GAE(λ)", s: "δ의 (γλ)ˡ 가중합", tone: "teal" }
    ], { h: 52, size: 14 });
  }
});
