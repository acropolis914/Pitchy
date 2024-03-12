import "./js-colormaps.js";
import { evaluate_cmap } from "./js-colormaps.js";
import 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js'

const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const audioInputSelect = document.querySelector('select#audioSource');
const selectors = [audioInputSelect];

var x = canvas.width - 4; // Rightmost position of the rectangle
var y = 0; // Top of the canvas
var width = 4; // Width of the rectangle
var height = canvas.height; // Height of the rectangle, same as canvas height

let lastTimestamp = performance.now();
let deltaTime = 0;

var scrollSpeed = 5;

const startY = 0;
const endY = 1;


const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 4096; // You can adjust this value
analyser.smoothingTimeConstant = 0.95; //this smooths the frequency data by averaging the data out over time
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function Rectangle(x, y, width, height, gradient) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.gradient = gradient;
}


// Define a global variable for the audio element
let audio = null;

// Function to handle play/pause
function toggleAudio() {
 if (!audio) {
    // If the audio element is not yet created, create it and start playing
    audio = new Audio('./audio.mp3');
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    audio.play();
 } else {
    // If the audio element exists, toggle between play and pause
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
 }
}

// Modify the button's click event to call the toggleAudio function
document.getElementById('playButton').addEventListener('click', function() {
 if (window.stream) {
    stream.getAudioTracks()[0].stop();
 }
 if (audioContext.state === 'suspended') {
    audioContext.resume();
 }
 toggleAudio();
});



function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function gotStream(stream) {
  window.stream = stream;
  const source = audioContext.createMediaStreamSource(stream)
  source.connect(analyser);
  analyser.connect(audioContext.destination)}

function start() {
	// Second call to getUserMedia() with changed device may cause error, so we need to release stream before changing device
  if (window.stream) {
  	stream.getAudioTracks()[0].stop();
  }
  if (audio) {toggleAudio()}

  const audioSource = audioInputSelect.value;
  
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined}
  };
  
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

audioInputSelect.onchange = start;

function bin2freq(index) {
  // The sample rate is typically 44100 Hz for audio contexts
  const sampleRate = audioContext.sampleRate;
 
  // Calculate the frequency for the given bin index
  // The formula is: Frequency = Index * (Sample Rate / 2) / FFT Size
  const frequency = index * (sampleRate / 2) / analyser.fftSize;
  
  return frequency;
 }

 function freq2bin(frequency) {
  // The sample rate is typically 44100 Hz for audio contexts
  const sampleRate = audioContext.sampleRate;
  const index = frequency / (sampleRate / 2) * analyser.fftSize;  
  return index;
 }

function drawRectangle(rectangle) {
  ctx.fillStyle = rectangle.gradient;
  ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
}

// function update() {
//     deltaTime = (performance.now() - lastTimestamp) / 1000; // Calculate delta time in seconds
//     lastTimestamp = performance.now();

//     analyser.getByteFrequencyData(dataArray); //what is this doing? 
//     ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//     //Apparently dataArray is an array of 8-bit unsigned integers with values between 0 and 255
//     //at the time the audio is playing
//     console.log(dataArray)

//     const colorStops = []
//     for (let i = 0; i < bufferLength; i++) {
//       var position = 1/bufferLength * i;
//       const lightness = 255 - dataArray[i];
//       const color = `hsl(0, 0%, ${lightness}%)`;
//       colorStops[position] = color
//     }
//       console.log(colorStops.length)
//       const gradient = ctx.createLinearGradient(0, startY * canvas.height, 0, endY * canvas.height);
//       colorStops.forEach(stop => gradient.addColorStop(stop.position, stop.color));
//       var rectangle = new Rectangle(canvas.width - 10, 0, 10, canvas.height, gradient);
//       rectangles.push(rectangle);


//     for (var i = 0; i < rectangles.length; i++) {
//       var rectangle = rectangles[i];
//       rectangle.x -= scrollSpeed * deltaTime + width; // Move the rectangle 10 pixels to the left
//       drawRectangle(rectangle);
//     }
//     if (rectangles.length > 50) {
//       // Remove the oldest rectangle(s) from the start of the array
//       rectangles.splice(0, rectangles.length - canvas.width / width);
//     }

//     // // Draw the frequency data
//     // for (let i = 0; i < bufferLength; i++) {
//     //     const barHeight = dataArray[i];
//     //     const barWidth = canvas.width / bufferLength;
//     //     const barX = i * barWidth;
//     //     const barY = canvas.height - barHeight;

//     //     ctx.fillStyle = `hsl(${i * (360 / bufferLength)}, 100%, 50%)`;
//     //     ctx.fillRect(barX, barY, barWidth, barHeight);
//     // }

//     requestAnimationFrame(update);
// }

async function generateColorStops(analyser) {
  return new Promise((resolve) => {

      const colorStops = []; 
      for (let i = 42; i < 94; i++) {
        let position;
        if (i === 0) {
           position = 0;
        } else if (i === 100) {
           position = 1;
        } else {
           position = i / (100 - 1);
        }
        var lightness = dataArray[i]/255 * 100;
        // const colormap = evaluate_cmap(position,'tab20c', false)
        const hue = i / 100 * 100 + 100;
        var alpha = 100;
        // const color = `rgba(${colormap[0]}, ${colormap[1]}, ${colormap[2]}, ${alpha}%)`
        const color = `hsla(${hue}, 75%, ${lightness}%, ${alpha}%)`;
        colorStops.push([position, color]);
      }
      resolve(colorStops);   
  });
}

var rectangles = []; // Array to store rectangle objects
async function drawRectangleWithGradient(ctx, analyser) {
  const colorStops = await generateColorStops(analyser);
const gradient = ctx.createLinearGradient( canvas.width -5, endY * canvas.height, canvas.width -5, startY * canvas.height);
  await colorStops.forEach(stop => {
    gradient.addColorStop(stop[0], stop[1]);
   });

  var rectangle = new Rectangle(canvas.width, 0, width, canvas.height, gradient);
  rectangles.push(rectangle);
}





async function main() {
  deltaTime = (performance.now() - lastTimestamp) / 1000; // Calculate delta time in seconds
  lastTimestamp = performance.now();

  analyser.getByteFrequencyData(dataArray);

  await drawRectangleWithGradient(ctx, analyser);
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  for (var i = 0; i < rectangles.length; i++) {
    var rectangle = rectangles[i];
    rectangle.x -= scrollSpeed * deltaTime + 2; // Move the rectangle 10 pixels to the left
    drawRectangle(rectangle);
  }
  if (rectangles.length > 400) {
    rectangles.splice(0, rectangles.length - 400);
  }
  setTimeout(() => {requestAnimationFrame(main)}, 10);
  // requestAnimationFrame(main);
  
}

navigator.mediaDevices.enumerateDevices()
.then(gotDevices);
main();

console.log(freq2bin(Tone.Frequency("B3").toFrequency()))
console.log(freq2bin(Tone.Frequency("C#5").toFrequency()))