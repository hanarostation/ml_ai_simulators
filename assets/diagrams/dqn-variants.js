/* DQN 개선판 — 알고리즘 구성도 (Double · Dueling · PER · Rainbow) */
DSDiagram.register({
  id: "dqn-variants-1", sim: "dqn-variants", order: 1,
  title: "DQN 개선판 (1) — Double DQN", short: "Double DQN",
  sub: "van Hasselt et al., 2016 · 과대추정 줄이기 · 잡음 섞인 추정값의 max는 위로 치우친다 → 고르는 망(θ)과 값을 매기는 망(θ⁻)을 나눈다",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 왜 위로 치우치나 — 참값이 모두 0이어도 max의 기댓값은 0보다 크다", { tone: "red" });
    k.panel(40, 166, 1200, 210, { tone: "red", tinted: true });
    k.text(64, 196, "행동 m개의 참값 Q = 0, 추정값 = 0 + 잡음 N(0, 1)", { size: 14, weight: 800, color: "ink" });
    k.table(64, 210, [130, 72, 72, 72, 72, 72, 72], [
      ["행동 수 m", "2", "3", "4", "5", "10", "20"],
      ["E[max] (이론)", { t: "0.564", mono: true }, { t: "0.846", mono: true }, { t: "1.029", mono: true }, { t: "1.163", mono: true }, { t: "1.539", mono: true, tone: "red" }, { t: "1.868", mono: true }],
      ["Double 방식", { t: "0", mono: true }, { t: "0", mono: true }, { t: "0", mono: true }, { t: "0", mono: true }, { t: "0", mono: true, tone: "blue" }, { t: "0", mono: true }]
    ], { rh: 30, size: 13.5 });
    k.lines(64, 322, [
      "E[max Z₁…Zₘ] = ∫ x·m·φ(x)·Φ(x)^(m−1) dx  (수치 적분)",
      "시뮬레이터 m = 10 · 10,000회: DQN 방식 평균 **1.532** · Double 방식 **0.008**",
      { t: "부푼 타깃 y = r + γ·max Q 가 다음 타깃의 max로 다시 들어가 쌓인다", color: "muted" }
    ], { size: 13, lh: 20 });
    /* 오른쪽: 막대 그림 */
    var bx = 700, by = 196;
    k.text(bx, by, "행동 4개 · 한 번 뽑은 추정값 예", { size: 13.5, weight: 800, color: "ink" });
    k.axes(bx, by + 14, 270, 140);
    var est = [-0.4, 1.3, 0.2, -0.9], zeroY = by + 14 + 84;
    k.path("M" + bx + " " + zeroY + " H" + (bx + 270), { tone: "gray", width: 1.2, dash: "4 3" });
    est.forEach(function (v, i) {
      var x = bx + 20 + i * 62, h = Math.abs(v) * 40;
      k.rect(x, v > 0 ? zeroY - h : zeroY, 40, h, { tone: i === 1 ? "red" : "gray", fill: i === 1 ? "solid" : "mid", r: 3 });
      k.text(x + 20, v > 0 ? zeroY - h - 6 : zeroY + h + 15, (v > 0 ? "+" : "−") + Math.abs(v).toFixed(1), { size: 12.5, weight: 700, anchor: "middle", tone: i === 1 ? "red" : "gray" });
    });
    k.text(bx + 276, zeroY + 4, "참값 0", { size: 12, color: "muted" });
    k.note(1024, 206, 200, 150, { tone: "red", title: "max = +1.3", body: "잡음이 가장 크게 위로 튄 행동이 뽑혀 그 값이 그대로 타깃에 쓰인다 (참값은 0)" });

    k.section(40, 410, "② 타깃 계산 비교 — 한 줄만 바뀐다 (r = 1, γ = 0.99)", { tone: "blue" });
    k.matrix(150, 450, [[2.1, 2.6], [2.8, 2.3], [2.5, 2.9]], { cw: 92, ch: 32, size: 14, rows: ["a₀", "a₁", "a₂"], cols: ["온라인 Q(s′,·;θ)", "타깃 Q(s′,·;θ⁻)"], fmt: function (v) { return v.toFixed(1); },
      tones: function (i, j) { return (i === 1 && j === 0) || (i === 1 && j === 1) ? "blue" : (i === 2 && j === 1) ? "red" : null; },
      fills: function (i, j) { return (i === 1) || (i === 2 && j === 1) ? "mid" : "plain"; } });
    k.box(400, 440, 400, 60, { tone: "red", fill: "plain", align: "left", title: "DQN: y = r + γ · max Q(s′, a′; θ⁻)", sub: "= 1 + 0.99 × 2.9 = 3.871  (고르기·평가 모두 θ⁻)", size: 14.5, subSize: 13 });
    k.box(400, 512, 400, 60, { tone: "blue", fill: "plain", align: "left", title: "Double: a* = argmax Q(s′, a′; θ) = a₁", sub: "y = 1 + 0.99 × Q(s′, a₁; θ⁻) = 1 + 0.99 × 2.3 = 3.277", size: 14.5, subSize: 13 });
    k.note(830, 440, 410, 132, { tone: "blue", title: "새 망이 필요 없다", body: "이미 있는 온라인 망 θ로 고르고 타깃망 θ⁻로 값을 매긴다. 두 망의 잡음이 달라 우연히 위로 튄 값을 고르고 그 값으로 평가하는 일이 줄어든다." });

    k.section(40, 612, "③ 최대화 편향 MDP (Sutton & Barto 예제 6.7) — A에서 왼쪽을 고른 비율, 1,000번 반복 평균", { tone: "purple" });
    k.table(40, 626, [300, 220, 260, 240], [
      ["알고리즘", "최고 비율", "마지막 50 에피소드 평균", "최적 정책 (ε = 0.1)"],
      [{ t: "Q-learning", tone: "red" }, { t: "94.7% (26번째)", mono: true }, { t: "12.5%", mono: true }, { t: "5%", mono: true }],
      [{ t: "Double Q-learning", tone: "blue" }, { t: "처음 50%에서 바로 감소", mono: false }, { t: "7.1%", mono: true }, { t: "5%", mono: true }]
    ], { rh: 24, size: 12.5 });
  }
});

