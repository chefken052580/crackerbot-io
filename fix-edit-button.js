// FIX EDIT BUTTON WITH MODAL
console.log('[Edit Fix] Loading with modal support...');

window.editWithAI = function() {
    console.log('[Edit Fix] editWithAI called');
    
    if (!window.currentTask || !window.currentTask.files) {
        alert('No project files to edit!');
        return;
    }
    
    // Use modal if available
    if (window.showProjectTypesModal || window.showModal) {
        console.log('[Edit Fix] Using modal system');
        
        // Create edit modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="edit-modal">
                <div class="modal-content" style="width: 80%; height: 80%;">
                    <div class="modal-header">
                        <h2>AI Code Editor</h2>
                        <button onclick="document.getElementById('edit-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="display: flex; height: calc(100% - 60px);">
                        <div style="width: 200px; border-right: 1px solid #00ff88; padding: 10px;">
                            <h3>Files</h3>
                            ${Object.keys(window.currentTask.files).map(f => 
                                `<button onclick="window.loadFileInEditor('${f}')" style="display: block; width: 100%; margin: 5px 0; padding: 5px;">${f}</button>`
                            ).join('')}
                        </div>
                        <div style="flex: 1; padding: 10px;">
                            <div id="current-file" style="color: #00ff88; margin-bottom: 10px;">Select a file</div>
                            <textarea id="code-editor" style="width: 100%; height: calc(100% - 80px); background: #000; color: #0f0; font-family: monospace;"></textarea>
                            <button onclick="window.saveWithAI()" style="margin-top: 10px; padding: 10px 20px;">Save with AI</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existing = document.getElementById('edit-modal');
        if (existing) existing.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } else if (window.PreviewPopup) {
        // Use preview popup system
        const preview = new window.PreviewPopup(window.currentTask, window.socket);
        preview.show();
    } else {
        console.error('[Edit Fix] No modal system available!');
        // Fallback to basic popup
        const popup = window.open('', 'AI Editor', 'width=1200,height=800');
        popup.document.write('<h1>AI Editor</h1><p>Files: ' + Object.keys(window.currentTask.files).join(', ') + '</p>');
    }
};

window.loadFileInEditor = function(filename) {
    const editor = document.getElementById('code-editor');
    const fileLabel = document.getElementById('current-file');
    if (editor && window.currentTask.files[filename]) {
        editor.value = window.currentTask.files[filename];
        fileLabel.textContent = 'Editing: ' + filename;
        window.currentEditFile = filename;
    }
};

window.saveWithAI = function() {
    const editor = document.getElementById('code-editor');
    if (editor && window.currentEditFile) {
        window.currentTask.files[window.currentEditFile] = editor.value;
        console.log('Saved:', window.currentEditFile);
        
        // Send to backend if socket available
        if (window.socket && window.socket.connected) {
            window.socket.emit('code_modified', {
                filename: window.currentEditFile,
                code: editor.value
            });
        }
    }
};

console.log('[Edit Fix] ✅ Edit button fixed with modal support');
