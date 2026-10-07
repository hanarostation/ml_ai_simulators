/* DQN — 알고리즘 구성도 (강화학습 · Deep Q-Network: Q 근사와 학습 루프 / 경험 재생·타깃망 / Atari 확장) */
DSDiagram.register({
  id: "dqn-1", sim: "dqn", order: 1,
  title: "DQN (1) — 신경망으로 Q를 근사하다", short: "Q 근사와 학습 루프",
  sub: "Deep Q-Network · 연속 상태를 표 대신 신경망 Q(s,·;θ)로 받아 행동별 Q값을 한 번에 출력하고, 경험 재생과 타깃망으로 안정적으로 학습",
  label: "Reinforcement Learning",
  draw: function (k) {
    /* ① Q표 → Q망 */
    k.section(40, 152, "① Q표 → Q망 — 연속 상태는 표에 담을 수 없다");
    k.panel(40, 166, 580, 262, { tone: "purple", tinted: true });
    k.text(64, 196, "Q표 (격자 환경)", { size: 14, weight: 800, color: "ink" });
    k.matrix(110, 232, [[0.12, 0.31], [0.45, 0.27], [0.08, 0.52], ["⋮", "⋮"]], { cw: 58, ch: 30, size: 13, rows: ["s = 0", "s = 1", "s = 2", ""], cols: ["← 0", "→ 1"],
      tones: function (i, j, v) { return typeof v === "number" ? "purple" : null; }, fills: function (i, j, v) { return typeof v === "number" && ((i === 1 && j === 0) || (i !== 1 && j === 1)) ? "mid" : "plain"; } });
    k.text(168, 378, "상태 번호 × 행동 칸", { size: 12.5, weight: 700, anchor: "middle", color: "ink" });
    k.text(168, 396, "칸 하나씩 갱신", { size: 11.5, anchor: "middle", color: "muted" });
    k.arrow(238, 296, 286, 296, { tone: "gray", label: "연속값", labelSize: 12 });
    /* 작은 신경망 */
    var L = [{ x: 330, ys: [228, 268, 308, 348] }, { x: 400, ys: [218, 253, 288, 323, 358] }, { x: 470, ys: [218, 253, 288, 323, 358] }, { x: 540, ys: [263, 313] }], d = "";
    for (var l = 0; l < 3; l++) L[l].ys.forEach(function (y1) { L[l + 1].ys.forEach(function (y2) { d += "M" + (L[l].x + 9) + " " + y1 + " L" + (L[l + 1].x - 9) + " " + y2 + " "; }); });
    k.path(d, { tone: "gray", width: 0.8, opacity: 0.55 });
    ["x", "ẋ", "θ", "θ̇"].forEach(function (t, i) { k.circle(330, L[0].ys[i], 9, { tone: "blue", fill: "tone" }); k.text(314, L[0].ys[i] + 5, t, { size: 13, weight: 700, anchor: "end", tone: "blue" }); });
    [1, 2].forEach(function (l) { L[l].ys.forEach(function (y) { k.circle(L[l].x, y, 9, { tone: "gray", fill: "tone" }); }); k.text(L[l].x, 390, "32", { size: 12.5, weight: 700, anchor: "middle", color: "muted" }); });
    ["Q(s,←)", "Q(s,→)"].forEach(function (t, i) { k.circle(540, L[3].ys[i], 10, { tone: "purple", fill: "solid" }); k.text(555, L[3].ys[i] + 5, t, { size: 12, weight: 700, tone: "purple" }); });
    k.text(330, 390, "상태 4", { size: 12.5, weight: 700, anchor: "middle", tone: "blue" });
    k.text(540, 390, "행동 2", { size: 12.5, weight: 700, anchor: "middle", tone: "purple" });
    k.text(424, 414, "4 → 32 → 32 → 2 · ReLU · 파라미터 160 + 1,056 + 66 = **1,282**", { size: 11.5, anchor: "middle", color: "ink" });

    /* ② 학습 루프 */
    k.section(650, 152, "② 학습 루프 — 행동하고, 저장하고, 뽑아서 배운다", { tone: "orange" });
    k.panel(650, 166, 590, 262, { tone: "orange", tinted: true });
    var env = k.box(668, 258, 112, 58, { tone: "blue", fill: "plain", title: "환경", sub: "CartPole", size: 15 });
    var q = k.box(808, 186, 144, 52, { tone: "purple", title: "Q망 θ", sub: "Q(s,·;θ)", size: 14.5 });
    var eg = k.box(808, 336, 144, 52, { tone: "amber", title: "ε-greedy", sub: "확률 ε로 무작위", size: 14.5 });
    var buf = k.box(972, 336, 116, 52, { tone: "blue", title: "버퍼 D", sub: "무작위 64개", size: 14.5 });
    var tg = k.box(1106, 186, 120, 52, { tone: "pink", title: "타깃망 θ⁻", sub: "y 계산", size: 14.5 });
    var ls = k.box(1106, 336, 120, 52, { tone: "red", title: "Huber 손실", sub: "→ Adam: θ 갱신", size: 14.5 });
    k.arrow(724, 258, 804, 212, { tone: "blue", via: [[724, 212]] }); k.text(736, 204, "s", { size: 13, weight: 800, tone: "blue" });
    k.link(q.b, eg.t, { tone: "purple" }); k.text(890, 292, "Q값", { size: 12.5, weight: 700, tone: "purple" });
    k.arrow(808, 362, 724, 320, { tone: "orange", via: [[724, 362]] }); k.text(764, 378, "a", { size: 13, weight: 800, tone: "orange" });
    k.arrow(696, 316, 1030, 392, { tone: "green", via: [[696, 406], [1030, 406]] }); k.text(860, 422, "전이 (s, a, r, s′, done) 저장", { size: 12, weight: 700, anchor: "middle", tone: "green" });
    k.arrow(1030, 336, 1102, 224, { tone: "blue", via: [[1030, 224]] }); k.text(1040, 290, "s′", { size: 13, weight: 800, tone: "blue" });
    k.link(buf.r, ls.l, { tone: "blue" });
    k.link(tg.b, ls.t, { tone: "pink" }); k.text(1176, 292, "y", { size: 13, weight: 800, tone: "pink" });
    k.arrow(952, 200, 1102, 200, { tone: "pink", dash: true }); k.text(1027, 192, "C걸음마다 θ⁻ ← θ", { size: 11.5, weight: 700, anchor: "middle", tone: "pink" });

    /* ③ 전이 하나의 계산 */
    k.section(40, 466, "③ 전이 하나의 계산 — 타깃 y, TD 오차, Huber 손실 (예시 숫자)", { tone: "red" });
    k.panel(40, 480, 1200, 146, { tone: "red", tinted: true });
    k.formula(60, 496, 800, 38, "y = r + γ · max**ₐ′** Q(s′, a′; θ⁻) · (1 − done)   ,   δ = Q(s, a; θ) − y", { size: 16 });
    k.lines(64, 560, [
      "r = 1, γ = 0.99, Q(s′,·;θ⁻) = [12.40, 13.10]  →  y = 1 + 0.99 × 13.10 = **13.969**",
      "Q(s, a; θ) = 13.50  →  δ = 13.50 − 13.969 = **−0.469**  →  Huber = ½ × 0.469² = **0.110**   (|δ| ≤ 1 이면 ½δ², 크면 |δ| − ½)",
      "막대가 쓰러진 전이(done)면 y = r = 1 — 다음 상태 가치가 없다는 이 정보가 Q값의 바닥을 잡아 준다"
    ], { size: 13.5, lh: 22 });
    /* Huber vs 제곱 */
    var ax = 900, ay = 496, aw = 320, ah = 112, cx0 = ax + aw / 2, sx = 50, sy = 30;
    k.axes(ax, ay, aw, ah);
    var hub = "", mse = "";
    for (var i = 0; i <= 60; i++) { var dd = -3 + 6 * i / 60, h = Math.abs(dd) <= 1 ? 0.5 * dd * dd : Math.abs(dd) - 0.5, m = 0.5 * dd * dd;
      hub += (i ? "L" : "M") + (cx0 + dd * sx).toFixed(1) + " " + (ay + ah - h * sy).toFixed(1) + " ";
      if (m * sy <= ah - 4) mse += (mse ? "L" : "M") + (cx0 + dd * sx).toFixed(1) + " " + (ay + ah - m * sy).toFixed(1) + " "; }
    k.path(mse, { tone: "gray", width: 1.6, dash: "4 3" });
    k.path(hub, { tone: "red", width: 2.6 });
    k.text(cx0, ay + 14, "Huber (실선)", { size: 12, weight: 800, anchor: "middle", tone: "red" });
    k.text(cx0, ay + 30, "½δ² (점선)", { size: 11.5, anchor: "middle", color: "muted" });
    k.text(ax + aw, ay + ah + 16, "δ", { size: 12, anchor: "end", color: "muted" });
    k.text(cx0, ay + ah + 16, "0", { size: 11.5, anchor: "middle", color: "muted" });

    k.flow(40, 648, [
      { t: "관측 s", tone: "blue" }, { t: "ε-greedy로 a", tone: "amber" }, { t: "환경 step", tone: "blue" }, { t: "D에 저장", tone: "green" },
      { t: "미니배치 64", tone: "blue" }, { t: "y 계산 (θ⁻)", tone: "pink" }, { t: "Huber → Adam", tone: "red" }, { t: "C걸음마다 복사", tone: "pink", fill: "plain" }
    ], { label: "한 걸음의 흐름", h: 40, gap: 18, size: 12.5 });
  }
});

