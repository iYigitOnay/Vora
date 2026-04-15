# Vora Mobile - Ekranlar ve Kullanıcı Akışı

Uygulamanın ekran yapısı, **Expo Router** (File-based routing) kullanılarak modüler bir yapıda tasarlanacaktır.

## 🏠 Ana Ekran (Dashboard) - `/home`
Bu ekran, kullanıcının o anki durumunu (Vora Flow) tek bakışta gösterir.

-   **Üst Kısım:** Mevcut Persona'ya uygun dinamik arka plan ve karşılama mesajı.
-   **Kalori Halkası:** Günlük kalan kalori ve makrolar (Protein, Karb, Yağ).
-   **Su Takibi:** Hızlı su ekleme butonları (250ml, 500ml).
-   **Vora Flow:** Mevcut streak sayısı ve "Bugün Tamamlandı mı?" görseli.
-   **Öneriler:** O anki öğüne (örn: Kahvaltı) uygun hafif ipuçları.

## 📓 Günlük (Diary) - `/diary`
Öğünlerin listelendiği ve yeni yiyeceklerin eklendiği alan.

-   **Öğün Kartları:** Kahvaltı, Öğle, Akşam, Atıştırmalık.
-   **Yiyecek Ekleme (+):** Arama ekranına veya barkod tarayıcıya yönlendirme.
-   **Hızlı Kayıt:** Sık kullanılan yiyeceklerin listesi.

## 🍳 Dijital Kiler (Kitchen) - `/kitchen`
Stok takibi ve barkod yönetim alanı.

-   **Stok Listesi:** Kilerdeki yiyecekler ve miktarları.
-   **Barkod Tara:** Yeni bir yiyeceği kiler listesine ekleme.
-   **Kritik Stok:** Azalan ürünler için uyarı sistemi.
-   **Yemek Tarifi:** Kilerdeki malzemelerle ne yapılabilir (Opsiyonel).

## 🔬 Uzman Analizi (Specialist) - `/analysis`
Verilerin grafiklerle ve AI yorumlarıyla sunulduğu alan.

-   **Haftalık Grafikler:** Kilo değişimi, kalori dengesi.
-   **Yapay Zeka Yorumu:** "Bu hafta protein alımın düşüktü, biraz daha artırmalısın." gibi tavsiyeler.

## 👤 Profil & Ayarlar - `/profile`
-   **Kişisel Bilgiler:** Yaş, boy, kilo, hedef.
-   **Persona Değiştir:** Uygulamanın temasını anında değiştiren menü.
-   **Plan Yönetimi:** Free/Premium/Elite plan durumu.

## 🔐 Auth (Giriş/Kayıt) - `/auth`
-   **Login:** E-posta ve şifre.
-   **Register:** Onboarding süreci (Boy, kilo, hedef, aktivite seviyesi ve Persona seçimi).
