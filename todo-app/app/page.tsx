'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircleSolid, Circle, Trash, EditPencil, Calendar, SunLight, HalfMoon, Menu, Check, Xmark } from 'iconoir-react';
import { motion, Reorder, useDragControls } from 'framer-motion';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
}

// Rapor P0/P2: Gorev kartini ayri bir bilesen yaptik ki surukleme ve duzenleme isleri karmasiklasmasin
const GorevKarti = ({ todo, darkMode, isMobile, durumuDegistir, goreviUcur, duzenlemeyiKaydet, afilliTarih }: any) => {
  const controls = useDragControls();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const iptalEt = () => {
    setIsEditing(false);
    setEditText(todo.text);
  };

  const kaydet = () => {
    if (editText.trim()) {
      duzenlemeyiKaydet(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  // Klavyeden enter/escape destegi (Rapor P0)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') kaydet();
    if (e.key === 'Escape') iptalEt();
  };

  return (
    <Reorder.Item 
      value={todo}
      dragListener={false} // Tum kartin suruklenmesini kapattik (Rapor P0)
      dragControls={controls}
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,242,254,0.3)" }}
      style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: isMobile ? '8px' : '16px', 
        padding: isMobile ? '16px 12px' : '20px 24px', 
        opacity: todo.completed ? 0.4 : 1, 
        background: darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
        borderLeft: todo.completed ? '4px solid #636e72' : (darkMode ? '4px solid #00f2fe' : '4px solid #6c5ce7'),
        borderRadius: '16px'
      }}
    >
      {/* Rapor P0/P1: 6 noktali surukleme tutamaci (Grip) */}
      <div 
        onPointerDown={(e) => controls.start(e)} 
        style={{ cursor: 'grab', padding: '4px', opacity: 0.5 }}
        title="Sürükle"
        aria-label="Görevi Sürükle"
      >
        <Menu width={22} height={22} color={darkMode ? '#fff' : '#000'} />
      </div>

      <button onClick={() => durumuDegistir(todo.id)} aria-label="Tamamla" title="Tamamla" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px 0', color: todo.completed ? (darkMode ? '#636e72' : '#b2bec3') : (darkMode ? '#00f2fe' : '#6c5ce7') }}>
        {todo.completed ? <CheckCircleSolid width={26} height={26} /> : <Circle width={26} height={26} />}
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              aria-label="Görevi Düzenle"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderBottom: `2px solid ${darkMode ? '#00f2fe' : '#6c5ce7'}`, color: darkMode ? '#fff' : '#2d3436', fontSize: '16px', padding: '4px 8px', borderRadius: '4px' }}
            />
          </div>
        ) : (
          <span style={{ fontSize: '16px', fontWeight: 600, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fff' : '#2d3436', wordBreak: 'break-word' }}>
            {todo.text}
          </span>
        )}
        
        {/* Rapor P0/P1: Tarih gosterimi */}
        {afilliTarih(todo.dueDate)}
      </div>

      {/* Duzenleme durumunda Kaydet/Iptal butonlari cikiyor */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {isEditing ? (
          <>
            <button onClick={kaydet} aria-label="Kaydet" title="Kaydet" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#00b894', padding: '6px' }}>
              <Check width={22} height={22} />
            </button>
            <button onClick={iptalEt} aria-label="İptal" title="İptal" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff003c', padding: '6px' }}>
              <Xmark width={22} height={22} />
            </button>
          </>
        ) : (
          <>
            {!todo.completed && (
              <button onClick={() => setIsEditing(true)} aria-label="Düzenle" title="Düzenle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#00f2fe' : '#6c5ce7', padding: '6px' }}>
                <EditPencil width={22} height={22} />
              </button>
            )}
            <button onClick={() => goreviUcur(todo.id)} aria-label="Sil" title="Sil" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff003c', padding: '6px' }}>
              <Trash width={22} height={22} />
            </button>
          </>
        )}
      </div>
    </Reorder.Item>
  );
};


