// WEB DEVELOPMENT PROJECT BUILDER
window.buildWebProject = function(name, type, features) {
    console.log('[Web Builder] Building:', name, type, features);
    const files = {};
    
    if (type.includes('Landing Page')) {
        files['index.html'] = generateLandingPageHTML(name, features);
        files['style.css'] = generateLandingPageCSS(features);
        files['app.js'] = generateLandingPageJS(name, features);
    } else if (type.includes('Portfolio')) {
        files['index.html'] = generatePortfolioHTML(name, features);
        files['style.css'] = generatePortfolioCSS(features);
        files['app.js'] = generatePortfolioJS(name);
        files['projects.json'] = '{"projects": []}';
    } else if (type.includes('Blog')) {
        files['index.html'] = generateBlogHTML(name, features);
        files['style.css'] = generateBlogCSS(features);
        files['app.js'] = generateBlogJS(name);
        files['posts.json'] = '{"posts": []}';
    } else if (type.includes('E-commerce')) {
        files['index.html'] = generateEcommerceHTML(name, features);
        files['style.css'] = generateEcommerceCSS(features);
        files['app.js'] = generateEcommerceJS(name);
        files['products.json'] = '{"products": []}';
        files['cart.js'] = generateCartJS();
    } else if (type.includes('Dashboard')) {
        files['index.html'] = generateDashboardHTML(name, features);
        files['style.css'] = generateDashboardCSS(features);
        files['app.js'] = generateDashboardJS(name);
        files['charts.js'] = generateChartsJS();
    }
    
    return files;
};

function generateLandingPageHTML(name, features) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Modern Landing Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="logo">${name}</div>
            <ul class="nav-menu">
                <li><a href="#hero">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>
    
    <section id="hero" class="hero">
        <div class="hero-content">
            <h1 class="hero-title">Welcome to ${name}</h1>
            <p class="hero-subtitle">${features || 'Build something amazing'}</p>
            <button class="cta-button">Get Started</button>
        </div>
    </section>
    
    <section id="features" class="features">
        <div class="container">
            <h2>Features</h2>
            <div class="feature-grid">
                <div class="feature-card">
                    <span class="feature-icon">🚀</span>
                    <h3>Fast Performance</h3>
                    <p>Lightning-fast load times</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">📱</span>
                    <h3>Responsive Design</h3>
                    <p>Works on all devices</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🎨</span>
                    <h3>Modern UI</h3>
                    <p>Beautiful and intuitive</p>
                </div>
            </div>
        </div>
    </section>
    
    <footer>
        <p>&copy; 2024 ${name}. All rights reserved.</p>
    </footer>
    
    <script src="app.js"></script>
</body>
</html>`;
}

function generateLandingPageCSS(features) {
    const isDark = features?.toLowerCase().includes('dark');
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #3498db;
    --secondary: #2ecc71;
    --dark: #2c3e50;
    --light: #ecf0f1;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
    ${isDark ? 'background: #1a1a1a; color: #e0e0e0;' : 'background: var(--light);'}
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    background: ${isDark ? '#000' : 'white'};
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    padding: 1rem 0;
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary);
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    color: ${isDark ? '#e0e0e0' : 'var(--dark)'};
    text-decoration: none;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: var(--primary);
}

.hero {
    margin-top: 60px;
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    text-align: center;
}

.hero-title {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 2rem;
}

.cta-button {
    padding: 12px 30px;
    font-size: 1.1rem;
    background: white;
    color: var(--primary);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: transform 0.3s;
}

.cta-button:hover {
    transform: translateY(-2px);
}

.features {
    padding: 80px 0;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
}

.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.feature-card {
    background: ${isDark ? '#2a2a2a' : 'white'};
    padding: 2rem;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.feature-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
}`;
}

function generateLandingPageJS(name, features) {
    return `// ${name} JavaScript
console.log('${name} loaded!');

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// CTA button
document.querySelector('.cta-button')?.addEventListener('click', () => {
    alert('Let\\'s get started!');
});`;
}

// Add more generator functions for other types...
function generatePortfolioHTML(name, features) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Portfolio</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>${name}</h1>
        <nav>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#skills">Skills</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>
    
    <section id="about">
        <h2>About Me</h2>
        <p>${features || 'Creative developer passionate about building amazing experiences'}</p>
    </section>
    
    <section id="projects">
        <h2>Projects</h2>
        <div class="project-grid"></div>
    </section>
    
    <section id="skills">
        <h2>Skills</h2>
        <div class="skills-container">
            <div class="skill">HTML/CSS</div>
            <div class="skill">JavaScript</div>
            <div class="skill">React</div>
            <div class="skill">Node.js</div>
        </div>
    </section>
    
    <section id="contact">
        <h2>Contact</h2>
        <form id="contact-form">
            <input type="email" placeholder="Your email" required>
            <textarea placeholder="Your message" required></textarea>
            <button type="submit">Send Message</button>
        </form>
    </section>
    
    <script src="app.js"></script>
</body>
</html>`;
}

function generatePortfolioCSS(features) {
    return `/* Portfolio Styles */
body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background: #f5f5f5;
}

header {
    background: #333;
    color: white;
    padding: 2rem;
    text-align: center;
}

nav {
    margin-top: 1rem;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 0 1rem;
}

section {
    padding: 3rem 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

h2 {
    color: #333;
    border-bottom: 2px solid #333;
    padding-bottom: 0.5rem;
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;
}

.skill {
    background: #333;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

#contact-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 500px;
}

#contact-form input,
#contact-form textarea {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

#contact-form button {
    background: #333;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}`;
}

function generatePortfolioJS(name) {
    return `// Portfolio JavaScript
console.log('${name} Portfolio loaded');

// Load projects
fetch('projects.json')
    .then(res => res.json())
    .then(data => {
        const grid = document.querySelector('.project-grid');
        data.projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = \`
                <h3>\${project.title}</h3>
                <p>\${project.description}</p>
                <a href="\${project.link}">View Project</a>
            \`;
            grid.appendChild(card);
        });
    })
    .catch(err => console.log('No projects yet'));

// Contact form
document.getElementById('contact-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Message sent!');
});`;
}

// Stub functions for other types
function generateBlogHTML(name, features) { return '<!-- Blog HTML -->'; }
function generateBlogCSS(features) { return '/* Blog CSS */'; }
function generateBlogJS(name) { return '// Blog JS'; }
function generateEcommerceHTML(name, features) { return '<!-- E-commerce HTML -->'; }
function generateEcommerceCSS(features) { return '/* E-commerce CSS */'; }
function generateEcommerceJS(name) { return '// E-commerce JS'; }
function generateCartJS() { return '// Shopping Cart'; }
function generateDashboardHTML(name, features) { return '<!-- Dashboard HTML -->'; }
function generateDashboardCSS(features) { return '/* Dashboard CSS */'; }
function generateDashboardJS(name) { return '// Dashboard JS'; }
function generateChartsJS() { return '// Charts'; }

console.log('[Web Builder] Loaded');
