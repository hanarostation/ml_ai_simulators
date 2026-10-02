/* LDA 깁스 샘플링 — 알고리즘 구성도 (강의 필기자료 'LDA 학습 과정 한눈에 보기' 양식)
   예제: 시뮬레이터 '처음 배정' 그대로 — 문서 3개 · 주제 K = 2 · 문서3의 '바나나' */
(function () {
  var TONE = { 1: "orange", 2: "blue", 0: "red" };

  /* 단어 칩: 주제 번호 배지(①·②)가 붙은 작은 상자. t = 1 | 2 | 0(딱지 뗌) */
  function chip(k, x, y, w, h, word, t) {
    var tn = TONE[t];
    k.box(x, y, w, h, { tone: tn, fill: t === 0 ? "plain" : "tone", dash: t === 0, r: 7 });
    k.text(x + 6, y + h / 2 + 4.5, word, { size: 11.5, weight: 700, color: "ink" });
    k.circle(x + w - 9, y + h / 2, 7, { tone: tn, fill: "solid", label: t ? String(t) : "?", size: 11.5 });
  }
  function docRow(k, x, y, label, words, topics, o) {
    o = o || {};
    var h = o.h || 30, w = o.w || 63, gap = o.gap || 3;
    k.text(x, y, label, { size: 13, weight: 800, color: "ink" });
    words.forEach(function (wd, i) { chip(k, x + i * (w + gap), y + 8, w, h, wd, topics[i]); });
  }
  /* 한 줄 안에서 색이 바뀌는 글 (tspan) — parts: [[글, 톤|"ink"|"muted"], ...] */
  function richLine(k, x, y, size, parts, o) {
    o = o || {};
    var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var s = '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-weight="' + (o.weight || 800) + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + ' class="dg-ink" xml:space="preserve">';
    parts.forEach(function (p) {
      if (p[1] === "ink") s += esc(p[0]);
      else if (p[1] === "muted") s += '<tspan class="dg-muted">' + esc(p[0]) + "</tspan>";
      else s += '<tspan class="dg-t-' + p[1] + '"><tspan class="dg-tc">' + esc(p[0]) + "</tspan></tspan>";
    });
    k.raw(s + "</text>");
  }
  function head(k, x, y, n, title, sub) {
    k.circle(x + 28, y + 30, 15, { tone: "ink", fill: "solid", label: String(n), size: 15 });
    k.text(x + 52, y + 38, title, { size: 21, weight: 800, color: "ink" });
    k.text(x + 52, y + 58, sub, { size: 12.5, color: "muted" });
  }
  /* 가로 막대 두 개 (주제1 주황 · 주제2 파랑) */
  function pairBars(k, x, y, vals, labels, scale) {
    [0, 1].forEach(function (i) {
      var yy = y + i * 24, tn = i ? "blue" : "orange";
      k.text(x, yy + 13, "주제 " + (i + 1), { size: 12.5, weight: 800, tone: tn });
      k.rect(x + 52, yy + 2, Math.max(4, vals[i] * scale), 16, { tone: tn, fill: "solid", r: 3 });
      k.text(x + 60 + vals[i] * scale, yy + 14.5, labels[i], { size: 12.5, weight: 800, color: "ink" });
    });
  }

  DSDiagram.register({
    id: "lda-gibbs-sampling-1", sim: "lda-gibbs-sampling", order: 1,
    title: "LDA (1) — 깁스 샘플링 학습 과정 한눈에 보기", short: "깁스 샘플링 4단계",
    sub: "문서 3개 · 주제 개수 K = 2 (사람이 미리 정함) · 단어 하나의 딱지를 떼고 → 두 질문으로 확률 계산 → 주사위로 새 주제를 뽑는다",
    label: "Text Mining",
    draw: function (k) {
      var X = [40, 344, 648, 952], W = 286, Y0 = 130, PH = 470, IW = 266;
      var D = [["사과", "바나나", "과일", "사과"], ["축구", "골", "경기", "축구"], ["바나나", "축구", "과일", "골"]];
      var INIT = [[1, 2, 1, 2], [2, 1, 2, 1], [1, 2, 2, 1]];
      var DONE = [[1, 1, 1, 1], [2, 2, 2, 2], [1, 2, 1, 2]];
      X.forEach(function (x, i) {
        k.panel(x, Y0, W, PH, { tone: "gray" });
        if (i < 3) k.arrow(x + W + 2, Y0 + PH / 2, x + W + 16, Y0 + PH / 2, { tone: "ink", width: 2.4, headSize: 9 });
      });

      /* ① 초기화 */
      var x = X[0] + 10;
      head(k, X[0], Y0, 1, "초기화", "모든 단어에 주제를 무작위로 배정");
      D.forEach(function (doc, d) { docRow(k, x + 4, 216 + d * 66, "문서" + (d + 1), doc, INIT[d]); });
      k.text(x + 4, 424, "배지 =", { size: 12.5, color: "muted" });
      k.circle(x + 62, 420, 8, { tone: "orange", fill: "solid", label: "1", size: 11.5 });
      k.text(x + 76, 424, "주제 1", { size: 13, weight: 800, tone: "orange" });
      k.circle(x + 148, 420, 8, { tone: "blue", fill: "solid", label: "2", size: 11.5 });
      k.text(x + 162, 424, "주제 2", { size: 13, weight: 800, tone: "blue" });
      k.box(x, 444, IW, 140, { tone: "gray", fill: "plain", r: 8 });
      k.text(x + 12, 470, "동전 던지기로 정한 상태 → 지금은 엉망", { size: 13, weight: 800, color: "ink" });
      k.bullets(x + 12, 498, 246, ["같은 '사과'인데 주제 1, 주제 2로 갈림", "'축구'도 마찬가지로 제각각", "과일 단어와 스포츠 단어가 뒤섞임"], { size: 12, tone: "gray", lh: 21 });
      k.text(x + 12, 570, "→ 반복하면서 점점 고쳐 나간다", { size: 13, weight: 800, tone: "red" });

      /* ② 주제 추정 */
      x = X[1] + 10;
      head(k, X[1], Y0, 2, "주제 추정", "단어 하나를 골라 주제를 다시 생각");
      k.text(x + 4, 210, "문서3 — '바나나'의 주제 딱지를 떼어 냄", { size: 12.5, weight: 800, color: "ink" });
      ["바나나", "축구", "과일", "골"].forEach(function (wd, i) { chip(k, x + 4 + i * 66, 216, 63, 30, wd, [0, 2, 2, 1][i]); });
      k.box(x, 256, IW, 110, { tone: "purple", fill: "plain", r: 8 });
      k.text(x + 12, 278, "① 문서3은 어떤 주제를 좋아하나?", { size: 13.5, weight: 800, tone: "purple" });
      k.text(x + 12, 296, "나머지 3개: 주제1 1개(골) · 주제2 2개", { size: 11.5, color: "muted" });
      pairBars(k, x + 12, 302, [0.4, 0.6], ["0.40", "0.60"], 210);
      k.text(x + 12, 358, "(1+1)÷(3+2)=0.40 · (2+1)÷(3+2)=0.60", { size: 11.5, color: "muted" });
      k.box(x, 374, IW, 110, { tone: "green", fill: "plain", r: 8 });
      k.text(x + 12, 396, "② '바나나'는 어떤 주제와 친한가?", { size: 13.5, weight: 800, tone: "green" });
      k.text(x + 12, 414, "다른 곳의 '바나나': 문서1에서 주제2로 1번", { size: 11.5, color: "muted" });
      pairBars(k, x + 12, 420, [1 / 11, 2 / 12], ["0.091", "0.167"], 700);
      k.text(x + 12, 476, "(0+1)÷(5+6)=0.091 · (1+1)÷(6+6)=0.167", { size: 11.5, color: "muted" });
      k.box(x, 492, IW, 66, { tone: "amber", fill: "tone", r: 8 });
      k.text(x + 12, 512, "① × ② 곱하기", { size: 13.5, weight: 800, color: "ink" });
      k.text(x + 12, 532, "주제 1 : 0.40 × 0.091", { size: 12.5, weight: 700, tone: "orange" });
      k.text(x + 254, 532, "≈ 0.036", { size: 15, weight: 800, tone: "orange", anchor: "end" });
      k.text(x + 12, 550, "주제 2 : 0.60 × 0.167", { size: 12.5, weight: 700, tone: "blue" });
      k.text(x + 254, 550, "≈ 0.100", { size: 15, weight: 800, tone: "blue", anchor: "end" });
      k.text(x + 4, 576, "※ 1단계 배정 그대로 계산한 첫 바퀴 값", { size: 11.5, color: "muted" });
      k.text(x + 4, 592, "※ 0이 안 나오게 개수에 1씩 더함 (α = β = 1)", { size: 11.5, color: "muted" });

      /* ③ 추출 */
      x = X[2] + 10;
      head(k, X[2], Y0, 3, "추출", "확률대로 주사위를 굴려 새 주제 뽑기");
      k.box(x, 198, IW, 106, { tone: "gray", fill: "plain", r: 8 });
      k.text(x + 12, 222, "곱한 값을 확률로 바꾸기", { size: 13.5, weight: 800, color: "ink" });
      k.text(x + 12, 248, "0.036 : 0.100 → 27% : 73%", { size: 16, weight: 800, color: "ink" });
      var bw = IW - 24;
      k.rect(x + 12, 262, bw * 0.27, 28, { tone: "orange", fill: "solid", r: 4 });
      k.rect(x + 12 + bw * 0.27, 262, bw * 0.73, 28, { tone: "blue", fill: "solid", r: 4 });
      k.text(x + 12 + bw * 0.135, 281, "27%", { size: 12.5, weight: 800, color: "on", anchor: "middle" });
      k.text(x + 12 + bw * (0.27 + 0.365), 281, "주제 2 · 73%", { size: 12.5, weight: 800, color: "on", anchor: "middle" });
      var dx = x + 16, dy = 336;
      k.box(dx, dy, 76, 76, { tone: "ink", fill: "plain", r: 12, thick: true });
      [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]].forEach(function (p) {
        k.circle(dx + 76 * p[0], dy + 76 * p[1], 6, { tone: "ink", fill: "solid" });
      });
      k.text(dx + 38, dy + 98, "주사위", { size: 12.5, weight: 700, color: "ink", anchor: "middle" });
      k.arrow(dx + 82, dy + 24, x + 116, 337, { tone: "ink", width: 1.8 });
      k.arrow(dx + 82, dy + 52, x + 116, 413, { tone: "ink", width: 1.8 });
      chip(k, x + 118, 322, 63, 30, "바나나", 2);
      k.text(x + 188, 342, "대부분 (73%)", { size: 12.5, weight: 800, tone: "blue" });
      chip(k, x + 118, 398, 63, 30, "바나나", 1);
      k.text(x + 188, 418, "가끔 (27%)", { size: 12.5, weight: 800, tone: "orange" });
      k.box(x, 456, IW, 128, { tone: "gray", fill: "plain", r: 8 });
      k.text(x + 12, 480, "왜 무조건 높은 쪽을 안 고르나?", { size: 13.5, weight: 800, color: "ink" });
      k.bullets(x + 12, 506, 250, ["처음의 엉터리 배치에 갇히지 않으려고", "가끔 다른 선택을 해 봐야", "더 좋은 배치를 찾는다"], { size: 12, tone: "gray", lh: 20 });
      k.text(x + 12, 572, "→ 확률에 비례해 '뽑는다' = Sampling", { size: 13, weight: 800, tone: "red" });

      /* ④ 갱신 후 반복 */
      x = X[3] + 10;
      head(k, X[3], Y0, 4, "갱신 후 반복", "개수표를 고치고 다음 단어로");
      k.flow(x, 202, ["주제 반영", "개수 갱신", "다음 단어"], { w: IW, h: 30, gap: 18, size: 12, tone: "gray", fill: "plain" });
      k.text(x + 4, 254, "모든 단어를 수백~수천 바퀴 반복한 뒤", { size: 12.5, weight: 800, tone: "red" });
      D.forEach(function (doc, d) { docRow(k, x + 4, 274 + d * 50, "문서" + (d + 1), doc, DONE[d], { h: 28 }); });
      k.box(x, 418, IW, 72, { tone: "gray", fill: "plain", r: 8 });
      k.chip(x + 10, 428, "주제 1", { tone: "orange", size: 12.5 });
      k.text(x + 88, 446, "과일: 사과 · 바나나 · 과일", { size: 12.5, color: "ink" });
      k.chip(x + 10, 456, "주제 2", { tone: "blue", size: 12.5 });
      k.text(x + 88, 474, "스포츠: 축구 · 골 · 경기", { size: 12.5, color: "ink" });
      k.text(x + 4, 512, "문서3 = 과일 50% + 스포츠 50%", { size: 13, weight: 800, color: "ink" });
      k.rect(x + 4, 520, 129, 24, { tone: "orange", fill: "solid", r: 4 });
      k.rect(x + 133, 520, 129, 24, { tone: "blue", fill: "solid", r: 4 });
      k.text(x + 68, 537, "주제 1 · 50%", { size: 12, weight: 800, color: "on", anchor: "middle" });
      k.text(x + 197, 537, "주제 2 · 50%", { size: 12, weight: 800, color: "on", anchor: "middle" });
      k.text(x + 4, 570, "배정이 크게 안 바뀌면 → 학습 종료", { size: 12.5, weight: 800, color: "ink" });
      k.text(x + 4, 588, "※ 번호는 우연 · 주제 이름은 사람이 붙인다", { size: 11.5, color: "muted" });

      /* 되돌아가는 화살표 */
      var bx = X[3] + W / 2, ax = X[1] + W / 2, by = Y0 + PH;
      k.path("M" + bx + " " + (by + 2) + " V618 H" + ax + " V" + (by + 12), { tone: "red", width: 1.8, dash: "6 5" });
      k.arrow(ax, by + 14, ax, by + 3, { tone: "red", width: 1.8 });
      k.box(X[1] + 236, 604, 500, 28, { tone: "red", fill: "plain", r: 14 });
      k.text(X[1] + 486, 623, "다음 단어로 넘어가 ②~③단계 반복 (모든 단어 × 수백~수천 바퀴)", { size: 13, weight: 800, tone: "red", anchor: "middle" });

      /* 핵심 공식 */
      k.box(40, 644, 1200, 52, { tone: "ink", fill: "plain", r: 10, thick: true });
      k.box(56, 654, 92, 32, { tone: "ink", fill: "solid", r: 6, title: "핵심 공식", size: 14 });
      richLine(k, 166, 676, 17, [["이 단어가 주제 k일 가능성 ∝ ", "ink"], ["(이 문서가 주제 k를 얼마나 쓰나)", "purple"], ["  ×  ", "ink"], ["(주제 k가 이 단어를 얼마나 쓰나)", "green"]]);
      k.text(1224, 676, "① 문서-주제  ② 주제-단어", { size: 12.5, color: "muted", anchor: "end" });
    }
  });

  DSDiagram.register({
    id: "lda-gibbs-sampling-2", sim: "lda-gibbs-sampling", order: 2,
    title: "LDA (2) — 개수표로 보는 계산과 α · β의 역할", short: "개수표 · 수식 · α·β",
    sub: "깁스 샘플링은 두 개수표(문서-주제 · 주제-단어)만 들고 다닌다 — 딱지를 뗄 때 1을 빼고, 새 주제를 뽑으면 1을 더한다",
    label: "Text Mining",
    draw: function (k) {
      var W6 = ["사과", "바나나", "과일", "축구", "골", "경기"];
      /* ① 개수표 */
      k.section(40, 152, "① 딱지를 뗀 직후의 개수표 — 문서3의 '바나나' 차례", { tone: "blue" });
      k.panel(40, 168, 700, 250, { tone: "gray" });
      k.text(64, 200, "문서-주제 개수 n(d, k)", { size: 14, weight: 800, tone: "purple" });
      k.matrix(116, 232, [[2, 2], [2, 2], [1, 2]], {
        cw: 62, ch: 34, size: 15, rows: ["문서1", "문서2", "문서3"], cols: ["주제 1", "주제 2"],
        tones: function (i, j) { return i === 2 ? (j ? "blue" : "orange") : null; },
        hl: [{ r: 2, c: 0, cs: 2, tone: "purple" }]
      });
      k.text(64, 362, "문서3: '바나나'를 빼고 3개", { size: 12.5, weight: 700, color: "ink" });
      k.text(64, 380, "→ 주제1 1개(골) · 주제2 2개", { size: 12.5, color: "muted" });
      k.text(64, 398, "문서3의 나머지 단어 수 n(d) = 3", { size: 12.5, color: "muted" });

      k.text(290, 200, "주제-단어 개수 n(k, w)", { size: 14, weight: 800, tone: "green" });
      k.matrix(346, 232, [[1, 0, 1, 1, 2, 0], [1, 1, 1, 2, 0, 1]], {
        cw: 52, ch: 34, size: 15, rows: ["주제 1", "주제 2"], cols: W6,
        tones: function (i, j) { return j === 1 ? (i ? "blue" : "orange") : null; },
        hl: [{ r: 0, c: 1, rs: 2, tone: "green" }]
      });
      k.text(666, 254, "합 5", { size: 13, weight: 800, tone: "orange" });
      k.text(666, 288, "합 6", { size: 13, weight: 800, tone: "blue" });
      k.lines(290, 330, [
        { t: "**'바나나' 열**: 주제1 0번, 주제2 1번 (문서1의 바나나)", color: "ink" },
        { t: "**행 합** n(k): 주제1 단어 5개 · 주제2 단어 6개", color: "ink" },
        { t: "어휘 수 V = 6 · 주제 수 K = 2 · 전체 단어 12개", color: "muted" }
      ], { size: 12.5, lh: 22 });

      /* ② 수식 */
      k.section(760, 152, "② 수식", { tone: "blue" });
      k.formula(760, 168, 480, 66, "P(z = k)  ∝  (n(d,k) + α) ÷ (n(d) + K·α)\n×  (n(k,w) + β) ÷ (n(k) + V·β)", { size: 15, weight: 700 });
      k.box(760, 244, 234, 82, { tone: "purple", fill: "tone", align: "left", title: "① 문서-주제 θ", size: 14, lines: [{ t: "이 문서가 주제 k를 얼마나 쓰나", color: "muted" }, { t: "α = 문서마다 주제 비율 덧셈값" }] });
      k.box(1006, 244, 234, 82, { tone: "green", fill: "tone", align: "left", title: "② 주제-단어 φ", size: 14, lines: [{ t: "주제 k가 이 단어를 얼마나 쓰나", color: "muted" }, { t: "β = 주제마다 단어 비율 덧셈값" }] });
      k.note(760, 338, 480, 80, { tone: "red", title: "개수에 α · β를 더하는 이유", body: "한 번도 안 나온 조합이 0이면 곱 전체가 0 → 그 주제로는 영영 못 간다.\n작은 값을 더해 어떤 주제든 조금은 가능하게 둔다 (스무딩)." });

      /* ③ α·β 비교 */
      k.section(40, 452, "③ 같은 칸, 다른 α · β — 시뮬레이터의 두 설정", { tone: "blue" });
      k.table(56, 466, [170, 250, 330, 230, 190], [
        ["설정", "① θ (주제1 · 주제2)", "② φ (주제1 · 주제2)", "곱 (주제1 · 주제2)", "뽑힐 확률"],
        [{ t: "α = 1 · β = 1", tone: "orange" }, "2/5 = 0.40 · 3/5 = 0.60", "1/11 = 0.091 · 2/12 = 0.167", "0.036 · 0.100", { t: "27% : 73%", weight: 800 }],
        [{ t: "α = 0.1 · β = 0.01", tone: "blue" }, "1.1/3.2 = 0.34 · 2.1/3.2 = 0.66", "0.01/5.06 = 0.002 · 1.01/6.06 = 0.167", "0.0007 · 0.109", { t: "0.6% : 99.4%", weight: 800 }]
      ], { rh: 30, size: 12.5 });
      k.note(56, 562, 586, 52, { tone: "orange", title: "α · β = 1 (도식과 같음)", body: "단어 12개짜리 작은 데이터에선 1이 실제 개수만큼 커서 계속 흔들린다", size: 13 });
      k.note(654, 562, 586, 52, { tone: "blue", title: "α · β 작게 (0.1 · 0.01)", body: "개수 차이가 그대로 드러나 결정이 빨라짐 → 몇 바퀴 만에 과일 · 스포츠로 갈림", size: 13 });

      /* 파이프라인 */
      k.flow(40, 640, [
        { t: "문서 모으기", s: "의료 상담 · 리뷰 등" },
        { t: "형태소 분석", s: "명사만 추출", tone: "blue" },
        { t: "BoW 개수표", s: "문서 × 단어", tone: "blue" },
        { t: "LDA (K 지정)", s: "깁스 샘플링 반복", tone: "purple" },
        { t: "θ · φ 추정", s: "(개수 + α·β) 비율", tone: "green" },
        { t: "주제 이름 붙이기", s: "사람이 대표 단어 보고", tone: "orange" }
      ], { label: "분석 흐름", w: 1200, h: 50, gap: 22 });
    }
  });
})();
