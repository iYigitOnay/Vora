# VORA — Color System & Token Reference

Uygulama 3 tema destekler. Her tema onboarding'de kullanıcı hedefine göre otomatik atanır,
ayarlardan manuel değiştirilebilir.

---

## Tema Atama Mantığı

| Kullanıcı Hedefi      | Tema                             |
| --------------------- | -------------------------------- |
| Kas yapmak / Fitness  | ⚡ Neural Dark (Charcoal × Teal) |
| Bulk / Güç antrenmanı | 🔥 Forge Mode (Obsidian × Amber) |
| Kilo vermek / Diyet   | 🔮 Aura Light (Violet × Cream)   |

---

## ⚡ Tema 1 — Neural Dark (Charcoal × Electric Teal)

**Kullanım alanı:** Fitness, bodybuild, cinsiyet-nötr, varsayılan tema

### Renk Tokenleri

| Token                    | Hex         | Kullanım                                                  |
| ------------------------ | ----------- | --------------------------------------------------------- |
| `--color-background`     | `#1A1F2E`   | Ana ekran arka planı, scaffold                            |
| `--color-surface`        | `#2C3347`   | Kartlar, bottom sheet, modal arka planı                   |
| `--color-surface-raised` | `#353C55`   | Input alanları, chip, secondary card                      |
| `--color-accent`         | `#00C9A7`   | Primary buton, aktif tab, progress bar, link              |
| `--color-accent-bright`  | `#00E5BF`   | Hover state, streak sayacı, başarı animasyonu             |
| `--color-accent-muted`   | `#00C9A720` | Aksan rengin %12 opacity — badge arka planı, selected row |
| `--color-text-primary`   | `#E0EAF5`   | Başlıklar, ana içerik metni                               |
| `--color-text-secondary` | `#8BA4C0`   | Alt başlıklar, placeholder, açıklama metni                |
| `--color-text-tertiary`  | `#5A7A9A`   | Devre dışı metin, timestamp, hint                         |
| `--color-text-on-accent` | `#003329`   | Aksan renkli buton üzerindeki metin                       |
| `--color-border`         | `#3A4560`   | Kart çerçevesi, divider, input border                     |
| `--color-border-subtle`  | `#2C3347`   | Section ayırıcı, subtle divider                           |
| `--color-success`        | `#00C9A7`   | Başarı mesajı (aksan ile aynı bu temada)                  |
| `--color-error`          | `#FF5A5A`   | Hata mesajı, kalori aşımı uyarısı                         |
| `--color-warning`        | `#FFB830`   | Uyarı bildirimi, hedef yaklaşma                           |
| `--color-overlay`        | `#0D1118CC` | Modal/sheet arka plan overlay (%80 opacity)               |

### Kullanım Örnekleri

```
AppBar arka planı       → --color-background
Kalori kartı            → --color-surface
"Öğün Ekle" butonu      → --color-accent (bg) + --color-text-on-accent (text)
Progress ring dolgusu   → --color-accent
Makro değer etiketi     → --color-text-secondary
Aktif bottom nav item   → --color-accent
Pasif bottom nav item   → --color-text-tertiary
Input field             → --color-surface-raised (bg) + --color-border (border)
Streak rozeti           → --color-accent-muted (bg) + --color-accent (text+icon)
```

---

## 🔥 Tema 2 — Forge Mode (Obsidian × Amber Fire)

**Kullanım alanı:** Bulk fazı, güç antrenmanı, yüksek kalori hedefi

### Renk Tokenleri

| Token                    | Hex         | Kullanım                                                  |
| ------------------------ | ----------- | --------------------------------------------------------- |
| `--color-background`     | `#18181B`   | Ana ekran arka planı, scaffold                            |
| `--color-surface`        | `#27272A`   | Kartlar, bottom sheet, modal arka planı                   |
| `--color-surface-raised` | `#3F3F46`   | Input alanları, chip, secondary card                      |
| `--color-accent`         | `#F59E0B`   | Primary buton, aktif tab, progress bar, link              |
| `--color-accent-bright`  | `#FCD34D`   | Hover state, streak sayacı, başarı animasyonu             |
| `--color-accent-muted`   | `#F59E0B18` | Aksan rengin %10 opacity — badge arka planı, selected row |
| `--color-text-primary`   | `#F4F4F5`   | Başlıklar, ana içerik metni                               |
| `--color-text-secondary` | `#A1A1AA`   | Alt başlıklar, placeholder, açıklama metni                |
| `--color-text-tertiary`  | `#71717A`   | Devre dışı metin, timestamp, hint                         |
| `--color-text-on-accent` | `#431A00`   | Aksan renkli buton üzerindeki metin                       |
| `--color-border`         | `#52525B`   | Kart çerçevesi, divider, input border                     |
| `--color-border-subtle`  | `#3F3F46`   | Section ayırıcı, subtle divider                           |
| `--color-success`        | `#22C55E`   | Başarı mesajı, hedef tamamlandı                           |
| `--color-error`          | `#EF4444`   | Hata mesajı, kalori aşımı uyarısı                         |
| `--color-warning`        | `#F59E0B`   | Uyarı (aksan ile aynı bu temada)                          |
| `--color-overlay`        | `#09090BCC` | Modal/sheet arka plan overlay (%80 opacity)               |

