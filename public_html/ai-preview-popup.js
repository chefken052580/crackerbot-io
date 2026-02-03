// backend/ai-handler.js
// AI Handler Module for CrackerBot Backend
// This integrates with your existing app.js structure

const fetch = require('node-fetch');

// Main AI modification processor
async function processAIModification(data) {
    console.log('[AI Handler] Processing modification request...');
    
    const { filename, code, prompt, projectType, projectName } = data;
    
    // Validate input
    if (!filename || !code || !prompt) {
        throw new Error('Missing required fields: filename, code, or prompt');
    }
    
    // Determine file type
    const fileExtension = filename.split('.').pop().toLowerCase();
    let language = 'javascript';
    
    switch (fileExtension) {
        case 'html':
            language = 'html';
            break;
        case 'css':
            language = 'css';
            break;
        case 'js':
            language = 'javascript';
            break;
        case 'py':
            language = 'python';
            break;
        case 'sol':
            language = 'solidity';
            break;
        case 'json':
            language = 'json';
            break;
        case 'md':
            language = 'markdown';
            break;
        case 'tsx':
        case 'jsx':
            language = 'javascript';
            break;
    }
    
    // Check for API keys
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('[AI Handler] Using Claude API...');
        return await modifyWithClaude(code, prompt, language, filename, projectType);
    } else if (process.env.OPENAI_API_KEY) {
        console.log('[AI Handler] Using OpenAI API...');
        return await modifyWithOpenAI(code, prompt, language, filename, projectType);
    } else {
        console.log('[AI Handler] Using enhanced mock modifications...');
        return await enhancedMockModification(code, prompt, language, filename);
    }
}

// Claude API modification
async function modifyWithClaude(code, prompt, language, filename, projectType) {
    const aiPrompt = `You are an expert ${language} developer. Modify the following code based on the user's request.

Project Type: ${projectType || 'web application'}
File: ${filename}
Language: ${language}

Current Code:
\`\`\`${language}
${code}
\`\`\`

User Request: ${prompt}

Instructions:
1. Make the requested changes while preserving existing functionality
2. Follow ${language} best practices
3. Add comments for new/modified sections
4. Ensure code is clean and properly formatted
5. Return ONLY the complete modified code, no explanations

Modified Code:`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: aiPrompt
                }]
            })
        });
        
        const data = await response.json();
        return extractCodeFromResponse(data.content[0].text);
    } catch (error) {
        console.error('[AI Handler] Claude API error:', error);
        throw error;
    }
}

