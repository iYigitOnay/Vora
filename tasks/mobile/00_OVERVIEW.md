# Vora Mobile - Genel Bakış ve Mimari

Bu doküman, Vora'nın mobil uygulamasının (iOS/Android) mimarisini ve geliştirme stratejisini tanımlar.

## 📱 Vizyon
Vora Mobile, kullanıcının beslenme ve yaşam tarzını "Flow" (akış) içinde tutmasını sağlayan, görsel olarak zengin (Persona tabanlı) ve hızlı bir deneyim sunmalıdır.

## 🛠 Teknoloji Yığını
- **Framework:** Expo (SDK 50+) - Hızlı geliştirme ve kolay dağıtım için.
- **Language:** TypeScript - Tip güvenliği ve backend/frontend ile uyum için.
- **Styling:** NativeWind (Tailwind CSS for React Native) - Frontend'deki stil alışkanlıklarını korumak için.
- **State Management:** Zustand - Hafif, hızlı ve frontend ile aynı mantıkta.
- **Networking:** Axios + Interceptors - JWT auth ve refresh token yönetimi için.
- **Navigation:** Expo Router (File-based navigation) - Modern ve Next.js benzeri bir yapı.
- **Feedback:** Lottie (Animasyonlar) ve Reanimated (Akıcı geçişler).

## 🧩 Modüler Yapı
Uygulama aşağıdaki ana modüllere ayrılacaktır:
1. **Auth:** Giriş, Kayıt ve Onboarding.
2. **Dashboard:** Günlük özet, kalori takibi ve Vora Flow (Streak).
3. **Diary (Günlük):** Öğün ekleme, yiyecek arama.
4. **Kitchen (Kiler):** Barkod tarama, stok takibi (Inventory).
5. **Persona (Tema):** Dinamik renk paletleri ve yazı tipleri.

## 🚀 Hedefler
- iOS ve Android'de %100 kod paylaşımı.
- Backend ile tam entegrasyon.
- Çevrimdışı (Offline) ilk okuma desteği (Zustand + Storage).
- Barkod tarama ile hızlı veri girişi.
