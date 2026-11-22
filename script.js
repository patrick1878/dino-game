
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("bestScore");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const endingScreen = document.getElementById("endingScreen");

const messageElement = document.getElementById("message");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND = 285;

let state = "start";
let score = 0;
let best = Number(localStorage.getItem("dinoLoveBest")) || 0;

let speed = 5;
let gravity = 0.65;
let frame = 0;
let obstacles = [];
let clouds = [];
let audioContext = null;
let soundEnabled = true;
let animationId = null;
let lastTime = 0;
let accumulator = 0;

const STEP = 1000 / 60;

bestElement.textContent = best.toString().padStart(3, "0");

const dino = {
  x: 100,
  y: GROUND - 65,
  width: 55,
  height: 65,
  velocityY: 0,
  jumping: false,
  running: true
};

function playSound(frequency, duration, type = "square", volume = 0.06) {
  if (!soundEnabled) return;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(volume, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Audio no disponible", error);
  }
}

function jumpSound() {
  playSound(450, 0.12);
}

function collisionSound() {
  playSound(100, 0.5, "sawtooth", 0.1);
}

function heartSound() {
  playSound(180, 0.5, "sine", 0.1);
  setTimeout(() => playSound(90, 1, "sine", 0.08), 300);
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#8ed9ff");
  sky.addColorStop(1, "#e0f6ff");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Sol
  ctx.fillStyle = "#ffe66d";
  ctx.beginPath();
  ctx.arc(760, 65, 35, 0, Math.PI * 2);
  ctx.fill();

  // Montañas
  ctx.fillStyle = "#9bc6a0";
  ctx.beginPath();
  ctx.moveTo(0, 245);
  ctx.lineTo(120, 115);
  ctx.lineTo(250, 245);
  ctx.lineTo(390, 135);
  ctx.lineTo(540, 245);
  ctx.lineTo(700, 120);
  ctx.lineTo(900, 245);
  ctx.fill();

  // Nubes
  clouds.forEach(cloud => {
    drawCloud(cloud.x, cloud.y);
  });

  // Desierto
  ctx.fillStyle = "#e7c47c";
  ctx.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);

  ctx.fillStyle = "#bc9456";
  ctx.fillRect(0, GROUND, WIDTH, 5);

  // Piedras del suelo
  ctx.fillStyle = "#b28b56";

  for (let i = 0; i < 35; i++) {
    const x = (i * 83 - (frame * speed * 0.6) % 83 + WIDTH) % WIDTH;
    ctx.fillRect(x, GROUND + 20 + (i % 3) * 15, 4, 3);
  }
}

function drawCloud(x, y) {
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(x, y, 17, 0, Math.PI * 2);
  ctx.arc(x + 20, y - 10, 22, 0, Math.PI * 2);
  ctx.arc(x + 43, y, 17, 0, Math.PI * 2);
  ctx.fill();
}

function initializeClouds() {
  clouds = [
    { x: 120, y: 70 },
    { x: 400, y: 110 },
    { x: 720, y: 65 }
  ];
}

function updateClouds() {
  clouds.forEach(cloud => {
    cloud.x -= 0.5;

    if (cloud.x < -60) {
      cloud.x = WIDTH + 40;
      cloud.y = 45 + Math.random() * 90;
    }
  });
}

function drawDino() {
  const x = dino.x;
  const y = dino.y;

  // Cola
  ctx.fillStyle = "#299b55";
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 38);
  ctx.lineTo(x - 18, y + 50);
  ctx.lineTo(x + 12, y + 58);
  ctx.fill();

  // Cuerpo
  ctx.fillStyle = "#43b967";
  ctx.beginPath();
  ctx.roundRect(x, y + 25, 43, 37, 10);
  ctx.fill();

  // Cabeza
  ctx.fillStyle = "#43b967";
  ctx.beginPath();
  ctx.roundRect(x + 18, y + 3, 42, 35, 12);
  ctx.fill();

  // Hocico
  ctx.beginPath();
  ctx.roundRect(x + 39, y + 19, 20, 16, 7);
  ctx.fill();

  // Ojo
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x + 46, y + 15, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#172b20";
  ctx.beginPath();
  ctx.arc(x + 48, y + 15, 3, 0, Math.PI * 2);
  ctx.fill();

  // Boca
  ctx.strokeStyle = "#185e36";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 43, y + 29);
  ctx.lineTo(x + 54, y + 29);
  ctx.stroke();

  // Brazos
  ctx.strokeStyle = "#218d48";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 28, y + 38);
  ctx.lineTo(x + 36, y + 47);
  ctx.stroke();

  // Patas animadas
  ctx.lineWidth = 7;
  const movement = state === "playing" && !dino.jumping
    ? Math.sin(frame * 0.3) * 7
    : 0;

  ctx.beginPath();
  ctx.moveTo(x + 13, y + 55);
  ctx.lineTo(x + 10 + movement, y + 65);
  ctx.moveTo(x + 33, y + 55);
  ctx.lineTo(x + 35 - movement, y + 65);
  ctx.stroke();
}

function drawCactus(x, y, size) {
  ctx.fillStyle = "#267b39";

  // Tronco
  ctx.fillRect(x, y - size, 18, size);

  // Brazos
  ctx.fillRect(x - 10, y - size * 0.7, 10, 9);
  ctx.fillRect(x - 10, y - size * 0.7, 7, 18);

  ctx.fillRect(x + 18, y - size * 0.5, 10, 9);
  ctx.fillRect(x + 21, y - size * 0.5, 7, 18);

  ctx.fillStyle = "#58ad52";
  ctx.fillRect(x + 4, y - size, 4, size);
}

