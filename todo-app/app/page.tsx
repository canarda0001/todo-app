'use client';

import { useState, useEffect } from 'react';
// Iconoir ikonlarımızı çekiyoruz
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
  
  // düzenleme (edit) moduna geçmek için tuttuğumuz state'ler
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // sol menüdeki filtreleri kontrol etmek için
  const [filtre, setFiltre] = useState<'hepsi' | 'aktif' | 'biten'>('hepsi');

  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Sayfa ilk açıldığında local'den eski verileri çek
  useEffect(() => {
    // vip versiyon için key'leri değiştirdim ki eskilerle çakışıp patlamasın
    const kayitliGorevler = localStorage.getItem('my_todos_vip');
    const kayitliTema = localStorage.getItem('my_theme_vip');

    if (kayitliGorevler) {
      try { 
        setTodos(JSON.parse(kayitliGorevler)); 
      } catch (e) {
        console.log("Verileri çekerken gümledik:", e);
      }
    }
    
    if (kayitliTema) {
      setDarkMode(kayitliTema === 'dark');
    }
    setIsLoaded(true); // hydration hatası yememek için sayfa yüklendi diyoruz
  }, []);

  // 2. Arka planı ve o premium VIP gradienti ayarlıyoruz
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_vip', JSON.stringify(todos));
      localStorage.setItem('my_theme_vip', darkMode ? 'dark' : 'light');
      
      // web görünümü için body ayarları (sayfa kaymasın diye overflow hidden)
      document.body.style.margin = '0';
      document.body.style.overflow = 'hidden'; 
      document.body.style.transition = 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      // efsane lüks renk paletleri (Obsidyen Siyahı ve Mermer Beyazı)
      if (darkMode) {
        document.body.style.background = 'linear-gradient(135deg, #09090b 0%, #18181b 100%)';
        document.body.style.color = '#fafafa';
      } else {
        document.body.style.background = 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)';
        document.body.style.color = '#18181b';
      }
    }
  }, [todos, darkMode, isLoaded]);

  // Yeni görev ekleme olayı
  const gorevEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniGorev.trim()) return; // boş eklemeye çalışırsa engelle

    const eklenecek = {
      id: Date.now(),
      text: yeniGorev.trim(),
      completed: false,
      dueDate: secilenTarih || undefined,
    };

    setTodos([eklenecek, ...todos]); // yeni eklenen en üste gelsin diye böyle yaptık
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

  // sol menüden seçilen filtreye göre ekranda gösterilecekleri ayarlıyoruz
  const gosterilecekGorevler = todos.filter(todo => {
    if (filtre === 'aktif') return !todo.completed;
    if (filtre === 'biten') return todo.completed;
    return true; 
  });

  // sol menüdeki istatistik sayıları
  const toplamSayi = todos.length;
  const aktifSayi = todos.filter(t => !t.completed).length;
  const bitenSayi = toplamSayi - aktifSayi;

  // tarihi afilli gösterme fonksiyonu (altın renkleriyle baştan yazdım)
  const tarihRozeti = (tarih?: string) => {
    if (!tarih) return null;
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0); // saat farkı sorun çıkarmasın
    const hedef = new Date(tarih);
    hedef.setHours(0, 0, 0, 0);
    
    const farkGun = Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));

    let yazi = "";
    let renk = "";

    // premium renklere göre rozet renkleri
    if (farkGun < 0) { 
      yazi = `${Math.abs(farkGun)} gün geçti`; 
      renk = "#e11d48"; // koyu kırmızı
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#d4af37" : "#b8860b"; // Premium Altın
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#a1a1aa" : "#52525b"; // Şık gümüş
    } else { 
      yazi = `${farkGun} gün kaldı`; 
      renk = darkMode ? '#71717a' : '#a1a1aa'; 
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: renk, fontWeight: 600, background: darkMode ? 'rgba(212, 175, 55, 0.05)' : 'rgba(212, 175, 55, 0.1)', padding: '4px 10px', borderRadius: '8px', border: darkMode ? '1px solid rgba(212, 175, 55, 0.15)' : '1px solid rgba(212, 175, 55, 0.2)' }}>
        <Calendar width={16} height={16} />
        {yazi}
      </span>
    );
  };

  if (!isLoaded) return null;

  // internetten ayarladığım lüks cam (Glassmorphism) stili - Altın yansımalı
  const vipCamStili = {
    background: darkMode ? 'rgba(9, 9, 11, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)', 
    border: darkMode ? '1px solid rgba(212, 175, 55, 0.15)' : '1px solid rgba(212, 175, 55, 0.3)', // Şampanya sarısı kenarlık
    boxShadow: darkMode ? '0 10px 40px rgba(0, 0, 0, 0.5)' : '0 10px 40px rgba(0, 0, 0, 0.05)',
  };

  // inputlar ve görev kartları için daha hafif cam stili
  const hafifCamStili = {
    background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* SOL MENÜ - Dashboard kısmı */}
      <aside style={{ width: '280px', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px', ...vipCamStili, borderRadius: '0' }}>
        
        {/* Logo ve tema butonu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', background: darkMode ? 'linear-gradient(to right, #d4af37, #fdfbfb)' : 'linear-gradient(to right, #b8860b, #18181b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EliteTask</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#d4af37' : '#b8860b', display: 'flex' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </div>

        {/* Filtreleme Butonları */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: darkMode ? '#71717a' : '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', paddingLeft: '10px', marginBottom: '4px' }}>Görünüm</p>
          
          {(['hepsi', 'aktif', 'biten'] as const).map((durum) => (
            <button
              key={durum}
              onClick={() => setFiltre(durum)}
              style={{
                background: filtre === durum ? (darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.15)') : 'transparent',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                color: filtre === durum ? (darkMode ? '#d4af37' : '#b8860b') : (darkMode ? '#a1a1aa' : '#52525b'),
                fontWeight: filtre === durum ? 600 : 500,
                transition: 'all 0.3s ease',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {durum === 'hepsi' ? 'Tüm Görevler' : durum === 'aktif' ? 'Bekleyenler' : 'Tamamlananlar'}
            </button>
          ))}
        </nav>

        {/* Sol alttaki istatistik özeti */}
        <div style={{ marginTop: 'auto', padding: '20px', ...hafifCamStili }}>
          <h3 style={{ fontSize: '12px', margin: '0 0 16px 0', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '1px' }}>Özet Paneli</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#52525b' }}>Toplam</span>
            <span style={{ fontWeight: 600 }}>{toplamSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#52525b' }}>Aktif</span>
            <span style={{ fontWeight: 600, color: darkMode ? '#d4af37' : '#b8860b' }}>{aktifSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#52525b' }}>Biten</span>
            <span style={{ fontWeight: 600, opacity: 0.5 }}>{bitenSayi}</span>
          </div>
        </div>
      </aside>

      {/* SAĞ TARAF - Görevlerin listelendiği ana alan */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '50px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          {/* Üst başlık kısmı */}
          <header style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-1px' }}>
              {filtre === 'hepsi' ? 'Tüm Görevler' : filtre === 'aktif' ? 'Yapılacaklar' : 'Bitenler'}
            </h2>
            <p style={{ fontSize: '16px', color: darkMode ? '#a1a1aa' : '#71717a', margin: 0, fontWeight: 400 }}>Ajandanızı buradan yönetin.</p>
          </header>

          {/* Görev Ekleme Formu */}
          <form onSubmit={gorevEkle} style={{ display: 'flex', gap: '16px', marginBottom: '50px', padding: '14px', ...hafifCamStili, boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <Plus width={24} height={24} color={darkMode ? '#d4af37' : '#b8860b'} />
              <input
                type="text"
                placeholder="Yeni bir hedef belirleyin..."
                value={yeniGorev}
                onChange={(e) => setYeniGorev(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: darkMode ? '#fff' : '#09090b', fontSize: '17px', fontWeight: 500 }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', paddingLeft: '16px' }}>
              <input
                type="date"
                value={secilenTarih}
                onChange={(e) => setSecilenTarih(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: darkMode ? '#a1a1aa' : '#52525b', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '14px' }}
              />
            </div>
            
            <button type="submit" style={{ background: darkMode ? '#d4af37' : '#b8860b', color: '#fff', border: 'none', padding: '0 28px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(212, 175, 55, 0.4)' }}>
              Ekle
            </button>
          </form>

          {/* Görev Listesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {gosterilecekGorevler.map((todo) => (
              <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '22px 28px', transition: 'all 0.3s ease', opacity: todo.completed ? 0.4 : 1, ...hafifCamStili, borderLeft: todo.completed ? '4px solid #52525b' : (darkMode ? '4px solid #d4af37' : '4px solid #b8860b') }}>
                
                <button onClick={() => tamamlaToggle(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: todo.completed ? (darkMode ? '#52525b' : '#a1a1aa') : (darkMode ? '#d4af37' : '#b8860b') }}>
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
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', borderBottom: `2px solid ${darkMode ? '#d4af37' : '#b8860b'}`, outline: 'none', color: darkMode ? '#fff' : '#09090b', fontSize: '17px', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}
                    />
                  ) : (
                    <span style={{ fontSize: '17px', fontWeight: 500, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fff' : '#09090b' }}>
                      {todo.text}
                    </span>
                  )}
                  
                  {tarihRozeti(todo.dueDate)}
                </div>

                <div style={{ display: 'flex', gap: '8px', opacity: todo.completed ? 0 : 1, transition: 'opacity 0.2s' }}>
                  <button onClick={() => duzenlemeyeBasla(todo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#71717a' : '#a1a1aa', padding: '8px' }}>
                    <EditPencil width={22} height={22} />
                  </button>
                  <button onClick={() => gorevSil(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#e11d48', padding: '8px' }}>
                    <Trash width={22} height={22} />
                  </button>
                </div>
              </div>
            ))}

            {/* Liste boşsa görünecek kısım */}
            {gosterilecekGorevler.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
                <CheckCircleSolid width={56} height={56} color={darkMode ? '#d4af37' : '#b8860b'} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 500, color: darkMode ? '#fff' : '#09090b' }}>Listeniz şu an boş.</h3>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}