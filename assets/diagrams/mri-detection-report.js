/* [Case Study] MRI 데이터 객체 탐지 및 문장 생성 — 알고리즘 구성도
   강의 필기자료 양식: CLIP과 비전-언어 모델(96쪽), 검색 기반 리포트 생성(98쪽), 리포트 평가와 환각 검증(99쪽)
   숫자는 시뮬레이터 화면과 실습 노트북 출력 기준 (요추 MRI 469장 · 환자 216명) */
(function () {
  var SIM = "mri-detection-report";

  /* ---------------------------------------------------------------- 1. 사례 흐름 */
  DSDiagram.register({
    id: SIM + "-1", sim: SIM, order: 1,
    title: "요추 MRI 판독 리포트 (1) — 탐지 박스에서 리포트까지", short: "사례 파이프라인",
    sub: "요추 MRI 추간공 협착 사례 · 탐지 박스(어느 분절 · 어느 쪽) → 구조화 소견(협착 등급) → 문장(리포트) · 세 방식을 같은 지표로 채점",
    label: "Multi-Modal",
    draw: function (k) {
      k.section(40, 152, "① 데이터 — '영상 1장 = 1행'으로 병합, 환자 단위로 분할", { tone: "teal" });
      var t1 = k.box(40, 168, 180, 46, { tone: "gray", fill: "soft", title: "02_Disc_image", sub: "영상 단위 (469, 10)", size: 13.5, subSize: 11.5, titleColor: "ink" });
      var t2 = k.box(40, 222, 180, 46, { tone: "gray", fill: "soft", title: "02_Patient_Data", sub: "환자 단위 (216, 11)", size: 13.5, subSize: 11.5, titleColor: "ink" });
      var t3 = k.box(40, 276, 180, 46, { tone: "gray", fill: "soft", title: "02_Patient_Diagnosis", sub: "환자 단위 (216, 26)", size: 13.5, subSize: 11.5, titleColor: "ink" });
      var mg = k.box(250, 212, 152, 66, { tone: "teal", title: "병합 (469, 45)", sub: "키 = 환자ID · 행 수 그대로", size: 14.5, subSize: 11.5 });
      [t1, t2, t3].forEach(function (t) { k.link(t.r, mg.l, { tone: "gray", width: 1.6 }); });
      k.lines(426, 186, [
        { t: "환자 216 = 109 + 35 + 72", weight: 800, color: "ink" },
        "영상 3장 · 2장 · 1장인 환자 수",
        { t: "3×109 + 2×35 + 72 = **469**", tone: "teal" }
      ], { size: 12.5, lh: 19 });
      k.table(426, 252, [86, 64, 64], [
        ["분할", "환자", "영상"],
        ["학습", "152", "322"],
        ["검증", "64", "147"]
      ], { rh: 22, size: 12 });
      k.note(40, 336, 580, 46, { tone: "red", title: "영상 단위 무작위 분할이면 76명이 학습·검증 양쪽에", body: "같은 환자의 리포트는 거의 같다 → 검색 방식이 정답을 베낀다 (누수)" });

      k.panel(650, 136, 590, 248, { tone: "blue", head: "soft", title: "② 구조화 소견 → 정답 리포트 (make_report 규칙)" });
      k.table(664, 180, [140, 106], [
        ["소견 컬럼", "예시 값"],
        ["fs_grade_max", "3 (중증)"],
        ["좌 / 우 최대", "1 / 3"],
        ["침범 분절", "L3-L4, L4-L5"],
        ["이상 추간공 수", "3"]
      ], { rh: 22, size: 12 });
      k.arrow(916, 236, 938, 236, { tone: "blue" });
      k.box(942, 176, 286, 124, { tone: "blue", fill: "plain", align: "left", valign: "top", r: 8, size: 12,
        title: "[소견]", titleColor: "tone",
        lines: [{ t: "최대 협착 등급은 3등급(중증) 이며,\n좌측 최대 1등급 / 우측 최대 3등급 임.\n침범 분절은 L3-L4, L4-L5 임. …", size: 11.5 },
                { t: "[결론] 중증 추간공 협착.\n신경 압박 여부에 대한 추가 평가 권고.", size: 11.5, tone: "blue", weight: 700 }] });
      k.lines(666, 318, [
        { t: "결측은 두 종류 — 드러내되 지어내지 않는다", weight: 800, tone: "red" },
        "좌·우 등급 결측(24·30건) = 측정 누락 → '측정되지 않음'",
        "침범 분절 결측(96건) = 정상 → '침범 분절 없음'"
      ], { size: 12, lh: 18 });

      k.section(40, 418, "③ 리포트를 만드는 세 방식 — 같은 영상, 다른 경로", { tone: "pink" });
      var lanes = [
        ["템플릿", "gray", [{ t: "MRI 영상", s: "검증 147장", tone: "teal" }, { t: "CLIP 영상 인코더", s: "→ 512", tone: "teal" }, { t: "로지스틱 회귀", s: "512 → 등급 0~3", tone: "pink" }, { t: "문장 틀 채우기", s: "나머지 '확인되지 않음'", tone: "blue" }]],
        ["검색", "gray", [{ t: "MRI 영상", s: "질의", tone: "teal" }, { t: "CLIP 영상 인코더", s: "→ 512", tone: "teal" }, { t: "학습 322장과 코사인", s: "최근접 1건", tone: "pink" }, { t: "그 케이스 리포트 복사", s: "남의 환자 소견", tone: "red" }]],
        ["생성", "gray", [{ t: "MRI 영상", s: "40장", tone: "teal" }, { t: "BLIP ViT", s: "577×768", tone: "teal" }, { t: "텍스트 디코더", s: "교차 어텐션", tone: "pink" }, { t: "영문 캡션", s: "환각 · 등급 미언급", tone: "red" }]]
      ];
      lanes.forEach(function (ln, i) {
        var y = 434 + i * 56;
        k.chip(40, y + 11, ln[0], { tone: ["blue", "orange", "purple"][i], solid: true, w: 74, size: 13 });
        k.flow(128, y, ln[2], { w: 880, h: 46, gap: 22, size: 13 });
        k.arrow(1010, y + 23, 1050, y + 23, { tone: "gray", width: 1.6 });
      });
      k.box(1054, 434, 186, 158, { tone: "gray", fill: "plain", title: "같은 지표로 채점", lines: ["ROUGE-1 · 정밀도", { t: "등급 정확도", tone: "red", weight: 700 }, "등급 미언급 비율"], size: 14.5, subSize: 12.5 });

      k.flow(40, 624, [
        { t: "영상", tone: "teal" }, { t: "탐지 박스 (근거)", tone: "teal" }, { t: "구조화 소견 (등급)", tone: "pink" },
        { t: "문장 (리포트 초안)", tone: "blue" }, { t: "판독의 확인 · 서명", tone: "red", fill: "solid" }
      ], { label: "안전한 순서", w: 1200, h: 38, gap: 22, size: 13 });
      k.text(40, 690, "문장 단계에서 새 사실이 생기면 안 된다 — 탐지 박스는 '어느 분절, 어느 쪽'의 근거로 리포트에 함께 남긴다", { size: 12.5, color: "muted" });
    }
  });

  /* ---------------------------------------------------------------- 2. CLIP */
  DSDiagram.register({
    id: SIM + "-2", sim: SIM, order: 2,
    title: "요추 MRI 판독 리포트 (2) — CLIP 대조 학습", short: "CLIP 대조 학습",
    sub: "영상과 문장을 같은 512차원 공간에 놓는다 · openai/clip-vit-base-patch32 (151.3M) · 이미지-설명문 4억 쌍, 사람 라벨 없음",
    label: "Foundation Model",
    draw: function (k) {
      k.section(40, 150, "① 구조 — 두 인코더가 각자 벡터를 만들고, 같은 공간에서 비교", { tone: "pink" });
      k.chip(40, 177, "영상", { tone: "teal", solid: true, w: 58 });
      k.flow(108, 166, [
        { t: "요추 MRI", s: "3×224×224", tone: "teal", fill: "plain" }, { t: "패치 32×32", s: "49 + CLS = 50×768", tone: "teal" },
        { t: "ViT × 12층", s: "50×768", tone: "teal" }, { t: "CLS → W_i", s: "768 → 512", tone: "teal" }, { t: "L2 정규화", s: "I : N×512", tone: "pink" }
      ], { w: 850, h: 48, gap: 20, size: 13.5 });
      k.chip(40, 245, "문장", { tone: "blue", solid: true, w: 58 });
      k.flow(108, 234, [
        { t: "판독 문장", s: "\"a sagittal MRI …\"", tone: "blue", fill: "plain" }, { t: "BPE 토큰화", s: "L ≤ 77", tone: "blue" },
        { t: "Transformer × 12", s: "폭 512", tone: "blue" }, { t: "EOS → W_t", s: "512 → 512", tone: "blue" }, { t: "L2 정규화", s: "T : N×512", tone: "pink" }
      ], { w: 850, h: 48, gap: 20, size: 13.5 });
      var sm = k.box(1000, 166, 240, 116, { tone: "pink", fill: "tone", title: "S = I · Tᵀ  (N×N)", lines: ["정규화 후 내적 = 코사인", "× logit scale 100 (= 1/τ)", { t: "→ 대칭 InfoNCE", tone: "pink", weight: 800 }], size: 15, subSize: 12.5 });
      k.arrow(960, 190, 998, 200, { tone: "pink", width: 1.8 });
      k.arrow(960, 258, 998, 248, { tone: "pink", width: 1.8 });
      k.text(40, 306, "같은 쌍은 가깝게, 다른 쌍은 멀게 — 짝지어져 있다는 사실 자체가 라벨 (자기지도)", { size: 13, weight: 700, color: "ink" });

      k.section(40, 344, "② 실제 코사인 유사도 (실습 노트북)", { tone: "pink" });
      var S = [[0.321, 0.255, 0.257, 0.213], [0.243, 0.319, 0.269, 0.187], [0.281, 0.299, 0.315, 0.199], [0.220, 0.182, 0.197, 0.240]];
      k.matrix(140, 384, S, { cw: 76, ch: 30, size: 13.5, fmt: function (v) { return v.toFixed(3); },
        rows: ["X-ray (정상)", "요추 MRI", "복부 CT", "도구 사진"], cols: ["X-ray 문장", "MRI 문장", "CT 문장", "도구 문장"],
        tones: function (i, j) { return i === j ? "pink" : (i === 2 ? "amber" : null); }, fills: function (i, j) { return i === j ? "mid" : (i === 2 ? "tone" : "plain"); } });
      k.text(40, 518, "문장: a chest X-ray image · a sagittal MRI scan of the lumbar spine", { size: 11.5, color: "muted" });
      k.text(40, 534, "an axial CT scan of the abdomen · a photograph of medical tools on a tray", { size: 11.5, color: "muted" });
      k.text(40, 552, "값은 0.18~0.33에 몰림 → 절대값이 아니라 같은 행 안의 순위만 의미", { size: 12, color: "muted" });

      k.panel(500, 330, 740, 226, { tone: "pink", head: "solid", title: "③ 대칭 InfoNCE — 대각선이 정답인 분류 두 개", right: "로짓 = 100 × cos" });
      k.lines(518, 388, [
        { t: "복부 CT 행 (영상 → 문장 방향)", weight: 800, color: "ink" },
        "로짓 = 28.1, 29.9, 31.5, 19.9",
        { t: "softmax = 0.027, 0.163, **0.810**, 0.000", tone: "pink" },
        { t: "행 손실 = −log 0.810 = **0.211**", tone: "pink" },
        { t: "MRI 문장(0.299)과 헷갈려 손실이 남는다", color: "muted" }
      ], { size: 13, lh: 21 });
      k.formula(880, 376, 348, 104, "L = ½ ( CE_행 + CE_열 )\n행 평균 0.091 · 열 평균 0.061\n→ L = **0.076**", { size: 14, align: "left" });
      k.text(880, 500, "무작위(4쌍)라면 log 4 = 1.386", { size: 12.5, color: "muted" });
      k.text(880, 520, "학습 = 대각선 확률을 1에 가깝게", { size: 12.5, weight: 700, tone: "pink" });

      k.section(40, 584, "④ 학습 후 쓰임 — 라벨 수에 따른 선택 (OrganAMNIST 11개 장기)", { tone: "purple" });
      var bars = [["무작위", 9.09, "gray", "라벨 0"], ["CLIP 제로샷", 14.24, "purple", "라벨 0"], ["선형 프로빙", 64.85, "purple", "클래스당 40장"], ["ResNet50 전이학습", 85.45, "ink", "클래스당 500장"]];
      bars.forEach(function (b, i) {
        var y = 600 + i * 24, w = b[1] / 100 * 420;
        k.text(190, y + 15, b[0], { size: 12.5, weight: 700, anchor: "end", color: "ink" });
        k.rect(200, y + 3, w, 16, { tone: b[2], fill: i === 0 ? "mid" : "solid", r: 3 });
        k.text(206 + w, y + 16, b[1].toFixed(2) + "%  · " + b[3], { size: 12, weight: 700, tone: b[2] === "ink" ? "gray" : b[2] });
      });
      k.note(800, 596, 440, 96, { tone: "red", title: "양식은 알고 병변은 모른다", body: "정상 X-ray도 pneumonia 문장이 더 가깝다 (0.314 < 0.335)\n→ 100배 softmax면 폐렴 확률 0.891\n흉부 이진 제로샷 50% = 200장 전부 폐렴으로 예측", bodySize: 12 });
    }
  });

  /* ---------------------------------------------------------------- 3. 채점 · 환각 */
  DSDiagram.register({
    id: SIM + "-3", sim: SIM, order: 3,
    title: "요추 MRI 판독 리포트 (3) — 세 방식 채점과 환각 검증", short: "채점과 환각",
    sub: "문장이 비슷한 것과 사실이 맞는 것은 다르다 · 검증 147장(BLIP은 40장) · 텍스트 겹침(ROUGE-1) vs 임상 사실(등급 정확도)",
    label: "Foundation Model",
    draw: function (k) {
      k.section(40, 150, "① ROUGE의 함정 — 숫자 하나만 다른 두 문장", { tone: "blue" });
      var toks = ["최대", "협착", "등급은", "3등급", "이며", "침범", "분절은", "L4-L5", "임"];
      [["정답", "3등급"], ["생성", "1등급"]].forEach(function (r, i) {
        var y = 170 + i * 40;
        k.text(40, y + 19, r[0], { size: 13.5, weight: 800, color: "ink" });
        var x = 84;
        toks.forEach(function (t, j) {
          var tt = j === 3 ? r[1] : t, w = k.textWidth(tt, 12.5, { weight: 700 }) + 22;
          k.chip(x, y, tt, { tone: j === 3 ? "red" : "blue", size: 12.5, h: 28, w: w });
          x += w + 6;
        });
      });
      k.formula(40, 260, 580, 72, "ROUGE-1 = 겹친 단어 ÷ 정답 단어 = 8 ÷ 9 = **0.889**\n등급 추출 extract_grade: 3 vs 1 → **불일치**", { size: 14, align: "left" });
      k.text(40, 354, "중증과 경도, 임상적으로 정반대인데 점수는 높다 → 등급을 뽑아 따로 비교한다", { size: 12.5, weight: 700, tone: "red" });

      k.panel(650, 136, 590, 236, { tone: "orange", head: "soft", title: "② 세 방식 채점 결과 (검증 전체)", right: "검색: 텍스트 최고 · 사실 최저" });
      var data = [["템플릿", 0.434, 0.327], ["검색", 0.799, 0.299], ["BLIP 생성", 0.0, 0.0]];
      k.rect(676, 184, 12, 12, { tone: "blue", fill: "mid", r: 2 }); k.text(694, 195, "ROUGE-1", { size: 12, weight: 700, color: "ink" });
      k.rect(776, 184, 12, 12, { tone: "orange", fill: "solid", r: 2 }); k.text(794, 195, "등급 정확도 (임상 사실)", { size: 12, weight: 700, color: "ink" });
      k.path("M670 330 H1222", { tone: "gray", width: 1.2 });
      data.forEach(function (d, i) {
        var cx = 740 + i * 176, h1 = d[1] * 120, h2 = d[2] * 120;
        k.rect(cx - 40, 330 - h1, 38, h1, { tone: "blue", fill: "mid", r: 3 });
        k.rect(cx + 2, 330 - h2, 38, h2, { tone: "orange", fill: "solid", r: 3 });
        k.text(cx - 21, 324 - h1, d[1].toFixed(3), { size: 12, weight: 700, anchor: "middle", tone: "blue" });
        k.text(cx + 21, 324 - h2 - (i === 2 ? 14 : 0), d[2].toFixed(3), { size: 12, weight: 700, anchor: "middle", tone: "orange" });
        k.text(cx, 348, d[0], { size: 13, weight: 800, anchor: "middle", color: "ink" });
      });
      k.text(1092, 364, "등급 미언급 100%", { size: 11.5, weight: 700, anchor: "middle", tone: "red" });

      k.section(40, 406, "③ 등급이 맞는가 — 교차표로 검산", { tone: "pink" });
      var NN = [[5, 11, 5, 10], [1, 8, 12, 14], [6, 4, 11, 15], [4, 6, 15, 20]], LR = [[0, 13, 2, 16], [0, 17, 6, 12], [0, 13, 5, 18], [0, 14, 5, 26]];
      var dg = function (i, j) { return i === j ? "pink" : null; };
      k.matrix(118, 452, NN, { cw: 40, ch: 26, size: 13, rows: ["실제 0", "실제 1", "실제 2", "실제 3"], cols: ["0", "1", "2", "3"], title: "검색: 최근접 1건의 등급", titleTone: "pink", tones: dg, fills: function (i, j) { return i === j ? "mid" : "plain"; } });
      k.matrix(420, 452, LR, { cw: 40, ch: 26, size: 13, rows: ["실제 0", "실제 1", "실제 2", "실제 3"], cols: ["0", "1", "2", "3"], title: "템플릿: CLIP + 로지스틱 회귀 예측", titleTone: "pink", tones: function (i, j) { return i === j ? "pink" : (j === 0 ? "red" : null); }, fills: function (i, j) { return i === j ? "mid" : (j === 0 ? "tone" : "plain"); } });
      k.lines(40, 584, [
        { t: "검색 = (5 + 8 + 11 + 20) / 147 = 44 / 147 = **29.93%**", tone: "pink" },
        { t: "템플릿 = (0 + 17 + 5 + 26) / 147 = 48 / 147 = **32.65%**", tone: "pink" },
        { t: "무작위 25% 수준 · 예측기는 0등급(빨간 열)을 한 번도 내지 않음", color: "muted" },
        { t: "템플릿 리포트는 예측만큼만 맞는다 → 채점이 곧 모형 평가", weight: 700, color: "ink" }
      ], { size: 12.5, lh: 21 });

      k.panel(650, 392, 590, 302, { tone: "red", head: "soft", title: "④ BLIP 환각과 리포트 안전장치" });
      var cap = [["a radiograph of the knee showing the fracture", "부위 오류 + 없는 진단"], ["a black and white photo of a woman's knee", "다른 부위"], ["a mri mri mri mri mri mri …", "같은 단어 반복"]];
      cap.forEach(function (c, i) {
        var y = 440 + i * 34;
        k.text(666, y + 17, c[0], { size: 12.5, color: "ink", mono: true });
        k.chip(1224, y + 3, c[1], { tone: "red", solid: true, size: 11.5, h: 22, anchor: "end" });
      });
      k.text(666, 562, "요추 MRI에 무릎·골절 — 문장은 완벽하게 자연스러워 더 믿기 쉽다", { size: 12, weight: 700, tone: "red" });
      var safe = [["예측과 문장 분리", "문장 단계에서 새 사실 금지"], ["모르는 항목은 비움", "'확인되지 않음' 명시"], ["근거 첨부", "탐지 박스 · 분절 위치"], ["초안 표시 · 불확실성", "확률 0.60 미만이면 단정 금지"]];
      safe.forEach(function (s, i) {
        var x = 666 + (i % 2) * 284, y = 578 + Math.floor(i / 2) * 50;
        k.box(x, y, 274, 44, { tone: "green", fill: "soft", align: "left", title: s[0], sub: s[1], size: 12.5, subSize: 11.5, r: 7, titleColor: "tone" });
      });
    }
  });
})();
