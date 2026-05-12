let move_speed = 3, gravity = 0.5;
let bird = document.querySelector('.bird');
let bird_props = bird.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let game_over_screen = document.getElementById('game-over-screen');
let final_score_text = document.getElementById('final-score');
let restart_btn = document.getElementById('restart-btn');

let game_state = 'Start';

// Memulai Game
function initGame() {
    if (game_state == 'Start') {
        document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());
        bird.style.top = '40vh';
        bird.style.display = 'block';
        game_state = 'Play';
        message.style.display = 'none';
        game_over_screen.style.display = 'none';
        score_val.innerHTML = '0';
        play();
    }
}

// Event Listeners untuk Start
document.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') initGame();
});

document.addEventListener('touchstart', (e) => {
    if (game_state == 'Start') initGame();
});

// Tombol Restart
restart_btn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    game_state = 'Start';
    game_over_screen.style.display = 'none';
    message.style.display = 'block';
});

function play() {
    function move() {
        if (game_state != 'Play') return;

        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if (pipe_props.right <= 0) {
                element.remove();
            } else {
                if (bird_props.left < pipe_props.left + pipe_props.width && 
                    bird_props.left + bird_props.width > pipe_props.left && 
                    bird_props.top < pipe_props.top + pipe_props.height && 
                    bird_props.top + bird_props.height > pipe_props.top) {
                    
                    handleGameOver();
                    return;
                } else {
                    if (pipe_props.right < bird_props.left && pipe_props.right + move_speed >= bird_props.left && element.increase_score == '1') {
                        score_val.innerHTML = parseInt(score_val.innerHTML) + 1;
                    }
                    element.style.left = pipe_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    let bird_dy = 0;
    function apply_gravity() {
        if (game_state != 'Play') return;
        bird_dy = bird_dy + gravity;

        const jump = () => { bird_dy = -8; };

        document.onkeydown = (e) => {
            if (e.key == 'ArrowUp' || e.key == ' ') jump();
        };
        
        document.ontouchstart = () => {
            if(game_state == 'Play') jump();
        };

        if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
            handleGameOver();
            return;
        }

        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_separation = 0;
    let pipe_gap = 35; 

    function create_pipe() {
        if (game_state != 'Play') return;

        if (pipe_separation > 115) {
            pipe_separation = 0;
            let pipe_posi = Math.floor(Math.random() * 43) + 8;
            
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';
            document.body.appendChild(pipe_sprite_inv);

            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';
            document.body.appendChild(pipe_sprite);
        }
        pipe_separation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}

function handleGameOver() {
    game_state = 'End';
    bird.style.display = 'none';
    game_over_screen.style.display = 'block';
    final_score_text.innerHTML = score_val.innerHTML;
}
