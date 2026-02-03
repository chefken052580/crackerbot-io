// TOOL PROJECT BUILDER
window.buildToolProject = function(name, type, features) {
    console.log('[Tool Builder] Building:', name, type, features);
    const files = {};
    
    if (type.includes('Chrome Extension')) {
        files['manifest.json'] = generateChromeManifest(name, features);
        files['popup.html'] = generateChromePopup(name);
        files['popup.js'] = generateChromePopupJS(name);
        files['content.js'] = generateChromeContent(name);
        files['background.js'] = generateChromeBackground();
    } else if (type.includes('CLI Tool')) {
        files['bin/cli.js'] = generateCLIScript(name, features);
        files['package.json'] = generateCLIPackage(name);
        files['lib/commands.js'] = generateCLICommands(name);
    } else {
        // Default utility tool
        files['index.js'] = generateUtilityTool(name, features);
        files['package.json'] = generateUtilityPackage(name);
    }
    
    files['README.md'] = generateToolReadme(name, type, features);
    return files;
};

function generateChromeManifest(name, features) {
    return JSON.stringify({
        "manifest_version": 3,
        "name": name,
        "version": "1.0",
        "description": features || "Chrome extension built with CrackerBot",
        "permissions": ["activeTab", "storage"],
        "action": {
            "default_popup": "popup.html",
            "default_title": name
        },
        "content_scripts": [{
            "matches": ["<all_urls>"],
            "js": ["content.js"]
        }],
        "background": {
            "service_worker": "background.js"
        }
    }, null, 2);
}

function generateChromePopup(name) {
    return `<!DOCTYPE html>
<html>
<head>
    <style>
        body { width: 300px; padding: 20px; font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .button { background: #4285f4; color: white; border: none; 
                 padding: 10px 20px; border-radius: 4px; cursor: pointer; width: 100%; }
        .button:hover { background: #3367d6; }
    </style>
</head>
<body>
    <div class="header">
        <h2>${name}</h2>
        <p>Chrome Extension</p>
    </div>
    
    <button class="button" id="actionBtn">Activate</button>
    
    <script src="popup.js"></script>
</body>
</html>`;
}

console.log('[Tool Builder] Loaded - Chrome Extensions, CLI Tools, Utilities');

function generateChromePopupJS(name) {
    return `document.addEventListener('DOMContentLoaded', function() {
    const actionBtn = document.getElementById('actionBtn');
    
    actionBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'activate',
                extension: '${name}'
            });
        });
        
        actionBtn.textContent = 'Activated!';
        setTimeout(() => {
            actionBtn.textContent = 'Activate';
        }, 2000);
    });
});`;
}

function generateChromeContent(name) {
    return `// ${name} Content Script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'activate') {
        console.log('${name} activated on:', window.location.href);
        
        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = \`
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4285f4;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 999999;
            font-family: Arial, sans-serif;
        \`;
        indicator.textContent = '${name} Active';
        document.body.appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 3000);
        sendResponse({success: true});
    }
});`;
}

function generateChromeBackground() {
    return `// Background Service Worker
chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension installed');
});

chrome.action.onClicked.addListener(function(tab) {
    console.log('Extension icon clicked on tab:', tab.url);
});`;
}

function generateCLIScript(name, features) {
    return `#!/usr/bin/env node

const { program } = require('commander');
const commands = require('../lib/commands');

program
    .name('${name.toLowerCase()}')
    .description('${features || 'CLI tool built with CrackerBot'}')
    .version('1.0.0');

program
    .command('hello')
    .description('Say hello')
    .option('-n, --name <name>', 'name to greet', 'World')
    .action((options) => {
        commands.hello(options.name);
    });

program
    .command('info')
    .description('Show tool information')
    .action(() => {
        commands.info();
    });

program.parse();`;
}

function generateCLIPackage(name) {
    return JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        description: "CLI tool built with CrackerBot",
        bin: {
            [name.toLowerCase()]: "./bin/cli.js"
        },
        dependencies: {
            "commander": "^9.4.1"
        },
        keywords: ["cli", "tool", "crackerbot"]
    }, null, 2);
}

function generateCLICommands(name) {
    return `// ${name} Commands
module.exports = {
    hello: function(name) {
        console.log(\`Hello, \${name}! Welcome to ${name}.\`);
    },
    
    info: function() {
        console.log('${name} - CLI Tool');
        console.log('Built with CrackerBot AI');
        console.log('Version: 1.0.0');
    }
};`;
}

function generateUtilityTool(name, features) {
    return `// ${name} - Utility Tool
console.log('${name} utility loaded');

const ${name.replace(/\s+/g, '')} = {
    init: function() {
        console.log('Initializing ${name}...');
        this.setupUtilities();
    },
    
    setupUtilities: function() {
        // ${features || 'Add utility functions here'}
        console.log('Utilities ready');
    },
    
    run: function() {
        console.log('Running ${name}...');
        // Main utility logic here
    }
};

// Auto-initialize if running in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ${name.replace(/\s+/g, '')};
} else {
    // Browser environment
    window.${name.replace(/\s+/g, '')} = ${name.replace(/\s+/g, '')};
    ${name.replace(/\s+/g, '')}.init();
}`;
}

function generateUtilityPackage(name) {
    return JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: "1.0.0",
        description: "Utility tool built with CrackerBot",
        main: "index.js",
        scripts: {
            start: "node index.js",
            test: "echo \"No tests specified\""
        }
    }, null, 2);
}

function generateToolReadme(name, type, features) {
    return `# ${name}

${type} built with CrackerBot AI.

## Features
${features || 'Tool functionality'}

## Installation

### For Chrome Extension:
1. Open Chrome Extensions (chrome://extensions/)
2. Enable Developer Mode
3. Click "Load unpacked" and select this folder

### For CLI Tool:
\`\`\`bash
npm install -g .
${name.toLowerCase()} --help
\`\`\`

### For Utility:
\`\`\`bash
npm install
npm start
\`\`\`

## Usage
See individual file documentation for specific usage instructions.

## Built with CrackerBot
This tool was generated using CrackerBot AI Builder.`;
}
