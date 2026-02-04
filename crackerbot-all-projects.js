// COMPLETE PROJECT TYPES SYSTEM - All 20+ types with FIXED Live Editor Integration

window.ALL_PROJECT_TYPES = {
    "web-app": {
        display: "🌐 Web App",
        files: ["index.html", "styles.css", "app.js"],
        description: "Interactive web application"
    },
    "game": {
        display: "🎮 Game",
        files: ["index.html", "game.js", "style.css", "sprites.js", "levels.json"],
        description: "Browser-based game"
    },
    "discord-bot": {
        display: "🤖 Discord Bot",
        files: ["bot.js", "commands.js", "events.js", "config.json", "package.json"],
        description: "Discord bot with commands"
    },
    "telegram-bot": {
        display: "📱 Telegram Bot",
        files: ["bot.py", "handlers.py", "keyboards.py", "config.py", "requirements.txt"],
        description: "Telegram bot in Python"
    },
    "smart-contract": {
        display: "💎 Smart Contract",
        files: ["Contract.sol", "deploy.js", "test.js", "hardhat.config.js"],
        description: "Ethereum smart contract"
    },
    "nft-contract": {
        display: "🖼️ NFT Contract",
        files: ["NFT.sol", "metadata.json", "mint.js", "deploy.js", "hardhat.config.js"],
        description: "NFT minting contract"
    },
    "defi-protocol": {
        display: "💰 DeFi Protocol",
        files: ["Protocol.sol", "Token.sol", "Staking.sol", "Vault.sol", "deploy.js"],
        description: "DeFi protocol suite"
    },
    "api-server": {
        display: "🚀 API Server",
        files: ["server.js", "routes.js", "middleware.js", "database.js", "package.json"],
        description: "REST API backend"
    },
    "react-app": {
        display: "⚛️ React App",
        files: ["App.jsx", "index.js", "App.css", "components/Header.jsx", "package.json"],
        description: "React application"
    },
    "vue-app": {
        display: "💚 Vue App",
        files: ["App.vue", "main.js", "style.css", "components/Home.vue", "package.json"],
        description: "Vue.js application"
    },
    "mobile-app": {
        display: "📱 Mobile App",
        files: ["App.js", "screens/Home.js", "navigation.js", "styles.js", "app.json"],
        description: "React Native mobile app"
    },
    "chrome-extension": {
        display: "🔧 Chrome Extension",
        files: ["manifest.json", "popup.html", "popup.js", "content.js", "background.js"],
        description: "Browser extension"
    },
    "python-app": {
        display: "🐍 Python App",
        files: ["main.py", "utils.py", "config.py", "requirements.txt"],
        description: "Python application"
    },
    "cli-tool": {
        display: "⌨️ CLI Tool",
        files: ["cli.js", "commands.js", "utils.js", "package.json", "README.md"],
        description: "Command-line tool"
    },
    "ml-model": {
        display: "🤖 ML Model",
        files: ["model.py", "train.py", "predict.py", "data_prep.py", "requirements.txt"],
        description: "Machine learning model"
    },
    "trading-bot": {
        display: "📈 Trading Bot",
        files: ["bot.js", "strategies.js", "indicators.js", "backtest.js", "config.json"],
        description: "Automated trading bot"
    },
    "three-js-app": {
        display: "🎭 3D App",
        files: ["index.html", "scene.js", "models.js", "shaders.glsl", "style.css"],
        description: "Three.js 3D application"
    },
    "blockchain-explorer": {
        display: "🔍 Blockchain Explorer",
        files: ["index.html", "explorer.js", "api.js", "style.css", "config.js"],
        description: "Blockchain data explorer"
    },
    "dao-contract": {
        display: "🏛️ DAO Contract",
        files: ["DAO.sol", "Governance.sol", "Treasury.sol", "deploy.js", "test.js"],
        description: "Decentralized organization"
    },
    "metaverse-app": {
        display: "🌌 Metaverse App",
        files: ["world.js", "avatar.js", "physics.js", "network.js", "index.html"],
        description: "Virtual world application"
    }
};

// Show all project types in a grid
window.showAllProjectTypes = function() {
    const types = Object.keys(ALL_PROJECT_TYPES).map(key => 
        ALL_PROJECT_TYPES[key].display
    );
    
    setTaskPending({
        question: "Choose your project type:",
        options: types,
        step: "project-type",
        grid: true
    });
};

