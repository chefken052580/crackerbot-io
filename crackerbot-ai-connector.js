// CrackerBot AI Connector - Complete Backend Integration
// This file MUST be loaded BEFORE crackerbot-main.js
(function() {
    'use strict';

    console.log("🤖 Loading CrackerBot AI Connector v2.0...");

    // ✅ PRIMARY AI HANDLER - This is what crackerbot-main.js calls
    window.handleChatToAI = function(messageText) {
        console.log("🔍 AI Connector: Analyzing message:", messageText);
        
        if (!messageText || typeof messageText !== 'string') {
            console.log("❌ AI Connector: Invalid message");
            return false;
        }
        
        const text = messageText.toLowerCase().trim();
        
        // Enhanced project detection keywords
        const buildKeywords = ['create', 'build', 'make', 'generate', 'develop', 'design'];
        const projectKeywords = ['website', 'web', 'site', 'app', 'application', 'game', 'bot', 'project'];
        
        // Check if message contains build + project keywords
        const hasBuildKeyword = buildKeywords.some(keyword => text.includes(keyword));
        const hasProjectKeyword = projectKeywords.some(keyword => text.includes(keyword));
        
        if (hasBuildKeyword && hasProjectKeyword) {
            console.log("✅ AI Connector: Detected AI generation request");
            
            // Parse the request
            const aiRequest = parseAIRequest(text, messageText);
            
            // Trigger AI generation via backend
            triggerBackendAIGeneration(aiRequest);
            
            return true; // Message was handled by AI
        }
        
        console.log("💬 AI Connector: Not an AI request, allowing normal chat");
        return false; // Message should go to normal chat
    };

    // Enhanced AI request parsing
    function parseAIRequest(lowerText, originalText) {
        let projectType = 'website'; // default
        let projectName = 'My Project'; // default
        
        // Detect project type with better accuracy
        if (lowerText.includes('game')) {
            projectType = 'game';
        } else if (lowerText.includes('bot')) {
            projectType = 'bot';
        } else if (lowerText.includes('website') || lowerText.includes('web') || lowerText.includes('site')) {
            projectType = 'website';
        } else if (lowerText.includes('app')) {
            projectType = 'web-app';
        }
        
        // Enhanced name extraction with multiple patterns
        const aboutMatch = originalText.match(/(?:about|for|on)\s+([^.!?,]+)/i);
        const calledMatch = originalText.match(/called\s+([^,.!?]+)/i);
        const namedMatch = originalText.match(/named\s+([^,.!?]+)/i);
        
        if (aboutMatch) {
            const subject = aboutMatch[1].trim();
            projectName = `${subject.charAt(0).toUpperCase() + subject.slice(1)} ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}`;
        } else if (calledMatch) {
            projectName = calledMatch[1].trim();
        } else if (namedMatch) {
            projectName = namedMatch[1].trim();
        } else {
            // Generic name based on type
            projectName = `My ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}`;
        }
        
        return {
            name: projectName,
            type: projectType,
            features: originalText
        };
    }

    // ✅ BACKEND AI GENERATION - Uses your enhanced backend
    function triggerBackendAIGeneration(aiRequest) {
        console.log("🚀 AI Connector: Triggering backend AI generation", aiRequest);
        
        // Add confirmation message to chat
        if (window.addMessage) {
            window.addMessage("AI", `🚀 I'll create "${aiRequest.name}" for you! Building your ${aiRequest.type} now...`, "system");
        }
        
        // Check socket availability
        if (!window.socket) {
            console.error("❌ AI Connector: No socket available");
            handleAIError("Not connected to AI backend");
            return;
        }
        
        if (!window.socket.connected) {
            console.error("❌ AI Connector: Socket not connected");
            handleAIError("Connection to AI backend lost");
            return;
        }
        
        // ✅ GLOBAL BUILD GUARD - prevent duplicate builds
        if (window._aiGenerationInProgress) {
            console.log("⚠️ AI Connector: Generation already in progress, skipping duplicate");
            return;
        }
        window._aiGenerationInProgress = true;
        setTimeout(() => { window._aiGenerationInProgress = false; }, 30000); // Reset after 30s
        
        // ✅ Send to backend using correct parameters
        console.log("📡 AI Connector: Sending ai_generate_project event");
        window.socket.emit('ai_generate_project', {
            name: aiRequest.name,           // Backend expects 'name'
            type: aiRequest.type,           // Backend expects 'type'  
            features: aiRequest.features    // Backend expects 'features'
        });
        
        // Set up current task for tracking
        window.currentTask = {
            taskId: Date.now(),
            projectName: aiRequest.name,
            projectType: aiRequest.type,
            features: aiRequest.features,
            status: "Generating",
            startTime: new Date().toISOString()
        };
        
        // Try to open live preview
        openLivePreviewForAI(aiRequest);
    }

    // Live preview integration
    function openLivePreviewForAI(aiRequest) {
        // Wait a moment for live preview to be ready
        setTimeout(() => {
            if (window.livePreview && typeof window.livePreview.autoOpen === 'function') {
                console.log("🎥 AI Connector: Opening live preview");
                try {
                    window.livePreview.autoOpen({
                        taskId: window.currentTask.taskId,
                        projectName: aiRequest.name,
                        projectType: aiRequest.type,
                        features: aiRequest.features,
                        frontendId: window.socket.id
                    });
                } catch (error) {
                    console.error("❌ AI Connector: Failed to open live preview:", error);
                }
            } else {
                console.log("⏳ AI Connector: Live preview not ready, will retry...");
                // Retry a few times
                retryLivePreview(aiRequest, 3);
            }
        }, 500);
    }

    // Retry live preview opening
    function retryLivePreview(aiRequest, attemptsLeft) {
        if (attemptsLeft <= 0) {
            console.log("⚠️ AI Connector: Live preview unavailable");
            return;
        }
        
        setTimeout(() => {
            if (window.livePreview && typeof window.livePreview.autoOpen === 'function') {
                console.log("🎥 AI Connector: Opening live preview (retry)");
                try {
                    window.livePreview.autoOpen({
                        taskId: window.currentTask.taskId,
                        projectName: aiRequest.name,
                        projectType: aiRequest.type,
                        features: aiRequest.features,
                        frontendId: window.socket.id
                    });
                } catch (error) {
                    console.error("❌ AI Connector: Live preview retry failed:", error);
                    retryLivePreview(aiRequest, attemptsLeft - 1);
                }
            } else {
                retryLivePreview(aiRequest, attemptsLeft - 1);
            }
        }, 1000);
    }

    // Error handling
    function handleAIError(message) {
        console.error("❌ AI Connector:", message);
        if (window.addMessage) {
            window.addMessage("System", `❌ AI Error: ${message}`, "system");
        }
    }

    // ✅ SETUP AI EVENT LISTENERS - Enhanced for your backend
    function setupAIEventListeners() {
        if (!window.socket) {
            console.log("⏳ AI Connector: Waiting for socket...");
            setTimeout(setupAIEventListeners, 1000);
            return;
        }
        
        console.log("📡 AI Connector: Setting up enhanced event listeners");
        
        // Listen for AI progress updates
        window.socket.on('progress', (data) => {
            console.log("📈 AI Connector: Progress update", data);
            
            if (window.addMessage && data.status) {
                window.addMessage("System", `🚀 ${data.percent || 0}% - ${data.status}`, "system");
            }
            
            // Update progress bar if available
            updateProgressUI(data.percent, data.status);
        });
        
        // REMOVED: project_generated listener now handled by crackerbot-main.js (single source of truth)
        
        // Listen for AI errors
        window.socket.on('error', (data) => {
            console.error("❌ AI Connector: Backend error", data);
            if (data && data.message) {
                handleAIError(data.message);
            }
        });
        
        console.log("✅ AI Connector: Event listeners configured");
    }

    // Handle successful project generation
    function handleProjectGenerated(data) {
        // Store files in current task
        if (window.currentTask) {
            window.currentTask.files = data.files;
            window.currentTask.status = "Complete";
            window.currentTask.completed = true;
            window.currentTask.completedAt = new Date().toISOString();
        }
        
        // Add success message
        if (window.addMessage) {
            const fileCount = Object.keys(data.files).length;
            window.addMessage("AI", `✅ Project "${data.projectName}" generated successfully with ${fileCount} files!`, "success");
        }
        
        // Update live preview with generated files
        updateLivePreviewWithFiles(data.files);
        
        // Call completion handlers
        callCompletionHandlers();
        
        // Save to projects list
        saveToProjectsList();
        
        console.log("✅ AI Connector: Project generation completed successfully");
    }

    // Update live preview with generated files
    function updateLivePreviewWithFiles(files) {
        if (window.livePreview && files) {
            console.log("🎥 AI Connector: Updating live preview with generated files");
            try {
                if (typeof window.livePreview.updateFiles === 'function') {
                    window.livePreview.updateFiles(files);
                } else if (typeof window.livePreview.displayFiles === 'function') {
                    window.livePreview.displayFiles(files);
                } else {
                    console.log("⚠️ AI Connector: Live preview doesn't have file update methods");
                }
            } catch (error) {
                console.error("❌ AI Connector: Error updating live preview:", error);
            }
        }
    }

    // Call completion handlers
    function callCompletionHandlers() {
        if (window.completeBuilding && typeof window.completeBuilding === 'function') {
            try {
                window.completeBuilding();
                console.log("✅ AI Connector: Called completeBuilding()");
            } catch (error) {
                console.error("❌ AI Connector: Error calling completeBuilding:", error);
            }
        }
        
        if (window.completeBuild && typeof window.completeBuild === 'function') {
            try {
                window.completeBuild();
                console.log("✅ AI Connector: Called completeBuild()");
            } catch (error) {
                console.error("❌ AI Connector: Error calling completeBuild:", error);
            }
        }
    }

    // Save to projects list
    function saveToProjectsList() {
        if (window.projects && window.currentTask) {
            try {
                // Check if project already exists
                const existingIndex = window.projects.findIndex(p => p.taskId === window.currentTask.taskId);
                if (existingIndex >= 0) {
                    window.projects[existingIndex] = {...window.currentTask};
                } else {
                    window.projects.push({...window.currentTask});
                }
                
                // Save to localStorage
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem("crackerBotProjects", JSON.stringify(window.projects));
                    console.log("✅ AI Connector: Project saved to localStorage");
                }
            } catch (error) {
                console.error("❌ AI Connector: Error saving project:", error);
            }
        }
    }

    // Update progress UI elements
    function updateProgressUI(percent, status) {
        // Update progress bar
        const progressFill = document.getElementById("task-progress-fill") || 
                           document.getElementById("progress-bar");
        if (progressFill && percent) {
            progressFill.style.width = percent + "%";
        }
        
        // Update progress text
        const progressText = document.getElementById("progress-text");
        if (progressText && percent) {
            progressText.textContent = percent + "% - " + status;
        }
        
        // Show progress container if hidden
        const progressContainer = document.getElementById("task-progress-container") || 
                               document.querySelector(".progress-container");
        if (progressContainer && percent && percent > 0) {
            progressContainer.style.display = "block";
        }
    }

    // ✅ FALLBACK PROJECT GENERATOR (only used if backend fails)
    window.SimpleAI = {
        // Fallback project generation (only used if backend is unavailable)
        async generateProject(name, type, features) {
            console.log("[SimpleAI] Fallback: Creating basic project");
            return createFallbackProject(name, type, features);
        },

        // Test function
        test() {
            console.log("[SimpleAI] Testing AI connector...");
            return window.handleChatToAI("create a test website");
        }
    };

    // Simple fallback project creator
    function createFallbackProject(name, type, features) {
        const safeName = name || 'My Project';
        const safeType = type || 'website';
        const safeFeatures = features || 'Basic functionality';

        console.log("[SimpleAI] Creating fallback project:", { safeName, safeType, safeFeatures });

        if (safeType === 'game') {
            return {
                'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <h1>${safeName}</h1>
        <canvas id="gameCanvas" width="800" height="400"></canvas>
        <div class="controls">
            <button onclick="game.start()">Start Game</button>
            <button onclick="game.pause()">Pause</button>
        </div>
        <p class="features">Features: ${safeFeatures}</p>
    </div>
    <script src="game.js"></script>
</body>
</html>`,
                'game.js': `// ${safeName} - Simple Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = {
    running: false,
    player: { x: 50, y: 200, size: 20, speed: 5 },
    
    start() {
        this.running = true;
        console.log('${safeName} started!');
        this.gameLoop();
    },
    
    pause() {
        this.running = false;
    },
    
    gameLoop() {
        if (!this.running) return;
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    },
    
    update() {
        if (keys['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
        if (keys['ArrowRight'] && this.player.x < canvas.width - this.player.size) this.player.x += this.player.speed;
        if (keys['ArrowUp'] && this.player.y > 0) this.player.y -= this.player.speed;
        if (keys['ArrowDown'] && this.player.y < canvas.height - this.player.size) this.player.y += this.player.speed;
    },
    
    render() {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('${safeName}', 10, 30);
        ctx.font = '14px Arial';
        ctx.fillText('Use arrow keys to move', 10, canvas.height - 10);
    }
};

const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

game.render();`,
                'style.css': `body {
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.game-container {
    text-align: center;
    background: rgba(0, 0, 0, 0.7);
    padding: 20px;
    border-radius: 15px;
    border: 2px solid #00ff88;
}

#gameCanvas {
    border: 2px solid #00ff88;
    border-radius: 10px;
    margin: 20px 0;
}

.controls button {
    background: linear-gradient(135deg, #00ff88, #00ccff);
    color: black;
    border: none;
    padding: 10px 20px;
    margin: 0 10px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
}

.features {
    margin-top: 15px;
    opacity: 0.8;
}`
            };
        } else {
            return {
                'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeName}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>${safeName}</h1>
            <nav>
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </nav>
        </header>
        <main>
            <section id="hero">
                <h2>Welcome to ${safeName}</h2>
                <p class="subtitle">Features: ${safeFeatures}</p>
                <button class="cta" onclick="startApp()">Get Started</button>
            </section>
        </main>
        <footer>
            <p>Built with CrackerBot AI</p>
        </footer>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
                'style.css': `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
}

h1 {
    font-size: 2rem;
    background: linear-gradient(135deg, #00ff88, #00ccff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 0 15px;
    padding: 8px 16px;
    border-radius: 20px;
    transition: background 0.3s;
}

nav a:hover {
    background: rgba(255, 255, 255, 0.1);
}

#hero {
    text-align: center;
    padding: 100px 0;
}

#hero h2 {
    font-size: 3rem;
    margin-bottom: 20px;
}

.subtitle {
    font-size: 1.2rem;
    margin-bottom: 30px;
    opacity: 0.9;
}

.cta {
    background: linear-gradient(135deg, #00ff88, #00ccff);
    color: black;
    border: none;
    padding: 15px 30px;
    border-radius: 25px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.3s;
}

.cta:hover {
    transform: translateY(-2px);
}

footer {
    text-align: center;
    padding: 40px 0;
    margin-top: 50px;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    opacity: 0.7;
}`,
                'script.js': `// ${safeName} - Interactive Website
console.log('${safeName} initialized');

function startApp() {
    alert('Welcome to ${safeName}!\\nFeatures: ${safeFeatures}');
    console.log('App started with features:', '${safeFeatures}');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('${safeName} ready!');
});`
            };
        }
    }

    // ✅ INITIALIZATION
    function initializeAIConnector() {
        console.log("🤖 AI Connector: Initializing enhanced version...");
        
        // Set up event listeners
        setupAIEventListeners();
        
        // Test function for debugging
        window.testAIConnector = function(testMessage = "create a test website") {
            console.log("🧪 Testing AI Connector with:", testMessage);
            const result = window.handleChatToAI(testMessage);
            console.log("🧪 Test result:", result);
            return result;
        };
        
        console.log("✅ AI Connector: Enhanced initialization complete");
        console.log("🔧 Debug: Use window.testAIConnector() to test");
        console.log("🔧 Debug: Use window.SimpleAI.test() for quick test");
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAIConnector);
    } else {
        initializeAIConnector();
    }

    // Export for global access
    window.AIConnector = {
        handleChatToAI: window.handleChatToAI,
        parseAIRequest: parseAIRequest,
        triggerBackendAIGeneration: triggerBackendAIGeneration,
        setupAIEventListeners: setupAIEventListeners,
        testAIConnector: window.testAIConnector,
        version: "2.0"
    };

    console.log("✅ CrackerBot AI Connector v2.0 loaded successfully");
    console.log("🔗 Backend integration: ENABLED");
    console.log("🎥 Live preview support: ENABLED");
    console.log("📡 Event listeners: ENHANCED");

})();