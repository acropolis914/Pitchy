const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
let colorIndex = 0;
const colorDictionary = {};
var x = canvas.width - 5; // Rightmost position of the rectangle
var y = 0; // Top of the canvas
var width = 5; // Width of the rectangle
var height = canvas.height; // Height of the rectangle, same as canvas height
var rectangles = []; // Array to store rectangle objects

const FRAMES_PER_SECOND = 20; // Desired frame rate
const FRAME_MIN_TIME = (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;

let lastTimestamp = performance.now();
let deltaTime = 0;

var scrollSpeed = 5;

const startY = 0;
const endY = 1;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();


analyser.fftSize = 1024; // You can adjust this value
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

document.getElementById('playButton').addEventListener('click', function() {
  if (audioContext.state === 'suspended') {
      audioContext.resume();
  }
  const audio = new Audio('./audio.mp3');
  const source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  audio.play();
});

function Rectangle(x, y, width, height, color) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = color;
}

// Define the number of steps (can be adjusted)
const steps = 10;
// Loop through each step to create color values
for (let i = 0; i <= steps; i++) {
  // Calculate the percentage of black for this step (0% to 90%)
  const blackPercentage = Math.round(i * (100 / steps));

  // Create a color string in HSL format (Hue, Saturation, Lightness)
  const color = `hsl(0, 0%, ${100 - blackPercentage}%)`;

  // Add color to the dictionary with a descriptive key (e.g., "white", "lightGray", etc.)
  const key = blackPercentage === 0 ? "white" : `dark${blackPercentage}%`;
  colorDictionary[key] = color;
}

function drawRectangle(rectangle) {
  ctx.fillStyle = rectangle.color;
  ctx.fillrect()
  // ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
}

function update() {
    deltaTime = (performance.now() - lastTimestamp) / 1000; // Calculate delta time in seconds
    lastTimestamp = performance.now();

    analyser.getByteFrequencyData(dataArray); //what is this doing? 
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    //Apparently dataArray is an array of 8-bit unsigned integers with values between 0 and 255
    //at the time the audio is playing
    console.log(dataArray)

    const colorStops = []
    for (let i = 0; i < bufferLength; i++) {
      var position = 1/bufferLength * i;
      const lightness = 255 - dataArray[i];
      const color = `hsl(0, 0%, ${lightness}%)`;
      colorStops[position] = color
    }
      console.log(colorStops.length)
      const gradient = ctx.createLinearGradient(0, startY * canvas.height, 0, endY * canvas.height);
      colorStops.forEach(stop => gradient.addColorStop(stop.position, stop.color));
      var rectangle = new Rectangle(canvas.width - 10, 0, 10, canvas.height, gradient);
      rectangles.push(rectangle);


    for (var i = 0; i < rectangles.length; i++) {
      var rectangle = rectangles[i];
      rectangle.x -= scrollSpeed * deltaTime + width; // Move the rectangle 10 pixels to the left
      drawRectangle(rectangle);
    }
    if (rectangles.length > 50) {
      // Remove the oldest rectangle(s) from the start of the array
      rectangles.splice(0, rectangles.length - canvas.width / width);
    }

    // // Draw the frequency data
    // for (let i = 0; i < bufferLength; i++) {
    //     const barHeight = dataArray[i];
    //     const barWidth = canvas.width / bufferLength;
    //     const barX = i * barWidth;
    //     const barY = canvas.height - barHeight;

    //     ctx.fillStyle = `hsl(${i * (360 / bufferLength)}, 100%, 50%)`;
    //     ctx.fillRect(barX, barY, barWidth, barHeight);
    // }

    requestAnimationFrame(update);
}

update();


// function update() {
//   deltaTime = (performance.now() - lastTimestamp) / 1000; // Calculate delta time in seconds
//   lastTimestamp = performance.now()

//   const colorKey = Object.keys(colorDictionary)[colorIndex];
//   const color = colorDictionary[colorKey];
//   var rectangle = new Rectangle(canvas.width - 10, 0, 10, canvas.height, color);
//   rectangles.push(rectangle);

//   if (colorIndex >= Object.keys(colorDictionary).length) {
//     colorIndex = 0;
//   } else {
//     colorIndex++;
//   }
//   ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

//   // Iterate over rectangles and redraw them
  // for (var i = 0; i < rectangles.length; i++) {
  //   var rectangle = rectangles[i];
  //   rectangle.x -= scrollSpeed * deltaTime + width; // Move the rectangle 10 pixels to the left
  //   drawRectangle(rectangle);
  // }
  // if (rectangles.length > 50) {
  //   // Remove the oldest rectangle(s) from the start of the array
  //   rectangles.splice(0, rectangles.length - canvas.width / width);
  // }
//   console.log(rectangles.length);
//   requestAnimationFrame(update)
// }