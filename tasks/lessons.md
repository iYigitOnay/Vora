# Vora - Öğrenilen Dersler (Lessons Learned)

## Genel Prensipler

- `planlar.md` projenin "kuzey yıldızı" (North Star) olarak kabul edildi.
- Persona seçimi (Obsidian, Charcoal, Arctic) sadece UI değil, backend ve AI tonunu da etkileyecek şekilde tasarlandı.

## Teknik Dersler

- **Prisma Sürüm Yönetimi:** Prisma 7'deki köklü değişiklikler (`prisma.config.ts`) henüz ekosistemle tam oturmadığı için Prisma 6.2.1 kararlı sürümü tercih edildi. Modern projelerde en yeni sürüm yerine en kararlı (stable) sürümü seçmek "Senior" bir karardır.
- **ID Yapısı (CUID2):** Veritabanı ID'lerinde UUID yerine CUID2 kullanılarak hem tahmin edilebilirlik engellendi hem de yatay ölçekleme (scaling) için sağlam bir temel atıldı.
- **Dockerizasyon:** DB ve Backend'i izole container'larda tutmak, bağımlılık çakışmalarını önledi ve yerel geliştirmeyi hızlandırdı.
- **Atomic Registration:** Kullanıcı ve profil verilerinin tek bir transaction ile oluşturulması, veritabanı bütünlüğünü korumak için elzemdir.
