(function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Override CSS touch-action to allow scrolling on canvas
  canvas.style.touchAction = 'auto';

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

  // ---- Drag start ----
  function startDrag(e) {
    if (!dpImage) return;
    const { x, y } = getCanvasCoords(e);
    if (isInsideDP(x, y)) {
      isDragging = true;
      dragOffsetX = x - dpX;
      dragOffsetY = y - dpY;
      e.preventDefault(); // only prevent default when actually dragging
    }
    // If not inside, do nothing – allow scrolling
  }

  function moveDrag(e) {
    if (!isDragging) return;
    e.preventDefault(); // prevent scrolling while dragging
    const { x, y } = getCanvasCoords(e);
    dpX = x - dragOffsetX;
    dpY = y - dragOffsetY;
    drawCanvas();
  }

  function endDrag(e) {
    if (isDragging) {
      isDragging = false;
      e.preventDefault();
    }
  }

  // ---- Mouse events ----
  canvas.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', (e) => {
    if (isDragging) moveDrag(e);
  });
  window.addEventListener('mouseup', endDrag);

  // ---- Touch events (allow scrolling unless dragging) ----
  canvas.addEventListener('touchstart', startDrag, { passive: false });
  canvas.addEventListener('touchmove', moveDrag, { passive: false });
  canvas.addEventListener('touchend', endDrag, { passive: false });
  canvas.addEventListener('touchcancel', endDrag, { passive: false });

  // ---- Scale slider (centered scaling) ----
  scaleSlider.addEventListener('input', () => {
    if (!dpImage) return;
    const newScale = parseFloat(scaleSlider.value);
    // Compute current center of the image
    const centerX = dpX + (dpImage.width * dpScale) / 2;
    const centerY = dpY + (dpImage.height * dpScale) / 2;
    // Update scale
    dpScale = newScale;
    // Reposition so the center stays the same
    dpX = centerX - (dpImage.width * dpScale) / 2;
    dpY = centerY - (dpImage.height * dpScale) / 2;
    drawCanvas();
  });

  // ---- Upload DP ----
  dpInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      dpImage = new Image();
      dpImage.onload = () => {
        dpX = (canvas.width - dpImage.width) / 2;
        dpY = (canvas.height - dpImage.height) / 2;
        dpScale = 1;
        scaleSlider.value = 1;
        drawCanvas();
      };
      dpImage.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ---- Upload overlay (PNG) ----
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

  // ---- Download ----
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'profile-picture.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // ---- Reset ----
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
    drawCanvas();
  });

  // ---- Initial empty canvas ----
  drawCanvas();

  // Prevent context menu on canvas
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
})();
