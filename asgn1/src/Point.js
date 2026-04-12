class Point {
  constructor() {
    this.type = 'point';
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
    var hs = d / 2.0; 

    drawTriangle([
      -hs,  hs, 
      -hs, -hs, 
       hs,  hs  
    ], rgba, opacity);

    drawTriangle([
      -hs, -hs, 
       hs, -hs, 
       hs,  hs  
    ], rgba, opacity);
  }
}
