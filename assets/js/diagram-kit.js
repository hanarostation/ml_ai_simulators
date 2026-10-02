/* =====================================================================
   알고리즘 구성도 키트 (diagram-kit.js)
   - 도식 한 장 = 1280×720 SVG 슬라이드. 강의 필기자료와 같은 양식:
     왼쪽 위 "제목 — 부제", 오른쪽 위 분류 이름, 구분선, 번호 붙은 구획, 색 상자, 화살표, 행렬, 표, 흐름 칩
   - 도식 파일(assets/diagrams/<시뮬레이터 id>.js)은 DSDiagram.register({...}) 로 등록
   - 페이지에서는 <div data-ds-diagrams="시뮬레이터 id"></div> 를 두면 뷰어가 자동으로 붙음
   - 색은 톤 이름만 씀: blue green orange purple red teal amber pink gray ink
   ===================================================================== */
(function () {
  "use strict";
  var REG = (window.DS_DIAGRAMS = window.DS_DIAGRAMS || []);
  var W = 1280, H = 720, M = 40;
  var TONES = ["blue", "green", "orange", "purple", "red", "teal", "amber", "pink", "gray", "ink"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function tone(t) { return "dg-t-" + (TONES.indexOf(t) >= 0 ? t : "gray"); }
  function n(v) { return Math.round(v * 10) / 10; }

  /* 글자 폭 근사 (Noto Sans KR / IBM Plex 기준) */
  function charW(ch, size, mono) {
    if (mono) return size * 0.6;
    var c = ch.charCodeAt(0);
    if (c >= 0x1100 && (c <= 0x11FF || (c >= 0x2E80 && c <= 0x9FFF) || (c >= 0xAC00 && c <= 0xD7AF) || (c >= 0xF900 && c <= 0xFAFF) || (c >= 0xFF00 && c <= 0xFFEF))) return size * 0.96;
    if (c >= 0x2460 && c <= 0x24FF) return size * 0.96;           /* ① 등 */
    if (c >= 0x2190 && c <= 0x21FF) return size * 0.9;            /* 화살표 */
    if (ch === " ") return size * 0.27;
    if ("iljI.,:;'!|".indexOf(ch) >= 0) return size * 0.27;
    if ("mwMW".indexOf(ch) >= 0) return size * 0.82;
    if (ch >= "A" && ch <= "Z") return size * 0.64;
    if (c > 0x2000) return size * 0.8;
    return size * 0.54;
  }
  function textW(str, size, mono, weight) {
    var s = String(str).replace(/\*\*/g, ""), w = 0;
    for (var i = 0; i < s.length; i++) w += charW(s[i], size, mono);
    return w * (weight >= 700 ? 1.04 : 1);
  }
  /* 폭에 맞춰 줄 나누기 (\n 존중, 띄어쓰기 단위, 너무 긴 단어는 글자 단위) */
  function wrap(str, width, size, mono, weight) {
    var out = [];
    String(str).split("\n").forEach(function (para) {
      var words = para.split(" "), line = "";
      words.forEach(function (wd) {
        var tryL = line ? line + " " + wd : wd;
        if (textW(tryL, size, mono, weight) <= width || !line) {
          if (!line && textW(wd, size, mono, weight) > width) {
            var cur = "";
            for (var i = 0; i < wd.length; i++) {
              if (textW(cur + wd[i], size, mono, weight) > width && cur) { out.push(cur); cur = ""; }
              cur += wd[i];
            }
            line = cur;
          } else line = tryL;
        } else { out.push(line); line = wd; }
      });
      out.push(line);
    });
    return out;
  }
  /* **굵게** 구간을 tspan 으로 */
  function rich(str, boldCls) {
    var parts = String(str).split("**"), s = "";
    parts.forEach(function (p, i) {
      if (!p) return;
      s += i % 2 ? '<tspan font-weight="800"' + (boldCls ? ' class="' + boldCls + '"' : "") + ">" + esc(p) + "</tspan>" : esc(p);
    });
    return s;
  }
  var CIRC = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮";

  /* ------------------------------------------------------------------
     그리기 도구 k
     ------------------------------------------------------------------ */
  function Kit() { this.o = []; }
  var K = Kit.prototype;
  K.W = W; K.H = H; K.M = M; K.top = 128; K.bottom = 700;
  K.raw = function (s) { this.o.push(s); return this; };
  K.circ = function (i) { return CIRC[i - 1] || String(i); };
  K.textWidth = function (s, size, o) { o = o || {}; return textW(s, size || 16, o.mono, o.weight); };
  K.wrap = function (s, w, size, o) { o = o || {}; return wrap(s, w, size || 16, o.mono, o.weight); };

  function colorCls(o, fallback) {
    var c = o.color || fallback || "";
    if (c === "tone") return "dg-tc";
    if (c === "ink") return "dg-ink";
    if (c === "muted") return "dg-muted";
    if (c === "faint") return "dg-faint";
    if (c === "on") return "dg-on";
    return "";
  }
  function textEl(x, y, str, o) {
    o = o || {};
    var size = o.size || 16, w = o.weight || 400;
    var cls = [colorCls(o, o.tone ? "tone" : ""), o.mono ? "dg-mono" : ""].filter(Boolean).join(" ");
    var g = o.tone ? ' class="' + tone(o.tone) + '"' : "";
    return (g ? "<g" + g + ">" : "") +
      '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + size + '" font-weight="' + w + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : "") + (cls ? ' class="' + cls + '"' : "") +
      (o.italic ? ' font-style="italic"' : "") + (o.ls ? ' letter-spacing="' + o.ls + '"' : "") + ">" + rich(str, o.boldTone ? "dg-tc" : "") + "</text>" +
      (g ? "</g>" : "");
  }

  /* 글자 한 줄. o: size weight tone color(ink|muted|faint|tone|on) anchor(start|middle|end) mono */
  K.text = function (x, y, str, o) { this.o.push(textEl(x, y, str, o)); return this; };

  /* 여러 줄. items: 문자열 또는 {t, tone, color, weight, size}. o.lh 줄 간격 */
  K.lines = function (x, y, items, o) {
    o = o || {};
    var size = o.size || 15, lh = o.lh || Math.round(size * 1.5), self = this, yy = y;
    items.forEach(function (it) {
      if (typeof it === "string") it = { t: it };
      var oo = {}; for (var k in o) oo[k] = o[k]; for (var k2 in it) oo[k2] = it[k2];
      self.o.push(textEl(x, yy, it.t, oo));
      yy += it.size ? Math.round(it.size * 1.5) : lh;
    });
    return yy - y;
  };

  /* 문단(자동 줄바꿈). 높이 반환 */
  K.para = function (x, y, w, str, o) {
    o = o || {};
    var size = o.size || 15;
    var ls = wrap(str, w, size, o.mono, o.weight);
    return this.lines(x, y, ls, o);
  };

  /* 구획 머리 ▎① 제목 — o: size(20) tone(번호 색, 기본 blue) sub(오른쪽 회색 설명) */
  K.section = function (x, y, label, o) {
    o = o || {};
    var size = o.size || 20;
    this.o.push('<rect class="dg-sec-bar" x="' + x + '" y="' + (y - size * 0.82) + '" width="4.5" height="' + (size * 1.05) + '" rx="1.5"/>');
    var s = String(label), num = "", rest = s;
    if (CIRC.indexOf(s[0]) >= 0) { num = s[0]; rest = s.slice(1); }
    var t = '<text x="' + (x + 14) + '" y="' + y + '" font-size="' + size + '" class="dg-sec-t">';
    if (num) t += '<tspan class="' + tone(o.tone || "blue") + '"><tspan class="dg-tc" font-weight="800">' + num + "</tspan></tspan>";
    t += rich(rest) + "</text>";
    this.o.push(t);
    if (o.sub) {
      var tw0 = textW(s, size, false, 800) + 26;
      this.o.push(textEl(x + 14 + tw0, y, o.sub, { size: Math.round(size * 0.68), color: "muted" }));
    }
    return this;
  };

  /* 상자. o: tone fill(tone|plain|solid|mid|soft|ghost) dash thick r
     title sub lines(배열) size subSize align(center|left) valign(middle|top) titleColor  → 앵커 반환 */
  K.box = function (x, y, w, h, o) {
    o = o || {};
    var t = o.tone || "blue", fill = o.fill || "tone", r = o.r == null ? 10 : o.r;
    var cls = "dg-box" + (fill !== "tone" ? " dg-box--" + fill : "") + (o.dash ? " dg-box--dash" : "") + (o.thick ? " dg-box--thick" : "");
    var s = '<g class="' + tone(t) + '"><rect class="' + cls + '" x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + r + '"/>';
    var size = o.size || 16, sub = o.subSize || Math.max(11, Math.round(size * 0.8));
    var onSolid = fill === "solid";
    var rows = [];
    if (o.title != null) {
      wrap(o.title, w - 20, size, false, 800).forEach(function (l) {
        rows.push({ t: l, size: size, weight: 800, color: onSolid ? "on" : (o.titleColor || (fill === "plain" || fill === "soft" || fill === "ghost" ? "ink" : "tone")) });
      });
    }
    if (o.sub != null) {
      wrap(o.sub, w - 20, sub, o.mono).forEach(function (l) { rows.push({ t: l, size: sub, weight: 400, color: onSolid ? "on" : "muted", mono: o.mono }); });
    }
    (o.lines || []).forEach(function (l) {
      var it = typeof l === "string" ? { t: l } : l;
      wrap(it.t, w - 24, it.size || sub + 1).forEach(function (ll) {
        rows.push({ t: ll, size: it.size || sub + 1, weight: it.weight || 400, color: onSolid ? "on" : (it.color || (it.tone ? "tone" : "ink")), tone: it.tone });
      });
    });
    var total = 0; rows.forEach(function (rw, i) { total += (i ? rw.size * 1.38 : rw.size); });
    var left = o.align === "left", cx = left ? x + 14 : x + w / 2;
    var yy = o.valign === "top" ? y + 14 + (rows[0] ? rows[0].size : 0) : y + h / 2 - total / 2 + (rows[0] ? rows[0].size * 0.82 : 0);
    rows.forEach(function (rw, i) {
      if (i) yy += rw.size * 1.38;
      s += textEl(cx, yy, rw.t, { size: rw.size, weight: rw.weight, color: rw.color, anchor: left ? "start" : "middle", mono: rw.mono, tone: rw.tone });
    });
    s += "</g>";
    this.o.push(s);
    return { x: x, y: y, w: w, h: h, cx: x + w / 2, cy: y + h / 2, l: [x, y + h / 2], r: [x + w, y + h / 2], t: [x + w / 2, y], b: [x + w / 2, y + h] };
  };

  /* 구획 패널. o: tone head(solid|soft|none) title right(오른쪽 작은 글) tinted(옅게 칠한 바탕)
     → 내용 시작 y 를 담은 객체 반환 {x,y,w,h,inY} */
  K.panel = function (x, y, w, h, o) {
    o = o || {};
    var t = o.tone || "gray", head = o.head || (o.title ? "soft" : "none"), hh = o.headH || 34, r = 12;
    var s = '<g class="' + tone(t) + '"><rect class="dg-panel' + (o.tinted ? " dg-panel--tone" : "") + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '"/>';
    if (head !== "none") {
      s += '<path class="dg-panel-head' + (head === "soft" ? " dg-panel-head--soft" : "") + '" d="M' + x + " " + (y + hh) + "V" + (y + r) + "a" + r + " " + r + " 0 0 1 " + r + " " + (-r) + "H" + (x + w - r) + "a" + r + " " + r + " 0 0 1 " + r + " " + r + "V" + (y + hh) + 'Z"/>';
      s += textEl(x + 16, y + hh / 2 + 6, o.title || "", { size: o.titleSize || 16, weight: 800, color: head === "solid" ? "on" : "tone" });
      if (o.right) s += textEl(x + w - 16, y + hh / 2 + 5, o.right, { size: 12.5, weight: 700, anchor: "end", color: head === "solid" ? "on" : "tone" });
    } else if (o.title) {
      s += textEl(x + 18, y + 30, o.title, { size: o.titleSize || 17, weight: 800, color: o.titleColor || "ink" });
    }
    s += "</g>";
    this.o.push(s);
    return { x: x, y: y, w: w, h: h, inY: y + (head !== "none" ? hh : (o.title ? 42 : 0)) + 14 };
  };

  /* 왼쪽 색 막대 메모 (강의자료의 "연산량·파라미터 감소" 카드). o: tone title body */
  K.note = function (x, y, w, h, o) {
    o = o || {};
    var s = '<g class="' + tone(o.tone || "blue") + '"><rect class="dg-note" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6"/>' +
      '<rect class="dg-note-bar" x="' + x + '" y="' + y + '" width="4" height="' + h + '" rx="2"/>';
    var yy = y + (o.body ? 20 : h / 2 + 5);
    if (o.title) s += textEl(x + 14, yy, o.title, { size: o.size || 14, weight: 800, color: "tone" });
    if (o.body) {
      wrap(o.body, w - 26, o.bodySize || 12.5).forEach(function (l, i) {
        s += textEl(x + 14, yy + 19 + i * 17, l, { size: o.bodySize || 12.5, color: "muted" });
      });
    }
    s += "</g>";
    this.o.push(s);
    return this;
  };

  /* 화살표. o: tone dash width head(true) both curve(휘는 정도, +/-) via([[x,y]..] 꺾은선) label labelDx labelDy */
  K.arrow = function (x1, y1, x2, y2, o) {
    o = o || {};
    var t = o.tone || "gray", wd = o.width || 2, hs = o.headSize || (6 + wd * 1.6), d, ex, ey, sx, sy;
    if (o.via && o.via.length) {
      var pts = [[x1, y1]].concat(o.via, [[x2, y2]]);
      d = "M" + pts.map(function (p) { return n(p[0]) + " " + n(p[1]); }).join(" L");
      var a = pts[pts.length - 2]; ex = x2 - a[0]; ey = y2 - a[1];
      var b = pts[1]; sx = x1 - b[0]; sy = y1 - b[1];
    } else if (o.curve) {
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      var cx = mx - dy / L * o.curve, cy = my + dx / L * o.curve;
      d = "M" + n(x1) + " " + n(y1) + " Q" + n(cx) + " " + n(cy) + " " + n(x2) + " " + n(y2);
      ex = x2 - cx; ey = y2 - cy; sx = x1 - cx; sy = y1 - cy;
    } else {
      d = "M" + n(x1) + " " + n(y1) + " L" + n(x2) + " " + n(y2);
      ex = x2 - x1; ey = y2 - y1; sx = -ex; sy = -ey;
    }
    function headAt(px, py, vx, vy) {
      var L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L;
      var bx = px - ux * hs, by = py - uy * hs, wx = -uy * hs * 0.55, wy = ux * hs * 0.55;
      return '<path class="dg-head" d="M' + n(px) + " " + n(py) + " L" + n(bx + wx) + " " + n(by + wy) + " L" + n(bx - wx) + " " + n(by - wy) + 'Z"/>';
    }
    /* 화살촉에 선이 튀어나오지 않게 끝을 줄임 */
    var s = '<g class="' + tone(t) + '"><path class="dg-line' + (o.dash ? " dg-line--dash" : "") + '" style="stroke-width:' + wd + '" d="' + d + '"' + "/>";
    if (o.head !== false) s += headAt(x2, y2, ex, ey);
    if (o.both) s += headAt(x1, y1, sx, sy);
    if (o.label) {
      var lx = (x1 + x2) / 2 + (o.labelDx || 0), ly = (y1 + y2) / 2 - 8 + (o.labelDy || 0);
      if (o.curve) { var dx2 = x2 - x1, dy2 = y2 - y1, L2 = Math.hypot(dx2, dy2) || 1; lx -= dy2 / L2 * o.curve * 0.5; ly += dx2 / L2 * o.curve * 0.5; }
      s += textEl(lx, ly, o.label, { size: o.labelSize || 12.5, weight: 700, anchor: "middle", color: "tone" });
    }
    s += "</g>";
    this.o.push(s);
    return this;
  };
  /* 상자 앵커끼리 잇기: k.link(a.r, b.l, o) */
  K.link = function (p, q, o) { return this.arrow(p[0], p[1], q[0], q[1], o); };

  /* 행렬/격자. data 2차원 배열. o: cw ch size tone fill(plain|tone|mid|solid) tones(function(i,j,v)→톤|null)
     fills(function(i,j,v)→'tone'|'mid'|'solid'|'plain') fmt rows cols(머리 글) title hl([{r,c,rs,cs,tone}]) mono */
  K.matrix = function (x, y, data, o) {
    o = o || {};
    var cw = o.cw || 40, ch = o.ch || 34, size = o.size || 15, R = data.length, C = data[0].length;
    var s = "";
    if (o.title) s += textEl(x + C * cw / 2, y - (o.cols ? 24 : 10), o.title, { size: 14, weight: 800, anchor: "middle", tone: o.titleTone || o.tone, color: (o.titleTone || o.tone) ? "tone" : "ink" });
    if (o.cols) o.cols.forEach(function (c, j) { s += textEl(x + j * cw + cw / 2, y - 7, c, { size: 11.5, anchor: "middle", color: "muted" }); });
    if (o.rows) o.rows.forEach(function (r, i) { s += textEl(x - 8, y + i * ch + ch / 2 + 4, r, { size: 11.5, anchor: "end", color: "muted" }); });
    for (var i = 0; i < R; i++) for (var j = 0; j < C; j++) {
      var v = data[i][j];
      var tn = o.tones ? o.tones(i, j, v) : o.tone;
      var fl = o.fills ? o.fills(i, j, v) : (o.fill || (tn ? "tone" : "plain"));
      if (fl === "plain" && !tn) tn = "gray";
      var cls = "dg-cell" + (fl === "plain" ? " dg-cell--plain" : fl === "mid" ? " dg-cell--mid" : fl === "solid" ? " dg-cell--solid" : " dg-cell--tone");
      s += '<g class="' + tone(tn || "gray") + '"><rect class="' + cls + '" x="' + (x + j * cw) + '" y="' + (y + i * ch) + '" width="' + cw + '" height="' + ch + '"/>';
      if (v !== null && v !== "") s += textEl(x + j * cw + cw / 2, y + i * ch + ch / 2 + size * 0.36, o.fmt ? o.fmt(v, i, j) : v, { size: size, weight: o.weight || 600, anchor: "middle", color: fl === "solid" ? "on" : "ink", mono: o.mono });
      s += "</g>";
    }
    s += '<rect class="dg-grid" x="' + x + '" y="' + y + '" width="' + C * cw + '" height="' + R * ch + '"/>';
    (o.hl || []).forEach(function (h) {
      s += '<g class="' + tone(h.tone || "red") + '"><rect class="dg-hl" x="' + (x + h.c * cw) + '" y="' + (y + h.r * ch) + '" width="' + ((h.cs || 1) * cw) + '" height="' + ((h.rs || 1) * ch) + '" rx="2"/></g>';
    });
    this.o.push(s);
    return { x: x, y: y, w: C * cw, h: R * ch, cx: x + C * cw / 2, cy: y + R * ch / 2, l: [x, y + R * ch / 2], r: [x + C * cw, y + R * ch / 2], t: [x + C * cw / 2, y], b: [x + C * cw / 2, y + R * ch] };
  };

  /* 표. cols: 열 너비 배열, rows: 2차원(첫 행 = 머리글). o: rh size header(true) firstBold tones(function(i)→행 톤) */
  K.table = function (x, y, cols, rows, o) {
    o = o || {};
    var rh = o.rh || 30, size = o.size || 13, header = o.header !== false, wsum = cols.reduce(function (a, b) { return a + b; }, 0);
    var s = "", yy = y;
    rows.forEach(function (row, i) {
      var isH = header && i === 0;
      if (isH) s += '<rect class="dg-th" x="' + x + '" y="' + yy + '" width="' + wsum + '" height="' + rh + '" rx="4"/>';
      var tn = !isH && o.tones ? o.tones(i) : null;
      var xx = x;
      row.forEach(function (cell, j) {
        var c = typeof cell === "object" && cell !== null ? cell : { t: cell };
        s += textEl(xx + 10, yy + rh / 2 + size * 0.36, c.t, {
          size: isH ? size - 0.5 : size, weight: isH ? 800 : (j === 0 && o.firstBold !== false ? 800 : (c.weight || 400)),
          color: isH ? "muted" : (c.tone || (j === 0 && tn) ? "tone" : (c.color || "ink")), tone: c.tone || (j === 0 ? tn : null), mono: c.mono
        });
        xx += cols[j];
      });
      yy += rh;
      if (i < rows.length - 1) s += '<line class="dg-tr" x1="' + x + '" y1="' + yy + '" x2="' + (x + wsum) + '" y2="' + yy + '"/>';
    });
    this.o.push(s);
    return { x: x, y: y, w: wsum, h: yy - y };
  };

  /* 흐름 칩 줄 (강의자료 하단 파이프라인). items: 문자열 또는 {t, s, tone, fill}. o: w(전체 폭) h gap tone size label(왼쪽 제목) */
  K.flow = function (x, y, items, o) {
    o = o || {};
    var h = o.h || (items.some(function (it) { return it && it.s; }) ? 46 : 36), gap = o.gap || 24, x0 = x;
    if (o.label) { this.text(x, y + h / 2 + 5, o.label, { size: 14, weight: 800, color: "ink" }); x0 = x + (o.labelW || textW(o.label, 14, false, 800) + 22); }
    var total = (o.w || (W - M - x)) - (x0 - x), cnt = items.length, bw = (total - gap * (cnt - 1)) / cnt, self = this, boxes = [];
    items.forEach(function (it, i) {
      if (typeof it === "string") it = { t: it };
      var bx = x0 + i * (bw + gap);
      boxes.push(self.box(bx, y, bw, h, { tone: it.tone || o.tone || "gray", fill: it.fill || o.fill || "tone", title: it.t, sub: it.s, size: o.size || 13.5, subSize: 11.5, r: 8 }));
      if (i < cnt - 1) self.arrow(bx + bw + 3, y + h / 2, bx + bw + gap - 3, y + h / 2, { tone: "gray", width: 1.6, headSize: 7 });
    });
    return boxes;
  };

  /* 칩(둥근 꼬리표). o: tone solid size h → 폭 반환 */
  K.chip = function (x, y, text, o) {
    o = o || {};
    var size = o.size || 13, h = o.h || 26, w = o.w || textW(text, size, false, 700) + 24;
    var x0 = o.anchor === "middle" ? x - w / 2 : o.anchor === "end" ? x - w : x;
    this.o.push('<g class="' + tone(o.tone || "blue") + '"><rect class="dg-chip' + (o.solid ? " dg-chip--solid" : "") + '" x="' + n(x0) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + h + '" rx="' + h / 2 + '"/>' +
      textEl(x0 + w / 2, y + h / 2 + size * 0.36, text, { size: size, weight: 700, anchor: "middle", color: o.solid ? "on" : "tone" }) + "</g>");
    return w;
  };

  /* 글머리 목록(색 네모). items: 문자열 또는 {t, tone}. o: size tone lh → 높이 */
  K.bullets = function (x, y, w, items, o) {
    o = o || {};
    var size = o.size || 14, lh = o.lh || Math.round(size * 1.55), yy = y, self = this;
    items.forEach(function (it) {
      if (typeof it === "string") it = { t: it };
      self.o.push('<g class="' + tone(it.tone || o.tone || "blue") + '"><rect class="dg-dot" x="' + x + '" y="' + (yy - size * 0.62) + '" width="' + (size * 0.55) + '" height="' + (size * 0.55) + '" rx="1.5"/></g>');
      wrap(it.t, w - size * 1.2, size).forEach(function (l, i) {
        self.o.push(textEl(x + size * 1.05, yy, l, { size: size, color: it.color || "ink", weight: it.weight }));
        yy += lh;
      });
    });
    return yy - y;
  };

  /* 코드 상자. lines 배열. # 뒤는 주석색. o: size */
  K.code = function (x, y, w, h, lines, o) {
    o = o || {};
    var size = o.size || 12.5, lh = Math.round(size * 1.6), s = '<rect class="dg-code-bg" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"/>';
    lines.forEach(function (l, i) {
      var k = l.indexOf("#"), code = k >= 0 ? l.slice(0, k) : l, cm = k >= 0 ? l.slice(k) : "";
      s += '<text x="' + (x + 14) + '" y="' + (y + 22 + i * lh) + '" font-size="' + size + '" class="dg-mono dg-ink" xml:space="preserve">' + esc(code) +
        (cm ? '<tspan class="dg-muted">' + esc(cm) + "</tspan>" : "") + "</text>";
    });
    this.o.push(s);
    return this;
  };

  /* 수식 상자 (회색 바탕). o: size tone(글자색) align */
  K.formula = function (x, y, w, h, str, o) {
    o = o || {};
    this.o.push('<rect class="dg-code-bg" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="10"/>');
    var size = o.size || 17, ls = String(str).split("\n");
    var self = this, y0 = y + h / 2 - (ls.length - 1) * size * 0.7 + size * 0.36;
    ls.forEach(function (l, i) {
      self.o.push(textEl(o.align === "left" ? x + 18 : x + w / 2, y0 + i * size * 1.4, l, { size: size, weight: o.weight || 700, anchor: o.align === "left" ? "start" : "middle", color: o.tone ? "tone" : "ink", tone: o.tone, mono: o.mono, boldTone: true }));
    });
    return this;
  };

  /* 원. o: tone fill(mid|tone|solid|plain) label size stroke */
  K.circle = function (cx, cy, r, o) {
    o = o || {};
    var fl = o.fill || "mid";
    var cls = fl === "solid" ? "dg-shape dg-shape--solid" : fl === "tone" ? "dg-shape dg-shape--f" : fl === "plain" ? "dg-box dg-box--plain" : "dg-shape";
    this.o.push('<g class="' + tone(o.tone || "blue") + '"><circle class="' + cls + '" cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + r + '"/>' +
      (o.label != null ? textEl(cx, cy + (o.size || 13) * 0.36, o.label, { size: o.size || 13, weight: 700, anchor: "middle", color: fl === "solid" ? "on" : "ink" }) : "") + "</g>");
    return { cx: cx, cy: cy, r: r, l: [cx - r, cy], r_: [cx + r, cy], t: [cx, cy - r], b: [cx, cy + r] };
  };
  /* 사각형 도형 (글자 없음). o: tone fill(mid|tone|solid) r */
  K.rect = function (x, y, w, h, o) {
    o = o || {};
    var fl = o.fill || "mid";
    var cls = fl === "solid" ? "dg-shape dg-shape--solid" : fl === "tone" ? "dg-shape dg-shape--f" : fl === "none" ? "dg-stroke" : "dg-shape";
    this.o.push('<g class="' + tone(o.tone || "blue") + '"><rect class="' + cls + '" x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + (o.r || 0) + '"' + (o.opacity ? ' opacity="' + o.opacity + '"' : "") + "/></g>");
    return this;
  };
  /* 자유 경로. o: tone fill(none|mid|tone|solid) dash width */
  K.path = function (d, o) {
    o = o || {};
    var fl = o.fill || "none";
    var cls = fl === "none" ? "dg-stroke" : fl === "solid" ? "dg-shape dg-shape--solid" : fl === "tone" ? "dg-shape dg-shape--f" : "dg-shape";
    this.o.push('<g class="' + tone(o.tone || "blue") + '"><path class="' + cls + '" d="' + d + '" style="' + (o.width ? "stroke-width:" + o.width + ";" : "") + (o.dash ? "stroke-dasharray:" + o.dash + ";" : "") + '"' + (o.opacity ? ' opacity="' + o.opacity + '"' : "") + "/></g>");
    return this;
  };
  /* 축 (그래프용 회색 선) */
  K.axes = function (x, y, w, h, o) {
    o = o || {};
    this.o.push('<path class="dg-axis" d="M' + x + " " + y + " V" + (y + h) + " H" + (x + w) + '"/>');
    if (o.x) this.text(x + w, y + h + 18, o.x, { size: 12, anchor: "end", color: "muted" });
    if (o.y) this.text(x - 6, y - 8, o.y, { size: 12, color: "muted" });
    return this;
  };
  /* 막대그래프. values 배열. o: labels tones(배열 또는 톤) max fmt barW gap size */
  K.bars = function (x, y, w, h, values, o) {
    o = o || {};
    var max = o.max || Math.max.apply(null, values.map(Math.abs)) || 1, cnt = values.length;
    var gap = o.gap == null ? 10 : o.gap, bw = o.barW || (w - gap * (cnt + 1)) / cnt, self = this;
    this.axes(x, y, w, h);
    values.forEach(function (v, i) {
      var bh = Math.abs(v) / max * (h - 22), bx = x + gap + i * (bw + gap);
      var tn = Array.isArray(o.tones) ? o.tones[i] : (o.tones || o.tone || "blue");
      self.rect(bx, y + h - bh, bw, bh, { tone: tn, fill: o.fill || "solid", r: 3 });
      self.text(bx + bw / 2, y + h - bh - 6, o.fmt ? o.fmt(v) : v, { size: o.size || 12, weight: 700, anchor: "middle", tone: tn });
      if (o.labels) self.text(bx + bw / 2, y + h + 17, o.labels[i], { size: o.labelSize || 11.5, anchor: "middle", color: "muted" });
    });
    return this;
  };

  /* ------------------------------------------------------------------
     등록 · 그리기
     def: { id, sim, order, title, sub, label(오른쪽 위 분류 이름), badge(선택: "E1" 같은 짧은 표식), draw(k) }
     ------------------------------------------------------------------ */
  function register(def) {
    if (!def || !def.id || !def.sim || typeof def.draw !== "function") return;
    for (var i = 0; i < REG.length; i++) if (REG[i].id === def.id) { REG[i] = def; return; }
    REG.push(def);
  }
  function forSim(sim) {
    return REG.filter(function (d) { return d.sim === sim; }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }
  function render(def) {
    var k = new Kit();
    var label = def.label || "", badge = def.badge || "";
    var labelW = label ? textW(label, 34, false, 700) : 0;
    var tx = M + (badge ? textW(badge, 20, false, 800) + 44 : 0);
    var avail = W - M - tx - (label ? labelW + 34 : 0);
    var ts = 30;
    while (ts > 20 && textW(def.title || "", ts, false, 800) > avail) ts -= 1;
    var s = '<rect class="dg-bg" x="0" y="0" width="' + W + '" height="' + H + '"/>';
    if (badge) {
      var bw = textW(badge, 20, false, 800) + 30;
      s += '<rect class="dg-badge" x="' + M + '" y="34" width="' + bw + '" height="40" rx="7"/>' + textEl(M + bw / 2, 61, badge, { size: 20, weight: 800, anchor: "middle" }).replace("<text ", '<text class="dg-badge-t" ');
    }
    s += '<text x="' + tx + '" y="66" font-size="' + ts + '" class="dg-title">' + rich(def.title || "") + "</text>";
    if (def.sub) s += textEl(tx, 96, def.sub, { size: 15, color: "muted" });
    if (label) s += '<text x="' + (W - M) + '" y="66" font-size="34" text-anchor="end" class="dg-label">' + esc(label) + "</text>";
    s += '<line class="dg-rule" x1="' + M + '" y1="114" x2="' + (W - M) + '" y2="114"/>';
    try { def.draw(k); } catch (e) { k.o.push(textEl(W / 2, H / 2, "도식을 그리는 중 오류: " + e.message, { size: 16, anchor: "middle", tone: "red" })); if (window.console) console.error(e); }
    var aria = (def.title || "") + (def.sub ? " — " + def.sub : "");
    return '<svg class="dg-svg" viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(aria) + '">' + s + k.o.join("") + "</svg>";
  }

  /* PNG 저장: 계산된 색을 인라인으로 박아 2배 해상도로 */
  var PROPS = ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "font-family", "font-size", "font-weight", "font-style", "letter-spacing", "text-anchor"];
  function savePng(svgEl, name) {
    var clone = svgEl.cloneNode(true), src = svgEl.querySelectorAll("*"), dst = clone.querySelectorAll("*");
    for (var i = 0; i < src.length; i++) {
      var cs = getComputedStyle(src[i]), st = "";
      PROPS.forEach(function (p) { var v = cs.getPropertyValue(p); if (v) st += p + ":" + v + ";"; });
      dst[i].setAttribute("style", st);
      dst[i].removeAttribute("class");
    }
    clone.setAttribute("width", W * 2); clone.setAttribute("height", H * 2);
    var xml = new XMLSerializer().serializeToString(clone);
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas"); c.width = W * 2; c.height = H * 2;
      var g = c.getContext("2d"); g.drawImage(img, 0, 0, W * 2, H * 2);
      c.toBlob(function (b) {
        if (!b) return;
        var a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name + ".png";
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      }, "image/png");
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  }
  function fullscreen(el) {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
  }

  var ICON = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    png: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    all: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>'
  };

  /* 뷰어 붙이기. opts: gallery(모음 페이지 링크, 기본 자동) */
  function mount(el, sim, opts) {
    opts = opts || {};
    var defs = forSim(sim);
    if (!defs.length) { el.innerHTML = '<div class="dgv__empty">이 시뮬레이터의 구성도가 아직 없습니다.</div>'; return; }
    var gallery = opts.gallery;
    if (gallery == null) gallery = /\/simulators\/[^/]+\//.test(location.pathname) ? "../../diagrams.html#" + sim : "diagrams.html#" + sim;
    var cur = 0, multi = defs.length > 1;
    el.classList.add("dgv");
    el.innerHTML =
      '<div class="dgv__bar">' +
        (multi ? '<div class="dgv__list" role="group" aria-label="구성도 선택">' + defs.map(function (d, i) {
          return '<button type="button" class="dgv__pick" data-i="' + i + '" aria-pressed="false" title="' + esc(d.title) + '">' + (i + 1) + ". " + esc(d.short || d.title) + "</button>";
        }).join("") + "</div>" : '<div class="dgv__list"></div>') +
        '<div class="dgv__tools">' +
          (multi ? '<button type="button" class="dgv__btn" data-act="prev" aria-label="이전 구성도">' + ICON.prev + '</button><button type="button" class="dgv__btn" data-act="next" aria-label="다음 구성도">' + ICON.next + "</button>" : "") +
          '<button type="button" class="dgv__btn" data-act="full">' + ICON.full + "전체 화면</button>" +
          '<button type="button" class="dgv__btn" data-act="png">' + ICON.png + "PNG 저장</button>" +
          (gallery ? '<a class="dgv__btn" href="' + esc(gallery) + '">' + ICON.all + "구성도 모음</a>" : "") +
        "</div>" +
      "</div>" +
      '<div class="dgv__stage" tabindex="0" aria-label="알고리즘 구성도"></div>' +
      '<div class="dgv__meta"><span class="dgv__count"></span><span class="dgv__hint dgv__hint--mobile">좁은 화면에서는 도식을 옆으로 밀어 보거나 [전체 화면]을 누르세요.</span></div>';
    var stage = el.querySelector(".dgv__stage"), count = el.querySelector(".dgv__count");
    function show(i) {
      cur = (i + defs.length) % defs.length;
      stage.innerHTML = render(defs[cur]);
      stage.scrollLeft = 0;
      el.querySelectorAll(".dgv__pick").forEach(function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-i") === cur ? "true" : "false"); });
      count.innerHTML = "<b>" + (cur + 1) + " / " + defs.length + "</b> · " + esc(defs[cur].title);
    }
    el.addEventListener("click", function (e) {
      var p = e.target.closest(".dgv__pick"); if (p) { show(+p.getAttribute("data-i")); return; }
      var b = e.target.closest("[data-act]"); if (!b) return;
      var a = b.getAttribute("data-act");
      if (a === "prev") show(cur - 1);
      else if (a === "next") show(cur + 1);
      else if (a === "full") fullscreen(stage);
      else if (a === "png") savePng(stage.querySelector("svg"), defs[cur].id);
    });
    show(0);
    return { show: show };
  }
  function autoMount() {
    document.querySelectorAll("[data-ds-diagrams]").forEach(function (el) {
      if (el.getAttribute("data-dg-mounted")) return;
      el.setAttribute("data-dg-mounted", "1");
      mount(el, el.getAttribute("data-ds-diagrams"));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoMount); else setTimeout(autoMount, 0);

  window.DSDiagram = { register: register, forSim: forSim, render: render, mount: mount, savePng: savePng, fullscreen: fullscreen, Kit: Kit, W: W, H: H, ICON: ICON };
})();
