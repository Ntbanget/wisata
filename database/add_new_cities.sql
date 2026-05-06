-- Add new cities + their hotels + tourist places.
-- Safe to run on an existing database; uses INSERT IGNORE for cities so re-runs are idempotent.
-- Run via phpMyAdmin Import tab, or:
--   mysql -u root -p wisata_db < add_new_cities.sql

USE wisata_db;

-- ===== New cities =====
INSERT IGNORE INTO cities (id, name) VALUES
(10, 'Pemalang'),
(11, 'Kendal'),
(12, 'Yogyakarta');

-- ===== Pemalang Hotels =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Regina Pemalang', 10, 380000, 3.8, 'medium', -6.8910, 109.3782, 'https://example.com/regina.jpg', 'Comfortable hotel in Pemalang city center'),
('Hotel Winner Pemalang', 10, 320000, 3.6, 'low', -6.8895, 109.3768, 'https://example.com/winner.jpg', 'Budget-friendly hotel near Alun-Alun Pemalang'),
('Hotel Kencana Pemalang', 10, 480000, 4.0, 'medium', -6.8924, 109.3815, 'https://example.com/kencana.jpg', 'Mid-range hotel with restaurant and pool'),
('Pantai Widuri Resort', 10, 620000, 4.2, 'high', -6.8537, 109.3791, 'https://example.com/widuri-resort.jpg', 'Beachfront resort at Pantai Widuri');

-- ===== Pemalang Tourist Places =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Pantai Widuri', 10, 10000, 'Beach', -6.8523, 109.3755, 'https://example.com/widuri.jpg', 'Popular beach with water park and fish market'),
('Widuri Water Park', 10, 35000, 'Recreation', -6.8531, 109.3742, 'https://example.com/widuripark.jpg', 'Family water park beside Pantai Widuri'),
('Pantai Blendung', 10, 5000, 'Beach', -6.7945, 109.4856, 'https://example.com/blendung.jpg', 'Quiet beach with mangrove forest'),
('Pantai Joko Tingkir', 10, 5000, 'Beach', -6.8410, 109.3987, 'https://example.com/jokotingkir.jpg', 'Coastal area with traditional fishing boats'),
('Curug Bengkawah', 10, 10000, 'Nature', -6.9933, 109.5333, 'https://example.com/bengkawah.jpg', 'Twin waterfall in Belik, Pemalang'),
('Curug Sibedil', 10, 8000, 'Nature', -7.0023, 109.5210, 'https://example.com/sibedil.jpg', 'Tiered waterfall in Watukumpul'),
('Aquarium Purbasari', 10, 25000, 'Recreation', -7.4126, 109.3675, 'https://example.com/purbasari.jpg', 'Owabong Aquarium with marine life and fish exhibits'),
('Desa Wisata Banjardawa (Dlas)', 10, 5000, 'Cultural', -6.9032, 109.4012, 'https://example.com/banjardawa.jpg', 'Tourist village with traditional Pemalang crafts'),
('Bukit Mendelem', 10, 10000, 'Nature', -7.0312, 109.4823, 'https://example.com/mendelem.jpg', 'Hilltop with panoramic mountain views'),
('Telaga Silating', 10, 8000, 'Nature', -6.9456, 109.4698, 'https://example.com/silating.jpg', 'Mountain lake with cool climate');

-- ===== Kendal Hotels =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Sae Inn Kendal', 11, 320000, 3.7, 'medium', -6.9181, 110.2042, 'https://example.com/saeinn.jpg', 'Comfortable hotel in Kendal city'),
('Hotel Sendang Kalimas', 11, 280000, 3.5, 'low', -6.9156, 110.2089, 'https://example.com/sendang.jpg', 'Budget hotel near Alun-Alun Kendal'),
('Plataran Heritage Borobudur Hotel - Kendal', 11, 580000, 4.3, 'medium', -7.0341, 110.1158, 'https://example.com/plataran.jpg', 'Mid-range hotel near Curug Sewu'),
('Hotel Kendal Permai', 11, 380000, 3.9, 'medium', -6.9203, 110.2087, 'https://example.com/kendalpermai.jpg', 'Family-oriented hotel in Kendal');

-- ===== Kendal Tourist Places =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Curug Sewu', 11, 15000, 'Nature', -7.0356, 110.1167, 'https://example.com/curugsewu.jpg', 'Three-tier waterfall, the highest in Central Java'),
('Pantai Sendang Sikucing', 11, 10000, 'Beach', -6.9025, 110.0394, 'https://example.com/sikucing.jpg', 'Sandy beach with calm waves'),
('Pantai Cahaya', 11, 10000, 'Beach', -6.9134, 110.0512, 'https://example.com/cahaya.jpg', 'Beach with stunning sunset views'),
('Kampung Jawa Sekatul', 11, 15000, 'Cultural', -7.0892, 110.1833, 'https://example.com/sekatul.jpg', 'Traditional Javanese village resort experience'),
('Curug Penglebur', 11, 5000, 'Nature', -7.0723, 110.1923, 'https://example.com/penglebur.jpg', 'Hidden waterfall in lush forest'),
('Bukit Cinta Kendal', 11, 8000, 'Nature', -7.1023, 110.2156, 'https://example.com/bukitcinta.jpg', 'Romantic hilltop viewpoint'),
('Goa Kiskendo', 11, 10000, 'Nature', -7.1567, 110.1456, 'https://example.com/kiskendo.jpg', 'Limestone cave with stalactites'),
('Pantai Muara Kencan', 11, 5000, 'Beach', -6.8987, 110.0234, 'https://example.com/muarakencan.jpg', 'Estuary beach with mangrove area'),
('Air Terjun Lawe', 11, 5000, 'Nature', -7.1900, 110.1734, 'https://example.com/lawe.jpg', 'Twin waterfalls in mountainous area');

