// Load environment variables first
import { config } from 'dotenv';
config();

// bot_backend/src/aiHelper.js - With Pricing Integration

import { log, error } from './logger.js';
import { botSocket } from './socket.js';
import { getMaxTokensForTier, estimateAICost } from './pricing.js';

let openai = null;
let anthropic = null;

try {
  if (process.env.OPENAI_API_KEY) {
    const OpenAI = (await import('openai')).default;
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    console.log("? OpenAI client initialized");
  }
} catch (err) {
  console.error("? Failed to initialize OpenAI:", err.message);
}

try {
  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    console.log("? Anthropic client initialized");
  }
} catch (err) {
  console.error("? Failed to initialize Anthropic:", err.message);
}

export { openai, anthropic };

function isCodeRequest(prompt) {
  const keywords = ['create', 'build', 'code', 'function', 'class', 'html', 'css', 'javascript', 'website', 'app', 'game', 'bot'];
  return keywords.some(k => prompt.toLowerCase().includes(k));
}

export async function generateResponse(prompt, userId, tone = "witty", options = {}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid prompt');
  }

  try {
    if (!openai && !anthropic) {
      return "I need API keys to generate responses.";
    }

    // Use Claude for code requests
    if (isCodeRequest(prompt) && anthropic) {
      return await generateWithClaude(prompt, userId, tone, options);
    } 
    // Try OpenAI for non-code, fallback to Claude if it fails
    else if (openai) {
      try {
        return await generateWithOpenAI(prompt, userId, tone, options);
      } catch (openaiErr) {
        console.error('OpenAI failed, falling back to Claude:', openaiErr.message);
        if (anthropic) {
          return await generateWithClaude(prompt, userId, tone, options);
        }
        throw openaiErr;
      }
    } else if (anthropic) {
      return await generateWithClaude(prompt, userId, tone, options);
    }
  } catch (err) {
    console.error('AI generation error:', err.message);
    return "I'm having trouble right now. Please try again later.";
  }
}

async function generateWithOpenAI(prompt, userId, tone, options) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `You are CrackerBot, a cosmic AI with a ${tone} personality.` },
      { role: "user", content: prompt }
    ],
    max_tokens: 500
  });
  return completion.choices[0].message.content;
}

async function generateWithClaude(prompt, userId, tone, options) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: `You are CrackerBot, a cosmic AI with a ${tone} personality. ${prompt}` }]
  });
  return message.content[0].text;
}

/**
 * Generate project files with tier-based token limits
 */
export async function generateProjectFiles(projectName, projectType, features, options = {}) {
  const { tier = 'free', isPremium = false } = options;
  const maxTokens = getMaxTokensForTier(tier, isPremium);
  
  console.log(`AI: Generating project [Tier: ${tier}, MaxTokens: ${maxTokens}]`, { projectName, projectType, features });
  
  // Log estimated cost
  const costEstimate = estimateAICost(maxTokens, 'claude');
  console.log(`?? Estimated cost: $${costEstimate.totalCost}`);

  if (!anthropic && !openai) {
    return generateFallbackProject(projectName, projectType, features);
  }

  try {
    if (anthropic) {
      return await generateProjectWithClaude(projectName, projectType, features, maxTokens);
    } else if (openai) {
      return await generateProjectWithOpenAI(projectName, projectType, features, maxTokens);
    }
  } catch (err) {
    console.error('AI project generation failed:', err.message);
    return generateFallbackProject(projectName, projectType, features);
  }
}

