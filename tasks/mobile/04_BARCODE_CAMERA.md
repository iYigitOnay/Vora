# Vora Mobile - Barkod Tarama ve Kamera Entegrasyonu

Vora'nın mobildeki en büyük avantajı, yiyecekleri manuel girmek yerine saniyeler içinde barkod ile tanıtabilmektir.

## 📸 Teknoloji Seçimi
- **Kütüphane:** `expo-camera` (veya `expo-barcode-scanner`).
- **Neden:** Native performansa yakın hız, kolay kurulum ve hem Android hem iOS uyumu.

## 🛠 Kullanım Senaryoları
1.  **Yeni Yiyecek Ekleme:** Kullanıcı marketten aldığı bir ürünü taratır. Eğer veritabanında (Food tablosu) varsa direkt eklenir, yoksa kullanıcıdan 100g değerlerini girmesi istenir.
2.  **Kiler Yönetimi:** Ürün kiler listesine eklenirken barkod ile tanımlanır, böylece stok takibi hatasız yapılır.
3.  **Öğün Kaydı:** Öğün eklerken "Tara ve Ekle" butonu ile hızlıca giriş yapılır.

## 🏗 Teknik Akış (Workflow)
1.  **İzinler:** Uygulama ilk açılışta veya tarama ekranında kamera izni ister.
2.  **Tarama:** Kamera katmanı üzerinde bir "Tarama Çerçevesi" (Overlay) gösterilir.
3.  **API Sorgusu:** Okunan barkod (EAN-13 vb.) backend'deki `/food/barcode/:code` endpoint'ine gönderilir.
4.  **Sonuç:**
    -   *Bulunduysa:* Yiyecek detayları ve porsiyon seçimi ekranı açılır.
    -   *Bulunamadıysa:* "Bu ürünü Vora topluluğuna kazandır!" mesajıyla yeni yiyecek formu açılır.

## 🧩 UI/UX Detayları
- **Hızlı Odaklanma:** Kamera açılır açılmaz odağı merkeze almalı.
- **Görsel Geri Bildirim:** Barkod başarıyla okunduğunda hafif bir titreşim (Haptic Feedback) ve onay animasyonu gösterilecek.
- **Karanlık Mod/Dinamik Tema:** Kamera arayüzü, seçilen Persona'nın renklerine (örn: Forge Mode için Amber çerçeve) uyum sağlayacak.