// OpenAI API modification
async function modifyWithOpenAI(code, prompt, language, filename, projectType) {
    const aiPrompt = `You are an expert ${language} developer. Modify the following code based on the user's request.

Project Type: ${projectType || 'web application'}
File: ${filename}

Current Code:
\`\`\`${language}
${code}
\`\`\`

User Request: ${prompt}

Return ONLY the complete modified code that implements the requested changes. Maintain existing functionality, follow best practices, and add appropriate comments.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'system',
                    content: 'You are a code modification expert. Return only code, no explanations.'
                }, {
                    role: 'user',
                    content: aiPrompt
                }],
                max_tokens: 4000,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        return extractCodeFromResponse(data.choices[0].message.content);
    } catch (error) {
        console.error('[AI Handler] OpenAI API error:', error);
        throw error;
    }
}

// Enhanced mock modification for testing
async function enhancedMockModification(code, prompt, language, filename) {
    console.log(`[Mock AI] Processing: ${prompt} for ${filename}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const promptLower = prompt.toLowerCase();
    let modifiedCode = code;
    
    // Language-specific modifications
    if (language === 'html') {
        if (promptLower.includes('dark mode') || promptLower.includes('dark theme')) {
            modifiedCode = modifiedCode.replace('<body>', '<body class="light-mode">');
            modifiedCode = modifiedCode.replace('</body>', `
    <!-- Dark mode toggle added by AI -->
    <div class="theme-toggle-container">
        <button id="theme-toggle" class="theme-toggle-btn">
            <span class="theme-icon">🌓</span>
            <span class="theme-text">Toggle Theme</span>
        </button>
    </div>
    
    <script>
        document.getElementById('theme-toggle').addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
        
        // Load saved theme
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        }
    </script>
</body>`);
        } else if (promptLower.includes('form') || promptLower.includes('contact')) {
            modifiedCode = modifiedCode.replace('</body>', `
    <!-- Contact form added by AI -->
    <section class="contact-form-section">
        <h2>Contact Us</h2>
        <form id="contact-form" class="contact-form">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" class="submit-btn">Send Message</button>
        </form>
    </section>
</body>`);
        } else if (promptLower.includes('navbar') || promptLower.includes('navigation')) {
            modifiedCode = modifiedCode.replace('<body>', `<body>
    <!-- Navigation added by AI -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="#" class="nav-logo">Logo</a>
            <ul class="nav-menu">
                <li class="nav-item"><a href="#home" class="nav-link">Home</a></li>
                <li class="nav-item"><a href="#about" class="nav-link">About</a></li>
                <li class="nav-item"><a href="#services" class="nav-link">Services</a></li>
                <li class="nav-item"><a href="#contact" class="nav-link">Contact</a></li>
            </ul>
            <div class="hamburger">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>`);
        }
    } else if (language === 'css') {
        if (promptLower.includes('dark mode') || promptLower.includes('dark theme')) {
            modifiedCode += `

/* ===== Dark Mode Styles Added by AI ===== */
:root {
    --bg-light: #ffffff;
    --text-light: #333333;
    --bg-dark: #1a1a2e;
    --text-dark: #f0f0f0;
    --accent: #00ff88;
}

body.light-mode {
    background-color: var(--bg-light);
    color: var(--text-light);
    transition: all 0.3s ease;
}

body.dark-mode {
    background-color: var(--bg-dark);
    color: var(--text-dark);
    transition: all 0.3s ease;
}

.dark-mode a {
    color: var(--accent);
}

.dark-mode button {
    background-color: #2a2a3e;
    color: var(--text-dark);
    border: 1px solid var(--accent);
}

.dark-mode input,
.dark-mode textarea {
    background-color: #2a2a3e;
    color: var(--text-dark);
    border: 1px solid #444;
}

.theme-toggle-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    background: var(--accent);
    color: var(--bg-dark);
    border: none;
    border-radius: 25px;
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    transition: all 0.3s ease;
}

.theme-toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
}`;
        } else if (promptLower.includes('responsive') || promptLower.includes('mobile')) {
            modifiedCode += `

/* ===== Responsive Design Added by AI ===== */
/* Tablet Styles */
@media screen and (max-width: 768px) {
    .container {
        width: 95%;
        padding: 15px;
    }
    
    .grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    h1 {
        font-size: 2rem;
    }
    
    h2 {
        font-size: 1.5rem;
    }
    
    .navbar {
        flex-direction: column;
    }
    
    .nav-menu {
        flex-direction: column;
        width: 100%;
    }
}

/* Mobile Styles */
@media screen and (max-width: 480px) {
    body {
        font-size: 14px;
    }
    
    .container {
        width: 100%;
        padding: 10px;
    }
    
    h1 {
        font-size: 1.5rem;
    }
    
    h2 {
        font-size: 1.2rem;
    }
    
    button {
        width: 100%;
        padding: 12px;
        margin: 5px 0;
    }
    
    input, textarea {
        width: 100%;
        padding: 10px;
    }
    
    .card {
        padding: 15px;
    }
    
    table {
        font-size: 12px;
    }
}

/* Extra Small Mobile */
@media screen and (max-width: 320px) {
    body {
        font-size: 12px;
    }
    
    h1 {
        font-size: 1.2rem;
    }
    
    .container {
        padding: 5px;
    }
}`;
        } else if (promptLower.includes('animation') || promptLower.includes('animate')) {
            modifiedCode += `

/* ===== Animations Added by AI ===== */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.fade-in {
    animation: fadeIn 0.6s ease-in-out;
}

.slide-in-left {
    animation: slideInLeft 0.6s ease-out;
}

.slide-in-right {
    animation: slideInRight 0.6s ease-out;
}

.pulse {
    animation: pulse 2s infinite;
}

.rotate {
    animation: rotate 2s linear infinite;
}

/* Hover animations */
.hover-grow {
    transition: transform 0.3s ease;
}

.hover-grow:hover {
    transform: scale(1.1);
}

.hover-shadow {
    transition: box-shadow 0.3s ease;
}

.hover-shadow:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}`;
        }
    } else if (language === 'javascript') {
        if (promptLower.includes('validation') || promptLower.includes('form')) {
            modifiedCode += `

// ===== Form Validation Added by AI =====
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
        
        // Email validation
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                input.classList.add('error');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

// Form submit handler
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForm(form.id)) {
                console.log('Form is valid, submitting...');
                // Add your submit logic here
            } else {
                alert('Please fill in all required fields correctly.');
            }
        });
    });
});`;
        } else if (promptLower.includes('fetch') || promptLower.includes('api')) {
            modifiedCode += `

// ===== API Integration Added by AI =====
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL || '';
    }
    
    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(\`HTTP error! status: \${response.status}\`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Usage example
const api = new APIClient('https://api.example.com');

// Example API calls
async function fetchData() {
    try {
        const data = await api.get('/data');
        console.log('Fetched data:', data);
        return data;
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}`;
        } else if (promptLower.includes('storage') || promptLower.includes('localstorage')) {
            modifiedCode += `

// ===== Local Storage Handler Added by AI =====
class StorageManager {
    constructor(prefix = 'app_') {
        this.prefix = prefix;
    }
    
    setItem(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }
    
    getItem(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Failed to parse localStorage item:', error);
            return null;
        }
    }
    
    removeItem(key) {
        localStorage.removeItem(this.prefix + key);
    }
    
    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
    
    getAllItems() {
        const items = {};
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => {
                const cleanKey = key.replace(this.prefix, '');
                items[cleanKey] = this.getItem(cleanKey);
            });
        return items;
    }
}

// Usage
const storage = new StorageManager('myapp_');

// Save data
storage.setItem('user', { name: 'John', age: 30 });

// Get data
const user = storage.getItem('user');
console.log('User data:', user);`;
        }
    }
    
    // Add generic modification note if no specific change was made
    if (modifiedCode === code) {
        modifiedCode += `

/* ========================================
   AI Modification Request: ${prompt}
   ======================================== */
   
// TODO: Implement the following feature:
// ${prompt}
//
// This is a placeholder for the AI modification.
// In production with API keys, this would contain
// the actual implementation.

/* Note: Enable AI API in backend for automatic implementation */`;
    }
    
    return modifiedCode;
}

