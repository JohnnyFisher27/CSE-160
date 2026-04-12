class Circle {
  constructor(segments) {
    this.type = 'circle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.segments = segments;
    this.opacity = 100;
  }

  render() {
    
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    var opacity = this.opacity / 100.0;

    gl.uniform1f(u_CosB, 1.0);
    gl.uniform1f(u_SinB, 0.0); 
    gl.uniform2f(u_Translation, 0.0, 0.0);
    
    var d = this.size / 200.0;
    let angleStep = 360 / this.segments;

    for (var angle = 0; angle < 360; angle += angleStep) {
        let centerPt = [xy[0], xy[1]];
        let angle1 = angle;
        let angle2 = angle + angleStep;

        let vec1 = [d * Math.cos(angle1 * Math.PI / 180), d * Math.sin(angle1 * Math.PI / 180)];
        let vec2 = [d * Math.cos(angle2 * Math.PI / 180), d * Math.sin(angle2 * Math.PI / 180)];

        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

        drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]], rgba, opacity);
    }
  }
}
