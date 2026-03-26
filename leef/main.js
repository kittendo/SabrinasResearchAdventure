// PROGRAM ENTRY POINT //
loadAndSetup(0);

function mainLoop(t1) {
  let dt = t1 - t;
  t = t1;
  if (dt > 200) {
    // prevent large dt while browser lost focus
    timeCorrection += dt;
    t = t1;
    window.requestAnimationFrame(mainLoop);
    return;
  }
  if (gameState == PAUSED) {
    timeCorrection += dt;
    dt = 0;
  }
  mainTimer.startLogging(false);

  // Process Inputs //
  if (gameState != PAUSED) {
    if (Math.abs(btnR - btnL) > 0.3) sabra.walk(10 * mps * (btnR - btnL));
    else sabra.walk(0); // prevents very slow movement
    if (btnA == 1) {
      btnA = 0; // prevent autofire
      sabra.jump();
    }
    if (btnB == 1) {
      btnB = 0;
      sabra.useItem(guys, t);
      for (let i = 0; i < blocks.length; i++) {
        blocks[i].boundaryCheck([guys[guys.length - 1]]); // prevent placing items in walls
      }
    }
    if (btnC == 1) {
      btnC = 0;
      sabra.switchItems(1);
    }
    if (btnD == 1) {
      btnD = 0;
      sabra.switchItems(-1);
    }
  }
  mainTimer.log();

  // Sum Forces //
  for (let i = 0; i < guys.length; i++) {
    guys[i].setForces();
  }
  mainTimer.log();

  // Update Positions //
  for (let i = 0; i < guys.length; i++) {
    guys[i].updatePosition(dt);
    // prevent falling through world //
    if (guys[i].y > 20 * m) {
      guys[i].vy = 0;
      if (guys[i].type == Movable.PROBE) guys[i].y = 14 * m;
      else guys[i].y = 10 * m;
    }
  }
  mainTimer.log();

  // Check Boundaries //
  for (let i = 0; i < blocks.length; i++) {
    // blocks
    blocks[i].boundaryCheck(guys);
  }
  for (let i = 0; i < warps.length; i++) {
    // warps
    warps[i].boundaryCheck(guys);
  }
  for (let i = 0; i < streams.length; i++) {
    // streams
    streams[i].boundaryCheck(guys, t);
  }
  mainTimer.log();

  // Check for Collisions //
  collisionCheck(guys);
  mainTimer.log();

  // Update Flows //
  streams[0].update(dt);
  streams[1].ua = streams[0].u[streams[0].n - 1];
  streams[1].ca = streams[0].c[streams[0].n - 1];
  for (let i = 1; i < streams[1].n; i++) {
    if (streams[1].c[i] > 0) streams[1].c[i] -= 5e-6 * dt; // c sink in pond
  }
  streams[1].update(dt);
  mainTimer.log();

  // Remove Inactive Guys //
  removeInactive();

  // Log Flow //
  for (let i = 0; i < guys.length; i++) {
    if (guys[i].type == Movable.PROBE) {
      guys[i].logFlow((t - timeCorrection) / 1000); // log playtime
    }
  }

  // Replenish Tracers
  restockTracers();

  // Laptop Event //
  if (
    sabra.x > (laptopx + 0.9) * m &&
    sabra.x < (laptopx + 2.25) * m &&
    sabra.y > (laptopy - 0.25) * m &&
    sabra.dir == -1
  ) {
    for (let i = 0; i < sabra.stuff.length; i++) {
      if (
        sabra.stuff[i].type == Movable.PROBE &&
        sabra.stuff[i].data.length > 0
      ) {
        if (gameState != PLOTTING) playSound(13,2,.5, false);
        setGameState(PLOTTING);
        break;
      }
    }
  } else if (gameState == PLOTTING) setGameState(PLAYING);

  // Move Camera //
  if (sabra.x - camx < 0.45 * canvas.width)
    camx = sabra.x - 0.45 * canvas.width;
  if (sabra.x - camx > 0.55 * canvas.width)
    camx = sabra.x - 0.55 * canvas.width;
  mainTimer.log();

  // Draw //
  drawWorld();
  mainTimer.log();
  drawHUD();

  mainTimer.log();
  mainTimer.display();

  if (gameState < READY) window.requestAnimationFrame(mainLoop);
}