DSDiagram.register({
  id: "dqn-2", sim: "dqn", order: 2,
  title: "DQN (2) — 경험 재생과 타깃망이 필요한 이유", short: "리플레이·타깃망",
  sub: "연속한 표본의 상관과 함께 움직이는 정답(타깃)이 학습을 무너뜨린다 — 시뮬레이터 기본값(seed 1 · 15,000걸음)으로 하나씩 빼 본 결과",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 두 가지 불안정 요인과 처방");
    var P = [
      { x: 40, tone: "blue", title: "Experience Replay — 상관 끊기 · 다시 쓰기", right: "데이터 쪽 처방",
        prob: "연속한 전이는 0.02초 차이라 거의 같은 상태 → 경사하강이 한 방향으로 끌려감, 한 번 쓰고 버림",
        fix: "버퍼 D(50,000개)에 쌓고 매번 무작위 64개를 뽑아 갱신",
        eff: "표본이 독립에 가까워지고, 같은 경험을 여러 번 학습에 사용",
        num: "막대 각도 θ의 이웃 표본 상관: 연속 64개 **0.997** → 무작위 64개 **−0.188**" },
      { x: 645, tone: "pink", title: "Target Network — 움직이는 과녁 고정", right: "정답 쪽 처방",
        prob: "y = r + γ·max Q(s′;θ)를 학습 중인 망으로 계산 → Q(s,a)를 올리면 비슷한 s′의 Q도 올라 y가 함께 도망",
        fix: "타깃망 θ⁻를 따로 두고 C = 1,000걸음 동안 고정한 뒤 θ⁻ ← θ 복사",
        eff: "그동안은 정답이 고정된 회귀 문제처럼 안정적으로 학습",
        num: "타깃망 없음: 1,500걸음 만에 max Q(s₀) = **471.8** > 이론 상한 **99.3**" }
    ];
    P.forEach(function (p) {
      k.panel(p.x, 166, 595, 270, { tone: p.tone, head: "solid", title: p.title, right: p.right, tinted: true });
      [["문제", p.prob, "red"], ["처방", p.fix, p.tone], ["효과", p.eff, "green"]].forEach(function (r, i) {
        var y = 216 + i * 58;
        k.box(p.x + 18, y, 64, 46, { tone: r[2], fill: "solid", title: r[0], size: 14, r: 8 });
        k.para(p.x + 96, y + 19, 440, r[1], { size: 13, color: "ink", lh: 19 });
      });
      k.note(p.x + 18, 390, 559, 34, { tone: p.tone, title: p.num, size: 13 });
    });

    k.section(40, 474, "② 같은 seed로 빼 보기 — 시뮬레이터 기본값 (seed 1 · 15,000걸음 · 은닉 32·32)", { tone: "orange" });
    k.table(40, 490, [214, 150, 108, 150, 128, 140], [
      ["설정", "리플레이", "타깃망", "후반 1/3 평균 수익", "최고 (10회 평균)", "최종 max Q(s₀)"],
      [{ t: "전체 DQN", tone: "blue" }, "버퍼 · 배치 64", "C = 1,000", { t: "495.8", mono: true, weight: 700 }, { t: "500.0", mono: true }, { t: "14.1", mono: true }],
      [{ t: "타깃망 없음", tone: "red" }, "버퍼 · 배치 64", "없음", { t: "9.6", mono: true }, { t: "31.0", mono: true }, { t: "978,104", mono: true, tone: "red" }],
      [{ t: "리플레이 없음", tone: "orange" }, "전이 1개", "C = 1,000", { t: "54.6", mono: true }, { t: "193.1", mono: true }, { t: "15.5", mono: true }],
      [{ t: "둘 다 없음", tone: "gray" }, "전이 1개", "없음", { t: "9.7", mono: true }, { t: "31.0", mono: true }, { t: "1,618,564", mono: true, tone: "red" }]
    ], { rh: 31, size: 13.5 });
    k.text(40, 676, "판정: 전체 DQN = 학습 성공 · 리플레이 없음 = 불안정(올랐다 무너짐) · 타깃망 없음 / 둘 다 없음 = Q 발산(이론 상한 Σγᵗ ≈ 99.3을 크게 넘음)", { size: 12.5, color: "muted" });
    k.text(40, 696, "수익 = 막대를 세운 걸음 수(최대 500) · Q(s₀) = 똑바로 선 상태 (0,0,0,0)의 max Q · Chrome 기준 값(브라우저에 따라 조금 다를 수 있음)", { size: 12, color: "muted" });
    k.text(1240, 506, "후반 1/3 평균 수익", { size: 13, weight: 800, anchor: "end", color: "ink" });
    k.bars(960, 520, 280, 132, [495.8, 9.6, 54.6, 9.7], { max: 500, tones: ["blue", "red", "orange", "gray"], labels: ["전체", "타깃망×", "리플레이×", "둘 다×"], fmt: function (v) { return v.toFixed(1); }, gap: 16 });
  }
});

