// welcome-name.js
// Cosmic Welcome System for CrackerBot
// Handles new user popups and returning user welcomes

(function() {
    
    // Clean up old names on load
    function cleanupOldNames() {
        // Remove all duplicate name keys
        const keysToRemove = [
            'userName',
            'username',
            'user-name',
            'crackerbot-username',
            'cracker-bot-user',
            'user_name'
        ];
        
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log(`[Welcome] Removing old key: ${key}`);
                localStorage.removeItem(key);
            }
        });
    }
    
    // Check for existing user on page load
    function checkAndWelcomeUser() {
        // Skip if we're in the middle of warping
        if (window.isWarping) {
            console.log('[Welcome] Skipping - warp in progress');
            return;
        }
        
        // Clean up old names first
        cleanupOldNames();
        
        const savedName = localStorage.getItem('crackerBotUserName');
        
        // Debug log
        console.log('[Welcome] Checking user, found name:', savedName);
        
        if (!savedName || savedName === 'Guest' || savedName === '') {
            // New user - show cosmic welcome popup
            console.log('[Welcome] No valid name found, showing popup');
            showCosmicWelcomePopup();
        } else {
            // Check if this might be a stale name (e.g., "Ken")
            // You can add specific names to block here
            const blockedNames = ['Ken', 'Ken Kenniff']; // Add any names that shouldn't persist
            if (blockedNames.includes(savedName)) {
                console.log('[Welcome] Blocked name detected:', savedName, '- clearing and showing popup');
                localStorage.removeItem('crackerBotUserName');
                showCosmicWelcomePopup();
            } else {
                // Returning user - show welcome back message
                welcomeReturningUser(savedName);
            }
        }
    }
    
    // Cosmic Welcome Popup for new users
    function showCosmicWelcomePopup() {
        // Remove any existing popup first
        const existingOverlay = document.getElementById('cosmic-welcome-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Clear any residual name
        window.userName = null;
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = 'Guest';
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'cosmic-welcome-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, rgba(138, 43, 226, 0.9), rgba(0, 0, 0, 0.95));
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: cosmicPulse 3s ease-in-out infinite;
        `;
        
        // Create popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #0a0e1b);
            border: 3px solid #00ff88;
            border-radius: 30px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 0 100px rgba(0, 255, 136, 0.8), 0 0 200px rgba(138, 43, 226, 0.5);
            animation: floatIn 1s ease-out;
        `;
        
        popup.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px; animation: rotate 3s linear infinite;">
                🌌
            </div>
            <h1 style="color: #00ff88; font-size: 36px; margin-bottom: 20px; text-shadow: 0 0 30px #00ff88;">
                Welcome to the Cosmic Realm!
            </h1>
            <p style="color: #00ccff; font-size: 18px; margin-bottom: 10px;">
                Greetings, space traveler! I'm CrackerBot, your cosmic AI companion.
            </p>
            <p style="color: #ff00ff; font-size: 16px; margin-bottom: 30px;">
                Ready to build something extraordinary across the galaxies? 🚀✨
            </p>
            <div style="margin-bottom: 20px;">
                <label style="color: #00ff88; font-size: 18px; display: block; margin-bottom: 10px;">
                    Choose Your Cosmic Identity:
                </label>
                <input type="text" id="cosmic-name-input" placeholder="Enter your cosmic name..." 
                       style="width: 100%; padding: 15px; background: rgba(0, 255, 136, 0.1); 
                              border: 2px solid #00ff88; color: #00ff88; font-size: 18px; 
                              text-align: center; border-radius: 25px; outline: none;">
            </div>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="cosmic-enter-btn" style="
                    padding: 15px 40px; 
                    background: linear-gradient(135deg, #00ff88, #00ccff); 
                    color: black; 
                    border: none; 
                    border-radius: 30px; 
                    font-size: 18px; 
                    font-weight: bold; 
                    cursor: pointer; 
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(0, 255, 136, 0.5);
                ">
                    🚀 Enter the Cosmos
                </button>
                <button id="cosmic-random-btn" style="
                    padding: 15px 30px; 
                    background: linear-gradient(135deg, #8a2be2, #ff00ff); 
                    color: white; 
                    border: none; 
                    border-radius: 30px; 
                    font-size: 18px; 
                    cursor: pointer; 
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(138, 43, 226, 0.5);
                ">
                    🎲 Random
                </button>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
                Your cosmic identity will be remembered across space and time
            </p>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Add CSS animations if not already added
        if (!document.getElementById('cosmic-welcome-styles')) {
            const style = document.createElement('style');
            style.id = 'cosmic-welcome-styles';
            style.textContent = `
                @keyframes cosmicPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.95; }
                }
                @keyframes floatIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.5) rotate(-180deg); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1) rotate(0deg); 
                    }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes epicWelcome {
                    0% { 
                        opacity: 0; 
                        transform: translate(-50%, -50%) scale(0.5); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: translate(-50%, -50%) scale(1.5); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translate(-50%, -50%) scale(3); 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Focus input
        const input = document.getElementById('cosmic-name-input');
        setTimeout(() => {
            if (input) input.focus();
        }, 500);
        
        // Handle Enter button
        document.getElementById('cosmic-enter-btn').onclick = function() {
            const name = input.value.trim();
            if (name) {
                setUserAndWelcome(name, true);
                overlay.remove();
                
                // If we just warped, reload the page for fresh connection
                if (window.justWarped) {
                    window.justWarped = false;
                    console.log("[Welcome] Warped - reloading page...");
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                    return;
                }
            } else {
                input.style.borderColor = '#ff4444';
                input.placeholder = 'Please enter a name!';
                setTimeout(() => {
                    input.style.borderColor = '#00ff88';
                    input.placeholder = 'Enter your cosmic name...';
                }, 2000);
            }
        };
        
        // Handle Random button
        document.getElementById('cosmic-random-btn').onclick = function() {
            const cosmicNames = [
                'Nebula_Walker', 'Star_Forger', 'Quantum_Rider', 'Cosmic_Sage',
                'Galaxy_Hunter', 'Void_Dancer', 'Astro_Knight', 'Space_Wizard',
                'Stellar_Phoenix', 'Comet_Chaser', 'Nova_Builder', 'Photon_Master',
                'Cyber_Mage', 'Plasma_Warrior', 'Dark_Matter_Sage', 'Quasar_Knight',
                'Binary_Wizard', 'Cosmic_Hacker', 'Astro_Coder', 'Space_Architect'
            ];
            const randomName = cosmicNames[Math.floor(Math.random() * cosmicNames.length)] + 
                              '_' + Math.floor(Math.random() * 9999);
            input.value = randomName;
            
            // Animate the input
            input.style.animation = 'pulse 0.5s ease';
            setTimeout(() => input.style.animation = '', 500);
        };
        
        // Handle Enter key
        input.onkeypress = function(e) {
            if (e.key === 'Enter') {
                document.getElementById('cosmic-enter-btn').click();
            }
        };
    }
    
    // Welcome returning user
    function welcomeReturningUser(name) {
        // Skip if warping
        if (window.isWarping || window.justWarped) {
            console.log('[Welcome] Skipping welcome - warp active');
            return;
        }
        
        window.userName = name;
        
        // Update UI
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = name;
        }
        
        // Send welcome back message
        setTimeout(() => {
            if (window.addMessage && !window.isWarping) {
                // DISABLED - Backend now handles welcome message
                // const messages = [
                //     `🌟 Welcome back, ${name}! The cosmos missed you!`,
                //     ...
                // ];
                // const welcomeMsg = messages[Math.floor(Math.random() * messages.length)];
                // window.addMessage('CrackerBot', welcomeMsg, 'bot');
                
                // Check for saved projects
                const projects = JSON.parse(localStorage.getItem('crackerBotProjects') || '[]');
                if (projects.length > 0) {
                    setTimeout(() => {
                        window.addMessage('CrackerBot', 
                            `📁 You have ${projects.length} saved project${projects.length > 1 ? 's' : ''}. Say "view projects" to see them!`, 
                            'bot'
                        );
                    }, 1500);
                }
                
                // Update last visit
                localStorage.setItem('crackerBotLastVisit', new Date().toISOString());
            }
        }, 1000);
        
        // Show choice bubbles for returning users
        setTimeout(() => {
            if (window.showMainChoice) {
                window.createWelcomeBubbles();
            } else if (window.showMainChoices) {
                window.createWelcomeBubbles();
            }
        }, 1500);
        
        // Notify backend - check if this is actually a new user (after warp reload)
        if (window.socket && window.socket.connected && !window.isWarping) {
            const isNewUser = localStorage.getItem('crackerBotIsNewUser') === 'true';
            if (isNewUser) {
                localStorage.removeItem('crackerBotIsNewUser');
            }
            window.socket.emit('set_username', { username: name, isNew: isNewUser });
        }
    }
    
    // Set user and show welcome
    function setUserAndWelcome(name, isNew) {
        // Save to localStorage
        localStorage.setItem('crackerBotUserName', name);
        localStorage.setItem('crackerBotLastVisit', new Date().toISOString());
        window.userName = name;
        
        // Update UI
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = name;
        }
        
        // Show epic welcome for new users
        if (isNew) {
            // Store isNew flag for after page reload
            localStorage.setItem('crackerBotIsNewUser', 'true');
            
            // Create welcome animation
            const welcomeAnimation = document.createElement('div');
            welcomeAnimation.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #00ff88;
                font-size: 48px;
                font-weight: bold;
                text-shadow: 0 0 50px #00ff88;
                z-index: 999998;
                animation: epicWelcome 3s ease-out forwards;
                pointer-events: none;
            `;
            welcomeAnimation.innerHTML = `Welcome, ${name}! 🚀`;
            document.body.appendChild(welcomeAnimation);
            
            setTimeout(() => welcomeAnimation.remove(), 3000);
            
            // ✅ FIXED: Removed duplicate welcome messages that compete with backend
            // The backend will send its own welcome message, and main.js will detect it
            // and show the choice bubbles. No need to duplicate that here.
            console.log("[Welcome] New user setup complete - socket will handle connection");
            // No reload needed - the justWarped handler or socket connect will handle it
        }
        
        // Notify backend
        if (window.socket && window.socket.connected) {
            window.socket.emit('set_username', { 
                username: name,
                isNew: isNew 
            });
        }
    }
    
    // Export functions globally
    window.showCosmicWelcomePopup = showCosmicWelcomePopup;
    window.promptUserName = showCosmicWelcomePopup;
    window.checkAndWelcomeUser = checkAndWelcomeUser;
    window.setUserAndWelcome = setUserAndWelcome;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(checkAndWelcomeUser, 500);
        });
    } else {
        // DOM already loaded
        setTimeout(checkAndWelcomeUser, 500);
    }
    
    console.log('[Welcome System] 🌌 Cosmic welcome system loaded');
})();

// Direct choice bubble creator that bypasses function conflicts
window.createWelcomeBubbles = function() {
    console.log('[Welcome] Creating choice bubbles directly...');
    
    const bubbles = document.getElementById('choice-bubbles');
    if (!bubbles) {
        console.error('[Welcome] choice-bubbles element not found');
        return;
    }
    
    bubbles.innerHTML = '';
    bubbles.style.display = 'flex';
    bubbles.style.gap = '10px';
    bubbles.style.justifyContent = 'center';
    bubbles.style.padding = '15px';
    
    const options = [
        { text: '💬 Chat', action: () => window.handleOption && window.handleOption('Chat') },
        { text: '🚀 Build Something Epic', action: () => window.handleOption && window.handleOption('Build-Something-Epic') },
        { text: '📁 View Projects', action: () => window.showProjectsManager && window.showProjectsManager() }
    ];
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'choice-bubble';
        button.textContent = option.text;
        button.onclick = option.action;
        bubbles.appendChild(button);
    });
    
    console.log('[Welcome] Choice bubbles created successfully');
};