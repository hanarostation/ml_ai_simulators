/* Word2Vec (Skip-gram · CBOW) — 알고리즘 구성도 (강의 필기자료 'NLP ③ 단어 표현' 양식)
   예제 숫자: 시뮬레이터 기본 코퍼스(의료 문장 17개, V = 31) · N = 8 · w = 2 · seed 160 · η = 0.05 그대로 */
(function () {
  var MINUS = "−";
  function f2(v) { if (typeof v !== "number") return v; var s = Math.abs(v).toFixed(2); return (v < 0 && +s !== 0 ? MINUS : "") + s; }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  /* 한 줄 안에서 색이 바뀌는 글 — parts: [[글, 톤|"ink"|"muted"], ...] */
  function richLine(k, x, y, size, parts, o) {
    o = o || {};
    var s = '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-weight="' + (o.weight || 800) + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + (o.mono ? ' class="dg-ink dg-mono"' : ' class="dg-ink"') + ' xml:space="preserve">';
    parts.forEach(function (p) {
      if (p[1] === "ink") s += esc(p[0]);
      else if (p[1] === "muted") s += '<tspan class="dg-muted">' + esc(p[0]) + "</tspan>";
      else s += '<tspan class="dg-t-' + p[1] + '"><tspan class="dg-tc">' + esc(p[0]) + "</tspan></tspan>";
    });
    k.raw(s + "</text>");
  }
  var SENT = ["환자", "는", "두통", "과", "발열", "을", "호소", "했다"];
  var CTX = ["환자", "는", "과", "발열"];
  function signTone(i, j, v) { return typeof v === "number" ? (v > 0.005 ? "orange" : v < -0.005 ? "blue" : "gray") : null; }

  /* ---------------------------------------------------------------- 1 */
  DSDiagram.register({
    id: "word2vec-1", sim: "word2vec", order: 1,
    title: "Word2Vec (1) — 주변 단어로 의미를 배우는 밀집 표현", short: "밀집 표현 · 윈도 샘플",
    sub: "분포 가설: 비슷한 문맥에 나오는 단어는 뜻이 비슷하다 · 시뮬레이터 기본 코퍼스 = 의료 문장 17개 · 토큰 132개 · 어휘 V = 31",
    label: "NLP",
    draw: function (k) {
      k.section(40, 150, "① 희소 표현 vs 밀집 표현 — '두통'과 '발열'을 벡터로 바꾸면");
      /* 희소 */
      k.panel(40, 164, 590, 176, { tone: "gray", head: "soft", title: "희소 표현 (One-Hot)", right: "길이 = 어휘 수 V = 31" });
      var oh = function (p) { var r = []; for (var i = 0; i < 10; i++) r.push(i === p ? 1 : 0); r.push("…"); return r; };
      k.matrix(104, 230, [oh(2), oh(4)], {
        cw: 44, ch: 30, size: 14, rows: ["두통", "발열"], cols: ["환자", "는", "두통", "과", "발열", "을", "호소", "했다", "기침", "복통", "…"],
        tones: function (i, j, v) { return v === 1 ? (i ? "orange" : "blue") : null; },
        fills: function (i, j, v) { return v === 1 ? "solid" : "plain"; }
      });
      k.bullets(60, 314, 560, ["두 벡터의 내적 = 0 → '두통'과 '발열'이 비슷하다는 정보가 없다"], { size: 12.5, tone: "gray" });
      k.bullets(60, 333, 560, ["단어가 늘면 차원도 늘어난다 (실제 어휘는 수만 개 → 대부분 0)"], { size: 12.5, tone: "gray" });
      /* 밀집 */
      k.panel(650, 164, 590, 176, { tone: "orange", head: "soft", title: "밀집 표현 (Word2Vec, N = 8)", right: "Skip-gram · 100 에폭 학습 후" });
      k.matrix(712, 230, [[-1.50, 0.38, -0.16, 0.83, -1.29, 1.32, -0.03, 0.12], [-1.15, -1.07, 0.13, 0.93, -1.61, -0.06, -0.91, 0.78]], {
        cw: 48, ch: 30, size: 13, rows: ["두통", "발열"], cols: ["1", "2", "3", "4", "5", "6", "7", "8"], tones: signTone, fmt: f2
      });
      k.text(1190, 238, "코사인", { size: 12.5, weight: 700, color: "muted", anchor: "middle" });
      k.text(1190, 266, "0.60", { size: 24, weight: 800, tone: "orange", anchor: "middle" });
      k.text(1190, 286, "학습 전 0.06", { size: 11.5, color: "muted", anchor: "middle" });
      k.bullets(670, 314, 560, ["길이 N은 사람이 정함 (실무 100~300) · 모든 칸이 실수"], { size: 12.5, tone: "orange" });
      k.bullets(670, 333, 560, ["비슷한 문맥의 단어 → 벡터 방향이 비슷 (코사인 ↑)"], { size: 12.5, tone: "orange" });

      /* ② 윈도 슬라이딩 */
      k.section(40, 374, "② 윈도 슬라이딩으로 학습 샘플 만들기 (창 크기 w = 2)");
      var x = 60, boxes = [];
      SENT.forEach(function (w, i) {
        var bw = Math.max(52, k.textWidth(w, 15, { weight: 800 }) + 30);
        var tn = i === 2 ? "blue" : CTX.indexOf(w) >= 0 && i < 5 ? "orange" : "gray";
        boxes.push(k.box(x, 402, bw, 38, { tone: tn, fill: i === 2 ? "solid" : tn === "gray" ? "soft" : "tone", title: w, size: 15, r: 8 }));
        k.text(x + bw / 2, 456, String(i), { size: 11.5, color: "muted", anchor: "middle" });
        x += bw + 8;
      });
      k.box(boxes[0].x - 7, 393, boxes[4].x + boxes[4].w - boxes[0].x + 14, 52, { tone: "orange", fill: "ghost", dash: true, r: 10 });
      k.box(boxes[2].cx - 34, 384, 68, 18, { tone: "orange", fill: "plain", r: 9 });
      k.text(boxes[2].cx, 397.5, "창 ±2", { size: 12, weight: 800, tone: "orange", anchor: "middle" });
      var fx = x + 14;
      k.formula(fx, 393, 1240 - fx, 54, "중심 '두통'(위치 2) → 좌우 2칸 = 환자 · 는 · 과 · 발열\n중심이 한 칸씩 오른쪽으로 움직이며 반복", { size: 14, align: "left" });

      /* Skip-gram / CBOW 샘플 */
      k.panel(40, 470, 470, 96, { tone: "blue", head: "solid", title: "Skip-gram : 중심 → 주변 하나씩", right: "샘플 4개", tinted: true });
      CTX.forEach(function (c, i) {
        var bx = 56 + i * 112;
        k.box(bx, 518, 104, 32, { tone: "gray", fill: "plain", r: 8 });
        richLine(k, bx + 52, 539, 13.5, [["두통", "blue"], [" → ", "muted"], [c, "orange"]], { anchor: "middle" });
      });
      k.panel(526, 470, 330, 96, { tone: "orange", head: "solid", title: "CBOW : 주변 → 중심", right: "샘플 1개", tinted: true });
      k.box(542, 518, 298, 32, { tone: "gray", fill: "plain", r: 8 });
      richLine(k, 691, 539, 13.5, [["[환자 · 는 · 과 · 발열]", "orange"], [" → ", "muted"], ["두통", "blue"]], { anchor: "middle" });
      k.text(872, 486, "코퍼스 전체 샘플 수", { size: 13, weight: 800, color: "ink" });
      k.table(872, 494, [70, 104, 84, 110], [
        ["창 w", "Skip-gram", "CBOW", "배수"],
        ["1", "230", "132", "1.74배"],
        [{ t: "2 (기본)", tone: "purple" }, { t: "426", weight: 800 }, { t: "132", weight: 800 }, { t: "3.23배", weight: 800 }],
        ["3", "588", "132", "4.45배"]
      ], { rh: 18, size: 12 });

      /* ③ 결과 */
      k.section(40, 600, "③ 학습 후 가장 가까운 단어", { sub: "Skip-gram · 100 에폭 · 코사인 유사도 — 같은 자리에 들어가는 단어끼리 모인다" });
      [["두통", "기침 0.76 · 발열 0.60 · 복통 0.59", "pink"], ["해열제", "진통제 1.00 · 항생제 0.85 · 소화제 0.68", "teal"], ["의사", "약사 1.00 · 간호사 0.99 · 에게 0.76", "purple"]].forEach(function (r, i) {
        var bx = 40 + i * 404;
        k.box(bx, 614, 392, 34, { tone: r[2], fill: "tone", r: 8 });
        richLine(k, bx + 14, 636, 14, [[r[0], r[2]], ["  →  ", "muted"], [r[1], "ink"]], { weight: 700 });
      });
      k.flow(40, 660, [
        { t: "코퍼스 17문장" }, { t: "띄어쓰기 토큰", tone: "gray" }, { t: "윈도 샘플", tone: "orange" },
        { t: "신경망 학습", tone: "blue" }, { t: "W_in 행 = 단어 벡터", tone: "green" }, { t: "유사도 · 벡터 연산", tone: "purple" }
      ], { w: 1200, h: 36, gap: 22, size: 13 });
    }
  });

  /* ---------------------------------------------------------------- 2 */
  DSDiagram.register({
    id: "word2vec-2", sim: "word2vec", order: 2,
    title: "Word2Vec (2) — CBOW와 Skip-gram 구조 비교", short: "CBOW vs Skip-gram 구조",
    sub: "같은 얕은 신경망(입력층 → 투사층 h → 출력층 softmax)을 방향만 바꿔 쓴다 · 투사층에 활성 함수 없음 · 학습 후 W_in의 행이 단어 벡터",
    label: "NLP",
    draw: function (k) {
      k.section(40, 150, "① 구조 — 문장 '환자 는 두통 과 발열 …'에서 중심 '두통', 창 ±2");
      /* CBOW */
      var P = k.panel(40, 164, 590, 312, { tone: "orange", head: "solid", title: "CBOW (sg=0) — 주변 단어들 → 중심 단어", right: "빈칸 채우기" });
      k.text(116, 220, "입력층 · 원-핫 31", { size: 12, weight: 700, color: "muted", anchor: "middle" });
      var ins = CTX.map(function (w, i) { return k.box(56, 230 + i * 52, 120, 38, { tone: "orange", title: "x(" + w + ")", size: 14, r: 8 }); });
      var h1 = k.box(262, 276, 128, 84, { tone: "orange", fill: "mid", title: "투사층 h", sub: "4행의 평균 · 8차원", size: 15 });
      ins.forEach(function (b) { k.arrow(b.r[0] + 2, b.r[1], h1.l[0] - 2, h1.l[1] + (b.r[1] - h1.l[1]) * 0.25, { tone: "orange", width: 1.6 }); });
      k.text(219, 226, "W_in", { size: 13, weight: 800, tone: "orange", anchor: "middle" });
      k.text(219, 241, "공유", { size: 11.5, weight: 700, color: "muted", anchor: "middle" });
      var o1 = k.box(440, 276, 170, 84, { tone: "gray", fill: "plain", title: "출력층 softmax", sub: "31개 단어 확률", size: 15 });
      k.link(h1.r, o1.l, { tone: "orange", label: "W_out", labelDy: -2 });
      k.box(470, 384, 110, 36, { tone: "blue", fill: "solid", title: "→ 두통", size: 15, r: 8 });
      k.arrow(525, 362, 525, 382, { tone: "gray", width: 1.6 });
      k.text(56, 452, "주변 4개를 평균해 하나를 맞힌다 → 샘플이 적어 빠르고 자주 나오는 단어에 강함", { size: 12.5, color: "ink" });

      /* Skip-gram */
      k.panel(650, 164, 590, 312, { tone: "blue", head: "solid", title: "Skip-gram (sg=1) — 중심 단어 → 주변 단어", right: "주변 맞히기" });
      k.text(726, 290, "입력층 · 원-핫 31", { size: 12, weight: 700, color: "muted", anchor: "middle" });
      var in2 = k.box(666, 300, 120, 38, { tone: "blue", fill: "solid", title: "x(두통)", size: 14, r: 8 });
      var h2 = k.box(840, 278, 128, 84, { tone: "blue", fill: "mid", title: "투사층 h", sub: "W_in[두통] · 8차원", size: 15 });
      k.link(in2.r, h2.l, { tone: "blue", label: "W_in", labelDy: -4 });
      k.text(1150, 220, "출력층 softmax (31)", { size: 12, weight: 700, color: "muted", anchor: "middle" });
      CTX.forEach(function (w, i) {
        var b = k.box(1090, 230 + i * 52, 120, 38, { tone: "orange", title: "→ " + w, size: 14, r: 8 });
        k.arrow(h2.r[0] + 2, h2.r[1] + (b.l[1] - h2.r[1]) * 0.25, b.l[0] - 2, b.l[1], { tone: "blue", width: 1.6 });
      });
      k.text(1025, 226, "W_out", { size: 13, weight: 800, tone: "blue", anchor: "middle" });
      k.text(1025, 241, "공유", { size: 11.5, weight: 700, color: "muted", anchor: "middle" });
      k.text(666, 452, "주변 단어마다 따로 샘플 → 업데이트가 많아 드문 단어 · 작은 데이터에 강함", { size: 12.5, color: "ink" });

      /* ② 비교표 */
      k.section(40, 508, "② 같은 코퍼스 · 같은 창(w = 2)에서 비교");
      k.table(40, 520, [210, 250, 300], [
        ["항목", "CBOW", "Skip-gram"],
        ["학습 샘플 수", "132개", "426개 (CBOW의 3.23배)"],
        ["한 에폭 속도", { t: "빠름", weight: 800 }, "느림 (샘플이 많음)"],
        ["자주 나오는 단어", { t: "강함 (평균으로 안정적)", weight: 800 }, "보통"],
        ["드문 단어 · 작은 데이터", "약함 (평균 속에 묻힘)", { t: "강함 (쌍마다 따로 갱신)", weight: 800 }],
        ["cos(두통, 발열) · 100 에폭", "0.76", "0.60"],
        ["Gensim 옵션", "sg=0 (기본값)", "sg=1"]
      ], { rh: 25, size: 12.5 });

      k.panel(820, 494, 420, 104, { tone: "purple", head: "soft", title: "파라미터 수 (두 방식 같음)", right: "V = 31 · N = 8" });
      k.lines(836, 550, [
        { t: "W_in  V × N = 31 × 8 = 248   ·   W_out  N × V = 248" },
        { t: "합계 2 × V × N = **496**   ·   V = 10,000, N = 100 → 2,000,000", color: "muted" }
      ], { size: 12.5, lh: 22 });
      k.code(820, 610, 420, 88, [
        "model = Word2Vec(sentences, vector_size=8,",
        "    window=2, min_count=1, sg=1)   # 0 = CBOW",
        "model.wv.most_similar(\"두통\", topn=3)",
        "model.wv.similarity(\"두통\", \"발열\")  # 단어 벡터 = W_in 행"
      ], { size: 12 });
    }
  });

  /* ---------------------------------------------------------------- 3 */
  DSDiagram.register({
    id: "word2vec-3", sim: "word2vec", order: 3,
    title: "Word2Vec (3) — 샘플 하나의 순전파 → 손실 → 역전파", short: "한 샘플의 학습 계산",
    sub: "Skip-gram 샘플 (두통 → 발열) · 학습 전 가중치(seed 160) · V = 31 · N = 8 · η = 0.05 — 시뮬레이터 [한 번의 예측과 학습] 탭과 같은 숫자",
    label: "NLP",
    draw: function (k) {
      k.flow(40, 128, [
        { t: "① 원-핫 입력", tone: "blue" }, { t: "② 임베딩 조회 h", tone: "blue" }, { t: "③ 점수 u", tone: "blue" },
        { t: "④ softmax · 손실", tone: "blue" }, { t: "⑤ 출력층 기울기", tone: "red" }, { t: "⑥ 입력층 기울기", tone: "red" }
      ], { w: 1200, h: 32, gap: 20, size: 13 });

      k.section(40, 196, "순전파 — 확률을 계산하고 손실을 잰다", { tone: "blue" });
      /* ① × ② */
      k.matrix(60, 238, [[0, 0, 1, 0, "…"]], { cw: 30, ch: 30, size: 13, cols: ["0", "1", "2", "3", ""], tones: function (i, j, v) { return v === 1 ? "blue" : null; }, fills: function (i, j, v) { return v === 1 ? "solid" : "plain"; } });
      k.text(135, 288, "x(두통) · 1 × 31", { size: 12, weight: 700, color: "ink", anchor: "middle" });
      k.text(226, 262, "×", { size: 24, weight: 700, color: "ink", anchor: "middle" });
      var Win = [[0.43, -0.31, 0.46, 0.49, 0.42, 0.01, -0.16, 0.14], [0.03, -0.25, 0.27, -0.29, -0.18, -0.03, 0.29, 0.12], [-0.41, 0.33, 0.40, 0.10, -0.33, 0.13, -0.46, -0.16], [-0.02, 0.05, 0.21, -0.45, -0.35, 0.00, -0.42, 0.18]];
      k.matrix(296, 230, Win, { cw: 44, ch: 24, size: 12, rows: ["환자", "는", "두통", "과"], fmt: f2, weight: 600, tones: function (i) { return i === 2 ? "blue" : null; }, hl: [{ r: 2, c: 0, cs: 8, tone: "blue" }] });
      k.text(296 + 176, 340, "W_in (31 × 8) · 31행 중 4행", { size: 12, weight: 700, color: "muted", anchor: "middle" });
      k.text(678, 282, "=", { size: 24, weight: 700, color: "ink", anchor: "middle" });
      k.matrix(704, 266, [Win[2]], { cw: 44, ch: 30, size: 12.5, fmt: f2, tones: function () { return "blue"; }, fills: function () { return "mid"; } });
      k.text(704 + 176, 256, "h = W_in[두통] (8차원)", { size: 13, weight: 800, tone: "blue", anchor: "middle" });
      k.note(1074, 228, 166, 92, { tone: "blue", title: "곱셈 = 행 꺼내기", body: "원-핫 × 행렬은\n1인 칸의 행만 남음\n= Embedding lookup" });

      /* ③ ④ */
      var bxY = 356;
      k.box(40, bxY, 392, 112, { tone: "blue", fill: "plain", align: "left", valign: "top", r: 10, title: "③ 점수 u = h · v′(발열)", size: 14, titleColor: "tone",
        lines: [{ size: 13.5, t: "v′(발열) = W_out의 '발열' 열" }, { size: 13.5, t: "[−0.19, −0.05, −0.28, −0.27, 0.31, −0.40, 0.00, 0.33]", color: "muted" }, { size: 13.5, t: "u = (−0.41)(−0.19) + 0.33(−0.05) + … = **−0.289**" }] });
      k.box(444, bxY, 392, 112, { tone: "blue", fill: "plain", align: "left", valign: "top", r: 10, title: "④ softmax — 31개 점수를 확률로", size: 14, titleColor: "tone",
        lines: [{ size: 13.5, t: "p(발열) = e^(−0.289) ÷ Σ e^u" }, { size: 13.5, t: "= 0.749 ÷ 33.286 = **0.0225**" }, { size: 13.5, t: "31개 단어 중 28위 (1위 '과' 0.063)", color: "muted" }] });
      k.box(848, bxY, 392, 112, { tone: "blue", fill: "plain", align: "left", valign: "top", r: 10, title: "④ 교차 엔트로피 손실", size: 14, titleColor: "tone",
        lines: [{ size: 13.5, t: "L = −log p(정답) = −log 0.0225 = **3.794**" }, { size: 13.5, t: "아무렇게나 고를 때 log 31 = 3.434보다도 크다", color: "muted" }, { size: 13.5, t: "→ 학습 전이라 정답 확률이 낮다", tone: "red" }] });

      k.section(40, 500, "역전파 — 정답 쪽으로 벡터를 당긴다", { tone: "red" });
      /* ⑤ */
      k.panel(40, 514, 592, 150, { tone: "red", head: "soft", title: "⑤ 출력층: 오차 e = p − y", right: "e(발열) = 0.0225 − 1 = −0.9775" });
      k.text(56, 572, "v′(발열) ← v′ − η · e · h  =  v′ + 0.0489 · h", { size: 13, weight: 800, color: "ink" });
      k.matrix(124, 586, [[-0.19, -0.05, -0.28, -0.27, 0.31, -0.40, 0.00, 0.33], [-0.21, -0.03, -0.27, -0.26, 0.30, -0.39, -0.02, 0.33]], { cw: 44, ch: 26, size: 12, fmt: f2, rows: ["전", "후"], tones: function (i) { return i ? "red" : null; } });
      k.text(484, 604, "정답 열은 h 쪽으로", { size: 12, weight: 700, tone: "red" });
      k.text(484, 622, "오답 열은 반대쪽으로", { size: 12, weight: 700, color: "muted" });
      k.text(484, 640, "softmax: 31열 전부 수정", { size: 12, color: "muted" });
      /* ⑥ */
      k.panel(648, 514, 592, 150, { tone: "red", head: "soft", title: "⑥ 입력층: '두통' 1행만 수정", right: "∂L/∂h = Σ e·v′" });
      k.text(664, 572, "W_in[두통] ← W_in[두통] − η · ∂L/∂h", { size: 13, weight: 800, color: "ink" });
      k.matrix(732, 586, [[-0.41, 0.33, 0.40, 0.10, -0.33, 0.13, -0.46, -0.16], [-0.42, 0.32, 0.39, 0.08, -0.31, 0.10, -0.46, -0.15]], { cw: 44, ch: 26, size: 12, fmt: f2, rows: ["전", "후"], tones: function (i) { return i ? "red" : null; } });
      k.text(1092, 604, "같은 샘플 손실", { size: 12, weight: 700, color: "muted" });
      k.text(1092, 628, "3.794 → 3.714", { size: 15, weight: 800, tone: "red" });
      k.text(1092, 646, "다른 30행은 그대로", { size: 12, color: "muted" });

      richLine(k, 40, 690, 13, [["네거티브 샘플링(k = 3)", "purple"], [" : 정답 1 + 오답 3개만 σ로 판별 → 곱셈 N×V = 248 대신 N×(k+1) = 32 · V = 10,000, N = 100이면 1,000,000 → 400", "ink"]], { weight: 700 });
    }
  });
})();
