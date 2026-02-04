// Debug Live Preview - Shows status on page
(function() {
    // Create debug panel
    var panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = 'position:fixed;top:10px;right:10px;background:#000;color:#0f0;padding:15px;border:2px solid #0f0;z-index:99999;font-family:monospace;font-size:12px;max-width:400px;max-height:300px;overflow:auto;';
    panel.innerHTML = '<strong>🔍 DEBUG PANEL</strong><hr>';
    document.body.appendChild(panel);
    
    function log(msg) {
        var p = document.createElement('div');
        p.textContent = new Date().toLocaleTimeString() + ' - ' + msg;
        panel.appendChild(p);
        panel.scrollTop = panel.scrollHeight;
    }
    
    // Check every second
    setInterval(function() {
        var status = [];
        status.push('socket: ' + (window.socket ? 'YES' : 'NO'));
        status.push('connected: ' + (window.socket?.connected ? 'YES' : 'NO'));
        status.push('livePreview: ' + (window.livePreview ? 'YES' : 'NO'));
        status.push('autoOpen: ' + (typeof window.livePreview?.autoOpen));
        
        document.getElementById('debug-panel').innerHTML = 
            '<strong>🔍 LIVE STATUS</strong><hr>' +
            status.join('<br>') +
            '<hr><button onclick="testLivePreview()" style="padding:5px;margin:5px;">TEST LIVE PREVIEW</button>' +
            '<button onclick="document.getElementById(\'debug-panel\').remove()" style="padding:5px;">CLOSE</button>';
    }, 2000);
    
    // Test function
    window.testLivePreview = function() {
        log('Testing live preview...');
        if (!window.livePreview) {
            log('❌ livePreview is NULL!');
            return;
        }
        if (typeof window.livePreview.autoOpen !== 'function') {
            log('❌ autoOpen is not a function!');
            log('Available: ' + Object.keys(window.livePreview).join(', '));
            return;
        }
        log('✅ Calling autoOpen...');
        try {
            window.livePreview.autoOpen({
                taskId: Date.now(),
                projectName: "Debug Test",
                projectType: "web",
                frontendId: "debug"
            });
            log('✅ autoOpen called successfully');
        } catch(e) {
            log('❌ Error: ' + e.message);
        }
    };
    
    log('Debug panel loaded');
})();
