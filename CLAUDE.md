# Claude Code Kuralları

Bu dosya, Claude Code'un bu projede uyması gereken temel kuralları içerir.

---

## 1. Her Zaman Planla

- Bir göreve başlamadan önce mutlaka plan yap
- TodoWrite aracını kullanarak görevleri listele ve takip et
- Karmaşık görevleri küçük, yönetilebilir adımlara böl
- Plansız kod yazmaya başlama

## 2. Context Farkındalığı

- Kod değiştirmeden önce ilgili dosyaları oku ve anla
- Mevcut kod yapısını ve pattern'leri takip et
- PRD.md ve diğer dokümantasyonları dikkate al
- Projenin genel mimarisini göz önünde bulundur

## 3. Commit Politikası

**ÖNEMLİ: Asla otomatik commit atma!**

- Değişiklikler tamamlandığında kullanıcıya sor: "Commit atmamı ister misiniz?"
- Kullanıcı onay vermeden `git commit` komutu çalıştırma
- Commit mesajını kullanıcıyla birlikte belirle

## 4. Dokümantasyon Güncelliği

- Kod değişikliklerinde ilgili dokümantasyonu da güncelle
- PRD.md, README.md ve diğer dökümanları güncel tut
- Yeni özellikler eklendiğinde dokümantasyona yansıt
- API değişikliklerini dokümante et

## 5. Naming Convention

PRD.md'deki naming convention'lara kesinlikle uy:

| Alan | Convention | Örnek |
|------|------------|-------|
| JS/TS Değişkenler | camelCase | `userName`, `fitScore` |
| React Components | PascalCase | `StartupCard`, `DeckViewer` |
| Python Değişkenler | snake_case | `user_name`, `fit_score` |
| CSS Classes | kebab-case | `startup-card`, `fit-score-badge` |
| DB Tablolar | snake_case (çoğul) | `users`, `pitch_decks` |
| API Endpoints | kebab-case | `/api/startup/deck-analysis` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |

## 6. Import Sıralaması

```typescript
// 1. React/Next.js imports
// 2. Third-party libraries
// 3. Internal components
// 4. Hooks
// 5. Utils/Lib
// 6. Types
// 7. Styles
```

## 7. API Response Formatı

Tüm API yanıtları tutarlı formatta olmalı:

```json
// Başarılı
{ "success": true, "data": { ... } }

// Hata
{ "success": false, "error": { "code": "...", "message": "..." } }
```

## 8. Güvenlik (Demo-Safe Mode)

> **HACKATHON MODU:** Hızlı geliştirme için minimal güvenlik.

### Demo-Safe Kuralları
- `.env` dosyalarını asla commit etme
- API key, secret gibi hassas bilgileri kodda bırakma
- Environment variable kullan

### Hackathon'da YAPMA
- RLS policy yazma (kapalı)
- CORS kısıtlaması ekleme (wildcard `*`)
- Email verification açma (kapalı)
- Rate limiting ekleme
- Complex validation yazma

### Neden?
- Güvenlik debug'u = zaman kaybı
- Jüri güvenlik test etmeyecek
- Production'da aktif edilir

## 9. Monorepo Yapısı

Klasör yapısını koru:

```
deckmate/
├── frontend/    # Next.js
├── backend/     # FastAPI
├── ai/          # AI Services
├── database/    # Migrations
└── docs/        # Documentation
```

## 10. Test Yazma

- Kritik fonksiyonlar için test yaz
- API endpoint'leri test et
- Edge case'leri düşün

## 11. Error Handling

- Kullanıcıya anlamlı hata mesajları göster
- Console.log yerine proper logging kullan
- Try-catch bloklarını doğru kullan

## 12. Dil Tutarlılığı

- **Kod:** İngilizce (değişkenler, fonksiyonlar, yorumlar)
- **UI/Arayüz:** İngilizce
- **Dokümantasyon:** Türkçe veya İngilizce (tutarlı ol)

---

## Ek Notlar

- Kullanıcıya her zaman ne yaptığını açıkla
- Belirsiz durumlarda soru sor
- Basit ve anlaşılır çözümler üret
- Over-engineering'den kaçın
- KISS (Keep It Simple, Stupid) prensibini uygula