// Extract code from AI response
function extractCodeFromResponse(response) {
    // Look for code blocks
    const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
    const matches = [...response.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
        // Return the last code block (assuming it's the modified code)
        return matches[matches.length - 1][1].trim();
    }
    
    // If no code blocks, assume the entire response is code
    return response.trim();
}

// Generate complete project files
async function generateProjectFiles(name, type, features) {
    console.log(`[AI Handler] Generating ${type} project: ${name}`);
    
    const files = {};
    const projectNameClean = name.replace(/[^a-zA-Z0-9]/g, '');
    
    // Base templates for different project types
    switch(type) {
        case 'web-app':
        case 'website':
            files['index.html'] = generateWebAppHTML(name, features);
            files['style.css'] = generateWebAppCSS();
            files['script.js'] = generateWebAppJS(name, features);
            files['README.md'] = generateReadme(name, type, features);
            break;
            
        case 'game':
            files['index.html'] = generateGameHTML(name);
            files['game.css'] = generateGameCSS();
            files['game.js'] = generateGameJS(name, features);
            files['README.md'] = generateReadme(name, type, features);
            break;
            
        case 'discord-bot':
            files['bot.js'] = generateDiscordBot(name, features);
            files['config.json'] = generateBotConfig();
            files['package.json'] = generatePackageJson(name, type);
            files['README.md'] = generateReadme(name, type, features);
            break;
            
        case 'smart-contract':
        case 'nft-contract':
        case 'defi-protocol':
            files['contract.sol'] = generateSmartContract(projectNameClean, type, features);
            files['deploy.js'] = generateDeployScript(projectNameClean);
            files['hardhat.config.js'] = generateHardhatConfig();
            files['README.md'] = generateReadme(name, type, features);
            break;
            
        case 'react-app':
            files['App.jsx'] = generateReactApp(name, features);
            files['index.html'] = generateReactHTML(name);
            files['style.css'] = generateReactCSS();
            files['package.json'] = generatePackageJson(name, type);
            files['README.md'] = generateReadme(name, type, features);
            break;
            
        default:
            // Default web app
            files['index.html'] = generateWebAppHTML(name, features);
            files['style.css'] = generateWebAppCSS();
            files['script.js'] = generateWebAppJS(name, features);
            files['README.md'] = generateReadme(name, type, features);
    }
    
    return files;
}

