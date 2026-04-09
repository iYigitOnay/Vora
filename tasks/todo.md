# Vora - Geliştirme Aşamasında Hep Bağlı Kalınıcaklar

## Frontend Kısmı İçin
 - İconlar asla çizilmiyicek gerekli icon kütüphanelerinden profsyonel ve uygun şekilde alınıp kullanılıcak.
 



# Vora - Backend Görev Listesi (Docker, Auth & Persona Temelli Profil)

## 1. Hazırlık ve Dockerizasyon
- [x] `tasks/todo.md` ve `tasks/lessons.md` oluşturuldu.
- [x] NestJS projesi `backend` klasöründe başlatıldı.
- [x] Docker konfigürasyonu:
    - [x] `Dockerfile` (Development) oluşturuldu.
    - [x] `docker-compose.yml` (PostgreSQL 16) hazırlandı.
- [x] Prisma 6 Kurulumu:
    - [x] `prisma init` ve schema tasarımı tamamlandı.
    - [x] Prisma Client ve Docker DB bağlantısı sağlandı.

## 2. Kullanıcı ve Profil Modeli
- [x] **Schema Detayları:** User, Profile, Food, Meal, WaterLog modelleri eklendi.
- [x] Prisma migration'lar gerçekleştirildi.

## 3. Kimlik Doğrulama (Auth)
- [x] `Auth` ve `Users` modülleri oluşturuldu.
- [x] Bcrypt ile şifre hashleme uygulandı.
- [ ] **JWT Stratejisi:**
    - [x] Access Token (7 gün - test aşamasında uzatıldı).
    - [ ] Refresh Token (Henüz implemente edilmedi - DB'de hashlenmiş tutulacak).
- [x] **Endpoints:**
    - [x] `POST /auth/register`: Kullanıcı ve Profil verilerini aynı anda oluşturuyor.
    - [x] `POST /auth/login`: JWT dönüyor.
    - [ ] `POST /auth/refresh`: Yeni Access Token üretimi (Eksik).
- [x] Global `AtGuard` ve `@Public` decorator'ı (Kontrol edilecek).

## 4. Doğrulama ve Test
- [x] Docker container'ların ayağa kalktığı doğrulandı.
- [x] Prisma Studio ile DB kontrolü.
- [x] Register/Login akışı backend tarafında hazır.

## 5. Yeni Hedefler & Eksikler
- [ ] Refresh Token mekanizmasının tamamlanması.
- [ ] Frontend tarafında Onboarding ekranlarının (Persona seçimi dahil) backend ile bağlanması.
- [ ] Dashboard ve Günlük (Diary) için API uçlarının detaylandırılması.

---
## İnceleme Bölümü
- Mevcut durum: Backend iskeleti ve Auth büyük oranda tamamlandı.
- Kritik: Refresh token ve token rotasyonu güvenliği artırmak için eklenecek.