function collisionCheck() {
  for (let j = 0; j < guys.length; j++) {
    let bl = guys[j].x;
    let br = guys[j].x + guys[j].w;
    let bt = guys[j].y;
    let bb = guys[j].y + guys[j].h;

    for (let i = j + 1; i < guys.length; i++) {
      let gl = guys[i].x;
      let gr = guys[i].x + guys[i].w;
      let gt = guys[i].y;
      let gb = guys[i].y + guys[i].h;

      // if guys overlap //
      if (gr > bl && gl < br && gb > bt && gt < bb) {
        guys[i].collide(guys[j]);
        guys[j].collide(guys[i]);
      }
    }
  }
}

function removeInactive() {
  // Guys //
  let toRemove = [];
  for (let i = 0; i < guys.length; i++) {
    if (guys[i].active == false) toRemove.push(i);
  }
  for (let i = toRemove.length - 1; i >= 0; i--) {
    guys.splice(toRemove[i], 1);
  }
  // Drops //
  toRemove = [];
  for (let i = 0; i < drops.length; i++) {
    if (drops[i].active == false) toRemove.push(i);
  }
  for (let i = toRemove.length - 1; i >= 0; i--) {
    drops.splice(toRemove[i], 1);
  }
}

function restockTracers() {
  let numTrace = 0;
  for (let i = 0; i < guys.length; i++)
    if (guys[i].type == Movable.TRACER) numTrace++;
  for (let i = 0; i < sabra.stuff.length; i++)
    if (sabra.stuff[i].type == Movable.TRACER) numTrace++;
  if (numTrace != 0) return;

  hitx_px = 6; // _px variables refer to spritesheet pixels
  hity_px = 7;
  hitw_px = 8;
  hith_px = 14;
  spritew_px = 18;
  spriteh_px = 18;
  spriteScale = (0.35 * m) / 6;
  let lvl = [0.4 * m, 0.2 * m, 0.6 * m];
  for (let i = 0; i < 3; i++) {
    let trace = new Tracer(
      (tentx + 2.5 + 1.3 * i) * m,
      13 * m,
      0.35 * m,
      0.6 * m,
    );
    trace.setupAnimation(
      spriteLists[4],
      1,
      spritew_px * spriteScale,
      spriteh_px * spriteScale,
      hitx_px * spriteScale,
      hity_px * spriteScale,
    );
    trace.hp = lvl[i];
    trace.sequences = [[1], [1], [1], [1]];
    trace.anistate = 0;
    guys.push(trace);
  }
}

function setGameState(newState) {
  // SHOWING LOGO //
  if (gameState == READY && newState == LOGO) {
    tLogo0 = 0;
    setTimeout(function () {
      setup(); // recalc sizes after fullscreen
      window.requestAnimationFrame(logoLoop);
    }, 700);
  }
  // SHOWING TITLE SCREEN //
  else if (gameState == LOGO && newState == TITLE) {
    titlet0 = 0;
    window.requestAnimationFrame(displayTitleScreen);
  }
  // STARTING LEVEL //
  else if (gameState >= TITLE && newState == PLAYING) {
    window.requestAnimationFrame(mainLoop);
  }
  // UNPAUSING //
  else if (gameState == PAUSED && newState == PLAYING) {
    buttons.splice(buttons.indexOf(resetButton), 1);
    buttons.splice(buttons.indexOf(fullButton), 1);
    buttons.splice(buttons.indexOf(leftyButton), 1);
    buttons.splice(buttons.indexOf(ctrlButton), 1);
    buttons.splice(buttons.indexOf(aboutButton), 1);
    buttons.splice(buttons.indexOf(objButton), 1);
  }
  // PAUSING //
  else if (gameState == PLAYING && newState == PAUSED) {
    buttons.push(resetButton);
    buttons.push(fullButton);
    buttons.push(leftyButton);
    buttons.push(ctrlButton);
    buttons.push(aboutButton);
    buttons.push(objButton);
  }
  // RESTARTING //
  else if (newState == RESTART) {
    setGameState(LOGO);
    setGameState(TITLE);
    calculateDimensions();
    setupCanvas();
    setupWorld();
    setupButtons();
    return;
  }
  // START PLOTTING //
  else if (gameState == PLAYING && newState == PLOTTING) {
    buttons.splice(buttons.indexOf(menuButton), 1);
    buttons.push(eraseButton);
    buttons.push(exportButton);
  }
  // STOP PLOTTING //
  else if (gameState == PLOTTING && newState == PLAYING) {
    buttons.splice(buttons.indexOf(eraseButton), 1);
    buttons.splice(buttons.indexOf(exportButton), 1);
    buttons.push(menuButton);
  }
  gameState = newState;
}

// Create and download a file containing text //
function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
