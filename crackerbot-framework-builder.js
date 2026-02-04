// FRONTEND FRAMEWORK PROJECT BUILDER
window.buildFrameworkProject = function(name, type, features) {
    console.log('[Framework Builder] Building:', name, type, features);
    const files = {};
    
    if (type.includes('React')) {
        // React App
        files['package.json'] = `{
  "name": "${name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`;
        
        files['src/App.js'] = `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Welcome to ${name}!');
  
  useEffect(() => {
    document.title = '${name} - React App';
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 ${name}</h1>
        <p>{message}</p>
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span className="count">{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        <p className="features">${features || 'Built with React 18'}</p>
      </header>
    </div>
  );
}

export default App;`;

        files['src/App.css'] = `.App {
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.App-header {
  color: white;
  padding: 2rem;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(0,0,0,0.3);
}

.counter {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 2rem 0;
}

.counter button {
  background: white;
  color: #764ba2;
  border: none;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.counter button:hover {
  transform: scale(1.1);
}

.count {
  font-size: 2rem;
  min-width: 100px;
}`;

        files['src/index.js'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

        files['src/index.css'] = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`;

        files['public/index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="${name} - ${features || 'React Application'}" />
  <title>${name}</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>`;
    
    } else if (type.includes('Vue')) {
        // Vue App
        files['package.json'] = `{
  "name": "${name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build"
  },
  "dependencies": {
    "vue": "^3.2.13"
  }
}`;

        files['src/App.vue'] = `<template>
  <div id="app">
    <header>
      <h1>🚀 {{ projectName }}</h1>
      <p>{{ message }}</p>
      <div class="counter">
        <button @click="decrement">-</button>
        <span class="count">{{ count }}</span>
        <button @click="increment">+</button>
      </div>
      <p class="features">${features || 'Built with Vue 3'}</p>
    </header>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      projectName: '${name}',
      message: 'Welcome to your Vue.js app!',
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
}

.counter {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
}

.counter button {
  background: white;
  color: #42b883;
  border: none;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
}

.count {
  font-size: 2rem;
  min-width: 100px;
}
</style>`;

    } else if (type.includes('Angular')) {
        // Angular App
        files['angular.json'] = `{
  "version": 1,
  "projects": {
    "${name.toLowerCase().replace(/\s+/g, '-')}": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src"
    }
  }
}`;

        files['src/app/app.component.ts'] = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '${name}';
  message = 'Welcome to your Angular app!';
  count = 0;
  features = '${features || 'Built with Angular'}';
  
  increment() {
    this.count++;
  }
  
  decrement() {
    this.count--;
  }
}`;

        files['src/app/app.component.html'] = `<div class="app">
  <header>
    <h1>🚀 {{ title }}</h1>
    <p>{{ message }}</p>
    <div class="counter">
      <button (click)="decrement()">-</button>
      <span class="count">{{ count }}</span>
      <button (click)="increment()">+</button>
    </div>
    <p class="features">{{ features }}</p>
  </header>
</div>`;

        files['src/app/app.component.css'] = `.app {
  text-align: center;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dd1b16 0%, #333 100%);
  color: white;
}`;

    } else if (type.includes('Next.js')) {
        // Next.js App
        files['package.json'] = `{
  "name": "${name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "13.4.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}`;

        files['pages/index.js'] = `import { useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [count, setCount] = useState(0);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>${name} - Next.js App</title>
        <meta name="description" content="${features || 'Built with Next.js'}" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>🚀 ${name}</h1>
        <p className={styles.description}>
          Full-stack React framework with SSR/SSG
        </p>
        
        <div className={styles.counter}>
          <button onClick={() => setCount(count - 1)}>-</button>
          <span>{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Server-Side Rendering</h3>
            <p>Pre-render pages on the server</p>
          </div>
          <div className={styles.card}>
            <h3>Static Generation</h3>
            <p>Generate static HTML at build time</p>
          </div>
          <div className={styles.card}>
            <h3>API Routes</h3>
            <p>Build your API with Next.js</p>
          </div>
        </div>
      </main>
    </div>
  );
}`;

        files['pages/api/hello.js'] = `export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from ${name} API!' });
}`;

        files['styles/Home.module.css'] = `.container {
  min-height: 100vh;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0070f3 0%, #000 100%);
}

.main {
  padding: 5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.title {
  margin: 0;
  line-height: 1.15;
  font-size: 4rem;
}

.counter {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin: 2rem 0;
}

.counter button {
  background: white;
  color: #0070f3;
  border: none;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
}

.counter span {
  font-size: 2rem;
  min-width: 100px;
}

.grid {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 800px;
  margin-top: 3rem;
}

.card {
  margin: 1rem;
  padding: 1.5rem;
  text-align: left;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  transition: all 0.15s;
  width: 200px;
}

.card:hover {
  border-color: #0070f3;
  background: rgba(0,112,243,0.1);
}`;

    } else if (type.includes('Svelte')) {
        // Svelte App
        files['package.json'] = `{
  "name": "${name.toLowerCase().replace(/\s+/g, '-')}",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^2.0.0",
    "svelte": "^3.54.0",
    "vite": "^4.0.0"
  }
}`;

        files['src/App.svelte'] = `<script>
  let count = 0;
  let name = '${name}';
  let message = 'Welcome to Svelte!';
  
  function increment() {
    count += 1;
  }
  
  function decrement() {
    count -= 1;
  }
</script>

<main>
  <h1>🚀 {name}</h1>
  <p>{message}</p>
  
  <div class="counter">
    <button on:click={decrement}>-</button>
    <span>{count}</span>
    <button on:click={increment}>+</button>
  </div>
  
  <p class="features">${features || 'Built with Svelte'}</p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 600px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #ff3e00 0%, #333 100%);
    color: white;
  }

  h1 {
    font-size: 3rem;
    text-transform: uppercase;
    font-weight: 100;
  }

  .counter {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin: 2rem 0;
  }

  button {
    background: white;
    color: #ff3e00;
    border: none;
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    border-radius: 50%;
    cursor: pointer;
  }

  span {
    font-size: 2rem;
    min-width: 100px;
  }
</style>`;

    } else {
        // Default framework template
        files['index.html'] = `<!DOCTYPE html>
<html>
<head>
    <title>${name} - ${type}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>${name}</h1>
        <p>${type} Framework Project</p>
        <p>${features || 'Modern framework application'}</p>
    </div>
    <script src="app.js"></script>
</body>
</html>`;
        
        files['app.js'] = `// ${name} - ${type}
console.log('Framework app loaded');`;
        
        files['style.css'] = `body { 
    font-family: system-ui; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    min-height: 100vh; 
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
}`;
    }
    
    return files;
};

console.log('[Framework Builder] Loaded - React, Vue, Angular, Next.js, Svelte, Remix');
