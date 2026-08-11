'use client';

import { useState, useEffect } from 'react';
// iconoir ikonlarimiz yine sahnede
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
  
  // duzenleme isleri
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // sol menudeki gorumum filtresi
  const [filtre, setFiltre] = useState<'hepsi' | 'aktif' | 'biten'>('hepsi');

  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Ilk acilista eski verileri hafizadan toparliyoruz
  useEffect(() => {
    // matcha temasi icin ozel key verdik
    const kayitliGorevler = localStorage.getItem('my_todos_matcha');
    const kayitliTema = localStorage.getItem('my_theme_matcha');

    if (kayitliGorevler) {
      try { 
        setTodos(JSON.parse(kayitliGorevler)); 
      } catch (e) {
        console.log("Veri cekerken ufak bi takildik:", e);
      }
    }
    if (kayitliTema) {
      setDarkMode(kayitliTema === 'dark');
    }
    setIsLoaded(true); // sayfa render olana kadar bekle diyoruz
  }, []);

  // 2. Arka plan ve organik Zen renk paleti ayarlari
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_matcha', JSON.stringify(todos));
      localStorage.setItem('my_theme_matcha', darkMode ? 'dark' : 'light');
      
      document.body.style.margin = '0';
      document.body.style.overflow = 'hidden'; 
      document.body.style.transition = 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      // Doga ve Matcha yesili tonlari
      if (darkMode) {
        // Koyu orman yesili ve komur grisi
        document.body.style.background = 'linear-gradient(135deg, #1c1917 0%, #14532d 100%)';
        document.body.style.color = '#fef3c7'; // acik krem yazi
      } else {
        // Acik krem ve ferah matcha yesili
        document.body.style.background = 'linear-gradient(135deg, #fdfbf7 0%, #ecfccb 100%)';
        document.body.style.color = '#1c1917'; // koyu kahve/gri yazi
      }
    }
  }, [todos, darkMode, isLoaded]);

  const gorevEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniGorev.trim()) return; // boslugu engelle

    const yeniItem = {
      id: Date.now(),
      text: yeniGorev.trim(),
      completed: false,
      dueDate: secilenTarih || undefined,
    };

    setTodos([yeniItem, ...todos]); 
    setYeniGorev('');
    setSecilenTarih('');
  };

  const durumuDegistir = (id: number) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const goreviUcur = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const duzenlemeyeBasla = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const duzenlemeyiKaydet = (id: number) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, text: editText.trim() || todo.text } : todo));
    setEditingId(null);
  };

  const gosterilecekler = todos.filter(todo => {
    if (filtre === 'aktif') return !todo.completed;
    if (filtre === 'biten') return todo.completed;
    return true; 
  });

  const toplamSayi = todos.length;
  const aktifSayi = todos.filter(t => !t.completed).length;
  const bitenSayi = toplamSayi - aktifSayi;

  // Organik renklere uygun tarih rozeti
  const afilliTarih = (tarih?: string) => {
    if (!tarih) return null;
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0); 
    const hedef = new Date(tarih);
    hedef.setHours(0, 0, 0, 0);
    
    const farkGun = Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));

    let yazi = "";
    let renk = "";

    // Doga tonlarina uygun rozetler
    if (farkGun < 0) { 
      yazi = `${Math.abs(farkGun)} gün geçti`; 
      renk = "#ea580c"; // toprak turuncusu/kirmizisi
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#bef264" : "#65a30d"; // canli limon/matcha yesili
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#6ee7b7" : "#059669"; // nane yesili
    } else { 
      yazi = `${farkGun} gün kaldı`; 
      renk = darkMode ? '#a8a29e' : '#78716c'; // tas grisi
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: renk, fontWeight: 700, background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.6)', padding: '4px 10px', borderRadius: '8px', border: `1px solid ${renk}44` }}>
        <Calendar width={16} height={16} />
        {yazi}
      </span>
    );
  };

  if (!isLoaded) return null;

  // Zen stili yumusak cam efekti
  const anaCamStili = {
    background: darkMode ? 'rgba(20, 83, 45, 0.3)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: darkMode ? '1px solid rgba(190, 242, 100, 0.1)' : '1px solid rgba(77, 124, 15, 0.1)',
    boxShadow: darkMode ? '0 0 40px rgba(0, 0, 0, 0.3)' : '0 10px 40px rgba(0, 0, 0, 0.03)'
  };

  const formCamStili = {
    background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(12px)',
    border: darkMode ? '1px solid rgba(190, 242, 100, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '16px'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* SOL TARAFTAKI MENU KISMI */}
      <aside style={{ width: '280px', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px', ...anaCamStili }}>
        
        {/* Logo ve tema butonu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', background: darkMode ? 'linear-gradient(to right, #bef264, #fef3c7)' : 'linear-gradient(to right, #4d7c0f, #1c1917)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ZenTask</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#bef264' : '#4d7c0f', display: 'flex' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </div>

        {/* Filtre sekmeleri */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: darkMode ? '#a8a29e' : '#78716c', textTransform: 'uppercase', letterSpacing: '2px', paddingLeft: '10px', marginBottom: '4px' }}>Odak</p>
          
          {(['hepsi', 'aktif', 'biten'] as const).map((durum) => (
            <button
              key={durum}
              onClick={() => setFiltre(durum)}
              style={{
                background: filtre === durum ? (darkMode ? 'rgba(190, 242, 100, 0.1)' : 'rgba(77, 124, 15, 0.08)') : 'transparent',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                color: filtre === durum ? (darkMode ? '#bef264' : '#4d7c0f') : (darkMode ? '#d6d3d1' : '#57534e'),
                fontWeight: filtre === durum ? 700 : 500,
                transition: 'all 0.3s ease',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {durum === 'hepsi' ? 'Tüm Notlar' : durum === 'aktif' ? 'Bekleyenler' : 'Bitenler'}
            </button>
          ))}
        </nav>

        {/* Istatistik Paneli */}
        <div style={{ marginTop: 'auto', padding: '20px', ...formCamStili }}>
          <h3 style={{ fontSize: '12px', margin: '0 0 16px 0', color: darkMode ? '#bef264' : '#4d7c0f', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Zihin Özeti</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#a8a29e' : '#78716c', fontWeight: 500 }}>Toplam</span>
            <span style={{ fontWeight: 700 }}>{toplamSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#a8a29e' : '#78716c', fontWeight: 500 }}>Aktif</span>
            <span style={{ fontWeight: 700, color: darkMode ? '#bef264' : '#4d7c0f' }}>{aktifSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#a8a29e' : '#78716c', fontWeight: 500 }}>Biten</span>
            <span style={{ fontWeight: 700, opacity: 0.5 }}>{bitenSayi}</span>
          </div>
        </div>
      </aside>

      {/* SAG TARAF - Ana not listesi */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '50px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-1px' }}>
              {filtre === 'hepsi' ? 'Tüm Notlar' : filtre === 'aktif' ? 'Bekleyenler' : 'Bitenler'}
            </h2>
            <p style={{ fontSize: '16px', color: darkMode ? '#a8a29e' : '#78716c', margin: 0, fontWeight: 500 }}>Zihnini boşalt, buraya yaz.</p>
          </header>

          {/* Ekleme formu */}
          <form onSubmit={gorevEkle} style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '50px', 
            padding: '14px', 
            ...formCamStili,
            boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <Plus width={24} height={24} color={darkMode ? '#bef264' : '#4d7c0f'} />
              <input
                type="text"
                placeholder="Aklındakini yazıya dök..."
                value={yeniGorev}
                onChange={(e) => setYeniGorev(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: darkMode ? '#fef3c7' : '#1c1917', fontSize: '17px', fontWeight: 500 }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', paddingLeft: '16px' }}>
              <input
                type="date"
                value={secilenTarih}
                onChange={(e) => setSecilenTarih(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: darkMode ? '#a8a29e' : '#78716c', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '14px' }}
              />
            </div>
            
            <button type="submit" style={{ background: darkMode ? 'rgba(190, 242, 100, 0.15)' : '#ecfccb', color: darkMode ? '#bef264' : '#3f6212', border: darkMode ? '1px solid rgba(190, 242, 100, 0.3)' : '1px solid #d9f99d', padding: '0 28px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}>
              Ekle
            </button>
          </form>

          {/* Todo Listesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {gosterilecekler.map((todo) => (
              <div key={todo.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px', 
                padding: '22px 28px', 
                opacity: todo.completed ? 0.5 : 1, 
                transition: 'all 0.3s ease',
                background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(0, 0, 0, 0.03)',
                borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(0, 0, 0, 0.03)',
                borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.03)' : '1px solid rgba(0, 0, 0, 0.03)',
                borderLeft: todo.completed ? '4px solid #78716c' : (darkMode ? '4px solid #bef264' : '4px solid #4d7c0f'),
                borderRadius: '16px'
              }}>
                
                <button onClick={() => durumuDegistir(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: todo.completed ? (darkMode ? '#78716c' : '#a8a29e') : (darkMode ? '#bef264' : '#4d7c0f') }}>
                  {todo.completed ? <CheckCircleSolid width={28} height={28} /> : <Circle width={28} height={28} />}
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => duzenlemeyiKaydet(todo.id)}
                      onKeyDown={(e) => e.key === 'Enter' && duzenlemeyiKaydet(todo.id)}
                      autoFocus
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', borderBottom: `2px solid ${darkMode ? '#bef264' : '#4d7c0f'}`, outline: 'none', color: darkMode ? '#fef3c7' : '#1c1917', fontSize: '17px', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}
                    />
                  ) : (
                    <span style={{ fontSize: '17px', fontWeight: 500, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fef3c7' : '#1c1917' }}>
                      {todo.text}
                    </span>
                  )}
                  
                  {afilliTarih(todo.dueDate)}
                </div>

                <div style={{ display: 'flex', gap: '8px', opacity: todo.completed ? 0 : 1, transition: 'opacity 0.2s' }}>
                  <button onClick={() => duzenlemeyeBasla(todo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#bef264' : '#4d7c0f', padding: '8px' }}>
                    <EditPencil width={22} height={22} />
                  </button>
                  <button onClick={() => goreviUcur(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ea580c', padding: '8px' }}>
                    <Trash width={22} height={22} />
                  </button>
                </div>
              </div>
            ))}

            {/* Liste bosken cikacak yazi */}
            {gosterilecekler.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.6 }}>
                <CheckCircleSolid width={56} height={56} color={darkMode ? '#bef264' : '#4d7c0f'} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 500, color: darkMode ? '#fef3c7' : '#1c1917' }}>Yapılacak hiçbir şey kalmadı, anın tadını çıkar.</h3>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}