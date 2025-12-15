const game = document.querySelector(".game");
const player = document.querySelector(".player");
const jumpBtn = document.getElementById("jumpBtn");
const scoreText = document.getElementById("score");

let isJumping = false;
let playerY = 0; // posición vertical
let score = 0;
let obstacles = [];
let gameSpeed = 5;

// Función de salto
function jump() {
    if (isJumping) return;
    isJumping = true;

    let velocity = 12; // fuerza inicial del salto
    const gravity = 0.6;

    function animate() {
        velocity -= gravity;
        playerY += velocity;

        if (playerY < 0) playerY = 0; // no bajar de la plataforma
        player.style.bottom = playerY + "px";

        if (playerY > 0 || velocity > 0) {
            requestAnimationFrame(animate);
        } else {
            isJumping = false;
        }
    }

    requestAnimationFrame(animate);
}

// Eventos de salto
document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.key === " ") jump();
});
jumpBtn.addEventListener("click", jump);

// Crear obstáculos
function createObstacle() {
    const cactus = document.createElement("div");
    cactus.classList.add("cactus");

    const label = document.createElement("span");
    label.classList.add("label");
    label.innerText = "JOHAN";
    cactus.appendChild(label);

    cactus.style.left = game.offsetWidth + "px";
    game.appendChild(cactus);
    obstacles.push(cactus);

    const randomTime = Math.random() * 2000 + 1000;
    setTimeout(createObstacle, randomTime);
}

// Loop del juego
function gameLoop() {
    obstacles.forEach((cactus, index) => {
        let cactusLeft = parseInt(cactus.style.left);
        cactusLeft -= gameSpeed;
        cactus.style.left = cactusLeft + "px";

        // Colisión
        const playerLeft = player.offsetLeft;
        const playerRight = playerLeft + player.offsetWidth;
        const cactusRight = cactusLeft + cactus.offsetWidth;

        if (
            cactusLeft < playerRight &&
            cactusRight > playerLeft &&
            playerY < cactus.offsetHeight
        ) {
            alert(`💀 Game Over\nJOHAN SE KCHO A BEBETO\nPuntaje: ${score}`);
            obstacles.forEach(c => c.remove());
            obstacles = [];
            score = 0;
        }

        // Eliminar fuera de pantalla
        if (cactusLeft + cactus.offsetWidth < 0) {
            cactus.remove();
            obstacles.splice(index, 1);
        }
    });

    score++;
    scoreText.textContent = `Puntaje: ${score}`;
    requestAnimationFrame(gameLoop);
}

// Iniciar juego
createObstacle();
gameLoop();











