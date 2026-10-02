/* YOLOv8n 동작 원리 — 알고리즘 구성도 (강의 필기자료 'YOLOv8n ① 네트워크 구조 · ② Detect Head · ③ 실행 방식' 양식) */
DSDiagram.register({
  id: "yolo-how-it-works-1", sim: "yolo-how-it-works", order: 1,
  title: "YOLOv8n (1) — Backbone · Neck · Head 구조", short: "네트워크 구조",
  sub: "입력 640 × 640 기준 실제 텐서 크기 · n(nano) = 깊이 ×0.33, 폭 ×0.25 · 파라미터 3,157,200개 · 8.7~8.9 GFLOPs · COCO 80클래스 사전학습",
  label: "Object Detection",
  draw: function (k) {
    var R0 = 150, RS = 37.5, RH = 31;
    var ry = function (r) { return R0 + r * RS; }, rc = function (r) { return R0 + r * RS + RH / 2; };
    var XB = 40, WB = 268, XF = 362, WF = 248, XP = 668, WP = 248, XH = 966, WH = 274;
    k.text(XB, 140, "Backbone (특징 추출)", { size: 14, weight: 800, tone: "blue" });
    k.text(XF, 140, "Neck ↑ FPN (깊은 층 → 얕은 층)", { size: 14, weight: 800, tone: "green" });
    k.text(XP, 140, "Neck ↓ PAN (얕은 층 → 깊은 층)", { size: 14, weight: 800, tone: "green" });
    k.text(XH, 140, "Head (Detect, Anchor-free)", { size: 14, weight: 800, tone: "orange" });
    function blk(x, w, r, t, s, tone, fill, tag) {
      var b = k.box(x, ry(r), w, RH, { tone: tone, fill: fill || "tone", r: 6, align: "left", title: t, sub: s, size: 12, subSize: 11.5 });
      if (tag) k.text(x + w - 10, ry(r) + 14, tag, { size: 11.5, weight: 800, anchor: "end", tone: "red" });
      return b;
    }
    /* Backbone */
    var BB = [["입력", "640×640×3", "gray", "plain"], ["L0 Conv 3×3 s2", "320×320×16 (P1, /2)"], ["L1 Conv 3×3 s2", "160×160×32 (P2, /4)"], ["L2 C2f ×1", "160×160×32"], ["L3 Conv 3×3 s2", "80×80×64 (P3, /8)"], ["L4 C2f ×2", "80×80×64", 0, 0, "→ P3"], ["L5 Conv 3×3 s2", "40×40×128 (P4, /16)"], ["L6 C2f ×2", "40×40×128", 0, 0, "→ P4"], ["L7 Conv 3×3 s2", "20×20×256 (P5, /32)"], ["L8 C2f ×1", "20×20×256"], ["L9 SPPF", "20×20×256 (다중 수용영역)", 0, 0, "→ P5"]];
    BB.forEach(function (b, r) {
      blk(XB, WB, r, b[0], b[1], b[2] || "blue", b[3], b[4]);
      if (r) k.arrow(XB + WB / 2, ry(r) - RS + RH + 1, XB + WB / 2, ry(r) - 1, { tone: "gray", width: 1.4, headSize: 5.5 });
    });
    /* FPN */
    var F = { 10: [10, "L10 Upsample ×2", "40×40×256"], 11: [7, "L11 Concat (L10 ⊕ L6)", "40×40×384"], 12: [6, "L12 C2f ×1", "40×40×128"], 13: [5, "L13 Upsample ×2", "80×80×128"], 14: [4, "L14 Concat (L13 ⊕ L4)", "80×80×192"], 15: [3, "L15 C2f ×1", "80×80×64 → P3 출력"] };
    Object.keys(F).forEach(function (key) { var f = F[key]; blk(XF, WF, f[0], f[1], f[2], "green"); });
    var cxF = XF + WF / 2;
    k.arrow(cxF, ry(10) - 1, cxF, ry(7) + RH + 1, { tone: "green", width: 1.5, headSize: 6 });
    [[7, 6], [6, 5], [5, 4], [4, 3]].forEach(function (p) { k.arrow(cxF, ry(p[0]) - 1, cxF, ry(p[1]) + RH + 1, { tone: "green", width: 1.5, headSize: 5.5 }); });
    /* PAN */
    var P = [[4, "L16 Conv 3×3 s2", "40×40×64"], [6, "L17 Concat (L16 ⊕ L12)", "40×40×192"], [7, "L18 C2f ×1", "40×40×128 → P4 출력"], [9, "L19 Conv 3×3 s2", "20×20×128"], [10, "L20 Concat (L19 ⊕ L9)", "20×20×384"], [11, "L21 C2f ×1", "20×20×256 → P5 출력"]];
    P.forEach(function (p, i) {
      blk(XP, WP, p[0], p[1], p[2], "green");
      if (i) k.arrow(XP + WP / 2, ry(P[i - 1][0]) + RH + 1, XP + WP / 2, ry(p[0]) - 1, { tone: "green", width: 1.5, headSize: 5.5 });
    });
    /* 연결 */
    k.arrow(XB + WB, rc(10), XF - 2, rc(10), { tone: "blue", width: 1.6, headSize: 6 });
    k.arrow(XB + WB, rc(7), XF - 2, rc(7), { tone: "blue", width: 1.4, dash: true, headSize: 6 });
    k.arrow(XB + WB, rc(5), XF - 2, rc(4), { tone: "blue", width: 1.4, dash: true, headSize: 6, via: [[XB + WB + 26, rc(5)], [XB + WB + 26, rc(4)]] });
    k.arrow(XF + WF, rc(6), XP - 2, rc(6), { tone: "green", width: 1.4, dash: true, headSize: 6 });
    k.arrow(XF + WF, rc(3), XP - 2, rc(4), { tone: "green", width: 1.5, headSize: 6, via: [[XP - 26, rc(3)], [XP - 26, rc(4)]] });
    k.arrow(XB + WB / 2 + 60, ry(10) + RH, XP - 2, rc(10) + 6, { tone: "blue", width: 1.4, dash: true, headSize: 6, via: [[XB + WB / 2 + 60, rc(11) + 4], [XP - 40, rc(11) + 4], [XP - 40, rc(10) + 6]] });
    /* Head */
    var H = [[3, "Detect-P3 80 × 80", "stride 8 → 6,400 위치 · 작은 객체"], [7, "Detect-P4 40 × 40", "stride 16 → 1,600 위치 · 중간 객체"], [11, "Detect-P5 20 × 20", "stride 32 → 400 위치 · 큰 객체"]];
    H.forEach(function (h, i) {
      k.box(XH, ry(h[0]) - 6, WH, RH + 12, { tone: "orange", r: 6, title: h[1], sub: h[2], size: 12.5, subSize: 11.5 });
      var sx = i === 0 ? XF + WF : XP + WP;
      k.arrow(sx, rc(h[0]), XH - 2, rc(h[0]), { tone: "orange", width: 1.6, headSize: 6 });
    });
    k.box(XH, ry(0) - 4, WH, 82, { tone: "orange", fill: "plain", thick: true, r: 8, align: "left", valign: "top", title: "최종 출력 1 × 84 × 8,400", titleColor: "tone", size: 14,
      lines: [{ t: "84 = 박스 4 (x, y, w, h) + 클래스 80", size: 12 }, { t: "8,400 = 6,400 + 1,600 + 400 위치", size: 12 }, { t: "→ 신뢰도 필터 → NMS → 최종 박스", size: 12, weight: 700, tone: "red" }] });
    k.arrow(XH + WH / 2, ry(3) - 7, XH + WH / 2, ry(0) + 80, { tone: "orange", width: 1.6, headSize: 6, label: "세 헤드 결과 Concat", labelDx: 70, labelDy: 8 });
    k.text(XH, rc(5) + 4, "칸마다 분리형 헤드: 박스 64ch + 분류 80ch", { size: 11.5, color: "muted" });
    k.text(XH, rc(9) + 4, "학습 출력: 80²·40²·20² × 144ch", { size: 11.5, color: "muted" });

    /* 블록 구성 */
    k.panel(40, 610, 1200, 92, { tone: "gray" });
    k.text(56, 632, "블록 구성", { size: 13.5, weight: 800, color: "ink" });
    k.lines(56, 652, [{ t: "Conv = Conv2d(k, s) → BatchNorm → SiLU", tone: "blue", weight: 700 }, { t: "s2(stride 2)가 해상도를 절반으로 — 풀링 대신 사용" }, { t: "채널: 16 · 32 · 64 · 128 · 256 (n 스케일 = 1/4)" }], { size: 12, lh: 17 });
    k.lines(470, 652, [{ t: "C2f = Conv 1×1 → 절반 분할 → Bottleneck ×n → 모두 Concat → Conv 1×1", tone: "green", weight: 700 }, { t: "SPPF = MaxPool 5×5 세 번 연속 → 4개 결과 Concat (작은·큰 수용영역)" }, { t: "Upsample = 최근접 ×2 · Concat · Upsample은 학습 파라미터 0개" }], { size: 12, lh: 17 });
    k.lines(960, 652, [{ t: "점선 = 건너뛰기 연결(Concat)", weight: 700, color: "ink" }, { t: "FPN: 깊은 층의 '무엇'을 얕은 층으로" }, { t: "PAN: 얕은 층의 '어디'를 깊은 층으로" }], { size: 12, lh: 17 });
  }
});

