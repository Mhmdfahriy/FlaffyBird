let move_speed = 0.6; 
let gravity = 0.35;
let bird_dy = 0;
let score = 0;
let game_state = 'Start';

// Seleksi DOM
const bird = document.querySelector('.bird');
const score_val = document.querySelector('.score_val');
const message_container = document.querySelector('.message-container');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Audio
const bgMusic = document.getElementById('bgMusic');
const soundJump = document.getElementById('soundJump');
const soundPoint = document.getElementById('soundPoint');
const soundCrash = document.getElementById('soundCrash');

// High Score
let high_score = localStorage.getItem('fb_best') || 0;

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && game_state !== 'Play') startGame();
    if ((e.key === ' ' || e.key === 'ArrowUp') && game_state === 'Play') fly();
});
window.addEventListener('touchstart', (e) => {
    if (game_state === 'Play') fly();
});

function fly() {
    bird_dy = -6.5; // Kekuatan lompat
    soundJump.currentTime = 0;
    soundJump.play().catch(() => {});
}

function startGame() {
    game_state = 'Play';
    score = 0;
    bird_dy = 0;
    score_val.innerHTML = '0';
    message_container.style.display = 'none';
    gameOverScreen.style.display = 'none';
    bird.style.display = 'block';
    bird.style.top = '40vh';

    // Hapus pipa lama
    document.querySelectorAll('.pipe_sprite').forEach(p => p.remove());

    // Pancing Audio (Wajib untuk Chrome HP)
    bgMusic.play().catch(() => {});
    soundPoint.play().then(()=> {soundPoint.pause(); soundPoint.currentTime=0;});

    requestAnimationFrame(update);
    createPipe();
}

function update() {
    if (game_state !== 'Play') return;

    // Gerak Burung
    bird_dy += gravity;
    let bird_top = parseFloat(bird.style.top) || 40;
    bird.style.top = (bird_top + bird_dy * 0.2) + 'vh';

    let bird_props = bird.getBoundingClientRect();
    let screen_bottom = window.innerHeight;

    // Tabrakan Langit/Tanah
    if (bird_props.top <= 0 || bird_props.bottom >= screen_bottom) {
        endGame();
        return;
    }

    // Gerak Pipa
    let pipes = document.querySelectorAll('.pipe_sprite');
    pipes.forEach((pipe) => {
        let pipe_props = pipe.getBoundingClientRect();
        let current_left = parseFloat(pipe.style.left) || 100;

        // Cek Tabrakan Pipa
        if (bird_props.left < pipe_props.right && bird_props.right > pipe_props.left &&
            bird_props.top < pipe_props.bottom && bird_props.bottom > pipe_props.top) {
            endGame();
            return;
        }

        // Update Skor & Suara Point
        if (pipe.increase_score === "1" && pipe_props.right < bird_props.left && pipe.dataset.passed !== "true") {
            pipe.dataset.passed = "true";
            score++;
            score_val.innerHTML = score;
            soundPoint.currentTime = 0;
            soundPoint.play();
        }

        // Pindah Pipa
        if (current_left < -20) {
            pipe.remove();
        } else {
            pipe.style.left = (current_left - move_speed) + 'vw';
        }
    });

    requestAnimationFrame(update);
}

let pipe_timer = 0;
function createPipe() {
    if (game_state !== 'Play') return;

    if (pipe_timer > 110) {
        pipe_timer = 0;
        let gap_pos = Math.floor(Math.random() * 40) + 20; // Posisi celah (20vh - 60vh)
        let gap_size = 30; // Lebar celah pipa

        // Pipa Atas
        let pipe_top = document.createElement('div');
        pipe_top.className = 'pipe_sprite';
        pipe_top.style.top = '0vh';
        pipe_top.style.height = (gap_pos - gap_size/2) + 'vh';
        pipe_top.style.left = '100vw';
        pipe_top.increase_score = "0";
        document.body.appendChild(pipe_top);

        // Pipa Bawah
        let pipe_bottom = document.createElement('div');
        pipe_bottom.className = 'pipe_sprite';
        pipe_bottom.style.height = (100 - (gap_pos + gap_size/2)) + 'vh';
        pipe_bottom.style.top = (gap_pos + gap_size/2) + 'vh';
        pipe_bottom.style.left = '100vw';
        pipe_bottom.increase_score = "1";
        document.body.appendChild(pipe_bottom);
    }
    pipe_timer++;
    requestAnimationFrame(createPipe);
}

function endGame() {
    game_state = 'End';
    bgMusic.pause();
    soundCrash.play();
    
    if (score > high_score) {
        high_score = score;
        localStorage.setItem('fb_best', high_score);
    }

    document.getElementById('currentScore').innerText = score;
    document.getElementById('bestScore').innerText = high_score;
    gameOverScreen.style.display = 'block';
}
