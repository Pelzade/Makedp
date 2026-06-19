// script.js
(function() {
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

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function isInsideDP(cx, cy) {
    if (!dpImage) return false;
    const w = dpImage.width * dpScale;
    const h = dpImage.height * dpScale;
    return (cx >= dpX && cx <= dpX + w && cy >= dpY && cy <= dpY + h);
  }

  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (dpImage) {
      const w = dpImage.width * dpScale;
      const h = dpImage.height * dpScale;
      ctx.drawImage(dpImage, dpX, dpY, w, h);
    }

    if (overlayImage) {
      ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
    }
  }

  function startDrag(e) {
    e.preventDefault();
    if (!dpImage) return;
    const { x, y } = getCanvasCoords(e);
    if (isInsideDP(x, y)) {
      isDragging = true;
      dragOffsetX = x - dpX;
      dragOffsetY = y - dpY;
    }
  }

  function moveDrag(e) {
    e.preventDefault();
    if (!isDragging) return;
    const { x, y } = getCanvasCoords(e);
    dpX = x - dragOffsetX;
    dpY = y - dragOffsetY;
    drawCanvas();
  }

  function endDrag(e) {
    e.preventDefault();
    isDragging = false;
  }

  // Mouse events
  canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', (e) => {
    if (isDragging) moveDrag(e);
  });
  window.addEventListener('mouseup', endDrag);

  // Touch events (mobile)
  canvas.addEventListener('touchstart', startDrag, { passive: false });
  canvas.addEventListener('touchmove', moveDrag, { passive: false });
  canvas.addEventListener('touchend', endDrag, { passive: false });
  canvas.addEventListener('touchcancel', endDrag, { passive: false });

  // Scale slider
  scaleSlider.addEventListener('input', () => {
    dpScale = parseFloat(scaleSlider.value);
    drawCanvas();
  });

  // Upload DP
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

  // Upload overlay (PNG)
  overlayInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'image/png') {
      alert('Please upload a valid PNG frame.');
      overlayInput.value = '';
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

  // Download
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'profile-picture.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    overlayImage = null;
    dpImage = null;
    dpScale = 1;
    dpX = 0;
    dpY = 0;
    scaleSlider.value = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('overlayInput').value = '';
    document.getElementById('dpInput').value = '';
    isDragging = false;
  });

  // Initial empty canvas
  drawCanvas();

  // Prevent context menu on canvas
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
})();
