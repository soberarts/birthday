const startBtn = document.getElementById('startBtn');
const mixtape = document.getElementById('mixtape');
const finalSection = document.getElementById('final');
const surpriseBtn = document.getElementById('surpriseBtn');
const surpriseMessage = document.getElementById('surpriseMessage');

startBtn.addEventListener('click', () => {
  mixtape.classList.remove('hidden');
  startBtn.textContent = 'Mixtape ist geöffnet ✓';
  startBtn.disabled = true;
  mixtape.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

surpriseBtn.addEventListener('click', () => {
  surpriseMessage.classList.remove('hidden');
  surpriseBtn.textContent = 'Bonus-Track freigeschaltet ✓';
  surpriseBtn.disabled = true;
  setTimeout(() => finalSection.classList.remove('hidden'), 650);
  setTimeout(() => finalSection.scrollIntoView({ behavior: 'smooth', block: 'center' }), 800);
});

document.getElementById('replayBtn').addEventListener('click', () => {
  mixtape.classList.add('hidden');
  finalSection.classList.add('hidden');
  surpriseMessage.classList.add('hidden');
  surpriseBtn.disabled = false;
  surpriseBtn.innerHTML = 'Bonus-Track freischalten <span>＋</span>';
  startBtn.disabled = false;
  startBtn.innerHTML = 'Mixtape öffnen <span>↗</span>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


const afterparty = document.getElementById('afterparty');
const afterpartyBtn = document.getElementById('afterpartyBtn');
const closeAfterparty = document.getElementById('closeAfterparty');

function openAfterparty() {
  afterparty.classList.remove('hidden');
  afterparty.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function hideAfterparty() {
  afterparty.classList.add('hidden');
  afterparty.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
afterpartyBtn.addEventListener('click', openAfterparty);
closeAfterparty.addEventListener('click', hideAfterparty);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !afterparty.classList.contains('hidden')) hideAfterparty();
});
