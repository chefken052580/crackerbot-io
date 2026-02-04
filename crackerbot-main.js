// CrackerBot Main Application
console.log("🌌 CrackerBot Initializing...");

// Global variables
window.socket = null;
window.isConnected = false;

// FIXED: Don't auto-load name if we're warping or just warped
if (!window.isWarping && !window.justWarped) {
    window.userName = localStorage.getItem("crackerBotUserName") || "";
} else {
    window.userName = ""; // Empty during warp
}

window.currentTask = null;
window.taskPending = null;
window.projects = JSON.parse(localStorage.getItem("crackerBotProjects") || "[]");
window.messageHistory = [];
window.buildInterval = null;
window.currentTheme = "matrix";

// ✅ FIX: Global progress tracking (prevents 95% stuck bug)
window.currentBuildProgress = 0;
window.backendProgressReceived = false;

// Initialize Socket.IO connection
function initializeSocket() {
    if (typeof io !== "undefined") {
        // FIXED: Direct backend URL for crackerbot.io on port 8443
        var backendUrl = null;
        
        // Check for saved backend URL first (for development/testing)
        var savedBackendUrl = localStorage.getItem('crackerbot_backend_url');
        
        if (savedBackendUrl) {
            backendUrl = savedBackendUrl;
            console.log("[Main] Using saved backend URL:", backendUrl);
        } else {
            // Production: Direct connection to crackerbot.io backend on port 8443
            backendUrl = "https://crackerbot.io:8443";
            console.log("[Main] Using crackerbot.io backend:", backendUrl);
        }
        
        // Store globally
        window.BACKEND_URL = backendUrl;
        console.log("[Main] Connecting to backend:", backendUrl);
        
        // CRITICAL FIX: Assign to window.socket, not local socket variable
        window.socket = io(backendUrl, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        // CRITICAL FIX: Reference window.socket consistently
        window.socket.on("connect", function() {
            console.log("✅ Connected to backend:", backendUrl);
            console.log("✅ Socket ID:", window.socket.id);
            window.isConnected = true;
            updateStatus("connected");
            
            // ENHANCED: Connect live preview to socket with retries
            connectLivePreviewToSocket();
            
            // FIXED: Don't send old username if we're warping
            if (window.userName && !window.isWarping && !window.justWarped) {
                console.log("[Main] Setting username:", window.userName);
                // Check if this is a new user (after warp reload)
                var isNewUser = localStorage.getItem('crackerBotIsNewUser') === 'true';
                if (isNewUser) {
                    localStorage.removeItem('crackerBotIsNewUser');
                }
                window.socket.emit("set_username", { username: window.userName, isNew: isNewUser });
            }
        });

        window.socket.on("disconnect", function() {
            console.log("❌ Disconnected from backend");
            window.isConnected = false;
            updateStatus("disconnected");
        });

        // FIXED: Enhanced message handler with welcome detection
        window.socket.on("message", function(data) {
            console.log("[Main] Received message event:", data);
            if (data.from !== "You") {
                addMessage(data.from || "CrackerBot", data.text, "bot");
                
                // CRITICAL FIX: Detect welcome messages and trigger option bubbles
                if (data.text && (data.text.includes("Welcome") || data.text.includes("GREETINGS") || data.text.includes("cosmic") || data.text.includes("CrackerBot") || data.text.includes("coding companion"))) {
                    console.log("[Main] Welcome message detected, showing option bubbles");
                    setTimeout(function() {
                        if (window.showMainChoices && typeof window.showMainChoices === 'function') {
                            console.log("[Main] Calling showMainChoices()");
                            window.showMainChoices();
                        } else if (window.showMainChoice && typeof window.showMainChoice === 'function') {
                            console.log("[Main] Calling showMainChoice()");
                            window.showMainChoice();
                        } else {
                            console.log("[Main] Falling back to setTaskPending for options");
                            // Fallback to manual option bubbles
                            setTaskPending({
                                question: "What would you like to do?",
                                options: ["🚀 Build-Something-Epic", "💬 Chat", "📁 View Projects"],
                                step: "main-choice"
                            });
                        }
                    }, 1000);
                }
            }
        });

        // ALSO handle 'response' events for compatibility
        window.socket.on("response", function(data) {
            console.log("[Main] Received response event:", data);
            addMessage("CrackerBot", data.message, "bot");
            
            // CRITICAL FIX: Detect welcome messages and trigger option bubbles
            if (data.message && (data.message.includes("Welcome") || data.message.includes("GREETINGS") || data.message.includes("cosmic") || data.message.includes("CrackerBot") || data.message.includes("coding companion"))) {
                console.log("[Main] Welcome message detected in response, showing option bubbles");
                setTimeout(function() {
                    if (window.showMainChoices && typeof window.showMainChoices === 'function') {
                        console.log("[Main] Calling showMainChoices()");
                        window.showMainChoices();
                    } else if (window.showMainChoice && typeof window.showMainChoice === 'function') {
                        console.log("[Main] Calling showMainChoice()");
                        window.showMainChoice();
                    } else {
                        console.log("[Main] Falling back to setTaskPending for options");
                        // Fallback to manual option bubbles
                        setTaskPending({
                            question: "What would you like to do?",
                            options: ["🚀 Build-Something-Epic", "💬 Chat", "📁 View Projects"],
                            step: "main-choice"
                        });
                    }
                }, 1000);
            }
        });
        
        // NEW: Add AI event handlers for project generation
        window.socket.on("project_generated", function(data) {
            console.log("[Main] Project generated:", data);
            
            // ✅ FIX: Clear fake progress interval when project completes
            if (window.buildInterval) {
                console.log("[Main] ✅ Clearing fake progress interval - project generated");
                clearInterval(window.buildInterval);
                window.buildInterval = null;
            }
            
            if (data && data.files) {
                if (window.currentTask) {
                    window.currentTask.files = data.files;
                }
                
                // ✅ FIX: Set progress to 100% before completing
                var progressFill = document.getElementById("task-progress-fill") || 
                                   document.getElementById("progress-bar");
                var progressText = document.getElementById("progress-text");
                if (progressFill) {
                    progressFill.style.width = "100%";
                }
                if (progressText) {
                    progressText.textContent = "100% - Complete!";
                }
                
                if (window.addMessage) {
                    window.addMessage("AI", "✅ Project generated successfully!", "bot");
                }
                
                // Update live preview with generated files
                if (window.livePreview && data.files) {
                    console.log("[Main] Sending AI-generated files to live preview");
                    try {
                        if (typeof window.livePreview.updateFiles === 'function') {
                            window.livePreview.updateFiles(data.files);
                        } else if (typeof window.livePreview.displayFiles === 'function') {
                            window.livePreview.displayFiles(data.files);
                        }
                    } catch (error) {
                        console.error("[Main] Error updating live preview with AI files:", error);
                    }
                }
                
                // ✅ FIX: Always call completeBuilding when project_generated received
                setTimeout(function() {
                    if (window.completeBuild || window.completeBuilding) {
                        (window.completeBuild || window.completeBuilding)();
                    }
                }, 500);
            }
        });
        
        // NEW: Handle live_build_update events (for build_complete)
        window.socket.on("live_build_update", function(data) {
            console.log("[Main] live_build_update:", data);
            
            // Handle build_complete type
            if (data && data.type === "build_complete") {
                console.log("[Main] ✅ Build complete event received");
                
                // Clear fake progress
                if (window.buildInterval) {
                    clearInterval(window.buildInterval);
                    window.buildInterval = null;
                }
                
                // Set progress to 100%
                var progressFill = document.getElementById("task-progress-fill") || 
                                   document.getElementById("progress-bar");
                var progressText = document.getElementById("progress-text");
                if (progressFill) {
                    progressFill.style.width = "100%";
                }
                if (progressText) {
                    progressText.textContent = "100% - Complete!";
                }
                
                // Store files if provided
                if (data.files && window.currentTask) {
                    window.currentTask.files = data.files;
                }
                
                // Complete the build
                setTimeout(function() {
                    if (window.completeBuilding) {
                        completeBuilding();
                    }
                }, 500);
            }
        });
        
        // ✅ FIXED: Handle AI progress updates with global tracking
        window.socket.on("progress", function(data) {
            console.log("[Main] Backend progress received:", data);
            
            if (data && data.percent !== undefined) {
                // ✅ Mark that we're receiving backend progress
                window.backendProgressReceived = true;
                
                // ✅ Update GLOBAL progress variable
                window.currentBuildProgress = data.percent;
                
                // ✅ STOP fake progress immediately
                if (window.buildInterval) {
                    console.log("[Main] ✅ STOPPING fake progress - backend is sending real progress");
                    clearInterval(window.buildInterval);
                    window.buildInterval = null;
                }
                
                // Update UI
                if (data.status) {
                    addMessage("System", "🚀 " + data.percent + "% - " + data.status, "system");
                }
                
                var progressFill = document.getElementById("task-progress-fill") || 
                                   document.getElementById("progress-bar");
                var progressText = document.getElementById("progress-text");
                
                if (progressFill) {
                    progressFill.style.width = data.percent + "%";
                    console.log("[Main] Progress bar updated to:", data.percent + "%");
                }
                if (progressText) {
                    progressText.textContent = data.percent + "% - " + (data.status || "Building...");
                }
                
                // ✅ FIX: Complete at 100% IMMEDIATELY
                if (data.percent >= 100) {
                    console.log("[Main] ✅ Backend confirmed 100% - completing build NOW");
                    completeBuilding(); // No delay!
                }
            }
        });
        
        // Enhanced error handling
        window.socket.on("connect_error", function(error) {
            console.error("[Main] Socket connection error:", error);
            addMessage("System", "❌ Connection error: " + error.message, "system");
        });
        
        window.socket.on("error", function(error) {
            console.error("[Main] Socket error:", error);
            addMessage("System", "❌ Socket error: " + error, "system");
        });
    }
}

// ENHANCED: Function to connect live preview to socket with retries
function connectLivePreviewToSocket() {
    var attempts = 0;
    var maxAttempts = 10;
    
    var tryConnect = function() {
        attempts++;
        console.log("[Main] Attempting to connect live preview to socket (attempt " + attempts + ")");
        
        if (window.livePreview && window.socket) {
            window.livePreview.socket = window.socket;
            console.log("[Main] ✅ Live preview connected to socket successfully");
            return true;
        } else {
            console.log("[Main] Live preview not ready yet:", {
                livePreview: !!window.livePreview,
                socket: !!window.socket
            });
            
            if (attempts < maxAttempts) {
                setTimeout(tryConnect, 500);
            } else {
                console.error("[Main] ❌ Failed to connect live preview after " + maxAttempts + " attempts");
            }
            return false;
        }
    };
    
    tryConnect();
}

// ENHANCED: Force live preview to open with error handling
function forceLivePreviewOpen(taskData) {
    console.log("[FORCE] Attempting to force open live preview...");
    
    if (!taskData) {
        taskData = {
            taskId: window.currentTask?.taskId || Date.now(),
            projectName: window.currentTask?.projectName || 'Live Preview',
            projectType: window.currentTask?.projectType || 'web',
            projectTypeName: window.currentTask?.projectTypeName || 'Web App',
            features: window.currentTask?.features || 'Live editing features',
            frontendId: window.socket ? window.socket.id : 'no-socket'
        };
    }
    
    if (window.livePreview && typeof window.livePreview.autoOpen === 'function') {
        console.log("[FORCE] ✅ Live preview found, calling autoOpen");
        console.log("[FORCE] Task data:", taskData);
        
        try {
            window.livePreview.autoOpen(taskData);
            console.log("[FORCE] ✅ Live preview opened successfully");
            return true;
        } catch (error) {
            console.error("[FORCE] ❌ Error opening live preview:", error);
            return false;
        }
    } else {
        console.log("[FORCE] ❌ Live preview not available");
        console.log("[FORCE] window.livePreview:", typeof window.livePreview);
        
        if (window.livePreview) {
            console.log("[FORCE] Available methods:", Object.keys(window.livePreview));
        }
        
        // Try to wait and retry
        setTimeout(function() {
            console.log("[FORCE] Retrying live preview in 2 seconds...");
            if (window.livePreview && typeof window.livePreview.autoOpen === 'function') {
                window.livePreview.autoOpen(taskData);
            }
        }, 2000);
        
        return false;
    }
}

// Make functions globally available
window.initializeSocket = initializeSocket;
window.connectLivePreviewToSocket = connectLivePreviewToSocket;
window.forceLivePreviewOpen = forceLivePreviewOpen;

// Add message to chat
function addMessage(from, text, type, skipHistory) {
    var messagesDiv = document.getElementById("chat-messages") || document.getElementById("messages");
    if (!messagesDiv) return;
    
    var messageDiv = document.createElement("div");
    messageDiv.className = "message " + type + "-message";
    messageDiv.innerHTML = "<strong>" + from + ":</strong> " + text;
    messagesDiv.appendChild(messageDiv);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    if (!skipHistory) {
        window.messageHistory.push({ from: from, text: text, type: type, time: new Date().toLocaleTimeString() });
    }
}

// Make addMessage globally available
window.addMessage = addMessage;

// FIXED: Send message with enhanced debugging and post-build handler
function sendMessage() {
    console.log("📤 [Main] ==> sendMessage() called");
    
    var input = document.getElementById("message-input") || document.getElementById("input");
    if (!input) {
        console.error("❌ [Main] No input element found!");
        addMessage("System", "❌ Input element not found", "system");
        return;
    }
    
    var text = input.value.trim();
    if (!text) {
        console.log("⚠️ [Main] Empty message, ignoring");
        return;
    }

    console.log("📝 [Main] Message text:", text);
    console.log("🔍 [Main] Socket exists:", !!window.socket);
    console.log("🔍 [Main] Socket connected:", window.socket?.connected);
    console.log("🔍 [Main] isConnected flag:", window.isConnected);

    // Add to chat first
    addMessage("You", text, "user");
    input.value = "";

    // Handle commands
    if (text.startsWith("/")) {
        console.log("⚡ [Main] Processing command:", text);
        processCommand(text);
        return;
    }

    // CRITICAL FIX: Handle task pending responses INCLUDING post-build
    if (window.taskPending) {
        console.log("📋 [Main] taskPending detected:", window.taskPending);
        console.log("📋 [Main] taskPending.step:", window.taskPending.step);
        console.log("📋 [Main] Handling task pending response for step:", window.taskPending.step);
        
        if (window.taskPending.step === "name") {
            window.userName = text;
            localStorage.setItem("crackerBotUserName", text);
            updateUserName();
            setTaskPending(null);
        } else if (window.taskPending.step === "project-name") {
            window.currentTask.projectName = text;
            updateTaskStatus();
            setTaskPending(null);
            showProjectTypes();
        } else if (window.taskPending.step === "features") {
            window.currentTask.features = text;
            updateTaskStatus();
            setTaskPending(null);
            // ✅ FIX: Don't call startBuilding() here - the AI path is now the only build trigger
            // This prevents the triple-build issue (manual setup + AI request + old progress loop)
            addMessage("CrackerBot", "🚀 Ready to build! Your project \"" + window.currentTask.projectName + "\" is all set. Type something like 'build me this website' to start!", "bot");
        } else if (window.taskPending.step === "post-build") {
            // NEW: Handle post-build options
            console.log("📋 [Main] Handling post-build option:", text);
            setTaskPending(null);  // Clear the pending state first
            handleOption(text);    // Process the option
        } else if (window.taskPending.step === "main-choice") {
            // Handle main choice options
            console.log("📋 [Main] Handling main choice:", text);
            setTaskPending(null);
            handleOption(text);
        } else {
            // ENHANCED: Handle unknown taskPending steps
            console.log("❌ [Main] Unknown taskPending step:", window.taskPending.step);
            console.log("❌ [Main] Clearing unknown taskPending state");
            setTaskPending(null);
            addMessage("System", "⚠️ Cleared unknown task state - please try again", "system");
        }
        return;
    }

    // ENHANCED: Check for AI project generation requests with detailed logging
    console.log("🤖 [Main] Checking for AI integration...");
    console.log("🤖 [Main] handleChatToAI exists:", typeof window.handleChatToAI);
    
    if (window.handleChatToAI && typeof window.handleChatToAI === 'function') {
        console.log("🔍 [Main] Calling handleChatToAI with:", text);
        try {
            var aiHandled = window.handleChatToAI(text);
            console.log("🤖 [Main] AI handleChatToAI result:", aiHandled);
            if (aiHandled) {
                console.log("🚀 [Main] ✅ Message handled by AI system, not sending to regular chat");
                return;
            }
            console.log("💬 [Main] Message not an AI request, proceeding to regular chat");
        } catch (error) {
            console.error("❌ [Main] Error in AI handler:", error);
            console.log("💬 [Main] AI handler failed, proceeding to regular chat");
        }
    } else {
        console.log("⚠️ [Main] AI connector not available");
    }

    // ENHANCED: Send to backend with comprehensive error checking
    console.log("🌐 [Main] Preparing to send to backend...");
    
    if (!window.socket) {
        console.error("❌ [Main] Socket does not exist!");
        addMessage("System", "❌ Not connected - socket missing. Please refresh page.", "system");
        return;
    }
    
    if (!window.socket.connected) {
        console.error("❌ [Main] Socket exists but not connected!");
        console.log("🔍 [Main] Socket state:", window.socket.readyState);
        addMessage("System", "❌ Not connected to server. Please refresh page.", "system");
        return;
    }
    
    if (!window.isConnected) {
        console.error("❌ [Main] isConnected flag is false!");
        addMessage("System", "❌ Connection flag is false. Please refresh page.", "system");
        return;
    }

    // All checks passed - send the message
    console.log("📡 [Main] 🚀 SENDING MESSAGE TO BACKEND 🚀");
    console.log("📡 [Main] Socket ID:", window.socket.id);
    console.log("📡 [Main] Backend URL:", window.BACKEND_URL);
    console.log("📡 [Main] User:", window.userName || "Anonymous");
    
    var messagePayload = {
        text: text,
        type: "message",
        frontendId: window.socket.id,
        user: window.userName || "Anonymous"
    };
    
    console.log("📡 [Main] Message payload:", messagePayload);
    
    try {
        window.socket.emit("message", messagePayload);
        console.log("✅ [Main] 🎉 MESSAGE SENT SUCCESSFULLY! 🎉");
        console.log("✅ [Main] You should see this in backend logs as: [MESSAGE] Processing user message");
    } catch (error) {
        console.error("❌ [Main] Socket emit failed:", error);
        addMessage("System", "❌ Failed to send message: " + error.message, "system");
    }
}

// Make sendMessage globally available
window.sendMessage = sendMessage;

// Process commands with enhanced socket testing
function processCommand(command) {
    var cmd = command.toLowerCase();
    
    if (cmd === "/create" || cmd === "/build") {
        window.currentTask = { mode: "building" };
        promptProjectName();
    } else if (cmd === "/projects") {
        if (window.showProjectsManager) {
            window.showProjectsManager();
        }
    } else if (cmd === "/clear") {
        var messagesDiv = document.getElementById("chat-messages") || document.getElementById("messages");
        if (messagesDiv) messagesDiv.innerHTML = "";
        window.messageHistory = [];
    } else if (cmd === "/help" || cmd === "/guide") {
        showHelp();
    } else if (cmd === "/warp_reconnect") {
        warpReconnect();
    } else if (cmd === "/clear_taskpending") {
        console.log("[Main] Clearing taskPending manually...");
        setTaskPending(null);
        addMessage("System", "✅ Task pending cleared", "system");
    } else if (cmd === "/check_taskpending") {
        console.log("[Main] Checking taskPending state...");
        if (window.taskPending) {
            addMessage("System", "📋 TaskPending step: " + window.taskPending.step, "system");
            addMessage("System", "📋 TaskPending question: " + (window.taskPending.question || 'none'), "system");
            console.log("🔍 Current taskPending:", window.taskPending);
        } else {
            addMessage("System", "📋 TaskPending: null (cleared)", "system");
            console.log("🔍 Current taskPending: null");
        }
    } else if (cmd === "/reset_taskpending") {
        console.log("🔧 FORCE RESET: taskPending was:", window.taskPending);
        window.taskPending = null;
        setTaskPending(null);
        console.log("🔧 FORCE RESET: taskPending now:", window.taskPending);
        addMessage("System", "✅ TaskPending force reset", "system");
    } else if (cmd === "/test_options") {
        console.log("[Main] Testing option bubbles...");
        if (window.showMainChoices && typeof window.showMainChoices === 'function') {
            console.log("[Main] Testing showMainChoices()");
            window.showMainChoices();
        } else {
            console.log("[Main] Testing setTaskPending()");
            setTaskPending({
                question: "Test Options:",
                options: ["🚀 Build-Something-Epic", "💬 Chat", "📁 View Projects"],
                step: "main-choice"
            });
        }
    } else if (cmd === "/live_preview" || cmd === "/test_live") {
        console.log("[Main] Testing live preview...");
        forceLivePreviewOpen({
            taskId: Date.now(),
            projectName: "Test Project",
            projectType: "web",
            frontendId: window.socket ? window.socket.id : 'test'
        });
    } else if (cmd === "/test_ai") {
        console.log("[Main] Testing AI integration...");
        addMessage("System", "🧪 Testing AI integration...", "system");
        addMessage("System", "handleChatToAI exists: " + (!!window.handleChatToAI), "system");
        addMessage("System", "handleChatToAI type: " + (typeof window.handleChatToAI), "system");
        
        if (window.handleChatToAI) {
            try {
                var testResult = window.handleChatToAI("create a test website");
                console.log("[Main] AI test result:", testResult);
                addMessage("System", "AI test result: " + testResult, "system");
            } catch (error) {
                console.error("[Main] AI test error:", error);
                addMessage("System", "AI test error: " + error.message, "system");
            }
        } else {
            addMessage("System", "❌ AI connector not available", "system");
        }
    } else if (cmd === "/test_socket") {
        console.log("[Main] Testing socket connection...");
        addMessage("System", "🧪 Socket Connection Test:", "system");
        addMessage("System", "Socket exists: " + (!!window.socket), "system");
        addMessage("System", "Socket connected: " + (window.socket?.connected), "system");
        addMessage("System", "Socket ID: " + (window.socket?.id || 'none'), "system");
        addMessage("System", "isConnected flag: " + window.isConnected, "system");
        addMessage("System", "Backend URL: " + (window.BACKEND_URL || 'not set'), "system");
        addMessage("System", "taskPending: " + (window.taskPending?.step || 'null'), "system");
        
        if (window.socket) {
            addMessage("System", "Socket state: " + window.socket.readyState, "system");
            addMessage("System", "Socket transport: " + (window.socket.io?.engine?.transport?.name || 'unknown'), "system");
        }
        
        if (window.socket && window.socket.connected) {
            addMessage("System", "🧪 Sending test message to backend...", "system");
            console.log("[Main] Sending test message via socket.emit...");
            try {
                window.socket.emit("message", {
                    text: "🧪 SOCKET TEST MESSAGE",
                    type: "message",
                    frontendId: window.socket.id,
                    user: "SocketTest"
                });
                console.log("[Main] ✅ Test message sent successfully");
                addMessage("System", "✅ Test message sent! Check backend logs for: [MESSAGE] Processing user message", "system");
            } catch (error) {
                console.error("[Main] Test message failed:", error);
                addMessage("System", "❌ Test message failed: " + error.message, "system");
            }
        } else {
            addMessage("System", "❌ Cannot send test - socket not connected", "system");
        }
    } else if (cmd === "/reconnect") {
        console.log("[Main] Force reconnecting socket...");
        if (window.socket) {
            window.socket.disconnect();
            setTimeout(function() {
                initializeSocket();
            }, 1000);
        } else {
            initializeSocket();
        }
        addMessage("System", "🔄 Reconnecting...", "system");
    } else {
        addMessage("System", "Unknown command: " + command, "system");
    }
}

// Handle key press
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}

