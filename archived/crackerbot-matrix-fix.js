// Matrix Rain Effect Fix

window.initMatrixRain = function() {
    const canvas = document.getElementById("matrix-canvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Matrix characters
    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");
    
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    
    // Array for drops - one per column
    const drops = [];
    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    // Drawing the characters
    function draw() {
        // Only draw if matrix theme is active
        if (document.body.className !== "matrix-theme") {
            return;
        }
        
        // Black BG for the canvas with slight opacity
        ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#0F0"; // Green text
        ctx.font = fontSize + "px arial";
        
        // Loop through drops
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            
            // x = i * fontSize, y = drops[i] * fontSize
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            // Send drop back to top randomly after it has crossed the screen
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            // Increment drop
            drops[i]++;
        }
    }
    
    // Start the animation
    if (window.matrixInterval) {
        clearInterval(window.matrixInterval);
    }
    window.matrixInterval = setInterval(draw, 35);
    
    // Handle resize
    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
};

// Start matrix rain on load if matrix theme
document.addEventListener("DOMContentLoaded", () => {
    if (document.body.className === "matrix-theme" || !document.body.className) {
        document.body.className = "matrix-theme";
        initMatrixRain();
    }
});

// Fix theme switching to properly start/stop matrix rain
const originalChangeTheme = window.changeTheme;
window.changeTheme = function(theme) {
    currentTheme = theme;
    document.body.className = theme + "-theme";
    
    if (theme === "matrix") {
        initMatrixRain();
    } else {
        // Stop matrix rain for other themes
        if (window.matrixInterval) {
            clearInterval(window.matrixInterval);
            const canvas = document.getElementById("matrix-canvas");
            if (canvas) {
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }
    
    localStorage.setItem("crackerBotTheme", theme);
};
