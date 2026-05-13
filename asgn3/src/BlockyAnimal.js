// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute float a_Brightness;
  varying vec2 v_UV;
  varying float v_Brightness;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform float u_TexScale;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV * u_TexScale;
    v_Brightness = a_Brightness; 

    gl_PointSize = max(15.0 / gl_Position.w, 2.0);
  }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying float v_Brightness;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform int u_whichTexture;
  void main() {
    vec4 color;
    if (u_whichTexture == -2) {
      color = u_FragColor;
    } else if (u_whichTexture == -1) {
      color = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      color = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      color = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      color = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      color = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      color = texture2D(u_Sampler4, v_UV);
    } else if (u_whichTexture == 5) {
      color = texture2D(u_Sampler5, v_UV);
    } else if (u_whichTexture == 6) {
      color = texture2D(u_Sampler0, gl_PointCoord);
      if (color.r < 0.1 && color.g < 0.1 && color.b < 0.1) discard;
    } else {
      color = vec4(1, 0.647, 0, 1);
    }
    gl_FragColor = vec4(color.rgb * v_Brightness, color.a);
  }`;

// Globals
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_whichTexture;
let u_ViewMatrix;
let u_ProjectionMatrix;
let a_Brightness;
let u_TexScale;
let g_snow;

let g_vertexBuffer = null;
let g_uvBuffer = null;
let g_2dVertexBuffer = null;

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
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

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

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return false;
  }
  
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return false;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return false;
  }

  a_Brightness = gl.getAttribLocation(gl.program, 'a_Brightness');
  if (!a_Brightness) {
    console.log('Failed to get the storage location of a_Brightness');
    return false;
  }

  u_TexScale = gl.getUniformLocation(gl.program, 'u_TexScale');
  if (!u_TexScale) {
    console.log('Failed to get the storage location of u_TexScale');
    return false;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_globalAngleZ = 0;

let g_flipYOffset = 0;
let g_flipScaleY = 1.0;
let g_flipScaleXZ = 1.0;
let g_flipRotationZ = 0;

let lastTimestamp = 0;
let fpsDisplay = document.getElementById('fps-counter');

let isDragging = false;
let lastX = -1;
let lastY = -1;

let camera;

function addActionsForHtmlUI() {
  
}

function initTexture() {
  
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image object');
    return false;
  }

  image0.onload = function() { loadTexture( image0, 0, u_Sampler0); };
  image0.src = "Snow.png";

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }

  image1.onload = function() { loadTexture( image1, 1, u_Sampler1); };
  image1.src = "Sky.png";

  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }

  image2.onload = function() { loadTexture( image2, 2, u_Sampler2); };
  image2.src = "Ground.png";

  var image3 = new Image();
  if (!image3) {
    console.log('Failed to create the image object');
    return false;
  }

  image3.onload = function() { loadTexture( image3, 3, u_Sampler3); };
  image3.src = "Face.png";

  var image4 = new Image();
  if (!image4) {
    console.log('Failed to create the image object');
    return false;
  }

  image4.onload = function() { loadTexture( image4, 4, u_Sampler4); };
  image4.src = "Text1.png";

  var image5 = new Image();
  if (!image5) {
    console.log('Failed to create the image object');
    return false;
  }

  image5.onload = function() { loadTexture( image5, 5, u_Sampler5); };
  image5.src = "Text2.png";

  return true;
}

function loadTexture(image, texUnit, u_Sampler) {  
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.activeTexture(gl.TEXTURE0 + texUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.uniform1i(u_Sampler, texUnit);
}

function initVertexBuffer() {
  g_vertexBuffer = gl.createBuffer();
  if (!g_vertexBuffer) {
    console.log('Failed to create the buffer object');
    return;
  }

  g_uvBuffer = gl.createBuffer();
  if (!g_uvBuffer) {
    console.log('Failed to create the UV buffer object');
    return;
  }

  g_2dVertexBuffer = gl.createBuffer();
  if (!g_2dVertexBuffer) {
    console.log('Failed to create the 2D buffer object');
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  initCubeBuffers();
}

function main() {
  setUpWebGL();
  connectVariablesToGLSL();
  initVertexBuffer();
  initCubeBuffers();

  addActionsForHtmlUI();

  document.onkeydown = keydown;
  camera = new Camera();

  initTexture();

  setupMouseControls();
  g_snow = new SnowSystem(1500);
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
  renderAllShapes();
  requestAnimationFrame(tick);
}

function keydown(ev) {
  if (ev.keyCode == 87) {
    camera.moveForward();
  } else if (ev.keyCode == 83) {
    camera.moveBackwards();
  } else if (ev.keyCode == 65) {
    camera.moveLeft();
  } else if (ev.keyCode == 68) {
    camera.moveRight();
  } else if (ev.keyCode == 81) {
    camera.panLeft();
  } else if (ev.keyCode == 69) {
    camera.panRight();
  } else if (ev.keyCode == 70) {
    addBlock();
  } else if (ev.keyCode == 82) {
    deleteBlock();
  }

  renderAllShapes(); 
}


let g_map = Array.from({ length: 32 }, () => Array(32).fill(0));

for (let i = 0; i < 32; i++) {
  g_map[0][i] = 3; 
  g_map[31][i] = 3;
  g_map[i][0] = 3; 
  g_map[i][31] = 3; 

}


const mazeWalls = [
  [13, 26], [12, 26], [11, 26], [10, 26], [9, 26], [8, 26], [7, 26], [6, 26], [5, 26],
  [5, 25], [5, 24], [5, 23], [5, 22], [6, 22], [7, 22], [8, 22], [9, 22], [10, 22], [11, 22], [12, 22],
  
  [18, 26], [19, 26], [20, 26], [21, 26], [22, 26], [23, 26], [24, 26], [25, 26], [26, 26],
  [26, 25], [26, 24], [26, 23], [26, 22], [25, 22], [24, 22], [23, 22], [22, 22], [21, 22], [20, 22], [19, 22],

  [12, 19], [13, 19], [14, 19], [15, 19], [16, 19], [17, 19], [18, 19], [19, 19],
  [12, 16], [13, 16], [14, 16], [17, 16], [18, 16], [19, 16],
  [8, 19], [8, 18], [8, 17], [8, 16], [8, 15], [8, 14], [8, 13],
  [23, 19], [23, 18], [23, 17], [23, 16], [23, 15], [23, 14], [23, 13],

  [12, 13], [13, 13], [14, 13], [17, 13], [18, 13], [19, 13],
  [14, 12], [14, 11], [14, 10], [14, 9], [14, 8],
  [17, 12], [17, 11], [17, 10], [17, 9], [17, 8],

  [12, 5], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5], [18, 5], [19, 5],
  [12, 4], [12, 3], [12, 2],
  [19, 4], [19, 3], [19, 2]
];

for (let i = 0; i < mazeWalls.length; i++) {
  let x = mazeWalls[i][0];
  let z = mazeWalls[i][1];
  g_map[x][z] = 3;
}

//snowman
g_map[15][25] = 1;


g_map[15][5] = 3;
g_map[16][5] = 3;

const sharedCube = new Cube(); 

function drawMap() {
  gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeVertexBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeUVBuffer);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_UV);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeBrightnessBuffer);
  gl.vertexAttribPointer(a_Brightness, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Brightness);

  sharedCube.color = [1.0, 0.0, 1.0, 1.0];
  sharedCube.textureNum = 0;
  sharedCube.textureScale = 1.0;

  for (let x=0; x<32; x++) {
    for (let y=0; y<32; y++) {
      let height = g_map[x][y];
      for (let i=0; i<height; i++) {
        sharedCube.matrix.setTranslate(x-16, -0.75+i, y-16);
        sharedCube.render();
      }
    }
  }

  sharedCube.color = [1.0, 0.0, 0.0, 1.0];
  sharedCube.textureNum = 2;
  sharedCube.textureScale = 40.0;
  sharedCube.matrix.setTranslate(0, -0.76, 0); 
  sharedCube.matrix.scale(40, 0.01, 40);
  sharedCube.matrix.translate(-0.5, 0, -0.5);
  sharedCube.render();

  sharedCube.color = [1.0, 0.0, 0.0, 1.0];
  sharedCube.textureNum = 1;
  sharedCube.textureScale = 1.0;
  sharedCube.matrix.setTranslate(0, 0, 0); 
  sharedCube.matrix.scale(50, 50, 50);
  sharedCube.matrix.translate(-0.5, -0.5, -0.5);
  sharedCube.render();

  var face = new Cube();
  face.color = [1.0, 1.0, 1.0, 1.0];
  face.textureNum = 3;
  face.textureScale = 1.0;
  face.matrix.setTranslate(-0.5, 0.75, 9.5); 
  face.matrix.translate(-0.5, -0.5, -0.5);
  face.render();

  var carrot = new Cube();
  carrot.color = [1.0, 1.0, 1.0, 1.0];
  carrot.textureNum = 10;
  carrot.textureScale = 1.0;
  carrot.matrix.setTranslate(0, 0, -12); 
  carrot.matrix.translate(-0.5, -0.5, -0.5);
  carrot.matrix.scale(0.5, 0.5, 0.5);
  carrot.render();

  var text1 = new Cube();
  text1.color = [1.0, 1.0, 1.0, 1.0];
  text1.textureNum = 4;
  text1.textureScale = 1.0;
  text1.matrix.setTranslate(0.5, 0.75, 9.5); 
  text1.matrix.translate(-0.5, -0.5, -0.5);
  text1.render();

  var text2 = new Cube();
  text2.color = [1.0, 1.0, 1.0, 1.0];
  text2.textureNum = 5;
  text2.textureScale = 1.0;
  text2.matrix.setTranslate(0, 0.5, -12); 
  text2.matrix.translate(-0.5, -0.5, -0.5);
  text2.render();

}

function addBlock() {
  let coords = getTargetMapCoords();
  if (coords) {
    g_map[coords.x][coords.y]++;
    renderAllShapes();
  }
}

function deleteBlock() {
  let coords = getTargetMapCoords();
  if (coords && g_map[coords.x][coords.y] > 0) {
    g_map[coords.x][coords.y]--;
    renderAllShapes();
  }
}

function renderAllShapes() {

  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  
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
  
  drawMap();

  if (g_snow) {
    g_snow.render();
  }
}

function setupMouseControls() {
  canvas.onmousedown = function(ev) {
    let x = ev.clientX;
    let y = ev.clientY;
    
    let rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      isDragging = true;
      lastX = x;
      lastY = y;
    }
  };

  canvas.onmouseup = function(ev) {
    isDragging = false;
  };

  canvas.onmouseleave = function(ev) {
    isDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (!isDragging) return;

    let x = ev.clientX;
    let y = ev.clientY;

    let deltaX = x - lastX;
    let deltaY = y - lastY; 

    let sensitivity = 0.5;

    camera.panX(-deltaX * sensitivity);
    //camera.panY(-deltaY * sensitivity); 

    lastX = x;
    lastY = y;

    renderAllShapes();
  };
}

function getTargetMapCoords() {
  let f = new Vector3();
  f.set(camera.at);
  f.sub(camera.eye);
  f.normalize();
  
  f.mul(2); 

  let targetX = camera.eye.elements[0] + f.elements[0];
  let targetZ = camera.eye.elements[2] + f.elements[2];

  let mapX = Math.round(targetX + 16);
  let mapY = Math.round(targetZ + 16);

  if (mapX >= 0 && mapX < 32 && mapY >= 0 && mapY < 32) {
    return { x: mapX, y: mapY };
  }

  return null;
}
const g_cubeVertices = new Float32Array([
  0,0,0, 1,1,0, 1,0,0,  0,0,0, 0,1,0, 1,1,0,
  0,1,0, 0,1,1, 1,1,1,  0,1,0, 1,1,1, 1,1,0,
  1,0,0, 1,1,0, 1,1,1,  1,0,0, 1,1,1, 1,0,1,
  0,0,0, 0,0,1, 0,1,1,  0,0,0, 0,1,1, 0,1,0,
  0,0,1, 1,0,1, 1,1,1,  0,0,1, 1,1,1, 0,1,1,
  0,0,0, 1,0,1, 0,0,1,  0,0,0, 1,0,0, 1,0,1 
]);

const g_cubeUVs = new Float32Array([
  0,0, 1,1, 1,0,  0,0, 0,1, 1,1, 
  0,0, 0,1, 1,1,  0,0, 1,1, 1,0, 
  0,0, 0,1, 1,1,  0,0, 1,1, 1,0,
  1,0, 0,0, 0,1,  1,0, 0,1, 1,1, 
  1,0, 0,0, 0,1,  1,0, 0,1, 1,1,
  0,1, 1,0, 0,0,  0,1, 1,1, 1,0 
]);

const g_cubeBrightness = new Float32Array([
  1,1,1, 1,1,1,
  0.9,0.9,0.9, 0.9,0.9,0.9,
  0.8,0.8,0.8, 0.8,0.8,0.8,
  0.8,0.8,0.8, 0.8,0.8,0.8,
  0.6,0.6,0.6, 0.6,0.6,0.6, 
  0.7,0.7,0.7, 0.7,0.7,0.7 
]);

let g_sharedCubeVertexBuffer, g_sharedCubeUVBuffer, g_sharedCubeBrightnessBuffer;

function initCubeBuffers() {
  g_sharedCubeVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeVertices, gl.STATIC_DRAW);

  g_sharedCubeUVBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeUVBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeUVs, gl.STATIC_DRAW);

  g_sharedCubeBrightnessBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeBrightnessBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, g_cubeBrightness, gl.STATIC_DRAW);
}

function checkCollision(targetX, targetZ) {
  let mapX = Math.round(targetX + 16);
  let mapZ = Math.round(targetZ + 16);

  if (mapX < 0 || mapX >= 32 || mapZ < 0 || mapZ >= 32) {
    return true; 
  }

  return g_map[mapX][mapZ] > 0;
}