'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Yerel depodan verileri ve temayı çekme
  useEffect(() => {
    const savedTodos = localStorage.getItem('my_todos');
    const savedTheme = localStorage.getItem('my_theme');

    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (e) {}
    }
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    setIsLoaded(true);
  }, []);

  // 2. Görevler değiştikçe kaydetme
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // 3. Tema değiştikçe hem LocalStorage'a kaydet hem de doğrudan <body> etiketine sınıf ekle/çıkar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_theme', darkMode ? 'dark' : 'light');
      if (darkMode) {
        document.body.classList.add('dark-mode-wrapper');
      } else {
        document.body.classList.remove('dark-mode-wrapper');
      }
    }
  }, [darkMode, isLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      text: inputText.trim(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputText('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;

  if (!isLoaded) return null;

  return (
    <main className="app">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Görevlerim</h1>
          <p className="subtitle">Günlük işlerini takip et</p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)'
          }}
        >
          {darkMode ? '☀️ Aydınlık' : '🌙 Karanlık'}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="todo-form" autoComplete="off">
        <input
          id="todo-input"
          type="text"
          placeholder="Yeni görev ekle..."
          maxLength={200}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
        />
        <button type="submit" aria-label="Görev ekle">
          Ekle
        </button>
      </form>

      <nav className="filters" aria-label="Görev filtreleri">
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Aktif
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Tamamlanan
        </button>
      </nav>

      <ul id="todo-list" className="todo-list">
        {filteredTodos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              textDecoration: todo.completed ? 'line-through' : 'none',
              opacity: todo.completed ? 0.6 : 1,
            }}
          >
            <span
              onClick={() => toggleTodo(todo.id)}
              style={{ cursor: 'pointer', flex: 1 }}
            >
              {todo.completed ? '✅ ' : '⭕ '} {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'red',
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      <footer className="footer">
        <span id="items-left">{activeCount} görev kaldı</span>
        <button
          type="button"
          onClick={clearCompleted}
          className="link-btn"
        >
          Tamamlananları temizle
        </button>
      </footer>
    </main>
  );
} 