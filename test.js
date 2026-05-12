// ===== KONFIGURASI =====
let move_speed = 3;
let gravity = 0.5;

// ===== ELEMEN =====
let bird        = document.getElementById('bird');
let ground      = document.getElementById('ground');
let scoreVal    = document.getElementById('scoreVal');
let scoreTitle  = document.getElementById('scoreTitle');
let message     = document.getElementById('message');
let gameOverScreen    = document.getElementById('gameOverScreen');
let finalScoreEl      = document.getElementById('finalScore');
let bestScoreDisplay  = document.getElementById('bestScoreDisplay');
let newBestBadge      = document.getElementById('newBestBadge');
let medalEl           = document.getElementById('medal');

// ===== STATE =====
let game_state = 'Start';
let best_score = parseInt(localStorage.getItem('flappy_best') || '0');
bestScoreDisplay.innerHTML = best_score;

// ===== SOUND EFFECTS (Web Audio API, tidak perlu file .mp3) =====
function makeSound(freq, duration, type = 'sine') {
  try {
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let osc  = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

function playJump()  { makeSound(500, 0.1, 'square'); makeSound(700, 0.08, 'square'); }
function playCrash() { makeSound(200, 0.3, 'sawtooth'); makeSound(100, 0.5, 'sawtooth'); }
function playScore() { makeSound(800, 0.05); makeSound(1000, 0.1); }
function playStart() { makeSound(400, 0.1); makeSound(600, 0.1); makeSound(800, 0.2); }

// ===== GAME OVER =====
function showGameOver() {
  let current = parseInt(scoreVal.innerHTML) || 0;
  finalScoreEl.innerHTML = current;

  let isNewBest = current > best_score;
  if (isNewBest) {
    best_score = current;
    localStorage.setItem('flappy_best', best_score);
    newBestBadge.classList.add('show');
  } else {
    newBestBadge.classList.remove('show');
  }

  bestScoreDisplay.innerHTML = best_score;

  // Medal sesuai skor
  if      (current === 0)  medalEl.innerHTML = '💀';
  else if (current < 5)    medalEl.innerHTML = '🥉';
  else if (current < 15)   medalEl.innerHTML = '🥈';
  else if (current < 30)   medalEl.innerHTML = '🥇';
  else                     medalEl.innerHTML = '🏆';

  gameOverScreen.classList.add('active');
  playCrash();
}

// ===== RESTART =====
function restartGame() {
  gameOverScreen.classList.remove('active');
  document.querySelectorAll('.pipe_sprite').forEach(e => e.remove());

  // Reset posisi & rotasi burung
  bird.style.top = '40vh';
  bird.style.transform = 'rotate(0deg)';

  // Reset kecepatan
  move_speed = 3;

  // Reset skor
  game_state = 'Play';
  message.classList.add('hidden');
  scoreTitle.innerHTML = 'Skor';
  scoreVal.innerHTML = '0';

  playStart();
  play();
}

// ===== INPUT: KEYBOARD =====
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && game_state === 'Start') {
    restartGame();
  }
});

// ===== INPUT: TOUCH (mulai game) =====
document.addEventListener('touchstart', (e) => {
  if (game_state === 'Start') {
    e.preventDefault();
    restartGame();
  }
}, { passive: false });

// ===== MAIN GAME LOOP =====
function play() {
  let groundRect = ground.getBoundingClientRect();
  let bird_props = bird.getBoundingClientRect();

  // ----- PIPE MOVEMENT -----
  function move() {
    if (game_state !== 'Play') return;

    bird_props = bird.getBoundingClientRect();

    document.querySelectorAll('.pipe_sprite').forEach((el) => {
      let pp = el.getBoundingClientRect();

      // Hapus pipa yang sudah keluar layar
      if (pp.right <= 0) {
        el.remove();
        return;
      }

      // Deteksi tabrakan burung vs pipa
      if (
        bird_props.left   < pp.left + pp.width  &&
        bird_props.left   + bird_props.width > pp.left &&
        bird_props.top    < pp.top + pp.height  &&
        bird_props.top    + bird_props.height > pp.top
      ) {
        game_state = 'End';
        showGameOver();
        return;
      }

      // Tambah skor saat berhasil lewati pipa
      if (
        pp.right < bird_props.left &&
        pp.right + move_speed >= bird_props.left &&
        el.dataset.scoreable === '1'
      ) {
        let cur = parseInt(scoreVal.innerHTML) + 1;
        scoreVal.innerHTML = cur;
        playScore();

        // Tambah kecepatan setiap 10 poin
        if (cur % 10 === 0) move_speed += 0.5;
      }

      el.style.left = pp.left - move_speed + 'px';
    });

    requestAnimationFrame(move);
  }
  requestAnimationFrame(move);

  // ----- GRAVITY & PHYSICS -----
  let bird_dy = 0;

  function applyGravity() {
    if (game_state !== 'Play') return;

    bird_dy   += gravity;
    bird_props = bird.getBoundingClientRect();

    // Kemiringan burung mengikuti kecepatan vertikal
    let tilt = Math.min(bird_dy * 3, 90);
    bird.style.transform = `rotate(${tilt}deg)`;

    // Tabrakan dengan langit-langit atau tanah
    if (bird_props.top <= 0 || bird_props.bottom >= groundRect.top) {
      game_state = 'End';
      showGameOver();
      return;
    }

    bird.style.top = bird_props.top + bird_dy + 'px';
    requestAnimationFrame(applyGravity);
  }
  requestAnimationFrame(applyGravity);

  // ----- JUMP -----
  function doJump() {
    if (game_state !== 'Play') return;
    bird_dy = -7.6;
    playJump();
  }

  // Keyboard jump
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
      doJump();
    }
  });

  // Touch jump
  document.addEventListener('touchstart', (e) => {
    if (game_state !== 'Play') return;
    e.preventDefault();
    doJump();
  }, { passive: false });

  // ----- PIPE SPAWNER -----
  let pipe_separation = 0;
  let pipe_gap = 38; // jarak antar pipa atas & bawah (vh)

  function createPipe() {
    if (game_state !== 'Play') return;

    if (pipe_separation > 115) {
      pipe_separation = 0;

      // Posisi acak untuk pipa (vh)
      let pipe_posi = Math.floor(Math.random() * 40) + 10;

      // Pipa atas
      let pipeTop = document.createElement('div');
      pipeTop.className = 'pipe_sprite top';
      pipeTop.style.top    = (pipe_posi - 70) + 'vh';
      pipeTop.style.left   = '100vw';
      pipeTop.style.height = '70vh';
      document.body.appendChild(pipeTop);

      // Pipa bawah (pencatat skor)
      let pipeBot = document.createElement('div');
      pipeBot.className = 'pipe_sprite bottom';
      pipeBot.style.top    = (pipe_posi + pipe_gap) + 'vh';
      pipeBot.style.left   = '100vw';
      pipeBot.style.height = '70vh';
      pipeBot.dataset.scoreable = '1';
      document.body.appendChild(pipeBot);
    }

    pipe_separation++;
    requestAnimationFrame(createPipe);
  }
  requestAnimationFrame(createPipe);
}
