// BACKEND & CLAUDE CONFIGURATION - Single source of truth
// This is the ONLY file for backend/Claude settings

window.BACKEND = {
    url: "https://crackerbot.io",
    claudeEnabled: true,
    
    async generateProject(projectData) {
        try {
            const response = await fetch(`${this.url}/api/generate-project`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(projectData)
            });
            return await response.json();
        } catch (error) {
            console.error("Backend error:", error);
            return null;
        }
    },
    
    async updateCode(currentCode, fileType, request) {
        try {
            const response = await fetch(`${this.url}/api/ai-update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentCode, fileType, request })
            });
            const data = await response.json();
            return data.code;
        } catch (error) {
            console.error("AI update error:", error);
            return currentCode;
        }
    }
};
