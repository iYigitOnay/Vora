# Vora - Backend Görev Listesi (Docker, Auth & Persona Temelli Profil)

## 1. Hazırlık ve Dockerizasyon
- [x] `tasks/todo.md` ve `tasks/lessons.md` oluşturuldu.
- [ ] NestJS projesini `backend` klasöründe başlat (`npm i -g @nestjs/cli` -> `nest new backend`).
- [ ] Docker konfigürasyonu:
    - [ ] `Dockerfile` (Development) oluştur.
    - [ ] `docker-compose.yml` (PostgreSQL 16+) hazırlat.
- [ ] Prisma 6 Kurulumu:
    - [ ] `prisma init`.
    - [ ] Schema tasarımı (User, Profile, Persona, Goal enumları).
    - [ ] Prisma Client oluşturma ve Docker DB bağlantısı.

## 2. Kullanıcı ve Profil Modeli (Onboarding Hazırlığı)
- [ ] **Schema Detayları:**
    - `User`: email, password, createdAt, vb.
    - `Profile`: firstName, birthDate, gender, height, weight, activityLevel, targetWeight, selectedPersona (Obsidian, Charcoal, Arctic).
- [ ] Prisma migration'ı gerçekleştir.

## 3. Kimlik Doğrulama (Auth)
- [ ] `Auth` ve `Users` modüllerini oluştur.
- [ ] Bcrypt ile şifre hashleme.
- [ ] **JWT Stratejisi:**
    - [ ] Access Token (kısa ömürlü).
    - [ ] Refresh Token (uzun ömürlü, DB'de hashlenmiş tutulacak).
- [ ] **Endpoints:**
    - [ ] `POST /auth/register`: Kullanıcı ve Profil verilerini aynı anda alır.
    - [ ] `POST /auth/login`: JWT döner.
    - [ ] `POST /auth/refresh`: Yeni Access Token üretir.
- [ ] Global `AtGuard` (Access Token Guard) ve `@Public` decorator'ı.

## 4. Doğrulama
- [ ] Docker container'ların ayağa kalktığını doğrula.
- [ ] Prisma Studio ile veritabanı kontrolü.
- [ ] Postman/Curl ile Register/Login testi.

---
## İnceleme Bölümü
- Vizyon: `planlar.md` içeriği backend şemasına yansıtıldı.
- Karar: Prisma 6 ve PostgreSQL 16 kullanılacak.
