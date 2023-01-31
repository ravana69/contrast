class Shape{
  constructor(){
    this.x = random(width);
    this.y = random(height);
    this.w = random(100, 300)*scaleFactor;
    this.h = random(100, 300)*scaleFactor;
    let a = random(TAU);
    this.dx = cos(a);
    this.dy = sin(a);
    this.base   = floor(random(5, 15))*10;
    this.height = floor(random(7, 10))*10;
    this.type = random(types);
    this.rotation = floor(random(4))*PI/2;
  }
  update(){
    this.x += this.dx;
    this.y += this.dy;
    if (this.x < 0 || this.x > width ) this.dx *= -1;
    if (this.y < 0 || this.y > height) this.dy *= -1;
  }
  render(buffer){
    buffer.push();
    buffer.translate(this.x, this.y);
    buffer.noStroke();
    buffer.rotate(this.rotation);
    for (let i = 0; i < 10; i++){
      let amt = 1 - i/10;
      buffer.fill((this.base + this.height*(1-amt))/255);
      if (this.type == 0) buffer.ellipse(0, 0, this.w*amt, this.h*amt);
      if (this.type == 1) buffer.rect   (0, 0, this.w*amt, this.h*amt);
      if (this.type == 2) buffer.rect   (0, 0, this.w*amt, this.h);
    }
    buffer.pop();
  }
}

let s;
let varying = 'precision highp float; varying vec2 vPos;';
let vert = `
  ${varying}
  attribute vec3 aPosition;
  void main() { vPos = (gl_Position = vec4(aPosition,1.0)*2. - 1.).xy; }
`;
let frag = `
  ${varying}
  uniform sampler2D tex0;
  void main(){
    vec2 uv = (vPos+1.)/2.;
    
    float x = texture2D(tex0, uv).x;
    float a = mod(floor(x*255./10.), 2.);
    gl_FragColor = vec4(a);
  }
`

function setup (){
  pixelDensity(1);
  createCanvas(0, 0, WEBGL);
  colorMode(HSB, 1, 1, 1);
  windowResized();
  
  s = createShader(vert, frag);
}

let combos = [
  [0],
  [1],
  [2],
  [0, 1],
  [1, 2],
  [0, 1, 2],
]

let shapes, buffer, scaleFactor, types;
let init = () => {
  shapes = [];
  types = random(combos);
  scaleFactor = max(width/1046, height/466);
  for (let i = 0; i < 100; i++) shapes.push(new Shape());
  buffer = createGraphics(width, height);
  buffer.colorMode(HSB, 1, 1, 1);
  buffer.rectMode(CENTER, CENTER);
  console.log(width, height);
}

function draw(){
  buffer.blendMode(BLEND);
  buffer.background(0);
  
  buffer.blendMode(LIGHTEST);
  shapes.forEach(s => {
    s.update();
    s.render(buffer);
  });
  
  s.setUniform("tex0", buffer);
  shader(s);
  rect(0, 0, width, height);
}

function mousePressed(){init();}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  init();
}