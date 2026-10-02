/* ResNet 스킵 커넥션 — 알고리즘 구성도 (강의 필기자료 '2세대 원본 보완 모형', 'ResNet-50 알고리즘 구조' 양식) */
DSDiagram.register({
  id: "resnet-skip-connection-1", sim: "resnet-skip-connection", order: 1,
  title: "ResNet (1) — 퇴화 문제와 잔차 블록", short: "퇴화 문제와 잔차 블록",
  sub: "Residual Learning · 층을 깊게 쌓으면 훈련 오차가 오히려 커지는 문제를, 입력 x를 그대로 더하는 지름길 y = F(x) + x 로 해결",
  label: "Pre-Training CV Model",
  draw: function (k) {
    /* ① 문제 */
    k.section(40, 152, "① 문제 — 층을 깊게 쌓으면 학습 자체가 되지 않는다", { tone: "red", sub: "훈련 데이터에서도 56층 오차 > 20층 오차 → 과적합이 아닌 최적화 실패 (Degradation)" });
    k.panel(40, 166, 1200, 136, { tone: "red", tinted: true });
    var names = ["Input", "Conv", "Conv", "Conv", "· · ·", "Conv", "Output"], bw = 76, gap = 18, x0 = 60;
    names.forEach(function (nm, i) {
      var x = x0 + i * (bw + gap), edge = i === 0 || i === 6;
      k.box(x, 208, bw, 40, { tone: edge ? "ink" : "blue", fill: edge ? "plain" : "tone", title: nm, size: 13.5 });
      if (i) k.arrow(x - gap + 2, 228, x - 2, 228, { tone: "gray", width: 1.5, headSize: 7 });
      if (i >= 1 && i <= 5) k.circle(x + bw / 2, 194, 3 + i * 1.3, { tone: "red", fill: "mid" });
    });
    k.text(60, 274, "앞 층에서 왜곡된 정보가 그대로 뒤로 전달되고, 층을 지날수록 원본이 훼손되며 누적", { size: 12.5, weight: 700, tone: "red" });
    k.text(60, 293, "역전파: 기울기가 층마다 곱해져 0으로 수렴 → 앞쪽 Layer의 Weight까지 학습 신호가 도달하지 못함", { size: 12.5, color: "muted" });
    k.axes(770, 192, 430, 84, { x: "학습 반복 (epoch)", y: "훈련 오차" });
    k.path("M774 198 C820 226 880 234 960 236 S1120 240 1196 240", { tone: "red", width: 2.6 });
    k.path("M774 202 C820 240 900 256 980 262 S1120 268 1196 270", { tone: "gray", width: 2.2 });
    k.text(1196, 230, "56층 (더 깊은 모형)", { size: 12.5, weight: 800, anchor: "end", tone: "red" });
    k.text(1196, 262, "20층 (얕은 모형)", { size: 12.5, weight: 700, anchor: "end", tone: "gray" });

    /* ② 잔차 블록 */
    k.section(40, 334, "② 해결 — 잔차 블록: 입력을 출력에 그대로 더한다", { tone: "green", sub: "y = ReLU( F(x) + x ) · 시뮬레이터 1번 탭의 BasicBlock" });
    k.panel(40, 348, 1200, 228, { tone: "green", tinted: true });
    var cy = 466, xb = k.box(58, cy - 20, 48, 40, { tone: "ink", fill: "plain", title: "x", size: 16 });
    var seq = [["Conv 3×3", 92, "blue"], ["BN", 50, "amber"], ["ReLU", 62, "green"], ["Conv 3×3", 92, "blue"], ["BN", 50, "amber"]];
    var x = 128, prev = xb.r, firstX = 0, lastR = 0;
    seq.forEach(function (s, i) {
      var b = k.box(x, cy - 20, s[1], 40, { tone: s[2], title: s[0], size: 13 });
      k.link(prev, b.l, { tone: "gray", width: 1.6, headSize: 7 });
      if (!i) firstX = x;
      prev = b.r; lastR = x + s[1]; x += s[1] + 20;
    });
    var px = x + 14;
    k.circle(px, cy, 17, { tone: "red", fill: "plain", label: "+", size: 22 });
    k.arrow(prev[0] + 2, cy, px - 19, cy, { tone: "gray", width: 1.6, headSize: 7 });
    var rl = k.box(px + 36, cy - 20, 62, 40, { tone: "green", title: "ReLU", size: 13 });
    k.arrow(px + 19, cy, px + 34, cy, { tone: "gray", width: 1.6, headSize: 7 });
    var yb = k.box(px + 118, cy - 20, 118, 40, { tone: "ink", fill: "plain", title: "y = F(x) + x", size: 14 });
    k.link(rl.r, yb.l, { tone: "gray", width: 1.6, headSize: 7 });
    k.arrow(82, cy - 20, px, cy - 19, { tone: "green", width: 2.6, via: [[82, 404], [px, 404]] });
    k.text((82 + px) / 2, 396, "Identity Shortcut — x 를 연산 없이 그대로 전달 (가중치 0개)", { size: 13, weight: 800, anchor: "middle", tone: "green" });
    k.path("M" + firstX + " 494 V500 H" + lastR + " V494", { tone: "purple", width: 1.4 });
    k.text((firstX + lastR) / 2, 520, "F(x) : 이 구간이 학습하는 「잔차(Residual)」 = H(x) − x", { size: 13, weight: 800, anchor: "middle", tone: "purple" });
    k.text(58, 546, "더 배울 것이 없으면 F(x) → 0 → 출력 = x (항등). 최소한 이전 층의 성능은 그대로 유지", { size: 12.5, color: "muted" });
    k.text(58, 566, "ReLU는 덧셈 뒤: 앞에 두면 F(x)의 음수가 잘려 '빼기' 수정을 못 함", { size: 12, color: "muted" });

    k.box(864, 362, 362, 202, { tone: "gray", fill: "plain", r: 8, align: "left", valign: "top", title: "숫자로 보기 — 8 × 8 특성맵, 가중치 크기 s = 0.80", titleColor: "ink", size: 13,
      lines: [
        { t: "F(x) = s · (x − 흐린 x),  흐린 x = 주변 3×3 평균", size: 12, color: "muted" },
        { t: "칸 (2행, 3열) — 밝은 덩어리 바깥", size: 12, weight: 800 },
        { t: "x = 0.20, 흐린 x = 2.8 / 9 = 0.311", size: 12 },
        { t: "F = 0.8 × (0.20 − 0.311) = −0.089", size: 12, tone: "blue" },
        { t: "y = ReLU(−0.089 + 0.20) = 0.111 → 더 어둡게", size: 12, weight: 700 },
        { t: "칸 (3행, 3열) — 밝은 덩어리 안쪽", size: 12, weight: 800 },
        { t: "x = 1.00, 흐린 x = 5.0 / 9 = 0.556", size: 12 },
        { t: "F = 0.8 × (1.00 − 0.556) = +0.356", size: 12, tone: "orange" },
        { t: "y = ReLU(0.356 + 1.00) = 1.356 → 더 밝게", size: 12, weight: 700 }
      ] });

    /* ③ 기울기 */
    k.section(40, 600, "③ 기울기가 살아남는 경로 — 곱셈 사슬 안에 1이 남는다", { tone: "purple" });
    k.formula(40, 614, 520, 40, "∂L/∂x = ∂L/∂y × ( **1** + ∂F/∂x )", { size: 18, tone: "purple" });
    k.text(48, 676, "plain : J₁ · J₂ · … · J_L → 1보다 작은 값이 L번 곱해져 소멸", { size: 12.5, color: "ink" });
    k.text(48, 696, "residual : (I + …)(I + …) … → 항상 I(=1)가 남아 첫 층까지 전달", { size: 12.5, weight: 700, tone: "green" });
    k.table(586, 606, [96, 92, 176, 66, 224], [
      ["정규화", "구조", "첫 층 기울기 (22층 실측)", "자릿수", "읽는 법"],
      ["BN 없음", { t: "plain", tone: "red", weight: 700 }, "2.6 × 10⁻⁵", "10⁻⁵", "기울기 소멸 — 앞층 학습 멈춤"],
      ["BN 없음", { t: "residual", tone: "green", weight: 700 }, "3.5 × 10⁻¹", "10⁻¹", "지름길로 기울기 전달"],
      ["BN 있음", { t: "plain", tone: "red", weight: 700 }, "1.0", "10⁰", "기울기는 와도 퇴화는 남음"],
      ["BN 있음", { t: "residual", tone: "green", weight: 700 }, "0.2 ~ 0.3", "10⁻¹", "안정적으로 학습"]
    ], { rh: 19, size: 12 });
  }
});

