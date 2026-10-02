/* CNN 합성곱 · 풀링 — 알고리즘 구성도 (강의 필기자료 'CNN (1) 구조와 합성곱 프로세스', 'CNN (2) 풀링 프로세스' 양식) */
DSDiagram.register({
  id: "cnn-conv-pooling-1", sim: "cnn-conv-pooling", order: 1,
  title: "CNN (1) — 구조와 합성곱 프로세스", short: "구조와 합성곱",
  sub: "Convolutional Neural Network · 합성곱 연산으로 이미지에서 중요한 특징(Feature)을 자동으로 추출하는 신경망",
  label: "CNN Model",
  draw: function (k) {
    /* ① 전체 구조 (시뮬레이터 '전체 구조' 탭 기본값: 32×32×3, 3×3, P1 S1, 필터 32·64, FC 64, 출력 10) */
    k.section(40, 152, "① CNN 전체 구조 — 점진적으로 압축하며 중요한 정보를 보존");
    k.panel(40, 166, 1200, 120, { tone: "blue", tinted: true });
    var st = [
      { t: "입력 이미지", s: "32 × 32 × 3", l: "RGB 3채널", tone: "gray", fill: "plain" },
      { t: "Conv1", s: "3×3 필터 32개", l: "32 × 32 × 32", tone: "blue" },
      { t: "Pooling", s: "Max 2×2 · s2", l: "16 × 16 × 32", tone: "gray", fill: "soft" },
      { t: "Conv2", s: "3×3 필터 64개", l: "16 × 16 × 64", tone: "blue" },
      { t: "Pooling", s: "Max 2×2 · s2", l: "8 × 8 × 64", tone: "gray", fill: "soft" },
      { t: "Flatten", s: "1차원 벡터로", l: "4,096", tone: "purple" },
      { t: "Dense (FC)", s: "완전연결 · ReLU", l: "64", tone: "purple" },
      { t: "출력", s: "softmax", l: "10 클래스", tone: "ink", fill: "plain" }
    ];
    var bw = 126, gap = 22, x0 = 58, by = 198, boxes = [];
    st.forEach(function (s, i) {
      boxes.push(k.box(x0 + i * (bw + gap), by, bw, 62, { tone: s.tone, fill: s.fill || "tone", title: s.t, sub: s.s, size: 14, subSize: 11.5,
        lines: [{ t: s.l, size: 12.5, weight: 700, color: "ink" }] }));
      if (i) k.arrow(x0 + i * (bw + gap) - gap + 3, by + 31, x0 + i * (bw + gap) - 3, by + 31, { tone: "gray", width: 1.6, headSize: 7 });
    });
    /* Conv → Pool 반복 구간 표시 */
    var bx1 = boxes[1].x, bx2 = boxes[4].x + bw;
    k.path("M" + bx1 + " 190 V184 H" + bx2 + " V190", { tone: "blue", width: 1.4 });
    k.text((bx1 + bx2) / 2, 180, "Conv → Pooling 을 반복하며 특징 추출 + 크기 축소", { size: 12.5, weight: 700, anchor: "middle", tone: "blue" });
    k.text(boxes[6].x + bw / 2, 180, "압축된 정보로 분류", { size: 12.5, weight: 700, anchor: "middle", tone: "purple" });
    k.text(58, 278, "파라미터 수: Conv1 (3·3·3 + 1)·32 = 896 · Conv2 (3·3·32 + 1)·64 = 18,496 · 풀링 0 · FC (4,096 + 1)·64 = 262,208 · 출력 (64 + 1)·10 = 650 → 합계 282,250",
      { size: 12.5, color: "muted" });

    /* ② 합성곱 프로세스 (강의 예제 4×4 · 세로 경계 필터) */
    k.section(40, 318, "② Convolution Process — Padding → Filtering → Sliding", { tone: "teal" });
    k.panel(40, 332, 1200, 266, { tone: "teal", tinted: true });
    var inp = [[1, 2, 3, 3], [2, 3, 3, 3], [3, 3, 2, 3], [2, 3, 3, 3]];
    var pad = [], i, j;
    for (i = 0; i < 6; i++) { pad.push([]); for (j = 0; j < 6; j++) pad[i].push(i === 0 || j === 0 || i === 5 || j === 5 ? 0 : inp[i - 1][j - 1]); }
    var isPad = function (r, c) { return r === 0 || c === 0 || r === 5 || c === 5; };
    var out = [[-5, -3, -1, 6], [-8, -2, -1, 8], [-9, -1, 0, 8], [-6, 0, 0, 5]];
    var flt = [[1, 0, -1], [1, 0, -1], [1, 0, -1]];
    var win = [[1, 2, 3], [2, 3, 3], [3, 3, 2]];
    var neg = function (v) { return String(v).replace("-", "−"); };

    /* 1. Padding */
    k.text(60, 360, "1. Padding — 가장자리를 0으로 채움", { size: 14, weight: 800, tone: "teal" });
    k.matrix(64, 404, inp, { cw: 28, ch: 26, size: 13, tones: function () { return "purple"; }, fmt: neg,
      hl: [{ r: 0, c: 0, rs: 3, cs: 3, tone: "blue" }] });
    k.text(120, 528, "입력 4 × 4", { size: 12.5, weight: 800, anchor: "middle", color: "ink" });
    k.text(120, 546, "픽셀 값 (밝기)", { size: 11.5, anchor: "middle", color: "muted" });
    k.arrow(184, 456, 214, 456, { tone: "gray" });
    k.matrix(222, 378, pad, { cw: 28, ch: 26, size: 13, fmt: neg,
      tones: function (r, c) { return isPad(r, c) ? "red" : "purple"; },
      hl: [{ r: 1, c: 1, rs: 3, cs: 3, tone: "blue" }] });
    k.text(306, 554, "패딩 적용 6 × 6 (P = 1)", { size: 12.5, weight: 800, anchor: "middle", color: "ink" });
    k.text(306, 572, "빨간 칸 = 새로 채운 0 · 파란 테 = 첫 계산 창", { size: 11.5, anchor: "middle", color: "muted" });

    /* 2. Filtering */
    k.text(426, 360, "2. Filtering — 창 ⊙ 필터 (원소별 곱) → 모두 더함", { size: 14, weight: 800, tone: "teal" });
    k.matrix(430, 404, win, { cw: 32, ch: 30, size: 14, tones: function () { return "blue"; } });
    k.text(478, 512, "창 (Window)", { size: 12.5, weight: 800, anchor: "middle", color: "ink" });
    k.text(540, 457, "⊙", { size: 22, weight: 700, anchor: "middle", color: "muted" });
    k.matrix(560, 404, flt, { cw: 32, ch: 30, size: 14, fmt: neg, tones: function (r, c, v) { return v > 0 ? "orange" : v < 0 ? "blue" : "gray"; } });
    k.text(608, 512, "필터 3 × 3", { size: 12.5, weight: 800, anchor: "middle", color: "ink" });
    k.text(608, 530, "세로 경계 · 가중치(Node)", { size: 11.5, anchor: "middle", color: "muted" });
    k.box(672, 382, 236, 140, { tone: "teal", fill: "plain", r: 8, align: "left", valign: "top", title: "원소별 곱의 합", titleColor: "ink", size: 13.5,
      lines: [
        { t: "(1×1) + (2×0) + (3×−1)", size: 12.5 },
        { t: "+ (2×1) + (3×0) + (3×−1)", size: 12.5 },
        { t: "+ (3×1) + (3×0) + (2×−1)", size: 12.5 },
        { t: "= (1−3) + (2−3) + (3−2) = **−2**", size: 13, weight: 700, tone: "red" }
      ] });
    k.arrow(912, 452, 944, 452, { tone: "red" });

    /* 3. Sliding */
    k.text(950, 360, "3. Sliding — 한 칸씩 옮기며 반복", { size: 14, weight: 800, tone: "teal" });
    k.matrix(954, 392, out, { cw: 34, ch: 30, size: 13.5, fmt: neg,
      tones: function (r, c, v) { return v > 0 ? "orange" : v < 0 ? "blue" : "gray"; },
      fills: function (r, c) { return r === 1 && c === 1 ? "mid" : "tone"; },
      hl: [{ r: 1, c: 1, tone: "red" }] });
    k.text(1022, 530, "출력 특성맵 4 × 4", { size: 12.5, weight: 800, anchor: "middle", color: "ink" });
    k.text(1022, 548, "빨간 칸 = 방금 계산한 −2", { size: 11.5, anchor: "middle", tone: "red" });
    k.box(1104, 392, 124, 120, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "Stride", titleColor: "ink", size: 13,
      lines: [{ t: "s1 → 4 × 4", size: 12 }, { t: "(입력과 같음)", size: 11.5, color: "muted" }, { t: "s2 → 2 × 2", size: 12 }, { t: "[−5 −1; −9 0]", size: 11.5, color: "muted" }] });
    k.formula(438, 562, 790, 28, "출력 크기 = ⌊(N + 2P − F) / S⌋ + 1 = ⌊(4 + 2·1 − 3) / 1⌋ + 1 = **4**   (P = 0이면 2 × 2로 줄어듦)", { size: 13.5, weight: 600 });

    /* ③ 필터 개수 = 출력 채널 수 */
    k.section(40, 628, "③ 필터의 개수가 곧 출력 채널의 개수", { tone: "purple" });
    k.note(40, 642, 390, 58, { tone: "blue", title: "필터 1개 → 특성맵 1장", body: "필터 32개 → 출력 32 × 32 × 32 (필터마다 다른 특징)" });
    k.note(445, 642, 390, 58, { tone: "purple", title: "컬러 입력이면 필터도 3 × 3 × 3", body: "채널 3장을 함께 덮고 더함 → (3·3·3 + 1)·32 = 896개" });
    k.note(850, 642, 390, 58, { tone: "orange", title: "필터 값은 학습으로 정해진다", body: "무작위로 시작해 역전파로 갱신 — 세로 경계는 예시" });
  }
});

