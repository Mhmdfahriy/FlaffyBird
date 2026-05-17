(function () {
  // ── Elemen DOM ──────────────────────────────────────────────
  const root        = document.getElementById('game-root');
  const birdContainer = document.getElementById('bird-container');
  const scoreNum    = document.getElementById('score-num');
  const overlay     = document.getElementById('overlay');
  const panelTitle  = document.getElementById('panel-title');
  const panelSub    = document.getElementById('panel-sub');
  const scoreRows   = document.getElementById('score-rows');
  const curScoreVal = document.getElementById('cur-score-val');
  const highScoreVal= document.getElementById('high-score-val');
  const playBtn     = document.getElementById('play-btn');
  const flash       = document.getElementById('flash');
  const medal       = document.getElementById('medal');

  // ── Konstanta game ──────────────────────────────────────────
  const BIRD_W       = 56;
  const BIRD_H       = 56;
  const GROUND_H     = 60;
  const GAP          = 140;    // jarak antar pipa atas & bawah
  const PIPE_W       = 68;
  const PIPE_SPEED   = 2.8;    // kecepatan pipa bergerak
  const GRAVITY      = 0.40;   // gravitasi
  const JUMP_FORCE   = -7.8;   // kekuatan loncat
  const PIPE_INTERVAL= 1700;   // ms antar pipa baru muncul

  // ── State ────────────────────────────────────────────────────
  let birdY, birdVY, score, pipes, lastPipeTime, animId, lastTime;
  let gameState = 'idle'; // 'idle' | 'play' | 'dead'
  let highScore = parseInt(localStorage.getItem('flappy_hs') || '0');
  highScoreVal.textContent = highScore;

  // ── Ukuran area game ─────────────────────────────────────────
  function gameW() { return root.offsetWidth; }
  function gameH() { return root.offsetHeight; }
  function birdX() { return gameW() * 0.28; }

  // ── Reset posisi burung ───────────────────────────────────────
  function resetBird() {
    birdY  = gameH() * 0.38;
    birdVY = 0;
    birdContainer.style.left      = birdX() + 'px';
    birdContainer.style.top       = birdY + 'px';
    birdContainer.style.transform = 'rotate(0deg)';
  }

  // ── Hapus semua pipa ─────────────────────────────────────────
  function removePipes() {
    root.querySelectorAll('.pipe').forEach(p => p.remove());
    pipes = [];
  }

  // ── Buat pasang pipa baru ─────────────────────────────────────
  function createPipe() {
    const h      = gameH();
    const w      = gameW();
    const minTop = 70;
    const maxTop = h - GROUND_H - GAP - 70;
    const topH   = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
    const botY   = topH + GAP;
    const botH   = h - GROUND_H - botY;

    // Pipa atas
    const pipeTop = document.createElement('div');
    pipeTop.className = 'pipe';
    pipeTop.style.cssText = `left:${w}px; top:0; height:${topH}px; justify-content:flex-end;`;
    pipeTop.innerHTML = `
      <div class="pipe-body"></div>
      <div class="pipe-cap top-cap"></div>
    `;
    root.appendChild(pipeTop);

    // Pipa bawah
    const pipeBot = document.createElement('div');
    pipeBot.className = 'pipe';
    pipeBot.style.cssText = `left:${w}px; top:${botY}px; height:${botH}px; justify-content:flex-start;`;
    pipeBot.innerHTML = `
      <div class="pipe-cap bot-cap"></div>
      <div class="pipe-body"></div>
    `;
    root.appendChild(pipeBot);

    pipes.push({
      top: pipeTop,
      bot: pipeBot,
      x: w,
      topH,
      botY,
      scored: false
    });
  }

  // ── Efek flash saat nabrak ────────────────────────────────────
  function doFlash() {
    flash.style.opacity = '0.8';
    setTimeout(() => { flash.style.opacity = '0'; }, 120);
  }

  // ── Loncat ────────────────────────────────────────────────────
  function jump() {
    if (gameState !== 'play') return;
    birdVY = JUMP_FORCE;
  }

  // ── Mulai game ────────────────────────────────────────────────
  function startGame() {
    gameState    = 'play';
    score        = 0;
    scoreNum.textContent = '0';
    overlay.style.display = 'none';
    removePipes();
    resetBird();
    lastPipeTime = 0;
    lastTime     = null;
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  }

  // ── Game over ─────────────────────────────────────────────────
  function endGame() {
    gameState = 'dead';
    cancelAnimationFrame(animId);
    doFlash();

    const isNewRecord = score > highScore;
    if (isNewRecord) {
      highScore = score;
      localStorage.setItem('flappy_hs', highScore);
    }

    // Pilih medal berdasarkan skor
    if (score >= 40)      medal.textContent = '🥇';
    else if (score >= 20) medal.textContent = '🥈';
    else if (score >= 10) medal.textContent = '🥉';
    else                  medal.textContent = '💀';

    curScoreVal.textContent  = score;
    highScoreVal.textContent = highScore;
    panelTitle.textContent   = 'GAME OVER';
    panelSub.textContent     = isNewRecord ? '🎉 Rekor Baru!' : 'Coba lagi!';
    scoreRows.style.display  = 'block';
    playBtn.textContent      = '🔄  MAIN LAGI';
    overlay.style.display    = 'flex';
  }

  // ── Game loop utama ───────────────────────────────────────────
  function loop(ts) {
    if (gameState !== 'play') return;

    if (!lastTime) lastTime = ts;
    lastTime = ts;

    const h = gameH();
    const w = gameW();
    const bx = birdX();

    // Fisika burung
    birdVY += GRAVITY;
    birdY  += birdVY;

    // Rotasi burung sesuai kecepatan
    const angle = Math.min(Math.max(birdVY * 3.5, -28), 75);
    birdContainer.style.top       = birdY + 'px';
    birdContainer.style.transform = `rotate(${angle}deg)`;

    // Cek tabrakan dengan tanah atau langit-langit
    if (birdY + BIRD_H >= h - GROUND_H || birdY <= 0) {
      endGame();
      return;
    }

    // Buat pipa baru setiap PIPE_INTERVAL ms
    if (lastPipeTime === 0 || ts - lastPipeTime > PIPE_INTERVAL) {
      createPipe();
      lastPipeTime = ts;
    }

    // Hitbox burung (sedikit diperkecil agar fair)
    const bL = bx + 6;
    const bR = bx + BIRD_W - 6;
    const bT = birdY + 6;
    const bB = birdY + BIRD_H - 6;

    // Update & cek tabrakan pipa
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= PIPE_SPEED;
      p.top.style.left = p.x + 'px';
      p.bot.style.left = p.x + 'px';

      // Hapus pipa yang sudah keluar layar
      if (p.x + PIPE_W < 0) {
        p.top.remove();
        p.bot.remove();
        pipes.splice(i, 1);
        continue;
      }

      // Tambah skor ketika berhasil melewati pipa
      if (!p.scored && p.x + PIPE_W < bx) {
        score++;
        scoreNum.textContent = score;
        p.scored = true;
      }

      // Cek tabrakan dengan pipa atas dan bawah
      const pL = p.x + 5;
      const pR = p.x + PIPE_W - 5;
      const hitTopPipe = bL < pR && bR > pL && bT < p.topH;
      const hitBotPipe = bL < pR && bR > pL && bB > p.botY;

      if (hitTopPipe || hitBotPipe) {
        endGame();
        return;
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // ── Event Listeners ───────────────────────────────────────────

  // Tombol Main / Main Lagi
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (gameState !== 'play') {
      medal.textContent           = '';
      scoreRows.style.display     = 'none';
      panelTitle.textContent      = 'FLAPPY BIRD';
      panelSub.textContent        = 'Tap atau tekan Spasi untuk terbang!';
      playBtn.textContent         = '▶  MAIN';
      startGame();
    }
  });

  // Klik/tap area game untuk loncat
  root.addEventListener('click', (e) => {
    if (e.target === playBtn) return;
    if (gameState === 'play') jump();
  });

  // Touch untuk mobile
  root.addEventListener('touchstart', (e) => {
    if (gameState === 'play') {
      e.preventDefault();
      jump();
    }
  }, { passive: false });

  // Keyboard: Spasi, ArrowUp, W, Enter
  document.addEventListener('keydown', (e) => {
    if (
      e.code === 'Space'   ||
      e.code === 'ArrowUp' ||
      e.key  === 'w'       ||
      e.key  === 'W'
    ) {
      e.preventDefault();
      if (gameState === 'play') jump();
    }
    if (e.code === 'Enter' && gameState !== 'play') {
      startGame();
    }
  });

})();
