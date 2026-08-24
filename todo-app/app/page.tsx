'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircleSolid, Circle, Trash, EditPencil, Calendar, SunLight, HalfMoon, Menu, Check, Xmark } from 'iconoir-react';
import { motion, Reorder, useDragControls, AnimatePresence } from 'framer-motion';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string;
}

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') kaydet();
    if (e.key === 'Escape') iptalEt();
  };

  return (
    <Reorder.Item 
      value={todo}
      dragListener={false} 
      dragControls={controls}
      whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: isMobile ? '8px' : '16px', 
        padding: isMobile ? '16px 12px' : '20px 24px', 
        opacity: todo.completed ? 0.6 : 1, 
        background: darkMode ? '#18181b' : '#ffffff',
        border: darkMode ? '1px solid #27272a' : '1px solid #e4e4e7',
        // Madde 15: Yesil tamamlananlar, Mor (veya gri) normal sinirlar
        borderLeft: todo.completed ? '4px solid #10b981' : (darkMode ? '4px solid #7c3aed' : '4px solid #6366f1'),
        borderRadius: '12px'
      }}
    >
      <div 
        onPointerDown={(e) => controls.start(e)} 
        style={{ cursor: 'grab', padding: '4px', opacity: 0.4 }}
        title="Sürükle"
        aria-label="Görevi Sürükle"
      >
        <Menu width={22} height={22} color={darkMode ? '#fff' : '#000'} />
      </div>

      <button onClick={() => durumuDegistir(todo.id)} aria-label="Tamamla" title="Tamamla" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px 0', color: todo.completed ? '#10b981' : (darkMode ? '#71717a' : '#a1a1aa') }}>
        {todo.completed ? <CheckCircleSolid width={26} height={26} /> : <Circle width={26} height={26} />}
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            {/* Madde 16: outline: none kaldirildi, klavye odagi aktif */}
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              aria-label="Görevi Düzenle"
              style={{ flex: 1, background: darkMode ? '#27272a' : '#f4f4f5', border: `1px solid ${darkMode ? '#7c3aed' : '#6366f1'}`, color: darkMode ? '#fff' : '#09090b', fontSize: '16px', padding: '8px 12px', borderRadius: '6px' }}
            />
          </div>
        ) : (
          <span style={{ fontSize: '16px', fontWeight: 500, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#fafafa' : '#09090b', wordBreak: 'break-word' }}>
            {todo.text}
          </span>
        )}
        
        {afilliTarih(todo.dueDate)}
      </div>

      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        {isEditing ? (
          <>
            <button onClick={kaydet} aria-label="Kaydet" title="Kaydet" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981', padding: '6px' }}>
              <Check width={22} height={22} />
            </button>
            <button onClick={iptalEt} aria-label="İptal" title="İptal" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px' }}>
              <Xmark width={22} height={22} />
            </button>
          </>
        ) : (
          <>
            {!todo.completed && (
              <button onClick={() => setIsEditing(true)} aria-label="Düzenle" title="Düzenle" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#a1a1aa' : '#71717a', padding: '6px' }}>
                <EditPencil width={22} height={22} />
              </button>
            )}
            <button onClick={() => goreviUcur(todo.id)} aria-label="Sil" title="Sil" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px' }}>
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
  
  // Madde 19: Anlik bildirim (Toast) state'i
  const [bildirim, setBildirim] = useState<string | null>(null);

  const bildir = (mesaj: string) => {
    setBildirim(mesaj);
    setTimeout(() => setBildirim(null), 3000); // 3 saniye sonra gizle
  };

  useEffect(() => {
    const ekraniKontrolEt = () => setIsMobile(window.innerWidth < 768);
    ekraniKontrolEt();
    window.addEventListener('resize', ekraniKontrolEt);

    const kayitliGorevler = localStorage.getItem('my_todos_elite');
    const kayitliTema = localStorage.getItem('my_theme_elite');

    if (kayitliGorevler) {
      try { setTodos(JSON.parse(kayitliGorevler)); } catch (e) { console.log(e); }
    }
    if (kayitliTema) setDarkMode(kayitliTema === 'dark');
    
    setIsLoaded(true); 
    return () => window.removeEventListener('resize', ekraniKontrolEt);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_elite', JSON.stringify(todos));
      localStorage.setItem('my_theme_elite', darkMode ? 'dark' : 'light');
      
      document.body.style.margin = '0';
      document.body.style.overflow = isMobile ? 'auto' : 'hidden'; 
      document.body.style.transition = 'background 0.4s ease, color 0.4s ease';

      // Elit, sade, premium renk paleti
      if (darkMode) {
        document.body.style.background = '#09090b'; // Koyu gri/siyah
        document.body.style.color = '#fafafa';
      } else {
        document.body.style.background = '#fafafa'; // Kirik beyaz
        document.body.style.color = '#09090b';
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
    bildir("Görev eklendi"); // Madde 19
  };

  const durumuDegistir = (id: number) => {
    setTodos(todos.map((todo) => {
      if (todo.id === id) {
        const yeniDurum = !todo.completed;
        bildir(yeniDurum ? "Görev tamamlandı" : "Görev geri alındı"); // Madde 19
        return { ...todo, completed: yeniDurum };
      }
      return todo;
    }));
  };

  const goreviUcur = (id: number) => {
    if(window.confirm("Bu görevi silmek istediğine emin misin?")) {
      setTodos(todos.filter((todo) => todo.id !== id));
      bildir("Görev silindi"); // Madde 19
    }
  };

  const duzenlemeyiKaydet = (id: number, yeniMetin: string) => {
    setTodos(todos.map((todo) => todo.id === id ? { ...todo, text: yeniMetin } : todo));
    bildir("Değişiklikler kaydedildi"); // Madde 19
  };

  const gosterilecekler = todos.filter(todo => {
    if (filtre === 'aktif') return !todo.completed;
    if (filtre === 'biten') return todo.completed;
    return true; 
  });

  const toplamSayi = todos.length;
  const aktifSayi = todos.filter(t => !t.completed).length;
  const bitenSayi = toplamSayi - aktifSayi;
  const bitisYuzdesi = toplamSayi === 0 ? 0 : Math.round((bitenSayi / toplamSayi) * 100);

  const bugunuSec = () => {
    const d = new Date();
    setSecilenTarih(d.toISOString().split('T')[0]);
  };
  const yariniSec = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSecilenTarih(d.toISOString().split('T')[0]);
  };

  const afilliTarih = (tarih?: string) => {
    if (!tarih) return null;
    
    const bugun = new Date(); bugun.setHours(0, 0, 0, 0); 
    const hedef = new Date(tarih); hedef.setHours(0, 0, 0, 0);
    const farkGun = Math.ceil((hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
    const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    let yazi = "";
    let renk = "";
    // Madde 15 Renkleri: Gri ikincil, Kirmizi gecikme
    if (farkGun < 0) { 
      yazi = "Süresi geçti"; 
      renk = "#ef4444"; 
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#7c3aed" : "#6366f1"; // Mor (Ana Eylem)
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#a1a1aa" : "#71717a"; // Gri
    } else { 
      yazi = `${hedef.getDate()} ${aylar[hedef.getMonth()]}`; 
      renk = darkMode ? '#a1a1aa' : '#71717a'; // Gri
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: renk, fontWeight: 600, background: darkMode ? '#27272a' : '#f4f4f5', padding: '4px 10px', borderRadius: '6px', border: `1px solid ${darkMode ? '#3f3f46' : '#e4e4e7'}`, width: 'fit-content' }}>
        <Calendar width={14} height={14} />
        {yazi}
      </span>
    );
  };

  let bosMesaj = "Listeniz şu an boş.";
  if (filtre === 'aktif') bosMesaj = "Bekleyen görev yok, kralsın!";
  if (filtre === 'biten') bosMesaj = "Henüz biten görev yok. Biraz çalışalım!";

  if (!isLoaded) return null;

  // Temiz ve premium sol panel stili
  const panelStili = {
    background: darkMode ? '#18181b' : '#ffffff',
    borderRight: isMobile ? 'none' : (darkMode ? '1px solid #27272a' : '1px solid #e4e4e7'),
    borderBottom: isMobile ? (darkMode ? '1px solid #27272a' : '1px solid #e4e4e7') : 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* SOL TARAFTAKI MENU */}
      <aside style={{ width: isMobile ? '100%' : '260px', padding: isMobile ? '20px' : '40px 24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '40px', ...panelStili, zIndex: 10 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5px' }}>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Görevlerim</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Temayı Değiştir"
            title="Temayı Değiştir"
            style={{ background: darkMode ? '#27272a' : '#f4f4f5', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: darkMode ? '#fafafa' : '#09090b', display: 'flex' }}
          >
            {darkMode ? <SunLight width={20} height={20} /> : <HalfMoon width={20} height={20} />}
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '4px' : '0' }}>
          {!isMobile && <p style={{ fontSize: '12px', fontWeight: 600, color: darkMode ? '#71717a' : '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', paddingLeft: '12px', marginBottom: '4px' }}>Görünüm</p>}
          
          {(['hepsi', 'aktif', 'biten'] as const).map((durum) => (
            <button
              key={durum}
              aria-label={`${durum} Filtresi`}
              onClick={() => setFiltre(durum)}
              style={{
                background: filtre === durum ? (darkMode ? '#27272a' : '#f4f4f5') : 'transparent',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                color: filtre === durum ? (darkMode ? '#fafafa' : '#09090b') : (darkMode ? '#a1a1aa' : '#71717a'),
                fontWeight: filtre === durum ? 600 : 500,
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap'
              }}
            >
              {durum === 'hepsi' ? 'Tüm Görevler' : durum === 'aktif' ? 'Bekleyenler' : 'Tamamlananlar'}
            </button>
          ))}
        </nav>

        {!isMobile && (
          <div style={{ marginTop: 'auto', padding: '20px', background: darkMode ? '#27272a' : '#f4f4f5', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '13px', margin: '0 0 16px 0', color: darkMode ? '#fafafa' : '#09090b', fontWeight: 600 }}>Özet Paneli</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#71717a', fontWeight: 500 }}>Toplam</span>
              <span style={{ fontWeight: 600 }}>{toplamSayi}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#71717a', fontWeight: 500 }}>Aktif</span>
              <span style={{ fontWeight: 600, color: darkMode ? '#7c3aed' : '#6366f1' }}>{aktifSayi}</span>
            </div>
            
            <div style={{ width: '100%', height: '6px', background: darkMode ? '#3f3f46' : '#e4e4e7', borderRadius: '10px', marginTop: '16px' }}>
              <div style={{ width: `${bitisYuzdesi}%`, height: '100%', background: darkMode ? '#10b981' : '#10b981', borderRadius: '10px', transition: 'width 0.3s ease' }}></div>
            </div>
            <p style={{fontSize: '11px', textAlign: 'right', marginTop: '8px', color: darkMode ? '#a1a1aa' : '#71717a', margin: 0, fontWeight: 500}}>% {bitisYuzdesi} Biten</p>
          </div>
        )}
      </aside>

      <main style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto', padding: isMobile ? '24px 16px' : '60px 80px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: isMobile ? '30px' : '40px' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-1px' }}>
              {filtre === 'hepsi' ? 'Tüm Görevler' : filtre === 'aktif' ? 'Yapılacaklar' : 'Bitenler'}
            </h2>
          </header>

          {filtre !== 'biten' && (
            <form onSubmit={gorevEkle} style={{ 
              display: 'flex', 
              flexDirection: 'column', // Alt alta duzen daha temiz durur
              gap: '16px', 
              marginBottom: isMobile ? '30px' : '50px', 
              padding: '20px', 
              background: darkMode ? '#18181b' : '#ffffff',
              border: darkMode ? '1px solid #27272a' : '1px solid #e4e4e7',
              borderRadius: '16px',
            }}>
              
              {/* Madde 8: Görünür Etiketler (Labels) eklendi */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="gorev-adi" style={{ fontSize: '13px', fontWeight: 600, color: darkMode ? '#a1a1aa' : '#71717a' }}>Görev Açıklaması</label>
                <div style={{ display: 'flex', alignItems: 'center', background: darkMode ? '#27272a' : '#f4f4f5', borderRadius: '8px', padding: '0 12px' }}>
                  <Plus width={20} height={20} color={darkMode ? '#71717a' : '#a1a1aa'} />
                  <input
                    id="gorev-adi"
                    type="text"
                    placeholder="Yeni bir hedef belirleyin..."
                    value={yeniGorev}
                    onChange={(e) => setYeniGorev(e.target.value)}
                    required
                    style={{ flex: 1, padding: '12px', background: 'transparent', border: 'none', color: darkMode ? '#fff' : '#09090b', fontSize: '15px', fontWeight: 500 }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <label htmlFor="son-tarih" style={{ fontSize: '13px', fontWeight: 600, color: darkMode ? '#a1a1aa' : '#71717a' }}>Son Tarih</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!isMobile && (
                      <div style={{display: 'flex', gap: '6px'}}>
                        <button type="button" onClick={bugunuSec} style={{fontSize: '12px', padding: '8px 12px', borderRadius: '6px', background: darkMode ? '#27272a' : '#f4f4f5', border: 'none', color: darkMode ? '#fafafa' : '#09090b', cursor: 'pointer', fontWeight: 500}}>Bugün</button>
                        <button type="button" onClick={yariniSec} style={{fontSize: '12px', padding: '8px 12px', borderRadius: '6px', background: darkMode ? '#27272a' : '#f4f4f5', border: 'none', color: darkMode ? '#fafafa' : '#09090b', cursor: 'pointer', fontWeight: 500}}>Yarın</button>
                      </div>
                    )}
                    <input
                      id="son-tarih"
                      type="date"
                      value={secilenTarih}
                      onChange={(e) => setSecilenTarih(e.target.value)}
                      style={{ flex: 1, background: darkMode ? '#27272a' : '#f4f4f5', border: 'none', color: darkMode ? '#fafafa' : '#09090b', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, fontSize: '14px', padding: '8px 12px', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <button type="submit" aria-label="Görevi Ekle" style={{ background: darkMode ? '#7c3aed' : '#6366f1', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', height: 'fit-content' }}>
                  Ekle
                </button>
              </div>
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
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.4 }}>
              <CheckCircleSolid width={48} height={48} color={darkMode ? '#71717a' : '#a1a1aa'} style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', fontWeight: 500, color: darkMode ? '#fafafa' : '#09090b' }}>{bosMesaj}</h3>
            </div>
          )}
          
        </div>
      </main>

      {/* Madde 19: Anlik Bildirim (Toast) Gosterimi */}
      <AnimatePresence>
        {bildirim && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: darkMode ? '#fafafa' : '#18181b', color: darkMode ? '#09090b' : '#fafafa', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 600, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', zIndex: 999 }}
          >
            {bildirim}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}