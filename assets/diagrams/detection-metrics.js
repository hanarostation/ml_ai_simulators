/* 객체 탐지 평가 지표 — 알고리즘 구성도 (강의 필기자료 '객체 탐지 (1)~(3)' 양식) */
(function () {
  /* 요추 MRI 모양 썸네일: 어두운 바탕 + 척추뼈 5개 */
  function spine(k, x, y, s) {
    var h = '<g class="dg-t-ink"><rect class="dg-shape dg-shape--solid" x="' + x + '" y="' + y + '" width="' + s + '" height="' + s + '" rx="6"/></g><g class="dg-t-gray">';
    var vh = s * 0.13, g = s * 0.055;
    for (var i = 0; i < 5; i++) {
      var vy = y + s * 0.1 + i * (vh + g), vx = x + s * (0.3 + 0.03 * Math.sin(i));
      h += '<rect class="dg-shape" x="' + vx.toFixed(1) + '" y="' + vy.toFixed(1) + '" width="' + (s * 0.34).toFixed(1) + '" height="' + vh.toFixed(1) + '" rx="3"/>';
    }
    h += '<rect class="dg-shape dg-shape--f" x="' + (x + s * 0.68) + '" y="' + (y + s * 0.06) + '" width="' + (s * 0.05) + '" height="' + (s * 0.88) + '" rx="2"/></g>';
    k.raw(h);
  }
  function rectS(k, x, y, w, h, tone, dash, width) {
    k.raw('<g class="dg-t-' + tone + '"><rect class="dg-stroke" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" style="stroke-width:' + (width || 2.2) + (dash ? ';stroke-dasharray:5 4' : '') + '"/></g>');
  }

  DSDiagram.register({
    id: "detection-metrics-1", sim: "detection-metrics", order: 1,
    title: "객체 탐지 (1) — 개요 · Bounding Box · IoU", short: "개요 · 박스 · IoU",
    sub: "판독 소견은 「이상 있음」이 아니라 「L4-L5 우측 추간공에 3등급 협착」 — 위치와 정도를 함께 기술한다 · 요추 MRI 모사 영상 기준",
    label: "Object Detection",
    draw: function (k) {
      /* ① 분류 · 검출 · 분할 */
      k.section(40, 152, "① 같은 영상, 다른 출력 — 분류 · 검출 · 분할");
      k.panel(40, 166, 1200, 112, { tone: "blue", tinted: true });
      [["분류 (Classification)", "영상 1장 → 클래스 1개", "1 (이상)", "blue"], ["검출 (Detection)", "박스 + 클래스 + 신뢰도", "병변 0.91 + 좌표 4개", "red"], ["분할 (Segmentation)", "픽셀마다 클래스", "마스크 이미지", "purple"]].forEach(function (c, i) {
        var x = 52 + i * 254;
        spine(k, x, 176, 92);
        if (i === 1) { rectS(k, x + 26, 214, 40, 22, "red"); rectS(k, x + 30, 250, 34, 18, "red"); }
        if (i === 2) k.raw('<g class="dg-t-purple"><ellipse class="dg-shape dg-shape--solid" cx="' + (x + 46) + '" cy="225" rx="16" ry="9"/><ellipse class="dg-shape dg-shape--solid" cx="' + (x + 47) + '" cy="259" rx="13" ry="7"/></g>');
        k.text(x + 102, 196, c[0], { size: 13, weight: 800, tone: c[3] });
        k.text(x + 102, 216, c[1], { size: 11.5, color: "muted" });
        k.chip(x + 102, 232, c[2], { tone: c[3], size: 11.5, h: 24 });
      });
      k.box(826, 176, 400, 92, { tone: "red", fill: "plain", r: 8, align: "left", valign: "top", title: "검출이 분류보다 어려운 세 가지 이유", titleColor: "tone", size: 13.5,
        lines: [{ t: "① 정답 개수가 영상마다 다름 (박스 1개 ~ 5개)", size: 12 },
          { t: "② 위치(회귀)와 종류(분류)를 동시에 맞혀야 함", size: 12 },
          { t: "③ 배경이 압도적 — 병변 박스는 면적의 1% 미만", size: 12 }] });

      /* ② Bounding Box 표기 */
      k.section(40, 306, "② Bounding Box 표현법 — 같은 박스, 네 가지 표기", { tone: "teal" });
      k.panel(40, 320, 1200, 138, { tone: "teal", tinted: true });
      /* 작은 좌표 그림 */
      k.rect(60, 332, 104, 104, { tone: "ink", fill: "solid", r: 4 });
      rectS(k, 60 + 16 * 0.8125, 332 + 26 * 0.8125, 48 * 0.8125, 48 * 0.8125, "green", false, 2.4);
      k.circle(60 + 16 * 0.8125, 332 + 26 * 0.8125, 3.5, { tone: "blue", fill: "solid" });
      k.circle(60 + 64 * 0.8125, 332 + 74 * 0.8125, 3.5, { tone: "blue", fill: "solid" });
      k.circle(60 + 40 * 0.8125, 332 + 50 * 0.8125, 3, { tone: "green", fill: "solid" });
      k.text(176, 352, "(16, 26) 왼쪽 위", { size: 11.5, weight: 700, tone: "blue" });
      k.text(176, 372, "(64, 74) 오른쪽 아래", { size: 11.5, weight: 700, tone: "blue" });
      k.text(176, 392, "(40, 50) 중심", { size: 11.5, weight: 700, tone: "green" });
      k.text(176, 412, "w = h = 48", { size: 11.5, color: "muted" });
      k.text(176, 432, "영상 128 × 128 · 원점 = 왼쪽 위", { size: 11.5, color: "muted" });
      k.table(356, 330, [150, 210, 230, 70, 210], [
        ["표기", "형태", "이 박스의 값", "범위", "사용처"],
        ["코너 좌표", "(xmin, ymin, xmax, ymax)", "(16, 26, 64, 74)", "픽셀", "Pascal VOC · torchvision"],
        ["중심 + 크기", "(cx, cy, w, h)", "(40, 50, 48, 48)", "픽셀", "모델 내부 연산"],
        ["정규화 중심 + 크기", "(cx/W, cy/H, w/W, h/H)", "(0.313, 0.391, 0.375, 0.375)", "0 ~ 1", "YOLO · DETR"],
        ["좌상단 + 크기", "(xmin, ymin, w, h)", "(16, 26, 48, 48)", "픽셀", "COCO"]
      ], { rh: 20, size: 12 });
      k.text(366, 448, "정규화(0~1)를 쓰면 이미지 크기가 달라도 같은 라벨을 쓸 수 있고, 640 × 640 등으로 resize해도 다시 계산할 필요가 없다", { size: 12, weight: 700, tone: "teal" });

      /* ③ IoU */
      k.section(40, 486, "③ IoU (Intersection over Union) — 예측 박스와 정답 박스가 얼마나 겹치는가", { tone: "purple" });
      k.panel(40, 498, 1200, 204, { tone: "purple", tinted: true });
      var U = 22, ox = 74, oy = 526;
      for (var gx = 0; gx <= 8; gx++) {
        k.raw('<line class="dg-tr" x1="' + (ox + gx * U) + '" y1="' + oy + '" x2="' + (ox + gx * U) + '" y2="' + (oy + 7 * U) + '"/>');
        k.text(ox + gx * U, oy - 6, String(gx), { size: 11.5, anchor: "middle", color: "muted" });
      }
      for (var gy = 0; gy <= 7; gy++) {
        k.raw('<line class="dg-tr" x1="' + ox + '" y1="' + (oy + gy * U) + '" x2="' + (ox + 8 * U) + '" y2="' + (oy + gy * U) + '"/>');
        k.text(ox - 8, oy + gy * U + 4, String(gy), { size: 11.5, anchor: "end", color: "muted" });
      }
      k.rect(ox + U, oy + U, 4 * U, 3 * U, { tone: "blue", fill: "tone" });
      k.rect(ox + 3 * U, oy + 2 * U, 4 * U, 4 * U, { tone: "orange", fill: "tone", opacity: 0.85 });
      k.rect(ox + 3 * U, oy + 2 * U, 2 * U, 2 * U, { tone: "green", fill: "mid" });
      rectS(k, ox + U, oy + U, 4 * U, 3 * U, "blue", false, 2.2);
      rectS(k, ox + 3 * U, oy + 2 * U, 4 * U, 4 * U, "orange", true, 2.2);
      k.text(ox + U + 4, oy + U + 15, "box1", { size: 12, weight: 800, tone: "blue" });
      k.text(ox + 7 * U - 4, oy + 6 * U - 6, "box2", { size: 12, weight: 800, anchor: "end", tone: "orange" });
      k.text(ox + 4 * U, oy + 3 * U + 4, "4", { size: 13, weight: 800, anchor: "middle", tone: "green" });
            k.code(290, 508, 300, 146, [
        "# box1 (1,1,5,4)  box2 (3,2,7,6)",
        "inter x: max(1,3)=3 ~ min(5,7)=5",
        "inter y: max(1,2)=2 ~ min(4,6)=4",
        "inter = (5-3) x (4-2) = 4",
        "area1 = 4x3 = 12, area2 = 4x4 = 16",
        "union = 12 + 16 - 4 = 24",
        "IoU = 4 / 24 = 0.167"
      ], { size: 12 });
      k.formula(290, 664, 300, 28, "IoU = 교집합 넓이 / 합집합 넓이", { size: 13.5, tone: "purple" });

      /* 강의 4케이스 (정답 (16,26,64,74)) */
      var cases = [[0.17, [36, 50, 84, 98], "FP", "FP"], [0.41, [32, 32, 80, 80], "FP", "FP"], [0.70, [20, 30, 68, 80], "TP", "FP"], [0.85, [18, 28, 66, 76], "TP", "TP"]];
      var sc = 1.02, gtB = [16, 26, 64, 74];
      cases.forEach(function (c, i) {
        var x = 614 + i * 128, y = 508, m = function (v, o) { return o + (v - 10) * sc; };
        k.rect(x, y, 112, 104, { tone: "gray", fill: "tone", r: 6 });
        k.rect(m(gtB[0], x), m(gtB[1], y), (gtB[2] - gtB[0]) * sc, (gtB[3] - gtB[1]) * sc, { tone: "green", fill: "tone", opacity: 0.9 });
        rectS(k, m(gtB[0], x), m(gtB[1], y), (gtB[2] - gtB[0]) * sc, (gtB[3] - gtB[1]) * sc, "green", false, 2);
        var p = c[1];
        rectS(k, m(p[0], x), m(p[1], y), (Math.min(p[2], 119) - p[0]) * sc, (Math.min(p[3], 111) - p[1]) * sc, "red", true, 2);
        k.text(x + 56, y + 120, "IoU = " + c[0].toFixed(2), { size: 13, weight: 800, anchor: "middle", color: "ink" });
        k.chip(x + 2, y + 128, "0.50 기준 " + c[2], { tone: c[2] === "TP" ? "green" : "red", size: 11.5, h: 22, w: 108 });
        k.chip(x + 2, y + 153, "0.75 기준 " + c[3], { tone: c[3] === "TP" ? "green" : "red", size: 11.5, h: 22, w: 108 });
      });
      k.text(614, 696, "초록 = 정답(GT) · 빨간 점선 = 예측 · 같은 10px 어긋남도 200×200은 0.90(TP), 20×20은 0.33(FP)", { size: 11.5, color: "muted" });
    }
  });

  DSDiagram.register({
    id: "detection-metrics-2", sim: "detection-metrics", order: 2,
    title: "객체 탐지 (2) — TP · FP · FN 판정과 NMS", short: "TP·FP·FN · NMS",
    sub: "「얼마나 겹쳤는가」로 맞고 틀림을 정하고, 겹쳐 나온 중복 박스는 NMS로 정리한다 · 시뮬레이터 2·3번 탭의 기본 장면",
    label: "Object Detection",
    draw: function (k) {
      /* ① 판정 규칙 */
      k.section(40, 152, "① 판정 규칙 — 신뢰도 높은 예측부터, 가장 많이 겹치는 정답과 짝짓기", { sub: "IoU 기준 0.50 · 신뢰도 기준 0.25" });
      k.panel(40, 166, 1200, 248, { tone: "blue", tinted: true });
      spine(k, 56, 180, 150);
      rectS(k, 98, 214, 40, 30, "green", false, 2.6);
      rectS(k, 112, 276, 34, 26, "green", false, 2.6);
      rectS(k, 100, 216, 38, 32, "teal", false, 2);
      rectS(k, 92, 208, 40, 28, "red", true, 2);
      rectS(k, 124, 268, 34, 30, "red", true, 2);
      k.text(56, 348, "초록 실선 = 정답 GT1 · GT2", { size: 11.5, weight: 700, tone: "green" });
      k.text(56, 366, "청록 = TP · 빨간 점선 = FP", { size: 11.5, weight: 700, tone: "red" });
      k.text(56, 384, "GT2 = 짝 없음 → FN", { size: 11.5, weight: 700, tone: "orange" });
      k.table(232, 180, [48, 56, 64, 112, 46, 360], [
        ["순서", "예측", "신뢰도", "가장 큰 IoU", "판정", "이유"],
        ["1", "P1", "0.91", "0.74 (GT1)", { t: "TP", tone: "green", weight: 800 }, "IoU ≥ 0.50이고 GT1이 아직 짝 없음 → TP"],
        ["2", "P2", "0.78", "0.58 (GT1)", { t: "FP", tone: "red", weight: 800 }, "IoU는 충분하지만 GT1은 이미 P1과 짝 → 중복 FP"],
        ["3", "P3", "0.55", "0.35 (GT2)", { t: "FP", tone: "red", weight: 800 }, "가장 큰 IoU 0.35 < 0.50 → 위치 부정확 FP"],
        ["–", "GT2", "–", "–", { t: "FN", tone: "orange", weight: 800 }, "어떤 예측과도 짝이 안 된 정답 → 놓침"]
      ], { rh: 26, size: 12.5 });
      [["TP", "IoU 기준 이상 + 클래스 일치 + 첫 짝", "green"], ["FP", "IoU 미달 · 클래스 불일치 · 중복", "red"], ["FN", "어떤 예측과도 짝이 없는 정답", "orange"]].forEach(function (r, i) {
        k.box(232 + i * 236, 318, 226, 56, { tone: r[2], fill: "plain", r: 8, align: "left", title: r[0], sub: r[1], size: 14, subSize: 12 });
      });
      k.panel(950, 180, 274, 196, { tone: "purple", head: "soft", title: "이 장면의 점수" });
      k.lines(966, 240, [
        { t: "TP 1 · FP 2 · FN 1", weight: 800, color: "ink" },
        { t: "Precision = 1 / (1 + 2) = **0.33**" },
        { t: "Recall = 1 / (1 + 1) = **0.50**" },
        { t: "F1 = 2PR / (P + R) = **0.40**" },
        { t: "정답 1개에는 예측 1개만 TP", tone: "purple", weight: 700 },
        { t: "같은 물체에 박스 3개 → TP 1 + FP 2", color: "muted", size: 11.5 }
      ], { size: 12.5, lh: 22 });

      /* ② NMS */
      k.section(40, 444, "② NMS (Non-Maximum Suppression) — 겹쳐 나온 중복 박스를 정리하는 후처리", { tone: "red" });
      k.panel(40, 458, 1200, 242, { tone: "red", tinted: true });
      k.box(56, 472, 330, 214, { tone: "red", fill: "plain", r: 8, align: "left", valign: "top", title: "NMS 판정 순서", titleColor: "tone", size: 13.5,
        lines: [
          { t: "1. 신뢰도 < 0.25 박스는 먼저 버림", size: 12.5 },
          { t: "2. 남은 박스를 신뢰도 내림차순 정렬", size: 12.5 },
          { t: "3. 가장 높은 박스를 최종 결과로 채택", size: 12.5 },
          { t: "4. 채택 박스와 IoU ≥ 0.45 인 박스 제거", size: 12.5 },
          { t: "5. 남은 박스가 없을 때까지 3 ~ 4 반복", size: 12.5 },
          { t: "6. 클래스별로 따로 수행", size: 12.5 },
          { t: "신뢰도 0.25 : 이 박스를 믿을까?", size: 12.5, weight: 700, tone: "blue" },
          { t: "NMS IoU 0.45 : 두 박스가 같은 물체?", size: 12.5, weight: 700, tone: "purple" }
        ] });
      var B = [["A", "척추뼈", 0.93, "채택", ""], ["F", "척추뼈", 0.89, "채택", ""], ["B", "척추뼈", 0.82, "억제", "A와 0.71"], ["J", "병변", 0.77, "채택", ""], ["G", "척추뼈", 0.71, "억제", "F와 0.69"], ["M", "병변", 0.68, "채택", ""], ["C", "척추뼈", 0.64, "억제", "A와 0.61"],
        ["K", "병변", 0.52, "억제", "J와 0.67"], ["N", "병변", 0.44, "억제", "M과 0.62"], ["I", "척추뼈", 0.36, "채택", "L4 중복"], ["D", "척추뼈", 0.31, "억제", "A와 0.54"], ["H", "척추뼈", 0.22, "저신뢰", "< 0.25"], ["L", "병변", 0.19, "저신뢰", "< 0.25"], ["E", "척추뼈", 0.14, "저신뢰", "< 0.25"]];
      k.text(404, 486, "시뮬레이터 장면: 척추뼈 L3 · L4 + 붙어 있는 병변 2개, 예측 14개 (신뢰도 순)", { size: 12.5, weight: 700, color: "ink" });
      B.forEach(function (b, i) {
        var col = i % 7, row = Math.floor(i / 7), x = 404 + col * 118, y = 498 + row * 72;
        var tn = b[3] === "채택" ? "green" : b[3] === "억제" ? "gray" : "red";
        k.box(x, y, 110, 62, { tone: tn, fill: b[3] === "채택" ? "mid" : b[3] === "억제" ? "soft" : "plain", dash: b[3] === "저신뢰", title: b[0] + " · " + b[2].toFixed(2), sub: b[1] + " · " + b[3], size: 13.5, subSize: 11.5,
          lines: b[4] ? [{ t: b[4], size: 11.5, color: "muted" }] : [] });
      });
      k.formula(404, 646, 822, 40, "원본 14 → 저신뢰 제거 3 → 억제 6 → **최종 5개 (A, F, J, M, I)** · I는 L4와 겹침이 0.45 미만이라 살아남은 중복 → FP", { size: 13, weight: 600 });
    }
  });

  DSDiagram.register({
    id: "detection-metrics-3", sim: "detection-metrics", order: 3,
    title: "객체 탐지 (3) — AP · mAP · FROC", short: "AP · mAP · FROC",
    sub: "「빠짐없이 찾으면서, 확신이 높은 예측일수록 실제로 맞는가」를 하나의 수치로 · 모사 데이터셋 8장, 병변 정답 13개, 병변 예측 35개",
    label: "Object Detection",
    draw: function (k) {
      /* ① AP */
      k.section(40, 152, "① AP — 정밀도 · 재현율 곡선 아래 면적 (병변 클래스, IoU 0.50)");
      k.panel(40, 166, 1200, 278, { tone: "purple", tinted: true });
      var steps = [["예측을 신뢰도 순으로 정렬", "전체 영상의 예측을 한 줄로"], ["각 예측을 TP / FP 로 판정", "IoU 기준 + 중복 규칙"], ["누적 TP · FP로 P · R 계산", "P = TP/(TP+FP) · R = TP/13"], ["포락선 아래 면적 = AP", "클래스 평균 → mAP"]];
      steps.forEach(function (s, i) {
        var y = 182 + i * 64;
        k.circle(70, y + 24, 14, { tone: "purple", fill: "solid", label: String(i + 1), size: 13 });
        k.box(92, y, 196, 50, { tone: "purple", fill: "plain", r: 8, align: "left", title: s[0], sub: s[1], size: 12.5, subSize: 11.5 });
        if (i < 3) k.arrow(70, y + 40, 70, y + 62, { tone: "purple", width: 1.5, headSize: 6 });
      });
      var R = [[1, 0.965, "TP", 1, 0, "1.000", "0.077"], [2, 0.938, "TP", 2, 0, "1.000", "0.154"], [3, 0.911, "TP", 3, 0, "1.000", "0.231"], [4, 0.884, "FP 중복", 3, 1, "0.750", "0.231"], [5, 0.857, "TP", 4, 1, "0.800", "0.308"], [6, 0.830, "TP", 5, 1, "0.833", "0.385"], [7, 0.803, "FP 오탐", 5, 2, "0.714", "0.385"], [8, 0.776, "TP", 6, 2, "0.750", "0.462"], [9, 0.749, "FP IoU 부족", 6, 3, "0.667", "0.462"], [10, 0.722, "FP 오탐", 6, 4, "0.600", "0.462"], [11, 0.695, "TP", 7, 4, "0.636", "0.538"]];
      var rows = [["순위", "신뢰도", "판정", "누적 TP", "누적 FP", "Precision", "Recall"]].concat(R.map(function (r) {
        return [String(r[0]), r[1].toFixed(3), { t: r[2], tone: r[2] === "TP" ? "green" : "red", weight: 700 }, String(r[3]), String(r[4]), r[5], r[6]];
      }));
      k.table(306, 178, [44, 64, 104, 62, 62, 76, 62], rows, { rh: 20.5, size: 12, firstBold: false });
      k.text(310, 436, "… 35행까지 계속 (최종 누적 TP 12 · FP 23 → Recall 0.923)", { size: 11.5, color: "muted" });
      /* PR 곡선 */
      var cx = 822, cy = 196, cw = 380, ch = 196;
      var Pv = [1, 1, 1, 0.8333, 0.8333, 0.75, 0.6364, 0.5714, 0.5, 0.4545, 0.3929, 0.375];
      var d = "M" + cx + " " + (cy + ch), r0 = 0;
      Pv.forEach(function (p, i) { var x1 = cx + (i / 13) * cw, x2 = cx + ((i + 1) / 13) * cw, y = cy + ch - p * ch; d += " L" + x1.toFixed(1) + " " + y.toFixed(1) + " L" + x2.toFixed(1) + " " + y.toFixed(1); });
      d += " L" + (cx + 12 / 13 * cw).toFixed(1) + " " + (cy + ch) + " Z";
      k.path(d, { tone: "purple", fill: "tone" });
      k.axes(cx, cy, cw, ch, { x: "Recall (재현율)", y: "Precision" });
      [0, 0.5, 1].forEach(function (v) { k.text(cx - 6, cy + ch - v * ch + 4, v.toFixed(1), { size: 11.5, anchor: "end", color: "muted" }); });
      k.text(cx + 150, cy + 118, "AP = 0.642", { size: 18, weight: 800, anchor: "middle", tone: "purple" });
      k.text(cx + 150, cy + 140, "보간 포락선 아래 면적", { size: 11.5, anchor: "middle", color: "muted" });
      k.formula(cx - 20, 412, 418, 26, "AP = Σ Δr × p_interp = (1/13) × (1 + 1 + 1 + 0.833 + … + 0.375)", { size: 12, weight: 600 });

      /* ② mAP */
      k.section(40, 474, "② mAP — 클래스 평균, IoU 기준 평균", { tone: "blue" });
      k.table(40, 488, [120, 90, 90, 110], [
        ["클래스", "AP50", "AP75", "AP50-95"],
        ["척추뼈", "0.899", "0.504", "0.522"],
        ["병변", "0.642", "0.343", "0.350"],
        [{ t: "평균 = mAP", tone: "blue", weight: 800 }, { t: "0.771", weight: 800 }, { t: "0.423", weight: 800 }, { t: "0.436", weight: 800 }]
      ], { rh: 26, size: 12.5 });
      k.lines(40, 616, [
        { t: "mAP50 = (0.899 + 0.642) / 2 = 0.771", weight: 700, color: "ink" },
        { t: "AP50-95 = IoU 0.50 · 0.55 · … · 0.95 (10개) 기준 AP의 평균", color: "muted" },
        { t: "기준이 엄격할수록(0.75) 병변 AP가 크게 떨어짐 → 위치 정확도 문제", color: "muted" }
      ], { size: 12, lh: 20 });

      /* ③ FROC */
      k.section(480, 474, "③ 의료 검출의 특수성 — mAP 대신 FROC", { tone: "teal" });
      var fx = 520, fy = 498, fw = 340, fh = 150;
      var F = [[1 / 8, 0.38], [1 / 4, 0.46], [1 / 2, 0.54], [1, 0.62], [2, 0.77], [4, 0.92], [8, 0.92]];
      var X = function (v) { return fx + (Math.log2(v) + 3) / 6 * fw; }, Y = function (s) { return fy + fh - s * fh; };
      var dd = "M" + X(1 / 8) + " " + Y(0.38);
      F.forEach(function (p) { dd += " L" + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); });
      k.axes(fx, fy, fw, fh, { y: "민감도" });
      k.path("M" + fx + " " + Y(0.77) + " H" + X(2), { tone: "red", dash: "5 4", width: 1.5 });
      k.path("M" + X(2) + " " + Y(0.77) + " V" + (fy + fh), { tone: "red", dash: "5 4", width: 1.5 });
      k.path(dd, { tone: "teal", width: 2.6 });
      F.forEach(function (p, i) {
        k.circle(X(p[0]), Y(p[1]), 3.5, { tone: "teal", fill: "solid" });
        k.text(X(p[0]), fy + fh + 16, ["1/8", "1/4", "1/2", "1", "2", "4", "8"][i], { size: 11.5, anchor: "middle", color: "muted" });
        k.text(X(p[0]), Y(p[1]) - 8, Math.round(p[1] * 100) + "%", { size: 11.5, weight: 700, anchor: "middle", tone: i === 4 ? "red" : "teal" });
      });
      k.text(fx + fw, fy + fh + 34, "영상 1장당 오탐(FP) 수 (로그 눈금)", { size: 11.5, anchor: "end", color: "muted" });
      k.box(880, 494, 360, 192, { tone: "teal", fill: "plain", r: 8, align: "left", valign: "top", title: "같은 예측, 다른 문장", titleColor: "tone", size: 13.5,
        lines: [
          { t: "FROC: 영상 1장당 오탐을 2개까지 감수하면", size: 12, weight: 700 },
          { t: "병변 13개 중 10개(77%)를 찾는다 (신뢰도 ≥ 0.398)", size: 12, weight: 700, tone: "teal" },
          { t: "FP/영상 = 누적 FP 12 / 영상 8장 = 1.5 ≤ 2", size: 11.5, color: "muted" },
          { t: "mAP: 병변 AP50 = 0.64 — 모형 비교용 한 숫자", size: 12, weight: 700 },
          { t: "'한 장에 오탐 몇 개를 봐야 하나'는 바로 읽히지 않음", size: 11.5, color: "muted" },
          { t: "→ 판독 현장에서는 FROC 문장이 바로 쓰인다", size: 12, weight: 700, tone: "red" }
        ] });
    }
  });
})();
