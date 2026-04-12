class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.opacity = 100;
    this.spin = 0;
  }

  render() {
    
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    var opacity = this.opacity / 100.0;
    gl.uniform1f(u_Size, size);

    var radian = this.spin * Math.PI / 180.0;
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB, sinB);

    gl.uniform2f(u_Translation, xy[0], xy[1]);

    var d = this.size / 200.0;
    
    drawTriangle([0.0, 0.0, d, 0.0, 0.0, d], this.color, opacity);
  }
}

function drawTriangle(vertices, color=[1.0, 1.0, 1.0, 1.0], opacity=1.0) {

    var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.uniform4f(u_FragColor, color[0], color[1], color[2], opacity);
  
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
