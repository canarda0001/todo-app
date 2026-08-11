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

  // web için sol menü filtreleri (hepsi, aktif, biten)
  const [filtre, setFiltre] = useState<'hepsi' | 'aktif' | 'biten'>('hepsi');

  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // sayfa açılınca local'den verileri topla
  useEffect(() => {
    // web versiyonu için key'leri değiştirdim ki eskilere karışmasın
    const kayitliGorevler = localStorage.getItem('my_todos_web');
    const kayitliTema = localStorage.getItem('my_theme_web');

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
      localStorage.setItem('my_todos_web', JSON.stringify(todos));
      localStorage.setItem('my_theme_web', darkMode ? 'dark' : 'light');
      
      document.body.style.margin = '0';
      document.body.style.overflow = 'hidden'; // web dashboard mantığı, sayfa değil sağ taraf scroll olacak
      document.body.style.transition = 'background 0.5s ease';

      // daha premium, oturaklı gradient renkleri
      if (darkMode) {
        document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
        document.body.style.color = '#f8fafc';
      } else {
        document.body.style.background = 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)';
        document.body.style.color = '#0f172a';
      }
    }
  }, [todos, darkMode, isLoaded]);

  const gorevEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniGorev.trim()) return;

    const eklenecek = {
      id: Date.now(),
      text: yeniGorev.trim(),
      completed: false,
      dueDate: secilenTarih || undefined,
    };

    setTodos([eklenecek, ...todos]); // yeniler en üste gelsin
    setYeniGorev('');
    setSecilenTarih('');
  };

  const tamamlaToggle = (id: number) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const gorevSil = (id: number) => {
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

  // filtreleme mantığı
  const gosterilecekGorevler = todos.filter(todo => {
    if (filtre === 'aktif') return !todo.completed;
    if (filtre === 'biten') return todo.completed;
    return true; // hepsi
  });

  // istatistikler
  const toplamSayi = todos.length;
  const aktifSayi = todos.filter(t => !t.completed).length;
  const bitenSayi = toplamSayi - aktifSayi;

  const tarihRozeti = (tarih?: string) => {
    if (!tarih) return null;
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const hedef = new Date(tarih);
    hedef.setHours(0, 0, 0, 0);
    
    const farkGun = Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));

    let yazi = "";
    let renk = "";

    if (farkGun < 0) { 
      yazi = `${Math.abs(farkGun)} gün geçti`; 
      renk = "#ef4444"; // premium kırmızı
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#f59e0b" : "#d97706"; 
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#3b82f6" : "#2563eb"; 
    } else { 
      yazi = `${farkGun} gün kaldı`; 
      renk = darkMode ? '#94a3b8' : '#64748b'; 
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: renk, fontWeight: 600, background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)', padding: '4px 10px', borderRadius: '8px' }}>
        <Calendar width={16} height={16} />
        {yazi}
      </span>
    );
  };

  if (!isLoaded) return null;

  // premium buzlu cam stili
  const camStili = {
    background: darkMode ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)', 
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
  };

  const inputCamStili = {
    background: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '16px',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* SOL MENÜ (SIDEBAR) - Web'e özel premium kısım */}
      <aside style={{ width: '280px', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px', ...camStili, borderRight: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.4)' }}>
        
        {/* Logo / Başlık */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Workspace</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#fff' : '#0f172a', display: 'flex' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </div>

        {/* Filtreler */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: darkMode ? '#64748b' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '10px', marginBottom: '4px' }}>Görünüm</p>
          
          {(['hepsi', 'aktif', 'biten'] as const).map((durum) => (
            <button
              key={durum}
              onClick={() => setFiltre(durum)}
              style={{
                background: filtre === durum ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)') : 'transparent',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                color: darkMode ? '#f8fafc' : '#0f172a',
                fontWeight: filtre === durum ? 600 : 500,
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
            >
              {durum === 'hepsi' ? 'Tüm Görevler' : durum === 'aktif' ? 'Bekleyenler' : 'Tamamlananlar'}
            </button>
          ))}
        </nav>

        {/* İstatistik Kartı */}
        <div style={{ marginTop: 'auto', padding: '20px', borderRadius: '16px', ...inputCamStili }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 16px 0', opacity: 0.8 }}>Özet</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>Toplam</span>
            <span style={{ fontWeight: 600 }}>{toplamSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>Aktif</span>
            <span style={{ fontWeight: 600, color: '#3b82f6' }}>{aktifSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', opacity: 0.7 }}>Biten</span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>{bitenSayi}</span>
          </div>
        </div>
      </aside>

      {/* SAĞ TARAF (ANA İÇERİK) */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 60px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-1px' }}>
              {filtre === 'hepsi' ? 'Tüm Görevler' : filtre === 'aktif' ? 'Yapılacaklar' : 'Bitenler'}
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.7, margin: 0 }}>Bugün harika işler çıkaracağız.</p>
          </header>

          {/* Ekleme Formu - Daha geniş ve ferah */}
          <form onSubmit={gorevEkle} style={{ display: 'flex', gap: '16px', marginBottom: '40px', padding: '12px', ...inputCamStili }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <Plus width={24} height={24} color={darkMode ? '#94a3b8' : '#64748b'} />
              <input
                type="text"
                placeholder="Ne yapman gerekiyor?"
                value={yeniGorev}
                onChange={(e) => setYeniGorev(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: darkMode ? '#fff' : '#0f172a', fontSize: '18px', fontWeight: 500 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', paddingLeft: '16px' }}>
              <input
                type="date"
                value={secilenTarih}
                onChange={(e) => setSecilenTarih(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: darkMode ? '#fff' : '#0f172a', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '15px' }}
              />
            </div>
            <button type="submit" style={{ background: darkMode ? '#fff' : '#0f172a', color: darkMode ? '#0f172a' : '#fff', border: 'none', padding: '0 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', transition: 'transform 0.1s' }}>
              Ekle
            </button>
          </form>

          {/* Görev Listesi - Grid veya Geniş Liste */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {gosterilecekGorevler.map((todo) => (
              <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', transition: 'all 0.3s ease', opacity: todo.completed ? 0.6 : 1, ...inputCamStili, borderLeft: todo.completed ? '4px solid #10b981' : (darkMode ? '4px solid rgba(255,255,255,0.1)' : '4px solid rgba(0,0,0,0.1)') }}>
                
                <button onClick={() => tamamlaToggle(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: todo.completed ? '#10b981' : (darkMode ? '#64748b' : '#94a3b8') }}>
                  {todo.completed ? <CheckCircleSolid width={32} height={32} /> : <Circle width={32} height={32} />}
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => duzenlemeyiKaydet(todo.id)}
                      onKeyDown={(e) => e.key === 'Enter' && duzenlemeyiKaydet(todo.id)}
                      autoFocus
                      style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: 'none', borderBottom: '2px solid #3b82f6', outline: 'none', color: darkMode ? '#fff' : '#0f172a', fontSize: '18px', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}
                    />
                  ) : (
                    <span style={{ fontSize: '18px', fontWeight: 600, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fff' : '#0f172a' }}>
                      {todo.text}
                    </span>
                  )}
                  
                  {tarihRozeti(todo.dueDate)}
                </div>

                <div style={{ display: 'flex', gap: '12px', opacity: todo.completed ? 0 : 1, transition: 'opacity 0.2s' }}>
                  <button onClick={() => duzenlemeyeBasla(todo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#94a3b8' : '#64748b', padding: '8px' }}>
                    <EditPencil width={24} height={24} />
                  </button>
                  <button onClick={() => gorevSil(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px' }}>
                    <Trash width={24} height={24} />
                  </button>
                </div>
              </div>
            ))}

            {gosterilecekGorevler.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.6 }}>
                <CheckCircleSolid width={64} height={64} color={darkMode ? '#fff' : '#0f172a'} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', fontWeight: 600 }}>Buralar tertemiz!</h3>
                <p style={{ margin: 0, fontSize: '15px' }}>Gösterilecek hiçbir görev kalmadı.</p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}