// Debug Socket Events - See what the backend is sending
console.log('[Socket Debug] Loading...');

setTimeout(() => {
    if (window.socket) {
        console.log('[Socket Debug] Socket available, adding listeners...');
        
        // Listen for ALL socket events
        const originalEmit = window.socket.emit;
        window.socket.emit = function(...args) {
            console.log('[Socket DEBUG] SENDING:', args);
            return originalEmit.apply(this, args);
        };
        
        // Debug all incoming events
        const originalOn = window.socket.on;
        window.socket.on = function(event, callback) {
            const wrappedCallback = function(...args) {
                console.log(`[Socket DEBUG] RECEIVED "${event}":`, args);
                return callback.apply(this, args);
            };
            return originalOn.call(this, event, wrappedCallback);
        };
        
        // Specifically listen for live preview triggers
        window.socket.on('open_live_editor', (data) => {
            console.log('[Socket Debug] LIVE EDITOR TRIGGER received:', data);
        });
        
        window.socket.on('project_generated', (data) => {
            console.log('[Socket Debug] PROJECT GENERATED received:', data);
            // This should trigger live preview
            if (window.livePreview && data.files) {
                console.log('[Socket Debug] Opening live preview...');
                window.livePreview.autoOpen({
                    taskId: Date.now(),
                    projectName: window.currentTask?.projectName || 'Generated Project',
                    projectType: window.currentTask?.projectType || 'web-app',
                    features: window.currentTask?.features || 'AI Generated',
                    frontendId: 'project-generated'
                });
                
                // Manually populate with received files
                if (window.livePreview.isOpen) {
                    window.livePreview.files = {};
                    Object.entries(data.files).forEach(([filename, content]) => {
                        window.livePreview.files[filename] = { content, complete: true };
                        window.livePreview.addFileTab(filename, 'complete');
                    });
                    
                    const htmlFile = Object.keys(data.files).find(f => f.endsWith('.html'));
                    const firstFile = htmlFile || Object.keys(data.files)[0];
                    if (firstFile) {
                        window.livePreview.selectFile(firstFile);
                    }
                    
                    window.livePreview.updateFilesCounter();
                    window.livePreview.updatePreview();
                    window.livePreview.addDownloadButton();
                }
            }
        });
        
        console.log('[Socket Debug] All debug listeners added');
        
    } else {
        console.error('[Socket Debug] No socket available!');
    }
}, 3000);

console.log('[Socket Debug] Script ready');
