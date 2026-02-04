// GAME PROJECT BUILDER
window.buildGameProject = function(name, type, features) {
    console.log('[Game Builder] Building:', name, type, features);
    const files = {};
    
    if (type.includes('2D Game')) {
        files['index.html'] = generate2DGameHTML(name, features);
        files['game.js'] = generate2DGameJS(name, features);
        files['style.css'] = generateGameCSS();
    } else if (type.includes('Puzzle')) {
        files['index.html'] = generatePuzzleHTML(name);
        files['puzzle.js'] = generatePuzzleJS(name);
        files['style.css'] = generateGameCSS();
    } else if (type.includes('Card Game')) {
        files['index.html'] = generateCardGameHTML(name);
        files['cards.js'] = generateCardGameJS(name);
        files['style.css'] = generateCardCSS();
    }
    
    return files;
};

function generate2DGameHTML(name, features) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>${name} - 2D Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <h1>${name}</h1>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div class="controls">
            <button onclick="game.start()">Start Game</button>
            <button onclick="game.pause()">Pause</button>
            <button onclick="game.reset()">Reset</button>
        </div>
        <div class="game-info">
            <span>Score: <span id="score">0</span></span>
            <span>Lives: <span id="lives">3</span></span>
            <span>Level: <span id="level">1</span></span>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>`;
}

function generate2DGameJS(name, features) {
    return `// ${name} - 2D Game Engine
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = {
    score: 0,
    lives: 3,
    level: 1,
    running: false,
    
    player: {
        x: 400,
        y: 500,
        width: 50,
        height: 50,
        speed: 5,
        color: '#00ff88'
    },
    
    enemies: [],
    particles: [],
    
    start() {
        this.running = true;
        this.gameLoop();
        console.log('Game started!');
    },
    
    pause() {
        this.running = !this.running;
        if (this.running) this.gameLoop();
    },
    
    reset() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.enemies = [];
        this.particles = [];
        this.player.x = 400;
        this.player.y = 500;
        this.updateUI();
    },
    
    update() {
        // Handle keyboard input
        if (keys.ArrowLeft && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (keys.ArrowRight && this.player.x < canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (keys.ArrowUp && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (keys.ArrowDown && this.player.y < canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
        
        // Spawn enemies
        if (Math.random() < 0.02) {
            this.enemies.push({
                x: Math.random() * canvas.width,
                y: -50,
                width: 30,
                height: 30,
                speed: 2 + Math.random() * 3,
                color: '#ff4444'
            });
        }
        
        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // Check collision with player
            if (this.checkCollision(this.player, enemy)) {
                this.lives--;
                this.updateUI();
                this.createExplosion(enemy.x, enemy.y);
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            return enemy.y < canvas.height + 50;
        });
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });
    },
    
    draw() {
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#1a1a1a';
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Draw player
        ctx.fillStyle = this.player.color;
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
        
        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = \`rgba(255, 100, 0, \${p.life / 20})\`;
            ctx.fillRect(p.x, p.y, 4, 4);
        });
    },
    
    checkCollision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    },
    
    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 20
            });
        }
    },
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    },
    
    gameOver() {
        this.running = false;
        alert(\`Game Over! Score: \${this.score}\`);
        this.reset();
    },
    
    gameLoop() {
        if (!this.running) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
};

// Keyboard handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Initialize
game.draw();
console.log('${name} ready! Use arrow keys to move.');`;
}

function generateGameCSS() {
    return `body {
    margin: 0;
    padding: 0;
    background: #0a0a0a;
    color: #00ff88;
    font-family: 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.game-container {
    text-align: center;
}

h1 {
    color: #00ff88;
    text-shadow: 0 0 10px #00ff88;
}

canvas {
    border: 2px solid #00ff88;
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.controls {
    margin: 20px 0;
}

.controls button {
    background: #00ff88;
    color: #000;
    border: none;
    padding: 10px 20px;
    margin: 0 5px;
    cursor: pointer;
    font-size: 16px;
    border-radius: 5px;
    transition: all 0.3s;
}

.controls button:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px #00ff88;
}

.game-info {
    display: flex;
    justify-content: space-around;
    max-width: 400px;
    margin: 20px auto;
    font-size: 18px;
}

.game-info span {
    color: #00ccff;
}`;
}

// Stub functions for other game types
function generatePuzzleHTML(name) { return '<!-- Puzzle Game HTML -->'; }
function generatePuzzleJS(name) { return '// Puzzle Game JS'; }
function generateCardGameHTML(name) { return '<!-- Card Game HTML -->'; }
function generateCardGameJS(name) { return '// Card Game JS'; }
function generateCardCSS() { return '/* Card Game CSS */'; }

console.log('[Game Builder] Loaded');
