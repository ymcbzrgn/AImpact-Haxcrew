# DeckMate

## Proje Tanım Dökümanı

**Versiyon:** 1.0  
**Tarih:** 20 Aralık 2025  
**Durum:** AR-GE / Hackathon MVP

---

## 1. Özet

### 1.1 Tek Cümleyle

**DeckMate**, network'ü zayıf startup'larla yatırımcıları güvenli ve veriye dayalı şekilde buluşturan bir karar destek platformu.

### 1.2 Vizyon

> "Ham datayı okusanız bile anlayamayacağınız şeyi sizin için anlamlı hale getirip sunuyoruz. Yatırımı kontrol etmiyoruz — sadece bilgi sunuyoruz."

### 1.3 Temel Değer Önerisi

| Taraf | Değer |
|-------|-------|
| **Startup** | Pitch deck kalitesini artır, görünürlüğü kontrol et, doğru yatırımcıyla güvenli buluş |
| **Yatırımcı** | Ham veri yerine anlamlı içgörü al, hızlı ve objektif karar desteği |
| **İki taraf için** | Aşamalı bilgi paylaşımı, veri güvenliği, kontrollü iletişim |

---

## 2. Problem Tanımı

### 2.1 Startup Tarafı

Network'ü zayıf, daha önce exit yapmamış ve yatırım bulmakta zorlanan girişimler şu sorunlarla karşılaşıyor:

- **Network eksikliği** — Doğru yatırımcıya ulaşamıyorlar
- **Pitch deck kalitesi belirsiz** — Neyin eksik olduğunu bilmiyorlar
- **Kör dövüşü** — Hangi yatırımcının ilgilendiğini göremiyorlar
- **Geri bildirim alamama** — Yüzlerce ret, sıfır yapıcı feedback
- **Veri güvenliği endişesi** — Deck'lerinin kime gittiğini kontrol edemiyorlar

### 2.2 Yatırımcı Tarafı

VC'ler ve melek yatırımcılar da zorlanıyor:

- **Bilgi kirliliği** — Ham veri var, anlamlı içgörü yok
- **Zaman kaybı** — Uyumsuz startup'larla gereksiz görüşmeler
- **Doğrulama zorluğu** — Pitch deck'teki iddialar gerçek mi?
- **Kaçan fırsatlar** — Radar dışı kalan potansiyel yatırımlar
- **Deal flow kaosu** — Dağınık ve yönetilmesi zor süreçler

### 2.3 Ortak Problem

> Yatırımcılar gelen pitch'lerin **%98'ini** reddediyor — çoğu uyumsuzluktan kaynaklanıyor.

---

## 3. Çözüm: DeckMate

DeckMate, **iki tarafı da koruyan** bir karar destek platformu sunar.

### 3.1 Startup İçin

| Özellik | Açıklama |
|---------|----------|
| **Deck Yükleme & AI Analiz** | Pitch deck'ini yükle, güçlü/zayıf yönlerini gör |
| **Profil Oluşturma** | Şirket bilgileri, sektör, aşama, ekip |
| **Görünürlük Kontrolü** | Profilini kimin göreceğini sen seç |
| **Anonim Görüntülenme** | Hangi tip yatırımcıların baktığını gör (isim vermeden) |
| **Aşamalı Paylaşım** | Bilgiyi kontrollü şekilde aç |

### 3.2 Yatırımcı İçin

| Özellik | Açıklama |
|---------|----------|
| **Startup Keşfi** | Filtrelerle uygun startup'ları bul |
| **AI Fit Skoru** | "Bu startup sana ne kadar uygun?" |
| **Anlamlı Özetler** | Ham veri değil, karar desteği |
| **Haber Akışı** | Sektördeki yatırımları tek yerden takip et |
| **Detay Talebi** | İlgilendiğin startup'tan aşamalı bilgi iste |

