class PizzaBox {
  constructor() {
    this.type = 'pizzaBox';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    drawTriangle3D(PIZZA_BOX_FACES.front1);
    drawTriangle3D(PIZZA_BOX_FACES.front2);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D(PIZZA_BOX_FACES.top);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D(PIZZA_BOX_FACES.bottom);

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D(PIZZA_BOX_FACES.left1);
    drawTriangle3D(PIZZA_BOX_FACES.left2);

    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D(PIZZA_BOX_FACES.right1);
    drawTriangle3D(PIZZA_BOX_FACES.right2);
  }
}

const PIZZA_BOX_FACES = {
  front1: new Float32Array([1.0, 0.0, -0.5,   1.0, 0.0, 0.5,   1.0, 0.1, 0.5]),
  front2: new Float32Array([1.0, 0.0, -0.5,   1.0, 0.1, 0.5,   1.0, 0.1, -0.5]),
  top:    new Float32Array([0.0, 0.1, 0.0,    1.0, 0.1, 0.5,   1.0, 0.1, -0.5]),
  bottom: new Float32Array([0.0, 0.0, 0.0,    1.0, 0.0, -0.5,  1.0, 0.0, 0.5]),
  left1:  new Float32Array([0.0, 0.0, 0.0,    1.0, 0.0, 0.5,   1.0, 0.1, 0.5]),
  left2:  new Float32Array([0.0, 0.0, 0.0,    1.0, 0.1, 0.5,   0.0, 0.1, 0.0]),
  right1: new Float32Array([1.0, 0.0, -0.5,   0.0, 0.0, 0.0,   0.0, 0.1, 0.0]),
  right2: new Float32Array([1.0, 0.0, -0.5,   0.0, 0.1, 0.0,   1.0, 0.1, -0.5])
};