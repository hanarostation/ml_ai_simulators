/* Transformer — 알고리즘 구성도 (강의 필기자료 T1 · P1~P3 · TA2 · TA4 · TA5 양식)
   시뮬레이터 기본값: d_model 16 · 헤드 2 (d_k 8) · dff 32 · 층 1개 · 문장 길이 12 · 질문 'SD카드 망가졌어'
   TA2 숫자 = 시뮬레이터 ③ Attention 실험실의 기본 예제(TA2 예제)와 같음 */
(function () {
  var LB = "Transformer Model";
  function fmt3(v) { return (v < 0 ? "−" : "") + Math.abs(v).toFixed(3); }
  function sgn3(v) { return (v < 0 ? "−" : "+") + Math.abs(v).toFixed(3); }

  /* ---------------------------------------------------------------- T1 전체 구조 */
  DSDiagram.register({
    id: "transformer-1", sim: "transformer", order: 1, badge: "T1",
    title: "Transformer (1) — 전체 구조", short: "전체 구조 (T1)",
    sub: "질문을 읽는 인코더 + 답변을 한 단어씩 쓰는 디코더 · 시뮬레이터는 노트북 챗봇 모델을 작게 줄인 것 (층 1개)",
    label: LB,
    draw: function (k) {
      var EX = 80, EW = 230, DX = 450, DW = 250;
      /* 인코더 열 */
      k.panel(EX - 30, 300, EW + 60, 254, { tone: "blue", tinted: true });
      k.text(EX - 16, 322, "인코더 층 × N", { size: 13.5, weight: 800, tone: "blue" });
      var eAN2 = k.box(EX, 332, EW, 26, { tone: "gray", fill: "plain", title: "Add & Norm", size: 12.5, r: 6 });
      var eF = k.box(EX, 370, EW, 44, { tone: "blue", title: "Position-wise FFNN", sub: "d → dff (ReLU) → d", size: 13, subSize: 11.5, r: 7 });
      var eAN1 = k.box(EX, 434, EW, 26, { tone: "gray", fill: "plain", title: "Add & Norm", size: 12.5, r: 6 });
      var eA = k.box(EX, 474, EW, 44, { tone: "teal", title: "Multi-Head Self-Attention", sub: "Q = K = V = 질문", size: 13, subSize: 11.5, r: 7 });
      k.link(eA.t, eAN1.b, { tone: "blue", width: 1.6, headSize: 6 });
      k.link(eAN1.t, eF.b, { tone: "blue", width: 1.6, headSize: 6 });
      k.link(eF.t, eAN2.b, { tone: "blue", width: 1.6, headSize: 6 });
      k.arrow(EX - 4, 532, EX - 4, 449, { tone: "gray", dash: true, width: 1.3, headSize: 6, via: [[EX - 18, 532], [EX - 18, 449]], head: false });
      k.arrow(EX - 18, 447, EX - 2, 447, { tone: "gray", width: 1.3, headSize: 6 });
      k.arrow(EX - 18, 424, EX - 18, 345, { tone: "gray", dash: true, width: 1.3, head: false });
      k.arrow(EX - 18, 345, EX - 2, 345, { tone: "gray", width: 1.3, headSize: 6 });
      var eE = k.box(EX, 598, EW, 32, { tone: "blue", title: "Embedding  vocab → d_model", size: 13, r: 7 });
      var eI = k.box(EX, 652, EW, 32, { tone: "blue", fill: "plain", title: "질문 토큰 (inputs)", size: 13, r: 7 });
      k.circle(EX + EW / 2, 576, 10, { tone: "purple", fill: "plain", label: "+", size: 15 });
      k.link(eI.t, eE.b, { tone: "blue", width: 1.6, headSize: 6 });
      k.arrow(EX + EW / 2, 598, EX + EW / 2, 587, { tone: "blue", width: 1.6, headSize: 6 });
      k.arrow(EX + EW / 2, 566, EX + EW / 2, 520, { tone: "blue", width: 1.6, headSize: 6 });
      k.box(EX + EW / 2 + 26, 563, 92, 26, { tone: "purple", title: "위치 인코딩", size: 12, r: 6 });
      k.arrow(EX + EW / 2 + 25, 576, EX + EW / 2 + 12, 576, { tone: "purple", width: 1.5, headSize: 6 });
      /* 인코더 출력 → 디코더 Cross */
      k.arrow(EX + EW / 2, 332, DX, 398, { tone: "blue", width: 2, via: [[EX + EW / 2, 272], [DX - 34, 272], [DX - 34, 398]] });
      k.text(EX + EW / 2 + 10, 264, "인코더 출력 (B, L, d)", { size: 12, weight: 700, tone: "blue" });
      k.text(DX - 30, 388, "K, V", { size: 12.5, weight: 800, tone: "blue", anchor: "end" });

      /* 디코더 열 */
      k.panel(DX - 20, 216, DW + 50, 338, { tone: "orange", tinted: true });
      k.text(DX - 6, 238, "디코더 층 × N", { size: 13.5, weight: 800, tone: "orange" });
      var dN3 = k.box(DX + 10, 248, DW - 10, 24, { tone: "gray", fill: "plain", title: "Add & Norm", size: 12, r: 6 });
      var dF = k.box(DX + 10, 282, DW - 10, 40, { tone: "blue", title: "Position-wise FFNN", size: 13, r: 7 });
      var dN2 = k.box(DX + 10, 334, DW - 10, 24, { tone: "gray", fill: "plain", title: "Add & Norm", size: 12, r: 6 });
      var dC = k.box(DX + 10, 376, DW - 10, 44, { tone: "teal", title: "인코더-디코더 Attention", sub: "Q = 디코더 / K · V = 인코더 출력", size: 13, subSize: 11.5, r: 7 });
      var dN1 = k.box(DX + 10, 432, DW - 10, 24, { tone: "gray", fill: "plain", title: "Add & Norm", size: 12, r: 6 });
      var dM = k.box(DX + 10, 470, DW - 10, 44, { tone: "teal", title: "Masked Multi-Head Self-Att.", sub: "미래 단어 가림 (look-ahead)", size: 13, subSize: 11.5, r: 7 });
      [[dM, dN1], [dN1, dC], [dC, dN2], [dN2, dF], [dF, dN3]].forEach(function (p) { k.link(p[0].t, p[1].b, { tone: "orange", width: 1.6, headSize: 6 }); });
      var dE = k.box(DX + 10, 598, DW - 10, 32, { tone: "orange", title: "Embedding  vocab → d_model", size: 13, r: 7 });
      var dI = k.box(DX + 10, 652, DW - 10, 32, { tone: "orange", fill: "plain", title: "답변 토큰 (dec_inputs)", size: 13, r: 7 });
      var dcx = DX + 10 + (DW - 10) / 2;
      k.circle(dcx, 576, 10, { tone: "purple", fill: "plain", label: "+", size: 15 });
      k.link(dI.t, dE.b, { tone: "orange", width: 1.6, headSize: 6 });
      k.arrow(dcx, 598, dcx, 587, { tone: "orange", width: 1.6, headSize: 6 });
      k.arrow(dcx, 566, dcx, 516, { tone: "orange", width: 1.6, headSize: 6 });
      k.box(dcx + 26, 563, 92, 26, { tone: "purple", title: "위치 인코딩", size: 12, r: 6 });
      k.arrow(dcx + 25, 576, dcx + 12, 576, { tone: "purple", width: 1.5, headSize: 6 });
      var dD = k.box(DX + 10, 176, DW - 10, 30, { tone: "green", title: "Dense  d_model → vocab", size: 13, r: 7 });
      var dO = k.box(DX + 10, 132, DW - 10, 30, { tone: "green", fill: "plain", title: "다음 단어 확률 (softmax)", size: 13, r: 7 });
      k.link(dN3.t, dD.b, { tone: "orange", width: 1.6, headSize: 6 });
      k.link(dD.t, dO.b, { tone: "green", width: 1.6, headSize: 6 });
      k.note(40, 132, 330, 96, { tone: "purple", title: "왜 위치 인코딩이 필요한가?", body: "RNN은 한 단어씩 순서대로 읽어 순서가 몸에 밴다. Transformer는 모든 단어를 한 번에(병렬) 넣으므로 순서 정보가 없다 → 임베딩에 위치 벡터를 더한다 (P3)", size: 13.5 });

      /* 오른쪽 */
      k.section(752, 150, "① 하이퍼파라미터 — 노트북 vs 시뮬레이터");
      k.table(752, 164, [116, 92, 100, 180], [
        ["항목", "노트북", "시뮬레이터", "의미"],
        [{ t: "vocab", mono: true }, "8,181", "57", "사전 크기 (기본 데이터)"],
        [{ t: "MAX_LENGTH", mono: true }, "40", "12", "문장 최대 토큰 수"],
        [{ t: "d_model", mono: true }, "256", "16", "모든 벡터의 크기"],
        [{ t: "num_heads", mono: true }, "8", "2", "헤드 수"],
        [{ t: "d_k", mono: true }, "32", "8", "헤드당 = d_model ÷ heads"],
        [{ t: "dff", mono: true }, "1,024", "32", "FFNN 은닉층 노드"],
        [{ t: "num_layers", mono: true }, "2", "1", "인코더 · 디코더 층 수"]
      ], { rh: 25, size: 12.5 });

      k.section(752, 386, "② Attention 3종", { tone: "teal" });
      [["인코더 Self", "질문 안의 단어끼리 (Q = K = V = 질문)"], ["디코더 Masked Self", "지금까지 만든 답변끼리 — 뒤쪽은 가림"], ["인코더-디코더", "답변 단어(Q)가 질문 전체(K · V)를 참조"]].forEach(function (r, i) {
        var y = 400 + i * 34;
        k.circle(766, y + 13, 11, { tone: "teal", fill: "plain", label: String(i + 1), size: 12.5 });
        k.text(786, y + 18, r[0], { size: 13.5, weight: 800, tone: "teal" });
        k.text(940, y + 18, r[1], { size: 12.5, color: "ink" });
      });

      k.section(752, 528, "③ 층 안의 두 부품");
      k.lines(752, 556, [
        "**Add & Norm** = 입력을 출력에 더한 뒤(잔차, 점선) 층 정규화",
        "**FFNN** = 위치(단어)마다 같은 2층 신경망을 따로 적용"
      ], { size: 12.5, lh: 22 });
      k.flow(752, 604, [{ t: "질문", s: "(1, 12)", tone: "blue" }, { t: "+ 위치", s: "(1, 12, 16)", tone: "purple" }, { t: "디코더 출력", s: "(1, 11, 16)", tone: "orange" }, { t: "logits", s: "(1, 11, 57)", tone: "green" }], { h: 44, gap: 14, size: 12.5, w: 488 });
      k.text(752, 670, "시뮬레이터 shape (batch 1) · 디코더는 정답을 한 칸 밀어 11자리", { size: 12, color: "muted" });
      k.text(752, 692, "BERT = 이 구조의 인코더만 / GPT = 디코더만 사용", { size: 12.5, weight: 700, tone: "purple" });
    }
  });

  /* ---------------------------------------------------------------- P3 위치 인코딩 */
  DSDiagram.register({
    id: "transformer-2", sim: "transformer", order: 2, badge: "P3",
    title: "위치 인코딩 — d_model = 4 미니 예제", short: "위치 인코딩 (P3)",
    sub: "단어 4개 'I am a student', 벡터 길이 4로 직접 계산 · 시뮬레이터는 12위치 × 16차원(실험실은 최대 256)을 같은 방식으로",
    label: LB,
    draw: function (k) {
      /* 왜 */
      k.panel(40, 130, 560, 128, { tone: "red", head: "soft", title: "문제 — 한꺼번에 넣으면 순서를 모른다", tinted: true });
      [["나", "는", "너", "를", "좋아해"], ["너", "는", "나", "를", "좋아해"]].forEach(function (r, i) {
        var y = 176 + i * 38, x = 56;
        r.forEach(function (w) { var ww = w.length > 1 ? 70 : 34; k.box(x, y, ww, 28, { tone: "blue", fill: "plain", title: w, size: 12.5, r: 6 }); x += ww + 6; });
      });
      k.arrow(318, 208, 352, 208, { tone: "red", width: 1.8 });
      k.para(362, 192, 226, "Self-Attention에겐 같은 단어 5개가 든 '주머니' → 누가 누구를 좋아하는지 구분 불가", { size: 12.5, color: "ink", lh: 19 });

      k.panel(616, 130, 624, 128, { tone: "purple", head: "none", tinted: true });
      k.text(636, 166, "PE(pos, 2i)     = sin( pos / 10000^(2i / d_model) )", { size: 16, weight: 800, mono: true, tone: "purple" });
      k.text(636, 198, "PE(pos, 2i+1) = cos( pos / 10000^(2i / d_model) )", { size: 16, weight: 800, mono: true, tone: "blue" });
      k.text(636, 230, "짝수 칸 sin · 홀수 칸 cos · 값은 항상 −1~1 → 단어 의미를 덮지 않음 · 학습하지 않는 고정 표", { size: 12.5, color: "muted" });

      /* STEP 1 + 2 */
      k.section(40, 292, "STEP 1 · 2  나누는 수 → sin · cos 채우기", { sub: "10000^(2i/4): dim 0,1 → 1 · dim 2,3 → 100" });
      var PE = [[0, 1, 0, 1], [0.841, 0.540, 0.010, 1], [0.909, -0.416, 0.020, 1], [0.141, -0.990, 0.030, 1]];
      var words = ["I", "am", "a", "student"];
      var lab = [["sin(0)", "cos(0)", "sin(0)", "cos(0)"], ["sin(1)", "cos(1)", "sin(0.01)", "cos(0.01)"], ["sin(2)", "cos(2)", "sin(0.02)", "cos(0.02)"], ["sin(3)", "cos(3)", "sin(0.03)", "cos(0.03)"]];
      var heads = [["dim 0", "sin(pos / 1)", "red"], ["dim 1", "cos(pos / 1)", "red"], ["dim 2", "sin(pos / 100)", "blue"], ["dim 3", "cos(pos / 100)", "blue"]];
      var MX = 196, MY = 362, CW = 128, CH = 52;
      heads.forEach(function (h, j) {
        k.text(MX + j * CW + CW / 2, 326, h[0], { size: 13.5, weight: 800, anchor: "middle", tone: h[2] });
        k.text(MX + j * CW + CW / 2, 344, h[1], { size: 11.5, anchor: "middle", color: "muted", mono: true });
      });
      k.text(70, 344, "pos", { size: 12.5, weight: 800, anchor: "middle", tone: "orange" });
      k.text(132, 344, "단어", { size: 12.5, weight: 800, anchor: "middle", tone: "blue" });
      k.matrix(MX, MY, PE.map(function (r) { return r.map(function (v) { return v === 0 ? "0.000" : sgn3(v); }); }), {
        cw: CW, ch: CH, size: 16, weight: 800,
        tones: function (i, j) { var v = PE[i][j]; return v > 0.3 ? "red" : v < -0.3 ? "blue" : "gray"; },
        fills: function (i, j) { var v = Math.abs(PE[i][j]); return v > 0.8 ? "mid" : v > 0.3 ? "tone" : "plain"; }
      });
      for (var i = 0; i < 4; i++) {
        k.box(52, MY + i * CH + 6, 36, CH - 12, { tone: "orange", fill: "soft", title: String(i), size: 15, r: 6 });
        k.box(96, MY + i * CH + 6, 72, CH - 12, { tone: "blue", title: words[i], size: 13, r: 6 });
        for (var j = 0; j < 4; j++) k.text(MX + j * CW + CW / 2, MY + i * CH + 16, lab[i][j], { size: 11.5, anchor: "middle", color: "muted", mono: true });
      }
      k.bullets(52, 590, 700, [
        { t: "가로 한 줄 = 그 위치의 '지문' · 4줄이 모두 달라 위치를 구분할 수 있다", tone: "purple" },
        { t: "dim 0 · 1 (빠름): 한 칸만 움직여도 크게 바뀜 → 이웃 위치 구분", tone: "red" },
        { t: "dim 2 · 3 (느림): 0.00 → 0.03 조금씩 → 긴 문장에서 먼 위치 구분", tone: "blue" }
      ], { size: 12.5, lh: 22 });

      /* STEP 3 */
      k.section(780, 292, "STEP 3  임베딩에 더하기", { tone: "purple" });
      var emb = [0.2, -0.1, 0.4, 0.05];
      [[1, [0.841, 0.540, 0.010, 1], [1.041, 0.440, 0.410, 1.050]], [3, [0.141, -0.990, 0.030, 1], [0.341, -1.090, 0.430, 1.050]]].forEach(function (g, gi) {
        var y0 = 312 + gi * 180;
        k.panel(780, y0, 460, 168, { tone: "gray", head: "none" });
        k.text(796, y0 + 26, "pos = " + g[0], { size: 14, weight: 800, tone: "orange" });
        var col = function (x, vals, tn, title) {
          k.text(x + 42, y0 + 26, title, { size: 12.5, weight: 800, anchor: "middle", tone: tn });
          k.matrix(x, y0 + 38, vals.map(function (v) { return [sgn3(v)]; }), { cw: 84, ch: 28, size: 13, tones: function () { return tn; }, fills: function (i) { return tn === "purple" && Math.abs(vals[i]) > 0.5 ? "mid" : "tone"; } });
        };
        col(880, emb, "blue", "'am' 임베딩");
        k.text(988, y0 + 98, "+", { size: 24, weight: 800, anchor: "middle", tone: "purple" });
        col(1010, g[1], "purple", "PE(pos=" + g[0] + ")");
        k.text(1116, y0 + 98, "=", { size: 24, weight: 800, anchor: "middle", color: "ink" });
        col(1138, g[2], "green", "모델 입력");
        k.text(796, y0 + 158, "의미 + 위치", { size: 11.5, color: "muted" });
      });
      k.note(780, 666, 460, 32, { tone: "green", title: "같은 'am'이어도 입력 벡터가 달라짐 → 순서 구분 가능", size: 12.5 });
      k.note(52, 666, 700, 32, { tone: "purple", title: "시뮬레이터: ② 위치 인코딩 실험실 · ① 3단계 '임베딩 × √d_model + PE'", size: 12.5 });
    }
  });

  /* ---------------------------------------------------------------- TA2 Scaled Dot-Product */
  DSDiagram.register({
    id: "transformer-3", sim: "transformer", order: 3, badge: "TA2",
    title: "Scaled Dot-Product — 숫자로 따라가기", short: "Scaled Dot-Product (TA2)",
    sub: "3단어 · d_k = 4 미니 예제 (시뮬레이터 ③ Attention 실험실의 'TA2 예제'와 같은 값) · 시뮬레이터 모델은 헤드마다 d_k = 8",
    label: LB,
    draw: function (k) {
      var N = ["나는", "너를", "좋아해"];
      var Q = [[1, 0, 1, 0], [0, 2, 0, 1], [1, 1, 1, 0]], KT = [[1, 0, 1], [0, 1, 1], [1, 0, 0], [0, 1, 0]];
      var S = [[2, 0, 1], [0, 3, 2], [2, 1, 2]], S2 = [[1, 0, 0.5], [0, 1.5, 1], [1, 0.5, 1]];
      var A = [[0.506, 0.186, 0.307], [0.122, 0.547, 0.331], [0.384, 0.233, 0.384]];
      var V = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 1]];
      var O = [[0.506, 0.186, 0.307, 0.307], [0.122, 0.547, 0.331, 0.331], [0.384, 0.233, 0.384, 0.384]];
      var D = ["d0", "d1", "d2", "d3"];

      k.flow(40, 134, [{ t: "Q · K", tone: "ink", fill: "plain" }, { t: "MatMul", tone: "purple" }, { t: "÷ √d_k", tone: "amber" }, { t: "Mask (선택)", tone: "orange" }, { t: "Softmax", tone: "teal" }, { t: "MatMul × V", tone: "purple" }, { t: "출력", tone: "green" }], { h: 34, gap: 18, size: 13, w: 800 });
      k.formula(866, 128, 374, 46, "softmax(**QK^T / √d_k + mask**) · V", { size: 16 });

      /* STEP 1 */
      k.section(40, 206, "STEP 1  점수 = Q × K^T");
      var mono = function (v) { return String(v); };
      var hv = function (v) { return v ? "mid" : "plain"; };
      k.matrix(100, 258, Q, { cw: 36, ch: 28, size: 14, rows: N, cols: D, title: "Q", titleTone: "orange", tones: function (i, j, v) { return v ? "orange" : null; }, fills: function (i, j, v) { return v === 2 ? "solid" : hv(v); } });
      k.text(268, 306, "×", { size: 24, weight: 800, anchor: "middle", color: "ink" });
      k.matrix(326, 246, KT, { cw: 44, ch: 26, size: 14, rows: D, cols: N, title: "K^T (K를 눕힘)", titleTone: "blue", tones: function (i, j, v) { return v ? "blue" : null; }, fills: function (i, j, v) { return hv(v); } });
      k.text(484, 306, "=", { size: 24, weight: 800, anchor: "middle", color: "ink" });
      k.matrix(548, 258, S, { cw: 44, ch: 28, size: 15, rows: N, cols: N, title: "점수 S", titleTone: "purple", tones: function () { return "purple"; }, fills: function (i, j, v) { return v >= 3 ? "solid" : v >= 2 ? "mid" : "tone"; } });
      k.arrow(690, 300, 748, 300, { tone: "amber", width: 2, label: "÷ √4 = ÷ 2" });
      k.matrix(818, 258, S2, { cw: 44, ch: 28, size: 15, rows: N, cols: N, title: "S / √d_k", titleTone: "amber", tones: function () { return "amber"; }, fills: function (i, j, v) { return v >= 1.5 ? "solid" : v >= 1 ? "mid" : "tone"; } });
      k.text(56, 372, "행 = 질문하는 단어(Query) · 열 = 참고 대상 단어(Key)", { size: 12, color: "muted" });
      k.text(56, 394, "예) S[너를, 너를] = Q(너를) · K(너를) = 0·0 + 2·1 + 0·0 + 1·1 = 3 → 방향이 비슷할수록 점수가 큼", { size: 12.5, color: "ink" });
      k.box(986, 196, 254, 150, { tone: "amber", fill: "tone", align: "left", valign: "top", title: "왜 √d_k로 나누나?", size: 14,
        lines: ["차원이 클수록 내적 값이 커짐", "→ softmax가 한 칸에 몰림 (1, 0, 0 …)", "→ 기울기가 거의 0 → 학습 정체", { t: "'나는' 행: 나누기 전 0.67 → 후 0.51", tone: "red", weight: 700 }, { t: "시뮬레이터 d_k = 8 → ÷ 2.83", tone: "amber", weight: 700 }] });

      /* STEP 2 · 3 */
      k.section(40, 418, "STEP 2  softmax (행마다 합 = 1) → 가중치 A,   STEP 3  A × V = 출력", { tone: "teal" });
      k.matrix(100, 460, A, { cw: 58, ch: 30, size: 14, rows: N, cols: N, title: "가중치 A", titleTone: "teal", fmt: function (v) { return v.toFixed(3); }, tones: function () { return "teal"; }, fills: function (i, j, v) { return v > 0.5 ? "solid" : v > 0.3 ? "mid" : "tone"; } });
      [0, 1, 2].forEach(function (i) { k.text(282, 460 + i * 30 + 20, "합 1", { size: 11.5, color: "muted" }); });
      k.text(330, 508, "×", { size: 24, weight: 800, anchor: "middle", color: "ink" });
      k.matrix(392, 460, V, { cw: 40, ch: 30, size: 14, rows: N, cols: D, title: "V", titleTone: "green", tones: function (i, j, v) { return v ? "green" : null; }, fills: function (i, j, v) { return hv(v); } });
      k.text(578, 508, "=", { size: 24, weight: 800, anchor: "middle", color: "ink" });
      k.matrix(646, 460, O, { cw: 58, ch: 30, size: 14, rows: N, cols: D, title: "출력 (새 벡터)", titleTone: "green", fmt: function (v) { return v.toFixed(3); }, tones: function () { return "green"; }, fills: function (i, j, v) { return v > 0.5 ? "solid" : v > 0.3 ? "mid" : "tone"; } });
      k.text(56, 580, "softmax 예) '나는' 행: e^1, e^0, e^0.5 = 2.718, 1, 1.649 → 합 5.367로 나눔 → 0.506, 0.186, 0.307", { size: 12.5, color: "ink" });
      k.box(906, 430, 334, 140, { tone: "green", fill: "tone", align: "left", valign: "top", title: "출력 읽는 법 ('나는' 행)", size: 14,
        lines: ["0.506 × V(나는) + 0.186 × V(너를)", "+ 0.307 × V(좋아해)", "= [0.506, 0.186, 0.307, 0.307]", { t: "→ 자기 자신 51% + 좋아해 31% + 너를 19%", tone: "green", weight: 700 }, "입력과 출력 shape 동일 (3, 4) → (3, 4)"] });

      /* 코드 · shape */
      k.code(40, 604, 600, 94, [
        "logits = matmul(q, k, transpose_b=True)   # STEP 1",
        "logits = logits / sqrt(d_k)               # ÷√d_k",
        "if mask is not None: logits += mask * -1e9  # TA4",
        "w = softmax(logits, axis=-1); out = matmul(w, v)"
      ], { size: 12.5 });
      k.panel(660, 604, 580, 94, { tone: "gray", head: "none" });
      k.text(678, 628, "시뮬레이터 모델 shape (batch 1 · 헤드 2 · 인코더)", { size: 13.5, weight: 800, color: "ink" });
      k.lines(678, 652, [
        { t: "Q, K, V (1, 2, 12, 8) → 점수 · 가중치 (1, 2, 12, 12)", tone: "teal", weight: 700 },
        "출력 (1, 2, 12, 8) → 두 헤드를 이어 붙여 (1, 12, 16) → Dense W_O"
      ], { size: 12.5, lh: 22 });
    }
  });

  /* ---------------------------------------------------------------- TA4 · TA5 마스크와 3종 */
  DSDiagram.register({
    id: "transformer-4", sim: "transformer", order: 4, badge: "TA4",
    title: "마스크와 Attention 3종 — 보면 안 되는 칸 지우기", short: "마스크 · Attention 3종 (TA4)",
    sub: "점수(logits)에 mask × (−1e9)를 더하면 softmax 후 그 칸의 가중치가 0 · 질문 'SD카드 망가졌어' → 답변 '다시 새로 사는 게 …'",
    label: LB,
    draw: function (k) {
      /* A 패딩 마스크 */
      k.section(40, 152, "A. 패딩 마스크 — 0(빈칸)은 참고하지 않기", { sub: "인코더 · 디코더 공통" });
      var tok = ["SOS", "SD카드", "망가졌어", "EOS", "0", "0"], sc = [1.2, 2.0, 1.6, 0.4, 0.9, 0.9];
      var no = [0.150, 0.335, 0.224, 0.068, 0.111, 0.111], ye = [0.194, 0.431, 0.289, 0.087, 0, 0];
      var X0 = 180, CW = 72;
      var rowsA = [["질문 토큰", "ink"], ["mask (x == 0)", "red"], ["점수 (한 행)", "purple"], ["+ mask×(−1e9)", "orange"]];
      rowsA.forEach(function (r, i) { k.text(56, 192 + i * 40, r[0], { size: 12.5, weight: 800, tone: r[1], color: r[1] === "ink" ? "ink" : "tone" }); });
      tok.forEach(function (t, j) {
        var x = X0 + j * CW, pad = j >= 4;
        k.box(x, 172, CW - 6, 30, { tone: pad ? "gray" : "blue", fill: pad ? "soft" : "tone", r: 6 });
        k.text(x + (CW - 6) / 2, 192, t, { size: 12.5, weight: 800, anchor: "middle", tone: pad ? "gray" : "blue" });
        k.box(x, 212, CW - 6, 28, { tone: pad ? "red" : "gray", fill: pad ? "tone" : "plain", title: pad ? "1" : "0", size: 13, r: 5 });
        k.box(x, 252, CW - 6, 28, { tone: "purple", fill: sc[j] >= 1.6 ? "mid" : "tone", title: sc[j].toFixed(1), size: 13, r: 5 });
        k.box(x, 292, CW - 6, 28, { tone: pad ? "orange" : "gray", fill: pad ? "tone" : "plain", title: pad ? "−10억" : sc[j].toFixed(1), size: 13, r: 5 });
        k.rect(x + 14, 380 - no[j] * 110, CW - 34, no[j] * 110, { tone: "gray", fill: "mid", r: 2 });
        k.text(x + (CW - 6) / 2, 396, no[j].toFixed(3), { size: 11.5, weight: 700, anchor: "middle", tone: pad ? "red" : "gray" });
        k.rect(x + 14, 470 - ye[j] * 110, CW - 34, Math.max(ye[j] * 110, 0.5), { tone: "teal", fill: "solid", r: 2 });
        k.text(x + (CW - 6) / 2, 486, ye[j].toFixed(3), { size: 11.5, weight: 700, anchor: "middle", tone: "teal" });
      });
      k.text(56, 362, "softmax", { size: 12.5, weight: 800, tone: "teal" });
      k.text(56, 380, "마스크 없음", { size: 12, color: "muted" });
      k.text(56, 466, "마스크 적용", { size: 12, weight: 700, tone: "teal" });
      k.path("M180 380 H612 M180 470 H612", { tone: "gray", width: 1 });
      k.lines(56, 512, [
        "마스크 없으면 빈칸 두 개가 **22%**를 가져감 → 의미 없는 칸이 섞임",
        "적용하면 빈칸 = 0, 나머지 4칸이 합 1을 나눠 가짐"
      ], { size: 12.5, lh: 20 });

      /* B look-ahead */
      k.section(660, 152, "B. 디코더 — 미래 단어 가리기", { tone: "orange", sub: "look-ahead ∨ 패딩" });
      var dn = ["SOS", "다시", "새로", "사는", "0"];
      var la = [], pd = [], cb = [];
      for (var i = 0; i < 5; i++) { la.push([]); pd.push([]); cb.push([]); for (var j = 0; j < 5; j++) { var a = j > i ? 1 : 0, b = j === 4 ? 1 : 0; la[i].push(a); pd[i].push(b); cb[i].push(Math.max(a, b)); } }
      var mopt = function (title, tn) { return { cw: 26, ch: 24, size: 12, title: title, titleTone: tn, tones: function (i, j, v) { return v ? "red" : null; }, fills: function (i, j, v) { return v ? "tone" : "plain"; } }; };
      var o1 = mopt("look-ahead", "orange"); o1.rows = dn; o1.cols = ["S", "다", "새", "사", "0"];
      k.matrix(712, 200, la, o1);
      k.text(862, 264, "∨", { size: 20, weight: 800, anchor: "middle", color: "ink" });
      var o2 = mopt("패딩", "gray"); o2.cols = ["S", "다", "새", "사", "0"];
      k.matrix(880, 200, pd, o2);
      k.text(1028, 264, "=", { size: 20, weight: 800, anchor: "middle", color: "ink" });
      var o3 = mopt("합친 마스크 (maximum)", "red"); o3.cols = ["S", "다", "새", "사", "0"];
      k.matrix(1046, 200, cb, o3);
      k.lines(676, 344, [
        "1 = 가림 · 행 = 지금 위치(Query) · 열 = 참고 대상(Key)",
        { t: "'새로' 행 → SOS · 다시 · 새로까지만 봄 (자기보다 뒤는 ×)", tone: "orange", weight: 700 },
        "학습 때 정답 전체를 한 번에 넣어도 '다음 단어'를 미리 볼 수 없음"
      ], { size: 12.5, lh: 22 });
      k.note(676, 412, 564, 66, { tone: "teal", title: "시뮬레이터에서 확인", body: "① 흐름 5 · 7 · 8단계 점수표 — 가려진 칸은 빗금(×)\n③ Attention 실험실 — 마스크 [미래 가리기] · [마지막 = 패딩]", size: 13 });

      /* C 3종 */
      k.section(40, 556, "C. Attention 3종 한눈에 비교", { tone: "purple", sub: "시뮬레이터 점수표 shape = (헤드 2, Query 길이, Key 길이)" });
      [["teal", "① 인코더 Self-Attention", "Q · K · V = 질문", "패딩", "(2, 12, 12)"],
       ["orange", "② 디코더 Masked Self-Attention", "Q · K · V = 답변", "미래 + 패딩", "(2, 11, 11)"],
       ["purple", "③ 인코더-디코더 Attention", "Q = 디코더 · K · V = 인코더 출력", "질문의 패딩", "(2, 11, 12)"]].forEach(function (c, i) {
        var x = 40 + i * 404;
        k.panel(x, 570, 392, 128, { tone: c[0], head: "solid", title: c[1] });
        k.table(x + 8, 612, [96, 280], [
          ["입력", c[2]], ["마스크", c[3]], ["점수표", { t: c[4], mono: true }]
        ], { header: false, rh: 26, size: 12.5, tones: function () { return c[0]; } });
      });
    }
  });
})();
