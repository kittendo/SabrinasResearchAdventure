var btnID = -1;
var ctrlDivide = 0.5;  // ratio of screen for joystick vs swipe buttons
var btnY0 = 0;
var btnX0 = 0;
var btnCrossSlope = 0.707;
var btnt;
var joyID = -1;
var joyX0 = 0;
var joyY0 = 0;
var joyR = 2; // in m units
var lefty = false;
var touchHandled = false;

function registerInputEvents() {
  // window.addEventListener(  "resize",     screenResized);
  document.addEventListener("keydown", keyEvent);
  document.addEventListener("keydown", keyEvent);
  document.addEventListener("keyup", keyEvent);
  document.addEventListener("mousedown", mouseClick);
  document.addEventListener("mouseup", mouseClick);
  document.addEventListener("touchstart", touchStart, { passive: false }); // passive:false needed for event.preventDefault();
  document.addEventListener("touchmove", touchMove, { passive: false }); // but just for touchstart and touchmove
  document.addEventListener("touchend", touchEnd);
}

// HARDWARE EVENT HANDLERS //
function touchStart(event) {
  let xt = event.changedTouches[0].clientX - canvas.getBoundingClientRect().x;
  let yt = event.changedTouches[0].clientY - canvas.getBoundingClientRect().y;
  let bPress = false;
  for (let i = 0; i < buttons.length; i++) {
    bPress = bPress | buttons[i].startTouch(xt, yt);
  }
  if (bPress) return; // dont interpret input if user pressed a touch button

  if (
    (xt > ctrlDivide* canvas.width && lefty) ||
    (xt < ctrlDivide * canvas.width && !lefty)
  ) {
    joyX0 = event.changedTouches[0].clientX;
    joyY0 = event.changedTouches[0].clientY;
    joyID = event.changedTouches[0].identifier;
  } else {
    btnY0 = event.changedTouches[0].clientY;
    btnX0 = event.changedTouches[0].clientX;
    btnID = event.changedTouches[0].identifier;
    btnt = t;
  }
  event.preventDefault();
}
function touchMove(event) {
  for (let i = 0; i < event.changedTouches.length; i++) {
    let xt = event.changedTouches[i].clientX - canvas.getBoundingClientRect().x;
    let yt = event.changedTouches[i].clientY - canvas.getBoundingClientRect().y;
    for (let j = 0; j < buttons.length; j++) {
      if (buttons[j].state == 1 && !buttons[j].touches(xt, yt)) {
        buttons[j].state = 0;
      }
    }
    if (event.changedTouches[i].identifier == joyID) {
      btnR = (event.changedTouches[i].clientX - joyX0) / (joyR * m);
      if (Math.abs(btnR) > 1) {
        joyX0 += (btnR - Math.sign(btnR)) * joyR * m;
        btnR = Math.sign(btnR);
      }
      if (btnR < 0) {
        btnL = -btnR;
        btnR = 0;
      } else {
        btnL = 0;
      }
    } else if (event.changedTouches[i].identifier == btnID && t - btnt > 30) {
      // time threshhold to ensure swipe intent
      dely = event.changedTouches[i].clientY - btnY0;
      delx = event.changedTouches[i].clientX - btnX0;
      if (Math.abs(dely / delx) > btnCrossSlope) {
        // was up/down swipe
        if (dely < 0)
          btnA = 1; // down
        else btnB = 1; // up
      } else {
        // was left/right swipe
        if (delx > 0)
          btnD = 1; // right
        else btnC = 1; // left
      }
      btnID = -1;
    }
  }
  event.preventDefault();
}
function touchEnd(event) {
  if (gameState >= READY) {
    fullscreenPressed();
    if (gameState == TITLE) {
      setGameState(PLAYING);
    } else setGameState(gameState + 1);
  }
  let xt = event.changedTouches[0].clientX - canvas.getBoundingClientRect().x;
  let yt = event.changedTouches[0].clientY - canvas.getBoundingClientRect().y;
  touchHandled = true;
  let bPress = false;
  let btnCopy = buttons;
  for (let i = 0; i < btnCopy.length; i++) {
    bPress = bPress | btnCopy[i].endTouch(xt, yt);
  }
  if (bPress) return;

  for (let i = 0; i < event.changedTouches.length; i++) {
    if (event.changedTouches[i].identifier == joyID) {
      btnL = 0;
      btnR = 0;
      joyID = -1;
    }
  }
}
function keyEvent(event) {
  if (gameState >= READY) {
    if (event.key == "Enter" && event.type == "keyup") {
      fullscreenPressed();
      if (gameState == TITLE) setGameState(PLAYING);
      else setGameState(gameState + 1);
    }
    return; // prevent other keys on start screen
  }

  if (event.repeat) return;
  var state = 0;
  if (event.type == "keydown") state = 1;
  if (event.key == " " || event.key == "w" || event.key == "ArrowUp")
    btnA = state;
  else if (event.key == "Enter" || event.key == "s" || event.key == "ArrowDown")
    btnB = state;
  else if (event.key == "d" || event.key == "ArrowRight") btnR = state;
  else if (event.key == "a" || event.key == "ArrowLeft") btnL = state;
  else if (event.key == "f" || event.key == "Shift") btnD = state;
  if (event.type == "keyup") {
    if (event.key == "1") menuPressed();
    else if (event.key == "2") objPressed();
    else if (event.key == "3") ctrlPressed();
    else if (event.key == "4") leftyPressed();
    else if (event.key == "5") restartPressed();
    else if (event.key == "6") fullscreenPressed();
    else if (event.key == "7") aboutPressed();
    else if (event.key == "9") {
      if (gameState == PLOTTING) exportPressed();
    } else if (event.key == "0") {
      if (gameState == PLOTTING) erasePressed();
    }
  }
}