// Handle project flow
window.startBuildFlow = function() {
    console.log("Starting build flow...");
    
    currentTask = {
        mode: "building",
        createdAt: new Date().toISOString()
    };
    
    setTaskPending({
        question: "What shall we name your project?",
        step: "project-name",
        placeholder: "Enter project name..."
    });
};

// Updated input handler
window.handleProjectInput = function(text) {
    const step = window.taskPending?.step;
    console.log(`Input for ${step}: ${text}`);
    
    switch(step) {
        case "project-name":
            currentTask.projectName = text;
            showAllProjectTypes();
            break;
            
        case "project-type":
            const typeKey = Object.keys(ALL_PROJECT_TYPES).find(
                key => ALL_PROJECT_TYPES[key].display === text
            );
            currentTask.projectType = typeKey;
            
            setTaskPending({
                question: `Describe your ${ALL_PROJECT_TYPES[typeKey].description}:`,
                step: "features",
                placeholder: "What features do you want?"
            });
            break;
            
        case "features":
            currentTask.features = text;
            setTaskPending(null);
            buildProjectWithProgress();
            break;
    }
};

// Build with animated progress bar and Live Editor Integration
window.buildProjectWithProgress = async function() {
    console.log("🚀 Building:", currentTask);
    
    const projectType = currentTask.projectType;
    const projectInfo = ALL_PROJECT_TYPES[projectType];
    
    // Show task section with info (DISABLED - using live preview timer instead)
    const taskSection = document.getElementById("task-status-section");
    if (taskSection) {
        taskSection.style.display = "none"; // Keep hidden - live preview has timer
        
        const taskName = document.getElementById("task-name");
        const taskType = document.getElementById("task-type");
        const taskStatus = document.getElementById("task-status");
        
        if (taskName) taskName.textContent = currentTask.projectName;
        if (taskType) taskType.textContent = projectInfo.display;
        if (taskStatus) taskStatus.textContent = "Initializing...";
    }
    
    // Show progress container
    const progressContainer = document.querySelector(".progress-container");
    if (progressContainer) {
        progressContainer.style.display = "block";
    }
    
    // Animate through progress steps
    for (let i = 0; i < 3; i++) {
        const steps = [
            { percent: 0, status: "Starting build..." },
            { percent: 10, status: "Analyzing requirements..." },
            { percent: 20, status: "Connecting to Claude AI..." }
        ];
        updateProgress(steps[i].percent, steps[i].status);
        await new Promise(r => setTimeout(r, 300));
    }
    
    try {
        const requestData = {
            projectName: currentTask.projectName,
            projectType: projectType,
            features: currentTask.features
        };
        
        console.log("Calling Claude with:", requestData);
        updateProgress(35, "Claude is thinking...");
        
        const response = await fetch("https://crackerbot.io/api/generate-project", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });
        
        updateProgress(50, "Generating architecture...");
        await new Promise(r => setTimeout(r, 500));
        
        updateProgress(65, "Writing code...");
        
        const files = await response.json();
        console.log("✅ Generated files:", Object.keys(files));
        
        currentTask.files = files;
        
        updateProgress(80, "Adding features...");
        await new Promise(r => setTimeout(r, 500));
        
        updateProgress(90, "Finalizing project...");
        await new Promise(r => setTimeout(r, 500));
        
        updateProgress(100, "Complete!");
        
        if (window.addMessage) {
            const fileCount = Object.keys(files).length;
            addMessage("Claude", `✅ ${projectInfo.display} "${currentTask.projectName}" created with ${fileCount} files!`, "bot");
        }
        
        // Send files to live editor after build completion
        console.log("[All-Projects] Build completed, sending files to live editor...");
        setTimeout(() => sendFilesToLiveEditor(currentTask.files), 500);
        
    } catch (error) {
        console.error("Build error:", error);
        
        updateProgress(70, "Using template fallback...");
        currentTask.files = generateCompleteFallback(currentTask);
        
        await new Promise(r => setTimeout(r, 500));
        updateProgress(100, "Complete (template)!");
        
        // Send fallback files to live editor
        console.log("[All-Projects] Fallback build completed, sending files to live editor...");
        setTimeout(() => sendFilesToLiveEditor(currentTask.files), 500);
    }
};