// Show help
function showHelp() {
    var helpText = 
        '🤖 <strong>CrackerBot Commands:</strong><br><br>' +
        '<strong>General:</strong><br>' +
        '• /help - Show this help message<br>' +
        '• /clear - Clear chat history<br>' +
        '• /warp_reconnect - Reset everything<br>' +
        '• /reconnect - Force socket reconnection<br><br>' +
        '<strong>Debug:</strong><br>' +
        '• /check_taskpending - Check current task state<br>' +
        '• /clear_taskpending - Clear stuck task state<br>' +
        '• /reset_taskpending - Force reset task state<br>' +
        '• /test_socket - Test socket connection<br>' +
        '• /test_options - Test option bubbles<br>' +
        '• /test_live - Test live preview<br>' +
        '• /test_ai - Test AI integration<br><br>' +
        '<strong>Building:</strong><br>' +
        '• /create or /build - Start building a project<br>' +
        '• /projects - View your projects<br>' +
        '• Just say "create" or "build" + your idea!<br><br>' +
        '<strong>Examples:</strong><br>' +
        '• "Create a website about cats"<br>' +
        '• "Build a simple game"<br>' +
        '• "Make a calculator app"';
    
    addMessage("System", helpText, "system");
}

// Show main choice
function showMainChoice() {
    addMessage("CrackerBot", "🌟 What would you like to do?", "bot");
    setTaskPending({
        question: "Choose your cosmic path:",
        options: ["Chat", "Build-Something-Epic", "View Projects"],
        step: "main-choice"
    });
}

