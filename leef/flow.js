class Flow1D {
  constructor(x, y, n) {
    this.x = x;
    this.y = y;
    this.red = 0
    this.grn = 230
    this.blu = 255
    this.alpha = 0.75
    this.h = m;

    this.n = n;
    this.D = 1;  // Diffussivity
    this.visc = 1.0023e-6;
    this.c0 = []
    this.c  = []
    this.u0 = []
    this.u  = []
    this.ca = 0;
    this.ua = 1;
    this.splash = 1;
    for (let i=0; i<n; i++) {
      this.c.push(this.ca);
      this.u.push(this.ua);
    }
  }
  solve(c,c0,D,dt,ca) {
    let dx = 1;
    let n = c.length;
    c0 = c;
    c[0] = c0[0]
         - dt/dx * this.u[0]/2 * (c0[1] - ca)
         + dt/dx**2 * D * (c0[1] - 2*c0[0] + ca);
    if (!isFinite(c[0])) c[0] = ca;
    for (let i=1; i<n-1; i++){
      c[i] = c0[i]
           - dt/dx * this.u[i]/2 * (c0[i+1] - c0[i-1])
           + dt/dx**2 * D * (c0[i+1] - 2*c0[i] + c0[i-1]);
      if (!isFinite(c[i])) c[i] = ca;
    }
    c[n-1] = c0[n-1]
           - dt/dx * this.u[n-1]/2 * (c0[n-1] - c0[n-2])
           + dt/dx**2 * D * (-c0[n-1] + c0[n-2]);
    if (!isFinite(c[n-1])) c[n-1] = ca;
  }
  update(dt) {
    this.solve(this.u,this.uo,this.visc,dt/1000,this.ua); // 1.0023e-6
    this.solve(this.c,this.co,this.D,dt/1000,this.ca);
    // console.log(this.u);
  }
  getRed(cell){
    let red = Math.floor(this.blu*this.c[cell]/.05) //////////////////////////////////////////// TEST C COLOR RANGE
    if (red > this.blu) red = this.blu;
    if (red < 0 || isNaN(red)) red = 0;
    return red
  }
  getColor(cell){
    let red = this.getRed(cell);
    // this.alpha = 0.5 + 0.35 * this.red/255; ////////////////////////////// make red parts more opaque?
    return "rgba("+red+","+this.grn+","+this.blu+","+this.alpha+")";
  }
  boundaryCheck(guys, t) {
    let inFlow = []
    let bl = this.x;
    let br = this.x + this.n*m;
    let bt = this.y;
    let bb = this.y + m;
    for (let i=0; i<guys.length; i++) {
      let gl = guys[i].x;
      let gr = guys[i].x + guys[i].w;
      let gt = guys[i].y;
      let gb = guys[i].y + guys[i].h;

      // guy in flow domain //
      if (gr > bl && gl < br) {
        let cell = Math.floor( (guys[i].x+guys[i].w/2-this.x)/m );
        if (cell > this.n-1) continue; ////////////////////// QUICK FIX FOR ERROR JUMPING IN LAST CELL
        if (cell == 0) cell = 1;
        // if guy is in flow //
        if (gb > bt && gt < bb) {
          guys[i].flow = this;
          if (guys[i].type == Movable.TRACER) { // Tracer in flow
            guys[i].active = false;
            this.c[cell] += 10 * guys[i].hp/m*guys[i].w/m; ///////////////////////////// Needs calibration?
          }
          if (guys[i].yp + guys[i].h <= bt) { // guy just entered
            let vol = (this.splash + 2)/3;
            let rat = (this.splash + 3)/4;
            let snd = Math.floor(Math.random() * 2);
            if (guys[i].vy > 1.5) { // cannonball
              snd = 2;
              if (Math.random() > 0.99) snd = 14;
            }
            if (guys[i].splash < .5) snd = 3+Math.floor(Math.random() * 3);
            playSound(snd, rat, vol);
            let dv = guys[i].splash*this.u[cell]//*guys[i].vy/.66;
            let fwd = 1;  /////////////////////////////////////////////// Needs calibrating?
            if (cell>0) this.u[cell-1] += dv*(1-fwd);
            else this.u[cell+1] += dv*(1-fwd);
            if (cell<this.n-1) this.u[cell+1] += dv*fwd;
            else this.u[cell-1] += dv*fwd;
            this.u[cell] -= dv;
            // Eject droplets //
            this.ejectDrops(cell, guys[i]);
          }
        }
        // if guy is above flow //
        else {
          guys[i].flow = null;
          if (guys[i].yp + guys[i].h > bt) { // if just exited
            let vol = (this.splash + 2)/3 * .75;
            let rat = (this.splash + 7)/8;
            let snd = 3 + Math.floor(Math.random() * 3);
            playSound(snd, rat, vol);
            this.ejectDrops(cell, guys[i]);
            // let dv = guys[i].splash*this.u[cell];
            // let fwd = 1;
            // if (cell>0) this.u[cell-1] -= dv*(1-fwd);
            // else this.u[cell+1] -= dv/2;
            // if (cell<this.n-1) this.u[cell+1] -= dv*fwd;
            // else this.u[cell-1] -= dv/2;
            // this.u[cell] += dv;
          }
        }
      }
    }
  }
  ejectDrops(cell, guy) {
    let ndrops = 5 + 50*this.splash*guy.splash*(.25+.75*Math.random())*guy.vy**2/(10*mps);
    for (let j=0; j<ndrops; j++){
      drops.push( new Drop(
                  guy.x+guy.w*Math.random(),
                  this.y + .8*m,
                  (.5-Math.random())*(.2+guy.splash)*10*mps + Math.random()*guy.vx/2,
                  -(10*mps + this.splash*guy.splash*guy.vy*.5)*Math.random(),
                  m/15*Math.random(),
                  t, this.getRed(cell), this.grn, this.blu, .8) );
    }
  }
  draw(camx, camy, ctx) {
    // Setup Color Gradient //
    var gradient = ctx.createLinearGradient(this.x-camx, this.y-camy,
                                            this.x-camx+this.n*m, this.y-camy);
    // Find on-screen i range //
    let i0 = Math.floor((camx-this.x)/m);
    let i1 = Math.ceil((camx+30*m-this.x)/m);
    if (i0<0) i0 = 0;
    if (i1 > this.n) i1 = this.n;

    gradient.addColorStop(0, this.getColor(0));
    for (let i=i0; i<i1; i++) {
      gradient.addColorStop(i/this.n, this.getColor(i));
    }
    ctx.beginPath();
    ctx.moveTo(this.x-camx, this.y-camy+this.h);
    ctx.lineTo(this.x-camx, this.y-camy);
    let amp = this.h/2;
    for (let i=i0; i<i1; i++){
      let x = this.x+m*i;
      let y = this.y+amp*(1-this.u[i]);
      let xend  = this.x+m*(i+0.5);
      let yend = y
      if (i<this.n-1) yend = this.y + amp*(2-this.u[i]-this.u[i+1])/2; // usually this
      ctx.quadraticCurveTo(x-camx, y-camy, xend-camx, yend-camy)
      // ctx.fillStyle = "#FF0000"; // show bezier control points
      // ctx.fillRect(x-3-camx, y-6-camy,6,12);
      // ctx.fillStyle = "#00FF00"; // show bezier end points
      // ctx.fillRect(xend-4-camx, yend-4-camy,8,8);
    }
    let rad = this.h-amp*(1-this.u[this.n-1]);
    ctx.arc(this.x-camx+this.n*m, this.y-camy+this.h, rad, 3/2*Math.PI, 2*Math.PI);
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x-camx+this.n*m, this.y-camy+this.h, rad, 2*m);
    ctx.fill();
  }
  drawMini(x, y, ctx){
    ctx.fillStyle = "rgba("+this.red+","+this.grn+","+this.blu+","+this.alpha+")";
    ctx.fillRect(this.x/20 + x, this.y/20 + y, this.n*m/20, m/20);
    ctx.fillRect((this.x+this.n*m)/20 + x, this.y/20 + y, m/20, 2*m/20);
  }
}

class Drop {
  constructor(x, y, vx, vy, radius, t0, red, grn, blu, alpha) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.active = true;
    this.t0 = t0;
    this.red = red;
    this.grn = grn;
    this.blu = blu;
    this.alpha = alpha;
    this.tf = -2*vy/(.8*g);
  }
  draw(camx, camy, t, ctx) {
    if (t-this.t0 > this.tf) this.active = false;
    let delt = t - this.t0;
    let y = this.y + this.vy*delt + (.8*g)/2*delt**2;
    let x = this.x + this.vx*delt;
    let alpha = this.alpha*(y/(this.vy**2/(.8*g)));
    ctx.beginPath();
    ctx.fillStyle = "rgba("+this.red+","+this.grn+","+this.blu+","+this.alpha+")";
    ctx.arc(x-camx, y-camy, this.radius, 0, 2*Math.PI);
    // ctx.arc(x-camx, y-camy, this.radius, 0, 2*Math.PI);
    ctx.fill();
  }
}
