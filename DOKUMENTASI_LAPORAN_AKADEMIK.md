# DOKUMENTASI LAPORAN AKADEMIK - WISATA JAWA TENGAH

## 1. SKEMA DATABASE

### File: `database/schema_postgresql.sql`

```sql
-- PostgreSQL schema draft converted from the current MySQL dump.
-- This is a review draft only; it has not been executed to Neon.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','staff','admin','customer')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP DEFAULT NULL
);

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  province VARCHAR(50) DEFAULT 'Jawa Tengah',
  latitude NUMERIC(10,8) DEFAULT NULL,
  longitude NUMERIC(11,8) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  star_rating SMALLINT DEFAULT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  price_per_night NUMERIC(10,2) NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  total_reviews INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('low','medium','high')),
  lat NUMERIC(10,8) NOT NULL,
  lng NUMERIC(11,8) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  amenities JSONB DEFAULT NULL,
  room_capacity INT DEFAULT 2,
  total_rooms INT DEFAULT NULL,
  check_in_time TIME DEFAULT '14:00:00',
  check_out_time TIME DEFAULT '12:00:00',
  minimum_nights INT DEFAULT 1,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE image_galleries (
  id SERIAL PRIMARY KEY,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('hotel','tourist_place','city')),
  resource_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200) DEFAULT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itinerary_templates (
  id SERIAL PRIMARY KEY,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  duration_hours INT NOT NULL,
  total_distance_km NUMERIC(8,2) DEFAULT NULL,
  waypoints JSONB DEFAULT NULL,
  category_template VARCHAR(20) DEFAULT 'mixed' CHECK (category_template IN ('cultural','nature','adventure','family','mixed')),
  difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy','medium','hard')),
  min_people INT DEFAULT 1,
  max_people INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info','success','warning','error','payment_approved','payment_rejected','payment_failed')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500) DEFAULT NULL,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NULL,
  booking_id INT DEFAULT NULL,
  admin_id INT DEFAULT NULL,
  admin_name VARCHAR(100) DEFAULT NULL
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  capacity INT DEFAULT NULL,
  price_per_day NUMERIC(10,2) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tour_guides (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  languages JSONB DEFAULT NULL,
  experience_years INT DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0.0,
  price_per_day NUMERIC(10,2) NOT NULL,
  photo_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  specializations JSONB DEFAULT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tourist_places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  ticket_price NUMERIC(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  lat NUMERIC(10,8) NOT NULL,
  lng NUMERIC(11,8) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  opening_hours TIME DEFAULT NULL,
  closing_hours TIME DEFAULT NULL,
  visit_duration INT DEFAULT 60,
  best_time_to_visit VARCHAR(100) DEFAULT NULL,
  facilities JSONB DEFAULT NULL,
  accessibility JSONB DEFAULT NULL,
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id INT DEFAULT NULL REFERENCES vehicles(id),
  guide_id INT DEFAULT NULL REFERENCES tour_guides(id),
  city_id INT NOT NULL REFERENCES cities(id),
  total_price NUMERIC(10,2) NOT NULL,
  budget NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT','CONFIRMED','CANCELLED')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(30) DEFAULT 'transfer' CHECK (payment_method IN ('transfer','cash','credit_card','e_wallet','qris')),
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending','PENDING','paid','failed','refunded')),
  payment_proof VARCHAR(500) DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  trip_date DATE DEFAULT NULL,
  nights INT DEFAULT 1,
  total_rooms INT DEFAULT NULL,
  people_count INT DEFAULT 1,
  vehicle_mode VARCHAR(30) DEFAULT 'automatic' CHECK (vehicle_mode IN ('automatic','custom')),
  payment_proof_url VARCHAR(500) DEFAULT NULL,
  payment_verified_at TIMESTAMP DEFAULT NULL,
  payment_notes TEXT DEFAULT NULL
);

CREATE TABLE booking_details (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  hotel_id INT NOT NULL REFERENCES hotels(id),
  tourist_place_id INT DEFAULT NULL REFERENCES tourist_places(id),
  quantity INT DEFAULT 1,
  price_per_item NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_vehicle_details (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_id INT NOT NULL REFERENCES vehicles(id),
  quantity INT NOT NULL DEFAULT 1,
  price_per_day NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_name VARCHAR(200) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) DEFAULT NULL,
  target_id INT DEFAULT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) DEFAULT NULL,
  resource_id INT DEFAULT NULL,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  hotel_id INT DEFAULT NULL REFERENCES hotels(id) ON DELETE SET NULL,
  tourist_place_ids JSONB DEFAULT NULL,
  name VARCHAR(200) NOT NULL,
  budget NUMERIC(12,2) NOT NULL,
  people_count INT NOT NULL,
  nights INT NOT NULL,
  preferences JSONB DEFAULT NULL,
  generated_itinerary JSONB DEFAULT NULL,
  total_estimated_cost NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  is_saved BOOLEAN DEFAULT FALSE,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  proof_image VARCHAR(255) DEFAULT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','waiting_verification','paid','rejected','refunded')),
  verified_by INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  hotel_rating NUMERIC(2,1) DEFAULT NULL CHECK (hotel_rating >= 0 AND hotel_rating <= 5),
  place_rating NUMERIC(2,1) DEFAULT NULL CHECK (place_rating >= 0 AND place_rating <= 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_trips (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  budget NUMERIC(10,2) NOT NULL,
  days INT DEFAULT 1,
  people_count INT DEFAULT 1,
  tourism_types JSONB DEFAULT NULL,
  hotel_id INT DEFAULT NULL REFERENCES hotels(id) ON DELETE SET NULL,
  tourist_places JSONB DEFAULT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE smart_trip_requests (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  budget NUMERIC(10,2) NOT NULL,
  people_count INT NOT NULL,
  nights INT NOT NULL,
  preferences JSONB DEFAULT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  admin_notes TEXT DEFAULT NULL,
  assigned_package_id INT DEFAULT NULL REFERENCES packages(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tour_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  duration_days INT NOT NULL DEFAULT 1,
  duration_nights INT NOT NULL DEFAULT 1,
  hotel_id INT DEFAULT NULL REFERENCES hotels(id) ON DELETE SET NULL,
  vehicle_id INT DEFAULT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
  tourist_place_ids JSONB DEFAULT NULL,
  price NUMERIC(10,2) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  inclusions JSONB DEFAULT NULL,
  exclusions JSONB DEFAULT NULL,
  itinerary JSONB DEFAULT NULL,
  max_people INT DEFAULT 10,
  min_people INT DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_reviews (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_rating NUMERIC(2,1) DEFAULT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
  hotel_rating NUMERIC(2,1) DEFAULT NULL CHECK (hotel_rating >= 0 AND hotel_rating <= 5),
  itinerary_rating NUMERIC(2,1) DEFAULT NULL CHECK (itinerary_rating >= 0 AND itinerary_rating <= 5),
  value_rating NUMERIC(2,1) DEFAULT NULL CHECK (value_rating >= 0 AND value_rating <= 5),
  review_text TEXT DEFAULT NULL,
  pros JSONB DEFAULT NULL,
  cons JSONB DEFAULT NULL,
  would_recommend BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_analytics (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) DEFAULT NULL,
  action_type VARCHAR(20) DEFAULT NULL CHECK (action_type IN ('search','view','booking','save','share')),
  resource_type VARCHAR(20) DEFAULT NULL CHECK (resource_type IN ('city','hotel','tourist_place','package')),
  resource_id INT DEFAULT NULL,
  metadata JSONB DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_tourism_types JSONB DEFAULT NULL,
  budget_range_min NUMERIC(10,2) DEFAULT NULL,
  budget_range_max NUMERIC(10,2) DEFAULT NULL,
  preferred_accommodation VARCHAR(20) DEFAULT NULL CHECK (preferred_accommodation IN ('low','medium','high')),
  travel_style VARCHAR(20) DEFAULT NULL CHECK (travel_style IN ('budget','comfort','luxury')),
  group_size_preference INT DEFAULT 2,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. IMPLEMENTASI ALGORITMA SAW (Simple Additive Weighting)

### File: `backend/src/utils/packageGenerator.js`

```javascript
// Algoritma perhitungan Match Score menggunakan metode SAW (Simple Additive Weighting)
// Lokasi: backend/src/utils/packageGenerator.js

