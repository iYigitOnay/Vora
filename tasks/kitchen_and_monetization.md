# Vora - Mutfak & Monetizasyon Uygulama Takip Kartı

## 🏛️ Phase 1: Veritabanı ve Mimari (Database & Architecture)
- [x] `schema.prisma` dosyasında `Plan` enum'ı (FREE, PREMIUM, ELITE) eklenmesi.
- [x] `User` modeline `plan` alanı entegrasyonu.
- [x] `MealItem` modeline `deductedFromInventory` bayrağı eklenmesi.
- [x] `Inventory` modelinde `minLimit` ve `unit` (g, ml, adet) güncellemeleri.
- [x] `npx prisma db push` ile veritabanının güncellenmesi.

## ⚙️ Phase 2: Backend Servisleri (Logic & API)
- [x] **InventoryService:** 
    - [x] Stok listeleme, ekleme ve silme API'leri.
    - [x] Stok azaldığında uyarı dönecek `checkThreshold` mantığı.
- [x] **MealService Refactor:** 
    - [x] Öğün eklerken `consumeFromInventory` parametresine göre Prisma Transaction ile stok düşümü.
- [x] **TemplateService:**
    - [x] Ücretsiz kullanıcılar için `max 2` şablon limiti kontrolü.
    - [x] Şablonu doğrudan öğüne çevirme (Apply Template) API'si.

## 🎨 Phase 3: Frontend - Mutfağım UI (`/kitchen`)
- [x] Tab yapısı: "Kilerim" ve "Öğünlerim".
- [x] Kiler listesi ve stok düzenleme arayüzü.
- [x] Şablon listesi ve "Yeni Şablon" oluşturma sihirbazı.
- [x] "Limit Doldu" (Premium Teaser) modalı ve görseli.

## 🚀 Phase 4: Entegrasyon (Diary Sync)
- [x] Günlükte yemek eklerken "Evde Yedim / Kilerimden Düş" switch'i eklenmesi. (ManualAction tamamlandı).
- [ ] BarcodeAction ve SearchAction entegrasyonu.
- [x] Elite kullanıcılar için "Dinamik Hedef" görselleştirmesi (Anasayfada).
- [x] Persona tabanlı akıllı mutfak analizi.

---
## 📝 Notlar
- Elite seviyesi için ileride "Supplement Guard" özel bir alt-sekme olarak tasarlanacaktır.
- Veri tutarlılığı için tüm stok işlemleri Transaction içinde yapılmalıdır.
