/* [Case Study] 의료 영상 자료 검색 — 알고리즘 구성도
   강의 필기자료 양식: 의료 VQA·VQA-RAD(77~78쪽), BLIP VQA 구조(79쪽), CLIP(96쪽), 검색 기반 파이프라인(98쪽)
   숫자는 시뮬레이터 화면과 실습 노트북 출력 기준 (VQA-RAD Test 451문항 · 고유 영상 203장) */
(function () {
  var SIM = "medical-image-retrieval";

  /* ---------------------------------------------------------------- 1. 사례 흐름 */
  DSDiagram.register({
    id: SIM + "-1", sim: SIM, order: 1,
    title: "의료 영상 검색 (1) — 판독문으로 영상 찾기, 영상으로 문장 만들기", short: "데이터·구조·검색 흐름",
    sub: "VQA-RAD(방사선 영상 + 질문 + 답변, CC0) · Test 451문항 → 영상 해시로 중복 제거 → 고유 영상 203장을 검색 갤러리로",
    label: "Multi-Modal",
    draw: function (k) {
      k.panel(40, 132, 590, 268, { tone: "teal", head: "soft", title: "① 데이터: VQA-RAD", right: "flaviagiammarino/vqa-rad" });
      [["315장", "방사선 영상"], ["약 2,248", "질문-답변 쌍"], ["Test 451", "Closed 251 · Open 200"]].forEach(function (s, i) {
        k.box(56 + i * 188, 180, 178, 52, { tone: "teal", fill: "soft", title: s[0], sub: s[1], size: 15, subSize: 11.5, titleColor: "tone" });
      });
      var a = k.box(56, 252, 130, 50, { tone: "gray", fill: "plain", title: "Test 451행", sub: "영상 + 질문 + 답", size: 13.5, subSize: 11.5 });
      var b = k.box(214, 252, 186, 50, { tone: "teal", title: "md5(img.tobytes())", sub: "처음 보는 키만 추가", size: 13, subSize: 11.5 });
      var c = k.box(428, 252, 186, 50, { tone: "teal", fill: "solid", title: "img_list 203장", sub: "고유 영상 = 검색 갤러리", size: 14, subSize: 11.5 });
      k.link(a.r, b.l, { tone: "gray" }); k.link(b.r, c.l, { tone: "teal" });
      k.text(56, 330, "같은 영상에 질문이 여러 개 — 451 ÷ 203 ≈ 2.2문항/영상", { size: 12.5, color: "ink" });
      k.text(56, 352, "예) is there evidence of an aortic aneurysm? → yes (Closed)", { size: 12.5, mono: true, tone: "blue" });
      k.text(56, 378, "영상 종류: X-ray · CT · MRI (MedPix, 임상의가 작성한 질문)", { size: 12, color: "muted" });

      k.panel(650, 132, 590, 268, { tone: "purple", head: "soft", title: "② 세 가지 멀티모달 구조" });
      var arch = [
        ["Dual Encoder", "CLIP", "teal", "영상 · 문장을 각자 벡터로 → 같은 공간에서 비교", "제로샷 분류 · 검색"],
        ["Encoder-Decoder", "BLIP", "blue", "영상 벡터를 디코더가 받아 한 단어씩 생성", "캡셔닝 · VQA"],
        ["Vision Enc. + LLM", "LLaVA · MedGemma", "gray", "대형 언어 모델에 영상 인코더 연결 (개념만)", "대화형 판독 보조"]
      ];
      arch.forEach(function (r, i) {
        var y = 180 + i * 70;
        k.box(666, y, 150, 58, { tone: r[2], fill: i === 2 ? "soft" : "tone", title: r[0], sub: r[1], size: 13.5, subSize: 11.5, titleColor: i === 2 ? "ink" : null });
        k.text(832, y + 24, r[3], { size: 12.5, color: "ink" });
        k.text(832, y + 44, "→ " + r[4], { size: 12.5, weight: 800, tone: r[2] === "gray" ? "purple" : r[2] });
      });

      k.section(40, 434, "③ 검색 파이프라인 — 한 번 색인하고, 질의마다 비교", { tone: "pink" });
      k.chip(40, 452, "① 미리 준비 (색인)", { tone: "gray", solid: true, size: 12.5 });
      var g0 = k.box(40, 488, 160, 52, { tone: "teal", fill: "plain", title: "갤러리 영상", sub: "203장", size: 14 });
      var g1 = k.box(232, 488, 190, 52, { tone: "teal", fill: "solid", title: "PubMedCLIP 영상 인코더", sub: "3×224×224 → 512", size: 13, subSize: 11.5 });
      var g2 = k.box(454, 476, 190, 76, { tone: "teal", fill: "tone", title: "임베딩 DB", lines: ["df['embedding'] 203×512", "L2 정규화 → ‖e‖ = 1"], size: 14, subSize: 11.5 });
      k.chip(40, 566, "② 검색할 때마다", { tone: "blue", solid: true, size: 12.5 });
      var q0 = k.box(40, 602, 160, 52, { tone: "blue", fill: "plain", title: "검색 문장 Q", sub: "'an MRI of the brain'", size: 14, subSize: 11.5 });
      var q1 = k.box(232, 602, 190, 52, { tone: "blue", fill: "solid", title: "PubMedCLIP 텍스트 인코더", sub: "→ 512 · L2 정규화", size: 13, subSize: 11.5 });
      k.link(g0.r, g1.l, { tone: "ink" }); k.link(g1.r, g2.l, { tone: "ink" }); k.link(q0.r, q1.l, { tone: "ink" });
      var cs = k.box(690, 520, 170, 76, { tone: "pink", fill: "solid", title: "코사인 유사도", sub: "score_i = ê_i · q̂  (203,)", size: 15, subSize: 11.5 });
      k.link(g2.r, [cs.x, cs.y + 22], { tone: "pink" });
      k.arrow(422, 628, 774, 598, { tone: "pink", via: [[774, 628]] });
      k.text(600, 620, "질의 벡터 q̂", { size: 12.5, weight: 700, anchor: "middle", tone: "pink" });
      var tk = k.box(890, 520, 140, 76, { tone: "pink", title: "상위 k개", sub: "nlargest(3)", size: 15, subSize: 11.5 });
      k.link(cs.r, tk.l, { tone: "pink" });
      var rs = k.box(1060, 488, 180, 62, { tone: "gray", fill: "plain", title: "유사 증례 영상", sub: "영상 3장 + score", size: 14, subSize: 11.5 });
      var rp = k.box(1060, 566, 180, 62, { tone: "purple", fill: "plain", title: "유사 판독문", sub: "검색 기반 리포트 초안", size: 14, subSize: 11.5 });
      k.arrow(1030, 548, 1058, 520, { tone: "gray" }); k.arrow(1030, 568, 1058, 596, { tone: "purple" });
      k.text(890, 660, "판독문 → 영상 · 영상 → 영상 · 영상 → 판독문 모두 같은 공간에서", { size: 12.5, weight: 700, anchor: "middle", tone: "pink" });
      k.text(890, 682, "점수의 절대값보다 순위(top-k)를 본다 — 최종 확인은 판독의", { size: 12.5, anchor: "middle", color: "muted" });
    }
  });

  /* ---------------------------------------------------------------- 2. CLIP 제로샷 · 검색 계산 */
  DSDiagram.register({
    id: SIM + "-2", sim: SIM, order: 2,
    title: "의료 영상 검색 (2) — CLIP 제로샷과 코사인 검색", short: "제로샷·코사인 계산",
    sub: "정규화한 벡터의 내적 = 코사인 유사도 · 확률 = softmax(100 × cos) · 일반 CLIP vs PubMedCLIP(ROCO 방사선 영상-캡션으로 추가 학습)",
    label: "Foundation Model",
    draw: function (k) {
      k.section(40, 152, "① 제로샷 분류 — 클래스 이름을 문장으로", { tone: "teal" });
      k.text(40, 180, "img_list[0] 흉부 X-ray · 문장 틀 \"This is a photo of {}.\" · 노트북 출력", { size: 12.5, color: "muted" });
      k.table(40, 192, [220, 150, 160], [
        ["후보 문장", "일반 CLIP p", "PubMedCLIP p"],
        [{ t: "a chest x-ray", tone: "teal" }, { t: "0.9854", weight: 800, tone: "teal" }, { t: "0.99989", weight: 800, tone: "teal" }],
        ["an abdominal CT scan", "0.0146", "0.00009"],
        ["a brain CT scan", "0.000008", "0.000008"],
        ["a brain MRI", "0.000001", "0.000005"]
      ], { rh: 26, size: 13 });
      k.formula(40, 332, 530, 82, "Δcos = ln(p₂ / p₁) / 100 = ln(0.0146 / 0.9854) / 100 = **−0.042**\n코사인 차이 0.04만으로 확률 98.5% — logit scale 100 때문", { size: 13.5, align: "left" });

      k.panel(600, 136, 640, 290, { tone: "pink", head: "solid", title: "② 코사인 유사도 검색 — 3차원 장난감 예", right: "실제는 512차원" });
      k.matrix(700, 210, [[0.6, 0.8, 0]], { cw: 52, ch: 30, size: 14, rows: ["질의 q̂"], cols: ["d1", "d2", "d3"], tone: "blue", fill: "tone" });
      var E = [[0.8, 0.6, 0], [0, 0.6, 0.8], [0.6, 0, 0.8]];
      k.matrix(700, 278, E, { cw: 52, ch: 30, size: 14, rows: ["영상 ê₁", "영상 ê₂", "영상 ê₃"], cols: ["d1", "d2", "d3"], tone: "teal", fill: "tone" });
      k.matrix(880, 278, [[0.96], [0.48], [0.36]], { cw: 70, ch: 30, size: 14, cols: ["ê · q̂"], fmt: function (v) { return v.toFixed(2); }, tones: function (i) { return i === 0 ? "pink" : null; }, fills: function (i) { return i === 0 ? "mid" : "plain"; } });
      k.matrix(976, 278, [[1], [2], [3]], { cw: 54, ch: 30, size: 14, cols: ["순위"], tones: function (i) { return i === 0 ? "pink" : null; }, fills: function (i) { return i === 0 ? "solid" : "plain"; } });
      k.lines(1046, 290, [
        { t: "ê₁ · q̂", weight: 800, color: "ink" },
        "= 0.8×0.6 + 0.6×0.8",
        "  + 0×0",
        { t: "= **0.96** → top-1", tone: "pink" }
      ], { size: 12.5, lh: 19 });
      k.text(616, 404, "모든 벡터 길이 1 (예: 0.6² + 0.8² = 1) → 내적이 곧 코사인 · 행렬 곱 한 번으로 203장 점수", { size: 12.5, color: "ink" });

      k.section(40, 464, "③ 영상 3장 × 문장 3개 — softmax(100 × cos)", { tone: "pink" });
      var C = [[0.30, 0.25, 0.24], [0.24, 0.29, 0.26], [0.23, 0.25, 0.31]], Pm = [[0.991, 0.007, 0.002], [0.006, 0.947, 0.047], [0.000, 0.002, 0.997]];
      var dgt = function (i, j) { return i === j ? "pink" : null; }, dgf = function (i, j) { return i === j ? "mid" : "plain"; };
      k.matrix(120, 516, C, { cw: 58, ch: 30, size: 13.5, fmt: function (v) { return v.toFixed(2); }, rows: ["영상 1", "영상 2", "영상 3"], cols: ["문장 1", "문장 2", "문장 3"], title: "코사인 (예시 값)", titleTone: "pink", tones: dgt, fills: dgf });
      k.arrow(306, 561, 350, 561, { tone: "pink", label: "×100", labelDy: -2 });
      k.matrix(424, 516, Pm, { cw: 62, ch: 30, size: 13.5, fmt: function (v) { return v.toFixed(3); }, rows: ["영상 1", "영상 2", "영상 3"], cols: ["문장 1", "문장 2", "문장 3"], title: "행별 softmax (합 1)", titleTone: "pink", tones: dgt, fills: dgf });
      k.text(40, 640, "영상 2 행: 로짓 24, 29, 26 → softmax 0.006 · 0.947 · 0.047", { size: 12.5, color: "ink" });
      k.text(40, 662, "대각선(짝)이 높게 나오는 것이 사전 학습(대조 학습)이 만들려던 결과", { size: 12.5, weight: 700, tone: "pink" });
      k.text(40, 684, "코사인 차이 0.05가 확률 0.95 차이로 — 순위는 믿되 절대값은 믿지 않는다", { size: 12, color: "muted" });

      k.panel(640, 450, 600, 246, { tone: "red", head: "soft", title: "④ 의료 제로샷 · 검색의 한계" });
      k.note(656, 496, 276, 88, { tone: "teal", title: "영상 종류는 쉽다", body: "X-ray · CT · MRI는 모양이 확연히 달라 제로샷으로도 구분" });
      k.note(948, 496, 276, 88, { tone: "red", title: "소견 수준은 어렵다", body: "정상 · 폐렴 · 흉수 · 심비대처럼 미세한 차이 → 의료 데이터로 미세조정" });
      k.note(656, 594, 276, 88, { tone: "amber", title: "모달리티 간격", body: "영상과 문장 벡터가 다른 덩어리 → 값은 낮아도 순위는 유지" });
      k.note(948, 594, 276, 88, { tone: "purple", title: "의료 CLIP", body: "PubMedCLIP: ROCO 약 8만 쌍 · BiomedCLIP: PMC-15M (1,500만 쌍)" });
    }
  });

  /* ---------------------------------------------------------------- 3. BLIP VQA */
  DSDiagram.register({
    id: SIM + "-3", sim: SIM, order: 3,
    title: "의료 영상 검색 (3) — BLIP 시각 질의응답(VQA) 구조", short: "BLIP VQA 구조",
    sub: "이미지 인코더 → 질문 인코더(Cross-Attention으로 영상 참조) → 답변 디코더(한 단어씩 생성) · Salesforce/blip-vqa-base",
    label: "Multi-Modal",
    draw: function (k) {
      var X = [40, 450, 860], W = 380;
      /* 입력 */
      k.text(X[0], 150, "입력 영상", { size: 13.5, weight: 800, tone: "teal" });
      k.rect(X[0], 160, 86, 86, { tone: "ink", fill: "solid", r: 4 });
      for (var g = 1; g < 6; g++) { k.path("M" + (X[0] + g * 14.3).toFixed(1) + " 160 V246 M" + X[0] + " " + (160 + g * 14.3).toFixed(1) + " H" + (X[0] + 86), { tone: "gray", width: 0.8 }); }
      k.arrow(X[0] + 92, 186, X[0] + 118, 186, { tone: "teal" });
      ["C", "", "", "", "", ""].forEach(function (t, i) { k.box(X[0] + 124 + i * 40, 170, 34, 32, { tone: "teal", title: t, size: 12, r: 5 }); });
      k.text(X[0] + 124, 222, "384×384 → 16×16 패치 576개", { size: 12, weight: 700, color: "ink" });
      k.text(X[0] + 124, 240, "+ [CLS] 1개 = 577 토큰", { size: 12, color: "muted" });

      k.text(X[1], 150, "질문", { size: 13.5, weight: 800, tone: "blue" });
      var qx = X[1];
      ["[ENC]", "is", "there", "evidence", "…", "?"].forEach(function (t, i) { qx += k.chip(qx, 166, t, { tone: "blue", solid: i === 0, size: 12, h: 28 }) + 6; });
      k.text(X[1], 220, "BERT 토크나이저 (어휘 30,524개)", { size: 12, weight: 700, color: "ink" });
      k.text(X[1], 238, "[ENC] = '영상과 함께 인코딩' 신호", { size: 12, color: "muted" });

      k.text(X[2], 150, "생성 시작", { size: 13.5, weight: 800, tone: "orange" });
      var d1 = k.box(X[2], 166, 80, 30, { tone: "orange", fill: "solid", title: "[DEC]", size: 12.5, r: 5 });
      var d2 = k.box(X[2] + 104, 166, 80, 30, { tone: "orange", title: "yes", size: 12.5, r: 5 });
      var d3 = k.box(X[2] + 208, 166, 80, 30, { tone: "orange", title: "[SEP]", size: 12.5, r: 5 });
      k.link(d1.r, d2.l, { tone: "orange", width: 1.6 }); k.link(d2.r, d3.l, { tone: "orange", width: 1.6 });
      k.text(X[2], 220, "[DEC]에서 시작해 단어를 하나씩 예측", { size: 12, weight: 700, color: "ink" });
      k.text(X[2], 238, "[SEP]가 나오면 종료 · max_new_tokens = 20", { size: 12, color: "muted" });

      var cfg = [
        { t: "① 이미지 인코더", r: "ViT-B/16", tone: "teal", blk: [["Self-Attention", "패치끼리"], ["FFN", ""]], out: ["영상 임베딩", "577 × 768"] },
        { t: "② 질문 인코더", r: "BERT-base + Cross-Attn", tone: "blue", blk: [["Self-Attention", "질문 단어끼리"], ["Cross-Attention", "영상 참조"], ["FFN", ""]], out: ["멀티모달 임베딩", "질문 토큰 수 × 768"] },
        { t: "③ 답변 디코더", r: "BERT-base (Causal) + Cross", tone: "orange", blk: [["Causal Self-Attn", "앞 단어만"], ["Cross-Attention", "질문·영상"], ["FFN", ""]], out: ["다음 단어 확률", "30,524개 중 선택 → \"yes\""] }
      ];
      var ca = [];
      cfg.forEach(function (c, i) {
        var x = X[i];
        k.arrow(x + W / 2, 250, x + W / 2, 270, { tone: c.tone });
        k.panel(x, 274, W, 230, { tone: c.tone, head: "soft", title: c.t, right: c.r });
        k.box(x + 18, 320, 248, 156, { tone: "gray", fill: "ghost", dash: true, r: 10 });
        c.blk.forEach(function (b, j) {
          var n = c.blk.length, bh = 36, gap = n === 3 ? 12 : 30, by = 332 + j * (bh + gap) + (n === 2 ? 14 : 0);
          var tone = b[0] === "Cross-Attention" ? "teal" : c.tone;
          var bx = k.box(x + 32, by, 220, bh, { tone: tone, align: "left", title: b[0], size: 13, r: 6 });
          if (b[1]) k.text(x + 244, by + 22, b[1], { size: 11.5, anchor: "end", color: "muted" });
          if (b[0] === "Cross-Attention") ca.push([x + 32, by + bh / 2]);
        });
        k.text(x + 290, 396, "× 12층", { size: 22, weight: 800, tone: c.tone });
        k.text(x + 290, 420, "768차원", { size: 12.5, color: "muted" });
        k.text(x + 18, 494, "한 층 = 위 블록 순서대로 (잔차 연결 · LayerNorm 포함)", { size: 11.5, color: "muted" });
        k.arrow(x + W / 2, 504, x + W / 2, 520, { tone: c.tone });
        k.box(x + 30, 522, W - 60, 46, { tone: c.tone, fill: "solid", title: c.out[0], sub: c.out[1], size: 14, subSize: 11.5 });
      });
      k.arrow(X[0] + W - 30, 545, ca[0][0], ca[0][1], { tone: "teal", width: 2, via: [[X[0] + W + 15, 545], [X[0] + W + 15, ca[0][1]]] });
      k.arrow(X[1] + W - 30, 545, ca[1][0], ca[1][1], { tone: "teal", width: 2, via: [[X[1] + W + 15, 545], [X[1] + W + 15, ca[1][1]]] });

      k.section(40, 604, "④ 실습 노트북 결과 — Closed 질문(yes/no) 앞 50개, 정확 일치", { tone: "gray" });
      k.table(40, 618, [270, 120, 200], [
        ["모형", "정확도", "비고"],
        ["blip-vqa-base (일반)", { t: "0.60 = 30/50", weight: 800, tone: "blue" }, "test[0] 장기 → 'stomach'"],
        ["ayyuce/blip-vqa-rad (미세조정)", { t: "0.00", weight: 800, tone: "red" }, "모든 답이 빈 문자열 ''"]
      ], { rh: 26, size: 12.5 });
      k.note(660, 616, 580, 80, { tone: "red", title: "0.00은 의료 성능이 아니라 불러오기 문제", body: "로드 보고서 text_encoder MISSING (텐서 472 vs 원본 788) → 질문을 못 읽음\n정확도는 참고용 · 빈 출력과 로드 보고서부터 확인" });
    }
  });
})();
