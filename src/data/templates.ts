import { ProjectTemplate } from '../types';

export const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'task-flow',
    name: 'TaskFlow Pro App',
    description: 'Modern task management workspace with priority tags, status boards, and stats.',
    category: 'Productivity',
    files: [
      {
        id: 'index-html',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-6 font-sans">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <header class="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          TaskFlow Pro
        </h1>
        <p class="text-slate-400 text-sm mt-1">Autonomous sprint & daily task tracker</p>
      </div>
      <div id="stats" class="text-right">
        <span class="text-xs uppercase tracking-wider text-slate-500 font-semibold">Completed</span>
        <div id="stat-count" class="text-2xl font-bold text-emerald-400">0 / 0</div>
      </div>
    </header>

    <!-- Task Creator Form -->
    <div class="bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 shadow-lg mb-8">
      <form id="task-form" class="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          id="task-input" 
          placeholder="What needs to be engineered today?" 
          class="flex-1 bg-slate-900 border border-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500 transition"
          required
        />
        <select id="priority-select" class="bg-slate-900 border border-slate-700 px-3 py-3 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500">
          <option value="high">🔴 High Priority</option>
          <option value="medium" selected>🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <button 
          type="submit" 
          class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-indigo-500/20 transition flex items-center justify-center gap-2"
        >
          Add Task
        </button>
      </form>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-2 mb-6">
      <button class="filter-btn active px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600/20 text-indigo-400 border border-indigo-500/30" data-filter="all">All</button>
      <button class="filter-btn px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:text-slate-200 transition" data-filter="active">In Progress</button>
      <button class="filter-btn px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-400 hover:text-slate-200 transition" data-filter="completed">Completed</button>
    </div>

    <!-- Task List -->
    <ul id="task-list" class="space-y-3">
      <!-- Injected by script.js -->
    </ul>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'script-js',
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `// TaskFlow Pro State & Logic
let tasks = [
  { id: 1, text: 'Review pull request for Agent AI engine', priority: 'high', completed: true },
  { id: 2, text: 'Integrate Gemini API server-side streaming', priority: 'high', completed: false },
  { id: 3, text: 'Add interactive terminal emulator', priority: 'medium', completed: false },
  { id: 4, text: 'Optimize bundle size and tree shaking', priority: 'low', completed: false }
];

let currentFilter = 'all';

const taskList = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const statCount = document.getElementById('stat-count');
const filterBtns = document.querySelectorAll('.filter-btn');

function renderTasks() {
  taskList.innerHTML = '';
  
  const filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (filtered.length === 0) {
    taskList.innerHTML = \`
      <li class="p-8 text-center bg-slate-800/40 rounded-xl border border-dashed border-slate-700 text-slate-500">
        No tasks found in this view.
      </li>
    \`;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = \`p-4 rounded-xl border transition flex items-center justify-between \${
      task.completed 
        ? 'bg-slate-800/40 border-slate-800 text-slate-500' 
        : 'bg-slate-800 border-slate-700/80 text-slate-200 hover:border-slate-600'
    }\`;

    const badgeColors = {
      high: 'bg-red-500/10 text-red-400 border-red-500/20',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };

    li.innerHTML = \`
      <div class="flex items-center gap-3">
        <input 
          type="checkbox" 
          \${task.completed ? 'checked' : ''} 
          class="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
          onchange="toggleTask(\${task.id})"
        />
        <span class="\${task.completed ? 'line-through text-slate-500' : 'font-medium'}">
          \${escapeHtml(task.text)}
        </span>
        <span class="text-xs px-2 py-0.5 rounded border uppercase font-semibold \${badgeColors[task.priority]}">
          \${task.priority}
        </span>
      </div>
      <button 
        onclick="deleteTask(\${task.id})" 
        class="text-slate-500 hover:text-red-400 text-sm font-semibold transition px-2 py-1"
      >
        Delete
      </button>
    \`;
    taskList.appendChild(li);
  });

  const completedCount = tasks.filter(t => t.completed).length;
  statCount.textContent = \`\${completedCount} / \${tasks.length}\`;
  console.log('[TaskFlow] Rendered ' + tasks.length + ' tasks. Completed: ' + completedCount);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.toggleTask = function(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  renderTasks();
};

window.deleteTask = function(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
};

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text,
    priority: prioritySelect.value,
    completed: false
  };

  tasks.unshift(newTask);
  taskInput.value = '';
  renderTasks();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active', 'bg-indigo-600/20', 'text-indigo-400', 'border-indigo-500/30');
      b.classList.add('bg-slate-800', 'text-slate-400');
    });
    btn.classList.add('active', 'bg-indigo-600/20', 'text-indigo-400', 'border-indigo-500/30');
    btn.classList.remove('bg-slate-800', 'text-slate-400');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Initialize on load
renderTasks();
`,
      },
      {
        id: 'styles-css',
        name: 'styles.css',
        path: 'styles.css',
        language: 'css',
        content: `/* Custom animations and polish */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

#task-list li {
  animation: slideDown 0.2s ease-out;
}
`,
      },
      {
        id: 'readme-md',
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        content: `# TaskFlow Pro Workspace

A clean, responsive sprint & task management application built with vanilla JavaScript, modern DOM manipulation, and Tailwind CSS.

### Features
- Real-time task creation with Priority indicators (High, Medium, Low)
- Filter states (All, In Progress, Completed)
- Dynamic completion stats calculator
- Sandboxed execution with zero dependencies

### Engineered with Agent AI Code GPT
Use the Agent Chat panel on the right to:
- *"Add local storage persistence so tasks stay saved"*
- *"Add a due date picker and filter by date"*
- *"Refactor this application into a modern React component"*
`,
      }
    ]
  },
  {
    id: 'space-shooter',
    name: 'Neon Space Arcade',
    description: 'Playable 60fps HTML5 Canvas space battle with particle effects and scoring.',
    category: 'Gaming',
    files: [
      {
        id: 'index-html',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Neon Defender 2099</title>
  <style>
    body {
      margin: 0;
      background: #060913;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, sans-serif;
      overflow: hidden;
    }
    #game-container {
      position: relative;
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.2);
      border-radius: 12px;
      overflow: hidden;
      border: 2px solid #2d3748;
    }
    canvas {
      display: block;
      background: #080c18;
    }
    #ui {
      position: absolute;
      top: 15px;
      left: 15px;
      right: 15px;
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 18px;
      text-shadow: 0 0 10px rgba(0,255,255,0.7);
      pointer-events: none;
    }
    #instructions {
      margin-top: 15px;
      color: #718096;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="game-container">
    <div id="ui">
      <span id="score-display">SCORE: 0</span>
      <span id="lives-display">LIVES: ❤️❤️❤️</span>
    </div>
    <canvas id="canvas" width="600" height="500"></canvas>
  </div>
  <div id="instructions">
    Use <b>A/D</b> or <b>Left/Right Arrows</b> to move, <b>Spacebar</b> to shoot neon lasers.
  </div>
  <script src="game.js"></script>
