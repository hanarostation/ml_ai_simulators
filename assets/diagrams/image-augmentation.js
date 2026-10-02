/* 이미지 증강 — 알고리즘 구성도 (강의 필기자료 '이미지 증강 — 개념과 기법', '이미지 증강 실습 절차' 양식) */
(function () {
  /* 복부 CT 모양 썸네일 (기하·강도 변형을 transform 과 채움 단계로 흉내) */
  function ct(k, x, y, s, o) {
    o = o || {};
    var cx = x + s / 2, cy = y + s / 2, rx = s * 0.36, ry = s * 0.29;
    var tf = "translate(" + (cx + (o.dx || 0)) + " " + (cy + (o.dy || 0)) + ") rotate(" + (o.rot || 0) + ") scale(" + (o.sc || 1) + ") translate(" + (-cx) + " " + (-cy) + ")";
    var body = o.bright ? "dg-shape dg-shape--f" : "dg-shape";
    var organ = o.contrast ? "dg-shape dg-shape--solid" : "dg-shape";
    var s1 = '<g class="dg-t-ink"><rect class="dg-shape dg-shape--solid" x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="5"/></g>' +
      '<g transform="' + tf + '">' +
      '<g class="dg-t-gray"><ellipse class="' + body + '" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/></g>' +
      '<g class="dg-t-' + (o.contrast ? "ink" : "teal") + '"><circle class="' + organ + '" cx="' + (cx - rx * 0.42) + '" cy="' + (cy - ry * 0.2) + '" r="' + (s * 0.1) + '"/>' +
      '<circle class="' + organ + '" cx="' + (cx + rx * 0.4) + '" cy="' + (cy - ry * 0.25) + '" r="' + (s * 0.075) + '"/></g>' +
      '<g class="dg-t-amber"><circle class="dg-shape" cx="' + cx + '" cy="' + (cy + ry * 0.45) + '" r="' + (s * 0.055) + '"/></g>' +
      '</g>';
    if (o.erase) s1 += '<g class="dg-t-ink"><rect class="dg-shape dg-shape--solid" x="' + (x + s * 0.52) + '" y="' + (y + s * 0.2) + '" width="' + (s * 0.28) + '" height="' + (s * 0.24) + '"/></g>';
    k.raw(s1);
  }

  DSDiagram.register({
    id: "image-augmentation-1", sim: "image-augmentation", order: 1,
    title: "이미지 증강 (1) — 개념과 기법 세 계열", short: "개념과 기법",
    sub: "Data Augmentation · 원본에 회전·이동·확대·밝기 조정 등의 변형을 가해 「학습 데이터」를 인위적으로 늘리는 기법 · 복부 CT 장기 분류(OrganAMNIST) 기준",
    label: "Image Augmentation",
    draw: function (k) {
      /* ① 개념 */
      k.section(40, 152, "① 증강은 무엇을 하는가 — 한 장에서 조금씩 다른 여러 장을 만든다");
      k.panel(40, 166, 1200, 120, { tone: "blue", tinted: true });
      ct(k, 58, 180, 72, {});
      k.text(94, 266, "원본 (Source)", { size: 12, weight: 800, anchor: "middle", color: "ink" });
      k.arrow(140, 216, 172, 216, { tone: "blue", width: 2.2 });
      var V = [["회전", { rot: 12 }], ["이동", { dx: 6, dy: -4 }], ["확대", { sc: 1.18 }], ["축소", { sc: 0.82 }], ["회전 + 이동", { rot: -10, dx: -5, dy: 3 }], ["밝기 ↑", { bright: true }], ["대비 ↑", { contrast: true }]];
      V.forEach(function (v, i) {
        var x = 182 + i * 82;
        ct(k, x, 186, 60, v[1]);
        k.text(x + 30, 262, "Aug " + (i + 1), { size: 11.5, weight: 800, anchor: "middle", color: "ink" });
        k.text(x + 30, 278, v[0], { size: 11.5, anchor: "middle", color: "muted" });
      });
      k.note(790, 176, 434, 32, { tone: "blue", title: "데이터 확장 — 500장도 매 Epoch 조금씩 다른 500장", size: 12.5 });
      k.note(790, 213, 434, 32, { tone: "green", title: "불변성 학습 — 돌거나 밀려도 같은 장기임을 배움", size: 12.5 });
      k.note(790, 250, 434, 32, { tone: "purple", title: "정칙화 — 통째로 외우기 어려움 (Dropout · L2 계열)", size: 12.5 });

      /* ② 세 계열 */
      k.section(40, 316, "② 증강 기법의 세 계열", { sub: "괄호 = 실습 노트북 설정 · 범위는 64 × 64 입력 기준" });
      var P = [
        ["기하 변환 (Geometric)", "픽셀의 위치를 바꾼다", "blue", [
          ["회전", "factor 0.03 × 360° = ±10.8°", { t: "주의", tone: "amber" }],
          ["이동", "0.06 × 64px = ±3.84px", { t: "권장", tone: "green" }],
          ["확대 / 축소", "배율 1 ± 0.10 → 0.9 ~ 1.1", { t: "권장", tone: "green" }],
          ["탄성 변형", "픽셀마다 조금씩 밀기", { t: "주의", tone: "amber" }],
          ["좌우 · 상하 반전", "50% 확률로 뒤집기", { t: "비권장", tone: "red" }]
        ], "빈 곳은 fill_mode = 'constant', fill_value = 0 (검은색)"],
        ["강도 변환 (Photometric)", "픽셀의 값을 바꾼다", "orange", [
          ["밝기", "0.05 × 255 = ±12.75 더하기", { t: "권장", tone: "green" }],
          ["대비", "(x − 평균) × 0.9~1.1 + 평균", { t: "권장", tone: "green" }],
          ["감마·윈도 지터링", "CT 창의 중심 · 폭을 흔듦", { t: "권장", tone: "green" }],
          ["가우시안 노이즈", "픽셀마다 N(0, σ²) 더하기", { t: "권장", tone: "green" }],
          ["블러", "가우시안 σ 0.2 ~ 1.2px", { t: "주의", tone: "amber" }]
        ], "CT는 HU 단위 → 밝기 대신 Window Jittering"],
        ["영역 변환 (Region)", "일부를 지우거나 섞는다", "purple", [
          ["Random Erasing", "면적 2 ~ 12% 상자를 덮음", { t: "주의", tone: "amber" }],
          ["Mixup", "0.7·A + 0.3·B, 라벨도 7 : 3", { t: "주의", tone: "amber" }],
          ["CutMix", "B의 25% 상자를 A에 붙임", { t: "주의", tone: "amber" }],
          ["라벨", "CutMix 라벨 = 붙인 면적 비율", ""],
          ["효과", "가려져도 맞히도록 학습", ""]
        ], "병변을 지우거나 덮으면 라벨이 틀어짐"]
      ];
      P.forEach(function (p, i) {
        var x = 40 + i * 404;
        k.panel(x, 330, 392, 226, { tone: p[2], head: "solid", title: p[0], right: p[1], tinted: true });
        var rows = [["기법", "범위 · 식", "의료영상"]].concat(p[3].map(function (r) { return [r[0], r[1], r[2] ? { t: r[2].t, tone: r[2].tone, weight: 800 } : ""]; }));
        k.table(x + 12, 374, [126, 188, 56], rows, { rh: 25, size: 12 });
        k.text(x + 16, 544, p[4], { size: 12, weight: 700, tone: p[2] });
      });

      /* ③ 지킬 것 · ④ 언제 만드는가 */
      k.section(40, 586, "③ 반드시 지킬 세 가지", { tone: "red" });
      k.box(40, 600, 132, 46, { tone: "green", title: "Train Set", sub: "증강 적용", size: 13.5, subSize: 12 });
      k.box(182, 600, 132, 46, { tone: "red", fill: "plain", title: "Validation Set", sub: "적용하지 않음", size: 13.5, subSize: 12 });
      k.box(324, 600, 132, 46, { tone: "red", fill: "plain", title: "Test Set", sub: "적용하지 않음", size: 13.5, subSize: 12 });
      k.lines(470, 616, [
        { t: "증강 = 새 정보 아님", weight: 800, tone: "red" },
        { t: "데이터를 대신하지 못함", color: "muted" }
      ], { size: 12, lh: 18 });
      k.text(40, 672, "의료영상 주의: ① 좌우 반전 — 장기 좌우가 뒤바뀜  ② 과도한 회전 — 10도 내외로 제한", { size: 12, color: "ink" });
      k.text(40, 692, "③ 강도 변환 — CT 밝기는 HU 단위, 단순 밝기 조정 대신 Window 중심 · 폭을 흔드는 Window Jittering", { size: 12, color: "ink" });

      k.section(660, 586, "④ 사전 증강 vs 실시간 증강", { tone: "teal" });
      k.flow(660, 600, [{ t: "원본 500장" }, { t: "미리 변형", tone: "blue" }, { t: "저장 2,500장" }, { t: "매 Epoch 같음", tone: "purple" }], { label: "Offline", labelW: 64, w: 580, h: 30, gap: 16, size: 12 });
      k.flow(660, 640, [{ t: "원본 500장" }, { t: "증강 Layer", tone: "blue" }, { t: "배치마다 변형", tone: "green" }, { t: "매 Epoch 다름", tone: "purple" }], { label: "Online", labelW: 64, w: 580, h: 30, gap: 16, size: 12 });
      k.text(660, 692, "Offline: 빠르지만 다양성 고정 · Online(노트북 방식): 저장 공간 그대로, 수렴 느림 → epoch 넉넉히", { size: 12, color: "muted" });
    }
  });

  DSDiagram.register({
    id: "image-augmentation-2", sim: "image-augmentation", order: 2,
    title: "이미지 증강 (2) — 증강 Layer 모델과 변환 계산", short: "증강 Layer와 계산",
    sub: "OrganAMNIST · 64 × 64 × 1 · 소량 데이터(클래스당 50장 = 550장)로 증강 효과를 비교하는 실습 노트북 구성과, 증강이 픽셀 값을 만드는 계산",
    label: "Image Augmentation",
    draw: function (k) {
      /* ① 모델 */
      k.section(40, 152, "① 증강 Layer를 선택적으로 끼워 넣는 모델 — build_cnn_model(augmentation_layer=None)", { tone: "blue" });
      k.panel(40, 166, 1200, 150, { tone: "blue", tinted: true });
      var M = [
        { t: "Input", s: "(64, 64, 1)", tone: "ink", fill: "plain" },
        { t: "증강 Layer", s: "augmentation", tone: "orange", dash: true },
        { t: "Rescaling", s: "1. / 255", tone: "gray", fill: "soft" },
        { t: "Conv2D", s: "32, 3×3, relu", tone: "blue" },
        { t: "MaxPool", s: "2 × 2", tone: "gray", fill: "soft" },
        { t: "Conv2D", s: "32, 3×3, relu", tone: "blue" },
        { t: "MaxPool", s: "2 × 2", tone: "gray", fill: "soft" },
        { t: "Flatten", s: "1차원으로", tone: "gray", fill: "soft" },
        { t: "Dense", s: "128, relu", tone: "purple" },
        { t: "Dropout", s: "0.5", tone: "red" },
        { t: "Dense", s: "11, softmax", tone: "ink", fill: "plain" }
      ];
      var bw = 98, gap = 8, x0 = 54;
      M.forEach(function (m, i) {
        var x = x0 + i * (bw + gap);
        k.box(x, 198, bw, 52, { tone: m.tone, fill: m.fill || "tone", dash: m.dash, thick: m.dash, title: m.t, sub: m.s, size: 13, subSize: 11.5 });
        if (i) k.arrow(x - gap + 2, 224, x - 2, 224, { tone: "gray", width: 1.5, headSize: 6.5 });
      });
      k.text(x0 + bw + gap + bw / 2, 190, "None 이면 이 Layer만 빠짐", { size: 11.5, weight: 700, anchor: "middle", tone: "orange" });
      k.text(56, 276, "증강 Layer 위치가 중요: Rescaling 앞에 두어야 value_range = (0, 255)가 실제 픽셀 범위와 맞음 (뒤에 두면 0~1 값에 ±12.75를 더하는 셈)", { size: 12.5, weight: 700, tone: "blue" });
      k.text(56, 298, "학습할 때만 동작: model.fit(training=True)에서만 변형 → predict · evaluate에서는 그대로 통과 — 그래서 검증·평가 데이터는 증강되지 않음 (Dropout과 같은 방식)", { size: 12.5, color: "muted" });

      /* ② 계산 */
      k.section(40, 346, "② 기하 변환 = 역매핑 + 이중선형 보간", { tone: "teal", sub: "예: 회전 θ = 10.8°, 128 × 128 화면, 중심 (64, 64)" });
      k.panel(40, 360, 744, 196, { tone: "teal", tinted: true });
      k.lines(58, 388, [
        { t: "결과 픽셀 (90, 40) → 중심 (90.5, 40.5) 에서 거꾸로 \"원본의 어디를 가져올까\"", weight: 700, color: "ink" },
        { t: "sx = cos θ·(x − 64) + sin θ·(y − 64) + 64" },
        { t: "　= 0.9823 × 26.5 + 0.1874 × (−23.5) + 64 = **85.63**" },
        { t: "sy = −sin θ·(x − 64) + cos θ·(y − 64) + 64" },
        { t: "　= −0.1874 × 26.5 + 0.9823 × (−23.5) + 64 = **35.95**" },
        { t: "소수 좌표 → 주변 4픽셀을 거리 비율로 섞음", color: "muted" },
        { t: "a = 85.63 − 0.5 − 85 = 0.13,  b = 35.95 − 0.5 − 35 = 0.45" },
        { t: "값 = 100×0.87×0.55 + 140×0.13×0.55" },
        { t: "　+ 120×0.87×0.45 + 160×0.13×0.45" },
        { t: "= 47.85 + 10.01 + 46.98 + 9.36 = **114.2**", tone: "teal", weight: 700 }
      ], { size: 12.5, lh: 18 });
      /* 2×2 이웃 그림 */
      k.matrix(652, 404, [[100, 140], [120, 160]], { cw: 56, ch: 56, size: 15, tones: function () { return "gray"; }, fills: function () { return "tone"; } });
      k.circle(652 + 56 * 0.5 + 56 * 0.13, 404 + 56 * 0.5 + 56 * 0.45, 5, { tone: "red", fill: "solid" });
      k.text(708, 536, "빨간 점 = (85.63, 35.95)", { size: 11.5, anchor: "middle", tone: "red" });
      k.text(708, 552, "칸 숫자 = 예시 밝기", { size: 11.5, anchor: "middle", color: "muted" });

      k.section(806, 346, "③ 강도 변환은 값만 바꾼다", { tone: "orange" });
      k.panel(806, 360, 434, 196, { tone: "orange", tinted: true });
      k.lines(824, 388, [
        { t: "픽셀 150 · 영상 평균 100 · 순서 = 대비 → 밝기", weight: 700, color: "ink" },
        { t: "대비 계수 1.1:  (150 − 100) × 1.1 + 100 = **155**" },
        { t: "밝기 +12.75:  155 + 12.75 = **167.75**" },
        { t: "Rescaling:  167.75 / 255 = **0.658**" },
        { t: "0 ~ 255 밖으로 나가면 잘라냄 (clip)", color: "muted" },
        { t: "위치는 그대로 → 라벨 · 박스 좌표 불변", tone: "orange", weight: 700 }
      ], { size: 12.5, lh: 25 });

      /* ④ 비교 실험 */
      k.section(40, 586, "④ 비교 실험 — 같은 550장, 같은 구조, 증강 Layer 유무만 다르게", { tone: "green" });
      var xs = k.box(40, 604, 120, 50, { tone: "ink", fill: "plain", title: "X_small", sub: "550장 · 11클래스", size: 13.5, subSize: 11.5 });
      var m1 = k.box(196, 600, 210, 34, { tone: "blue", title: "model_no_aug (None)", size: 12.5 });
      var m2 = k.box(196, 642, 210, 34, { tone: "red", title: "model_aug (증강 5종)", size: 12.5 });
      k.arrow(162, 622, 194, 617, { tone: "gray", width: 1.5, headSize: 6.5 });
      k.arrow(162, 636, 194, 659, { tone: "gray", width: 1.5, headSize: 6.5 });
      var ev = k.box(442, 612, 150, 50, { tone: "red", fill: "plain", title: "evaluate_model", sub: "classification_report", size: 12.5, subSize: 11.5 });
      k.arrow(408, 617, 440, 630, { tone: "gray", width: 1.5, headSize: 6.5 });
      k.arrow(408, 659, 440, 646, { tone: "gray", width: 1.5, headSize: 6.5 });
      k.text(40, 698, "epochs = 40 · validation_split = 0.2 · batch_size = 32", { size: 12, color: "muted" });
      /* 손실 곡선 모식도 */
      k.axes(640, 604, 270, 88, {});
      k.text(632, 614, "손실", { size: 11.5, anchor: "end", color: "muted" });
      k.path("M644 606 C700 650 780 672 906 684", { tone: "blue", width: 2 });
      k.path("M644 608 C700 640 760 650 820 646 S880 634 906 628", { tone: "blue", width: 2, dash: "5 4" });
      k.path("M644 606 C700 636 790 652 906 658", { tone: "red", width: 2 });
      k.path("M644 608 C700 640 790 656 906 664", { tone: "red", width: 2, dash: "5 4" });
      k.text(916, 628, "증강 X · 검증 ↑", { size: 11.5, weight: 700, tone: "blue" });
      k.text(916, 684, "증강 X · 학습", { size: 11.5, tone: "blue" });
      k.text(916, 658, "증강 O · 학습/검증", { size: 11.5, weight: 700, tone: "red" });
      k.bullets(1036, 618, 204, [
        { t: "증강 X: 간격 커짐 = 과적합", tone: "blue" },
        { t: "증강 O: 간격 유지, 수렴은 느림", tone: "red" },
        { t: "데이터가 적을수록 이득 큼", tone: "green" }
      ], { size: 12, lh: 22 });
    }
  });
})();
