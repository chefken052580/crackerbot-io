// MOBILE PROJECT BUILDER
window.buildMobileProject = function(name, type, features) {
    console.log('[Mobile Builder] Building:', name, type, features);
    const files = {};
    
    if (type.includes('React Native')) {
        files['App.js'] = generateReactNativeApp(name, features);
        files['package.json'] = generateReactNativePackage(name);
        files['index.js'] = generateReactNativeIndex();
    } else if (type.includes('Flutter')) {
        files['lib/main.dart'] = generateFlutterApp(name, features);
        files['pubspec.yaml'] = generateFlutterPubspec(name);
    } else {
        // Default mobile web app
        files['index.html'] = generateMobileWebApp(name, features);
        files['mobile.css'] = generateMobileCSS();
        files['app.js'] = generateMobileJS(name);
    }
    
    files['README.md'] = generateMobileReadme(name, type, features);
    return files;
};

function generateReactNativeApp(name, features) {
    return `import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>${name}</Text>
                <Text style={styles.subtitle}>${features || 'React Native Mobile App'}</Text>
            </View>
            
            <View style={styles.content}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 40, alignItems: 'center', backgroundColor: '#667eea' },
    title: { fontSize: 28, fontWeight: 'bold', color: 'white', textAlign: 'center' },
    subtitle: { fontSize: 16, color: 'white', marginTop: 10, textAlign: 'center' },
    content: { padding: 20 },
    button: { backgroundColor: '#667eea', padding: 15, borderRadius: 25, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});`;
}

// Additional mobile builder functions would go here...
function generateReactNativePackage(name) {
    return JSON.stringify({
        name: name.toLowerCase().replace(/\s+/g, '-'),
        version: "0.0.1",
        private: true,
        scripts: {
            "android": "react-native run-android",
            "ios": "react-native run-ios",
            "start": "react-native start"
        },
        dependencies: {
            "react": "18.2.0",
            "react-native": "0.72.6"
        }
    }, null, 2);
}

function generateMobileWebApp(name, features) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <link rel="stylesheet" href="mobile.css">
</head>
<body>
    <div class="mobile-app">
        <header class="mobile-header">
            <h1>${name}</h1>
            <p>${features || 'Mobile Web Application'}</p>
        </header>
        
        <main class="mobile-content">
            <div class="feature-grid">
                <div class="feature-card">
                    <span class="feature-icon">📱</span>
                    <h3>Mobile First</h3>
                    <p>Optimized for mobile devices</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">⚡</span>
                    <h3>Fast Loading</h3>
                    <p>Lightweight and responsive</p>
                </div>
            </div>
        </main>
    </div>
    <script src="app.js"></script>
</body>
</html>`;
}

console.log('[Mobile Builder] Loaded - React Native, Flutter, Mobile Web');

function generateReactNativeIndex() {
    return `import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);`;
}

function generateFlutterApp(name, features) {
    return `import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${name}',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('${name}')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('${features || 'Flutter Mobile App'}', style: TextStyle(fontSize: 18)),
            ElevatedButton(
              onPressed: () {},
              child: Text('Get Started'),
            ),
          ],
        ),
      ),
    );
  }
}`;
}

function generateFlutterPubspec(name) {
    return `name: ${name.toLowerCase().replace(/\s+/g, '_')}
description: Flutter mobile app built with CrackerBot
version: 1.0.0+1

environment:
  sdk: ">=2.12.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter

flutter:
  uses-material-design: true`;
}

function generateMobileCSS() {
    return `/* Mobile-first CSS */
* { box-sizing: border-box; margin: 0; padding: 0; }

.mobile-app {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
}

.mobile-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 60px 20px 40px;
    text-align: center;
}

.mobile-header h1 {
    font-size: 2rem;
    margin-bottom: 10px;
}

.mobile-content {
    padding: 20px;
}

.feature-grid {
    display: grid;
    gap: 20px;
    margin-top: 30px;
}

.feature-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
}

.feature-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 10px;
}

@media (min-width: 768px) {
    .feature-grid { grid-template-columns: repeat(2, 1fr); }
}`;
}

function generateMobileJS(name) {
    return `// ${name} Mobile App
document.addEventListener('DOMContentLoaded', function() {
    console.log('${name} mobile app loaded');
    
    // Touch-friendly interactions
    const buttons = document.querySelectorAll('button, .feature-card');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
});`;
}

function generateMobileReadme(name, type, features) {
    return `# ${name}

${type} built with CrackerBot AI.

## Features
${features || 'Mobile-optimized application'}

## Getting Started

### For React Native:
\`\`\`bash
npm install
npx react-native run-android
# or
npx react-native run-ios
\`\`\`

### For Flutter:
\`\`\`bash
flutter pub get
flutter run
\`\`\`

### For Mobile Web:
Open index.html in a browser or serve with a web server.

## Built with CrackerBot
This mobile app was generated using CrackerBot AI Builder.`;
}