// Generate complete fallback files for ALL types
window.generateCompleteFallback = function(task) {
    const { projectName, projectType, features } = task;
    const info = ALL_PROJECT_TYPES[projectType];
    
    const files = {};
    
    info.files.forEach(filename => {
        const ext = filename.split(".").pop();
        
        switch(ext) {
            case "html":
                files[filename] = `<!DOCTYPE html>\n<html>\n<head><title>${projectName}</title></head>\n<body>\n<h1>${projectName}</h1>\n<!-- ${features} -->\n</body>\n</html>`;
                break;
            case "js":
            case "jsx":
                files[filename] = `// ${projectName}\n// ${info.description}\n// Features: ${features}\n\nconsole.log("${projectName} running");`;
                break;
            case "py":
                files[filename] = `# ${projectName}\n# ${info.description}\n# Features: ${features}\n\ndef main():\n    print("${projectName}")\n\nif __name__ == "__main__":\n    main()`;
                break;
            case "sol":
                files[filename] = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract ${projectName.replace(/\s/g, "")} {\n    // ${features}\n}`;
                break;
            case "json":
                files[filename] = `{\n  "name": "${projectName.toLowerCase()}",\n  "version": "1.0.0",\n  "description": "${features}"\n}`;
                break;
            case "css":
                files[filename] = `/* ${projectName} Styles */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n}`;
                break;
            case "vue":
                files[filename] = `<template>\n  <div>${projectName}</div>\n</template>\n\n<script>\nexport default {\n  name: "${projectName}"\n}\n</script>`;
                break;
            case "txt":
                files[filename] = `# ${projectName}\n${features}`;
                break;
            case "md":
                files[filename] = `# ${projectName}\n\n## Description\n${features}\n\n## Installation\n\n## Usage`;
                break;
            default:
                files[filename] = `// ${projectName}\n// ${features}`;
        }
    });
    
    return files;
};

// FIXED LIVE EDITOR FILE BRIDGE - Uses correct element IDs
window.sendFilesToLiveEditor = function(files) {
    console.log("[Build] Sending files to live editor:", Object.keys(files));
    
    if (!files || Object.keys(files).length === 0) {
        console.log("[Build] No files to send to live editor");
        return;
    }
    
    if (!window.livePreview) {
        console.log("[Build] Live preview not available, retrying in 1 second...");
        setTimeout(() => sendFilesToLiveEditor(files), 1000);
        return;
    }
    
    try {
        // Direct file assignment
        window.livePreview.files = files;
        console.log("[Build] ✅ Files assigned to live preview");
        
        // Create file tabs using CORRECT element IDs
        createFileTabs(files);
        
        // Update files counter
        const counter = document.getElementById('files-counter');
        if (counter) {
            counter.textContent = `${Object.keys(files).length} files`;
        }
        
        console.log("[Build] ✅ File transfer completed");
        
    } catch (error) {
        console.error("[Build] Error sending files to live editor:", error);
    }
};

// Create file tabs using CORRECT element IDs from live editor
window.createFileTabs = function(files) {
    console.log("[Build] Creating file tabs for:", Object.keys(files));
    
    // Use CORRECT element ID from live editor
    const tabsContainer = document.getElementById('live-file-tabs');
    
    if (!tabsContainer) {
        console.log("[Build] No file tabs container found (live-file-tabs)");
        
        // Retry after delay in case live editor is still loading
        setTimeout(() => {
            const retryTabs = document.getElementById('live-file-tabs');
            if (retryTabs) {
                console.log("[Build] Found tabs container on retry");
                createFileTabs(files);
            } else {
                console.log("[Build] Still no tabs container - live editor may not be open");
            }
        }, 1000);
        return;
    }
    
    // Clear existing tabs
    tabsContainer.innerHTML = '';
    
    // Create tab for each file
    Object.keys(files).forEach((filename, index) => {
        const tab = document.createElement('div');
        tab.className = 'file-tab';
        tab.textContent = filename;
        tab.style.cssText = `
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid #00ff88;
            padding: 8px 15px;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
            cursor: pointer;
            color: #00ff88;
            font-family: monospace;
            font-size: 12px;
            display: inline-block;
            transition: background 0.3s;
        `;
        
        // Make first tab active
        if (index === 0) {
            tab.style.background = 'rgba(0, 255, 136, 0.3)';
            
            // Update current file display
            updateCurrentFileDisplay(filename, files[filename]);
        }
        
        // Tab click handler
        tab.onclick = function() {
            // Remove active style from all tabs
            document.querySelectorAll('.file-tab').forEach(t => {
                t.style.background = 'rgba(0, 255, 136, 0.1)';
            });
            
            // Make this tab active
            tab.style.background = 'rgba(0, 255, 136, 0.3)';
            
            // Update file display
            updateCurrentFileDisplay(filename, files[filename]);
            
            // Update current file in live preview
            if (window.livePreview) {
                window.livePreview.currentFile = filename;
            }
            
            console.log("[Build] Switched to file:", filename);
        };
        
        tabsContainer.appendChild(tab);
    });
    
    console.log("[Build] ✅ Created", Object.keys(files).length, "file tabs");
};

// Update the current file display in live editor
window.updateCurrentFileDisplay = function(filename, content) {
    // Update file header
    const fileHeader = document.getElementById('current-file-header');
    if (fileHeader) {
        const fileName = fileHeader.querySelector('.file-name');
        if (fileName) {
            fileName.textContent = filename;
        }
    }
    
    // Update code editor content - try multiple selectors
    const codeEditor = document.getElementById('live-code-editor') ||
                      document.querySelector('.code-editor textarea') ||
                      document.querySelector('textarea') ||
                      document.querySelector('[contenteditable]');
    
    if (codeEditor) {
        if (codeEditor.tagName === 'TEXTAREA') {
            codeEditor.value = content;
        } else {
            codeEditor.textContent = content;
        }
        console.log("[Build] Updated editor content for:", filename);
    } else {
        console.log("[Build] No code editor element found");
    }
};

// Override handlers
window.handleUserInput = window.handleProjectInput;
window.actuallyBuildProject = window.buildProjectWithProgress;

console.log("✅ ALL 20+ project types loaded with FIXED Live Editor Integration!");

// ============================================
// SPECIALIZED PROJECT BUILDERS
// ============================================

// MOBILE APPS BUILDER
window.buildMobileProject = function(name, type, features) {
    console.log('[Mobile Builder] Building:', name, type, features);
    const files = {};
    
    if (type.includes('React Native')) {
        files['App.js'] = `// ${name} - React Native App
// User Features: ${features}
import React from 'react';
import { SafeAreaView, Text, View, Button } from 'react-native';

export default function App() {
  return (
    <SafeAreaView>
      <Text>${name}</Text>
      <Text>${features || 'React Native App'}</Text>
      <Button title="Start" onPress={() => alert('${features}')} />
    </SafeAreaView>
  );
}`;
        files['package.json'] = `{"name":"${name.toLowerCase().replace(/\s+/g,'-')}","version":"1.0.0","dependencies":{"react":"18.2.0","react-native":"0.72.0"}}`;
    } else if (type.includes('PWA')) {
        files['manifest.json'] = `{"name":"${name}","short_name":"${name}","start_url":"/","display":"standalone"}`;
        files['sw.js'] = `// Service Worker\nself.addEventListener('install', e => console.log('${features}'));`;
        files['index.html'] = `<!DOCTYPE html><html><head><link rel="manifest" href="/manifest.json"><title>${name}</title></head><body><h1>${name}</h1><p>${features}</p></body></html>`;
    } else {
        files['mobile.html'] = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name}</title></head><body><h1>${name}</h1><p>${type}: ${features}</p></body></html>`;
    }
    return files;
};

// AI & MACHINE LEARNING BUILDER
window.buildAIProject = function(name, type, features) {
    console.log('[AI/ML Builder] Building:', name, type, features);
    const files = {};
    
    if (type.includes('ML Model')) {
        files['model.py'] = `# ${name} - ML Model
# User Features: ${features}
import numpy as np
from sklearn.ensemble import RandomForestClassifier

class ${name.replace(/\s+/g,'')}Model:
    def __init__(self):
        self.model = RandomForestClassifier()
        # Implement: ${features}
    
    def train(self, X, y):
        self.model.fit(X, y)
    
    def predict(self, X):
        return self.model.predict(X)`;
        files['requirements.txt'] = 'numpy\nscikit-learn\npandas';
    } else if (type.includes('Chatbot')) {
        files['chatbot.js'] = `// ${name} Chatbot\n// Features: ${features}\nclass Chatbot {\n  respond(msg) { return 'Response to: ' + msg; }\n}`;
        files['chat.html'] = `<!DOCTYPE html><html><body><h1>${name}</h1><p>${features}</p><input id="msg"><button onclick="chat()">Send</button><script src="chatbot.js"></script></body></html>`;
    } else {
        files['ai.js'] = `// ${name} - ${type}\n// Features: ${features}\nconsole.log('AI Project');`;
    }
    return files;
};

console.log('[All Builders] ✅ Added specialized builders with FIXED Live Editor integration');