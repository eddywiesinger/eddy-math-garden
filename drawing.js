const BACKGROUND_COLOR = "#000000";
const LINE_COLOR = "#FFFFFF";
const LINE_WIDTH = 15;

var currentX = 0;
var currentY = 0;
var previousX = 0;
var previousY = 0;

var canvas;
var context;

var isPainting = false;

function prepareCanvas() {
  // console.log("Preparing Canvas");
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  context.strokeStyle = LINE_COLOR;
  context.lineWidth = LINE_WIDTH;
  context.lineJoin = "round";

  document.addEventListener("mousedown", function (event) {
    // console.log("Mouse Down");
    isPainting = true;
    currentX = event.clientX - canvas.offsetLeft;
    currentY = event.clientY - canvas.offsetTop;
  });

  document.addEventListener("mouseup", function (event) {
    // console.log("Mouse Up");
    isPainting = false;
  });

  canvas.addEventListener("mouseleave", function (event) {
    isPainting = false;
  });

  // Touch Events
  canvas.addEventListener("touchstart", function (event) {
    // console.log("Touch Start");
    isPainting = true;
    currentX = event.touches[0].clientX - canvas.offsetLeft;
    currentY = event.touches[0].clientY - canvas.offsetTop;
  });

  canvas.addEventListener("touchend", function (event) {
    // console.log("Touch End");
    isPainting = false;
  });

  canvas.addEventListener("touchcancel", function (event) {
    isPainting = false;
  });

  document.addEventListener("mousemove", function (event) {
    previousX = currentX;
    previousY = currentY;

    currentX = event.clientX - canvas.offsetLeft;
    currentY = event.clientY - canvas.offsetTop;

    if (!isPainting) return;

    draw();
  });

  document.addEventListener("touchmove", function (event) {
    previousX = currentX;
    previousY = currentY;

    currentX = event.touches[0].clientX - canvas.offsetLeft;
    currentY = event.touches[0].clientY - canvas.offsetTop;

    if (!isPainting) return;

    draw();
  });
}

function draw() {
  context.beginPath();
  context.moveTo(previousX, previousY);
  context.lineTo(currentX, currentY);
  context.closePath();
  context.stroke();
}

function clearCanvas() {
  currentX = 0;
  currentY = 0;
  previousX = 0;
  previousY = 0;

  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}
