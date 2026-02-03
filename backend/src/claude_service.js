// Load environment variables first
import { config } from 'dotenv';
config();

// Claude AI Service for Code Generation
import Anthropic from "@anthropic-ai/sdk";

class ClaudeService {
    constructor() {
        // Initialize with API key from environment
        const apiKey = process.env.ANTHROPIC_API_KEY;
        
        if (!apiKey) {
            console.warn("⚠️ ANTHROPIC_API_KEY not found - Claude service will use fallback responses");
            this.anthropic = null;
            this.isAvailable = false;
        } else {
            try {
                this.anthropic = new Anthropic({
                    apiKey: apiKey,
                });
                this.isAvailable = true;
                console.log("✅ Claude service initialized with API key");
            } catch (error) {
                console.error("❌ Failed to initialize Claude service:", error.message);
                this.anthropic = null;
                this.isAvailable = false;
            }
        }
        
        // Use latest Claude model
        this.model = "claude-3-5-sonnet-20241022";
        this.maxTokens = 4000;
    }

    /**
     * Check if Claude service is available
     * @returns {boolean} True if Claude API is available
     */
    isServiceAvailable() {
        return this.isAvailable && this.anthropic !== null;
    }

    /**
     * Generate project code using Claude
     * @param {string} projectName - Name of the project
     * @param {string} projectType - Type of project (website, app, game, etc.)
     * @param {string} features - Description of desired features
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Generated project files
     */
    async generateProjectCode(projectName, projectType, features, options = {}) {
        console.log(`Claude Service: Generating ${projectType} project "${projectName}"`);
        
        if (!this.isServiceAvailable()) {
            console.log("Claude service unavailable, using template fallback");
            return this.generateTemplateProject(projectName, projectType, features);
        }

        try {
            const prompt = this.buildProjectPrompt(projectName, projectType, features, options);
            
            const message = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: this.maxTokens,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            const response = message.content[0].text;
            const projectFiles = this.parseProjectResponse(response);
            
            if (projectFiles && Object.keys(projectFiles).length > 0) {
                console.log("✅ Claude successfully generated project files");
                return projectFiles;
            } else {
                console.log("⚠️ Claude response parsing failed, using template fallback");
                return this.generateTemplateProject(projectName, projectType, features);
            }

        } catch (error) {
            console.error("❌ Claude generation error:", error.message);
            console.log("Using template fallback due to Claude error");
            return this.generateTemplateProject(projectName, projectType, features);
        }
    }

    /**
     * Build the prompt for Claude
     * @param {string} projectName - Project name
     * @param {string} projectType - Project type
     * @param {string} features - Project features
     * @param {Object} options - Additional options
     * @returns {string} Formatted prompt
     */
    buildProjectPrompt(projectName, projectType, features, options) {
        const { framework = 'vanilla', style = 'modern', complexity = 'intermediate' } = options;
        
        return `Create a complete ${projectType} project called "${projectName}" with the following specifications:

PROJECT DETAILS:
- Name: ${projectName}
- Type: ${projectType}
- Features: ${features}
- Framework: ${framework}
- Style: ${style}
- Complexity: ${complexity}

REQUIREMENTS:
1. Generate THREE complete files: index.html, style.css, and script.js
2. Create a modern, responsive, and interactive ${projectType}
3. Include semantic HTML5 markup
4. Use modern CSS with flexbox/grid, animations, and responsive design
5. Add interactive JavaScript functionality
6. Make it specifically about: ${features}
7. Ensure cross-browser compatibility
8. Include accessibility features (ARIA labels, proper contrast)
9. Add smooth transitions and hover effects
10. Make it mobile-friendly

TECHNICAL SPECIFICATIONS:
- Use semantic HTML elements
- Implement CSS Grid and Flexbox for layouts
- Add CSS animations and transitions
- Include interactive JavaScript features
- Use modern ES6+ JavaScript syntax
- Implement responsive breakpoints
- Add loading states and user feedback

OUTPUT FORMAT:
Return ONLY a valid JSON object in this exact format:
{
    "index.html": "complete HTML content here",
    "style.css": "complete CSS content here", 
    "script.js": "complete JavaScript content here"
}

IMPORTANT: 
- Do not include any explanations, markdown, or additional text
- Only return the JSON object with the three files
- Ensure all code is complete and functional
- Make the content specifically related to: ${features}`;
    }

