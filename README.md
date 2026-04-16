# 🐺 Vora: AI-Powered Wellness & Nutrition Ecosystem

<p align="center">
  <img src="vorakurt.png" alt="Vora Logo" width="200" />
</p>

Vora, modern insanın beslenme ve sağlık takibini yapay zeka ile kişiselleştiren, estetik ve performansı odağına alan yeni nesil bir wellness ekosistemidir.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS%2011-red)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%206-blue)](https://www.prisma.io/)

---

## ✨ Temel Özellikler

- 🌑 **Persona Odaklı Deneyim:** Obsidian (Katı), Charcoal (Dengeli) ve Arctic (Hafif) personalları ile kişiselleştirilmiş UI ve AI geri bildirimleri.
- 📊 **Gelişmiş Dashboard:** Enerji dengesi, makro besinler ve hidrasyon takibini tek bakışta sunan optimize edilmiş arayüz.
- 🥘 **Akıllı Mutfak Yönetimi:** Envanter takibi, son kullanma tarihi uyarıları ve şablon tabanlı öğün planlama.
- 🚀 **Performans Odaklı UI:** Cam (glassmorphism) efektleri ve 60 FPS akıcılığında animasyonlar (backdrop-blur-sm optimizasyonu).
- 🔐 **Güvenli Mimari:** JWT ve Refresh Token tabanlı yetkilendirme, CUID2 ile güvenli ID yapısı.

---

## 🛠️ Teknoloji Yığını

### Frontend

- **Framework:** Next.js 15 (App Router, Turbopack)
- **State:** Zustand (Global Store)
- **Styling:** Tailwind CSS + Vanilla CSS
- **Icons:** Lucide React
- **API Client:** Axios (Interceptors ile otomatik token yönetimi)

### Backend

- **Framework:** NestJS 11
- **Database:** PostgreSQL
- **ORM:** Prisma 6.2.1
- **Auth:** Passport.js (JWT Strategy)
- **Validation:** Class-validator & Class-transformer

---

## ⚙️ Kurulum

### Gereksinimler

- Node.js (v20+)
- Docker & Docker Compose
- PostgreSQL (Lokal kullanım için opsiyonel)

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/username/vora.git
cd vora
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
# .env dosyasını oluşturun ve DATABASE_URL'i düzenleyin
npm run start:dev
```

### 3. Frontend Kurulumu

```bash
cd ../frontend
npm install
# .env.local dosyasını oluşturun (NEXT_PUBLIC_API_URL=http://localhost:3001)
npm run dev
```

### 4. Docker (Alternatif)

```bash
docker-compose up -d
```

---

## 📂 Proje Yapısı

```text
vora/
├── backend/          # NestJS API
│   ├── src/          # Kaynak kodlar
│   ├── prisma/       # DB Şeması ve Migrations
│   └── test/         # Unit & E2E testler
├── frontend/         # Next.js Uygulaması
│   ├── src/app/      # App Router sayfaları
│   ├── src/comp/     # Yeniden kullanılabilir bileşenler
│   └── src/store/    # Global state yönetimi
├── tasks/            # Proje planları ve dersler
└── docker-compose.yml
```

---

## 📜 Lisans

Bu proje **MIT Lisansı** ile korunmaktadır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına göz atın.

---

## 🐺 Vora Team

_"Geleceğin beslenme düzenini bugünden inşa ediyoruz."_
