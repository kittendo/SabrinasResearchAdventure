// loadAndSetup recursively calls all load functions, setup() and begins startScreenLoop //
function loadAndSetup() {
  calculateDimensions(); // needed for setupCanvas
  setupCanvas();
  ctx.font = "14pt Monospace";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Loading...", 0, 0);
  if (typeof createImageBitmap == "function") {
    loadImages(0);
  } else {
    ctx.fillText("Loading... (sorry about your browser)", 0, 0);
    spriteLists.push([]);
    loadImagesSafari(0, 0);
  }
}

function loadImages(k) {
  image = new Image();
  image.onload = function () {
    // needed to wait for img.src call to load
    var bmProms = [];
    for (var j = 0; j < spriteRows[k]; j++) {
      for (var i = 0; i < spriteCols[k]; i++) {
        let sw = spriteSheetW[k] / spriteCols[k];
        let sh = spriteSheetH[k] / spriteRows[k];
        bmProms.push(createImageBitmap(image, sw * i, sh * j, sw, sh));
      }
    }
    Promise.all(bmProms).then(
      // once Bitmaps are created
      function (sprt) {
        spriteLists.push(Array.from(sprt)); // add them to list
        if (k == spriteSheetPaths.length - 1)
          loadSingleImages(0, bgImages, bgPaths, bgImageW, bgImageH);
        else {
          loadImages(k + 1);
        }
      },
    );
  };
  image.src = spriteSheetPaths[k] + ".png?v=" + artVersion;
}

function loadImagesSafari(k, c) {
  // one call for each cell c in each sheet k
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var nstr = c + "";
  for (let i = 3 - nstr.length; i > 0; i--) nstr = "0" + nstr;
  let filename = spriteSheetPaths[k] + "/tile" + nstr + ".png?v=" + artVersion;
  let image = new Image();
  image.onload = function () {
    // needed to wait for img.src call to load
    spriteLists[k].push(image);
    if (c == spriteCols[k] * spriteRows[k] - 1) {
      if (k == spriteSheetPaths.length - 1) {
        loadSingleImages(0, bgImages, bgPaths, bgImageW, bgImageH);
      } else {
        spriteLists.push([]);
        loadImagesSafari(k + 1, 0);
      }
    } else loadImagesSafari(k, c + 1);
  };
  image.src = filename;
}

function loadSingleImages(k, images, paths, Ws, Hs) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  image = new Image();
  image.onload = function () {
    // needed to wait for img.src call to load
    images.push(image);
    if (k == paths.length - 1) {
      // end this recursion
      if (paths == bgPaths)
        loadSingleImages(0, ctrlImages, ctrlPaths, ctrlImageW, ctrlImageH); // start next recursion
      else {
        setup(); // setup at end of recursion
        if (DEBUGGING) {
          setGameState(TITLE);
          setGameState(PLAYING);
        } else {
          window.requestAnimationFrame(startScreenLoop);
          setGameState(READY);
        }
      }
    } else {
      loadSingleImages(k + 1, images, paths, Ws, Hs);
    }
  };
  image.src = paths[k] + "?v=" + artVersion;
}

function setup() {
  calculateDimensions();
  setupCanvas();
  setupWorld();
  registerInputEvents();
  setupButtons();
}