DSDiagram.register({
  id: "yolo-how-it-works-2", sim: "yolo-how-it-works", order: 2,
  title: "YOLOv8n (2) — Detect Head · DFL · Anchor-free", short: "Detect Head · DFL",
  sub: "한 위치(격자 칸 중심 = anchor point)마다 '박스 4변까지 거리 분포'와 '클래스 80개 점수'를 따로 예측 · v5와 달리 objectness 점수와 앵커 박스가 없다",
  label: "Object Detection",
  draw: function (k) {
    /* ① 분리형 헤드 */
    k.panel(40, 128, 590, 276, { tone: "gray" });
    k.text(58, 156, "① 분리형(Decoupled) 헤드 — P3 한 층 예시", { size: 15, weight: 800, color: "ink" });
    var src = k.box(56, 248, 112, 52, { tone: "green", title: "P3 특성맵", sub: "80 × 80 × 64", size: 13, subSize: 12 });
    var top = [["Conv 3×3", "64ch"], ["Conv 3×3", "64ch"], ["Conv 1×1", "64ch"]], bot = [["Conv 3×3", "80ch"], ["Conv 3×3", "80ch"], ["Conv 1×1", "80ch"]];
    function branch(arr, y, tone, endT, endS) {
      var prev = null;
      arr.forEach(function (a, i) {
        var b = k.box(206 + i * 96, y, 84, 44, { tone: tone, title: a[0], sub: a[1], size: 12.5, subSize: 11.5 });
        if (prev) k.link(prev.r, b.l, { tone: tone, width: 1.5, headSize: 6 });
        prev = b;
      });
      var e = k.box(498, y - 8, 120, 60, { tone: tone, fill: "plain", thick: true, title: endT, sub: endS, size: 13, subSize: 11.5 });
      k.link(prev.r, e.l, { tone: tone, width: 1.5, headSize: 6 });
      return y + 22;
    }
    var yb = branch(top, 180, "blue", "박스 회귀", "4변 × 16구간 = 64ch");
    var yc = branch(bot, 318, "orange", "분류 80개", "독립 sigmoid 확률");
    k.arrow(168, 274, 204, yb, { tone: "blue", width: 1.5, headSize: 6, via: [[186, 274], [186, yb]] });
    k.arrow(168, 274, 204, yc, { tone: "orange", width: 1.5, headSize: 6, via: [[186, 274], [186, yc]] });
    k.text(206, 252, "P4 (40×40×128) · P5 (20×20×256)도 같은 구조", { size: 11.5, color: "muted" });
    k.text(206, 272, "'어디(박스)'와 '무엇(클래스)'은 필요한 특징이 달라 따로 계산", { size: 11.5, color: "muted" });
    k.text(206, 290, "칸 (P3, 행 29, 열 57): conf = 최대 점수 = σ(−0.76) = 0.319 (결절)", { size: 11.5, weight: 700, tone: "orange" });

    /* ② DFL */
    k.panel(650, 128, 590, 276, { tone: "gray" });
    k.text(668, 156, "② DFL (Distribution Focal Loss) — 거리를 '분포'로 예측", { size: 15, weight: 800, color: "ink" });
    var pv = [0, 0, 0, 0.003, 0.054, 0.286, 0.437, 0.194, 0.025, 0.001, 0, 0, 0, 0, 0, 0];
    var bx = 676, by = 196, bw = 21, bh = 150, mx = 0.5;
    k.raw('<path class="dg-axis" d="M' + bx + " " + (by + bh) + " H" + (bx + 16 * bw + 4) + '"/>');
    pv.forEach(function (p, i) {
      var h = p / mx * bh, x = bx + 2 + i * bw;
      if (h > 0.6) k.rect(x, by + bh - h, bw - 5, h, { tone: i >= 5 && i <= 7 ? "purple" : "purple", fill: i >= 5 && i <= 7 ? "solid" : "mid", r: 2 });
      k.text(x + (bw - 5) / 2, by + bh + 15, String(i), { size: 11.5, anchor: "middle", color: "muted" });
      var lab = p.toFixed(3).replace(/^0/, "");
      if (i === 5) k.text(x - 3, by + bh - h + 12, lab, { size: 11.5, weight: 800, anchor: "end", tone: "purple" });
      else if (i === 6) k.text(x + bw - 2, by + bh - h + 12, lab, { size: 11.5, weight: 800, tone: "purple" });
      else if (p >= 0.05) k.text(x + (bw - 5) / 2, by + bh - h - 5, lab, { size: 11.5, weight: 700, anchor: "middle", tone: "purple" });
    });
    var ex = bx + 2 + 5.844 * bw + (bw - 5) / 2;
    k.path("M" + ex.toFixed(1) + " " + (by - 6) + " V" + (by + bh), { tone: "red", dash: "4 3", width: 1.6 });
    k.text(ex, by - 10, "기댓값 = Σ i × p(i) = 5.84", { size: 12, weight: 800, anchor: "middle", tone: "red" });
    k.text(bx + 170, by + bh + 32, "구간 번호 i (0 ~ 15, stride 단위)", { size: 11.5, anchor: "middle", color: "muted" });
    k.box(1030, 176, 196, 200, { tone: "purple", fill: "plain", r: 8, align: "left", valign: "top", title: "한 변 (왼쪽 거리 l)", titleColor: "tone", size: 13,
      lines: [{ t: "1) 16개 logit → softmax", size: 12 }, { t: "2) 기댓값 = 5.844칸", size: 12 }, { t: "3) × stride 8 = 46.8px", size: 12, weight: 800, tone: "red" }, { t: "t, r, b도 같은 방식 → 64ch", size: 12 },
        { t: "왜 분포인가?", size: 12, weight: 800, tone: "purple" }, { t: "경계가 흐린 병변은 값 하나보다 '애매함'을 퍼진 분포로 표현", size: 11.5, color: "muted" }] });
    k.text(668, 394, "3×0.003 + 4×0.054 + 5×0.286 + 6×0.437 + 7×0.194 + 8×0.025 + 9×0.001 = 5.844", { size: 11.5, weight: 700, color: "ink" });

    /* ③ Anchor-free 디코딩 */
    k.panel(40, 420, 590, 280, { tone: "gray" });
    k.text(58, 448, "③ Anchor-free 디코딩 — 격자 중심에서 4변까지 거리", { size: 15, weight: 800, color: "ink" });
    var gx = 64, gy = 470, G = 22;
    for (var i = 0; i <= 9; i++) {
      k.raw('<line class="dg-tr" x1="' + (gx + i * G) + '" y1="' + gy + '" x2="' + (gx + i * G) + '" y2="' + (gy + 9 * G) + '"/>');
      k.raw('<line class="dg-tr" x1="' + gx + '" y1="' + (gy + i * G) + '" x2="' + (gx + 9 * G) + '" y2="' + (gy + i * G) + '"/>');
    }
    var ax = gx + 5.5 * G, ay = gy + 4.5 * G, L = 5.844, T = 4.5, Rr = 4.12, Bb = 4.5, s = G * 0.82;
    k.rect(gx + 5 * G, gy + 4 * G, G, G, { tone: "purple", fill: "tone" });
    k.raw('<g class="dg-t-red"><rect class="dg-stroke" x="' + (ax - L * s).toFixed(1) + '" y="' + (ay - T * s).toFixed(1) + '" width="' + ((L + Rr) * s).toFixed(1) + '" height="' + ((T + Bb) * s).toFixed(1) + '" style="stroke-width:2.4"/></g>');
    k.arrow(ax, ay, ax - L * s + 2, ay, { tone: "blue", width: 1.8, headSize: 7 });
    k.arrow(ax, ay, ax + Rr * s - 2, ay, { tone: "blue", width: 1.8, headSize: 7 });
    k.arrow(ax, ay, ax, ay - T * s + 2, { tone: "blue", width: 1.8, headSize: 7 });
    k.arrow(ax, ay, ax, ay + Bb * s - 2, { tone: "blue", width: 1.8, headSize: 7 });
    k.circle(ax, ay, 4.5, { tone: "purple", fill: "solid" });
    k.text(ax - L * s / 2, ay - 6, "l", { size: 14, weight: 800, anchor: "middle", tone: "blue" });
    k.text(ax + Rr * s / 2, ay - 6, "r", { size: 14, weight: 800, anchor: "middle", tone: "blue" });
    k.text(ax + 8, ay - T * s / 2, "t", { size: 14, weight: 800, tone: "blue" });
    k.text(ax + 8, ay + Bb * s / 2 + 4, "b", { size: 14, weight: 800, tone: "blue" });
    k.text(gx, gy + 9 * G + 20, "격자 1칸 = stride (P3는 8px)", { size: 11.5, color: "muted" });
    k.lines(290, 478, [
      { t: "anchor (cx, cy) = (칸 번호 + 0.5) × stride", weight: 800, tone: "purple" },
      { t: "= ((57 + 0.5) × 8, (29 + 0.5) × 8) = (460, 236)" },
      { t: "x1 = cx − l·s = 460 − 5.844 × 8 = 413.2" },
      { t: "y1 = cy − t·s = 236 − 4.50 × 8 = 200.0" },
      { t: "x2 = cx + r·s = 460 + 4.12 × 8 = 493.0" },
      { t: "y2 = cy + b·s = 236 + 4.50 × 8 = 272.0" },
      { t: "→ 중간 결절 정답 (413, 200, 493, 272)", weight: 700, tone: "green" },
      { t: "미리 정한 앵커 박스 크기 · 비율 없음", weight: 800, tone: "red" },
      { t: "위치마다 예측 1개 · 데이터셋별 앵커 튜닝 불필요", color: "muted" }
    ], { size: 12, lh: 23 });

    /* ④ 세 층을 모아 최종 텐서 */
    k.panel(650, 420, 590, 280, { tone: "gray" });
    k.text(668, 448, "④ 세 층 결과를 모아 최종 텐서로 — 그리고 후처리", { size: 15, weight: 800, color: "ink" });
    var S = [["P3 80 × 80", "(64 + 80) × 6,400", "blue"], ["P4 40 × 40", "(64 + 80) × 1,600", "green"], ["P5 20 × 20", "(64 + 80) × 400", "orange"]];
    S.forEach(function (q, i) {
      var b = k.box(668, 466 + i * 52, 160, 42, { tone: q[2], fill: "plain", align: "left", title: q[0], sub: q[1], size: 12.5, subSize: 11.5 });
      k.arrow(830, 487 + i * 52, 864, 538, { tone: "orange", width: 1.4, headSize: 6, via: [[848, 487 + i * 52], [848, 538]] });
    });
    var cc = k.box(866, 512, 160, 52, { tone: "gray", fill: "soft", align: "left", title: "Concat → DFL", sub: "144 × 8,400 → 84 × 8,400", size: 12.5, subSize: 11.5 });
    var ob = k.box(1052, 494, 174, 88, { tone: "orange", thick: true, align: "left", valign: "top", title: "출력 1 × 84 × 8,400", size: 13,
      lines: [{ t: "[0:4] 박스 x, y, w, h", size: 11.5 }, { t: "[4:84] 클래스 확률 80", size: 11.5 }, { t: "(픽셀, 입력 640 기준)", size: 11.5, color: "muted" }] });
    k.link(cc.r, [1050, 538], { tone: "gray", width: 1.5, headSize: 6 });
    k.text(668, 642, "후처리 (시뮬레이터 흉부 X선 모사 기본값)", { size: 12.5, weight: 800, color: "ink" });
    k.flow(668, 652, [{ t: "후보 8,400", tone: "gray" }, { t: "conf ≥ 0.25 → 35", tone: "red" }, { t: "NMS 0.7 → 4", tone: "red" }, { t: "최대 300 → 4", tone: "red" }], { w: 558, h: 32, gap: 14, size: 12 });
    k.text(1226, 642, "병변 3/4 검출 · 미세 석회화(점수 ≈ 0.2) 놓침", { size: 11.5, weight: 700, anchor: "end", tone: "red" });
  }
});

