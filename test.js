let move_speed = 0.6; 
let gravity = 0.35;
let bird_dy = 0;
let score = 0;
let game_state = 'Start';

const bird = document.querySelector('.bird');
const score_val = document.querySelector('.score_val');
const message_container = document.querySelector('.message-container');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const bgMusic = document.getElementById('bgMusic');
const soundJump = document.getElementById('soundJump');
const soundPoint = document.getElementById('soundPoint');
const soundCrash = document.getElementById('soundCrash');

let high_score = localStorage.getItem('fb_best') || 0;

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
    bird_dy = -6.5; 
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

    document.querySelectorAll('.pipe_sprite').forEach(p => p.remove());

    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
    soundPoint.play().then(() => { soundPoint.pause(); soundPoint.currentTime = 0; });

    requestAnimationFrame(update);
    createPipe();
}

function update() {
    if (game_state !== 'Play') return;

    bird_dy += gravity;
    let bird_top = parseFloat(bird.style.top) || 40;
    bird.style.top = (bird_top + bird_dy * 0.2) + 'vh';

    let bird_props = bird.getBoundingClientRect();
    
    // Batas Lantai (Lantai di 80% layar / 80vh)
    let floor_limit = window.innerHeight * 0.8; 

    if (bird_props.top <= 0 || bird_props.bottom >= floor_limit) {
        endGame();
        return;
    }

    let pipes = document.querySelectorAll('.pipe_sprite');
    pipes.forEach((pipe) => {
        let pipe_props = pipe.getBoundingClientRect();
        let current_left = parseFloat(pipe.style.left) || 100;

        if (bird_props.left < pipe_props.right && bird_props.right > pipe_props.left &&
            bird_props.top < pipe_props.bottom && bird_props.bottom > pipe_props.top) {
            endGame();
            return;
        }

        if (pipe.increase_score === "1" && pipe_props.right < bird_props.left && pipe.dataset.passed !== "true") {
            pipe.dataset.passed = "true";
            score++;
            score_val.innerHTML = score;
            soundPoint.currentTime = 0;
            soundPoint.play();
        }

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
        
        let floor_height = 20; 
        let playable_height = 100 - floor_height; 
        let gap_size = 28; 
        let gap_pos = Math.floor(Math.random() * (playable_height - 30)) + 15; 

        // Pipa Atas
        let pipe_top = document.createElement('div');
        pipe_top.className = 'pipe_sprite';
        pipe_top.style.top = '0vh';
        pipe_top.style.height = (gap_pos - gap_size / 2) + 'vh';
        pipe_top.style.left = '100vw';
        pipe_top.increase_score = "0";
        document.body.appendChild(pipe_top);

        // Pipa Bawah
        let pipe_bottom = document.createElement('div');
        pipe_bottom.className = 'pipe_sprite';
        let pipe_bottom_height = playable_height - (gap_pos + gap_size / 2);
        pipe_bottom.style.height = pipe_bottom_height + 'vh';
        pipe_bottom.style.top = (gap_pos + gap_size / 2) + 'vh';
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