function mouseClick(event) {
  if (!touchHandled) {
    let xt = event.clientX - canvas.getBoundingClientRect().x;
    let yt = event.clientY - canvas.getBoundingClientRect().y;
    if (event.type == "mousedown") {
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].startTouch(xt, yt);
      }
    } else if (event.type == "mouseup") {
      if (gameState >= READY) {
        if (sounds.length == 0) loadAndSetupAudio(); // Load Auido (needs user click)
        fullscreenPressed(); // Enter fullscreen (needs user click)
        if (gameState == TITLE) {
          setGameState(PLAYING);
        } else setGameState(gameState + 1);
      }
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].endTouch(xt, yt);
      }
    }
  }
  touchHandled = false;
}

// BUTTON EVENT HANDLERS //
function fullscreenPressed() {
  var elem = document.documentElement;
  if (elem.requestFullscreen)            elem.requestFullscreen(); // Chrome
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen(); // Safari
  else if (elem.msRequestFullscreen)     elem.msRequestFullscreen(); // IE11
  else if (elem.mozRequestFullScreen)    elem.mozRequestFullScreen(); // Firefox
}
function leftyPressed() {
  lefty = !lefty;
  let c1 = leftyButton.c1;
  leftyButton.c1 = leftyButton.c2;
  leftyButton.c2 = c1;
}
function menuPressed() {
  if (gameState != PAUSED) setGameState(PAUSED);
  else {
    setGameState(PLAYING);
    if (showTutorial) ctrlPressed(); // close open menu windows
    if (showObj) objPressed(); //
    if (showAbout) aboutPressed(); //
  }
  let c1 = menuButton.c1;
  menuButton.c1 = menuButton.c2;
  menuButton.c2 = c1;
}
function restartPressed() {
  lefty = false;
  showTutorial = false;
  showAbout = false;
  showObj = false;
  setGameState(RESTART);
}
function ctrlPressed() {
  if (showAbout) aboutPressed();
  if (showObj) objPressed();
  ctrlt0 = t;
  showTutorial = !showTutorial;
  let c1 = ctrlButton.c1;
  ctrlButton.c1 = ctrlButton.c2;
  ctrlButton.c2 = c1;
}
function objPressed() {
  if (showTutorial) ctrlPressed();
  if (showAbout) aboutPressed();
  showObj = !showObj;
  let c1 = objButton.c1;
  objButton.c1 = objButton.c2;
  objButton.c2 = c1;
}
function aboutPressed() {
  if (showTutorial) ctrlPressed();
  if (showObj) objPressed();
  showAbout = !showAbout;
  let c1 = aboutButton.c1;
  aboutButton.c1 = aboutButton.c2;
  aboutButton.c2 = c1;
}
function erasePressed() {
  for (let i = 0; i < sabra.stuff.length; i++) {
    if (sabra.stuff[i].type == Movable.PROBE) sabra.stuff[i].data.length = 0;
  }
}
function exportPressed() {
  // Format file name //
  var today = new Date();
  let filename =
    "probedata_" +
    (today.getMonth() + 1) +
    "." +
    today.getDate() +
    "." +
    today.getHours() +
    "." +
    today.getMinutes() +
    "." +
    today.getSeconds() +
    ".csv";
  // Find held probes with data //
  let probes = [];
  let n = 0;
  for (let i = 0; i < sabra.stuff.length; i++) {
    if (
      sabra.stuff[i].type == Movable.PROBE &&
      sabra.stuff[i].data.length > 0
    ) {
      if (sabra.stuff[i].data.length > n) n = sabra.stuff[i].data.length;
      probes.push(sabra.stuff[i]);
    }
  }
  // Write data to text string //
  if (probes.length > 0) {
    text = "";
    for (let p = 0; p < probes.length; p++)
      text += "t" + (p + 1) + ",c" + (p + 1) + ",";
    text += "\n";
    for (let i = 0; i < n; i += 2) {
      let line = "";
      for (let p = 0; p < probes.length; p++) {
        if (i < probes[p].data.length)
          line += probes[p].data[i] + "," + probes[p].data[i + 1] + ",";
        else line += ",,";
      }
      text += line.substring(0, line.length - 1) + "\n";
    }
    download(filename, text);
  }
}

class Button {
  constructor(x, y, w, h, text, colortext, color1, color2, call) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.state = 0;
    this.ct = colortext;
    this.c1 = color1;
    this.c2 = color2;
    this.call = call;
    this.font = "12pt Monospace";
    this.texty = 0.575;
  }
  startTouch(xt, yt) {
    if (this.touches(xt, yt)) {
      this.state = 1;
      return true;
    }
    return false;
  }
  endTouch(xt, yt) {
    if (this.state == 1) {
      if (this.touches(xt, yt)) {
        this.state = 0;
        window[this.call]();
        return true;
      }
    }
    return false;
  }
  touches(xt, yt) {
    return (
      xt > this.x && xt < this.x + this.w && yt > this.y && yt < this.y + this.h
    );
  }
  draw(ctx) {
    if (this.state == 0) ctx.fillStyle = this.c1;
    if (this.state == 1) ctx.fillStyle = this.c2;
    ctx.strokeStyle = this.c2;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    rRect(this.x, this.y, this.w, this.h, [0.2 * m]);
    // ctx.stroke();
    ctx.fill();
    ctx.fillStyle = this.ct;
    ctx.font = this.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      " " + this.text + " ",
      this.x + this.w / 2,
      this.y + this.texty * this.h,
      this.w,
    );
  }
}