DSDiagram.register({
  id: "dqn-variants-2", sim: "dqn-variants", order: 2,
  title: "DQN 개선판 (2) — Dueling 네트워크", short: "Dueling",
  sub: "Wang et al., 2016 · 상태 자체의 가치 V(s)와 행동별 이점 A(s,a)를 두 줄기로 나눠 배우고 마지막에 합친다",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 구조 — 공통 층 뒤에서 두 줄기로 갈라졌다가 합친다", { tone: "purple" });
    k.panel(40, 166, 1200, 170, { tone: "purple", tinted: true });
    var s = k.box(70, 218, 140, 64, { tone: "blue", fill: "plain", title: "상태 s", sub: "(x, ẋ, θ, θ̇)", size: 15 });
    var b = k.box(260, 218, 180, 64, { tone: "blue", title: "공통 층", sub: "4 → 32 → 32 · ReLU", size: 15 });
    var v = k.box(500, 178, 200, 54, { tone: "purple", title: "가치 줄기 V(s)", sub: "출력 1개", size: 15 });
    var a = k.box(500, 254, 200, 54, { tone: "orange", title: "이점 줄기 A(s, a)", sub: "출력 = 행동 수", size: 15 });
    var m = k.box(770, 218, 220, 64, { tone: "pink", title: "Q = V + (A − 평균 A)", sub: "합치기 (학습 파라미터 없음)", size: 15 });
    var q = k.box(1050, 218, 160, 64, { tone: "purple", fill: "solid", title: "Q(s, a)", sub: "행동마다 하나", size: 15 });
    k.link(s.r, b.l, { tone: "blue" }); k.link([440, 240], v.l, { tone: "purple", curve: -10 }); k.link([440, 260], a.l, { tone: "orange", curve: 10 });
    k.link(v.r, [770, 240], { tone: "purple", curve: -10 }); k.link(a.r, [770, 260], { tone: "orange", curve: 10 }); k.link(m.r, q.l, { tone: "pink" });
    k.text(640, 328, "이 시뮬레이터: 마지막 선형층 출력 3개를 [V, A(←), A(→)]로 나눠 씀 (논문은 줄기마다 FC 512)", { size: 12.5, anchor: "middle", color: "muted" });

    k.section(40, 372, "② 예시 상태에서 분해 (예시 숫자)", { tone: "orange" });
    k.table(40, 388, [120, 90, 100, 100, 90, 160, 160], [
      ["상태", "V(s)", "A(s,←)", "A(s,→)", "평균 A", "Q(s,←)", "Q(s,→)"],
      [{ t: "안정", tone: "green" }, { t: "62.0", mono: true }, { t: "1.2", mono: true }, { t: "0.8", mono: true }, { t: "1.0", mono: true }, { t: "62.0 + 0.2 = 62.2", mono: true }, { t: "62.0 − 0.2 = 61.8", mono: true }],
      [{ t: "기울어짐", tone: "orange" }, { t: "48.0", mono: true }, { t: "−3.1", mono: true }, { t: "2.9", mono: true }, { t: "−0.1", mono: true }, { t: "48.0 − 3.0 = 45.0", mono: true }, { t: "48.0 + 3.0 = 51.0", mono: true }],
      [{ t: "위험", tone: "red" }, { t: "6.5", mono: true }, { t: "0.6", mono: true }, { t: "−2.2", mono: true }, { t: "−0.8", mono: true }, { t: "6.5 + 1.4 = 7.9", mono: true }, { t: "6.5 − 1.4 = 5.1", mono: true }]
    ], { rh: 32, size: 13.5 });
    k.note(880, 386, 360, 70, { tone: "green", title: "안정 상태: 행동 차이 0.4", body: "무엇을 하든 비슷 → 정보는 대부분 V에. 어떤 행동의 경험이든 V를 함께 배운다" });
    k.note(880, 464, 360, 70, { tone: "purple", title: "학습된 망 실측 (CartPole 비교 탭)", body: "seed 1 · 15,000걸음 |Q(←) − Q(→)|: 안정 0.02 · 기울어짐 1.42" });

    k.section(40, 556, "③ 왜 평균을 빼나 — 식별 문제", { tone: "red" });
    k.box(40, 572, 560, 120, { tone: "red", fill: "plain", align: "left", valign: "top", title: "그냥 더하기 Q = V + A", size: 15,
      lines: [{ t: "V = 62.0, A = [1.2, 0.8] → Q = [63.2, 62.8]", size: 13.5 }, { t: "V = 72.0, A = [−8.8, −9.2] → Q = [63.2, 62.8]  (똑같음)", size: 13.5 }, { t: "→ V와 A가 하나로 정해지지 않아 V가 '상태 가치' 뜻을 잃음", size: 13.5, tone: "red" }] });
    k.box(640, 572, 600, 120, { tone: "blue", fill: "plain", align: "left", valign: "top", title: "평균 빼기 Q = V + (A − 평균 A)", size: 15,
      lines: [{ t: "A − 평균 A 의 합 = 0 이 되도록 강제", size: 13.5 }, { t: "→ V(s) = 평균ₐ Q(s, a) = (62.2 + 61.8) / 2 = 62.0 하나로 정해짐", size: 13.5 }, { t: "max를 빼는 방식도 있지만 평균 방식이 학습이 더 안정적", size: 13.5, color: "muted" }] });
  }
});

