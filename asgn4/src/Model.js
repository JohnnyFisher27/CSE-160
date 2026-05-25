class OBJModel {
  constructor(filepath) {
    this.type = 'obj_model';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2; 
    this.vertices = [];
    this.uvs = [];
    this.normals = [];

    this.loaded = false;
    this.loadOBJ(filepath);
  }

  async loadOBJ(filepath) {
    const response = await fetch(filepath);
    const text = await response.text();

    const rawPositions = [];
    const rawUVs = [];
    const rawNormals = [];

    const lines = text.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('#') || line === '') continue; 

      const parts = line.split(/\s+/);
      const type = parts[0];

      if (type === 'v') {
        rawPositions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
      } else if (type === 'vt') {
        rawUVs.push(parseFloat(parts[1]), parseFloat(parts[2]));
      } else if (type === 'vn') {
        rawNormals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
      } else if (type === 'f') {
        for (let i = 1; i <= 3; i++) {
          const indices = parts[i].split('/');

          const vIdx = (parseInt(indices[0]) - 1) * 3;
          this.vertices.push(rawPositions[vIdx], rawPositions[vIdx + 1], rawPositions[vIdx + 2]);

          if (indices[1]) {
            const vtIdx = (parseInt(indices[1]) - 1) * 2;
            this.uvs.push(rawUVs[vtIdx], rawUVs[vtIdx + 1]);
          } else {
            this.uvs.push(0.0, 0.0);
          }

          if (indices[2]) {
            const vnIdx = (parseInt(indices[2]) - 1) * 3;
            this.normals.push(rawNormals[vnIdx], rawNormals[vnIdx + 1], rawNormals[vnIdx + 2]);
          } else {
            this.normals.push(0.0, 1.0, 0.0); 
          }
        }
      }
    }

    this.vertices32 = new Float32Array(this.vertices);
    this.uvs32 = new Float32Array(this.uvs);
    this.normals32 = new Float32Array(this.normals);
    this.loaded = true;
    
    if (typeof renderAllShapes === 'function') {
      renderAllShapes();
    }
  }

  render() {
    if (!this.loaded) return; 
    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    gl.disableVertexAttribArray(a_Brightness);
    gl.vertexAttrib1f(a_Brightness, 1.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices32, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.uvs32, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals32, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.drawArrays(gl.TRIANGLES, 0, this.vertices32.length / 3);
    
    if (g_sharedCubeBrightnessBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeBrightnessBuffer);
      gl.vertexAttribPointer(a_Brightness, 1, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Brightness);
    }
    
    if (g_sharedCubeVertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeVertexBuffer);
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    }

    if (g_sharedCubeUVBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeUVBuffer);
      gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    }

    if (g_sharedCubeNormalBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, g_sharedCubeNormalBuffer);
      gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    }
  }
}