(() => {
'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const names={discord:'DISCORD ARCHIVE',music:'MUSIC VAULT',photos:'RONI MEMORIES',stream:'MRSRONI LIVE',message:'SECRET MESSAGE',party:'AFTERPARTY.EXE',creator:'MAUS-CREATOR',beat:'BEATMAKER',cake:'KUCHEN.EXE'};
const stack=[];let z=20;let active=null;let toastTimer;
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2700)}
function taskbar(){const host=$('#taskItems');host.replaceChildren();for(const id of stack){const b=document.createElement('button');b.textContent=names[id];b.className=id===active?'active':'';b.addEventListener('click',()=>open(id));host.appendChild(b)}}
function open(id){const w=$('#win-'+id);if(!w)return;w.classList.add('visible','active');w.setAttribute('aria-hidden','false');$$('.window').forEach(x=>{if(x!==w)x.classList.remove('active')});w.style.zIndex=++z;active=id;if(!stack.includes(id))stack.push(id);taskbar();if(matchMedia('(max-width:700px)').matches){const b=document.createElement('button');b.className='mobile-back';b.textContent='← BACK TO DESKTOP';b.style.cssText='border:0;background:#2c183b;color:#fff;padding:10px 12px;font:10px "DM Mono",monospace;width:100%;text-align:left';b.addEventListener('click',()=>minimize(id));const content=$('.window-content',w);if(!$('.mobile-back',w))w.insertBefore(b,content)}}
window.RONI=Object.assign(window.RONI||{},{open:id=>open(id),toast});
const ws=$('#workspace');ws.addEventListener('scroll',()=>{if(ws.scrollTop||ws.scrollLeft){ws.scrollTop=0;ws.scrollLeft=0}});
function minimize(id){const w=$('#win-'+id);w.classList.remove('visible','active');w.setAttribute('aria-hidden','true');active=null;taskbar()}
function close(id){minimize(id);const i=stack.indexOf(id);if(i>=0)stack.splice(i,1);taskbar()}
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.open)));
$$('[data-minimize]').forEach(b=>b.addEventListener('click',()=>minimize(b.dataset.minimize)));
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>close(b.dataset.close)));
$$('.window').forEach(w=>{w.addEventListener('pointerdown',()=>{if(w.classList.contains('visible')){w.style.zIndex=++z;active=w.id.replace('win-','');$$('.window').forEach(x=>x.classList.toggle('active',x===w));taskbar()}})});
$$('.window-bar').forEach(bar=>{const w=bar.closest('.window');let drag=null;bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||matchMedia('(max-width:700px)').matches)return;const r=w.getBoundingClientRect(),p=$('#workspace').getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left-p.left,top:r.top-p.top};bar.setPointerCapture(e.pointerId);e.preventDefault()});bar.addEventListener('pointermove',e=>{if(!drag)return;const p=$('#workspace').getBoundingClientRect();const x=Math.max(0,Math.min(p.width-w.offsetWidth,drag.left+e.clientX-drag.x));const y=Math.max(0,Math.min(p.height-w.offsetHeight,drag.top+e.clientY-drag.y));w.style.left=x+'px';w.style.top=y+'px'});const stop=()=>drag=null;bar.addEventListener('pointerup',stop);bar.addEventListener('pointercancel',stop)});
const artists=[['MAIKEL','2T1zM7AtA0Cd9u1m3PBFEY','INDIE / AFTER HOURS'],['MOE','2Odi4EJdB2wFUTMWNCxJ7T','INDIE / FEELINGS'],['FRISO','4xAMTJFCMfH1AZNQexkYEt','INDIE / MIDNIGHT'],['TOOLOUDFORTHEROOM','74DOh9R3aqr9X9hQ3qsmwO','LOUD / HEART'],['YEAT','3qiHUAX7zY4Qnjx8TNUzVx','WILDCARD / CHAOS'],['MAURER','2Mz4xppLRLkIsvMFb9STKO','GROOVE TECHNO'],['YANAMASTE','6zRdaJArenH7DjolPTm6hY','GROOVE TECHNO']];
const rec=$('#records');for(const [name,id,tag] of artists){const item=document.createElement('button');item.type='button';item.className='record';item.dataset.spotify='spotify:artist:'+id;item.dataset.label=name;item.innerHTML='<span class="record-art" aria-hidden="true"></span><span class="record-copy"><span class="record-name"></span><span class="record-tag"></span><span class="record-play">IM RONI.FM SPIELEN ▸</span></span>';$('.record-name',item).textContent=name;$('.record-tag',item).textContent=tag;item.setAttribute('aria-label',name+' im RONI.FM-Player abspielen');rec.appendChild(item)}
$('#enter').addEventListener('click',()=>{$('#boot').classList.add('hidden');$('#system').classList.remove('hidden');toast('WELCOME BACK, RONI. LEVEL 24 UNLOCKED.');setTimeout(()=>open('message'),550)});
$('#startBtn').addEventListener('click',()=>{$$('.window.visible').forEach(w=>minimize(w.id.replace('win-','')));toast('DESKTOP READY. WÄHLE EIN PROGRAMM.')});
$('#helpBtn').addEventListener('click',()=>$('#helpOverlay').classList.remove('hidden'));$('#helpClose').addEventListener('click',()=>$('#helpOverlay').classList.add('hidden'));$('#helpDone').addEventListener('click',()=>$('#helpOverlay').classList.add('hidden'));$('#helpOverlay').addEventListener('click',e=>{if(e.target.id==='helpOverlay')e.currentTarget.classList.add('hidden')});
$('#realChatBtn').addEventListener('click',()=>{const c=$('#realChatContainer');c.hidden=!c.hidden;if(!c.hidden&&!c.querySelector('iframe')){const f=document.createElement('iframe');f.title='Twitch-Chat von mrsroni';f.loading='lazy';f.referrerPolicy='strict-origin-when-cross-origin';f.src='https://www.twitch.tv/embed/mrsroni/chat?parent=soberarts.github.io&darkpopout';c.appendChild(f)}$('#realChatBtn').textContent=c.hidden?'ECHTEN TWITCH-CHAT LADEN ↗':'TWITCH-CHAT AUSBLENDEN ×'});
function takeover(on){if(on){$('#rescueGame').hidden=true;$('#takeoverReturn').hidden=false;$('#rescueFinish').hidden=true;} $('#takeover').classList.toggle('hidden',!on);if(on){$('#takeoverExit').focus();toast('WASCHKÜCHE.EXE: DIE MAUS IST ENTKOMMEN')}else $('#chaosBtn').focus()}
$('#chaosBtn').addEventListener('click',()=>takeover(true));$('#bigChaosBtn').addEventListener('click',()=>takeover(true));$('#takeoverExit').addEventListener('click',()=>takeover(false));$('#takeoverReturn').addEventListener('click',startRescue);let logoClicks=0,logoTimer;$('#brand').addEventListener('click',()=>{logoClicks++;clearTimeout(logoTimer);if(logoClicks>=5){logoClicks=0;takeover(true)}else{if(logoClicks===3)toast('SUSPICIOUS ACTIVITY DETECTED...');logoTimer=setTimeout(()=>logoClicks=0,2500)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#screensaver').classList.contains('hidden'))return;if(!$('#takeover').classList.contains('hidden'))takeover(false);else if(!$('#helpOverlay').classList.contains('hidden'))$('#helpOverlay').classList.add('hidden');else if(active)minimize(active)}});
function clock(){const now=new Date();$('#clock').textContent=now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}clock();setInterval(clock,30000);
let chatIndex=0;const lines=[['DJ_LUIGI','SOMEONE TURN UP THE BASS'],['MOE_FAN','DAS IST DER TRACK'],['FRITTY_PC','SYSTEMÜBERNAHME LÄUFT...'],['AFTERHOURS','RONI LEVEL 24 🖤'],['KIRBY_DJ','P O Y O  🪩']];setInterval(()=>{if($('#win-stream').getAttribute('aria-hidden')==='true')return;const [name,msg]=lines[chatIndex++%lines.length];const d=document.createElement('div'),b=document.createElement('b');b.className=chatIndex%2?'pink':'violet';b.textContent=name+': ';d.append(b,document.createTextNode(msg));$('#fakeChat').appendChild(d);while($('#fakeChat').children.length>7)$('#fakeChat').firstElementChild.remove()},4000);
})();

/* Dark Chrome mouse aura: follows cursor and lights up active window edges. */
(()=>{const aura=document.getElementById('cursorAura'),core=document.getElementById('cursorCore');if(!aura||!core||!matchMedia('(pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;let x=-600,y=-600,tx=-600,ty=-600;document.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;aura.style.opacity='1';core.style.opacity='1';core.style.left=tx+'px';core.style.top=ty+'px';const w=e.target&&e.target.closest?e.target.closest('.window'):null;if(w){const r=w.getBoundingClientRect();w.style.setProperty('--mx',(e.clientX-r.left)+'px');w.style.setProperty('--my',(e.clientY-r.top)+'px')}},{passive:true});document.addEventListener('pointerleave',()=>{aura.style.opacity='0';core.style.opacity='0'});function tick(){x+=(tx-x)*.17;y+=(ty-y)*.17;aura.style.left=x+'px';aura.style.top=y+'px';requestAnimationFrame(tick)}tick()})();
/* RONI.FM — local track + Spotify iFrame API, volume, beat engine, dancing mouse,
   Waschküchen-Mäuse, screensaver. */
(()=>{
 'use strict';
 const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const audio=$('#localSoundtrack'),enter=$('#enter');if(!audio||!enter)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 const say=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(say.t);say.t=setTimeout(()=>t.classList.remove('show'),2900)};
 const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
 const ICON_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>';
 const ICON_PAUSE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" fill="currentColor"/></svg>';

 /* ---------- state ---------- */
 let mode='idle'; // idle | local | spotify
 let ctx=null,analyser=null,gain=null,freq=null;
 // iOS: Web Audio is muted by the ringer/silent switch unless the page declares itself as music playback (iOS 17+).
 const isIOS=/iP(hone|ad|od)/.test(navigator.platform)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||/iPhone|iPad|iPod/.test(navigator.userAgent);
 const hasAudioSession='audioSession' in navigator;
 function claimPlayback(){try{if(hasAudioSession)navigator.audioSession.type='playback'}catch(e){}}
 const canAnalyse=location.protocol!=='file:'&&!!(window.AudioContext||window.webkitAudioContext)&&(!isIOS||hasAudioSession);
 let volume=+store.get('roni.vol',30);if(!(volume>=0&&volume<=100))volume=30;
 const gainFor=v=>Math.pow(v/100,1.6);

 /* ---------- volume ---------- */
 function applyVolume(){const g=gainFor(volume);if(gain)gain.gain.setTargetAtTime(g,ctx.currentTime,.03);else audio.volume=Math.min(1,g);$$('[data-volume]').forEach(i=>{i.value=volume;i.style.setProperty('--fill',volume+'%')});const o=$('#volOut');if(o)o.textContent=volume}
 let volJoke=0;
 $$('[data-volume]').forEach(input=>{input.addEventListener('input',()=>{volume=+input.value;applyVolume();store.set('roni.vol',volume)});input.addEventListener('change',()=>{if(volume===0){say('DJ MAUS IST BELEIDIGT. SIE DREHT SICH WEG.');$('#djMouse').classList.add('sulk')}else{$('#djMouse').classList.remove('sulk');if(volume===100&&Date.now()-volJoke>8000){volJoke=Date.now();say('NACHBARN INFORMIERT. DIE WASCHKÜCHE VIBRIERT.')}}})});
 applyVolume();

 /* ---------- Web Audio (analysis) ---------- */
 function initAudio(){claimPlayback();if(ctx||!canAnalyse)return;try{const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();const src=ctx.createMediaElementSource(audio);analyser=ctx.createAnalyser();analyser.fftSize=1024;analyser.smoothingTimeConstant=.35;analyser.minDecibels=-85;analyser.maxDecibels=-8;gain=ctx.createGain();src.connect(analyser);src.connect(gain);gain.connect(ctx.destination);freq=new Uint8Array(analyser.frequencyBinCount);audio.volume=1;applyVolume()}catch(e){ctx=null;gain=null;analyser=null}}

 /* ---------- local playback ---------- */
 function setMode(m){mode=m;document.documentElement.dataset.music=m;const playing=m==='local';$$('[data-play-toggle]').forEach(b=>{b.innerHTML=playing?ICON_PAUSE:ICON_PLAY;b.setAttribute('aria-label',playing?'Musik pausieren':'Musik abspielen')});$('#nowKicker').textContent=m==='idle'?'STANDBY':m==='local'?'NOW PLAYING / LOCAL':'NOW PLAYING / SPOTIFY';$('#radioToggle').classList.toggle('live',m!=='idle');$('#djQuote').textContent=pick(m==='idle'?IDLE_QUOTES:QUOTES);if(m==='idle')$('#bpmText').textContent='— BPM'}
 const birthdayAudio=$('#birthdayAudio');
 let birthdayActive=false, resumeBackground=false;
 const backgroundTitle=()=>audio.src.includes('yeat-myself.mp3')?'YEAT — MYSËLF':'KLAPS — L FOOT R FOOT';
 // Yeat is the intro; the previous background track repeats after it finishes.
 audio.addEventListener('ended',()=>{
   if(audio.src.includes('yeat-myself.mp3')){
     audio.src='birthday-track.mp3';audio.loop=true;audio.load();
     if(!birthdayActive)playLocal().catch(()=>say('MUSIK KANN NICHT AUTOMATISCH STARTEN. PLAY DRÜCKEN.'));
   }
 });
 function playLocal(){initAudio();if(ctx&&ctx.state==='suspended')ctx.resume();if(spotify.ctrl&&spotify.playing)spotify.ctrl.pause();
   if(birthdayActive){birthdayAudio.pause();birthdayActive=false;}
   $('#nowTitle').textContent=backgroundTitle();return audio.play().then(()=>setMode('local'))}
 birthdayAudio.volume=.18;
 const birthdayBtn=$('#birthdayTrackBtn');
 birthdayBtn.addEventListener('click',()=>{
   if(birthdayActive){birthdayAudio.pause();birthdayActive=false;birthdayBtn.innerHTML='LASS LOS — TOOLOUDFORTHEROOM <span>▸</span>';if(resumeBackground)playLocal().catch(()=>{});return}
   resumeBackground=!audio.paused;audio.pause();if(spotify.ctrl&&spotify.playing)spotify.ctrl.pause();
   birthdayAudio.currentTime=0;birthdayAudio.play().then(()=>{birthdayActive=true;setMode('idle');$('#nowTitle').textContent='TOOLOUDFORTHEROOM — LASS LOS';birthdayBtn.textContent='LASS LOS PAUSIEREN Ⅱ';say('BIRTHDAY TRACK: LASS LOS')}).catch(()=>{if(resumeBackground)playLocal().catch(()=>{});say('BROWSER BLOCKIERT AUDIO. NOCHMAL KLICKEN.')});
 });
 birthdayAudio.addEventListener('ended',()=>{birthdayActive=false;birthdayBtn.innerHTML='LASS LOS — TOOLOUDFORTHEROOM <span>▸</span>';if(resumeBackground)playLocal().catch(()=>{});});

 function pauseLocal(){audio.pause();if(mode==='local')setMode('idle')}
 $$('[data-play-toggle]').forEach(b=>b.addEventListener('click',()=>{if(mode==='local')pauseLocal();else{showTab('local');playLocal().catch(()=>say('BROWSER SAGT NEIN. NOCHMAL KLICKEN.'))}}));
 audio.addEventListener('pause',()=>{if(mode==='local')setMode('idle')});

 enter.addEventListener('click',()=>{loadSpotifyApi();playLocal().catch(()=>{const retry=()=>{playLocal().then(()=>document.removeEventListener('pointerdown',retry)).catch(()=>{})};document.addEventListener('pointerdown',retry)});setTimeout(scheduleRunner,7000)});

 /* ---------- dock ---------- */
 const radio=$('#radio'),toggle=$('#radioToggle');
 function openRadio(on){radio.hidden=!on;toggle.setAttribute('aria-expanded',String(on))}
 toggle.addEventListener('click',()=>openRadio(radio.hidden));
 const floorDj=$('#floorDj');if(floorDj)floorDj.addEventListener('click',()=>{openRadio(true);if(mode==='idle')say('DJ MAUS WARTET. DRÜCK PLAY, DANN GEHT SIE AB.')});
 $('#radioClose').addEventListener('click',()=>openRadio(false));
 function showTab(src){$$('[data-source]').forEach(t=>t.setAttribute('aria-selected',String(t.dataset.source===src)));$('#panelLocal').hidden=src!=='local';$('#panelSpotify').hidden=src!=='spotify';if(src==='spotify')spotify.ensure()}
 $$('[data-source]').forEach(t=>t.addEventListener('click',()=>showTab(t.dataset.source)));

 /* ---------- Spotify iFrame API ---------- */
 const DEFAULT_URI='spotify:playlist:4YqqaSnGht8rYsXo4Zx3de';
 const spotify={api:null,ctrl:null,playing:false,pending:null,creating:false,
  ensure(uri){if(uri)this.pending=uri;if(this.ctrl){if(this.pending){this.ctrl.loadUri(this.pending);this.wantPlay=true;this.pending=null;setTimeout(()=>{if(this.wantPlay)this.ctrl.play()},1200)}return}loadSpotifyApi();if(!this.api||this.creating)return;this.creating=true;const el=$('#spotifyEmbed');const first=this.pending||DEFAULT_URI;const autoplay=!!this.pending;this.pending=null;
   this.api.createController(el,{uri:first,width:'100%',height:152},c=>{this.ctrl=c;this.wantPlay=autoplay;c.addListener('ready',()=>{if(this.wantPlay){c.play()}});c.addListener('playback_update',e=>{const d=e&&e.data||{};const now=!d.isPaused&&!d.isBuffering&&d.position>0;if(now!==this.playing){this.playing=now;if(now){this.wantPlay=false;if(mode==='local'||!audio.paused)audio.pause();setMode('spotify')}else if(mode==='spotify')setMode('idle')}})})}};
 let apiRequested=false;
 function loadSpotifyApi(){if(apiRequested)return;apiRequested=true;window.onSpotifyIframeApiReady=api=>{spotify.api=api;if(!$('#panelSpotify').hidden||spotify.pending)spotify.ensure()};const s=document.createElement('script');s.src='https://open.spotify.com/embed/iframe-api/v1';s.async=true;s.onerror=()=>{const f=document.createElement('iframe');f.src='https://open.spotify.com/embed/playlist/4YqqaSnGht8rYsXo4Zx3de?theme=0';f.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';f.title='Spotify-Playlist';f.style.cssText='width:100%;height:152px;border:0;border-radius:12px';$('#spotifyEmbed').replaceWith(f)};document.head.appendChild(s)}
 document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('[data-spotify]'):null;if(!b)return;e.preventDefault();openRadio(true);showTab('spotify');$('#nowTitle').textContent=b.dataset.label||'SPOTIFY';pauseLocal();spotify.ensure(b.dataset.spotify);say('RONI.FM LÄDT: '+(b.dataset.label||'SPOTIFY')+'. DJ MAUS MACHT SICH WARM.')});

 /* ---------- beat engine ---------- */
 const QUOTES=['DROP IN 3… 2… WÄSCHE.','DIESER BEAT RIECHT NACH WEICHSPÜLER.','ICH BIN NICHT DIE MAUS AUS DER WASCHKÜCHE. ICH BIN IHR DJ.','128 BPM = SCHLEUDERGANG.','HAPPY BIRTHDAY RONI. MIETE ZAHL ICH NICHT.','SONNENBRILLE BLEIBT AUF. AUCH NACHTS.','HÄNDE HOCH, PFOTEN HOCH.'];
 const IDLE_QUOTES=['DJ MAUS WARTET AUF DEN DROP.','STILLE. DIE MAUS HÖRT DICH ATMEN.','DRÜCK PLAY. DIE MAUS WIRD UNRUHIG.'];
 const pick=a=>a[Math.floor(Math.random()*a.length)];
 const dj=$('#djMouse'),eqBars=$$('#radioEq i'),leds=$$('.beat-led'),flash=$('#beatFlash'),aura=$('#cursorAura');
 let beatN=0,lastBeat=0,intervals=[],energyHist=[];
 const MOVES=[
  [{transform:'none'},{transform:'translateY(-16px) scale(.95,1.06)',offset:.35},{transform:'translateY(0) scale(1.07,.93)',offset:.75},{transform:'none'}],
  [{transform:'none'},{transform:'rotate(-11deg) translateX(-7px)',offset:.4},{transform:'none'}],
  [{transform:'none'},{transform:'translateY(-10px)',offset:.35},{transform:'none'}],
  [{transform:'none'},{transform:'rotate(11deg) translateX(7px)',offset:.4},{transform:'none'}],
  [{transform:'none'},{transform:'scale(1.14,.84)',offset:.3},{transform:'scale(.94,1.08)',offset:.65},{transform:'none'}],
  [{transform:'none'},{transform:'translateY(-18px) rotate(-4deg)',offset:.4},{transform:'none'}],
  [{transform:'none'},{transform:'rotate(7deg)',offset:.25},{transform:'rotate(-7deg)',offset:.6},{transform:'none'}],
  [{transform:'none'},{transform:'translateY(-22px) rotateY(180deg)',offset:.5},{transform:'rotateY(360deg)'}]];
 function onBeat(synthetic){const now=performance.now();const gap=now-lastBeat;if(!synthetic&&lastBeat&&gap<1300){intervals.push(gap);if(intervals.length>12)intervals.shift()}lastBeat=now;beatN++;
  const sorted=intervals.slice().sort((a,b)=>a-b);const med=sorted.length>3?sorted[sorted.length>>1]:0;if(med){let bpm=60000/med;while(bpm<90)bpm*=2;while(bpm>180)bpm/=2;$('#bpmText').textContent=Math.round(bpm)+' BPM'}
  leds.forEach(l=>{l.classList.remove('on');void l.offsetWidth;l.classList.add('on')});
  if(reduced)return;
  const dur=Math.max(180,Math.min(420,(med||460)*.85));
  document.dispatchEvent(new CustomEvent('roni:beat',{detail:{n:beatN,dur}}));
  if(!dj.classList.contains('sulk')){const move=beatN%16===0?MOVES[7]:MOVES[beatN%7];if(!radio.hidden)dj.animate(move,{duration:beatN%16===0?dur*1.8:dur,easing:'cubic-bezier(.2,.9,.3,1.25)'})}
  $$('[data-dance]').forEach((el,i)=>{if(el.offsetParent)el.animate([{transform:'none'},{transform:`translateY(-${i?6:3}px) rotate(${beatN%2?-6:6}deg)`},{transform:'none'}],{duration:dur*.9,easing:'ease-out',composite:'add'})});
  $$('.runner .body').forEach(el=>el.animate([{scale:'1'},{scale:'1.08 .92'},{scale:'1'}],{duration:dur*.8}));
  if(flash)flash.animate([{opacity:0},{opacity:beatN%4===0?.55:.28},{opacity:0}],{duration:dur*1.2,easing:'ease-out'});
  if(aura)aura.animate([{scale:'1'},{scale:'1.22'},{scale:'1'}],{duration:dur*1.1,easing:'ease-out'});
  if(beatN%32===0)$('#djQuote').textContent=pick(QUOTES)}
 let synthNext=0,prevBass=0;
 function loop(){const t=performance.now();
  if(mode==='local'&&analyser&&!audio.paused){analyser.getByteFrequencyData(freq);
   const bass=(freq[1]+freq[2]+freq[3]+freq[4]+freq[5])/5;energyHist.push(bass);if(energyHist.length>60)energyHist.shift();const avg=energyHist.reduce((a,b)=>a+b,0)/energyHist.length;const sd=Math.sqrt(energyHist.reduce((a,b)=>a+(b-avg)*(b-avg),0)/energyHist.length);
   const rising=bass>prevBass;prevBass=bass;
   if(rising&&bass>avg+Math.max(4,sd*.9)&&bass>40&&t-lastBeat>280)onBeat();
   else if(t-lastBeat>(bass>30?1400:470))onBeat(true); // breakdown or no signal (e.g. iOS): keep grooving // breakdown: keep the mouse grooving
   if(!radio.hidden)eqBars.forEach((b,i)=>{const lo=Math.floor(Math.pow(1.6,i)),hi=Math.max(lo+1,Math.floor(Math.pow(1.6,i+1)));let s=0;for(let k=lo;k<hi&&k<freq.length;k++)s+=freq[k];b.style.transform=`scaleY(${Math.max(.08,s/(hi-lo)/255)})`})}
  else if(mode==='spotify'||(mode==='local'&&!analyser&&!audio.paused)){const iv=60000/126;if(t>=synthNext){synthNext=t+iv;onBeat(mode==='local')}if(!radio.hidden){const ph=1-Math.min(1,(synthNext-t)/iv);eqBars.forEach((b,i)=>{b.style.transform=`scaleY(${Math.max(.08,(1-ph)*(.45+.55*Math.abs(Math.sin(i*1.7+t/240))))})`})}}
  else if(!radio.hidden)eqBars.forEach(b=>{b.style.transform='scaleY(.06)'})}
 setInterval(loop,16);
 setMode('idle');
 Object.assign(window.RONI,{
  beat:()=>onBeat(true),
  pauseMusic(){pauseLocal();if(spotify.ctrl&&spotify.playing)spotify.ctrl.pause()},
  gain:()=>gainFor(volume),
  say,store,
  runMouse:(kind,custom)=>runOnce(kind||'talk',custom),
  duck(ms){if(mode!=='local')return false;const g=gainFor(volume);if(gain){gain.gain.setTargetAtTime(g*.25,ctx.currentTime,.08);setTimeout(()=>gain.gain.setTargetAtTime(gainFor(volume),ctx.currentTime,.3),ms)}else{audio.volume=Math.min(1,g*.25);setTimeout(()=>applyVolume(),ms)}return true},
  lane:{make:(size,dir,custom)=>makeRunner(size,dir,custom),moveX:(...a)=>moveX(...a),talk:(...a)=>talk(...a),catchable:el=>catchable(el),sleep:ms=>sleep(ms),el:()=>lane}});
 /* ---------- Waschküchen-Mäuse am unteren Rand ---------- */
 const lane=$('#mouseLane');let sightings=+store.get('roni.mice',0)||0;$('#mouseCount').textContent=sightings;
 const LINES=['ICH WOHN HIER JETZT.','MIETE? NIE GEHÖRT.','40° SCHONWASCHGANG = 128 BPM.','SAG RONI NIX.','HAPPY BIRTHDAY, MITBEWOHNERIN.','ICH HAB DEINE SOCKEN. ALLE.','WASCHKÜCHE AFTERHOUR AB 4 UHR.','ICH BIN NUR AUF DER DURCHREISE.','HAST DU MICH GESEHEN? NEIN.','FRITTY-PC HAT MICH EINGELADEN.','ICH HAB DEN WEICHSPÜLER GETRUNKEN. ER WAR OKAY.','RONI, DEINE WASCHMASCHINE HAT MIR EINEN BEAT GESCHICKT.'];
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const bubbleMs=text=>Math.max(4500,Math.min(7000,2600+text.length*85));
 const FILTERS={chrome:'grayscale(1) brightness(1.18) contrast(1.15)',gold:'sepia(1) saturate(3.2) hue-rotate(-12deg) brightness(1.08)',pink:'sepia(1) saturate(4) hue-rotate(275deg) brightness(1.05)',lila:'sepia(1) saturate(3) hue-rotate(220deg)',schwarz:'brightness(.42) contrast(1.5)'};
 const HAT_SVG={party:'<svg class="acc acc-party" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 2 L27 38 H3 Z" fill="#ff8fe0" stroke="#0b0710" stroke-width="2"/><path d="M9 20 L21 20 M6 30 L24 30" stroke="#fff" stroke-width="3"/><circle cx="15" cy="3" r="3.5" fill="#ffd27a" stroke="#0b0710"/></svg>',crown:'<svg class="acc acc-crown" viewBox="0 0 40 26" aria-hidden="true"><path d="M3 24 L3 6 L12 15 L20 3 L28 15 L37 6 L37 24 Z" fill="#ffd27a" stroke="#0b0710" stroke-width="2"/><circle cx="20" cy="17" r="3" fill="#ff4fc4"/></svg>'};
 const CHAIN_SVG='<svg class="acc acc-chain" viewBox="0 0 40 24" aria-hidden="true"><path d="M3 3 Q20 26 37 3" fill="none" stroke="#ffd27a" stroke-width="3" stroke-dasharray="4 2"/><circle cx="20" cy="15" r="5" fill="#ffd27a" stroke="#0b0710" stroke-width="1.5"/></svg>';
 const HEART_SVG='<svg class="acc acc-heart" viewBox="0 0 44 18" aria-hidden="true"><path d="M11 16 C1 9 3 1 11 6 C19 1 21 9 11 16 Z M33 16 C23 9 25 1 33 6 C41 1 43 9 33 16 Z" fill="#ff4fc4" stroke="#0b0710" stroke-width="1.5"/></svg>';
 function customCfg(){try{const c=JSON.parse(store.get('roni.mouse',''));return c&&c.released?c:null}catch(e){return null}}
 function makeRunner(size,dir,custom){const b=document.createElement('button');b.type='button';b.className='runner';b.style.setProperty('--s',size+'px');b.style.setProperty('--dir',dir);b.setAttribute('aria-label',custom?custom.name+' fangen':'Maus aus der Waschküche fangen');
  let acc='';if(custom){acc=(HAT_SVG[custom.hat]||'')+(custom.chain?CHAIN_SVG:'')+(custom.glasses==='heart'?HEART_SVG:'')}
  b.innerHTML='<span class="jump"><span class="body"><img alt="" src="techno-mouse.png">'+acc+'</span></span>'+(custom?'<span class="name-tag"></span>':'');
  if(custom){$('img',b).style.filter=(FILTERS[custom.color]||'')+' drop-shadow(0 4px 5px #000b)';$('.name-tag',b).textContent=custom.name}
  lane.appendChild(b);return b}
 function moveX(el,from,to,speed){const a=el.animate([{transform:`translateX(${from}px)`},{transform:`translateX(${to}px)`}],{duration:Math.abs(to-from)/speed,easing:'linear',fill:'forwards'});el._anim=a;return a.finished}
 function bubble(el,text){const s=document.createElement('span');s.className='bubble';s.textContent=text;el.appendChild(s);return sleep(bubbleMs(text)).then(()=>s.remove())}
 /* Every speech bubble = the mouse stands still (and bobs to the beat). */
 async function talk(els,text,cls){els=[].concat(els);els.forEach(el=>{if(el._anim)el._anim.pause();el.classList.remove('running','fast','moonwalk');el.classList.add(cls||'talking')});await bubble(els[0],text);els.forEach(el=>el.classList.remove('talking','dancing'))}
 function catchable(el){el.addEventListener('click',()=>{if(el._caught)return;el._caught=true;if(el._anim)el._anim.pause();sightings++;store.set('roni.mice',sightings);$('#mouseCount').textContent=sightings;say(sightings===1?'MAUS GESICHTET! FRITTY-PC INFORMIERT DIE HAUSVERWALTUNG.':sightings%10===0?`${sightings} MÄUSE. DAS IST KEINE WASCHKÜCHE MEHR, DAS IST EIN CLUB.`:pick(['MAUS GESICHTET (#'+sightings+'). SIE HAT GEZWINKERT.','ERWISCHT. SIE BEHAUPTET, SIE SEI DEKO.','DIE MAUS HAT IHREN ANWALT ANGERUFEN.','MAUS #'+sightings+' FLÜCHTET IN DEN WÄSCHEKORB.']));const j=$('.jump',el);j.animate([{transform:'none',opacity:1},{transform:'translateY(-90px) rotate(260deg) scale(.9)',opacity:1,offset:.55},{transform:'translateY(-160px) rotate(620deg) scale(.2)',opacity:0}],{duration:850,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'}).finished.then(()=>el.remove())})}
 async function runOnce(kind,forceCustom){const W=innerWidth,size=Math.round(Math.min(78,Math.max(52,W*.05))),dir=Math.random()<.5?1:-1;const left=-size-30,right=W+30;const from=dir>0?left:right,to=dir>0?right:left;
  const saved=customCfg();const custom=forceCustom||(saved&&Math.random()<.45?saved:null);
  try{
   if(kind==='conga'){const n=5,els=[],gap=size*.9,mid=W*(.35+Math.random()*.3);for(let i=0;i<n;i++){const r=makeRunner(size*.8,dir,i===0?custom:null);r.classList.add('running');catchable(r);els.push(r)}
    const legs=els.map((r,i)=>moveX(r,from-dir*i*gap,mid-dir*i*gap,.28));await legs[0];const alive=els.filter(r=>r.isConnected&&!r._caught);if(alive.length){await talk(alive,'WASCHKÜCHEN-POLONAISE! ALLE MITMACHEN!','dancing');}
    await Promise.all(els.map((r,i)=>{if(!r.isConnected||r._caught)return null;r.classList.add('running');return moveX(r,mid-dir*i*gap,to-dir*i*gap,.4).then(()=>r.remove())}));return}
   const el=makeRunner(size,dir,custom);catchable(el);const live=()=>el.isConnected&&!el._caught;
   if(kind==='sprint'){el.classList.add('running','fast');await moveX(el,from,to,.95)}
   else{el.classList.add('running');const mid=W*(.25+Math.random()*.5);await moveX(el,from,mid,.32);if(!live())return;
    if(kind==='moonwalk'){await talk(el,'MOONWALK.EXE WIRD GELADEN… BITTE NICHT STÖREN.');if(!live())return;el.classList.add('moonwalk');await moveX(el,mid,from,.16);return el.remove()}
    let line=pick(LINES);if(custom){line=pick([custom.quote||line,'ICH BIN '+custom.name+'. RONI HAT MICH GEBAUT.',line])}
    if(kind==='dance')await talk(el,'DER BEAT HIER IST BESSER ALS IN DER WASCHKÜCHE.','dancing');else await talk(el,line);
    if(!live())return;el.classList.add('running','fast');await moveX(el,mid,to,.7)}
   el.remove()}catch(e){}}
 let runnerTimer;
 function scheduleRunner(){clearTimeout(runnerTimer);if(reduced)return;runnerTimer=setTimeout(()=>{if(!document.hidden&&$('#boot').classList.contains('hidden')&&$('#screensaver').classList.contains('hidden')){const r=Math.random();runOnce(r<.28?'sprint':r<.6?'talk':r<.76?'moonwalk':r<.9?(mode==='idle'?'talk':'dance'):'conga')}scheduleRunner()},16000+Math.random()*26000)}
 // Cheat code: type M-A-U-S
 let typed='';document.addEventListener('keydown',e=>{if(e.target&&e.target.closest&&e.target.closest('input,textarea'))return;typed=(typed+(e.key||'')).slice(-4).toUpperCase();if(typed==='MAUS'&&$('#boot').classList.contains('hidden')){typed='';say('MAUS-INVASION AUTORISIERT. RONI, DAS WAR DEINE IDEE.');for(let i=0;i<14;i++)setTimeout(()=>runOnce('sprint'),i*220+Math.random()*200)}});
})();

// RONI.OS: Mouse capture system rescue minigame
const $=(selector)=>document.querySelector(selector);
const charges=['Hat einen Discord-Call gestartet und aus Versehen bis morgen durchgezogen.','Hat den Bass lauter gemacht, obwohl schon alles gewackelt hat.','Hat in der Waschküche eine Maus als Mitbewohnerin angemeldet.','Hat Fritty mit Musikgeschmack angesteckt.','Ist 24 geworden, ohne den Patch Notes zuzustimmen.'];let charge=0;
$('#nextCharge').addEventListener('click',()=>{$('#chargeText').textContent='TATVORWURF: '+charges[++charge%charges.length]});
$('#verdictBtn').addEventListener('click',()=>{$('#verdictText').textContent='FREISPRUCH ABGELEHNT. BEGRÜNDUNG: ZU ICONIC. AKTE WIRD AN DIE WASCHKÜCHE WEITERGELEITET.'});
let catches=0;function moveMouse(){const arena=$('#rescueArena'),mouse=$('#catchMouse');const w=Math.max(0,arena.clientWidth-mouse.offsetWidth-8),h=Math.max(0,arena.clientHeight-mouse.offsetHeight-8);mouse.style.left=(4+Math.random()*w)+'px';mouse.style.top=(4+Math.random()*h)+'px'}
function startRescue(){$('#catchMouse').hidden=false;$('#rescueInstruction').textContent='FANGE DIE WASCHKÜCHEN-MAUS DREIMAL. SIE WECHSELT IHRE POSITION.';$('#rescueGame').hidden=false;$('#takeoverReturn').hidden=true;catches=0;$('#rescueProgress').textContent='0 / 3';$('#rescueFeedback').textContent='WARNUNG: MAUS HAT ADMINRECHTE.';$('#rescueFinish').hidden=true;requestAnimationFrame(moveMouse)}
$('#catchMouse').addEventListener('click',()=>{catches++;$('#rescueProgress').textContent=catches+' / 3';$('#rescueFeedback').textContent=['','MAUS GESICHTET. SIE LACHT DICH AUS.','FRITTY-PC: NOCH EIN KLICK, RONI!','SYSTEM GEREINIGT. MAUS HAT KÜNDIGUNG ERHALTEN.'][catches];if(catches>=3){$('#catchMouse').hidden=true;$('#rescueFinish').hidden=false;$('#rescueInstruction').textContent='DU HAST DEN PC GERETTET. DIE WASCHKÜCHE BLEIBT TROTZDEM VERDÄCHTIG.'}else moveMouse()});
$('#rescueFinish').addEventListener('click',()=>{$('#catchMouse').hidden=false;takeover(false)});
