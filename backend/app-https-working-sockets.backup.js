import express from 'express';
import { createServer } from 'https';
import fs from 'fs';
import { Server } from 'socket.io';
import cors from 'cors';
import Redis from 'ioredis';
import { config } from 'dotenv';
import { createRequire } from 'module';
import Anthropic from '@anthropic-ai/sdk';

// Enable require() in ES module for CommonJS dependencies
const require = createRequire(import.meta.url);

config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
});

const app = express();
const sslOptions = {
    key: fs.readFileSync("/var/cpanel/ssl/apache_tls/crackerbot.io/combined"),
    cert: fs.readFileSync("/var/cpanel/ssl/apache_tls/crackerbot.io/combined")
};
const httpsServer = createServer(sslOptions, app);

// Initialize Socket.IO
const io = new Server(httpsServer, {
    cors: {
        origin: ["https://crackerbot.io", "https://www.crackerbot.io"],
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true
});

// CONTROLLED Redis - only connect when actually needed
let redis = null;

function getRedisConnection() {
    if (!redis) {
        try {
            redis = new Redis({
                host: 'localhost',
                port: 6379,
                retryDelayOnFailover: 100,
                enableReadyCheck: false,
                maxRetriesPerRequest: null,
            });
            console.log('Redis connected for project/chat operation');
        } catch (error) {
            console.log('Redis unavailable - using fallback mode');
            return null;
        }
    }
    return redis;
}

// Load AI handlers using require for CommonJS compatibility
let aiHandlers, aiService;
try {
    process.env.DISABLE_AUTO_REDIS = 'true';
    
    aiHandlers = require('./ai-handlers.js');
    aiService = require('./ai-service.js');
    
    console.log('AI handlers loaded (Redis on-demand)');
} catch (error) {
    console.log('AI handlers fallback mode:', error.message);
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(new URL('../public_html', import.meta.url).pathname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(new URL('../public_html/index.html', import.meta.url).pathname);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        redis_mode: 'on-demand',
        live_editor: 'enabled',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/live-stream-status', (req, res) => {
    res.json({
        status: 'active',
        features: ['live-editor-auto-open', 'redis-projects'],
        timestamp: new Date().toISOString()
    });
});

// Generate project with Claude AI
async function generateProjectWithClaude(projectName, projectType, features) {
    const safeName = projectName || 'My Project';
    const safeFeatures = features || 'A modern web application';
    
    console.log(`[Generator] Creating ${projectType} project: "${safeName}"`);
    
    const generatedFiles = {};
    
    // Generate HTML
    generatedFiles['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <nav class="nav">
                <div class="logo">${safeName}</div>
                <ul class="nav-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        
        <main>
            <section id="home" class="hero">
                <h1>Welcome to ${safeName}</h1>
                <p class="subtitle">${safeFeatures}</p>
                <button class="cta-button" onclick="getStarted()">Get Started</button>
            </section>
            
            <section id="features" class="features">
                <h2>Amazing Features</h2>
                <div class="feature-grid">
                    <div class="feature-card">
                        <span class="icon">🚀</span>
                        <h3>Lightning Fast</h3>
                        <p>Optimized for maximum performance</p>
                    </div>
                    <div class="feature-card">
                        <span class="icon">🎨</span>
                        <h3>Beautiful Design</h3>
                        <p>Modern and elegant interface</p>
                    </div>
                    <div class="feature-card">
                        <span class="icon">📱</span>
                        <h3>Fully Responsive</h3>
                        <p>Perfect on all devices</p>
                    </div>
                    <div class="feature-card">
                        <span class="icon">🔒</span>
                        <h3>Secure</h3>
                        <p>Built with security in mind</p>
                    </div>
                </div>
            </section>
            
            <section id="about" class="about">
                <h2>About ${safeName}</h2>
                <p>${safeFeatures}</p>
            </section>
            
            <section id="contact" class="contact">
                <h2>Get In Touch</h2>
                <form class="contact-form" onsubmit="handleSubmit(event)">
                    <input type="text" placeholder="Your Name" required>
                    <input type="email" placeholder="Your Email" required>
                    <textarea placeholder="Your Message" rows="4" required></textarea>
                    <button type="submit">Send Message</button>
                </form>
            </section>
        </main>
        
        <footer class="footer">
            <p>&copy; 2024 ${safeName}. Built with 💜 by CrackerBot AI</p>
        </footer>
    </div>
    <script src="app.js"></script>
</body>
</html>`;

    // Generate CSS
    generatedFiles['styles.css'] = `/* ${safeName} Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    padding: 20px 0;
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}

.logo {
    font-size: 28px;
    font-weight: bold;
    background: linear-gradient(45deg, #FFD700, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 30px;
}

.nav-links a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 8px 16px;
    border-radius: 20px;
}

.nav-links a:hover {
    background: rgba(255,255,255,0.2);
}

.hero {
    text-align: center;
    padding: 100px 20px;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    animation: fadeInUp 1s ease;
}

.subtitle {
    font-size: 1.4rem;
    opacity: 0.9;
    margin-bottom: 40px;
    max-width: 600px;
    animation: fadeInUp 1s ease 0.2s both;
}

.cta-button {
    background: linear-gradient(45deg, #00ff88, #00ccff);
    color: #000;
    border: none;
    padding: 18px 50px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0,255,136,0.4);
}

.cta-button:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 20px 40px rgba(0,255,136,0.5);
}

.features {
    padding: 80px 20px;
    text-align: center;
}

.features h2 {
    font-size: 2.5rem;
    margin-bottom: 50px;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
}

.feature-card {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    padding: 40px 30px;
    border-radius: 20px;
    transition: all 0.3s ease;
    border: 1px solid rgba(255,255,255,0.2);
}

.feature-card:hover {
    transform: translateY(-10px);
    background: rgba(255,255,255,0.15);
}

.feature-card .icon {
    font-size: 48px;
    display: block;
    margin-bottom: 20px;
}

.feature-card h3 {
    margin-bottom: 15px;
}

.about {
    padding: 80px 20px;
    text-align: center;
    background: rgba(0,0,0,0.1);
    border-radius: 30px;
    margin: 40px 0;
}

.about h2 {
    font-size: 2.5rem;
    margin-bottom: 30px;
}

.contact {
    padding: 80px 20px;
    text-align: center;
}

.contact h2 {
    font-size: 2.5rem;
    margin-bottom: 40px;
}

.contact-form {
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.contact-form input,
.contact-form textarea {
    padding: 15px 20px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    background: rgba(255,255,255,0.9);
    color: #333;
}

.contact-form button {
    background: linear-gradient(45deg, #00ff88, #00ccff);
    color: #000;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 10px;
    cursor: pointer;
}

.footer {
    text-align: center;
    padding: 40px;
    opacity: 0.8;
    border-top: 1px solid rgba(255,255,255,0.1);
    margin-top: 40px;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .hero h1 { font-size: 2rem; }
    .nav { flex-direction: column; gap: 20px; }
    .nav-links { gap: 15px; flex-wrap: wrap; justify-content: center; }
}`;

    // Generate JavaScript
    generatedFiles['app.js'] = `// ${safeName} - Interactive JavaScript
console.log('🚀 ${safeName} loaded!');

function getStarted() {
    const features = document.getElementById('features');
    if (features) {
        features.scrollIntoView({ behavior: 'smooth' });
    }
    showNotification('Welcome! 🎉');
}

function handleSubmit(event) {
    event.preventDefault();
    showNotification('Thanks for your message! 📧');
    event.target.reset();
}

function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #00ff88, #00ccff);
        color: #000;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.5s ease;
    \`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

console.log('✨ ${safeName} ready!');`;

    return generatedFiles;
}

// Socket handlers
io.on('connection', (socket) => {
    
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);
    
    // Log ALL socket events
    socket.onAny((eventName, ...args) => {
        console.log(`📡 RECEIVED EVENT: ${eventName}`, args);
    });
    
    socket.on("disconnect", (reason) => {
        console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id} - Reason: ${reason}`);
    });
    
    // =====================================================
    // FIXED: Project generation - removed aiHandlers check
    // =====================================================
    socket.on('ai_generate_project', async (data) => {
        try {
            console.log('🚀 Building project:', data.name);
            
            // Open live editor IMMEDIATELY when project starts
            socket.emit("open_live_editor", {
                projectName: data.name,
                projectType: data.type,
                files: [],
                status: "building"
            });
            console.log("📺 Live editor opened immediately for:", data.name);
            
            // FIXED: Generate files directly (removed failing aiHandlers check)
            const project = { 
                files: await generateProjectWithClaude(
                    data.name, 
                    data.type, 
                    data.features || data.requirements || ""
                ) 
            };
            
            console.log('📦 Generated files:', Object.keys(project.files));
            
            // Auto-save to Redis
            const userId = data.userId || socket.id;
            const projectToSave = {
                name: data.name,
                type: data.type,
                files: project.files || {},
                requirements: data.requirements || data.userMessage
            };
            
            // Save project
            socket.emit("save_project", { userId, project: projectToSave });
            
            // Send generated files to frontend
            socket.emit('project_generated', project);
            
            // Update live editor with files
            socket.emit('open_live_editor', {
                projectName: data.name,
                projectType: data.type,
                files: project.files || {}
            });
            
            console.log('✅ Live editor triggered with files for:', data.name);
            
        } catch (error) {
            console.error('❌ Project error:', error);
            socket.emit('project_error', { message: error.message });
        }
    });

    // Get projects from Redis
    socket.on('get_projects', async (data) => {
        try {
            const userId = data.userId || socket.id;
            console.log('Fetching projects for user:', userId);
            
            const redisConn = getRedisConnection();
            let projects = [];
            
            if (redisConn) {
                try {
                    if (redisConn.status !== 'ready') {
                        await redisConn.connect();
                    }
                    const projectData = await redisConn.hgetall(`user:${userId}:projects`);
                    
                    projects = Object.keys(projectData).map(projectId => {
                        try {
                            return JSON.parse(projectData[projectId]);
                        } catch (e) {
                            return null;
                        }
                    }).filter(p => p !== null);
                    
                    console.log(`Found ${projects.length} projects`);
                } catch (redisError) {
                    console.error('Redis error:', redisError);
                }
            }
            
            socket.emit('projects_list', { projects });
        } catch (error) {
            socket.emit('projects_error', { message: 'Failed to get projects' });
        }
    });

    // Save project to Redis
    socket.on('save_project', async (data) => {
        try {
            const { userId, project } = data;
            if (!userId || !project) return;

            const redisConn = getRedisConnection();
            if (redisConn) {
                try {
                    if (redisConn.status !== 'ready') {
                        await redisConn.connect();
                    }
                    
                    if (!project.id) {
                        project.id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    }
                    project.createdAt = project.createdAt || new Date().toISOString();
                    project.updatedAt = new Date().toISOString();

                    await redisConn.hset(`user:${userId}:projects`, project.id, JSON.stringify(project));
                    console.log('Project saved:', project.name);
                } catch (redisError) {
                    console.error('Redis save error:', redisError);
                }
            }
        } catch (error) {
            console.error('Save error:', error);
        }
    });

    // Message handling
    socket.on('message', async (data) => {
        try {
            if (aiHandlers && aiHandlers.handleMessage) {
                const response = await aiHandlers.handleMessage(data, socket);
                socket.emit('response', response);
            } else {
                // Fallback response
                socket.emit('response', {
                    message: "I received your message! Try building a project with 'Build Something Epic'",
                    type: 'text',
                    sender: 'CrackerBot'
                });
            }
        } catch (error) {
            socket.emit('error', { message: 'Failed to process message' });
        }
    });
});

// Start server
const PORT = process.env.PORT || 8443;
httpsServer.listen(PORT, () => {
    console.log('═'.repeat(50));
    console.log('🚀 CrackerBot running on port ' + PORT);
    console.log('🔌 Socket.IO enabled');
    console.log('📺 Live editor auto-open ready');
    console.log('📦 Project generation: ENABLED');
    console.log('💾 Redis: On-demand for projects and chat');
    console.log('═'.repeat(50));
});

export { app, io, httpsServer };