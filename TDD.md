# Test-Driven Development (TDD) Workflow

> Panduan singkat untuk nulis test SEBELUM nulis kode setiap kali ada fitur baru.

## Kenapa TDD?

Tanpa test:
- Bug regresi: fitur lama "tiba-tiba" rusak waktu fitur baru di-tambah
- Sulit refactor: takut nge-break sesuatu yg gak ke-test
- Code review jadi panjang karena reviewer harus simulasi di kepala

Dengan TDD:
- Tiap fitur punya **kontrak** yg di-jamin tetap jalan
- Refactor aman: kalau test masih ijo, kode masih benar
- Bug-fix permanen: tulis test reproduksinya, lalu fix → tidak akan balik lagi

---

## Red → Green → Refactor

### 1. Red — tulis test untuk behavior yg belum ada

```js
// MISAL: user minta "paketan multi-malam tidak boleh lewat 17:00"
test('caps every non-empty malam at 17:00', async () => {
  const out = await PackageGenerator.generatePackages(1, 5000000, { nights: 3 });
  out.forEach((pkg) => {
    pkg.itinerary.forEach((bucket) => {
      if (bucket.places.length === 0) return;
      const [hh, mm] = bucket.schedule.endTime.split(':').map(Number);
      expect(hh * 60 + mm).toBeLessThanOrEqual(17 * 60 + 30);
    });
  });
});
```

Run `npm test` → **harus gagal merah** (karena fitur belum ada).

### 2. Green — tulis kode minimal supaya test ijo

Modifikasi `packageGenerator.js`: tambah `packPlacesByMalamWithTimeCap` yang
memindah destinasi ke malam berikutnya kalau timeline sampai >17:00.

Run `npm test` → **harus ijo**.

### 3. Refactor — bersihkan kode

Sekarang aman buat refactor: split function jadi lebih kecil, ganti nama
variable, dll. Test akan langsung warn kalau ada yg ke-break.

---

## Struktur folder

### Backend (`backend/`)
```
backend/
├── src/
│   ├── utils/
│   │   └── packageGenerator.js
│   ├── controllers/
│   ├── models/
│   └── routes/
├── tests/
│   ├── setup.js                   # silence DB logs
│   ├── unit/                      # pure-function tests (mocked DB)
│   │   ├── packageGenerator.helpers.test.js
│   │   └── packageGenerator.test.js
│   └── integration/               # endpoint tests (supertest)
└── package.json
```

### Frontend (`frontend/`)
```
frontend/src/
├── pages/
│   ├── LandingPage.js
│   └── __tests__/
│       └── LandingPage.test.js    # component-level (RTL)
├── utils/
│   ├── helpers.js
│   ├── popularCities.js
│   └── __tests__/
│       ├── helpers.test.js        # pure function tests
│       └── popularCities.test.js
└── components/
```

**Konvensi**: file test sama nama dengan file yg di-test, suffix `.test.js`,
di folder `__tests__/` sebelahnya (Create React App auto-detect).

---

## Cara jalankan

### Backend
```bash
cd backend
npm test                # sekali jalan
npm run test:watch      # auto re-run setiap save
npm run test:coverage   # lihat % code yg ter-cover
```

### Frontend
```bash
cd frontend
npm test                # interactive watch mode (CRA default)
CI=true npm test        # sekali jalan, untuk CI
npm test -- --coverage  # dengan coverage report
```

---

## Pola yang sering dipakai

### 1. Mock model database (Jest auto-mock)

```js
// backend/tests/unit/packageGenerator.test.js
jest.mock('../../src/models/Hotel');
jest.mock('../../src/models/TouristPlace');

const Hotel = require('../../src/models/Hotel');
const TouristPlace = require('../../src/models/TouristPlace');

beforeEach(() => {
  Hotel.getByCity = jest.fn().mockResolvedValue([
    { id: 1, name: 'Hotel A', price_per_night: 200000, lat: -7, lng: 110 }
  ]);
  TouristPlace.getByCity = jest.fn().mockResolvedValue([
    { id: 11, name: 'Lawang Sewu', lat: -6.98, lng: 110.41, category: 'Historical', ticket_price: 20000 }
  ]);
});
```

