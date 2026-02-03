// DISABLED conflicting warpReconnect - using crackerbot-main.js version instead
// DISABLED - // crackerbot-warp.js - FINAL FIXED VERSION
// DISABLED - (function() {
// DISABLED -     
// DISABLED -     window.warpReconnect = function() {
// DISABLED -         // Show cosmic warning
// DISABLED -         const confirmWarp = confirm(
// DISABLED -             "🌀 COSMIC WARP INITIATED 🌀\n\n" +
// DISABLED -             "This will:\n" +
// DISABLED -             "• Clear ALL your data and projects\n" +
// DISABLED -             "• Reset your cosmic identity\n" +
// DISABLED -             "• Clear all chat history\n" +
// DISABLED -             "• Start fresh in a new dimension\n\n" +
// DISABLED -             "Are you ready to enter the warp?"
// DISABLED -         );
// DISABLED -         
// DISABLED -         if (!confirmWarp) {
// DISABLED -             console.log('[Warp] Cancelled by user');
// DISABLED -             return;
// DISABLED -         }
// DISABLED -         
// DISABLED -         console.log('[Warp] 🌀 Initiating complete cosmic warp...');
// DISABLED -         
// DISABLED -         // SET GLOBAL WARP FLAG - This prevents other scripts from running
// DISABLED -         window.IS_WARPING = true;
// DISABLED -         window.WARP_IN_PROGRESS = true;
// DISABLED -         
// DISABLED -         // 1. DISCONNECT AND DESTROY SOCKET COMPLETELY
// DISABLED -         if (window.socket) {
// DISABLED -             console.log('[Warp] Destroying socket connection...');
// DISABLED -             window.socket.disconnect();
// DISABLED -             window.socket.removeAllListeners();
// DISABLED -             window.socket = null;
// DISABLED -             window.socketConnection = null;
// DISABLED -         }
// DISABLED -         
// DISABLED -         // 2. CLEAR EVERYTHING
// DISABLED -         localStorage.clear();
// DISABLED -         sessionStorage.clear();
// DISABLED -         
// DISABLED -         // Clear cookies
// DISABLED -         document.cookie.split(";").forEach(function(c) { 
// DISABLED -             const eqPos = c.indexOf("=");
// DISABLED -             const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
// DISABLED -             document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
// DISABLED -         });
// DISABLED -         
// DISABLED -         // 3. CLEAR ALL GLOBAL VARIABLES
// DISABLED -         window.userName = null;
// DISABLED -         window.currentTask = null;
// DISABLED -         window.taskPending = null;
// DISABLED -         window.projects = [];
// DISABLED -         window.messageHistory = [];
// DISABLED -         window.isConnected = false;
// DISABLED -         
// DISABLED -         // 4. DISABLE welcome-name.js temporarily
// DISABLED -         window.checkAndWelcomeUser = function() {
// DISABLED -             console.log('[Warp] Blocking checkAndWelcomeUser during warp');
// DISABLED -         };
// DISABLED -         
// DISABLED -         // 5. CLEAR THE UI
// DISABLED -         const chatMessages = document.getElementById('chat-messages');
// DISABLED -         if (chatMessages) {
// DISABLED -             chatMessages.innerHTML = '';
// DISABLED -         }
// DISABLED -         
// DISABLED -         const choiceBubbles = document.getElementById('choice-bubbles');
// DISABLED -         if (choiceBubbles) {
// DISABLED -             choiceBubbles.innerHTML = '';
// DISABLED -             choiceBubbles.style.display = 'none';
// DISABLED -         }
// DISABLED -         
// DISABLED -         const taskStatus = document.getElementById('task-status-section');
// DISABLED -         if (taskStatus) {
// DISABLED -             taskStatus.style.display = 'none';
// DISABLED -         }
// DISABLED -         
// DISABLED -         const userNameElement = document.getElementById('user-name');
// DISABLED -         if (userNameElement) {
// DISABLED -             userNameElement.textContent = 'Guest';
// DISABLED -         }
// DISABLED -         
// DISABLED -         // 6. Show warp animation
// DISABLED -         const warpOverlay = document.createElement('div');
// DISABLED -         warpOverlay.id = 'warp-animation-overlay';
// DISABLED -         warpOverlay.style.cssText = `
// DISABLED -             position: fixed;
// DISABLED -             top: 0;
// DISABLED -             left: 0;
// DISABLED -             width: 100%;
// DISABLED -             height: 100%;
// DISABLED -             background: radial-gradient(circle at center, #ff00ff, #00ffff, #000000);
// DISABLED -             z-index: 999998;
// DISABLED -             display: flex;
// DISABLED -             align-items: center;
// DISABLED -             justify-content: center;
// DISABLED -             animation: warpPulse 2s ease-in-out;
// DISABLED -         `;
// DISABLED -         warpOverlay.innerHTML = `
// DISABLED -             <div style="text-align: center; color: white;">
// DISABLED -                 <h1 style="font-size: 48px; text-shadow: 0 0 30px #00ff88;">
// DISABLED -                     🌀 WARPING TO NEW DIMENSION 🌀
// DISABLED -                 </h1>
// DISABLED -                 <p style="font-size: 24px;">Erasing all cosmic traces...</p>
// DISABLED -             </div>
// DISABLED -         `;
// DISABLED -         document.body.appendChild(warpOverlay);
// DISABLED -         
// DISABLED -         // Add animation styles
// DISABLED -         if (!document.getElementById('warp-styles')) {
// DISABLED -             const style = document.createElement('style');
// DISABLED -             style.id = 'warp-styles';
// DISABLED -             style.textContent = `
// DISABLED -                 @keyframes warpPulse {
// DISABLED -                     0% { opacity: 0; transform: scale(0.1) rotate(0deg); }
// DISABLED -                     50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
// DISABLED -                     100% { opacity: 0; transform: scale(10) rotate(360deg); }
// DISABLED -                 }
// DISABLED -             `;
// DISABLED -             document.head.appendChild(style);
// DISABLED -         }
// DISABLED -         
// DISABLED -         // 7. After animation, show ONE popup
// DISABLED -         setTimeout(() => {
// DISABLED -             console.log('[Warp] Animation complete, showing ONE popup...');
// DISABLED -             
// DISABLED -             // Remove warp animation
// DISABLED -             warpOverlay.remove();
// DISABLED -             
// DISABLED -             // Show the warp name popup ONCE
// DISABLED -             showWarpNamePopup();
// DISABLED -             
// DISABLED -         }, 2000);
// DISABLED -     };
// DISABLED -     
// DISABLED -     // Single popup function for after warp
// DISABLED -     function showWarpNamePopup() {
// DISABLED -         // Remove ANY existing popups
// DISABLED -         const existingPopups = document.querySelectorAll('#cosmic-welcome-overlay, #warp-name-overlay');
// DISABLED -         existingPopups.forEach(p => p.remove());
// DISABLED -         
// DISABLED -         // Create overlay
// DISABLED -         const overlay = document.createElement('div');
// DISABLED -         overlay.id = 'warp-name-overlay';
// DISABLED -         overlay.style.cssText = `
// DISABLED -             position: fixed;
// DISABLED -             top: 0;
// DISABLED -             left: 0;
// DISABLED -             width: 100%;
// DISABLED -             height: 100%;
// DISABLED -             background: radial-gradient(circle at center, rgba(138, 43, 226, 0.9), rgba(0, 0, 0, 0.95));
// DISABLED -             z-index: 999999;
// DISABLED -             display: flex;
// DISABLED -             align-items: center;
// DISABLED -             justify-content: center;
// DISABLED -         `;
// DISABLED -         
// DISABLED -         // Create popup
// DISABLED -         const popup = document.createElement('div');
// DISABLED -         popup.style.cssText = `
// DISABLED -             background: linear-gradient(135deg, #1a1a2e, #0a0e1b);
// DISABLED -             border: 3px solid #00ff88;
// DISABLED -             border-radius: 30px;
// DISABLED -             padding: 40px;
// DISABLED -             max-width: 500px;
// DISABLED -             text-align: center;
// DISABLED -             box-shadow: 0 0 100px rgba(0, 255, 136, 0.8);
// DISABLED -         `;
// DISABLED -         
// DISABLED -         popup.innerHTML = `
// DISABLED -             <div style="font-size: 60px; margin-bottom: 20px;">🌌</div>
// DISABLED -             <h1 style="color: #00ff88; font-size: 36px; margin-bottom: 20px;">
// DISABLED -                 New Dimension Reached!
// DISABLED -             </h1>
// DISABLED -             <p style="color: #00ccff; font-size: 18px; margin-bottom: 30px;">
// DISABLED -                 Your previous identity has been erased.<br>
// DISABLED -                 Choose your new cosmic name:
// DISABLED -             </p>
// DISABLED -             <input type="text" id="warp-name-input" placeholder="Enter your new cosmic identity..." 
// DISABLED -                    style="width: 100%; padding: 15px; background: rgba(0, 255, 136, 0.1); 
// DISABLED -                           border: 2px solid #00ff88; color: #00ff88; font-size: 18px; 
// DISABLED -                           text-align: center; border-radius: 25px; outline: none; margin-bottom: 20px;">
// DISABLED -             <div style="display: flex; gap: 15px; justify-content: center;">
// DISABLED -                 <button id="warp-enter-btn" style="
// DISABLED -                     padding: 15px 40px; 
// DISABLED -                     background: linear-gradient(135deg, #00ff88, #00ccff); 
// DISABLED -                     color: black; 
// DISABLED -                     border: none; 
// DISABLED -                     border-radius: 30px; 
// DISABLED -                     font-size: 18px; 
// DISABLED -                     font-weight: bold; 
// DISABLED -                     cursor: pointer;
// DISABLED -                 ">
// DISABLED -                     🚀 Begin New Journey
// DISABLED -                 </button>
// DISABLED -                 <button id="warp-random-btn" style="
// DISABLED -                     padding: 15px 30px; 
// DISABLED -                     background: linear-gradient(135deg, #8a2be2, #ff00ff); 
// DISABLED -                     color: white; 
// DISABLED -                     border: none; 
// DISABLED -                     border-radius: 30px; 
// DISABLED -                     font-size: 18px; 
// DISABLED -                     cursor: pointer;
// DISABLED -                 ">
// DISABLED -                     🎲 Random
// DISABLED -                 </button>
// DISABLED -             </div>
// DISABLED -         `;
// DISABLED -         
// DISABLED -         overlay.appendChild(popup);
// DISABLED -         document.body.appendChild(overlay);
// DISABLED -         
// DISABLED -         // Focus input
// DISABLED -         const input = document.getElementById('warp-name-input');
// DISABLED -         setTimeout(() => input.focus(), 100);
// DISABLED -         
// DISABLED -         // Handle enter button
// DISABLED -         document.getElementById('warp-enter-btn').onclick = function() {
// DISABLED -             const name = input.value.trim();
// DISABLED -             if (name) {
// DISABLED -                 // Save new name
// DISABLED -                 localStorage.setItem('crackerBotUserName', name);
// DISABLED -                 window.userName = name;
// DISABLED -                 
// DISABLED -                 // Update UI
// DISABLED -                 const userNameEl = document.getElementById('user-name');
// DISABLED -                 if (userNameEl) {
// DISABLED -                     userNameEl.textContent = name;
// DISABLED -                 }
// DISABLED -                 
// DISABLED -                 // Remove popup
// DISABLED -                 overlay.remove();
// DISABLED -                 
// DISABLED -                 // CLEAR WARP FLAGS
// DISABLED -                 window.IS_WARPING = false;
// DISABLED -                 window.WARP_IN_PROGRESS = false;
// DISABLED -                 
// DISABLED -                 // NOW reconnect socket with new identity
// DISABLED -                 setTimeout(() => {
// DISABLED -                     console.log('[Warp] Reconnecting with new identity:', name);
// DISABLED -                     
// DISABLED -                     if (window.initializeSocket) {
// DISABLED -                         window.initializeSocket();
// DISABLED -                     } else if (window.initWebSocket) {
// DISABLED -                         window.initWebSocket();
// DISABLED -                     }
// DISABLED -                     
// DISABLED -                     // Show single welcome message
// DISABLED -                     if (window.addMessage) {
// DISABLED -                         window.addMessage('CrackerBot', 
// DISABLED -                             `🌌 Welcome to your new dimension, ${name}! Everything has been reset.`, 
// DISABLED -                             'bot'
// DISABLED -                         );
// DISABLED -                     }
// DISABLED -                 }, 500);
// DISABLED -             } else {
// DISABLED -                 input.style.borderColor = '#ff4444';
// DISABLED -                 input.placeholder = 'Please enter a name!';
// DISABLED -             }
// DISABLED -         };
// DISABLED -         
// DISABLED -         // Handle random button
// DISABLED -         document.getElementById('warp-random-btn').onclick = function() {
// DISABLED -             const names = [
// DISABLED -                 'Quantum_Phoenix', 'Stellar_Nomad', 'Void_Architect', 'Nebula_Sage',
// DISABLED -                 'Cosmic_Wanderer', 'Galaxy_Forger', 'Star_Weaver', 'Dimension_Walker'
// DISABLED -             ];
// DISABLED -             input.value = names[Math.floor(Math.random() * names.length)] + '_' + Math.floor(Math.random() * 9999);
// DISABLED -         };
// DISABLED -         
// DISABLED -         // Handle enter key
// DISABLED -         input.onkeypress = function(e) {
// DISABLED -             if (e.key === 'Enter') {
// DISABLED -                 document.getElementById('warp-enter-btn').click();
// DISABLED -             }
// DISABLED -         };
// DISABLED -     }
// DISABLED -     
// DISABLED -     console.log('[Warp] 🌀 Warp system loaded - single popup version');
// DISABLED - })();