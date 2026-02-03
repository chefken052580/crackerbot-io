window.showProjectsManager = function() {
    console.log("[Projects] Opening simple working modal...");
    
    // Remove existing
    const existing = document.getElementById("projects-manager");
    if (existing) existing.remove();
    
    // Create simple modal that we know works
    const overlay = document.createElement("div");
    overlay.id = "projects-manager";
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.8) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 999999 !important;
    `;
    
    const projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    
    overlay.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #0a0e1b); border: 3px solid #00ff88; border-radius: 20px; padding: 30px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <h2 style="color: #00ff88; margin-bottom: 20px;">📁 Your Cosmic Projects (${projects.length})</h2>
            <div style="color: white;">
                ${projects.length > 0 ? 
                    projects.map(p => `<div style="margin: 10px 0; padding: 10px; border: 1px solid #00ff88; border-radius: 5px;">
                        <strong>${p.projectName || 'Unnamed Project'}</strong><br>
                        <small>${p.projectType || 'Unknown type'}</small>
                    </div>`).join('') : 
                    '<p>No projects yet. Build something epic!</p>'
                }
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
};

