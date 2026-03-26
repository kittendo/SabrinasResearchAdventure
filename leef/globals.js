// Development vars //
const DEBUGGING = false; // jumps to level on start
var artVersion = 3; // change this to force clients to redownload all art assets
var version = 0; // this will become 1 when a full game can be created with this engine
var subVersion = 2; // this is increased every time a gameplay element is changes/added
// World and Camera Vars //
var canvas;
var ctx;
var camx;
var camy;
var worldWidth;
var worldHeight;
var worldX0;
// Conversion Constants //
var m;
var mps;
// Physical Vars //
var g;
var t;
// Objects //
var sabra;
var guys = [];
var blocks = [];
var decos = [];
var drops = [];
var buttons = [];
var warps = [];
var streams = [];
// Buttons //
var menuButton;
var eraseButton;
var exportButton;
var resetButton;
var fullButton;
var leftyButton;
var ctrlButton;
var aboutButton;
var objButton;
// Input Variables //
var btnL = 0;
var btnR = 0;
var btnA = 0;
var btnB = 0;
var btnC = 0;
var btnD = 0;
// Sounds //
var audioCtx;
var sounds = [];
var soundOn = false;
var gameVolume = 0.5;
var soundPaths = [
  "sounds/splash1.wav",
  "sounds/splash2.wav",
  "sounds/splash3.wav",
  "sounds/splashB1.wav",
  "sounds/splashB2.wav",
  "sounds/splashB3.wav",
  "sounds/land1.wav",
  "sounds/land2.wav",
  "sounds/land3.wav",
  "sounds/jump1.wav",
  "sounds/jump2.wav",
  "sounds/jump3.wav",
  "sounds/item.wav",
  "sounds/pc.wav",
  "sounds/sploosh.wav",
];
// Images //
var ctrlPaths = ["leef/phone.png", "leef/thumbL.png", "leef/thumbR.png"];
var ctrlImageW = [900, 900, 900];
var ctrlImageH = [600, 600, 600];
var ctrlImages = [];
var ctrlt0 = 0;
var bgPaths = [
  "leef/bluesky.png",
  "leef/midground.png",
  "leef/midgrounddirt.png",
  "leef/obj1.png",
  "leef/obj2.png",
  "leef/obj3.png",
  "leef/mainTitle.png",
  "leef/mainTitleImage.png",
];
var bgImageW = [700, 1400, 1750];
var bgImageH = [700, 700, 700];
var bgImages = [];
var spriteSheetPaths = [
  "leef/sabra",
  "leef/grassblock",
  "leef/bushblock",
  "leef/columnblocks",
  "leef/items",
  "leef/groundblocks",
  "leef/tent",
  "leef/pavilion",
];
var spriteSheetW = [84, 54, 54, 54, 54, 54, 54, 54];
var spriteSheetH = [175, 54, 54, 54, 54, 54, 54, 54];
var spriteRows = [5, 3, 3, 3, 3, 3, 3, 3];
var spriteCols = [3, 3, 3, 3, 3, 3, 3, 3];
var spriteLists = [];
// Event Variables //
var laptopx = -45;
var laptopy = 13.8;
var tentx = 50;
// State Variables //
const PLAYING = 0;
const PLOTTING = 1;
const PAUSED = 2;
const RESTART = 3;
const STARTING = 4;
const FLIP = 4.5;
const READY = 5; // higher states reserved for bootstrapping
const LOGO = 6;
const TITLE = 7;
var gameState = STARTING;
var showTutorial = false;
var showAbout = false;
var showObj = false;
var timeCorrection = 0; // acumulates time paused and out of focus to correct probes

// DEBUGGING FUNCTIONS //
class RunTimer {
  constructor(messages) {
    this.times = [];
    this.nt = messages.length;
    for (let i = 0; i < this.nt; i++) {
      this.times.push(0);
    }
    this.msg = messages;
    this.nlogs = 0;
    this.aveAcross = 100;
    this.active = 0;
  }

  startLogging(active) {
    this.active = active;
    if (!this.active) return;
    this.it = 0;
    this.nlogs++;
    this.t0 = new Date().getTime();
  }

  log() {
    if (!this.active) return;
    let tnow = new Date().getTime();
    this.times[this.it] += tnow - this.t0;
    this.it++;
    this.t0 = tnow;
  }

  display() {
    if (this.nlogs < this.aveAcross || !this.active) return;
    this.nlogs = 0;
    console.log("\nTimes Per", this.aveAcross, "Loops");
    console.log("=====================");
    let tot = 0;
    let ratios = [];
    let sortRatios = [];
    for (let i = 0; i < this.nt; i++) {
      tot += this.times[i];
    }
    for (let i = 0; i < this.nt; i++) {
      ratios.push(Math.floor((1000 * this.times[i]) / tot) / 1000);
      sortRatios.push(Math.floor((1000 * this.times[i]) / tot) / 1000);
    }
    sortRatios.sort((x, y) => {
      return y - x;
    }); // sort with inline comparator

    for (let isort = 0; isort < this.nt; isort++) {
      let i = ratios.indexOf(sortRatios[isort]);
      console.log(this.msg[i], sortRatios[isort], this.times[i]);
      // console.log(this.msg[isort], ratios[isort], this.times[isort]);
      this.times[i] = 0;
    }
  }
}

drawTimer = new RunTimer([
  "Backgnd",
  "Midgnd",
  "BG Draw",
  "BG Blocks",
  "Guys",
  "FG Draw",
  "Droplets",
  "Stream",
  "FG Blocks",
]);

mainTimer = new RunTimer([
  "Processed Inputs",
  "Summed Forces",
  "Update Positions",
  "Block Bounds",
  "Guy Collisions",
  "Updated Flow",
  "Managed Items",
  "Draw World",
  "Draw Minimap",
]);
