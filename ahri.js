/* AHRI.EXE — Mrs Ronis Katze. Jagt die Maus, schubst Desktop-Icons vom Tisch
   und macht mit der Maus gemeinsam Unsinn. Streicheln per Klick. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const R = () => window.RONI || {};
  const say = m => R().say && R().say(m);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // a caught mouse pauses its animation forever, so never wait on a mouse without a time limit
  const settle = (p, ms = 9000) => Promise.race([Promise.resolve(p).catch(() => {}), sleep(ms)]);
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const ready = () => $('#boot').classList.contains('hidden') && $('#screensaver').classList.contains('hidden') && !document.hidden && !!R().lane;

  const CAT_SVG = `<svg class="ahri-svg" viewBox="0 0 220 150" aria-hidden="true">
<g class="ah-tail"><path d="M58 80 C34 76 16 58 22 30 C24 20 34 18 36 27 C32 48 42 64 64 70 Z" fill="#a39b90" stroke="#1b1612" stroke-width="3" stroke-linejoin="round"/><path d="M27 40 l9 -2 M26 52 l10 1 M33 63 l9 -3" stroke="#4a423a" stroke-width="4" stroke-linecap="round"/></g>
<g class="ah-leg ah-bl"><path d="M66 94 L64 130 Q64 136 71 136 L79 136 Q83 136 81 130 L80 94 Z" fill="#8a8379" stroke="#1b1612" stroke-width="3"/></g>
<g class="ah-leg ah-fl"><path d="M124 94 L123 130 Q123 136 130 136 L138 136 Q142 136 140 130 L139 94 Z" fill="#8a8379" stroke="#1b1612" stroke-width="3"/></g>
<ellipse cx="102" cy="88" rx="52" ry="27" fill="#aca498" stroke="#1b1612" stroke-width="3"/>
<ellipse cx="106" cy="101" rx="36" ry="11" fill="#e4ddd2"/>
<path d="M78 64 Q84 78 77 94 M94 62 Q100 78 93 96 M110 62 Q116 76 109 94 M126 66 Q131 77 126 90" stroke="#4a423a" stroke-width="5" stroke-linecap="round" fill="none"/>
<g class="ah-leg ah-br"><path d="M80 96 L78 132 Q78 138 85 138 L94 138 Q98 138 96 132 L95 96 Z" fill="#b2aa9e" stroke="#1b1612" stroke-width="3"/><path d="M80 116 h15 M80 124 h15" stroke="#4a423a" stroke-width="3"/><ellipse cx="88" cy="136" rx="9" ry="4" fill="#efe9df" stroke="#1b1612" stroke-width="2"/></g>
<g class="ah-leg ah-fr"><path d="M138 96 L137 132 Q137 138 144 138 L153 138 Q157 138 155 132 L154 96 Z" fill="#b2aa9e" stroke="#1b1612" stroke-width="3"/><path d="M138 116 h16 M138 124 h16" stroke="#4a423a" stroke-width="3"/><ellipse cx="147" cy="136" rx="9" ry="4" fill="#efe9df" stroke="#1b1612" stroke-width="2"/></g>
<g class="ah-head">
<path d="M134 46 L136 2 L162 30 Z" fill="#a39b90" stroke="#1b1612" stroke-width="3" stroke-linejoin="round"/><path d="M139 38 L140 13 L154 30 Z" fill="#e8a6a0"/>
<path d="M190 46 L188 2 L162 30 Z" fill="#a39b90" stroke="#1b1612" stroke-width="3" stroke-linejoin="round"/><path d="M185 38 L184 13 L170 30 Z" fill="#e8a6a0"/>
<ellipse cx="162" cy="54" rx="31" ry="27" fill="#b5ada2" stroke="#1b1612" stroke-width="3"/>
<path d="M155 30 l1 10 M162 28 v12 M169 30 l-1 10 M134 52 h8 M182 52 h8" stroke="#4a423a" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="162" cy="66" rx="14" ry="10" fill="#ece6dc"/>
<g class="ah-eyes"><ellipse cx="150" cy="51" rx="7.5" ry="8.5" fill="#e2b440" stroke="#1b1612" stroke-width="2"/><ellipse class="ah-pupil" cx="150" cy="51" rx="2.2" ry="6.5" fill="#111"/><circle cx="152.5" cy="48" r="1.7" fill="#fff"/>
<ellipse cx="174" cy="51" rx="7.5" ry="8.5" fill="#e2b440" stroke="#1b1612" stroke-width="2"/><ellipse class="ah-pupil" cx="174" cy="51" rx="2.2" ry="6.5" fill="#111"/><circle cx="176.5" cy="48" r="1.7" fill="#fff"/></g>
<path d="M157 60 L167 60 L162 66 Z" fill="#d98e8a" stroke="#1b1612" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M162 66 Q158 71 153 68 M162 66 Q166 71 171 68" stroke="#1b1612" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M150 66 L120 60 M150 69 L120 71 M174 66 L204 60 M174 69 L204 71" stroke="#f3efe8" stroke-width="1.4" stroke-linecap="round"/>
<path d="M140 78 Q162 90 184 78" stroke="#1b1612" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M140 78 Q162 90 184 78" stroke="#ff7fb6" stroke-width="6" fill="none" stroke-linecap="round"/>
<circle class="ah-bell" cx="162" cy="90" r="6" fill="#dcdbe6" stroke="#1b1612" stroke-width="2"/><path d="M162 91 v4" stroke="#1b1612" stroke-width="1.5"/><circle cx="160" cy="88" r="1.6" fill="#fff"/>
</g></svg>`;
  const YARN_SVG = '<svg class="yarn-svg" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="#ff8fe0" stroke="#1b1612" stroke-width="3"/><path d="M8 22 Q30 34 52 20 M6 34 Q30 46 54 32 M14 48 Q30 24 44 8 M22 54 Q40 30 50 12" stroke="#c04a9c" stroke-width="2.5" fill="none"/></svg>';

  let pets = +(localStorage.getItem('roni.ahri') || 0) || 0;
  function pet(el) {
    pets++; try { localStorage.setItem('roni.ahri', pets); } catch (e) {}
    say(pets === 1 ? 'AHRI GESTREICHELT. SCHNURRRRR. FRITTY-PC IST NEIDISCH.' : pick(['SCHNURRRRR. (' + pets + 'x GESTREICHELT)', 'AHRI AKZEPTIERT DICH. VORERST.', 'STREICHELN ERLAUBT. KOSTET 1 LECKERLI.', 'AHRI SCHNURRT IM TAKT. 128 BPM.', 'AHRI FINDET: DIE MAUS DARF BLEIBEN. HEUTE.']));
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      const h = document.createElement('span'); h.className = 'ahri-heart'; h.textContent = '♥';
      h.style.left = (r.left + r.width * (0.3 + Math.random() * 0.5)) + 'px'; h.style.top = (r.top + 10) + 'px';
      document.body.appendChild(h);
      h.animate([{ opacity: 1, transform: 'translate(0,0) scale(.6)' }, { opacity: 0, transform: `translate(${(Math.random() - 0.5) * 50}px,-70px) scale(1.3)` }], { duration: 1100 + i * 120, easing: 'ease-out', fill: 'forwards' }).finished.then(() => h.remove());
    }
    const svg = $('.ahri-svg', el); if (svg) svg.animate([{ transform: 'none' }, { transform: 'scale(1.06,.94)' }, { transform: 'none' }], { duration: 400 });
  }

  /* A cat that can live in the bottom lane (uses the same move/talk helpers as the mice). */
  function makeCat(dir) {
    const L = R().lane, size = Math.round(Math.min(150, Math.max(104, innerWidth * 0.085)));
    const b = document.createElement('button'); b.type = 'button'; b.className = 'runner ahri';
    b.style.setProperty('--s', size + 'px'); b.style.setProperty('--dir', dir);
    b.setAttribute('aria-label', 'Ahri streicheln');
    b.innerHTML = '<span class="jump"><span class="body">' + CAT_SVG + '</span></span><span class="name-tag">AHRI</span>';
    b.addEventListener('click', () => pet(b));
    L.el().appendChild(b); return b;
  }
  const W = () => innerWidth;

  /* ---------- 1) Jagd: Ahri jagt die Maus ---------- */
  async function chase() {
    const L = R().lane, dir = Math.random() < 0.5 ? 1 : -1, w = W();
    const from = dir > 0 ? -170 : w + 30, to = dir > 0 ? w + 40 : -200, mid = w * (0.35 + Math.random() * 0.3);
    const m = L.make(64, dir); L.catchable(m); m.classList.add('running');
    const cat = makeCat(dir); cat.classList.add('running');
    const mIn = settle(L.moveX(m, from, mid, 0.34));
    await sleep(700);
    const cIn = L.moveX(cat, from - dir * 40, mid - dir * 190, 0.36);
    await Promise.all([mIn, cIn]);
    if (!m.isConnected) { cat.classList.add('running'); await L.moveX(cat, mid - dir * 190, to, 0.5); return cat.remove(); }
    await L.talk(m, pick(['OH NEIN. AHRI.', 'ICH HAB NIX GEMACHT!', 'DAS IST EIN MISSVERSTÄNDNIS.']));
    await L.talk(cat, pick(['MIAU. (ÜBERSETZT: DU BIST VERHAFTET.)', 'ICH ZÄHLE BIS DREI. NEIN, KANN ICH NICHT.', 'DIESE WASCHKÜCHE IST MEIN REVIER.']));
    m.classList.add('running', 'fast'); cat.classList.add('running', 'fast');
    const mOut = m.isConnected ? settle(L.moveX(m, mid, to, 0.95)) : Promise.resolve();
    await sleep(250);
    // Ahri overshoots the corner and skids
    await L.moveX(cat, mid - dir * 190, mid + dir * w * 0.25, 0.85);
    cat.classList.remove('running', 'fast'); cat.classList.add('skid');
    await sleep(450); cat.classList.remove('skid');
    await L.talk(cat, 'DAS WAR TAKTIK.');
    await mOut.catch(() => {}); m.remove();
    cat.classList.add('running'); await L.moveX(cat, mid + dir * w * 0.25, to, 0.45); cat.remove();
  }

  /* ---------- 1b) Umgekehrt: die Maus jagt Ahri ---------- */
  async function reverseChase() {
    const L = R().lane, dir = Math.random() < 0.5 ? 1 : -1, w = W();
    const from = dir > 0 ? -170 : w + 30, to = dir > 0 ? w + 40 : -200, mid = w * (0.4 + Math.random() * 0.25);
    const cat = makeCat(dir); cat.classList.add('running');
    const m = L.make(64, dir); L.catchable(m); m.classList.add('running');
    const cIn = L.moveX(cat, from, mid, 0.3);
    await sleep(400);
    const mIn = settle(L.moveX(m, from - dir * 30, mid - dir * 170, 0.32));
    await Promise.all([cIn, mIn]);
    if (m.isConnected) await L.talk(m, 'BUH!');
    cat.classList.add('puff');
    $('.jump', cat).animate([{ transform: 'none' }, { transform: 'translateY(-70px) rotate(-8deg)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
    await sleep(540);
    await L.talk(cat, pick(['ICH KÜNDIGE.', 'SIE HAT EINE SONNENBRILLE! DAS IST NICHT FAIR!', 'ICH RUF MEINE ANWÄLTIN. SIE HEISST RONI.']));
    cat.classList.remove('puff'); cat.classList.add('running', 'fast');
    const cOut = L.moveX(cat, mid, to, 1.0);
    if (m.isConnected) { await L.talk(m, 'UND BLEIB DRAUSSEN.'); m.classList.add('running'); await settle(L.moveX(m, mid - dir * 170, to, 0.4)); }
    await cOut; cat.remove(); m.remove();
  }

  /* ---------- 2) Icons vom Tisch schubsen ---------- */
  let knocking = false;
  async function knockIcon() {
    if (knocking || innerWidth <= 700) return;
    const ws = $('#workspace'), icons = $$('.desktop-icons .app-icon').filter(i => i.offsetParent);
    if (!icons.length) return;
    knocking = true;
    const icon = pick(icons), name = icon.textContent.replace(/\s+/g, ' ').trim();
    const wr = ws.getBoundingClientRect(), ir = icon.getBoundingClientRect();
    const size = 118, h = size * 150 / 220;
    const cat = document.createElement('button'); cat.type = 'button'; cat.className = 'ahri-actor ahri running';
    cat.setAttribute('aria-label', 'Ahri streicheln');
    cat.style.width = size + 'px'; cat.style.setProperty('--dir', -1);
    cat.style.top = (ir.bottom - wr.top - h + 4) + 'px';
    cat.innerHTML = '<span class="body">' + CAT_SVG + '</span>';
    cat.addEventListener('click', () => pet(cat));
    ws.appendChild(cat);
    const startX = wr.width + 20, stopX = ir.right - wr.left - 26;
    try {
      await cat.animate([{ transform: `translateX(${startX}px)` }, { transform: `translateX(${stopX}px)` }], { duration: Math.abs(startX - stopX) / 0.3, easing: 'ease-out', fill: 'forwards' }).finished;
      cat.classList.remove('running'); cat.classList.add('pawing');
      for (let i = 1; i <= 3; i++) {
        await sleep(430);
        icon.animate([{ transform: 'none' }, { transform: `translateX(${-6 * i}px) rotate(${-7 * i}deg)` }, { transform: 'none' }], { duration: 300, easing: 'ease-out' });
      }
      cat.classList.remove('pawing');
      const fall = Math.max(60, wr.bottom - ir.bottom - 46);
      const down = icon.animate([{ transform: 'none' }, { transform: `translate(-34px,${fall}px) rotate(-210deg)` }], { duration: 850, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'forwards' });
      say('AHRI HAT „' + name + '“ VOM TISCH GESCHUBST. SIE BEREUT NICHTS.');
      await down.finished;
      icon.animate([{ transform: `translate(-34px,${fall}px) rotate(-210deg)` }, { transform: `translate(-34px,${fall - 18}px) rotate(-200deg)` }, { transform: `translate(-34px,${fall}px) rotate(-210deg)` }], { duration: 260 });
      const bub = document.createElement('span'); bub.className = 'bubble'; bub.textContent = pick(['UPS.', 'DAS STAND DA SCHON SO.', 'SCHWERKRAFT-TEST BESTANDEN.']); cat.appendChild(bub);
      await sleep(1900); bub.remove();
      const back = icon.animate([{ transform: `translate(-34px,${fall}px) rotate(-210deg)` }, { transform: 'translate(0,-26px) rotate(12deg)', offset: 0.75 }, { transform: 'none' }], { duration: 900, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      down.cancel();
      await back.finished;
      say('„' + name + '“ IST BELEIDIGT ZURÜCKGEKEHRT.');
      cat.style.setProperty('--dir', 1); cat.classList.add('running');
      await cat.animate([{ transform: `translateX(${stopX}px)` }, { transform: `translateX(${wr.width + 30}px)` }], { duration: Math.abs(wr.width + 30 - stopX) / 0.45, fill: 'forwards' }).finished;
    } finally { cat.remove(); icon.getAnimations().forEach(a => a.cancel()); knocking = false; }
  }

  /* ---------- 3) Komplizen-Unsinn ---------- */
  async function duo(kind) {
    const L = R().lane, dir = Math.random() < 0.5 ? 1 : -1, w = W();
    const from = dir > 0 ? -170 : w + 30, to = dir > 0 ? w + 40 : -200, mid = w * (0.35 + Math.random() * 0.3);
    if (kind === 'yarn') {
      // the mouse rides a rolling ball of yarn, Ahri chases it
      const rider = L.make(64, dir); L.catchable(rider); rider.classList.add('on-yarn');
      const ball = document.createElement('span'); ball.className = 'yarn'; ball.innerHTML = YARN_SVG; rider.appendChild(ball);
      const cat = makeCat(dir); cat.classList.add('running', 'fast');
      // rolls in, stops to talk (mice always stand still while talking), Ahri catches up, off they go
      await settle(L.moveX(rider, from, mid, 0.5), 8000);
      const catIn = L.moveX(cat, from - dir * 60, mid - dir * 200, 0.62);
      if (rider.isConnected) await L.talk(rider, 'WOLLKNÄUEL-TAXI! FAHRT GEHT AUF AHRI.');
      await catIn;
      await L.talk(cat, 'DAS IST MEIN KNÄUEL. UND MEINE MAUS.');
      cat.classList.add('running', 'fast');
      await Promise.all([rider.isConnected ? settle(L.moveX(rider, mid, to, 0.75)) : null, L.moveX(cat, mid - dir * 200, to - dir * 40, 0.78)]);
      rider.remove(); cat.remove(); return;
    }
    const m = L.make(64, dir); L.catchable(m); m.classList.add('running');
    const cat = makeCat(dir); cat.classList.add('running');
    await Promise.all([settle(L.moveX(m, from, mid, 0.34)), L.moveX(cat, from - dir * 30, mid - dir * 150, 0.34)]);
    if (kind === 'heist') {
      await L.talk(cat, 'PSST. MAUS. JETZT.');
      if (m.isConnected) await L.talk(m, 'BASS WIRD GEKLAUT… 3… 2… 1…');
      const ducked = R().duck && R().duck(6500);
      say(ducked ? 'AHRI & DIE MAUS HABEN DEN BASS GEKLAUT. RÜCKGABE IN 6 SEKUNDEN.' : 'AHRI & DIE MAUS WOLLTEN DEN BASS KLAUEN. ES LIEF KEINE MUSIK. PEINLICH.');
      if (ducked) setTimeout(() => say('BASS ZURÜCKGEGEBEN. AHRI HAT DEN KÄSE BEHALTEN.'), 6600);
    } else if (kind === 'clock') {
      await L.talk(cat, 'DIE UHR GEHÖRT JETZT MIR.');
      const clock = $('#clock'); if (clock) { const old = clock.textContent; clock.textContent = 'MIAU:24'; clock.classList.add('clock-hacked'); setTimeout(() => { clock.textContent = old; clock.classList.remove('clock-hacked'); }, 9000); }
      say('AHRI HAT DIE UHR GEFRESSEN. ES IST JETZT MIAU UHR 24.');
      if (m.isConnected) await L.talk(m, 'ICH HAB AUFGEPASST. GLAUB ICH.');
    } else { // dance-off
      m.classList.add('dancing'); cat.classList.add('dancing');
      await Promise.all([L.talk(m, 'DANCE-BATTLE! MAUS GEGEN KATZE!', 'dancing'), sleep(300).then(() => L.talk(cat, 'ICH TANZE NUR AUS IRONIE.', 'dancing'))]);
      m.classList.remove('dancing'); cat.classList.remove('dancing');
    }
    m.classList.add('running', 'fast'); cat.classList.add('running', 'fast');
    await Promise.all([m.isConnected ? settle(L.moveX(m, mid, to, 0.7)) : null, L.moveX(cat, mid - dir * 150, to, 0.7)]);
    m.remove(); cat.remove();
  }

  /* ---------- scheduling ---------- */
  const ACTS = [['chase', 3], ['reverse', 2], ['knock', 3], ['yarn', 2], ['heist', 1], ['clock', 1], ['dance', 1]];
  function run(kind) {
    if (!ready()) return Promise.resolve();
    const k = kind || (() => { let t = ACTS.reduce((s, a) => s + a[1], 0) * Math.random(); for (const [n, w] of ACTS) { if ((t -= w) < 0) return n; } return 'chase'; })();
    const f = { chase, reverse: reverseChase, knock: knockIcon, yarn: () => duo('yarn'), heist: () => duo('heist'), clock: () => duo('clock'), dance: () => duo('dance') }[k];
    return f().catch(() => {});
  }
  let timer;
  function schedule(first) { clearTimeout(timer); if (reduced) return; timer = setTimeout(() => { run(); schedule(); }, first ? 22000 : 26000 + Math.random() * 30000); }
  const enter = $('#enter'); if (enter) enter.addEventListener('click', () => schedule(true));
  // cheat code: type A-H-R-I
  let typed = ''; document.addEventListener('keydown', e => { if (e.target && e.target.closest && e.target.closest('input,textarea')) return; typed = (typed + (e.key || '')).slice(-4).toUpperCase(); if (typed === 'AHRI' && ready()) { typed = ''; say('AHRI WURDE GERUFEN. SIE KOMMT, WENN SIE WILL. (JETZT.)'); run('knock'); setTimeout(() => run('chase'), 1200); } });
  window.RONI = Object.assign(window.RONI || {}, { ahri: run });
})();
