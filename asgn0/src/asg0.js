
var canvas = document.getElementById('example');  
var ctx = canvas.getContext('2d');

function main() {
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const v1 = new Vector3([2.25, 2.25, 0]);

  drawVector(v1, "red");
}

function drawVector(v, color) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(200 + v.elements[0] * 20, 200 - v.elements[1] * 20);
  ctx.stroke();
}

function handleDrawButton() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const v1x = parseFloat(document.getElementById('v1x').value);
  const v1y = parseFloat(document.getElementById('v1y').value);
  const v2x = parseFloat(document.getElementById('v2x').value);
  const v2y = parseFloat(document.getElementById('v2y').value);
  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);

  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const v1x = parseFloat(document.getElementById('v1x').value);
  const v1y = parseFloat(document.getElementById('v1y').value);
  const v2x = parseFloat(document.getElementById('v2x').value);
  const v2y = parseFloat(document.getElementById('v2y').value);
  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);
  const operation = document.getElementById('operation').value;
  const scalar = parseFloat(document.getElementById('scalar').value);

  drawVector(v1, "red");
  drawVector(v2, "blue");

  switch (operation) {
    case 'add':
      drawVector(v1.add(v2), "green");
      break;
    case 'sub':
      drawVector(v1.sub(v2), "green");
      break;
    case 'mul':
      drawVector(v1.mul(scalar), "green");
      drawVector(v2.mul(scalar), "green");
      break;
    case 'div':
      drawVector(v1.div(scalar), "green");
      drawVector(v2.div(scalar), "green");
      break;
    case 'mag':
      console.log('Magnitude v1:', v1.magnitude());
      console.log('Magnitude v2:', v2.magnitude());
      break;
    case 'norm':
      drawVector(v1.normalize(), "green");
      drawVector(v2.normalize(), "green");
      break;
    case 'ang': 
      console.log('Angle:', angleBetween(v1, v2));
      break;
    case 'area':
      console.log('Area of the triangle:', Vector3.cross(v1, v2).magnitude() / 2);
      break;
  }

}

function angleBetween(v1, v2) {
  const dotProduct = Vector3.dot(v1, v2);
  const magnitudeV1 = v1.magnitude();
  const magnitudeV2 = v2.magnitude();
  return (Math.acos(dotProduct / (magnitudeV1 * magnitudeV2))) * (180 / Math.PI); 
}

document.getElementById('drawButton').addEventListener('click', handleDrawButton);
document.getElementById('drawButton2').addEventListener('click', handleDrawOperationEvent);

main();