static calculatePackageScore(hotel, places, budget) {
  // Bobot untuk setiap kriteria (total = 10)
  const hotelFactor = (hotel.rating / 5) * 4;        // Bobot 40% untuk rating hotel
  const destinationFactor = Math.min(places.length / 4, 1) * 3;  // Bobot 30% untuk jumlah destinasi
  const categories = new Set(places.map((p) => p.category));
  const categoryFactor = Math.min(categories.size / 3, 1) * 2;  // Bobot 20% untuk keragaman kategori
  const totalPrice = hotel.price_per_night + places.reduce((sum, p) => sum + p.ticket_price, 0);
  const efficiency = Math.max(0, 1 - (totalPrice - budget * 0.7) / (budget * 0.3));
  const efficiencyFactor = Math.max(0, Math.min(efficiency, 1)) * 1;  // Bobot 10% untuk efisiensi budget
  
  const score = hotelFactor + destinationFactor + categoryFactor + efficiencyFactor;
  return Math.round(score * 10) / 10;
}
```

**Penjelasan Algoritma SAW:**
1. **Hotel Rating (40%)**: Rating hotel dibagi 5, dikalikan 4
2. **Jumlah Destinasi (30%)**: Jumlah tempat wisata dibagi 4, dikalikan 3 (maksimal 1)
3. **Keragaman Kategori (20%)**: Jumlah kategori unik dibagi 3, dikalikan 2 (maksimal 1)
4. **Efisiensi Budget (10%)**: Seberapa efisien paket terhadap budget (range 70-100% budget optimal)

---

## 3. LOGIKA FILTER SOURCE PAKET (Admin vs Generated)

### File: `backend/src/controllers/packageController.js`

```javascript
// Logika filter source paket di endpoint GET /api/packages
// Lokasi: backend/src/controllers/packageController.js

