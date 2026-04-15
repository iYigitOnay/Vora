# Vora - Ürün Vizyonu ve Yol Haritası (Product Vision & Roadmap)

## 1. Temel Felsefe

Vora; sadece bir kalori takip uygulaması değil, bir **"Sürdürülebilir Sağlık Mimarisi"** ve **"Holistik Rehabilitasyon"** asistanıdır. Kullanıcıyı persona sistemi (Obsidian, Charcoal, Arctic) ile motive eder ve veri odaklı (Dinamik Su, Akıllı Kiler) bir deneyim sunar.

## 2. Sayfa Yapısı ve Navigasyon

- **Ana Sayfa:** Enerji dengesi, Vora Flow (Streak) ve hızlı aksiyonların olduğu kontrol merkezi.
- **Günlük:** Öğünlerin ve su tüketiminin detaylı takip edildiği alan.
- **Mutfağım:**
  - _Besin Kütüphanesi:_ Kayıtlı besinler ve öğün kombinasyonları (Örn: "Standart Kahvaltım").
  - _Dijital Kiler:_ Stok takibi (Pirinç, supplement vb.). Tüketim yapıldıkça stoktan otomatik düşer.
- **Analiz:** Kilo tahminleme, makro dağılımı ve gelişim raporları.
- **Diyetisyenim:** Uzmanlarla iletişim alanı (Ödeme sonrası numara/iletişim aktif olur).
- **Profil:** Fiziksel veriler ve Persona yönetimi.

## 3. Özellik Seti (Feature Set)

### Standart (Ücretsiz)

- Statik su hedefi.
- Manuel besin girişi.
- Sınırsız Barkod tarama.
- Son 7 günlük makro geçmişi.

### Premium & Elite (Gelecek Planı)

- **Dinamik Su:** Hava durumu (Sıcaklık/Nem) + Aktivite seviyesine göre anlık hedef güncelleme.
- **Vora Flow:** Duolingo tarzı streak. (1 Öğün + %70 Su hedefi = +1 Flow).
- **Akıllı Kiler:** Stok azaldığında uyarı ve otomatik miktar düşüşü.
- **Tahminleme:** Kilo hedefine ulaşılacak net tarih simülasyonu.
- **Supplement Guard:** Supplement stok takibi ve bitme uyarısı.

## 4. Uygulama Kuralları

- **İkonlar:** Sadece `lucide-react` kütüphanesi kullanılacak.
- **Dil:** Türkçe (Teknik terimler hariç).
- **Kod:** CUID2 ID yapısı, Prisma 6, NestJS/Next.js mimarisi.

---

## Yol Haritası (Yürütme Planı)

### Aşama 1: Temel Navigasyon (Tamamlanıyor)

- [x] Sidebar menü kalemlerinin güncellenmesi.
- [ ] Ana sayfa (Hub) bileşenlerinin isimlendirmelerinin Türkçeleştirilmesi.

### Aşama 2: Veri Yapısı (Backend)

- [ ] Prisma Schema'ya `Inventory` ve `MealTemplate` modellerinin eklenmesi.
- [ ] `DashboardService` içinde "Vora Flow" ve "Dinamik Su" mantığının kurulması.

### Aşama 3: Mutfağım Modülü

- [ ] Besin Kütüphanesi arayüzü.
- [ ] Dijital Kiler arayüzü ve stok yönetim mantığı.

### Aşama 4: Diyetisyenim & Pazaryeri

- [ ] Diyetisyen listeleme ve "Numarayı Gör" (Ödeme simülasyonu) akışı.
