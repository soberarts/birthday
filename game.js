/* WASCHKÜCHE.SCR — screensaver that turns into a mouse-hunting game.
   Auto-starts after 60 s idle (attract mode) or via desktop icon. Close: X button or Esc. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ss = $('#screensaver'), arena = $('#ssArena'), banner = $('#ssBanner');
  if (!ss) return;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const R = () => window.RONI || {};
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  const LEVELS = [
    { name: 'VORWÄSCHE', mice: 1, hp: 5, speed: 3.4, size: 125 },
    { name: 'SCHLEUDERGANG', mice: 1, hp: 8, speed: 5.4, size: 110, socks: 4 },
    { name: 'TROCKNER-TELEPORT', mice: 2, hp: 5, speed: 4.8, size: 100, socks: 3, teleport: 1250 },
    { name: 'BOSS: WASCHKÜCHEN-MAFIA-MAUS', boss: true, hp: 36, speed: 3, size: 220, shoot: 1250 }
  ];
  const WEAPONS = {
    slipper: { dmg: 2, radius: 62, cooldown: 430, label: 'KLATSCH!' },
    laser: { dmg: 1, radius: 44, cooldown: 160, label: 'ZAPP!' }
  };
  const OUCH = ['AUA!', 'MEINE BRILLE!', 'ICH RUF DIE HAUSVERWALTUNG!', 'DAS SAG ICH RONI!', 'NICHT DIE FRISUR!', 'ICH HAB RECHTE!', 'HEY, ICH ZAHL… NEIN, ZAHL ICH NICHT.'];
  const SOCK_SVG = '<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M10 2h18v26c0 6 10 8 10 16 0 5-4 7-9 7H14C6 51 3 46 6 40l4-8z" fill="#f4eefa" stroke="#0b0710" stroke-width="2.5"/><path d="M10 9h18M10 15h18" stroke="#ff8fe0" stroke-width="3"/><circle cx="20" cy="35" r="2.5" fill="#b98cff"/></svg>';
  const PIN_SVG = '<svg viewBox="0 0 16 44" aria-hidden="true"><rect x="2" y="2" width="5" height="40" rx="2" fill="#d8c0a0" stroke="#0b0710" stroke-width="1.5"/><rect x="9" y="2" width="5" height="40" rx="2" fill="#c7ab86" stroke="#0b0710" stroke-width="1.5"/><rect x="1" y="18" width="14" height="6" rx="1" fill="#9aa0ad" stroke="#0b0710"/></svg>';
  const SLIPPER_SVG = '<svg viewBox="0 0 90 46" aria-hidden="true"><ellipse cx="45" cy="26" rx="42" ry="17" fill="#ff8fe0" stroke="#0b0710" stroke-width="3"/><path d="M45 12 Q70 4 82 22 Q68 30 45 30 Z" fill="#fff" opacity=".85" stroke="#0b0710" stroke-width="2"/><ellipse cx="30" cy="26" rx="14" ry="6" fill="#b98cff" opacity=".6"/></svg>';

  let open = false, state = 'off', level = 0, score = 0, lives = 3, weapon = 'slipper';
  let high = +store.get('roni.hs', 0) || 0;
  let ents = [], pins = [], raf = 0, prev = 0, lastShot = 0, px = -999, py = -999, timers = [], safeUntil = 0;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function hud() {
    $('#ssLevel').textContent = state === 'attract' ? 'ATTRACT MODE — TRIFF DIE MAUS' : state === 'won' ? 'WASCHKÜCHE BEFREIT' : `LEVEL ${level + 1} / ${LEVELS[level].name}`;
    $('#ssScore').textContent = 'SCORE ' + score;
    $('#ssHigh').textContent = 'HIGHSCORE ' + Math.max(high, score);
    $('#ssLives').textContent = 'LEBEN ' + '●'.repeat(Math.max(0, lives)) + '○'.repeat(Math.max(0, 3 - lives));
    const boss = ents.find(e => e.boss);
    $('#ssBoss').hidden = !boss;
    if (boss) $('#ssHp').style.transform = `scaleX(${Math.max(0, boss.hp / boss.maxHp)})`;
  }
  function showBanner(big, small, ms) {
    banner.innerHTML = '';
    const b = document.createElement('strong'); b.textContent = big; banner.appendChild(b);
    if (small) { const s = document.createElement('span'); s.textContent = small; banner.appendChild(s); }
    banner.classList.add('show');
    if (ms) later(() => banner.classList.remove('show'), ms);
  }
  function W() { return arena.clientWidth; } function H() { return arena.clientHeight; }

  function spawn(kind, opts) {
    const el = document.createElement('div');
    el.className = 'ss-ent ss-' + kind;
    const size = opts.size || 120;
    if (kind === 'sock') el.innerHTML = SOCK_SVG;
    else el.innerHTML = '<div class="ss-bob"><img alt="" src="techno-mouse.png" draggable="false"></div>' + (opts.hp > 1 && !opts.boss ? '<div class="ss-pips"></div>' : '');
    el.style.width = size + 'px';
    arena.appendChild(el);
    const ang = Math.random() * Math.PI * 2, sp = opts.speed || 2.5;
    const e = { el, kind, boss: !!opts.boss, size, w: size, h: kind === 'sock' ? size * 1.3 : size * 1.26, x: Math.random() * Math.max(1, W() - size), y: 40 + Math.random() * Math.max(1, H() - size * 1.4 - 40),
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, hp: opts.hp || 1, maxHp: opts.hp || 1, speed: sp, teleport: opts.teleport || 0, nextTp: performance.now() + (opts.teleport || 0), shoot: opts.shoot || 0, nextShot: performance.now() + 1800, hue: 0, dead: false };
    if (Math.abs(e.vx) < 0.8) e.vx = 0.8 * Math.sign(e.vx || 1);
    pips(e); ents.push(e); return e;
  }
  function pips(e) { const p = $('.ss-pips', e.el); if (p) p.textContent = '■'.repeat(Math.max(0, e.hp)); }

  function startLevel(i) {
    clearEnts(); level = i; state = 'play';
    const L = LEVELS[i];
    showBanner(`LEVEL ${i + 1}`, L.name, 1700);
    if (L.boss) {
      const b = spawn('mouse', { size: Math.min(L.size, W() * 0.42), hp: L.hp, speed: L.speed, boss: true, shoot: L.shoot });
      b.el.classList.add('ss-bossmouse');
      R().say && R().say('DIE MAFIA-MAUS IST DA. SIE HAT WÄSCHEKLAMMERN DABEI.');
    } else {
      for (let k = 0; k < L.mice; k++) spawn('mouse', { size: Math.min(L.size, W() * 0.3), hp: L.hp, speed: L.speed, teleport: L.teleport });
      for (let k = 0; k < (L.socks || 0); k++) spawn('sock', { size: 58, hp: 1, speed: L.speed * 0.8 });
    }
    hud();
  }
  function clearEnts() { ents.forEach(e => e.el.remove()); ents = []; pins.forEach(p => p.el.remove()); pins = []; }
  function attract() {
    clearEnts(); state = 'attract'; level = 0; score = 0; lives = 3;
    spawn('mouse', { size: 150, hp: 1, speed: 2.3 });
    showBanner('WASCHKÜCHE.SCR', 'TRIFF DIE MAUS ZUM STARTEN — [1] HAUSSCHUH / [2] LASER / X ODER ESC = ENDE');
    hud();
  }
  function gameOver() {
    state = 'over'; clearEnts(); saveHigh();
    showBanner('GAME OVER', `DIE MAUS ÜBERNIMMT DIE WASCHKÜCHE. SCORE ${score}. KLICK ZUM NOCHMAL.`);
    hud();
  }
  function win() {
    state = 'won'; clearEnts(); saveHigh();
    showBanner('WASCHKÜCHE BEFREIT!', `DIE MAUS ZAHLT JETZT MIETE. SCORE ${score}. KLICK FÜR NOCH EINE RUNDE.`);
    confettiBurst(); hud();
  }
  function saveHigh() { if (score > high) { high = score; store.set('roni.hs', high); R().say && R().say('NEUER HIGHSCORE: ' + high + '. DIE MAUS IST BEEINDRUCKT.'); } }

  function step(now) {
    raf = requestAnimationFrame(step);
    const dt = Math.min(3, (now - prev) / 16.7); prev = now;
    const w = W(), h = H(), top = 46;
    for (const e of ents) {
      if (e.dead) continue;
      if (e.teleport && now > e.nextTp) {
        e.nextTp = now + e.teleport * (0.7 + Math.random() * 0.6);
        e.el.animate([{ opacity: 1, scale: '1' }, { opacity: 0, scale: '.2' }, { opacity: 1, scale: '1' }], { duration: 360 });
        later(() => { e.x = Math.random() * (w - e.w); e.y = top + Math.random() * (h - e.h - top); }, 180);
      }
      if (e.boss && state === 'play' && now > e.nextShot) {
        const rage = e.hp < e.maxHp / 2;
        e.nextShot = now + e.shoot * (rage ? 0.8 : 1) * (0.8 + Math.random() * 0.4);
        shootPin(e); if (rage && Math.random() < 0.5) later(() => !e.dead && shootPin(e), 260);
      }
      const sp = e.boss && e.hp < e.maxHp / 2 ? 1.6 : 1;
      e.x += e.vx * dt * sp; e.y += e.vy * dt * sp;
      let hit = false;
      if (e.x <= 0) { e.x = 0; e.vx = Math.abs(e.vx); hit = true; } else if (e.x + e.w >= w) { e.x = w - e.w; e.vx = -Math.abs(e.vx); hit = true; }
      if (e.y <= top) { e.y = top; e.vy = Math.abs(e.vy); hit = true; } else if (e.y + e.h >= h) { e.y = h - e.h; e.vy = -Math.abs(e.vy); hit = true; }
      if (hit && e.kind === 'mouse') { e.hue = (e.hue + 67) % 360; $('img', e.el).style.filter = `hue-rotate(${e.hue}deg) drop-shadow(0 0 22px #b98cff88)`; }
      e.el.style.transform = `translate(${e.x}px,${e.y}px) scaleX(${e.vx < 0 ? -1 : 1})`;
    }
    for (const p of pins) {
      if (p.dead) continue;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += 14 * dt;
      p.el.style.transform = `translate(${p.x - 8}px,${p.y - 22}px) rotate(${p.rot}deg)`;
      if (Math.hypot(p.x - px, p.y - py) < 26 && now > safeUntil) { p.dead = true; p.el.remove(); hurt(); }
      else if (p.x < -60 || p.y < -60 || p.x > w + 60 || p.y > h + 60) { p.dead = true; p.el.remove(); }
    }
    pins = pins.filter(p => !p.dead);
  }
  function shootPin(e) {
    if (px < 0) return;
    const el = document.createElement('div'); el.className = 'ss-pin'; el.innerHTML = PIN_SVG; arena.appendChild(el);
    let cx = e.x + e.w / 2, cy = e.y + e.h * 0.45;
    if (Math.hypot(px - cx, py - cy) < 220) { // too close for a fair shot: an accomplice throws from the screen edge
      const side = Math.floor(Math.random() * 4), w = W(), h = H();
      cx = side === 0 ? -20 : side === 1 ? w + 20 : Math.random() * w; cy = side === 2 ? -20 : side === 3 ? h + 20 : Math.random() * h;
    }
    const d = Math.hypot(px - cx, py - cy) || 1, sp = 4.1;
    pins.push({ el, x: cx, y: cy, vx: (px - cx) / d * sp, vy: (py - cy) / d * sp, rot: 0, dead: false });
  }
  function hurt() {
    lives--; safeUntil = performance.now() + 1800; hud();
    ss.animate([{ boxShadow: 'inset 0 0 0 0 #ff2a6d00' }, { boxShadow: 'inset 0 0 120px 30px #ff2a6dcc' }, { boxShadow: 'inset 0 0 0 0 #ff2a6d00' }], { duration: 450 });
    arena.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-10px,6px)' }, { transform: 'translate(8px,-6px)' }, { transform: 'translate(0,0)' }], { duration: 260 });
    floatText(px, py - 30, 'WÄSCHEKLAMMER!', 'bad');
    if (lives <= 0) gameOver();
  }

  function fire(x, y) {
    const now = performance.now(), wpn = WEAPONS[weapon];
    if (now - lastShot < wpn.cooldown) return;
    lastShot = now;
    if (weapon === 'slipper') slipperFx(x, y); else laserFx(x, y);
    if (state === 'over' || state === 'won') { attractToPlay(); return; }
    const pin = pins.find(p => !p.dead && Math.hypot(p.x - x, p.y - y) < wpn.radius * 0.6 + 18);
    if (pin) { pin.dead = true; pin.el.remove(); score += 50; floatText(x, y, 'KLAMMER ABGEWEHRT +50', 'good'); hud(); return; }
    let target = null;
    for (let i = ents.length - 1; i >= 0; i--) {
      const e = ents[i]; if (e.dead) continue;
      const cx = e.x + e.w / 2, cy = e.y + e.h / 2, r = Math.min(e.w, e.h) * 0.45 + wpn.radius * 0.6;
      if (Math.hypot(x - cx, y - cy) < r) { target = e; break; }
    }
    if (!target) { if (Math.random() < 0.3) floatText(x, y, 'DANEBEN', 'miss'); return; }
    if (target.kind === 'sock') {
      score = Math.max(0, score - 150); floatText(x, y, 'DAS WAR EINE SOCKE. -150', 'bad');
      target.vx *= -1.2; target.vy *= -1.2; hud(); return;
    }
    if (state === 'attract') { startLevel(0); score += 100; floatText(x, y, 'LOS GEHT’S!', 'good'); hud(); return; }
    target.hp -= wpn.dmg; pips(target);
    score += 100 * (level + 1);
    floatText(x, y, wpn.label + ' +' + 100 * (level + 1), 'good');
    if (Math.random() < 0.35) floatText(target.x + target.w / 2, target.y - 10, OUCH[Math.floor(Math.random() * OUCH.length)], 'ouch');
    const img = $('img', target.el);
    img.animate([{ filter: 'brightness(3) saturate(0)' }, { filter: 'none' }], { duration: 160 });
    target.el.animate([{ translate: '0 0' }, { translate: '6px -4px' }, { translate: '-5px 3px' }, { translate: '0 0' }], { duration: 180 });
    const a = Math.random() * Math.PI * 2; target.vx = Math.cos(a) * target.speed * 1.25; target.vy = Math.sin(a) * target.speed * 1.25;
    if (target.hp <= 0) kill(target);
    hud();
  }
  function kill(e) {
    e.dead = true; score += e.boss ? 5000 : 500;
    floatText(e.x + e.w / 2, e.y, e.boss ? 'BOSS BESIEGT! +5000' : 'MAUS RAUSGEWORFEN! +500', 'good');
    e.el.animate([{ opacity: 1, rotate: '0deg', scale: '1' }, { opacity: 0, rotate: '720deg', scale: '.1' }], { duration: 700, easing: 'ease-in', fill: 'forwards' }).finished.then(() => e.el.remove());
    ents = ents.filter(x => x !== e);
    if (!ents.some(x => x.kind === 'mouse')) {
      if (level >= LEVELS.length - 1) later(win, 800);
      else { const next = level + 1; showBanner(`LEVEL ${level + 1} GESCHAFFT`, 'DIE MAUS RUFT VERSTÄRKUNG…', 1500); state = 'between'; later(() => { if (open) startLevel(next); }, 1700); }
    }
  }
  function attractToPlay() { score = 0; lives = 3; startLevel(0); }

  function floatText(x, y, txt, kind) {
    const el = document.createElement('div'); el.className = 'ss-float ' + (kind || ''); el.textContent = txt;
    el.style.left = x + 'px'; el.style.top = y + 'px'; arena.appendChild(el);
    el.animate([{ opacity: 1, transform: 'translate(-50%,0) scale(.8)' }, { opacity: 1, transform: 'translate(-50%,-30px) scale(1.1)', offset: 0.3 }, { opacity: 0, transform: 'translate(-50%,-70px) scale(1)' }], { duration: 1100, easing: 'ease-out', fill: 'forwards' }).finished.then(() => el.remove());
  }
  function slipperFx(x, y) {
    const el = document.createElement('div'); el.className = 'ss-slap'; el.innerHTML = SLIPPER_SVG;
    el.style.left = x + 'px'; el.style.top = y + 'px'; arena.appendChild(el);
    el.animate([{ transform: 'translate(-20%,-90%) rotate(-70deg) scale(1.2)', opacity: 1 }, { transform: 'translate(-50%,-50%) rotate(8deg) scale(1)', opacity: 1, offset: 0.45 }, { transform: 'translate(-50%,-50%) rotate(0) scale(1)', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished.then(() => el.remove());
    const ring = document.createElement('div'); ring.className = 'ss-ring'; ring.style.left = x + 'px'; ring.style.top = y + 'px'; arena.appendChild(ring);
    ring.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0.9 }, { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0 }], { duration: 380 }).finished.then(() => ring.remove());
  }
  function laserFx(x, y) {
    const w = W(), h = H();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ss-laser'); svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `<line x1="${w / 2}" y1="${h + 10}" x2="${x}" y2="${y}" stroke="#ff5fcf" stroke-width="9" stroke-linecap="round" opacity=".45"/><line x1="${w / 2}" y1="${h + 10}" x2="${x}" y2="${y}" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="16" fill="#ffd1f3" opacity=".8"/>`;
    arena.appendChild(svg);
    svg.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }).finished.then(() => svg.remove());
  }
  function confettiBurst() {
    for (let i = 0; i < 90; i++) {
      const c = document.createElement('i'); c.className = 'ss-confetti';
      c.style.left = Math.random() * 100 + '%'; c.style.background = ['#fff', '#ff8fe0', '#b98cff', '#ffd27a', '#cfc8dc'][i % 5];
      arena.appendChild(c);
      c.animate([{ transform: `translateY(-40px) rotate(0)` }, { transform: `translateY(${H() + 60}px) rotate(${720 + Math.random() * 720}deg)` }], { duration: 1800 + Math.random() * 1800, delay: Math.random() * 600, easing: 'cubic-bezier(.3,.6,.6,1)', fill: 'forwards' }).finished.then(() => c.remove());
    }
  }

  function setWeapon(w) {
    weapon = w; ss.dataset.weapon = w;
    $$('.ss-weapons button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.weapon === w)));
  }
  function openGame(auto) {
    if (open) return;
    open = true; ss.classList.remove('hidden'); ss.setAttribute('aria-hidden', 'false');
    prev = performance.now(); raf = requestAnimationFrame(step);
    if (auto) attract(); else { score = 0; lives = 3; attract(); }
    $('#ssClose').focus({ preventScroll: true });
  }
  function closeGame() {
    if (!open) return;
    open = false; cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = [];
    saveHigh(); clearEnts(); banner.classList.remove('show');
    ss.classList.add('hidden'); ss.setAttribute('aria-hidden', 'true'); state = 'off';
    resetIdle();
  }

  arena.addEventListener('pointerdown', e => { if (!open) return; const r = arena.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; fire(px, py); });
  ss.addEventListener('pointermove', e => { const r = arena.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; }, { passive: true });
  $('#ssClose').addEventListener('click', closeGame);
  $$('.ss-weapons button').forEach(b => b.addEventListener('click', () => setWeapon(b.dataset.weapon)));
  document.addEventListener('keydown', e => {
    if (!open) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeGame(); }
    else if (e.key === '1') setWeapon('slipper');
    else if (e.key === '2') setWeapon('laser');
  }, true);
  document.addEventListener('roni:beat', ev => {
    if (!open || reduced) return;
    const dur = (ev.detail && ev.detail.dur) || 360;
    ents.forEach(e => { const b = $('.ss-bob', e.el); if (b) b.animate([{ transform: 'none' }, { transform: 'translateY(-14px) scale(1.06,.94)' }, { transform: 'none' }], { duration: dur, easing: 'ease-out' }); });
  });
  const icon = $('#gameIcon'); if (icon) icon.addEventListener('click', () => openGame(false));

  /* idle → screensaver (attract mode) */
  let idleT;
  function resetIdle() { clearTimeout(idleT); if (open || reduced) return; idleT = setTimeout(() => { if (!(R().isBusy && R().isBusy()) && $('#boot').classList.contains('hidden') && $('#takeover').classList.contains('hidden') && !document.hidden) openGame(true); else resetIdle(); }, 60000); }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => document.addEventListener(ev, () => { if (!open) resetIdle(); }, { passive: true }));
  resetIdle();
  window.RONI = Object.assign(window.RONI || {}, { openGame });
})();
