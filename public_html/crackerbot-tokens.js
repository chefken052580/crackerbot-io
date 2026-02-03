// CRACKERBOT TOKEN SCANNER - Live DexScreener Integration

// Token configuration
var TRACKED_TOKENS = [
    { symbol: "SOL", address: "So11111111111111111111111111111111111111112" },
    { symbol: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
    { symbol: "JUP", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
    { symbol: "RAY", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" },
    { symbol: "ORCA", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE" },
    { symbol: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
    { symbol: "PYTH", address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3" },
    { symbol: "RENDER", address: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof" }
];

// Cache for token prices
var tokenPriceCache = {};
var lastUpdateTime = 0;
var UPDATE_INTERVAL = 30000; // 30 seconds

// Initialize token scanner
function initTokenScanner() {
    console.log("[Tokens] Initializing token scanner...");
    
    // Show loading state FIRST, then fetch prices
    displayTokens(true);
    
    // Initial fetch (will update display when done)
    fetchTokenPrices();
    
    // Set up auto-refresh
    setInterval(fetchTokenPrices, UPDATE_INTERVAL);
}

// Fetch live prices from DexScreener
async function fetchTokenPrices() {
    var now = Date.now();
    console.log("[Tokens] Fetching live prices from DexScreener at", new Date(now).toLocaleTimeString());
    
    var tokenList = document.getElementById("token-list");
    if (!tokenList) {
        console.warn("[Tokens] No token-list element found");
        return;
    }
    
    // Show loading indicator
    var refreshBtn = document.querySelector(".refresh-btn");
    if (refreshBtn) {
        refreshBtn.textContent = "Loading...";
        refreshBtn.disabled = true;
    }
    
    try {
        // Fetch data for each token from DexScreener
        var pricePromises = TRACKED_TOKENS.map(async function(token) {
            try {
                console.log("[Tokens] Fetching " + token.symbol + " from DexScreener...");
                var response = await fetch("https://api.dexscreener.com/latest/dex/tokens/" + token.address);
                
                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }
                
                var data = await response.json();
                
                if (data.pairs && data.pairs.length > 0) {
                    // Filter for Solana chain pairs only, then get the most liquid
                    var solanaPairs = data.pairs.filter(function(p) { return p.chainId === "solana"; });
                    var mainPair = solanaPairs.length > 0 ? solanaPairs[0] : data.pairs[0];
                    
                    return {
                        symbol: token.symbol,
                        price: parseFloat(mainPair.priceUsd) || 0,
                        change24h: parseFloat(mainPair.priceChange && mainPair.priceChange.h24) || 0,
                        change1h: parseFloat(mainPair.priceChange && mainPair.priceChange.h1) || 0,
                        volume24h: parseFloat(mainPair.volume && mainPair.volume.h24) || 0,
                        liquidity: parseFloat(mainPair.liquidity && mainPair.liquidity.usd) || 0,
                        fdv: mainPair.fdv || 0,
                        pairAddress: mainPair.pairAddress,
                        dexId: mainPair.dexId
                    };
                }
                
                return {
                    symbol: token.symbol,
                    price: 0,
                    change24h: 0,
                    error: true
                };
                
            } catch (error) {
                console.error("[Tokens] Error fetching " + token.symbol + ":", error);
                
                // Return cached data if available
                if (tokenPriceCache[token.symbol]) {
                    return tokenPriceCache[token.symbol];
                }
                
                return {
                    symbol: token.symbol,
                    price: 0,
                    change24h: 0,
                    error: true
                };
            }
        });
        
        // Wait for all prices
        var prices = await Promise.all(pricePromises);
        
        // Update cache
        prices.forEach(function(priceData) {
            if (!priceData.error) {
                tokenPriceCache[priceData.symbol] = priceData;
                var priceStr = priceData.price < 1 ? priceData.price.toFixed(6) : priceData.price.toFixed(2);
                console.log("[Tokens] ? " + priceData.symbol + ": $" + priceStr);
            } else {
                console.warn("[Tokens] ? " + priceData.symbol + ": Failed to fetch");
            }
        });
        
        lastUpdateTime = Date.now();
        
        // Display the tokens
        console.log("[Tokens] Displaying", prices.length, "tokens in UI");
        displayTokens(false, prices);
        
        console.log("[Tokens] ? Prices updated successfully at", new Date().toLocaleTimeString());
        
    } catch (error) {
        console.error("[Tokens] Failed to fetch prices:", error);
        
        // Display cached data if available
        if (Object.keys(tokenPriceCache).length > 0) {
            displayTokens(false, Object.values(tokenPriceCache));
        }
        
    } finally {
        // Reset refresh button
        if (refreshBtn) {
            refreshBtn.textContent = "Refresh";
            refreshBtn.disabled = false;
        }
    }
}

// Display tokens in the UI
function displayTokens(loading, tokens) {
    tokens = tokens || [];
    var tokenList = document.getElementById("token-list");
    if (!tokenList) return;
    
    tokenList.innerHTML = "";
    
    if (loading) {
        // Show loading state
        TRACKED_TOKENS.forEach(function(token) {
            var div = document.createElement("div");
            div.className = "token-item";
            div.style.cssText = "padding: 12px; margin: 8px 0; background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 8px; cursor: pointer; transition: all 0.3s; opacity: 0.5;";
            
            div.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-weight: bold; color: #00ff88;">' + token.symbol + '</span>' +
                '<span style="color: #888;">Loading...</span>' +
                '</div>';
            
            tokenList.appendChild(div);
        });
        
    } else {
        // Display real data
        tokens.forEach(function(token) {
            var div = document.createElement("div");
            div.className = "token-item";
            div.setAttribute("data-symbol", token.symbol);
            
            var changeColor = token.change24h > 0 ? "#00ff88" : "#ff4444";
            var changeSymbol = token.change24h > 0 ? "?" : "?";
            
            // Format price based on value
            var priceDisplay;
            if (token.price < 0.00001) {
                priceDisplay = token.price.toFixed(8);
            } else if (token.price < 0.01) {
                priceDisplay = token.price.toFixed(6);
            } else if (token.price < 1) {
                priceDisplay = token.price.toFixed(4);
            } else {
                priceDisplay = token.price.toFixed(2);
            }
            
            // Format volume
            var volumeDisplay = "";
            if (token.volume24h > 1000000) {
                volumeDisplay = "Vol: $" + (token.volume24h / 1000000).toFixed(1) + "M";
            } else if (token.volume24h > 1000) {
                volumeDisplay = "Vol: $" + (token.volume24h / 1000).toFixed(1) + "K";
            } else if (token.volume24h) {
                volumeDisplay = "Vol: $" + token.volume24h.toFixed(0);
            }
            
            div.style.cssText = "padding: 12px; margin: 8px 0; background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 8px; cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;";
            
            var change1hHtml = "";
            if (token.change1h) {
                var change1hColor = token.change1h > 0 ? "#00ff88" : "#ff4444";
                var change1hSign = token.change1h > 0 ? "+" : "";
                change1hHtml = '<div style="margin-top: 3px; font-size: 11px; color: ' + change1hColor + ';">1h: ' + change1hSign + token.change1h.toFixed(2) + '%</div>';
            }
            
            div.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">' +
                '<span style="font-weight: bold; color: #00ff88; font-size: 14px;">' + token.symbol + '</span>' +
                '<span style="color: #00ccff; font-weight: bold;">$' + priceDisplay + '</span>' +
                '</div>' +
                '<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">' +
                '<span style="color: ' + changeColor + ';">' + changeSymbol + ' ' + Math.abs(token.change24h).toFixed(2) + '% (24h)</span>' +
                '<span style="color: #888; font-size: 11px;">' + volumeDisplay + '</span>' +
                '</div>' + change1hHtml;
            
            // Add hover effect
            div.onmouseenter = function() {
                this.style.background = "rgba(0, 255, 136, 0.1)";
                this.style.borderColor = "#00ff88";
                this.style.transform = "translateX(5px)";
            };
            
            div.onmouseleave = function() {
                this.style.background = "rgba(0, 255, 136, 0.05)";
                this.style.borderColor = "rgba(0, 255, 136, 0.2)";
                this.style.transform = "translateX(0)";
            };
            
            // Add click handler to open on DexScreener
            (function(t) {
                div.onclick = function() {
                    if (t.pairAddress) {
                        window.open("https://dexscreener.com/solana/" + t.pairAddress, "_blank");
                    }
                };
            })(token);
            
            tokenList.appendChild(div);
        });
        
        // Add last update time
        var updateDiv = document.createElement("div");
        updateDiv.style.cssText = "margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0, 255, 136, 0.2); font-size: 11px; color: #888; text-align: center;";
        updateDiv.textContent = "Updated: " + new Date().toLocaleTimeString();
        tokenList.appendChild(updateDiv);
    }
}

// Manual refresh function
window.refreshTokens = function() {
    console.log("[Tokens] Manual refresh triggered");
    
    if (window.addMessage) {
        window.addMessage("System", "?? Refreshing live token prices...", "system");
    }
    
    fetchTokenPrices().then(function() {
        if (window.addMessage) {
            window.addMessage("System", "? Token prices updated!", "system");
        }
    });
};

// Add custom tokens
window.addCustomToken = function(symbol, address) {
    TRACKED_TOKENS.push({ symbol: symbol.toUpperCase(), address: address });
    fetchTokenPrices();
};

// Search tokens on DexScreener
window.searchToken = async function(query) {
    try {
        var response = await fetch("https://api.dexscreener.com/latest/dex/search?q=" + encodeURIComponent(query));
        var data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
            return data.pairs.slice(0, 5); // Return top 5 results
        }
    } catch (error) {
        console.error("[Tokens] Search error:", error);
    }
    return [];
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTokenScanner);
} else {
    initTokenScanner();
}

// Export for use in other modules
window.tokenScanner = {
    fetchPrices: fetchTokenPrices,
    addToken: window.addCustomToken,
    search: window.searchToken,
    getCache: function() { return tokenPriceCache; }
};

console.log("[Tokens] Live DexScreener integration loaded");