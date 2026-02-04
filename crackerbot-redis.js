// crackerbot-redis.js - COMPLETELY CLEAN VERSION - No completeBuilding interference
// Provides project persistence and backend sync without ANY build interference

window.initializeProjects = function() {
    window.projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    
    if (window.socket && window.socket.connected) {
        window.socket.emit("get_projects_list");
    }
};

// Save project to Redis backend
window.saveProjectToRedis = function(project) {
    if (!project || !window.socket) return;
    
    console.log("[Redis] Saving project to backend:", project.projectName);
    
    const projectData = {
        projectName: project.projectName,
        projectType: project.projectType,
        projectTypeName: project.projectTypeName,
        features: project.features,
        files: project.files,
        createdAt: project.createdAt || new Date().toISOString(),
        id: project.id || Date.now().toString()
    };
    
    // Save to Redis backend
    window.socket.emit("save_project", projectData);
    
    // Also save locally for backup
    const localProjects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    const existingIndex = localProjects.findIndex(p => p.id === projectData.id);
    
    if (existingIndex >= 0) {
        localProjects[existingIndex] = projectData;
    } else {
        localProjects.push(projectData);
    }
    
    localStorage.setItem("crackerBotProjects", JSON.stringify(localProjects));
    console.log("[Redis] Project saved locally and to Redis");
};

// Get project from Redis
window.getProjectFromRedis = function(projectId) {
    if (!window.socket) return null;
    
    window.socket.emit("get_project", { id: projectId });
    return new Promise((resolve) => {
        window.socket.once("project_data", (data) => {
            resolve(data.project);
        });
    });
};

// Delete project from Redis
window.deleteProjectFromRedis = function(projectId) {
    if (!window.socket) return;
    
    window.socket.emit("delete_project", { id: projectId });
    
    // Also remove locally
    const localProjects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    const filtered = localProjects.filter(p => p.id !== projectId);
    localStorage.setItem("crackerBotProjects", JSON.stringify(filtered));
    
    console.log("[Redis] Project deleted from Redis and local storage");
};

// Update project in Redis
window.updateProjectInRedis = function(projectId, updates) {
    if (!window.socket) return;
    
    window.socket.emit("update_project", { id: projectId, updates });
    
    // Also update locally
    const localProjects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
    const project = localProjects.find(p => p.id === projectId);
    if (project) {
        Object.assign(project, updates);
        localStorage.setItem("crackerBotProjects", JSON.stringify(localProjects));
    }
    
    console.log("[Redis] Project updated in Redis and local storage");
};

// COMPLETELY REMOVED: All completeBuilding override code
// Let main.js handle all build completion without interference

// Setup socket listeners for project sync
function setupSocketListeners() {
    if (window.socket) {
        window.socket.on("projects_list", (data) => {
            if (data.projects && Array.isArray(data.projects)) {
                const localProjects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
                
                // Merge Redis projects with local projects
                const merged = [...localProjects];
                data.projects.forEach(redisProject => {
                    const exists = merged.find(p => p.id === redisProject.id);
                    if (!exists) {
                        merged.push(redisProject);
                    }
                });
                
                localStorage.setItem("crackerBotProjects", JSON.stringify(merged));
                console.log("[Redis] Synced projects from Redis backend");
            }
        });

        window.socket.on("project_saved", (data) => {
            console.log("[Redis] Project saved confirmation:", data.message);
        });

        window.socket.on("project_deleted", (data) => {
            console.log("[Redis] Project deleted confirmation:", data.message);
        });

        window.socket.on("project_updated", (data) => {
            console.log("[Redis] Project updated confirmation:", data.message);
        });
    }
}

// Initialize when socket connects
if (window.socket && window.socket.connected) {
    setupSocketListeners();
} else {
    // Wait for socket connection
    const checkSocket = setInterval(() => {
        if (window.socket && window.socket.connected) {
            setupSocketListeners();
            clearInterval(checkSocket);
        }
    }, 500);
}

console.log("[Redis] ✅ Clean Redis system loaded - NO build interference whatsoever");