-- ===== Yogyakarta Hotels =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Tentrem Yogyakarta', 12, 1200000, 4.8, 'high', -7.7641, 110.3795, 'https://example.com/tentrem.jpg', 'Five-star luxury hotel with Javanese touches'),
('The Phoenix Hotel Yogyakarta', 12, 950000, 4.6, 'high', -7.7884, 110.3669, 'https://example.com/phoenix.jpg', 'Heritage colonial hotel near Tugu Jogja'),
('Royal Ambarrukmo Yogyakarta', 12, 1050000, 4.7, 'high', -7.7847, 110.3987, 'https://example.com/ambarrukmo.jpg', 'Royal heritage hotel with Mataram architecture'),
('Greenhost Boutique Hotel', 12, 480000, 4.2, 'medium', -7.8133, 110.3614, 'https://example.com/greenhost.jpg', 'Eco-friendly boutique hotel near Prawirotaman'),
('Hotel Neo Malioboro', 12, 420000, 4.0, 'medium', -7.7918, 110.3676, 'https://example.com/neomalioboro.jpg', 'Modern hotel right at Jalan Malioboro'),
('Cordela Hotel Senopati', 12, 320000, 3.7, 'low', -7.8012, 110.3712, 'https://example.com/cordela.jpg', 'Affordable hotel near Alun-Alun Utara'),
('Whiz Hotel Malioboro', 12, 300000, 3.6, 'low', -7.7895, 110.3681, 'https://example.com/whiz.jpg', 'Budget chain hotel in Malioboro area'),
('Tugu Hotel Yogyakarta', 12, 880000, 4.5, 'high', -7.7842, 110.3661, 'https://example.com/tuguhotel.jpg', 'Iconic boutique hotel with art collection');

-- ===== Yogyakarta Tourist Places =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Jalan Malioboro', 12, 0, 'Cultural', -7.7929, 110.3658, 'https://example.com/malioboro.jpg', 'Famous shopping street with batik, food, and art'),
('Keraton Ngayogyakarta Hadiningrat', 12, 15000, 'Historical', -7.8053, 110.3641, 'https://example.com/keratonjogja.jpg', 'Royal palace of the Sultan of Yogyakarta'),
('Taman Sari Water Castle', 12, 15000, 'Historical', -7.8101, 110.3597, 'https://example.com/tamansari.jpg', 'Former royal garden with bathing pools'),
('Tugu Yogyakarta', 12, 0, 'Monument', -7.7831, 110.3669, 'https://example.com/tugujogja.jpg', 'Iconic landmark of Yogyakarta city'),
('Candi Prambanan', 12, 50000, 'Historical', -7.7520, 110.4915, 'https://example.com/prambanan.jpg', 'UNESCO Hindu temple complex with Ramayana story'),
('Pantai Parangtritis', 12, 10000, 'Beach', -8.0247, 110.3331, 'https://example.com/parangtritis.jpg', 'Famous beach south of Yogyakarta'),
('Pantai Indrayanti', 12, 10000, 'Beach', -8.1414, 110.6164, 'https://example.com/indrayanti.jpg', 'White sand beach in Gunungkidul'),
('Goa Pindul', 12, 35000, 'Adventure', -7.9192, 110.6358, 'https://example.com/pindul.jpg', 'Cave tubing adventure in Gunungkidul'),
('Hutan Pinus Mangunan', 12, 5000, 'Nature', -7.9326, 110.4458, 'https://example.com/mangunan.jpg', 'Pine forest with hilltop viewpoints'),
('Heha Sky View', 12, 30000, 'Recreation', -7.9094, 110.4625, 'https://example.com/heha.jpg', 'Sky-themed restaurant and Instagram spot'),
('Candi Borobudur (Yogya tour)', 12, 50000, 'Historical', -7.6079, 110.2038, 'https://example.com/borobudur-jogja.jpg', 'Most popular tour from Yogyakarta'),
('Alun-Alun Kidul Yogyakarta', 12, 0, 'Cultural', -7.8125, 110.3636, 'https://example.com/alunkidul-jogja.jpg', 'South square with twin banyan trees'),
('Museum Ullen Sentalu', 12, 50000, 'Museum', -7.5834, 110.4234, 'https://example.com/ullensentalu.jpg', 'Java cultural and history museum in Kaliurang'),
('Kaliurang', 12, 8000, 'Nature', -7.5923, 110.4292, 'https://example.com/kaliurang.jpg', 'Mountain resort area on Mount Merapi slopes');

SELECT 'Pemalang, Kendal, and Yogyakarta added with hotels and tourist places' AS status;
