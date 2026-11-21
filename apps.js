/* RONI.OS apps: MAUS-CREATOR.EXE, WASCHKÜCHEN-BEATMAKER, 24 KERZEN AUSPUSTEN */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const R = () => window.RONI || {};
  const say = m => (R().say || R().toast || (() => {}))(m);
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const ICON_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>';
  const busy = { mic: false, beat: false };
  window.RONI = Object.assign(window.RONI || {}, { isBusy: () => busy.mic || busy.beat });
  const ICON_STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" fill="currentColor"/></svg>';

  /* ================= MAUS-CREATOR ================= */
  const form = $('#creatorForm');
  if (form) {
    const read = () => {
      const fd = new FormData(form);
      return { name: (fd.get('name') || '').toString().trim().toUpperCase() || 'NAMENLOSE MAUS', color: fd.get('color'), hat: fd.get('hat'), glasses: fd.get('glasses'), chain: fd.get('chain') === 'on', quote: (fd.get('quote') || '').toString().trim().toUpperCase() };
    };
    const write = c => {
      form.elements.name.value = c.name || '';
      form.elements.quote.value = c.quote || '';
      for (const k of ['color', 'hat', 'glasses']) { const r = form.querySelector(`input[name="${k}"][value="${c[k]}"]`); if (r) r.checked = true; }
      form.elements.chain.checked = !!c.chain;
    };
    const preview = () => {
      const c = read(); window.RONI_CREATOR_CFG = c;
      $('#creatorNameTag').textContent = c.name;
      document.dispatchEvent(new CustomEvent('roni:creator-preview', { detail: c }));
    };
    try { const saved = JSON.parse(store.get('roni.mouse', '')); if (saved && saved.name) { write(saved); $('#creatorStatus').textContent = saved.name + ' LEBT BEREITS IN DER WASCHKÜCHE. ÄNDERN = NEU AUSWILDERN.'; } } catch (e) {}
    preview();
    form.addEventListener('input', preview);
    form.addEventListener('change', preview);
    $('#creatorRandom').addEventListener('click', () => {
      const names = ['MC SCHLEUDERGANG', 'LADY WEICHSPÜLER', 'DJ FLUSENSIEB', 'BARON VON SOCKE', 'KÄSE KARL', 'TECHNO-TRUDE', 'MAUSI 3000', 'PAPA PIEPS'];
      const quotes = ['ICH BIN NICHT GEFLOHEN, ICH BIN AUSGEZOGEN.', 'DIE WASCHMASCHINE IST MEIN DJ-PULT.', 'KÄSE IST AUCH NUR EIN BEAT.', 'MIETE IST EIN SOZIALES KONSTRUKT.', 'BASS RAUF, DECKEL ZU.', 'HAPPY BIRTHDAY, VERMIETERIN!'];
      write({ name: pick(names), color: pick(['chrome', 'gold', 'pink', 'lila', 'schwarz']), hat: pick(['none', 'party', 'crown']), glasses: pick(['sun', 'heart', 'none']), chain: Math.random() < 0.7, quote: pick(quotes) });
      preview();
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const c = Object.assign(read(), { released: true });
      store.set('roni.mouse', JSON.stringify(c));
      document.dispatchEvent(new CustomEvent('roni:mouse-updated', { detail: c }));
      $('#creatorStatus').textContent = c.name + ' WURDE AUSGEWILDERT. ACHTE AUF DEN UNTEREN BILDRAND.';
      say(c.name + ' IST JETZT OFFIZIELL MITBEWOHNERIN. DIE DJ-MAUS TRÄGT JETZT IHREN LOOK.');
      if (R().runMouse) setTimeout(() => R().runMouse('talk', c), 600);
    });
  }

  /* ================= BEATMAKER ================= */
  const grid = $('#bmGrid');
  if (grid) {
    const TRACKS = [
      { id: 'kick', name: 'SCHLEUDERTROMMEL' },
      { id: 'clap', name: 'TÜR-KLACK' },
      { id: 'hat', name: 'DAMPF-ZISCH' },
      { id: 'squeak', name: 'MAUS-QUIETSCH' },
      { id: 'bass', name: 'TROCKNER-BRUMM' }
    ];
    const PRESET = {
      kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
      squeak: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
      bass: [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0]
    };
    let pat;
    try { pat = JSON.parse(store.get('roni.beat', '')); } catch (e) {}
    if (!pat || !pat.kick) pat = JSON.parse(JSON.stringify(PRESET));
    const cells = {};
    for (const t of TRACKS) {
      const row = document.createElement('div'); row.className = 'bm-row';
      const lab = document.createElement('span'); lab.className = 'bm-label'; lab.textContent = t.name; row.appendChild(lab);
      const steps = document.createElement('div'); steps.className = 'bm-steps';
      cells[t.id] = [];
      for (let i = 0; i < 16; i++) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'bm-cell' + (i % 4 === 0 ? ' bar' : '');
        b.setAttribute('aria-label', `${t.name} Schritt ${i + 1}`);
        b.addEventListener('click', () => { pat[t.id][i] = pat[t.id][i] ? 0 : 1; paint(); save(); if (pat[t.id][i]) { ensureCtx(); play(t.id, ctx.currentTime); } });
        steps.appendChild(b); cells[t.id].push(b);
      }
      row.appendChild(steps); grid.appendChild(row);
    }
    function paint() { for (const t of TRACKS) cells[t.id].forEach((b, i) => { const on = !!pat[t.id][i]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); }
    function save() { store.set('roni.beat', JSON.stringify(pat)); }
    paint();

    let ctx = null, out = null, noise = null;
    function ensureCtx() {
      if (!ctx) {
        try { if ('audioSession' in navigator) navigator.audioSession.type = 'playback'; } catch (e) {}
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        out = ctx.createGain(); out.connect(ctx.destination);
        const len = ctx.sampleRate; noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
      out.gain.value = Math.max(0.02, (R().gain ? R().gain() : 0.15) * 2.2);
    }
    function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
    function noiseSrc(t, dur) { const s = ctx.createBufferSource(); s.buffer = noise; s.start(t); s.stop(t + dur); return s; }
    function play(id, t) {
      if (id === 'kick') { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22); env(g, t, 0.003, 1, 0.32); o.connect(g).connect(out); o.start(t); o.stop(t + 0.4); }
      else if (id === 'clap') { const s = noiseSrc(t, 0.2), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.2; env(g, t, 0.002, 0.8, 0.14); s.connect(f).connect(g).connect(out);
        const o = ctx.createOscillator(), g2 = ctx.createGain(); o.type = 'square'; o.frequency.value = 2600; env(g2, t, 0.001, 0.12, 0.02); o.connect(g2).connect(out); o.start(t); o.stop(t + 0.05); }
      else if (id === 'hat') { const s = noiseSrc(t, 0.12), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'highpass'; f.frequency.value = 7000; env(g, t, 0.002, 0.35, 0.07); s.connect(f).connect(g).connect(out); }
      else if (id === 'squeak') { const o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(1900, t); o.frequency.exponentialRampToValueAtTime(3100, t + 0.08); o.frequency.exponentialRampToValueAtTime(2300, t + 0.16); l.frequency.value = 38; lg.gain.value = 140; l.connect(lg).connect(o.frequency); env(g, t, 0.005, 0.28, 0.15); o.connect(g).connect(out); o.start(t); l.start(t); o.stop(t + 0.2); l.stop(t + 0.2); }
      else if (id === 'bass') { const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.value = 55; f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(140, t + 0.2); env(g, t, 0.004, 0.55, 0.2); o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + 0.3); }
    }
    let playing = false, timer = 0, stepN = 0, nextT = 0, uiTimers = [];
    const tempo = $('#bmTempo'), bpmOut = $('#bmBpm'), btn = $('#bmPlay');
    const bpm = () => +tempo.value;
    tempo.style.setProperty('--fill', ((bpm() - 90) / 70 * 100) + '%');
    tempo.addEventListener('input', () => { bpmOut.textContent = bpm() + ' BPM'; tempo.style.setProperty('--fill', ((bpm() - 90) / 70 * 100) + '%'); });
    function setBtn() { btn.innerHTML = playing ? ICON_STOP : ICON_PLAY; btn.setAttribute('aria-label', playing ? 'Beat stoppen' : 'Beat abspielen'); }
    setBtn();
    function schedule() {
      const spb = 60 / bpm() / 4;
      while (nextT < ctx.currentTime + 0.12) {
        const i = stepN % 16, t = nextT;
        for (const tr of TRACKS) if (pat[tr.id][i]) play(tr.id, t);
        const delay = Math.max(0, (t - ctx.currentTime) * 1000);
        const isBeat = pat.kick[i] || (!pat.kick.some(Boolean) && i % 4 === 0);
        uiTimers.push(setTimeout(() => {
          $$('.bm-cell.now', grid).forEach(c => c.classList.remove('now'));
          for (const tr of TRACKS) cells[tr.id][i].classList.add('now');
          if (isBeat && R().beat) R().beat();
        }, delay));
        if (uiTimers.length > 64) uiTimers = uiTimers.slice(-32);
        nextT += spb; stepN++;
      }
    }
    function start() { ensureCtx(); if (R().pauseMusic) R().pauseMusic(); playing = true; busy.beat = true; stepN = 0; nextT = ctx.currentTime + 0.05; schedule(); timer = setInterval(schedule, 25); setBtn(); say('WASCHKÜCHEN-BEATMAKER LÄUFT. DIE MAUS GIBT ALLES.'); }
    function stop() { playing = false; busy.beat = false; clearInterval(timer); uiTimers.forEach(clearTimeout); uiTimers = []; $$('.bm-cell.now', grid).forEach(c => c.classList.remove('now')); setBtn(); }
    btn.addEventListener('click', () => playing ? stop() : start());
    $$('[data-preset]').forEach(b => b.addEventListener('click', () => {
      const p = b.dataset.preset;
      if (p === 'techno') pat = JSON.parse(JSON.stringify(PRESET));
      else if (p === 'clear') for (const t of TRACKS) pat[t.id] = Array(16).fill(0);
      else { const dens = { kick: 0.3, clap: 0.15, hat: 0.45, squeak: 0.12, bass: 0.3 }; for (const t of TRACKS) pat[t.id] = Array.from({ length: 16 }, (_, i) => (t.id === 'kick' && i % 4 === 0) || Math.random() < dens[t.id] ? 1 : 0); say('ZUFALLSWASCHGANG: ' + pick(['60° BUNTWÄSCHE', 'KOCHWÄSCHE DELUXE', 'WOLLE / HANDWÄSCHE / HARDTEKK', 'SCHNELLWASCHGANG 15 MIN']) + '.'); }
      paint(); save();
    }));
    // stop the beatmaker when RONI.FM starts playing again
    document.addEventListener('click', e => { if (playing && e.target && e.target.closest && e.target.closest('[data-play-toggle],[data-spotify]')) stop(); });
    document.querySelectorAll('[data-close="beat"]').forEach(b => b.addEventListener('click', () => playing && stop()));
  }

  /* ================= 24 KERZEN ================= */
  const candlesEl = $('#candles');
  if (candlesEl) {
    const N = 24; let lit = N, micStream = null, micCtx = null, micRaf = 0, done = false;
    for (let i = 0; i < N; i++) {
      const c = document.createElement('button'); c.type = 'button';
      const back = i < 12, j = back ? i : i - 12;
      c.className = 'candle lit ' + (back ? 'back' : 'front');
      c.style.left = (back ? (j + 0.5) / 12 : (j + 1) / 13) * 100 + '%';
      c.style.setProperty('--h', (26 + (i * 7) % 12) + 'px');
      c.style.setProperty('--d', (i * 0.13 % 1).toFixed(2) + 's');
      c.setAttribute('aria-label', `Kerze ${i + 1} auspusten`);
      c.innerHTML = '<i class="flame"></i>';
      c.addEventListener('click', () => { if (c.classList.contains('lit')) blowOut(c); else { c.classList.add('lit'); c.setAttribute('aria-label', `Kerze ${i + 1} auspusten`); lit++; done = false; status(); } });
      candlesEl.appendChild(c);
    }
    const all = () => $$('.candle', candlesEl);
    function status() {
      const s = $('#cakeStatus');
      if (lit === N) s.textContent = 'KERZEN AN: 24. TIEF EINATMEN.';
      else if (lit > 0) s.textContent = `KERZEN AN: ${lit}. ` + pick(['WEITER PUSTEN!', 'DIE MAUS FEUERT DICH AN.', 'LUNGENVOLUMEN: LEGENDÄR.', 'FAST, RONI!']);
    }
    function blowOut(c) {
      c.classList.remove('lit'); c.setAttribute('aria-label', 'Kerze wieder anzünden');
      const smoke = document.createElement('i'); smoke.className = 'smoke'; c.appendChild(smoke);
      smoke.animate([{ opacity: 0.7, transform: 'translate(-50%,0) scale(.6)' }, { opacity: 0, transform: 'translate(-50%,-34px) scale(1.6)' }], { duration: 1100, easing: 'ease-out', fill: 'forwards' }).finished.then(() => smoke.remove());
      lit--; status(); if (lit <= 0) celebrate();
    }
    function blowSome(n) { const l = all().filter(c => c.classList.contains('lit')); for (let k = 0; k < n && l.length; k++) blowOut(l.splice(Math.floor(Math.random() * l.length), 1)[0]); }
    function celebrate() {
      if (done) return; done = true; stopMic();
      $('#cakeStatus').textContent = 'ALLE 24 AUS! WÜNSCH DIR WAS. (NICHT, DASS DIE MAUS AUSZIEHT.)';
      say('WUNSCH REGISTRIERT. FRITTY-PC LEITET IHN AN DIE WASCHKÜCHE WEITER.');
      confetti();
      if (R().runMouse) { R().runMouse('conga'); setTimeout(() => R().runMouse('dance'), 2500); }
      for (let i = 0; i < 6; i++) setTimeout(() => R().beat && R().beat(), i * 420);
    }
    function confetti() {
      const layer = document.createElement('div'); layer.className = 'confetti-layer'; document.body.appendChild(layer);
      const colors = ['#ffffff', '#ff8fe0', '#b98cff', '#ffd27a', '#cfc8dc', '#6d6878'];
      for (let i = 0; i < 140; i++) {
        const isMouse = i % 14 === 0;
        const p = document.createElement(isMouse ? 'img' : 'i');
        if (isMouse) { p.src = 'techno-mouse.png'; p.alt = ''; p.className = 'confetti-mouse'; }
        else { p.className = 'confetti-bit'; p.style.background = colors[i % colors.length]; }
        p.style.left = Math.random() * 100 + 'vw';
        layer.appendChild(p);
        const drift = (Math.random() - 0.5) * 240;
        p.animate([{ transform: 'translate(0,-60px) rotate(0)' }, { transform: `translate(${drift}px,${innerHeight + 80}px) rotate(${Math.random() * 1080}deg)` }], { duration: 2200 + Math.random() * 2200, delay: Math.random() * 700, easing: 'cubic-bezier(.25,.6,.6,1)', fill: 'forwards' });
      }
      setTimeout(() => layer.remove(), 5600);
    }
    $('#relight').addEventListener('click', () => { all().forEach(c => { c.classList.add('lit'); c.setAttribute('aria-label', 'Kerze auspusten'); }); lit = N; done = false; status(); });
    async function startMic() {
      if (micStream) { stopMic(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { say('KEIN MIKRO VERFÜGBAR. DANN KLICK DIE KERZEN AUS.'); return; }
      try { micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
      catch (e) { micStream = null; say('MIKRO VERWEIGERT. DIE MAUS RESPEKTIERT DAS. KLICK DIE KERZEN AUS.'); return; }
      busy.mic = true;
      micCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = micCtx.createMediaStreamSource(micStream), an = micCtx.createAnalyser(); an.fftSize = 1024; src.connect(an);
      const buf = new Float32Array(an.fftSize); let loudSince = 0, lastBlow = 0;
      $('#micBtn').innerHTML = 'MIKRO AUS <span>×</span>';
      $('#cakeStatus').textContent = 'MIKRO AN. JETZT KRÄFTIG INS MIKRO PUSTEN!';
      const tick = () => {
        an.getFloatTimeDomainData(buf);
        let sum = 0; for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length), now = performance.now();
        $('#micLevel').style.transform = `scaleX(${Math.min(1, rms * 6)})`;
        if (rms > 0.09) {
          if (!loudSince) loudSince = now;
          // need ~120 ms of sustained blowing, then 1–2 candles every 180 ms
          if (now - loudSince > 120 && now - lastBlow > 180) { lastBlow = now; blowSome(rms > 0.25 ? 2 : 1); }
        } else loudSince = 0;
      };
      micRaf = setInterval(tick, 30);
    }
    function stopMic() {
      clearInterval(micRaf);
      if (micStream) micStream.getTracks().forEach(t => t.stop());
      if (micCtx) micCtx.close();
      micStream = null; micCtx = null; busy.mic = false;
      $('#micLevel').style.transform = 'scaleX(0)';
      $('#micBtn').innerHTML = 'MIT MIKRO PUSTEN <span>▸</span>';
    }
    $('#micBtn').addEventListener('click', startMic);
    document.querySelectorAll('[data-close="cake"],[data-minimize="cake"]').forEach(b => b.addEventListener('click', stopMic));
  }
})();
