// crackerbot-live-streaming-preview.js
// FIXED: Scrolling, Timer, Preview
// Version: v2025-12-07-fixed

class LiveStreamingPreview {
    constructor() {
        this.isOpen = false;
        this.currentTask = null;
        this.files = {};
        this.currentFile = null;
        this.streamingFile = null;
        this.typingTimeout = null;
        this.previewUpdateTimeout = null;
        this.socket = window.socket || null;
        this.buildTimer = null;
        this.buildStartTime = null;
        this.buildSeconds = 0;
    }

    autoOpen(taskData) {
        console.log("[LivePreview] Auto-opening for:", taskData.taskId);
        // Close any existing modal first (before setting currentTask)
        var existingModal = document.getElementById("live-preview-modal");
        if (existingModal) existingModal.remove();
        if (this.buildTimer) clearInterval(this.buildTimer);
        
        this.currentTask = taskData;
        this.files = {};
        this.isOpen = false;
        this.createLiveEditor();
        this.isOpen = true;
        this.addLogMessage("🚀 Starting live build for " + taskData.projectName, "build-start");
        this.startBuildTimer();
        this.setupLiveStreamListeners();
    }

    startBuildTimer() {
        this.buildStartTime = Date.now();
        this.buildSeconds = 0;
        var self = this;
        
        // Clear any existing timer
        if (this.buildTimer) {
            clearInterval(this.buildTimer);
        }
        
        this.buildTimer = setInterval(function() {
            self.buildSeconds++;
            var timerEl = document.getElementById("build-timer");
            var progressText = document.getElementById("progress-text");
            
            var mins = Math.floor(self.buildSeconds / 60);
            var secs = self.buildSeconds % 60;
            var timeStr = mins + ":" + (secs < 10 ? "0" : "") + secs;
            
            if (timerEl) {
                timerEl.textContent = timeStr;
            }
            
            // Update progress text with time
            if (progressText && self.buildSeconds < 180) {
                var estimatedTotal = 120; // 2 minutes estimate
                var percent = Math.min(95, Math.floor((self.buildSeconds / estimatedTotal) * 100));
                progressText.textContent = "AI generating... " + timeStr + " (~" + percent + "%)";
                
                var progressBar = document.getElementById("progress-bar");
                if (progressBar) {
                    progressBar.style.width = percent + "%";
                }
            }
        }, 1000);
    }

    stopBuildTimer() {
        if (this.buildTimer) {
            clearInterval(this.buildTimer);
            this.buildTimer = null;
        }
        
        var timerEl = document.getElementById("build-timer");
        if (timerEl) {
            timerEl.style.color = "#00ff88";
        }
    }

