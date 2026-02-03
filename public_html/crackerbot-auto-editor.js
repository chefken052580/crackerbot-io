// Auto-open AI editor after builds - loads last to override everything
(function() {
    console.log('[Auto Editor] Loading auto-open system...');
    
    // Monitor for build completion by watching for specific completion messages
    const originalAddMessage = window.addMessage;
    window.addMessage = function(sender, text, type) {
        // Call original function first
        if (originalAddMessage) {
            originalAddMessage(sender, text, type);
        }
        
        // Check if this is a build completion message
        if (text && text.includes('is complete!') && text.includes('files generated')) {
            console.log('[Auto Editor] Build completion detected, auto-opening editor...');
            setTimeout(() => {
                if (window.showPreviewPopup && window.currentTask) {
                    window.showPreviewPopup(window.currentTask, window.socket);
                } else {
                    console.log('[Auto Editor] showPreviewPopup not available');
                }
            }, 1000);
        }
    };
    
    console.log('[Auto Editor] Auto-open system ready');
})();
