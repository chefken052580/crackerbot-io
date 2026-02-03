// Project System - Clean Version Without Duplicate Build Messages
console.log("🚀 Loading CrackerBot Project System...");

// Project categories with proper definitions
window.PROJECT_CATEGORIES = {
    "Web Development": {
        icon: "🌐",
        color: "#4F46E5",
        projects: [
            { name: "Static Website", type: "static-website", description: "HTML, CSS, and JavaScript website" },
            { name: "React App", type: "react-app", description: "Modern React application" },
            { name: "Vue.js App", type: "vue-app", description: "Vue.js single page application" },
            { name: "Next.js App", type: "nextjs-app", description: "Full-stack React framework" },
            { name: "Portfolio Site", type: "portfolio", description: "Personal portfolio website" }
        ]
    },
    "Web3 & Blockchain": {
        icon: "⛓️",
        color: "#F59E0B",
        projects: [
            { name: "Smart Contract", type: "smart-contract", description: "Ethereum smart contract" },
            { name: "NFT Collection", type: "nft-contract", description: "NFT minting contract" },
            { name: "DeFi Protocol", type: "defi-protocol", description: "Decentralized finance protocol" },
            { name: "DAO Contract", type: "dao-contract", description: "Decentralized autonomous organization" },
            { name: "Token Contract", type: "token-contract", description: "ERC-20 token contract" }
        ]
    },
    "Games & Interactive": {
        icon: "🎮",
        color: "#EC4899",
        projects: [
            { name: "Browser Game", type: "browser-game", description: "HTML5 canvas game" },
            { name: "3D Experience", type: "three-js-app", description: "Three.js 3D application" },
            { name: "Interactive Story", type: "interactive-story", description: "Choose your own adventure" },
            { name: "Puzzle Game", type: "puzzle-game", description: "Brain teaser game" }
        ]
    },
    "Bots & Automation": {
        icon: "🤖",
        color: "#10B981",
        projects: [
            { name: "Discord Bot", type: "discord-bot", description: "Discord chat bot" },
            { name: "Telegram Bot", type: "telegram-bot", description: "Telegram messenger bot" },
            { name: "Trading Bot", type: "trading-bot", description: "Automated trading system" },
            { name: "Web Scraper", type: "web-scraper", description: "Data collection bot" }
        ]
    },
    "Mobile & Apps": {
        icon: "📱",
        color: "#8B5CF6",
        projects: [
            { name: "Mobile App", type: "mobile-app", description: "React Native mobile app" },
            { name: "PWA", type: "pwa", description: "Progressive web application" },
            { name: "Chrome Extension", type: "chrome-extension", description: "Browser extension" },
            { name: "Desktop App", type: "desktop-app", description: "Electron desktop application" }
        ]
    },
    "AI & Machine Learning": {
        icon: "🧠",
        color: "#F97316",
        projects: [
            { name: "Chatbot", type: "ai-chatbot", description: "AI-powered chatbot" },
            { name: "ML Model", type: "ml-model", description: "Machine learning model" },
            { name: "Image Classifier", type: "image-classifier", description: "AI image recognition" },
            { name: "Text Analyzer", type: "text-analyzer", description: "Natural language processing" }
        ]
    }
};

