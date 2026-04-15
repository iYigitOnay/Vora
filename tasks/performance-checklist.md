# Vora Performance Checklist

## Biten İşlemler (Fixed Issues)

- [x] **[CRITICAL] Server Component Sınırı:** `app/layout.tsx` dosyasındaki `'use client'` ibaresi kaldırılarak kök layout Server Component haline getirildi. Sidebar ve `usePathname` mantığı yeni oluşturulan `ClientLayoutProvider.tsx`'e taşındı.
- [x] **[HIGH] Inline Utils (cn):** `layout.tsx` ve `Sidebar.tsx` içinde tekrar eden inline `cn` (clsx + tailwind-merge) fonksiyonu `src/lib/utils.ts` olarak merkezi bir paylaşımlı dosyaya çıkarıldı.
- [x] **[MEDIUM] Re-render & Memoization Optimizasyonu:**
  - Ana sayfadaki `BentoCard` ve günlükteki `DiaryCard` bileşenleri `React.memo` ile sarmalandı.
  - `page.tsx` ve `diary/page.tsx` içindeki fonksiyonlar (`fetchSummary`, `handleAddWater`, `handleManualSubmit`, `fetchLogs`, `onScanSuccess`) inline olmaktan çıkarılıp `useCallback` ile belleğe (memoized) alındı.
- [x] **[MEDIUM] Görsel Optimizasyonu:** `auth/page.tsx` içerisindeki `vorakurt.png` görseline hızlı LCP (Largest Contentful Paint) performansı için `priority` attribute'u eklendi.
- [x] **[MEDIUM] Animasyon Jank Hataları:** Modal ve kartların açılıp kapanmasında yaşanan ~10fps'lik takılmaların ana sebebi olan `backdrop-blur-xl` efektleri kaldırılarak FPS sorunu halledilmişti (önceki aşamada).

## Önceliklendirilen Düzeltme Planı (Priority Order)

### PHASE 1 — Critical (Tamamlandı)

- ✅ Root layout.tsx dosyasının 'use client' etiketinden kurtarılması ve render yükünün sunucuya alınması.

### PHASE 2 — High (Tamamlandı)

- ✅ Re-render optimizasyonlarının yapılması (Gereksiz Render'ların Memoization ile Engellenmesi).
- ✅ Utils fonksiyonlarının (`cn`) dışarı alınması.
- ✅ Aşırı yük yaratan görsel blur (backdrop-blur) CSS class'larının kaldırılması.

### PHASE 3 — Medium (Gelecek Sprintler İçin)

- 🔲 Zustand store içerisindeki veriler için Selector pattern (örn: `useThemeStore((state) => state.theme)` yapısı zaten var, diğer stateler geldiğinde buna dikkat edilmesi).
- 🔲 İleri düzey `fetch` işlemleri için React Server Components veya `use()`/`Suspense` boundary yapılarının tam adaptasyonu.

### PHASE 4 — Low (Gelecek Sprintler İçin)

- 🔲 `package.json` üzerinden unused (kullanılmayan) paket taraması ve Tree-Shaking optimizasyonları (Örn: `lodash` yerine `lodash-es` benzeri yapılar).

## Expected Improvements (Beklenen İyileşmeler)

- **FOUC (Flash of Unstyled Content):** Tema geçişindeki saniyelik siyah ekran hatası `layout.tsx` head'ine eklenen senkron script ile çözüldü.
- **Initial Page Load & Bundle Size:** `layout.tsx` dosyasından `'use client'` kaldırılarak tüm uygulamanın gereksiz yere Client-Side hydrate edilmesi engellendi, JS bundle boyutu küçültüldü.
- **Animation FPS:** Özellikle modallarda / kartlarda yaşanan 10 FPS drop (jank), `backdrop-blur` temizliği ile 60 FPS akıcılığına ulaştı.
- **Re-Render Performansı:** `React.memo` ve `useCallback` sayesinde klavyeden her harf girişinde ya da sayfa içi basit state değişimlerinde (`searchQuery` gibi) tüm ağacın (BentoCard, DiaryCard) tekrar render olması engellendi.

> **Not:** React Profiler üzerinden "Record why each component rendered while profiling" özelliği açılarak BentoCard ve DiaryCard'ın gereksiz render olup olmadığı test edilebilir. Chrome DevTools üzerinden FPS (Performance sekmesi) değerleri kontrol edilmelidir.
