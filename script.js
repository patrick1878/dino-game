const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const scoreText = document.getElementById("score");

let score = 0;
let isJumping = false;

// PC
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});

// MÓVIL
document.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

function jump() {
    if (isJumping) return;

    isJumping = true;
    dino.classList.add("jump");

    setTimeout(() => {
        dino.classList.remove("jump");
        isJumping = false;
    }, 500);
}

// GAME LOOP
setInterval(() => {
    const dinoRect = dino.getBoundingClientRect();
    const cactusRect = cactus.getBoundingClientRect();

    // Colisión real (mejor método)
    if (
        cactusRect.left < dinoRect.right &&
        cactusRect.right > dinoRect.left &&
        cactusRect.bottom > dinoRect.top
    ) {
        alert(`💀 Game Over\nBebeto perdió contra Johan\nPuntaje: ${score}`);
        score = 0;
    }

    score++;
    scoreText.textContent = `Puntaje: ${score}`;
}, 50);


