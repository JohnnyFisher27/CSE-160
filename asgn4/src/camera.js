class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 14]);
    this.at = new Vector3([0, 0, -1]);
    this.up = new Vector3([0, 1, 0]);

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.updateMatrices();
  }

  updateMatrices() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0], this.at.elements[1], this.at.elements[2],
      this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );

    this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
  }

  moveForward(speed = 0.2) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(speed);

    let nextX = this.eye.elements[0] + f.elements[0];
    let nextZ = this.eye.elements[2] + f.elements[2];

    if (!checkCollision(nextX, nextZ)) {
      this.eye.add(f);
      this.at.add(f);
      this.updateMatrices();
    }
  }

  moveBackwards(speed = 0.2) {
    let b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.normalize();
    b.mul(speed);

    let nextX = this.eye.elements[0] + b.elements[0];
    let nextZ = this.eye.elements[2] + b.elements[2];

    if (!checkCollision(nextX, nextZ)) {
      this.eye.add(b);
      this.at.add(b);
      this.updateMatrices();
    }
  }

  moveLeft(speed = 0.2) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let s = new Vector3();
    let up = this.up.elements;
    let fe = f.elements;
    s.elements[0] = up[1] * fe[2] - up[2] * fe[1];
    s.elements[1] = up[2] * fe[0] - up[0] * fe[2];
    s.elements[2] = up[0] * fe[1] - up[1] * fe[0];

    s.normalize();
    s.mul(speed);

    let nextX = this.eye.elements[0] + s.elements[0];
    let nextZ = this.eye.elements[2] + s.elements[2];

    if (!checkCollision(nextX, nextZ)) {
      this.eye.add(s);
      this.at.add(s);
      this.updateMatrices();
    }
  }

  moveRight(speed = 0.2) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let s = new Vector3();
    let up = this.up.elements;
    let fe = f.elements;
    s.elements[0] = fe[1] * up[2] - fe[2] * up[1];
    s.elements[1] = fe[2] * up[0] - fe[0] * up[2];
    s.elements[2] = fe[0] * up[1] - fe[1] * up[0];

    s.normalize();
    s.mul(speed);

    let nextX = this.eye.elements[0] + s.elements[0];
    let nextZ = this.eye.elements[2] + s.elements[2];

    if (!checkCollision(nextX, nextZ)) {
      this.eye.add(s);
      this.at.add(s);
      this.updateMatrices();
    }
  }

  panLeft(alpha = 5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

    let f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);
    this.updateMatrices();
  }

  panRight(alpha = 5) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

    let f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);
    this.updateMatrices();
  }

  panX(alpha) {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

    let f_prime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);
    this.updateMatrices();
  }
}