async function generateProjectWithClaude(projectName, projectType, features, maxTokens = 4000) {
  // Adjust prompt based on token budget
  const isDetailed = maxTokens >= 6000;
  const lineLimit = maxTokens >= 6000 ? 100 : maxTokens >= 4000 ? 70 : 50;
  
  const prompt = `Generate a ${projectType} called "${projectName}" about: ${features}

OUTPUT ALL 3 FILES using these exact markers:

---INDEX.HTML---
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${projectName}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<!-- Create ${isDetailed ? '4-6' : '3-4'} sections about ${features} with real content -->
<script src="script.js"></script>
</body>
</html>
---END INDEX.HTML---

---STYLE.CSS---
/* Modern styles with gradients, flexbox/grid, animations */
---END STYLE.CSS---

---SCRIPT.JS---
// Real interactivity: click handlers, animations, DOM manipulation
---END SCRIPT.JS---

RULES:
- ALL THREE files required
- HTML: max ${lineLimit} lines, CSS: max ${lineLimit} lines, JS: max ${Math.floor(lineLimit * 0.7)} lines
- Real content about "${features}"
- No markdown or explanations`;

  const message = await Promise.race([
    anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }]
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Claude timeout after 30s')), 30000))
  ]);

  try {
    const response = message.content[0].text;
    console.log(`Claude response: ${response.length} chars`);
    
    const extractFile = (text, name) => {
      const start = text.indexOf("---" + name + "---");
      const end = text.indexOf("---END " + name + "---");
      if (start !== -1 && end !== -1) {
        return text.substring(start + ("---" + name + "---").length, end).trim();
      }
      return null;
    };
    
    const files = {
      "index.html": extractFile(response, "INDEX.HTML"),
      "style.css": extractFile(response, "STYLE.CSS"),
      "script.js": extractFile(response, "SCRIPT.JS")
    };
    
    console.log("Extracted: html=" + !!files["index.html"] + " css=" + !!files["style.css"] + " js=" + !!files["script.js"]);
    
    if (files["index.html"] && files["style.css"] && files["script.js"]) {
      console.log("? Claude generated all 3 files");
      return files;
    }
    
    // Fill in missing files
    if (files["index.html"]) {
      if (!files["style.css"]) files["style.css"] = generateQuickCSS(projectName, features);
      if (!files["script.js"]) files["script.js"] = generateQuickJS(projectName, features);
      console.log("? Completed with fallback CSS/JS");
      return files;
    }
  } catch (err) {
    console.error("Parse error:", err.message);
  }

  return generateFallbackProject(projectName, projectType, features);
}

function generateQuickCSS(projectName, features) {
  return `/* ${projectName} */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); color: #fff; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
header { text-align: center; padding: 3rem 0; }
h1 { font-size: 3rem; background: linear-gradient(90deg, #00d9ff, #00ff88); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
h2 { color: #00d9ff; margin: 2rem 0 1rem; }
section { background: rgba(255,255,255,0.05); border-radius: 15px; padding: 2rem; margin: 2rem 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.card { background: rgba(0,217,255,0.1); border: 1px solid rgba(0,217,255,0.3); border-radius: 10px; padding: 1.5rem; transition: transform 0.3s; }
.card:hover { transform: translateY(-5px); }
button { background: linear-gradient(90deg, #00d9ff, #00ff88); border: none; padding: 12px 24px; border-radius: 25px; color: #1a1a2e; font-weight: bold; cursor: pointer; }
footer { text-align: center; padding: 2rem; opacity: 0.7; }`;
}

function generateQuickJS(projectName, features) {
  return `// ${projectName}
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }});
  }, { threshold: 0.1 });
  document.querySelectorAll('section, .card').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(20px)'; el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', function() { this.style.transform = 'scale(0.95)'; setTimeout(() => this.style.transform = '', 150); });
  });
});`;
}

async function generateProjectWithOpenAI(projectName, projectType, features, maxTokens) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Return only valid JSON with file contents." },
      { role: "user", content: `Create ${projectType} "${projectName}" about ${features}. Return JSON: {"index.html": "...", "style.css": "...", "script.js": "..."}` }
    ],
    max_tokens: maxTokens
  });

  try {
    const json = completion.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (json) {
      const parsed = JSON.parse(json[0]);
      if (parsed['index.html'] && parsed['style.css'] && parsed['script.js']) return parsed;
    }
  } catch (err) {
    console.error('OpenAI parse error:', err.message);
  }
  return generateFallbackProject(projectName, projectType, features);
}

function generateFallbackProject(projectName, projectType, features) {
  return {
    'index.html': `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${projectName}</title><link rel="stylesheet" href="style.css"></head><body><div class="container"><header><h1>${projectName}</h1><p>${features}</p></header><main><section class="hero"><h2>Welcome</h2><p>Explore ${features}.</p><button>Get Started</button></section><section class="features"><h2>Features</h2><div class="grid"><div class="card"><h3>Modern</h3><p>Beautiful design</p></div><div class="card"><h3>Interactive</h3><p>Great UX</p></div><div class="card"><h3>Fast</h3><p>Optimized</p></div></div></section></main><footer><p>Built with CrackerBot</p></footer></div><script src="script.js"></script></body></html>`,
    'style.css': generateQuickCSS(projectName, features),
    'script.js': generateQuickJS(projectName, features)
  };
}

export async function generateDatabaseSchema(description) {
  if (!anthropic) return { tables: [], relationships: [], message: "Requires API key" };
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: `Database schema for: ${description}. Return JSON.` }]
    });
    const json = msg.content[0].text.match(/\{[\s\S]*\}/);
    if (json) return JSON.parse(json[0]);
  } catch (err) {
    console.error('Schema error:', err.message);
  }
  return { tables: [], message: "Generation failed" };
}

console.log("? AI Helper with Pricing loaded");
