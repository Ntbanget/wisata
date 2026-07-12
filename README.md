Link website
https://wisata-amber.vercel.app/

Hosting menggunakan
Frontend : Vercel
Backend  : Railway
Database : NeonDB (PostgreSQL)

# 🌴 Central Java Tourism Travel Planner

Aplikasi web fullstack untuk merencanakan perjalanan wisata ke kota-kota di Jawa Tengah, Indonesia.

## 🚀 Fitur

- **Multi-City Support**: Pilih dari 9 kota besar di Jawa Tengah
- **Perencanaan Berbasis Budget**: Masukkan budget dan dapatkan paket wisata yang disesuaikan
- **Pencocokan Hotel & Destinasi**: Pemilihan otomatis berdasarkan budget dan rating
- **Peta Interaktif**: Integrasi Leaflet + OpenStreetMap dengan visualisasi rute
- **Sistem Booking**: Checkout dan manajemen booking lengkap
- **Navigasi Nyata**: Integrasi langsung dengan navigasi OpenStreetMap

## 📁 Struktur Proyek

```
wisata/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── package.json
│   └── server.js
├── frontend/               # React + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── tailwind.config.js
├── database/              # Schema & Seed Data PostgreSQL
│   ├── schema.sql
│   └── seed.sql
├── .env.example
└── README.md
```

## 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- PostgreSQL (di-hosting di Neon)
- CORS

**Frontend:**
- React
- React Router
- Tailwind CSS
- Leaflet + react-leaflet (dengan tile OpenStreetMap)

**Database:**
- PostgreSQL (NeonDB)

## 📋 Panduan Instalasi

### 1. Setup Database

```bash
# Buat database di Neon (via dashboard atau CLI)
# Salin connection string yang diberikan Neon, contoh:
# postgresql://user:password@ep-xxxx.neon.tech/wisata_db?sslmode=require

# Import schema dan seed data
psql "<CONNECTION_STRING_NEON>" -f database/schema.sql
psql "<CONNECTION_STRING_NEON>" -f database/seed.sql
```

### 2. Setup Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env dengan connection string database Anda
npm start
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

> Peta menggunakan Leaflet + tile OpenStreetMap, jadi **tidak perlu API key**.

### 4. Environment Variables

Buat file `.env` di folder root maupun backend:

```env
# Backend .env
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/wisata_db?sslmode=require
PORT=5000

# Frontend .env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🌐 API Endpoints

- `GET /api/cities` - Mengambil semua kota yang tersedia
- `GET /api/packages?city_id=1&budget=1500000` - Membuat paket wisata
- `POST /api/packages/custom` - Menghitung harga paket custom
- `POST /api/booking` - Menyimpan data booking
- `GET /api/hotels` / `GET /api/hotels/city/:cityId` - Daftar hotel
- `GET /api/tourist-places` / `GET /api/tourist-places/city/:cityId` - Daftar tempat wisata
- `GET /api/health` - Health check

## 🗺️ Integrasi Peta

Aplikasi ini menggunakan **Leaflet + react-leaflet** dengan tile **OpenStreetMap** untuk:
- Menampilkan peta kota dengan marker kustom
- Menggambar rute (polyline) antara hotel dan destinasi
- Membuat URL navigasi yang membuka petunjuk arah OpenStreetMap

Tidak perlu API key atau akun billing eksternal.

## 📱 Kota yang Didukung

1. Semarang
2. Surakarta (Solo)
3. Magelang
4. Wonosobo
5. Jepara
6. Salatiga
7. Purwokerto
8. Tegal
9. Pekalongan

## 💡 Logika Bisnis

- **Kategori Hotel**: <300rb (rendah), 300rb-700rb (sedang), >700rb (tinggi)
- **Alokasi Budget**: 50% untuk hotel, 30% untuk tempat wisata, 20% buffer
- **Batas Destinasi**: 2-4 tempat wisata per paket
- **Kriteria Pemilihan**: Rating terbaik dalam batas budget

## 🧪 Testing (TDD)

Proyek ini menggunakan Jest + React Testing Library. Test tersimpan di:
- `backend/tests/unit/` — test fungsi murni dengan DB yang di-mock
- `frontend/src/utils/__tests__/` — test helper murni
- `frontend/src/pages/__tests__/` — test komponen

```bash
# backend
cd backend
npm test               # jalankan sekali
npm run test:watch     # auto re-run saat menyimpan file
npm run test:coverage  # laporan coverage

# frontend
cd frontend
npm test               # mode watch interaktif (default CRA)
CI=true npm test       # jalankan sekali
```

Lihat **[TDD.md](./TDD.md)** untuk alur kerja Red → Green → Refactor yang harus
diikuti setiap kali menambahkan fitur baru. Lihat **[CHANGELOG.md](./CHANGELOG.md)**
untuk changelog per-commit tentang file apa saja yang berubah dan alasannya.
