// Final Price Fix with Multiple Sources

window.LivePrices = {
    // Primary source: DexScreener (more reliable, free)
    async fetchFromDexScreener() {
        try {
            const tokens = {
                "SOL": "solana",
                "BONK": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
                "JUP": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
                "RAY": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
                "ORCA": "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE"
            };
            
            const prices = {};
            
            // Fetch each token
            for (const [symbol, address] of Object.entries(tokens)) {
                try {
                    let url;
                    if (symbol === "SOL") {
                        // SOL has a different endpoint
                        url = "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112";
                    } else {
                        url = `https://api.dexscreener.com/latest/dex/tokens/${address}`;
                    }
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.pairs && data.pairs.length > 0) {
                        // Get the price from the first pair (usually highest liquidity)
                        const price = parseFloat(data.pairs[0].priceUsd);
                        prices[symbol] = {
                            price: price,
                            change24h: data.pairs[0].priceChange?.h24 || 0
                        };
                        console.log(`DexScreener ${symbol}: $${price}`);
                    }
                } catch (err) {
                    console.error(`Error fetching ${symbol}:`, err);
                }
            }
            
            return prices;
        } catch (error) {
            console.error("DexScreener error:", error);
            return {};
        }
    },
    
    // Backup: CoinGecko
    async fetchFromCoinGecko() {
        try {
            const ids = "solana,bonk,jupiter-exchange-solana,raydium,orca";
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            const mapping = {
                "solana": "SOL",
                "bonk": "BONK",
                "jupiter-exchange-solana": "JUP",
                "raydium": "RAY",
                "orca": "ORCA"
            };
            
            const prices = {};
            for (const [geckoId, symbol] of Object.entries(mapping)) {
                if (data[geckoId]) {
                    prices[symbol] = {
                        price: data[geckoId].usd,
                        change24h: data[geckoId].usd_24h_change || 0
                    };
                    console.log(`CoinGecko ${symbol}: $${data[geckoId].usd}`);
                }
            }
            
            return prices;
        } catch (error) {
            console.error("CoinGecko error:", error);
            return {};
        }
    },
    
    // Main fetch function
    async fetchPrices() {
        console.log("Fetching live prices...");
        
        // Try DexScreener first
        let prices = await this.fetchFromDexScreener();
        
        // If DexScreener fails or is incomplete, try CoinGecko
        if (Object.keys(prices).length < 3) {
            console.log("Trying CoinGecko backup...");
            const geckoPrice = await this.fetchFromCoinGecko();
            prices = { ...prices, ...geckoPrice };
        }
        
        // Add some default prices if still missing (for testing)
        const defaults = {
            "SOL": { price: 105.23, change24h: 5.2 },
            "BONK": { price: 0.00002843, change24h: 12.5 },
            "JUP": { price: 1.18, change24h: -2.3 },
            "RAY": { price: 2.45, change24h: 8.1 },
            "ORCA": { price: 3.21, change24h: 3.4 }
        };
        
        for (const [symbol, defaultData] of Object.entries(defaults)) {
            if (!prices[symbol]) {
                console.log(`Using default for ${symbol}`);
                prices[symbol] = defaultData;
            }
        }
        
        return prices;
    },
    
    formatPrice(price) {
        if (price < 0.00001) {
            return `$${price.toFixed(9)}`;
        } else if (price < 0.001) {
            return `$${price.toFixed(6)}`;
        } else if (price < 1) {
            return `$${price.toFixed(4)}`;
        } else if (price < 100) {
            return `$${price.toFixed(2)}`;
        } else {
            return `$${price.toFixed(2)}`;
        }
    },
    
    async updatePrices() {
        const prices = await this.fetchPrices();
        
        // Update all price elements
        for (const [symbol, data] of Object.entries(prices)) {
            // Update in token list
            const priceEl = document.getElementById(`price-${symbol}`);
            if (priceEl) {
                const formatted = this.formatPrice(data.price);
                priceEl.textContent = formatted;
                priceEl.classList.add("price-updating");
                setTimeout(() => priceEl.classList.remove("price-updating"), 500);
            }
            
            // Update change percentage
            const changeEl = document.getElementById(`change-${symbol}`);
            if (changeEl) {
                const change = data.change24h;
                changeEl.textContent = `${change > 0 ? "↑" : "↓"} ${Math.abs(change).toFixed(2)}%`;
                changeEl.className = `token-change ${change > 0 ? "positive" : "negative"}`;
            }
        }
        
        console.log("Prices updated:", prices);
    },
    
    startLiveUpdates() {
        // Initial update
        this.updatePrices();
        
        // Update every 30 seconds
        setInterval(() => {
            this.updatePrices();
        }, 30000);
    }
};

// Start on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("Starting live price updates from DexScreener/CoinGecko...");
    LivePrices.startLiveUpdates();
});
