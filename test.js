// Seleksi Elemen DOM
const bird = document.querySelector('.bird');
const message = document.querySelector('.message');
const scoreVal = document.querySelector('.score_val');
const gameOverScreen = document.getElementById('gameOverScreen');
const currentScoreText = document.getElementById('currentScore');
const bestScoreText = document.getElementById('bestScore');
const restartBtn = document.getElementById('restartBtn');

// State Game
let game_state = 'Start';
let gravity = 0.4;
let jump_strength = -7;
let bird_dy = 0;
let score = 0;

// Ambil High Score dari LocalStorage
let high_score = localStorage.getItem('fb_high_score') || 0;

// Setingan Gameplay
const pipe_speed = 4;
const pipe_gap = 30; // Jarak celah pipa dalam vh (tinggi layar)

// 1. Event Listener untuk Start dan Lompat (Mendukung Laptop & HP)
window.addEventListener('keydown', handleInput);
window.addEventListener('touchstart', handleInput);

function handleInput(e) {
  // Jika menekan tombol tapi targetnya adalah tombol restart, abaikan agar fungsi tombol tidak terganggu
  if (e.target === restartBtn) return;

  if (game_state === 'Start') {
    // Start game via Enter (laptop) atau Sentuhan (HP)
    if (e.key === 'Enter' || e.type === 'touchstart') {
      startGame();
    }
  } else if (game_state === 'Play') {
    // Lompat via Spasi/ArrowUp (laptop) atau Sentuhan (HP)
    if (e.key === ' ' || e.key === 'ArrowUp' || e.type === 'touchstart') {
      bird_dy = jump_strength;
    }
  }
}

// Tombol Restart Click & Tap
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
  
  // Hapus semua pipa sisa game sebelumnya
  document.querySelectorAll('.pipe_sprite').forEach(pipe => pipe.remove());
  
  // Jalankan loop game
  requestAnimationFrame(updateGame);
  createPipes();
}

// 2. Loop Utama Game
function updateGame() {
  if (game_state !== 'Play') return;

  // Terapkan Gravitasi ke Burung
  bird_dy += gravity;
  let bird_top = parseFloat(bird.style.top) || 40;
  
  // Ubah posisi burung berdasarkan koordinat vh agar responsive
  let new_top = bird_top + (bird_dy * 0.15); 
  bird.style.top = new_top + 'vh';

  const bird_props = bird.getBoundingClientRect();
  const bg_props = document.body.getBoundingClientRect();

  // Batas Atas & Bawah Layar (Tabrakan tanah/langit)
  if (bird_props.top <= 0 || bird_props.bottom >= bg_props.bottom) {
    endGame();
    return;
  }

  // Menggerakkan Pipa & Deteksi Tabrakan
  let pipes = document.querySelectorAll('.pipe_sprite');
  pipes.forEach((pipe) => {
    let pipe_props = pipe.getBoundingClientRect();

    // Deteksi Tabrakan Burung dengan Pipa
    if (
      bird_props.left < pipe_props.right &&
      bird_props.right > pipe_props.left &&
      bird_props.top < pipe_props.bottom &&
      bird_props.bottom > pipe_props.top
    ) {
      endGame();
      return;
    }

    // Gerakkan pipa ke kiri
    let pipe_left = parseFloat(pipe.style.left);
    if (pipe_left <= -10) {
      // Jika pipa melewati layar kiri, hapus
      pipe.remove();
    } else {
      // Tambah Skor jika berhasil melewati pipa
      if (pipe.dataset.passed === 'false' && pipe_props.right < bird_props.left) {
        pipe.dataset.passed = 'true';
        // Karena ada 2 pipa (atas & bawah), kita hitung skor saat melewati salah satunya saja (misal pipa atas)
        if(pipe.classList.contains('pipe_top')) {
          score++;
          scoreVal.innerHTML = score;
        }
      }
      pipe.style.left = (pipe_left - (pipe_speed * 0.1)) + 'vw';
    }
  });

  requestAnimationFrame(updateGame);
}

// 3. Logika Pembuatan Pipa secara Acak
let pipe_timer = 0;
function createPipes() {
  if (game_state !== 'Play') return;

  // Membuat pipa setiap jarak waktu tertentu
  if (pipe_timer > 120) {
    pipe_timer = 0;

    // Menentukan posisi tinggi celah secara acak
    let pipe_posi = Math.floor(Math.random() * (60 - 20)) + 20; 

    // Pipa Atas
    let pipe_top = document.createElement('div');
    pipe_top.className = 'pipe_sprite pipe_top';
    pipe_top.style.top = '0vh';
    pipe_top.style.height = (pipe_posi - pipe_gap / 2) + 'vh';
    pipe_top.style.left = '100vw';
    pipe_top.dataset.passed = 'false';

    // Pipa Bawah
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
  if (game_state === 'Play') {
    requestAnimationFrame(createPipes);
  }
}

// 4. Game Over
function endGame() {
  game_state = 'End';
  
  // Cek & simpan High Score
  if (score > high_score) {
    high_score = score;
    localStorage.setItem('fb_high_score', high_score);
  }

  // Tampilkan skor di Pop-up
  currentScoreText.innerText = score;
  bestScoreText.innerText = high_score;
  
  // Munculkan Screen Game Over
  gameOverScreen.style.display = 'block';
}

// 5. Reset Game saat Klik "Main Lagi"
function restartGame(e) {
  e.stopPropagation(); // Biar input kliknya ga memicu lompat burung saat game restart
  startGame();
}
