class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.normalMatrix = new Matrix4();
    this.textureNum = -1;
    this.textureScale = 1.0;
  }

  render() {
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform1f(u_TexScale, this.textureScale);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
    
    if (g_sharedCubeVertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeVertexBuffer);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
    }

    if (g_sharedCubeUVBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeUVBuffer);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_UV);
    }

    if (g_sharedCubeNormalBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeNormalBuffer);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Normal);
    }
    
    gl.drawArrays(gl.TRIANGLES, 0, 36); 
  }
}