// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_vertexBuffer = null;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
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

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_globalAngleZ = 0;

let g_mouthUpperAngle = 30;
let g_mouthLowerAngle = -30;

let g_tailAngle = 0;
let g_tailAngle2 = 30;
let g_tailAngle3 = -60;

let g_foot1Angle = 0;
let g_foot2Angle = 0;
let g_foot3Angle = 0;
let g_foot4Angle = 0;

let mouthAnimation = false;
let tailAnimation = false;
let feetAnimation = false;

let lastTimestamp = 0;
let fpsDisplay = document.getElementById('fps-counter');

let isDragging = false;
let lastX = -1;
let lastY = -1;

let g_isFlipped = false;
let g_flipStartTime = 0;
let g_flipYOffset = 0;
let g_flipScaleY = 1.0;
let g_flipScaleXZ = 1.0;
let g_flipRotationZ = 0;

let g_isPoked = false;
let mouthUpperCoordinates = new Matrix4();
let mouthLowerCoordinates = new Matrix4();
let pupilColor = [0, 0, 0, 1.0];

function addActionsForHtmlUI() {
  document.getElementById('animationButtonOn').onclick = function() {
    mouthAnimation = true;
    tailAnimation = true;
    feetAnimation = true;
  };  

  document.getElementById('animationButtonOff').onclick = function() {
    mouthAnimation = false;
    tailAnimation = false;
    feetAnimation = false;
  };  

  document.getElementById('tailJoint1Slide').addEventListener('mousemove', function() {
    g_tailAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('tailJoint2Slide').addEventListener('mousemove', function() {
    g_tailAngle2 = this.value;
    renderAllShapes();
  });

  document.getElementById('tailJoint3Slide').addEventListener('mousemove', function() {
    g_tailAngle3 = this.value;
    renderAllShapes();
  });

  document.getElementById('foot1Slide').addEventListener('mousemove', function() {
    g_foot1Angle = this.value;
    renderAllShapes();
  });

  document.getElementById('foot2Slide').addEventListener('mousemove', function() {
    g_foot2Angle = this.value;
    renderAllShapes();
  });

  document.getElementById('foot3Slide').addEventListener('mousemove', function() {
    g_foot3Angle = this.value;
    renderAllShapes();
  });

  document.getElementById('foot4Slide').addEventListener('mousemove', function() {
    g_foot4Angle = this.value;
    renderAllShapes();
  });

  document.getElementById('mouthSlide').addEventListener('mousemove', function() {
    g_mouthUpperAngle = this.value;
    g_mouthLowerAngle = -this.value;
    renderAllShapes();
  });

  document.getElementById('angleSlide').addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderAllShapes();
  });

  document.getElementById('angleSlideY').addEventListener('mousemove', function() {
    g_globalAngleY = this.value;
    renderAllShapes();
  });

  document.getElementById('angleSlideZ').addEventListener('mousemove', function() {
    g_globalAngleZ = this.value;
    renderAllShapes();
  });

  document.getElementById('flipButton').addEventListener('click', function() {
    g_isFlipped = true;
    g_flipStartTime = g_seconds; 
    renderAllShapes();
  });

}

function initVertexBuffer() {
  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
}

function main() {
  setUpWebGL();
  connectVariablesToGLSL();
  initVertexBuffer();

  addActionsForHtmlUI();

  setupMouseControls();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);
}

g_startTime = performance.now()/1000.0;
g_seconds = performance.now()/1000.0 - g_startTime;

let frameCount = 0;

function tick(now) {
  let deltaTime = now - lastTimestamp;
  lastTimestamp = now;

  if (deltaTime > 0) {
    let fps = 1000.0 / deltaTime;
    frameCount++;
    if (frameCount >= 10) {
      fpsDisplay.innerHTML = `FPS: ${Math.round(fps)}`;
      frameCount = 0;
      }
  }
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  doAFlip()
  pokeAnimation();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (mouthAnimation) {
    g_mouthUpperAngle = 5*Math.sin(g_seconds);
    g_mouthLowerAngle = -5*Math.sin(g_seconds);
  }

  if (tailAnimation) {
    g_tailAngle = 30*Math.sin(g_seconds);
  }

  if (feetAnimation) {
    g_foot1Angle = 30*Math.sin(g_seconds);
    g_foot2Angle = 30*Math.sin(g_seconds);
    g_foot3Angle = 30*Math.sin(g_seconds);
    g_foot4Angle = 30*Math.sin(g_seconds);
  }
}

