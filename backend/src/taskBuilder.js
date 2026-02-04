// bot_backend/src/taskBuilder.js
// Version: v2025-09-03-live-streaming
/**
 * CrackerBot's Cosmic Build Forge with Live Streaming Support
 * Triggers live preview editor and streams build process to users in real-time
 * Enhanced for maximum AI creativity and user engagement
 */

import fs from "fs/promises";
import path from "path";
import { log, error, debug } from "./logger.js";
import { zipFilesWithReadme } from "./contentUtils.js";
import * as fileGenerator from "./fileGenerator.js";
import { generateResponse } from "./aiHelper.js";
import { extensionMap } from "./taskExecution.js";
import { sendProgress } from "./taskExecution.js";
import { botSocketPromise } from './socket.js';

/**
 * Enhanced Task Builder with Live Streaming capabilities
 */
class LiveStreamingTaskBuilder {
  constructor() {
    this.tempDir = path.join("/tmp");
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await log(`🌌 Live streaming temp directory ready at ${this.tempDir}`);
    } catch (err) {
      await error(`❌ Failed to create temp directory: ${err.message}`);
    }
  }

  /**
   * Enhanced file generation with live streaming support
   */
  async generateFiles(task, userName, tone, frontendId, ip) {
    const socket = await botSocketPromise;
    const { taskId, name, type, features } = task;
    const files = {};

    await log(`🎬 Starting live streaming build for ${taskId}: "${name}"`, { taskId, userName });

    try {
      // STEP 1: Trigger live preview editor auto-open
      if (socket && frontendId) {
        await this.triggerLiveEditor(socket, task, frontendId, userName);
      }

      // STEP 2: Use enhanced AI-driven approach
      const projectPlan = await this.createProjectPlan(task, userName, tone, socket, frontendId);
      
      // STEP 3: Generate files with streaming
      const generatedFiles = await this.generateFilesWithStreaming(
        projectPlan, task, userName, tone, socket, frontendId, ip
      );

      Object.assign(files, generatedFiles);

      // STEP 4: Generate enhanced README
      const readmeContent = await this.generateEnhancedReadme(task, userName, tone);
      files["README.md"] = readmeContent;

      await log(`🌟 Live streaming build completed: ${Object.keys(files).length} files created`, { taskId });

      return files;

    } catch (err) {
      await error(`❌ Live streaming build failed for ${taskId}: ${err.message}`, { taskId });
      
      // Send error to live editor if active
      if (socket && frontendId) {
        socket.emit('live_update', {
          type: 'build_error',
          taskId: taskId,
          error: err.message,
          frontendId: frontendId
        });
      }

      // Return error file
      return {
        "error.txt": `🚫 Live streaming build failed for ${name}!\n\nError: ${err.message}\n\nFeatures requested: ${features}\n\nPlease try again with a different approach! 🌌`
      };
    }
  }

  /**
   * Trigger live preview editor to open automatically
   */
  async triggerLiveEditor(socket, task, frontendId, userName) {
    try {
      // Send live editor open command
      socket.emit('open_live_editor', {
        taskId: task.taskId,
        projectName: task.name,
        projectType: task.type,
        features: task.features,
        frontendId: frontendId,
        userName: userName
      });

      await log(`🎥 Live editor triggered for ${task.taskId}`, { taskId: task.taskId });
    } catch (error) {
      await log(`⚠️ Could not trigger live editor: ${error.message}`, { taskId: task.taskId });
    }
  }

  /**
   * Create intelligent project plan using AI
   */
  async createProjectPlan(task, userName, tone, socket, frontendId) {
    const { taskId, name, type, features } = task;

    // Send planning status to live editor
    if (socket && frontendId) {
      socket.emit('live_update', {
        type: 'planning_start',
        taskId: taskId,
        message: `🏗️ AI architect planning "${name}"...`,
        frontendId: frontendId
      });
    }

    const planningPrompt = `You are a senior software architect planning a ${type} project called "${name}".

User Requirements: "${features}"

Create a comprehensive project plan that determines:
1. The optimal file structure for this project
2. What technologies to use beyond the basic type
3. Advanced features to add that would impress the user
4. Modern development practices to implement

Consider the user wants: ${features}

Respond with a JSON object like this:
{
  "projectType": "${type}",
  "techStack": ["primary_tech", "supporting_tech", "frameworks"],
  "fileStructure": {
    "index.html": "Main entry point with semantic HTML5",
    "styles.css": "Modern CSS with animations and responsive design",
    "app.js": "Interactive JavaScript with ES6+ features",
    "utils.js": "Utility functions and helpers"
  },
  "advancedFeatures": ["feature1", "feature2", "feature3"],
  "designApproach": "description of visual/UX approach"
}

Make it production-ready and impressive!`;

    try {
      const planResponse = await generateResponse(planningPrompt, userName, tone);
      const projectPlan = JSON.parse(planResponse);
      
      // Send plan completion to live editor
      if (socket && frontendId) {
        socket.emit('live_update', {
          type: 'planning_complete',
          taskId: taskId,
          projectPlan: projectPlan,
          message: `✅ Architecture planned: ${projectPlan.techStack?.join(', ') || type}`,
          frontendId: frontendId
        });
      }

      await log(`📋 Project plan created for ${taskId}`, { taskId, techStack: projectPlan.techStack });
      return projectPlan;

    } catch (err) {
      await error(`❌ Project planning failed: ${err.message}`, { taskId });
      
      // Fallback plan
      return {
        projectType: type,
        techStack: [type, 'HTML5', 'CSS3', 'JavaScript'],
        fileStructure: {
          'index.html': 'Main HTML file',
          'styles.css': 'Stylesheet',
          'app.js': 'JavaScript functionality',
        },
        advancedFeatures: ['Responsive Design', 'Modern UI'],
        designApproach: 'Clean and modern design'
      };
    }
  }

  /**
   * Generate files with live streaming to frontend
   */
  async generateFilesWithStreaming(projectPlan, task, userName, tone, socket, frontendId, ip) {
    const { taskId, name, type, features } = task;
    const files = {};
    
    const fileEntries = Object.entries(projectPlan.fileStructure);
    const totalFiles = fileEntries.length;

    for (let i = 0; i < totalFiles; i++) {
      const [fileName, purpose] = fileEntries[i];
      const progress = Math.floor(20 + (i / totalFiles) * 60);

      try {
        // Send progress update
        if (socket) {
          await sendProgress(socket, taskId, progress, 
            `🔨 Creating ${fileName} with AI magic...`, 
            frontendId, ip, name, type, features, userName);
        }

        // Notify live editor of file start
        if (socket && frontendId) {
          socket.emit('live_update', {
            type: 'file_start',
            taskId: taskId,
            filePath: fileName,
            purpose: purpose,
            frontendId: frontendId
          });
        }

        // Generate file content with enhanced AI prompt
        const fileContent = await this.generateEnhancedFile(
          fileName, purpose, projectPlan, task, userName, tone
        );

        files[fileName] = fileContent;

        // Stream content to live editor with typing effect
        if (socket && frontendId) {
          await this.streamFileContent(socket, taskId, fileName, fileContent, frontendId);
        }

        // Notify file completion
        if (socket && frontendId) {
          socket.emit('live_update', {
            type: 'file_complete',
            taskId: taskId,
            filePath: fileName,
            content: fileContent,
            frontendId: frontendId
          });

          // Update live preview if it's a previewable file
          if (this.isPreviewable(fileName)) {
            const previewHTML = this.buildPreviewHTML(files);
            socket.emit('live_update', {
              type: 'preview_update',
              taskId: taskId,
              previewContent: previewHTML,
              frontendId: frontendId
            });
          }
        }

        await log(`✅ Generated ${fileName} (${fileContent.length} characters)`, { taskId });

      } catch (err) {
        await error(`❌ Failed to generate ${fileName}: ${err.message}`, { taskId });
        files[fileName] = `<!-- Error generating ${fileName}: ${err.message} -->`;
      }
    }

    return files;
  }

  /**
   * Generate enhanced file with context-aware AI prompts
   */
  async generateEnhancedFile(fileName, purpose, projectPlan, task, userName, tone) {
    const { name, type, features } = task;

    const enhancedPrompt = `Create a production-ready ${fileName} file for the project "${name}".

PROJECT CONTEXT:
- Type: ${projectPlan.projectType}
- Tech Stack: ${projectPlan.techStack?.join(', ')}
- Purpose: ${purpose}
- User Requirements: ${features}
- Advanced Features: ${projectPlan.advancedFeatures?.join(', ')}
- Design Approach: ${projectPlan.designApproach}

FILE REQUIREMENTS FOR ${fileName}:
${this.getFileRequirements(fileName, projectPlan)}

OTHER FILES IN PROJECT:
${Object.keys(projectPlan.fileStructure).map(f => `- ${f}: ${projectPlan.fileStructure[f]}`).join('\n')}

CRITICAL REQUIREMENTS:
✅ Make it PRODUCTION-READY (no placeholders)
✅ Include ADVANCED features beyond basic requirements
✅ Add DETAILED comments explaining functionality
✅ Use MODERN best practices and latest syntax
✅ Ensure PERFECT integration with other project files
✅ Make it VISUALLY STUNNING (for frontend files)
✅ Include CREATIVE elements that wow users
✅ Credit ${userName} in comments

Generate ONLY the complete file content - no explanations:`;

    try {
      const content = await generateResponse(enhancedPrompt, userName, tone);
      return this.postProcessFileContent(content, fileName, name, userName);
    } catch (err) {
      await error(`❌ AI generation failed for ${fileName}: ${err.message}`);
      return this.generateFallbackContent(fileName, name, features, userName);
    }
  }

  /**
   * Get specific requirements for each file type
   */
  getFileRequirements(fileName, projectPlan) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const requirements = {
      'html': `- Use semantic HTML5 elements
- Include meta tags for SEO and mobile
- Add structured data markup
- Ensure accessibility with ARIA labels
- Include space for ${projectPlan.techStack?.join(', ')} integration`,
      
      'css': `- Use CSS Grid and Flexbox for layout
- Implement CSS custom properties (variables)
- Add smooth animations and transitions  
- Include responsive design with mobile-first approach
- Use modern CSS features (backdrop-filter, clamp, etc.)
- Add hover effects and micro-interactions`,
      
      'js': `- Use ES6+ features (arrow functions, async/await, modules)
- Implement proper error handling
- Add interactive functionality
- Include performance optimizations
- Use modern DOM manipulation techniques
- Add event listeners with proper cleanup`,
      
      'md': `- Use proper markdown formatting
- Include badges and shields
- Add table of contents
- Include installation and usage instructions
- Add contributing guidelines and license info`
    };

    return requirements[ext] || `- Follow best practices for ${fileName}
- Include comprehensive functionality
- Add proper documentation and comments`;
  }

  /**
   * Post-process generated content
   */
  postProcessFileContent(content, fileName, projectName, userName) {
    // Clean up common AI response issues
    let processed = content;
    
    // Remove markdown code block markers if present
    processed = processed.replace(/```[\w]*\n?/g, '');
    processed = processed.replace(/```/g, '');
    
    // Add user credit if not present
    if (!processed.includes(userName)) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      const creditComment = {
        'html': `<!-- Created for ${userName} by CrackerBot AI -->`,
        'css': `/* Crafted for ${userName} by CrackerBot AI */`,
        'js': `// Built for ${userName} by CrackerBot AI`,
        'md': `<!-- Created for ${userName} by CrackerBot AI -->`
      }[ext] || `<!-- ${userName}'s ${projectName} -->`;
      
      processed = creditComment + '\n' + processed;
    }

    return processed.trim();
  }

  /**
   * Generate fallback content for failed AI generations
   */
  generateFallbackContent(fileName, projectName, features, userName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    const fallbacks = {
      'html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Created for ${userName} by CrackerBot AI -->
    <div class="container">
        <header>
            <h1>${projectName}</h1>
        </header>
        <main>
            <section class="hero">
                <h2>Welcome to ${projectName}</h2>
                <p>${features}</p>
                <button class="cta-btn">Get Started</button>
            </section>
        </main>
        <footer>
            <p>Built with CrackerBot AI for ${userName}</p>
        </footer>
    </div>
    <script src="app.js"></script>
</body>
</html>`,
      
      'css': `/* Crafted for ${userName} by CrackerBot AI */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.hero {
    text-align: center;
    padding: 100px 20px;
}

h1 {
    font-size: 3rem;
    background: linear-gradient(135deg, #00ff88, #00ccff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}`,
      
      'js': `// Built for ${userName} by CrackerBot AI
console.log('${projectName} initialized for ${userName}!');

document.addEventListener('DOMContentLoaded', () => {
    // App initialization
    console.log('Features: ${features}');
    
    // Event listeners
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            alert('Welcome to ${projectName}, ${userName}!');
        });
    }
});`,
      
      'md': `# ${projectName}

<!-- Created for ${userName} by CrackerBot AI -->

## Features
${features}

## Quick Start
Open \`index.html\` in your browser or run a local server.

## Built With
CrackerBot AI for ${userName}

## License
MIT License`
    };

    return fallbacks[ext] || `// ${fileName} for ${projectName}\n// Created for ${userName}\n// Features: ${features}`;
  }

  /**
   * Stream file content with typing effect to live editor
   */
  async streamFileContent(socket, taskId, fileName, content, frontendId) {
    const lines = content.split('\n');
    const chunkSize = Math.max(2, Math.min(5, Math.floor(lines.length / 15)));
    
    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize).join('\n');
      const isComplete = i + chunkSize >= lines.length;
      const progress = Math.round((i / lines.length) * 100);
      
      socket.emit('live_update', {
        type: 'file_content_stream',
        taskId: taskId,
        filePath: fileName,
        contentChunk: chunk,
        isComplete: isComplete,
        progress: progress,
        frontendId: frontendId
      });
      
      // Typing delay for dramatic effect
      await this.delay(60);
    }
  }

  /**
   * Check if file is previewable in browser
   */
  isPreviewable(fileName) {
    return fileName.match(/\.(html|htm)$/i);
  }

  /**
   * Build preview HTML by combining all files
   */
  buildPreviewHTML(files) {
    // Find main HTML file
    const htmlFile = files['index.html'] || files['main.html'] || 
                     Object.keys(files).find(f => f.endsWith('.html'));
    
    if (!htmlFile) return '<html><body><h1>No HTML file to preview</h1></body></html>';
    
    let html = files[htmlFile];
    
    // Inject CSS files inline
    Object.keys(files).forEach(fileName => {
      if (fileName.endsWith('.css')) {
        const cssTag = `<link rel="stylesheet" href="${fileName}">`;
        const inlineCSS = `<style>\n${files[fileName]}\n</style>`;
        
        if (html.includes(cssTag)) {
          html = html.replace(cssTag, inlineCSS);
        } else if (html.includes('</head>')) {
          html = html.replace('</head>', `${inlineCSS}\n</head>`);
        }
      }
    });
    
    // Inject JS files inline
    Object.keys(files).forEach(fileName => {
      if (fileName.endsWith('.js') && !fileName.includes('node_modules')) {
        const scriptTag = `<script src="${fileName}"></script>`;
        const inlineScript = `<script>\n${files[fileName]}\n</script>`;
        
        if (html.includes(scriptTag)) {
          html = html.replace(scriptTag, inlineScript);
        } else if (html.includes('</body>')) {
          html = html.replace('</body>', `${inlineScript}\n</body>`);
        }
      }
    });
    
    return html;
  }

  /**
   * Generate enhanced README with project details
   */
  async generateEnhancedReadme(task, userName, tone) {
    const { taskId, name, type, features } = task;
    
    const readmePrompt = `Create a comprehensive README.md for the project "${name}".

Project Details:
- Type: ${type}
- Features: ${features}
- Created for: ${userName}

Include these sections:
1. Project title with description
2. Features list with details
3. Quick start instructions
4. Technology stack used
5. File structure explanation
6. Development setup
7. Usage examples
8. Contributing guidelines
9. License information
10. Credits to ${userName} and CrackerBot

Make it professional, engaging, and informative with proper markdown formatting, badges, and emojis.`;

    try {
      const readme = await generateResponse(readmePrompt, userName, tone);
      return readme;
    } catch (err) {
      await error(`❌ README generation failed: ${err.message}`, { taskId });
      
      return `# ${name}

Created for **${userName}** by CrackerBot AI

## Features
${features}

## Quick Start
1. Open \`index.html\` in your browser
2. Or run a local server: \`python -m http.server 8000\`

## Technology Stack
- ${type}
- HTML5, CSS3, JavaScript
- Modern web standards

## Built With
🤖 **CrackerBot AI** - Advanced project generation
👤 **${userName}** - Project visionary

## License
MIT License

---
*Generated with cosmic flair by CrackerBot AI*`;
    }
  }

  /**
   * Cleanup temporary files
   */
  async cleanupTempFiles(taskId) {
    try {
      const files = await fs.readdir(this.tempDir);
      const cleanupPromises = files
        .filter(f => f.includes(taskId))
        .map(file => 
          fs.unlink(path.join(this.tempDir, file))
            .then(() => log(`🧹 Cleaned temp file: ${file}`, { taskId }))
        );
      
      await Promise.all(cleanupPromises);
      await log(`🧹 Temp cleanup completed for ${taskId}`, { taskId });
    } catch (err) {
      await error(`❌ Cleanup failed for ${taskId}: ${err.message}`, { taskId });
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the enhanced builder
const liveStreamingBuilder = new LiveStreamingTaskBuilder();

/**
 * Enhanced buildTask function with live streaming support
 */
export async function buildTask(task, userName, tone, requestId, leadId) {
  const socket = await botSocketPromise;
  const { taskId = task.id, name, type, features, frontendId, ip, version = 1 } = task;
  
  await log(`🎬 Live streaming build initiated for ${name} (${type})`, { 
    taskId, userName, features: features?.substring(0, 100) 
  });

  try {
    // Generate files with live streaming
    const files = await liveStreamingBuilder.generateFiles(task, userName, tone, frontendId, ip);
    
    if (Object.keys(files).length === 0) {
      throw new Error("No files generated during live streaming build");
    }

    // Create JSON content structure
    const jsonContent = {
      taskId,
      name,
      type,
      features,
      userName,
      files: Object.fromEntries(
        Object.entries(files).map(([fileName, content]) => [
          fileName,
          {
            content: typeof content === "string" ? content : content.toString("base64"),
            encoding: typeof content === "string" ? "utf8" : "base64",
          },
        ])
      ),
    };

    // Create downloadable ZIP
    const zipBuffer = await zipFilesWithReadme(files, task);
    const zipFileName = `${name.replace(/\s+/g, '-')}${version ? `-v${version}` : ""}.zip`;

    // Send final progress update
    if (socket) {
      await sendProgress(socket, taskId, 100, 
        `🎉 Live streaming build completed! Ready for download.`, 
        frontendId, ip, name, type, features, userName);
    }

    // Send completion to live editor
    if (socket && frontendId) {
      socket.emit('live_update', {
        type: 'build_complete',
        taskId: taskId,
        files: files,
        fileCount: Object.keys(files).length,
        downloadReady: true,
        frontendId: frontendId
      });
    }

    await log(`🌟 Live streaming build completed successfully for ${taskId}`, {
      taskId,
      fileCount: Object.keys(files).length,
      zipSize: zipBuffer.length,
      hasLiveStream: !!frontendId
    });

    return {
      content: [{ fileName: zipFileName, content: zipBuffer.toString("base64") }],
      jsonContent,
      frontendId,
      ip,
      requestId,
      leadId,
      taskFeatures: features,
      liveStreamCompleted: true
    };

  } catch (err) {
    await error(`❌ Live streaming build failed for ${taskId}: ${err.message}`, { taskId });
    
    // Send error to live editor
    if (socket && frontendId) {
      socket.emit('live_update', {
        type: 'build_error',
        taskId: taskId,
        error: err.message,
        frontendId: frontendId
      });
    }

    // Create error response
    const errorContent = `🚫 Live streaming build failed for ${name}!\n\nError: ${err.message}\n\nUser: ${userName}\nFeatures: ${features}\n\nPlease try again! 🌌`;
    const errorFiles = { "error.txt": errorContent };
    const zipBuffer = await zipFilesWithReadme(errorFiles, task);
    
    const jsonContent = {
      taskId, name, type, features, userName,
      files: { "error.txt": { content: errorContent, encoding: "utf8" } },
    };

    return {
      content: [{ fileName: `${name}_error.zip`, content: zipBuffer.toString("base64") }],
      jsonContent,
      frontendId, ip, requestId, leadId,
      error: `Live streaming build failed: ${err.message}`,
    };

  } finally {
    // Always cleanup temp files
    await liveStreamingBuilder.cleanupTempFiles(taskId);
  }
}

/**
 * Enhanced editTask function for live editing
 */
export async function editTask(task, userName, tone, requestId, leadId) {
  const { taskId, editingInstructions } = task;
  
  await log(`✨ Live streaming edit initiated for ${taskId}`, { taskId, userName });

  // For editing, enhance the features with editing instructions
  const editedTask = {
    ...task,
    features: `${task.features}\n\n🔧 EDITING INSTRUCTIONS: ${editingInstructions}\n\nIMPORTANT: This is an EDIT of an existing project. ENHANCE and IMPROVE the existing functionality while adding the requested changes. Build upon what exists, don't start from scratch!`,
    isEditing: true
  };

  return buildTask(editedTask, userName, tone, requestId, leadId);
}

console.log(`[${new Date().toISOString()}] 🎬 Live Streaming TaskBuilder loaded successfully!`);