DSDiagram.register({
  id: "dqn-variants-3", sim: "dqn-variants", order: 3,
  title: "DQN 개선판 (3) — PER: 우선순위 경험 재생", short: "PER",
  sub: "Schaul et al., 2016 · TD 오차가 큰(많이 틀린) 전이를 더 자주 뽑고, 그로 인한 편향은 중요도 가중치로 보정한다 — 버퍼 8개 예시",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 우선순위 → 추출 확률 → 중요도 가중치 (α = 0.6, β = 0.4, ε = 0.01)", { tone: "red" });
    k.formula(40, 166, 1200, 36, "pᵢ = |δᵢ| + ε   →   P(i) = pᵢ^α / Σₖ pₖ^α   →   wᵢ = (N · P(i))^(−β) / maxⱼ wⱼ", { size: 15 });
    var d = [2.0, -0.5, 0.1, 1.2, -3.0, 0.05, 0.6, -0.3], p = [2.01, 0.51, 0.11, 1.21, 3.01, 0.06, 0.61, 0.31],
      pa = [1.5203, 0.6676, 0.2660, 1.1212, 1.9370, 0.1849, 0.7434, 0.4952], P = [0.2192, 0.0963, 0.0383, 0.1617, 0.2793, 0.0267, 0.1072, 0.0714],
      w = [0.431, 0.598, 0.865, 0.486, 0.391, 1.000, 0.573, 0.674];
    var rows = [["#", "δ", "p", "p^α", "P(i)", "w"]];
    d.forEach(function (x, i) { rows.push([String(i), { t: (x < 0 ? "−" : "") + Math.abs(x).toFixed(2), mono: true }, { t: p[i].toFixed(2), mono: true }, { t: pa[i].toFixed(4), mono: true },
      { t: P[i].toFixed(4), mono: true, tone: "red" }, { t: w[i].toFixed(3), mono: true, tone: "amber" }]); });
    rows.push(["합", "", "", { t: "6.9356", mono: true, weight: 700 }, { t: "1.0000", mono: true }, ""]);
    k.table(40, 214, [44, 76, 70, 90, 86, 74], rows, { rh: 25, size: 13 });
    /* 막대: P vs 균등 */
    var bx = 540, by = 222, bh = 190, bw = 300;
    k.text(bx, by, "P(i) vs 균등 1/8 = 0.125", { size: 13.5, weight: 800, color: "ink" });
    k.axes(bx, by + 12, bw + 20, bh);
    P.forEach(function (v, i) { var h = v / 0.3 * (bh - 20), x = bx + 12 + i * 38; k.rect(x, by + 12 + bh - h, 26, h, { tone: "red", fill: i === 4 || i === 0 ? "solid" : "mid", r: 2 });
      k.text(x + 13, by + bh + 28, "#" + i, { size: 11.5, anchor: "middle", color: "muted" }); });
    var uy = by + 12 + bh - 0.125 / 0.3 * (bh - 20);
    k.path("M" + bx + " " + uy + " H" + (bx + bw + 20), { tone: "gray", width: 1.5, dash: "5 4" });
    k.note(880, 222, 360, 64, { tone: "red", title: "α: 우선순위를 얼마나 믿나", body: "α = 0 → 균등 추출(보통 DQN), α = 1 → |δ|에 완전히 비례" });
    k.note(880, 296, 360, 64, { tone: "amber", title: "β: 편향 보정", body: "자주 뽑힌 #4는 w = 0.391로 작게 · β는 학습 끝에 1로" });
    k.note(880, 370, 360, 64, { tone: "blue", title: "새 전이 = 지금까지 최대 우선순위", body: "적어도 한 번은 뽑히게 하고, 학습 뒤 |δ| + ε 로 고친다" });

    k.section(40, 494, "② 합 트리 — u = 2.913 을 따라 루트에서 잎으로 (비교 3번 = log₂ 8)", { tone: "pink" });
    var lv = [[6.936], [3.575, 3.361], [2.188, 1.387, 2.122, 1.239], [1.520, 0.668, 0.266, 1.121, 1.937, 0.185, 0.743, 0.495]];
    var hot = [[0], [0], [1], [3]], X0 = 40, W = 1200, ys = [516, 562, 608, 654];
    lv.forEach(function (row, l) {
      row.forEach(function (v, i) {
        var cw = W / row.length, cx = X0 + cw * (i + 0.5), bw2 = l === 3 ? 100 : 120, on = hot[l].indexOf(i) >= 0;
        if (l < 3) [0, 1].forEach(function (c) { var cw2 = W / lv[l + 1].length, cx2 = X0 + cw2 * (2 * i + c + 0.5), on2 = on && hot[l + 1].indexOf(2 * i + c) >= 0;
          k.arrow(cx, ys[l] + 15, cx2, ys[l + 1] - 15, { tone: on2 ? "pink" : "gray", width: on2 ? 2.6 : 1.2, head: false }); });
        k.box(cx - bw2 / 2, ys[l] - 15, bw2, 30, { tone: on ? "pink" : "gray", fill: on ? "mid" : "plain", title: v.toFixed(3) + (l === 3 ? "  #" + i : ""), size: 13, r: 6 });
      });
    });
    k.lines(44, 522, ["1) 2.913 < 3.575 → 왼쪽", "2) 2.913 ≥ 2.188 → 빼고 오른쪽: 0.725", "3) 0.725 ≥ 0.266 → 오른쪽 → **#3**"], { size: 12, lh: 16, tone: "pink", color: "tone" });
  }
});

