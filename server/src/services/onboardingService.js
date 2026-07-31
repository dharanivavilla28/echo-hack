const basicTemplate = (title, body = '') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f8f7ff; color: #1a1a2e; line-height: 1.6; }
    .container { max-width: 1100px; margin: 0 auto; padding: 4rem 1.5rem; }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    p { color: #5f6078; font-size: 1.1rem; }
    .btn { display: inline-block; margin-top: 1.5rem; background: #6366f1; color: white; border: 0; border-radius: 8px; padding: 0.85rem 1.4rem; font-weight: 700; }
  </style>
</head>
<body>
  ${body || `<main class="container"><h1>${title}</h1><p>Start describing your idea to customize this project.</p></main>`}
</body>
</html>`;

const projectTemplates = {
  portfolio: {
    name: 'My Portfolio',
    label: 'Personal Portfolio',
    icon: '🎨',
    description: 'A personal portfolio to showcase work and skills',
    prompt: 'Build a personal portfolio website with a hero section, about me, skills, projects gallery, and contact form. Use a dark theme with accent colors and smooth animations. Include a navigation bar with smooth scrolling.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #1a1a2e; color: #eee; }
    .nav { position: fixed; width: 100%; background: rgba(26, 26, 46, 0.9); padding: 1rem; display: flex; justify-content: center; gap: 2rem; z-index: 100; }
    .nav a { color: #eee; text-decoration: none; font-size: 1rem; }
    .nav a:hover { color: #e94560; }
    .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 2rem; }
    .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; }
    .hero span { color: #e94560; }
    .hero p { font-size: 1.2rem; color: #aaa; }
    .section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
    .section h2 { font-size: 2.5rem; margin-bottom: 2rem; text-align: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; }
    .card { background: #16213e; padding: 2rem; border-radius: 8px; }
    .form-group { margin-bottom: 1rem; }
    input, textarea { width: 100%; padding: 0.8rem; background: #16213e; border: 1px solid #333; color: #eee; border-radius: 4px; }
    .btn { background: #e94560; color: white; border: none; padding: 0.8rem 2rem; border-radius: 4px; cursor: pointer; font-size: 1rem; }
  </style>
</head>
<body>
  <nav class="nav"><a href="#home">Home</a><a href="#about">About</a><a href="#skills">Skills</a><a href="#contact">Contact</a></nav>
  <section id="home" class="hero"><div><h1>Hi, I'm <span>John Doe</span></h1><p>Web Developer & Designer</p><br><button class="btn" onclick="document.getElementById('contact').scrollIntoView()">Get in Touch</button></div></section>
  <section id="about" class="section"><h2>About Me</h2><div class="grid"><div class="card"><h3>Who I Am</h3><p>I'm a passionate web developer building modern web applications.</p></div><div class="card"><h3>What I Do</h3><p>I specialize in full-stack development, UI/UX design, and responsive interfaces.</p></div></div></section>
  <section id="skills" class="section"><h2>My Skills</h2><div class="grid"><div class="card">HTML5 & CSS3</div><div class="card">JavaScript</div><div class="card">React</div><div class="card">Node.js</div></div></section>
  <section id="contact" class="section"><h2>Get in Touch</h2><form style="max-width: 600px; margin: 0 auto;"><div class="form-group"><input type="text" placeholder="Your Name"></div><div class="form-group"><input type="email" placeholder="Your Email"></div><div class="form-group"><textarea rows="4" placeholder="Your Message"></textarea></div><button type="submit" class="btn">Send Message</button></form></section>
</body>
</html>`,
  },
  ecommerce: {
    name: 'My Store',
    label: 'E-commerce Store',
    icon: '🛒',
    description: 'An online store with product listings, cart, and checkout',
    prompt: 'Build a modern e-commerce website with product cards, shopping cart, and checkout flow. Include a header with navigation, product grid with images and prices, cart sidebar, and a simple checkout form. Use a clean, professional design with a blue color scheme.',
    code: basicTemplate('My Store', `<header style="background:#2c3e50;color:white;padding:1rem 2rem;display:flex;justify-content:space-between;"><h1>My Store</h1><nav>Home &nbsp; Products &nbsp; Cart</nav></header><main class="container"><h1>Featured Products</h1><section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;margin-top:2rem;">${[1, 2, 3, 4].map((item) => `<article style="background:white;border-radius:8px;padding:1rem;box-shadow:0 8px 24px rgba(0,0,0,.08);"><div style="height:130px;background:#dbeafe;border-radius:6px;margin-bottom:1rem;"></div><h3>Product ${item}</h3><p>$${item * 20 + 9}.99</p><button class="btn">Add to Cart</button></article>`).join('')}</section></main>`),
  },
  blog: {
    name: 'My Blog',
    label: 'Blog Platform',
    icon: '✍️',
    description: 'A personal or professional blog with posts and comments',
    prompt: 'Build a blog platform with a homepage showing blog posts, individual post pages with comments, and an admin panel for creating posts. Use a clean, readable design with a serif font for content.',
    code: basicTemplate('My Blog', '<header style="background:#2c3e50;color:white;text-align:center;padding:3rem 1rem;"><h1>My Blog</h1><p style="color:#dbeafe;">Thoughts on technology and life</p></header><main class="container" style="font-family:Georgia,serif;"><article style="background:white;padding:2rem;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.06);"><h2>Welcome to My Blog</h2><p style="margin:.5rem 0 1rem;color:#888;">Posted on January 1, 2026</p><p>This is the first post on my blog. I will share thoughtful stories, tutorials, and product notes here.</p><section style="margin-top:2rem;border-top:1px solid #eee;padding-top:1rem;"><h3>Comments</h3><p>Great post. Looking forward to more.</p></section></article></main>'),
  },
  dashboard: {
    name: 'My Dashboard',
    label: 'Admin Dashboard',
    icon: '📊',
    description: 'A dashboard with charts, tables, and analytics',
    prompt: 'Build an admin dashboard with a sidebar navigation, statistics cards, a chart, and a data table. Use a dark sidebar with a light main content area. Include icons and modern design patterns.',
    code: basicTemplate('Admin Dashboard', '<aside style="position:fixed;left:0;top:0;width:240px;height:100%;background:#2c3e50;color:white;padding:2rem;"><h2>Dashboard</h2><p style="color:#dbeafe;margin-top:2rem;">Home<br>Analytics<br>Users<br>Settings</p></aside><main style="margin-left:240px;padding:2rem;"><h1>Dashboard</h1><section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin:2rem 0;"><div class="card"><h3>Total Users</h3><h2>1,234</h2></div><div class="card"><h3>Revenue</h3><h2>$12,345</h2></div><div class="card"><h3>Orders</h3><h2>567</h2></div></section><div class="card"><h2>Monthly Sales</h2><div style="height:180px;display:flex;align-items:flex-end;gap:1rem;"><span style="height:45%;width:40px;background:#6366f1;"></span><span style="height:70%;width:40px;background:#6366f1;"></span><span style="height:55%;width:40px;background:#6366f1;"></span><span style="height:90%;width:40px;background:#6366f1;"></span></div></div></main>'),
  },
  landing: {
    name: 'Landing Page',
    label: 'Landing Page',
    icon: '🚀',
    description: 'A conversion-focused landing page for a product or service',
    prompt: 'Build a modern landing page with a hero section, features grid, testimonials, and a call-to-action. Use a gradient hero background with a clean, professional design. Include a pricing section and FAQ.',
    code: basicTemplate('Landing Page', '<section style="min-height:76vh;background:linear-gradient(135deg,#667eea,#764ba2);color:white;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;"><div><h1>Launch Your Product</h1><p style="color:#eef2ff;">Build better products faster with our platform.</p><button class="btn" style="background:white;color:#6366f1;">Get Started Free</button></div></section><main class="container"><h2 style="text-align:center;font-size:2.25rem;">Features</h2><section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;margin-top:2rem;"><div><h3>Fast</h3><p>Lightning fast performance for your users.</p></div><div><h3>Secure</h3><p>Enterprise-grade security built in.</p></div><div><h3>Beautiful</h3><p>Modern designs your users will love.</p></div></section></main>'),
  },
  todo: {
    name: 'To-Do App',
    label: 'To-Do App',
    icon: '📋',
    description: 'A simple task management application',
    prompt: 'Build a to-do list app with add, complete, and delete functionality. Include a clean interface with task filtering (All, Active, Completed). Use a modern design with smooth animations and local storage for persistence.',
    code: basicTemplate('To-Do App', '<main style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;"><section style="background:white;width:min(420px,100%);padding:2rem;border-radius:8px;box-shadow:0 12px 32px rgba(0,0,0,.12);"><h1 style="font-size:2rem;text-align:center;">To-Do List</h1><div style="display:flex;gap:.5rem;margin:1.5rem 0;"><input id="task" placeholder="Add a new task..." style="flex:1;padding:.8rem;border:1px solid #ddd;border-radius:6px;"><button class="btn" onclick="addTodo()">Add</button></div><div><button>All</button> <button>Active</button> <button>Completed</button></div><ul id="list" style="list-style:none;margin-top:1rem;"></ul></section></main><script>function addTodo(){const input=document.getElementById("task");if(!input.value.trim())return;const li=document.createElement("li");li.style.cssText="padding:.7rem;border-bottom:1px solid #eee;display:flex;justify-content:space-between;";li.innerHTML="<span onclick=\\"this.style.textDecoration=this.style.textDecoration?\'\':\'line-through\'\\">"+input.value+"</span><button onclick=\\"this.parentElement.remove()\\">Delete</button>";document.getElementById("list").appendChild(li);input.value=""}</script>'),
  },
  custom: {
    name: 'Untitled Project',
    label: 'Custom Idea',
    icon: '✨',
    description: 'Build something unique',
    prompt: '',
    code: basicTemplate('Untitled Project'),
  },
};

export const getTemplate = (type = 'landing') => projectTemplates[type] || projectTemplates.landing;

export const getAllTypes = () => Object.entries(projectTemplates).map(([id, template]) => ({
  id,
  name: template.label,
  description: template.description,
  icon: template.icon,
}));

export const createProjectFromTemplate = (userId, type, customPrompt = '') => {
  const template = getTemplate(type);
  const prompt = String(customPrompt || '').trim() || template.prompt;

  return {
    userId,
    title: template.name,
    description: template.description,
    generatedCode: template.code,
    messages: prompt ? [{ role: 'user', content: prompt, timestamp: new Date() }] : [],
    versions: [],
    snapshots: [],
    currentVersion: 0,
  };
};
