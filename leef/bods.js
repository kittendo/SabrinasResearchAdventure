class DrawBlock {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.bg = false;
    this.color = color;
    this.sprites = [];
    this.invertCell = false;
  }
  setSprites(sprites, top, bottom, side, topCorner, bottomCorner, middle, surface){
    this.top     = top;
    this.bottom  = bottom;
    this.side    = side;
    this.topCorner  = topCorner;
    this.bottomCorner  = bottomCorner;
    this.middle  = middle;
    this.surface = surface;
    this.sprites = sprites;
  }
  draw(camx, camy, ctx) {
    if (this.sprites.length == 0) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x-camx, this.y-camy, this.w+1, this.h+1);
    }
    else {
      let imax = Math.round(this.w/m);
      let jmax = Math.round(this.h/m);
      let i0 = Math.floor((camx-this.x)/this.w)*imax;
      let i1 = Math.ceil((camx+30*m-this.x)/this.w)*imax;
      if (i0<0) i0 = 0;
      if (i1 > imax) i1 = imax;
      for (let i=i0; i<i1; i++) {
        for (let j=0; j<jmax; j++) {
          let m = this.w/imax;
          if (i==0) {
            if (j==0) {
              ////////// TOP LEFT CORNER //////////
              if (this.surface>-1) {
                ctx.drawImage(this.sprites[this.surface], this.x+i*m-camx,
                              this.y+(j-1)*m-camy, m+1, m+1);
              }
              if (!this.invertCell){ // normal case
              ctx.drawImage(this.sprites[this.topCorner], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
              }
              else { // invert canvas for inverted 1x1 blocks
                ctx.save();
                ctx.scale(-1,1);
                ctx.drawImage(this.sprites[this.topCorner], -(this.x+(i+1)*m-camx),
                              this.y+j*m-camy, m+1, m+1);
                ctx.restore(); // uninvert
              }
            }
            else if (j==jmax-1) {
              ////////// BOTTOM LEFT CORNER //////////
              ctx.drawImage(this.sprites[this.bottomCorner], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
            else {
              ////////// LEFT SIDE //////////
              ctx.drawImage(this.sprites[this.side], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
          }
          else if (i==imax-1) {
            if (j==0) {
              ////////// TOP RIGHT CORNER //////////
              ctx.save();
              ctx.scale(-1,1); // invert canvas
              ctx.drawImage(this.sprites[this.topCorner], -(this.x+(i+1)*m-camx),
                            this.y+j*m-camy, m+1, m+1);
              ctx.restore(); // uninvert
              if (this.surface>-1) {
                ctx.drawImage(this.sprites[this.surface], this.x+i*m-camx,
                              this.y+(j-1)*m-camy, m+1, m+1);
              }
            }
            else if (j==jmax-1) {
            ////////// BOTTOM RIGHT CORNER //////////
              ctx.save();
              ctx.scale(-1,1); // invert canvas
              ctx.drawImage(this.sprites[this.bottomCorner], -(this.x+(i+1)*m-camx),
                            this.y+j*m-camy, m+1, m+1);
              ctx.restore(); // uninvert
            }
            else {
            ////////// RIGHT SIDE //////////
              ctx.save();
              ctx.scale(-1,1); // invert canvas
              ctx.drawImage(this.sprites[this.side], -(this.x+(i+1)*m-camx),
                            this.y+j*m-camy, m+1, m+1);
              ctx.restore(); // uninvert
            }
          }
          else {
            if (j==0) {
              ////////// TOP //////////
              if (this.surface>-1) {
                ctx.drawImage(this.sprites[this.surface], this.x+i*m-camx,
                              this.y+(j-1)*m-camy, m+1, m+1);
              }
              ctx.drawImage(this.sprites[this.top], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
            else if (j==jmax-1) {
            ////////// BOTTOM //////////
              ctx.drawImage(this.sprites[this.bottom], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
            else {
            ////////// MIDDLE //////////
              ctx.drawImage(this.sprites[this.middle], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
          }
        }

      // ctx.strokeStyle = this.color;
      // ctx.strokeRect(this.x-camx, this.y-camy, this.w+1, this.h+1);  /////////// DEBUG
      }
    }
  }
  drawMini(x, y, ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x/20 + x, this.y/20 + y, this.w/20, this.h/20);
  }
}

class Block extends DrawBlock {
  constructor(x, y, w, h, id) {
    super(x, y, w, h, "#3A7311")
    this.solid = true;
    this.id = id;
    this.bg = true;
  }
  boundaryCheck(guys) {
    let bl = this.x;
    let br = this.x + this.w;
    let bt = this.y;
    let bb = this.y + this.h;
    for (let i=0; i<guys.length; i++) {
      let gl = guys[i].x;
      let gr = guys[i].x + guys[i].w;
      let gt = guys[i].y;
      let gb = guys[i].y + guys[i].h;

      // if guy overlaps this block //
      if (gr > bl && gl < br && gb > bt && gt < bb) {
        // Determine if guy came from...
        // top/above //
        if (guys[i].yp + guys[i].h <= bt) {
          // console.log("top")
          playSound(6 + Math.floor(Math.random()*3), 1, .5);
          guys[i].ground = this.id;
          guys[i].y = this.y - guys[i].h;
          guys[i].vy = 0;
        }
        // bottom/below //
        if (this.solid && guys[i].yp > bb) {
          // console.log("bottom")
          guys[i].y = this.y + this.h;
          guys[i].vy = 0;
        }
        // left //
        if (this.solid && guys[i].xp + guys[i].w <= bl) {
          // console.log("left")
          guys[i].x = this.x - guys[i].w;
          guys[i].vx = 0;
        }
        // right //
        if (this.solid && guys[i].xp >= br) {
          // console.log("right")
          guys[i].x = this.x + this.w;
          guys[i].vx = 0;
        }
      }
      // if guy walks off this block //
      else if (guys[i].ground == this.id && (gr < bl || gl > br)){
        guys[i].ground = -1;
      }

    }
  }
  setSprites(sprites, top, bottom, side, topCorner, bottomCorner, middle, surface){
    this.top     = top;
    this.bottom  = bottom;
    this.side    = side;
    this.topCorner  = topCorner;
    this.bottomCorner  = bottomCorner;
    this.middle  = middle;
    this.surface = surface;
    this.sprites = sprites;
  }
  draw(camx, camy, ctx) {
    if (this.sprites.length == 0) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x-camx, this.y-camy, this.w+1, this.h+1);
    }
    else {
      let imax = Math.round(this.w/m);
      let jmax = Math.round(this.h/m);
      let i0 = Math.floor((camx-this.x)/this.w)*imax;
      let i1 = Math.ceil((camx+30*m-this.x)/this.w)*imax;
      if (i0<0) i0 = 0;
      if (i1 > imax) i1 = imax;
      for (let i=i0; i<i1; i++) {
        for (let j=0; j<jmax; j++) {
          let m = this.w/imax;
          if (i==0) {
            if (j==0) {
              ////////// TOP LEFT CORNER //////////
              if (this.surface>-1) {
                ctx.drawImage(this.sprites[this.surface], this.x+i*m-camx,
                              this.y+(j-1)*m-camy, m+1, m+1);
              }
              ctx.drawImage(this.sprites[this.topCorner], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
            else if (j==jmax-1) {
              ////////// BOTTOM LEFT CORNER //////////
              ctx.drawImage(this.sprites[this.bottomCorner], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
            else {
              ////////// LEFT SIDE //////////
              ctx.drawImage(this.sprites[this.side], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
          }
          else if (i==imax-1) {
            if (j==0) {
              ////////// TOP RIGHT CORNER //////////
              ctx.save();
              ctx.scale(-1,1); // invert canvas
              ctx.drawImage(this.sprites[this.topCorner], -(this.x+(i+1)*m-camx),
                            this.y+j*m-camy, m+1, m+1);
              ctx.restore(); // uninvert
              if (this.surface>-1) {
                ctx.drawImage(this.sprites[this.surface], this.x+i*m-camx,
                              this.y+(j-1)*m-camy, m+1, m+1);
              }
            }
            ////////// BOTTOM RIGHT CORNER //////////
            else if (j==jmax-1) {
              ctx.save();
              ctx.scale(-1,1); // invert canvas
              ctx.drawImage(this.sprites[this.bottomCorner], -(this.x+(i+1)*m-camx),
                            this.y+j*m-camy, m+1, m+1);
              ctx.restore(); // uninvert
            }
            else {
            ////////// RIGHT SIDE //////////
              ctx.save();
              ctx.scale(-1,1); // invert canvas
              ctx.drawImage(this.sprites[this.side], -(this.x+(i+1)*m-camx),
                            this.y+j*m-camy, m+1, m+1);
              ctx.restore(); // uninvert
            }
          }
          else {
            if (j==0) {
              ////////// TOP //////////
              if (this.surface>-1) {
                ctx.drawImage(this.sprites[this.surface], this.x+i*m-camx,
                              this.y+(j-1)*m-camy, m+1, m+1);
              }
              ctx.drawImage(this.sprites[this.top], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
            ////////// BOTTOM //////////
            else if (j==jmax-1) {
              ctx.drawImage(this.sprites[this.bottom], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
            ////////// MIDDLE //////////
            else {
              ctx.drawImage(this.sprites[this.middle], this.x+i*m-camx,
                            this.y+j*m-camy, m+1, m+1);
            }
          }
        }

      // ctx.strokeStyle = this.color;
      // ctx.strokeRect(this.x-camx, this.y-camy, this.w+1, this.h+1);  /////////// DEBUG
      }
    }
  }
  drawMini(x, y, ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x/20 + x, this.y/20 + y, this.w/20, this.h/20);
  }
}

class Movable {
  static PLAYER = 0;
  static PROBE = 1;
  static TRACER = 2;
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.xp = x;
    this.yp = y;
    this.vx = 0;
    this.vy = 0;
    this.ay = g;
    this.ax = 0;
    this.dir = 1;
    this.active = true;
    this.ground = -1;  // change to pointer to ground block object?
    this.flow = null;
    // animation vars //
    this.sprites = [];
    this.sequences = [];
    this.fps;
    this.drawW;
    this.drawH;
    this.hitx;
    this.hity;
    this.anistate = 0;
    this.anistateNext = 0;
    this.aniclock = 0;
  }
  setForces() {
    this.ay = 0;
    this.ax = 0;
    if (this.ground < 0) this.ay += g;
  }
  updatePosition(dt) {
    this.xp = this.x;
    this.yp = this.y;
    this.vx = this.vx + this.ax*dt;
    this.vy = this.vy + this.ay*dt;
    this.x  = this.x  + this.vx*dt;
    this.y  = this.y  + this.vy*dt;
  }
  isOnScreen(camx, camy){
    return this.x+this.w >= camx && this.x <= camx+30*m;
  }
  setupAnimation(sprites, fps, drawW, drawH, hitx, hity) {
    this.sprites = sprites;
    this.fps = fps;
    this.drawW = drawW;
    this.drawH = drawH;
    this.hitx = hitx;
    this.hity = hity;
  }
  animate(camx, camy, t, ctx) {
    if (this.aniclock > 0) { // fixed duration animation
      if (this.aniclock < t) {
        this.aniclock = 0;
        this.anistate = this.anistateNext;
      }
      this.anistate = this.anistate;
    }
    else { // continueous animation
      if (this.ground == -1)   this.anistate = 3;
      else if (this.ground == -2)   this.anistate = 4;
      else if (this.vx == 0) this.anistate = 0;
      else if (this.vx != 0) this.anistate = 1;
    }

    let seq = this.sequences[this.anistate];
    let frame = Math.floor(t*this.fps/1000)%seq.length; // current animation frame index
    let spritex = this.x-camx-this.hitx;
    let spritey = this.y-camy-this.hity;

    if (this.dir < 0) { // invert before drawing for dir<0
      ctx.save();
      ctx.scale(-1,1);
      spritex = -(spritex+this.drawW+this.hitx/2);
    }
    ctx.drawImage( this.sprites[seq[frame]], spritex, spritey,
                   this.drawW, this.drawH );
    if (this.dir < 0) ctx.restore(); // uninvert
  }
  drawMini(x, y, ctx) {
    ctx.fillStyle = this.color;
    let L = 1.5*Math.max(this.w, this.h)/20
    ctx.fillRect((this.x-L/2)/20+x, (this.y-L/2)/20+y, L, L);
  }
}

class Player extends Movable {
  constructor(x, y, w, h){
    super(x, y, w, h);
    this.type = Movable.PLAYER;
    this.color = "#AA00FF";
    this.splash = .5;
    this.stuff = [];
    this.itemCur = -1;
  }
  jump() {
    if (this.ground >= 0) {
      this.ground = -2;
      this.vy = -16.5*mps;
      playSound(9, 1, .75);
    }
    else if (this.ground == -2) {
      this.ground = -1;  /////////////////////////// COMMENT OUT FOR UNLIMITED JUMPS
      this.vy = -13*mps;
      playSound(10, 1, .6);
    }
  }
  walk(vx) {
    this.vx = vx;
    if (vx == 0) {
      return;
    }
    if (this.flow) this.vx = (0.3/255*this.flow.blu+0.4)*vx;
    if (this.ground == -1) this.vx = .75*vx;
    else if (this.ground == -2) this.vx = .9*vx;
    this.dir = Math.abs(vx)/vx;
  }
  useItem(guys, t) {
    if (this.ground > -1){ // only animate item-use if on ground
      this.aniclock = t + 150;
      this.anistate = 2;
      this.anistateNext = 0;
    }
    let n = this.stuff.length;
    if (n > 0) {
      playSound(12, 1, .5);
      // console.log(this.itemCur, this.stuff[this.itemCur])
      let item = this.stuff[this.itemCur];
      this.stuff.splice(this.itemCur, 1);
      item.active = true;
      item.xp = this.x;
      item.yp = this.y;
      item.x = this.x + 2*this.w-item.w/2;
      if (this.dir < 0) item.x = this.x - this.w-item.w/2;
      item.y = this.y+this.h/2-item.h/2;
      if (this.ground < 0) {
        item.y += this.h;
        item.vy = Math.max(this.vy, 0);
      }
      guys.push(item)
      this.switchItems(0);
    }
  }
  switchItems(di) {
    if (this.stuff.length > 0) {
      if (di == 0) {
        this.itemCur -= 1;
      }
      else {
        playSound(12, .7, .1);
        this.itemCur += di;
      }
      if (this.itemCur >= this.stuff.length) this.itemCur = 0;
      else if (this.itemCur < 0) this.itemCur = this.stuff.length-1;
      // console.log("========")
      // for (let i=0; i<this.stuff.length; i++)
        // if (i==this.itemCur) console.log(">", this.stuff[i].color);
        // else console.log(this.stuff[i].color);
    }
    else this.itemCur = -1;
  }
  collide(other) {
    if (this.active && other.active) {
      // Pick up if item //
      if (other.type == Movable.PROBE || other.type == Movable.TRACER) {
        playSound(12, 1, .5);
        other.active = false;   // mark item for removal from world
        other.ground = -1;
        let p = this.stuff.length-1;
        for (p; p>=0; p--){
          if (this.stuff[p].type == other.type) break;
        }
        this.stuff.splice(p+1, 0, other);
        if (p <= this.itemCur) this.itemCur++; // keep cursor on same item
      }
    }
  }
  draw(camx, camy, t, ctx) {
    if (this.isOnScreen(camx, camy)){
      this.animate(camx, camy, t, ctx);
    }
  }
}

class Probe extends Movable {
  constructor(x, y, w, h){
    super(x, y, w, h);
    this.type = Movable.PROBE;
    this.color = "#FFFFFF";
    this.splash = .01;
    this.data = [];
  }
  logFlow(t) {
    if (this.flow) {
      let n = this.data.length;
      if (n < 2 || t-this.data[n-2] >= 0.1){ // log every .1 seconds
        let i = Math.floor((this.x-this.flow.x)/m);
        if (this.flow.c[i] > 1e-6) {
          this.data.push(t);
          this.data.push(this.flow.c[i]);
        }
      }
    }
  }
  collide(other){}
  draw(camx, camy, t, ctx) {
    if (this.isOnScreen(camx, camy)){
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x-camx, this.y-camy, this.w, this.h);
      this.animate(camx, camy, t, ctx);
    }
  }
}

class Tracer extends Movable {
  constructor(x, y, w, h){
    super(x, y, w, h);
    this.type = Movable.TRACER;
    this.color = "#FF00FF";
    this.splash = .01;
    this.hp = 5;
  }
  collide(other){}
  draw(camx, camy, t, ctx) {
    if (this.isOnScreen(camx, camy)){
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x-camx, this.y+(this.h-this.hp)-camy, this.w, this.hp);
      this.animate(camx, camy, t, ctx);
    }
  }
}

class Warp {
  constructor(x, y, w, h, xf, yf, types) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.xf = xf;
    this.yf = yf;
    this.types = types;
  }
  boundaryCheck(guys) {
    let bl = this.x;
    let br = this.x + this.w;
    let bt = this.y;
    let bb = this.y + this.h;
    for (let i=0; i<guys.length; i++) {
      let gl = guys[i].x;
      let gr = guys[i].x + guys[i].w;
      let gt = guys[i].y;
      let gb = guys[i].y + guys[i].h;
      // if guy overlaps this block //
      if (gr > bl && gl < br && gb > bt && gt < bb) {
        for (let j=0; j<this.types.length; j++){
          if (guys[i].type == this.types[j]){
            guys[i].x = this.xf-guys[i].w/2;
            guys[i].y = this.yf-guys[i].h/2;
          }
        }
      }
    }
  }
}
