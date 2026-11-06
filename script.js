document.addEventListener("DOMContentLoaded", function () {
    initPhysicsLogos();

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

function initPhysicsLogos() {
    const container = document.getElementById("bgShapes");
    if (!container || typeof Matter === "undefined") return;

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

    const engine = Engine.create();
    engine.world.gravity.y = 0.4; 
    const render = Render.create({
        element: container,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const logoFiles = [
        "logos/APlus.svg",
        "logos/CSharp.svg",
        "logos/Erlang.svg",
        "logos/Fortran.svg",
        "logos/FStar.svg",
        "logos/Haskell.svg",
        "logos/Java.svg",
        "logos/Julia.svg",
        "logos/Kotlin.svg",
        "logos/Lua.svg",
        "logos/Mathics.svg",
        "logos/Oberon.svg",
        "logos/Perl.svg",
        "logos/PHP.svg",
        "logos/Python.svg",
        "logos/QB64.svg",
        "logos/Racket.svg",
        "logos/Rust.svg",
        "logos/Wax.svg",
        "logos/WebAssembly.svg",
        "logos/1.png",
        "logos/CPP.png",
        "logos/Delphi.png",
        "logos/JS.png",
        "logos/Oxygene.png",
        "logos/Pyret.png",
        "logos/Rust.png",

        "logos/OCKER2.png"
    ];

    function dropLogo() {
        const x = Math.random() * window.innerWidth;
        const size = Math.floor(Math.random() * 30) + 30;
        const randomLogo = logoFiles[Math.floor(Math.random() * logoFiles.length)];

        const logoBody = Bodies.circle(x, -50, size / 2, {
            restitution: 0.6,
            friction: 0.1,
            render: {
                sprite: {
                    texture: randomLogo,
                    xScale: size / 100,
                    yScale: size / 100
                }
            }
        });

        Composite.add(engine.world, logoBody);

        Events.on(engine, "afterUpdate", function () {
            if (logoBody.position.y > window.innerHeight + 100) {
                Composite.remove(engine.world, logoBody);
            }
        });
    }

    setInterval(dropLogo, 800);

    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });

    Composite.add(engine.world, mouseConstraint);

    window.addEventListener("resize", () => {
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
    });
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