// Prompt for project name
function promptProjectName() {
    addMessage("CrackerBot", "🚀 Let's build something epic! What shall we name your project?", "bot");
    setTaskPending({
        question: "Enter project name:",
        step: "project-name",
        placeholder: "Type your project name..."
    });
}

// Show project types
function showProjectTypes() {
    addMessage("CrackerBot", "🎯 Choose your project type!", "bot");
    setTimeout(function() {
        if (window.showCategoryPopup) {
            showCategoryPopup();
        } else {
            console.log("[Main] showCategoryPopup not available, check if crackerbot-projects.js is loaded");
        }
    }, 300);
}

// Start building
function startBuilding() {
    console.log("🚀 [Main] Starting build");
    
    // ✅ GUARD: Prevent double-firing via _aiGenerationInProgress flag
    if (window._aiGenerationInProgress) {
        console.log("⚠️ [Main] Build already in progress, skipping duplicate");
        return;
    }
    
    // ✅ FIX: Reset progress tracking
    window.currentBuildProgress = 0;
    window.backendProgressReceived = false;
    
    // Clear any existing interval
    if (window.buildInterval) {
        console.log("[Main] Clearing existing build interval");
        clearInterval(window.buildInterval);
        window.buildInterval = null;
    }
    
    window.currentTask.status = "Building";
    window.currentTask.taskId = Date.now();
    updateTaskStatus();
    
    addMessage("CrackerBot", '🌌 Building "' + window.currentTask.projectName + '"...', "bot");
    
    // ✅ UNIFIED PIPELINE: Route through AI connector (same as chat flow)
    const aiRequest = {
        name: window.currentTask.projectName,
        type: window.currentTask.projectType || 'web-app',
        features: window.currentTask.features || 'No features specified'
    };
    
    console.log("[Main] Routing build through triggerBackendAIGeneration");
    window.triggerBackendAIGeneration(aiRequest);
    
    // ✅ FIX: Always start fake progress (will be overridden by backend)
    startFakeProgress();
}

