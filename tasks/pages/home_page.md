# Vora — Home Page (Dashboard) Audit & Fix Log

Bu dosya, Anasayfadaki (Dashboard) tüm hataların, görsel kusurların ve veri bütünlüğü açıklarının takibi için oluşturulmuştur. Bir madde çözülmeden sayfa "tamamlandı" sayılmaz.

## 🚨 Kritik Hatalar (Bugs)
- [ ] **Sıfır (0) Input Çakışması:** Sayısal inputlarda değer silindiğinde `0` kalıyor, yeni sayı yazılınca `050` gibi hatalı görüntüler oluşuyor.
- [ ] **Negatif Gramaj Girişi:** Kullanıcı eksi (`-`) değer girerek günlük kalori tüketimini düşürebiliyor. (Veri manipülasyonu riski).
- [ ] **Ondalık Basamak Taşması:** Makro değerleri (Kcal, Prot vb.) orantılanırken `.toFixed(1)` veya `Math.round()` eksikliği yüzünden tasarım bozuluyor (örn: 373.3333333).

## 💄 Görsel ve UX İyileştirmeler (Polish)
- [ ] **Input Maskeleme:** Sadece rakamlara izin verilecek, maksimum karakter sınırı (5 hane) getirilecek.
- [ ] **Otomatik Focus:** Modal açıldığında input alanına otomatik odaklanma sağlanacak (Zaten var, kontrol edilecek).
- [ ] **Senkronize Hesaplama:** Barkod okutulduğunda ürünün orijinal gramajı (defaultAmount) miktar alanına otomatik yazılacak (Zaten var, kontrol edilecek).

## ✅ Tamamlananlar
- [ ] Enerji Çemberi Geometrisi (Çakışma önlendi)
- [ ] Profesyonel Türkçe Terminoloji
- [ ] Su Çarkı Ocean Blue Entegrasyonu
