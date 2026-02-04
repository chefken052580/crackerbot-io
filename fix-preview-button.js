// DIRECT FIX FOR PREVIEW BUTTON - No dependencies
console.log('[DIRECT FIX] Loading preview button fix...');

// Wait for page to load, then override the function
setTimeout(() => {
    console.log('[DIRECT FIX] Applying button fix...');
    
    // Override the function that post-build.js calls
    window.openProjectPreview = function() {
        console.log('[DIRECT FIX] Preview button clicked!');
        
        if (!window.currentTask || !window.currentTask.files) {
            alert('No project files available to preview!');
            return;
        }
        
        // Create a simple preview modal
        showSimplePreview();
    };
    
    // Simple preview modal that always works
    window.showSimplePreview = function() {
        const files = window.currentTask.files;
        const htmlFile = Object.keys(files).find(f => f.endsWith('.html')) || Object.keys(files)[0];
        
        // Remove any existing modal
        const existing = document.getElementById('simple-preview-modal');
        if (existing) existing.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'simple-preview-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.9); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="width: 90%; height: 80%; background: #1a1a2e; border: 2px solid #00ff88; border-radius: 15px; display: flex; flex-direction: column;">
                <div style="padding: 15px; background: rgba(0,255,136,0.1); border-bottom: 1px solid #00ff88; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: #00ff88;">🚀 ${window.currentTask.projectName} - Code Editor</h3>
                    <button onclick="document.getElementById('simple-preview-modal').remove()" 
                            style="background: #ff4444; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-weight: bold;">
                        ✕ Close
                    </button>
                </div>
                <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px;">
                    <!-- Left: File tabs and code editor -->
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                            ${Object.keys(files).map(file => `
                                <button onclick="selectSimpleFile('${file}')" 
                                        id="tab-${file.replace(/[^a-z0-9]/gi, '_')}"
                                        style="padding: 5px 10px; background: ${file === htmlFile ? '#00ff88' : 'rgba(0,255,136,0.2)'}; 
                                               color: ${file === htmlFile ? '#000' : '#00ff88'}; 
                                               border: 1px solid #00ff88; cursor: pointer; border-radius: 15px; font-size: 12px;">
                                    ${file}
                                </button>
                            `).join('')}
                        </div>
                        <textarea id="simple-editor" 
                                  style="flex: 1; background: #0a0a0a; color: #00ff88; padding: 10px; 
                                         border: 1px solid #00ff88; border-radius: 5px; 
                                         font-family: 'Courier New', monospace; font-size: 14px; resize: none;" 
                                  spellcheck="false"
                                  oninput="updateSimplePreview()">${files[htmlFile] || ''}</textarea>
                    </div>
                    
                    <!-- Right: Live preview -->
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="padding: 10px; background: rgba(0,255,136,0.1); border: 1px solid #00ff88; border-radius: 5px;">
                            <h4 style="margin: 0; color: #00ff88; font-size: 14px;">👁️ Live Preview</h4>
                        </div>
                        <iframe id="simple-preview-frame" 
                                style="flex: 1; background: white; border: 1px solid #00ff88; border-radius: 5px; width: 100%;"
                                sandbox="allow-scripts allow-same-origin"></iframe>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set current file
        window.currentSimpleFile = htmlFile;
        
        // Update preview
        updateSimplePreview();
    };
    
    // File selection
    window.selectSimpleFile = function(filename) {
        window.currentSimpleFile = filename;
        const editor = document.getElementById('simple-editor');
        if (editor) {
            editor.value = window.currentTask.files[filename] || '';
        }
        
        // Update tab styles
        Object.keys(window.currentTask.files).forEach(file => {
            const tab = document.getElementById(`tab-${file.replace(/[^a-z0-9]/gi, '_')}`);
            if (tab) {
                if (file === filename) {
                    tab.style.background = '#00ff88';
                    tab.style.color = '#000';
                } else {
                    tab.style.background = 'rgba(0,255,136,0.2)';
                    tab.style.color = '#00ff88';
                }
            }
        });
        
        if (filename.endsWith('.html')) {
            updateSimplePreview();
        }
    };
    
    // Update preview
    window.updateSimplePreview = function() {
        const editor = document.getElementById('simple-editor');
        const frame = document.getElementById('simple-preview-frame');
        
        if (!editor || !frame) return;
        
        // Save current file
        if (window.currentTask && window.currentTask.files) {
            window.currentTask.files[window.currentSimpleFile] = editor.value;
        }
        
        // Update preview if HTML file
        if (window.currentSimpleFile && window.currentSimpleFile.endsWith('.html')) {
            let html = editor.value;
            
            // Inject CSS inline if available
            const cssFile = Object.keys(window.currentTask.files).find(f => f.endsWith('.css'));
            if (cssFile && window.currentTask.files[cssFile]) {
                html = html.replace('</head>', `<style>${window.currentTask.files[cssFile]}</style>\n</head>`);
            }
            
            // Inject JS inline if available
            const jsFile = Object.keys(window.currentTask.files).find(f => f.endsWith('.js'));
            if (jsFile && window.currentTask.files[jsFile]) {
                html = html.replace('</body>', `<script>${window.currentTask.files[jsFile]}</script>\n</body>`);
            }
            
            frame.srcdoc = html;
        }
    };
    
    console.log('[DIRECT FIX] Preview button fix ready!');
    
}, 3000);

console.log('[DIRECT FIX] Script loaded');
