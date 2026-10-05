document.addEventListener("DOMContentLoaded", function () {
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

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
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