function createObstacle() {
  const size = 30 + Math.random() * 35;

  obstacles.push({
    x: WIDTH + 20,
    y: GROUND,
    width: 30,
    height: size,
    size: size
  });
}

function updateObstacles() {
  if (frame % Math.max(45, Math.floor(95 - speed * 3)) === 0) {
    createObstacle();
  }

  obstacles.forEach(obstacle => {
    obstacle.x -= speed;
  });

  obstacles = obstacles.filter(obstacle => obstacle.x > -50);
}

function checkCollision() {
  const margin = 9;

  const player = {
    x: dino.x + margin,
    y: dino.y + margin,
    width: dino.width - margin * 2,
    height: dino.height - margin
  };

  for (const obstacle of obstacles) {
    const cactus = {
      x: obstacle.x,
      y: obstacle.y - obstacle.height,
      width: obstacle.width,
      height: obstacle.height
    };

    if (
      player.x < cactus.x + cactus.width &&
      player.x + player.width > cactus.x &&
      player.y < cactus.y + cactus.height &&
      player.y + player.height > cactus.y
    ) {
      return true;
    }
  }

  return false;
}

function jump() {
  if (state !== "playing" || dino.jumping) return;

  dino.velocityY = -13;
  dino.jumping = true;
  jumpSound();
}

function updateDino() {
  dino.y += dino.velocityY;
  dino.velocityY += gravity;

  if (dino.y >= GROUND - dino.height) {
    dino.y = GROUND - dino.height;
    dino.velocityY = 0;
    dino.jumping = false;
  }
}

function updateScore() {
  score += 0.12;
  const points = Math.floor(score);

  scoreElement.textContent = points.toString().padStart(3, "0");

  if (points > best) {
    best = points;
    bestElement.textContent = best.toString().padStart(3, "0");
    localStorage.setItem("dinoLoveBest", best);
  }

  if (points === 100 || points === 250 || points === 400) {
    showMessage(
      points === 100
        ? "¡VAS MUY BIEN! 💚"
        : points === 250
          ? "¡EL AMOR ESTÁ CERCA! ❤️"
          : "¡YA CASI ENCUENTRAS A TU AMOR! 💕"
    );
    playSound(700, 0.15, "sine");
  }

  // El evento especial tiene prioridad.
  if (points >= 500) {
    score = 500;
    triggerEnding();
  }

  speed = 5 + Math.min(points / 100, 7);
}

let messageTimeout;

function showMessage(message) {
  messageElement.textContent = message;
  clearTimeout(messageTimeout);

  messageTimeout = setTimeout(() => {
    messageElement.textContent = "";
  }, 2200);
}

function gameOver() {
  if (state !== "playing") return;

  state = "gameover";
  collisionSound();

  document.getElementById("finalScore").textContent = Math.floor(score);
  gameOverScreen.classList.remove("hidden");
}

function triggerEnding() {
  if (state !== "playing") return;

  state = "ending";
  score = 500;

  scoreElement.textContent = "500";

  obstacles = [];
  dino.running = false;

  heartSound();

  endingScreen.classList.remove("hidden");
}

function update() {
  if (state !== "playing") return;

  frame++;

  updateClouds();
  updateDino();
  updateObstacles();
  updateScore();

  if (state !== "playing") return;

  if (checkCollision()) {
    gameOver();
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawBackground();

  obstacles.forEach(obstacle => {
    drawCactus(obstacle.x, obstacle.y, obstacle.size);
  });

  drawDino();
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;

  let delta = Math.min(timestamp - lastTime, 100);
  lastTime = timestamp;

  if (state === "playing") {
    accumulator += delta;

    while (accumulator >= STEP) {
      update();
      accumulator -= STEP;

      if (state !== "playing") break;
    }
  }

  draw();

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }

  score = 0;
  speed = 5;
  frame = 0;
  obstacles = [];
  accumulator = 0;
  lastTime = 0;

  dino.y = GROUND - dino.height;
  dino.velocityY = 0;
  dino.jumping = false;
  dino.running = true;

  scoreElement.textContent = "000";

  messageElement.textContent = "";

  startScreen.classList.add("hidden");
  pauseScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  endingScreen.classList.add("hidden");

  state = "playing";

  initializeClouds();
}

function togglePause() {
  if (state === "playing") {
    state = "paused";
    pauseScreen.classList.remove("hidden");
  } else if (state === "paused") {
    state = "playing";
    pauseScreen.classList.add("hidden");
    lastTime = 0;
    accumulator = 0;
  }
}

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("restartButton").addEventListener("click", startGame);
document.getElementById("endingRestartButton").addEventListener("click", startGame);
document.getElementById("resumeButton").addEventListener("click", togglePause);

document.getElementById("soundButton").addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  document.getElementById("soundButton").textContent =
    soundEnabled ? "🔊" : "🔇";

  if (soundEnabled) playSound(500, 0.15);
});

document.addEventListener("keydown", event => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();

    if (state === "start") {
      startGame();
    } else {
      jump();
    }
  }

  if (event.key.toLowerCase() === "p") {
    togglePause();
  }
});

canvas.addEventListener("pointerdown", () => {
  if (state === "playing") {
    jump();
  }
});

initializeClouds();

draw();

if (!animationId) {
  animationId = requestAnimationFrame(gameLoop);
}