    createLiveEditor() {
        var existingModal = document.getElementById("live-preview-modal");
        if (existingModal) {
            existingModal.remove();
        }

        var modal = document.createElement("div");
        modal.id = "live-preview-modal";
        modal.className = "live-preview-modal";

        modal.innerHTML = 
            '<div class="live-preview-container">' +
                '<div class="live-preview-header">' +
                    '<div class="header-left">' +
                        '<div class="project-name">🚀 ' + (this.currentTask.projectName || "Project") + '</div>' +
                        '<div class="build-status" id="build-status">⏳ Building...</div>' +
                    '</div>' +
                    '<div class="header-center">' +
                        '<div class="timer-display">' +
                            '<span class="timer-label">⏱️ Build Time:</span>' +
                            '<span class="timer-value" id="build-timer">0:00</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="header-controls">' +
                        '<button onclick="livePreview.saveProject()" class="download-btn" id="save-btn" style="display:none;">💾 Save Project</button>' +
                        '<button onclick="livePreview.toggleMinimize()">🔽</button>' +
                        '<button onclick="livePreview.close()">✖️</button>' +
                    '</div>' +
                '</div>' +
                '<div class="live-preview-body">' +
                    '<div class="editor-panel">' +
                        '<div class="file-tabs-container">' +
                            '<div class="file-tabs" id="live-file-tabs"></div>' +
                            '<div class="files-counter" id="files-counter">0 files</div>' +
                        '</div>' +
                        '<div class="code-editor-container">' +
                            '<div class="file-header" id="current-file-header">' +
                                '<span class="file-icon">📄</span>' +
                                '<span class="file-name">Select a file...</span>' +
                                '<span class="typing-indicator" id="typing-indicator" style="display: none;">✍️ AI typing...</span>' +
                            '</div>' +
                            '<div class="code-editor-wrapper" id="code-editor-wrapper">' +
                                '<pre class="code-editor" id="live-code-editor">// Waiting for AI to generate code...</pre>' +
                            '</div>' +
                        '</div>' +
                        '<div class="ai-assistant-panel">' +
                            '<div class="ai-header">' +
                                '<span>🤖 AI Assistant</span>' +
                                '<div class="ai-status" id="ai-status">Ready</div>' +
                            '</div>' +
                            '<div class="ai-input-container">' +
                                '<input type="text" id="ai-modify-input" placeholder="Tell AI to modify the code...">' +
                                '<button onclick="livePreview.sendAIModification()" class="ai-send-btn">✨ Modify</button>' +
                            '</div>' +
                            '<div class="ai-suggestions">' +
                                '<div onclick="livePreview.quickAI(\'add dark mode\')" class="suggestion">🌙 Dark Mode</div>' +
                                '<div onclick="livePreview.quickAI(\'add animations\')" class="suggestion">✨ Animations</div>' +
                                '<div onclick="livePreview.quickAI(\'make responsive\')" class="suggestion">📱 Responsive</div>' +
                                '<div onclick="livePreview.quickAI(\'improve colors\')" class="suggestion">🎨 Colors</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="preview-panel">' +
                        '<div class="preview-header">' +
                            '<span>👁️ Live Preview</span>' +
                            '<div class="preview-controls">' +
                                '<button onclick="livePreview.refreshPreview()">🔄</button>' +
                                '<button onclick="livePreview.openInNewTab()">🔗</button>' +
                            '</div>' +
                        '</div>' +
                        '<div class="preview-iframe-container" id="preview-container">' +
                            '<iframe id="live-preview-frame" class="live-preview-frame" sandbox="allow-scripts allow-same-origin"></iframe>' +
                            '<div class="preview-overlay" id="preview-overlay">' +
                                '<div class="preview-message">⏳ Waiting for HTML...</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="build-log-panel">' +
                    '<div class="log-header">' +
                        '<span>📋 Build Log</span>' +
                        '<button onclick="livePreview.clearLog()" class="clear-log-btn">Clear</button>' +
                    '</div>' +
                    '<div class="build-log" id="build-log"></div>' +
                    '<div class="build-progress-container">' +
                        '<div class="progress-bar-bg">' +
                            '<div class="progress-bar" id="progress-bar" style="width: 0%"></div>' +
                        '</div>' +
                        '<div class="progress-text" id="progress-text">Starting AI generation...</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(modal);
        this.loadCSS();
    }

    setupLiveStreamListeners() {
        if (!this.socket) {
            console.warn("[LivePreview] Socket not available");
            return;
        }

        var self = this;

        // Main live_update event handler (matches backend)
        this.socket.on("live_update", function(data) {
            console.log("[LivePreview] live_update:", data.type, data);
            
            if (!self.currentTask || data.taskId != self.currentTask.taskId) return;

            switch(data.type) {
                case "planning_start":
                    self.addLogMessage("🏗️ " + (data.message || "Planning..."), "planning");
                    break;
                case "planning_complete":
                    self.addLogMessage("📋 Plan ready!", "planning");
                    break;
                case "file_start":
                    self.handleFileStart({ fileName: data.filePath, taskId: data.taskId });
                    break;
                case "file_content_stream":
                    self.handleContentStream({ fileName: data.filePath, chunk: data.content, taskId: data.taskId });
                    break;
                case "file_complete":
                    self.handleFileComplete({ fileName: data.filePath, content: data.content, taskId: data.taskId });
                    break;
                case "preview_update":
                    self.updatePreview();
                    break;
                case "build_complete":
                    self.handleBuildComplete(data);
                    break;
                case "build_error":
                    self.addLogMessage("❌ Error: " + data.error, "error");
                    break;
            }
        });

        // Also listen for project_complete (from server.js)
        this.socket.on("project_complete", function(data) {
            console.log("[LivePreview] project_complete:", data);
            if (self.currentTask && data.taskId == self.currentTask.taskId) {
                self.handleBuildComplete(data);
            }
        });

        // Progress updates
        this.socket.on("progress", function(data) {
            console.log("[LivePreview] progress:", data);
            if (self.currentTask && data.taskId == self.currentTask.taskId) {
                self.updateProgress(data.progress, data.message);
            }
        });

        console.log("[LivePreview] ✅ Socket listeners attached");
    }

