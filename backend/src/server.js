// backend/server.js - Complete Backend with Socket.io + REST API
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io with proper CORS
const io = new Server(httpServer, {
    cors: {
        origin: [
            'http://localhost:8081',
            'http://localhost:3333',
            'https://crackerbot.ngrok.io',
            'https://*.ngrok.io',
            'https://*.ngrok.app',
            'https://*.ngrok-free.app'
        ],
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Use port 3333 as expected by frontend
const PORT = process.env.PORT || 3333;

// Initialize Anthropic
const anthropic = new Anthropic.Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''YOUR_API_KEY_HERE''
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);
    
    // Send welcome message
    socket.emit('welcome', { 
        message: 'Connected to CrackerBot Backend!',
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });
    
    // Handle regular messages
    socket.on('message', (data) => {
        console.log('[Message]', data);
        
        // Process commands
        if (data.text && data.text.startsWith('/')) {
            handleCommand(socket, data);
        } else {
            // Echo back to all clients
            io.emit('message', {
                from: data.user || 'User',
                text: data.text,
                type: data.type || 'chat',
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // Handle AI project generation
    socket.on('ai_generate_project', async (data) => {
        console.log('[AI Generate]', data.name, data.type);
        
        try {
            // Send progress update
            socket.emit('progress', {
                percent: 10,
                status: 'Starting AI generation...'
            });
            
            const files = await generateProjectWithClaude(
                data.name || 'MyProject',
                data.type || 'web-app',
                data.features || ''
            );
            
            // Send completed project
            socket.emit('project_generated', {
                success: true,
                files: files,
                projectName: data.name,
                projectType: data.type
            });
            
            console.log('✅ Project generated successfully');
            
        } catch (error) {
            console.error('Generation error:', error);
            socket.emit('error', {
                message: 'Failed to generate project',
                error: error.message
            });
        }
    });
    
    // Handle code modification
    socket.on('ai_modify_code', async (data) => {
        console.log('[AI Modify]', data.filename);
        
        try {
            const modifiedCode = await modifyCodeWithClaude(
                data.code || data.currentCode,
                data.filename,
                data.request
            );
            
            socket.emit('code_modified', {
                success: true,
                code: modifiedCode,
                filename: data.filename
            });
            
        } catch (error) {
            console.error('Modification error:', error);
            socket.emit('error', {
                message: 'Failed to modify code',
                error: error.message
            });
        }
    });
    
    // Handle code modification (alternate event name)
    socket.on('modify_code', async (data) => {
        console.log('[Modify Code]', data.filename);
        
        try {
            const modifiedCode = await modifyCodeWithClaude(
                data.code || data.currentCode,
                data.filename,
                data.request || data.modification
            );
            
            socket.emit('code_modified', {
                success: true,
                code: modifiedCode,
                filename: data.filename
            });
            
        } catch (error) {
            console.error('Modification error:', error);
            socket.emit('error', {
                message: 'Failed to modify code',
                error: error.message
            });
        }
    });
    
    // Handle build project request
    socket.on('build_project', async (data) => {
        console.log('[Build Project]', data);
        
        // Simulate build progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            socket.emit('progress', {
                percent: progress,
                status: `Building... ${progress}%`
            });
            
            if (progress >= 100) {
                clearInterval(interval);
                socket.emit('project_complete', {
                    success: true,
                    message: 'Project built successfully!'
                });
            }
        }, 500);
    });
    
    // Handle username setting
    socket.on('set_username', (data) => {
        console.log('[Username]', data.username);
        socket.username = data.username;
        socket.emit('username_set', {
            success: true,
            username: data.username
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});

// Command handler
function handleCommand(socket, data) {
    const command = data.text.toLowerCase();
    
    if (command === '/help') {
        socket.emit('message', {
            from: 'System',
            text: 'Commands: /help, /build, /projects, /clear',
            type: 'system'
        });
    } else if (command === '/build') {
        socket.emit('message', {
            from: 'System',
            text: 'Starting build process...',
            type: 'system'
        });
    }
}

// Generate project with Claude
async function generateProjectWithClaude(projectName, projectType, features) {
    const projectStructures = {
        'web-app': ['index.html', 'app.js', 'styles.css'],
        'game': ['index.html', 'game.js', 'style.css'],
        'discord-bot': ['bot.js', 'commands.js', 'config.json', 'package.json'],
        'api-server': ['server.js', 'routes.js', 'package.json']
    };
    
    const files = projectStructures[projectType] || projectStructures['web-app'];
    
    try {
        const prompt = `Create a ${projectType} called "${projectName}" with these features: ${features}.
Generate these files: ${files.join(', ')}

Format each file like:
\`\`\`filename
content
\`\`\``;

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8000,
            temperature: 0.7,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });
        
        const response = message.content[0].text;
        const generatedFiles = {};
        
        // Parse files from response
        files.forEach(filename => {
            const regex = new RegExp(`\`\`\`${filename}?\\n?([\\s\\S]*?)\`\`\``, 'i');
            const match = response.match(regex);
            if (match) {
                generatedFiles[filename] = match[1].trim();
            } else {
                // Fallback content
                generatedFiles[filename] = `// ${projectName} - ${filename}\nconsole.log('Generated by CrackerBot');`;
            }
        });
        
        return generatedFiles;
        
    } catch (error) {
        console.error('Claude error:', error);
        
        // Return fallback files
        const fallbackFiles = {};
        files.forEach(filename => {
            fallbackFiles[filename] = `// ${projectName} - ${filename}\n// Error: ${error.message}\nconsole.log('Fallback content');`;
        });
        return fallbackFiles;
    }
}

// Modify code with Claude
async function modifyCodeWithClaude(currentCode, filename, request) {
    try {
        const prompt = `Current code in ${filename}:
\`\`\`
${currentCode}
\`\`\`

User wants: ${request}

Modify the code to do exactly what they asked. Return only the modified code.`;

        const message = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8000,
            temperature: 0.5,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });
        
        let modifiedCode = message.content[0].text;
        modifiedCode = modifiedCode.replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim();
        
        return modifiedCode;
        
    } catch (error) {
        console.error('Claude modification error:', error);
        return currentCode + '\n// Error modifying code: ' + error.message;
    }
}

// REST API Endpoints

// Health check
app.get('/', (req, res) => {
    res.send('Bot Backend Running on port ' + PORT);
});

// Generate project via REST
app.post('/api/generate-project', async (req, res) => {
    try {
        const { projectName, projectType, features } = req.body;
        const files = await generateProjectWithClaude(projectName, projectType, features);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modify code via REST
app.post('/api/ai-update', async (req, res) => {
    try {
        const { currentCode, fileType, request } = req.body;
        const modifiedCode = await modifyCodeWithClaude(currentCode, fileType, request);
        res.json({ code: modifiedCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get project types
app.get('/api/project-types', (req, res) => {
    res.json([
        { value: 'web-app', label: 'Web Application' },
        { value: 'game', label: 'Browser Game' },
        { value: 'discord-bot', label: 'Discord Bot' },
        { value: 'api-server', label: 'API Server' },
        { value: 'smart-contract', label: 'Smart Contract' }
    ]);
});

// IMPORTANT: Use httpServer.listen, not app.listen
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║     🚀 CRACKERBOT BACKEND READY       ║
╠════════════════════════════════════════╣
║ Port: ${PORT}                              ║
║ Socket.io: ✅ Active                   ║
║ REST API: ✅ Active                    ║
║ Claude AI: ${process.env.ANTHROPIC_API_KEY ? '✅ Connected' : '❌ Add API key'}          ║
╚════════════════════════════════════════╝
    `);
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});