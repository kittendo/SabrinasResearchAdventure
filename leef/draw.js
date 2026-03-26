var borderColor = "#222233";
var titlet0 = 0;

function drawHUD() {
  if (gameState != PLAYING) return;
  ////// MINIMAP //////
  let mx = (canvas.width-worldWidth/20) / 2 - worldX0/20;
  let my = 0;
  ctx.fillStyle = "rgba(255,255,255,.1)";
  ctx.fillRect(mx+worldX0/20, my, worldWidth/20, worldHeight/20);
  for (let i=0; i<decos.length; i++) { // BG DrawBlocks //
     if (decos[i].bg) decos[i].drawMini(mx, my, ctx);
  }
  for (let i=0; i<blocks.length; i++) { // BG Blocks //
    if (blocks[i].bg) blocks[i].drawMini(mx, my, ctx);
  }
  for (let i=0; i<decos.length; i++) { // FG DrawBlocks //
    if (!decos[i].bg) decos[i].drawMini(mx, my, ctx);
  }
  for (let i=0; i<streams.length; i++) { // Streams //
    streams[i].drawMini(mx, my, ctx);
  }
  for (let i=0; i<blocks.length; i++) { // FG Blocks //
    if (!blocks[i].bg) blocks[i].drawMini(mx, my, ctx);
  }
  for (let i=0; i<guys.length; i++) { // Guys //
    guys[i].drawMini(mx, my, ctx);
  }
  ctx.lineWidth = 1;  // Camera Box
  ctx.strokeStyle = "#FFFFFF";
  ctx.strokeRect(camx/20+mx, camy/20+my, canvas.width/20, canvas.height/20);

  //////// HELD ITEM ////////
  let itx = 28*m;
  let ity = 1.25*m;
  ctx.strokeStyle = "rgba(255,255,255,.1)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(itx-.5*m, ity+.2*m);
  ctx.lineTo(itx+.5*m, ity+.2*m);
  ctx.lineTo(itx+.7*m, ity-.45*m);
  ctx.lineTo(itx+.5*m, ity-1.1*m);
  ctx.lineTo(itx-.5*m, ity-1.1*m);
  ctx.lineTo(itx-.7*m, ity-.45*m);
  ctx.closePath();
  ctx.stroke();
  if (sabra.itemCur >= 0) {
    let item = sabra.stuff[sabra.itemCur];
    item.x = itx - item.w/2;
    item.y = ity - item.h;
    item.draw(0, 0, t, ctx) ;
  }
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTimer.startLogging(false);

  // Background //
  ctx.drawImage(bgImages[0], 0, 0, 30*m, worldHeight+1);
  drawTimer.log();

  // Midground //
  let mgSpeed = 0.35
  let mgW = bgImageW[2]*worldHeight/bgImageH[2]
  ctx.drawImage(bgImages[2], 9*m-mgW-mgSpeed*camx, 0, mgW+1, worldHeight+1);
  mgW = bgImageW[1]*worldHeight/bgImageH[1]
  for (let i=0; i<2; i++) {
    let mgx = 9*m+mgW*i-mgSpeed*camx;
    if (mgx+mgW < 0 || mgx > 30*m) continue;
    ctx.drawImage(bgImages[1], mgx, 0, mgW+1, worldHeight+1);
  }
  drawTimer.log();
  // BG DrawBlocks //
  for (let i=0; i<decos.length; i++) {
     if (decos[i].bg) decos[i].draw(camx, camy, ctx);
  }
  drawTimer.log();
  // BG Blocks //
  for (let i=0; i<blocks.length; i++) {
    if (blocks[i].bg) blocks[i].draw(camx, camy, ctx);
  }
  drawTimer.log();
  // Guys //
  for (let i=0; i<guys.length; i++) {
    guys[i].draw(camx, camy, t, ctx);
  }
  drawTimer.log();
  // FG DrawBlocks //
  for (let i=0; i<decos.length; i++) {
    if (!decos[i].bg) decos[i].draw(camx, camy, ctx);
  }
  drawTimer.log();
  // Droplets //
  for (let i=0; i<drops.length; i++) {
    drops[i].draw(camx, camy, t, ctx);
  }
  drawTimer.log();
  // Streams //
  for (let i=0; i<streams.length; i++) {   // streams
    streams[i].draw(camx, camy, ctx);
  }
  drawTimer.log();
  // FG Blocks //
  for (let i=0; i<blocks.length; i++) {
    if (!blocks[i].bg) blocks[i].draw(camx, camy, ctx);
  }
  drawTimer.log();
  // Computer Screen //
  if (gameState == PLOTTING) {
    makePlots();
  }
  // Pause Menu //
  if (gameState == PAUSED){
    var grd = ctx.createLinearGradient(0, 3.5*m, 0, 0);
    grd.addColorStop(1, "rgba(255,255,255, .05)");
    grd.addColorStop(.05, "rgba(255,255,255,.3)");
    grd.addColorStop(0, "rgba(255,255,255,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 30*m, 3.5*m);
    ctx.font = "bold 20pt Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("~ PAUSE ~", 15*m, 2*m);
    if (showTutorial) drawTutorial(t);
    if (showAbout) drawAbout();
    if (showObj) drawObjectives();
  }
  for (let i=0; i<buttons.length; i++){
    buttons[i].draw(ctx);
  }
  drawTimer.display();
}

function makePlots() {
  let ns = sabra.stuff.length;
  let sy = .5*m;

  // Bezel //
  ctx.fillStyle = "#777777";
  ctx.beginPath();
  rRect(m, sy, 28*m, 18*m, [m]);
  ctx.fill();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  rRect(1.1*m, sy+.1*m, 27.8*m, 17.8*m, [m]);
  ctx.fill();
  // Base//
  var grd = ctx.createLinearGradient(0, sy+17.25*m, 0, sy+18*m);
  grd.addColorStop(0,  "#AAAAAA");
  grd.addColorStop(.5,  "#AAAAAA");
  grd.addColorStop(1,  "#555555");
  ctx.fillStyle = grd;
  ctx.beginPath();
  rRect(.1*m, sy+17.25*m, 29.8*m, .75*m, [0,0,.3*m,.3*m]);
  ctx.fill();
  // Notch //
  grd = ctx.createRadialGradient(15*m, sy+17.5*m, 0, 15*m, sy+17.5*m, 3*m);
  grd.addColorStop(0,  "#888888");
  grd.addColorStop(.9,  "#888888");
  grd.addColorStop(1,  "#444444");
  ctx.fillStyle = grd;
  ctx.beginPath();
  rRect(12*m, sy+17.25*m, 6*m, .5*m, [0,0,.4*m,.4*m]);
  ctx.fill();
  // Screen //
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(2*m, sy+1.25*m, 26*m, 15.5*m);
  // Axes //
  ctx.fillStyle = "#000000";
  ctx.fillRect(3*m, sy+3*m, 1, 12.5*m);
  ctx.fillRect(3*m, sy+15.5*m, 24*m, 1);

  // Lines //
  let cmax = 0;
  let tmax = 0;
  let tmin = Infinity;
  for (let i=0; i<ns; i++){
    let probe = sabra.stuff[i];
    if (probe.type != Movable.PROBE) continue;
    for (let j=0; j<probe.data.length; j+=2){
      if (probe.data[j]>tmax) tmax = probe.data[j];
      if (probe.data[j]<tmin) tmin = probe.data[j];
      if (probe.data[j+1]>cmax) cmax = probe.data[j+1];
    }
  }


  for (let i=0; i<ns; i++){
    let probe = sabra.stuff[i];
    if (probe.type != Movable.PROBE) continue;
    let tdat = [];
    let cdat = [];
    for (let j=0; j<probe.data.length; j+=2){
      tdat.push(probe.data[j]);
      cdat.push(probe.data[j+1]);
    }
    ctx.strokeStyle = probe.color;
    ctx.beginPath();
    ctx.moveTo(3*m, sy+15.5*m);
    for (let j=0; j<tdat.length; j++){
      tdat[j] = (tdat[j]-tmin)/(tdat[tdat.length-1]-tmin);
      cdat[j] = cdat[j]/cmax;
      ctx.lineTo(3*m+tdat[j]*23*m, sy+15.5*m-cdat[j]*11.5*m)

    }
    ctx.lineWidth = 4;
    ctx.stroke();
  }
}

function drawTutorial(t){
  let dt = t-ctrlt0;
  let fy = .008;
  let fx = .005;
  let Rx = 4.5*m;
  let Ry = 2.25*m
  let Lx = 4.6*m;
  let Ly = 2.25*m;

  let font1 =  "bold 24pt Ariel";
  let font2 = "bold 13pt Ariel"
  let font3 = "13pt Ariel"
  let heady  = 3.5*m;
  let line1y = 14*m;
  let line2y = 15.25*m;
  let hand1 = 'left';
  let hand2 = 'right';
  if (lefty){
    hand1 = 'right';
    hand2 = 'left';
  }

  let spritex = 14.25*m;
  let spritey = 8*m;
  let fps = 6;
  let seq = [0,0,0,0];
  let frame = 0;
  let dir = 1;

  let t1 = 2*Math.PI/fx*3
  let t2 = t1+2*Math.PI/fy*3
  let t3 = t2+2*Math.PI/fy*3.75
  let t4 = t3+150;
  let t5 = t4+2*Math.PI/fy*4.25
  let t6 = t5+200;
  let t7 = t6+2*Math.PI/fy*4

  ctx.fillStyle = borderColor;
  ctx.fillRect(4*m, 2*m, 22*m, 15.1*m);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(4.5*m, 2.4*m, 21*m, 14.3*m);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000000";

  // Walk //
  if (dt < t1){
    seq = [3,4,5,4];
    frame = Math.floor(dt*fps/1000)%seq.length;
    ctx.font = font1;
    ctx.fillText("Walk", 15*m, heady, 3*m);
    ctx.font = font2;
    ctx.fillText("Drag side-to-side with " + hand1 + " thumb", 15*m, line1y, 12.5*m);
    ctx.fillText("1/5", 24*m, 3*m, 2*m);
    ctx.font = font3;
    ctx.fillText("- Or WASD / Arrow keys -", 15*m, line2y, 8*m);
    dir = Math.sin(fx*dt);
    Lx = 4.4*m + .65*m*dir;
  }
  // Jump //
  else if (dt < t2){
    dt += 800
    seq = [0,0,0,0,0,0,12,13,14,13,0,0,0,0,12,13,14,13,0,0,0,0,12,13,14,13];
    frame = Math.floor((dt-t1)*fps/1000)%seq.length;
    fy = .01;
    ctx.font = font1;
    ctx.fillText("Jump", 15*m, heady, 3*m);
    ctx.font = font2;
    ctx.fillText("Swipe up with " + hand2 + " thumb", 15*m, line1y, 12.5*m);
    ctx.fillText("2/5", 24*m, 3*m, 2*m);
    ctx.font = font3;
    ctx.fillText("- Or Spacebar -", 15*m, line2y, 6*m);
    Ry = 2.25*m;
    if (Math.cos(fy*dt)<0 && Math.sin(fy*dt)<0 && Math.sin(.5*fy*dt)<0)
      Ry = 2.25*m + 1.5*m*Math.sin(fy*dt);
    dt -= 800
  }
  // Double Jump //
  else if (dt < t3){
    dt += 800
    seq = [0,0,0,0,12,9,10,11,10];
    frame = Math.floor((dt-t2+800)*fps/1000)%seq.length;
    ctx.font = font1;
    ctx.fillText("Double Jump", 15*m, heady, 6*m);
    ctx.font = font2;
    ctx.fillText("Swipe up again while in the air", 15*m, line1y, 12.5*m);
    ctx.fillText("3/5", 24*m, 3*m, 2*m);
    ctx.font = font3;
    ctx.fillText("- Or Spacebar -", 15*m, line2y, 6*m);
    Ry = 2.25*m;
    if (Math.cos(fy*dt)<0 && Math.sin(fy*dt)<0 && Math.sin(.5*fy*dt)<0)
      Ry = 2.25*m + 1.5*m*Math.sin(fy*dt);
    if (Math.cos(fy*dt)<0 && Math.sin(fy*dt)>0 && Math.sin(.5*fy*dt)<0)
      Ry = 2.25*m + 1.5*m*Math.cos(fy*dt);
    dt -= 800
  }
  else if (dt < t4){
    frame = Math.floor((dt-t3)*fps/1000)%seq.length;
    ctx.font = font1;
    ctx.fillText("Double Jump", 15*m, heady, 6*m);
    ctx.font = font2;
    ctx.fillText("Swipe up again while in the air", 15*m, line1y, 12.5*m);
    ctx.fillText("3/5", 24*m, 3*m, 2*m);
    ctx.font = font3;
    ctx.fillText("- Or Spacebar -", 15*m, line2y, 6*m);
    Ry = 2.25*m - m/(t4-t3)*(dt-t3);
  }
  // Drop item //
  else if (dt < t5){
    dt += 500
    fps = 8.25;
    seq = [0,0,0,0,0,7,7]
    // frame = Math.floor((dt-t4)*fps/1000)%seq.length;
    frame = 0;
    fy = .015;
    ctx.font = font1;
    ctx.fillText("Use Item", 15*m, heady, 5*m);
    ctx.font = font2;
    ctx.fillText("Swipe down with " + hand2 + " thumb", 15*m, line1y, 12.5*m);
    ctx.fillText("4/5", 24*m, 3*m, 2*m);
    ctx.font = font3;
    ctx.fillText("- Or Enter key -", 15*m, line2y, 6*m);
    Ry = 1.25*m
    if (Math.cos(fy*dt)>0 && Math.sin(fy*dt)>0 && Math.sin(.5*fy*dt)>0){
      Ry = 1.25*m+1.5*m*Math.sin(fy*dt);
      frame = 6;
    }
    dt -= 500
    }
  else if (dt < t6){
    frame = Math.floor((dt-t5)*fps/1000)%seq.length;
    ctx.font = font1;
    ctx.fillText("Use Item", 15*m, heady, 5*m);
    ctx.font = font2;
    ctx.fillText("Swipe down with " + hand2 + " thumb", 15*m, line1y, 12.5*m);
    ctx.fillText("4/5", 24*m, 3*m, 2*m);
    ctx.font = font3;
    ctx.fillText("- Or Enter key -", 15*m, line2y, 6*m);
    Ry = 1.25*m + m/(t6-t5)*(dt-t5);
  }
  // Switch Item //
  else if (dt < t7){
    seq = [0];
    frame = Math.floor((dt-t6)*fps/1000)%seq.length;
    fx = .02;
    ctx.font = font1;
    ctx.fillText("Switch Item", 15*m, heady, 6*m);
    ctx.font = font2;
    ctx.fillText("Swipe side-to-side with " + hand2 + " thumb", 15*m, line1y, 12.5*m);
    ctx.fillText("5/5", 24*m, 3*m, 2*m);
    ctx.font = font3;
    ctx.fillText("- Or F / Shift key -", 15*m, line2y, 6*m);
    Rx = 4.5*m;
    if (Math.cos(fx*dt)<0 && Math.sin(fx*dt)<0 && Math.sin(.5*fx*dt)<0) {
      Rx = 4.5*m - .65*m*Math.sin(fx*dt);
    }
  }
  else ctrlt0 = t;

  // Reverse finger coordinates if lefty //
  if (lefty){
    let temp = Ry;
    Ry = Ly;
    Ly = temp;
    temp = Rx;
    Rx = Lx+.2*m;
    Lx = temp;
  }

  // Draw phone and hands //
  ctx.drawImage(ctrlImages[0], 4.5*m, 2.75*m, 21*m, 14*m);
  ctx.drawImage(ctrlImages[1], Lx, Ly, 21*m, 14*m);
  ctx.drawImage(ctrlImages[2], Rx, Ry, 21*m, 14*m);

  // Draw character //
  if (dir < 0) { // invert before drawing for dir<0
    ctx.save();
    ctx.scale(-1,1);
    spritex = -(spritex+sabra.drawW+sabra.hitx/2);
  }
  ctx.drawImage( sabra.sprites[seq[frame]], spritex, spritey,
                 sabra.drawW, sabra.drawH );
  if (dir < 0) ctx.restore(); // uninvert

  // Draw item //
  if (dt > t6 && dt < t7){
    let itx = 19.5*m;
    let ity = 8*m;
    fps = 1.7;
    ctx.strokeStyle = "rgba(0,0,0,.1)";
    ctx.fillStyle = "rgba(0,0,0,.2)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(itx-.5*m, ity+.2*m);
    ctx.lineTo(itx+.5*m, ity+.2*m);
    ctx.lineTo(itx+.7*m, ity-.45*m);
    ctx.lineTo(itx+.5*m, ity-1.1*m);
    ctx.lineTo(itx-.5*m, ity-1.1*m);
    ctx.lineTo(itx-.7*m, ity-.45*m);
    ctx.closePath();
    // ctx.stroke();
    ctx.fill();
    // pick item from world or inventory //
    var item;
    let i = Math.floor((dt-t6)*fps/1000)%(guys.length-1+sabra.stuff.length) + 1;
    if (i < guys.length) item = guys[i];
    else item = sabra.stuff[i-guys.length];

    let ix0 = item.x;
    let iy0 = item.y;
    item.x = itx - item.w/2; // move item to slot
    item.y = ity - item.h;
    item.draw(0, 0, t, ctx); // draw
    item.x = ix0; // move back
    item.y = iy0;
  }
}

function drawAbout(){
  ctx.fillStyle = borderColor;
  ctx.fillRect(4*m, 2*m, 22*m, 15.5*m);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(4.5*m, 2.4*m, 21*m, 14.7*m);
  ctx.textAlign = "center";
  ctx.drawImage(bgImages[6], 6*m, 3*m, 18*m, 12*m);
  //ctx.textBaseline = "bottom";
  //ctx.font =   "bold 42pt Garamond, Times";
  //ctx.fillStyle = "#000000";
  //ctx.fillText("Sabrina's", 15*m, 6*m, 7*m);
  ctx.textBaseline = "top";
  //ctx.font =   "bold 16pt Segoe script, Rage, Script MT, Snell Roundhand, Lucida Handwriting, cursive";
  ctx.fillStyle = "#000000";
  //ctx.fillText("Research Adventure", 15*m, 6*m, 7*m);
  ctx.font =   "10pt Monospace";
  ctx.fillText("Game Engine Demo "+version+"."+subVersion, 15*m, 9*m);
  ctx.fillText("Art Asset Version " + artVersion, 15*m, 10*m);
  ctx.fillText("Programmed in JavaScript for web browsers.", 15*m, 11*m);
  // ctx.fillText("Known Issues:", 10*m, 12*m);
  // ctx.fillText(" * Longer load times in Safari due to their JS implementation's lack of in-memory bitmap splicing", 10*m, 13*m);
  // ctx.fillText(" * No fullscreen on iOS due to their failure to expose the API to non-video web elements", 10*m, 14*m);
  // ctx.fillText(" * Apple is terrible", 10*m, 15*m);
  ctx.font =   "bold 10pt Monospace";
  ctx.fillText("Kittendo 2023", 15*m, 14*m);
}

function drawObjectives(){
  ctx.fillStyle = borderColor;
  ctx.fillRect(1*m, 2*m, 28*m, 13.5*m);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(1.5*m, 2.4*m, 27*m, 12.7*m);
  text = ["Release Rhodamine Tracer",
          "Log with Fluorometers",
          "Plot Data with Laptop"]
  ctx.fillStyle = "#000000";
  ctx.font = "bold 11pt Ariel"
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i=0; i<3; i++){
    ctx.fillRect(i*9*m+2.25*m, 4.25*m, 7.5*m, 7.5*m);
    ctx.drawImage(bgImages[i+3], i*9*m+2.5*m, 4.5*m, 7*m, 7*m);
    ctx.fillText(text[i], i*9*m+6*m, 13*m, 8*m);
    if (i<2) {
      ctx.beginPath();
      ctx.moveTo(i*9*m+10.2*m, 7.7*m);
      ctx.lineTo(i*9*m+10.2*m, 8.3*m);
      ctx.lineTo(i*9*m+10.8*m, 8*m);
      ctx.closePath();
      ctx.fillStyle = borderColor;
      ctx.fill();
    }
  }
}


