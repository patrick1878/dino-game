(() => {
  'use strict';

  // ======================= CANVAS =======================
  const canvas = document.getElementById('juego');
  const ctx = canvas.getContext('2d');
  const anuncio = document.getElementById('anuncio');

  const W = 800;
  const H = 240;
  const SUELO = 200; // y de la línea del suelo
  const S = 2; // tamaño de cada "pixel" de los sprites

  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;

  const COL = {
    fondo: '#f7f7f7',
    tinta: '#535353',
    suave: '#9a9a9a',
    nube: '#e1e1e1',
    marca: '#a8a8a8',
    novia: '#ef7aa6',
    novio: '#3f86c9',
    corazon: '#e0343c',
    lagrima: '#55b4f0',
    charco: '#8ccdf5',
    alerta: '#d93025',
  };

  // ======================= SPRITES =======================
  const mk = (filas) => ({
    filas,
    w: Math.max(...filas.map((f) => f.length)),
    h: filas.length,
  });

  const CUERPO = [
    '..........##########',
    '..........##.#########',
    '..........############',
    '..........############',
    '..........############',
    '..........########',
    '..........#####',
    '#.......#######',
    '##.....#########',
    '###...###########.#',
    '####.#############.#',
    '.##################',
    '..#################',
    '...###############',
    '....#############',
    '.....###########',
    '......#########',
    '.......#######',
  ];
  const PATAS_Q = ['.......##..##.', '.......##..##.', '.......##..##.', '.......###.###'];
  const PATAS_A = ['.......##..##.', '.......##.....', '.......##.....', '.......###....'];
  const PATAS_B = ['.......##..##.', '...........##.', '...........##.', '...........###'];

  const DINO_Q = mk([...CUERPO, ...PATAS_Q]);
  const DINO_A = mk([...CUERPO, ...PATAS_A]);
  const DINO_B = mk([...CUERPO, ...PATAS_B]);

  const AG_CUERPO = [
    '....................##########',
    '....................##.#########',
    '....................############',
    '#...................########',
    '##..................#####',
    '####....##################',
    '#####.####################',
    '.##########################',
    '..#########################',
    '...######################',
    '.....####################',
    '.......################',
  ];
  const AG_A = mk([...AG_CUERPO, '.........##..##', '.........##....']);
  const AG_B = mk([...AG_CUERPO, '.........##..##', '.............##']);

  const CAC_S = mk([
    '....###....',
    '...#####...',
    '...#####...',
    '.#.#####.#.',
    '.#.#####.#.',
    '.#.#####.#.',
    '.#.#####.#.',
    '.#########.',
    '.#########.',
    '..#######..',
    '...#####...',
    '...#####...',
    '...#####...',
    '...#####...',
    '...#####...',
    '...#####...',
    '...#####...',
  ]);
  const CAC_L = mk([
    ...CAC_S.filas.slice(0, 12),
    ...Array(6).fill(CAC_S.filas[12]),
    ...CAC_S.filas.slice(12),
  ]);

  const PAJARO_A = mk([
    '..............##......',
    '.............###......',
    '............####......',
    '...........#####......',
    '..........######...#..',
    '#.#.......###########.',
    '#####.#########.#####.',
    '.###################..',
    '..################....',
    '....##########........',
    '......######..........',
  ]);
  const PAJARO_B = mk([
    '......................',
    '......................',
    '......................',
    '#.#.......###########.',
    '#####.#########.#####.',
    '.###################..',
    '..##################..',
    '....#############.....',
    '.........###..###.....',
    '..........##...###....',
    '...........#....###...',
  ]);

  const NUBE = mk([
    '........####........',
    '....##.######.###...',
    '..#################.',
    '####################.',
  ]);

  const CORAZON = mk([
    '.##...##.',
    '####.####',
    '#########',
    '#########',
    '.#######.',
    '..#####..',
    '...###...',
    '....#....',
  ]);

  const LAZO = mk(['pp.pp', 'ppRpp', 'pp.pp']);
  const PAL_LAZO = { p: '#e0245e', R: '#ffd1e3' };
  const GORRA = mk(['.CCCCCCCC.', 'CCCCCCCCCCCCCC']);
  const PAL_GORRA = { C: '#e8b81c' };
  const GAFAS = mk(['SSSS', 'SSSS']);
  const PAL_GAFAS = { S: '#14202e' };

  const DIM = {
    de: { w: DINO_Q.w * S, h: DINO_Q.h * S },
    ag: { w: AG_A.w * S, h: AG_A.h * S },
  };

  // Dibuja un sprite. `pal` es un color (para '#') o un objeto { letra: color }.
  function dibujar(sp, x, y, s, pal, opc = {}) {
    const { volteo = false, wBase = sp.w, offC = 0, offR = 0, c0 = 0, c1 = 999 } = opc;
    const mapa = typeof pal === 'string' ? { '#': pal } : pal;
    for (let r = 0; r < sp.filas.length; r++) {
      const fila = sp.filas[r];
      for (let c = 0; c < fila.length; c++) {
        if (c < c0 || c > c1) continue;
        const color = mapa[fila[c]];
        if (!color) continue;
        const cc = offC + c;
        const px = volteo ? wBase - 1 - cc : cc;
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x + px * s), Math.round(y + (offR + r) * s), s, s);
      }
    }
  }

  // Pinta una celda individual (para ojos, bocas, etc.)
  function celda(x, y, s, c, r, color, volteo = false, wBase = DINO_Q.w) {
    const px = volteo ? wBase - 1 - c : c;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x + px * s), Math.round(y + r * s), s, s);
  }

  // ======================= ESTADO =======================
  const E = { INICIO: 0, JUGANDO: 1, PERDIDO: 2, ESCENA: 3 };
  const VEL_INI = 380;
  const VEL_MAX = 640;

  let estado = E.INICIO;
  let puntos = 0;
  let hi = 0;
  try {
    hi = parseInt(localStorage.getItem('dino-hi') || '0', 10) || 0;
  } catch (e) {
    hi = 0;
  }

  let velocidad = VEL_INI;
  let velFondo = 0;
  let tiempoJuego = 0;
  let distSig = 450;
  let animT = 0;
  let destello = 0;
  let tPerdido = 0;
  let obstaculos = [];

  const dino = { x: 40, y: SUELO, vy: 0, enAire: false };
  let abajo = false;

  const nubes = Array.from({ length: 3 }, (_, i) => ({
    x: 120 + i * 280 + Math.random() * 80,
    y: 24 + Math.random() * 80,
  }));
  const marcas = Array.from({ length: 40 }, () => ({
    x: Math.random() * W,
    y: 8 + Math.random() * 22,
    w: 2 + Math.random() * 8,
  }));

  // ======================= SONIDO =======================
  let audio = null;
  let silencio = false;

  function iniciarAudio() {
    if (audio) return;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audio = null;
    }
  }

  function tono(freq, dur, tipo = 'square', vol = 0.04, espera = 0, desliza = 0) {
    if (!audio || silencio) return;
    const t0 = audio.currentTime + espera;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t0);
    if (desliza) o.frequency.linearRampToValueAtTime(freq + desliza, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(audio.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  const sonidoSalto = () => tono(520, 0.12, 'square', 0.04, 0, 260);
  const sonidoPunto = () => {
    tono(880, 0.08);
    tono(1180, 0.12, 'square', 0.04, 0.09);
  };
  const sonidoChoque = () => tono(220, 0.35, 'sawtooth', 0.06, 0, -140);
  const sonidoCorazon = () => {
    tono(660, 0.1, 'triangle', 0.06);
    tono(880, 0.18, 'triangle', 0.06, 0.1);
  };
  const sonidoSorpresa = () => tono(300, 0.2, 'square', 0.05, 0, 500);
  const sonidoLlanto = () => {
    tono(420, 0.3, 'triangle', 0.07, 0, -40);
    tono(360, 0.3, 'triangle', 0.07, 0.32, -40);
    tono(300, 0.6, 'triangle', 0.07, 0.64, -90);
  };

  // ======================= ESCENA DE LOS 500 PUNTOS =======================
  const X_NOVIA = 470;
  const X_NOVIO = 560;
  const VEL_PAREJA = 140;
  const T_ENTRAN = 0.9;
  const T_LLEGAN = T_ENTRAN + (820 - X_NOVIA) / VEL_PAREJA;
  const T_SORP = T_LLEGAN + 0.8;
  const T_LLORA = T_SORP + 1.2;
  const T_FIN = T_LLORA + 3.8;

  const esc = {
    t: 0,
    xNovia: 820,
    velInicial: 0,
    salto: false,
    pop: false,
    llora: false,
    emitir: 0,
    lagrimas: [],
  };

  function iniciarEscena() {
    estado = E.ESCENA;
    esc.t = 0;
    esc.xNovia = 820;
    esc.velInicial = velocidad;
    esc.salto = false;
    esc.pop = false;
    esc.llora = false;
    esc.emitir = 0;
    esc.lagrimas = [];
    obstaculos = [];
    abajo = false;
    if (puntos > hi) guardarHi();
    sonidoPunto();
    anuncio.textContent =
      'Llegaste a 500 puntos. El dinosaurio encontró a su novia con otro y se puso a llorar. Presiona espacio para reintentar.';
  }

  function guardarHi() {
    hi = Math.floor(puntos);
    try {
      localStorage.setItem('dino-hi', String(hi));
    } catch (e) {
      /* sin almacenamiento disponible */
    }
  }

  // ======================= FLUJO DEL JUEGO =======================
  function empezar() {
    estado = E.JUGANDO;
    puntos = 0;
    tiempoJuego = 0;
    velocidad = VEL_INI;
    obstaculos = [];
    distSig = 450;
    destello = 0;
    dino.x = 40;
    dino.y = SUELO;
    dino.vy = 0;
    dino.enAire = false;
    anuncio.textContent = 'Juego iniciado.';
  }

  function saltar() {
    if (dino.enAire) return;
    dino.vy = -640;
    dino.enAire = true;
    sonidoSalto();
  }

  function accion() {
    iniciarAudio();
    if (estado === E.INICIO) {
      empezar();
      saltar();
    } else if (estado === E.JUGANDO) {
      saltar();
    } else if (estado === E.PERDIDO && performance.now() - tPerdido > 400) {
      empezar();
    } else if (estado === E.ESCENA && esc.t > T_FIN) {
      empezar();
    }
  }

  function perder() {
    estado = E.PERDIDO;
    tPerdido = performance.now();
    if (puntos > hi) guardarHi();
    sonidoChoque();
    anuncio.textContent = 'Perdiste con ' + Math.floor(puntos) + ' puntos. Presiona espacio para reintentar.';
  }

  // ======================= OBSTÁCULOS =======================
  function crearObstaculo() {
    const esPajaro = puntos > 120 && Math.random() < 0.28;
    if (esPajaro) {
      const alturas = [70, 40, 10]; // pasar por debajo, agacharse o saltar
      const alt = alturas[Math.floor(Math.random() * alturas.length)];
      obstaculos.push({
        tipo: 'pajaro',
        x: W + 20,
        y: SUELO - alt,
        w: PAJARO_A.w * S,
        h: PAJARO_A.h * S,
        frame: 0,
        t: 0,
      });
    } else {
      const grande = Math.random() < 0.4;
      const n = grande ? 1 + (Math.random() < 0.3 ? 1 : 0) : 1 + Math.floor(Math.random() * 3);
      const sp = grande ? CAC_L : CAC_S;
      obstaculos.push({
        tipo: 'cactus',
        x: W + 20,
        y: SUELO,
        w: n * sp.w * S + (n - 1) * 4,
        h: sp.h * S,
        n,
        grande,
      });
    }
  }

  function cajaObstaculo(o) {
    const top = o.y - o.h;
    if (o.tipo === 'pajaro') return { x: o.x + 6, y: top + 6, w: o.w - 12, h: o.h - 10 };
    return { x: o.x + 4, y: top + 4, w: o.w - 8, h: o.h - 6 };
  }

  function cajaDino() {
    const agach = abajo && !dino.enAire;
    const d = agach ? DIM.ag : DIM.de;
    const top = dino.y - d.h;
    return { x: dino.x + 8, y: top + 4, w: d.w - 14, h: d.h - 6 };
  }

  function choca(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ======================= ACTUALIZAR =======================
  function fisicaDino(dt) {
    if (!dino.enAire) return;
    const g = abajo && estado === E.JUGANDO ? 4200 : 2100;
    dino.vy += g * dt;
    dino.y += dino.vy * dt;
    if (dino.y >= SUELO) {
      dino.y = SUELO;
      dino.vy = 0;
      dino.enAire = false;
    }
  }

  function actualizarFondo(dt) {
    for (const m of marcas) {
      m.x -= velFondo * dt;
      if (m.x < -12) {
        m.x += W + 24;
        m.y = 8 + Math.random() * 22;
        m.w = 2 + Math.random() * 8;
      }
    }
    for (const n of nubes) {
      n.x -= (velFondo * 0.2 + 12) * dt;
      if (n.x < -90) {
        n.x = W + Math.random() * 120;
        n.y = 24 + Math.random() * 80;
      }
    }
  }

  function actualizarJugando(dt) {
    tiempoJuego += dt;
    velocidad = Math.min(VEL_MAX, VEL_INI + tiempoJuego * 7);
    velFondo = velocidad;

    const antes = Math.floor(puntos / 100);
    puntos += velocidad * dt * 0.026;
    if (Math.floor(puntos / 100) > antes && puntos < 500) {
      destello = 0.9;
      sonidoPunto();
    }
    if (destello > 0) destello -= dt;

    animT += dt * (velocidad / 380) * 9;
    fisicaDino(dt);

    distSig -= velocidad * dt;
    if (distSig <= 0 && puntos < 475) {
      crearObstaculo();
      distSig = 300 + Math.random() * 260 + velocidad * 0.45;
    }

    for (const o of obstaculos) {
      if (o.tipo === 'pajaro') {
        o.x -= (velocidad + 80) * dt;
        o.t += dt;
        o.frame = Math.floor(o.t / 0.15) % 2;
      } else {
        o.x -= velocidad * dt;
      }
    }
    obstaculos = obstaculos.filter((o) => o.x + o.w > -20);

    const cd = cajaDino();
    for (const o of obstaculos) {
      if (choca(cd, cajaObstaculo(o))) {
        perder();
        return;
      }
    }

    if (puntos >= 500) {
      puntos = 500;
      iniciarEscena();
    }
  }

  function actualizarEscena(dt) {
    esc.t += dt;
    const t = esc.t;

    velFondo = esc.velInicial * Math.max(0, 1 - t / 1.2);
    animT += dt * (t < 1.2 ? 9 * (1 - t / 1.2) + 5 : 5);

    // El dinosaurio frena y camina despacio hacia el centro
    dino.x = 40 + Math.min(110, Math.max(0, (t - 0.6) * 55));
    fisicaDino(dt);

    // Entra la pareja caminando desde la derecha
    esc.xNovia = t < T_ENTRAN ? 820 : Math.max(X_NOVIA, 820 - VEL_PAREJA * (t - T_ENTRAN));

    if (t >= T_LLEGAN && !esc.pop) {
      esc.pop = true;
      sonidoCorazon();
    }
    if (t >= T_SORP && !esc.salto) {
      esc.salto = true;
      dino.vy = -330;
      dino.enAire = true;
      sonidoSorpresa();
    }
    if (t >= T_LLORA && !esc.llora) {
      esc.llora = true;
      sonidoLlanto();
    }

    if (esc.llora) {
      esc.emitir -= dt;
      while (esc.emitir <= 0) {
        esc.emitir += 0.045;
        esc.lagrimas.push({
          x: dino.x + 12 * S + 3,
          y: SUELO - DINO_Q.h * S + 2 * S + 4,
          vx: (Math.random() - 0.5) * 50,
          vy: 20 + Math.random() * 40,
        });
      }
    }
    for (const l of esc.lagrimas) {
      l.vy += 700 * dt;
      l.x += l.vx * dt;
      l.y += l.vy * dt;
    }
    esc.lagrimas = esc.lagrimas.filter((l) => l.y < SUELO - 2);
  }

  function actualizar(dt) {
    if (estado === E.JUGANDO) actualizarJugando(dt);
    else if (estado === E.ESCENA) actualizarEscena(dt);
    else velFondo = 0;
    actualizarFondo(dt);
  }

  // ======================= DIBUJAR =======================
  const pad = (n) => String(Math.floor(n)).padStart(5, '0');

  function textoCentro(txt, y, tam, color) {
    ctx.font = 'bold ' + tam + 'px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = COL.fondo;
    ctx.strokeText(txt, W / 2, y);
    ctx.fillStyle = color;
    ctx.fillText(txt, W / 2, y);
  }

  function dibujarSuelo() {
    ctx.fillStyle = COL.tinta;
    ctx.fillRect(0, SUELO, W, 2);
    ctx.fillStyle = COL.marca;
    for (const m of marcas) {
      ctx.fillRect(Math.round(m.x), Math.round(SUELO + m.y), Math.round(m.w), 2);
    }
  }

  function dibujarObstaculo(o) {
    if (o.tipo === 'pajaro') {
      const sp = o.frame ? PAJARO_B : PAJARO_A;
      dibujar(sp, o.x, o.y - sp.h * S, S, COL.tinta);
    } else {
      const sp = o.grande ? CAC_L : CAC_S;
      for (let i = 0; i < o.n; i++) {
        dibujar(sp, o.x + i * (sp.w * S + 4), o.y - sp.h * S, S, COL.tinta);
      }
    }
  }

  function dibujarDinoJuego() {
    const frame = Math.floor(animT) % 2;
    const agach = abajo && !dino.enAire && estado === E.JUGANDO;
    if (agach) {
      const sp = frame ? AG_B : AG_A;
      dibujar(sp, dino.x, dino.y - sp.h * S, S, COL.tinta);
      return;
    }
    let sp = DINO_Q;
    if (estado === E.JUGANDO && !dino.enAire) sp = frame ? DINO_B : DINO_A;
    const top = dino.y - sp.h * S;
    dibujar(sp, dino.x, top, S, COL.tinta);
    if (estado === E.PERDIDO) {
      // ojo en forma de X
      [[11, 0], [13, 0], [12, 1], [11, 2], [13, 2]].forEach(([c, r]) =>
        celda(dino.x, top, S, c, r, COL.fondo)
      );
    }
  }

  function globo(texto, x, y) {
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.textAlign = 'left';
    const bw = ctx.measureText(texto).width + 24;
    const bh = 32;
    const bx = Math.min(Math.max(8, x), W - bw - 8);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = COL.tinta;
    ctx.lineWidth = 3;
    ctx.fillRect(bx, y, bw, bh);
    ctx.strokeRect(bx, y, bw, bh);
    // cola del globo
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(bx + 14, y + bh - 1);
    ctx.lineTo(bx + 24, y + bh + 11);
    ctx.lineTo(bx + 34, y + bh - 1);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + 14, y + bh);
    ctx.lineTo(bx + 24, y + bh + 11);
    ctx.lineTo(bx + 34, y + bh);
    ctx.stroke();
    ctx.fillStyle = COL.tinta;
    ctx.fillText(texto, bx + 12, y + 21);
  }

  function dibujarEscena() {
    const t = esc.t;
    const caminaPareja = t < T_LLEGAN;

    // --- Pareja ---
    if (t >= T_ENTRAN) {
      const fr = caminaPareja ? (Math.floor(t * 8) % 2 ? DINO_A : DINO_B) : DINO_Q;
      const top = SUELO - fr.h * S;
      const xa = Math.round(esc.xNovia);
      const xo = Math.round(esc.xNovia + (X_NOVIO - X_NOVIA));
      const base = { wBase: DINO_Q.w };

      // Novia (camina mirando al frente; al llegar mira a su pareja)
      const vNovia = caminaPareja;
      dibujar(fr, xa, top, S, COL.novia, { ...base, volteo: vNovia });
      dibujar(LAZO, xa, top, S, PAL_LAZO, { ...base, volteo: vNovia, offC: 13, offR: -3 });

      // El otro
      dibujar(fr, xo, top, S, COL.novio, { ...base, volteo: true });
      dibujar(GORRA, xo, top, S, PAL_GORRA, { ...base, volteo: true, offC: 10, offR: -2 });
      dibujar(GAFAS, xo, top, S, PAL_GAFAS, { ...base, volteo: true, offC: 12, offR: 1 });

      // Corazón entre los dos
      if (!caminaPareja) {
        const escalas = [0, 1, 2, 3, 4, 3];
        const k = Math.min(5, Math.floor((t - T_LLEGAN) * 12));
        const es = escalas[k];
        if (es > 0) {
          const cx = (xa + DINO_Q.w * S + xo) / 2;
          const bob = Math.sin(t * 4) * 3;
          dibujar(
            CORAZON,
            cx - (CORAZON.w * es) / 2,
            top - CORAZON.h * es - 10 + bob,
            es,
            COL.corazon
          );
        }
      }
    }

    // --- Dinosaurio ---
    const llora = t >= T_LLORA;
    const sacudida = llora ? Math.round(Math.sin(t * 50) * 1.5) : 0;
    const dx = dino.x + sacudida;
    const moviendo = t < T_LLEGAN && !dino.enAire;
    const fr = moviendo ? (Math.floor(animT) % 2 ? DINO_A : DINO_B) : DINO_Q;
    const top = dino.y - fr.h * S;
    dibujar(fr, dx, top, S, COL.tinta);

    if (llora) {
      // ojo grande y boca abierta llorando
      [[12, 1], [13, 1], [12, 2], [13, 2], [16, 3], [17, 3], [18, 3], [19, 3], [16, 4], [17, 4], [18, 4], [19, 4]]
        .forEach(([c, r]) => celda(dx, top, S, c, r, COL.fondo));

      // charco que va creciendo
      const cw = Math.min(130, (t - T_LLORA) * 22);
      ctx.fillStyle = COL.charco;
      ctx.fillRect(Math.round(dino.x + 22 - cw / 2), SUELO - 4, Math.round(cw), 4);

      // lágrimas
      ctx.fillStyle = COL.lagrima;
      for (const l of esc.lagrimas) ctx.fillRect(Math.round(l.x), Math.round(l.y), 2, 5);

      // corazón roto sobre el dinosaurio
      if (t >= T_LLORA + 0.8) {
        const hx = dino.x + 6;
        const hy = SUELO - DINO_Q.h * S - 60;
        dibujar(CORAZON, hx, hy, 3, COL.corazon, { c0: 0, c1: 4 });
        dibujar(CORAZON, hx + 5, hy + 7, 3, COL.corazon, { c0: 5, c1: 8 });
      }
    }

    // Signo de exclamación al verlos
    if (t >= T_SORP && t < T_LLORA) {
      ctx.font = 'bold 38px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = COL.alerta;
      ctx.fillText('!', dino.x + 24, top - 6);
    }

    // Globos de diálogo
    if (t >= T_SORP && t < T_LLORA + 1.6) globo('¿Esa es mi novia?', dino.x - 6, 52);
    else if (t >= T_LLORA + 1.6) globo('¿Con otro?... Buaaa', dino.x - 6, 52);

    if (t > T_FIN && Math.floor(t * 2) % 2 === 0) {
      textoCentro('Presiona ESPACIO para reintentar', 228, 16, COL.tinta);
    }
  }

  function dibujarHUD() {
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = COL.suave;
    ctx.fillText('HI ' + pad(hi), W - 84, 28);
    const apagado = destello > 0 && Math.floor(destello * 8) % 2 === 0;
    if (!apagado) {
      ctx.fillStyle = COL.tinta;
      ctx.fillText(pad(puntos), W - 16, 28);
    }
    if (silencio) {
      ctx.font = '12px "Courier New", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = COL.suave;
      ctx.fillText('Sonido apagado (M)', 16, 28);
    }
  }

  function iconoReintentar(cx, cy) {
    ctx.strokeStyle = COL.tinta;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, -Math.PI * 0.3, Math.PI * 1.5);
    ctx.stroke();
    ctx.fillStyle = COL.tinta;
    ctx.beginPath();
    ctx.moveTo(cx + 22, cy - 16);
    ctx.lineTo(cx + 8, cy - 22);
    ctx.lineTo(cx + 12, cy - 6);
    ctx.closePath();
    ctx.fill();
  }

  function dibujarTodo() {
    ctx.fillStyle = COL.fondo;
    ctx.fillRect(0, 0, W, H);

    for (const n of nubes) dibujar(NUBE, n.x, n.y, 2, COL.nube);
    dibujarSuelo();
    obstaculos.forEach(dibujarObstaculo);

    if (estado === E.ESCENA) dibujarEscena();
    else dibujarDinoJuego();

    dibujarHUD();

    if (estado === E.INICIO) {
      textoCentro('Presiona ESPACIO para comenzar', 112, 20, COL.tinta);
      textoCentro('o toca la pantalla', 138, 14, COL.suave);
    } else if (estado === E.PERDIDO) {
      textoCentro('FIN DEL JUEGO', 96, 28, COL.tinta);
      iconoReintentar(W / 2, 146);
    }
  }

  // ======================= BUCLE =======================
  let ultimo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    actualizar(dt);
    dibujarTodo();
    requestAnimationFrame(bucle);
  }

  // ======================= CONTROLES =======================
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      if (!e.repeat) accion();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      abajo = true;
    } else if (e.code === 'KeyM') {
      silencio = !silencio;
      anuncio.textContent = silencio ? 'Sonido apagado.' : 'Sonido activado.';
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown' || e.code === 'KeyS') abajo = false;
  });

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    accion();
  });

  const btnSaltar = document.getElementById('btnSaltar');
  const btnAgachar = document.getElementById('btnAgachar');

  btnSaltar.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    accion();
  });
  btnAgachar.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    iniciarAudio();
    abajo = true;
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) =>
    btnAgachar.addEventListener(ev, () => {
      abajo = false;
    })
  );

  window.addEventListener('blur', () => {
    abajo = false;
  });

  requestAnimationFrame(bucle);
})();








