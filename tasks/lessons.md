# Vora - Öğrenilen Dersler (Lessons Learned)

## Genel Prensipler

- `planlar.md` projenin "kuzey yıldızı" (North Star) olarak kabul edildi.
- Persona seçimi (Obsidian, Charcoal, Arctic) sadece UI değil, backend ve AI tonunu da etkileyecek şekilde tasarlandı.

## Teknik Dersler

- **Port Yönetimi ve Environment:** Backend ve Frontend arasındaki port uyumsuzlukları (3001 vs 3002) "Network Error" hatalarının birincil sebebidir. `.env.local` kullanımı bu tür uyumsuzlukları merkezi olarak çözmek için en sağlıklı yoldur.
- **Git Çakışma Yönetimi:** Merge conflict işaretleri (`<<<<<<<`) bazen editörde görünmese bile derleyici tarafından yakalanabilir. `git status` ve `git diff` ile dosya durumunu doğrulamak, ardından backend'i restart etmek (stale build'leri temizlemek için) kritik bir adımdır.
- **Prisma Sürüm Yönetimi:** Prisma 7'deki köklü değişiklikler (`prisma.config.ts`) henüz ekosistemle tam oturmadığı için Prisma 6.2.1 kararlı sürümü tercih edildi. Modern projelerde en yeni sürüm yerine en kararlı (stable) sürümü seçmek "Senior" bir karardır.
- **ID Yapısı (CUID2):** Veritabanı ID'lerinde UUID yerine CUID2 kullanılarak hem tahmin edilebilirlik engellendi hem de yatay ölçekleme (scaling) için sağlam bir temel atıldı.
- **Dockerizasyon:** DB ve Backend'i izole container'larda tutmak, bağımlılık çakışmalarını önledi ve yerel geliştirmeyi hızlandırdı.
- **Atomic Registration:** Kullanıcı ve profil verilerinin tek bir transaction ile oluşturulması, veritabanı bütünlüğünü korumak için elzemdir.
<<<<<<< HEAD
- **Bağımlılık ve İstemci Yönetimi:** Backend projesinde TypeScript hatalarının ana nedeni eksik `node_modules` ve oluşturulmamış (generated) Prisma istemcisi olabilir. Geliştirme ortamında ilk adım olarak `npm install` ve `npx prisma generate` komutlarının çalıştırılması, geliştirme sürecini hızlandırır ve hataların kaynağını doğru tespit etmeyi sağlar.
=======
>>>>>>> 0f7393460c8646794544f79c054607f1ee9ab49c
- **Performans vs Estetik (Blur):** Cam (glassmorphism) efekti için `backdrop-blur-xl` yerine `sm` kullanmak, görsel derinliği korurken 60 FPS akıcılığını sağlamak için kritik bir "Senior" tercihidir.
