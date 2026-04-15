# Vora Mobile - API ve State Yönetimi

Uygulamanın veri trafiği, frontend'deki (React) yapıya sadık kalınarak fakat mobil özelindeki gereksinimlere (örneğin `AsyncStorage`) göre uyarlanacaktır.

## 📡 Axios Yapısı
Frontend'deki `api.ts` mantığı aynen korunacaktır.

1.  **Interceptors:** İsteklerde `Authorization` başlığına token eklenecek.
2.  **Refresh Token:** 401 hatası alındığında otomatik olarak yeni token alınacak.
3.  **Hata Yönetimi:** İnternet bağlantısı yoksa veya sunucuya ulaşılamıyorsa kullanıcıya `Toast` mesajı gösterilecek.

```typescript
// Önemli: Mobilde localhost yerine IP adresi kullanılmalı.
// Geliştirme aşamasında: http://YOUR_LOCAL_IP:3002
```

## 🧠 Zustand (State Management)
Frontend'deki `useAppStore` ve `useAuthStore` mantığı mobil için sadeleştirilecek:

-   **AuthStore:** Kullanıcı bilgileri ve token'ları yönetir. `AsyncStorage` ile kalıcı hale getirilir.
-   **KitchenStore:** Dijital kiler (Inventory) ve yiyecek arama sonuçlarını tutar.
-   **PersonaStore:** Mevcut aktif persona ve renk paletini yönetir.

## 🔑 Güvenli Depolama (Persistence)
Mobilde `localStorage` yerine şu iki yöntemi kullanacağız:

1.  **AsyncStorage:** Tema tercihleri, onboarding durumu gibi hassas olmayan veriler için.
2.  **Expo SecureStore (Opsiyonel):** Şifrelenmiş token depolama için (Daha güvenli).

## 📴 Offline Desteği
Uygulamanın offline modda da çalışabilmesi için:
-   Dashboard verileri çekildikten sonra lokale (Zustand persist) kaydedilecek.
-   Kullanıcı internet yokken verileri görebilecek, ancak veri girişi için uyarı alacak (ileride queue sistemi eklenebilir).
