/* Offline RL (CQL · IQL) — 알고리즘 구성도
   예제 숫자는 시뮬레이터 기본값(치료 경로 격자 5×7 · 전문가 기록 50에피소드 · ε 0.1 · seed 1 · γ 0.99)에서 계산한 값 */
(function () {
  var M = "−";
  function n(v) { return String(v).replace("-", M); }

  /* ---------- 1. 오프라인 설정과 분포 이동 ---------- */
  DSDiagram.register({
    id: "offline-rl-1", sim: "offline-rl", order: 1,
    title: "Offline RL (1) — 기록 데이터와 분포 이동", short: "오프라인 설정 · 분포 이동",
    sub: "새로 실험할 수 없는 의료 환경: 과거 진료 기록 D만으로 정책을 배우면, 데이터에 없는 행동의 Q가 과대평가되어 정책이 데이터 밖으로 나간다",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 150, "① 오프라인 RL의 흐름 — 학습 중 환경과 상호작용하지 않음");
      k.panel(40, 164, 1200, 118, { tone: "blue", tinted: true });
      var b1 = k.box(64, 190, 196, 66, { tone: "orange", title: "행동 정책 π_β", sub: "과거 의료진의 결정", size: 15 });
      var b2 = k.box(318, 190, 226, 66, { tone: "blue", title: "데이터셋 D", sub: "(s, a, r, s′) 412개 · 고정", size: 15 });
      var b3 = k.box(602, 190, 226, 66, { tone: "purple", title: "오프라인 학습기", sub: "BC · 단순 Q · CQL · IQL", size: 15 });
      var b4 = k.box(886, 190, 160, 66, { tone: "green", title: "새 정책 π", sub: "배포 전 검증", size: 15 });
      k.link(b1.r, b2.l, { tone: "orange", label: "기록" }); k.link(b2.r, b3.l, { tone: "blue" }); k.link(b3.r, b4.l, { tone: "purple" });
      k.box(1066, 184, 160, 78, { tone: "red", fill: "plain", dash: true, title: "환경 접근 없음", sub: "새 (s,a)는 시험 불가", size: 13.5, subSize: 11.5 });

      /* ② 데이터 범위 — 5×7 격자 */
      k.section(40, 318, "② 데이터 범위 (전문가 기록)", { tone: "orange" });
      k.panel(40, 332, 470, 296, { tone: "orange", tinted: true });
      var gx = 70, gy = 352, c = 50;
      var visits = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1], [2, 2, 2, 2, 2, 2, 2], [2, -1, -1, -1, -1, -1, 3]];
      for (var r = 0; r < 5; r++) for (var cc = 0; cc < 7; cc++) {
        var v = visits[r][cc], x = gx + cc * c, y = gy + r * c;
        if (v === -1) k.rect(x, y, c, c, { tone: "ink", fill: "solid" });
        else if (v === 3) k.rect(x, y, c, c, { tone: "green", fill: "mid" });
        else if (v === 2) k.rect(x, y, c, c, { tone: "orange", fill: "mid" });
        else if (v === 1) k.rect(x, y, c, c, { tone: "orange", fill: "tone" });
        else k.rect(x, y, c, c, { tone: "gray", fill: "tone" });
      }
      k.raw('<g class="dg-t-gray">' + (function () { var s = ""; for (var i = 0; i <= 7; i++) s += '<path class="dg-stroke" style="stroke-width:1" d="M' + (gx + i * c) + " " + gy + " V" + (gy + 5 * c) + '"/>'; for (var j = 0; j <= 5; j++) s += '<path class="dg-stroke" style="stroke-width:1" d="M' + gx + " " + (gy + j * c) + " H" + (gx + 7 * c) + '"/>'; return s; })() + "</g>");
      k.text(gx + 8, gy + 4 * c + 20, "S", { size: 15, weight: 800, color: "ink" });
      k.text(gx + 6 * c + 8, gy + 4 * c + 20, "G", { size: 15, weight: 800, color: "ink" });
      for (var h = 1; h <= 5; h++) k.text(gx + h * c + c / 2, gy + 4 * c + 31, "H", { size: 14, weight: 800, anchor: "middle", color: "on" });
      k.path("M" + (gx + 25) + " " + (gy + 225) + " V" + (gy + 175) + " H" + (gx + 325) + " V" + (gy + 222), { tone: "orange", width: 3 });
      k.chip(gx + 3.5 * c, gy + 2 * c + 12, "잡음 ε로만 가끔 들른 줄", { tone: "orange", size: 11.5, h: 24, anchor: "middle" });
      k.chip(gx + 3.5 * c, gy + c - 12, "기록 없음 (빈 칸)", { tone: "gray", size: 12, h: 24, anchor: "middle" });
      k.lines(436, 372, [
        { t: "전이", size: 12, color: "muted" }, { t: "412개", size: 15, weight: 800 },
        { t: "(s,a) 쌍", size: 12, color: "muted" }, { t: "34 / 116", size: 15, weight: 800 },
        { t: "회복 도달", size: 12, color: "muted" }, { t: "41 / 50", size: 15, weight: 800 }
      ], { lh: 22 });
      k.text(70, 618, "S 입원 · G 회복 · H 합병증 −100 · 매 걸음 −1", { size: 11.5, color: "muted" });

      /* ③ 분포 이동 — 상태 (3,0) 숫자 */
      k.section(536, 318, "③ 단순 오프라인 Q 학습 — 상태 (3,0)에서 일어나는 일", { tone: "red" });
      k.panel(536, 332, 704, 296, { tone: "red", tinted: true });
      k.formula(556, 346, 664, 36, "Q̂(s,a) ← r + γ · **max**ₐ′ Q̂(s′,a′)   (데이터에 있는 (s,a)만 갱신, max는 모든 행동 대상)", { size: 13.5, weight: 600 });
      k.table(556, 394, [96, 110, 140, 140, 150], [
        ["행동", "기록 n(s,a)", "추정 Q̂ (수렴)", "실제 Q*", "Q̂ − Q*"],
        ["↑ 위", "1", n("-1.00"), n("-7.73"), "+6.73"],
        ["→ 오른쪽", "48", n("-1.00"), n("-5.85"), "+4.85"],
        ["↓ 아래", "1", n("-1.99"), n("-7.73"), "+5.74"],
        [{ t: "← 왼쪽", tone: "red" }, { t: "0  (데이터 밖)", tone: "red" }, { t: "0.00 ← max", tone: "red", weight: 800 }, n("-6.79"), { t: "+6.79", tone: "red", weight: 800 }]
      ], { rh: 28, size: 13 });
      k.note(556, 548, 320, 66, { tone: "red", title: "max가 초기값 0을 고른다", body: "← 는 한 번도 기록되지 않아 0 그대로 → 음수인 실제 값보다 커서 탐욕 행동이 된다" });
      k.note(890, 548, 330, 66, { tone: "purple", title: "과대추정이 앞 상태로 번짐", body: "(3,1)의 max도 데이터 밖 0 → (3,0)의 → 값이 −1로 부풀려진다" });

      k.section(40, 662, "④ 결과", { tone: "ink" });
      k.chip(130, 645, "단순 Q: (3,0)에서 ← 만 반복 → 리턴 −50 (맴돎)", { tone: "red", size: 13 });
      k.chip(530, 645, "최적 경로 리턴 −7 · V*(S) = −6.79", { tone: "green", size: 13 });
      k.flow(830, 640, [{ t: "정책 제약 (BC)", tone: "gray" }, { t: "보수적 Q (CQL)", tone: "blue" }, { t: "표본 내 (IQL)", tone: "teal" }], { w: 410, h: 34, gap: 16, size: 12 });
    }
  });

  /* ---------- 2. CQL ---------- */
  DSDiagram.register({
    id: "offline-rl-2", sim: "offline-rl", order: 2,
    title: "Offline RL (2) — CQL 보수적 Q 학습", short: "CQL 보수적 Q 학습",
    sub: "Conservative Q-Learning · log-sum-exp로 모든 행동을 누르고 데이터 행동은 올려, 데이터에 없는 행동만 낮은 값을 갖게 만든다",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 150, "① 목적식 — 벨만 오차 + 보수성 벌점");
      k.formula(40, 166, 1200, 50, "L(Q) = **α** · E_s~D [ **log Σₐ exp Q(s,a)** − **E_a~D [Q(s,a)]** ] + ½ · E_(s,a,r,s′)~D [ ( Q(s,a) − (r + γ · maxₐ′ Q(s′,a′)) )² ]", { size: 16 });
      k.box(150, 226, 300, 54, { tone: "red", title: "부드러운 최대 (log-sum-exp)", sub: "모든 행동의 Q를 아래로 — 특히 큰 Q", size: 13.5, subSize: 11.5 });
      k.box(486, 226, 290, 54, { tone: "orange", title: "데이터 행동의 평균 Q", sub: "기록된 행동의 Q는 위로", size: 13.5, subSize: 11.5 });
      k.box(812, 226, 330, 54, { tone: "blue", title: "보통의 벨만 오차", sub: "데이터 (s,a)의 Q를 목표값 r + γ max Q′ 로", size: 13.5, subSize: 11.5 });
      k.text(40, 300, "Q(s,b)의 기울기 = α · (softmax(Q)_b − π_β(b|s)) + π_β(b|s) · (Q(s,b) − y)  →  데이터 밖 행동(π_β = 0)은 항상 아래로 밀린다", { size: 13, weight: 700, tone: "red" });

      k.section(40, 340, "② 시작 상태 S에서 실제 계산 (α = 1, 1500회 반복 후)", { tone: "purple" });
      k.panel(40, 354, 640, 270, { tone: "purple", tinted: true });
      k.table(58, 368, [110, 110, 120, 130, 150], [
        ["행동", "π_β(a|S)", "Q(S,a)", "softmax Q", "실제 Q*"],
        ["↑ 위", "0.907", { t: n("-6.60"), weight: 800 }, "0.860", n("-6.79")],
        ["→ 오른쪽", "0.037", n("-99.00"), "0.000", n("-100.00")],
        ["↓ 아래", "0.019", n("-9.39"), "0.053", n("-7.73")],
        ["← 왼쪽", "0.037", n("-8.89"), "0.087", n("-7.73")]
      ], { rh: 27, size: 13 });
      k.lines(58, 524, [
        { t: "log Σ exp Q = log(e^−6.60 + e^−99.00 + e^−9.39 + e^−8.89) = **−6.454**" },
        { t: "E_a~D[Q] = 0.907×(−6.60) + 0.037×(−99.00) + 0.019×(−9.39) + 0.037×(−8.89) = **−10.163**" },
        { t: "벌점 = α × (−6.454 − (−10.163)) = 1 × 3.709 = **3.709**", tone: "red", weight: 700 }
      ], { size: 12.5, lh: 25 });
      k.text(58, 606, "드물게 기록된 ↓·← 는 실제 Q* −7.73보다 낮게(−9.39, −8.89) → 확신이 적은 행동은 보수적으로", { size: 12, color: "muted" });

      k.section(704, 340, "③ α에 따른 결과 (같은 데이터)", { tone: "orange" });
      k.panel(704, 354, 536, 270, { tone: "orange", tinted: true });
      k.table(720, 368, [96, 70, 70, 70, 70, 70, 70], [
        ["α", "0", "0.01", "0.03", "0.3", "3", "30"],
        ["리턴", { t: n("-50"), tone: "red" }, { t: n("-50"), tone: "red" }, { t: n("-7"), tone: "green" }, { t: n("-7"), tone: "green" }, { t: n("-7"), tone: "green" }, { t: n("-7"), tone: "green" }],
        ["V̂(S)", n("-1.00"), n("-4.19"), n("-6.75"), n("-6.63"), n("-6.85"), n("-11.28")]
      ], { rh: 28, size: 13 });
      k.text(720, 474, "실제 최적 V*(S) = −6.79 · α = 1에서 V̂(S) = −6.60", { size: 12.5, color: "muted" });
      k.note(720, 492, 248, 78, { tone: "red", title: "α → 0 : 단순 Q 학습", body: "데이터 밖 행동이 0 근처에 남아 max에 뽑힘 → 맴돎(−50)" });
      k.note(980, 492, 244, 78, { tone: "gray", title: "α → ∞ : BC에 가까워짐", body: "자주 기록된 행동만 고름 · V̂가 실제보다 크게 낮아짐" });
      k.text(720, 600, "적당한 α (0.03 ~ 3)에서 데이터 범위 안의 최적 경로(−7)를 찾는다", { size: 12.5, weight: 700, tone: "orange" });

      k.section(40, 660, "④ 정리", { tone: "ink" });
      k.flow(130, 642, [{ t: "데이터 (s,a)만 벨만 갱신", tone: "blue" }, { t: "log-sum-exp로 전체를 누름", tone: "red" }, { t: "데이터 행동은 올림", tone: "orange" }, { t: "데이터 범위 안의 정책", tone: "green" }], { w: 1110, h: 36, gap: 22, size: 13 });
    }
  });

  /* ---------- 3. IQL ---------- */
  DSDiagram.register({
    id: "offline-rl-3", sim: "offline-rl", order: 3,
    title: "Offline RL (3) — IQL 표본 내 학습", short: "IQL 표본 내 학습 · 비교",
    sub: "Implicit Q-Learning · 데이터에 있는 행동의 값만 쓰고, 비대칭 손실(τ)로 '데이터 안에서의 좋은 행동' 수준의 V를 학습한 뒤 이점 가중으로 정책을 뽑는다",
    label: "Reinforcement Learning",
    draw: function (k) {
      k.section(40, 150, "① 세 단계 — 어디에도 데이터 밖 행동이 등장하지 않는다", { tone: "teal" });
      var a1 = k.box(40, 166, 380, 78, { tone: "purple", title: "V 학습 (기대분위 회귀)", sub: "L_V = E_(s,a)~D [ |τ − 1(u<0)| · u² ],  u = Q(s,a) − V(s)", size: 15, subSize: 12.5 });
      var a2 = k.box(450, 166, 380, 78, { tone: "blue", title: "Q 학습 (max 대신 V)", sub: "L_Q = E_D [ ( r + γ · V(s′) − Q(s,a) )² ]", size: 15, subSize: 12.5 });
      var a3 = k.box(860, 166, 380, 78, { tone: "orange", title: "정책 추출 (AWR)", sub: "π(a|s) ∝ π_β(a|s) · exp( β · (Q(s,a) − V(s)) )", size: 15, subSize: 12.5 });
      k.link(a1.r, a2.l, { tone: "gray" }); k.link(a2.r, a3.l, { tone: "gray" });
      k.arrow(640, 246, 230, 246, { tone: "gray", dash: true, via: [[640, 262], [230, 262]] });
      k.text(435, 280, "V ↔ Q 번갈아 반복 (200회) → 마지막에 한 번 정책 추출", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });

      k.section(40, 314, "② 비대칭 손실 L₂^τ(u)", { tone: "purple" });
      k.panel(40, 328, 360, 216, { tone: "purple", tinted: true });
      var ox = 220, oy = 512, sx = 28, sy = 5.2;
      k.axes(60, 344, 320, 168, { x: "u = Q − V" });
      k.raw('<g class="dg-t-gray"><path class="dg-stroke" style="stroke-width:1;stroke-dasharray:4 4" d="M' + ox + " 344 V" + oy + '"/></g>');
      function curve(tau) { var d = ""; for (var i = 0; i <= 60; i++) { var u = -5.6 + 11.2 * i / 60, y = Math.abs(tau - (u < 0 ? 1 : 0)) * u * u; d += (i ? " L" : "M") + (ox + u * sx).toFixed(1) + " " + (oy - Math.min(y * sy, 160)).toFixed(1); } return d; }
      k.path(curve(0.5), { tone: "gray", width: 2, dash: "6 5" });
      k.path(curve(0.9), { tone: "purple", width: 3 });
      k.text(296, 372, "τ = 0.9", { size: 13, weight: 800, tone: "purple" });
      k.text(70, 370, "점선 τ = 0.5 (보통 제곱)", { size: 12, weight: 700, color: "muted" });
      k.text(ox, 530, "0", { size: 12, anchor: "middle", color: "muted" });
      k.text(232, 410, "u > 0 무게 τ = 0.9", { size: 12, tone: "purple" });
      k.text(70, 390, "u < 0 무게 1 − τ = 0.1", { size: 12, tone: "purple" });

      k.section(420, 314, "③ 시작 상태 S 계산 (τ = 0.9, β = 3, 200회 반복 후)", { tone: "blue" });
      k.panel(420, 328, 820, 216, { tone: "blue", tinted: true });
      k.table(436, 338, [76, 40, 64, 116, 92, 172, 76, 76], [
        ["행동", "n", "π_β", "Q = r + γV(s′)", "u = Q − V", "무게 π_β·|τ − 1(u<0)|", "exp(βu)", "π(a|S)"],
        ["↑ 위", "49", "0.907", n("-8.55"), "+0.419", "0.9 × 0.907 = 0.817", "3.515", { t: "0.999", weight: 800 }],
        ["→ 오른쪽", "2", "0.037", n("-100.00"), n("-91.03"), "0.1 × 0.037 = 0.004", "0.000", "0.000"],
        ["↓ 아래", "1", "0.019", n("-9.88"), n("-0.910"), "0.1 × 0.019 = 0.002", "0.065", "0.000"],
        ["← 왼쪽", "2", "0.037", n("-9.88"), n("-0.910"), "0.1 × 0.037 = 0.004", "0.065", "0.001"]
      ], { rh: 24, size: 12.5 });
      k.lines(436, 482, [
        { t: "V(S) = Σ 무게·Q / Σ 무게 = (0.817×(−8.55) + 0.004×(−100) + 0.002×(−9.88) + 0.004×(−9.88)) / 0.826 = **−8.971**", tone: "purple" },
        { t: "단순 평균(τ = 0.5) −12.013 · 데이터 안 최댓값 −8.552 → τ = 0.9의 V는 최댓값 쪽 · ↑ 확률 0.999 → 리턴 −7 (최적)" }
      ], { size: 12.5, lh: 24 });

      k.section(40, 578, "④ 데이터 품질별 평균 리턴 (seed 5개 · 50에피소드 · α 1 · τ 0.9)", { tone: "ink" });
      k.table(40, 590, [116, 120, 100, 100, 100, 100], [
        ["데이터", "행동 정책", "BC", "단순 Q", "CQL", "IQL"],
        ["무작위", n("-101.2"), n("-60.0"), { t: n("-61.0"), tone: "red" }, { t: n("-16.8"), tone: "blue", weight: 800 }, { t: n("-18.4"), tone: "teal", weight: 800 }],
        ["중간(보수적)", n("-23.2"), n("-13.0"), { t: n("-52.6"), tone: "red" }, n("-13.0"), n("-13.0")],
        ["전문가", n("-23.3"), n("-7.0"), { t: n("-50.0"), tone: "red" }, n("-7.0"), n("-7.0")],
        ["혼합", n("-63.1"), n("-7.0"), { t: n("-50.0"), tone: "red" }, n("-7.0"), n("-7.4")]
      ], { rh: 21.5, size: 12 });
      k.note(700, 590, 540, 50, { tone: "teal", title: "Q의 목표값에 maxₐ′ 가 없다", body: "데이터 밖 (s,a)를 평가할 일이 없어 분포 이동을 원천 차단" });
      k.note(700, 648, 540, 50, { tone: "orange", title: "무작위 기록에서도 행동 정책(−101)·BC(−60)보다 훨씬 낫다", body: "좋은 조각을 이어 붙여(stitching) 데이터보다 나은 정책을 찾는다" });
    }
  });
})();