    /**
     * Parse Claude's response to extract project files
     * @param {string} response - Raw response from Claude
     * @returns {Object|null} Parsed project files or null if parsing fails
     */
    parseProjectResponse(response) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.log("No JSON found in Claude response");
                return null;
            }

            const parsed = JSON.parse(jsonMatch[0]);
            
            // Validate that we have the required files
            const requiredFiles = ['index.html', 'style.css', 'script.js'];
            const hasAllFiles = requiredFiles.every(file => 
                parsed[file] && typeof parsed[file] === 'string' && parsed[file].length > 0
            );

            if (!hasAllFiles) {
                console.log("Missing required files in Claude response");
                return null;
            }

            // Validate content quality
            if (parsed['index.html'].length < 200 || 
                parsed['style.css'].length < 100 || 
                parsed['script.js'].length < 50) {
                console.log("Generated files too short, likely incomplete");
                return null;
            }

            return parsed;

        } catch (error) {
            console.error("Error parsing Claude response:", error.message);
            return null;
        }
    }

    /**
     * Generate a template project as fallback
     * @param {string} projectName - Project name
     * @param {string} projectType - Project type  
     * @param {string} features - Project features
     * @returns {Object} Template project files
     */
    generateTemplateProject(projectName, projectType, features) {
        console.log("Generating template project as fallback");
        
        const templates = {
            website: this.generateWebsiteTemplate(projectName, features),
            app: this.generateAppTemplate(projectName, features),
            game: this.generateGameTemplate(projectName, features),
            dashboard: this.generateDashboardTemplate(projectName, features)
        };

        return templates[projectType] || templates.website;
    }

    /**
     * Generate website template
     */
    generateWebsiteTemplate(projectName, features) {
        return {
            'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - ${features}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <div class="nav-brand">${projectName}</div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="hero-content">
                <h1 class="hero-title">${projectName}</h1>
                <p class="hero-subtitle">Discover amazing ${features}</p>
                <button class="cta-button" onclick="scrollToSection('features')">
                    Explore Features
                </button>
            </div>
        </section>

        <section id="about" class="section">
            <div class="container">
                <h2>About ${projectName}</h2>
                <p>Welcome to ${projectName}, your gateway to exploring ${features}. 
                   Our platform provides an innovative approach to understanding and 
                   interacting with ${features} in ways you've never experienced before.</p>
            </div>
        </section>

        <section id="features" class="section features-section">
            <div class="container">
                <h2>Key Features</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🚀</div>
                        <h3>Fast Performance</h3>
                        <p>Optimized for speed and efficiency</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📱</div>
                        <h3>Responsive Design</h3>
                        <p>Works perfectly on all devices</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h3>Interactive Elements</h3>
                        <p>Engaging user experience</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="section">
            <div class="container">
                <h2>Get In Touch</h2>
                <div class="contact-form">
                    <input type="text" placeholder="Your Name" id="nameInput">
                    <input type="email" placeholder="Your Email" id="emailInput">
                    <textarea placeholder="Your Message" id="messageInput"></textarea>
                    <button onclick="submitContact()">Send Message</button>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2025 ${projectName}. Generated by CrackerBot AI.</p>
    </footer>

    <script src="script.js"></script>
</body>
</html>`,

            'style.css': `/* Modern CSS for ${projectName} */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.header {
    position: fixed;
    top: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    transition: all 0.3s ease;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: #5a67d8;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: #5a67d8;
}

.hero {
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
}

.hero-content {
    animation: fadeInUp 1s ease-out;
}

.hero-title {
    font-size: 4rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-button {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
}

.section {
    padding: 5rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.section h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #5a67d8;
}

.features-section {
    background: #f8f9ff;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-10px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.contact-form {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.contact-form input,
.contact-form textarea {
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
    outline: none;
    border-color: #5a67d8;
}

.contact-form button {
    background: #5a67d8;
    color: white;
    border: none;
    padding: 1rem;
    font-size: 1rem;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.contact-form button:hover {
    background: #4c51bf;
}

.footer {
    background: #2d3748;
    color: white;
    text-align: center;
    padding: 2rem;
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
    .hero-title {
        font-size: 2.5rem;
    }
    
    .nav-menu {
        display: none;
    }
    
    .container {
        padding: 0 1rem;
    }
}`,

            'script.js': `// Interactive JavaScript for ${projectName}
console.log('${projectName} loaded successfully!');
console.log('Features: ${features}');

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Contact form submission
function submitContact() {
    const name = document.getElementById('nameInput').value;
    const email = document.getElementById('emailInput').value;
    const message = document.getElementById('messageInput').value;
    
    if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
    }
    
    // Simulate form submission
    alert(\`Thank you, \${name}! Your message has been sent.\`);
    
    // Clear form
    document.getElementById('nameInput').value = '';
    document.getElementById('emailInput').value = '';
    document.getElementById('messageInput').value = '';
}

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Animate feature cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out';
        }
    });
}, observerOptions);

// Observe all feature cards
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        observer.observe(card);
    });
    
    // Add click handlers to navigation links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            scrollToSection(sectionId);
        });
    });
});

// Interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    console.log('${projectName} - All interactive features initialized!');
});`
        };
    }

    /**
     * Generate app template
     */
    generateAppTemplate(projectName, features) {
        // Similar structure but for app-style layout
        return this.generateWebsiteTemplate(projectName, features);
    }

    /**
     * Generate game template  
     */
    generateGameTemplate(projectName, features) {
        // Similar structure but for game-style layout
        return this.generateWebsiteTemplate(projectName, features);
    }

    /**
     * Generate dashboard template
     */
    generateDashboardTemplate(projectName, features) {
        // Similar structure but for dashboard-style layout
        return this.generateWebsiteTemplate(projectName, features);
    }

    /**
     * Generate a simple response using Claude
     * @param {string} prompt - The prompt to send to Claude
     * @param {Object} options - Additional options
     * @returns {Promise<string>} Claude's response
     */
    async generateResponse(prompt, options = {}) {
        if (!this.isServiceAvailable()) {
            return "Claude service is currently unavailable. Please check your API key configuration.";
        }

        try {
            const message = await this.anthropic.messages.create({
                model: this.model,
                max_tokens: options.maxTokens || 1000,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            });

            return message.content[0].text;

        } catch (error) {
            console.error("Claude response error:", error.message);
            return "I'm having trouble generating a response right now. Please try again later.";
        }
    }
}

// Export the service
export default ClaudeService;

// Named export for convenience
export { ClaudeService };