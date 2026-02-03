import { config } from 'dotenv';
config();
import https from 'https';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load AI handlers, but don't fail if they don't work
let aiHandlers = null;
try {
    const aiHelperModule = await import('./ai-handlers.js');
    aiHandlers = aiHelperModule.default || aiHelperModule;
    console.log('AI handlers loaded successfully');
} catch (error) {
    console.log('Could not load aiHelper.js:', error.message);
}

try {
    if (!aiHandlers) {
        console.log('AI handlers fallback mode: using basic responses');
    }
} catch (error) {
    console.log('AI handlers fallback mode:', error.message);
}

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the correct CrackerBot directory
app.use(express.static('/home/crackerbot/public_html'));

// SSL configuration
const options = {
    key: fs.readFileSync('/var/cpanel/ssl/apache_tls/crackerbot.io/combined'),
    cert: fs.readFileSync('/var/cpanel/ssl/apache_tls/crackerbot.io/combined')
};

const httpsServer = https.createServer(options, app);

// Socket.IO setup
const io = new Server(httpsServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Bot response templates
const BOT_RESPONSES = {
    welcome: "🎉 Welcome to CrackerBot, {username}! I'm your cosmic AI companion!\n\n🚀 I can help you build amazing projects! Try:\n- \"Build a website\" - Create a stunning website\n- \"Create a game\" - Build an interactive game\n- \"Make a Discord bot\" - Create your own bot\n- Or just chat with me about anything!\n\n💡 Tip: Click the choice bubbles below or type your ideas in the chat!",
    
    projectStart: "🚀 Let's build something epic! What shall we name your project?",
    
    help: "🤖 I'm CrackerBot! I can help you:\n• Build websites and web apps\n• Create games and interactive content\n• Develop bots and automation\n• Chat about technology and projects\n\nJust tell me what you'd like to build!",
    
    default: "🌟 That's interesting! I'm here to help you build amazing projects. Try saying 'Build-Something-Epic' to get started!"
};

// Username generation
function generateUsername() {
    const adjectives = ['Cosmic', 'Stellar', 'Quantum', 'Digital', 'Cyber', 'Neon', 'Space', 'Galaxy', 'Nebula', 'Photon'];
    const nouns = ['Warrior', 'Explorer', 'Builder', 'Architect', 'Wizard', 'Knight', 'Master', 'Hunter', 'Walker', 'Forger'];
    const number = Math.floor(Math.random() * 10000);
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}_${number}`;
}

// Message processing function
function processMessage(messageText, username = 'User') {
    const text = messageText.toLowerCase().trim();
    
    if (text === 'build-something-epic') {
        return BOT_RESPONSES.projectStart;
    }
    
    if (text.includes('help')) {
        return BOT_RESPONSES.help;
    }
    
    return BOT_RESPONSES.default;
}

// Socket connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Generate username and send welcome message
    const username = generateUsername();
    const welcomeMessage = BOT_RESPONSES.welcome.replace('{username}', username);
    
    // Send welcome message immediately upon connection
    setTimeout(() => {
        socket.emit('response', {
            message: welcomeMessage,
            type: 'text',
            sender: 'CrackerBot',
            username: username
        });
    }, 500);
    
    // Handle incoming messages
    socket.on('message', async (data) => {
        console.log('📡 RECEIVED EVENT: message', [data]);
        
        try {
            const messageText = data.message || data.text || '';
            const user = data.user || data.name || username;
            
            let response;
            
            // Try AI handlers first if available
            if (aiHandlers && aiHandlers.handleMessage) {
                try {
                    response = await aiHandlers.handleMessage(data, socket);
                } catch (aiError) {
                    console.log('AI handler failed, using fallback:', aiError.message);
                    response = {
                        message: processMessage(messageText, user),
                        type: 'text'
                    };
                }
            } else {
                // Use built-in response system
                response = {
                    message: processMessage(messageText, user),
                    type: 'text',
                    sender: 'CrackerBot'
                };
            }
            
            // Send response back to client
            socket.emit('response', response);
            
        } catch (error) {
            console.error('Message processing error:', error);
            socket.emit('response', {
                message: "🔧 Something went wrong, but I'm still here to help!",
                type: 'text',
                sender: 'CrackerBot'
            });
        }
    });
    
    socket.on('set_username', (data) => {
        console.log('📡 RECEIVED EVENT: set_username', [data]);
    });
    
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, '- Reason:', reason);
    });
});

// Start the server
const PORT = process.env.PORT || 3443;

httpsServer.listen(PORT, () => {
    console.log('CrackerBot running on port ' + PORT);
    console.log('Socket.IO enabled');
    console.log('Live editor auto-open ready');
    console.log('Redis: On-demand for projects and chat');
});

export { app, io, httpsServer };
