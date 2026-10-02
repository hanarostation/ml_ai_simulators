/* [Case Study] TCCC 술기 도구 객체 탐지 및 판별 — 알고리즘 구성도
   강의 필기자료 양식: 파운데이션 모델과 자기지도학습(92쪽), SAM(93쪽), 사전학습 모형으로 이미지 판별(94쪽), 확산 모형(95쪽)
   숫자는 시뮬레이터 화면과 실습 노트북 출력 기준 (TCCC_Object_640 · sam-vit-base · owlvit-base-patch32 · SmolVLM-500M) */
(function () {
  var SIM = "tccc-tool-detection";

  /* ---------------------------------------------------------------- 1. 사례 흐름 */
  DSDiagram.register({
    id: SIM + "-1", sim: SIM, order: 1,
    title: "TCCC 도구 탐지 (1) — 박스를 마스크·이름으로 넓히기", short: "사례 파이프라인",
    sub: "박스만 있고 이름 없는 class_0~15 · SAM(어디) + VLM(무엇) + 생성(데이터 보강) — 사람은 걸러진 것만 검수",
    label: "Foundation Model",
    draw: function (k) {
      k.section(40, 152, "① 출발점 — 박스만 있는 데이터", { tone: "teal" });
      var st = [["15,881장", "12,705 + 3,176"], ["640×360", "JPEG 축소본"], ["45,072", "박스"], ["16 클래스", "이름 없음"]];
      st.forEach(function (s, i) {
        k.box(40 + i * 142, 166, 134, 54, { tone: i === 3 ? "red" : "teal", fill: "soft", title: s[0], sub: s[1], size: 15, subSize: 11.5, titleColor: "tone" });
      });
      k.text(40, 246, "라벨 비용 — 16,000장 기준 (1장당 물체 5개)", { size: 13.5, weight: 800, color: "ink" });
      var cost = [["분류", "2~5초", "10~20시간", 20], ["박스", "30초~1분", "130~260시간", 260], ["픽셀 마스크", "5~15분", "1,300~4,000시간", 4000]];
      cost.forEach(function (c, i) {
        var y = 262 + i * 34, w = Math.max(6, c[3] / 4000 * 330);
        k.text(40, y + 16, c[0], { size: 13, weight: 800, color: "ink" });
        k.text(130, y + 16, c[1], { size: 12, color: "muted" });
        k.rect(214, y + 4, w, 18, { tone: "red", fill: i === 2 ? "solid" : "mid", r: 3 });
        k.text(i === 2 ? 214 + w - 8 : 222 + w, y + 18, c[2], { size: 12.5, weight: 800, anchor: i === 2 ? "end" : "start", color: i === 2 ? "on" : null, tone: i === 2 ? null : "red" });
      });
      k.text(40, 380, "마스크는 사람이 만들 수 없는 규모 → 사전학습 모형(SAM)으로 대신", { size: 12.5, weight: 700, tone: "red" });

      k.panel(640, 136, 600, 258, { tone: "red", head: "soft", title: "② 박스를 채운 의사 마스크의 문제", right: "실습 노트북" });
      k.table(656, 180, [190, 50, 110], [
        ["U-Net 평가 시나리오", "n", "Dice 평균"],
        ["P01", "6", "0.0000"], ["P02", "14", "0.0392"], ["P04", "9", "0.0000"],
        [{ t: "P05 (학습한 시나리오)", tone: "green" }, "11", { t: "0.4541", tone: "green", weight: 800 }]
      ], { rh: 23, size: 12.5 });
      k.lines(1016, 192, [
        { t: "전체 평균 Dice", weight: 800, color: "ink" },
        "(14×0.0392 + 11×0.4541)",
        "÷ 40 = 5.5439 ÷ 40",
        { t: "= **0.1386**", tone: "red" }
      ], { size: 12.5, lh: 19 });
      k.lines(656, 316, [
        { t: "① 학습하지 않은 촬영분에서 무너짐 (클립 종속성) — 데이터를 늘리면 해결", color: "ink" },
        { t: "② 정답 자체가 부풀려짐: SAM 마스크는 박스 면적의 29.5%", color: "ink" },
        { t: "→ 박스채움은 전경을 1 / 0.295 = **3.39배** 과대 추정 (Otsu 어림 31.9%)", tone: "red" }
      ], { size: 12.5, lh: 21 });

      k.section(40, 428, "③ 자동 라벨링 · 판별 · 생성 — 세 갈래", { tone: "green" });
      k.flow(40, 444, [
        { t: "박스 + 클래스", s: "사람 · YOLO", tone: "teal" },
        { t: "SAM 박스 프롬프트", s: "박스마다 픽셀 마스크", tone: "orange" },
        { t: "규칙 필터", s: "fill_ratio ∉ [0.10, 0.75] 제거", tone: "gray" },
        { t: "사람 검수", s: "걸러진 것만", tone: "red" },
        { t: "경량 모형 학습", s: "U-Net 등 현장 배치", tone: "green" }
      ], { label: "어디 (마스크)", labelW: 120, w: 1200, h: 48, gap: 20, size: 13.5 });
      k.flow(40, 506, [
        { t: "이미지 + 질의 8개", s: "a photo of {}", tone: "blue" },
        { t: "OWL-ViT", s: "개방형 어휘 · 임계값 0.08", tone: "purple" },
        { t: "정답 박스와 매칭", s: "IoU ≥ 0.3 · 20장 38개", tone: "gray" },
        { t: "이름 후보 표", s: "텍스트 × class id", tone: "purple" },
        { t: "사람이 crop 확인", s: "names 확정은 사람", tone: "red" }
      ], { label: "무엇 (이름)", labelW: 120, w: 1200, h: 48, gap: 20, size: 13.5 });
      k.flow(40, 568, [
        { t: "SAM 마스크", s: "물체 윤곽", tone: "orange" },
        { t: "지우기 · 붙여 넣기", s: "inpaint · copy-paste", tone: "pink" },
        { t: "분류기로 재확인", s: "같은 클래스로 보이나", tone: "gray" },
        { t: "학습 데이터에만", s: "희소 클래스 7 · 15 보강", tone: "green" },
        { t: "검증에는 금지", s: "성능이 부풀려짐", tone: "red" }
      ], { label: "늘리기 (생성)", labelW: 120, w: 1200, h: 48, gap: 20, size: 13.5 });

      k.formula(40, 636, 1200, 56, "40장 109.9초 → 장당 2.75초 · 전체 15,881장 × 2.75초 = **12.1시간 (CPU)** · GPU 약 15배 → **0.8시간**  vs  사람 장당 5분 → **1,323시간**", { size: 14 });
    }
  });

  /* ---------------------------------------------------------------- 2. SAM */
  DSDiagram.register({
    id: SIM + "-2", sim: SIM, order: 2,
    title: "TCCC 도구 탐지 (2) — SAM: 프롬프트 기반 분할", short: "SAM 구조·승격",
    sub: "'무엇'이 아니라 '가리킨 곳의 경계'를 배운 모델 · SA-1B 1,100만 장 / 11억 마스크 · 실습 노트북 sam-vit-base (93.7M)",
    label: "Foundation Model",
    draw: function (k) {
      k.panel(40, 132, 1200, 272, { tone: "gray", tinted: true, title: "① 구조 — 무거운 인코더는 한 번, 가벼운 디코더는 프롬프트마다" });
      var img = k.box(60, 192, 130, 78, { tone: "ink", fill: "plain", title: "입력 영상", sub: "640×360 RGB", size: 14.5 });
      var enc = k.box(222, 180, 220, 102, { tone: "blue", fill: "solid", title: "Image Encoder", lines: ["ViT-B · MAE로 사전학습", { t: "89.7M (전체의 95.7%)", weight: 800 }], size: 18, subSize: 13 });
      k.chip(332, 290, "영상당 1회만 실행", { tone: "blue", solid: true, anchor: "middle", size: 12.5 });
      k.rect(486, 186, 76, 62, { tone: "blue", fill: "tone", r: 6 }); k.rect(478, 194, 76, 62, { tone: "blue", fill: "tone", r: 6 }); k.rect(470, 202, 76, 62, { tone: "blue", fill: "tone", r: 6 });
      k.text(516, 286, "영상 임베딩", { size: 12.5, weight: 800, anchor: "middle", color: "ink" });
      var dec = k.box(612, 180, 200, 102, { tone: "orange", fill: "solid", title: "Mask Decoder", lines: [{ t: "4.1M (4.3%)", weight: 800 }, "영상 임베딩 + 프롬프트 → 마스크"], size: 18, subSize: 12.5 });
      k.chip(712, 290, "프롬프트마다 즉시 실행", { tone: "orange", solid: true, anchor: "middle", size: 12.5 });
      k.link(img.r, enc.l, { tone: "ink", width: 2.4 });
      k.arrow(444, 231, 466, 231, { tone: "ink", width: 2.4 });
      k.arrow(568, 225, 610, 225, { tone: "blue", width: 2.2 });
      var px = 60;
      [["점 +", "green"], ["점 −", "red"], ["박스", "purple"], ["대략 마스크", "gray"]].forEach(function (p) { px += k.chip(px, 340, p[0], { tone: p[1], size: 12.5 }) + 8; });
      var pe = k.box(366, 330, 176, 46, { tone: "purple", title: "Prompt Encoder", sub: "매우 가벼움", size: 14, subSize: 11.5 });
      k.arrow(px + 2, 353, 364, 353, { tone: "ink", width: 2 });
      k.arrow(542, 353, 640, 284, { tone: "purple", width: 2.2, curve: -18 });
      k.text(60, 392, "프롬프트 = 어디를 분할할지 가리키는 신호 (텍스트 프롬프트는 공개 가중치에 없음 → VLM이 대신)", { size: 12, color: "muted" });
      k.arrow(814, 231, 846, 231, { tone: "ink", width: 2.4 });
      k.text(856, 172, "출력: 후보 마스크 + 자체 점수 (iou_scores)", { size: 13, weight: 800, color: "ink" });
      [["부분", "0.566", 30], ["도구 전체", "0.942", 52], ["손까지", "0.796", 70]].forEach(function (c, i) {
        var x = 856 + i * 126;
        k.box(x, 184, 116, 84, { tone: "gray", fill: "plain", r: 8 });
        k.rect(x + 58 - c[2] / 2, 226 - c[2] * 0.32, c[2], c[2] * 0.64, { tone: "orange", fill: "mid", r: 8 });
        k.text(x + 58, 290, c[0], { size: 13, weight: 800, anchor: "middle", color: "ink" });
        k.text(x + 58, 308, "점수 " + c[1], { size: 12.5, anchor: "middle", tone: i === 1 ? "red" : "gray", weight: i === 1 ? 800 : 400 });
      });
      k.lines(856, 334, [
        { t: "점 1개 → 무엇을 원했는지 모호 → 후보 3개 (3, 360, 640)", weight: 700, color: "ink" },
        { t: "박스 4개 → 모호성 거의 없음 → 마스크 4개 (4, 360, 640)", weight: 700, color: "ink" },
        { t: "점수 0.942 · 0.948 · 0.879 · 0.940 · 점 1개 2.89초 (CPU)", color: "muted" }
      ], { size: 12, lh: 19 });

      k.panel(40, 420, 470, 276, { tone: "green", head: "soft", title: "② 박스 라벨 → 마스크 라벨로 승격" });
      k.rect(60, 472, 82, 66, { tone: "purple", fill: "none" }); k.path("M70 528 L96 482 L132 494 L118 530 Z", { tone: "gray", fill: "mid" });
      k.text(101, 556, "박스 = 무엇", { size: 12, weight: 800, anchor: "middle", tone: "purple" });
      k.text(162, 512, "+", { size: 22, weight: 800, anchor: "middle", color: "ink" });
      k.box(182, 472, 82, 66, { tone: "orange", fill: "tone", title: "SAM", size: 17 });
      k.text(223, 556, "SAM = 어디", { size: 12, weight: 800, anchor: "middle", tone: "orange" });
      k.text(284, 512, "=", { size: 22, weight: 800, anchor: "middle", color: "ink" });
      k.rect(304, 472, 82, 66, { tone: "green", fill: "none" }); k.path("M314 528 L340 482 L376 494 L362 530 Z", { tone: "green", fill: "solid" });
      k.text(345, 556, "픽셀 마스크", { size: 12, weight: 800, anchor: "middle", tone: "green" });
      k.lines(56, 584, [
        { t: "SAM 마스크 = 박스 면적의 29.5% (fill_ratio, 40장 126박스)", weight: 800, color: "ink" },
        { t: "Dice(박스채움, 마스크) = 2r / (1 + r) = 0.59 / 1.295 = **0.456**", tone: "green" },
        { t: "박스별 Dice 평균은 0.420 (오목 함수: 평균의 함수 ≥ 함수의 평균)", color: "muted" },
        { t: "점수 평균 0.875는 자기 평가일 뿐, 검증이 아니다", weight: 800, tone: "red" }
      ], { size: 12.5, lh: 22 });

      k.panel(524, 420, 340, 276, { tone: "red", head: "soft", title: "③ 의료 영상에 그대로 쓰면 실패" });
      k.bullets(544, 478, 310, [
        { t: "연조직 경계 — 밝기 차이로 드러나지 않음", tone: "red" },
        { t: "병변 — 덩어리가 아닌 미세한 신호 차이", tone: "red" },
        { t: "3D 볼륨 — SAM은 2D 한 장씩 봄", tone: "red" },
        { t: "창(window) 설정 — 같은 장기도 밝기가 달라짐", tone: "red" }
      ], { size: 12.5, lh: 22 });
      k.lines(544, 592, [{ t: "실습 노트북 관찰 (흉부 X-ray)", weight: 800, color: "ink" }, "후보 하나가 화면의 90% 이상 — 배경과 인체 경계만", "세 후보의 크기 차이가 극단적"], { size: 12, lh: 19 });
      k.text(544, 670, "점수는 높은데 결과는 몸 전체 윤곽 → 쓸모없음", { size: 12, weight: 800, tone: "red" });

      k.panel(878, 420, 362, 276, { tone: "purple", head: "soft", title: "④ SAM 계열 모델" });
      [["MedSAM", "의료 영상 마스크로 미세조정 · 박스 프롬프트 중심"], ["SAM-Med2D/3D", "의료 특화 프롬프트 · 3D 볼륨 지원"], ["SAM 2", "비디오: 프레임 간 마스크 전파 (연속 프레임에 유리)"], ["MedSAM2", "3D 볼륨을 비디오처럼 처리"]].forEach(function (m, i) {
        k.box(894, 468 + i * 56, 330, 48, { tone: "purple", fill: "soft", align: "left", title: m[0], sub: m[1], size: 13.5, subSize: 11.5, r: 7, titleColor: "tone" });
      });
    }
  });

  /* ---------------------------------------------------------------- 3. VLM · VQA · 생성 */
  DSDiagram.register({
    id: SIM + "-3", sim: SIM, order: 3,
    title: "TCCC 도구 탐지 (3) — VLM 판별 · 질의응답 · 생성 데이터", short: "VLM·VQA·생성",
    sub: "무엇인가(어휘 판별) · 말로 묻기(VQA) · 데이터 늘리기(지우기 · 붙여 넣기 · 확산) — 모두 '후보'를 만들 뿐, 확정은 사람",
    label: "Foundation Model",
    draw: function (k) {
      var P = [40, 446, 852], PW = 388;
      k.panel(P[0], 132, PW, 564, { tone: "teal", head: "soft", title: "① 무엇인가: 닫힌 어휘 vs 개방형 어휘" });
      k.text(P[0] + 16, 192, "닫힌 어휘 — 목록 안에서 반드시 하나 (softmax)", { size: 13, weight: 800, color: "ink" });
      k.matrix(P[0] + 120, 220, [[0.24, 0.22, 0.21], [0.451, 0.302, 0.247]], { cw: 74, ch: 28, size: 13, fmt: function (v, i) { return v.toFixed(i ? 3 : 2); },
        rows: ["cos", "p (τ 0.05)"], cols: ["tourniquet", "scissors", "gauze"], tones: function (i, j) { return i === 1 && j === 0 ? "red" : (i === 1 ? "teal" : null); }, fills: function (i, j) { return i === 1 && j === 0 ? "mid" : (i === 1 ? "tone" : "plain"); } });
      k.text(P[0] + 16, 300, "라벨 없는 '손'도 목록 1위 'tourniquet'으로 배정 (예시 값)", { size: 12, weight: 700, tone: "red" });
      k.path("M" + (P[0] + 16) + " 318 H" + (P[0] + PW - 16), { tone: "gray", width: 1 });
      k.text(P[0] + 16, 342, "개방형 어휘 — 질의마다 독립 점수 (OWL-ViT 상위 6개)", { size: 13, weight: 800, color: "ink" });
      var owl = [["surgical scissors", 0.207], ["human hand", 0.149], ["human hand", 0.139], ["medical gauze", 0.104], ["roll of medical tape", 0.102], ["roll of medical tape", 0.086]];
      owl.forEach(function (o, i) {
        var y = 356 + i * 26, w = o[1] / 0.25 * 120;
        k.text(P[0] + 170, y + 15, o[0], { size: 12, anchor: "end", color: "ink" });
        k.rect(P[0] + 180, y + 4, w, 15, { tone: o[0] === "human hand" ? "amber" : "teal", fill: "solid", r: 3 });
        k.text(P[0] + 186 + w, y + 16, o[1].toFixed(3), { size: 12, weight: 700, tone: "teal" });
      });
      k.path("M" + (P[0] + 180 + 0.08 / 0.25 * 120) + " 352 V514", { tone: "red", dash: "4 3", width: 1.4 });
      k.text(P[0] + 180 + 0.08 / 0.25 * 120, 530, "임계값 0.08", { size: 11.5, weight: 700, anchor: "middle", tone: "red" });
      k.lines(P[0] + 16, 556, [
        { t: "예시 1장: 검출 9개, 0.34초 · 'human hand' 4번 (손은 라벨 없음)", color: "ink" },
        { t: "점수 0.1~0.3 → 확신 없음 · 박스 y0 = −3처럼 밖으로 나가기도", color: "muted" },
        { t: "20장 매칭 38개 — names 확정 금지,", weight: 800, tone: "red" },
        { t: "후보를 좁혀 사람이 확인하는 시간을 줄이는 용도", weight: 800, tone: "red" }
      ], { size: 12, lh: 20 });
      k.text(P[0] + 16, 682, "새 클래스 = 문장 한 줄 · 닫힌 어휘는 라벨 수집 + 재학습", { size: 11.5, color: "muted" });

      k.panel(P[1], 132, PW, 564, { tone: "blue", head: "soft", title: "② 시각 질의응답 — SmolVLM-500M" });
      var qa = [["What medical tools are visible?", "Aspirator, needle, lancet.", "환각 점검", "red"], ["How many tools are on the tray?", "There are two tools on the tray.", "계수 점검", "orange"], ["Is there a tourniquet? (yes/no)", "No.", "", ""], ["Is there a defibrillator? (yes/no)", "No.", "", ""]];
      qa.forEach(function (q, i) {
        var y = 184 + i * 84;
        k.box(P[1] + 16, y, PW - 32, 72, { tone: "gray", fill: "soft", align: "left", valign: "top", r: 8, title: "Q " + q[0], titleColor: "ink", size: 12.5, lines: [{ t: "A " + q[1], tone: "blue", weight: 700, size: 12.5 }] });
        if (q[2]) k.chip(P[1] + PW - 22, y + 44, q[2], { tone: q[3], solid: true, size: 11.5, h: 22, anchor: "end" });
      });
      k.lines(P[1] + 16, 534, [
        { t: "질문당 5~10초 (CPU) · 장면 라벨로 채점하면", weight: 800, color: "ink" },
        "· 라벨에 없는 물체 이름을 댐 → 환각",
        "· 세는 것이 아니라 단어를 생성 → 계수 오류",
        "· 표현만 바꿔도 답이 바뀜 → 재현성 없음",
        "· 어디를 보고 답했는지 모름 → 검증 불가"
      ], { size: 12, lh: 20 });
      k.text(P[1] + 16, 682, "답과 함께 근거 영역(박스·마스크)을 요구한다", { size: 12, weight: 800, tone: "red" });

      k.panel(P[2], 132, PW, 564, { tone: "orange", head: "soft", title: "③ 생성 데이터를 만드는 3갈래" });
      k.table(P[2] + 14, 176, [56, 218, 86], [
        ["방법", "어떻게", "라벨"],
        [{ t: "편집", tone: "purple" }, "마스크를 지우고 주변으로 채움", "사라짐"],
        [{ t: "합성", tone: "purple" }, "오린 물체를 다른 장면에 붙임", { t: "함께 생성", tone: "green" }],
        [{ t: "확산", tone: "purple" }, "잡음에서 조금씩 걷어내며 그림", { t: "없음", tone: "red" }]
      ], { rh: 30, size: 11.5 });
      k.text(P[2] + 16, 326, "확산 정방향 — 잡음을 조금씩 더함 (학습 없음)", { size: 13, weight: 800, color: "ink" });
      k.formula(P[2] + 14, 338, PW - 28, 40, "x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε", { size: 15 });
      k.lines(P[2] + 16, 400, [
        "β: 1e-4 → 0.02 (선형) · T = 1000 · ᾱ_t = Π(1 − β_s)",
        { t: "t = 250: ᾱ = 0.524 → x_t = **0.724** x₀ + **0.690** ε", tone: "orange" },
        { t: "t = 1000: ᾱ ≈ 0.00004 → 거의 순수 잡음", color: "muted" },
        "역방향(U-Net이 잡음 예측)은 학습된 모형이 필요"
      ], { size: 12, lh: 20 });
      k.box(P[2] + 16, 490, PW - 32, 58, { tone: "red", fill: "solid", title: "생성 데이터는 학습에만", sub: "검증 · 성능 보고에는 절대 금지", size: 16, subSize: 12.5 });
      k.bullets(P[2] + 20, 576, PW - 40, [
        { t: "밝기 · 색온도를 원본과 맞춤", tone: "red" },
        { t: "겹침(가림)도 허용 · 불가능한 위치 금지", tone: "red" },
        { t: "허위 병변 · 재식별 위험 → 출처·절차 기록", tone: "red" }
      ], { size: 12, lh: 20 });
      k.text(P[2] + 16, 682, "실습 노트북: 확산 inpainting은 RUN_DIFFUSION = False", { size: 11.5, color: "muted" });
    }
  });
})();