// Template generators
function generateWebAppHTML(name, features) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="nav-container">
                <a href="#" class="nav-logo">${name}</a>
                <ul class="nav-menu">
                    <li class="nav-item"><a href="#home" class="nav-link">Home</a></li>
                    <li class="nav-item"><a href="#about" class="nav-link">About</a></li>
                    <li class="nav-item"><a href="#features" class="nav-link">Features</a></li>
                    <li class="nav-item"><a href="#contact" class="nav-link">Contact</a></li>
                </ul>
            </div>
        </nav>
    </header>
    
    <main class="main-container">
        <section id="home" class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">${name}</h1>
                <p class="hero-description">${features || 'Welcome to your new web application!'}</p>
                <button class="cta-button">Get Started</button>
            </div>
        </section>
        
        <section id="features" class="features-section">
            <h2>Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <span class="feature-icon">🚀</span>
                    <h3>Fast Performance</h3>
                    <p>Built for speed and efficiency</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">💎</span>
                    <h3>Modern Design</h3>
                    <p>Clean and responsive interface</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🔒</span>
                    <h3>Secure</h3>
                    <p>Built with security in mind</p>
                </div>
            </div>
        </section>
    </main>
    
    <footer class="footer">
        <p>&copy; 2024 ${name}. Built with CrackerBot AI</p>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>`;
}

function generateWebAppCSS() {
    return `/* Global Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --text-color: #333;
    --bg-color: #f5f5f5;
    --card-bg: #ffffff;
    --shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background: var(--bg-color);
}

/* Header & Navigation */
.header {
    background: var(--card-bg);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.navbar {
    padding: 1rem 0;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
    text-decoration: none;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-link {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s;
}

.nav-link:hover {
    color: var(--primary-color);
}

/* Hero Section */
.hero-section {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 5rem 2rem;
    text-align: center;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: fadeInUp 0.8s ease;
}

.hero-description {
    font-size: 1.2rem;
    margin-bottom: 2rem;
    opacity: 0.95;
    animation: fadeInUp 0.8s ease 0.2s both;
}

.cta-button {
    background: white;
    color: var(--primary-color);
    border: none;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s;
    animation: fadeInUp 0.8s ease 0.4s both;
}

.cta-button:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow);
}

/* Features Section */
.features-section {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.features-section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: var(--card-bg);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: var(--shadow);
    text-align: center;
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
}

/* Footer */
.footer {
    background: var(--text-color);
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 4rem;
}

/* Animations */
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

/* Responsive Design */
@media (max-width: 768px) {
    .nav-menu {
        flex-direction: column;
        gap: 1rem;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
}`;
}

function generateWebAppJS(name, features) {
    return `// ${name} JavaScript
console.log('Welcome to ${name}!');

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initialized');
    
    // Initialize components
    initNavigation();
    initAnimations();
    initEventHandlers();
    
    // Features implementation
    // ${features || 'Add your custom features here'}
});

// Navigation handler
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target.startsWith('#')) {
                smoothScrollTo(target);
            }
        });
    });
}

// Smooth scroll implementation
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize animations
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
}

// Event handlers
function initEventHandlers() {
    // CTA button handler
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            console.log('CTA button clicked!');
            // Add your action here
            alert('Welcome to ${name}! Let\\'s get started!');
        });
    }
    
    // Add more event handlers as needed
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Example API call function
async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        smoothScrollTo,
        fetchData
    };
}`;
}

function generateGameHTML(name) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Game</title>
    <link rel="stylesheet" href="game.css">
</head>
<body>
    <div class="game-container">
        <header class="game-header">
            <h1>${name}</h1>
            <div class="game-stats">
                <div class="stat">Score: <span id="score">0</span></div>
                <div class="stat">Level: <span id="level">1</span></div>
                <div class="stat">Lives: <span id="lives">3</span></div>
            </div>
        </header>
        
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        
        <div class="game-controls">
            <button id="startBtn" class="game-btn">Start Game</button>
            <button id="pauseBtn" class="game-btn">Pause</button>
            <button id="resetBtn" class="game-btn">Reset</button>
        </div>
        
        <div class="instructions">
            <h3>How to Play:</h3>
            <p>Use arrow keys to move, Space to shoot</p>
        </div>
    </div>
    
    <script src="game.js"></script>
</body>
</html>`;
}

function generateGameCSS() {
    return `body {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    font-family: 'Arial', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.game-container {
    background: rgba(0, 0, 0, 0.8);
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
}

.game-header {
    color: white;
    text-align: center;
    margin-bottom: 20px;
}

.game-header h1 {
    margin: 0 0 10px 0;
    font-size: 2rem;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.game-stats {
    display: flex;
    justify-content: center;
    gap: 30px;
    font-size: 1.2rem;
}

.stat {
    color: #00ff00;
}

#gameCanvas {
    border: 2px solid #00ffff;
    display: block;
    background: #000;
}

.game-controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 20px 0;
}

.game-btn {
    background: linear-gradient(135deg, #00ff00, #00aa00);
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1rem;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.game-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
}

.instructions {
    color: white;
    text-align: center;
    margin-top: 20px;
}`;
}