function doAFlip() {
  if (!g_isFlipped) return;

  let t = g_seconds - g_flipStartTime;
  let duration = 1.0; 

  if (t >= duration) {
    g_isFlipped = false;
    g_flipYOffset = 0;
    g_flipScaleY = 1.0;
    g_flipScaleXZ = 1.0;
    g_flipRotationZ = 0;
    return;
  }

  if (t < 0.2) {
    let progress = t / 0.2;
    g_flipScaleY = 1.0 - 0.4 * Math.sin(progress * Math.PI / 2); 
    g_flipScaleXZ = 1.0 + 0.4 * Math.sin(progress * Math.PI / 2); 
    g_flipYOffset = -0.2 * Math.sin(progress * Math.PI / 2);  
  } 
  else if (t < 0.8) {
    let progress = (t - 0.2) / 0.6;
    g_flipScaleY = 1.0 + 0.2 * Math.sin(progress * Math.PI);
    g_flipScaleXZ = 1.0 - 0.2 * Math.sin(progress * Math.PI); 
    
    g_flipYOffset = 1.5 * Math.sin(progress * Math.PI); 
    
    g_flipRotationZ = 360 * progress;
  } 
  else {
    let progress = (t - 0.8) / 0.2;
    g_flipScaleY = 1.0 - 0.2 * Math.sin((1 - progress) * Math.PI / 2);
    g_flipScaleXZ = 1.0 + 0.2 * Math.sin((1 - progress) * Math.PI / 2);
    g_flipYOffset = 0;
    g_flipRotationZ = 0;
  }
}

function pokeAnimation() {
  if (!g_isPoked) return;
  
  setTimeout(() => {
    pupilColor = [0, 0, 0, 1.0];
    g_isPoked = false;
    renderAllShapes();
  }, 1000);
}