### 3.3 Platform Felsefesi

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│   "Yatırımı kontrol etmiyoruz, tamamen size bırakıyoruz.      │
│    Biz sadece size bilgiyi sunuyoruz."                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 4. Platform Akışı

### 4.1 Genel Akış

```
STARTUP                                    INVESTOR
───────                                    ────────
1. Kayıt ol                                1. Kayıt ol
2. Profil oluştur                          2. İlgi alanlarını seç
3. Pitch deck yükle                        3. Startup'ları keşfet
4. AI analiz al                            4. Teaser profilleri gör
5. Görünürlük ayarla                       5. AI fit skoru gör
6. Kim baktı? (anonim)                     6. Detay talep et
         │                                          │
         └──────────────┬───────────────────────────┘
                        ▼
              ┌─────────────────────┐
              │   AŞAMALI PAYLAŞIM  │
              │   ────────────────  │
              │   Teaser → Detay    │
              │      → Call         │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  YATIRIM GERÇEKLEŞİR │
              └─────────────────────┘
```

### 4.2 Aşamalı Bilgi Paylaşımı (Progressive Disclosure)

Veri tek seferde açılmaz; aşama bazlı kontrollü paylaşılır:

| Aşama | İçerik | Tetikleyen |
|-------|--------|------------|
| **Aşama 1: Teaser** | Sınırlı profil, teaser deck | Varsayılan görünürlük |
| **Aşama 2: Detay** | Tam profil, full deck | Yatırımcı talebi + Startup onayı |
| **Aşama 3: Call** | Görüşme, metrikler, teklif | Karşılıklı onay |

---

## 5. Güvenlik ve Gizlilik

### 5.1 İki Taraflı Koruma Prensibi

DeckMate, hem startup'ı hem yatırımcıyı korur.

### 5.2 Güvenlik Özellikleri

| Özellik | Açıklama | MVP Durumu |
|---------|----------|------------|
| **Güvenli Viewer** | Dokümanlar indirilemez, sadece görüntülenir | ✅ Aktif |
| **Watermark** | Her görüntülemede kullanıcıya özel damga | ✅ Aktif |
| **Audit Log** | Kim, neyi, ne zaman görüntüledi? | ✅ Basit versiyon |
| **Görünürlük Kontrolü** | Startup, kimlerin göreceğini seçer | ✅ Aktif |
| **Anonim Bildirim** | Yatırımcı ismi vermeden "X kişi baktı" | ✅ Aktif |
| **Şüpheli Davranış Tespiti** | Anormal kullanım risk flag'i | 🔮 Coming Soon |
| **Angel Access Gate** | Melek yatırımcılar için sıkı limitler | 🔮 Coming Soon |

### 5.3 Startup Görünürlük Seçenekleri

Startup, profilinin kimlere görüneceğini kontrol eder:

- Herkese açık
- Sadece doğrulanmış yatırımcılar
- Sadece VC'lere açık
- Sadece belirli yatırımcılara (Whitelist)
- Tamamen gizli

### 5.4 Anonim Görüntülenme Bildirimi

LinkedIn benzeri sistem:

```
┌─────────────────────────────────────────────────────┐
│  📊 Bugün profilinizi görüntüleyenler               │
│  ─────────────────────────────────────              │
│  • 3 yatırımcı görüntüledi                          │
│  • 1'i ⭐⭐⭐⭐⭐ (5 yıldız)                          │
│  • 2'si ⭐⭐⭐ (3 yıldız)                            │
│                                                     │
│  💡 5 yıldızlı bir yatırımcı profilinize baktı!     │
└─────────────────────────────────────────────────────┘
```

Yıldız = Doğrulama seviyesi + yatırım geçmişi + davranış puanı

---

## 6. AI Katmanı

### 6.1 Temel Felsefe

> "AI karar vermez, karar desteği sunar."

DeckMate'in AI'ı ham veriyi anlamlı içgörüye dönüştürür.

### 6.2 AI Özellikleri

#### Startup İçin