### 2. Mock API service di frontend

```js
// frontend/src/pages/__tests__/LandingPage.test.js
import { apiService } from '../../services/api';
jest.mock('../../services/api');

beforeEach(() => {
  apiService.getCities.mockResolvedValue({
    data: [{ id: 1, name: 'Semarang' }, { id: 12, name: 'Yogyakarta' }],
  });
});
```

### 3. Render dengan Router

```js
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter initialEntries={['/explore?city=1&nights=3']}>
    <ExploreMap />
  </MemoryRouter>
);
```

---

## Checklist saat tambah fitur baru

- [ ] **Mengerti kontrak**: apa input, apa output yg di-expect?
- [ ] **Tulis test failure-case dulu** — minimal 1 contoh sukses + 1 edge case
- [ ] **Run test** → red (gagal sesuai expectation)
- [ ] **Implementasikan** kode minimal supaya ijo
- [ ] **Run semua test** (`npm test`) → semua ijo, gak ada regresi
- [ ] **Refactor** kalau perlu — test masih ijo, aman
- [ ] **Commit dengan pesan** "Add <feature>: <one-line>" + reference test file
- [ ] **Push** → CI ngejalanin test ulang

---

## Contoh akhir-ke-akhir: tambah fitur "filter by category"

User minta: "saya ingin di Explore Map bisa filter destinasi by kategori (Historical, Beach, Religious, dll)".

### Step 1: tulis test red
```js
// frontend/src/utils/__tests__/categoryFilter.test.js
import { filterByCategory } from '../categoryFilter';

describe('filterByCategory', () => {
  const places = [
    { id: 1, name: 'Lawang Sewu', category: 'Historical' },
    { id: 2, name: 'Pantai Marina', category: 'Beach' },
    { id: 3, name: 'Borobudur', category: 'Historical' },
  ];

  it('returns only Historical places when filter is set', () => {
    expect(filterByCategory(places, 'Historical')).toHaveLength(2);
  });

  it('returns all places when filter is empty', () => {
    expect(filterByCategory(places, '')).toHaveLength(3);
  });
});
```

`npm test` → **fail**, file `categoryFilter.js` belum ada.

### Step 2: minimal implementation (green)
```js
// frontend/src/utils/categoryFilter.js
export function filterByCategory(places, category) {
  if (!category) return places;
  return places.filter((p) => p.category === category);
}
```

`npm test` → **pass**.

### Step 3: integrasi ke component
```js
// frontend/src/pages/ExploreMap.js
import { filterByCategory } from '../utils/categoryFilter';

const visiblePlaces = filterByCategory(places, selectedCategory);
```

### Step 4: test integrasi (opsional, RTL)
```js
import { render, screen, fireEvent } from '@testing-library/react';
test('filtering Historical hides Beach destinations', () => {
  render(<ExploreMap />);
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Historical' } });
  expect(screen.queryByText('Pantai Marina')).not.toBeInTheDocument();
  expect(screen.getByText('Lawang Sewu')).toBeInTheDocument();
});
```

### Step 5: commit
```bash
git add frontend/src/utils/categoryFilter.js
git add frontend/src/utils/__tests__/categoryFilter.test.js
git add frontend/src/pages/ExploreMap.js
git commit -m "Add category filter on Explore Map (test in categoryFilter.test.js)"
```

---

## Aturan main

1. **JANGAN ngubah test untuk membuat dia ijo** — kalau test red, fix kode-nya, jangan fix test-nya (kecuali test-nya memang salah).
2. **Test lambat di-isolate** — kalau test integrasi butuh DB, taruh di `tests/integration/`, jangan di unit.
3. **1 file test per file source** — `LandingPage.js` → `LandingPage.test.js`.
4. **Tulis description yg jelas** — `"caps malam at 17:00"` lebih baik daripada `"works"`.
5. **Test edge case**: list kosong, null, value besar/negatif, race condition.
