const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const scoreText = document.getElementById("score");

let score = 0;
let isJumping = false;

// Saltar
document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        jump();
    }
});

function jump() {
    if (isJumping) return;

    isJumping = true;
    dino.classList.add("jump");

    setTimeout(() => {
        dino.classList.remove("jump");
        isJumping = false;
    }, 500);
}

// Colisiones y puntaje
let gameLoop = setInterval(() => {
    let dinoBottom = parseInt(
        window.getComputedStyle(dino).getPropertyValue("bottom")
    );

    let cactusRight = parseInt(
        window.getComputedStyle(cactus).getPropertyValue("right")
    );

    // Colisión
    if (cactusRight > 520 && cactusRight < 560 && dinoBottom < 40) {
        alert("💀 Game Over\nPuntaje: " + score);
        score = 0;
        scoreText.textContent = "Puntaje: 0";
    }

    score++;
    scoreText.textContent = "Puntaje: " + score;

}, 50);