    handleFileStart(data) {
        var fileName = data.fileName || data.file || "file";
        this.streamingFile = fileName;
        this.files[fileName] = { content: "", complete: false };
        
        this.addFileTab(fileName);
        this.selectFile(fileName);
        this.showTypingIndicator(true);
        this.addLogMessage("📝 Creating " + fileName + "...", "file-start");
    }

    handleContentStream(data) {
        var fileName = data.fileName || data.file || this.streamingFile;
        if (!fileName || !this.files[fileName]) return;

        var chunk = data.chunk || data.content || "";
        this.files[fileName].content += chunk;

        if (this.currentFile === fileName) {
            var editor = document.getElementById("live-code-editor");
            if (editor) {
                editor.textContent = this.files[fileName].content;
                // Auto-scroll to bottom
                var wrapper = document.getElementById("code-editor-wrapper");
                if (wrapper) {
                    wrapper.scrollTop = wrapper.scrollHeight;
                }
            }
        }

        // Update preview if HTML
        if (fileName.endsWith(".html")) {
            this.schedulePreviewUpdate();
        }
    }

    handleFileComplete(data) {
        var fileName = data.fileName || data.file || this.streamingFile;
        if (!fileName) return;

        if (this.files[fileName]) {
            // Use final content if provided
            if (data.content) {
                this.files[fileName].content = data.content;
            }
            this.files[fileName].complete = true;
        }

        this.showTypingIndicator(false);
        this.markFileComplete(fileName);
        this.addLogMessage("✅ " + fileName + " complete!", "file-complete");
        this.updateFilesCounter();
        
        // Update preview
        this.updatePreview();
    }

    handleBuildComplete(data) {
        this.stopBuildTimer();
        
        // Update status
        var status = document.getElementById("build-status");
        if (status) {
            status.textContent = "✅ Build Complete!";
            status.style.color = "#00ff88";
        }

        // Show save button
        var saveBtn = document.getElementById("save-btn");
        if (saveBtn) {
            saveBtn.style.display = "block";
        }

        // Update progress
        var progressBar = document.getElementById("progress-bar");
        var progressText = document.getElementById("progress-text");
        if (progressBar) progressBar.style.width = "100%";
        if (progressText) {
            var mins = Math.floor(this.buildSeconds / 60);
            var secs = this.buildSeconds % 60;
            progressText.textContent = "✅ Build complete in " + mins + ":" + (secs < 10 ? "0" : "") + secs;
        }

        // Store files if provided
        if (data.files) {
            var self = this;
            Object.keys(data.files).forEach(function(fileName) {
                self.files[fileName] = { content: data.files[fileName], complete: true };
                if (!document.querySelector('.file-tab[data-file="' + fileName + '"]')) {
                    self.addFileTab(fileName);
                }
                self.markFileComplete(fileName);
            });
            this.updateFilesCounter();
        }

        this.addLogMessage("🎉 Project built successfully!", "success");
        this.updatePreview();

        // Hide overlay
        var overlay = document.getElementById("preview-overlay");
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    updateProgress(progress, message) {
        var progressBar = document.getElementById("progress-bar");
        var progressText = document.getElementById("progress-text");
        
        if (progressBar) {
            progressBar.style.width = progress + "%";
        }
        if (progressText && message) {
            var mins = Math.floor(this.buildSeconds / 60);
            var secs = this.buildSeconds % 60;
            progressText.textContent = message + " (" + mins + ":" + (secs < 10 ? "0" : "") + secs + ")";
        }
    }

    addFileTab(fileName) {
        var tabs = document.getElementById("live-file-tabs");
        if (!tabs) return;

        // Check if tab already exists
        if (document.querySelector('.file-tab[data-file="' + fileName + '"]')) return;

        var icon = this.getFileIcon(fileName);
        var tab = document.createElement("div");
        tab.className = "file-tab creating";
        tab.setAttribute("data-file", fileName);
        tab.innerHTML = '<span class="file-icon">' + icon + '</span><span class="file-label">' + fileName + '</span><span class="file-status"></span>';
        tab.onclick = function() { window.livePreview.selectFile(fileName); };
        tabs.appendChild(tab);
    }

    getFileIcon(fileName) {
        if (fileName.endsWith(".html")) return "📄";
        if (fileName.endsWith(".css")) return "🎨";
        if (fileName.endsWith(".js")) return "⚡";
        if (fileName.endsWith(".json")) return "📋";
        return "📄";
    }

    selectFile(fileName) {
        this.currentFile = fileName;

        // Update tabs
        document.querySelectorAll(".file-tab").forEach(function(tab) {
            tab.classList.remove("active");
            if (tab.getAttribute("data-file") === fileName) {
                tab.classList.add("active");
            }
        });

        // Update header
        var header = document.getElementById("current-file-header");
        if (header) {
            header.innerHTML = '<span class="file-icon">' + this.getFileIcon(fileName) + '</span><span class="file-name">' + fileName + '</span><span class="typing-indicator" id="typing-indicator" style="display: none;">✍️ AI typing...</span>';
        }

        // Update editor
        var editor = document.getElementById("live-code-editor");
        if (editor && this.files[fileName]) {
            editor.textContent = this.files[fileName].content || "// Loading...";
        }
    }

    markFileComplete(fileName) {
        var tab = document.querySelector('.file-tab[data-file="' + fileName + '"]');
        if (tab) {
            tab.classList.remove("creating");
            tab.classList.add("complete");
        }
    }

    showTypingIndicator(show) {
        var indicator = document.getElementById("typing-indicator");
        if (indicator) {
            indicator.style.display = show ? "inline" : "none";
        }
    }

    updateFilesCounter() {
        var counter = document.getElementById("files-counter");
        if (counter) {
            var count = Object.keys(this.files).length;
            counter.textContent = count + " file" + (count !== 1 ? "s" : "");
        }
    }

    schedulePreviewUpdate() {
        var self = this;
        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
        }
        this.previewUpdateTimeout = setTimeout(function() {
            self.updatePreview();
        }, 500);
    }

