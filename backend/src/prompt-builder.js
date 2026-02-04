// Proper Claude Prompt Handler
const ClaudePromptBuilder = {
    
    buildProjectPrompt(projectName, projectType, features) {
        // Don't insert the features text into the content!
        return `You are an expert developer. Create a complete ${projectType} based on these requirements:

Project: ${projectName}
Requirements: ${features}

IMPORTANT RULES:
1. DO NOT put the requirements text itself in the project
2. INTERPRET what the user wants and BUILD it
3. If they say "website about turkeys" - create actual turkey content, don't write "Build a really cool website all about turkeys"
4. Generate REAL content based on the theme they request

For example:
- If they want "website about turkeys", create real turkey facts, information, images placeholders
- If they want "4 buttons in header", create 4 functional navigation buttons
- If they want "dark mode", implement actual dark styling

Generate complete files with REAL content, not placeholders:

\`\`\`html
[Complete HTML with real content based on their request]
\`\`\`

\`\`\`css
[Complete CSS with proper styling]
\`\`\`

\`\`\`javascript
[Complete JavaScript with functionality]
\`\`\``;
    }
};

// Export for backend
if (typeof module !== 'undefined') {
    module.exports = ClaudePromptBuilder;
}
