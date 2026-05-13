class SnowSystem {
  constructor(particleCount = 1500) {
    this.count = particleCount;
    this.positions = new Float32Array(this.count * 3);
    this.speeds = new Float32Array(this.count);
    
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = (Math.random() - 0.5) * 40;
      this.positions[i * 3 + 1] = Math.random() * 20;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      this.speeds[i] = 0.05 + Math.random() * 0.05;
    }
    
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
  }

  render() {
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3 + 1] -= this.speeds[i]; 
      
      if (this.positions[i * 3 + 1] < -1.0) {
        this.positions[i * 3 + 1] = 20.0;
      }
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    
    gl.disableVertexAttribArray(a_UV);
    gl.disableVertexAttribArray(a_Brightness); 
    
    gl.vertexAttrib1f(a_Brightness, 1.0); 

    gl.uniform1i(u_whichTexture, 3); 
    gl.uniform1f(u_TexScale, 1.0);
    
    let identity = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);

    gl.drawArrays(gl.POINTS, 0, this.count);
    
    gl.enableVertexAttribArray(a_UV);
    gl.enableVertexAttribArray(a_Brightness); 
  }
}