DSDiagram.register({
  id: "dqn-3", sim: "dqn", order: 3,
  title: "DQN (3) — Atari로 확장: Nature DQN", short: "Atari 확장",
  sub: "Mnih et al., 2015 · 게임 화면 픽셀을 그대로 입력받아 49개 게임을 같은 구조 · 같은 하이퍼파라미터로 학습 (알고리즘은 CartPole과 동일)",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 전처리 — 210×160 RGB 화면을 84×84×4 텐서로");
    k.flow(40, 170, [
      { t: "원본 프레임", s: "210 × 160 × 3", tone: "gray", fill: "plain" },
      { t: "프레임 반복 4", s: "같은 행동 4번 · 보상 합", tone: "orange" },
      { t: "두 프레임 max", s: "깜빡임 제거", tone: "blue" },
      { t: "밝기 Y · 축소", s: "84 × 84", tone: "blue" },
      { t: "최근 4장 쌓기", s: "84 × 84 × 4 · 속도 정보", tone: "blue", fill: "mid" },
      { t: "보상 자르기", s: "+ → +1 · − → −1 · 0", tone: "green" }
    ], { h: 50, gap: 22, size: 14 });

    k.section(40, 270, "② Nature DQN 구조 — 합성곱 3층 + 완전연결 2층 (패딩 없음)", { tone: "purple" });
    k.panel(40, 284, 1200, 176, { tone: "purple", tinted: true });
    var B = [
      { t: "입력", s: "4장 쌓은 화면", sh: "84×84×4", p: "–", tone: "blue", fill: "plain" },
      { t: "Conv1", s: "32 · 8×8 · 보폭 4 · ReLU", sh: "20×20×32", p: "8,224", tone: "blue" },
      { t: "Conv2", s: "64 · 4×4 · 보폭 2 · ReLU", sh: "9×9×64", p: "32,832", tone: "blue" },
      { t: "Conv3", s: "64 · 3×3 · 보폭 1 · ReLU", sh: "7×7×64", p: "36,928", tone: "blue" },
      { t: "FC", s: "3,136 → 512 · ReLU", sh: "512", p: "1,606,144", tone: "purple" },
      { t: "출력", s: "선형 · 행동마다 Q", sh: "18", p: "9,234", tone: "purple", fill: "solid" }
    ];
    var bw = 164, gap = 32, x0 = 64;
    B.forEach(function (b, i) {
      var x = x0 + i * (bw + gap);
      k.box(x, 302, bw, 64, { tone: b.tone, fill: b.fill || "tone", title: b.t, sub: b.s, size: 16, subSize: 11.5 });
      k.text(x + bw / 2, 390, b.sh, { size: 15, weight: 800, anchor: "middle", tone: "blue", mono: true });
      k.text(x + bw / 2, 410, "파라미터 " + b.p, { size: 12, anchor: "middle", color: "muted" });
      if (i) k.arrow(x - gap + 4, 334, x - 4, 334, { tone: "gray" });
    });
    k.text(64, 442, "출력 크기 = ⌊(입력 − 필터)/보폭⌋ + 1 : 84 → ⌊76/4⌋+1 = 20 → ⌊16/2⌋+1 = 9 → ⌊6/1⌋+1 = 7  ·  7×7×64 = 3,136  ·  전체 **1,693,362**개 (행동 18개 기준)", { size: 13, color: "ink" });

    k.section(40, 494, "③ 하이퍼파라미터 — 49개 게임 공통 (Extended Data Table 1)", { tone: "orange" });
    k.table(40, 508, [178, 150, 160, 222], [
      ["항목", "값", "항목", "값"],
      ["리플레이 버퍼", { t: "1,000,000", mono: true }, "타깃망 갱신", { t: "10,000번 갱신마다", mono: true }],
      ["미니배치", { t: "32", mono: true }, "갱신 빈도", { t: "4행동마다 1번", mono: true }],
      ["할인율 γ", { t: "0.99", mono: true }, "ε", { t: "1.0 → 0.1 (100만 프레임)", mono: true }],
      ["학습률 (RMSProp)", { t: "0.00025", mono: true }, "학습 전 무작위", { t: "50,000", mono: true }],
      ["프레임 반복 / 쌓기", { t: "4 / 4", mono: true }, "전체 학습", { t: "5,000만 프레임", mono: true }]
    ], { rh: 31, size: 13 });
    k.note(780, 506, 460, 60, { tone: "purple", title: "알고리즘은 CartPole과 같다", body: "경험 재생 + 타깃망 + ε-greedy + 오차 자르기 그대로, 입력과 망만 바뀜" });
    k.note(780, 572, 460, 60, { tone: "green", title: "보상 자르기의 득과 실", body: "점수 단위를 ±1로 통일해 한 학습률로 학습 · 대신 보상 크기는 구분 못 함" });
    k.note(780, 638, 460, 60, { tone: "red", title: "오차 자르기 = Huber 손실", body: "TD 오차 기울기를 [−1, 1]로 잘라 드문 큰 오차가 망을 흔들지 않음" });
  }
});
