# Vora Mobile - Persona ve Tema Sistemi

Vora'nın görsel kimliği, seçilen Persona'ya göre dinamik olarak değişen renk paletlerinden oluşur. Mobilde bu sistemi React Native `Context API` veya `Zustand` üzerinden yöneteceğiz.

## 🎨 Persona Tanımları
Backend (Prisma) üzerindeki enum yapısıyla birebir uyumlu olacaktır:

| Persona | Renk Paleti | Karakteristik |
| :--- | :--- | :--- |
| **EMBER_MOSS** | Krem × Orman Yeşili | Doğallık, ferahlık (Default) |
| **NEURAL_DARK** | Gece Mavisi + Teal | Bilimsel veri, derin analiz |
| **FORGE_MODE** | Koyu Gri + Amber | Disiplin, vücut geliştirme |
| **AURA_LIGHT** | Beyaz/Lila + Mor | Wellness, huzur, hafiflik |

## 🛠 Mimari Yaklaşım
Dinamik temayı yönetmek için aşağıdaki yapıyı kullanacağız:

1.  **ThemeProvider:** Uygulamanın en tepesinde (Root Layout) yer alacak ve seçilen Persona'ya göre bir `ThemeObject` dönecek.
2.  **NativeWind (Tailwind):** CSS sınıfları üzerinden tema değişkenlerini (`vars`) kullanacağız. Örn: `className="bg-primary text-textMain"`.
3.  **Lottie Animasyonları:** Seçilen Persona'ya göre (örn: Forge Mode'da daha sert, Aura Light'ta daha yumuşak) animasyonlar yüklenecek.

## 💾 State Yönetimi
Kullanıcının seçtiği Persona, `useAppStore` içinde tutulacak ve hem lokalde (AsyncStorage) saklanacak hem de API üzerinden profil güncellendiğinde senkronize edilecek.

```typescript
// Örnek State Yapısı
interface ThemeState {
  currentPersona: Persona;
  setPersona: (p: Persona) => void;
  colors: ThemeColors;
}
```

## 📱 Görsel Geri Bildirim
Her Persona için özel "Splash Screen" (açılış ekranı) varyasyonları düşünülebilir. Mobil özelinde geçişlerin "smooth" (akıcı) olması için `framer-motion` yerine React Native `Reanimated` kullanılacaktır.
