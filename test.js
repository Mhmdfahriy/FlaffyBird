// Seleksi Elemen DOM
const bird = document.querySelector('.bird');
const message = document.querySelector('.message');
const scoreVal = document.querySelector('.score_val');
const gameOverScreen = document.getElementById('gameOverScreen');
const currentScoreText = document.getElementById('currentScore');
const bestScoreText = document.getElementById('bestScore');
const restartBtn = document.getElementById('restartBtn');

// Seleksi Elemen Audio Lengkap
const bgMusic = document.getElementById('bgMusic');
const soundJump = document.getElementById('soundJump');
const soundPoint = document.getElementById('soundPoint');
const soundCrash = document.getElementById('soundCrash');

// Variabel State Game
let game_state = 'Start';
let gravity = 0.4;
let jump_strength = -7;
let bird_dy = 0;
let score = 0;

// Menyimpan rekor tertinggi di browser (Local Storage)
let high_score = localStorage.getItem('fb_high_score') || 0;

// Pengaturan Pergerakan Game
const pipe_speed = 4;
const pipe_gap = 32; 
let pipe_timer = 0;
let animation_id;

// Listener Input untuk Laptop (Keyboard) dan HP (Sentuh Layar)
window.addEventListener('keydown', handleInput);
window.addEventListener('touchstart', handleInput);

function handleInput(e) {
  if (e.target === restartBtn) return;

  if (game_state === 'Start') {
    if (e.key === 'Enter' || e.type === 'touchstart') {
      startGame();
    }
  } else if (game_state === 'Play') {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.type === 'touchstart') {
      bird_dy = jump_strength;
      
      // 1. Efek suara saat melompat/di-tap
      soundJump.currentTime = 0; 
      soundJump.play().catch(err => console.log("Audio play diblokir:", err));
    }
  }
}

// Event Listener khusus tombol restart
restartBtn.addEventListener('click', restartGame);

function startGame() {
  game_state = 'Play';
  message.style.display = 'none';
  bird.style.display = 'block';
  bird.style.top = '40vh';
  bird_dy = 0;
  score = 0;
  scoreVal.innerHTML = score;
  gameOverScreen.style.display = 'none';
  pipe_timer = 0;

  // 2. Mainkan musik background (start.mp3) saat game mulai
  bgMusic.currentTime = 0;
  bgMusic.play().catch(err => console.log("Menunggu interaksi pertama untuk BGM..."));
  
  document.querySelectorAll('.pipe_sprite').forEach(pipe => pipe.remove());
  
  requestAnimationFrame(updateGame);
}

// Loop Utama Game
function updateGame() {
  if (game_state !== 'Play') return;

  // Efek Gravitasi pada Burung
  bird_dy += gravity;
  let bird_top = parseFloat(bird.style.top) || 40;
  let new_top = bird_top + (bird_dy * 0.15); 
  bird.style.top = new_top + 'vh';

  const bird_props = bird.getBoundingClientRect();
  const bg_props = document.body.getBoundingClientRect();

  // Deteksi jika burung menabrak langit atau jatuh ke dasar tanah
  if (bird_props.top <= 0 || bird_props.bottom >= bg_props.bottom) {
    endGame();
    return;
  }

  // Logika Pembuatan Pipa Baru
  if (pipe_timer > 120) {
    pipe_timer = 0;
    let pipe_posi = Math.floor(Math.random() * (60 - 25)) + 25; 

    let pipe_top = document.createElement('div');
    pipe_top.className = 'pipe_sprite pipe_top';
    pipe_top.style.top = '0vh';
    pipe_top.style.height = (pipe_posi - pipe_gap / 2) + 'vh';
    pipe_top.style.left = '100vw';
    pipe_top.dataset.passed = 'false';

    let pipe_bottom = document.createElement('div');
    pipe_bottom.className = 'pipe_sprite';
    pipe_bottom.style.top = (pipe_posi + pipe_gap / 2) + 'vh';
    pipe_bottom.style.height = (100 - (pipe_posi + pipe_gap / 2)) + 'vh';
    pipe_bottom.style.left = '100vw';
    pipe_bottom.dataset.passed = 'false';

    document.body.appendChild(pipe_top);
    document.body.appendChild(pipe_bottom);
  }
  pipe_timer++;

  // Pergerakan Pipa dan Deteksi Tabrakan (Collision)
  let pipes = document.querySelectorAll('.pipe_sprite');
  pipes.forEach((pipe) => {
    let pipe_props = pipe.getBoundingClientRect();

    if (
      bird_props.left < pipe_props.right &&
      bird_props.right > pipe_props.left &&
      bird_props.top < pipe_props.bottom &&
      bird_props.bottom > pipe_props.top
    ) {
      endGame();
      return;
    }

    let pipe_left = parseFloat(pipe.style.left);
    if (pipe_left <= -10) {
      pipe.remove();
    } else {
      if (pipe.dataset.passed === 'false' && pipe_props.right < bird_props.left) {
        pipe.dataset.passed = 'true';
        if (pipe.classList.contains('pipe_top')) {
          score++;
          scoreVal.innerHTML = score;
          
          // 3. Suara saat berhasil melewati pipa (point.wav)
          soundPoint.currentTime = 0;
          soundPoint.play().catch(err => console.log(err));
        }
      }
      pipe.style.left = (pipe_left - (pipe_speed * 0.1)) + 'vw';
    }
  });

  animation_id = requestAnimationFrame(updateGame);
}

// Fungsi Trigger Saat Game Over (Menabrak)
function endGame() {
  game_state = 'End';
  cancelAnimationFrame(animation_id);
  
  // 4. Matikan musik background, ganti dengan suara tabrakan (crash.wav)
  bgMusic.pause();
  soundCrash.currentTime = 0;
  soundCrash.play().catch(err => console.log("Audio crash error:", err));
  
  if (score > high_score) {
    high_score = score;
    localStorage.setItem('fb_high_score', high_score);
  }

  currentScoreText.innerText = score;
  bestScoreText.innerText = high_score;
  
  gameOverScreen.style.display = 'block';
}

function restartGame(e) {
  e.stopPropagation(); 
  startGame();
}
