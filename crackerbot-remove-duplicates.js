// Remove duplicate token input boxes definitively

document.addEventListener("DOMContentLoaded", () => {
    // Wait for all scripts to load
    setTimeout(() => {
        // Find all token input containers
        const tokenInputSelectors = [
            ".add-token-container",
            "#add-token-container", 
            "#add-token-box",
            [id*=token-input],
            [class*=add-token]
        ];
        
        tokenInputSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`Found ${elements.length} elements matching ${selector}`);
            
            // Keep only the first one
            if (elements.length > 1) {
                for (let i = 1; i < elements.length; i++) {
                    console.log(`Removing duplicate: ${selector}`);
                    elements[i].remove();
                }
            }
        });
        
        // Also check in the tokens panel specifically
        const tokensPanel = document.getElementById("tokens-panel");
        if (tokensPanel) {
            const addContainers = tokensPanel.querySelectorAll(".add-token-container");
            if (addContainers.length > 1) {
                for (let i = 1; i < addContainers.length; i++) {
                    addContainers[i].remove();
                }
            }
        }
    }, 2000); // Wait 2 seconds for everything to load
});

// Prevent duplicate creation
const originalTokenManagerInit = window.TokenManager?.init;
if (originalTokenManagerInit) {
    let hasInitialized = false;
    window.TokenManager.init = function() {
        if (!hasInitialized) {
            hasInitialized = true;
            originalTokenManagerInit.call(this);
        }
    };
}
