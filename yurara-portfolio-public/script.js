const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const musicButton = document.querySelector('.music-player');
const melody = [523.25,659.25,783.99,880,783.99,659.25,587.33,659.25,783.99,987.77,880,783.99];
let audioContext;
let musicTimer;
let activeOscillators = new Set();

function playPhrase() {
  const start = audioContext.currentTime + 0.05;
  melody.forEach((frequency,index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    const noteStart = start + index * 0.28;
    gain.gain.setValueAtTime(0,noteStart);
    gain.gain.linearRampToValueAtTime(0.035,noteStart + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001,noteStart + 0.62);
    oscillator.connect(gain).connect(audioContext.destination);
    activeOscillators.add(oscillator);
    oscillator.addEventListener('ended',() => activeOscillators.delete(oscillator),{once:true});
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.64);
  });
}

musicButton.addEventListener('click', async () => {
  if (audioContext) {
    clearInterval(musicTimer);
    activeOscillators.forEach(oscillator => { try { oscillator.stop(); } catch {} });
    activeOscillators.clear();
    await audioContext.close();
    audioContext = null;
    musicButton.classList.remove('playing');
    musicButton.setAttribute('aria-pressed','false');
    musicButton.setAttribute('aria-label','BGMを再生');
    musicButton.querySelector('.music-icon').textContent = '♪';
    musicButton.querySelector('b').textContent = 'PLAY BGM';
    return;
  }
  audioContext = new AudioContext();
  await audioContext.resume();
  playPhrase();
  musicTimer = setInterval(playPhrase,3500);
  musicButton.classList.add('playing');
  musicButton.setAttribute('aria-pressed','true');
  musicButton.setAttribute('aria-label','BGMを停止');
  musicButton.querySelector('.music-icon').textContent = 'Ⅱ';
  musicButton.querySelector('b').textContent = 'NOW PLAYING';
});