// ✅ NEW: Separate fake progress function
function startFakeProgress() {
    console.log("[Main] Starting fake progress (will be overridden by backend)");
    
    var progressContainer = document.getElementById("task-progress-container") || 
                           document.querySelector(".progress-container");
    if (progressContainer) progressContainer.style.display = "block";
    
    var progressFill = document.getElementById("task-progress-fill") || 
                        document.getElementById("progress-bar");
    var progressText = document.getElementById("progress-text");
    
    if (progressFill) progressFill.style.width = "0%";
    if (progressText) progressText.textContent = "0% - Starting...";
    
    var stepIndex = 0;
    var buildSteps = [
        "🔧 Initializing project structure...",
        "📦 Installing dependencies...",
        "🎨 Setting up styles...",
        "⚡ Configuring components...",
        "🚀 Finalizing build..."
    ];
    
    window.buildInterval = setInterval(function() {
        // ✅ STOP if backend has taken over
        if (window.backendProgressReceived) {
            console.log("[Main] Backend progress detected, stopping fake progress");
            clearInterval(window.buildInterval);
            window.buildInterval = null;
            return;
        }
        
        // ✅ STOP if we've hit 95% - just wait for backend
        if (window.currentBuildProgress >= 95) {
            console.log("[Main] Fake progress reached 95%, stopping and waiting for backend...");
            clearInterval(window.buildInterval);
            window.buildInterval = null;
            
            // Set UI to 95% and wait
            if (progressFill) progressFill.style.width = "95%";
            if (progressText) progressText.textContent = "95% - Finalizing...";
            return;
        }
        
        // ✅ Use GLOBAL progress variable
        window.currentBuildProgress += Math.floor(Math.random() * 8) + 5; // 5-12% per step
        
        // Show build step messages
        if (stepIndex < buildSteps.length && Math.random() > 0.5) {
            addMessage("System", buildSteps[stepIndex], "system");
            stepIndex++;
        }
        
        // Update UI with GLOBAL progress
        if (progressFill) {
            progressFill.style.width = window.currentBuildProgress + "%";
        }
        if (progressText) {
            progressText.textContent = window.currentBuildProgress + "% - Building...";
        }
        
    }, 800);
    
    // ✅ Safety timeout: After 30 seconds, force completion
    setTimeout(function() {
        if (window.buildInterval && !window.backendProgressReceived) {
            console.log("[Main] ⚠️ Build timeout reached (30s), forcing completion");
            clearInterval(window.buildInterval);
            window.buildInterval = null;
            window.currentBuildProgress = 100;
            completeBuilding();
        }
    }, 30000);
}