    updatePreview() {
        var iframe = document.getElementById("live-preview-frame");
        var overlay = document.getElementById("preview-overlay");
        if (!iframe) return;

        var html = this.files["index.html"] ? this.files["index.html"].content : null;
        if (!html) {
            if (overlay) overlay.style.display = "flex";
            return;
        }

        // Hide overlay
        if (overlay) overlay.style.display = "none";

        // Inject CSS and JS inline
        var css = this.files["style.css"] ? this.files["style.css"].content : "";
        var js = this.files["script.js"] ? this.files["script.js"].content : "";

        // Build complete HTML
        var fullHtml = html;
        
        // Inject CSS before </head>
        if (css && fullHtml.includes("</head>")) {
            fullHtml = fullHtml.replace("</head>", "<style>" + css + "</style></head>");
        }
        
        // Inject JS before </body>
        if (js && fullHtml.includes("</body>")) {
            fullHtml = fullHtml.replace("</body>", "<script>" + js + "<\/script></body>");
        }

        // Write to iframe
        try {
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(fullHtml);
            doc.close();
        } catch (e) {
            console.error("[LivePreview] Failed to update preview:", e);
        }
    }

    refreshPreview() {
        this.updatePreview();
        this.addLogMessage("🔄 Preview refreshed", "info");
    }

    openInNewTab() {
        var html = this.files["index.html"] ? this.files["index.html"].content : "";
        var css = this.files["style.css"] ? this.files["style.css"].content : "";
        var js = this.files["script.js"] ? this.files["script.js"].content : "";

        var fullHtml = html;
        if (css) fullHtml = fullHtml.replace("</head>", "<style>" + css + "</style></head>");
        if (js) fullHtml = fullHtml.replace("</body>", "<script>" + js + "<\/script></body>");

        var blob = new Blob([fullHtml], { type: "text/html" });
        var url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    }

    saveProject() {
        // Save to localStorage
        var projectData = {
            name: this.currentTask.projectName,
            type: this.currentTask.projectType,
            files: this.files,
            savedAt: new Date().toISOString()
        };

        var savedProjects = JSON.parse(localStorage.getItem("crackerbot_projects") || "[]");
        savedProjects.unshift(projectData);
        if (savedProjects.length > 20) savedProjects = savedProjects.slice(0, 20);
        localStorage.setItem("crackerbot_projects", JSON.stringify(savedProjects));

        this.addLogMessage("💾 Project saved!", "success");
        alert("Project saved! Access it from the Saved Projects menu.");
    }

    sendAIModification() {
        var input = document.getElementById("ai-modify-input");
        if (!input || !input.value.trim()) return;

        var request = input.value.trim();
        this.addLogMessage("🤖 AI request: " + request, "ai-request");
        input.value = "";

        // TODO: Send to backend for AI modification
        var aiStatus = document.getElementById("ai-status");
        if (aiStatus) aiStatus.textContent = "Processing...";
    }

    quickAI(suggestion) {
        var input = document.getElementById("ai-modify-input");
        if (input) {
            input.value = suggestion;
            this.sendAIModification();
        }
    }

