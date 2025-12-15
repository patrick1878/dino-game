const game = document.querySelector(".game");
const dino = document.getElementById("dino");
const player = document.querySelector(".player");
const jumpBtn = document.getElementById("jumpBtn");
const scoreText = document.getElementById("score");

let isJumping = false;
let dinoY = 0;
let score = 0;
let obstacles = [];
let gameSpeed = 5;

// Función de salto suave
function jump() {
    if (isJumping) return;
    isJumping = true;
    let velocity = 0;
    let gravity = 0.6;
    let jumpStrength = 12;

    function animate() {
        if (dinoY === 0) velocity = jumpStrength;
        velocity -= gravity;
        dinoY += velocity;

        if (dinoY < 0) dinoY = 0;
        player.style.bottom = dinoY + "px"; // mover contenedor completo

        if (dinoY > 0 || velocity > 0) {
            requestAnimationFrame(animate);
        } else {
            isJumping = false;
        }
    }

    requestAnimationFrame(animate);
}

// Eventos PC y móvil
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
            dinoY < cactus.offsetHeight
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










