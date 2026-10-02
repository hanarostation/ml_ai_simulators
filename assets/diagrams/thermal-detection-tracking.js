/* [Case Study] 열화상 영상 객체 탐지 멀티 모달 — 알고리즘 구성도
   강의 필기자료 양식: 객체 탐지 IoU·TP/FP(29~30쪽), YOLOv8n 구조·헤드·실행(34~36쪽)
   숫자는 시뮬레이터 화면과 실습 노트북 출력 기준 (HIT-UAV 드론 열화상) */
(function () {
  var SIM = "thermal-detection-tracking";

  /* ---------------------------------------------------------------- 1. 전체 흐름 */
  DSDiagram.register({
    id: SIM + "-1", sim: SIM, order: 1,
    title: "열화상 탐지·추적 (1) — 영상·시간축·기하·문장을 잇는 흐름", short: "전체 파이프라인",
    sub: "드론 열화상(HIT-UAV) 한 장에서 사람을 찾고(탐지) · 같은 사람을 따라가고(추적) · 픽셀을 미터로 바꿔(GSD) · SALUTE 보고문까지",
    label: "Multi-Modal",
    draw: function (k) {
      k.section(40, 152, "① 네 가지 정보원이 한 흐름으로 — 영상 · 시간축 · 기하 · 문장", { tone: "teal" });
      k.panel(40, 166, 1200, 304, { tone: "gray", tinted: true });
      var X = [130, 352, 574, 796, 1018], BW = 196, BH = 58, Y = [186, 290, 394];
      var lanes = [["영상", "teal"], ["시간축", "green"], ["기하·문장", "pink"]];
      lanes.forEach(function (l, i) { k.text(58, Y[i] + BH / 2 + 5, l[0], { size: 14, weight: 800, tone: l[1] }); });
      function B(c, r, tone, t, s) { return k.box(X[c], Y[r], BW, BH, { tone: tone, title: t, sub: s, size: 15, subSize: 12 }); }
      var fr = B(0, 0, "teal", "열화상 프레임", "1×512×640 uint8 · AGC 적용");
      var det = B(1, 0, "teal", "검출기", "열점+CNN 또는 YOLOv8n");
      var bx = B(2, 0, "teal", "검출 박스 k×6", "사람 → 추적 · 차량 수 → E");
      var srt = B(3, 0, "green", "SORT 추적기", "칼만 예측 + 헝가리안 할당");
      var trj = B(4, 0, "green", "궤적 (MOT 형식)", "(frame, id, x, y, w, h)");
      var vid = B(0, 1, "green", "영상 = 시간축 텐서", "T×512×640 · 7.5 fps");
      var sh = B(1, 1, "green", "전역 이동 추정", "위상 상관 → (dx, dy)");
      var cmc = B(3, 1, "green", "누적 이동 · CMC", "예측 위치 += (dx, dy)");
      var wld = B(4, 1, "pink", "지면 좌표 궤적", "wx = cx − Σdx, wy = cy − Σdy");
      var meta = B(0, 2, "pink", "드론 메타데이터", "60m-30_1 → 고도 60m · 30°");
      var gsd = B(1, 2, "pink", "GSD (m/px)", "고도·각도·화각 → 0.155");
      var spd = B(2, 2, "pink", "속도 · 상태", "m/s → 정지 / 보행 / 고속");
      var rep = B(3, 2, "blue", "SALUTE 보고문", "측정값만 채운 8줄 템플릿");
      var hum = B(4, 2, "red", "사람 검토 · 판단", "경보 = 확인 우선순위");
      [[fr, det], [det, bx], [bx, srt], [srt, trj], [meta, gsd], [gsd, spd], [spd, rep], [rep, hum]].forEach(function (p) {
        k.link(p[0].r, p[1].l, { tone: "gray" });
      });
      k.link(vid.t, fr.b, { tone: "green", label: "프레임", labelDx: 30, labelDy: 6 });
      k.link(sh.r, cmc.l, { tone: "green", label: "프레임 쌍마다 이동량" });
      k.link(vid.r, sh.l, { tone: "green" });
      k.link(cmc.t, srt.b, { tone: "green", label: "CMC", labelDx: 24, labelDy: 6 });
      k.link(cmc.r, wld.l, { tone: "pink" });
      k.link(trj.b, wld.t, { tone: "green", label: "궤적", labelDx: 22, labelDy: 6 });
      k.arrow(wld.cx, wld.y + BH, spd.cx, spd.y, { tone: "pink", via: [[wld.cx, 371], [spd.cx, 371]] });
      k.text(X[3] + 4, 366, "지면 궤적 × GSD", { size: 12.5, weight: 700, tone: "pink" });

      k.section(40, 506, "② 검출 방법 비교 — 실습 노트북 (test 200장, AP@0.5)", { tone: "teal" });
      k.table(48, 520, [196, 96, 96, 96, 128], [
        ["방법", "Person", "Car", "Bicycle", "mAP (3클래스)"],
        ["열점만 (학습 없음)", "0.047", "0.000", "0.000", "0.016"],
        ["열점 + 패치 CNN", "0.246", "0.018", "0.003", "0.089"],
        ["YOLOv8n COCO 그대로", "0.033", "0.193", "0.000", "0.075"],
        [{ t: "YOLOv8n 미세조정", tone: "green" }, { t: "0.776", tone: "green", weight: 800 }, { t: "0.877", tone: "green", weight: 800 }, { t: "0.610", tone: "green", weight: 800 }, { t: "0.754", tone: "green", weight: 800 }]
      ], { rh: 27, size: 13 });
      k.text(48, 680, "같은 구조라도 **데이터(시점·크기·파장)**가 성능을 결정한다", { size: 12.5, color: "muted" });

      k.section(668, 506, "③ 이 사례의 함정", { tone: "red" });
      k.note(668, 522, 280, 80, { tone: "red", title: "8bit 값 = 온도가 아닌 상대 순위", body: "AGC가 장면마다 스케일을 바꿈 → 장면 통계 기반 적응 임계값" });
      k.note(960, 522, 280, 80, { tone: "amber", title: "열 교차 · 소형 객체", body: "주간 열 대비 52.0 (야간 88.0) · 120–130m에서 사람 높이 13–15px" });
      k.note(668, 612, 280, 80, { tone: "green", title: "추적은 검출을 넘지 못한다", body: "day_lowcontrast MOTA 0.196 · 드론 흔들림은 CMC로 IDF1 0.199 → 0.766" });
      k.note(960, 612, 280, 80, { tone: "blue", title: "보고문은 측정값만 · 판단은 사람", body: "소속(U)·무장(E)은 '식별 불가' · 정지 경보는 확인 우선순위일 뿐" });
    }
  });

  /* ---------------------------------------------------------------- 2. 탐지 */
  DSDiagram.register({
    id: SIM + "-2", sim: SIM, order: 2,
    title: "열화상 탐지·추적 (2) — 2단계 검출기와 YOLOv8n", short: "탐지: 열점·CNN·YOLO",
    sub: "① 형태학 연산으로 후보를 만들고 ② 32×32 패치 CNN으로 거르는 2단계 vs ③ 한 번에 박스+클래스를 내는 YOLOv8n · ④ 소형 객체의 IoU",
    label: "Object Detection",
    draw: function (k) {
      k.section(40, 150, "① 열점 후보 생성 — 학습 없이 '주변보다 뜨겁고 작은' 덩어리", { tone: "teal" });
      k.flow(40, 166, [
        { t: "원본", s: "512×640 uint8", tone: "teal" },
        { t: "열림 (opening)", s: "15×15 타원 = 배경 추정", tone: "teal" },
        { t: "white top-hat", s: "원본 − 열림", tone: "teal" },
        { t: "적응 임계값", s: "max(20, μ + 4σ)", tone: "teal" },
        { t: "연결요소 → 후보", s: "후보 박스 n × 6", tone: "teal" }
      ], { w: 820, h: 52, gap: 20, size: 13.5 });
      k.box(876, 162, 364, 60, { tone: "gray", fill: "soft", align: "left", title: "야간 장면: top-hat μ 8.5, σ 15.3 → thr 69.6", sub: "후보 117개 vs 정답 사람 30명 → 오탐이 많다", size: 13.5, subSize: 12.5, titleColor: "ink" });
      k.text(40, 246, "후보 재현율(IoU ≥ 0.3) **야간 0.818 · 주간 0.388** · 이미지당 후보 77.1개 → 야간은 '거르기'가, 주간은 '찾기'가 문제 (후보가 놓친 사람은 2단계가 영영 못 찾음)", { size: 13, color: "ink" });

      k.section(40, 284, "② 2단계 — 32×32 패치 CNN 검증기 (파라미터 93,860)", { tone: "teal" });
      var cw = 108, gx = 14, y2 = 300, chain = [
        ["패치 입력", "32×32×1"], ["Conv 32 블록", "16×16×32"], ["Conv 64 블록", "8×8×64"],
        ["Conv 128 블록", "4×4×128"], ["GAP·Dropout", "128"], ["Dense", "softmax 4"]
      ];
      chain.forEach(function (c, i) {
        var x = 40 + i * (cw + gx);
        k.box(x, y2, cw, 54, { tone: i === 5 ? "gray" : "teal", fill: i === 0 ? "plain" : "tone", title: c[0], sub: c[1], size: 13, subSize: 12, r: 8 });
        if (i < chain.length - 1) k.arrow(x + cw + 2, y2 + 27, x + cw + gx - 2, y2 + 27, { tone: "gray", width: 1.6, headSize: 7 });
      });
      k.table(40, 368, [150, 230, 120, 90], [
        ["층", "가중치 계산", "가중치", "BN"],
        ["Conv 32", "3 · 3 · 1 · 32", "288", "128"],
        ["Conv 64", "3 · 3 · 32 · 64", "18,432", "256"],
        ["Conv 128", "3 · 3 · 64 · 128", "73,728", "512"],
        ["Dense", "128 · 4 + 4", "516", "—"],
        [{ t: "합계", tone: "teal" }, "92,964 + 896", { t: "93,860", weight: 800, tone: "teal" }, ""]
      ], { rh: 23, size: 12.5 });
      k.text(40, 528, "블록 = 3×3 합성곱(편향 없음) + BN + ReLU + 최대풀링 · 클래스 = 배경 / Person / Car / Bicycle", { size: 12, color: "muted" });
      k.text(40, 546, "검증 정확도 0.9012 · 사람 행: 사람 0.739, 배경 0.220 → Person AP@0.5  0.047 → 0.246", { size: 12, color: "muted" });

      var px = 780, pw = 460;
      k.panel(px, 274, pw, 282, { tone: "orange", head: "solid", title: "③ YOLOv8n — 한 번에 박스 + 클래스", right: "imgsz 640" });
      var rows = [
        ["Backbone", "P3 64×80×80 · P4 128×40×40 · P5 256×20×20", "teal"],
        ["Neck", "FPN(깊은 → 얕은) + PAN(얕은 → 깊은) · Concat", "teal"],
        ["Detect ×3", "칸마다 박스 64 (4변 × 16구간 DFL) + 클래스 5", "orange"],
        ["디코딩", "80² + 40² + 20² = 8,400칸 → 1 × 9 × 8,400", "orange"],
        ["후처리", "conf ≥ 0.25 → 클래스별 NMS (IoU 0.7)", "red"]
      ];
      rows.forEach(function (r, i) {
        var yy = 318 + i * 42;
        k.box(px + 14, yy, 104, 34, { tone: r[2], title: r[0], size: 13, r: 7 });
        k.text(px + 128, yy + 22, r[1], { size: 12.5, color: "ink" });
        if (i < rows.length - 1) k.arrow(px + 66, yy + 35, px + 66, yy + 41, { tone: "gray", width: 1.4, headSize: 6 });
      });
      k.text(px + 14, 544, "COCO 그대로 Person 0.033 → HIT-UAV 미세조정 **0.776**", { size: 12.5, tone: "orange" });

      k.section(40, 584, "④ 소형 객체의 IoU — 1~2px 차이로 TP가 FP가 된다", { tone: "red" });
      k.text(588, 584, "(사람 박스 10×20 px · 그림은 4배 확대)", { size: 12.5, color: "muted" });
      function iouPic(x0, dx, dy, iou, inter, uni, ok) {
        var s = 4, gx0 = x0, gy0 = 602;
        k.rect(gx0 + dx * s, gy0 + dy * s, (10 - dx) * s, (20 - dy) * s, { tone: ok ? "green" : "red", fill: "tone" });
        k.rect(gx0, gy0, 40, 80, { tone: "gray", fill: "none" });
        k.path("M" + (gx0 + dx * s) + " " + (gy0 + dy * s) + " h40 v80 h-40 Z", { tone: ok ? "green" : "red", dash: "5 3", width: 2 });
        k.lines(gx0 + 70, 618, [
          { t: "예측이 (" + dx + ", " + dy + ") px 어긋남", weight: 800, color: "ink" },
          "교집합 " + (10 - dx) + " × " + (20 - dy) + " = " + inter,
          "합집합 200 + 200 − " + inter + " = " + uni,
          { t: "IoU = " + inter + " / " + uni + " = " + iou + (ok ? "  → TP" : "  → FP (기준 0.5)"), weight: 800, tone: ok ? "green" : "red" }
        ], { size: 12.5, lh: 19 });
      };
      iouPic(48, 2, 1, "0.613", 152, 248, true);
      iouPic(390, 3, 2, "0.460", 126, 274, false);
      k.formula(780, 600, 460, 92, "AP = Σ (Δ재현율 × 정밀도 포락선)\n점수순 정렬 → 정답과 IoU ≥ 기준이면 TP (정답당 1번)\n→ 소형 객체는 IoU 0.3 기준도 함께 본다", { size: 13 });
    }
  });

  /* ---------------------------------------------------------------- 3. SORT 추적 */
  DSDiagram.register({
    id: SIM + "-3", sim: SIM, order: 3,
    title: "열화상 탐지·추적 (3) — SORT: 칼만 예측과 헝가리안 할당", short: "추적: 칼만·헝가리안",
    sub: "검출 기반 추적(tracking-by-detection) — 매 프레임 검출 → 기존 궤적과 1:1 짝짓기 → 궤적 갱신 · 평가는 MOTA · IDF1",
    label: "Object Detection",
    draw: function (k) {
      k.section(40, 150, "① 한 프레임의 SORT 루프", { tone: "green" });
      var y = 222, h = 56;
      var trk = k.box(40, y, 150, h, { tone: "green", fill: "plain", title: "궤적 목록", sub: "n개 · 상태 6차원", size: 14.5 });
      var prd = k.box(222, y, 160, h, { tone: "green", title: "① 칼만 예측", sub: "n×4 (+ CMC dx, dy)", size: 14.5 });
      var D = k.box(414, 158, 160, 44, { tone: "teal", title: "검출 D (프레임 t)", sub: "m×4", size: 13.5, subSize: 11.5 });
      var cst = k.box(414, y, 160, h, { tone: "pink", title: "② 비용 행렬", sub: "n×m · 1 − IoU", size: 14.5 });
      var hun = k.box(606, y, 160, h, { tone: "pink", title: "③ 헝가리안", sub: "비용 합 최소 1:1", size: 14.5 });
      var up = k.box(806, 166, 186, 42, { tone: "green", title: "④ 칼만 갱신", sub: "짝지어진 궤적 · miss = 0", size: 13.5, subSize: 11.5 });
      var nw = k.box(806, 229, 186, 42, { tone: "green", title: "⑤ 새 궤적", sub: "짝 없는 검출 → 새 id", size: 13.5, subSize: 11.5 });
      var dl = k.box(806, 286, 186, 42, { tone: "red", title: "⑥ 삭제", sub: "miss > max_age (5)", size: 13.5, subSize: 11.5 });
      var out = k.box(1034, y, 206, h, { tone: "gray", fill: "plain", title: "출력 (확정 궤적)", sub: "miss = 0 · hits ≥ min_hits (2)", size: 14.5 });
      k.link(trk.r, prd.l, { tone: "green" }); k.link(prd.r, cst.l, { tone: "green", label: "P" });
      k.link(D.b, cst.t, { tone: "teal" }); k.link(cst.r, hun.l, { tone: "pink" });
      k.arrow(hun.x + hun.w, hun.cy - 10, up.x, up.cy, { tone: "pink", label: "짝", labelDy: -2 });
      k.link(hun.r, nw.l, { tone: "pink" });
      k.arrow(up.x + up.w, up.cy, out.x, out.cy - 12, { tone: "green" });
      k.link(nw.r, out.l, { tone: "green" });
      k.arrow(out.cx, out.y + h, trk.cx, trk.y + h, { tone: "gray", dash: true, via: [[out.cx, 356], [trk.cx, 356]] });
      k.text(640, 345, "다음 프레임 t+1 — 7.5 fps면 0.133초 뒤, 같은 궤적 목록으로 반복", { size: 12.5, weight: 700, anchor: "middle", color: "muted" });

      k.section(40, 390, "② 칼만 필터 — 예측과 관측의 가중 평균", { tone: "green" });
      var F = [[1, 0, 0, 0, 1, 0], [0, 1, 0, 0, 0, 1], [0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 0, 0], [0, 0, 0, 0, 1, 0], [0, 0, 0, 0, 0, 1]];
      var nm = ["cx", "cy", "w", "h", "vx", "vy"];
      k.matrix(84, 444, F, { cw: 25, ch: 19, size: 12, rows: nm, cols: nm, title: "전이 F (등속)", titleTone: "green",
        tones: function (i, j, v) { return v ? (j >= 4 && i < 2 ? "orange" : "green") : null; } });
      k.lines(262, 440, [
        { t: "상태 x = [cx, cy, w, h, vx, vy] · 관측 z = [cx, cy, w, h]", weight: 800, color: "ink" },
        { t: "예측  x ← F·x (+ dx, dy)    P ← F·P·Fᵀ + Q", tone: "green", weight: 700 },
        { t: "갱신  K = P·Hᵀ (H·P·Hᵀ + R)⁻¹    x ← x + K (z − H·x)", tone: "green", weight: 700 },
        "Q = diag(.5, .5, .1, .1, .3, .3) — 사람은 방향을 바꾼다",
        "R = diag(2, 2, 4, 4) — 검출 박스의 흔들림",
        "R이 크면 예측을, Q가 크면 관측을 더 믿는다"
      ], { size: 12.5, lh: 20 });
      k.note(262, 556, 364, 30, { tone: "green", title: "평균 중심 오차: 관측 2.30px → 칼만 1.65px", size: 12.5 });
      k.text(84, 578, "주황 = 위치 += 속도 (1프레임)", { size: 11.5, color: "muted" });

      k.section(660, 390, "③ 헝가리안 할당 — 전체 비용이 최소인 1:1 짝", { tone: "pink" });
      var M1 = [[0.9, 0.2, 0.8], [0.1, 0.3, 0.9], [0.8, 0.9, 0.4]], M2 = [[0.1, 0.2, 0.9], [0.2, 0.9, 0.9], [0.9, 0.9, 0.3]];
      var dets = ["검출0", "검출1", "검출2"], trs = ["궤적0", "궤적1", "궤적2"];
      var hp = { "0,1": 1, "1,0": 1, "2,2": 1 }, gp = { "0,0": 1, "1,1": 1, "2,2": 1 };
      k.matrix(720, 440, M1, { cw: 50, ch: 28, size: 13, rows: trs, cols: dets, title: "실습 노트북 예 (1 − IoU)", titleTone: "pink",
        tones: function (i, j) { return hp[i + "," + j] ? "pink" : null; }, fills: function (i, j) { return hp[i + "," + j] ? "mid" : "plain"; } });
      k.matrix(1010, 440, M2, { cw: 50, ch: 28, size: 13, rows: trs, cols: dets, title: "탐욕이 실패하는 예", titleTone: "pink",
        tones: function (i, j) { return hp[i + "," + j] ? "pink" : null; }, fills: function (i, j) { return hp[i + "," + j] ? "mid" : "plain"; },
        hl: [{ r: 0, c: 0, tone: "gray" }, { r: 1, c: 1, tone: "gray" }, { r: 2, c: 2, tone: "gray" }] });
      k.lines(672, 548, [{ t: "짝 (0,1)(1,0)(2,2) = 0.2 + 0.1 + 0.4 = **0.7**", tone: "pink" }, { t: "탐욕(행마다 최소)도 같은 답", color: "muted" }], { size: 12.5, lh: 18 });
      k.lines(952, 548, [{ t: "헝가리안 0.2 + 0.2 + 0.3 = **0.7**", tone: "pink" }, { t: "탐욕(회색) 0.1 + 0.9 + 0.3 = 1.3", color: "muted" }], { size: 12.5, lh: 18 });

      k.section(40, 616, "④ 추적 지표 — 반합성 시퀀스 (실습 노트북)", { tone: "gray" });
      k.table(40, 626, [210, 150, 160, 150], [
        ["시퀀스", "IoU 매칭", "IoU + CMC", "중심거리"],
        ["night_crowd_occlusion", "0.795 · 0.848 · 7", "0.792 · 0.837 · 10", "0.798 · 0.847 · 6"],
        [{ t: "night_drone_shake", tone: "red" }, { t: "0.621 · 0.199 · 71", tone: "red", weight: 800 }, { t: "0.753 · 0.766 · 10", tone: "green", weight: 800 }, "0.758 · 0.797 · 8"]
      ], { rh: 24, size: 12.5 });
      k.text(720, 646, "칸 = MOTA · IDF1 · IDSW", { size: 12.5, weight: 800, color: "ink" });
      k.lines(720, 668, [
        "MOTA = 1 − (FN + FP + IDSW) / GT  · 검출 품질 위주",
        "IDF1 = 2·IDTP / (GT + 예측)  · '끝까지 같은 사람인가'"
      ], { size: 12.5, lh: 18 });
    }
  });

  /* ---------------------------------------------------------------- 4. GSD · 보고 */
  DSDiagram.register({
    id: SIM + "-4", sim: SIM, order: 4,
    title: "열화상 탐지·추적 (4) — 궤적 → 미터 → 상황 보고문", short: "GSD·속도·SALUTE",
    sub: "고도·카메라 각도·화각으로 픽셀을 미터로 바꾸고(GSD), 궤적 속도로 상태를 나눈 뒤, 측정값만으로 SALUTE 보고문을 채운다",
    label: "Multi-Modal",
    draw: function (k) {
      k.section(40, 152, "① 픽셀 → 미터: 지상 표본 거리 (GSD)", { tone: "pink", sub: "영상 이름 60m-30_1 = 고도 60m, 각도 30°" });
      /* 기하 그림 */
      var dx = 96, dy = 204, gy = 380, gxp = dx + 180 * Math.sqrt(3);
      k.path("M48 " + gy + " H452", { tone: "gray", width: 2 });
      k.path("M" + dx + " " + dy + " V" + gy, { tone: "gray", dash: "5 4", width: 1.6 });
      k.path("M" + dx + " " + dy + " L" + gxp.toFixed(1) + " " + gy, { tone: "pink", width: 2.6 });
      k.rect(dx - 18, dy - 12, 36, 12, { tone: "ink", fill: "solid", r: 3 });
      k.path("M" + (dx - 26) + " " + (dy - 14) + " h52", { tone: "ink", width: 2 });
      k.text(dx - 10, 296, "H = 60 m", { size: 13, weight: 800, anchor: "end", color: "ink" });
      k.text(220, 272, "D = H / sin θ = 120 m", { size: 13, weight: 800, tone: "pink" });
      k.path("M" + (gxp - 46).toFixed(1) + " " + gy + " A46 46 0 0 1 " + (gxp - 46 * Math.cos(Math.PI / 6)).toFixed(1) + " " + (gy - 23).toFixed(1), { tone: "pink", width: 1.6 });
      k.text(gxp - 70, gy - 6, "θ = 30°", { size: 12.5, weight: 800, anchor: "end", tone: "pink" });
      var ex = gxp, ey = gy, ux = Math.cos(Math.PI / 3), uy = Math.sin(Math.PI / 3);
      k.path("M" + (ex - 34 * ux).toFixed(1) + " " + (ey - 34 * uy).toFixed(1) + " L" + (ex + 30 * ux).toFixed(1) + " " + (ey + 30 * uy).toFixed(1), { tone: "teal", width: 3 });
      k.text(ex - 14, 318, "화면 폭 방향", { size: 12, weight: 700, anchor: "middle", tone: "teal" });
      k.text(48, 404, "카메라 각도 θ: 90° = 수직 촬영 · 화각(FOV) 45°는 가정값", { size: 12, color: "muted" });

      k.formula(470, 168, 380, 134, "D = 60 / sin 30° = **120 m**\n지면 폭 = 2 · D · tan(45°/2) = **99.4 m**\nGSD = 99.4 / 640 = **0.155 m/px**", { size: 15, align: "left" });
      k.text(470, 326, "비스듬히 볼수록 D가 길어져 한 픽셀이 더 넓은 땅을 덮는다", { size: 12.5, color: "ink" });
      k.text(470, 346, "원근(화면 위아래 GSD 차이)은 무시한 1차 근사", { size: 12.5, color: "muted" });

      k.table(872, 166, [220, 148], [
        ["이 영상 (60m · 30°)", "값"],
        ["GSD", "0.155 m/px"],
        ["키 1.7m", "10.9 px"],
        ["어깨너비 0.5m", "3.2 px"],
        ["1 m/s", "0.86 px/프레임"],
        ["수직 60m · 키 1.7m", "21.9 px"],
        ["수직 130m · 키 1.7m", "10.1 px"]
      ], { rh: 27, size: 13 });
      k.text(872, 372, "COCO '작은 객체'(32×32 px 미만)에 사람 대부분이 속함", { size: 12, color: "muted" });

      k.section(40, 446, "② 궤적 → 속도 → 상태", { tone: "pink" });
      k.formula(40, 462, 580, 56, "v = ‖p(t+k) − p(t)‖ / (Δf / fps) × GSD ,   k = int(2초 × 7.5) = 15", { size: 13.5 });
      k.lines(40, 542, [
        { t: "예) 지면 좌표로 15프레임(2초) 동안 12 px 이동", weight: 800, color: "ink" },
        { t: "v = 12 px / 2 s × 0.155 m/px = **0.93 m/s** → 보행", tone: "pink" }
      ], { size: 13, lh: 21 });
      k.table(40, 590, [150, 200, 230], [
        ["상태", "중앙 속도 기준", "쓰임"],
        [{ t: "정지", tone: "red" }, "< 0.3 m/s", "5초 이상이면 정지 경보"],
        [{ t: "보행 · 달리기", tone: "green" }, "< 4.5 m/s", "이동 궤적 수 · 중앙 속도"],
        [{ t: "고속 (차량 등)", tone: "pink" }, "≥ 4.5 m/s", "사람 궤적과 분리"]
      ], { rh: 26, size: 12.5 });

      k.section(660, 446, "③ SALUTE 관측 보고서 — 규칙 기반 템플릿", { tone: "blue" });
      k.code(660, 460, 580, 172, [
        "[관측 보고] 출처: 60m-30_1 / 드론 열화상 (고도 60m, 경사 30°)",
        "S(규모)  : 동시 관측 최대 {n}명 / 2초 이상 궤적 {m}개",
        "A(활동)  : 이동 궤적 {a}개 (중앙 속도 {v} m/s), 정지 {b}개",
        "L(위치)  : 궤적 집중 구역 {구역}({인원}) # 화면 4×4 격자",
        "U(소속)  : 식별 불가   # 열화상만으로 판별 불가",
        "T(시간)  : 영상 시작 후 0–{T}초 구간",
        "E(장비)  : 차량 약 {c}대 식별 (무장·장비 식별 불가)",
        "※ 정지 5초 이상 인원 {k}명 → 확인 요망"
      ], { size: 12 });
      k.flow(660, 646, [
        { t: "측정값 표", tone: "pink" }, { t: "템플릿 채우기", tone: "blue" },
        { t: "LLM은 문장만", tone: "blue", fill: "soft" }, { t: "사람 확인", tone: "red" }
      ], { w: 580, h: 34, gap: 18, size: 12.5 });
    }
  });
})();