// Complete building
function completeBuilding() {
    console.log("[Main] ✅ completeBuilding() called");
    
    // ✅ FIX: Prevent multiple calls
    if (window.currentTask && window.currentTask.completed) {
        console.log("[Main] Build already completed, ignoring duplicate call");
        return;
    }
    
    // ✅ FIX: Stop any progress timers
    if (window.buildInterval) {
        console.log("[Main] Stopping build interval");
        clearInterval(window.buildInterval);
        window.buildInterval = null;
    }
    
    // ✅ FIX: Set progress to 100%
    window.currentBuildProgress = 100;
    
    var progressFill = document.getElementById("task-progress-fill") || 
                       document.getElementById("progress-bar");
    if (progressFill) {
        progressFill.style.width = "100%";
    }
    
    var progressText = document.getElementById("progress-text");
    if (progressText) {
        progressText.textContent = "100% - Complete!";
    }
    
    window.currentTask.status = "Complete";
    window.currentTask.completed = true;
    window.currentTask.completedAt = new Date().toISOString();
    updateTaskStatus();
    
    window.projects.push({...window.currentTask});
    localStorage.setItem("crackerBotProjects", JSON.stringify(window.projects));
    
    addMessage("CrackerBot", '✅ "' + window.currentTask.projectName + '" complete!', "bot");
    
    if (window.livePreview && window.currentTask && window.currentTask.files) {
        console.log("[Main] Sending generated files to live preview");
        try {
            if (typeof window.livePreview.updateFiles === 'function') {
                window.livePreview.updateFiles(window.currentTask.files);
            } else if (typeof window.livePreview.displayFiles === 'function') {
                window.livePreview.displayFiles(window.currentTask.files);
            } else {
                console.log("[Main] Live preview doesn't have file update methods");
            }
        } catch (error) {
            console.error("[Main] Error updating live preview with files:", error);
        }
    }
    
    // FIXED: Don't set taskPending to "post-build" - just clear it
    console.log("[Main] ✅ Project completed - NOT setting post-build taskPending");
    addMessage("CrackerBot", "🎉 Project complete! Type anything to continue chatting or use commands:", "bot");
    setTaskPending(null);  // Clear task pending completely
    
    setTimeout(function() {
        var progressContainer = document.getElementById("task-progress-container") || 
                                document.querySelector(".progress-container");
        var taskStatusSection = document.getElementById("task-status-section");
        if (progressContainer) progressContainer.style.display = "none";
        if (taskStatusSection) taskStatusSection.style.display = "none";
    }, 2000);
}

