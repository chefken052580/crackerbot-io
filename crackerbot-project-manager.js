// Complete Project Manager with ALL PROJECT TYPES - Updated for 67 Project Types

window.showProjectsManager = function() {
    console.log("[Projects] Opening projects manager...");
    
    try {
        // Get projects from localStorage or global
        const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");

        // Remove any existing modal (prevent duplicates)
        const existing = document.getElementById("projects-manager");
        if (existing) {
            existing.remove();
        }

        // Create modal overlay (full screen background)
        const overlay = document.createElement("div");
        overlay.id = "projects-manager";
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        // Create the modal content box
        const modal = document.createElement("div");
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #0a0e1b);
            border: 3px solid #00ff88;
            border-radius: 20px;
            padding: 30px;
            width: 90%;
            max-width: 1000px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);
            position: relative;
            animation: modalSlide 0.3s ease;
        `;

        // Create header
        const header = document.createElement("div");
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #00ff88;
            padding-bottom: 15px;
        `;
        
        const title = document.createElement("h2");
        title.textContent = `📁 Your Cosmic Projects (${projects.length})`;
        title.style.cssText = `
            color: #00ff88;
            margin: 0;
            font-size: 24px;
            text-transform: uppercase;
            letter-spacing: 1px;
        `;
        
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "✕";
        closeBtn.style.cssText = `
            background: #ff4444;
            border: none;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
        `;
        closeBtn.onmouseover = () => closeBtn.style.transform = "scale(1.1)";
        closeBtn.onmouseout = () => closeBtn.style.transform = "scale(1)";
        closeBtn.onclick = () => overlay.remove();
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modal.appendChild(header);

        // Create projects grid
        const projectsGrid = document.createElement("div");
        projectsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            min-height: 200px;
        `;

        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    color: #888;
                    padding: 40px;
                    font-size: 18px;
                ">
                    🌌 No projects yet<br>
                    <small style="color: #666;">Build something epic first!</small>
                </div>
            `;
        } else {
            projects.forEach((project, index) => {
                const card = document.createElement("div");
                card.style.cssText = `
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid #00ff88;
                    border-radius: 10px;
                    padding: 15px;
                    color: white;
                    text-align: center;
                    transition: all 0.2s ease;
                    cursor: pointer;
                `;
                
                card.onmouseover = () => {
                    card.style.transform = "scale(1.05)";
                    card.style.boxShadow = "0 0 20px rgba(0, 255, 136, 0.3)";
                };
                card.onmouseout = () => {
                    card.style.transform = "scale(1)";
                    card.style.boxShadow = "none";
                };
                
                const icon = getProjectIcon(project.projectType);
                const name = (project.projectName || "Unnamed Project").substring(0, 30) + 
                           (project.projectName && project.projectName.length > 30 ? "..." : "");
                const type = project.projectTypeName || project.projectType || "Unknown";
                const category = project.projectCategory || "";
                const date = project.completedAt ? new Date(project.completedAt).toLocaleDateString() : "Recent";
                
                card.innerHTML = `
                    <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
                    <div style="color: #00ff88; font-weight: bold; font-size: 16px; margin-bottom: 5px;" title="${project.projectName || 'Unnamed Project'}">${name}</div>
                    <div style="color: #00ccff; font-size: 12px; margin-bottom: 3px;">${type}</div>
                    ${category ? `<div style="color: #888; font-size: 10px; margin-bottom: 5px;">${category}</div>` : ''}
                    <div style="color: #888; font-size: 10px; margin-bottom: 15px;">${date}</div>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button onclick="previewProject(${index})" style="
                            padding: 6px 10px; 
                            background: rgba(0,255,136,0.2); 
                            border: 1px solid #00ff88; 
                            color: #00ff88; 
                            border-radius: 5px; 
                            cursor: pointer;
                            font-size: 12px;
                            transition: all 0.2s ease;
                        " title="Preview" onmouseover="this.style.background='rgba(0,255,136,0.4)'" onmouseout="this.style.background='rgba(0,255,136,0.2)'">👁️</button>
                        <button onclick="downloadProject(${index})" style="
                            padding: 6px 10px; 
                            background: rgba(0,204,255,0.2); 
                            border: 1px solid #00ccff; 
                            color: #00ccff; 
                            border-radius: 5px; 
                            cursor: pointer;
                            font-size: 12px;
                            transition: all 0.2s ease;
                        " title="Download" onmouseover="this.style.background='rgba(0,204,255,0.4)'" onmouseout="this.style.background='rgba(0,204,255,0.2)'">📥</button>
                        <button onclick="deleteProject(${index})" style="
                            padding: 6px 10px; 
                            background: rgba(255,68,68,0.2); 
                            border: 1px solid #ff4444; 
                            color: #ff4444; 
                            border-radius: 5px; 
                            cursor: pointer;
                            font-size: 12px;
                            transition: all 0.2s ease;
                        " title="Delete" onmouseover="this.style.background='rgba(255,68,68,0.4)'" onmouseout="this.style.background='rgba(255,68,68,0.2)'">🗑️</button>
                    </div>
                `;
                
                projectsGrid.appendChild(card);
            });
        }

        modal.appendChild(projectsGrid);

        // Create footer with actions
        const footer = document.createElement("div");
        footer.style.cssText = `
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #333;
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        `;
        
        footer.innerHTML = `
            <button onclick="clearAllProjects()" style="
                padding: 8px 15px;
                background: rgba(255,68,68,0.2);
                border: 1px solid #ff4444;
                color: #ff4444;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(255,68,68,0.4)'" onmouseout="this.style.background='rgba(255,68,68,0.2)'">🗑️ Clear All</button>
            <button onclick="exportAllProjects()" style="
                padding: 8px 15px;
                background: rgba(0,204,255,0.2);
                border: 1px solid #00ccff;
                color: #00ccff;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(0,204,255,0.4)'" onmouseout="this.style.background='rgba(0,204,255,0.2)'">📤 Export</button>
            <button onclick="importProjects()" style="
                padding: 8px 15px;
                background: rgba(0,255,136,0.2);
                border: 1px solid #00ff88;
                color: #00ff88;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(0,255,136,0.4)'" onmouseout="this.style.background='rgba(0,255,136,0.2)'">📥 Import</button>
        `;
        
        modal.appendChild(footer);
        overlay.appendChild(modal);

        // Add to page
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        
        // Close on Escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);

        console.log("[Projects] Modal opened successfully");
        
    } catch (error) {
        console.error("[Projects] Error opening modal:", error);
        alert("Error loading projects: " + error.message);
    }
};