DSDiagram.register({
  id: "dqn-variants-4", sim: "dqn-variants", order: 4,
  title: "DQN 개선판 (4) — Rainbow 통합 에이전트", short: "Rainbow",
  sub: "Hessel et al., 2018 · Double · Dueling · PER · n-step · 분포형(C51) · Noisy Nets — 각자 DQN의 다른 약점을 고친다",
  label: "Reinforcement Learning",
  draw: function (k) {
    k.section(40, 152, "① 여섯 구성 요소와 고치는 약점", { tone: "amber" });
    var C = [["Double", "과대추정", "θ로 고르고 θ⁻로 평가", "blue"], ["Dueling", "표현 효율", "V + A − 평균 A", "purple"], ["PER", "표본 효율", "|δ| 비례 추출 + w 보정", "red"],
      ["n-step", "보상 전파", "n걸음 실제 보상 + γⁿ max Q", "green"], ["C51 (분포형)", "불확실성", "원자 51개 위 분포 학습", "pink"], ["Noisy Nets", "탐험", "학습되는 잡음 · ε 없음", "orange"]];
    C.forEach(function (c, i) { var x = 40 + i * 202; k.box(x, 166, 190, 82, { tone: c[3], title: c[0], sub: "고침: " + c[1], lines: [{ t: c[2], size: 12, color: "ink" }], size: 15, subSize: 12 }); });

    k.section(40, 286, "② 분포형 C51 — 투영 예 (원자 z = 0…10, r = 1, γ = 0.9)", { tone: "pink" });
    var p = [0, 0, 0.05, 0.10, 0.20, 0.30, 0.20, 0.10, 0.05, 0, 0], m = [0, 0, 0.01, 0.07, 0.15, 0.27, 0.27, 0.15, 0.07, 0.01, 0];
    var ax = 50, ay = 304, aw = 560, ah = 150, sx = aw / 11;
    k.axes(ax, ay, aw, ah);
    for (var j = 0; j < 11; j++) {
      var x = ax + sx * j + 8, h1 = p[j] / 0.37 * ah, h2 = m[j] / 0.37 * ah;
      if (h1) k.rect(x, ay + ah - h1, 16, h1, { tone: "purple", fill: "mid", r: 2 });
      if (h2) k.rect(x + 18, ay + ah - h2, 16, h2, { tone: "red", fill: "solid", r: 2 });
      k.text(x + 17, ay + ah + 16, String(j), { size: 11.5, anchor: "middle", color: "muted" });
    }
    k.chip(ax + 10, ay - 4, "보라 = 다음 상태 분포 p", { tone: "purple", size: 11.5, h: 22 });
    k.chip(ax + 190, ay - 4, "빨강 = 투영된 타깃 m", { tone: "red", size: 11.5, h: 22 });
    k.lines(640, 316, [
      "1. 원자를 옮기고 줄임: z_j → r + γz_j  (예: z = 3 → 1 + 0.9×3 = **3.7**)",
      "2. 이웃 두 원자에 거리 비율로 나눔: 3.7 → m₃ += 0.10×0.3 = 0.03, m₄ += 0.10×0.7 = 0.07",
      "3. m = [0, 0, 0.01, 0.07, 0.15, 0.27, 0.27, 0.15, 0.07, 0.01, 0]",
      "4. 평균 보존: Σ m z = **5.5** = 1 + 0.9 × E[Z(s′)] = 1 + 0.9 × 5.0",
      "5. 손실 = 교차 엔트로피 −Σ mᵢ log pᵢ(s, a) · 행동은 기댓값 Σ zᵢ pᵢ 로 선택"
    ], { size: 13, lh: 25 });
    k.formula(640, 446, 600, 32, "n-step (n = 3, γ = 0.9): G = 1 + 0.9·0 + 0.81·0 + 0.729 × 3.0 = **3.187**", { size: 13, weight: 600 });

    k.section(40, 512, "③ 논문 보고값 — 57개 Atari 게임, 사람 대비 정규화 점수 중앙값 (no-op 시작, Table 2)", { tone: "purple" });
    var A = [["DQN", 79, "gray"], ["DDQN", 117, "blue"], ["Noisy DQN", 118, "orange"], ["Prior. DDQN", 140, "red"], ["Dueling DDQN", 151, "purple"], ["Distrib. DQN", 164, "pink"], ["Rainbow", 223, "amber"]];
    var bx = 190, by = 530, bwid = 560;
    A.forEach(function (a, i) { var y = by + i * 23, w = a[1] / 240 * bwid;
      k.text(bx - 10, y + 15, a[0], { size: 12.5, weight: a[0] === "Rainbow" ? 800 : 600, anchor: "end", color: "ink" });
      k.rect(bx, y + 3, w, 16, { tone: a[2], fill: a[0] === "Rainbow" ? "solid" : "mid", r: 2 });
      k.text(bx + w + 6, y + 16, a[1] + "%", { size: 12, weight: 700, color: "ink", mono: true }); });
    var x100 = bx + 100 / 240 * bwid;
    k.path("M" + x100 + " " + (by - 2) + " V" + (by + 164), { tone: "gray", width: 1.4, dash: "4 3" });
    k.text(x100 + 4, by + 2, "사람 100%", { size: 11.5, color: "muted" });
    k.note(840, 530, 400, 76, { tone: "amber", title: "제거 실험(ablation)에서", body: "PER과 n-step을 빼면 가장 크게 떨어지고, 다음이 분포형. Double·Dueling을 빼는 영향은 중앙값 기준으로 작았다." });
    k.note(840, 616, 400, 76, { tone: "gray", title: "CartPole에서는?", body: "작은 문제·짧은 학습에서는 차이가 작고 seed마다 순위가 바뀐다 (시뮬레이터 비교 탭)" });
  }
});
