const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');


function drawOverlayLines() {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); // Clear previous lines
  
    const numLines = 13;
    const lineSpacing = overlayCanvas.height / (numLines + 1);
    const text = ["C","B","A#" ,"A","G#","G","F#","F","E","D#","D","C#","C"];
    overlayCtx.strokeStyle = 'rgba(194, 194, 194, 0.603)'; // Adjust opacity for transparency
    for (let i = 0; i < numLines; i++) {
      const y = i * lineSpacing + lineSpacing;
      overlayCtx.beginPath();
      overlayCtx.moveTo(0, y);
      overlayCtx.lineTo(overlayCanvas.width, y);
      overlayCtx.stroke();

      // Set the font style
      overlayCtx.font = '16px Courier New'; // Adjust the font size and family as needed
      overlayCtx.fillStyle = 'black'; // Set the color of the text

      // Define the text for each line
      const linetext = `${text[i]}`;
      

      // Draw the text at the leftmost of each line
      overlayCtx.fillStyle = 'white';
      overlayCtx.fillText(linetext, 10, y+5); // 10 is the x-coordinate, adjust as needed
    }
}

drawOverlayLines();