var tLogo0 = 0;
var logoDuration = 2000;

function logoLoop(t1) {
  if (tLogo0 == 0) tLogo0 = t1;
  dt = t1 - tLogo0;
  pi = Math.PI;

  //  INPUT SIZE & LOCATION  //
  //=========================//
  speed = 0.7;
  W = 10 * m;
  H = 10 * m;
  outline = 4; // also tweaks ear angles to keep them flush
  eyeline = outline * 0.7; // button outline
  rPerR = 6.25; // large circle radius 7.5
  rPerh = 5; // ear height 6
  rPerL = 8; // lower flat line 11
  color1 = "#000000"; // main color
  color2 = "#FFFFFF"; // outline + accents
  color3 = "#ff0000"; // buttons

  //  CALCULATE SIZE AND LOCATION VARS //
  //===================================//
  r = (W - outline) / (rPerL + rPerR * (2 + sq(2)));
  calcSizes();
  if (W / H > (outline + 2 * R + sq(2) * R + L) / (outline / 2 + 2 * R + h)) {
    r = (H - outline) / (2 * rPerR + rPerh);
  }
  calcSizes();
  ox = 15 * m - R / sq(2) - L / 2; //(W-D)/2;
  oy = (H + h) / 2 + 3 * m;

  // dt = Date.now()-t0;
  ctx.fillStyle = color1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //  DRAW EARS  //
  delay = 250;
  ear(ox, oy, 0.02 * speed, 0.004, dt - delay);
  ear(ox + D, oy, 0.02 * speed, 0.004, dt - delay, true);

  //  DRAW HEAD  //
  head(ox, oy, 0.05 * speed, dt);

  //  DRAW STRIPES  //
  delay = 200;
  line(ox, oy, 0, speed, dt);
  line(ox, oy, 1, 0.7 * speed, dt - delay);
  line(ox, oy, 2, 0.5 * speed, dt - 2 * delay);

  //  DRAW DPAD EYE  //
  dPad(ox, oy, 0.07 * speed, 0.008, dt - delay);

  //  DRAW NOSE  //
  nose(
    ox + R / sq(2) + L / 2,
    oy + R / sq(2) - 2 * r,
    0.1 * speed,
    0.002,
    dt - 2 * delay,
  );

  //  DRAW BUTTONS EYE  //
  delay = 150;
  button(ox + D - 2 * r, oy, 0.1 * speed, 0.003, dt - 1 * delay);
  button(ox + D, oy - 2 * r, 0.1 * speed, 0.003, dt - 2 * delay);
  button(ox + D + 2 * r, oy, 0.1 * speed, 0.003, dt - 3 * delay);
  button(ox + D, oy + 2 * r, 0.1 * speed, 0.003, dt - 4 * delay);

  // writeLogo(.03*speed, dt-6*delay);
  // showLinks("bannerStripe", .015*speed, dt-9*delay);
  // showLinks("redStripe", .015*speed, dt-9*delay);
  // showLinks("icon", .015*speed, dt-9*delay, false);

  if (dt > 225) {
    ctx.font = "bold 25pt 'Josefin Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FF0000";
    ctx.fillText(">> Kittendo <<", 15 * m + 2, 13 * m);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(">> Kittendo <<", 15 * m, 13 * m);
  }
  if (dt < logoDuration && gameState == LOGO) {
    window.requestAnimationFrame(logoLoop);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameState == LOGO) setGameState(gameState + 1);
  }
}
function button(x, y, v, d, dt) {
  if (dt < 0) return;
  var rad = r + 0.2 * r * Math.exp(-d * dt) * Math.cos(v * dt);
  if (Math.exp(-d * dt) < 0.8) rad = r;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, 2 * pi);
  ctx.lineWidth = eyeline;
  ctx.fillStyle = color3;
  ctx.fill();
  ctx.stroke();
}
function nose(x, y, v, d, dt) {
  if (dt < 0) return;
  var Lf = sq(2) * r;
  var L = Lf - 0.6 * Lf * Math.exp(-d * dt) * Math.cos(v * dt);
  if (Math.exp(-d * dt) < 0.8) L = Lf;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - L, y - Lf);
  ctx.lineTo(x + L, y - Lf);
  ctx.lineTo(x, y);
  ctx.lineWidth = 1;
  ctx.fillStyle = color2;
  ctx.fill();
  ctx.stroke();
}
function dPad(x, y, v, d, dt) {
  if (dt < 0) return;
  var rad = r - 0.7 * r * Math.exp(-d * dt) * Math.cos(v * dt);
  if (Math.exp(-d * dt) < 0.1) rad = r;
  ctx.beginPath();
  ctx.arc(x, y + 2 * rad, r, 0, pi);
  ctx.lineTo(x - rad, y + rad);
  ctx.lineTo(x - 2 * rad, y + r);
  ctx.arc(x - 2 * rad, y, r, pi / 2, (3 * pi) / 2);
  ctx.lineTo(x - rad, y - rad);
  ctx.lineTo(x - r, y - 2 * rad);
  ctx.arc(x, y - 2 * rad, r, pi, 0);
  ctx.lineTo(x + rad, y - rad);
  ctx.lineTo(x + 2 * rad, y - r);
  ctx.arc(x + 2 * rad, y, r, (3 * pi) / 2, pi / 2);
  ctx.lineTo(x + rad, y + rad);
  ctx.lineTo(x + r, y + 2 * rad);
  ctx.lineWidth = 1;
  ctx.fillStyle = color2;
  ctx.fill();
  ctx.stroke();
}
function ear(x, y, v, d, dt, invert = false) {
  if (dt < 0) return;
  var Rp = R + outline / 2 - 1; // keep ears flush despite outline
  var i = 1;
  if (invert) i = -1;
  var hp = h - 0.7 * h * Math.exp(-d * dt) * Math.cos(v * dt);
  if (Math.exp(-d * dt) < 0.01) hp = h;
  //// Outer Ear ////
  ctx.beginPath();
  ctx.moveTo(x + (i * Rp) / sq(2), y - Rp);
  ctx.lineTo(x, y - (hp + Rp));
  ctx.lineTo(
    x - ((i * Rp) / (Rp + hp)) * sq(pw(hp, 2) + 2 * Rp * hp),
    y - pw(Rp, 2) / (Rp + hp),
  );
  ctx.lineWidth = 1;
  ctx.fillStyle = color2;
  ctx.fill();
  ctx.stroke();
  //// Inner Ear ////
  var b = (Rp + hp) * (1 - (2 * r) / R);
  var m = sq(pw(hp / Rp, 2) + (2 * hp) / Rp);
  var xf =
    (-m * b - sq(pw(Rp, 2) * (pw(m, 2) + 1) - pw(b, 2))) / (pw(m, 2) + 1);
  var yf = m * xf + b;
  ctx.beginPath();
  ctx.moveTo(
    x + i * (Rp / sq(2) - ((2 * r) / hp) * sq(pw(hp, 2) + pw(Rp, 2) / 2)),
    y - Rp,
  );
  ctx.lineTo(x, y - (hp + Rp - 2 * r * sq(2 * pw(hp / Rp, 2) + 1)));
  ctx.lineTo(x + i * xf, y - yf);
  ctx.lineWidth = 1;
  ctx.fillStyle = color1;
  ctx.fill();
  ctx.stroke();
}
function head(x, y, v, dt) {
  var ol = v * dt;
  if (ol > outline) ol = outline;
  ctx.beginPath();
  ctx.arc(x, y, R, pi / 4, (3 / 2) * pi); // left handle
  ctx.lineTo(x + D, y - R); // Upper line
  ctx.arc(x + sq(2) * R + L, y, R, (3 / 2) * pi, (3 * pi) / 4); // Right handle
  ctx.lineTo(x + (sq(2) / 2) * R, y + R / sq(2)); // Lower line
  ctx.arc(x, y, R, pi / 4, (3 / 2) * pi); // left handle again (line fix)
  ctx.lineWidth = ol;
  ctx.fillStyle = color1;
  ctx.strokeStyle = color2;
  ctx.fill();
  ctx.stroke();
}
function line(x, y, i, v, dt) {
  if (dt < 0) return;
  var Wl = v * dt;
  ctx.lineWidth = 1;
  ctx.fillStyle = color2;
  var Wf = L - 2 * (i + 1) * r;
  if (Wl >= Wf) Wl = Wf;
  ctx.fillRect(x + R / sq(2) + (i + 1) * r, y - R + 2 * i * 0.9 * r, Wl, r);
}
function calcSizes() {
  R = rPerR * r;
  h = rPerh * r;
  L = rPerL * r;
  D = sq(2) * R + L;
}
function hex(c) {
  var str = Math.abs(c).toString(16);
  if (str.length < 2) str = "0" + str;
  return str;
}
function sq(x) {
  return Math.sqrt(x);
}
function pw(x, y) {
  return Math.pow(x, y);
}