function generateGameJS(name, features) {
    return `// ${name} - Game Engine
console.log('${name} Game Loading...');

// Game configuration
const config = {
    width: 800,
    height: 600,
    fps: 60
};

// Game state
let gameState = {
    running: false,
    paused: false,
    score: 0,
    level: 1,
    lives: 3,
    player: null,
    enemies: [],
    projectiles: []
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
        this.color = '#00ff00';
    }
    
    update() {
        // Handle input
        if (keys.ArrowLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys.ArrowRight && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (keys.ArrowUp && this.y > 0) {
            this.y -= this.speed;
        }
        if (keys.ArrowDown && this.y < canvas.height - this.height) {
            this.y += this.speed;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.color = '#ff0000';
    }
    
    update() {
        this.y += this.speed;
        
        // Remove if off screen
        if (this.y > canvas.height) {
            const index = gameState.enemies.indexOf(this);
            if (index > -1) {
                gameState.enemies.splice(index, 1);
            }
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Projectile class
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speed = 8;
        this.color = '#ffff00';
    }
    
    update() {
        this.y -= this.speed;
        
        // Check collision with enemies
        gameState.enemies.forEach((enemy, enemyIndex) => {
            if (this.collidesWith(enemy)) {
                gameState.enemies.splice(enemyIndex, 1);
                const index = gameState.projectiles.indexOf(this);
                gameState.projectiles.splice(index, 1);
                gameState.score += 10;
                updateScore();
            }
        });
        
        // Remove if off screen
        if (this.y < 0) {
            const index = gameState.projectiles.indexOf(this);
            if (index > -1) {
                gameState.projectiles.splice(index, 1);
            }
        }
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && gameState.running && !gameState.paused) {
        shoot();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game functions
function startGame() {
    gameState.running = true;
    gameState.paused = false;
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 3;
    gameState.enemies = [];
    gameState.projectiles = [];
    
    // Create player
    gameState.player = new Player(canvas.width / 2 - 25, canvas.height - 100);
    
    updateScore();
    gameLoop();
}

function pauseGame() {
    gameState.paused = !gameState.paused;
}

function resetGame() {
    gameState.running = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startGame();
}

function shoot() {
    if (gameState.player) {
        const projectile = new Projectile(
            gameState.player.x + gameState.player.width / 2 - 2.5,
            gameState.player.y
        );
        gameState.projectiles.push(projectile);
    }
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - 30);
    const enemy = new Enemy(x, -30);
    gameState.enemies.push(enemy);
}

function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('lives').textContent = gameState.lives;
}

// Game loop
function gameLoop() {
    if (!gameState.running) return;
    
    if (!gameState.paused) {
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw player
        if (gameState.player) {
            gameState.player.update();
            gameState.player.draw();
        }
        
        // Update and draw enemies
        gameState.enemies.forEach(enemy => {
            enemy.update();
            enemy.draw();
        });
        
        // Update and draw projectiles
        gameState.projectiles.forEach(projectile => {
            projectile.update();
            projectile.draw();
        });
        
        // Spawn enemies
        if (Math.random() < 0.02) {
            spawnEnemy();
        }
        
        // Level progression
        if (gameState.score > gameState.level * 100) {
            gameState.level++;
            updateScore();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Button event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Initialize
console.log('${name} Game Ready! Click Start to begin.');

// Features: ${features || 'Classic arcade-style game'}`;
}

function generateDiscordBot(name, features) {
    return `// ${name} - Discord Bot
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');

// Create bot client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Bot prefix
const prefix = config.prefix || '!';

// Bot ready event
client.once('ready', () => {
    console.log(\`✅ ${name} is online!\`);
    console.log(\`Logged in as \${client.user.tag}\`);
    
    // Set bot status
    client.user.setActivity('with CrackerBot AI', { type: 'PLAYING' });
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check for prefix
    if (!message.content.startsWith(prefix)) return;
    
    // Parse command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    // Command handlers
    switch(command) {
        case 'ping':
            const latency = Date.now() - message.createdTimestamp;
            message.reply(\`🏓 Pong! Latency: \${latency}ms\`);
            break;
            
        case 'help':
            const helpEmbed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('${name} - Commands')
                .setDescription('Here are my available commands:')
                .addFields(
                    { name: \`\${prefix}ping\`, value: 'Check bot latency' },
                    { name: \`\${prefix}help\`, value: 'Show this help message' },
                    { name: \`\${prefix}info\`, value: 'Bot information' },
                    { name: \`\${prefix}say [text]\`, value: 'Make the bot say something' },
                    { name: \`\${prefix}roll [sides]\`, value: 'Roll a dice' }
                )
                .setFooter({ text: 'Built with CrackerBot AI' })
                .setTimestamp();
            
            message.channel.send({ embeds: [helpEmbed] });
            break;
            
        case 'info':
            const infoEmbed = new EmbedBuilder()
                .setColor('#667eea')
                .setTitle('${name}')
                .setDescription('${features || 'A Discord bot built with CrackerBot AI'}')
                .addFields(
                    { name: 'Version', value: '1.0.0', inline: true },
                    { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
                    { name: 'Users', value: client.users.cache.size.toString(), inline: true }
                )
                .setTimestamp();
            
            message.channel.send({ embeds: [infoEmbed] });
            break;
            
        case 'say':
            if (args.length === 0) {
                message.reply('Please provide text to say!');
            } else {
                message.channel.send(args.join(' '));
                message.delete();
            }
            break;
            
        case 'roll':
            const sides = parseInt(args[0]) || 6;
            const result = Math.floor(Math.random() * sides) + 1;
            message.reply(\`🎲 You rolled a \${result} (d\${sides})\`);
            break;
            
        default:
            message.reply(\`Unknown command. Use \${prefix}help for a list of commands.\`);
    }
});

// Error handling
client.on('error', (error) => {
    console.error('Bot error:', error);
});

// Login to Discord
client.login(config.token);`;
}