</body>
</html>`,
      },
      {
        id: 'game-js',
        name: 'game.js',
        path: 'game.js',
        language: 'javascript',
        content: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const livesDisplay = document.getElementById('lives-display');

let score = 0;
let lives = 3;
let gameOver = false;

// Player
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 50,
  width: 40,
  height: 25,
  speed: 6,
  color: '#00f0ff'
};

const keys = {};
const bullets = [];
const enemies = [];
const particles = [];

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space' && !gameOver) {
    shootBullet();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

function shootBullet() {
  bullets.push({
    x: player.x + player.width / 2 - 3,
    y: player.y,
    width: 6,
    height: 14,
    speed: 8,
    color: '#ff007f'
  });
}

function spawnEnemy() {
  if (gameOver) return;
  const size = 30;
  enemies.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size: size,
    speed: 1.5 + Math.random() * 2,
    color: '#ffcc00'
  });
}

setInterval(spawnEnemy, 1200);

function createExplosion(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      radius: Math.random() * 3 + 1,
      alpha: 1,
      color
    });
  }
}

function update() {
  if (gameOver) return;

  // Move player
  if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) {
    player.x -= player.speed;
  }
  if ((keys['ArrowRight'] || keys['KeyD']) && player.x + player.width < canvas.width) {
    player.x += player.speed;
  }

  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed;
    if (bullets[i].y < -20) bullets.splice(i, 1);
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.y += enemy.speed;

    // Bullet collision
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (
        b.x < enemy.x + enemy.size &&
        b.x + b.width > enemy.x &&
        b.y < enemy.y + enemy.size &&
        b.y + b.height > enemy.y
      ) {
        createExplosion(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color);
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 100;
        scoreDisplay.textContent = 'SCORE: ' + score;
        break;
      }
    }

    // Player collision or offscreen
    if (enemy.y + enemy.size > player.y && enemy.x < player.x + player.width && enemy.x + enemy.size > player.x) {
      createExplosion(player.x + 20, player.y + 10, '#00f0ff');
      enemies.splice(i, 1);
      lives--;
      livesDisplay.textContent = 'LIVES: ' + '❤️'.repeat(Math.max(0, lives));
      if (lives <= 0) {
        gameOver = true;
      }
    } else if (enemy.y > canvas.height + 20) {
      enemies.splice(i, 1);
    }
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.03;
    if (p.alpha <= 0) particles.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player spaceship
  ctx.shadowBlur = 15;
  ctx.shadowColor = player.color;
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Draw bullets
  for (const b of bullets) {
    ctx.shadowColor = b.color;
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }

  // Draw enemies
  for (const e of enemies) {
    ctx.shadowColor = e.color;
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.size, e.size);
  }

  // Draw particles
  for (const p of particles) {
    ctx.globalAlpha = p.alpha;
    ctx.shadowColor = p.color;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  ctx.shadowBlur = 0;

  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff0055';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
console.log('[Neon Defender] Game engine booted successfully at 60fps.');
`,
      }
    ]
  },
  {
    id: 'crypto-tracker',
    name: 'Apex Crypto Tracker',
    description: 'Financial asset dashboard with simulated live websocket ticks and profit calculator.',
    category: 'Finance',
    files: [
      {
        id: 'index-html',
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Apex Crypto Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen p-8">
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8 border-b border-gray-800 pb-5">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          ⚡ Apex Markets
        </h1>
        <p class="text-gray-400 text-sm mt-1">Live algorithmic asset ticker</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="text-xs uppercase font-mono text-emerald-400 tracking-wider">Feed Live</span>
      </div>
    </div>

    <!-- Ticker Grid -->
    <div id="crypto-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Populated via script.js -->
    </div>

    <!-- Interactive Portfolio Calculator -->
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-200">Portfolio Simulation</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs uppercase text-gray-400 mb-1">Select Asset</label>
          <select id="asset-select" class="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-gray-200">
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs uppercase text-gray-400 mb-1">Holdings Quantity</label>
          <input type="number" id="asset-qty" value="1.5" step="0.1" class="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-gray-200" />
        </div>
        <div>
          <label class="block text-xs uppercase text-gray-400 mb-1">Estimated Value</label>
          <div id="total-val" class="text-2xl font-bold text-indigo-400 pt-1">$0.00</div>
        </div>
      </div>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'script-js',
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `const assets = [
  { symbol: 'BTC', name: 'Bitcoin', price: 92450.00, change: 3.42, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', price: 3410.50, change: -1.15, icon: 'Ξ' },
  { symbol: 'SOL', name: 'Solana', price: 188.20, change: 8.75, icon: '◎' }
];

const grid = document.getElementById('crypto-grid');
const assetSelect = document.getElementById('asset-select');
const assetQty = document.getElementById('asset-qty');
const totalVal = document.getElementById('total-val');

function renderGrid() {
  grid.innerHTML = '';
  assets.forEach(asset => {
    const card = document.createElement('div');
    const isUp = asset.change >= 0;
    card.className = 'bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition';
    card.innerHTML = \`
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl">\${asset.icon}</span>
          <div>
            <div class="font-bold text-white">\${asset.name}</div>
            <div class="text-xs text-gray-500 font-mono">\${asset.symbol}</div>
          </div>
        </div>
        <span class="text-xs font-semibold px-2 py-1 rounded \${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}">
          \${isUp ? '+' : ''}\${asset.change.toFixed(2)}%
        </span>
      </div>
      <div class="text-2xl font-mono font-bold text-white" id="price-\${asset.symbol}">
        $\${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
    \`;
    grid.appendChild(card);
  });
  updateCalculator();
}

function updateCalculator() {
  const selectedSymbol = assetSelect.value;
  const qty = parseFloat(assetQty.value) || 0;
  const asset = assets.find(a => a.symbol === selectedSymbol);
  if (asset) {
    const total = qty * asset.price;
    totalVal.textContent = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

// Simulate market ticks
setInterval(() => {
  assets.forEach(asset => {
    const delta = (Math.random() - 0.49) * (asset.price * 0.002);
    asset.price += delta;
  });
  renderGrid();
}, 2500);

assetSelect.addEventListener('change', updateCalculator);
assetQty.addEventListener('input', updateCalculator);

renderGrid();
console.log('[Apex Markets] Ticker initialized.');
`,
      }
    ]
  }
];