DSDiagram.register({
  id: "resnet-skip-connection-2", sim: "resnet-skip-connection", order: 2,
  title: "ResNet (2) — ResNet-50 구조와 Bottleneck", short: "ResNet-50 · Bottleneck",
  sub: "Residual Network · 1×1 축소 → 3×3 → 1×1 복원 블록을 3·4·6·3번 쌓은 50층 구조 (입력 224 × 224 × 3 기준)",
  label: "Pre-Training CV Model",
  draw: function (k) {
    /* ① 전체 Layer 흐름 */
    k.section(40, 152, "① 전체 Layer 흐름 — Input에서 출력부까지", { tone: "blue" });
    k.panel(40, 166, 1200, 176, { tone: "blue", tinted: true });
    var L = [
      { t: "Input", l: ["224×224×3"], w: 92, tone: "ink", fill: "plain", o: "224²×3" },
      { t: "Conv1", l: ["7 × 7, 64", "stride 2"], w: 92, tone: "blue", o: "112²×64" },
      { t: "MaxPool", l: ["3 × 3", "stride 2"], w: 92, tone: "gray", fill: "soft", o: "56²×64" },
      { t: "conv2_x", l: ["1×1, 64", "3×3, 64", "1×1, 256"], n: "× 3", w: 116, tone: "blue", o: "56²×256" },
      { t: "conv3_x", l: ["1×1, 128", "3×3, 128", "1×1, 512"], n: "× 4", w: 116, tone: "blue", o: "28²×512" },
      { t: "conv4_x", l: ["1×1, 256", "3×3, 256", "1×1, 1024"], n: "× 6", w: 116, tone: "blue", o: "14²×1024" },
      { t: "conv5_x", l: ["1×1, 512", "3×3, 512", "1×1, 2048"], n: "× 3", w: 116, tone: "blue", o: "7²×2048" },
      { t: "GAP", l: ["채널별 평균", "공간 축 제거"], w: 96, tone: "gray", fill: "soft", o: "2048" },
      { t: "출력부 FC", l: ["Dense 128", "BN · ReLU", "Dropout 0.5"], w: 104, tone: "purple", o: "128" },
      { t: "Output", l: ["Dense(1)", "sigmoid"], w: 90, tone: "ink", fill: "plain", o: "1" }
    ];
    var gap = 14, x = 54, yT = 182, H = 108;
    L.forEach(function (b, i) {
      var lines = b.l.map(function (s) { return { t: s, size: 12, color: "ink" }; });
      if (b.n) lines.push({ t: b.n + " 블록", size: 12, weight: 800, tone: "red" });
      k.box(x, yT, b.w, H, { tone: b.tone, fill: b.fill || "tone", title: b.t, size: 14, lines: lines });
      k.text(x + b.w / 2, yT + H + 20, b.o, { size: 12.5, weight: 800, anchor: "middle", tone: "teal" });
      if (i) k.arrow(x - gap + 2, yT + H / 2, x - 2, yT + H / 2, { tone: "gray", width: 1.5, headSize: 6.5 });
      x += b.w + gap;
    });
    k.text(54, 333, "층 수 = Conv1 1 + (3 + 4 + 6 + 3) 블록 × 3층 = 48 + 출력 FC 1 → 50층 · 공간은 224 → 7로 줄고, 채널은 64 → 2048로 늘어남 (청록 = 각 단계 출력 크기)", { size: 12.5, color: "muted" });

    /* ② Bottleneck */
    k.section(40, 372, "② Bottleneck Residual Block 내부 — Layer 노드와 Skip Connection", { tone: "purple" });
    k.panel(40, 386, 808, 200, { tone: "purple", tinted: true });
    var cy = 486;
    var xb = k.box(54, cy - 20, 40, 40, { tone: "ink", fill: "plain", title: "x", size: 15 });
    var seq = [
      { t: "Conv 1×1", s: "64 · 축소", w: 84, tone: "blue" }, { t: "BN", s: "+ ReLU", w: 70, tone: "amber" },
      { t: "Conv 3×3", s: "64 · 공간", w: 84, tone: "blue" }, { t: "BN", s: "+ ReLU", w: 70, tone: "amber" },
      { t: "Conv 1×1", s: "256 · 복원", w: 84, tone: "blue" }, { t: "BN", w: 40, tone: "amber" }
    ];
    var xx = 110, prev = xb.r, fx = 0, lx = 0;
    seq.forEach(function (s, i) {
      var b = k.box(xx, cy - 22, s.w, 44, { tone: s.tone, title: s.t, sub: s.s, size: 12.5, subSize: 11.5 });
      k.link(prev, b.l, { tone: "gray", width: 1.5, headSize: 6.5 });
      if (!i) fx = xx; lx = xx + s.w;
      prev = b.r; xx += s.w + 14;
    });
    var px = xx + 8;
    k.circle(px, cy, 15, { tone: "red", fill: "plain", label: "+", size: 20 });
    k.arrow(prev[0] + 2, cy, px - 17, cy, { tone: "gray", width: 1.5, headSize: 6.5 });
    var rl = k.box(px + 30, cy - 20, 56, 40, { tone: "green", title: "ReLU", size: 12.5 });
    k.arrow(px + 17, cy, px + 28, cy, { tone: "gray", width: 1.5, headSize: 6.5 });
    var hb = k.box(px + 100, cy - 20, 62, 40, { tone: "ink", fill: "plain", title: "H(x)", size: 14 });
    k.link(rl.r, hb.l, { tone: "gray", width: 1.5, headSize: 6.5 });
    k.arrow(74, cy - 20, px, cy - 17, { tone: "red", width: 2.4, via: [[74, 430], [px, 430]] });
    k.text((74 + px) / 2, 422, "Identity Shortcut — 입력 x (256채널)를 연산 없이 그대로 더함", { size: 12.5, weight: 800, anchor: "middle", tone: "red" });
    k.path("M" + fx + " 516 V522 H" + lx + " V516", { tone: "purple", width: 1.4 });
    k.text((fx + lx) / 2, 540, "F(x) : 256 → 64 (채널 축소) → 64 (3×3 공간 특징) → 256 (채널 복원)", { size: 12.5, weight: 800, anchor: "middle", tone: "purple" });
    k.text(56, 570, "크기 (conv2_x): 56×56×256 → 56×56×64 → 56×56×64 → 56×56×256 → + x(56×56×256) → 출력 56×56×256", { size: 12, color: "muted" });

    k.panel(864, 386, 376, 200, { tone: "purple", head: "soft", title: "파라미터 비교 (채널 C = 256)" });
    k.text(882, 446, "BasicBlock (3×3 → 3×3)", { size: 13, weight: 800, tone: "orange" });
    k.text(882, 465, "(3×3×256×256) × 2 = 1,179,648", { size: 12.5, color: "ink" });
    k.text(882, 494, "Bottleneck (1×1 → 3×3 → 1×1)", { size: 13, weight: 800, tone: "purple" });
    k.text(882, 513, "16,384 + 36,864 + 16,384 = 69,632", { size: 12.5, color: "ink" });
    k.rect(882, 528, 300, 10, { tone: "orange", fill: "solid", r: 2 });
    k.rect(882, 543, 17.7, 10, { tone: "purple", fill: "solid", r: 2 });
    k.text(906, 553, "5.9%", { size: 11.5, weight: 700, tone: "purple" });
    k.text(882, 576, "→ 약 **16.94배** 가벼움 (18C² vs 17C²/16)", { size: 12.5, weight: 700, color: "ink" });

    /* ③ shape 맞추기 · 깊이별 구성 */
    k.section(40, 616, "③ 지름길 shape 맞추기와 깊이별 구성", { tone: "teal" });
    var a = k.box(40, 630, 138, 44, { tone: "blue", title: "F(x)", sub: "(28, 28, 128)", size: 13, subSize: 12 });
    k.text(192, 658, "+", { size: 20, weight: 800, anchor: "middle", color: "muted" });
    var b = k.box(206, 630, 138, 44, { tone: "red", dash: true, title: "x 그대로", sub: "(56, 56, 64) 불일치", size: 13, subSize: 12 });
    var c = k.box(374, 630, 206, 44, { tone: "green", title: "옵션 B: 1×1 Conv s2 + BN", sub: "x → (28, 28, 128) 일치", size: 12.5, subSize: 12 });
    k.link(b.r, c.l, { tone: "green", width: 1.6, headSize: 7 });
    k.text(40, 696, "Add는 shape이 완전히 같아야 함 · 추가 파라미터 64·128 + 2·128 = 8,448 (주 경로 221,184의 3.8%)", { size: 12, color: "muted" });
    var D = [["ResNet-18", "2·2·2·2", "Basic"], ["ResNet-34", "3·4·6·3", "Basic"], ["ResNet-50", "3·4·6·3", "Bottleneck"], ["ResNet-101", "3·4·23·3", "Bottleneck"], ["ResNet-152", "3·8·36·3", "Bottleneck"]];
    D.forEach(function (d, i) {
      k.box(612 + i * 126, 630, 118, 58, { tone: d[0] === "ResNet-50" ? "purple" : "teal", fill: d[0] === "ResNet-50" ? "tone" : "plain", title: d[0], sub: d[1] + " · " + d[2], size: 13, subSize: 11.5 });
    });
    k.text(1240, 704, "스테이지별 블록 반복 수", { size: 11.5, anchor: "end", color: "muted" });
  }
});