export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [yeniGorev, setYeniGorev] = useState('');
  const [secilenTarih, setSecilenTarih] = useState('');
  const [filtre, setFiltre] = useState<'hepsi' | 'aktif' | 'biten'>('hepsi');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ekraniKontrolEt = () => setIsMobile(window.innerWidth < 768);
    ekraniKontrolEt();
    window.addEventListener('resize', ekraniKontrolEt);

    const kayitliGorevler = localStorage.getItem('my_todos_cyber_clean');
    const kayitliTema = localStorage.getItem('my_theme_cyber_clean');

    if (kayitliGorevler) {
      try { setTodos(JSON.parse(kayitliGorevler)); } catch (e) { console.log(e); }
    }
    if (kayitliTema) setDarkMode(kayitliTema === 'dark');
    
    setIsLoaded(true); 
    return () => window.removeEventListener('resize', ekraniKontrolEt);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_cyber_clean', JSON.stringify(todos));
      localStorage.setItem('my_theme_cyber_clean', darkMode ? 'dark' : 'light');
      
      document.body.style.margin = '0';
      document.body.style.overflow = isMobile ? 'auto' : 'hidden'; 
      document.body.style.transition = 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      if (darkMode) {
        document.body.style.background = 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)';
        document.body.style.color = '#e0e0e0';
      } else {
        document.body.style.background = 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
        document.body.style.color = '#120428';
      }
    }
  }, [todos, darkMode, isLoaded, isMobile]);

  const gorevEkle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniGorev.trim()) return; 

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

  // Rapor P1: Silme islemi icin basit bir onay penceresi ekledik
  const goreviUcur = (id: number) => {
    if(window.confirm("Bu görevi silmek istediğine emin misin?")) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const duzenlemeyiKaydet = (id: number, yeniMetin: string) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, text: yeniMetin } : todo));
  };

  const gosterilecekler = todos.filter(todo => {
    if (filtre === 'aktif') return !todo.completed;
    if (filtre === 'biten') return todo.completed;
    return true; 
  });

  const toplamSayi = todos.length;
  const aktifSayi = todos.filter(t => !t.completed).length;
  const bitenSayi = toplamSayi - aktifSayi;

  // Rapor P2: Ilerleme cubugu (Progress Bar) icin yuzde hesaplama
  const bitisYuzdesi = toplamSayi === 0 ? 0 : Math.round((bitenSayi / toplamSayi) * 100);

  // Rapor P1: Hızlı tarih seçimleri
  const bugunuSec = () => {
    const d = new Date();
    setSecilenTarih(d.toISOString().split('T')[0]);
  };
  const yariniSec = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSecilenTarih(d.toISOString().split('T')[0]);
  };

  // Rapor P0/P1: Gelismis tarih hesaplama (15 Agustos gibi gosterim eklendi)
  const afilliTarih = (tarih?: string) => {
    if (!tarih) return null;
    
    const bugun = new Date(); bugun.setHours(0, 0, 0, 0); 
    const hedef = new Date(tarih); hedef.setHours(0, 0, 0, 0);
    const farkGun = Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
    const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    let yazi = "";
    let renk = "";

    if (farkGun < 0) { 
      yazi = "Süresi geçti"; 
      renk = "#ff003c"; 
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#f0f" : "#d100d1"; 
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#00f2fe" : "#005bea"; 
    } else { 
      yazi = `${hedef.getDate()} ${aylar[hedef.getMonth()]}`; 
      renk = darkMode ? '#a29bfe' : '#6c5ce7'; 
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: renk, fontWeight: 700, background: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.6)', padding: '2px 8px', borderRadius: '8px', border: `1px solid ${renk}55`, width: 'fit-content' }}>
        <Calendar width={14} height={14} />
        {yazi}
      </span>
    );
  };

  // Rapor P1: Bos durumlari filtreye gore ayarliyoruz
  let bosMesaj = "Listeniz şu an boş.";
  if (filtre === 'aktif') bosMesaj = "Bekleyen görev yok, kralsın!";
  if (filtre === 'biten') bosMesaj = "Henüz biten görev yok. Biraz çalışalım!";

  if (!isLoaded) return null;

  const anaCamStili = {
    background: darkMode ? 'rgba(15, 12, 41, 0.7)' : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
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
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Rapor P2: Sol menuyu 280'den 240px'e cektik */}
      <aside style={{ width: isMobile ? '100%' : '240px', padding: isMobile ? '20px' : '30px 20px', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '30px', ...anaCamStili, zIndex: 10 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 900, margin: 0, letterSpacing: '1px', background: darkMode ? 'linear-gradient(to right, #00f2fe, #4facfe)' : 'linear-gradient(to right, #6c5ce7, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: darkMode ? '0 0 20px rgba(0,242,254,0.3)' : 'none' }}>Görevlerim</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Temayı Değiştir"
            title="Temayı Değiştir"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#00f2fe' : '#6c5ce7', display: 'flex' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '4px' : '0' }}>
          {!isMobile && <p style={{ fontSize: '11px', fontWeight: 800, color: darkMode ? '#a29bfe' : '#6c5ce7', textTransform: 'uppercase', letterSpacing: '3px', paddingLeft: '10px', marginBottom: '4px' }}>Görünüm</p>}
          
          {(['hepsi', 'aktif', 'biten'] as const).map((durum) => (
            <button
              key={durum}
              aria-label={`${durum} Filtresi`}
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
            
            {/* Rapor P2: Ilerleme (Progress) cubugu eklendi */}
            <div style={{ width: '100%', height: '6px', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '10px', marginTop: '16px' }}>
              <div style={{ width: `${bitisYuzdesi}%`, height: '100%', background: darkMode ? '#00f2fe' : '#6c5ce7', borderRadius: '10px', transition: 'width 0.3s ease' }}></div>
            </div>
            <p style={{fontSize: '11px', textAlign: 'right', marginTop: '6px', opacity: 0.7, margin: 0}}>% {bitisYuzdesi} Biten</p>
          </div>
        )}
      </aside>

      <main style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? '24px 16px' : '40px 60px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: isMobile ? '30px' : '40px' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-1px' }}>
              {filtre === 'hepsi' ? 'Tüm Görevler' : filtre === 'aktif' ? 'Yapılacaklar' : 'Bitenler'}
            </h2>
          </header>

          {/* Rapor P1: Form, Bitenler ekraninda gizlendi */}
          {filtre !== 'biten' && (
            <form onSubmit={gorevEkle} style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px', 
              marginBottom: isMobile ? '30px' : '40px', 
              padding: '12px', // Rapor P2: Form agirligi (padding) azaltildi
              ...formCamStili,
              boxShadow: darkMode ? '0 0 15px rgba(255, 0, 255, 0.1)' : '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: isMobile ? '4px' : '0 8px' }}>
                <Plus width={22} height={22} color={darkMode ? '#f0f' : '#6c5ce7'} />
                <input
                  type="text"
                  placeholder="Yeni bir hedef belirleyin..."
                  value={yeniGorev}
                  onChange={(e) => setYeniGorev(e.target.value)}
                  aria-label="Görev Ekleme Alanı"
                  required
                  style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: 'none', color: darkMode ? '#fff' : '#2d3436', fontSize: '16px', fontWeight: 600 }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: isMobile ? 'none' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'), borderTop: isMobile ? (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)') : 'none', paddingTop: isMobile ? '12px' : '0', paddingLeft: isMobile ? '4px' : '12px' }}>
                {/* Rapor P2: Hizli tarih butonlari */}
                {!isMobile && (
                  <div style={{display: 'flex', gap: '4px', marginRight: '8px'}}>
                    <button type="button" onClick={bugunuSec} style={{fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: 'none', color: darkMode ? '#fff' : '#000', cursor: 'pointer'}}>Bugün</button>
                    <button type="button" onClick={yariniSec} style={{fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: 'none', color: darkMode ? '#fff' : '#000', cursor: 'pointer'}}>Yarın</button>
                  </div>
                )}
                <input
                  type="date"
                  value={secilenTarih}
                  onChange={(e) => setSecilenTarih(e.target.value)}
                  aria-label="Son Tarih Seçimi"
                  style={{ background: 'transparent', border: 'none', color: darkMode ? '#00f2fe' : '#6c5ce7', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '14px', width: isMobile ? '100%' : 'auto' }}
                />
              </div>
              
              <button type="submit" aria-label="Görevi Ekle" style={{ background: darkMode ? 'transparent' : '#6c5ce7', color: darkMode ? '#f0f' : '#fff', border: darkMode ? '2px solid #f0f' : 'none', padding: isMobile ? '12px' : '0 24px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', width: isMobile ? '100%' : 'auto' }}>
                Ekle
              </button>
            </form>
          )}

          <Reorder.Group axis="y" values={gosterilecekler} onReorder={setTodos} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {gosterilecekler.map((todo) => (
              <GorevKarti 
                key={todo.id}
                todo={todo}
                darkMode={darkMode}
                isMobile={isMobile}
                durumuDegistir={durumuDegistir}
                goreviUcur={goreviUcur}
                duzenlemeyiKaydet={duzenlemeyiKaydet}
                afilliTarih={afilliTarih}
              />
            ))}
          </Reorder.Group>

          {gosterilecekler.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
              <CheckCircleSolid width={56} height={56} color={darkMode ? '#00f2fe' : '#6c5ce7'} style={{ marginBottom: '16px', opacity: 0.5 }} />
              {/* Rapor P1: Bos mesajlari filtreye gore degistirdik */}
              <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 600, color: darkMode ? '#fff' : '#2d3436', letterSpacing: '1px' }}>{bosMesaj}</h3>
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}