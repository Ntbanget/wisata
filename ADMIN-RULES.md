# ADMIN_SYSTEM_RULES.md

## ADMIN ROLE

Admin adalah:

Travel Planner
Trip Organizer
System Manager

Bukan customer.

---

# ADMIN LOGIN

/admin/login

Endpoint:

POST /auth/admin/login

Admin login wajib terpisah dari customer login.

---

# CUSTOMER LOGIN

/login

Endpoint:

POST /auth/login

Customer login wajib terpisah dari admin.

---

# ADMIN SIDEBAR

Dashboard

MASTER DATA

- Destinasi
- Hotel
- Kendaraan
- Tour Guide
- Paket Wisata

TRANSAKSI

- Booking
- Pembayaran

CUSTOMER

- Customer
- Review

SMART TRIP

- Smart Trip Request

LAPORAN

- Statistik
- Revenue
- Booking Report

---

# ADMIN BOOKING MANAGEMENT

Admin wajib dapat:

- Melihat booking
- Mengubah status booking
- Membatalkan booking
- Mengonfirmasi booking

Status:

- pending
- confirmed
- cancelled
- completed

---

# ADMIN PAYMENT MANAGEMENT

Admin wajib dapat:

- Melihat pembayaran
- Melihat bukti pembayaran
- Approve pembayaran
- Reject pembayaran

Status:

- pending
- approved
- rejected

---

# ADMIN CUSTOMER MANAGEMENT

Admin wajib dapat:

- Melihat customer
- Edit customer
- Nonaktifkan customer
- Melihat histori booking

---

# ADMIN SMART TRIP MANAGEMENT

Admin wajib dapat:

- Melihat request
- Membuat itinerary
- Menentukan hotel
- Menentukan kendaraan
- Menentukan guide
- Menentukan biaya
- Mengirim penawaran

---

# DASHBOARD STATISTICS

Dashboard wajib memiliki:

- Total Customer
- Total Booking
- Total Revenue
- Pending Payment
- Pending Smart Trip Request

---

# PROTECTED FILES

frontend/src/App.js

frontend/src/services/api.js

backend/server.js

backend/src/middleware/auth.js

backend/src/middleware/role.js

database/schema_smart_trip_planner.sql

Sebelum mengubah file di atas:

AI wajib menjelaskan:

- alasan
- dampak
- risiko

---

# ADMIN SECURITY

Semua route admin wajib:

- authenticate
- adminOnly

Customer tidak boleh mengakses route admin.

Guest tidak boleh mengakses route admin.

---

# FORBIDDEN

Dilarang:

- Menggabungkan login admin dan customer
- Menghapus dashboard admin
- Menghapus payment management
- Menghapus booking management
- Menghapus customer management

Tanpa persetujuan user.
