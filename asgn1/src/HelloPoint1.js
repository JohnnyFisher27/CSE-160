// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  uniform float u_CosB; 
  uniform float u_SinB;
  uniform vec2 u_Translation;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;

    float rotatedX = a_Position.x * u_CosB - a_Position.y * u_SinB;
    float rotatedY = a_Position.x * u_SinB + a_Position.y * u_CosB;
    gl_Position.x = rotatedX + u_Translation.x;
    gl_Position.y = rotatedY + u_Translation.y;
    gl_Position.z = a_Position.z;
    gl_Position.w = 1.0;
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

// Globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_CosB;
let u_SinB;
let u_Translation;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
// Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

  u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');
  u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
  if (!u_CosB || !u_SinB) {
    console.log('Failed to get the storage location of u_CosB or u_SinB');
    return;
  } 

  u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
  if (!u_Translation) {
    console.log('Failed to get the storage location of u_Translation');
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;
let g_selectedOpacity = 100;
let g_selectedSpin = 0;

function addActionsForHtmlUI() {
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); }
  document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; }
  document.getElementById('triButton').onclick = function() { g_selectedType = TRIANGLE; }
  document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; }
  document.getElementById('crocodileButton').onclick = drawCrocodile;

  document.getElementById('redSlide').addEventListener('mouseup', function() {
    g_selectedColor[0] = this.value / 100;
  });

  document.getElementById('greenSlide').addEventListener('mouseup', function() {
    g_selectedColor[1] = this.value / 100;
  });

  document.getElementById('blueSlide').addEventListener('mouseup', function() {
    g_selectedColor[2] = this.value / 100;
  });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() {
    g_selectedSize = this.value;
  });

  document.getElementById('segmentsSlide').addEventListener('mouseup', function() {
    g_selectedSegments = this.value;
  });

  document.getElementById('opacitySlide').addEventListener('mouseup', function() {
    g_selectedOpacity = this.value;
  });

  document.getElementById('spinSlide').addEventListener('mouseup', function() {
    g_selectedSpin = this.value;
  });
}

function main() {
  setUpWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev); } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function drawCrocodile() {

  // left feet
  placeBlock(-0.5, -0.5);
  placeTriangle(-0.4, -0.5);
  placeBlock(-0.3, -0.5);
  placeTriangle(-0.2, -0.5);
  placeBlock(-0.5, -0.4);
  placeBlock(-0.3, -0.4);

  // right feet
  placeBlock(-0.1, -0.5);
  placeTriangle(0.0, -0.5);
  placeBlock(0.1, -0.5);
  placeTriangle(0.2, -0.5);
  placeBlock(-0.1, -0.4);
  placeBlock(0.1, -0.4);

  // lower body
  placeBlock(-0.7, -0.3);
  placeBlock(-0.6, -0.3);
  placeBlock(-0.5, -0.3);
  placeBlock(-0.4, -0.3);
  placeBlock(-0.3, -0.3);
  placeBlock(-0.2, -0.3);
  placeBlock(-0.1, -0.3);
  placeBlock(0.0, -0.3);
  placeBlock(0.1, -0.3);
  placeBlock(0.2, -0.3);

  // tail
  placeBlock(-0.7, -0.2);
  placeBlock(-0.7, -0.1);
  placeBlock(-0.7, 0.0);
  placeBlock(-0.6, 0.0);
  placeBlock(-0.8, 0.0);
  //placeTriangleMirrored(-0.5, -0.2);
  //placeTriangleMirrored(-0.4, -0.1);

  // lower mouth
  placeBlock(0.3, -0.3);
  placeBlock(0.4, -0.3);
  placeBlock(0.5, -0.3);

  // upper mouth
  placeBlock(0.3, 0.0);
  placeBlock(0.4, 0.0);
  placeBlock(0.5, 0.0);

  // head
  placeBlock(0.0, 0.0);
  placeBlock(0.1, 0.0);
  placeBlock(0.2, 0.0);
  placeBlock(0.0, 0.1);
  placeBlock(0.1, 0.1);
  placeTriangle(0.2, 0.1, spikeColor);
  placeTriangleMirrored(0.0, 0.1);

  // upper body
  placeBlock(-0.1, 0.0);
  placeBlock(0.0, -0.1);
  placeBlock(-0.1, -0.1);
  placeBlock(-0.2, -0.1);
  placeBlock(-0.3, -0.1);
  placeBlock(-0.4, -0.1);
  placeBlock(-0.5, -0.2);

  // middle body
  placeBlock(0.0, -0.2);
  placeBlock(-0.1, -0.2);
  placeBlock(-0.2, -0.2);
  placeBlock(-0.3, -0.2);
  placeBlock(-0.4, -0.2);
  placeBlock(0.1, -0.2);
  placeTriangle(0.2, -0.2);
  placeTriangle(0.1, -0.1);
  //placeBlock(0.2, -0.1);

  // teeth
  placeBlock(0.3, 0.0);
  drawTriangle([0.5, 0.0, 0.55, -0.21, 0.6, 0.0], spikeColor);
  drawTriangle([0.3, 0.0, 0.35, -0.1, 0.4, 0.0], spikeColor);
  drawTriangle([0.4, -0.2, 0.45, -0.1, 0.5, -0.2], spikeColor);

  // back spikes
  drawTriangle([-0.3, 0.0, -0.35, 0.1, -0.4, 0.0], spikeColor);
  drawTriangle([-0.29, 0.0, -0.24, 0.1, -0.19, 0.0], spikeColor);
  drawTriangle([-0.20, 0.0, -0.15, 0.1, -0.1, 0.0], spikeColor);

  gl.uniform4f(u_FragColor, 0,1,0,1);

}

let crocColor = [0.0, 0.5, 0.0, 1.0];
let spikeColor = [1.0, 0.0, 0.0, 1.0];

function placeTriangle(x, y, color=crocColor) {
  drawTriangle([x, y, x + 0.1, y, x, y + 0.1], color);
}

function placeTriangleFlipped(x, y) {
  drawTriangle([x + 0.1, y, x, y + 0.1, x + 0.1, y + 0.1], crocColor);
}

function placeTriangleMirrored(x, y) {
  drawTriangle([x, y, x - 0.1, y, x, y + 0.1], crocColor);
}

function placeBlock(x, y) {
  placeTriangle(x, y);
  placeTriangleFlipped(x, y);
}

var g_shapesList = []; 

function click(ev) {

  [x, y] = convertCoordinatesEventToGL(ev);
 
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle(g_selectedSegments);
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  point.opacity = g_selectedOpacity;
  point.spin = g_selectedSpin;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return [x, y];
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}