window.completeBuilding = completeBuilding;

// Set task pending
function setTaskPending(task) {
    console.log("🔧 [Main] setTaskPending called with:", task);
    window.taskPending = task;
    
    var pendingDiv = document.getElementById("task-pending") || 
                      document.getElementById("choice-bubbles");
    var questionDiv = document.getElementById("pending-question");
    var optionsDiv = document.getElementById("pending-options") || pendingDiv;
    var input = document.getElementById("message-input") || document.getElementById("input");
    
    if (task) {
        if (pendingDiv) {
            if (questionDiv) questionDiv.textContent = task.question;
            
            if (optionsDiv) {
                optionsDiv.innerHTML = "";
                
                if (task.options && task.options.length > 0) {
                    task.options.forEach(function(option) {
                        var bubble = document.createElement("button");
                        bubble.className = "option-bubble choice-bubble";
                        bubble.textContent = option;
                        bubble.onclick = function() { handleOption(option); };
                        optionsDiv.appendChild(bubble);
                    });
                    if (input) {
                        input.disabled = true;
                        input.placeholder = "Choose an option above...";
                    }
                } else {
                    if (input) {
                        input.disabled = false;
                        input.placeholder = task.placeholder || "Type your answer...";
                        input.focus();
                    }
                }
            }
            
            pendingDiv.style.display = "block";
        }
    } else {
        console.log("🔧 [Main] Clearing taskPending - enabling regular chat");
        if (pendingDiv) pendingDiv.style.display = "none";
        if (input) {
            input.disabled = false;
            input.placeholder = "Type a message or /command...";
        }
    }
}

