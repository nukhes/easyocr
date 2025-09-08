const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const previewBox = document.getElementById("previewBox");
const output = document.getElementById("output");
const outputBox = document.getElementById("outputBox");
const langSelect = document.getElementById("lang");

function processImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
    preview.src = reader.result;
    const lang = langSelect.value;
    Tesseract.recognize(reader.result, lang)
        .then(({ data: { text } }) => {
        outputBox.style.display = "block"
        previewBox.style.display = "block"
        output.value = text;
        })
        .catch(err => {
        console.error(err);
        alert("OCR error.");
        });
    };
    reader.readAsDataURL(file);
}

// Drag and drop
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", e => {
    e.preventDefault(); dropzone.style.borderColor = "#1a8a1aff";
});
dropzone.addEventListener("dragleave", () => dropzone.style.borderColor = "#888");
dropzone.addEventListener("drop", e => {
    e.preventDefault(); dropzone.style.borderColor = "#888";
    processImage(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", e => processImage(e.target.files[0]));

// Clipboard paste
document.addEventListener("paste", e => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
        processImage(items[i].getAsFile());
    }
    }
});