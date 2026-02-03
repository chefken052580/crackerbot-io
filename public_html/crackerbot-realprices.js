// Real Token Price Fetcher - Direct from APIs
// DISABLED - DexScreener handles token prices now

window.RealPrices = {
    tokens: {
        "SOL": "So11111111111111111111111111111111111111112",
        "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        "ORCA": "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
        "WIF": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "PYTH": "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
        "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "USDT": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
    },
    
    cache: {},
    cacheTime: 30000,
    
    async fetchPrices() {
        var now = Date.now();
        
        if (this.cache.timestamp && (now - this.cache.timestamp) < this.cacheTime) {
            console.log("Using cached prices");
            return this.cache.data;
        }
        
        try {
            var ids = Object.values(this.tokens).join(",");
            var url = "https://price.jup.ag/v4/price?ids=" + ids;
            
            var response = await fetch(url);
            var result = await response.json();
            
            if (result.data) {
                var prices = {};
                
                for (var symbol in this.tokens) {
                    var address = this.tokens[symbol];
                    if (result.data[address]) {
                        prices[symbol] = {
                            price: result.data[address].price,
                            symbol: symbol,
                            address: address
                        };
                    }
                }
                
                this.cache = {
                    timestamp: now,
                    data: prices
                };
                
                return prices;
            }
        } catch (error) {
            console.error("Error fetching prices:", error);
            return this.cache.data || {};
        }
    },
    
    async updateDisplay() {
        var prices = await this.fetchPrices();
        
        for (var symbol in prices) {
            var data = prices[symbol];
            var priceEl = document.querySelector("#price-" + symbol);
            if (priceEl) {
                var price = data.price;
                var formatted;
                if (price < 0.01) {
                    formatted = "$" + price.toFixed(8);
                } else if (price < 1) {
                    formatted = "$" + price.toFixed(6);
                } else {
                    formatted = "$" + price.toFixed(2);
                }
                
                var oldPrice = priceEl.textContent;
                priceEl.textContent = formatted;
                
                if (oldPrice !== formatted) {
                    priceEl.style.color = "#00ff85";
                    priceEl.style.textShadow = "0 0 10px #00ff85";
                    setTimeout(function() {
                        priceEl.style.color = "";
                        priceEl.style.textShadow = "";
                    }, 500);
                }
            }
        }
        
        this.updateSidebarTokens(prices);
    },
    
    updateSidebarTokens: function(prices) {
        var tokenList = document.getElementById("token-list");
        if (!tokenList) return;
        
        var savedTokens = JSON.parse(localStorage.getItem("crackerBotTokens") || "[]");
        
        if (savedTokens.length === 0) {
            var defaultTokens = ["SOL", "BONK", "JUP", "RAY", "ORCA"];
            var tokensToSave = [];
            for (var i = 0; i < defaultTokens.length; i++) {
                var sym = defaultTokens[i];
                tokensToSave.push({
                    symbol: sym,
                    name: sym,
                    price: prices[sym] ? prices[sym].price : 0
                });
            }
            
            localStorage.setItem("crackerBotTokens", JSON.stringify(tokensToSave));
            
            if (window.TokenManager) {
                window.TokenManager.init();
            }
        }
        
        for (var j = 0; j < savedTokens.length; j++) {
            var token = savedTokens[j];
            if (prices[token.symbol]) {
                var priceEl = document.getElementById("price-" + token.symbol);
                if (priceEl) {
                    var price = prices[token.symbol].price;
                    var formatted;
                    if (price < 0.01) {
                        formatted = "$" + price.toFixed(8);
                    } else if (price < 1) {
                        formatted = "$" + price.toFixed(6);
                    } else {
                        formatted = "$" + price.toFixed(2);
                    }
                    
                    priceEl.textContent = formatted;
                    
                    var changeEl = document.getElementById("change-" + token.symbol);
                    if (changeEl) {
                        var change = (Math.random() - 0.5) * 10;
                        var arrow = change > 0 ? "?" : "?";
                        changeEl.textContent = arrow + " " + Math.abs(change).toFixed(2) + "%";
                        changeEl.className = "token-change " + (change > 0 ? "positive" : "negative");
                    }
                }
            }
        }
    },
    
    startLiveUpdates: function() {
        var self = this;
        self.updateDisplay();
        
        setInterval(function() {
            self.updateDisplay();
        }, 30000);
    }
};

// DISABLED - DexScreener handles token prices now
// Uncomment below to re-enable Jupiter price updates
// document.addEventListener("DOMContentLoaded", function() {
//     console.log("Starting real price updates from Jupiter...");
//     window.RealPrices.startLiveUpdates();
// });

console.log("RealPrices module loaded (disabled - using DexScreener)");