window.setTaskPending = setTaskPending;

// Handle option selection
function handleOption(option) {
    addMessage("You", option, "user");
    
    if (option === "Chat") {
        window.currentTask = { mode: "chat" };
        addMessage("CrackerBot", "💬 Let's chat! What's on your mind?", "bot");
        setTaskPending(null);
    } else if (option === "Build-Something-Epic" || option === "🚀 Build-Something-Epic") {
        window.currentTask = { mode: "building" };
        promptProjectName();
    } else if (option === "View Projects" || option.includes("📁")) {
        if (window.showProjectsManager) {
            window.showProjectsManager();
        }
        setTaskPending(null);
    } else if (option === "Download") {
        downloadCurrentProject();
        setTaskPending(null);
    } else if (option === "Preview") {
        console.log("[Main] Preview option selected");
        if (window.livePreview && window.currentTask) {
            console.log("[Main] Opening live preview for preview");
            forceLivePreviewOpen({
                taskId: window.currentTask.taskId || Date.now(),
                projectName: window.currentTask.projectName || 'Preview Project',
                projectType: window.currentTask.projectType || 'web',
                frontendId: window.socket ? window.socket.id : 'preview'
            });
        } else if (window.showProjectPreview) {
            showProjectPreview();
        } else {
            console.log("[Main] No preview system available");
            addMessage("System", "Preview system unavailable", "system");
        }
        setTaskPending(null);
    } else if (option === "Start New Project") {
        window.currentTask = { mode: "building" };
        promptProjectName();
    }
}

window.handleOption = handleOption;

// Update task status
function updateTaskStatus() {
    var section = document.getElementById("task-status-section");
    if (!section) return;
    
    if (window.currentTask && window.currentTask.projectName) {
        section.style.display = "block";
        var nameEl = document.getElementById("task-name");
        var typeEl = document.getElementById("task-type");
        var statusEl = document.getElementById("task-status");
        
        if (nameEl) nameEl.textContent = window.currentTask.projectName;
        if (typeEl) typeEl.textContent = window.currentTask.projectTypeName || window.currentTask.projectType || "-";
        if (statusEl) statusEl.textContent = window.currentTask.status || "Initializing";
    } else {
        section.style.display = "none";
    }
}

window.updateTaskStatus = updateTaskStatus;

// Update username display
function updateUserName() {
    var userNameElement = document.getElementById("user-name") || document.getElementById("userName");
    if (userNameElement) {
        userNameElement.textContent = window.userName || "Guest";
    }
}