function startScreenLoop(t1) {
  calculateDimensions(); //
  setupCanvas(); //
  if (
    document.documentElement.clientHeight < document.documentElement.clientWidth
  ) {
    text = "TOUCH OR PRESS ENTER TO CONTINUE";
    if (gameState == FLIP) setGameState(READY);
  } else {
    text = "PLEASE PLAY IN LANDSCAPE";
    setGameState(FLIP);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 18pt Monospace";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(text, 15 * m, 7 * m);

  if (gameState == READY || gameState == FLIP) {
    window.requestAnimationFrame(startScreenLoop);
  } else {
    // done looping - remove text or it looks wierd for a sec
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function calculateDimensions() {
  m = Math.floor(document.documentElement.clientHeight / 20);
  if (
    document.documentElement.clientHeight /
      document.documentElement.clientWidth >
    2 / 3
  ) {
    m = Math.floor(document.documentElement.clientWidth / 30);
  }
  // console.log(document.body.clientHeight, "x", document.documentElement.clientWidth)
  // console.log(m, "pixels per game block")
  mps = m / 1000.0;
  g = 0.05 * mps;
  t = 0;
  camx = 0;
  camy = 0;
}

function setupCanvas() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = m * 30;
  canvas.height = m * 20;
  //ctx.imageSmoothingEnabled = false; // set this last in canvas setup or it will be reset
}

function setupButtons() {
  // Computer Buttons //
  eraseButton = new Button(
    23.5 * m,
    2.25 * m,
    4 * m,
    1 * m,
    "Erase Probes",
    "#000000",
    "rgba(240,210,210,1)",
    "rgba(255,100,100,1)",
    "erasePressed",
  );
  eraseButton.font = "bold 12pt Monospace";
  exportButton = new Button(
    19 * m,
    2.25 * m,
    4 * m,
    1 * m,
    "Export Data",
    "#000000",
    "rgba(210,210,240,1)",
    "rgba(100,100,255,1)",
    "exportPressed",
  );
  exportButton.font = "bold 12pt Monospace";

  // Pause Menu Buttons //
  let bw = 4.25 * m;
  let bh = 1 * m;
  let bs = 0.75 * m;
  let nb = 5;
  let bx0 = 15 * m - (bw * nb + bs * (nb - 1)) / 2;
  let by0 = 0.25 * m;
  let c1 = "rgba(255,200,200,.2)";
  let c2 = "rgba(160,200,255,.7)";
  let ct = "#FFFFFF";
  menuButton = new Button(
    0.25 * m,
    by0,
    1.5 * m,
    1.5 * m,
    "...",
    ct,
    c1,
    c2,
    "menuPressed",
  );
  menuButton.font = "bold 14pt Monospace";
  menuButton.texty = 0.5;
  aboutButton = new Button(
    28.25 * m,
    by0,
    1.5 * m,
    1.5 * m,
    "?",
    ct,
    c1,
    c2,
    "aboutPressed",
  );
  aboutButton.font = "bold 15pt Monospace";
  objButton = new Button(
    bx0,
    by0,
    bw,
    bh,
    "OBJECTIVES",
    ct,
    c1,
    c2,
    "objPressed",
  );
  ctrlButton = new Button(
    bx0 + bw + bs,
    by0,
    bw,
    bh,
    "CONTROLS",
    ct,
    c1,
    c2,
    "ctrlPressed",
  );
  leftyButton = new Button(
    bx0 + (bw + bs) * 2,
    by0,
    bw,
    bh,
    "LEFTY MODE",
    ct,
    c1,
    c2,
    "leftyPressed",
  );
  resetButton = new Button(
    bx0 + (bw + bs) * 3,
    by0,
    bw,
    bh,
    "RESTART",
    ct,
    c1,
    c2,
    "restartPressed",
  );
  fullButton = new Button(
    bx0 + (bw + bs) * 4,
    by0,
    bw,
    bh,
    "FULLSCREEN",
    ct,
    c1,
    c2,
    "fullscreenPressed",
  );

  buttons.push(menuButton); // only display Menu button initially
}

function setupWorld() {
  // Empty Lists in case of restart //
  guys.length = 0;
  blocks.length = 0;
  decos.length = 0;
  drops.length = 0;
  buttons.length = 0;
  warps.length = 0;
  streams.length = 0;

  //-------------- PLAYER --------------//
  let sabx0 = 32 * m;
  let saby0 = 10 * m;
  let sabh = 1.5 * m;
  let hitx_px = 12; // _px variables refer to spritesheet pixels
  let hity_px = 6;
  let hitw_px = 11;
  let hith_px = 27;
  let spritew_px = 28;
  let spriteh_px = 35;
  let sabw = (hitw_px / hith_px) * sabh;
  let spriteScale = sabh / hith_px;
  sabra = new Player(sabx0, saby0, sabw, sabh);
  sabra.setupAnimation(
    spriteLists[0],
    6,
    spritew_px * spriteScale,
    spriteh_px * spriteScale,
    hitx_px * spriteScale,
    hity_px * spriteScale,
  );
  sabra.sequences.push([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
  ]); // 0: idle
  sabra.sequences.push([3, 4, 5, 4]); // 1: run
  sabra.sequences.push([7]); // 2: item
  sabra.sequences.push([9, 10, 11, 10]); // 3: jump 1
  sabra.sequences.push([12, 13, 14, 13]); // 4: jump 2
  sabra.anistate = 0;
  camx = sabx0 - canvas.width / 2;
  guys.push(sabra);

  //--------- Probes ---------//
  hitx_px = 7; // _px variables refer to spritesheet pixels
  hity_px = 2;
  hitw_px = 3;
  hith_px = 18;
  spritew_px = 18;
  spriteh_px = 18;
  spriteScale = (0.15 * m) / 3;
  for (let i = 0; i < 3; i++) {
    let probe = new Probe(
      (tentx + 3 + i * 0.9) * m,
      14.5 * m,
      0.15 * m,
      0.9 * m,
    );
    probe.setupAnimation(
      spriteLists[4],
      1,
      spritew_px * spriteScale,
      1.2 * spriteh_px * spriteScale,
      hitx_px * spriteScale,
      hity_px * spriteScale,
    );
    probe.sequences = [[2], [2], [2], [2]];
    probe.anistate = 0;
    guys.push(probe);
  }
  guys[guys.length - 3].color = "#FF0000";
  guys[guys.length - 2].color = "#00FF00";
  guys[guys.length - 1].color = "#00AAFF";

  //// TEST LAPTOP ////
  // sabra.x = -42*m
  // let probe = guys.pop()
  // for (let i=0; i<100; i++){
  // probe.data.push(i);
  // probe.data.push(i**2);
  // }
  // sabra.stuff.push(probe);

  // pavilion //
  shadex = -53;
  let d = new DrawBlock((shadex + 5) * m, 8 * m, 10 * m, 8 * m, "#AA7755");
  d.setSprites(spriteLists[7], 2, 2, 2, 2, 2, 2, 2);
  d.bg = true;
  decos.push(d);
  decos.push(
    new DrawBlock((shadex + 6) * m, 8 * m, 9 * m, 7.5 * m, "rgba(0,0,0,.2)"),
  );
  decos.push(
    new DrawBlock(
      (shadex + 6) * m,
      15.5 * m,
      11.5 * m,
      0.5 * m,
      "rgba(0,0,0,.2)",
    ),
  );
  for (let i = 0; i < 5; i++) {
    if (i == 2) continue;
    d = new DrawBlock(
      (shadex + 2 + 3.75 * i) * m,
      9.5 * m,
      m,
      7 * m,
      "#AA7755",
    );
    d.setSprites(spriteLists[7], 5, 8, 5, 5, 8, 5, 5);
    decos.push(d);
  }
  d = new DrawBlock(shadex * m, 5 * m, 20 * m, 4 * m, "#335599");
  d.setSprites(spriteLists[7], 1, 7, 3, 0, 6, 4, -1);
  decos.push(d);
  let b = new Block((shadex - 5) * m, 15.5 * m, 30 * m, 1.5 * m, blocks.length);
  b.setSprites(spriteLists[5], 8, 5, 8, 5, 8, 8, -1);
  b.color = "#CDD0D6";
  blocks.push(b);

  // table //
  decos.push(
    new DrawBlock(
      (laptopx - 0.4) * m,
      (laptopy + 1) * m,
      0.1 * m,
      0.7 * m,
      "#111111",
    ),
  );
  decos.push(
    new DrawBlock(
      (laptopx + 1.3) * m,
      (laptopy + 1) * m,
      0.1 * m,
      0.7 * m,
      "#111111",
    ),
  );
  b = new Block(
    (laptopx - 0.5) * m,
    (laptopy + 1) * m,
    2 * m,
    0.2 * m,
    blocks.length,
  );
  b.color = "#532915";
  b.solid = false;
  b.bg = false;
  blocks.push(b);

  // laptop //
  d = new DrawBlock(laptopx * m, laptopy * m, m, m, "#777777");
  d.setSprites(spriteLists[4], 0, 0, 0, 0, 0, 0, -1);
  // d.bg = true
  decos.push(d);

  // tent //
  let tentC = "#E8EEFF";
  decos.push(new DrawBlock(tentx * m, 11 * m, 8 * m, 5 * m, "rgba(0,0,0,.1)"));
  d = new DrawBlock(tentx * m, 10 * m, 8 * m, 6 * m, tentC);
  d.setSprites(spriteLists[6], 1, 4, 3, 0, 6, 4, 4);
  decos.push(d);
  for (let i = 0; i < 2; i++) {
    d = new DrawBlock((tentx + 5 * i) * m, 11 * m, 3 * m, 6 * m, tentC);
    d.setSprites(spriteLists[6], 8, 8, 7, 7, 7, 8, 5);
    d.bg = true;
    decos.push(d);
  }
  b = new Block((tentx + 0.5) * m, 10.6 * m, 7 * m, 0.4 * m, blocks.length);
  b.color = tentC;
  b.bg = true;
  blocks.push(b);

  // shelf //
  for (let i = 0; i < 2; i++) {
    d = new DrawBlock(
      (tentx + 2.1 + 3.7 * i) * m,
      11.8 * m,
      0.1 * m,
      4 * m,
      "#000000",
    );
    d.bg = true;
    decos.push(d);
  }
  for (let i = 0; i < 3; i++) {
    b = new Block(
      (tentx + 2) * m,
      (15.8 - 2.1 * i) * m,
      4 * m,
      0.2 * m,
      blocks.length,
    );
    b.color = "#555555";
    b.solid = false;
    blocks.push(b);
  }

  // stumps //
  b = new Block(111 * m, 14 * m, m, 2 * m, blocks.length);
  b.setSprites(spriteLists[3], 4, 7, 7, 4, 7, 7, 1);
  b.color = "#432616";
  b.solid = false;
  blocks.push(b);
  b = new Block(107.3 * m, 10.5 * m, m, 6 * m, blocks.length);
  b.setSprites(spriteLists[3], 4, 7, 7, 4, 7, 7, 1);
  b.color = "#432616";
  b.solid = false;
  blocks.push(b);

  // tree //
  let treex = 118;
  b = new Block(treex * m, 7 * m, m, 10 * m, blocks.length); // trunk
  b.setSprites(spriteLists[3], 4, 7, 7, 4, 7, 7, 1);
  b.color = "#432616";
  b.solid = false;
  blocks.push(b);
  decos.push(new DrawBlock(treex * m, 8 * m, m, 0.5 * m, "rgba(0,0,0,.2)"));
  for (let i = 0; i < 8; i++) {
    b = new Block(
      (treex - 0.5 - i / 2) * m,
      i * m,
      (i + 2) * m,
      1 * m,
      blocks.length,
    );
    b.setSprites(spriteLists[2], 7, 7, 6, 6, 6, 7, 5);
    b.solid = false;
    b.color = "#004005";
    blocks.push(b);
  }

  // bush //
  b = new Block(95 * m, 13.6 * m, 7 * m, 3 * m, blocks.length);
  b.setSprites(spriteLists[2], 1, 7, 3, 0, 6, 4, 2);
  b.color = "#004005";
  b.solid = false;
  blocks.push(b);
  decos.push(
    new DrawBlock(95.2 * m, 13.7 * m, 6.6 * m, 3 * m, "rgba(0,0,0,.1)"),
  );

  // grass //
  for (let i = 0; i < 2; i++) {
    let b = new Block((29 + 50 * i) * m, 16 * m, 45 * m, 2 * m, blocks.length);
    b.solid = false;
    b.setSprites(spriteLists[1], 1, 7, 3, 0, 6, 4, 2);
    blocks.push(b);
  }
  b = new Block(-100 * m, 18 * m, 239 * m, 2 * m, blocks.length);
  b.color = "#202f08";
  b.setSprites(spriteLists[1], 5, 8, 5, 5, 8, 5, -1);
  b.bg = false;
  blocks.push(b);

  // flowers //
  let fx1 = [29.7, 59.3, 67.9, 89.4, 102.1, 119.3];
  for (let i = 0; i < fx1.length; i++) {
    let fy1 = 15 + Math.random() / 5;
    d = new DrawBlock(fx1[i] * m, fy1 * m, m, m, "rgba(0,0,0,0)");
    d.setSprites(spriteLists[4], 3, 3, 3, 3, 3, 3, -1);
    if (Math.random() > 0.5) d.bg = true;
    if (Math.random() > 0.5) d.invertCell = true;
    decos.push(d);
  }
  fx1 = [45.2, 67.5, 69.9, 82.8, 110.5];
  for (let i = 0; i < fx1.length; i++) {
    let fy1 = 15 + Math.random() / 5;
    d = new DrawBlock(fx1[i] * m, fy1 * m, m, m, "rgba(0,0,0,0)");
    d.setSprites(spriteLists[4], 4, 4, 4, 4, 4, 4, -1);
    if (Math.random() > 0.5) d.bg = true;
    if (Math.random() > 0.5) d.invertCell = true;
    decos.push(d);
  }
  fx1 = [40.7, 72.6, 83.8, 108.9];
  for (let i = 0; i < fx1.length; i++) {
    let fy1 = 15 + Math.random() / 5;
    d = new DrawBlock(fx1[i] * m, fy1 * m, m, m, "rgba(0,0,0,0)");
    d.setSprites(spriteLists[4], 6, 6, 6, 6, 6, 6, -1);
    if (Math.random() > 0.5) d.bg = true;
    if (Math.random() > 0.5) d.invertCell = true;
    decos.push(d);
  }

  // islands //
  for (let i = 0; i < 2; i++) {
    let b = new Block(
      (129 + i * 6.25) * m,
      16 * m,
      2 * m,
      2 * m,
      blocks.length,
    );
    b.setSprites(spriteLists[1], 1, 7, 3, 0, 6, 4, 2);
    b.solid = false;
    blocks.push(b);
  }
  for (let i = 0; i < 2; i++) {
    let b = new Block((143.5 + i * 6) * m, 18 * m, 1 * m, 2 * m, blocks.length);
    b.setSprites(spriteLists[3], 3, 6, 6, 3, 6, 6, 0);
    b.solid = false;
    blocks.push(b);
  }

  // gravel //
  b = new Block(-100 * m, 16.5 * m, 96 * m, 3 * m, blocks.length);
  b.setSprites(spriteLists[5], 1, 7, 4, 1, 7, 4, 2);
  b.color = "#F0F0E0";
  b.solid = false;
  blocks.push(b);

  // road //
  d = new DrawBlock(-100 * m, 16.5 * m, 9 * m, m, "#000000");
  d.setSprites(spriteLists[5], 3, 3, 6, 6, 6, 3, -1);
  decos.push(d);

  // fence //
  b = new Block(-86 * m, 8 * m, 1 * m, 9 * m, blocks.length);
  b.setSprites(spriteLists[3], 5, 8, 8, 5, 8, 8, 2);
  b.bg = false;
  b.color = "#707080";
  blocks.push(b);
  decos.push(new DrawBlock(-86 * m, 16.5 * m, 1 * m, 2.5 * m, "rgb(0,0,0,.1)"));

  // stream //
  let streamx = 9;
  let streamw = 130;
  b = new Block(
    (streamx + 15.8) * m,
    17.75 * m,
    (streamw - 15.8) * m,
    0.25 * m,
    blocks.length,
  );
  b.solid = false;
  b.color = "#FFFFFF";
  blocks.push(b);
  let s = new Flow1D(streamx * m, 17 * m, streamw);
  s.visc = 1e-2;
  streams.push(s);

  // hill //
  b = new Block(2 * m, 9 * m, 16 * m, 2 * m, blocks.length);
  b.setSprites(spriteLists[1], 1, 4, 3, 0, 3, 4, 2);
  b.solid = false;
  blocks.push(b);
  b = new Block(-2 * m, 11 * m, 24 * m, 2 * m, blocks.length);
  b.setSprites(spriteLists[1], 1, 4, 3, 0, 3, 4, 2);
  b.solid = false;
  blocks.push(b);
  b = new Block(-5 * m, 13 * m, 30 * m, 5 * m, blocks.length);
  b.bg = false;
  b.setSprites(spriteLists[1], 1, 7, 3, 0, 6, 4, 2);
  blocks.push(b);

  // pipe //
  b = new Block(12.8 * m, 8.5 * m, 0.3 * m, 0.5 * m, blocks.length);
  b.color = "#EEEEEE";
  blocks.push(b);
  b = new Block(12 * m, 8.5 * m, 0.3 * m, 0.5 * m, blocks.length);
  b.color = "#EEEEEE";
  blocks.push(b);
  d = new DrawBlock(12.2 * m, 8.6 * m, 0.65 * m, 0.5 * m, "#EEEEEE");
  decos.push(d);
  d = new DrawBlock(12 * m, 8.1 * m, 1 * m, 1 * m, "rgba(0,0,0,0)");
  d.setSprites(spriteLists[1], 2, 2, 2, 2, 2, 2, -1);
  d.bg = false;
  decos.push(d);
  warps.push(
    new Warp(12 * m, 8.9 * m, 1 * m, 0.1 * m, 12 * m, 17 * m, [Movable.TRACER]),
  );

  // pond //
  b = new Block(138 * m, 19.75 * m, 40 * m, 0.25 * m, blocks.length);
  b.solid = false;
  b.color = "#3B1E08";
  b.bg = true;
  blocks.push(b);
  s = new Flow1D(138.9 * m, 18.8 * m, 40);
  s.grn = 45;
  s.blu = 55;
  s.alpha = 0.95;
  s.visc = 0.5;
  s.splash = 0.1;
  s.h = 1.2 * m;
  s.D = 0.8;
  streams.push(s);

  // pond wall /
  b = new Block(178 * m, 13 * m, 20 * m, 7 * m, blocks.length);
  b.setSprites(spriteLists[2], 1, 4, 3, 0, 3, 4, 2);
  b.bg = false;
  b.color = "#004005";
  blocks.push(b);

  //---- CALCULATE WORLD DIMENSIONS ----//
  let xmin = blocks[0].x;
  let xmax = blocks[0].x;
  let ymin = blocks[0].y;
  let ymax = blocks[0].y;
  for (let i = 0; i < blocks.length; i++) {
    if (xmin > blocks[i].x) xmin = blocks[i].x;
    if (xmax < blocks[i].x + blocks[i].w) xmax = blocks[i].x + blocks[i].w;
    if (ymin > blocks[i].y) ymin = blocks[i].y;
    if (ymax < blocks[i].y + blocks[i].h) ymax = blocks[i].y + blocks[i].h;
  }
  worldX0 = xmin;
  worldWidth = xmax - xmin;
  worldHeight = ymax - ymin;
}

// OOP,
// object inheritance
// recursion
// asynchronous event handling
// kinematics/lagrangian sim
// eularian sim of 1D N-S (ADE)
// art software
// animation
