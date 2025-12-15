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

// BOTÓN MÓVIL
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

// GAME LOOP (lógica tipo Dino Chrome)
setInterval(() => {
    const dinoBottom = parseInt(
        window.getComputedStyle(dino).getPropertyValue("bottom")
    );

    const cactusLeft = cactus.getBoundingClientRect().left;
    const dinoRight = dino.getBoundingClientRect().right;

    // 👉 COLISIÓN SOLO SI BEBETO ESTÁ EN EL SUELO
    if (
        cactusLeft < dinoRight &&
        cactusLeft > dinoRight - 60 &&
        dinoBottom <= 5 &&       // <- clave: está en el piso
        !isJumping
    ) {
        alert(`💀 Game Over\nBebeto perdió contra Johan\nPuntaje: ${score}`);
        score = 0;
    }

    score++;
    scoreText.textContent = `Puntaje: ${score}`;
}, 50);





