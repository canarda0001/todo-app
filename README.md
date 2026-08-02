# Todo App

Basit bir görev listesi uygulaması — sade HTML, CSS ve JavaScript ile.

## Özellikler

- Görev ekleme ve silme
- Tamamlandı işaretleme
- Görev düzenleme (Düzenle butonu veya çift tıklama yerine düzenle butonu)
- Filtreleme: Tümü / Aktif / Tamamlanan
- LocalStorage ile kalıcı saklama

## Çalıştırma

`index.html` dosyasını tarayıcıda açman yeterli. Herhangi bir kurulum gerekmez.

Windows'ta:

```powershell
start index.html
```

Veya dosyaya çift tıkla.

## Dosya yapısı

```
todo-app/
├── index.html   # Sayfa yapısı
├── styles.css   # Görünüm
├── app.js       # Uygulama mantığı
└── README.md
```

## Nasıl çalışır?

1. **HTML** — Form, liste ve şablon (`<template>`) tanımlar.
2. **CSS** — Modern, koyu temalı arayüz.
3. **JavaScript** — Görevleri bir dizi (`todos`) olarak tutar, `localStorage`'a kaydeder ve ekranı günceller.

Temel akış:

```
Kullanıcı görev ekler → todos dizisine eklenir → localStorage'a yazılır → liste yeniden çizilir
```

## Sonraki adımlar (isteğe bağlı)

- Sürükle-bırak ile sıralama
- Tarih / öncelik ekleme
- Backend ile senkronizasyon
