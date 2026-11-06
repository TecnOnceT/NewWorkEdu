document.addEventListener("DOMContentLoaded", function () {
    createGeometricShapes();

    const currentUser = localStorage.getItem("currentUser");
    const userDisplay = document.getElementById("user-display");
    
    if (currentUser && userDisplay) {
        userDisplay.textContent = currentUser;
    }

    updatePreview();

    const htmlCode = document.getElementById("html-code");
    const cssCode = document.getElementById("css-code");

    if (htmlCode && cssCode) {
        htmlCode.addEventListener("input", updatePreview);
        cssCode.addEventListener("input", updatePreview);
    }
});

function createGeometricShapes() {
    let container = document.getElementById("bgShapes");
    if (!container) return;

    const shapeTypes = ["square", "circle", "triangle", "diamond"];
    const totalShapes = 20; // Düşəcək obyekt sayı

    for (let i = 0; i < totalShapes; i++) {
        const shape = document.createElement("div");
        const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        shape.classList.add("shape", randomType);

        const size = Math.floor(Math.random() * 40) + 20;
        if (randomType !== "triangle") {
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
        }

        shape.style.left = `${Math.random() * 100}%`;
        const duration = Math.random() * 12 + 6;
        shape.style.animationDuration = `${duration}s`;
        const delay = Math.random() * 10;
        shape.style.animationDelay = `${delay}s`;

        container.appendChild(shape);
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

function openFullscreen(iframeId) {
    const iframe = document.getElementById(iframeId);
    if (!iframe) return;

    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) { 
        iframe.msRequestFullscreen();
    }
}

function updatePreview() {
    const htmlCode = document.getElementById("html-code");
    const cssCode = document.getElementById("css-code");
    const previewFrame = document.getElementById("live-preview");

    if (!htmlCode || !cssCode || !previewFrame) return;

    const htmlValue = htmlCode.value;
    const cssValue = cssCode.value;

    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
    previewDoc.open();
    previewDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>${cssValue}</style>
        </head>
        <body>
            ${htmlValue}
        </body>
        </html>
    `);
    previewDoc.close();
}
