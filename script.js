const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const scoreText = document.getElementById("score");
const jumpBtn = document.getElementById("jumpBtn");

let score = 0;
let isJumping = false;

// PC
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});

// MÓVIL
jumpBtn.addEventListener("click", jump);

function jump() {
    if (isJumping) return;
    isJumping = true;
    dino.classList.add("jump");
    setTimeout(() => {
        dino.classList.remove("jump");
        isJumping = false;
    }, 500);
}

setInterval(() => {
    const dinoRect = dino.getBoundingClientRect();
    const cactusRect = cactus.getBoundingClientRect();

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




