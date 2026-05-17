// Background scrolling speed
let move_speed = 3;

// Gravity constant value
let gravity = 0.5;

// Getting reference to the bird element
let bird = document.querySelector('.bird');

// Getting bird element properties
let bird_props = bird.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();

// Getting reference to UI elements
let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

// Objek Audio Bawaan kamu
let jumpSound = new Audio('jump.mp3');
let crashSound = new Audio('crash.wav');
let scoreSound = new Audio('point.wav');
let startSound = new Audio('start.mp3'); 

// Set agar musik start ngeloop (mengulang terus saat main)
startSound.loop = true; 

// Setting initial game state to start
let game_state = 'Start';

// Mendukung Laptop (keydown) dan HP (touchstart) untuk Start Game
document.addEventListener('keydown', handleStart);
document.addEventListener('touchstart', handleStart);

function handleStart(e) {
  // Jalankan jika tekan Enter (laptop) atau Sentuh Layar (HP) saat Game Belum Mulai
  if ((e.key == 'Enter' || e.type == 'touchstart') && game_state != 'Play') {
    
    // Cegah ngelag / double-trigger di HP
    if(e.type === 'touchstart' && e.target.id === 'restartBtn') return; 

    document.querySelectorAll('.pipe_sprite').forEach((el) => {
      el.remove();
    });
    
    bird.style.top = '40vh';
    game_state = 'Play';
    message.innerHTML = '';
    score_title.innerHTML = 'Score : ';
    score_val.innerHTML = '0';
    
    // === FIX START.MP3 ===
    // Pancingan paksa agar browser mengizinkan audio berjalan
    startSound.currentTime = 0;
    startSound.volume = 0.4;
    startSound.play().catch(err => console.log("Musik start dicoba putar ulang...", err));

    play();
  }
}

function play() {
  function move() {
    if (game_state != 'Play') return;

    let pipe_sprite = document.querySelectorAll('.pipe_sprite');

    pipe_sprite.forEach((element) => {
      let pipe_sprite_props = element.getBoundingClientRect();
      bird_props = bird.getBoundingClientRect();

      if (pipe_sprite_props.right <= 0) {
        element.remove();
      } else {
        // Collision detection with bird and pipes
        if (
          bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
          bird_props.left + bird_props.width > pipe_sprite_props.left &&
          bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
          bird_props.top + bird_props.height > pipe_sprite_props.top
        ) {
          game_state = 'End';
          message.innerHTML = 'Press Enter / Tap to Restart';
          
          startSound.pause(); // Hentikan musik saat nabrak
          crashSound.play();  // Play crash sound effect
          return;
        } else {
          // === FIX POINT.WAV (SUARA SKOR) ===
          // Memperlebar jangkauan deteksi agar tidak terlewat oleh FPS browser
          if (
            pipe_sprite_props.right < bird_props.left &&
            pipe_sprite_props.right + move_speed + 2 >= bird_props.left && 
            element.increase_score === '1'
          ) {
            score_val.innerHTML = +score_val.innerHTML + 1;
            
            // Play score sound effect
            scoreSound.currentTime = 0;
            scoreSound.play().catch(err => console.log(err));
          }
          element.style.left = pipe_sprite_props.left - move_speed + 'px';
        }
      }
    });
    requestAnimationFrame(move);
  }
  requestAnimationFrame(move);

  let bird_dy = 0;

  // Gabungan fungsi lompat untuk Laptop (Keyboard) dan HP (Sentuhan)
  function flyBird(e) {
    if (game_state != 'Play') return;
    
    // Daftar tombol laptop atau deteksi sentuhan jari di HP
    if (e.key == 'ArrowUp' || e.key == ' ' || e.key == 'w' || e.key == 'W' || e.type == 'touchstart') {
      bird_dy = -7.6;
      jumpSound.currentTime = 0;
      jumpSound.volume = 0.3;
      jumpSound.play().catch(err => console.log(err));
    }
  }

  // Daftarkan event lompat
  document.addEventListener('keydown', flyBird);
  document.addEventListener('touchstart', flyBird);

  function apply_gravity() {
    if (game_state != 'Play') return;

    bird_dy = bird_dy + gravity;

    // Collision detection dengan langit dan tanah
    if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
      game_state = 'End';
      message.innerHTML = 'Press Enter / Tap to Restart';
      startSound.pause();
      crashSound.play();
      return;
    }
    
    bird.style.top = bird_props.top + bird_dy + 'px';
    bird_props = bird.getBoundingClientRect();
    requestAnimationFrame(apply_gravity);
  }
  requestAnimationFrame(apply_gravity);

  let pipe_seperation = 0;
  let pipe_gap = 35;

  function create_pipe() {
    if (game_state != 'Play') return;

    if (pipe_seperation > 115) {
      pipe_seperation = 0;

      let pipe_posi = Math.floor(Math.random() * 43) + 8;

      // Pipa Atas
      let pipe_sprite_inv = document.createElement('div');
      pipe_sprite_inv.className = 'pipe_sprite';
      pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
      pipe_sprite_inv.style.left = '100vw';
      // Kita beri tanda '0' agar sistem tidak menghitung skor ganda pada pipa atas
      pipe_sprite_inv.increase_score = '0'; 

      document.body.appendChild(pipe_sprite_inv);

      // Pipa Bawah
      let pipe_sprite = document.createElement('div');
      pipe_sprite.className = 'pipe_sprite';
      pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
      pipe_sprite.style.left = '100vw';
      // Ini yang memicu penambahan skor dan suara point.wav
      pipe_sprite.increase_score = '1'; 

      document.body.appendChild(pipe_sprite);
    }
    pipe_seperation++;
    requestAnimationFrame(create_pipe);
  }
  requestAnimationFrame(create_pipe);
}
