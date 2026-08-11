'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircleSolid, Circle, Trash, EditPencil, Calendar, SunLight, HalfMoon } from 'iconoir-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [yeniGorev, setYeniGorev] = useState('');
  const [secilenTarih, setSecilenTarih] = useState('');
  
  // edit işleri
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // sayfa açılınca local'den verileri topla
  useEffect(() => {
    // başka isim verdim ki eski tasarımla çakışmasın
    const kayitliGorevler = localStorage.getItem('my_todos_glass');
    const kayitliTema = localStorage.getItem('my_theme_glass');

    if (kayitliGorevler) {
      try { 
        setTodos(JSON.parse(kayitliGorevler)); 
      } catch (e) {
        console.log("Veri çekerken gümledik:", e);
      }
    }
    
    if (kayitliTema) {
      setDarkMode(kayitliTema === 'dark');
    }
    setIsLoaded(true);
  }, []);

  // arka planı ve gradienti ayarlıyoruz
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_glass', JSON.stringify(todos));
      localStorage.setItem('my_theme_glass', darkMode ? 'dark' : 'light');
      
      document.body.style.minHeight = '100vh';
      document.body.style.margin = '0';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.transition = 'background 0.5s ease';

      // gradient renkleri
      if (darkMode) {
        document.body.style.background = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        document.body.style.color = '#ffffff';
      } else {
        document.body.style.background = 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)';
        document.body.style.color = '#1d1d1f';
      }
    }
  }, [todos, darkMode, isLoaded]);

  const gorevEkle = (e: React.FormEvent) => {
    e.preventDefault();
    
    // boş eklemeye çalışırsa sal
    if (!yeniGorev.trim()) return;

    const eklenecek = {
      id: Date.now(),
      text: yeniGorev.trim(),
      completed: false,
      dueDate: secilenTarih || undefined,
    };

    setTodos([...todos, eklenecek]);
    setYeniGorev('');
    setSecilenTarih('');
  };

  const tamamlaToggle = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed };
        }
        return todo;
      })
    );
  };

  const gorevSil = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const duzenlemeyeBasla = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const duzenlemeyiKaydet = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, text: editText.trim() || todo.text };
        }
        return todo;
      })
    );
    setEditingId(null);
  };

  // tarihi afilli gösterme fonksiyonu
  const tarihRozeti = (tarih?: string) => {
    if (!tarih) return null;
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0); // saat farkından patlamasın diye sıfırlıyoruz
    const hedef = new Date(tarih);
    hedef.setHours(0, 0, 0, 0);
    
    const farkGun = Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));

    let yazi = "";
    let renk = "";

    if (farkGun < 0) { 
      yazi = `${Math.abs(farkGun)} gün geçti`; 
      renk = "#ff4757"; // canlı kırmızı
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#ffa502" : "#ff7f50"; 
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#70a1ff" : "#1e90ff"; 
    } else { 
      yazi = `${farkGun} gün kaldı`; 
      renk = darkMode ? '#dfe4ea' : '#57606f'; 
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: renk, fontWeight: 600 }}>
        <Calendar width={14} height={14} />
        {yazi}
      </span>
    );
  };

  // hydration hatası yememek için
  if (!isLoaded) return null;

  // internetten bulduğum efsane buzlu cam CSS'i
  const camStili = {
    background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)', 
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    borderRadius: '24px',
  };

  const inputCamStili = {
    background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(8px)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '14px',
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '30px', ...camStili }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(255,255,255,0.5)' }}>Görevlerim</h1>
            <p style={{ fontSize: '14px', opacity: 0.8, margin: '4px 0 0 0', fontWeight: 500 }}>
              {todos.filter(t => !t.completed).length} aktif görev
            </p>
          </div>
          
          {/* Gece/Gündüz butonu */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: darkMode ? '#fff' : '#1d1d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', borderRadius: '50%', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </header>

        <form onSubmit={gorevEkle} style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', ...inputCamStili }}>
            <Plus width={20} height={20} color={darkMode ? '#ccc' : '#555'} />
            <input
              type="text"
              placeholder="Yeni görev ekle..."
              value={yeniGorev}
              onChange={(e) => setYeniGorev(e.target.value)}
              required
              style={{ width: '100%', padding: '16px 12px', background: 'transparent', border: 'none', outline: 'none', color: darkMode ? '#fff' : '#1d1d1f', fontSize: '16px', fontWeight: 500 }}
            />
          </div>
          <input
            type="date"
            value={secilenTarih}
            onChange={(e) => setSecilenTarih(e.target.value)}
            style={{ padding: '0 16px', color: darkMode ? '#fff' : '#1d1d1f', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, ...inputCamStili }}
          />
        </form>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {todos.map((todo) => (
            <li key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', transition: 'all 0.3s ease', opacity: todo.completed ? 0.6 : 1, ...inputCamStili }}>
              
              <button onClick={() => tamamlaToggle(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: todo.completed ? (darkMode ? '#70a1ff' : '#1e90ff') : (darkMode ? '#a4b0be' : '#747d8c') }}>
                {todo.completed ? <CheckCircleSolid width={26} height={26} /> : <Circle width={26} height={26} />}
              </button>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => duzenlemeyiKaydet(todo.id)}
                    onKeyDown={(e) => e.key === 'Enter' && duzenlemeyiKaydet(todo.id)}
                    autoFocus
                    style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '2px solid #1e90ff', outline: 'none', color: darkMode ? '#fff' : '#1d1d1f', fontSize: '16px', padding: '4px 8px', borderRadius: '4px' }}
                  />
                ) : (
                  <span style={{ fontSize: '16px', fontWeight: 500, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fff' : '#1d1d1f' }}>
                    {todo.text}
                  </span>
                )}
                
                {tarihRozeti(todo.dueDate)}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!todo.completed && (
                  <button onClick={() => duzenlemeyeBasla(todo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#ced6e0' : '#57606f', padding: '4px', transition: 'transform 0.2s' }}>
                    <EditPencil width={22} height={22} />
                  </button>
                )}
                <button onClick={() => gorevSil(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff4757', padding: '4px', transition: 'transform 0.2s' }}>
                  <Trash width={22} height={22} />
                </button>
              </div>
            </li>
          ))}
          
          {todos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.7 }}>
              <CheckCircleSolid width={48} height={48} color={darkMode ? '#fff' : '#1d1d1f'} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0, fontWeight: 500 }}>Görev kalmadı, yatışşş!</p>
            </div>
          )}
        </ul>

      </main>
    </div>
  );
}