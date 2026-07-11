# PROJECT STATUS

## Struktur Workspace Saat Ini

```text
wisata/
├── backend/                 # API Node.js + Express
│   ├── src/
│   │   ├── controllers/      # Auth, booking, package, admin, hotel, city, payment, notification
│   │   ├── models/          # Package, Booking, City, Hotel, TouristPlace, User, Payment, Notification
│   │   ├── routes/          # Endpoint routing per modul
│   │   ├── middleware/      # Auth/role middleware
│   │   └── utils/           # Package generator, validation helpers, database helpers
│   ├── scripts/             # Utility scripts (schema, seed, admin creation, expiry job)
│   ├── tests/               # Backend unit tests
│   ├── package.json         # Backend scripts dan dependency
│   └── server.js            # Entry point API server
├── frontend/                # Aplikasi React
│   ├── public/              # HTML statis dan aset publik
│   ├── src/
│   │   ├── components/      # UI reusable components
│   │   ├── context/         # Auth/Booking/Theme context
│   │   ├── pages/           # Halaman utama, paket, detail, checkout, admin
│   │   ├── services/        # API service layer
│   │   └── utils/           # Helper dan utility
│   ├── package.json         # Frontend scripts dan dependency
│   └── tailwind.config.js   # Tailwind config
├── database/                # SQL schema, migration, seed, diagnostic scripts
├── docs/                    # (jika ada, biasanya laporan proyek seperti audit/hand over)
├── README.md
├── CHANGELOG.md
├── STARTUP.md
├── TDD.md
└── PROJECT_STATUS.md
```

## Script yang Sudah Ada dan Fungsinya

### Backend

- `backend/package.json`
  - `npm start` → menjalankan server Express (`server.js`)
  - `npm run dev` → menjalankan server dengan nodemon
  - `npm test` → menjalankan test backend dengan Jest
  - `npm run test:watch` → menjalankan test secara berulang saat file berubah
  - `npm run test:coverage` → menjalankan test dengan laporan coverage

### Frontend

- `frontend/package.json`
  - `npm start` → menjalankan aplikasi React dev server
  - `npm run build` → membangun aplikasi produksi
  - `npm test` → menjalankan test frontend React
  - `npm run eject` → mengeluarkan konfigurasi CRA (jarang dipakai)

### Utility / Maintenance Scripts

- `backend/scripts/apply_schema.js` → menerapkan schema database
- `backend/scripts/create_admin.js` → membuat akun admin awal
- `backend/scripts/expire_bookings.js` → menandai booking yang kadaluarsa
- `backend/scripts/seed_master_data.js` → mengisi data master awal
- `backend/run_seed.js` → menjalankan seeding data backend
- `backend/check_payment_status.js` → pemeriksaan status pembayaran
- `backend/test_login_endpoint.js` → uji endpoint login
- `backend/test_payment.js` → uji alur pembayaran

## Objek-Objek Penting dan Properti Utamanya

### 1. `Package`

Bertanggung jawab untuk data paket wisata yang disimpan dan diambil.

Properti penting:

- `id`
- `user_id`
- `city_id`
- `hotel_id`
- `tourist_place_ids`
- `name`
- `budget`
- `people_count`
- `nights`
- `preferences`
- `generated_itinerary`
- `total_estimated_cost`
- `status`
- `created_by`
- `is_saved`
- `is_booked`
- `booking_id`

### 2. `Booking`

Bertanggung jawab untuk data pemesanan perjalanan.

Properti penting:

- `id`
- `user_name`
- `email`
- `city_id`
- `total_price`
- `budget`
- `status`
- `payment_status`
- `payment_method`
- `trip_date`
- `nights`
- `people_count`
- `vehicle_mode`
- `hotel_id` (via detail booking)
- `tourist_places` (via detail booking)

### 3. `Hotel`

Data hotel yang dipakai untuk paket dan pencocokan budget.

Properti penting:

- `id`
- `name`
- `city_id`
- `category`
- `price_per_night`
- `rating`
- `lat`
- `lng`

### 4. `TouristPlace`

Data destinasi wisata.

Properti penting:

- `id`
- `name`
- `city_id`
- `category`
- `ticket_price`
- `lat`
- `lng`

### 5. `Search Criteria` (state frontend)

Digunakan saat pengguna mencari paket.

Properti penting:

- `city_id`
- `budget`
- `nights`
- `people_count`
- `vehicleMode`

### 6. `PackageResponse` (response dari API /api/packages)

Struktur umum hasil paket:

- `success`
- `data.packages`
- `data.budget_breakdown`
- `data.search_criteria`
- tiap paket memiliki:
  - `id`
  - `name`
  - `hotel`
  - `tourist_places`
  - `nights`
  - `total_price`
  - `budget`
  - `score`
  - `source` (`admin` atau `generated`)

## Bagian yang Masih Kosong / Belum Selesai

- Beberapa modul admin masih perlu konsistensi UI/UX dan validasi lebih ketat.
- Beberapa file frontend masih memiliki warning ESLint/React yang belum dibersihkan.
- Beberapa flow booking/payment masih memerlukan pengujian end-to-end lebih luas.
- Data master dan seeding belum sepenuhnya diverifikasi untuk semua kota/destinasi.
- Dokumentasi operasional dan deployment masih bisa diperjelas lebih lanjut.
- Area yang sebelumnya terkait source filtering paket sudah diimplementasikan, namun pengujian manual di browser tetap perlu dicek pada kondisi nyata.

## Catatan Saat Ini

Proyek ini sudah memiliki arsitektur backend/frontend yang cukup lengkap untuk fitur wisata, booking, admin, dan paket rekomendasi. Fokus saat ini lebih banyak pada penyempurnaan logika paket, filtering source, dan konsistensi data antar frontend dan backend.