DSDiagram.register({
  id: "cnn-conv-pooling-2", sim: "cnn-conv-pooling", order: 2,
  title: "CNN (2) — 풀링 프로세스", short: "풀링 프로세스",
  sub: "Pooling · 합성곱으로 뽑아 낸 특성맵을 축소(Down Sampling)하여 크기를 줄이되 중요한 정보는 남기는 작업",
  label: "CNN Model",
  draw: function (k) {
    var fm = [[-5, -3, -1, 6], [-8, -2, -1, 8], [-9, -1, 0, 8], [-6, 0, 0, 5]];
    var q = function (i, j) { return i < 2 ? (j < 2 ? "blue" : "green") : (j < 2 ? "orange" : "purple"); };

    k.section(40, 152, "① 왜 축소하는가 — 차원 축소 (Down Sampling)");
    k.panel(40, 170, 1200, 112, { tone: "blue", tinted: true });
    var a = k.box(70, 196, 200, 60, { tone: "blue", title: "합성곱 출력 특성맵", sub: "4 × 4 · 특징이 담긴 행렬", size: 15 });
    var b = k.box(318, 196, 200, 60, { tone: "gray", fill: "soft", title: "2 × 2 창 · Stride 2", sub: "겹치지 않게 이동", size: 15 });
    var c = k.box(566, 196, 200, 60, { tone: "ink", fill: "plain", title: "축소된 특성맵", sub: "2 × 2 · 면적 1/4", size: 15 });
    k.link(a.r, b.l, { tone: "gray" }); k.link(b.r, c.l, { tone: "gray" });
    k.note(800, 182, 420, 26, { tone: "blue", title: "연산량 · 파라미터 감소", size: 13 });
    k.note(800, 213, 420, 26, { tone: "green", title: "위치 변화에 대한 내성", size: 13 });
    k.note(800, 244, 420, 26, { tone: "purple", title: "넓은 영역을 보는 효과", size: 13 });

    k.section(40, 318, "② 두 가지 풀링 — 같은 입력, 다른 요약 방식");
    [["Max Pooling", "창 안에서 가장 큰 값 하나를 선택", "red", 40], ["Average Pooling", "창 안 값들의 평균을 계산", "green", 645]].forEach(function (p, idx) {
      var x = p[3];
      k.panel(x, 334, 595, 238, { tone: p[2], head: "solid", title: p[0], right: p[1], tinted: true });
      k.matrix(x + 28, 384, fm, { cw: 36, ch: 32, tones: q, size: 14, rows: null });
      k.text(x + 100, 528, "입력 : 합성곱 출력 4 × 4", { size: 12.5, weight: 700, anchor: "middle", color: "ink" });
      k.arrow(x + 186, 448, x + 222, 448, { tone: p[2] });
      var out = idx === 0 ? [[-2, 8], [0, 8]] : [[-4.5, 3], [-4, 3.25]];
      k.matrix(x + 232, 416, out, { cw: 46, ch: 34, tones: function (i, j) { return q(i * 2, j * 2); }, size: 15 });
      k.text(x + 278, 504, "결과 2 × 2", { size: 12.5, weight: 800, anchor: "middle", tone: p[2] });
      k.box(x + 345, 378, 228, 140, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "창마다의 계산", titleColor: "ink", size: 13,
        lines: idx === 0
          ? [{ t: "max(−5, −3, −8, −2) = −2", tone: "blue" }, { t: "max(−1, 6, −1, 8) = 8", tone: "green" }, { t: "max(−9, −1, −6, 0) = 0", tone: "orange" }, { t: "max(0, 8, 0, 5) = 8", tone: "purple" }]
          : [{ t: "(−5−3−8−2)/4 = −4.5", tone: "blue" }, { t: "(−1+6−1+8)/4 = 3", tone: "green" }, { t: "(−9−1−6+0)/4 = −4", tone: "orange" }, { t: "(0+8+0+5)/4 = 3.25", tone: "purple" }] });
      k.bullets(x + 28, 552, 560, [idx === 0 ? "가장 강한 반응만 남김 → 경계·텍스처 같은 두드러진 특징 강조" : "창 전체를 평균 내므로 두드러진 값이 희석 → 전반적인 패턴 반영"], { size: 12.5, tone: p[2] });
    });

    k.section(40, 608, "③ 정리");
    k.table(56, 620, [160, 150, 200, 300, 330], [
      ["구분", "계산 방식", "남기는 정보", "효과", "주로 쓰는 곳"],
      ["Max Pooling", "창 안의 최댓값", "가장 강한 반응 하나", "경계 · 텍스처 강조 · 위치 불변성 ↑", "CNN 중간층의 기본 선택"],
      ["Average Pooling", "창 안의 평균", "전반적인 밝기 · 분포", "일반적인 패턴 요약 · 부드러운 축소", "출력부 직전의 GAP 등"]
    ], { rh: 24, size: 12.5 });
    k.text(1224, 700, "풀링에는 학습되는 가중치가 없다 — 학습 파라미터 0개", { size: 12.5, weight: 800, anchor: "end", tone: "purple" });
  }
});
