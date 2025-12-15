body {
    font-family: Arial, sans-serif;
    text-align: center;
    background: #f2f2f2;
}

/* Área del juego */
.game {
    width: 90%;
    max-width: 600px;
    height: 200px;
    border: 3px solid #333;
    margin: auto;
    position: relative;
    background: #fff;
    overflow: hidden;
}

/* BEBETO */
#dino {
    width: 60px;
    height: 60px;
    background: #444;
    color: white;
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    left: 40px;
    border-radius: 6px;
}

/* Salto */
.jump {
    animation: jump 0.5s linear;
}

@keyframes jump {
    0% { bottom: 0; }
    50% { bottom: 110px; }
    100% { bottom: 0; }
}

/* JOHAN */
#cactus {
    width: 60px;
    height: 40px;
    background: green;
    color: white;
    font-size: 10px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    right: -60px;
    border-radius: 6px;
    animation: move 1.5s infinite linear;
}

/* Movimiento */
@keyframes move {
    0% { right: -60px; }
    100% { right: 100%; }
}
