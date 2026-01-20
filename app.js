// State
let todos = [];
let currentFilter = 'all';

// DOM Elements
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const countEl = document.getElementById('todo-count');
const clearBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// LocalStorage functions
const STORAGE_KEY = 'todo-app-data';

function loadTodos() {
  const data = localStorage.getItem(STORAGE_KEY);
  todos = data ? JSON.parse(data) : [];
  render();
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(newTodo);
  saveTodos();
  render();
}

function updateTodo(id, updates) {
  const index = todos.findIndex(t => t.id === id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updates };
    saveTodos();
  }
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

// Filter todos
function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter(t => !t.completed);
    case 'completed':
      return todos.filter(t => t.completed);
    default:
      return todos;
  }
}

// Render
function render() {
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    list.innerHTML = '<li class="empty-message">タスクがありません</li>';
  } else {
    list.innerHTML = filtered.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? 'checked' : ''}
        >
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="todo-delete">削除</button>
      </li>
    `).join('');
  }

  // Update count
  const activeCount = todos.filter(t => !t.completed).length;
  countEl.textContent = `${activeCount} 件の未完了タスク`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event Listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addTodo(text);
    input.value = '';
  }
});

list.addEventListener('click', (e) => {
  const item = e.target.closest('.todo-item');
  if (!item) return;

  const id = parseInt(item.dataset.id);

  if (e.target.classList.contains('todo-checkbox')) {
    const completed = e.target.checked;
    updateTodo(id, { completed });
  }

  if (e.target.classList.contains('todo-delete')) {
    deleteTodo(id);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
});

// Initial load
loadTodos();
