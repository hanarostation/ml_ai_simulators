/* Model-based RL — 알고리즘 구성도 (Dyna-Q · 모형 오차 · World Models/Dreamer · MuZero)
   숫자: 시뮬레이터 기본 설정의 결과 (Dyna 미로 10회 평균, 지름길 미로 10회 평균, FrozenLake 모형 30개 평균)와 손계산 예제 */
(function () {
  var LBL = "Reinforcement Learning";

  DSDiagram.register({
    id: "model-based-rl-1", sim: "model-based-rl", order: 1,
    title: "모형 기반 RL (1) — Dyna-Q: 경험 · 모형 · 계획", short: "Dyna-Q",
    sub: "실제 한 걸음으로 Q를 갱신하고, 같은 경험을 모형 표에 적어 두었다가 상상 속에서 n번 다시 꺼내 쓴다",
    label: LBL,
    draw: function (k) {
      k.section(40, 152, "① Dyna 구조 — 경험 하나를 두 번 쓴다");
      k.panel(40, 166, 600, 300, { tone: "blue", tinted: true });
      var q = k.box(250, 184, 180, 58, { tone: "purple", title: "가치 · 정책 Q", sub: "π = ε-greedy(Q)", size: 15 });
      var ex = k.box(64, 300, 170, 58, { tone: "blue", title: "실제 경험", sub: "(s, a, r, s′)", size: 15 });
      var md = k.box(446, 300, 170, 58, { tone: "teal", title: "모형 Model(s,a)", sub: "→ (r, s′) 표", size: 15 });
      var env = k.box(250, 396, 180, 50, { tone: "gray", fill: "soft", title: "환경 (미로)", size: 14.5 });
      k.arrow(150, 298, 248, 222, { tone: "blue", label: "① 직접 RL", labelDx: -40 });
      k.link(ex.r, md.l, { tone: "teal", label: "② 모형 학습" });
      k.arrow(530, 298, 432, 222, { tone: "pink", dash: true, label: "③ 계획 × n", labelDx: 40 });
      k.arrow(340, 244, 340, 394, { tone: "orange", label: "행동 a", labelDx: 30, labelDy: 46 });
      k.arrow(250, 421, 150, 360, { tone: "gray", curve: -12 });
      k.text(64, 452, "계획 = 모형이 만든 상상 경험으로 같은 Q-learning 갱신을 반복", { size: 12, color: "muted" });

      k.section(660, 152, "② 한 걸음의 계산 (γ = 0.95, α = 0.1)", { tone: "purple" });
      k.panel(660, 166, 580, 300, { tone: "purple", tinted: true });
      k.table(676, 178, [44, 180, 324], [
        ["", "단계", "식 · 숫자 예"],
        ["a", "ε-greedy로 행동", "s에서 a 선택 (ε = 0.1)"],
        ["b", "실제로 한 걸음", "목표 앞 칸에서 → : r = 1, 끝"],
        [{ t: "c", tone: "blue" }, "직접 RL", "Q ← 0 + 0.1(1 + 0 − 0) = **0.1**"],
        [{ t: "d", tone: "teal" }, "모형 학습", "Model(s, →) ← (1, 목표)"],
        [{ t: "e", tone: "pink" }, "계획 n번 (무작위 (s,a))", "앞 칸: 0.1(0 + 0.95×0.1) = **0.0095**"],
        ["f", "s ← s′", "에피소드 끝이면 처음으로"]
      ], { rh: 34, size: 12.5 });
      k.text(676, 432, "e의 계획 덕분에 보상이 한 에피소드에 여러 칸 뒤로 퍼진다 (n = 0이면 한 칸)", { size: 12, color: "ink" });
      k.text(676, 452, "모형 표는 결정적: 같은 (s, a)를 다시 하면 마지막 결과로 덮어씀", { size: 11.5, color: "muted" });

      k.section(40, 500, "③ 미로 실험 (그림 8.2) — 에피소드별 걸음 수, 10회 평균 · 최단 14걸음", { tone: "orange" });
      k.panel(40, 514, 760, 136, { tone: "orange", tinted: true });
      k.table(56, 524, [200, 100, 100, 100, 100, 110], [
        ["계획 단계 n", "1번째", "2번째", "3번째", "10번째", "50번째"],
        [{ t: "0 (Q-learning)", tone: "gray" }, { t: "726", mono: true }, { t: "1008", mono: true }, { t: "607", mono: true }, { t: "125", mono: true }, { t: "17.3", mono: true }],
        [{ t: "5", tone: "blue" }, { t: "650", mono: true }, { t: "182", mono: true }, { t: "36.9", mono: true }, { t: "16.4", mono: true }, { t: "16.6", mono: true }],
        [{ t: "50", tone: "pink" }, { t: "653", mono: true }, { t: "44.8", mono: true }, { t: "16.7", mono: true }, { t: "16.8", mono: true }, { t: "16.9", mono: true }]
      ], { rh: 29, size: 13 });
      k.note(820, 514, 420, 64, { tone: "orange", title: "첫 에피소드는 모두 비슷", body: "목표를 찾기 전에는 모든 보상이 0이라 계획할 거리가 없음" });
      k.note(820, 586, 420, 64, { tone: "pink", title: "n = 50은 3번째 에피소드에 거의 최단", body: "같은 실제 경험으로 더 많이 배움 = 표본 효율" });

      k.flow(40, 664, [{ t: "실제 경험", tone: "blue" }, { t: "모형 학습", tone: "teal" }, { t: "상상 경험 n개", tone: "pink" }, { t: "Q 갱신 · 정책", tone: "purple" }], { label: "Dyna", h: 34 });
    }
  });

  DSDiagram.register({
    id: "model-based-rl-2", sim: "model-based-rl", order: 2,
    title: "모형 기반 RL (2) — 학습된 모형이 틀릴 때", short: "모형 오차와 위험",
    sub: "계획은 모형만큼만 좋다 — 바뀐 환경, 적은 표본, 본 적 없는 영역에서 모형을 믿으면 생기는 일",
    label: LBL,
    draw: function (k) {
      k.section(40, 152, "① 환경이 바뀌면 — Dyna-Q vs Dyna-Q+", { tone: "red" });
      k.panel(40, 166, 600, 300, { tone: "red", tinted: true });
      k.table(56, 180, [170, 140, 120, 140], [
        ["미로 (바뀌는 시점)", "방법 (n=10, 10회)", "바뀌기 전", "끝날 때 누적"],
        ["지름길 열림 (3000)", "Dyna-Q", { t: "122.0", mono: true }, { t: "286.7", mono: true }],
        ["", { t: "Dyna-Q+", tone: "pink" }, { t: "123.0", mono: true }, { t: "343.6", mono: true, tone: "pink" }],
        ["길 막힘 (1000)", "Dyna-Q", { t: "26.8", mono: true }, { t: "54.1", mono: true }],
        ["", { t: "Dyna-Q+", tone: "pink" }, { t: "57.3", mono: true }, { t: "136.3", mono: true, tone: "pink" }]
      ], { rh: 30, size: 13 });
      k.text(56, 348, "지름길 뒤 3000걸음 보상: Dyna-Q 164.7 (목표당 18.2걸음) · Dyna-Q+ **220.6** (13.6걸음)", { size: 12.5, color: "ink" });
      k.formula(56, 362, 568, 32, "Dyna-Q+ 계획 보상 = r + **κ√τ**   (τ: 마지막 시도 뒤 지난 걸음, κ = 0.001)", { size: 13 });
      k.bullets(56, 420, 568, [
        { t: "새 지름길은 가 보지 않으면 모형 표에 영영 나타나지 않음", tone: "red" },
        { t: "오래 안 해 본 행동에 보너스 → 다시 시도 → 모형이 새 길을 배움", tone: "pink" }
      ], { size: 12.5, lh: 20 });

      k.section(660, 152, "② 표본이 적은 모형 — 계획기의 지나친 자신감", { tone: "purple" });
      k.panel(660, 166, 580, 300, { tone: "purple", tinted: true });
      k.text(676, 192, "FrozenLake 4×4 (미끄러움) · γ = 0.99 · 모형 30개 평균 · 최적 V*(시작) = 0.5420", { size: 12, color: "muted" });
      k.table(676, 202, [150, 190, 200], [
        ["(s, a)당 표본 k", "모형 속 믿음 V̂(시작)", "그 정책의 실제 가치"],
        [{ t: "1", mono: true }, { t: "0.254", mono: true }, { t: "0.024", mono: true }],
        [{ t: "3", mono: true }, { t: "0.630", mono: true, tone: "pink" }, { t: "0.107", mono: true, tone: "blue" }],
        [{ t: "10", mono: true }, { t: "0.573", mono: true }, { t: "0.409", mono: true }],
        [{ t: "100", mono: true }, { t: "0.552", mono: true }, { t: "0.542", mono: true }]
      ], { rh: 30, size: 13 });
      k.note(676, 366, 548, 84, { tone: "purple", title: "모형 착취 (model exploitation)", body: "우연히 구멍에 안 빠졌던 칸을 '안전한 길'로 믿고 정책을 그쪽으로 몰아감. 표본이 적을수록 믿음(0.630)은 부풀고 실제(0.107)는 낮음" });

      k.section(40, 500, "③ 굴릴수록 커지는 오차 (compounding error)", { tone: "orange" });
      k.panel(40, 514, 600, 136, { tone: "orange", tinted: true });
      var xs = [70, 190, 310, 430, 550];
      xs.forEach(function (x, i) {
        k.circle(x, 548, 15, { tone: "blue", fill: "plain", label: "s" + i, size: 12 });
        if (i) k.circle(x, 560 + i * 7, 6, { tone: "pink", fill: "solid" });
        if (i < 4) k.arrow(x + 18, 548, xs[i + 1] - 18, 548, { tone: "gray", width: 1.4, headSize: 6 });
      });
      k.text(320, 612, "파랑 = 실제 · 분홍 = 모형이 자기 예측을 입력으로 다시 쓴 상상 → 멀어질수록 벌어짐", { size: 12, anchor: "middle", color: "muted" });
      k.text(320, 634, "본 적 없는 영역(예: 진자를 아래쪽만 보고 배움)으로 나가면 오차가 급격히 커짐", { size: 12, anchor: "middle", color: "ink" });

      k.section(660, 500, "④ 대책", { tone: "green" });
      k.panel(660, 514, 580, 136, { tone: "green", tinted: true });
      k.table(676, 522, [180, 368], [
        ["방법", "아이디어"],
        ["앙상블 · 불확실성", "모형 여럿의 불일치가 큰 곳은 믿지 않음 (PETS)"],
        ["짧은 상상 (MBPO)", "실제 상태에서 출발해 몇 걸음만 굴림"],
        ["다시 계획 (MPC)", "매 걸음 실제 상태로 계획을 새로 세움"]
      ], { rh: 30, size: 12.5 });

      k.flow(40, 664, [{ t: "모형이 틀림", tone: "red" }, { t: "계획기가 그 틈을 이용", tone: "purple" }, { t: "실제 성과 하락", tone: "orange" }, { t: "탐험·불확실성·짧은 상상", tone: "green" }], { label: "위험", h: 34 });
    }
  });

  DSDiagram.register({
    id: "model-based-rl-3", sim: "model-based-rl", order: 3,
    title: "모형 기반 RL (3) — World Models · Dreamer", short: "World Models · Dreamer",
    sub: "영상을 잠재 상태로 압축하고, 그 잠재 공간에서 미래를 상상하며 정책을 학습한다",
    label: LBL,
    draw: function (k) {
      k.section(40, 152, "① World Models (Ha & Schmidhuber 2018) — V · M · C", { tone: "blue" });
      k.panel(40, 166, 1200, 156, { tone: "blue", tinted: true });
      var o = k.box(60, 200, 130, 76, { tone: "gray", fill: "soft", title: "화면 o_t", sub: "64 × 64 × 3", size: 14.5 });
      var v = k.box(240, 200, 190, 76, { tone: "blue", title: "V: VAE 인코더", sub: "화면 → z_t (32차원)", size: 14.5 });
      var m = k.box(480, 200, 230, 76, { tone: "teal", title: "M: MDN-RNN", sub: "LSTM 256 · 가우시안 5개 혼합", size: 14.5, lines: [{ t: "P(z_t+1 | a_t, z_t, h_t)", size: 11.5, color: "muted" }] });
      var c = k.box(760, 200, 210, 76, { tone: "orange", title: "C: 선형 컨트롤러", sub: "a_t = W[z_t ; h_t] + b", size: 14.5, lines: [{ t: "(32 + 256) × 3 + 3 = 867개", size: 11.5, color: "muted" }] });
      k.link(o.r, v.l, { tone: "gray" }); k.link(v.r, m.l, { tone: "blue", label: "z_t" }); k.link(m.r, c.l, { tone: "teal", label: "h_t" });
      k.box(1010, 200, 210, 76, { tone: "pink", fill: "plain", title: "꿈 속 훈련", sub: "M이 다음 z·보상을 대신 생성 → C를 CMA-ES로", size: 13.5 });
      k.arrow(970, 238, 1008, 238, { tone: "pink", dash: true });
      k.text(60, 306, "V는 보상과 무관하게 화면 요약만, M은 다음 요약을 예측, C는 아주 작아서 기울기 없이 진화 전략으로 찾음", { size: 12.5, color: "muted" });

      k.section(40, 356, "② Dreamer (Hafner et al.) — RSSM 세계 모형 + 상상 속 actor-critic", { tone: "pink" });
      k.panel(40, 370, 760, 280, { tone: "pink", tinted: true });
      k.text(60, 396, "세계 모형 학습 (실제 리플레이)", { size: 13.5, weight: 800, tone: "teal" });
      for (var i = 0; i < 3; i++) {
        var x = 64 + i * 160;
        k.box(x, 408, 110, 48, { tone: "teal", title: "h_" + (i + 1) + " , z_" + (i + 1), sub: "결정적 · 확률적", size: 13, subSize: 11 });
        k.box(x + 20, 476, 70, 30, { tone: "blue", fill: "plain", title: "x_" + (i + 1), size: 12.5 });
        k.arrow(x + 55, 474, x + 55, 458, { tone: "blue", width: 1.6, headSize: 6 });
        if (i < 2) k.arrow(x + 112, 432, x + 158, 432, { tone: "teal", label: "a_" + (i + 1), labelSize: 11.5 });
      }
      k.text(560, 424, "손실 = 복원 + 보상 예측", { size: 12, color: "ink" });
      k.text(560, 444, "+ KL(사후 ‖ 사전)", { size: 12, color: "ink" });
      k.text(60, 534, "상상 속 학습 (환경 없이 H = 15걸음)", { size: 13.5, weight: 800, tone: "pink" });
      for (var j = 0; j < 4; j++) {
        var xx = 64 + j * 130;
        k.box(xx, 546, 96, 44, { tone: "pink", title: "ŝ_" + j, sub: j ? "r̂ · v(ŝ)" : "출발", size: 13, subSize: 11 });
        if (j < 3) k.arrow(xx + 98, 568, xx + 128, 568, { tone: "orange", label: "π", labelSize: 11.5, dash: true });
      }
      k.text(590, 562, "critic: v → V^λ", { size: 12.5, color: "ink" });
      k.text(590, 582, "actor: V^λ를 키움", { size: 12.5, color: "ink" });
      k.formula(60, 606, 724, 32, "V^λ_t = r̂_t + γ[(1−λ)·v(ŝ_t+1) + λ·V^λ_t+1]    (λ = 0.95)", { size: 13.5, mono: true });

      k.section(820, 356, "③ λ-수익 예 (γ = 0.9, λ = 0.95)", { tone: "purple" });
      k.panel(820, 370, 420, 280, { tone: "purple", tinted: true });
      k.text(836, 396, "상상 3걸음: r̂ = 0, 0, +1(끝) · v(ŝ1) = 0.5, v(ŝ2) = 0.7", { size: 12, color: "muted" });
      k.table(836, 408, [70, 318], [
        ["t", "V^λ_t (뒤에서부터)"],
        ["2", "r̂ = 1 (끝) → **1.000**"],
        ["1", "0 + 0.9 × (0.05×0.7 + 0.95×1) = **0.8865**"],
        ["0", "0 + 0.9 × (0.05×0.5 + 0.95×0.8865) = **0.7805**"]
      ], { rh: 32, size: 12.5 });
      k.note(836, 552, 388, 82, { tone: "purple", title: "n-step · TD(λ)와 같은 식", body: "λ가 크면 상상 속 보상을, 작으면 critic을 더 믿음 (시뮬레이터는 5×5 격자 표 버전)" });

      k.flow(40, 664, [{ t: "실제 경험 수집", tone: "blue" }, { t: "세계 모형 학습", tone: "teal" }, { t: "잠재 공간 상상 H걸음", tone: "pink" }, { t: "actor · critic 갱신", tone: "purple" }], { label: "반복", h: 34 });
    }
  });

  DSDiagram.register({
    id: "model-based-rl-4", sim: "model-based-rl", order: 4,
    title: "모형 기반 RL (4) — MuZero와 MCTS", short: "MuZero · MCTS",
    sub: "규칙을 모른 채 보상·가치·정책을 맞히는 은닉 모형을 배우고, 그 위에서 pUCT 트리 탐색으로 행동을 고른다",
    label: LBL,
    draw: function (k) {
      k.section(40, 152, "① 세 함수와 펼치기 (unroll)", { tone: "teal" });
      k.panel(40, 166, 640, 236, { tone: "teal", tinted: true });
      var ob = k.box(56, 266, 84, 48, { tone: "blue", title: "o_1..t", sub: "관측", size: 13.5 });
      var h = k.box(160, 266, 60, 48, { tone: "blue", title: "h", sub: "표현", size: 14 });
      k.link(ob.r, h.l, { tone: "blue" });
      var prev = h;
      for (var i = 0; i < 3; i++) {
        var x = 248 + i * 148;
        var s = k.circle(x + 26, 290, 25, { tone: "teal", fill: "tone", label: "s" + ["⁰", "¹", "²"][i], size: 14 });
        k.arrow(prev.r[0] + 2, 290, x - 2, 290, { tone: "teal", width: 1.8 });
        k.box(x - 4, 186, 60, 44, { tone: "purple", title: "f", sub: "p, v", size: 14 });
        k.arrow(x + 26, 264, x + 26, 232, { tone: "purple", width: 1.6 });
        if (i < 2) {
          var gb = k.box(x + 70, 268, 46, 44, { tone: "teal", title: "g", size: 14 });
          k.arrow(x + 53, 290, x + 68, 290, { tone: "teal", width: 1.6 });
          k.text(x + 93, 336, "a" + ["¹", "²"][i] + " 넣고", { size: 11.5, anchor: "middle", tone: "orange", weight: 700 });
          k.text(x + 93, 354, "r" + ["¹", "²"][i] + " 나옴", { size: 11.5, anchor: "middle", tone: "green", weight: 700 });
          prev = { r: [x + 116, 290] };
        }
      }
      k.text(60, 388, "학습: K = 5걸음 펼쳐  r̂ ↔ 실제 보상 · v̂ ↔ n-step 수익 (Atari n = 10) · p̂ ↔ MCTS 방문 비율", { size: 12.5, color: "ink" });

      k.section(700, 152, "② MCTS 한 번의 시뮬레이션", { tone: "purple" });
      k.panel(700, 166, 540, 236, { tone: "purple", tinted: true });
      [["1", "선택", "뿌리에서 pUCT 점수가 가장 큰 자식으로 내려감", "orange"], ["2", "확장", "잎에서 g로 (r, s′), f로 (p, v) 한 번 계산", "teal"], ["3", "역전파", "G ← r + γG 로 올라가며 N += 1, W += G", "purple"], ["4", "행동", "여러 번 반복 후 방문 비율 π ∝ N^(1/T)로 선택", "blue"]].forEach(function (r, i) {
        var y = 182 + i * 52;
        k.circle(730, y + 20, 14, { tone: r[3], fill: "solid", label: r[0], size: 13 });
        k.box(754, y, 470, 40, { tone: r[3], fill: "plain", align: "left", title: r[1], size: 14, r: 8 });
        k.text(830, y + 25, r[2], { size: 12.5, color: "ink" });
      });

      k.section(40, 436, "③ pUCT 점수 — 숫자 예", { tone: "orange" });
      k.panel(40, 450, 640, 200, { tone: "orange", tinted: true });
      k.formula(56, 462, 608, 36, "pUCT = Q̄(s,a) + P(s,a)·√N(s)/(1+N(s,a))·[c₁ + ln((N(s)+c₂+1)/c₂)]", { size: 13, mono: true });
      k.text(56, 520, "c₁ = 1.25 · c₂ = 19652 · Q̄ = 트리 안 최소~최대로 0~1 정규화한 Q", { size: 12, color: "muted" });
      k.table(56, 530, [250, 358], [
        ["값", "계산"],
        ["N(s) = 20, N(s,a) = 4, P = 0.4", "√20 / 5 × (1.25 + ln(19673/19652)) = 1.1190"],
        ["탐험항 U", "0.4 × 1.1190 = **0.4476**"],
        ["Q̄ = 0.6 이면 점수", "0.6 + 0.4476 = **1.0476**"]
      ], { rh: 28, size: 12.5 });

      k.section(700, 436, "④ 방문 수 → 정책 (온도 T)", { tone: "blue" });
      k.panel(700, 450, 540, 200, { tone: "blue", tinted: true });
      k.table(716, 462, [130, 90, 90, 90, 90], [
        ["행동", "↑", "→", "↓", "←"],
        ["방문 N", { t: "12", mono: true }, { t: "6", mono: true }, { t: "1", mono: true }, { t: "1", mono: true }],
        ["T = 1", { t: "0.600", mono: true }, { t: "0.300", mono: true }, { t: "0.050", mono: true }, { t: "0.050", mono: true }],
        ["T = 0.5", { t: "0.791", mono: true }, { t: "0.198", mono: true }, { t: "0.005", mono: true }, { t: "0.005", mono: true }],
        ["T → 0", { t: "1", mono: true }, { t: "0", mono: true }, { t: "0", mono: true }, { t: "0", mono: true }]
      ], { rh: 28, size: 12.5 });
      k.text(716, 620, "이 π가 f의 정책 p를 학습시키는 목표 → 탐색이 정책을 키우고, 정책이 탐색을 이끈다", { size: 12, color: "ink" });
      k.text(716, 640, "AlphaZero는 규칙(g)을 알고, MuZero는 g까지 배움", { size: 12, color: "muted" });

      k.flow(40, 664, [{ t: "관측 → h", tone: "blue" }, { t: "g로 펼치기", tone: "teal" }, { t: "f로 평가", tone: "purple" }, { t: "pUCT 탐색 → 방문 정책", tone: "orange" }], { label: "MuZero", h: 34 });
    }
  });
})();