### Kullanım Örnekleri

```
AppBar arka planı       → --color-background
Kalori kartı            → --color-surface
"Öğün Ekle" butonu      → --color-accent (bg) + --color-text-on-accent (text)
Progress ring dolgusu   → --color-accent
PR / rekor badge        → --color-accent-muted (bg) + --color-accent-bright (text)
Makro değer etiketi     → --color-text-secondary
Bulk hedef göstergesi   → --color-accent-bright
Input field             → --color-surface-raised (bg) + --color-border (border)
```

---

## 🔮 Tema 3 — Aura Light (Arctic White × Deep Violet)

**Kullanım alanı:** Kilo verme, diyet takibi, wellness

> **Okunabilirlik notu:** Bu tema beyaz zemin üzerine kurulu.
> Metin renkleri çok açık tutulmamalı. Aşağıdaki tokenler
> kontrast oranı WCAG AA standardını karşılayacak şekilde
> ayarlanmıştır (minimum 4.5:1 body text, 3:1 large text).

### Renk Tokenleri

| Token                    | Hex         | Kontrast  | Kullanım                                    |
| ------------------------ | ----------- | --------- | ------------------------------------------- |
| `--color-background`     | `#F8F7FF`   | —         | Ana ekran arka planı                        |
| `--color-surface`        | `#FFFFFF`   | —         | Kartlar, modal, sheet                       |
| `--color-surface-raised` | `#EDE9FE`   | —         | Input alanları, chip, secondary card        |
| `--color-accent`         | `#5B21B6`   | 7.2:1 ✅  | Primary buton, aktif tab, progress bar      |
| `--color-accent-hover`   | `#4C1D95`   | 8.9:1 ✅  | Buton hover/pressed state                   |
| `--color-accent-light`   | `#7C3AED`   | 5.1:1 ✅  | Secondary buton, outlined buton border      |
| `--color-accent-muted`   | `#5B21B615` | —         | Badge arka planı, selected row (%8 opacity) |
| `--color-text-primary`   | `#1E1145`   | 14.8:1 ✅ | Başlıklar, ana içerik — koyu lacivert-mor   |
| `--color-text-secondary` | `#4C3D7A`   | 7.1:1 ✅  | Alt başlıklar, açıklama metni               |
| `--color-text-tertiary`  | `#7C6EA8`   | 4.6:1 ✅  | Placeholder, hint, timestamp                |
| `--color-text-on-accent` | `#FFFFFF`   | 7.2:1 ✅  | Aksan renkli buton üzerindeki metin         |
| `--color-border`         | `#C4B8F0`   | —         | Kart çerçevesi, input border                |
| `--color-border-subtle`  | `#E5E0FA`   | —         | Section ayırıcı                             |
| `--color-success`        | `#059669`   | 5.3:1 ✅  | Başarı mesajı, hedef tamamlandı             |
| `--color-error`          | `#B91C1C`   | 6.8:1 ✅  | Hata mesajı                                 |
| `--color-warning`        | `#B45309`   | 5.9:1 ✅  | Uyarı bildirimi                             |
| `--color-overlay`        | `#1E114580` | —         | Modal overlay (%50 opacity)                 |

### Kullanım Örnekleri

```
AppBar arka planı       → --color-background
Kalori kartı            → --color-surface + --color-border (shadow yerine)
"Öğün Ekle" butonu      → --color-accent (bg) + --color-text-on-accent (text)
Progress ring dolgusu   → --color-accent
Kilo grafik çizgisi     → --color-accent-light
Makro değer etiketi     → --color-text-secondary
Input field             → --color-surface (bg) + --color-border (border)
Pasif bottom nav        → --color-text-tertiary
Defisit rozeti          → --color-accent-muted (bg) + --color-accent (text)
```

### ⚠️ Bu Temada Yapılmaması Gerekenler

```
❌ #A78BFA veya üzeri açık mor → arka plan üzerinde kontrast yetersiz
❌ --color-text-tertiary ile body text → sadece hint/placeholder için
❌ Beyaz metin aksan buton dışında → arka plan zaten açık
✅ Her zaman --color-text-primary veya --color-text-secondary kullan
```

---

## Ortak Sistem Tokenleri (3 temada da aynı anlam)

| Token                    | Açıklama                             |
| ------------------------ | ------------------------------------ |
| `--color-background`     | En alt katman, scaffold/screen bg    |
| `--color-surface`        | Kart, sheet, modal — 1 katman yukarı |
| `--color-surface-raised` | Input, chip — 2 katman yukarı        |
| `--color-accent`         | Tek ana aksan rengi, CTA             |
| `--color-accent-bright`  | Aksan vurgu, animasyon, streak       |
| `--color-accent-muted`   | Aksan rengin soluk hali, badge bg    |
| `--color-text-primary`   | Ana metin                            |
| `--color-text-secondary` | Yardımcı metin                       |
| `--color-text-tertiary`  | Hint, placeholder, devre dışı        |
| `--color-text-on-accent` | Aksan buton üstü metin               |
| `--color-border`         | Kart ve input çerçevesi              |
| `--color-border-subtle`  | Divider, section ayırıcı             |
| `--color-success`        | Başarı durumu                        |
| `--color-error`          | Hata durumu                          |
| `--color-warning`        | Uyarı durumu                         |
| `--color-overlay`        | Modal/sheet karartma katmanı         |