DSDiagram.register({
  id: "yolo-how-it-works-3", sim: "yolo-how-it-works", order: 3,
  title: "YOLOv8n (3) — 학습 루프와 추론 파이프라인", short: "학습 · 추론 흐름",
  sub: "ultralytics 기본값 기준 · yolov8n.pt = COCO로 이미 학습한 가중치 + 학습 설정이 담긴 체크포인트 → 내 데이터로 이어서 학습(전이학습)",
  label: "Object Detection",
  draw: function (k) {
    k.panel(40, 126, 1200, 340, { tone: "blue" });
    k.text(58, 152, "A. 학습 — model.train(data='data.yaml', epochs=100, imgsz=640, batch=16)", { size: 15.5, weight: 800, tone: "blue" });
    var top = [
      ["1. 가중치 로드", "gray", ["yolov8n.pt 불러오기", "Backbone · Neck: COCO 특징", "nc가 다르면 분류 마지막 층만 새로"]],
      ["2. 데이터 + 증강", "green", ["배치 16장 구성", "Mosaic: 4장을 한 장으로", "HSV · 좌우반전 0.5 · 크기 ±50%", "마지막 10 epoch는 Mosaic 끔"]],
      ["3. 순전파", "blue", ["이미지당 8,400개 위치", "위치마다 거리 분포 64 + 점수 nc", "(디코딩 전 값 사용)"]],
      ["4. 라벨 할당 (TAL)", "purple", ["후보: 중심이 GT 박스 안", "t = s^0.5 × IoU^6", "GT마다 t 상위 10개 = 양성", "중간 결절: 후보 114 → 양성 10"]],
      ["5. 손실 계산", "red", ["7.5 × CIoU (박스 겹침)", "1.5 × DFL (거리 분포)", "0.5 × BCE (클래스, 전체 칸)", "음성 위치는 분류 목표 0"]]
    ];
    var bw = 222, gap = 14, x0 = 56, y1 = 170, h1 = 132;
    top.forEach(function (b, i) {
      var x = x0 + i * (bw + gap);
      k.box(x, y1, bw, h1, { tone: b[1], fill: b[1] === "gray" ? "soft" : "tone", r: 8, align: "left", valign: "top", title: b[0], size: 13.5, lines: b[2].map(function (t) { return { t: t, size: 11.5 }; }) });
      if (i) k.arrow(x - gap + 2, y1 + 40, x - 2, y1 + 40, { tone: "gray", width: 1.6, headSize: 6.5 });
    });
    var bot = [
      ["8. 저장 · 조기종료", "orange", ["runs/detect/train/weights/", "last.pt 매 epoch 저장", "best.pt fitness 최고 시점", "patience 100: 개선 없으면 중단"]],
      ["7. 검증 (epoch 끝)", "orange", ["EMA 가중치로 val 세트 평가", "conf 0.001로 넓게 뽑음", "P · R · mAP50 · mAP50-95"]],
      ["6. 역전파 · 갱신", "blue", ["optimizer = 'auto'", "반복 < 10,000 → AdamW", "그 외 SGD (lr0 0.01)", "momentum 0.937 · wd 5e-4"]]
    ];
    var y2 = 322, h2 = 112;
    bot.forEach(function (b, i) {
      var x = x0 + (i + 2) * (bw + gap);
      k.box(x, y2, bw, h2, { tone: b[1], fill: "tone", r: 8, align: "left", valign: "top", title: b[0], size: 13.5, lines: b[2].map(function (t) { return { t: t, size: 11.5 }; }) });
      if (i < 2) k.arrow(x + bw + gap - 2, y2 + 40, x + bw + 2, y2 + 40, { tone: "gray", width: 1.6, headSize: 6.5 });
    });
    k.arrow(x0 + 4 * (bw + gap) + bw / 2, y1 + h1 + 1, x0 + 4 * (bw + gap) + bw / 2, y2 - 2, { tone: "gray", width: 1.6, headSize: 6.5 });
    var x8 = x0 + 2 * (bw + gap);
    k.arrow(x8 - 2, y2 + 80, x0 + (bw + gap) + bw / 2, y1 + h1 + 2, { tone: "blue", width: 1.8, headSize: 7, via: [[x0 + (bw + gap) + bw / 2, y2 + 80]] });
    k.text(x8 - 10, y2 + 72, "다음 epoch (배치 단위로는 2 → 6 반복)", { size: 11.5, weight: 700, anchor: "end", tone: "blue" });
    k.box(x0, y2, bw, h2 - 8, { tone: "blue", fill: "ghost", r: 8, align: "left", valign: "top", title: "epoch 반복 (기본 100회)", titleColor: "tone", size: 13,
      lines: [{ t: "처음 3 epoch warmup", size: 11.5 }, { t: "이후 선형 감소 → lr0 × 0.01", size: 11.5 }, { t: "EMA: 가중치 이동평균 유지", size: 11.5 }] });

    /* 숫자 예 */
    k.panel(40, 476, 590, 96, { tone: "purple", tinted: true });
    k.text(56, 500, "TAL 정렬 지표 — 점수는 너그럽게, 위치는 엄격하게", { size: 13.5, weight: 800, tone: "purple" });
    k.text(56, 522, "s = 0.80, IoU = 0.80 → t = 0.80^0.5 × 0.80^6 = 0.894 × 0.262 = 0.234", { size: 12.5, color: "ink" });
    k.text(56, 542, "IoU^6 : 0.9 → 0.531 · 0.8 → 0.262 · 0.7 → 0.118 · 0.5 → 0.016", { size: 12, color: "muted" });
    k.text(56, 562, "점수를 절반으로 줄이면 ×0.707, IoU를 1 → 0.5로 줄이면 ×0.016", { size: 12, color: "muted" });
    k.panel(650, 476, 590, 96, { tone: "red", tinted: true });
    k.text(666, 500, "손실 = 7.5·CIoU + 1.5·DFL + 0.5·BCE (시뮬레이터 기본 입력)", { size: 13.5, weight: 800, tone: "red" });
    k.text(666, 522, "= 7.5 × 0.160 + 1.5 × 0.800 + 0.5 × 1.400", { size: 12.5, color: "ink" });
    k.text(666, 542, "= 1.200 + 1.200 + 0.700 = 3.100 (× 배치 크기)", { size: 12.5, weight: 700, color: "ink" });
    k.text(666, 562, "CIoU · DFL은 양성 위치만, BCE는 8,400칸 전부에서 계산", { size: 12, color: "muted" });

    /* B. 추론 */
    k.text(40, 600, "B. 추론 — model.predict('img.png', conf=0.25, iou=0.7) · 이 과정은 학습 중 검증 단계에서도 그대로 쓰임", { size: 15, weight: 800, tone: "orange" });
    k.flow(40, 612, [
      { t: "원본 이미지", s: "예: 512 × 400", tone: "gray" },
      { t: "Letterbox", s: "긴 변 640 + 회색 여백", tone: "green" },
      { t: "정규화", s: "BGR→RGB, /255", tone: "green" },
      { t: "순전파", s: "1 × 84 × 8,400", tone: "blue" },
      { t: "신뢰도 필터", s: "최고 클래스 ≥ 0.25", tone: "red" },
      { t: "NMS", s: "IoU ≥ 0.7 제거 · 클래스별", tone: "red" },
      { t: "좌표 복원", s: "여백 빼고 원본 크기로", tone: "orange" }
    ], { w: 1200, h: 46, gap: 16, size: 12.5 });
    k.lines(40, 682, [{ t: "conf를 낮추면 놓침(FN) ↓ · 오탐(FP) ↑ — 의료 선별은 낮게 두는 편 · iou(NMS)를 낮추면 붙어 있는 병변이 합쳐질 위험 · imgsz는 학습과 추론을 같게, 작은 병변이면 1024 등으로", color: "muted" }], { size: 12 });
  }
});