// UPDATED: Complete icon mapping for all 67 project types across 12 categories
window.getProjectIcon = function(type) {
    const icons = {
        // 🌐 Web Development (7 types)
        "static website": "🌐",
        "landing page": "🚀", 
        "portfolio site": "👤",
        "blog": "📝",
        "e-commerce": "🛒",
        "dashboard": "📊",
        "documentation": "📚",
        
        // ⚛️ Frontend Frameworks (6 types)
        "react app": "⚛️",
        "vue app": "💚",
        "angular app": "🅰️",
        "next.js app": "▲",
        "nextjs app": "▲",
        "svelte app": "🧡",
        "remix app": "💿",
        
        // 🎮 Games (8 types)
        "2d platformer": "🎮",
        "puzzle game": "🧩",
        "card game": "🃏",
        "space shooter": "🚀",
        "rpg game": "🗡️",
        "multiplayer": "👥",
        "racing game": "🏎️",
        "tower defense": "🏰",
        
        // 🤖 Bots & Automation (8 types)
        "discord bot": "🤖",
        "telegram bot": "💬",
        "twitter bot": "🐦",
        "slack bot": "📢",
        "whatsapp bot": "📱",
        "trading bot": "📈",
        "web scraper": "🕷️",
        "email bot": "📧",
        
        // 💎 Blockchain & Web3 (8 types)
        "smart contract": "📜",
        "nft collection": "🎨",
        "defi protocol": "💰",
        "dao": "🏛️",
        "token": "🪙",
        "web3 dapp": "🌐",
        "wallet": "💼",
        "dex": "🔄",
        
        // 🚀 Backend & APIs (8 types)
        "rest api": "🔌",
        "graphql": "📊",
        "websocket": "⚡",
        "microservice": "🔧",
        "serverless": "☁️",
        "database api": "🗄️",
        "auth service": "🔐",
        "payment api": "💳",
        
        // 📱 Mobile Apps (6 types)
        "react native": "📱",
        "flutter": "📱",
        "ionic": "📱",
        "pwa": "📱",
        "ios app": "🍎",
        "android app": "🤖",
        
        // 🧠 AI & Machine Learning (7 types)
        "ml model": "🧠",
        "neural network": "🧠",
        "computer vision": "👁️",
        "nlp model": "💬",
        "chatbot": "🤖",
        "recommendation": "🎯",
        "prediction": "🔮",
        
        // 🎨 Creative & Design (7 types)
        "3d scene": "🎲",
        "animation": "🎬",
        "canvas art": "🎨",
        "svg graphics": "🖼️",
        "shader art": "✨",
        "generative art": "🎨",
        "image editor": "🖼️",
        
        // ⚙️ Tools & Utilities (7 types)
        "cli tool": "⌨️",
        "chrome extension": "🧩",
        "vs code extension": "💻",
        "desktop app": "💻",
        "package/library": "📦",
        "automation": "🔄",
        "converter": "🔄",
        
        // 📊 Data & Analytics (5 types)
        "visualization": "📈",
        "report generator": "📋",
        "data pipeline": "🔄",
        "analytics tool": "📊",
        
        // 🔧 DevOps & Cloud (5 types)
        "docker setup": "🐳",
        "ci/cd pipeline": "🔄",
        "kubernetes": "☸️",
        "terraform": "🏗️",
        "monitoring": "📡",
        
        // Legacy/Backward compatibility
        "web": "🌐",
        "web-app": "🌐", 
        "game": "🎮",
        "bot": "🤖",
        "api": "⚡",
        "mobile": "📱",
        "cli": "⌨️",
        "ml": "🧠",
        "ai": "🧠",
        "blockchain": "⛓️",
        "explorer": "🔍",
        "nft": "🎨",
        "defi": "💰",
        "data": "📊",
        "tool": "🔧",
        "script": "📜",
        "desktop": "💻",
        "default": "📁"
    };
    
    return icons[type?.toLowerCase()] || icons.default;
};

