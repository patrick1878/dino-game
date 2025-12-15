const game = document.querySelector(".game");
const dino = document.getElementById("dino");
const jumpBtn = document.getElementById("jumpBtn");
const scoreText = document.getElementById("score");

let isJumping = false;
let dinoY = 0; // altura del salto
let score = 0;

// Salto
function jump() {
    if (isJumping) return;
    isJumping = true;

    let upInterval = setInterval(() => {
        if (dinoY >= 100) {
            clearInterval(upInterval);
            let downInterval = setInterval(() => {
                if (dinoY <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                    dinoY = 0;
                    dino.style.bottom = dinoY + "px";
                } else {
                    dinoY -= 10;
                    dino.style.bottom = dinoY + "px";
                }
            }, 20);
        } else {
            dinoY += 10;
            dino.style.bottom = dinoY + "px";
        }
    }, 20);
}

document.addEventListener("keydown", e => { if (e.code === "Space") jump(); });
jumpBtn.addEventListener("click", jump);

// Obstáculos
let obstacles = [];

function createObstacle() {
    const cactus = document.createElement("div");
    cactus.classList.add("cactus");
    cactus.style.right = "-30px";
    game.appendChild(cactus);
    obstacles.push(cactus);

    // Crear nuevo obstáculo aleatorio
    const randomTime = Math.random() * 2000 + 1000; // entre 1 y 3 seg
    setTimeout(createObstacle, randomTime);
}

// Movimiento y colisión
function gameLoop() {
    obstacles.forEach((cactus, index) => {
        let cactusRight = parseInt(cactus.style.right);
        cactusRight += 8; // velocidad hacia la izquierda
        cactus.style.right = cactusRight + "px";

        // Colisión solo si Bebeto está bajo cierta altura
        const dinoLeft = dino.offsetLeft;
        const dinoRight = dinoLeft + dino.offsetWidth;
        const cactusLeft = game.offsetWidth - cactusRight - cactus.offsetWidth;
        const cactusRightScreen = cactusLeft + cactus.offsetWidth;

        if (cactusRightScreen > dinoLeft && cactusLeft < dinoRight && dinoY < 40) {
            alert(`💀 Game Over\nBebeto perdió contra Johan\nPuntaje: ${score}`);
            // Reinicio
            obstacles.forEach(c => c.remove());
            obstacles = [];
            score = 0;
        }

        // Eliminar cactus fuera de pantalla
        if (cactusRight > game.offsetWidth + 30) {
            cactus.remove();
            obstacles.splice(index, 1);
        }
    });

    score++;
    scoreText.textContent = `Puntaje: ${score}`;
    requestAnimationFrame(gameLoop);
}








