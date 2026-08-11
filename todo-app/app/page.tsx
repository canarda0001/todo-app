'use client';

import { useState, useEffect } from 'react';
// iconoir'den ikonlari aldik
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
  
  // edit isleri icin state'ler
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // menudeki filtre (hepsi, aktif, biten)
  const [filtre, setFiltre] = useState<'hepsi' | 'aktif' | 'biten'>('hepsi');

  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Ilk acilista localden verileri cek
  useEffect(() => {
    // ocean temasi icin key'leri degistirdim, eskilerle patlamasin
    const kayitliGorevler = localStorage.getItem('my_todos_ocean');
    const kayitliTema = localStorage.getItem('my_theme_ocean');

    if (kayitliGorevler) {
      try { 
        setTodos(JSON.parse(kayitliGorevler)); 
      } catch (e) {
        console.log("Localden veri cekerken cortladik:", e);
      }
    }
    if (kayitliTema) {
      setDarkMode(kayitliTema === 'dark');
    }
    setIsLoaded(true); // hydration hatasindan kurtulmak icin
  }, []);

  // 2. Arka plan ve Deep Ocean gradientleri
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('my_todos_ocean', JSON.stringify(todos));
      localStorage.setItem('my_theme_ocean', darkMode ? 'dark' : 'light');
      
      document.body.style.margin = '0';
      document.body.style.overflow = 'hidden'; 
      document.body.style.transition = 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

      // Okyanus temasi renkleri
      if (darkMode) {
        // Derin lacivert ve okyanus mavisi
        document.body.style.background = 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #0891b2 100%)';
        document.body.style.color = '#e2e8f0';
      } else {
        // Sig su / turkuaz tonlari
        document.body.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)';
        document.body.style.color = '#0f172a';
      }
    }
  }, [todos, darkMode, isLoaded]);

  const gorevEkle = (e: React.FormEvent) => {
    e.preventDefault();
    // bos girerse direkt salla
    if (!yeniGorev.trim()) return; 

    const yeniItem = {
      id: Date.now(),
      text: yeniGorev.trim(),
      completed: false,
      dueDate: secilenTarih || undefined,
    };

    setTodos([yeniItem, ...todos]); // uste eklensin
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

  // Filtreye gore ekrana basilacaklar
  const gosterilecekler = todos.filter(todo => {
    if (filtre === 'aktif') return !todo.completed;
    if (filtre === 'biten') return todo.completed;
    return true; 
  });

  // Sol menudeki istatistik sayilari
  const toplamSayi = todos.length;
  const aktifSayi = todos.filter(t => !t.completed).length;
  const bitenSayi = toplamSayi - aktifSayi;

  // Tarihi sekilli gosterme (okyanus renkleriyle)
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
      renk = "#ef4444"; // kirmizi
    } else if (farkGun === 0) { 
      yazi = "Bugün"; 
      renk = darkMode ? "#38bdf8" : "#0284c7"; // acik mavi
    } else if (farkGun === 1) { 
      yazi = "Yarın"; 
      renk = darkMode ? "#2dd4bf" : "#0d9488"; // turkuaz
    } else { 
      yazi = `${farkGun} gün kaldı`; 
      renk = darkMode ? '#94a3b8' : '#64748b'; // gri
    }

    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: renk, fontWeight: 700, background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)', padding: '4px 10px', borderRadius: '8px', border: `1px solid ${renk}55` }}>
        <Calendar width={16} height={16} />
        {yazi}
      </span>
    );
  };

  if (!isLoaded) return null;

  // Okyanus temasi icin cam efekti
  const anaCamStili = {
    background: darkMode ? 'rgba(2, 6, 23, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: darkMode ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid rgba(14, 165, 233, 0.3)',
    boxShadow: darkMode ? '0 0 30px rgba(8, 145, 178, 0.15)' : '0 10px 30px rgba(0, 0, 0, 0.05)'
  };

  const formCamStili = {
    background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(12px)',
    border: darkMode ? '1px solid rgba(34, 211, 238, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '16px'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* SOL TARAFTAKI MENU KISMI */}
      <aside style={{ width: '280px', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px', ...anaCamStili }}>
        
        {/* Ust kisim logo ve buton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', background: darkMode ? 'linear-gradient(to right, #38bdf8, #2dd4bf)' : 'linear-gradient(to right, #0369a1, #0f766e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OceanTask</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#38bdf8' : '#0369a1', display: 'flex' }}
          >
            {darkMode ? <SunLight width={24} height={24} /> : <HalfMoon width={24} height={24} />}
          </button>
        </div>

        {/* Filtre sekmeleri */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: darkMode ? '#38bdf8' : '#0369a1', textTransform: 'uppercase', letterSpacing: '2px', paddingLeft: '10px', marginBottom: '4px' }}>Dalgakıran</p>
          
          {(['hepsi', 'aktif', 'biten'] as const).map((durum) => (
            <button
              key={durum}
              onClick={() => setFiltre(durum)}
              style={{
                background: filtre === durum ? (darkMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(14, 165, 233, 0.15)') : 'transparent',
                border: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                color: filtre === durum ? (darkMode ? '#38bdf8' : '#0284c7') : (darkMode ? '#cbd5e1' : '#334155'),
                fontWeight: filtre === durum ? 700 : 500,
                transition: 'all 0.3s ease',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {durum === 'hepsi' ? 'Tüm Sular' : durum === 'aktif' ? 'Dalgalananlar' : 'Durgunlar'}
            </button>
          ))}
        </nav>

        {/* Istatistik Paneli */}
        <div style={{ marginTop: 'auto', padding: '20px', ...formCamStili }}>
          <h3 style={{ fontSize: '12px', margin: '0 0 16px 0', color: darkMode ? '#2dd4bf' : '#0f766e', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Derinlik Özeti</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}>Toplam</span>
            <span style={{ fontWeight: 700 }}>{toplamSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}>Aktif</span>
            <span style={{ fontWeight: 700, color: darkMode ? '#38bdf8' : '#0284c7' }}>{aktifSayi}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 500 }}>Biten</span>
            <span style={{ fontWeight: 700, opacity: 0.5 }}>{bitenSayi}</span>
          </div>
        </div>
      </aside>

      {/* SAG TARAF - Todo listesi buraya basiliyor */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '50px 80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-1px' }}>
              {filtre === 'hepsi' ? 'Tüm Sular' : filtre === 'aktif' ? 'Dalgalananlar' : 'Durgunlar'}
            </h2>
            <p style={{ fontSize: '16px', color: darkMode ? '#38bdf8' : '#0284c7', margin: 0, fontWeight: 500 }}>Okyanusun derinliklerinde kaybolma...</p>
          </header>

          {/* Eklemek icin form */}
          <form onSubmit={gorevEkle} style={{ 
            display: 'flex', 
            gap: '16px', 
            marginBottom: '50px', 
            padding: '14px', 
            ...formCamStili,
            boxShadow: darkMode ? '0 0 20px rgba(8, 145, 178, 0.15)' : '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <Plus width={24} height={24} color={darkMode ? '#2dd4bf' : '#0d9488'} />
              <input
                type="text"
                placeholder="Denize yeni bir not bırak..."
                value={yeniGorev}
                onChange={(e) => setYeniGorev(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', outline: 'none', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '17px', fontWeight: 500 }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', borderLeft: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', paddingLeft: '16px' }}>
              <input
                type="date"
                value={secilenTarih}
                onChange={(e) => setSecilenTarih(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: darkMode ? '#38bdf8' : '#0284c7', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '14px' }}
              />
            </div>
            
            <button type="submit" style={{ background: darkMode ? 'rgba(56, 189, 248, 0.2)' : '#0284c7', color: darkMode ? '#38bdf8' : '#fff', border: darkMode ? '1px solid rgba(56, 189, 248, 0.5)' : 'none', padding: '0 28px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', fontSize: '15px', transition: 'all 0.2s' }}>
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
                background: darkMode ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                borderTop: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                borderRight: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                borderBottom: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                borderLeft: todo.completed ? '4px solid #64748b' : (darkMode ? '4px solid #2dd4bf' : '4px solid #0d9488'),
                borderRadius: '16px'
              }}>
                
                <button onClick={() => durumuDegistir(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, color: todo.completed ? (darkMode ? '#64748b' : '#94a3b8') : (darkMode ? '#38bdf8' : '#0284c7') }}>
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
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', borderBottom: `2px solid ${darkMode ? '#38bdf8' : '#0284c7'}`, outline: 'none', color: darkMode ? '#f8fafc' : '#0f172a', fontSize: '17px', padding: '4px 8px', borderRadius: '4px', fontWeight: 500 }}
                    />
                  ) : (
                    <span style={{ fontSize: '17px', fontWeight: 500, textDecoration: todo.completed ? 'line-through' : 'none', color: darkMode ? '#f8fafc' : '#0f172a' }}>
                      {todo.text}
                    </span>
                  )}
                  
                  {afilliTarih(todo.dueDate)}
                </div>

                <div style={{ display: 'flex', gap: '8px', opacity: todo.completed ? 0 : 1, transition: 'opacity 0.2s' }}>
                  <button onClick={() => duzenlemeyeBasla(todo)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#38bdf8' : '#0284c7', padding: '8px' }}>
                    <EditPencil width={22} height={22} />
                  </button>
                  <button onClick={() => goreviUcur(todo.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px' }}>
                    <Trash width={22} height={22} />
                  </button>
                </div>
              </div>
            ))}

            {/* Bosken cikacak yazi */}
            {gosterilecekler.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.6 }}>
                <CheckCircleSolid width={56} height={56} color={darkMode ? '#38bdf8' : '#0284c7'} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: 500, color: darkMode ? '#f8fafc' : '#0f172a' }}>Deniz durgun.</h3>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}