| Özellik | Açıklama | MVP Durumu |
|---------|----------|------------|
| **Deck Analizi** | 7 kategoride skorlama | ✅ Aktif |
| **İyileştirme Önerileri** | Aksiyon odaklı feedback | ✅ Aktif |
| **Hazırlık Skoru** | Yatırıma ne kadar hazırsın? | ✅ Aktif |
| **Benchmark Raporu** | Emsal startup'larla kıyas | 🔮 Coming Soon |

#### Yatırımcı İçin

| Özellik | Açıklama | MVP Durumu |
|---------|----------|------------|
| **Fit Skoru** | Startup-yatırımcı uyum analizi | ✅ Aktif |
| **Özet Raporlar** | Anlamlı içgörüler | ✅ Aktif |
| **Haber Analizi** | Sektör yatırım özetleri | ✅ Aktif |
| **Co-Invest Perspektifi** | Benzer fon davranışları | 🔮 Coming Soon |

### 6.3 Skorlama Kategorileri (Deck Analizi)

| Kategori | Ağırlık | Değerlendirme |
|----------|---------|---------------|
| **Çözüm & Ürün** | 20% | Unique value proposition net mi? |
| **Problem Tanımı** | 15% | Gerçek bir acı noktası var mı? |
| **Pazar Büyüklüğü** | 15% | TAM/SAM/SOM mantıklı mı? |
| **İş Modeli** | 15% | Unit economics sağlam mı? |
| **Traction** | 15% | Kanıtlanmış ilerleme var mı? |
| **Takım** | 10% | İlgili deneyim mevcut mu? |
| **Finansal Talep** | 10% | Ne kadar, ne için? |

### 6.4 İyileştirme Öneri Seviyeleri

- 🔴 **Kritik** — Bu olmadan yatırımcı toplantısına girme
- 🟠 **Yüksek** — Güçlü etki, mutlaka ekle
- 🟡 **Orta** — Deck'i güçlendirir
- 🟢 **Düşük** — Nice-to-have

---

## 7. Haber Akışı

### 7.1 Amaç

Startup ve yatırımcıların ekosistemi tek yerden takip etmesi.

### 7.2 İçerik

