# Vora Mobile - Kurulum ve Başlangıç Rehberi

Vora mobil uygulamasını geliştirmeye başlamak için bu adımları takip etmelisin.

## 📋 Ön Gereksinimler

- **Node.js:** v18+ yüklü olmalı.
- **Expo Go App:** Telefonuna (iOS veya Android) marketten indirilmeli.
- **Backend:** `backend` klasöründeki servislerin (PostgreSQL dahil) çalışıyor olması gerekir.

## 🚀 Proje Başlatma (Sıfırdan)

Eğer henüz proje klasörü oluşturulmadıysa:

1.  **Klasör Oluştur:** `mkdir mobile && cd mobile`
2.  **Expo Projesini Kur:** `npx create-expo-app@latest . --template tabs-navigation-typescript`
3.  **Gerekli Kütüphaneleri Yükle:**
    ```bash
    npx expo install expo-router expo-constants expo-status-bar expo-linking expo-camera expo-barcode-scanner lucide-react-native zustand axios @react-native-async-storage/async-storage nativewind tailwindcss react-native-reanimated react-native-gesture-handler
    ```
4.  **NativeWind (Tailwind) Yapılandırması:** `tailwind.config.js` ve `global.css` dosyalarını ayarla.

## ⚙️ Çevresel Değişkenler (.env)

Mobil uygulamanın backend ile konuşabilmesi için IP adresini tanımlamalısın:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3002
```

## 📱 Çalıştırma

Geliştirme sunucusunu başlatmak için:

```bash
npx expo start
```

Terminalde çıkan **QR kodu** telefonundaki **Expo Go** uygulamasıyla taratarak uygulamayı canlı olarak görebilirsin.

## 🛠 Dikkat Edilmesi Gerekenler

- **IP Adresi:** Android emülatör veya gerçek cihaz kullanırken `localhost` yerine bilgisayarının yerel IP adresini (örn: 192.168.1.50) kullanmalısın.
- **Hot Reload:** Kodda yaptığın her değişiklik saniyeler içinde telefonuna yansıyacak.
- **Loglar:** Terminalden veya `npx expo start --dev-client` ile detaylı logları takip edebilirsin.
