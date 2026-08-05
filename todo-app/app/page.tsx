'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

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
      dueDate: dueDate || undefined,
      priority: priority,
    };

    setTodos([...todos, newTodo]);
    setInputText('');
    setDueDate('');
    setPriority('medium');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const isCompleting = !todo.completed;
          
          if (isCompleting) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              zIndex: 9999
            });
          }
          
          return { ...todo, completed: isCompleting };
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text: editText.trim() || todo.text } : todo
    ));
    setEditingId(null);
  };

  const getDueDateBadge = (dateString?: string) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // 1. İSTEK: "Geçti" ve gün sayısı düzeltildi
    if (diffDays < 0) return <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#ffebee', color: '#c62828', fontWeight: 'bold' }}>🔴 {Math.abs(diffDays)} gün geçti</span>;
    if (diffDays === 0) return <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#fff8e1', color: '#f57f17', fontWeight: 'bold' }}>🟡 Bugün</span>;
    if (diffDays === 1) return <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#e3f2fd', color: '#1565c0', fontWeight: 'bold' }}>🔵 Yarın</span>;
    return <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}>📅 {diffDays} gün kaldı</span>;
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'high') return '🔴';
    if (p === 'medium') return '🟡';
    return '🟢';
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
          style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
        >
          {darkMode ? '☀️ Aydınlık' : '🌙 Karanlık'}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="todo-form" autoComplete="off" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Yeni görev ekle..."
          maxLength={200}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
          style={{ flex: '1 1 200px' }}
        />
        
        {/* 2. İSTEK: Öncelik kutusunun arka planı temaya bağlandı */}
        <select 
          value={priority} 
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          style={{ 
            padding: '8px', 
            borderRadius: '6px', 
            border: `1px solid ${darkMode ? '#555' : '#ccc'}`, 
            background: darkMode ? '#333' : '#fff', 
            color: darkMode ? '#fff' : '#000', 
            cursor: 'pointer' 
          }}
        >
          <option value="high">🔴 Yüksek</option>
          <option value="medium">🟡 Orta</option>
          <option value="low">🟢 Düşük</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ 
            padding: '8px', 
            borderRadius: '6px', 
            border: `1px solid ${darkMode ? '#555' : '#ccc'}`, 
            background: darkMode ? '#333' : '#fff', 
            color: darkMode ? '#fff' : '#000', 
            cursor: 'pointer' 
          }}
        />
        <button type="submit" aria-label="Görev ekle">Ekle</button>
      </form>

      <nav className="filters" aria-label="Görev filtreleri">
        <button type="button" className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Tümü</button>
        <button type="button" className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Aktif</button>
        <button type="button" className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Tamamlanan</button>
      </nav>

      <ul id="todo-list" className="todo-list">
        {filteredTodos.map((todo) => (
          <li
            key={todo.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1, gap: '8px' }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span onClick={() => toggleTodo(todo.id)} style={{ cursor: 'pointer', fontSize: '18px' }}>
                {todo.completed ? '✅' : '⭕'}
              </span>
              
              <span title="Öncelik">{getPriorityBadge(todo.priority)}</span>

              {/* 3. İSTEK: Düzenleme sadece kalem ikonuna basınca açılacak */}
              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                  autoFocus
                  style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: `1px solid ${darkMode ? '#555' : '#ccc'}`, outline: 'none', background: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000' }}
                />
              ) : (
                <>
                  <span style={{ flex: 1 }}>
                    {todo.text}
                  </span>
                  <button 
                    onClick={() => startEditing(todo)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                    title="Düzenle"
                  >
                    ✏️
                  </button>
                </>
              )}

              {getDueDateBadge(todo.dueDate)}
            </div>

            <button onClick={() => deleteTodo(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'red' }}>
              ❌
            </button>
          </li>
        ))}
      </ul>

      <footer className="footer">
        <span id="items-left">{activeCount} görev kaldı</span>
        <button type="button" onClick={clearCompleted} className="link-btn">Tamamlananları temizle</button>
      </footer>
    </main>
  );
}