static async generatePackages(req, res) {
  try {
    const { city_id, budget, packages_count = 3, max_places = 4, nights = 1 } = req.query;
    
    // ... validasi parameter ...
    
    // 1. Ambil paket admin yang sudah published
    const publishedAdminPackages = await Package.getPublishedByCity(cityIdNum);
    const adminPackages = [];

    for (const pkg of publishedAdminPackages) {
      // Filter paket admin yang melebihi budget user
      if (pkg.budget !== null && pkg.budget !== undefined && Number(pkg.budget) > budgetNum) {
        continue;
      }

      // ... kalkulasi harga paket admin ...
      
      adminPackages.push({
        id: pkg.id,
        name: pkg.name,
        hotel,
        hotel_tier: hotel.category,
        tourist_places: touristPlaces,
        nights: savedNights,
        people_count: peopleCount,
        hotel_total: hotelTotal,
        places_total: placesTotal,
        total_price: totalPrice,
        budget: Number(pkg.budget || budgetNum),
        remaining_budget: Number(pkg.budget || budgetNum) - totalPrice,
        score: 10,  // Paket admin selalu score 10
        itinerary: pkg.generated_itinerary || null,
        source: 'admin',  // ← MARKER SOURCE ADMIN
        status: pkg.status
      });
    }

    // 2. Generate paket otomatis jika paket admin kurang dari yang diminta
    const generatedPackages = adminPackages.length >= packagesCount
      ? []
      : await PackageGenerator.generatePackages(
          cityIdNum,
          budgetNum,
          {
            packagesCount: Math.max(1, packagesCount - adminPackages.length),
            maxPlaces,
            nights: nightsNum
          }
        );

    // 3. Tambah marker source untuk paket generated
    const normalizedGeneratedPackages = (generatedPackages || []).map((pkg) => ({
      ...pkg,
      source: 'generated',  // ← MARKER SOURCE GENERATED
    }));

    // 4. Gabungkan dan deduplikasi berdasarkan hotel
    const seenKeys = new Set();
    const packages = [...adminPackages, ...normalizedGeneratedPackages]
      .filter((pkg) => {
        const key = pkg.hotel?.id ? `hotel:${pkg.hotel.id}` : `name:${pkg.name || pkg.id}`;
        if (seenKeys.has(key)) {
          return false;
        }
        seenKeys.add(key);
        return true;
      })
      .slice(0, packagesCount);

    res.json({
      success: true,
      data: {
        packages,
        budget_breakdown: budgetBreakdown,
        search_criteria: { /* ... */ }
      }
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

**Penjelasan Logika Filter:**
- Paket dengan `source: 'admin'` = Paket yang dibuat oleh admin secara manual
- Paket dengan `source: 'generated'` = Paket yang di-generate otomatis oleh algoritma
- Paket admin diprioritaskan, jika kurang baru di-generate paket otomatis
- Deduplikasi berdasarkan hotel untuk menghindari paket duplikat

---

## 4. FIX BUG SESSIONSTORAGE

### File: `frontend/src/pages/PackagePage.js`

```javascript
// Penyimpanan dan pembacaan sessionStorage untuk hasil pencarian paket
// Lokasi: frontend/src/pages/PackagePage.js

const getStoredSearchSnapshot = () => {
  try {
    const savedResults = sessionStorage.getItem('searchResults');
    const savedCriteria = sessionStorage.getItem('searchCriteria');

    if (!savedResults || !savedCriteria) {
      return null;
    }

    const results = JSON.parse(savedResults);
    const criteria = JSON.parse(savedCriteria);
    const savedAt = Number(results?.saved_at || criteria?.saved_at || 0);
    const isFresh = !savedAt || Date.now() - savedAt <= SESSION_STORAGE_TTL_MS;  // TTL 5 menit

    return { results, criteria, isFresh };
  } catch (error) {
    return null;
  }
};

const loadSearchResults = async () => {
  setIsLoading(true);
  setError(null);

  const shouldRestoreFromSession = isBackForwardNavigation();
  const sessionSnapshot = getStoredSearchSnapshot();
  const snapshotToUse = resolvePackagePageSessionSnapshot(sessionSnapshot, shouldRestoreFromSession);

  if (snapshotToUse) {
    // Restore dari sessionStorage jika masih fresh
    const savedPackages = snapshotToUse.results?.packages || snapshotToUse.results?.data?.packages || [];
    setPackages(Array.isArray(savedPackages) ? savedPackages : []);
    setSearchCriteria(snapshotToUse.criteria || null);
    // ... refresh data dari API ...
  }
  // ... load fresh data dari API ...
};
```

### File: `frontend/src/pages/LandingPage.js`

```javascript
// Penyimpanan sessionStorage saat user melakukan pencarian
// Lokasi: frontend/src/pages/LandingPage.js

const handleSearch = async (e) => {
  e.preventDefault();
  
  // ... validasi input ...
  
  try {
    if (vehicleMode === 'automatic') {
      const response = await apiService.generatePackages({
        city_id: selectedCity,
        budget: parseFloat(budget),
        packages_count: 3,
        max_places: 4,
        nights: safeNights
      });

      const payload = response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
        ? response.data
        : response || {};
      const packages = getPackagesFromPackageApiResponse(response);

      if (packages.length === 0) {
        setError('No packages found for your criteria. Try increasing your budget or selecting a different city.');
      } else {
        const snapshot = {
          ...payload,
          packages,
          saved_at: Date.now()  // ← TIMESTAMP untuk TTL check
        };

        // Simpan ke sessionStorage
        sessionStorage.setItem('searchResults', JSON.stringify(snapshot));
        sessionStorage.setItem('searchCriteria', JSON.stringify({
          city_id: selectedCity,
          budget: parseFloat(budget),
          nights: safeNights,
          people_count: safePeopleCount,
          peopleCount: safePeopleCount,
          vehicleMode: 'automatic',
          saved_at: Date.now()
        }));
        navigate('/packages');
      }
    } else {
      // Custom vehicle mode
      sessionStorage.setItem('searchCriteria', JSON.stringify({
        city_id: selectedCity,
        budget: parseFloat(budget),
        nights: safeNights,
        people_count: safePeopleCount,
        peopleCount: safePeopleCount,
        vehicleMode: 'custom',
        saved_at: Date.now()
      }));
      navigate('/checkout');
    }
  } catch (error) {
    setError('Failed to search packages. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

**Penjelasan Fix SessionStorage:**
- Hasil pencarian disimpan di `sessionStorage` dengan timestamp
- TTL (Time To Live) = 5 menit untuk memastikan data fresh
- Data di-restore saat user melakukan back/forward navigation
- Data di-refresh dari API jika sudah expired atau tidak ada di sessionStorage

---

## 5. FIX BUG NUMERIC POSTGRESQL

### File: `backend/src/models/database.js`

```javascript
// Konversi tipe data NUMERIC dari string ke number untuk PostgreSQL
// Lokasi: backend/src/models/database.js

function buildQueryResponse(result, rows) {
  const command = result.command || 'SELECT';
  const fields = result.fields || [];
  const rowCount = result.rowCount || 0;
  let insertId = null;

  if (command === 'SELECT' && Array.isArray(rows)) {
    // Daftar kolom numerik yang perlu dikonversi dari string ke number
    const numericKeys = ['price_per_night', 'ticket_price', 'price_per_day', 'total_price', 'budget', 'amount', 'rating', 'lat', 'lng', 'total_estimated_cost'];
    
    rows.forEach((row) => {
      numericKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(row, key) && typeof row[key] === 'string') {
          const parsed = Number(row[key]);  // ← KONVERSI STRING KE NUMBER
          if (!Number.isNaN(parsed)) {
            row[key] = parsed;  // ← REPLACE STRING DENGAN NUMBER
          }
        }
      });
    });
  }

  // ... build response ...
  return response;
}
```

**Penjelasan Fix Numeric PostgreSQL:**
- PostgreSQL mengembalikan tipe NUMERIC sebagai string di Node.js
- Fungsi `buildQueryResponse` secara otomatis mengkonversi kolom numerik dari string ke number
- Kolom yang dikonversi: price_per_night, ticket_price, price_per_day, total_price, budget, amount, rating, lat, lng, total_estimated_cost
- Mencegah error saat frontend melakukan operasi matematika pada data numerik

---

## 6. STRUKTUR FOLDER LENGKAP

### Backend Structure (`backend/src/`)

```
backend/src/
├── controllers/          (12 files)
│   ├── adminController.js
│   ├── authController.js
│   ├── bookingController.js
│   ├── cityController.js
│   ├── hotelController.js
│   ├── NotificationController.js
│   ├── packageController.js
│   ├── paymentController.js
│   ├── touristPlaceController.js
│   ├── tourGuideController.js
│   ├── userController.js
│   └── vehicleController.js
├── helpers/              (1 file)
│   └── activityLogger.js
├── middleware/           (3 files)
│   ├── auth.js
│   ├── role.js
│   └── upload.js
├── models/               (12 files)
│   ├── ActivityLog.js
│   ├── Booking.js
│   ├── City.js
│   ├── Hotel.js
│   ├── Notification.js
│   ├── Package.js
│   ├── Payment.js
│   ├── TourGuide.js
│   ├── TouristPlace.js
│   ├── User.js
│   ├── Vehicle.js
│   └── database.js
├── routes/               (11 files)
│   ├── admin.js
│   ├── auth.js
│   ├── booking.js
│   ├── cities.js
│   ├── hotels.js
│   ├── notifications.js
│   ├── packages.js
│   ├── payments.js
│   ├── touristGuides.js
│   ├── touristPlaces.js
│   └── vehicles.js
└── utils/                (2 files)
    ├── packageGenerator.js
    └── validationHelper.js
```

### Frontend Structure (`frontend/src/`)

```
frontend/src/
├── App.js
├── index.css
├── index.js
├── components/           (8 files)
│   ├── AdminLayout.js
│   ├── BookingContext.js
│   ├── ErrorMessage.js
│   ├── ImageWithFallback.js
│   ├── LoadingSpinner.js
│   ├── MapView.js
│   ├── Navbar.js
│   └── ProtectedRoute.js
├── context/              (3 files)
│   ├── AuthContext.js
│   ├── BookingContext.js
│   └── ThemeContext.js
├── pages/                (29 files)
│   ├── AboutPage.js
│   ├── AdminActivityLogs.js
│   ├── AdminBookings.js
│   ├── AdminCustomers.js
│   ├── AdminDashboard.js
│   ├── AdminDestinations.js
│   ├── AdminHotels.js
│   ├── AdminLoginPage.js
│   ├── AdminPackages.js
│   ├── AdminPayments.js
│   ├── AdminSettings.js
│   ├── AdminSmartTrips.js
│   ├── AdminTourGuides.js
│   ├── AdminVehicles.js
│   ├── BookingDetail.js
│   ├── CheckoutPage.js
│   ├── ContactPage.js
│   ├── CustomPage.js
│   ├── CustomerBookings.js
│   ├── CustomerHomePage.jsx
│   ├── DetailPage.js
│   ├── ExploreMap.js
│   ├── LandingPage.js
│   ├── LoginPage.js
│   ├── MapPage.js
│   ├── Notifications.js
│   ├── PackagePage.js
│   ├── ProfilePage.js
│   └── SuccessPage.js
├── services/             (1 file)
│   └── api.js
└── utils/                (6 files)
│   ├── helpers.js
│   ├── packageResponse.js
│   ├── packageResponse.test.js
│   ├── popularCities.js
│   └── validationHelper.js
```

---

## 7. DAFTAR ENDPOINT API

### Routes: `backend/src/routes/admin.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/admin/dashboard` | AdminController.getDashboardStats | authenticateAdmin, adminOnly | Get dashboard statistics |
| GET | `/admin/bookings` | AdminController.getAllBookings | authenticateAdmin, adminOnly | Get all bookings |
| PUT | `/admin/bookings/:id/status` | AdminController.updateBookingStatus | authenticateAdmin, adminOnly | Update booking status |
| GET | `/admin/payments` | AdminController.getAllPayments | authenticateAdmin, adminOnly | Get all payments |
| PUT | `/admin/payments/:id/verify` | AdminController.verifyPayment | authenticateAdmin, adminOnly | Verify payment |
| GET | `/admin/customers` | AdminController.getAllCustomers | authenticateAdmin, adminOnly | Get all customers |
| GET | `/admin/vehicles` | AdminController.getAllVehicles | authenticateAdmin, adminOnly | Get all vehicles |
| GET | `/admin/tour-guides` | AdminController.getAllTourGuides | authenticateAdmin, adminOnly | Get all tour guides |
| GET | `/admin/analytics` | AdminController.getAnalytics | authenticateAdmin, adminOnly | Get analytics data |
| GET | `/admin/packages` | AdminController.getAdminPackages | authenticateAdmin, adminOnly | Get admin packages |
| POST | `/admin/packages` | AdminController.createAdminPackage | authenticateAdmin, adminOnly | Create admin package |
| PUT | `/admin/packages/:id` | AdminController.updateAdminPackage | authenticateAdmin, adminOnly | Update admin package |
| DELETE | `/admin/packages/:id` | AdminController.deleteAdminPackage | authenticateAdmin, adminOnly | Delete admin package |
| GET | `/admin/packages/suggest-places` | AdminController.suggestPlaces | authenticateAdmin, adminOnly | Suggest places for package |
| GET | `/admin/activity-logs` | AdminController.getActivityLogs | authenticateAdmin, adminOnly | Get activity logs |
| GET | `/admin/activity-logs/filters` | AdminController.getActivityLogFilters | authenticateAdmin, adminOnly | Get activity log filters |

### Routes: `backend/src/routes/auth.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| POST | `/auth/register` | AuthController.register | - | Register new user |
| POST | `/auth/login` | AuthController.login | - | User login |
| POST | `/auth/admin/login` | AuthController.adminLogin | - | Admin login |
| GET | `/auth/profile` | AuthController.getProfile | authenticate | Get user profile |
| PUT | `/auth/profile` | AuthController.updateProfile | authenticate | Update user profile |
| PUT | `/auth/change-password` | AuthController.changePassword | authenticate | Change password |
| POST | `/auth/admin/create` | AuthController.createAdmin | authenticate, adminOnly | Create admin user |
| GET | `/auth/admin/users` | AuthController.getAllUsers | authenticate, adminOnly | Get all users |
| PUT | `/auth/admin/users/:id/role` | AuthController.updateUserRole | authenticate, adminOnly | Update user role |
| DELETE | `/auth/admin/users/:id` | AuthController.deleteUser | authenticate, adminOnly | Delete user |

### Routes: `backend/src/routes/booking.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| POST | `/booking` | BookingController.createBooking | authenticate | Create new booking |
| GET | `/booking` | BookingController.getAllBookings | authenticate, adminOnly | Get all bookings |
| GET | `/booking/email` | BookingController.getBookingsByEmail | authenticate | Get bookings by email |
| GET | `/booking/my-bookings` | BookingController.getBookingsByEmail | authenticate | Get current user's bookings |
| GET | `/booking/stats` | BookingController.getBookingStats | authenticate, adminOnly | Get booking statistics |
| GET | `/booking/popular` | BookingController.getPopularDestinations | - | Get popular destinations |
| GET | `/booking/:id` | BookingController.getBookingById | authenticate | Get booking by ID |
| PUT | `/booking/:id/status` | BookingController.updateBookingStatus | authenticate, adminOnly | Update booking status |
| PUT | `/booking/:id/cancel` | BookingController.cancelBooking | authenticate | Cancel booking |
| PUT | `/booking/:id/confirm` | BookingController.confirmBooking | authenticate, adminOnly | Confirm booking |
| DELETE | `/booking/:id` | BookingController.deleteBooking | authenticate, adminOnly | Delete booking |

### Routes: `backend/src/routes/packages.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/packages` | PackageController.generatePackages | - | Generate travel packages |
| POST | `/packages/custom` | PackageController.calculateCustomPackage | - | Calculate custom package price |
| POST | `/packages/validate` | PackageController.validatePackage | - | Validate package against budget |
| GET | `/packages/budget-breakdown` | PackageController.getBudgetBreakdown | - | Get budget breakdown |

### Routes: `backend/src/routes/cities.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/cities` | CityController.getAllCities | - | Get all cities |
| GET | `/cities/:id` | CityController.getCityById | - | Get city by ID |
| GET | `/cities/:id/stats` | CityController.getCityWithStats | - | Get city with statistics |
| POST | `/cities` | CityController.createCity | authenticate, adminOnly | Create new city |
| PUT | `/cities/:id` | CityController.updateCity | authenticate, adminOnly | Update city |
| DELETE | `/cities/:id` | CityController.deleteCity | authenticate, adminOnly | Delete city |

### Routes: `backend/src/routes/hotels.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/hotels` | HotelController.getAllHotels | - | Get all hotels |
| GET | `/hotels/city/:cityId` | HotelController.getHotelsByCity | - | Get hotels by city |
| GET | `/hotels/:id` | HotelController.getHotelById | - | Get hotel by ID |
| POST | `/hotels` | HotelController.createHotel | authenticate, adminOnly | Create new hotel |
| PUT | `/hotels/:id` | HotelController.updateHotel | authenticate, adminOnly | Update hotel |
| DELETE | `/hotels/:id` | HotelController.deleteHotel | authenticate, adminOnly | Delete hotel |

### Routes: `backend/src/routes/touristPlaces.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/tourist-places` | TouristPlaceController.getAllTouristPlaces | - | Get all tourist places |
| GET | `/tourist-places/city/:cityId` | TouristPlaceController.getTouristPlacesByCity | - | Get tourist places by city |
| GET | `/tourist-places/:id` | TouristPlaceController.getTouristPlaceById | - | Get tourist place by ID |
| POST | `/tourist-places` | TouristPlaceController.createTouristPlace | authenticate, adminOnly | Create new tourist place |
| PUT | `/tourist-places/:id` | TouristPlaceController.updateTouristPlace | authenticate, adminOnly | Update tourist place |
| DELETE | `/tourist-places/:id` | TouristPlaceController.deleteTouristPlace | authenticate, adminOnly | Delete tourist place |

### Routes: `backend/src/routes/vehicles.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/vehicles` | VehicleController.getAllVehicles | - | Get all vehicles |
| GET | `/vehicles/capacity/:minCapacity/:maxCapacity` | VehicleController.getVehiclesByCapacity | - | Get vehicles by capacity |
| GET | `/vehicles/recommend` | VehicleController.getRecommendedVehicle | - | Get recommended vehicle |
| GET | `/vehicles/:id` | VehicleController.getVehicleById | - | Get vehicle by ID |
| POST | `/vehicles` | VehicleController.createVehicle | authenticate, adminOnly, uploadVehicle | Create new vehicle |
| PUT | `/vehicles/:id` | VehicleController.updateVehicle | authenticate, adminOnly, uploadVehicle | Update vehicle |
| DELETE | `/vehicles/:id` | VehicleController.deleteVehicle | authenticate, adminOnly | Delete vehicle |

### Routes: `backend/src/routes/tourGuides.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/tour-guides` | TourGuideController.getAllTourGuides | - | Get all tour guides |
| GET | `/tour-guides/specialization/:specialization` | TourGuideController.getTourGuidesBySpecialization | - | Get tour guides by specialization |
| GET | `/tour-guides/top-rated` | TourGuideController.getTopRatedTourGuides | - | Get top rated tour guides |
| GET | `/tour-guides/:id` | TourGuideController.getTourGuideById | - | Get tour guide by ID |
| POST | `/tour-guides` | TourGuideController.createTourGuide | authenticate, adminOnly | Create new tour guide |
| PUT | `/tour-guides/:id` | TourGuideController.updateTourGuide | authenticate, adminOnly | Update tour guide |
| DELETE | `/tour-guides/:id` | TourGuideController.deleteTourGuide | authenticate, adminOnly | Delete tour guide |
| PUT | `/tour-guides/:id/rating` | TourGuideController.updateTourGuideRating | authenticate, adminOnly | Update tour guide rating |

### Routes: `backend/src/routes/payments.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| POST | `/payments` | PaymentController.createPayment | authenticate | Create payment |
| GET | `/payments/my-payments` | PaymentController.getMyPayments | authenticate | Get my payments |
| POST | `/payments/upload-proof` | PaymentController.uploadPaymentProof | authenticate, uploadPayment | Upload payment proof |
| GET | `/payments/booking/:bookingId` | PaymentController.getPaymentsByBookingId | authenticate | Get payments by booking ID |
| GET | `/payments/:id/proof` | PaymentController.getPaymentProof | authenticate, adminOnly | Get payment proof |
| GET | `/payments/:id` | PaymentController.getPaymentById | authenticate | Get payment by ID |
| GET | `/payments/stats` | PaymentController.getPaymentStats | authenticate, adminOnly | Get payment statistics |
| GET | `/payments/status/:status` | PaymentController.getPaymentsByStatus | authenticate, adminOnly | Get payments by status |
| PUT | `/payments/:id/status` | PaymentController.updatePaymentStatus | authenticate, adminOnly | Update payment status |
| DELETE | `/payments/:id` | PaymentController.deletePayment | authenticate, adminOnly | Delete payment |

### Routes: `backend/src/routes/notifications.js`

| Method | Endpoint | Controller | Middleware | Deskripsi |
|--------|----------|------------|------------|-----------|
| GET | `/notifications` | NotificationController.getNotifications | authenticate | Get notifications |
| GET | `/notifications/unread-count` | NotificationController.getUnreadCount | authenticate | Get unread count |
| PUT | `/notifications/:id/read` | NotificationController.markAsRead | authenticate | Mark notification as read |
| POST | `/notifications/admin-send` | NotificationController.adminSendNotification | authenticateAdmin, adminOnly | Admin send notification |

---

## Ringkasan Teknologi

### Backend
- **Framework**: Node.js dengan Express.js
- **Database**: PostgreSQL (NeonDB)
- **Authentication**: JWT (JSON Web Token)
- **File Upload**: Multer
- **Algoritma Rekomendasi**: SAW (Simple Additive Weighting)

### Frontend
- **Framework**: React.js
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Fitur Utama
1. **Package Generation**: Algoritma SAW untuk rekomendasi paket wisata
2. **Admin Panel**: Dashboard lengkap untuk manajemen data
3. **Activity Log**: Audit trail untuk semua admin actions dengan proteksi admin
4. **Session Storage**: Caching hasil pencarian dengan TTL 5 menit
5. **Numeric Conversion**: Otomatis konversi NUMERIC PostgreSQL ke JavaScript Number
6. **Source Filtering**: Distinguish antara paket admin dan generated