function generateBotConfig() {
    return `{
    "token": "YOUR_BOT_TOKEN_HERE",
    "prefix": "!",
    "owner": "YOUR_USER_ID"
}`;
}

function generateSmartContract(name, type, features) {
    if (type === 'nft-contract') {
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ${name} is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    uint256 public mintPrice = 0.01 ether;
    uint256 public maxSupply = 10000;
    bool public mintingEnabled = false;
    
    // Features: ${features}
    
    constructor() ERC721("${name}", "${name.substring(0, 3).toUpperCase()}") {}
    
    function safeMint(address to, string memory uri) public payable {
        require(mintingEnabled, "Minting is not enabled");
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }
    
    function setMintPrice(uint256 _price) public onlyOwner {
        mintPrice = _price;
    }
    
    function toggleMinting() public onlyOwner {
        mintingEnabled = !mintingEnabled;
    }
    
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
    
    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}`;
    } else if (type === 'defi-protocol') {
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract ${name} {
    address public owner;
    uint256 public totalDeposits;
    uint256 public rewardRate = 100; // 1% = 100 basis points
    
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public lastClaimTime;
    
    IERC20 public stakingToken;
    
    // Features: ${features}
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _stakingToken) {
        owner = msg.sender;
        stakingToken = IERC20(_stakingToken);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update user's deposit
        if (deposits[msg.sender] > 0) {
            claimRewards();
        }
        
        deposits[msg.sender] += amount;
        totalDeposits += amount;
        lastClaimTime[msg.sender] = block.timestamp;
        
        emit Deposit(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        
        claimRewards();
        
        deposits[msg.sender] -= amount;
        totalDeposits -= amount;
        
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdraw(msg.sender, amount);
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        if (deposits[user] == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - lastClaimTime[user];
        uint256 rewards = (deposits[user] * rewardRate * timeElapsed) / (365 days * 10000);
        
        return rewards;
    }
    
    function claimRewards() public {
        uint256 rewards = calculateRewards(msg.sender);
        
        if (rewards > 0) {
            lastClaimTime[msg.sender] = block.timestamp;
            require(stakingToken.transfer(msg.sender, rewards), "Reward transfer failed");
            emit RewardsClaimed(msg.sender, rewards);
        }
    }
    
    function setRewardRate(uint256 _rate) external onlyOwner {
        rewardRate = _rate;
    }
}`;
    } else {
        // Default smart contract
        return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ${name} {
    address public owner;
    uint256 public value;
    
    mapping(address => uint256) public balances;
    
    // Features: ${features}
    
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    event Deposit(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    function setValue(uint256 _value) public onlyOwner {
        uint256 oldValue = value;
        value = _value;
        emit ValueUpdated(oldValue, _value);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
    
    function deposit() public payable {
        require(msg.value > 0, "Must send ETH");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}`;
    }
}

function generateDeployScript(contractName) {
    return `// Deploy script for ${contractName}
const hre = require("hardhat");

async function main() {
    console.log("Deploying ${contractName}...");
    
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Get contract factory
    const Contract = await hre.ethers.getContractFactory("${contractName}");
    
    // Deploy contract
    const contract = await Contract.deploy();
    await contract.deployed();
    
    console.log("${contractName} deployed to:", contract.address);
    
    // Verify contract on Etherscan (if on mainnet/testnet)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("Waiting for block confirmations...");
        await contract.deployTransaction.wait(6);
        
        console.log("Verifying contract on Etherscan...");
        await hre.run("verify:verify", {
            address: contract.address,
            constructorArguments: [],
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });`;
}

function generateHardhatConfig() {
    return `require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    networks: {
        hardhat: {
            chainId: 1337
        },
        goerli: {
            url: process.env.GOERLI_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        },
        mainnet: {
            url: process.env.MAINNET_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY || ""
    }
};`;
}

function generateReactApp(name, features) {
    return `import React, { useState, useEffect } from 'react';
import './style.css';

// ${name} - React Application
// Features: ${features}

function App() {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState('Welcome to ${name}!');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        console.log('${name} initialized');
        // Add initialization logic here
    }, []);
    
    const handleClick = () => {
        setCount(count + 1);
        setMessage(\`You clicked \${count + 1} times!\`);
    };
    
    const handleReset = () => {
        setCount(0);
        setMessage('Counter reset!');
    };
    
    return (
        <div className="app">
            <header className="app-header">
                <h1>${name}</h1>
                <p className="tagline">${features || 'Built with React and CrackerBot AI'}</p>
            </header>
            
            <main className="app-main">
                <section className="counter-section">
                    <h2>{message}</h2>
                    <div className="counter-display">{count}</div>
                    <div className="button-group">
                        <button onClick={handleClick} className="btn btn-primary">
                            Click Me!
                        </button>
                        <button onClick={handleReset} className="btn btn-secondary">
                            Reset
                        </button>
                    </div>
                </section>
                
                <section className="features-section">
                    <h2>Features</h2>
                    <div className="features-grid">
                        <div className="feature">
                            <span className="feature-icon">⚛️</span>
                            <h3>React Powered</h3>
                            <p>Built with modern React hooks</p>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">🎨</span>
                            <h3>Styled Components</h3>
                            <p>Beautiful and responsive design</p>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">🚀</span>
                            <h3>Fast Performance</h3>
                            <p>Optimized for speed</p>
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="app-footer">
                <p>© 2024 ${name} - Created with CrackerBot AI</p>
            </footer>
        </div>
    );
}

export default App;`;
}

function generateReactHTML(name) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - React App</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel" src="App.jsx"></script>
    <script type="text/babel">
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`;
}

function generateReactCSS() {
    return `.app {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
    background: rgba(255, 255, 255, 0.1);
    padding: 2rem;
    text-align: center;
    backdrop-filter: blur(10px);
}

.app-header h1 {
    color: white;
    margin: 0;
    font-size: 3rem;
}

.tagline {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
}

.app-main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.counter-section {
    background: white;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.counter-display {
    font-size: 4rem;
    font-weight: bold;
    color: #667eea;
    margin: 1rem 0;
}

.button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: bold;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}

.btn-secondary {
    background: #f0f0f0;
    color: #333;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.features-section {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 10px;
    padding: 2rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.feature {
    text-align: center;
}

.feature-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
}

.app-footer {
    text-align: center;
    padding: 2rem;
    color: white;
}`;
}

function generatePackageJson(name, type) {
    const dependencies = {
        'discord-bot': {
            "discord.js": "^14.14.1",
            "dotenv": "^16.3.1"
        },
        'react-app': {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1"
        },
        'api-server': {
            "express": "^4.18.2",
            "cors": "^2.8.5",
            "dotenv": "^16.3.1"
        }
    };
    
    return JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        description: `${name} - Created with CrackerBot AI`,
        main: type === 'discord-bot' ? 'bot.js' : 'index.js',
        scripts: {
            start: type ==='discord-bot' ? 'node bot.js' : 'node index.js',
            dev: type === 'react-app' ? 'react-scripts start' : 'nodemon index.js',
            build: type === 'react-app' ? 'react-scripts build' : 'echo \"No build required\"',
            test: 'echo \"Error: no test specified\" && exit 1'
        },
        keywords: [type, 'crackerbot', 'ai-generated'],
        author: 'CrackerBot AI',
        license: 'MIT',
        dependencies: dependencies[type] || {},
        devDependencies: {
            "nodemon": "^3.0.1"
        }
    }, null, 2);
}

function generateReadme(name, type, features) {
    const typeDescriptions = {
        'web-app': 'A modern web application',
        'website': 'A responsive website',
        'game': 'An interactive browser game',
        'discord-bot': 'A Discord bot',
        'smart-contract': 'A Solidity smart contract',
        'nft-contract': 'An NFT smart contract',
        'defi-protocol': 'A DeFi protocol contract',
        'react-app': 'A React application'
    };
    
    return `# ${name}

${typeDescriptions[type] || 'A project'} created with CrackerBot AI.

## Features

${features || '- Modern, responsive design\n- Clean code architecture\n- Ready for deployment'}

## Getting Started

### Prerequisites

${type === 'discord-bot' ? '- Node.js 16.9.0 or higher\n- A Discord bot token' : ''}
${type === 'smart-contract' || type === 'nft-contract' || type === 'defi-protocol' ? '- Node.js\n- Hardhat\n- An Ethereum wallet with testnet ETH' : ''}
${type === 'react-app' ? '- Node.js 14.0.0 or higher\n- npm or yarn' : ''}
${type === 'web-app' || type === 'website' || type === 'game' ? '- A modern web browser\n- A web server (for production)' : ''}

### Installation

1. Clone this repository
\`\`\`bash
git clone https://github.com/yourusername/${name.toLowerCase().replace(/\s+/g, '-')}.git
cd ${name.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

${type === 'discord-bot' || type === 'react-app' ? `2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Configure environment variables
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start the application
\`\`\`bash
npm start
\`\`\`` : ''}

${type === 'smart-contract' || type === 'nft-contract' || type === 'defi-protocol' ? `2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Configure environment
\`\`\`bash
cp .env.example .env
# Add your private key and RPC URLs to .env
\`\`\`

4. Compile contracts
\`\`\`bash
npx hardhat compile
\`\`\`

5. Deploy to network
\`\`\`bash
npx hardhat run scripts/deploy.js --network goerli
\`\`\`` : ''}

${type === 'web-app' || type === 'website' || type === 'game' ? `2. Open index.html in your browser

3. For production deployment:
   - Upload files to your web server
   - Configure your domain
   - Enable HTTPS` : ''}

## Usage

${type === 'discord-bot' ? `### Commands

- \`!help\` - Show all available commands
- \`!ping\` - Check bot latency
- \`!info\` - Display bot information
- \`!say [text]\` - Make the bot say something
- \`!roll [sides]\` - Roll a dice` : ''}

${type === 'game' ? `### Controls

- **Arrow Keys** - Move player
- **Space** - Shoot/Action
- **P** - Pause game
- **R** - Reset game` : ''}

${type === 'web-app' || type === 'website' || type === 'react-app' ? `### Features

- Responsive design for all devices
- Modern UI with animations
- Cross-browser compatibility
- Optimized performance` : ''}

${type === 'smart-contract' || type === 'nft-contract' || type === 'defi-protocol' ? `### Smart Contract Functions

- Deploy to testnet/mainnet
- Interact via Hardhat console
- Verify on Etherscan
- Run tests with \`npx hardhat test\`` : ''}

## Project Structure

\`\`\`
${name.toLowerCase().replace(/\s+/g, '-')}/
${type === 'discord-bot' ? `├── bot.js          # Main bot file
├── config.json     # Bot configuration
├── package.json    # Dependencies
└── README.md       # Documentation` : ''}
${type === 'smart-contract' || type === 'nft-contract' || type === 'defi-protocol' ? `├── contracts/      # Solidity contracts
├── scripts/        # Deployment scripts
├── test/           # Contract tests
├── hardhat.config.js
└── README.md` : ''}
${type === 'web-app' || type === 'website' || type === 'game' ? `├── index.html      # Main HTML file
├── style.css       # Styles
├── script.js       # JavaScript
└── README.md       # Documentation` : ''}
${type === 'react-app' ? `├── App.jsx         # Main React component
├── index.html      # HTML template
├── style.css       # Styles
├── package.json    # Dependencies
└── README.md       # Documentation` : ''}
\`\`\`

## Technologies Used

${type === 'discord-bot' ? '- Discord.js\n- Node.js\n- JavaScript' : ''}
${type === 'smart-contract' || type === 'nft-contract' || type === 'defi-protocol' ? '- Solidity\n- Hardhat\n- OpenZeppelin\n- Ethers.js' : ''}
${type === 'web-app' || type === 'website' ? '- HTML5\n- CSS3\n- JavaScript ES6+' : ''}
${type === 'game' ? '- HTML5 Canvas\n- JavaScript\n- CSS3' : ''}
${type === 'react-app' ? '- React 18\n- JavaScript/JSX\n- CSS3' : ''}

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- Built with CrackerBot AI
- Powered by advanced AI code generation
- Designed for developers, by developers

---

*Generated with ❤️ by CrackerBot AI*`;
}

// Error handler wrapper
function handleError(error, context) {
    console.error(`[AI Handler Error - ${context}]:`, error);
    return {
        success: false,
        error: error.message || 'An error occurred',
        context
    };
}

// Main exports
module.exports = {
    processAIModification,
    generateProjectFiles,
    modifyWithClaude,
    modifyWithOpenAI,
    enhancedMockModification,
    extractCodeFromResponse,
    handleError
};

// Initialize on module load
console.log('[AI Handler] Module loaded successfully');
console.log('[AI Handler] Available APIs:', {
    claude: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    mock: true
});