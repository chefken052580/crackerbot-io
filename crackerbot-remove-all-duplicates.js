// Aggressively remove ALL duplicate token/wallet inputs

document.addEventListener("DOMContentLoaded", () => {
    // Function to clean up duplicates
    function cleanupDuplicates() {
        console.log("Cleaning up duplicate inputs...");
        
        // 1. Remove ALL token inputs from wallet panel
        const walletsPanel = document.getElementById("wallets-panel");
        if (walletsPanel) {
            const tokenInputs = walletsPanel.querySelectorAll(
                ".add-token-container, #add-token-container, #add-token-box, " +
                "[id*='token-symbol'], [id*='token-name'], .add-token-btn"
            );
            tokenInputs.forEach(el => {
                console.log("Removing token input from wallet panel");
                el.remove();
            });
        }
        
        // 2. Keep only ONE token input in tokens panel
        const tokensPanel = document.getElementById("tokens-panel");
        if (tokensPanel) {
            const allTokenContainers = tokensPanel.querySelectorAll(".add-token-container");
            
            // Remove all except the first
            for (let i = 1; i < allTokenContainers.length; i++) {
                console.log("Removing duplicate token container", i);
                allTokenContainers[i].remove();
            }
            
            // Also check for duplicate individual inputs
            const symbolInputs = tokensPanel.querySelectorAll("#token-symbol-input");
            const nameInputs = tokensPanel.querySelectorAll("#token-name-input");
            const addButtons = tokensPanel.querySelectorAll(".add-token-btn");
            
            // Keep only first of each
            for (let i = 1; i < symbolInputs.length; i++) symbolInputs[i].remove();
            for (let i = 1; i < nameInputs.length; i++) nameInputs[i].remove();
            for (let i = 1; i < addButtons.length; i++) addButtons[i].remove();
        }
        
        // 3. Remove any token inputs floating around outside panels
        const strayTokenInputs = document.querySelectorAll(
            ".sidebar-content > .add-token-container, " +
            ".sidebar > .add-token-container, " +
            "body > .add-token-container"
        );
        strayTokenInputs.forEach(el => {
            console.log("Removing stray token input");
            el.remove();
        });
    }
    
    // Run cleanup multiple times to catch dynamically added elements
    cleanupDuplicates();
    setTimeout(cleanupDuplicates, 1000);
    setTimeout(cleanupDuplicates, 2000);
    setTimeout(cleanupDuplicates, 3000);
    
    // Also run when switching tabs
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("sidebar-tab")) {
            setTimeout(cleanupDuplicates, 100);
        }
    });
});

console.log("✅ Aggressive duplicate removal loaded!");
