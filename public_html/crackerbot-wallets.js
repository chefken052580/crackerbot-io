// CRACKERBOT WALLET INTEGRATION
// Uses backend proxy to avoid CORS issues

window.WalletManager = {
    connectedWallets: [],
    autoRefreshInterval: null,
    REFRESH_INTERVAL: 60000,
    currentModalOverlay: null,
    currentModal: null,
    userClickedConnect: false,
    
    init: function() {
        console.log("[Wallets] Initializing");
        this.connectedWallets = [];
        this.userClickedConnect = false;
        localStorage.removeItem("crackerbot_wallets");
        this.updateWalletDisplay();
        this.startAutoRefresh();
    },
    
    detectWallets: function() {
        var available = [];
        if (window.solana && window.solana.isPhantom) {
            available.push({ name: "Phantom", type: "solana", provider: window.solana });
        }
        if (window.ethereum && window.ethereum.isMetaMask) {
            available.push({ name: "MetaMask", type: "evm", provider: window.ethereum });
        }
        return available;
    },
    
    connectWallet: async function(walletType) {
        this.userClickedConnect = true;
        var available = this.detectWallets();
        
        if (available.length === 0) {
            alert("No wallet detected!\n\nInstall Phantom or MetaMask");
            return;
        }
        
        if (available.length > 1 && !walletType) {
            this.showWalletSelection(available);
            return;
        }
        
        var wallet = walletType ? available.find(function(w) { return w.type === walletType; }) : available[0];
        
        try {
            if (wallet.type === "solana") {
                await this.connectPhantom(wallet.provider);
            } else if (wallet.type === "evm") {
                await this.connectMetaMask(wallet.provider);
            }
            this.setupWalletListeners();
        } catch (error) {
            console.error("[Wallets] Error:", error);
            alert("Connection failed: " + error.message);
        }
    },
    
    connectPhantom: async function(provider) {
        var self = this;
        console.log("[Wallets] Connecting Phantom...");
        
        try { await provider.disconnect(); } catch (e) {}
        await new Promise(function(r) { setTimeout(r, 300); });
        
        var response = await provider.connect({ onlyIfTrusted: false });
        var publicKey = response.publicKey.toString();
        console.log("[Wallets] Connected:", publicKey);
        
        var wallet = {
            type: "solana",
            address: publicKey,
            name: "Phantom",
            provider: provider
        };
        
        self.addWallet(wallet);
        
        if (window.addMessage) {
            window.addMessage("System", "[OK] Phantom connected: " + self.shortenAddress(publicKey), "system");
        }
        
        // Fetch balance via our backend proxy
        self.fetchSolanaBalance(wallet);
    },
    
    connectMetaMask: async function(provider) {
        var self = this;
        var accounts = await provider.request({ method: "eth_requestAccounts" });
        if (!accounts || accounts.length === 0) throw new Error("No accounts");
        
        var address = accounts[0];
        var wallet = {
            type: "evm",
            address: address,
            name: "MetaMask",
            provider: provider,
            network: "ethereum"
        };
        
        self.addWallet(wallet);
        await self.fetchEVMBalance(wallet);
        
        if (window.addMessage) {
            window.addMessage("System", "[OK] MetaMask connected: " + self.shortenAddress(address), "system");
        }
    },
    
    // Use our backend proxy to fetch balance (no CORS issues)
    fetchSolanaBalance: async function(wallet, retryCount) {
        retryCount = retryCount || 0;
        var self = this;
        
        console.log("[Wallets] Fetching balance via backend proxy...");
        
        try {
            var response = await fetch("https://crackerbot.io:8443/api/solana-balance/" + wallet.address);
            var data = await response.json();
            
            console.log("[Wallets] Backend response:", data);
            
            if (data.success) {
                var sol = data.balance;
                var price = self.getSOLPrice();
                var usdValue = sol * price;
                
                wallet.balance = { native: sol, usd: usdValue, symbol: "SOL", tokens: [] };
                console.log("[Wallets] Balance:", sol, "SOL ($" + usdValue.toFixed(2) + ")");
                self.updateWalletDisplay();
            } else {
                throw new Error(data.error || "Unknown error");
            }
            
        } catch (error) {
            console.error("[Wallets] Balance error:", error.message);
            
            if (retryCount < 2) {
                console.log("[Wallets] Retrying in 2s...");
                setTimeout(function() {
                    self.fetchSolanaBalance(wallet, retryCount + 1);
                }, 2000);
            } else {
                wallet.balance = { native: 0, usd: 0, symbol: "SOL", tokens: [], error: true };
                self.updateWalletDisplay();
                if (window.addMessage) {
                    window.addMessage("System", "[!] Balance unavailable. Click wallet to view on Solscan.", "system");
                }
            }
        }
    },
    
    getSOLPrice: function() {
        if (window.tokenScanner && window.tokenScanner.getCache) {
            var cache = window.tokenScanner.getCache();
            if (cache["SOL"] && cache["SOL"].price) {
                return cache["SOL"].price;
            }
        }
        return 118;
    },
    
    fetchEVMBalance: async function(wallet) {
        var self = this;
        try {
            var balance = await wallet.provider.request({
                method: "eth_getBalance",
                params: [wallet.address, "latest"]
            });
            var eth = parseInt(balance, 16) / 1e18;
            wallet.balance = { native: eth, usd: eth * 3500, symbol: "ETH", tokens: [] };
            self.updateWalletDisplay();
        } catch (error) {
            console.error("[Wallets] EVM error:", error);
        }
    },
    
    addWallet: function(wallet) {
        if (!this.connectedWallets.find(function(w) { return w.address === wallet.address; })) {
            this.connectedWallets.push(wallet);
            this.updateWalletDisplay();
        }
    },
    
    disconnectWallet: function(address) {
        var self = this;
        var wallet = self.connectedWallets.find(function(w) { return w.address === address; });
        if (wallet && wallet.type === "solana" && wallet.provider) {
            try { wallet.provider.disconnect(); } catch (e) {}
        }
        self.connectedWallets = self.connectedWallets.filter(function(w) { return w.address !== address; });
        self.updateWalletDisplay();
        if (window.addMessage) {
            window.addMessage("System", "[DC] Disconnected", "system");
        }
    },
    
    updateWalletDisplay: function() {
        var self = this;
        var walletList = document.getElementById("wallet-list");
        if (!walletList) return;
        
        walletList.innerHTML = "";
        
        if (self.connectedWallets.length === 0) {
            walletList.innerHTML = '<div style="text-align: center; padding: 20px; color: #888;">Click Connect Wallet</div>';
            return;
        }
        
        self.connectedWallets.forEach(function(wallet) {
            var div = document.createElement("div");
            var balance = wallet.balance || { native: 0, usd: 0, symbol: "..." };
            var hasError = balance.error;
            
            div.style.cssText = "padding: 12px; margin: 8px 0; background: rgba(0, 255, 136, 0.05); border: 1px solid " + (hasError ? "#ff4444" : "rgba(0, 255, 136, 0.2)") + "; border-radius: 8px; cursor: pointer;";
            
            div.innerHTML = '<div style="display: flex; justify-content: space-between; margin-bottom: 5px;">' +
                '<span>' + wallet.name + '</span>' +
                '<button onclick="event.stopPropagation(); WalletManager.disconnectWallet(\'' + wallet.address + '\')" style="background: rgba(255,68,68,0.2); border: 1px solid #ff4444; color: #ff4444; padding: 2px 8px; border-radius: 4px; cursor: pointer;">X</button>' +
                '</div>' +
                '<div style="font-size: 11px; color: #888; margin-bottom: 5px;">' + self.shortenAddress(wallet.address) + '</div>' +
                '<div style="display: flex; justify-content: space-between;">' +
                '<span style="color: #00ff88; font-weight: bold;">' + (balance.native > 0 ? balance.native.toFixed(4) : '0.0000') + ' ' + balance.symbol + '</span>' +
                '<span style="color: #00ccff;">$' + (balance.usd > 0 ? balance.usd.toFixed(2) : '0.00') + '</span>' +
                '</div>' +
                (hasError ? '<div style="font-size: 10px; color: #ff4444; margin-top: 5px;">Click to view on Solscan</div>' : '');
            
            (function(w) {
                div.onclick = function(e) {
                    if (e.target.tagName === "BUTTON") return;
                    window.open("https://solscan.io/address/" + w.address, "_blank");
                };
            })(wallet);
            
            walletList.appendChild(div);
        });
    },
    
    shortenAddress: function(address) {
        return address.substring(0, 6) + "..." + address.substring(address.length - 4);
    },
    
    showWalletSelection: function(wallets) {
        var self = this;
        var modal = document.createElement("div");
        modal.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1a1a2e; border: 2px solid #00ff88; border-radius: 12px; padding: 20px; z-index: 10000; min-width: 280px;";
        
        var html = '<h3 style="color: #00ff88; margin: 0 0 15px 0;">Select Wallet</h3>';
        for (var i = 0; i < wallets.length; i++) {
            html += '<button onclick="WalletManager.connectWallet(\'' + wallets[i].type + '\'); WalletManager.closeWalletModal()" style="display: block; width: 100%; padding: 12px; margin: 5px 0; background: rgba(0,255,136,0.1); border: 1px solid #00ff88; border-radius: 8px; color: #00ff88; cursor: pointer;">' + wallets[i].name + '</button>';
        }
        html += '<button onclick="WalletManager.closeWalletModal()" style="display: block; width: 100%; padding: 10px; margin-top: 10px; background: rgba(255,68,68,0.1); border: 1px solid #ff4444; border-radius: 8px; color: #ff4444; cursor: pointer;">Cancel</button>';
        modal.innerHTML = html;
        
        var overlay = document.createElement("div");
        overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999;";
        overlay.onclick = function() { self.closeWalletModal(); };
        
        self.currentModalOverlay = overlay;
        self.currentModal = modal;
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    },
    
    closeWalletModal: function() {
        if (this.currentModalOverlay) try { document.body.removeChild(this.currentModalOverlay); } catch(e){}
        if (this.currentModal) try { document.body.removeChild(this.currentModal); } catch(e){}
        this.currentModalOverlay = null;
        this.currentModal = null;
    },
    
    setupWalletListeners: function() {
        var self = this;
        if (!self.userClickedConnect) return;
        if (window.solana) {
            window.solana.on("disconnect", function() {
                var p = self.connectedWallets.find(function(w) { return w.type === "solana"; });
                if (p) self.disconnectWallet(p.address);
            });
        }
    },
    
    startAutoRefresh: function() {
        var self = this;
        if (self.autoRefreshInterval) clearInterval(self.autoRefreshInterval);
        self.autoRefreshInterval = setInterval(function() {
            if (self.connectedWallets.length > 0 && self.userClickedConnect) {
                self.connectedWallets.forEach(function(w) {
                    if (w.type === "solana") self.fetchSolanaBalance(w);
                });
            }
        }, self.REFRESH_INTERVAL);
    }
};

window.connectWallet = function() { WalletManager.connectWallet(); };

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { WalletManager.init(); });
} else {
    WalletManager.init();
}

console.log("[Wallets] Loaded - using backend proxy");
