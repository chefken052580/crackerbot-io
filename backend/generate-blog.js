exports.generateBlog = function(name, features) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Blog</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <nav>
            <div class="logo">${name}</div>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#posts">Posts</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section class="hero">
            <h1>Welcome to ${name}</h1>
            <p>${features || "A modern blog platform"}</p>
        </section>
        
        <section id="posts">
            <article class="post">
                <h2>First Blog Post</h2>
                <p class="meta">Posted on ${new Date().toLocaleDateString()}</p>
                <p>This is your first blog post. Click below to read more!</p>
                <button onclick="readMore(1)">Read More</button>
            </article>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 ${name}. All rights reserved.</p>
    </footer>
    
    <script src="app.js"></script>
</body>
</html>`;

    const js = `// ${name} Blog Application
const posts = [
    {
        id: 1,
        title: "First Blog Post",
        content: "This is the full content of your first blog post.",
        date: new Date().toISOString()
    }
];

function readMore(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        alert(post.title + "\\n\\n" + post.content);
    }
}

console.log("${name} Blog loaded!");`;

    const css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f5f5f5;
}

header {
    background: #2c3e50;
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

nav {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
}

nav ul {
    list-style: none;
    display: flex;
    gap: 2rem;
}

nav a {
    color: white;
    text-decoration: none;
    transition: color 0.3s;
}

nav a:hover {
    color: #3498db;
}

main {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 2rem;
}

.hero {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 3rem;
    border-radius: 10px;
    text-align: center;
    margin-bottom: 2rem;
}

.hero h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.post {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.post h2 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.meta {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

button {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: #2980b9;
}

footer {
    background: #2c3e50;
    color: white;
    text-align: center;
    padding: 2rem;
    margin-top: 3rem;
}`;

    return {
        "index.html": html,
        "app.js": js,
        "style.css": css
    };
};