function displayTitleScreen(t00){
  if (titlet0 == 0) titlet0 = t00
  let dt = t00-titlet0;
  let t0 = 700;
  let t1 = t0+1800
  let t2 = t1+200
  let t3 = t2+750
  let t4 = t3+250

  txtx = 15*m;
  txty = 10*m;
  text = "TOUCH / ENTER TO START";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 14pt Monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Fade in background for until dt = t1 //
  if (dt > t0){
    if (dt < t1) ctx.globalAlpha = (dt-t0)/(t1-t0);
    ctx.drawImage(bgImages[7], 0, 0, 30*m, 20*m);
    ctx.globalAlpha = 1;
  }
  // Fade up title from dt = t2 to t3 //
  if (dt > t2){
    if (dt < t3) ctx.globalAlpha = (dt-t2)/(t3-t2);
    ctx.drawImage(bgImages[6], 0, 0, 30*m, 20*m);
    ctx.globalAlpha = 1;
  }
  // Pop up 'Press Start' at dt = t4 //
  if (dt > t4){
    if (Math.floor((dt-t4)/700)%2){
      ctx.fillStyle = "#000000";
      ctx.fillText(text, txtx+2, txty);
      ctx.fillText(text, txtx-2, txty);
      ctx.fillText(text, txtx, txty+1);
      ctx.fillText(text, txtx, txty-1);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(text, txtx, txty);
    }
  }

  if (gameState == TITLE) {
    window.requestAnimationFrame(displayTitleScreen);
  }
}

function rRect(x,y,w,h,r){
  if (ctx.roundRect)
    ctx.roundRect(x,y,w,h,r);
  else
    ctx.rect(x,y,w,h);
}
