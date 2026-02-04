// backend/ai-handlers.js - Clean ES Module version
let aiHelper = null;

// Load aiHelper using dynamic import at top level
try {
    const aiHelperModule = await import('./src/aiHelper.js');
    aiHelper = aiHelperModule.default || aiHelperModule;
    console.log('AI Helper loaded successfully');
} catch (e) {
    console.log('Could not load aiHelper.js:', e.message);
}

// Process AI modification request
async function processAIModification(data) {
    console.log('[AI Handler] Processing modification request...');
    const { filename, code, prompt, projectType, projectName } = data;
    
    if (!filename || !code || !prompt) {
        throw new Error('Missing required fields: filename, code, or prompt');
    }
    
    return {
        success: true,
        message: 'AI modification processed',
        modifiedCode: code
    };
}

// Handle socket messages
async function handleMessage(data, socket) {
    try {
        const messageText = data.message || data.text || '';
        
        return {
            message: "AI response: " + messageText,
            type: 'text',
            sender: 'CrackerBot'
        };
    } catch (error) {
        return {
            message: "AI processing error occurred",
            type: 'text',
            sender: 'CrackerBot'
        };
    }
}

export default {
    processAIModification,
    handleMessage
};