    addLogMessage(message, type) {
        var log = document.getElementById("build-log");
        if (!log) return;

        var entry = document.createElement("div");
        entry.className = "log-entry log-" + (type || "info");
        
        var now = new Date();
        var time = now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" + (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
        
        entry.innerHTML = '<span class="log-time">' + time + '</span><span class="log-message">' + message + '</span>';
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    clearLog() {
        var log = document.getElementById("build-log");
        if (log) log.innerHTML = "";
    }

    toggleMinimize() {
        var modal = document.getElementById("live-preview-modal");
        if (modal) {
            modal.classList.toggle("minimized");
        }
    }

    close() {
        this.stopBuildTimer();
        var modal = document.getElementById("live-preview-modal");
        if (modal) {
            modal.remove();
        }
        this.isOpen = false;
        this.currentTask = null;
        this.files = {};
    }

    loadCSS() {
        if (document.getElementById("live-preview-styles")) return;

        var style = document.createElement("style");
        style.id = "live-preview-styles";
        style.textContent = 
            ".live-preview-modal {" +
                "position: fixed;" +
                "top: 0; left: 0; right: 0; bottom: 0;" +
                "background: rgba(0, 0, 0, 0.95);" +
                "z-index: 10000;" +
                "display: flex;" +
                "flex-direction: column;" +
            "}" +
            ".live-preview-container {" +
                "display: flex;" +
                "flex-direction: column;" +
                "height: 100vh;" +
                "color: #00ff88;" +
            "}" +
            ".live-preview-header {" +
                "display: flex;" +
                "justify-content: space-between;" +
                "align-items: center;" +
                "padding: 15px 20px;" +
                "border-bottom: 2px solid #00ff88;" +
                "background: rgba(0, 255, 136, 0.1);" +
                "flex-shrink: 0;" +
            "}" +
            ".header-left { display: flex; flex-direction: column; gap: 5px; }" +
            ".project-name { color: #00ffcc; font-weight: bold; font-size: 16px; }" +
            ".build-status { font-size: 12px; color: #ffcc00; }" +
            ".header-center { display: flex; align-items: center; }" +
            ".timer-display { background: rgba(0,0,0,0.5); padding: 8px 15px; border-radius: 20px; border: 1px solid #00ff88; }" +
            ".timer-label { color: #888; margin-right: 8px; font-size: 12px; }" +
            ".timer-value { color: #ffcc00; font-weight: bold; font-size: 18px; font-family: monospace; }" +
            ".header-controls { display: flex; gap: 10px; }" +
            ".header-controls button { padding: 8px 15px; background: rgba(0,255,136,0.2); border: 1px solid #00ff88; color: #00ff88; border-radius: 5px; cursor: pointer; }" +
            ".header-controls button:hover { background: #00ff88; color: #000; }" +
            ".download-btn { background: linear-gradient(135deg, #00ff88, #00ccff) !important; color: #000 !important; font-weight: bold; }" +
            ".live-preview-body {" +
                "display: grid;" +
                "grid-template-columns: 1fr 1fr;" +
                "gap: 10px;" +
                "padding: 10px;" +
                "flex: 1;" +
                "min-height: 0;" +
                "overflow: hidden;" +
            "}" +
            ".editor-panel {" +
                "display: flex;" +
                "flex-direction: column;" +
                "gap: 10px;" +
                "background: rgba(0,0,0,0.3);" +
                "border: 1px solid #00ff88;" +
                "border-radius: 10px;" +
                "padding: 10px;" +
                "min-height: 0;" +
                "overflow: hidden;" +
            "}" +
            ".file-tabs-container { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid rgba(0,255,136,0.3); flex-shrink: 0; }" +
            ".file-tabs { display: flex; gap: 5px; flex-wrap: wrap; }" +
            ".files-counter { font-size: 12px; color: #888; }" +
            ".file-tab { display: flex; align-items: center; gap: 5px; padding: 6px 10px; background: rgba(0,255,136,0.2); border: 1px solid #00ff88; border-radius: 5px; cursor: pointer; font-size: 11px; }" +
            ".file-tab:hover { background: rgba(0,255,136,0.3); }" +
            ".file-tab.active { background: #00ff88; color: #000; }" +
            ".file-tab.creating { animation: pulse 1.5s infinite; }" +
            ".file-tab.complete .file-status::after { content: '✅'; font-size: 10px; margin-left: 5px; }" +
            ".code-editor-container { display: flex; flex-direction: column; border: 1px solid #00ff88; border-radius: 5px; flex: 1; min-height: 0; overflow: hidden; }" +
            ".file-header { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,255,136,0.1); border-bottom: 1px solid #00ff88; font-size: 12px; flex-shrink: 0; }" +
            ".typing-indicator { color: #ffcc00; animation: blink 1s infinite; font-size: 11px; }" +
            ".code-editor-wrapper { flex: 1; overflow: auto; background: #0f0f23; min-height: 0; }" +
            ".code-editor { padding: 15px; background: #0f0f23; color: #00ff88; font-family: Monaco, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.5; white-space: pre; margin: 0; min-height: 100%; }" +
            ".ai-assistant-panel { border: 1px solid #00ff88; border-radius: 5px; background: rgba(0,0,0,0.2); flex-shrink: 0; max-height: 150px; display: flex; flex-direction: column; }" +
            ".ai-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(0,255,136,0.1); border-bottom: 1px solid #00ff88; font-size: 12px; }" +
            ".ai-input-container { display: flex; gap: 8px; padding: 8px 10px; }" +
            ".ai-input-container input { flex: 1; padding: 6px 8px; background: rgba(0,0,0,0.5); border: 1px solid #00ff88; border-radius: 3px; color: #00ff88; font-size: 11px; }" +
            ".ai-send-btn { padding: 6px 12px; background: linear-gradient(135deg, #00ff88, #00ccff); border: none; border-radius: 3px; color: #000; cursor: pointer; font-weight: bold; font-size: 11px; }" +
            ".ai-suggestions { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 10px; overflow-y: auto; }" +
            ".suggestion { padding: 4px 8px; background: rgba(0,255,136,0.2); border: 1px solid rgba(0,255,136,0.5); border-radius: 12px; cursor: pointer; font-size: 10px; white-space: nowrap; }" +
            ".suggestion:hover { background: #00ff88; color: #000; }" +
            ".preview-panel { display: flex; flex-direction: column; background: rgba(0,0,0,0.3); border: 1px solid #00ff88; border-radius: 10px; min-height: 0; overflow: hidden; }" +
            ".preview-header { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(0,255,136,0.1); border-bottom: 1px solid #00ff88; font-size: 12px; flex-shrink: 0; }" +
            ".preview-controls { display: flex; gap: 5px; }" +
            ".preview-controls button { padding: 5px 8px; background: rgba(0,255,136,0.2); border: 1px solid #00ff88; color: #00ff88; border-radius: 3px; cursor: pointer; font-size: 11px; }" +
            ".preview-iframe-container { position: relative; flex: 1; background: #fff; min-height: 0; }" +
            ".live-preview-frame { width: 100%; height: 100%; border: none; background: white; }" +
            ".preview-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; color: #00ff88; font-size: 16px; }" +
            ".build-log-panel { display: flex; flex-direction: column; max-height: 150px; border-top: 2px solid #00ff88; background: rgba(0,0,0,0.5); flex-shrink: 0; }" +
            ".log-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 15px; background: rgba(0,255,136,0.1); font-size: 12px; }" +
            ".clear-log-btn { padding: 4px 8px; background: rgba(255,68,68,0.2); border: 1px solid #ff4444; color: #ff4444; border-radius: 3px; cursor: pointer; font-size: 10px; }" +
            ".build-log { flex: 1; padding: 8px 15px; overflow-y: auto; font-size: 11px; line-height: 1.4; font-family: monospace; min-height: 50px; }" +
            ".log-entry { margin-bottom: 3px; display: flex; gap: 8px; }" +
            ".log-time { color: #888; min-width: 70px; font-size: 10px; }" +
            ".log-message { flex: 1; }" +
            ".log-entry.log-error .log-message { color: #ff4444; }" +
            ".log-entry.log-file-complete .log-message, .log-entry.log-success .log-message { color: #00ff88; }" +
            ".build-progress-container { padding: 8px 15px; background: rgba(0,0,0,0.3); }" +
            ".progress-bar-bg { background: rgba(0,0,0,0.5); border-radius: 10px; height: 8px; overflow: hidden; }" +
            ".progress-bar { height: 100%; background: linear-gradient(90deg, #00ff88, #00ccff); border-radius: 10px; transition: width 0.3s ease; }" +
            ".progress-text { font-size: 12px; margin-top: 5px; color: #aaa; }" +
            "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }" +
            "@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }" +
            ".live-preview-modal.minimized .live-preview-body, .live-preview-modal.minimized .build-log-panel { display: none; }" +
            "@media (max-width: 1200px) { .live-preview-body { grid-template-columns: 1fr; } }";

        document.head.appendChild(style);
    }
}

// Initialize global instance
window.livePreview = new LiveStreamingPreview();
console.log("[LivePreview] ✅ Global instance created with timer support");

// Connect socket when ready
document.addEventListener("DOMContentLoaded", function() {
    console.log("🎥 Live Streaming Preview System ready!");
    if (window.socket) {
        window.livePreview.socket = window.socket;
    }
    setTimeout(function() {
        if (window.socket && !window.livePreview.socket) {
            window.livePreview.socket = window.socket;
        }
    }, 2000);
});

// Backward compatibility
window.showPreviewPopup = function(projectData, socket) {
    if (window.livePreview) {
        window.livePreview.autoOpen({
            taskId: projectData.taskId || Date.now(),
            projectName: projectData.projectName || "Project",
            projectType: projectData.projectType || "web",
            features: projectData.features || "features",
            frontendId: "legacy-preview"
        });
    }
};

console.log("✅ Live Streaming Preview v2025-12-07-fixed loaded");

// Override saveProject with better flow
LiveStreamingPreview.prototype.saveProject = function() {
    // Save to localStorage
    var projectData = {
        name: this.currentTask.projectName,
        type: this.currentTask.projectType,
        files: {},
        savedAt: new Date().toISOString(),
        buildTime: this.buildSeconds
    };
    
    // Convert files to saveable format
    var self = this;
    Object.keys(this.files).forEach(function(fileName) {
        projectData.files[fileName] = self.files[fileName].content;
    });

    var savedProjects = JSON.parse(localStorage.getItem("crackerbot_projects") || "[]");
    savedProjects.unshift(projectData);
    if (savedProjects.length > 20) savedProjects = savedProjects.slice(0, 20);
    localStorage.setItem("crackerbot_projects", JSON.stringify(savedProjects));

    this.addLogMessage("💾 Project saved to browser!", "success");
    
    // Close preview and show options in chat
    this.closeAndShowOptions();
};

// Close preview and return to chat with options
LiveStreamingPreview.prototype.closeAndShowOptions = function() {
    var projectName = this.currentTask ? this.currentTask.projectName : "Project";
    var buildTime = this.buildSeconds;
    
    // Close the modal
    this.close();
    
    // Add completion message to chat
    if (window.addBotMessage) {
        var mins = Math.floor(buildTime / 60);
        var secs = buildTime % 60;
        var timeStr = mins + ":" + (secs < 10 ? "0" : "") + secs;
        
        window.addBotMessage('🎉 "' + projectName + '" built successfully in ' + timeStr + '!');
    }
    
    // Show option bubbles
    setTimeout(function() {
        showPostBuildOptions(projectName);
    }, 500);
};

// Show post-build option bubbles
function showPostBuildOptions(projectName) {
    var chatMessages = document.getElementById("chat-messages");
    if (!chatMessages) return;
    
    var optionsDiv = document.createElement("div");
    optionsDiv.className = "post-build-options";
    optionsDiv.innerHTML = 
        '<div class="options-label">What would you like to do next?</div>' +
        '<div class="option-bubbles">' +
            '<button class="option-bubble" onclick="handlePostBuildOption(\'download\')">📥 Download ZIP</button>' +
            '<button class="option-bubble" onclick="handlePostBuildOption(\'preview\')">👁️ View Again</button>' +
            '<button class="option-bubble" onclick="handlePostBuildOption(\'modify\')">✏️ Modify Project</button>' +
            '<button class="option-bubble" onclick="handlePostBuildOption(\'new\')">🚀 Build New Project</button>' +
            '<button class="option-bubble" onclick="handlePostBuildOption(\'share\')">🔗 Share Link</button>' +
        '</div>';
    
    chatMessages.appendChild(optionsDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add styles if not present
    if (!document.getElementById("post-build-styles")) {
        var style = document.createElement("style");
        style.id = "post-build-styles";
        style.textContent = 
            ".post-build-options { padding: 15px; margin: 10px 0; }" +
            ".options-label { color: #888; font-size: 12px; margin-bottom: 10px; }" +
            ".option-bubbles { display: flex; flex-wrap: wrap; gap: 8px; }" +
            ".option-bubble {" +
                "padding: 10px 16px;" +
                "background: linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,204,255,0.2));" +
                "border: 1px solid #00ff88;" +
                "border-radius: 20px;" +
                "color: #00ff88;" +
                "cursor: pointer;" +
                "font-size: 13px;" +
                "transition: all 0.3s ease;" +
            "}" +
            ".option-bubble:hover {" +
                "background: linear-gradient(135deg, #00ff88, #00ccff);" +
                "color: #000;" +
                "transform: translateY(-2px);" +
                "box-shadow: 0 5px 15px rgba(0,255,136,0.3);" +
            "}";
        document.head.appendChild(style);
    }
}

// Handle post-build option clicks
window.handlePostBuildOption = function(option) {
    // Remove options after selection
    var optionsDiv = document.querySelector(".post-build-options");
    if (optionsDiv) optionsDiv.remove();
    
    var savedProjects = JSON.parse(localStorage.getItem("crackerbot_projects") || "[]");
    var lastProject = savedProjects[0];
    
    switch(option) {
        case 'download':
            if (lastProject) {
                downloadProjectAsZip(lastProject);
            }
            break;
            
        case 'preview':
            if (lastProject && window.livePreview) {
                // Reopen preview with saved files
                window.livePreview.autoOpen({
                    taskId: Date.now(),
                    projectName: lastProject.name,
                    projectType: lastProject.type,
                    features: "saved project"
                });
                // Load saved files
                setTimeout(function() {
                    Object.keys(lastProject.files).forEach(function(fileName) {
                        window.livePreview.files[fileName] = { 
                            content: lastProject.files[fileName], 
                            complete: true 
                        };
                        window.livePreview.addFileTab(fileName);
                        window.livePreview.markFileComplete(fileName);
                    });
                    window.livePreview.updateFilesCounter();
                    window.livePreview.selectFile("index.html");
                    window.livePreview.updatePreview();
                    window.livePreview.stopBuildTimer();
                    
                    var status = document.getElementById("build-status");
                    if (status) {
                        status.textContent = "✅ Loaded from saved";
                        status.style.color = "#00ff88";
                    }
                    var saveBtn = document.getElementById("save-btn");
                    if (saveBtn) saveBtn.style.display = "block";
                }, 100);
            }
            break;
            
        case 'modify':
            if (window.addBotMessage) {
                window.addBotMessage("What changes would you like to make to your project? You can say things like:\n• Add a contact form\n• Change the color scheme to blue\n• Add more animations\n• Make the header sticky");
            }
            break;
            
        case 'new':
            if (window.addBotMessage) {
                window.addBotMessage("🚀 Ready to build something new! What would you like to create?");
            }
            // Show project type selector if available
            if (window.showProjectTypeSelector) {
                setTimeout(window.showProjectTypeSelector, 500);
            }
            break;
            
        case 'share':
            if (lastProject) {
                generateShareableLink(lastProject);
            }
            break;
    }
};

// Download project as ZIP
function downloadProjectAsZip(project) {
    // Create a simple ZIP-like download (individual files for now)
    var html = project.files["index.html"] || "";
    var css = project.files["style.css"] || "";
    var js = project.files["script.js"] || "";
    
    // Combine into single HTML for easy download
    var fullHtml = html;
    if (css) fullHtml = fullHtml.replace("</head>", "<style>\n" + css + "\n</style>\n</head>");
    if (js) fullHtml = fullHtml.replace("</body>", "<script>\n" + js + "\n</script>\n</body>");
    
    var blob = new Blob([fullHtml], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = (project.name || "project").replace(/[^a-z0-9]/gi, "-").toLowerCase() + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.addBotMessage) {
        window.addBotMessage("📥 Downloaded! Your project has been saved as a single HTML file.");
    }
}

// Generate shareable link
function generateShareableLink(project) {
    // For now, create a data URL that can be copied
    var html = project.files["index.html"] || "";
    var css = project.files["style.css"] || "";
    var js = project.files["script.js"] || "";
    
    var fullHtml = html;
    if (css) fullHtml = fullHtml.replace("</head>", "<style>" + css + "</style></head>");
    if (js) fullHtml = fullHtml.replace("</body>", "<script>" + js + "<\/script></body>");
    
    var blob = new Blob([fullHtml], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(function() {
        if (window.addBotMessage) {
            window.addBotMessage("🔗 Preview link copied to clipboard! Note: This link is temporary and only works in your current browser session.");
        }
    }).catch(function() {
        // Fallback - open in new tab
        window.open(url, "_blank");
        if (window.addBotMessage) {
            window.addBotMessage("🔗 Opened preview in new tab!");
        }
    });
}

console.log("✅ Post-build options system loaded");
