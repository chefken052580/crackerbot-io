// CrackerBot App Switcher - Dynamic App Management
console.log('[App Switcher] Loading...');

(function() {
    if (window.appSwitcherInitialized) {
        console.log('[App Switcher] Already initialized');
        return;
    }
    window.appSwitcherInitialized = true;

    const APPS = {
        chat: {
            name: 'Chat',
            icon: '💬',
            container: 'chat-app-container'
        },
        memeForge: {
            name: 'Meme Forge',
            icon: '🪙',
            container: 'meme-forge-container'
        },
        nftLab: {
            name: 'NFT Lab',
            icon: '🖼️',
            container: 'nft-lab-container'
        },
        degenQuest: {
            name: 'Degen Quest',
            icon: '🎮',
            container: 'degen-quest-container'
        },
        settings: {
            name: 'Settings',
            icon: '⚙️',
            container: 'settings-container'
        }
    };

    let currentApp = 'chat';

    function init() {
        console.log('[App Switcher] Initializing...');
        createAppLauncher();
        createAppContainers();
        switchToApp('chat');
    }

    function createAppLauncher() {
        // Create launcher sidebar
        const launcher = document.createElement('div');
        launcher.className = 'app-launcher';
        launcher.innerHTML = Object.keys(APPS).map(appKey => {
            const app = APPS[appKey];
            return '<div class="app-icon" data-app="' + appKey + '" title="' + app.name + '">' +
                   '<span class="icon">' + app.icon + '</span>' +
                   '<span class="label">' + app.name + '</span>' +
                   '</div>';
        }).join('');

        // Find app container and prepend launcher
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.insertBefore(launcher, appContainer.firstChild);
            console.log('[App Switcher] Launcher created');
        }

        // Add click handlers
        launcher.querySelectorAll('.app-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                const appKey = this.getAttribute('data-app');
                switchToApp(appKey);
            });
        });
    }

    function createAppContainers() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) {
            console.error('[App Switcher] Chat container not found');
            return;
        }

        // Wrap existing chat in app container
        const chatContent = chatContainer.innerHTML;
        chatContainer.innerHTML = '<div id="chat-app-container" class="app-content">' + chatContent + '</div>';

        // Create other app containers
        const containers = [
            { id: 'meme-forge-container', title: 'Meme Coin Forge', content: '<h2>🪙 Meme Coin Forge</h2><p>AI-powered Solana meme coin generator with virality prediction</p><div class="coming-soon">Coming Soon - Upload your meme art and let AI predict its viral potential!</div>' },
            { id: 'nft-lab-container', title: 'NFT Evolution Lab', content: '<h2>🖼️ NFT Evolution Lab</h2><p>Breed and evolve NFTs on Solana using genetic algorithms</p><div class="coming-soon">Coming Soon - Mint evolving NFT collections with trait mixing!</div>' },
            { id: 'degen-quest-container', title: 'Degen Quest Builder', content: '<h2>🎮 Degen Quest Builder</h2><p>Create gamified quests with AI risk simulation</p><div class="coming-soon">Coming Soon - Build stake-to-earn quests with rug-pull protection!</div>' },
            { id: 'settings-container', title: 'Settings', content: '<h2>⚙️ Settings</h2><div class="settings-grid"><div class="setting-item"><label>Theme</label><div id="theme-selector"></div></div><div class="setting-item"><label>Notifications</label><input type="checkbox" id="notifications-toggle" checked></div><div class="setting-item"><label>Sound Effects</label><input type="checkbox" id="sound-toggle" checked></div></div>' }
        ];

        containers.forEach(cont => {
            const div = document.createElement('div');
            div.id = cont.id;
            div.className = 'app-content';
            div.style.display = 'none';
            div.innerHTML = cont.content;
            chatContainer.appendChild(div);
        });

        console.log('[App Switcher] App containers created');
    }

    function switchToApp(appKey) {
        if (!APPS[appKey]) {
            console.error('[App Switcher] Unknown app:', appKey);
            return;
        }

        console.log('[App Switcher] Switching to:', appKey);
        currentApp = appKey;

        // Hide all app containers
        Object.keys(APPS).forEach(key => {
            const container = document.getElementById(APPS[key].container);
            if (container) {
                container.style.display = 'none';
            }
        });

        // Show selected app
        const targetContainer = document.getElementById(APPS[appKey].container);
        if (targetContainer) {
            targetContainer.style.display = 'block';
        }

        // Update active state on icons
        document.querySelectorAll('.app-icon').forEach(icon => {
            if (icon.getAttribute('data-app') === appKey) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });

        // Update page title
        document.title = 'CrackerBot - ' + APPS[appKey].name;
    }

    // Export to window
    window.switchToApp = switchToApp;

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[App Switcher] ✅ Ready');
})();
