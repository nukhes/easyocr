const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
const langSelect = document.getElementById('lang');
const previewBox = document.getElementById('previewBox');

// Show/hide preview and output box
function setPreviewVisible(visible) {
  previewBox.style.display = visible ? 'flex' : 'none';
}
function setOutputVisible(visible) {
  const outputBox = document.getElementById('outputBox');
  if (outputBox) outputBox.style.display = visible ? 'block' : 'none';
}

// Reset preview images
function resetPreview() {
  previewBox.innerHTML = '';
  setPreviewVisible(false);
}

// Show previews for all images
function showPreviews(files) {
  resetPreview();
  if (!files.length) return;
  setPreviewVisible(true);
  files.forEach(file => {
    const img = document.createElement('img');
    img.className = 'preview-img';
    img.alt = '';
    img.style.margin = '4px';
    img.src = URL.createObjectURL(file);
    previewBox.appendChild(img);
  });
}

// Convert file to DataURL
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Recognize multiple images and concatenate results
async function recognizeImages(files, lang) {
  if (!files.length) {
    output.value = 'No images selected.';
    setOutputVisible(true);
    return;
  }
  output.value = `Recognizing ${files.length} image${files.length > 1 ? 's' : ''}...\n`;
  setOutputVisible(true);

  let results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    output.value += `Processing image ${i + 1} of ${files.length}...\n`;
    try {
      const image = await fileToDataURL(file);
      const { data: { text } } = await Tesseract.recognize(image, lang);
      results.push(text.trim() || '[No text recognized]');
      output.value += `Done image ${i + 1}\n`;
    } catch (err) {
      results.push('[Error processing image]');
      output.value += `Error processing image ${i + 1}: ${err.message}\n`;
    }
  }
  output.value = results.join('\n\n---\n\n');
  setOutputVisible(true);
}

// Handle drop event for multiple images
dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', async e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) {
    output.value = 'No image files dropped.';
    setOutputVisible(true);
    return;
  }
  showPreviews(files);
  await recognizeImages(files, langSelect.value);
});

dropzone.addEventListener('click', () => fileInput.click());

// Ensure file input allows multiple files
fileInput.setAttribute('multiple', 'multiple');

fileInput.addEventListener('change', async e => {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) {
    output.value = 'No image files selected.';
    setOutputVisible(true);
    return;
  }
  showPreviews(files);
  await recognizeImages(files, langSelect.value);
});

// Handle paste event for multiple images
document.addEventListener('paste', async e => {
  const items = Array.from(e.clipboardData.items);
  const files = items
    .filter(item => item.type.startsWith('image/'))
    .map(item => item.getAsFile())
    .filter(Boolean);
  if (!files.length) {
    output.value = 'No image found in clipboard.';
    setOutputVisible(true);
    return;
  }
  showPreviews(files);
  await recognizeImages(files, langSelect.value);
});

// Hide preview/output on