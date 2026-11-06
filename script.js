import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzfpUCfUJd4VNR_UfrR3BhQ8ZCV5jZsP8",
  authDomain: "neworkaccountprojet.firebaseapp.com",
  projectId: "neworkaccountprojet",
  storageBucket: "neworkaccountprojet.firebasestorage.app",
  messagingSenderId: "962982050109",
  appId: "1:962982050109:web:6886bb8c095a6f28a16d54",
  measurementId: "G-RKRB3JEJ4G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
    createFallingLogos();

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

    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const userInput = document.getElementById("username").value.trim();
            const passInput = document.getElementById("password").value.trim();
            const errorMsg = document.getElementById("error-msg");

            if (!userInput || !passInput) {
                if (errorMsg) errorMsg.textContent = "Zəhmət olmasa bütün xanaları doldurun!";
                return;
            }

            if (errorMsg) errorMsg.textContent = "Yoxlanılır...";
            const formattedEmail = `${userInput}@nework.edu`;

            signInWithEmailAndPassword(auth, formattedEmail, passInput)
                .then(() => {
                    localStorage.setItem("currentUser", userInput);
                    window.location.href = "second.html";
                })
                .catch((error) => {
                    console.error("Firebase Hatası:", error);
                    if (errorMsg) errorMsg.textContent = "İstifadəçi adı və ya şifrə yanlışdır!";
                });
        });
    }
});

function createFallingLogos() {
    const container = document.getElementById("bgShapes");
    if (!container) return;

    const logoFiles = [
        "logos/APlus.svg", "logos/CSharp.svg", "logos/Erlang.svg", "logos/Fortran.svg",
        "logos/FStar.svg", "logos/Haskell.svg", "logos/Java.svg", "logos/Julia.svg",
        "logos/Kotlin.svg", "logos/Lua.svg", "logos/Mathics.svg", "logos/Oberon.svg",
        "logos/Perl.svg", "logos/PHP.svg", "logos/Python.svg", "logos/QB64.svg",
        "logos/Racket.svg", "logos/Rust.svg", "logos/Wax.svg", "logos/WebAssembly.svg",
        "logos/1.png", "logos/CPP.png", "logos/Delphi.png", "logos/JS.png",
        "logos/Oxygene.png", "logos/Pyret.png", "logos/Rust.png", "logos/OCKER2.png"
    ];

    const totalLogos = 25;

    for (let i = 0; i < totalLogos; i++) {
        const item = document.createElement("div");
        item.className = "falling-logo";

        const randomLogo = logoFiles[Math.floor(Math.random() * logoFiles.length)];
        const img = document.createElement("img");
        img.src = randomLogo;
        img.onerror = function() {
            this.style.display = "none";
        };
        
        item.appendChild(img);

        item.style.left = `${Math.random() * 95}%`;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 5;

        item.style.animationDuration = `${duration}s`;
        item.style.animationDelay = `${delay}s`;

        container.appendChild(item);
    }
}

window.logout = function() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
};

window.openFullscreen = function(iframeId) {
    const iframe = document.getElementById(iframeId);
    if (!iframe) return;

    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
    }
};

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
        <head><style>${cssValue}</style></head>
        <body>${htmlValue}</body>
        </html>
    `);
    previewDoc.close();
}
