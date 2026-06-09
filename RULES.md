# PROJECT_RULES.md

## PROJECT NAME

Private Trip & Family Vacation Planner Jawa Tengah

---

## PROJECT GOAL

Platform wisata berbasis web yang membantu pengguna:

- Merencanakan private trip
- Family vacation
- Custom itinerary
- Smart trip planning
- Booking wisata
- Booking hotel
- Booking kendaraan
- Booking tour guide

Wilayah fokus:

- Semarang
- Magelang
- Wonosobo
- Jeparas
- Karanganyar
- Banyumas
- Solo
- Kebumen
- Klaten
- Purworejo

---

# MASTER FLOW

Guest
↓
Landing Page
↓
Login / Register
↓
Customer Dashboard
↓
Booking
↓
Checkout
↓
Upload Pembayaran
↓
Menunggu Verifikasi
↓
Admin Verifikasi
↓
Booking Confirmed
↓
Trip Berjalan

Flow ini tidak boleh diubah tanpa persetujuan user.

---

# ROLE SYSTEM

## ACTIVE ROLES (HANYA 2)

1. **user** - Customer biasa
2. **admin** - Administrator

## LEGACY ROLES (TIDAK DIGUNAKAN)

- staff
- customer
- travel_planner

Role legacy dianggap tidak valid dan tidak boleh digunakan.

## ROLE ASSIGNMENT

- Semua user baru: role = user
- Semua admin: role = admin
- Tidak boleh membuat role baru tanpa analisis database

## AUTHENTICATION FLOW

Tidak boleh mengubah:
- Authentication flow yang sudah berjalan
- Routing login yang sudah berfungsi
- AuthContext.js
- LoginPage.js
- AdminLoginPage.js

## DATABASE RULE

Database aktif adalah source of truth.
Jangan menggunakan schema.sql lama sebagai referensi utama.

---

## Guest

Boleh:

- Landing Page
- Explore Map
- Destinasi
- Hotel
- Paket Wisata

Tidak boleh:

- Booking
- Checkout
- Upload Pembayaran
- Dashboard

---

## User (Customer)

Boleh:

- Login
- Booking
- Checkout
- Upload Pembayaran
- Favorite
- Custom Trip
- History Booking

Tidak boleh:

- Akses Dashboard Admin

---

## Admin

Boleh:

- Kelola seluruh sistem
- Kelola booking
- Kelola pembayaran
- Kelola customer
- Kelola custom trip

---

# HALAMAN WAJIB

PUBLIC


/login
Customer Login

/register
Customer Register

---

CUSTOMER

/customer/dashboard

/customer/bookings

/customer/payments

/customer/favorites

/customer/custom-trip

---

ADMIN

/admin/login

/admin/dashboard

/admin/bookings

/admin/payments

/admin/customers

/admin/destinations

/admin/hotels

/admin/vehicles

/admin/guides

/admin/packages

/admin/smart-trip

Halaman di atas tidak boleh dihapus tanpa persetujuan user.

---

# VEHICLE VALIDATION

1-4 Orang
→ Mobil

5-10 Orang
→ Hiace

11-18 Orang
→ Elf

19-30 Orang
→ Medium Bus

31+ Orang
→ Big Bus

Validasi wajib dilakukan di backend.

---

# HOTEL VALIDATION

1 kamar = maksimal 2 orang

Contoh:

2 orang = 1 kamar

5 orang = 3 kamar

9 orang = 5 kamar

Perhitungan wajib backend.

---

# AI WORKFLOW

SEBELUM CODING:

1. Scan project
2. Scan frontend
3. Scan backend
4. Scan database
5. Analisis relasi
6. Analisis dampak perubahan
7. Buat laporan

Baru boleh coding.

---

# FORBIDDEN

Dilarang:

- Menghapus fitur lama
- Mengubah flow login
- Mengubah role system
- Mengubah booking flow
- Mengubah payment flow
- Membuat endpoint baru tanpa analisis
- Membuat tabel baru tanpa analisis

Jika ragu:

STOP dan minta konfirmasi user.
