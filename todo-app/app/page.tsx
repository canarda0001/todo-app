'use client';

import { useState, useEffect } from 'react';
// ikon paketinden lazim olanlari cektik
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
  
  // edit isleri icin tuttugumuz stateler
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // sol menudeki secili sekmeyi anliyoruz (hepsi, aktif, biten)
  const [filtre, setFiltre] = useState<'hepsi' | 'aktif' | 'biten'>('hepsi');

  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // TELEFON MU BILGISAYAR MI? (Responsive state'i)
  const [isMobile, setIsMobile] = useState(false);

  // 1. Ekran boyutunu dinleme ve Local'den veri cekme isleri
  useEffect(() => {
    // Ekranin anlik genisligini olcup telefonda miyiz bakiyoruz
    const ekraniKontrolEt = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // ilk acilista bi kere calistir
    ekraniKontrolEt();
    // pencere boyutu degistikce dinlemeye devam et
    window.addEventListener('resize', ekraniKontrolEt);

    // cyber tema icin farkli key verdik ki eski verilerle gümlemesin
    const kayitliGorevler = localStorage.getItem('my_todos_cyber_clean');
    const kayitliTema = localStorage.getItem('my_theme_cyber_clean');

    if (kayitliGorevler) {
      try { 
        setTodos(JSON.parse(kayitliGorevler)); 
      } catch (e) {
        console.log("Localstorage'dan veri cekerken patladik:", e);
      }
    }
    if (kayitliTema) {
      setDarkMode(kayitliTema === 'dark');
    }
    
    setIsLoaded(true); // hydration hatasindan yirtmak icin

    // component ölünce (kapaninca) event listener'i temizle
    return () => window.removeEventListener('resize', ekraniKontrolEt);
  }, []);

  // 2. Arka plan ve neon (cyber) gradient ayarlari
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_cyber_clean', JSON.stringify(todos));
      localStorage.setItem('my_theme_cyber_clean', darkMode ? 'dark' : 'light');
      
      document.body.style.margin = '0';
      // mobilde asagi kaydirabilmek icin overflow'u auto yapiyoruz
      document.body.style.overflow = isMobile ? 'auto' : 'hidden'; 
      document.body.style.transition = 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      // Cyberpunk hacker renklerimiz 
      if (darkMode) {
        // Gece mavisi ve derin mor
        document.body.style.background = 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
        document.body.style.color = '#e0e0e0';
      } else {
        // Acik synthwave tonlari
        document.body.style.background = 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
        document.body.style.color = '#120428';
      }
    }
  }, [todos, darkMode, isLoaded, isMobile]);

  const gorevEkle = (e: React.FormEvent) => {
    e.preventDefault();
    // adam bos basarsa hic ugrasma direkt sal
    if (!yeniGorev.trim()) return; 

    const yeniItem = {
      id: Date.now(),
      text: yeniGorev.trim(),
      completed: false,
      dueDate: secilenTarih || undefined,
    };

    setTodos([yeniItem, ...todos]); // uste eklensin diye boyle yaptik
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

  // Ekrana basilacak olanlari filtreliyoruz
  const gosterilecekler = todos.filter(todo => {
    if (filtre === 'aktif') return !todo.completed;
    if (filtre === 'biten') return todo.completed;
    return true; 
  });

  // Sol menudeki sayaclar
  const toplamSayi = todos.length;
  const aktifSayi = todos.filter(t => !t.completed).length;
  const bitenSayi = toplamSayi - aktifSayi;

  // Tarihi neon renklerle sekilli gosterme fonksiyonu
  const afilliTarih = (tarih?: string) => {
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
      renk = "#ff003c"; 
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#f0f" : "#d100d1"; 
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#00f2fe" : "#005bea"; 
    } else { 
      yazi = `${farkGun} gün kaldı`; 
      renk = darkMode ? '#a29bfe' : '#6c5ce7'; 
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: renk, fontWeight: 700, background: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)', padding: '4px 10px', borderRadius: '8px', border: `1px solid ${renk}55`, whiteSpace: 'nowrap' }}>
        <Calendar width={16} height={16} />
        {yazi}
      </span>
    );
  };

  if (!isLoaded) return null;

  // Internetten arakladigim neon cyberpunk cam stilleri
  const anaCamStili = {
    background: darkMode ? 'rgba(15, 12, 41, 0.7)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    // Mobilde sagi degil alti ciziyoruz
    borderRight: isMobile ? 'none' : (darkMode ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid rgba(142, 197, 252, 0.5)'),
    borderBottom: isMobile ? (darkMode ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid rgba(142, 197, 252, 0.5)') : 'none',
    boxShadow: darkMode ? '0 0 30px rgba(0, 242, 254, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.05)'
  };

  const formCamStili = {
    background: darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: darkMode ? '1px solid rgba(255, 0, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '16px'
  };

  return (
    // Mobilde elemanlari alt alta (column), PC'de yan yana (row) diziyoruz
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* SOL TARAFTAKI MENU (Mobilde ÜST MENU oluyor) */}
      <aside style={{ width: isMobile ? '100%' : '280px', padding: isMobile ? '20px' : '30px 20px', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '30px', ...anaCamStili, zIndex: 10 }}>
        
        {/* En ustteki logo ve gece gunduz butonu */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 900, margin: 0, letterSpacing: '1px', background: darkMode ? 'linear-gradient(to right, #00f2fe, #4facfe)' : 'linear-gradient(to right, #6c5ce7, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: darkMode ? '0 0 20px rgba(0,242,254,0.3)' : 'none' }}>Görevlerim</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#00f2fe' : '#6c5ce7', display: 'flex' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </div>

        {/* Sekmeler (Mobilde yan yana scroll edilebilir sekilde ayarladik) */}
        <nav style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '4px' : '0' }}>
          {!isMobile && <p style={{ fontSize: '11px', fontWeight: 800, color: darkMode ? '#a29bfe' : '#6c5ce7', textTransform: 'uppercase', letterSpacing: '3px', paddingLeft: '10px', marginBottom: '4px' }}>Görünüm</p>}
          
          {(['hepsi', 'aktif', 'biten'] as const).map((durum) => (
            <button
              key={durum}
              onClick={() => setFiltre(durum)}
              style={{
                background: filtre === durum ? (darkMode ? 'rgba(0, 242, 254, 0.15)' : 'rgba(108, 92, 231, 0.15)') : 'transparent',
                border: 'none',
                padding: isMobile ? '10px 14px' : '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                color: filtre === durum ? (darkMode ? '#00f2fe' : '#6c5ce7') : (darkMode ? '#b2bec3' : '#2d3436'),
                fontWeight: filtre === durum ? 700 : 500,
                transition: 'all 0.3s ease',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                gap: '8px',
                boxShadow: filtre === durum && darkMode ? (isMobile ? 'inset 0 2px 0 #00f2fe' : 'inset 2px 0 0 #00f2fe') : 'none' 
              }}
            >
              {durum === 'hepsi' ? 'Tüm Görevler' : durum === 'aktif' ? 'Bekleyenler' : 'Tamamlananlar'}
            </button>
          ))}
        </nav>

        {/* Istatistik Paneli (Mobilde cok yer kaplamasin diye gizledik) */}
        {!isMobile && (
          <div style={{ marginTop: 'auto', padding: '20px', ...formCamStili }}>
            <h3 style={{ fontSize: '12px', margin: '0 0 16px 0', color: darkMode ? '#f0f' : '#d100d1', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>Özet Paneli</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: darkMode ? '#b2bec3' : '#636e72', fontWeight: 600 }}>Toplam</span>
              <span style={{ fontWeight: 800 }}>{toplamSayi}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: darkMode ? '#b2bec3' : '#636e72', fontWeight: 600 }}>Aktif</span>
              <span style={{ fontWeight: 800, color: darkMode ? '#00f2fe' : '#0984e3' }}>{aktifSayi}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: darkMode ? '#b2bec3' : '#636e72', fontWeight: 600 }}>Biten</span>
              <span style={{ fontWeight: 800, opacity: 0.5 }}>{bitenSayi}</span>
            </div>
          </div>
        )}
      </aside>

      {/* SAG TARAF - Ana liste (Mobilde ASAGI kisim oluyor) */}
      <main style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? '24px 16px' : '50px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: isMobile ? '30px' : '50px' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-1px' }}>
              {filtre === 'hepsi' ? 'Tüm Görevler' : filtre === 'aktif' ? 'Yapılacaklar' : 'Bitenler'}
            </h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: darkMode ? '#00f2fe' : '#6c5ce7', margin: 0, fontWeight: 500 }}>Ajandanızı buradan yönetin.</p>
          </header>

          {/* Form (Mobilde ogeler alt alta diziliyor) */}
          <form onSubmit={gorevEkle} style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '16px', 
            marginBottom: isMobile ? '30px' : '50px', 
            padding: '14px', 
            ...formCamStili,
            boxShadow: darkMode ? '0 0 20px rgba(255, 0, 255, 0.1)' : '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: isMobile ? '8px 4px' : '0 12px' }}>
              <Plus width={24} height={24} color={darkMode ? '#f0f' : '#6c5ce7'} />
              <input
                type="text"
                placeholder="Yeni bir hedef belirleyin..."
                value={yeniGorev}
                onChange={(e) => setYeniGorev(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: darkMode ? '#fff' : '#2d3436', fontSize: '16px', fontWeight: 600 }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: isMobile ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'), borderTop: isMobile ? (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)') : 'none', paddingTop: isMobile ? '12px' : '0', paddingLeft: isMobile ? '4px' : '16px' }}>
              <input
                type="date"
                value={secilenTarih}
                onChange={(e) => setSecilenTarih(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: darkMode ? '#00f2fe' : '#6c5ce7', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '14px', width: isMobile ? '100%' : 'auto' }}
              />
            </div>
            
            <button type="submit" style={{ background: darkMode ? 'transparent' : '#6c5ce7', color: darkMode ? '#f0f' : '#fff', border: darkMode ? '2px solid #f0f' : 'none', padding: isMobile ? '16px' : '0 28px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s', boxShadow: darkMode ? '0 0 10px rgba(255, 0, 255, 0.3)' : '0 4px 14px rgba(108, 92, 231, 0.4)', width: isMobile ? '100%' : 'auto' }}>
              Ekle
            </button>
          </form>

          {/* Todo Listesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {gosterilecekler.map((todo) => (
              <div key={todo.id} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', // mobilde butonlar ve yazi ayni hizada baslasin
                gap: isMobile ? '12px' : '20px', 
                padding: isMobile ? '18px 16px' : '22px 28px', 
                opacity: todo.completed ? 0.4 : 1, 
                transition: 'all 0.3s ease',
                background: darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                borderLeft: todo.completed ? '4px solid #636e72' : (darkMode ? '4px solid #00f2fe' : '4px solid #6c5ce7'),
                borderRadius: '16px'
              }}>
                
                <button onClick={() => durumuDegistir(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 0', color: todo.completed ? (darkMode ? '#636e72' : '#b2bec3') : (darkMode ? '#00f2fe' : '#6c5ce7'), flexShrink: 0 }}>
                  {todo.completed ? <CheckCircleSolid width={26} height={26} /> : <Circle width={26} height={26} />}
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 /* tasmayi engellemek icin */ }}>
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => duzenlemeyiKaydet(todo.id)}
                      onKeyDown={(e) => e.key === 'Enter' && duzenlemeyiKaydet(todo.id)}
                      autoFocus
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', borderBottom: `2px solid ${darkMode ? '#f0f' : '#6c5ce7'}`, outline: 'none', color: darkMode ? '#fff' : '#2d3436', fontSize: '16px', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}
                    />
                  ) : (
                    <span style={{ fontSize: '16px', fontWeight: 600, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fff' : '#2d3436', wordBreak: 'break-word' }}>
                      {todo.text}
                    </span>
                  )}
                  
                  {afilliTarih(todo.dueDate)}
                </div>

                <div style={{ display: 'flex', gap: '4px', opacity: todo.completed ? 0 : 1, transition: 'opacity 0.2s', flexShrink: 0 }}>
                  <button onClick={() => duzenlemeyeBasla(todo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#00f2fe' : '#6c5ce7', padding: '6px' }}>
                    <EditPencil width={22} height={22} />
                  </button>
                  <button onClick={() => goreviUcur(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff003c', padding: '6px' }}>
                    <Trash width={22} height={22} />
                  </button>
                </div>
              </div>
            ))}

            {/* Listede eleman yoksa bos gorunmesin diye */}
            {gosterilecekler.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
                <CheckCircleSolid width={56} height={56} color={darkMode ? '#00f2fe' : '#6c5ce7'} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 600, color: darkMode ? '#fff' : '#2d3436', letterSpacing: '1px' }}>Listeniz şu an boş.</h3>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}