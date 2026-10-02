/* Seq2Seq · Attention — 알고리즘 구성도 (강의 필기자료 'Seq2Seq ①~③', 'Attention ①~④' 양식)
   예제: 시뮬레이터 기본 문장 'Come in.' → '들어와.' (글자 단위, 은닉 크기 64)
   Attention 숫자 예제: 설명용 단어 단위 'I love you .' → '나는 너를 사랑해' (d = 4) */
(function () {
  var S2S = "Sequence to Sequence", ATT = "Attention Mechanism";

  /* 글자 칩: 작은 상자 하나 */
  function ch(k, x, y, w, t, tone, o) {
    o = o || {};
    return k.box(x, y, w, o.h || 30, { tone: tone, fill: o.fill || "tone", title: t, size: o.size || 15, r: 7, dash: o.dash });
  }

  /* ---------------------------------------------------------------- 1 */
  DSDiagram.register({
    id: "seq2seq-attention-1", sim: "seq2seq-attention", order: 1,
    title: "Seq2Seq (1) — 인코더 · 컨텍스트 · 디코더", short: "인코더 · 컨텍스트 · 디코더",
    sub: "입력 시퀀스(길이 n) → 출력 시퀀스(길이 m), n과 m이 달라도 된다 · 시뮬레이터 예: 'Come in.' → '들어와.' (글자 단위 · 은닉 64)",
    label: S2S,
    draw: function (k) {
      k.section(40, 150, "① 시간축으로 펼쳐 보기 — 인코더는 읽기만, 디코더는 한 글자씩 생성");

      /* 인코더 */
      k.panel(40, 166, 556, 270, { tone: "blue", head: "soft", title: "Encoder · LSTM(64)", right: "글자를 순서대로 읽고 상태만 넘김", tinted: true });
      var enc = ["C", "o", "m", "e", "␣", "i", "n", "."], eb = [];
      enc.forEach(function (c, i) {
        var x = 58 + i * 68;
        k.text(x + 28, 236, "×", { size: 15, anchor: "middle", color: "faint" });
        k.arrow(x + 28, 286, x + 28, 246, { tone: "gray", dash: true, width: 1.2, head: false });
        eb.push(k.box(x, 286, 56, 44, { tone: "blue", fill: "plain", title: "LSTM", sub: "t=" + (i + 1), size: 12, subSize: 11.5, r: 7 }));
        ch(k, x + 8, 362, 40, c, "blue", { size: 15 });
        k.arrow(x + 28, 360, x + 28, 332, { tone: "blue", width: 1.6, headSize: 7 });
        if (i) k.arrow(x - 11, 308, x - 1, 308, { tone: "blue", width: 1.6, headSize: 7 });
      });
      k.text(58, 222, "중간 시점 출력은 버림 (return_sequences=False)", { size: 11.5, color: "muted" });
      k.text(58, 418, "one-hot 입력 · 영어 사전 42 = 글자 41 + PAD", { size: 12, weight: 700, tone: "blue" });

      /* 컨텍스트 */
      k.box(608, 262, 120, 100, { tone: "purple", title: "Context", size: 14, valign: "top" });
      k.box(620, 300, 44, 32, { tone: "purple", fill: "plain", title: "h", size: 14, r: 6 });
      k.box(672, 300, 44, 32, { tone: "purple", fill: "plain", title: "c", size: 14, r: 6 });
      k.text(668, 352, "64 + 64 = 128", { size: 11.5, weight: 700, anchor: "middle", tone: "purple" });
      k.arrow(eb[7].x + 56, 308, 606, 308, { tone: "purple", width: 2.2 });

      /* 디코더 */
      k.panel(740, 166, 500, 270, { tone: "orange", head: "soft", title: "Decoder · LSTM(64)", right: "직전 글자 → 다음 글자", tinted: true });
      var din = ["SOS", "들", "어", "와", "."], dout = ["들", "어", "와", ".", "EOS"];
      din.forEach(function (c, i) {
        var x = 758 + i * 96;
        ch(k, x + 13, 210, 52, dout[i], dout[i] === "EOS" ? "purple" : "orange", { fill: "plain", size: 14 });
        k.box(x + 4, 252, 70, 26, { tone: "orange", fill: "soft", title: "Dense", size: 12, r: 6 });
        k.arrow(x + 39, 252, x + 39, 242, { tone: "orange", width: 1.5, headSize: 6 });
        k.box(x, 296, 78, 40, { tone: "orange", fill: "plain", title: "LSTM", sub: "t=" + (i + 1), size: 12.5, subSize: 11.5, r: 7 });
        k.arrow(x + 39, 296, x + 39, 280, { tone: "orange", width: 1.5, headSize: 6 });
        ch(k, x + 13, 362, 52, c, c === "SOS" ? "purple" : "orange", { size: 14 });
        k.arrow(x + 39, 360, x + 39, 338, { tone: "orange", width: 1.5, headSize: 7 });
        if (i) k.arrow(x - 17, 316, x - 1, 316, { tone: "orange", width: 1.6, headSize: 7 });
      });
      k.arrow(728, 316, 756, 316, { tone: "purple", width: 2.2 });
      k.text(758, 418, "one-hot · 한국어 사전 79 = 글자 76 + PAD·SOS·EOS", { size: 12, weight: 700, tone: "orange" });
      k.text(1224, 418, "출력 = 79개 글자 확률", { size: 11.5, anchor: "end", color: "muted" });

      /* ② 세 부품 */
      k.section(40, 470, "② 세 부품의 역할");
      var parts = [
        ["blue", "Encoder (인코더)", "이해 · Encoding", ["입력 문장을 한 글자씩 순서대로 읽는 LSTM", "매 시점 [h_t, c_t] = LSTM(x_t, h_t−1, c_t−1)", "**마지막 시점의 [h, c]만** 디코더로 전달", "패딩(PAD) 시점은 마스크로 이전 상태 유지"]],
        ["purple", "Context Vector (컨텍스트)", "[state_h, state_c]", ["인코더 마지막 상태 = 문장 전체의 요약", "크기 = 64 × 2 = **숫자 128개 (고정)**", "디코더 LSTM의 초기 상태(initial_state)로 주입", { t: "한계: 문장이 길수록 정보 손실 (병목)", tone: "red" }]],
        ["orange", "Decoder (디코더)", "생성 · Decoding", ["컨텍스트를 초기 상태로 받아 한 글자씩 생성", "입력 = 직전 글자 (첫 입력은 **SOS**)", "출력 = Dense(79, softmax) → 다음 글자 확률", "**EOS**가 나오거나 최대 길이면 멈춤"]]
      ];
      parts.forEach(function (p, i) {
        var x = 40 + i * 407;
        k.panel(x, 484, 386, 150, { tone: p[0], head: "solid", title: p[1], right: p[2] });
        k.bullets(x + 18, 542, 360, p[3], { size: 12.5, lh: 23, tone: p[0] });
      });

      /* ③ 학습하는 것 */
      k.section(40, 666, "③ 학습하는 것");
      k.formula(206, 646, 500, 44, "P(y1 … ym | x1 … xn) = Π P(yt | y1 … yt−1, **컨텍스트**)", { size: 16 });
      k.note(716, 646, 524, 44, { tone: "orange", title: "다음 글자 확률을 곱해 문장 확률로 · 손실 = 시점별 −log P(정답 글자)의 평균", size: 12.5 });
    }
  });

  /* ---------------------------------------------------------------- 2 */
  DSDiagram.register({
    id: "seq2seq-attention-2", sim: "seq2seq-attention", order: 2,
    title: "Seq2Seq (2) — 학습 vs 추론, 그리고 한계", short: "Teacher Forcing · 자기회귀 · 한계",
    sub: "학습 = Teacher Forcing (정답을 한 칸 밀어 입력) / 추론 = 자기회귀 (직전 예측을 다시 입력) · 시뮬레이터 ③의 두 모드",
    label: S2S,
    draw: function (k) {
      var pred = ["들", "가", "와", ".", "EOS"], inp = ["SOS", "들", "어", "와", "."], ans = ["들", "어", "와", ".", "EOS"];
      var P = ["0.90", "0.10", "0.82", "0.90", "0.95"], L = ["0.11", "2.30", "0.20", "0.11", "0.05"];

      /* 학습 */
      k.panel(40, 132, 592, 318, { tone: "green", head: "solid", title: "① 학습 — Teacher Forcing", right: "디코더 입력 = 정답을 한 칸 민 것" });
      k.box(108, 236, 56, 40, { tone: "purple", title: "[h, c]", size: 12.5, r: 7 });
      k.text(56, 197, "예측", { size: 12.5, weight: 700, color: "muted" });
      k.text(56, 323, "입력", { size: 12.5, weight: 700, color: "muted" });
      k.text(56, 385, "정답", { size: 12.5, weight: 700, color: "muted" });
      pred.forEach(function (c, i) {
        var x = 184 + i * 88, bad = i === 1;
        ch(k, x + 10, 178, 50, c, bad ? "red" : "green", { fill: "plain", size: 14 });
        k.box(x, 236, 70, 40, { tone: "orange", fill: "plain", title: "LSTM", size: 12.5, r: 7 });
        k.arrow(x + 35, 236, x + 35, 210, { tone: "orange", width: 1.5, headSize: 6 });
        ch(k, x + 10, 304, 50, inp[i], i ? "orange" : "purple", { size: 14 });
        k.arrow(x + 35, 302, x + 35, 278, { tone: "orange", width: 1.5, headSize: 6 });
        ch(k, x + 10, 366, 50, ans[i], "green", { size: 14 });
        if (i < 4) k.arrow(x + 61, 381, x + 95, 336, { tone: "green", dash: true, width: 1.5, headSize: 7, curve: -10 });
        k.text(x + 35, 414, "P " + P[i], { size: 11.5, anchor: "middle", color: "muted" });
        k.text(x + 35, 430, "손실 " + L[i], { size: 11.5, weight: 700, anchor: "middle", tone: bad ? "red" : "green" });
        if (i) k.arrow(x - 17, 256, x - 1, 256, { tone: "orange", width: 1.6, headSize: 7 });
      });
      k.arrow(164, 256, 183, 256, { tone: "purple", width: 1.8, headSize: 7 });
      k.text(56, 414, "P(정답)", { size: 11.5, color: "muted" });
      k.text(56, 430, "−log P", { size: 11.5, color: "muted" });

      /* 추론 */
      k.panel(648, 132, 592, 318, { tone: "orange", head: "solid", title: "② 추론 — 자기회귀 (Autoregressive)", right: "디코더 입력 = 직전 예측" });
      k.box(716, 236, 56, 40, { tone: "purple", title: "[h, c]", size: 12.5, r: 7 });
      k.text(664, 197, "예측", { size: 12.5, weight: 700, color: "muted" });
      k.text(664, 323, "입력", { size: 12.5, weight: 700, color: "muted" });
      ans.forEach(function (c, i) {
        var x = 792 + i * 88;
        ch(k, x + 10, 178, 50, c, c === "EOS" ? "purple" : "orange", { fill: "plain", size: 14 });
        k.box(x, 236, 70, 40, { tone: "orange", fill: "plain", title: "LSTM", size: 12.5, r: 7 });
        k.arrow(x + 35, 236, x + 35, 210, { tone: "orange", width: 1.5, headSize: 6 });
        ch(k, x + 10, 304, 50, inp[i], i ? "orange" : "purple", { size: 14 });
        k.arrow(x + 35, 302, x + 35, 278, { tone: "orange", width: 1.5, headSize: 6 });
        if (i < 4) k.arrow(x + 61, 193, x + 108, 302, { tone: "orange", dash: true, width: 1.4, headSize: 7, curve: 22 });
        if (i) k.arrow(x - 17, 256, x - 1, 256, { tone: "orange", width: 1.6, headSize: 7 });
      });
      k.arrow(772, 256, 791, 256, { tone: "purple", width: 1.8, headSize: 7 });
      k.bullets(664, 366, 560, [
        { t: "정답이 없으니 직전 예측 글자를 다음 입력으로 (점선) → **EOS**가 나오면 멈춤", tone: "orange" },
        { t: "한 번 틀리면 뒤로 오류가 이어짐 — **노출 편향(exposure bias)**", tone: "red" },
        { t: "시뮬레이터: 후보 글자를 눌러 일부러 틀려 보기 (강제 선택)", tone: "gray" }
      ], { size: 12.5, lh: 23 });

      /* 한계 */
      k.section(40, 486, "③ Seq2Seq의 한계 두 가지 → 해결은 Attention", { tone: "red" });
      k.panel(40, 500, 1200, 196, { tone: "red", tinted: true });
      /* (a) 고정 크기 */
      k.text(60, 528, "고정 크기 컨텍스트 = 병목", { size: 14, weight: 800, tone: "red" });
      [["Come in.", 8, 64, 92], ["I don't think I can do it.", 26, 250, 236]].forEach(function (s) {
        var x = s[2], w = s[3], cx = x + w / 2;
        k.box(x, 544, w, 28, { tone: "blue", title: s[0], size: 12.5, r: 6 });
        k.path("M" + x + " 574 L" + (x + w) + " 574 L" + (cx + 36) + " 616 L" + (cx - 36) + " 616 Z", { tone: "purple", fill: "tone" });
        k.box(cx - 46, 620, 92, 26, { tone: "purple", fill: "solid", title: "[h, c] 128", size: 12.5, r: 6 });
        k.text(cx, 664, s[1] + "글자", { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.para(60, 684, 460, "짧은 문장도 긴 문장도 똑같이 숫자 128개로 압축", { size: 12.5, color: "ink" });
      /* (b) 기울기 */
      k.text(540, 528, "긴 시퀀스 — 기울기 소실 · 먼 거리", { size: 14, weight: 800, tone: "red" });
      for (var i = 0; i < 7; i++) {
        k.box(540 + i * 50, 548, 40, 30, { tone: "blue", fill: "tone", r: 6 });
        if (i < 6) k.arrow(581 + i * 50, 563, 589 + i * 50, 563, { tone: "blue", width: 1.4, headSize: 5 });
        k.rect(544 + i * 50, 588, 32, 7, { tone: "red", fill: i > 3 ? "solid" : i > 1 ? "mid" : "tone", r: 3 });
      }
      k.arrow(880, 616, 548, 616, { tone: "red", width: 1.4, headSize: 7, label: "역전파 신호: 뒤에서 앞으로 갈수록 약해짐", labelDy: 20 });
      k.para(540, 662, 360, "LSTM이 완화하지만, 첫 글자와 마지막 출력 사이의 거리가 여전히 멀다", { size: 12.5, color: "ink", lh: 18 });
      /* 해결 */
      k.arrow(920, 598, 950, 598, { tone: "teal", width: 2.4 });
      k.box(956, 516, 268, 164, { tone: "teal", align: "left", valign: "top", title: "해결 → Attention", size: 16,
        lines: ["디코더가 글자를 만들 때마다", "인코더의 **모든 시점 출력**을 다시 보고", "필요한 위치에 큰 가중치를 준다", { t: "→ 매 시점 새 컨텍스트 c_t", tone: "teal", weight: 800 }, "→ 병목 해소 · 먼 거리도 한 번에 연결"] });
    }
  });

  /* ---------------------------------------------------------------- 3 */
  DSDiagram.register({
    id: "seq2seq-attention-3", sim: "seq2seq-attention", order: 3,
    title: "Attention (1) — 매 시점 입력을 다시 본다", short: "Attention 개념 · Q · K · V",
    sub: "Seq2Seq의 고정 컨텍스트 1개 → 디코더 시점마다 새 컨텍스트 c_t (설명용 단어 단위 예: I love you . → 나는 너를 사랑해)",
    label: ATT,
    draw: function (k) {
      var src = ["I", "love", "you", "."], tgt = ["나는", "너를", "사랑해"];
      /* 왼쪽: Seq2Seq */
      k.panel(40, 132, 560, 262, { tone: "gray", head: "soft", title: "Seq2Seq — 컨텍스트 하나를 모두가 공유" });
      var hx = [];
      src.forEach(function (w, i) {
        var x = 58 + i * 74;
        hx.push(k.box(x, 262, 56, 36, { tone: "blue", title: "h" + (i + 1), size: 14, r: 7 }));
        k.text(x + 28, 326, w, { size: 13.5, weight: 700, anchor: "middle", color: "ink" });
        k.arrow(x + 28, 312, x + 28, 300, { tone: "blue", width: 1.4, headSize: 6 });
        if (i) k.arrow(x - 17, 280, x - 1, 280, { tone: "blue", width: 1.5, headSize: 6 });
        if (i < 3) k.arrow(x + 28, 260, x + 28, 228, { tone: "gray", dash: true, width: 1.2, head: false });
      });
      k.text(118, 220, "h1~h3 는 C를 거쳐야만 전달", { size: 11.5, color: "muted" });
      k.circle(368, 280, 20, { tone: "purple", fill: "solid", label: "C", size: 15 });
      k.text(368, 248, "고정 128개", { size: 11.5, weight: 700, anchor: "middle", tone: "purple" });
      k.arrow(336, 280, 346, 280, { tone: "purple", width: 1.6, headSize: 6 });
      tgt.forEach(function (w, i) {
        var x = 404 + i * 66;
        k.box(x, 262, 54, 36, { tone: "orange", title: "s" + (i + 1), size: 14, r: 7 });
        k.text(x + 27, 214, w, { size: 13.5, weight: 800, anchor: "middle", tone: "orange" });
        k.arrow(x + 27, 260, x + 27, 222, { tone: "orange", width: 1.4, headSize: 6 });
        k.arrow(x - 12, 280, x - 1, 280, { tone: i ? "orange" : "purple", width: 1.5, headSize: 6 });
      });
      k.bullets(58, 358, 530, [
        { t: "세 시점 모두 같은 **C**에서 출발 → '사랑해'를 만들 때 'love'를 따로 볼 수 없음", tone: "purple" },
        { t: "문장이 길수록 앞쪽 단어 정보가 C 안에서 희미해짐", tone: "red" }
      ], { size: 12.5, lh: 21 });

      /* 오른쪽: Attention */
      k.panel(616, 132, 624, 262, { tone: "teal", head: "soft", title: "Attention — 시점마다 가중치를 다르게 준 새 컨텍스트", tinted: true });
      var A = [[0.71, 0.12, 0.09, 0.08], [0.10, 0.15, 0.66, 0.09], [0.08, 0.69, 0.12, 0.10]];
      var sx = [730, 900, 1070], kx = [668, 800, 932, 1064];
      A.forEach(function (row, t) {
        row.forEach(function (a, i) {
          k.path("M" + (kx[i] + 28) + " 300 L" + (sx[t] + 32) + " 222", { tone: "teal", width: (1 + a * 9).toFixed(1), opacity: a > 0.3 ? null : 0.75 });
        });
      });
      tgt.forEach(function (w, t) {
        k.box(sx[t], 186, 64, 36, { tone: "orange", title: "s" + (t + 1) + " + c" + (t + 1), size: 12.5, r: 7 });
        k.text(sx[t] + 32, 178, w, { size: 13, weight: 800, anchor: "middle", tone: "orange" });
        var m = 0; A[t].forEach(function (a, i) { if (a > A[t][m]) m = i; });
        k.text(sx[t] + 72, 202, src[m], { size: 11.5, weight: 700, tone: "teal" });
        k.text(sx[t] + 72, 217, "α=" + A[t][m].toFixed(2), { size: 11.5, weight: 700, tone: "teal" });
      });
      src.forEach(function (w, i) {
        k.box(kx[i], 300, 56, 34, { tone: "blue", title: "h" + (i + 1), size: 14, r: 7 });
        k.text(kx[i] + 28, 354, w, { size: 13.5, weight: 700, anchor: "middle", color: "ink" });
      });
      k.text(632, 382, "선 굵기 = 가중치 α (설명용 값) · 모든 h를 매번 다시 보되, 필요한 곳을 굵게", { size: 12, color: "muted" });

      /* Q K V */
      k.section(40, 428, "② Query · Key · Value — 도서관 검색으로 비유하면");
      var qkv = [
        ["orange", "Query 질의", "비유: 검색어 — \"지금 무엇이 필요하지?\"", "디코더의 현재 은닉 상태 s_t", "매 시점 1개 (t마다 바뀜)"],
        ["blue", "Key 열쇠", "비유: 책의 색인 — \"나는 이런 내용이야\"", "인코더 각 시점 출력 h_i", "입력 길이만큼 n개"],
        ["purple", "Value 값", "비유: 책의 본문 — 실제로 가져갈 정보", "인코더 각 시점 출력 h_i", "Key와 같은 벡터 (두 역할)"]
      ];
      qkv.forEach(function (q, i) {
        var x = 40 + i * 236;
        k.panel(x, 442, 222, 176, { tone: q[0], head: "solid", title: q[1], tinted: true });
        k.para(x + 14, 498, 196, q[2], { size: 12.5, color: "ink", lh: 18 });
        k.box(x + 12, 540, 198, 30, { tone: q[0], fill: "plain", title: q[3], size: 12.5, r: 6 });
        k.text(x + 14, 598, q[4], { size: 12, color: "muted" });
      });
      k.note(40, 632, 694, 62, { tone: "teal", title: "이 시뮬레이터 (Luong dot Attention)", body: "Q = 디코더 은닉 s_t · K = V = 인코더 모든 시점 h_i · Dense 입력은 [c_t, s_t]\nPAD 글자 점수에 −1e9를 더해 가중치 0 · 상세 패널의 e_i · α_i 막대로 확인", size: 13 });

      /* 3단계 */
      k.section(756, 428, "③ 계산은 딱 3단계 (+ 출력)", { tone: "teal" });
      var st = [
        ["teal", "① Score (유사도)", "내적: 방향이 비슷할수록 큰 값", "e_i = s_t · h_i"],
        ["teal", "② Weight (가중치)", "모두 양수 · 합이 1 · 큰 점수 강조", "α = softmax(e)"],
        ["teal", "③ Context (가중합)", "필요한 h_i를 많이 섞은 벡터", "c_t = Σ α_i h_i"],
        ["orange", "④ 출력 (다음 글자)", "c_t와 s_t를 이어 붙여 Dense", "Dense([c_t, s_t]) → softmax"]
      ];
      st.forEach(function (s, i) {
        var y = 444 + i * 64;
        k.box(756, y, 484, 54, { tone: s[0], fill: "tone", r: 8 });
        k.text(772, y + 23, s[1], { size: 14, weight: 800, tone: s[0] });
        k.text(772, y + 43, s[2], { size: 12, color: "muted" });
        k.text(1226, y + 33, s[3], { size: 13.5, weight: 700, anchor: "end", mono: true, tone: s[0] });
        if (i < 3) k.arrow(790, y + 55, 790, y + 63, { tone: "teal", width: 1.4, headSize: 6 });
      });
    }
  });

  /* ---------------------------------------------------------------- 4 */
  DSDiagram.register({
    id: "seq2seq-attention-4", sim: "seq2seq-attention", order: 4,
    title: "Attention (2) — Score 계산을 숫자로 한 단계씩", short: "Score · Softmax · 가중합 숫자",
    sub: "디코더 t=3 ('사랑해'를 만들 차례) · Query s3 · Key = Value = h1~h4 · 차원 d = 4 (설명용 값, 시뮬레이터는 d = 은닉 크기)",
    label: ATT,
    draw: function (k) {
      var s3 = [0.9, 0.8, -0.3, 0.5];
      var H = [[0.2, -0.5, 0.6, 0.1], [0.8, 0.9, -0.2, 0.6], [0.4, 0.1, 0.7, -0.3], [-0.3, 0.2, 0.3, 0.2]];
      var W = ["I", "love", "you", "."];
      var e = [-0.35, 1.80, 0.08, -0.10], ex = [0.7047, 6.0496, 1.0833, 0.9048], a = [0.0806, 0.6920, 0.1239, 0.1035];
      var f = function (v) { return (v < 0 ? "−" : "") + Math.abs(v).toFixed(1); };
      var f2 = function (v) { return (v < 0 ? "−" : "") + Math.abs(v).toFixed(2); };

      /* ① 재료 + Score */
      k.section(40, 150, "① 재료와 Score — 같은 자리끼리 곱해서 전부 더한다 (내적)");
      k.matrix(116, 182, [s3].concat(H).map(function (r) { return r.map(f); }), {
        cw: 50, ch: 24, size: 13, cols: ["1", "2", "3", "4"], rows: ["s3 Query", "h1 (I)", "h2 (love)", "h3 (you)", "h4 (.)"],
        tones: function (i) { return i === 0 ? "orange" : "blue"; }, hl: [{ r: 2, c: 0, cs: 4, tone: "teal" }]
      });
      e.forEach(function (v, i) {
        var y = 226 + i * 24, best = i === 1;
        var terms = s3.map(function (q, j) { return "(" + f(q) + "×" + f(H[i][j]) + ")"; }).join("+");
        k.text(352, y, "e" + (i + 1), { size: 13.5, weight: 800, tone: best ? "teal" : "ink", color: best ? "tone" : "ink" });
        k.text(380, y, terms, { size: 12, mono: true, color: "ink" });
        k.text(796, y, "= " + f2(v), { size: 13.5, weight: 800, anchor: "end", tone: best ? "teal" : "ink", color: best ? "tone" : "ink" });
      });
      k.text(352, 196, "e_i = s3 · h_i", { size: 13, weight: 700, mono: true, tone: "teal" });
      k.text(352, 330, "→ e2 = 1.80 : s3와 h2(love)의 방향이 가장 비슷", { size: 12.5, weight: 700, tone: "teal" });

      /* ② softmax */
      k.section(40, 376, "② Softmax — 점수를 '합이 1인 가중치'로", { tone: "teal" });
      var rows2 = [["i", "단어", "점수 e_i", "exp(e_i)", "α_i = exp ÷ 8.7424", "가중치 막대"]];
      e.forEach(function (v, i) { rows2.push([String(i + 1), W[i], f2(v), ex[i].toFixed(4), { t: a[i].toFixed(4), weight: 800 }, ""]); });
      rows2.push(["", "합계", "", "8.7424", { t: "1.0000", weight: 800 }, ""]);
      k.table(56, 390, [40, 70, 90, 100, 160, 300], rows2, { rh: 22, size: 12.5, tones: function (i) { return i === 2 ? "teal" : null; } });
      a.forEach(function (v, i) {
        var y = 412 + i * 22;
        k.rect(522, y + 5, v * 300, 12, { tone: "teal", fill: i === 1 ? "solid" : "mid", r: 3 });
        k.text(530 + v * 300, y + 15, (v * 100).toFixed(1) + "%", { size: 11.5, weight: 700, tone: "teal" });
      });

      /* ③ 가중합 */
      k.section(40, 556, "③ 가중합 — 각 Value에 가중치를 곱해 더하면 컨텍스트 c3", { tone: "teal" });
      var rows3 = [["α_i × h_i", "1번째 값", "2번째 값", "3번째 값", "4번째 값"]];
      var terms = [[0.016, -0.040, 0.048, 0.008], [0.554, 0.623, -0.138, 0.415], [0.050, 0.012, 0.087, -0.037], [-0.031, 0.021, 0.031, 0.021]];
      var sg = function (v) { return (v < 0 ? "−" : "+") + Math.abs(v).toFixed(3); };
      terms.forEach(function (r, i) { rows3.push([a[i].toFixed(4) + " × h" + (i + 1) + " (" + W[i] + ")"].concat(r.map(function (v) { return { t: sg(v), mono: true }; }))); });
      k.table(56, 570, [196, 110, 110, 110, 110], rows3, { rh: 21, size: 12, tones: function (i) { return i === 2 ? "teal" : null; } });
      k.box(56, 677, 636, 22, { tone: "teal", fill: "solid", r: 4 });
      k.text(66, 693, "c3 = 합계", { size: 12.5, weight: 800, color: "on" });
      ["0.59", "0.62", "0.03", "0.41"].forEach(function (v, j) { k.text(262 + j * 110, 693, "≈ " + v, { size: 12.5, weight: 800, color: "on" }); });

      /* 오른쪽: 행렬 · 해석 */
      k.panel(834, 132, 406, 248, { tone: "teal", head: "solid", title: "행렬로 한 번에 — 모든 디코더 시점", tinted: true });
      k.formula(850, 180, 374, 84, "Score = Q · K^T   (T_dec × T_enc)\nα = softmax(Score, 행 방향)\nC = α · V   (T_dec × d)", { size: 14, mono: true, align: "left" });
      k.bullets(852, 290, 340, [
        { t: "Q의 t행 · K^T의 i열 = 위의 e_i를 모든 (t, i) 쌍에 대해 한 번에", tone: "teal" },
        { t: "행마다 합 1 — 디코더 시점마다 입력 글자들에 가중치를 나눠 가짐", tone: "teal" },
        { t: "학습 파라미터 0개 — 내적과 softmax만", tone: "gray" }
      ], { size: 12.5, lh: 20 });

      k.panel(834, 394, 406, 158, { tone: "gray", head: "soft", title: "결과 읽기" });
      k.lines(852, 450, [
        { t: "h2 (love) = [0.80, 0.90, −0.20, 0.60]", tone: "blue", weight: 700 },
        { t: "c3 ≈ [0.59, 0.62, 0.03, 0.41]", tone: "teal", weight: 700 },
        "c3는 h2를 69% 섞은 벡터 → 'love' 정보가 주로 전달",
        { t: "→ Dense([c3, s3], softmax) → '사랑해' 확률 ↑", tone: "orange", weight: 700 },
        "다음 시점 t=4 에선 s4로 ①~③을 처음부터 다시"
      ], { size: 12.5, lh: 20 });

      k.note(834, 566, 406, 62, { tone: "purple", title: "÷√d 를 하면? (Scaled Dot)", body: "e ÷ √4 = e ÷ 2 로 softmax → α2: 0.69 → 0.46 (완만해짐) · 트랜스포머 방식", size: 13 });
      k.note(834, 638, 406, 60, { tone: "red", title: "패딩 칸은 −1e9 → α = 0", body: "시뮬레이터는 PAD 위치 점수에 −1e9를 더해 지움 (노트북은 마스크 없음)", size: 13 });
    }
  });
})();
