'use client';

import { useState, useEffect } from 'react';
// Iconoir ikonlarımızı ekledik
import { Plus, CheckCircleSolid, Circle, Trash, EditPencil, Calendar, SunLight, HalfMoon } from 'iconoir-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [yeniGorev, setYeniGorev] = useState(''); // inputText'i senin tarzına çevirdik
  const [secilenTarih, setSecilenTarih] = useState('');
  
  // Düzenleme kısmı için state'ler
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Sayfa açıldığında LocalStorage'dan eski verileri çekme
  useEffect(() => {
    const kayitliGorevler = localStorage.getItem('my_todos_minimal');
    const kayitliTema = localStorage.getItem('my_theme_minimal');

    if (kayitliGorevler) {
      try { 
        setTodos(JSON.parse(kayitliGorevler)); 
      } catch (e) {
        console.log("Veriler çekilirken hata oldu", e);
      }
    }
    
    if (kayitliTema) {
      setDarkMode(kayitliTema === 'dark');
    }
    setIsLoaded(true);
  }, []);

  // 2. Görevler veya tema değiştiğinde LocalStorage'ı güncelle
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_minimal', JSON.stringify(todos));
      localStorage.setItem('my_theme_minimal', darkMode ? 'dark' : 'light');
      
      // Tema renklerini body'ye basıyoruz
      if (darkMode) {
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#ffffff';
      } else {
        document.body.style.backgroundColor = '#f5f5f7';
        document.body.style.color = '#1d1d1f';
      }
    }
  }, [todos, darkMode, isLoaded]);

  // Yeni görev ekleme fonksiyonu
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Boşluk girildiyse engelle
    if (!yeniGorev.trim()) return;

    const eklenecekTodo: Todo = {
      id: Date.now(),
      text: yeniGorev.trim(),
      completed: false,
      dueDate: secilenTarih || undefined, // tarih boşsa undefined atıyoruz
    };

    setTodos([...todos, eklenecekTodo]);
    
    // Formu temizle
    setYeniGorev('');
    setSecilenTarih('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id: number) => {
    // id'si eşleşmeyenleri filtreleyip yeni listeyi kaydediyoruz
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, text: editText.trim() || todo.text };
        }
        return todo;
      })
    );
    setEditingId(null); // Düzenleme modundan çık
  };

  // Tarih hesaplama ve ekranda gösterme kısmı
  const tarihRozetiniGetir = (dateString?: string) => {
    if (!dateString) return null;
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    
    const hedefTarih = new Date(dateString);
    hedefTarih.setHours(0, 0, 0, 0);
    
    // Kaç gün kaldığını hesapla
    const farkZaman = hedefTarih.getTime() - bugun.getTime();
    const farkGun = Math.ceil(farkZaman / (1000 * 60 * 60 * 24));

    let rozetYazisi = "";
    let rozetRengi = "";

    if (farkGun < 0) { 
      rozetYazisi = `${Math.abs(farkGun)} gün geçti`; 
      rozetRengi = "#ff3b30"; // kırmızı
    } else if (farkGun === 0) { 
      rozetYazisi = "Bugün"; 
      rozetRengi = "#ff9500"; // turuncu
    } else if (farkGun === 1) { 
      rozetYazisi = "Yarın"; 
      rozetRengi = "#007aff"; // mavi
    } else { 
      rozetYazisi = `${farkGun} gün kaldı`; 
      rozetRengi = darkMode ? '#86868b' : '#86868b'; // gri
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: rozetRengi, fontWeight: 500 }}>
        <Calendar width={14} height={14} />
        {rozetYazisi}
      </span>
    );
  };

  // Sayfa yüklenmeden render etme ki hydration hatası vermesin
  if (!isLoaded) return null;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <main style={{ maxWidth: '600px', margin: '0 auto', background: darkMode ? '#1c1c1e' : '#ffffff', borderRadius: '20px', padding: '30px', boxShadow: darkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Görevlerim</h1>
            <p style={{ fontSize: '14px', color: '#86868b', margin: '4px 0 0 0' }}>
              {todos.filter(t => !t.completed).length} aktif görev
            </p>
          </div>
          
          {/* Tema Değiştirme Butonu */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#fff' : '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: darkMode ? '#2c2c2e' : '#f5f5f7', borderRadius: '12px', padding: '0 16px' }}>
            <Plus width={20} height={20} color="#86868b" />
            <input
              type="text"
              placeholder="Yeni görev ekle..."
              value={yeniGorev}
              onChange={(e) => setYeniGorev(e.target.value)}
              required
              style={{ width: '100%', padding: '16px 12px', background: 'transparent', border: 'none', outline: 'none', color: darkMode ? '#fff' : '#1d1d1f', fontSize: '16px' }}
            />
          </div>
          <input
            type="date"
            value={secilenTarih}
            onChange={(e) => setSecilenTarih(e.target.value)}
            style={{ padding: '0 16px', borderRadius: '12px', border: 'none', background: darkMode ? '#2c2c2e' : '#f5f5f7', color: darkMode ? '#fff' : '#1d1d1f', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          />
        </form>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {todos.map((todo) => (
            <li key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: darkMode ? '#2c2c2e' : '#f5f5f7', borderRadius: '14px', transition: 'all 0.2s ease', opacity: todo.completed ? 0.5 : 1 }}>
              
              <button onClick={() => toggleTodo(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: todo.completed ? '#007aff' : (darkMode ? '#86868b' : '#c7c7cc') }}>
                {todo.completed ? <CheckCircleSolid width={24} height={24} /> : <Circle width={24} height={24} />}
              </button>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                    autoFocus
                    style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #007aff', outline: 'none', color: darkMode ? '#fff' : '#1d1d1f', fontSize: '16px', padding: '2px 0' }}
                  />
                ) : (
                  <span style={{ fontSize: '16px', textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fff' : '#1d1d1f' }}>
                    {todo.text}
                  </span>
                )}
                
                {tarihRozetiniGetir(todo.dueDate)}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!todo.completed && (
                  <button onClick={() => startEditing(todo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#86868b' : '#8e8e93', padding: '4px' }}>
                    <EditPencil width={20} height={20} />
                  </button>
                )}
                <button onClick={() => deleteTodo(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff3b30', padding: '4px' }}>
                  <Trash width={20} height={20} />
                </button>
              </div>
            </li>
          ))}
          
          {todos.length === 0 && (
            <p style={{ textAlign: 'center', color: '#86868b', padding: '40px 0', fontSize: '15px' }}>Henüz görev eklenmemiş.</p>
          )}
        </ul>

      </main>
    </div>
  );
}