// Update connection status
function updateStatus(status) {
    var statusElement = document.getElementById("connection-status") || 
                         document.getElementById("status");
    if (statusElement) {
        if (status === "connected") {
            statusElement.textContent = "✅ Connected";
            statusElement.style.background = "linear-gradient(135deg, #00ff88, #00ccff)";
        } else {
            statusElement.textContent = "❌ Disconnected";
            statusElement.style.background = "linear-gradient(135deg, #ff4444, #ff6666)";
        }
        statusElement.style.color = "#fff";
    }
}

// Clear Redis function
function clearRedisCache() {
    console.log("[Warp] Clearing Redis cache...");
    
    if (window.socket && window.socket.connected) {
        window.socket.emit("clear_redis_cache");
        console.log("[Warp] Sent Redis clear command to backend");
    }
    
    var redisKeys = [];
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && (key.includes('redis') || key.includes('Redis') || key.includes('crackerBot'))) {
            redisKeys.push(key);
        }
    }
    
    redisKeys.forEach(function(key) {
        localStorage.removeItem(key);
        console.log("[Warp] Cleared localStorage key:", key);
    });
    
    return redisKeys.length;
}

// DEBUG: Direct taskPending reset function
window.resetTaskPending = function() {
    console.log("🔧 FORCE RESET: taskPending was:", window.taskPending);
    window.taskPending = null;
    setTaskPending(null);
    console.log("🔧 FORCE RESET: taskPending now:", window.taskPending);
    addMessage("System", "✅ TaskPending force cleared", "system");
    return "TaskPending cleared";
};

// DEBUG: Check current taskPending state
window.checkTaskPending = function() {
    console.log("🔍 Current taskPending:", window.taskPending);
    if (window.taskPending) {
        addMessage("System", "📋 TaskPending step: " + window.taskPending.step, "system");
        addMessage("System", "📋 TaskPending question: " + (window.taskPending.question || 'none'), "system");
    } else {
        addMessage("System", "📋 TaskPending: null (cleared)", "system");
    }
    return window.taskPending;
};

// Initialize on load
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, initializing CrackerBot Main...");
    
    if (!window.isWarping) {
        initializeSocket();
    }
    
    updateUserName();
    
    if (!window.userName && !window.isWarping && !window.justWarped) {
        console.log("[Main] No username found, welcome-name.js should handle popup");
    }
    
    if (window.initMatrixRain) initMatrixRain();
    if (window.TokenManager) TokenManager.init();
    
    var connectionAttempts = 0;
    var maxConnectionAttempts = 20;
    
    var ensureLivePreviewConnection = function() {
        connectionAttempts++;
        console.log("[Main] Checking live preview connection (attempt " + connectionAttempts + ")");
        
        if (window.socket && window.livePreview) {
            window.livePreview.socket = window.socket;
            console.log("[Main] ✅ Live preview connected to socket successfully");
        } else if (connectionAttempts < maxConnectionAttempts) {
            console.log("[Main] Waiting for socket and live preview... (" + connectionAttempts + "/" + maxConnectionAttempts + ")");
            setTimeout(ensureLivePreviewConnection, 500);
        } else {
            console.error("[Main] ❌ Failed to connect live preview to socket after " + maxConnectionAttempts + " attempts");
        }
    };
    
    setTimeout(ensureLivePreviewConnection, 1000);
});

// ✅ FIXED: Warp reconnect function
window.warpReconnect = function() {
    var warning = "⚠️ WARP RECONNECT WARNING ⚠️\n\n" +
        "This will:\n" +
        "• Clear ALL your saved projects\n" +
        "• Reset your username\n" +
        "• Clear all chat history\n" +
        "• Remove custom tokens\n" +
        "• Clear Redis cache\n" +
        "• Reset to default state\n\n" +
        "Are you SURE you want to continue?\n" +
        "This action CANNOT be undone!";
    if (confirm(warning)) {
        var doubleCheck = confirm("⚠️ FINAL WARNING ⚠️\n\nAll your data will be PERMANENTLY DELETED!\n\nClick OK to proceed with full reset.");
        if (doubleCheck) {
            window.isWarping = true;
            window.justWarped = true;
            if (window.addMessage) {
                window.addMessage("System", "🔄 WARP RECONNECT INITIATED - Clearing all data...", "system");
            }
            if (window.livePreview && typeof window.livePreview.close === "function") {
                window.livePreview.close();
            }
            var clearedRedisKeys = clearRedisCache();
            console.log("[Warp] Cleared " + clearedRedisKeys + " Redis-related keys");
            if (window.socket && window.socket.connected) {
                window.socket.disconnect();
            }
            localStorage.clear();
            sessionStorage.clear();
            window.userName = "";
            var messagesDiv = document.getElementById("chat-messages");
            if (messagesDiv) messagesDiv.innerHTML = "";
            setTimeout(function() {
                window.isWarping = false;
                if (window.showCosmicWelcomePopup) {
                    window.showCosmicWelcomePopup();
                } else if (window.checkAndWelcomeUser) {
                    window.checkAndWelcomeUser();
                }
            }, 500);
        }
    }
};

console.log("🚀 CrackerBot Main ready with FIXED backend URL (crackerbot.io:8443) and enhanced taskPending debugging!");