function renderAllShapes() {

  var globalRotMat = new Matrix4()
    .rotate(g_globalAngle, 0, 1, 0)
    .rotate(g_globalAngleY, 1, 0, 0)
    .rotate(g_globalAngleZ, 0, 0, 1);

  globalRotMat.translate(0, g_flipYOffset, 0);
  globalRotMat.rotate(g_flipRotationZ, 0, 0, 1);
  globalRotMat.scale(g_flipScaleXZ, g_flipScaleY, g_flipScaleXZ);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var body = new Cube();
  body.color = [0, 0.5, 0, 1.0];
  body.matrix.translate(0.55, -0.575, 0.125); 
  body.matrix.rotate(180, 0, 1, 0); 
  body.matrix.scale(0.75, 0.2, 0.25);
  body.render();

  var mouthUpperCoord = new Matrix4();
  mouthUpperCoord.translate(0.5, -0.4, 0);  
  mouthUpperCoord.rotate(g_mouthUpperAngle, 0, 0, 1);
  mouthUpperCoord.rotate(180, 0, 1, 0);

  var mouthUpper = new PizzaBox();
  mouthUpper.color = [0, 0.5, 0, 1.0];
  mouthUpper.matrix = new Matrix4(mouthUpperCoord); 
  mouthUpper.matrix.scale(0.75, 0.4, 0.25);
  mouthUpper.matrix.translate(-1, 0, 0); 
  mouthUpper.render();

  var mouthLowerCoord = new Matrix4();
  mouthLowerCoord.translate(0.5, -0.57, 0);  
  mouthLowerCoord.rotate(g_mouthLowerAngle, 0, 0, 1);
  mouthLowerCoord.rotate(180, 0, 1, 0);

  var mouthLower = new PizzaBox();
  mouthLower.color = [0, 0.5, 0, 1.0];
  mouthLower.matrix = new Matrix4(mouthLowerCoord);
  mouthLower.matrix.scale(0.75, 0.4, 0.25);
  mouthLower.matrix.translate(-1, 0, 0);
  mouthLower.render();

  var tail1Coord = new Matrix4();
  tail1Coord.translate(-0.1, -0.5, 0.075); 
  tail1Coord.rotate(180, 0, 1, 0);
  tail1Coord.rotate(g_tailAngle, 0, 1, 0);

  var tail1 = new Cube();
  tail1.color = [0, 0.5, 0, 1.0];
  tail1.matrix = new Matrix4(tail1Coord); 
  tail1.matrix.scale(0.3, 0.1, 0.15);  
  tail1.render();

  var tail2Coord = new Matrix4(tail1Coord);
  tail2Coord.translate(0.25, 0, 0); 
  tail2Coord.rotate(g_tailAngle2, 0, 1, 0);

  var tail2 = new Cube();
  tail2.color = [0, 0.5, 0, 1.0];
  tail2.matrix = new Matrix4(tail2Coord);
  tail2.matrix.scale(0.3, 0.1, 0.15); 
  tail2.render();

  var tail3Coord = new Matrix4(tail2Coord);
  tail3Coord.translate(0.3, 0, 0); 
  tail3Coord.rotate(g_tailAngle3, 0, 1, 0);

  var tail3 = new Cube();
  tail3.color = [0, 0.5, 0, 1.0];
  tail3.matrix = new Matrix4(tail3Coord);
  tail3.matrix.scale(0.3, 0.1, 0.15); 
  tail3.render();

  var leg1Coord = new Matrix4();
  leg1Coord.translate(0.25 + g_foot1Angle/500, -0.63 - g_foot1Angle/1000, -0.25); 

  var leg1 = new Cube();
  leg1.color = [0, 0.5, 0, 1.0];
  leg1.matrix = new Matrix4(leg1Coord);
  leg1.matrix.scale(0.14, 0.18, 0.14);
  leg1.render();

  var foot1 = new Cube();
  foot1.color = [0, 0.5, 0, 1.0];
  foot1.matrix = new Matrix4(leg1Coord); 
  foot1.matrix.scale(0.21, 0.027, 0.14); 
  foot1.render();

  var leg2Coord = new Matrix4();
  leg2Coord.translate(-0.2 + g_foot2Angle/500, -0.63 - g_foot2Angle/1000, -0.25); 

  var leg2 = new Cube();
  leg2.color = [0, 0.5, 0, 1.0];
  leg2.matrix = new Matrix4(leg2Coord);
  leg2.matrix.scale(0.14, 0.18, 0.14);
  leg2.render();
  
  var foot2 = new Cube();
  foot2.color = [0, 0.5, 0, 1.0];
  foot2.matrix = new Matrix4(leg2Coord);
  foot2.matrix.scale(0.21, 0.027, 0.14); 
  foot2.render();

  var leg3Coord = new Matrix4();
  leg3Coord.translate(-0.2 + g_foot3Angle/500, -0.63 - g_foot3Angle/1000, 0.125); 

  var leg3 = new Cube();
  leg3.color = [0, 0.5, 0, 1.0];
  leg3.matrix = new Matrix4(leg3Coord);
  leg3.matrix.scale(0.14, 0.18, 0.14);
  leg3.render();

  var foot3 = new Cube();
  foot3.color = [0, 0.5, 0, 1.0];
  foot3.matrix = new Matrix4(leg3Coord);
  foot3.matrix.scale(0.21, 0.027, 0.14); 
  foot3.render();

  var leg4Coord = new Matrix4();
  leg4Coord.translate(0.25 + g_foot4Angle/500, -0.63 - g_foot4Angle/1000, 0.125); 

  var leg4 = new Cube();
  leg4.color = [0, 0.5, 0, 1.0];
  leg4.matrix = new Matrix4(leg4Coord);
  leg4.matrix.scale(0.14, 0.18, 0.14);
  leg4.render();

  var foot4 = new Cube();
  foot4.color = [0, 0.5, 0, 1.0];
  foot4.matrix = new Matrix4(leg4Coord);
  foot4.matrix.scale(0.21, 0.027, 0.14); 
  foot4.render();

  var eye1 = new Sphere();
  eye1.color = [1, 1, 1, 1.0];
  eye1.matrix.translate(0.4, -0.35, 0.065);
  eye1.matrix.scale(0.1, 0.1, 0.1);
  eye1.render();
  
  var pupil1 = new Sphere();
  pupil1.color = pupilColor;
  pupil1.matrix.translate(0.45, -0.35, 0.065);
  pupil1.matrix.scale(0.05, 0.05, 0.05);
  pupil1.render();

  var eye2 = new Sphere();
  eye2.color = [1, 1, 1, 1.0];
  eye2.matrix.translate(0.4, -0.35, -0.065);
  eye2.matrix.scale(0.1, 0.1, 0.1);
  eye2.render();
  
  var pupil2 = new Sphere();
  pupil2.color = pupilColor;
  pupil2.matrix.translate(0.45, -0.35, -0.065);
  pupil2.matrix.scale(0.05, 0.05, 0.05);
  pupil2.render();

  if (g_isPoked) {
    pupilColor = [1.0, 0.0, 0.0, 1.0]; 

    var tooth1 = new TriangularPrism();
    tooth1.color = [1.0, 1.0, 1.0, 1.0];
    tooth1.matrix = new Matrix4(mouthUpperCoord); 
    tooth1.matrix.translate(-0.6, 0.02, 0.03);   
    tooth1.matrix.scale(0.04, 0.1, 0.04);  
    tooth1.matrix.rotate(180, 0, 1, 0);
    tooth1.matrix.rotate(180, 0, 0, 1);
    tooth1.render();

    var tooth2 = new TriangularPrism();
    tooth2.color = [1.0, 1.0, 1.0, 1.0];
    tooth2.matrix = new Matrix4(mouthLowerCoord);
    tooth2.matrix.translate(-0.6, 0.02, 0.03);
    tooth2.matrix.scale(0.04, 0.1, 0.04);
    tooth2.matrix.rotate(180, 0, 1, 0);
    tooth2.render();

    var tooth3 = new TriangularPrism();
    tooth3.color = [1.0, 1.0, 1.0, 1.0];
    tooth3.matrix = new Matrix4(mouthUpperCoord); 
    tooth3.matrix.translate(-0.4, 0.02, 0);
    tooth3.matrix.scale(0.04, 0.1, 0.04);
    tooth3.matrix.rotate(180, 0, 1, 0);
    tooth3.matrix.rotate(180, 0, 0, 1);
    tooth3.render();

    var tooth4 = new TriangularPrism();
    tooth4.color = [1.0, 1.0, 1.0, 1.0];
    tooth4.matrix = new Matrix4(mouthLowerCoord);
    tooth4.matrix.translate(-0.4, 0.02, 0);
    tooth4.matrix.scale(0.04, 0.1, 0.04);
    tooth4.matrix.rotate(180, 0, 1, 0);
    tooth4.render();
  } else {
    pupilColor = [0.0, 0.0, 0.0, 1.0]; 
  }

}

function setupMouseControls() {
  canvas.onmousedown = function(ev) {
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();
    
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      if (ev.shiftKey) {
        if (!g_isPoked) {
          g_isPoked = true;
        }
      } else {
        isDragging = true;
        lastX = x;
        lastY = y;
      }
    }
  };

  canvas.onmouseup = function(ev) {
    isDragging = false;
  };

  canvas.onmouseleave = function(ev) {
    isDragging = false; 
  };

  canvas.onmousemove = function(ev) {
    if (isDragging) {
      let x = ev.clientX;
      let y = ev.clientY;
    
      let factor = 100 / canvas.height; 
      let dx = factor * (x - lastX);
      let dy = factor * (y - lastY);
      
      g_globalAngle -= dx; 
      g_globalAngleY -= dy;
      
      lastX = x;
      lastY = y;
    }
  };
}