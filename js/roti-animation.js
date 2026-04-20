/**
 * Bhopal Roti Services — Cinematic Roti Canvas Animation
 * Realistic floating, rotating chapatis with steam effects
 */

(function () {
  const canvas = document.getElementById('rotiCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, dpr, animId;
  let rotis = [];
  let steamParticles = [];
  let lastTime = 0;

  /* ── Resize ──────────────────────────────────────── */
  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
  }

  /* ── Roti class ──────────────────────────────────── */
  class Roti {
    constructor(index, total) {
      this.index = index;
      this.reset(true, total);
    }

    reset(init = false, total = 6) {
      /* Spread rotis across canvas with some bias toward right half (hero content left) */
      const zones = [
        { xMin: 0.42, xMax: 0.72, yMin: 0.08, yMax: 0.55 },
        { xMin: 0.60, xMax: 0.95, yMin: 0.10, yMax: 0.90 },
        { xMin: 0.30, xMax: 0.55, yMin: 0.50, yMax: 0.95 },
        { xMin: 0.68, xMax: 0.98, yMin: 0.55, yMax: 0.98 },
        { xMin: 0.50, xMax: 0.75, yMin: 0.65, yMax: 0.98 },
        { xMin: 0.80, xMax: 0.99, yMin: 0.05, yMax: 0.50 },
      ];
      const z = zones[this.index % zones.length];
      this.x = lerp(z.xMin, z.xMax, Math.random()) * W;
      this.y = init ? lerp(z.yMin, z.yMax, Math.random()) * H : H + 120;

      /* Size: big roti in foreground, smaller in back */
      this.baseRadius = 36 + Math.random() * 48;
      this.depth = 0.4 + Math.random() * 0.6; // pseudo-depth
      this.radius = this.baseRadius * this.depth;

      /* Motion */
      this.vy = -(0.15 + Math.random() * 0.25) * this.depth;
      this.vx = (Math.random() - 0.5) * 0.3 * this.depth;
      this.floatAmp   = 12 + Math.random() * 20;
      this.floatSpeed = 0.3 + Math.random() * 0.5;
      this.floatOffset = Math.random() * Math.PI * 2;

      /* Rotation — 3D-ish by squishing scaleY */
      this.rotAngle   = Math.random() * Math.PI * 2;
      this.rotSpeed   = (0.2 + Math.random() * 0.6) * (Math.random() < 0.5 ? 1 : -1);
      this.tiltAngle  = Math.random() * Math.PI * 2; // for scaleY wobble
      this.tiltSpeed  = this.rotSpeed * 0.5;

      /* Appearance */
      this.opacity  = 0;
      this.targetOp = this.depth * (0.55 + Math.random() * 0.4);
      this.color    = this.generateColor();
      this.charSpots = this.generateSpots();

      /* Steam */
      this.steamTimer = 0;
      this.steamInterval = 1.5 + Math.random() * 2;

      /* Time accumulator */
      this.t = Math.random() * 100;
    }

    generateColor() {
      const h = 28 + Math.random() * 16;  // warm tan range
      const s = 55 + Math.random() * 25;
      const l = 60 + Math.random() * 18;
      return { h, s, l };
    }

    generateSpots() {
      const spots = [];
      const count = 4 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const dist   = Math.random() * 0.75;
        const size   = 0.04 + Math.random() * 0.12;
        const dark   = Math.random();
        spots.push({ angle, dist, size, dark });
      }
      return spots;
    }

    update(dt) {
      this.t += dt;
      this.opacity += (this.targetOp - this.opacity) * 0.04;

      /* Float */
      const floatY = Math.sin(this.t * this.floatSpeed + this.floatOffset) * this.floatAmp;
      this.y += this.vy + (floatY - Math.sin((this.t - dt) * this.floatSpeed + this.floatOffset) * this.floatAmp);
      this.x += this.vx + Math.sin(this.t * 0.3 + this.index) * 0.08;

      /* Rotate */
      this.rotAngle  += this.rotSpeed  * dt * 0.6;
      this.tiltAngle += this.tiltSpeed * dt * 0.6;

      /* Steam */
      this.steamTimer += dt;
      if (this.steamTimer > this.steamInterval) {
        this.steamTimer = 0;
        this.spawnSteam();
      }

      /* Reset when off-screen top */
      if (this.y < -this.radius * 2) {
        this.reset(false);
      }
    }

    spawnSteam() {
      const count = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        steamParticles.push(new SteamParticle(
          this.x + (Math.random() - 0.5) * this.radius,
          this.y - this.radius * 0.6,
          this.depth
        ));
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);

      /* 3D tilt: oscillate scaleY to simulate perspective rotation */
      const scaleY = 0.28 + 0.72 * Math.abs(Math.cos(this.tiltAngle));
      ctx.rotate(this.rotAngle);
      ctx.scale(1, scaleY);
      ctx.globalAlpha = this.opacity;

      const r = this.radius;
      const { h, s, l } = this.color;

      /* === Outer shadow === */
      ctx.shadowColor = `hsla(${h - 10}, 70%, 30%, 0.5)`;
      ctx.shadowBlur  = r * 0.5;
      ctx.shadowOffsetY = r * 0.08;

      /* === Base roti body === */
      const baseGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.15, r * 0.05, 0, 0, r);
      baseGrad.addColorStop(0,   `hsl(${h + 8}, ${s - 10}%, ${l + 12}%)`);
      baseGrad.addColorStop(0.5, `hsl(${h}, ${s}%, ${l}%)`);
      baseGrad.addColorStop(0.85,`hsl(${h - 5}, ${s + 10}%, ${l - 10}%)`);
      baseGrad.addColorStop(1,   `hsl(${h - 10}, ${s + 15}%, ${l - 20}%)`);
      ctx.fillStyle = baseGrad;

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

      /* === Tawa char ring === */
      ctx.strokeStyle = `hsla(${h - 15}, 60%, 35%, 0.35)`;
      ctx.lineWidth = r * 0.06;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `hsla(${h - 15}, 60%, 35%, 0.2)`;
      ctx.lineWidth = r * 0.04;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      /* === Char spots === */
      for (const spot of this.charSpots) {
        const sx = Math.cos(spot.angle) * spot.dist * r * 0.9;
        const sy = Math.sin(spot.angle) * spot.dist * r * 0.9;
        const sr = spot.size * r;
        const spotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
        if (spot.dark > 0.5) {
          spotGrad.addColorStop(0, `hsla(${h - 20}, 70%, 28%, 0.7)`);
          spotGrad.addColorStop(1, `hsla(${h - 20}, 70%, 28%, 0)`);
        } else {
          spotGrad.addColorStop(0, `hsla(${h + 10}, 80%, 80%, 0.4)`);
          spotGrad.addColorStop(1, `hsla(${h + 10}, 80%, 80%, 0)`);
        }
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      /* === Sheen highlight === */
      const sheenGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 0, -r * 0.2, -r * 0.2, r * 0.65);
      sheenGrad.addColorStop(0, `hsla(${h + 15}, 60%, 92%, 0.22)`);
      sheenGrad.addColorStop(1, `hsla(${h}, 40%, 80%, 0)`);
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      /* === Edge crisp border === */
      ctx.strokeStyle = `hsla(${h - 8}, 50%, 40%, 0.25)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r - 0.75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }

  /* ── Steam particle ──────────────────────────────── */
  class SteamParticle {
    constructor(x, y, depth) {
      this.x = x;
      this.y = y;
      this.depth = depth;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(0.4 + Math.random() * 0.5) * depth;
      this.life = 1;
      this.decay = 0.012 + Math.random() * 0.015;
      this.size  = (3 + Math.random() * 5) * depth;
      this.wobble = Math.random() * Math.PI * 2;
    }

    update(dt) {
      this.wobble += dt * 2;
      this.x += this.vx + Math.sin(this.wobble) * 0.3;
      this.y += this.vy;
      this.life -= this.decay;
      this.size += 0.15;
    }

    draw() {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.life * 0.18;
      ctx.fillStyle = '#FFF8F0';
      ctx.filter = `blur(${this.size * 0.7}px)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ── Utility ─────────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ── Init ──────────────────────────────────────────── */
  function init() {
    rotis = [];
    const count = Math.min(8, Math.floor(W / 130));
    for (let i = 0; i < count; i++) {
      rotis.push(new Roti(i, count));
    }
  }

  /* ── Loop ──────────────────────────────────────────── */
  function loop(ts) {
    animId = requestAnimationFrame(loop);
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    ctx.clearRect(0, 0, W, H);

    /* Update & draw steam */
    for (let i = steamParticles.length - 1; i >= 0; i--) {
      const s = steamParticles[i];
      s.update(dt);
      if (s.life <= 0) { steamParticles.splice(i, 1); continue; }
      s.draw();
    }

    /* Sort rotis by depth (painter's algorithm) */
    rotis.sort((a, b) => a.depth - b.depth);

    for (const r of rotis) {
      r.update(dt);
      r.draw();
    }
  }

  /* ── Start ──────────────────────────────────────── */
  function start() {
    resize();
    init();
    requestAnimationFrame(ts => { lastTime = ts; loop(ts); });
  }

  /* ── Events ─────────────────────────────────────── */
  window.addEventListener('resize', () => {
    resize();
    rotis.forEach(r => { r.reset(true); });
  });

  /* Pause when not visible for perf */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      requestAnimationFrame(ts => { lastTime = ts; loop(ts); });
    }
  });

  start();
})();

