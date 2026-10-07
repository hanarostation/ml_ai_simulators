/* =====================================================================
   강화학습 공통 도구 (rl-kit.js) — 강화학습 분류 시뮬레이터가 함께 쓰는 순수 JS 모듈
   - RL.rng(seed)           : 재현 가능한 난수 (uniform · normal · int · choice · shuffle)
   - 환경                    : FrozenLake · CliffWalking · GridWorld(직접 정의) · CartPole · Pendulum
                               (Gymnasium과 같은 규칙·보상, 단 격자 행동 순서는 모든 격자 환경에서 0↑ 1→ 2↓ 3←)
   - RL.MLP / RL.Adam       : 작은 다층 퍼셉트론(역전파 직접 구현)과 Adam
   - 그리기                  : RL.drawGrid · RL.drawCartPole · RL.drawPendulum · RL.lineChart
   모든 그리기 함수는 CSS 변수에서 색을 읽으므로 테마가 바뀌면 다시 호출하면 된다.
   ===================================================================== */
(function () {
  "use strict";
  var RL = {};

  /* ---------------- 난수 ---------------- */
  RL.rng = function (seed) {
    var a = (seed >>> 0) || 1, spare = null;
    function u() { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    var r = {
      random: u,
      uniform: function (lo, hi) { return lo + (hi - lo) * u(); },
      int: function (n) { return Math.floor(u() * n); },
      normal: function (mu, sd) {
        if (spare !== null) { var s = spare; spare = null; return (mu || 0) + (sd == null ? 1 : sd) * s; }
        var x, y, q; do { x = 2 * u() - 1; y = 2 * u() - 1; q = x * x + y * y; } while (q >= 1 || q === 0);
        var m = Math.sqrt(-2 * Math.log(q) / q); spare = y * m; return (mu || 0) + (sd == null ? 1 : sd) * x * m;
      },
      choice: function (probs) { var x = u(), c = 0; for (var i = 0; i < probs.length; i++) { c += probs[i]; if (x < c) return i; } return probs.length - 1; },
      shuffle: function (arr) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(u() * (i + 1)), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; },
      beta: function (al, be) { var x = r.gamma(al), y = r.gamma(be); return x / (x + y); },
      gamma: function (k) { /* Marsaglia–Tsang */
        if (k < 1) return r.gamma(1 + k) * Math.pow(u(), 1 / k);
        var d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
        for (;;) { var x, v; do { x = r.normal(); v = 1 + c * x; } while (v <= 0); v = v * v * v; var uu = u();
          if (uu < 1 - 0.0331 * x * x * x * x || Math.log(uu) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v; }
      }
    };
    return r;
  };
  RL.argmax = function (arr, rng) {
    var best = -Infinity, idx = [];
    for (var i = 0; i < arr.length; i++) { if (arr[i] > best + 1e-12) { best = arr[i]; idx = [i]; } else if (Math.abs(arr[i] - best) <= 1e-12) idx.push(i); }
    return idx.length === 1 || !rng ? idx[0] : idx[rng.int(idx.length)];
  };
  RL.softmax = function (z, temp) {
    temp = temp || 1; var m = Math.max.apply(null, z), e = z.map(function (v) { return Math.exp((v - m) / temp); }), s = e.reduce(function (a, b) { return a + b; }, 0);
    return e.map(function (v) { return v / s; });
  };
  RL.movingAvg = function (arr, w) { var out = [], s = 0; for (var i = 0; i < arr.length; i++) { s += arr[i]; if (i >= w) s -= arr[i - w]; out.push(s / Math.min(i + 1, w)); } return out; };

  /* ---------------- 격자 환경 ---------------- */
  /* 행동: 0 ↑, 1 →, 2 ↓, 3 ← (모든 격자 환경 공통) */
  var DR = [-1, 0, 1, 0], DC = [0, 1, 0, -1];
  RL.ACTIONS = ["↑", "→", "↓", "←"];
  RL.ACTION_NAMES = ["위", "오른쪽", "아래", "왼쪽"];

  /* 공통 격자 환경. spec: { rows, cols, start, goals:{idx:reward}, holes:[idx](종료·보상 hole), walls:[idx], cliff:[idx](→ 시작으로, 보상 cliffR),
     stepR(기본 0), slip(0~1, 의도한 방향 대신 옆 방향으로 미끄러질 확률 총합), name, kind } */
  function GridEnv(spec) {
    var e = this;
    e.name = spec.name || "GridWorld"; e.kind = spec.kind || "grid";
    e.rows = spec.rows; e.cols = spec.cols; e.nS = e.rows * e.cols; e.nA = 4;
    e.start = spec.start || 0;
    e.goals = spec.goals || {}; e.holes = spec.holes || []; e.walls = spec.walls || []; e.cliff = spec.cliff || [];
    e.stepR = spec.stepR || 0; e.holeR = spec.holeR || 0; e.cliffR = spec.cliffR == null ? -100 : spec.cliffR;
    e.slip = spec.slip || 0; e.gymSlippery = !!spec.gymSlippery; e.maxSteps = spec.maxSteps || 200;
    e.desc = spec.desc || null;
    e.terminal = {}; Object.keys(e.goals).forEach(function (k) { e.terminal[k] = true; }); e.holes.forEach(function (h) { e.terminal[h] = true; });
    /* 전이 모형 P[s][a] = [[확률, 다음 상태, 보상, 종료]] — 동적 계획법에서 그대로 사용 */
    e.P = [];
    for (var s = 0; s < e.nS; s++) {
      e.P.push([]);
      for (var a = 0; a < 4; a++) {
        var outs = [];
        if (e.terminal[s] || e.walls.indexOf(s) >= 0) outs.push([1, s, 0, true]);
        else {
          var dirs;
          if (e.gymSlippery) dirs = [[a, 1 / 3], [(a + 1) % 4, 1 / 3], [(a + 3) % 4, 1 / 3]];
          else if (e.slip > 0) dirs = [[a, 1 - e.slip], [(a + 1) % 4, e.slip / 2], [(a + 3) % 4, e.slip / 2]];
          else dirs = [[a, 1]];
          dirs.forEach(function (d) { outs.push(e._move(s, d[0]).concat()); outs[outs.length - 1].unshift(d[1]); });
        }
        /* 같은 결과 합치기 */
        var merged = [];
        outs.forEach(function (o) { var f = merged.filter(function (m) { return m[1] === o[1] && m[2] === o[2] && m[3] === o[3]; })[0]; if (f) f[0] += o[0]; else merged.push(o.slice()); });
        e.P[s].push(merged);
      }
    }
    e.s = e.start; e.t = 0;
  }
  GridEnv.prototype.rc = function (s) { return [Math.floor(s / this.cols), s % this.cols]; };
  GridEnv.prototype.idx = function (r, c) { return r * this.cols + c; };
  /* 결정적 이동: [다음 상태, 보상, 종료] */
  GridEnv.prototype._move = function (s, a) {
    var r = Math.floor(s / this.cols) + DR[a], c = s % this.cols + DC[a];
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) { r = Math.floor(s / this.cols); c = s % this.cols; }
    var n = r * this.cols + c;
    if (this.walls.indexOf(n) >= 0) n = s;
    if (this.cliff.indexOf(n) >= 0) return [this.start, this.cliffR, false];
    if (this.goals[n] != null) return [n, this.goals[n], true];
    if (this.holes.indexOf(n) >= 0) return [n, this.holeR, true];
    return [n, this.stepR, false];
  };
  GridEnv.prototype.reset = function () { this.s = this.start; this.t = 0; return this.s; };
  /* step(a, rng) → { s, r, done, truncated, fellCliff } */
  GridEnv.prototype.step = function (a, rng) {
    var outs = this.P[this.s][a], x = (rng ? rng.random() : Math.random()), c = 0, o = outs[outs.length - 1];
    for (var i = 0; i < outs.length; i++) { c += outs[i][0]; if (x < c) { o = outs[i]; break; } }
    var fell = this.cliff.length > 0 && o[2] === this.cliffR;
    this.s = o[1]; this.t++;
    var trunc = !o[3] && this.t >= this.maxSteps;
    return { s: o[1], r: o[2], done: o[3], truncated: trunc, fellCliff: !!fell };
  };
  GridEnv.prototype.cellType = function (s) {
    if (this.walls.indexOf(s) >= 0) return "wall";
    if (this.cliff.indexOf(s) >= 0) return "cliff";
    if (this.holes.indexOf(s) >= 0) return "hole";
    if (this.goals[s] != null) return "goal";
    if (s === this.start) return "start";
    return "free";
  };
  RL.GridEnv = GridEnv;

  /* FrozenLake (Gymnasium 지도 그대로). opts: { map:"4x4"|"8x8", slippery(true) }
     S 시작 · F 얼음 · H 구멍(종료, 보상 0) · G 목표(종료, 보상 1). 미끄러지면 의도 방향과 양옆 방향이 각각 1/3 */
  RL.MAPS = {
    "4x4": ["SFFF", "FHFH", "FFFH", "HFFG"],
    "8x8": ["SFFFFFFF", "FFFFFFFF", "FFFHFFFF", "FFFFFHFF", "FFFHFFFF", "FHHFFFHF", "FHFFHFHF", "FFFHFFFG"]
  };
  RL.FrozenLake = function (opts) {
    opts = opts || {};
    var desc = opts.desc || RL.MAPS[opts.map || "4x4"], rows = desc.length, cols = desc[0].length, holes = [], goals = {}, start = 0;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var ch = desc[r][c], i = r * cols + c;
      if (ch === "H") holes.push(i); else if (ch === "G") goals[i] = 1; else if (ch === "S") start = i;
    }
    return new GridEnv({ name: "FrozenLake " + rows + "×" + cols, kind: "frozenlake", rows: rows, cols: cols, start: start, holes: holes, goals: goals,
      gymSlippery: opts.slippery !== false, maxSteps: opts.maxSteps || (rows === 4 ? 100 : 200), desc: desc });
  };
  /* CliffWalking 4×12: 매 걸음 −1, 절벽에 떨어지면 −100 후 시작점으로(에피소드는 계속), 목표 도착 시 종료 */
  RL.CliffWalking = function (opts) {
    opts = opts || {};
    var rows = 4, cols = 12, cliff = [];
    for (var c = 1; c < 11; c++) cliff.push(3 * cols + c);
    var g = {}; g[3 * cols + 11] = -1;
    return new GridEnv({ name: "CliffWalking 4×12", kind: "cliff", rows: rows, cols: cols, start: 3 * cols, goals: g, cliff: cliff,
      stepR: -1, cliffR: -100, slip: opts.slip || 0, maxSteps: opts.maxSteps || 500 });
  };

  /* ---------------- CartPole-v1 (Gymnasium 물리식) ---------------- */
  function CartPole(rng) {
    this.g = 9.8; this.mc = 1.0; this.mp = 0.1; this.total = 1.1; this.len = 0.5; this.pml = 0.05; this.force = 10; this.tau = 0.02;
    this.thetaLim = 12 * 2 * Math.PI / 360; this.xLim = 2.4; this.maxSteps = 500; this.nA = 2; this.obsDim = 4;
    this.rng = rng || RL.rng(1); this.reset();
  }
  CartPole.prototype.reset = function () { var r = this.rng; this.state = [0, 0, 0, 0].map(function () { return r.uniform(-0.05, 0.05); }); this.t = 0; this.done = false; return this.state.slice(); };
  /* a: 0 왼쪽으로 밀기, 1 오른쪽으로 밀기 → { s, r(=1), done(넘어짐·이탈), truncated(500걸음) } */
  CartPole.prototype.step = function (a) {
    var x = this.state[0], xd = this.state[1], th = this.state[2], thd = this.state[3];
    var f = a === 1 ? this.force : -this.force, ct = Math.cos(th), st = Math.sin(th);
    var temp = (f + this.pml * thd * thd * st) / this.total;
    var thacc = (this.g * st - ct * temp) / (this.len * (4 / 3 - this.mp * ct * ct / this.total));
    var xacc = temp - this.pml * thacc * ct / this.total;
    x += this.tau * xd; xd += this.tau * xacc; th += this.tau * thd; thd += this.tau * thacc;
    this.state = [x, xd, th, thd]; this.t++;
    var done = x < -this.xLim || x > this.xLim || th < -this.thetaLim || th > this.thetaLim;
    var trunc = !done && this.t >= this.maxSteps;
    this.done = done || trunc;
    return { s: this.state.slice(), r: 1, done: done, truncated: trunc };
  };
  RL.CartPole = CartPole;

  /* ---------------- Pendulum-v1 (Gymnasium 물리식) ---------------- */
  function Pendulum(rng) {
    this.maxSpeed = 8; this.maxTorque = 2; this.dt = 0.05; this.g = 10; this.m = 1; this.l = 1; this.maxSteps = 200; this.obsDim = 3; this.actDim = 1;
    this.rng = rng || RL.rng(1); this.reset();
  }
  function angNorm(x) { return ((x + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; }
  Pendulum.prototype.reset = function () { this.th = this.rng.uniform(-Math.PI, Math.PI); this.thd = this.rng.uniform(-1, 1); this.t = 0; this.lastU = 0; return this.obs(); };
  Pendulum.prototype.obs = function () { return [Math.cos(this.th), Math.sin(this.th), this.thd]; };
  /* u: 토크(−2~2) → { s, r, done(항상 false), truncated(200걸음) }. 보상 = −(θ² + 0.1·θ̇² + 0.001·u²) */
  Pendulum.prototype.step = function (u) {
    u = Math.max(-this.maxTorque, Math.min(this.maxTorque, u));
    var th = this.th, thd = this.thd;
    var cost = angNorm(th) * angNorm(th) + 0.1 * thd * thd + 0.001 * u * u;
    var nthd = thd + (3 * this.g / (2 * this.l) * Math.sin(th) + 3 / (this.m * this.l * this.l) * u) * this.dt;
    nthd = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, nthd));
    this.th = th + nthd * this.dt; this.thd = nthd; this.t++; this.lastU = u;
    return { s: this.obs(), r: -cost, done: false, truncated: this.t >= this.maxSteps };
  };
  Pendulum.angleNorm = angNorm;
  RL.Pendulum = Pendulum;

  /* ---------------- 다층 퍼셉트론 + Adam ---------------- */
  /* new RL.MLP([입력, 은닉…, 출력], { act:"relu"|"tanh", out:"linear"|"tanh"|"softmax", rng, init:"he"|"xavier" })
     forward(x) → { y, cache } / backward(cache, dy) 로 기울기 누적 / zeroGrad() / Adam 으로 갱신 */
  function MLP(sizes, opts) {
    opts = opts || {};
    var rng = opts.rng || RL.rng(7);
    this.sizes = sizes.slice(); this.act = opts.act || "relu"; this.out = opts.out || "linear";
    this.W = []; this.b = []; this.gW = []; this.gb = [];
    for (var l = 0; l < sizes.length - 1; l++) {
      var fanIn = sizes[l], fanOut = sizes[l + 1], n = fanIn * fanOut;
      var sd = (opts.init || (this.act === "relu" ? "he" : "xavier")) === "he" ? Math.sqrt(2 / fanIn) : Math.sqrt(2 / (fanIn + fanOut));
      if (l === sizes.length - 2 && opts.lastScale) sd *= opts.lastScale;
      var W = new Float64Array(n); for (var i = 0; i < n; i++) W[i] = rng.normal(0, sd);
      this.W.push(W); this.b.push(new Float64Array(fanOut)); this.gW.push(new Float64Array(n)); this.gb.push(new Float64Array(fanOut));
    }
  }
  MLP.prototype.forward = function (x) {
    var hs = [Float64Array.from(x)], zs = [], L = this.W.length;
    for (var l = 0; l < L; l++) {
      var inp = hs[l], nI = this.sizes[l], nO = this.sizes[l + 1], W = this.W[l], b = this.b[l], z = new Float64Array(nO);
      for (var j = 0; j < nO; j++) { var s = b[j]; for (var i = 0; i < nI; i++) s += inp[i] * W[i * nO + j]; z[j] = s; }
      zs.push(z);
      var h = new Float64Array(nO);
      if (l < L - 1) { for (j = 0; j < nO; j++) h[j] = this.act === "relu" ? (z[j] > 0 ? z[j] : 0) : Math.tanh(z[j]); }
      else if (this.out === "tanh") { for (j = 0; j < nO; j++) h[j] = Math.tanh(z[j]); }
      else if (this.out === "softmax") { var p = RL.softmax(Array.from(z)); for (j = 0; j < nO; j++) h[j] = p[j]; }
      else h = z;
      hs.push(h);
    }
    return { y: Array.from(hs[L]), cache: { hs: hs, zs: zs } };
  };
  MLP.prototype.predict = function (x) { return this.forward(x).y; };
  /* dy: 출력(활성 후)에 대한 손실 기울기. out="softmax" 일 때는 로짓에 대한 기울기(dL/dz)를 넘길 것 */
  MLP.prototype.backward = function (cache, dy) {
    var L = this.W.length, d = Float64Array.from(dy);
    if (this.out === "tanh") { var y = cache.hs[L]; for (var j = 0; j < d.length; j++) d[j] *= 1 - y[j] * y[j]; }
    for (var l = L - 1; l >= 0; l--) {
      var nI = this.sizes[l], nO = this.sizes[l + 1], inp = cache.hs[l], W = this.W[l], gW = this.gW[l], gb = this.gb[l];
      for (j = 0; j < nO; j++) { gb[j] += d[j]; for (var i = 0; i < nI; i++) gW[i * nO + j] += inp[i] * d[j]; }
      if (l > 0) {
        var dp = new Float64Array(nI), z = cache.zs[l - 1], h = cache.hs[l];
        for (i = 0; i < nI; i++) { var s = 0; for (j = 0; j < nO; j++) s += W[i * nO + j] * d[j]; dp[i] = this.act === "relu" ? (z[i] > 0 ? s : 0) : s * (1 - h[i] * h[i]); }
        d = dp;
      } else {
        var dx = new Float64Array(nI); for (i = 0; i < nI; i++) { s = 0; for (j = 0; j < nO; j++) s += W[i * nO + j] * d[j]; dx[i] = s; }
        return Array.from(dx); /* 입력에 대한 기울기 (DDPG 행동 기울기 등) */
      }
    }
  };
  MLP.prototype.zeroGrad = function () { this.gW.forEach(function (g) { g.fill(0); }); this.gb.forEach(function (g) { g.fill(0); }); };
  MLP.prototype.scaleGrad = function (k) { this.gW.forEach(function (g) { for (var i = 0; i < g.length; i++) g[i] *= k; }); this.gb.forEach(function (g) { for (var i = 0; i < g.length; i++) g[i] *= k; }); };
  MLP.prototype.gradNorm = function () { var s = 0; this.gW.concat(this.gb).forEach(function (g) { for (var i = 0; i < g.length; i++) s += g[i] * g[i]; }); return Math.sqrt(s); };
  MLP.prototype.clipGrad = function (maxNorm) { var n = this.gradNorm(); if (n > maxNorm) this.scaleGrad(maxNorm / n); return n; };
  MLP.prototype.copyFrom = function (o) { for (var l = 0; l < this.W.length; l++) { this.W[l].set(o.W[l]); this.b[l].set(o.b[l]); } return this; };
  MLP.prototype.softUpdate = function (o, tau) { for (var l = 0; l < this.W.length; l++) { var W = this.W[l], B = this.b[l], oW = o.W[l], oB = o.b[l], i; for (i = 0; i < W.length; i++) W[i] += tau * (oW[i] - W[i]); for (i = 0; i < B.length; i++) B[i] += tau * (oB[i] - B[i]); } return this; };
  MLP.prototype.clone = function () { var m = Object.create(MLP.prototype); m.sizes = this.sizes.slice(); m.act = this.act; m.out = this.out;
    m.W = this.W.map(function (w) { return Float64Array.from(w); }); m.b = this.b.map(function (w) { return Float64Array.from(w); });
    m.gW = this.gW.map(function (w) { return new Float64Array(w.length); }); m.gb = this.gb.map(function (w) { return new Float64Array(w.length); }); return m; };
  MLP.prototype.nParams = function () { var n = 0; for (var l = 0; l < this.W.length; l++) n += this.W[l].length + this.b[l].length; return n; };
  RL.MLP = MLP;

  function Adam(net, opts) {
    opts = opts || {}; this.net = net; this.lr = opts.lr || 1e-3; this.b1 = opts.b1 || 0.9; this.b2 = opts.b2 || 0.999; this.eps = opts.eps || 1e-8; this.t = 0;
    this.mW = net.W.map(function (w) { return new Float64Array(w.length); }); this.vW = net.W.map(function (w) { return new Float64Array(w.length); });
    this.mb = net.b.map(function (w) { return new Float64Array(w.length); }); this.vb = net.b.map(function (w) { return new Float64Array(w.length); });
  }
  /* 누적된 기울기로 한 번 갱신하고 기울기를 0으로 (scale: 기울기에 곱할 값, 예: 1/배치크기) */
  Adam.prototype.step = function (scale) {
    scale = scale == null ? 1 : scale; this.t++;
    var lr = this.lr * Math.sqrt(1 - Math.pow(this.b2, this.t)) / (1 - Math.pow(this.b1, this.t)), self = this;
    function upd(P, G, M, V) { for (var i = 0; i < P.length; i++) { var g = G[i] * scale; M[i] = self.b1 * M[i] + (1 - self.b1) * g; V[i] = self.b2 * V[i] + (1 - self.b2) * g * g; P[i] -= lr * M[i] / (Math.sqrt(V[i]) + self.eps); } }
    for (var l = 0; l < this.net.W.length; l++) { upd(this.net.W[l], this.net.gW[l], this.mW[l], this.vW[l]); upd(this.net.b[l], this.net.gb[l], this.mb[l], this.vb[l]); }
    this.net.zeroGrad();
  };
  RL.Adam = Adam;

  /* ---------------- 그리기 ---------------- */
  function css(name, fb) { var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fb; }
  RL.theme = function () {
    var dark = (document.documentElement.getAttribute("data-theme") === "dark") ||
      (document.documentElement.getAttribute("data-theme") !== "light" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    return {
      dark: dark, bg: css("--surface", "#fff"), bg2: css("--surface-2", "#EEF1F5"), ink: css("--ink", "#161B26"), text: css("--text", "#2B3342"),
      muted: css("--muted", "#5A6477"), faint: css("--faint", "#8A93A5"), line: css("--line", "#DCE1E8"), lineStrong: css("--line-strong", "#C3CAD5"),
      accent: css("--cat-rl", "#A16207"),
      blue: dark ? "#79A6F6" : "#2563EB", orange: dark ? "#F59A5C" : "#EA580C", green: dark ? "#5CCB82" : "#16A34A", red: dark ? "#F07A7A" : "#DC2626",
      purple: dark ? "#B597FF" : "#7C3AED", teal: dark ? "#45CFBF" : "#0D9488", amber: dark ? "#E3B455" : "#B7791F", gray: dark ? "#A3ACBD" : "#5B6578",
      ice: dark ? "#1C3347" : "#DCEEFB", hole: dark ? "#0B1220" : "#334155", cliff: dark ? "#4A1F1F" : "#F3C4C4", goal: dark ? "#245C38" : "#BBE5C8", wall: dark ? "#3B4454" : "#9AA2B1"
    };
  };
  /* 캔버스 크기를 CSS 크기 × devicePixelRatio 로 맞추고 2D 컨텍스트 반환 (w,h = CSS 픽셀) */
  RL.fitCanvas = function (cv, w, h) {
    var dpr = window.devicePixelRatio || 1;
    if (w) { cv.style.width = "100%"; cv.style.maxWidth = w + "px"; }
    var cw = cv.clientWidth || w || 300, ch = h ? cw * h / (w || cw) : (cv.clientHeight || 150);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr); cv.style.height = ch + "px";
    var g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g: g, w: cw, h: ch };
  };
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexRgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join(""); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  /* 값 → 색 (음수 빨강 · 0 배경 · 양수 파랑/초록) */
  RL.valueColor = function (v, vmax, th) {
    th = th || RL.theme(); var t = Math.max(-1, Math.min(1, vmax ? v / vmax : 0));
    var base = hexRgb(th.bg.indexOf("#") === 0 ? th.bg : "#ffffff"), pos = hexRgb(th.green), neg = hexRgb(th.red), c = t >= 0 ? pos : neg, k = Math.abs(t) * 0.75;
    return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(lerp(base[i], c[i], k)); }).join(",") + ")";
  };
  /* 격자 환경 그리기. opts: { V:[nS], Q:[[nS][4]], policy:[nS](행동 번호 또는 확률 배열), path:[상태…], agent:상태, visits:[nS],
       showValues(true), arrows(true), labels(셀 번호), highlight:{상태:색}, size(셀 픽셀) } */
  RL.drawGrid = function (cv, env, opts) {
    opts = opts || {};
    var th = RL.theme(), cell = opts.size || Math.min(64, Math.floor(((cv.parentNode && cv.parentNode.clientWidth) || 640) / env.cols));
    var W = env.cols * cell, H = env.rows * cell, f = RL.fitCanvas(cv, W, H), g = f.g, k = f.w / W;
    g.save(); g.scale(k, k); g.clearRect(0, 0, W, H);
    var V = opts.V || (opts.Q ? opts.Q.map(function (q) { return Math.max.apply(null, q); }) : null);
    var vmax = 0; if (V) V.forEach(function (v, s) { if (!env.terminal[s] && env.walls.indexOf(s) < 0) vmax = Math.max(vmax, Math.abs(v)); });
    var vmaxVis = 0; if (opts.visits) vmaxVis = Math.max.apply(null, opts.visits) || 1;
    for (var s = 0; s < env.nS; s++) {
      var rc = env.rc(s), x = rc[1] * cell, y = rc[0] * cell, t = env.cellType(s);
      var fill = th.bg;
      if (env.kind === "frozenlake") fill = th.ice;
      if (t === "hole") fill = th.hole; else if (t === "cliff") fill = th.cliff; else if (t === "goal") fill = th.goal; else if (t === "wall") fill = th.wall;
      else if (V && opts.showValues !== false && opts.heat !== false) fill = RL.valueColor(V[s], vmax, th);
      if (opts.visits && t !== "hole" && t !== "cliff" && t !== "wall") { g.fillStyle = fill; g.fillRect(x, y, cell, cell); g.globalAlpha = 0.55 * opts.visits[s] / vmaxVis; fill = th.accent; }
      g.fillStyle = fill; g.fillRect(x, y, cell, cell); g.globalAlpha = 1;
      if (opts.highlight && opts.highlight[s]) { g.fillStyle = opts.highlight[s]; g.globalAlpha = 0.35; g.fillRect(x, y, cell, cell); g.globalAlpha = 1; }
      g.strokeStyle = th.line; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      g.textAlign = "center"; g.textBaseline = "middle";
      var fs = Math.max(9, Math.round(cell * 0.2));
      if (t === "hole" || t === "goal" || t === "start" || t === "cliff") {
        g.fillStyle = t === "hole" ? "#E2E8F0" : th.ink; g.font = "700 " + fs + "px " + css("--sans", "sans-serif");
        var lab = t === "hole" ? "H" : t === "goal" ? "G" : t === "start" ? "S" : "";
        if (lab) g.fillText(lab, x + cell * 0.16, y + cell * 0.18);
      }
      if (V && opts.showValues !== false && !env.terminal[s] && t !== "wall") {
        g.fillStyle = th.text; g.font = "600 " + fs + "px " + css("--mono", "monospace");
        g.fillText(opts.fmt ? opts.fmt(V[s]) : (Math.abs(V[s]) >= 10 ? V[s].toFixed(0) : V[s].toFixed(2)), x + cell / 2, y + cell * 0.78);
      }
      if (opts.labels) { g.fillStyle = th.faint; g.font = Math.max(8, fs - 2) + "px " + css("--mono", "monospace"); g.textAlign = "right"; g.fillText(String(s), x + cell - 4, y + cell * 0.16); g.textAlign = "center"; }
      /* 정책 화살표 */
      var pol = opts.policy ? opts.policy[s] : (opts.Q && opts.arrows !== false ? RL.argmax(opts.Q[s]) : null);
      if (pol != null && !env.terminal[s] && t !== "wall" && t !== "cliff" && opts.arrows !== false) {
        var probs = Array.isArray(pol) ? pol : [0, 1, 2, 3].map(function (a) { return a === pol ? 1 : 0; });
        var cx = x + cell / 2, cy = y + cell * (V && opts.showValues !== false ? 0.42 : 0.5), L = cell * 0.3;
        for (var a = 0; a < 4; a++) {
          if (probs[a] < 0.05) continue;
          var dx = DC[a], dy = DR[a], len = L * Math.max(0.35, probs[a]);
          g.strokeStyle = th.ink; g.fillStyle = th.ink; g.globalAlpha = Math.max(0.35, probs[a]); g.lineWidth = Math.max(1.5, cell * 0.035);
          g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * len, cy + dy * len); g.stroke();
          var hx = cx + dx * len, hy = cy + dy * len, hs = cell * 0.08;
          g.beginPath(); g.moveTo(hx + dx * hs, hy + dy * hs); g.lineTo(hx - dy * hs * 0.8, hy + dx * hs * 0.8); g.lineTo(hx + dy * hs * 0.8, hy - dx * hs * 0.8); g.closePath(); g.fill();
          g.globalAlpha = 1;
        }
      }
    }
    /* 경로 */
    if (opts.path && opts.path.length > 1) {
      g.strokeStyle = opts.pathColor || th.orange; g.lineWidth = Math.max(2, cell * 0.06); g.lineJoin = "round"; g.globalAlpha = 0.9; g.beginPath();
      opts.path.forEach(function (st, i) { var p = env.rc(st), px = p[1] * cell + cell / 2, py = p[0] * cell + cell / 2; if (i) g.lineTo(px, py); else g.moveTo(px, py); });
      g.stroke(); g.globalAlpha = 1;
    }
    (opts.paths || []).forEach(function (pp) {
      if (!pp.path || pp.path.length < 2) return;
      g.strokeStyle = pp.color; g.lineWidth = Math.max(2, cell * 0.07); g.lineJoin = "round"; g.globalAlpha = 0.9; g.beginPath();
      var off = pp.offset || 0;
      pp.path.forEach(function (st, i) { var p = env.rc(st), px = p[1] * cell + cell / 2 + off, py = p[0] * cell + cell / 2 + off; if (i) g.lineTo(px, py); else g.moveTo(px, py); });
      g.stroke(); g.globalAlpha = 1;
    });
    if (opts.agent != null) {
      var ar = env.rc(opts.agent);
      g.fillStyle = th.accent; g.strokeStyle = th.bg; g.lineWidth = 2;
      g.beginPath(); g.arc(ar[1] * cell + cell / 2, ar[0] * cell + cell / 2, cell * 0.22, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    g.restore();
    return { cell: cell * k };
  };
  /* 캔버스 좌표 → 상태 번호 (클릭 처리용) */
  RL.gridHit = function (cv, env, ev) { var r = cv.getBoundingClientRect(), c = Math.floor((ev.clientX - r.left) / r.width * env.cols), rr = Math.floor((ev.clientY - r.top) / r.height * env.rows); return (c < 0 || rr < 0 || c >= env.cols || rr >= env.rows) ? -1 : rr * env.cols + c; };

  RL.drawCartPole = function (cv, state, opts) {
    opts = opts || {};
    var th = RL.theme(), f = RL.fitCanvas(cv, opts.w || 520, opts.h || 220), g = f.g, W = f.w, H = f.h;
    g.clearRect(0, 0, W, H); g.fillStyle = th.bg2; g.fillRect(0, 0, W, H);
    var scale = W / 5.6, cy = H * 0.72, cx = W / 2 + state[0] * scale;
    g.strokeStyle = th.lineStrong; g.lineWidth = 2; g.beginPath(); g.moveTo(0, cy + 14); g.lineTo(W, cy + 14); g.stroke();
    g.strokeStyle = th.red; g.setLineDash([5, 4]); [-2.4, 2.4].forEach(function (b) { var bx = W / 2 + b * scale; g.beginPath(); g.moveTo(bx, cy - 90); g.lineTo(bx, cy + 22); g.stroke(); }); g.setLineDash([]);
    g.fillStyle = th.ink; g.fillRect(cx - 30, cy - 10, 60, 24);
    var pl = 1.0 * scale * 0.9, px = cx + Math.sin(state[2]) * pl, py = cy - 10 - Math.cos(state[2]) * pl;
    g.strokeStyle = th.amber; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(cx, cy - 10); g.lineTo(px, py); g.stroke(); g.lineCap = "butt";
    g.fillStyle = th.bg; g.beginPath(); g.arc(cx, cy - 10, 4, 0, Math.PI * 2); g.fill();
    if (opts.action != null) { g.fillStyle = opts.action ? th.blue : th.orange; var dir = opts.action ? 1 : -1; g.beginPath(); g.moveTo(cx + dir * 46, cy + 2); g.lineTo(cx + dir * 34, cy - 6); g.lineTo(cx + dir * 34, cy + 10); g.closePath(); g.fill(); }
    if (opts.label) { g.fillStyle = th.muted; g.font = "600 12px " + css("--sans", "sans-serif"); g.textAlign = "left"; g.fillText(opts.label, 10, 18); }
  };
  RL.drawPendulum = function (cv, theta, opts) {
    opts = opts || {};
    var th = RL.theme(), f = RL.fitCanvas(cv, opts.w || 260, opts.h || 260), g = f.g, W = f.w, H = f.h;
    g.clearRect(0, 0, W, H); g.fillStyle = th.bg2; g.fillRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, L = Math.min(W, H) * 0.36;
    g.strokeStyle = th.line; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy - L - 10); g.stroke(); g.setLineDash([]);
    /* θ=0 이 위(목표). 화면 좌표: x = sinθ, y = −cosθ */
    var px = cx + Math.sin(theta) * L, py = cy - Math.cos(theta) * L;
    g.strokeStyle = th.amber; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(cx, cy); g.lineTo(px, py); g.stroke(); g.lineCap = "butt";
    g.fillStyle = th.ink; g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();
    if (opts.torque) { var u = opts.torque / 2; g.strokeStyle = u > 0 ? th.blue : th.orange; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 24, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 0.9, u < 0); g.stroke(); }
    if (opts.label) { g.fillStyle = th.muted; g.font = "600 12px " + css("--sans", "sans-serif"); g.textAlign = "left"; g.fillText(opts.label, 8, 16); }
  };
  /* 학습 곡선. series: [{ data:[…], color, label, smooth(이동평균 폭), dash }], opts: { w, h, ymin, ymax, xlabel, ylabel, hline } */
  RL.lineChart = function (cv, series, opts) {
    opts = opts || {};
    var th = RL.theme(), f = RL.fitCanvas(cv, opts.w || 560, opts.h || 220), g = f.g, W = f.w, H = f.h, pl = 46, pr = 12, pt = 14, pb = 28;
    g.clearRect(0, 0, W, H);
    var all = []; series.forEach(function (s) { all = all.concat(s.smooth ? RL.movingAvg(s.data, s.smooth) : s.data); });
    var n = Math.max.apply(null, series.map(function (s) { return s.data.length; }).concat([2]));
    var lo = opts.ymin != null ? opts.ymin : Math.min.apply(null, all.concat([0])), hi = opts.ymax != null ? opts.ymax : Math.max.apply(null, all.concat([1]));
    if (hi - lo < 1e-9) hi = lo + 1;
    function X(i) { return pl + (W - pl - pr) * i / Math.max(1, n - 1); } function Y(v) { return pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo)); }
    g.strokeStyle = th.line; g.lineWidth = 1; g.fillStyle = th.faint; g.font = "11px " + css("--mono", "monospace"); g.textAlign = "right";
    for (var k = 0; k <= 4; k++) { var v = lo + (hi - lo) * k / 4, yy = Y(v); g.beginPath(); g.moveTo(pl, yy); g.lineTo(W - pr, yy); g.stroke(); g.fillText(Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(Math.abs(v) >= 10 ? 1 : 2), pl - 6, yy + 4); }
    g.textAlign = "center"; g.fillText("0", X(0), H - 10); g.fillText(String(n - 1), X(n - 1), H - 10);
    if (opts.xlabel) g.fillText(opts.xlabel, (pl + W - pr) / 2, H - 10);
    if (opts.hline != null) { g.strokeStyle = th.faint; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(pl, Y(opts.hline)); g.lineTo(W - pr, Y(opts.hline)); g.stroke(); g.setLineDash([]); }
    series.forEach(function (s) {
      var d = s.smooth ? RL.movingAvg(s.data, s.smooth) : s.data; if (!d.length) return;
      if (s.smooth && s.raw !== false) { g.strokeStyle = s.color; g.globalAlpha = 0.18; g.lineWidth = 1; g.beginPath(); s.data.forEach(function (v, i) { if (i) g.lineTo(X(i), Y(v)); else g.moveTo(X(i), Y(v)); }); g.stroke(); g.globalAlpha = 1; }
      g.strokeStyle = s.color; g.lineWidth = s.width || 2; if (s.dash) g.setLineDash(s.dash);
      g.beginPath(); d.forEach(function (v, i) { if (i) g.lineTo(X(i), Y(v)); else g.moveTo(X(i), Y(v)); }); g.stroke(); g.setLineDash([]);
    });
    var lx = pl + 8; series.forEach(function (s) { if (!s.label) return; g.fillStyle = s.color; g.fillRect(lx, pt + 2, 10, 10); g.fillStyle = th.text; g.textAlign = "left"; g.font = "600 11.5px " + css("--sans", "sans-serif"); g.fillText(s.label, lx + 14, pt + 11); lx += 24 + g.measureText(s.label).width; });
  };
  /* 테마가 바뀌면 fn 다시 실행 */
  RL.onTheme = function (fn) {
    new MutationObserver(function () { fn(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn);
  };

  if (typeof module !== "undefined" && module.exports) module.exports = RL;
  else window.RL = RL;
})();
