const game = document.querySelector(".game");
const dino = document.getElementById("dino");
const jumpBtn = document.getElementById("jumpBtn");
const scoreText = document.getElementById("score");

let isJumping = false;
let dinoY = 0;
let score = 0;

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

// Eventos
document.addEventListener("keydown", e => { if (e.code === "Space") jump(); });
jumpBtn.addEventListener("click", jump);

// Obstáculos
let obstacles = [];

function createObstacle() {
    const cactusContainer = document.createElement("div");
    cactusContainer.classList.add("cactus");

    const label = document.createElement("span");
    label.classList.add("label");
    label.innerText = "JOHAN";
    cactusContainer.appendChild(label);

    cactusContainer.style.right = "-40px";
    game.appendChild(cactusContainer);
    obstacles.push(cactusContainer);

    const randomTime = Math.random() * 2000 + 1000;
    setTimeout(createObstacle, randomTime);
}

function gameLoop() {
    obstacles.forEach((cactus, index) => {
        let cactusRight = parseInt(cactus.style.right);
        cactusRight += 8; // velocidad
        cactus.style.right = cactusRight + "px";

        // Posición para colisión
        const dinoLeft = dino.offsetLeft;
        const dinoRight = dinoLeft + dino.offsetWidth;
        const cactusLeft = game.offsetWidth - cactusRight - cactus.offsetWidth;
        const cactusRightScreen = cactusLeft + cactus.offsetWidth;

        if (cactusRightScreen > dinoLeft && cactusLeft < dinoRight && dinoY < 40) {
            alert(`💀 Game Over\nBebeto perdió contra Johan\nPuntaje: ${score}`);
            obstacles.forEach(c => c.remove());
            obstacles = [];
            score = 0;
        }

        // Eliminar cactus fuera de pantalla
        if (cactusRight > game.offsetWidth + 40) {
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









