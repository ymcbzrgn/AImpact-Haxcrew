# 🤖 AI Protocol

> AI Coding Assistant Kuralları | PitchDrill

Bu doküman Claude Code, Cursor ve diğer AI coding assistant'ların bu projede nasıl çalışması gerektiğini tanımlar.

---

## 🚨 Kritik Kurallar

### 1. GIT GÜVENLİĞİ

```
❌ ASLA YAPMA:
   - Otomatik commit atma (kullanıcı açıkça istemeden)
   - main/dev branch'ine direkt push
   - Force push (--force)
   - Başkasının branch'inde çalışma
   - Interactive rebase (-i flag)

✅ HER ZAMAN YAP:
   - Kendi feature branch'inde çalış
   - Commit atmadan önce kullanıcıya sor
   - Değişiklikleri göster, onay al
   - Branch adını kontrol et
```

### 2. BRANCH KURALLARI

```bash
# Çalışmaya başlamadan önce MUTLAKA kontrol et:
git branch --show-current

# Doğru branch'te olduğundan emin ol:
feat/[görev-adı]    # Yeni özellik
fix/[bug-adı]       # Bug fix
```

### 3. COMMIT KURALLARI

```bash
# AI ASLA kendi başına commit atmaz!
# Kullanıcı "commit at" derse:

1. git status ile değişiklikleri göster
2. Commit mesajı öner
3. Onay al
4. Sonra commit at

# Format:
feat: add upload component
fix: audio sync issue
docs: update README
refactor: extract utils
```

---

## 🎯 Kod Prensipleri

### KISS (Keep It Simple, Stupid)

```
❌ YAPMA:
   - Over-engineering
   - Gereksiz abstraction
   - "Gelecekte lazım olur" kodu
   - Kullanılmayan parametreler
   - 3+ seviye nested logic

✅ YAP:
   - En basit çözüm
   - Okunabilir kod
   - Tek sorumluluk
   - Açık isimlendirme
```

### YAGNI (You Aren't Gonna Need It)

```
❌ "Bunu da ekleyeyim, belki lazım olur"
✅ "Sadece istenen feature'ı yap"
```

### DRY (Don't Repeat Yourself)

```
❌ Aynı kodu 2+ yerde yazma
✅ 2. kez yazıyorsan → util/helper'a çıkar
```

---

## 💬 İletişim Protokolü

### Başlamadan Önce

```
1. Görevi anladığını onayla
2. Yaklaşımını kısaca açıkla
3. Belirsizlik varsa SOR
4. Onay al, sonra başla
```

### Çalışırken

```
✅ Yap:
   - Büyük değişikliklerde ara ver, göster
   - Hata alırsan açıkla
   - Alternatif varsa sun

❌ Yapma:
   - Sessizce büyük değişiklikler
   - Hata mesajını gizleme
   - Varsayımlarla ilerleme
```

### Tamamlayınca

```
1. Ne yaptığını özetle
2. Test edilmesi gerekenleri listele
3. Bilinen limitasyonları belirt
```

---

## 🔧 Teknik Kurallar

### Dosya Değişiklikleri

```
❌ YAPMA:
   - .env dosyalarını değiştirme
   - package.json'a gereksiz paket ekleme
   - Mevcut çalışan kodu "iyileştirme" adına bozma
   - Config dosyalarını sormadan değiştirme

✅ YAP:
   - Sadece istenen dosyalarda çalış
   - Yeni dosya oluşturmadan önce sor
   - Silmeden önce sor
```

### Kod Stili

```
# TECHNICAL.md'deki kurallara uy:
- Frontend: camelCase, PascalCase components
- Backend: snake_case
- Import sıralaması: React → External → Internal → Local → Types
```

### Error Handling

```typescript
// ❌ Kötü
try { ... } catch (e) { console.log(e) }

// ✅ İyi
try {
  ...
} catch (error) {
  console.error('[ComponentName] Failed to do X:', error)
  // Kullanıcıya anlamlı mesaj göster
}
```

### Console Logs

```
❌ console.log("test")
❌ console.log(data)

✅ Geliştirme bitince tüm console.log'ları sil
✅ Sadece error logging bırak
```

---

## 🧪 Test Yaklaşımı

```
# Hackathon'da:
- Unit test YAZMA (vakit yok)
- Manuel test et
- Edge case'leri not al

# Ama her zaman:
- Kodu test etmeden "bitti" deme
- Hata alıyorsan düzelt, sonra tamamla
```

---

## 📁 Dosya Organizasyonu

### Yeni Dosya Oluşturma

```
1. TECHNICAL.md'deki yapıya uy
2. Doğru klasörde oluştur
3. Naming convention'a uy
```

### Import Ekleme

```typescript
// Önce mevcut import'ları kontrol et
// Duplicate import ekleme
// Kullanılmayan import bırakma
```

---

## 🚫 Yasaklar

```
❌ rm -rf (tehlikeli komutlar)
❌ Başka repo'ya erişim
❌ API key'leri koda yazma
❌ Hardcoded secret
❌ node_modules'a dokunma
❌ .git klasörüne müdahale
❌ Kullanıcının onayı olmadan dosya silme
```

---

## 🎮 Cursor Özel

```
# .cursorrules dosyası için aynı kurallar geçerli

# Agent Mode'da:
- Her adımda onay iste
- Checkpoint'leri kullan
- Büyük değişikliklerde dur
```

---

## 🖥️ Claude Code Özel

```
# CLAUDE.md dosyası için aynı kurallar geçerli

# Terminal'de:
- Komut çalıştırmadan önce göster
- Destructive komutlarda uyar
- Uzun sürecek işlemlerde bilgilendir
```

---

## 📋 Checklist

Her görev öncesi:

```
□ Doğru branch'te miyim?
□ Görevi anladım mı?
□ Yaklaşımım basit mi?
```

Her görev sonrası:

```
□ Kod çalışıyor mu?
□ Console.log temizledim mi?
□ Gereksiz dosya oluşturmadım mı?
□ Commit atmam istendi mi?
```

---

## 🆘 Sorun Durumunda

```
1. DURMA, panik yapma
2. Hatayı kullanıcıya göster
3. Ne denediğini açıkla
4. Öneri sun
5. Onay olmadan devam etme
```

---

## 📝 Bu Dokümanı Güncelleme

Yeni kural eklenecekse:
1. PR ile öner
2. Tüm ekip görsün
3. Merge sonrası herkes güncelle

---

*Bu protokol tüm AI araçları için geçerlidir.*
*Son güncelleme: ___*
