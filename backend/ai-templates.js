// AI TEMPLATES
exports.getBlogHTML = function(name, features) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>${name} - Blog</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <h1>${name}</h1>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#posts">Posts</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <article>
            <h2>Welcome to ${name}</h2>
            <p>${features || "A modern blog"}</p>
            <button onclick="readMore()">Read More</button>
        </article>
    </main>
    <script src="app.js"></script>
</body>
</html>`;
};

exports.getBlogJS = function(name) {
    return `// ${name} Blog
function readMore() {
    alert("Loading article...");
}
console.log("${name} Blog loaded!");`;
};

exports.getBlogCSS = function() {
    return `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; background: #f5f5f5; }
header { background: #333; color: white; padding: 1rem; }
nav { display: flex; justify-content: space-between; align-items: center; }
nav ul { list-style: none; display: flex; gap: 2rem; }
nav a { color: white; text-decoration: none; }
nav a:hover { color: #3498db; }
main { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
article { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
button { background: #3498db; color: white; border: none; padding: 0.5rem 1.5rem; cursor: pointer; border-radius: 4px; }`;
};

exports.getGameHTML = function(name) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>${name} - Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container">
        <h1>${name}</h1>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div id="controls">
            <button onclick="game.start()">Start Game</button>
            <button onclick="game.pause()">Pause</button>
            <button onclick="game.reset()">Reset</button>
        </div>
        <div id="score">Score: <span id="scoreValue">0</span></div>
    </div>
    <script src="app.js"></script>
</body>
</html>`;
};

exports.getGameJS = function(name) {
    return `// ${name} Game Engine
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const game = {
    score: 0,
    running: false,
    player: { x: 400, y: 300, size: 20, color: "#0F0" },
    
    start() {
        this.running = true;
        console.log("Game started!");
        this.gameLoop();
    },
    
    pause() {
        this.running = false;
        console.log("Game paused");
    },
    
    reset() {
        this.score = 0;
        this.player.x = 400;
        this.player.y = 300;
        document.getElementById("scoreValue").textContent = 0;
        this.draw();
    },
    
    draw() {
        // Clear canvas
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 800, 600);
        
        // Draw player
        ctx.fillStyle = this.player.color;
        ctx.fillRect(this.player.x - this.player.size/2, this.player.y - this.player.size/2, this.player.size, this.player.size);
        
        // Draw score
        ctx.fillStyle = "#FFF";
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + this.score, 10, 30);
    },
    
    update() {
        // Game logic here
        this.score++;
        document.getElementById("scoreValue").textContent = this.score;
    },
    
    gameLoop() {
        if (!this.running) return;
        this.update();
        this.draw();
        setTimeout(() => this.gameLoop(), 100);
    }
};

// Keyboard controls
document.addEventListener("keydown", (e) => {
    if (!game.running) return;
    switch(e.key) {
        case "ArrowLeft": if(game.player.x > 20) game.player.x -= 10; break;
        case "ArrowRight": if(game.player.x < 780) game.player.x += 10; break;
        case "ArrowUp": if(game.player.y > 20) game.player.y -= 10; break;
        case "ArrowDown": if(game.player.y < 580) game.player.y += 10; break;
    }
});

// Initialize
game.draw();
console.log("${name} Game ready! Use arrow keys to move.");`;
};

exports.getGameCSS = function() {
    return `body {
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    color: white;
    font-family: Arial, sans-serif;
}

#game-container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

h1 {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    margin-bottom: 20px;
}

canvas {
    border: 3px solid #0F0;
    background: #000;
    display: block;
    margin: 0 auto 20px;
    box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
}

#controls {
    margin: 20px 0;
}

button {
    background: linear-gradient(135deg, #00ff88, #00ccff);
    color: #000;
    border: none;
    padding: 10px 20px;
    margin: 0 5px;
    cursor: pointer;
    font-weight: bold;
    border-radius: 5px;
    transition: transform 0.3s;
}

button:hover {
    transform: scale(1.1);
}

#score {
    font-size: 24px;
    font-weight: bold;
    margin-top: 20px;
}`;
};
