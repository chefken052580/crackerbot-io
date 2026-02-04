import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
dotenv.config();

console.log('Environment check:');
console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
console.log('API Key starts with:', process.env.ANTHROPIC_API_KEY?.substring(0, 15) + '...');

try {
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    console.log('✅ Claude client created successfully');
    
    // Test with a simple request
    anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [{
            role: 'user',
            content: 'Say hello'
        }]
    }).then(response => {
        console.log('✅ Claude API works! Response:', response.content[0].text.substring(0, 50));
    }).catch(error => {
        console.log('❌ Claude API error:', error.message);
    });
    
} catch (error) {
    console.log('❌ Failed to create Claude client:', error.message);
}
