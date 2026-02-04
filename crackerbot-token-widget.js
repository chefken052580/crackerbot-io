// CrackerBot Floating Token Widget
console.log('[Token Widget] Loading...');

(function() {
    if (window.tokenWidgetInitialized) {
        console.log('[Token Widget] Already initialized');
        return;
    }
    window.tokenWidgetInitialized = true;

    let isCollapsed = false;
    let updateInterval = null;

    const TOKENS = [
        { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
        { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
        { symbol: 'JUP', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' }
    ];

    function init() {
        console.log('[Token Widget] Initializing...');
        createWidget();
        updatePrices();
        // Update every 30 seconds
        updateInterval = setInterval(updatePrices, 30000);
    }

    function createWidget() {
        const widget = document.createElement('div');
        widget.id = 'token-widget';
        widget.className = 'token-widget';
        widget.innerHTML = '' +
            '<div class="widget-header" onclick="window.toggleTokenWidget()">' +
            '<span class="widget-title">📡 Tokens</span>' +
            '<span class="toggle-icon">▼</span>' +
            '</div>' +
            '<div class="widget-body">' +
            '<div id="token-prices" class="token-prices">' +
            '<div class="loading">Loading prices...</div>' +
            '</div>' +
            '</div>';

        document.body.appendChild(widget);
        console.log('[Token Widget] Widget created');
    }

    async function updatePrices() {
        const pricesDiv = document.getElementById('token-prices');
        if (!pricesDiv) return;

        try {
            pricesDiv.innerHTML = '<div class="loading">Updating...</div>';

            const prices = await Promise.all(TOKENS.map(async token => {
                try {
                    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/' + token.address);
                    const data = await response.json();
                    
                    if (data.pairs && data.pairs.length > 0) {
                        // Find Solana pair
                        const solanaPair = data.pairs.find(p => p.chainId === 'solana') || data.pairs[0];
                        const price = parseFloat(solanaPair.priceUsd);
                        const change24h = parseFloat(solanaPair.priceChange.h24 || 0);
                        
                        return {
                            symbol: token.symbol,
                            price: price,
                            change: change24h,
                            formatted: price < 0.01 ? price.toFixed(8) : price.toFixed(2)
                        };
                    }
                    return null;
                } catch (err) {
                    console.error('[Token Widget] Error fetching', token.symbol, err);
                    return null;
                }
            }));

            // Filter out nulls and render
            const validPrices = prices.filter(p => p !== null);
            if (validPrices.length > 0) {
                pricesDiv.innerHTML = validPrices.map(p => {
                    const changeClass = p.change >= 0 ? 'positive' : 'negative';
                    const changeSymbol = p.change >= 0 ? '↑' : '↓';
                    return '' +
                        '<div class="token-price-item">' +
                        '<span class="symbol">' + p.symbol + '</span> ' +
                        '<span class="price">$' + p.formatted + '</span> ' +
                        '<span class="change ' + changeClass + '">' + changeSymbol + ' ' + Math.abs(p.change).toFixed(1) + '%</span>' +
                        '</div>';
                }).join('');
            } else {
                pricesDiv.innerHTML = '<div class="error">Failed to load prices</div>';
            }

            console.log('[Token Widget] Prices updated');
        } catch (err) {
            console.error('[Token Widget] Update error:', err);
            pricesDiv.innerHTML = '<div class="error">Update failed</div>';
        }
    }

    function toggleWidget() {
        const widget = document.getElementById('token-widget');
        const toggleIcon = widget.querySelector('.toggle-icon');
        
        if (isCollapsed) {
            widget.classList.remove('collapsed');
            toggleIcon.textContent = '▼';
            isCollapsed = false;
        } else {
            widget.classList.add('collapsed');
            toggleIcon.textContent = '▲';
            isCollapsed = true;
        }
    }

    // Export to window
    window.toggleTokenWidget = toggleWidget;
    window.updateTokenPrices = updatePrices;

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[Token Widget] ✅ Ready');
})();