window.previewProject = function(index) {
    const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    const project = projects[index];
    
    if (project && window.showPreviewPopup) {
        window.showPreviewPopup(project, window.socket);
    } else if (project) {
        alert("Preview system loading...");
    }
};

window.downloadProject = function(index) {
    const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    const project = projects[index];
    
    if (!project) {
        alert("Project not found!");
        return;
    }
    
    // Generate and download project files
    if (window.generateProjectFiles && typeof JSZip !== "undefined") {
        const files = window.generateProjectFiles(project);
        const zip = new JSZip();
        
        files.forEach(file => {
            zip.file(file.name, file.content);
        });
        
        zip.generateAsync({ type: "blob" }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${project.projectName.toLowerCase().replace(/\s+/g, "-")}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            if (window.addMessage) {
                window.addMessage("System", `📥 Downloaded "${project.projectName}"`, "system");
            }
        });
    } else {
        // Load JSZip if needed
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.onload = () => downloadProject(index);
        document.body.appendChild(script);
    }
};

window.deleteProject = function(index) {
    const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    const project = projects[index];
    
    if (!project) {
        alert("Project not found!");
        return;
    }
    
    const confirmDelete = confirm(`Delete "${project.projectName}"?\n\nThis action cannot be undone!`);
    
    if (confirmDelete) {
        // Remove from array
        projects.splice(index, 1);
        
        // Save updated array
        localStorage.setItem("crackerBotProjects", JSON.stringify(projects));
        
        // Update global variable if it exists
        if (window.projects) {
            window.projects = projects;
        }
        
        // Show message
        if (window.addMessage) {
            window.addMessage("System", `🗑️ Deleted "${project.projectName}"`, "system");
        }
        
        // Refresh the projects manager
        showProjectsManager();
    }
};

window.clearAllProjects = function() {
    const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    
    if (projects.length === 0) {
        alert("No projects to clear!");
        return;
    }
    
    const confirmClear = confirm(`Delete ALL ${projects.length} projects?\n\nThis action cannot be undone!`);
    
    if (confirmClear) {
        const doubleConfirm = confirm("Are you REALLY sure? All projects will be permanently deleted!");
        
        if (doubleConfirm) {
            localStorage.setItem("crackerBotProjects", JSON.stringify([]));
            if (window.projects) {
                window.projects = [];
            }
            
            if (window.addMessage) {
                window.addMessage("System", "🗑️ All projects cleared!", "system");
            }
            
            showProjectsManager();
        }
    }
};

window.exportAllProjects = function() {
    const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    
    if (projects.length === 0) {
        alert("No projects to export!");
        return;
    }
    
    const dataStr = JSON.stringify(projects, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crackerbot-projects-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.addMessage) {
        window.addMessage("System", `📤 Exported ${projects.length} projects`, "system");
    }
};

window.importProjects = function() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                
                if (!Array.isArray(imported)) {
                    alert("Invalid projects file!");
                    return;
                }
                
                const current = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
                const merged = [...current, ...imported];
                
                localStorage.setItem("crackerBotProjects", JSON.stringify(merged));
                if (window.projects) {
                    window.projects = merged;
                }
                
                if (window.addMessage) {
                    window.addMessage("System", `📥 Imported ${imported.length} projects`, "system");
                }
                
                showProjectsManager();
            } catch (err) {
                alert("Error importing projects: " + err.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
};

// Auto-save function for current project
window.autoSaveCurrentProject = function() {
    if (window.currentTask && window.currentTask.completed) {
        const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
        
        // Check if already saved
        const exists = projects.find(p => 
            p.projectName === window.currentTask.projectName && 
            p.completedAt === window.currentTask.completedAt
        );
        
        if (!exists) {
            projects.push({...window.currentTask});
            localStorage.setItem("crackerBotProjects", JSON.stringify(projects));
            if (window.projects) {
                window.projects = projects;
            }
            console.log("Auto-saved project:", window.currentTask.projectName);
        }
    }
};

// Set up auto-save interval
setInterval(autoSaveCurrentProject, 5000);

// Ensure CSS animations exist
if (!document.getElementById('projects-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'projects-modal-styles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes modalSlide {
            from { 
                opacity: 0; 
                transform: translateY(-50px) scale(0.9); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }
        
        /* Ensure modal is always on top */
        #projects-manager {
            z-index: 10000 !important;
        }
    `;
    document.head.appendChild(style);
}

console.log("✅ Complete Projects Manager with ALL 67 project types loaded!");