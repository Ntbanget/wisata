# Changelog

> Daftar perubahan code per commit di branch `devin/1778070894-fix-build-and-leaflet-migration`
> (PR #1: <https://github.com/Ntbanget/wisata/pull/1>).
>
> Untuk fitur baru ke depan, **mulai dari sini** sebelum nulis kode:
> 1. Lihat commit terakhir → file mana yang berubah
> 2. Cek `TDD.md` untuk workflow Red → Green → Refactor
> 3. Tulis test baru di `__tests__/` atau `tests/` SEBELUM tambah feature

---

## Format

Setiap entry punya:
- **commit hash** + tanggal
- **scope**: `backend` / `frontend` / `db` / `docs`
- daftar file yang berubah dengan satu kalimat “kenapa”

---

## 2026-05-07

### `f96cfe1` — Fix package map view, auto-filter on View Map, curate popular cities

**Scope**: backend, frontend

| File | Kenapa |
|---|---|
| `backend/src/utils/packageGenerator.js` | Tambah `itinerary` ke response object — sebelumnya dihitung tapi tidak dikirim, jadi MapPage / DetailPage fallback ke heuristik 6-hari palsu. |
| `frontend/src/pages/MapPage.js` | Total = `hotel × nights + tiket` (sebelumnya `hotel × 1`). List itinerary di-pecah per Malam dengan jadwal jam masing-masing. |
| `frontend/src/pages/DetailPage.js` | Tombol View Map sekarang call `handleGoToExplore()` → `/explore?city=<id>&nights=<n>`. |
| `frontend/src/pages/PackagePage.js` | Tambah tombol "Lihat Peta" di card paket; baris atas: View Details + Share, baris bawah: Lihat Peta + Custom. |
| `frontend/src/pages/LandingPage.js` | Curated `POPULAR_CITY_NAMES`: Semarang, Yogyakarta, Magelang, Surakarta, Wonosobo, Jepara. Pemalang landmark photo → Pantai Widuri. |

### `b990011` — Cap package malam at 17:00, lock Salatiga+Jepara, auto-filter on Custom, landmark photos

**Scope**: backend, frontend, db

| File | Kenapa |
|---|---|
| `backend/src/utils/packageGenerator.js` | Algoritma baru `packPlacesByMalamWithTimeCap`: simulasikan timeline per destinasi, kalau pulang ke hotel > 17:00 → pindah malam berikutnya. Tiap malam wajib ≥1 destinasi (boleh 1 malam kosong). |
| `database/rebuild_all_data.sql` | Verifikasi koordinat Salatiga + Jepara via Nominatim/OSM. Hapus 3 entri yg gak bisa diverifikasi. |
| `frontend/src/pages/DetailPage.js` | Tombol Customize → "Custom (Jelajahi Peta)" → `/explore?city=<id>`. |
| `frontend/src/pages/ExploreMap.js` | Baca `?city=<id>` dan `?nights=<n>` dari URL → auto-pilih kota + slot malam. |
| `frontend/src/pages/LandingPage.js` | Foto landmark per kota di Popular Cities (Lawang Sewu, Borobudur, Malioboro, Telaga Warna, dll). |
| `frontend/src/pages/PackagePage.js` | Tombol "Custom" forward `cityId` + `nights` ke /explore. |

### `0f7b025` — Diversify packages, add tour timing, switch to Malam terminology

**Scope**: backend, frontend, db

| File | Kenapa |
|---|---|
| `backend/src/utils/packageGenerator.js` | 3-tier hotel selection (cheapest, mid, luxury). Tambah `buildMalamTimeline` yg compute jam berangkat / tiba / kunjungan / pulang. Output paket sekarang punya `itinerary[]`. |
| `database/rebuild_all_data.sql` | Verifikasi koordinat Wonosobo, Pekalongan, Pemalang via Nominatim/OSM. |
| `frontend/src/components/MapView.js` | Panel "Your Trip" group destinasi per Malam, dropdown "Malam 1 / Malam 2" (dari "H1/H2"). |
| `frontend/src/pages/CheckoutPage.js` | Order Summary group per "Malam X" + breakdown hotel × N malam. |
| `frontend/src/pages/DetailPage.js` | Tab Itinerary tampilkan "Malam 1 ... N" dengan jadwal jam tour. |
| `frontend/src/pages/ExploreMap.js` | Header dropdown "Malam: 1 / 2 / 3 / ...". User bebas pindahkan destinasi antar malam. |
| `frontend/src/pages/LandingPage.js` | Dropdown form: "1 malam, 2 malam, ..." (sebelumnya "1 (2 hari)"). |
| `frontend/src/pages/PackagePage.js` | Badge card → "X malam" (sebelumnya "X malam · Y hari"). |
| `frontend/src/pages/SuccessPage.js` | "Malam {n}" (sebelumnya "Day {n}"). |
| `frontend/src/utils/helpers.js` | Tambah `computeDailySchedule`, `formatDurationMinutes`, `formatHHMM`, `getVisitMinutes`, `getOpeningHours`. |

### `10656b7` — Add nights field + per-day itinerary; fix home cards; verify Magelang+Yogya coords

**Scope**: backend, frontend, db

| File | Kenapa |
|---|---|
| `backend/src/controllers/packageController.js` | Endpoint `/api/packages/generate` terima `nights` di body. |
| `backend/src/models/Booking.js` | Query Trending: INNER JOIN booking_details → LEFT JOIN + COALESCE → tetap return data walau belum ada booking. |
| `backend/src/utils/packageGenerator.js` | `nights` di-generate, hotel cost = `price/malam × nights`. Maksimal destinasi = `maxPlaces × (nights+1)` capped 12. |
| `database/rebuild_all_data.sql` | Koord Magelang + Yogyakarta diverifikasi via Nominatim. |
| `frontend/src/components/MapView.js` | Group destinasi per malam di sidebar. |
| `frontend/src/pages/CheckoutPage.js` + `DetailPage.js` + `ExploreMap.js` + `PackagePage.js` | Render per Malam. |
| `frontend/src/pages/LandingPage.js` | Form: tambah dropdown "Jumlah Malam" (1-7). Layout 3 kolom. |

### `6241d80` — Verify Semarang+Kendal coords against OpenStreetMap

**Scope**: db

Update koordinat 9 landmark Semarang + 5 landmark Kendal pakai Nominatim (sumber sama dgn map tile), termasuk fix Curug Sewu yg off ~7km dan Sekatul off ~13km.

---

## 2026-05-06 (sesi sebelumnya)

### `6c1c5c7` — Lock packages as read-only; redirect customize to Explore Map; move Widuri off the sea

Paket = fixed tidak bisa diubah. Tombol customize → /explore. Pantai Widuri / Resort dipindah ke darat.

### `865b174` + `f0bb5ca` + `5c51cd2` — Add rebuild_all_data.sql

File rewrite penuh untuk DB seed dengan koordinat verified. DELETE bukan TRUNCATE supaya FK_CHECKS=0 dihormati.

### `742b1db` — Use OSRM for road-following route + real driving distance/time

`MapView.js`: pakai OSRM endpoint untuk hitung rute mengikuti jalan + waktu nyata, bukan haversine straight-line.

### `b48af4f` + `7f41b08` — Add cities, comprehensive coord/UX fixes

Tambah Pemalang, Kendal, Yogyakarta. Hapus Tegal. 50km cap radius dari hotel ke destinasi. Tombol "Show Route".

### `2c9c649` — Rename DLAS

`D'LAS Desa Wisata Lembah Asri Serang` di Karangreja, Purbalingga.

### `eaa043f` + `a860df9` + `4ad343d` + `41420fc` + `5e026a9` — Misc bugfixes

Fix RpNaN price, custom trip booking from map, panel overlay, navbar overlap, stale closure, build error from Leaflet migration.

---

## Cara melihat diff exact untuk satu commit

```bash
git show <hash>                       # full diff
git show --stat <hash>                # daftar file yg berubah saja
git diff <old>..<new>                 # diff antara 2 commit
git diff <old>..<new> -- path/file    # diff hanya untuk 1 file
```

Contoh:
```bash
git show f96cfe1
git show --stat b990011
git diff 0f7b025..b990011 -- backend/src/utils/packageGenerator.js
```