```
┌─────────────────────────────────────────────────────┐
│  📰 Yatırım Haberleri                               │
│  ─────────────────────                              │
│                                                     │
│  🚀 TechStartup, ABC Ventures'dan $2M aldı          │
│     Sektör: Fintech | Aşama: Seed | Bölge: TR       │
│     AI Özet: Fintech sektöründe 3. bu ayki...       │
│                                                     │
│  🚀 HealthApp, XYZ Capital liderliğinde $5M aldı    │
│     Sektör: HealthTech | Aşama: Series A | Bölge:EU │
│     AI Özet: HealthTech yatırımları artış trendinde │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.3 Filtreler

- Sektör
- Bölge
- Yatırım aşaması
- Yatırım tipi
- Tarih aralığı

---

## 8. Kullanıcı Rolleri

### 8.1 MVP Rolleri

| Rol | Açıklama |
|-----|----------|
| **Startup** | Girişimci / Kurucu |
| **Investor** | Yatırımcı (tek rol) |

### 8.2 Gelecek Roller (Post-MVP)

| Rol | Açıklama |
|-----|----------|
| **Investor - VC** | Kurumsal yatırımcı / Fon |
| **Investor - Angel** | Doğrulanmış melek yatırımcı |
| **Investor - Syndicate Lead** | Melek grubunu yöneten lead |
| **Advisor** | Danışman |
| **Admin** | Platform yöneticisi |

---

## 9. İş Modeli

### 9.1 Gelir Kalemleri

| Segment | Model | Detay |
|---------|-------|-------|
| **Startup** | Abonelik | Cüzi aylık ücret |
| **Yatırımcı** | Abonelik | Daha yüksek aylık ücret |
| **Success Fee** | Komisyon | Yatırım gerçekleşirse **%1** |

### 9.2 Success Fee Koşulları

- Platform üzerinden tanışma/eşleşme sonrası gerçekleşen yatırım
- Kayıt aşamasında kullanıcı tarafından onaylanır
- Belirli dönem içinde geçerli

---

## 10. MVP Kapsamı

### 10.1 Aktif Özellikler (✅)

#### Startup Tarafı
- Kayıt ve profil oluşturma
- Pitch deck yükleme
- AI deck analizi ve skorlama
- İyileştirme önerileri
- Görünürlük kontrolü (mock)
- Anonim görüntülenme bildirimi (mock)

#### Yatırımcı Tarafı
- Kayıt ve profil oluşturma
- Startup keşfi ve filtreleme
- Teaser profil görüntüleme
- AI fit skoru
- Detay talep etme (UI mock)

#### Ortak
- Haber akışı (mock/API data)
- Güvenli deck viewer
- Watermark koruması
- Basit audit log

### 10.2 Coming Soon (🔮)

- Aşamalı paylaşım backend akışı
- Angel Access Gate (limit sistemi)
- Benchmark raporları (derin analiz)
- Claim verification
- Post-deal raporlama
- Şüpheli davranış tespiti
- Rol bazlı yatırımcı ayrımı (VC/Angel/Lead)

---

## 11. Gelecek Vizyon

### 11.1 V2 Özellikleri

| Özellik | Açıklama |
|---------|----------|
| **Angel Access Gate** | Melek yatırımcılar için sıkı kurallar ve limitler |
| **Benchmark+** | Derin emsal analizi |
| **Pitch Deck Studio** | Deck oluşturma ve iyileştirme araçları |
| **Rol Ayrımı** | VC, Angel, Syndicate Lead ayrı roller |

### 11.2 V3 Özellikleri

| Özellik | Açıklama |
|---------|----------|
| **Claim Verification** | Pitch deck iddialarının doğrulanması |
| **Post-Deal Raporlama** | Yatırım sonrası aylık takip |
| **Breach Sistemi** | 3 ay ihlalde yaptırım |
| **Warm Intro Graph** | Referans zinciri ile tanıştırma |

---

## 12. Teknik Özet

### 12.1 Önerilen Stack

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Next.js 14 + Tailwind + shadcn/ui |
| **Backend** | FastAPI (Python 3.11+) |
| **Database** | Supabase (PostgreSQL + Auth + Storage) |
| **AI Engine** | Gemini 1.5 Pro/Flash |
| **Deploy** | Vercel (FE) + Railway (BE) |

### 12.2 Temel Entegrasyonlar

- PDF işleme (pitch deck analizi)
- AI API (Gemini)
- Auth (Supabase)
- Storage (Supabase)
- Haber API (opsiyonel)

---

## 13. Başarı Metrikleri

| Metrik | Açıklama |
|--------|----------|
| **Deck Score Artışı** | Startup'ların ortalama skor iyileşmesi |
| **Aşama 2 Geçiş Oranı** | Teaser'dan detaya geçen görüşme % |
| **Fit Skoru Doğruluğu** | Eşleşme sonrası memnuniyet |
| **Güvenlik İhlali Oranı** | Deck sızıntı/şikayet sayısı |
| **Aktif Kullanıcı** | Aylık aktif startup ve yatırımcı |

---

## 14. Sonuç

**DeckMate**, startup ve yatırımcıyı güvenli, kontrollü ve veriye dayalı şekilde buluşturan bir platform.

- **Startup için:** Hazırlan, görünür ol, güvende kal
- **Yatırımcı için:** Keşfet, anla, doğru kararı ver
- **İkisi için:** Ham veri değil, anlamlı içgörü

---

## 15. İletişim

**Proje:** DeckMate  
**Hackathon:** AImpact 2025  
**Tarih:** 20-24 Aralık 2025

---

*Bu döküman AR-GE aşamasında olup, geliştirme sürecinde güncellenecektir.*
