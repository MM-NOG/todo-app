const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// データディレクトリとファイルの初期化
function initDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

// TODOの読み込み
function readTodos() {
  initDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// TODOの保存
function saveTodos(todos) {
  initDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

// API: 全TODO取得
app.get('/api/todos', (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

// API: TODO作成
app.post('/api/todos', (req, res) => {
  const todos = readTodos();
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// API: TODO更新
app.put('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'TODO not found' });
  }

  todos[index] = { ...todos[index], ...req.body };
  saveTodos(todos);
  res.json(todos[index]);
});

// API: TODO削除
app.delete('/api/todos/:id', (req, res) => {
  const todos = readTodos();
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'TODO not found' });
  }

  const deleted = todos.splice(index, 1);
  saveTodos(todos);
  res.json(deleted[0]);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`TODO App running at http://localhost:${PORT}`);
});