// Show category popup - REMOVED DUPLICATE BUILD MESSAGE
window.showCategoryPopup = function() {
    console.log("[Projects] Showing category popup...");
    
    const overlay = document.getElementById("project-modal-overlay");
    const modal = document.getElementById("project-type-modal");
    const grid = document.getElementById("project-types-grid");
    
    if (!overlay || !modal || !grid) {
        console.error("[Projects] Modal elements not found");
        return;
    }
    
    // Clear existing content
    grid.innerHTML = "";
    
    // Create category cards
    Object.keys(PROJECT_CATEGORIES).forEach(categoryName => {
        const category = PROJECT_CATEGORIES[categoryName];
        
        const categoryCard = document.createElement("div");
        categoryCard.className = "project-category-card";
        categoryCard.style.cssText = `
            background: linear-gradient(135deg, ${category.color}20, ${category.color}10);
            border: 2px solid ${category.color}50;
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            margin: 10px;
        `;
        
        categoryCard.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 10px;">${category.icon}</div>
            <h3 style="color: #00ff88; margin-bottom: 10px; font-size: 18px;">${categoryName}</h3>
            <p style="color: #888; font-size: 14px;">${category.projects.length} project types</p>
        `;
        
        categoryCard.onclick = () => showProjectsInCategory(categoryName);
        
        categoryCard.onmouseenter = function() {
            this.style.transform = "translateY(-5px)";
            this.style.borderColor = category.color;
            this.style.background = `linear-gradient(135deg, ${category.color}30, ${category.color}20)`;
        };
        
        categoryCard.onmouseleave = function() {
            this.style.transform = "translateY(0)";
            this.style.borderColor = category.color + "50";
            this.style.background = `linear-gradient(135deg, ${category.color}20, ${category.color}10)`;
        };
        
        grid.appendChild(categoryCard);
    });
    
    // Show modal
    overlay.style.display = "block";
    modal.style.display = "block";
    
    setTimeout(() => {
        overlay.classList.add("show");
    }, 10);
};

// Show projects in specific category
window.showProjectsInCategory = function(categoryName) {
    console.log("[Projects] Showing projects in category:", categoryName);
    
    const category = PROJECT_CATEGORIES[categoryName];
    const grid = document.getElementById("project-types-grid");
    
    if (!grid || !category) return;
    
    // Clear and show back button
    grid.innerHTML = `
        <div class="back-button" onclick="showCategoryPopup()" style="
            grid-column: 1 / -1;
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00ff88;
            border-radius: 10px;
            padding: 10px 20px;
            cursor: pointer;
            text-align: center;
            color: #00ff88;
            margin-bottom: 20px;
            transition: all 0.3s;
        ">
            ← Back to Categories
        </div>
    `;
    
    // Add project cards
    category.projects.forEach(project => {
        const projectCard = document.createElement("div");
        projectCard.className = "project-type-card";
        projectCard.style.cssText = `
            background: linear-gradient(135deg, ${category.color}20, ${category.color}10);
            border: 2px solid ${category.color}50;
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            margin: 10px;
        `;
        
        projectCard.innerHTML = `
            <div style="font-size: 36px; margin-bottom: 10px;">${category.icon}</div>
            <h4 style="color: #00ff88; margin-bottom: 5px; font-size: 16px;">${project.name}</h4>
            <p style="color: #888; font-size: 12px;">${project.description}</p>
        `;
        
        projectCard.onclick = () => selectProjectType(project, categoryName);
        
        projectCard.onmouseenter = function() {
            this.style.transform = "translateY(-5px)";
            this.style.borderColor = category.color;
            this.style.background = `linear-gradient(135deg, ${category.color}30, ${category.color}20)`;
        };
        
        projectCard.onmouseleave = function() {
            this.style.transform = "translateY(0)";
            this.style.borderColor = category.color + "50";
            this.style.background = `linear-gradient(135deg, ${category.color}20, ${category.color}10)`;
        };
        
        grid.appendChild(projectCard);
    });
};

// Select project type and start building - REMOVED DUPLICATE BUILD MESSAGE
window.selectProjectType = function(project, categoryName) {
    console.log("[Projects] Selected project type:", project.name);
    
    // Close modal
    const overlay = document.getElementById("project-modal-overlay");
    const modal = document.getElementById("project-type-modal");
    if (overlay) overlay.style.display = "none";
    if (modal) modal.style.display = "none";
    
    // Update current task
    if (window.currentTask) {
        window.currentTask.projectType = project.type;
        window.currentTask.projectTypeName = project.name;
        window.currentTask.category = categoryName;
        window.currentTask.description = project.description;
        
        console.log("[Projects] Updated current task:", window.currentTask);
        
        // REMOVED: Duplicate "Building your..." message - let main.js handle all build messages
        
        // Ask for features
        if (window.setTaskPending) {
            window.setTaskPending({
                question: `Perfect choice! What features would you like?`,
                step: "features",
                placeholder: "Describe what you want to build..."
            });
        }
        
        // Update task status if function exists
        if (window.updateTaskStatus) {
            window.updateTaskStatus();
        }
    } else {
        console.error("[Projects] No current task found");
    }
};

// Close project modal
window.closeProjectModal = function() {
    const overlay = document.getElementById("project-modal-overlay");
    const modal = document.getElementById("project-type-modal");
    if (overlay) overlay.style.display = "none";
    if (modal) modal.style.display = "none";
};

// Initialize project system
function initializeProjectSystem() {
    console.log("[Projects] Initializing project system...");
    
    // Ensure modal elements exist
    if (!document.getElementById("project-modal-overlay")) {
        console.log("[Projects] Creating modal elements...");
        
        const overlay = document.createElement("div");
        overlay.id = "project-modal-overlay";
        overlay.className = "modal-overlay";
        
        const modal = document.createElement("div");
        modal.id = "project-type-modal";
        modal.className = "project-type-modal";
        modal.innerHTML = `
            <button class="modal-close-btn" onclick="closeProjectModal()">×</button>
            <h2>🚀 Choose Your Project Type</h2>
            <div class="project-types-grid" id="project-types-grid"></div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProjectSystem);
} else {
    initializeProjectSystem();
}

console.log("✅ CrackerBot Project System loaded - NO DUPLICATE BUILD MESSAGES!");