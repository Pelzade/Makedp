const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const overlayInput = document.getElementById('overlayInput');
const dpInput = document.getElementById('dpInput');
const scaleSlider = document.getElementById('scaleSlider');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

let overlayImage = null;
let dpImage = null;

let dpX = 0, dpY = 0;
let dpScale = 1;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

canvas.addEventListener('mousedown', (e) => {
  if (dpImage) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const imgWidth = dpImage.width * dpScale;
    const imgHeight = dpImage.height * dpScale;

    if (mouseX >= dpX && mouseX <= dpX + imgWidth &&
        mouseY >= dpY && mouseY <= dpY + imgHeight) {
      isDragging = true;
      dragOffsetX = mouseX - dpX;
      dragOffsetY = mouseY - dpY;
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    dpX = e.clientX - rect.left - dragOffsetX;
    dpY = e.clientY - rect.top - dragOffsetY;
    drawCanvas();
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
});

scaleSlider.addEventListener('input', () => {
  dpScale = parseFloat(scaleSlider.value);
  drawCanvas();
});

dpInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    dpImage = new Image();
    dpImage.onload = () => {
      dpX = (canvas.width - dpImage.width) / 2;
      dpY = (canvas.height - dpImage.height) / 2;
      drawCanvas();
    };
    dpImage.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

overlayInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file || file.type !== 'image/png') {
    alert("Please upload a valid PNG frame.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    overlayImage = new Image();
    overlayImage.onload = drawCanvas;
    overlayImage.src = evt.target.result;
  };
  reader.readAsDataURL(file);
});

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (dpImage) {
    const width = dpImage.width * dpScale;
    const height = dpImage.height * dpScale;
    ctx.drawImage(dpImage, dpX, dpY, width, height);
  }

  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
  }
}

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'profile-picture.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

resetBtn.addEventListener('click', () => {
  overlayImage = null;
  dpImage = null;
  dpScale = 1;
  dpX = 0;
  dpY = 0;
  scaleSlider.value = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clear file input values to allow re-upload of same files
  document.getElementById('overlayInput').value = '';
  document.getElementById('dpInput').value = '';
});