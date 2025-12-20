# Proje Çalışma Kuralları

## 🚫 Önemli Uyarı
**MAIN branch'e direkt push veya PR atmayın!** 

## 📝 Çalışma Akışı

### Branch Yapısı
- Lütfen değişikliklerinizi **geliştirme (development)** branch'ına yapın
- Sadece `develop` branch'ine yapılan PR'lar ana branch'e merge edilecektir

### Feature Geliştirme
- **Her yeni özellik için yeni bir branch açın**
- Branch isimlendirme örneği: `feature/yeni-ozellik-adi`
- Çalışmanızı tamamladıktan sonra `develop` branch'ine PR açın

## 🔄 Örnek İş Akışı
```bash
# Yeni feature branch oluşturma
git checkout develop
git pull origin develop
git checkout -b feature/yeni-ozellik

# Değişikliklerinizi yapın ve commit edin
git add .
git commit -m "Açıklayıcı commit mesajı"

# Branch'inizi remote'a gönderin
git push origin feature/yeni-ozellik

# GitHub/GitLab üzerinden develop branch'ine PR açın
```

Teşekkürler! 🙏
