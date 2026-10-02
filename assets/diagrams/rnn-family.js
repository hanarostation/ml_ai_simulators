/* RNN 계열 (SimpleRNN · LSTM · GRU · 양방향 · Stacked) — 알고리즘 구성도
   강의 필기자료 '신경망 구조 ① SimpleRNN 셀 / ② LSTM 셀 / ③ GRU 셀 / RNN 계열 5개 모형 비교' 양식
   예제 숫자: 시뮬레이터 기본값 '태아 기형 유발 가능성' · d = 8 · u = 4 · seed 42 (학습 전 무작위 가중치) / 파라미터는 실습 조건 d = 8, u = 20 */
(function () {
  var MINUS = "−";
  function f3(v) { var s = Math.abs(v).toFixed(3); return (v < 0 && +s !== 0 ? MINUS : "") + s; }
  function f2(v) { if (typeof v !== "number") return v; var s = Math.abs(v).toFixed(2); return (v < 0 && +s !== 0 ? MINUS : "") + s; }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function richLine(k, x, y, size, parts, o) {
    o = o || {};
    var s = '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-weight="' + (o.weight || 800) + '"' + (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + ' class="dg-ink" xml:space="preserve">';
    parts.forEach(function (p) {
      if (p[1] === "ink") s += esc(p[0]);
      else if (p[1] === "muted") s += '<tspan class="dg-muted">' + esc(p[0]) + "</tspan>";
      else s += '<tspan class="dg-t-' + p[1] + '"><tspan class="dg-tc">' + esc(p[0]) + "</tspan></tspan>";
    });
    k.raw(s + "</text>");
  }
  /* 연산 노드 (⊙ ⊕ ‖) */
  function op(k, x, y, sym, tone) { return k.circle(x, y, 13, { tone: tone || "gray", fill: "plain", label: sym, size: 16 }); }
  function line(k, pts, tone, w) {
    k.path("M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L"), { tone: tone || "gray", width: w || 2.2 });
  }
  function signTone(i, j, v) { return typeof v === "number" ? (v > 0.0005 ? "blue" : v < -0.0005 ? "pink" : null) : null; }
  var TOK = ["태아", "기형", "유발", "가능성"];

  /* ================================================================ 1. SimpleRNN */
  DSDiagram.register({
    id: "rnn-family-1", sim: "rnn-family", order: 1,
    title: "RNN 계열 (1) — SimpleRNN 셀: 상태 하나를 매 시점 덮어쓴다", short: "SimpleRNN 셀",
    sub: "입력 x(t)와 직전 상태 h(t−1)을 합쳐 한 번의 선형변환 + tanh로 새 상태 h(t)를 만든다 · 게이트도, 별도의 기억 통로도 없다",
    label: "RNN Model",
    draw: function (k) {
      /* ① 셀 회로 */
      k.panel(40, 128, 720, 296, { tone: "gray", title: "① 셀 내부 회로", head: "none" });
      k.box(140, 178, 590, 204, { tone: "gray", fill: "soft", r: 12 });
      k.text(156, 202, "SimpleRNN Cell (시점 t)", { size: 13, weight: 800, color: "muted" });
      k.lines(156, 236, [{ t: "기억은 h 하나뿐 — 새 값이 들어오면", tone: "red", weight: 700 }, { t: "이전 내용은 tanh 안에서 섞여 흐려진다", tone: "red", weight: 700 }], { size: 12.5, lh: 19 });
      var Y = 312;
      line(k, [[56, Y], [287, Y]], "blue", 2.6);
      k.text(56, Y - 12, "h(t−1) 이전 상태", { size: 13, weight: 800, tone: "blue" });
      k.arrow(300, 412, 300, Y + 15, { tone: "orange", width: 2.6 });
      k.text(312, 408, "x(t) 이번 입력 (임베딩 벡터)", { size: 12.5, weight: 800, tone: "orange" });
      op(k, 300, Y, "‖", "ink");
      k.text(286, Y + 34, "이어 붙이기", { size: 12, color: "muted", anchor: "end" });
      var wb = k.box(372, Y - 23, 116, 46, { tone: "purple", title: "W · + b", size: 16 });
      k.arrow(314, Y, 370, Y, { tone: "gray", width: 2.2 });
      k.text(wb.cx, Y + 42, "Wx·x(t) + Wh·h(t−1) + b", { size: 12, weight: 700, tone: "purple", anchor: "middle" });
      var tb = k.box(536, Y - 23, 96, 46, { tone: "green", title: "tanh", size: 16 });
      k.arrow(490, Y, 534, Y, { tone: "purple", width: 2.4 });
      k.text(tb.cx, Y + 42, "−1 ~ 1로 압축", { size: 12, weight: 700, tone: "green", anchor: "middle" });
      k.arrow(634, Y, 748, Y, { tone: "blue", width: 2.6 });
      k.text(738, Y - 10, "h(t)", { size: 14, weight: 800, tone: "blue", anchor: "end" });
      k.arrow(686, Y, 686, 186, { tone: "blue", width: 2.2 });
      k.text(676, 200, "출력으로도 사용", { size: 12, weight: 700, tone: "blue", anchor: "end" });

      /* ② 수식 */
      k.panel(780, 128, 460, 296, { tone: "gray", title: "② 수식과 파라미터", head: "none" });
      k.text(800, 194, "h(t) = tanh( Wx·x(t) + Wh·h(t−1) + b )", { size: 16.5, weight: 800, tone: "purple" });
      k.lines(800, 228, [
        "**Wx** : (입력 차원 d × 노드 수 u) → d·u",
        "**Wh** : (u × u) 상태를 다음 시점으로 넘김 → u²",
        "**b** : (u) → u",
        { t: "모든 시점이 같은 Wx, Wh, b를 다시 쓴다 (가중치 공유)", color: "muted" }
      ], { size: 13, lh: 23 });
      k.box(800, 336, 420, 66, { tone: "blue", fill: "tone", align: "left", title: "실습 SimpleRNN(20), d = 8", size: 14,
        lines: [{ t: "8 × 20 + 20 × 20 + 20 = **580개** (학습 파라미터)", size: 14 }] });

      /* ③ 펼친 그림 */
      k.section(40, 452, "③ 시점별로 펼치면 — 시뮬레이터 기본 문장 '태아 기형 유발 가능성'");
      k.text(1240, 452, "d = 8 · u = 4 · seed 42 · 학습 전 무작위 가중치", { size: 12.5, color: "muted", anchor: "end" });
      var H = [[0, 0, 0, 0], [0.178, 0.161, -0.202, 0.155], [-0.210, 0.137, 0.249, -0.450], [0.068, -0.278, -0.771, 0.735], [0.582, -0.521, -0.328, -0.415]];
      var XS = [48, 288, 528, 768, 1008];
      H.forEach(function (h, t) {
        var x = XS[t];
        k.text(x + 104, 478, t ? "h(" + t + ") · '" + TOK[t - 1] + "' 읽은 뒤" : "h(0) · 시작은 0", { size: 12.5, weight: 800, tone: t ? "blue" : "gray", anchor: "middle" });
        k.matrix(x, 486, [h], { cw: 52, ch: 30, size: 12, fmt: function (v) { return t ? f3(v) : "0"; }, tones: signTone });
        if (t < 4) k.arrow(x + 210, 501, XS[t + 1] - 4, 501, { tone: "blue", width: 2.2, label: "Wh", labelSize: 12 });
        if (t) {
          k.box(x + 64, 540, 80, 28, { tone: "orange", title: TOK[t - 1], size: 13.5, r: 8 });
          k.arrow(x + 104, 538, x + 104, 519, { tone: "orange", width: 2 });
        }
      });
      k.text(1192, 584, "마지막 h(4)만 Dense(1)로 → many-to-one 분류", { size: 12.5, weight: 700, tone: "blue", anchor: "end" });
      k.text(56, 560, "같은 셀(같은 가중치)을", { size: 12, color: "muted" });
      k.text(56, 576, "4번 반복해 쓴다", { size: 12, color: "muted" });
      richLine(k, 56, 606, 13, [["t = 2 '기형' : ", "ink"], ["Wx·x(2) [−0.348, 0.061, 0.458, −0.597]", "purple"], [" + ", "ink"], ["Wh·h(1) [0.135, 0.077, −0.204, 0.112]", "blue"], [" + b(0)  →  tanh  →  ", "ink"], ["h(2) = [−0.210, 0.137, 0.249, −0.450]", "green"]], { weight: 700 });

      /* ④ 한계 */
      k.section(40, 640, "④ 무엇이 문제인가 — LSTM · GRU가 등장한 이유");
      [["red", "기억 통로가 없다", "h 하나에 지금 입력과 과거 요약이 섞인다"], ["orange", "지울지 남길지 못 정한다", "매 시점 tanh로 전부 새로 계산"], ["purple", "기울기가 Wh 거듭제곱으로 전파", "1보다 작으면 소실, 크면 폭주"], ["green", "해결 방향", "LSTM: 기억선 C + 게이트 3개 · GRU: 2개"]].forEach(function (c, i) {
        k.note(40 + i * 302, 652, 294, 48, { tone: c[0], title: c[1], body: c[2], size: 13.5, bodySize: 12 });
      });
    }
  });

  /* ================================================================ 2. LSTM */
  DSDiagram.register({
    id: "rnn-family-2", sim: "rnn-family", order: 2,
    title: "RNN 계열 (2) — LSTM 셀: 기억선 위에서 지우고, 더하고, 꺼낸다", short: "LSTM 셀",
    sub: "기억선 = Cell State C · 게이트 3개가 '얼마나 지울지 · 얼마나 더할지 · 얼마나 내보낼지'를 0~1 값으로 정한다 · 상태가 h와 C 두 개인 것이 SimpleRNN과의 차이",
    label: "RNN Model",
    draw: function (k) {
      k.panel(40, 128, 780, 352, { tone: "gray", title: "① 셀 내부 회로", head: "none" });
      k.box(180, 172, 590, 272, { tone: "gray", fill: "soft", r: 12 });
      k.text(196, 196, "LSTM Cell (시점 t)", { size: 13, weight: 800, color: "muted" });
      var YC = 224, YH = 420;
      /* 기억선 C */
      k.arrow(56, YC, 806, YC, { tone: "red", width: 3 });
      k.text(56, YC - 12, "C(t−1) 장기 기억", { size: 13, weight: 800, tone: "red" });
      k.text(806, YC - 12, "C(t)", { size: 14, weight: 800, tone: "red", anchor: "end" });
      op(k, 296, YC, "⊙", "orange");
      op(k, 446, YC, "⊕", "green");
      /* h 줄 */
      line(k, [[56, YH], [227, YH]], "blue", 2.6);
      k.text(56, YH - 12, "h(t−1) 단기 기억", { size: 13, weight: 800, tone: "blue" });
      op(k, 240, YH, "‖", "ink");
      line(k, [[253, YH], [660, YH]], "gray", 2.2);
      k.arrow(240, 472, 240, YH + 15, { tone: "orange", width: 2.6 });
      k.text(230, 468, "x(t)", { size: 13, weight: 800, tone: "orange", anchor: "end" });
      k.text(254, 462, "이어 붙이기", { size: 12, color: "muted" });
      /* 게이트 */
      var G = [["σ", "f · Forget", "orange", 296], ["σ", "i · Input", "green", 396], ["tanh", "g · 후보값", "blue", 496], ["σ", "o · Output", "purple", 640]];
      G.forEach(function (g) {
        k.box(g[3] - 44, 334, 88, 48, { tone: g[2], title: g[0], sub: g[1], size: 15, subSize: 11.5, r: 8 });
        k.arrow(g[3], YH - 2, g[3], 384, { tone: g[2], width: 1.8 });
      });
      k.arrow(296, 332, 296, YC + 15, { tone: "orange", width: 2 });
      k.lines(286, 282, [{ t: "0이면 지움", tone: "orange", weight: 700 }, { t: "1이면 유지", tone: "orange", weight: 700 }], { size: 12, lh: 17, anchor: "end" });
      op(k, 446, 290, "⊙", "green");
      k.arrow(396, 332, 432, 290, { tone: "green", width: 2, via: [[396, 290]] });
      k.arrow(496, 332, 460, 290, { tone: "blue", width: 2, via: [[496, 290]] });
      k.arrow(446, 276, 446, YC + 15, { tone: "green", width: 2 });
      k.text(456, 262, "더할 값 = i ⊙ g", { size: 12, weight: 700, tone: "green" });
      /* 출력 */
      line(k, [[580, YC], [580, 256]], "red", 2);
      k.box(548, 256, 64, 30, { tone: "red", title: "tanh", size: 13.5, r: 7 });
      op(k, 640, 271, "⊙", "purple");
      k.arrow(614, 271, 625, 271, { tone: "red", width: 2, headSize: 7 });
      k.arrow(640, 332, 640, 286, { tone: "purple", width: 2 });
      line(k, [[653, 271], [706, 271]], "blue", 2.6);
      k.arrow(706, 271, 806, 271, { tone: "blue", width: 2.6 });
      k.text(806, 259, "h(t) 출력", { size: 13, weight: 800, tone: "blue", anchor: "end" });
      k.arrow(706, 271, 806, YH, { tone: "blue", width: 2.2, via: [[706, YH]] });
      k.text(806, YH - 10, "다음 시점으로", { size: 12, weight: 700, tone: "blue", anchor: "end" });
      k.text(340, 470, "게이트는 모두 h(t−1)과 x(t)를 함께 보고 계산 (같은 입력, 다른 가중치)", { size: 12, color: "muted" });

      /* ② 수식 */
      k.panel(836, 128, 404, 352, { tone: "gray", title: "② 수식", head: "none" });
      [["f(t) = σ( Wf·[h(t−1), x(t)] + bf )", "잊을 비율", "orange"], ["i(t) = σ( Wi·[h(t−1), x(t)] + bi )", "넣을 비율", "green"],
       ["g(t) = tanh( Wg·[h(t−1), x(t)] + bg )", "넣을 후보값", "blue"], ["C(t) = f(t) ⊙ C(t−1) + i(t) ⊙ g(t)", "기억 갱신 — 곱하고 더하기만", "red"],
       ["o(t) = σ( Wo·[h(t−1), x(t)] + bo )", "꺼낼 비율", "purple"], ["h(t) = o(t) ⊙ tanh( C(t) )", "이번 출력 = 다음 시점의 h", "blue"]].forEach(function (r, i) {
        k.box(852, 172 + i * 50, 372, 44, { tone: r[2], align: "left", title: r[0], sub: r[1], size: 13, subSize: 11.5, r: 8 });
      });

      /* ③ 파라미터 */
      k.panel(40, 496, 560, 204, { tone: "gray", title: "③ 파라미터 — 같은 계산을 4벌 한다", head: "none" });
      k.text(60, 560, "4 × ( d·u + u² + u )", { size: 22, weight: 800, tone: "purple" });
      k.lines(320, 548, [{ t: "f · i · g · o 네 개가 각각" }, { t: "Wx(d×u) · Wh(u×u) · b(u)를 가진다" }, { t: "→ SimpleRNN의 정확히 4배", weight: 800 }], { size: 12.5, lh: 18 });
      k.box(60, 590, 520, 40, { tone: "blue", fill: "tone", title: "실습 LSTM(128), d = 8 → 4 × (8×128 + 128² + 128) = 70,144개", size: 13.5, r: 8 });
      k.lines(60, 656, [{ t: "d = 8, u = 20 조건이면 4 × 580 = **2,320개**" }, { t: "실습 모델 전체 150,273 = 임베딩 80,000 + LSTM 70,144 + Dense 129", color: "muted" }], { size: 12.5, lh: 20 });

      /* ④ 시뮬레이터 값 */
      k.panel(616, 496, 624, 204, { tone: "gray", title: "④ 시뮬레이터 값으로 읽기 — t = 1 '태아'", head: "none" });
      k.text(1224, 526, "d = 8 · u = 4 · seed 42", { size: 12, color: "muted", anchor: "end" });
      var M = [[0.69, 0.68, 0.72, 0.78], [0.41, 0.63, 0.50, 0.56], [0.53, 0.69, 0.44, 0.49], [-0.155, -0.113, -0.010, -0.233], [-0.082, -0.078, -0.004, -0.113]];
      k.matrix(688, 566, M, {
        cw: 56, ch: 24, size: 12.5, rows: ["f 잊을", "i 넣을", "o 꺼낼", "C(1)", "h(1)"], cols: ["노드1", "노드2", "노드3", "노드4"],
        fmt: function (v, i) { return i < 3 ? f2(v) : f3(v); },
        tones: function (i) { return ["orange", "green", "purple", "red", "blue"][i]; }
      });
      k.bullets(938, 566, 290, [
        { t: "f ≈ 0.7 : Keras가 b_f = 1로 시작", tone: "orange" },
        { t: "→ σ(1) = 0.73, 처음엔 남기는 쪽", tone: "orange" },
        { t: "C(0) = 0 → C(1) = i ⊙ g", tone: "red" },
        { t: "h(1) = o ⊙ tanh(C(1))", tone: "blue" },
        { t: "예) 0.53 × tanh(−0.155) = −0.082", tone: "blue" },
        { t: "게이트 값은 학습으로 정해진다", tone: "gray" }
      ], { size: 12, lh: 20 });
    }
  });

  /* ================================================================ 3. GRU */
  DSDiagram.register({
    id: "rnn-family-3", sim: "rnn-family", order: 3,
    title: "RNN 계열 (3) — GRU 셀: 게이트 두 개로 '유지 대 교체'", short: "GRU 셀",
    sub: "기억선(Cell State)이 없다 · 상태는 h 하나 · Update 게이트 z가 '이전 상태를 얼마나 유지할지'와 '새 후보를 얼마나 받을지'를 한 번에 정한다",
    label: "RNN Model",
    draw: function (k) {
      k.panel(40, 128, 780, 352, { tone: "gray", title: "① 셀 내부 회로", head: "none" });
      k.box(170, 172, 600, 272, { tone: "gray", fill: "soft", r: 12 });
      k.text(186, 196, "GRU Cell (시점 t)", { size: 13, weight: 800, color: "muted" });
      var YT = 224, YB = 420;
      k.arrow(56, YT, 806, YT, { tone: "blue", width: 3 });
      k.text(56, YT - 12, "h(t−1) 이전 상태", { size: 13, weight: 800, tone: "blue" });
      k.text(806, YT - 12, "h(t)", { size: 14, weight: 800, tone: "blue", anchor: "end" });
      /* 왼쪽 세로 h 줄 → 이어 붙이기 */
      line(k, [[212, YT], [212, YB - 13]], "blue", 2.2);
      op(k, 212, YB, "‖", "ink");
      k.arrow(212, 472, 212, YB + 15, { tone: "orange", width: 2.6 });
      k.text(202, 468, "x(t)", { size: 13, weight: 800, tone: "orange", anchor: "end" });
      k.text(226, 462, "이어 붙이기", { size: 12, color: "muted" });
      line(k, [[225, YB], [640, YB]], "gray", 2.2);
      /* r 게이트 */
      k.box(294, 334, 88, 48, { tone: "green", title: "σ", sub: "r · Reset", size: 15, subSize: 11.5, r: 8 });
      k.arrow(338, YB - 2, 338, 384, { tone: "green", width: 1.8 });
      op(k, 338, 290, "⊙", "green");
      k.arrow(338, 332, 338, 304, { tone: "green", width: 2 });
      k.arrow(212, 290, 323, 290, { tone: "blue", width: 2 });
      k.lines(292, 318, [{ t: "과거를", tone: "green", weight: 700 }, { t: "얼마나 쓸지", tone: "green", weight: 700 }], { size: 12, lh: 16, anchor: "end" });
      /* 후보 h~ */
      k.box(404, 272, 92, 36, { tone: "blue", title: "tanh", size: 15, r: 8 });
      k.text(450, 264, "h~(t) 후보 상태", { size: 12, weight: 800, tone: "blue", anchor: "middle" });
      k.arrow(352, 290, 402, 290, { tone: "green", width: 2 });
      k.arrow(450, YB - 2, 450, 310, { tone: "gray", width: 1.8 });
      /* z 게이트 */
      k.box(554, 334, 88, 48, { tone: "orange", title: "σ", sub: "z · Update", size: 15, subSize: 11.5, r: 8 });
      k.arrow(598, YB - 2, 598, 384, { tone: "orange", width: 1.8 });
      op(k, 598, YT, "⊙", "orange");
      k.arrow(598, 332, 598, YT + 15, { tone: "orange", width: 2 });
      k.text(606, 252, "유지 비율 z", { size: 12, weight: 700, tone: "orange" });
      /* 1 − z, 새 정보 */
      k.box(646, 308, 62, 28, { tone: "purple", title: "1 − z", size: 13, r: 7 });
      k.arrow(598, 322, 644, 322, { tone: "orange", width: 1.8, headSize: 7 });
      op(k, 750, 290, "⊙", "purple");
      k.arrow(498, 290, 735, 290, { tone: "blue", width: 2 });
      k.arrow(710, 322, 750, 305, { tone: "purple", width: 2, via: [[750, 322]] });
      k.text(716, 354, "새 정보 비율", { size: 12, weight: 700, tone: "purple" });
      op(k, 750, YT, "⊕", "purple");
      k.arrow(750, 276, 750, YT + 15, { tone: "purple", width: 2 });
      k.text(316, 470, "r · z 모두 h(t−1)과 x(t)를 함께 보고 계산 · h 하나가 장기·단기 기억을 맡는다", { size: 12, color: "muted" });

      /* ② 수식 */
      k.panel(836, 128, 404, 352, { tone: "gray", title: "② 수식 (Keras 기준)", head: "none" });
      [["z(t) = σ( Wz·x(t) + Uz·h(t−1) + bz )", "유지 비율 (Update)", "orange"], ["r(t) = σ( Wr·x(t) + Ur·h(t−1) + br )", "과거를 얼마나 쓸지 (Reset)", "green"],
       ["h~(t) = tanh( Wh·x(t) + r ⊙ (Uh·h(t−1)) + bh )", "새 후보 상태", "blue"], ["h(t) = z ⊙ h(t−1) + (1 − z) ⊙ h~(t)", "유지와 교체의 가중 평균", "purple"]].forEach(function (r, i) {
        k.box(852, 172 + i * 50, 372, 44, { tone: r[2], align: "left", title: r[0], sub: r[1], size: 12.5, subSize: 11.5, r: 8 });
      });
      k.box(852, 378, 372, 88, { tone: "red", align: "left", valign: "top", title: "z의 방향은 구현마다 다르다", size: 13.5, r: 8,
        lines: [{ t: "Keras: z가 1이면 이전 상태 유지", size: 12.5 }, { t: "원 논문(Cho, 2014): z가 1이면 새 후보 채택 — 반대", size: 12.5 }] });

      /* ③ 파라미터 */
      k.panel(40, 496, 560, 204, { tone: "gray", title: "③ 파라미터 — 같은 계산을 3벌", head: "none" });
      k.text(60, 560, "3 × ( d·u + u² + 2u )", { size: 22, weight: 800, tone: "purple" });
      k.lines(330, 548, [{ t: "z · r · h~ 세 개가 각각 W, U, b" }, { t: "Keras reset_after=True라" }, { t: "편향이 2벌 → 2u", weight: 800 }], { size: 12.5, lh: 18 });
      k.box(60, 590, 520, 40, { tone: "green", fill: "tone", title: "실습 GRU(20), d = 8 → 3 × (8×20 + 20×20 + 40) = 1,800개", size: 13.5, r: 8 });
      k.lines(60, 656, [{ t: "SimpleRNN 580 · GRU 1,800 · LSTM 2,320 → 약 **1 : 3 : 4**" }, { t: "파라미터가 적다 = 학습이 빠르고 적은 데이터에서 과적합이 덜함", color: "muted" }], { size: 12.5, lh: 20 });

      /* ④ LSTM과 비교 */
      k.panel(616, 496, 624, 204, { tone: "gray", title: "④ LSTM과 무엇이 다른가", head: "none" });
      k.table(632, 536, [124, 230, 240], [
        ["", "LSTM", "GRU"],
        [{ t: "기억 통로", tone: "orange" }, "C와 h 두 줄", "h 한 줄"],
        [{ t: "지우기 · 더하기", tone: "green" }, "Forget과 Input이 따로 결정", "z 하나로 동시에 (유지 + 교체 = 1)"],
        [{ t: "출력 조절", tone: "purple" }, "Output 게이트가 따로", "없음 — 상태 h가 곧 출력"],
        [{ t: "파라미터", tone: "blue" }, "4벌", "3벌 (약 25% 감소)"]
      ], { rh: 25, size: 12.5 });
      k.text(632, 682, "성능은 대체로 비슷 — 데이터가 적거나 시퀀스가 짧으면 GRU를 먼저 시도", { size: 12.5, weight: 800, tone: "red" });
    }
  });

  /* ================================================================ 4. 양방향 · Stacked · 비교 */
  DSDiagram.register({
    id: "rnn-family-4", sim: "rnn-family", order: 4,
    title: "RNN 계열 (4) — 양방향 · Stacked와 5개 모형 비교", short: "양방향 · Stacked · 비교",
    sub: "안쪽 셀은 GRU(20) (시뮬레이터 기본값) · 입력 (batch, 15) → Embedding(10000, 8) → (batch, 15, 8) → 순환층 → Dense(1) — 순환층 자리만 바뀐다",
    label: "RNN Model",
    draw: function (k) {
      /* ① 양방향 */
      k.panel(40, 128, 596, 262, { tone: "purple", head: "solid", title: "① Bidirectional GRU(20) — 앞에서 · 뒤에서 따로 읽기", tinted: true });
      var BX = [64, 168, 272, 376], cw = 86;
      BX.forEach(function (x, i) {
        k.box(x, 180, cw, 34, { tone: "purple", fill: "plain", title: "GRU →", size: 13, r: 7 });
        k.box(x, 292, cw, 34, { tone: "purple", fill: "mid", title: "← GRU", size: 13, r: 7 });
        k.box(x + 8, 238, cw - 16, 28, { tone: "gray", fill: "soft", title: TOK[i], size: 13, r: 7 });
        k.arrow(x + cw / 2, 236, x + cw / 2, 216, { tone: "gray", width: 1.6 });
        k.arrow(x + cw / 2, 268, x + cw / 2, 290, { tone: "gray", width: 1.6 });
        if (i < 3) {
          k.arrow(x + cw + 2, 197, BX[i + 1] - 2, 197, { tone: "purple", width: 2 });
          k.arrow(BX[i + 1] - 2, 309, x + cw + 2, 309, { tone: "purple", width: 2 });
        }
      });
      k.text(128, 352, "정방향 1 → 4 · 역방향 4 → 1 (가중치 따로)", { size: 12, color: "muted" });
      var cb = k.box(486, 214, 134, 92, { tone: "purple", fill: "tone", title: "이어 붙이기", sub: "[h→(4) ; h←(1)]", size: 14, subSize: 11.5, r: 10, lines: [{ t: "20 + 20 = 40", weight: 800, size: 13 }] });
      k.arrow(BX[3] + cw + 2, 197, cb.x - 2, 232, { tone: "purple", width: 2 });
      k.arrow(BX[0] + cw / 2, 328, cb.cx, cb.y + cb.h + 2, { tone: "purple", width: 2, via: [[BX[0] + cw / 2, 366], [cb.cx, 366]] });
      k.text(cb.cx - 10, 358, "h←(1)", { size: 12, weight: 800, tone: "purple", anchor: "end" });
      k.text(cb.cx, 202, "(batch, 40)", { size: 12.5, weight: 800, tone: "purple", anchor: "middle" });

      /* ② Stacked */
      k.panel(652, 128, 588, 262, { tone: "teal", head: "solid", title: "② Stacked GRU — 순환층 2층 쌓기", tinted: true });
      var SX = [676, 780, 884, 988];
      SX.forEach(function (x, i) {
        k.box(x, 180, cw, 34, { tone: "teal", fill: "mid", title: "GRU 2층", size: 13, r: 7 });
        k.box(x, 252, cw, 34, { tone: "teal", fill: "plain", title: "GRU 1층", size: 13, r: 7 });
        k.box(x + 8, 320, cw - 16, 28, { tone: "gray", fill: "soft", title: TOK[i], size: 13, r: 7 });
        k.arrow(x + cw / 2, 318, x + cw / 2, 288, { tone: "gray", width: 1.6 });
        k.arrow(x + cw / 2, 250, x + cw / 2, 216, { tone: "teal", width: 2 });
        if (i < 3) {
          k.arrow(x + cw + 2, 197, SX[i + 1] - 2, 197, { tone: "teal", width: 2 });
          k.arrow(x + cw + 2, 269, SX[i + 1] - 2, 269, { tone: "teal", width: 2 });
        }
      });
      k.text(726, 238, "h1(t)", { size: 12, weight: 800, tone: "teal" });
      var sb = k.box(1092, 172, 132, 52, { tone: "teal", fill: "tone", title: "2층 마지막 h(4)", sub: "(batch, 20)", size: 13, subSize: 11.5, r: 10 });
      k.arrow(SX[3] + cw + 2, 197, sb.x - 2, 197, { tone: "teal", width: 2 });
      k.box(1092, 240, 132, 70, { tone: "teal", fill: "plain", align: "left", valign: "top", title: "1층", size: 12.5, r: 10, lines: [{ t: "return_sequences", size: 11.5 }, { t: "=True 필수", size: 11.5, weight: 800 }] });
      k.text(676, 372, "1층은 4시점 h1(1…4)를 모두 위로 → 2층은 이를 새 문장처럼 다시 읽음", { size: 12, color: "muted" });

      /* ③ 파라미터 비교 */
      k.panel(40, 406, 596, 294, { tone: "gray", title: "③ 순환층 파라미터 (d = 8, u = 20)", head: "none" });
      var P = [["SimpleRNN", "d·u + u² + u", 580, "×1.0", "gray"], ["LSTM", "4 × (d·u + u² + u)", 2320, "×4.0", "green"], ["GRU", "3 × (d·u + u² + 2u)", 1800, "×3.1", "orange"],
               ["Bidirectional GRU", "2 × GRU(20)", 3600, "×6.2", "purple"], ["Stacked GRU (2층)", "1,800 + 3 × (20·20 + 400 + 40)", 4320, "×7.4", "teal"]];
      P.forEach(function (r, i) {
        var y = 452 + i * 48, w = r[2] / 4320 * 250;
        k.text(60, y + 14, r[0], { size: 13.5, weight: 800, tone: r[4] });
        k.rect(206, y, w, 20, { tone: r[4], fill: "solid", r: 3 });
        k.text(214 + w, y + 15, r[2].toLocaleString("en-US") + "  " + r[3], { size: 13, weight: 800, color: "ink" });
        k.text(206, y + 36, r[1], { size: 11.5, color: "muted" });
      });

      /* ④ 비교표 */
      k.panel(652, 406, 588, 294, { tone: "gray", title: "④ 다섯 모형 한눈에", head: "none" });
      k.table(664, 446, [128, 112, 104, 104, 116], [
        ["모형", "게이트", "상태", "순환층 출력", "주 용도"],
        [{ t: "SimpleRNN", tone: "gray" }, "없음", "h", "(batch, 20)", "짧은 문장 · 기준선"],
        [{ t: "LSTM", tone: "green" }, "f · i · o + g", "C + h", "(batch, 20)", "긴 문맥 · 기본값"],
        [{ t: "GRU", tone: "orange" }, "z · r", "h", "(batch, 20)", "LSTM급을 가볍게"],
        [{ t: "양방향 GRU", tone: "purple" }, "셀 × 2", "h→ + h←", "(batch, 40)", "문장 전체 보고 판단"],
        [{ t: "Stacked ×2", tone: "teal" }, "셀 × 층", "층마다 h", "(batch, 20)", "더 추상적 패턴"]
      ], { rh: 30, size: 12 });
      k.note(664, 634, 564, 54, { tone: "red", title: "공통 한계: 시점 순서대로만 계산", body: "앞 시점 h가 있어야 다음을 계산 → 병렬 처리 불가 → Attention · Transformer로", size: 13 });
    }
  });
})();