DSDiagram.register({
  id: "resnet-skip-connection-3", sim: "resnet-skip-connection", order: 3,
  title: "ResNet (3) — 전이학습 2단계 구성", short: "전이학습 2단계",
  sub: "ImageNet으로 사전학습한 ResNet50 위에 새 출력부를 얹어 의료영상에 옮겨 쓰는 표준 절차 · 요추 MRI 추간공 협착 분류 사례",
  label: "Pre-Training CV Model",
  draw: function (k) {
    /* ① 구성 */
    k.section(40, 152, "① 실습 적용 — ResNet50 전이학습 모형 구성", { tone: "green" });
    k.panel(40, 166, 1200, 132, { tone: "green", tinted: true });
    var B = [
      { t: "MRI 이미지", s: "224 × 224 × 3", l: "preprocess_input", w: 150, tone: "ink", fill: "plain" },
      { t: "ResNet50 Base Model", s: "weights = imagenet · include_top = False", l: "conv1 ~ conv5_x · 175 Layer", w: 270, tone: "blue" },
      { t: "(7, 7, 2048)", s: "압축 특성맵", w: 116, tone: "gray", fill: "soft" },
      { t: "GAP", s: "채널별 평균 → 2048", l: "Flatten 대비 과적합 ↓", w: 150, tone: "gray", fill: "soft" },
      { t: "새 출력부 (Head)", s: "Dense(128) · BN · ReLU", l: "Dropout(0.5)", w: 180, tone: "purple" },
      { t: "Dense(1)", s: "sigmoid", l: "협착 발병 여부", w: 140, tone: "ink", fill: "plain" }
    ];
    var x = 58, gap = 26, by = 184, pos = [];
    B.forEach(function (b, i) {
      var lines = b.l ? [{ t: b.l, size: 12, weight: 700, tone: i === 5 ? "red" : null, color: i === 5 ? null : "ink" }] : [];
      k.box(x, by, b.w, 70, { tone: b.tone, fill: b.fill || "tone", title: b.t, sub: b.s, size: 14, subSize: 11.5, lines: lines });
      pos.push(x + b.w / 2);
      if (i) k.arrow(x - gap + 3, by + 35, x - 3, by + 35, { tone: "gray", width: 1.6, headSize: 7 });
      x += b.w + gap;
    });
    k.chip(pos[1], 264, "1단계: Base 전체 동결 (Freeze)", { tone: "red", anchor: "middle", size: 12.5 });
    k.chip(pos[4], 264, "새로 학습하는 부분", { tone: "purple", anchor: "middle", size: 12.5 });
    k.text(1222, 286, "1 × 1 이진 분류", { size: 11.5, anchor: "end", color: "muted" });

    /* ② 두 단계 */
    k.section(40, 330, "② 학습은 두 단계로 — 먼저 출력부만, 그다음 뒤쪽 층만 조금", { tone: "purple" });
    function layers(x0, y0, openFrom) {
      for (var i = 0; i < 12; i++) {
        var open = i >= openFrom;
        k.rect(x0 + i * 30, y0, 24, 32, { tone: open ? "purple" : "gray", fill: open ? "mid" : "tone", r: 3 });
      }
      k.box(x0 + 12 * 30 + 12, y0 - 4, 96, 40, { tone: "purple", fill: "mid", title: "Head", size: 13.5 });
    }
    [["1단계 특성 추출 (Feature Extraction)", "blue", 40, 12, [
      "base_model.trainable = False → 합성곱 가중치 전체 동결",
      "새로 붙인 출력부(Head)만 학습 · optimizer = adam (기본 학습률)",
      "epochs = 20 · batch_size = 32 · validation_split = 0.2",
      "class_weight = balanced → 373 : 96 불균형을 손실에서 보정"
    ], "회색 = 동결 (사전학습 가중치 그대로)"],
     ["2단계 미세 조정 (Fine-Tuning)", "purple", 650, 9, [
      "base_model.trainable = True 후 layers[:-30] 은 다시 동결",
      "뒤쪽 30개 Layer만 열어 MRI 도메인에 맞게 재조정",
      "BatchNormalization Layer는 동결 유지 (배치 통계 보호)",
      "Adam(learning_rate = 0.00001) · epochs = 10 → .keras 저장"
    ], "보라 = 학습 (뒤쪽 층 + Head)"]].forEach(function (p, idx) {
      var px = p[2];
      k.panel(px, 344, 590, 216, { tone: p[1], head: "solid", title: p[0], right: idx ? "학습률 1/100 이하" : "출력부만", tinted: true });
      layers(px + 22, 406, p[3]);
      k.text(px + 22, 456, p[5], { size: 11.5, color: "muted" });
      k.text(px + 22, 398, "ResNet50 Base (12칸 = 층 묶음 예시)", { size: 11.5, color: "muted" });
      k.bullets(px + 22, 482, 556, p[4], { size: 12.5, lh: 19, tone: p[1] });
    });
    k.arrow(633, 423, 648, 423, { tone: "purple", width: 2.2, headSize: 8 });

    k.note(40, 568, 1200, 30, { tone: "red", title: "순서가 중요 — 출력부가 무작위 Weight인 상태에서 Base를 열면 큰 오차가 역전파되어 사전학습 가중치가 손상된다", size: 13 });

    /* ③ 계보 */
    k.section(40, 628, "③ 계보 속 ResNet — 원본을 보존하고 차이만 학습", { tone: "teal" });
    var G = [["0세대", "LeNet-5", "gray"], ["1세대 단순 적층", "AlexNet · VGG · Inception", "blue"], ["2세대 원본 보완", "ResNet · DenseNet", "green"], ["3세대 경량화", "MobileNet · EfficientNet", "orange"], ["4세대 Transformer", "ViT · DeiT · Swin", "purple"], ["Foundation", "CLIP · DINO · SAM", "pink"]];
    G.forEach(function (g, i) {
      var on = i === 2;
      k.box(40 + i * 202, 642, 190, 46, { tone: g[2], fill: on ? "mid" : "tone", thick: on, title: g[0], sub: g[1], size: 13, subSize: 11.5 });
      if (i) k.arrow(40 + i * 202 - 11, 665, 40 + i * 202 - 2, 665, { tone: "gray", width: 1.4, headSize: 6 });
    });
    k.text(40, 708, "덧셈(Add) 지름길은 DenseNet · MobileNet v2 · EfficientNet · Transformer 블록에 모두 들어 있다 — ResNet은 더 깊게 만들려고 더하고, U-Net은 위치를 되찾으려고 잇는다(Concat)", { size: 12, color: "muted" });
  }
});
