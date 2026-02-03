// BUILD TRACKER - Visual feedback for build process

window.showBuildTracker = function() {
    const existing = document.getElementById("build-tracker");
    if (existing) existing.remove();
    
    const tracker = document.createElement("div");
    tracker.id = "build-tracker";
    tracker.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        max-height: 400px;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #00ff88;
        border-radius: 10px;
        padding: 15px;
        z-index: 999;
        overflow-y: auto;
        box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    `;
    
    tracker.innerHTML = `
        <h4 style="color: #00ff88; margin: 0 0 10px 0; font-size: 14px;">
            📝 Build Log
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="float: right; background: transparent; border: none; color: #ff4444; cursor: pointer;">✕</button>
        </h4>
        <div id="build-steps" style="font-family: monospace; font-size: 11px; color: #0F0;"></div>
    `;
    
    document.body.appendChild(tracker);
};

window.addBuildStep = function(step, status = "pending") {
    const stepsDiv = document.getElementById("build-steps");
    if (!stepsDiv) {
        showBuildTracker();
        return addBuildStep(step, status);
    }
    
    const stepDiv = document.createElement("div");
    const icons = { 
        pending: "⏳", 
        running: "🔄", 
        success: "✅", 
        error: "❌" 
    };
    const colors = { 
        pending: "#888", 
        running: "#00ccff", 
        success: "#00ff88", 
        error: "#ff4444" 
    };
    
    stepDiv.style.cssText = `
        margin: 5px 0; 
        padding: 5px; 
        border-left: 2px solid ${colors[status]}; 
        color: ${colors[status]};
    `;
    stepDiv.innerHTML = `${icons[status]} ${step}`;
    
    stepsDiv.appendChild(stepDiv);
    stepsDiv.scrollTop = stepsDiv.scrollHeight;
};

window.updateProgress = function(percent, status) {
    const bar = document.getElementById("progress-bar");
    const text = document.getElementById("progress-text");
    const statusEl = document.getElementById("task-status");
    
    if (bar) {
        bar.style.width = percent + "%";
        bar.style.background = `linear-gradient(90deg, #00ff88 0%, #00ccff ${percent}%, #8a2be2 100%)`;
    }
    
    if (text) text.textContent = percent + "%";
    if (statusEl) statusEl.textContent = status;
};

console.log("[Tracker] Build tracker loaded");
