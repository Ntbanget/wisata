# DATABASE_RULES.md

## DATABASE ENGINE

MySQL

---

# DATABASE PRINCIPLE

Prioritaskan tabel yang sudah ada.

Jangan membuat tabel baru tanpa alasan yang jelas.

---

# MASTER TABLES

users

cities

tourist_places

hotels

vehicles

tour_guides

tour_packages

bookings

booking_details

payments

favorites

reviews

smart_trip_requests

---

# DATABASE RELATION

users
↓
bookings

bookings
↓
payments

cities
↓
tourist_places

cities
↓
hotels

tour_packages
↓
bookings

vehicles
↓
bookings

tour_guides
↓
bookings

---

# BOOKING SYSTEM

booking wajib memiliki:

- user_id
- package_id
- vehicle_id
- guide_id
- total_price
- booking_status
- payment_status

---

# PAYMENT SYSTEM

payment wajib terkait:

- booking_id
- user_id

payment_status:

- pending
- approved
- rejected

---

# SMART TRIP REQUEST

smart_trip_requests wajib menyimpan:

- user_id
- city_id
- budget
- people_count
- nights
- travel_type
- request_status

---

# FOREIGN KEY RULES

Setiap relasi wajib:

- memiliki foreign key
- memiliki index

---

# AI DATABASE RULES

Sebelum migration:

1. Scan schema
2. Scan relasi
3. Scan model
4. Scan controller

Baru boleh membuat migration.

---

# FORBIDDEN

Dilarang:

- Duplicate table
- Duplicate relation
- Duplicate foreign key
- Rename table tanpa analisis
- Drop table tanpa izin user

Jika ada konflik:

Laporkan dahulu.
