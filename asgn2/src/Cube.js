class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D(CUBE_FACES.front1);
    drawTriangle3D(CUBE_FACES.front2);

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D(CUBE_FACES.top1);
    drawTriangle3D(CUBE_FACES.top2);

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D(CUBE_FACES.right1);
    drawTriangle3D(CUBE_FACES.right2);

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D(CUBE_FACES.left1);
    drawTriangle3D(CUBE_FACES.left2);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D(CUBE_FACES.bottom1);
    drawTriangle3D(CUBE_FACES.bottom2);

    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3D(CUBE_FACES.back1);
    drawTriangle3D(CUBE_FACES.back2);
  }
}

const CUBE_FACES = {
  front1: new Float32Array([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]),
  front2: new Float32Array([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]),
  top1:   new Float32Array([0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0]),
  top2:   new Float32Array([0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0]),
  right1: new Float32Array([1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0]),
  right2: new Float32Array([1.0,0.0,0.0, 1.0,1.0,1.0, 1.0,0.0,1.0]),
  left1:  new Float32Array([0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,1.0]),
  left2:  new Float32Array([0.0,0.0,0.0, 0.0,1.0,1.0, 0.0,1.0,0.0]),
  bottom1:new Float32Array([0.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0]),
  bottom2:new Float32Array([0.0,0.0,0.0, 1.0,0.0,0.0, 1.0,0.0,1.0]),
  back1:  new Float32Array([0.0,0.0,1.0, 1.0,0.0,1.0, 1.0,1.0,1.0]),
  back2:  new Float32Array([0.0,0.0,1.0, 1.0,1.0,1.0, 0.0,1.0,1.0])
};