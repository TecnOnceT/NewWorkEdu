document.addEventListener("DOMContentLoaded", function () {
    const currentUser = localStorage.getItem("currentUser");
    const userDisplay = document.getElementById("user-display");
    
    if (currentUser && userDisplay) {
        userDisplay.textContent = currentUser;
    }

    createGeometricShapes();

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
    
    if (!container) {
        container = document.createElement("div");
        container.id = "bgShapes";
        container.className = "bg-shapes";
        document.body.prepend(container);
    }

    const shapeTypes = ["square", "circle", "triangle", "diamond"];
    const totalShapes = 25; 

    for (let i = 0; i < totalShapes; i++) {
        const shape = document.createElement("div");
        const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        shape.classList.add("shape", randomType);

        // Rastgele boyut (20px - 60px)
        const size = Math.floor(Math.random() * 40) + 20;
        if (randomType !== "triangle") {
            shape.style.width = `${size}px`;
            shape.style.height = `${size}px`;
        }

        // Rastgele yatay konum (%0 - %100)
        shape.style.left = `${Math.random() * 100}%`;

        // Rastgele düşme süresi (6s - 18s)
        const duration = Math.random() * 12 + 6;
        shape.style.animationDuration = `${duration}s`;

        // Rastgele başlama gecikmesi (0s - 10s)
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

    const html = htmlCode.value;
    const css = `<style>${cssCode.value}</style>`;
    const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;

    previewDoc.open();
    previewDoc.write(html + css);
    previewDoc.close();
}
