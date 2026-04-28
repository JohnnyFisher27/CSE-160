class TriangularPrism {
  constructor() {
    this.type = 'prism';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D(PRISM_FACES.front);

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D(PRISM_FACES.back);

    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D(PRISM_FACES.bottom1);
    drawTriangle3D(PRISM_FACES.bottom2);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D(PRISM_FACES.left1);
    drawTriangle3D(PRISM_FACES.left2);

    gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);
    drawTriangle3D(PRISM_FACES.hypo1);
    drawTriangle3D(PRISM_FACES.hypo2);
  }
}

const PRISM_FACES = {
  front:   new Float32Array([0.0,0.0,0.0,  1.0,0.0,0.0,  0.0,1.0,0.0]),
  back:    new Float32Array([0.0,0.0,1.0,  1.0,0.0,1.0,  0.0,1.0,1.0]),
  bottom1: new Float32Array([0.0,0.0,0.0,  1.0,0.0,1.0,  0.0,0.0,1.0]),
  bottom2: new Float32Array([0.0,0.0,0.0,  1.0,0.0,0.0,  1.0,0.0,1.0]),
  left1:   new Float32Array([0.0,0.0,0.0,  0.0,1.0,1.0,  0.0,0.0,1.0]),
  left2:   new Float32Array([0.0,0.0,0.0,  0.0,1.0,0.0,  0.0,1.0,1.0]),
  hypo1:   new Float32Array([1.0,0.0,0.0,  0.0,1.0,0.0,  0.0,1.0,1.0]),
  hypo2:   new Float32Array([1.0,0.0,0.0,  0.0,1.0,1.0,  1.0,0.0,1.0])
};