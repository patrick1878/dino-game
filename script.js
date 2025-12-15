const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const scoreText = document.getElementById("score");
const jumpBtn = document.getElementById("jumpBtn");

let score = 0;
let isJumping = false;
let dinoY = 0; // posición vertical del dinosaurio (0 = suelo)

// Función de salto (controlado por JS)
function jump() {
    if (isJumping) return;

    isJumping = true;

    let upInterval = setInterval(() => {
        if (dinoY >= 110) { // altura máxima
            clearInterval(upInterval);
            // Bajar
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

// Eventos PC y móvil
document.addEventListener("keydown", (e) => { if (e.code === "Space") jump(); });
jumpBtn.addEventListener("click", jump);

// Movimiento cactus
let cactusX = 600; // posición inicial
function moveCactus() {
    cactusX -= 8; // velocidad
    if (cactusX < -60) cactusX = 600; // reinicio al salir
    cactus.style.left = cactusX + "px";
}

// Game loop
setInterval(() => {
    moveCactus();

    // Colisión real
    const dinoLeft = dino.offsetLeft;
    const dinoRight = dinoLeft + dino.offsetWidth;
    const cactusRight = cactusX + cactus.offsetWidth;
    const cactusLeft = cactusX;

    if (cactusRight > dinoLeft && cactusLeft < dinoRight && dinoY < 40) {
        alert(`💀 Game Over\nBebeto perdió contra Johan\nPuntaje: ${score}`);
        score = 0;
        cactusX = 600; // reinicio cactus
    }

    score++;
    scoreText.textContent = `Puntaje: ${score}`;
}, 20);






