class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 10; 
    this.geometry = []; 
    
    this._generateGeometry();
  }

  _generateGeometry() {
    this.geometry = []; 
    var d = Math.PI / this.segments;
    var dd = (Math.PI * 2) / this.segments;

    for (var t = 0; t < Math.PI; t += d) {
      var colorMult = 1.0 - (t / Math.PI) * 0.5;
      for (var r = 0; r < (Math.PI * 2); r += dd) {
        
        var p1 = [Math.sin(t) * Math.cos(r) * 0.5, Math.cos(t) * 0.5, Math.sin(t) * Math.sin(r) * 0.5];
        var p2 = [Math.sin(t + d) * Math.cos(r) * 0.5, Math.cos(t + d) * 0.5, Math.sin(t + d) * Math.sin(r) * 0.5];
        var p3 = [Math.sin(t) * Math.cos(r + dd) * 0.5, Math.cos(t) * 0.5, Math.sin(t) * Math.sin(r + dd) * 0.5];
        var p4 = [Math.sin(t + d) * Math.cos(r + dd) * 0.5, Math.cos(t + d) * 0.5, Math.sin(t + d) * Math.sin(r + dd) * 0.5];

        this.geometry.push({
          colorMult: colorMult,
          tri1: new Float32Array([p1[0], p1[1], p1[2],  p2[0], p2[1], p2[2],  p3[0], p3[1], p3[2]]),
          tri2: new Float32Array([p2[0], p2[1], p2[2],  p4[0], p4[1], p4[2],  p3[0], p3[1], p3[2]])
        });
      }
    }
  }

  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    for (var i = 0; i < this.geometry.length; i++) {
      var patch = this.geometry[i];
      gl.uniform4f(u_FragColor, rgba[0] * patch.colorMult, rgba[1] * patch.colorMult, rgba[2] * patch.colorMult, rgba[3]);

      drawTriangle3D(patch.tri1);
      drawTriangle3D(patch.tri2);
    }
  }
}