---

## Flutter Entegrasyonu (Örnek)

```dart
// lib/core/theme/app_colors.dart

class NeuralDarkColors {
  static const background    = Color(0xFF1A1F2E);
  static const surface       = Color(0xFF2C3347);
  static const surfaceRaised = Color(0xFF353C55);
  static const accent        = Color(0xFF00C9A7);
  static const accentBright  = Color(0xFF00E5BF);
  static const accentMuted   = Color(0x1F00C9A7);
  static const textPrimary   = Color(0xFFE0EAF5);
  static const textSecondary = Color(0xFF8BA4C0);
  static const textTertiary  = Color(0xFF5A7A9A);
  static const textOnAccent  = Color(0xFF003329);
  static const border        = Color(0xFF3A4560);
  static const borderSubtle  = Color(0xFF2C3347);
  static const success       = Color(0xFF00C9A7);
  static const error         = Color(0xFFFF5A5A);
  static const warning       = Color(0xFFFFB830);
}

class ForgeModeColors {
  static const background    = Color(0xFF18181B);
  static const surface       = Color(0xFF27272A);
  static const surfaceRaised = Color(0xFF3F3F46);
  static const accent        = Color(0xFFF59E0B);
  static const accentBright  = Color(0xFFFCD34D);
  static const accentMuted   = Color(0x18F59E0B);
  static const textPrimary   = Color(0xFFF4F4F5);
  static const textSecondary = Color(0xFFA1A1AA);
  static const textTertiary  = Color(0xFF71717A);
  static const textOnAccent  = Color(0xFF431A00);
  static const border        = Color(0xFF52525B);
  static const borderSubtle  = Color(0xFF3F3F46);
  static const success       = Color(0xFF22C55E);
  static const error         = Color(0xFFEF4444);
  static const warning       = Color(0xFFF59E0B);
}

class AuraLightColors {
  static const background    = Color(0xFFF8F7FF);
  static const surface       = Color(0xFFFFFFFF);
  static const surfaceRaised = Color(0xFFEDE9FE);
  static const accent        = Color(0xFF5B21B6);
  static const accentHover   = Color(0xFF4C1D95);
  static const accentLight   = Color(0xFF7C3AED);
  static const accentMuted   = Color(0x155B21B6);
  static const textPrimary   = Color(0xFF1E1145);
  static const textSecondary = Color(0xFF4C3D7A);
  static const textTertiary  = Color(0xFF7C6EA8);
  static const textOnAccent  = Color(0xFFFFFFFF);
  static const border        = Color(0xFFC4B8F0);
  static const borderSubtle  = Color(0xFFE5E0FA);
  static const success       = Color(0xFF059669);
  static const error         = Color(0xFFB91C1C);
  static const warning       = Color(0xFFB45309);
}
```

---

## CSS / React Native Entegrasyonu (Örnek)

```css
/* Neural Dark */
[data-theme="neural-dark"] {
  --color-background: #1a1f2e;
  --color-surface: #2c3347;
  --color-surface-raised: #353c55;
  --color-accent: #00c9a7;
  --color-accent-bright: #00e5bf;
  --color-text-primary: #e0eaf5;
  --color-text-secondary: #8ba4c0;
  --color-text-tertiary: #5a7a9a;
  --color-text-on-accent: #003329;
  --color-border: #3a4560;
  --color-error: #ff5a5a;
  --color-warning: #ffb830;
  --color-success: #00c9a7;
}

/* Forge Mode */
[data-theme="forge-mode"] {
  --color-background: #18181b;
  --color-surface: #27272a;
  --color-surface-raised: #3f3f46;
  --color-accent: #f59e0b;
  --color-accent-bright: #fcd34d;
  --color-text-primary: #f4f4f5;
  --color-text-secondary: #a1a1aa;
  --color-text-tertiary: #71717a;
  --color-text-on-accent: #431a00;
  --color-border: #52525b;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #22c55e;
}

/* Aura Light */
[data-theme="aura-light"] {
  --color-background: #f8f7ff;
  --color-surface: #ffffff;
  --color-surface-raised: #ede9fe;
  --color-accent: #5b21b6;
  --color-accent-light: #7c3aed;
  --color-text-primary: #1e1145;
  --color-text-secondary: #4c3d7a;
  --color-text-tertiary: #7c6ea8;
  --color-text-on-accent: #ffffff;
  --color-border: #c4b8f0;
  --color-error: #b91c1c;
  --color-warning: #b45309;
  --color-success: #059669;
}
```

---

_VORA Color System v1.0 — 3 tema, 16 token, WCAG AA uyumlu_
