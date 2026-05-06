-- Comprehensive data fix: correct coordinates, remove Tegal, remove >50km outliers.
-- Safe to run multiple times (idempotent UPDATEs + DELETE WHERE).
-- Import via phpMyAdmin -> Import tab.

USE wisata_db;

-- =============================================
-- 1. DELETE TEGAL (city_id=8) entirely
-- =============================================
DELETE FROM tourist_places WHERE city_id = 8;
DELETE FROM hotels WHERE city_id = 8;
DELETE FROM cities WHERE id = 8;

-- =============================================
-- 2. REMOVE OUTLIERS > 50km from their city
--    or attractions that geographically belong to another city
-- =============================================
-- Aquarium Purbasari is in Purbalingga (~58km from Pemalang center)
DELETE FROM tourist_places WHERE name = 'Aquarium Purbasari' AND city_id = 10;
-- Borobudur is in Magelang regency, not Yogyakarta — it's already listed under Magelang (city_id=3)
DELETE FROM tourist_places WHERE name = 'Candi Borobudur (Yogya tour)' AND city_id = 12;
-- Pantai Indrayanti is in Gunungkidul, ~57km from Yogyakarta center
DELETE FROM tourist_places WHERE name = 'Pantai Indrayanti' AND city_id = 12;
-- Pantai Menganti and Waduk Sempor are in Kebumen, far from Purwokerto
DELETE FROM tourist_places WHERE name = 'Pantai Menganti' AND city_id = 7;
DELETE FROM tourist_places WHERE name = 'Waduk Sempor' AND city_id = 7;

-- =============================================
-- 3. FIX SALATIGA HOTELS (were at -7.19, should be ~-7.33)
-- =============================================
UPDATE hotels SET lat = -7.3298, lng = 110.4932
WHERE name = 'Hotel Graha Santika Salatiga';

UPDATE hotels SET lat = -7.3315, lng = 110.4978
WHERE name = 'Hotel Laras Asri Salatiga';

UPDATE hotels SET lat = -7.3282, lng = 110.4985
WHERE name = 'Hotel Amaris Salatiga';

-- =============================================
-- 4. FIX SALATIGA TOURIST PLACES
-- =============================================
UPDATE tourist_places SET lat = -7.2200, lng = 110.4556
WHERE name = 'Kopeng Treetop Adventure';

UPDATE tourist_places SET lat = -7.2089, lng = 110.4458
WHERE name = 'Umbul Sidomukti';

UPDATE tourist_places SET lat = -7.4500, lng = 110.4350
WHERE name = 'Gunung Merbabu';

UPDATE tourist_places SET lat = -7.3301, lng = 110.5079
WHERE name = 'Museum Satwa Satwani';

UPDATE tourist_places SET lat = -7.3283, lng = 110.4953
WHERE name = 'Taman Kota Salatiga';

UPDATE tourist_places SET lat = -7.2222, lng = 110.4500
WHERE name = 'Air Terjun Kali Pancur';

UPDATE tourist_places SET lat = -7.3340, lng = 110.5120
WHERE name = 'Candi Temple';

UPDATE tourist_places SET lat = -7.3600, lng = 110.4024
WHERE name = 'Puncak Gunung Telomoyo';

-- =============================================
-- 5. FIX PURWOKERTO TOURIST PLACES
-- =============================================
UPDATE tourist_places SET lat = -7.3126, lng = 109.2250
WHERE name = 'Baturraden';

UPDATE tourist_places SET lat = -7.4127, lng = 109.3675
WHERE name = 'Owabong Waterpark';

UPDATE tourist_places SET lat = -7.4241, lng = 109.2354
WHERE name = 'Museum Bank Rakyat Indonesia';

UPDATE tourist_places SET lat = -7.4298, lng = 109.2334
WHERE name = 'Alun-Alun Purwokerto';

UPDATE tourist_places SET lat = -7.3670, lng = 109.2450
WHERE name = 'Curug Cipendok';

UPDATE tourist_places SET lat = -7.3900, lng = 109.3550
WHERE name = 'Small World';

UPDATE tourist_places SET lat = -7.7372, lng = 109.4600
WHERE name = 'Pantai Menganti';

UPDATE tourist_places SET lat = -7.5744, lng = 109.5167
WHERE name = 'Waduk Sempor';

-- =============================================
-- 6. FIX JEPARA TOURIST PLACES
-- =============================================
UPDATE tourist_places SET lat = -6.5770, lng = 110.6319
WHERE name = 'Pulau Panjang';

UPDATE tourist_places SET lat = -6.5942, lng = 110.6713
WHERE name = 'Museum R.A. Kartini';

UPDATE tourist_places SET lat = -6.5910, lng = 110.6486
WHERE name = 'Benteng VOC';

UPDATE tourist_places SET lat = -6.5673, lng = 110.6233
WHERE name = 'Pantai Teluk Awur';

UPDATE tourist_places SET lat = -6.6108, lng = 110.8375
WHERE name = 'Makam Sunan Muria';

UPDATE tourist_places SET lat = -6.6071, lng = 110.6768
WHERE name = 'Desa Ukir Jepara';

-- =============================================
-- 7. FIX PEKALONGAN TOURIST PLACES
-- =============================================
UPDATE tourist_places SET lat = -6.8897, lng = 109.6683
WHERE name = 'Museum Batik Pekalongan';

UPDATE tourist_places SET lat = -6.8885, lng = 109.6746
WHERE name = 'Alun-Alun Pekalongan';

UPDATE tourist_places SET lat = -6.8741, lng = 109.6738
WHERE name = 'Pantai Pekalongan';

UPDATE tourist_places SET lat = -6.8878, lng = 109.6723
WHERE name = 'Kampung Batik Kauman';

UPDATE tourist_places SET lat = -6.8612, lng = 109.6454
WHERE name = 'Pantai Wonokerto';

UPDATE tourist_places SET lat = -6.8909, lng = 109.6700
WHERE name = 'Museum UMKM Pekalongan';

UPDATE tourist_places SET lat = -6.8750, lng = 109.6812
WHERE name = 'Pantai Slamaran';

UPDATE tourist_places SET lat = -6.8650, lng = 109.6590
WHERE name = 'Wisata Bahari Pekalongan';

-- =============================================
-- 8. FIX PEMALANG COORDINATES
-- =============================================
UPDATE tourist_places SET lat = -6.8564, lng = 109.3750
WHERE name = 'Pantai Widuri';

UPDATE tourist_places SET lat = -6.8570, lng = 109.3738
WHERE name = 'Widuri Water Park';

UPDATE tourist_places SET lat = -6.8150, lng = 109.4800
WHERE name = 'Pantai Blendung';

UPDATE tourist_places SET lat = -6.8450, lng = 109.3950
WHERE name = 'Pantai Joko Tingkir';

UPDATE tourist_places SET lat = -7.0050, lng = 109.5200
WHERE name = 'Curug Bengkawah';

UPDATE tourist_places SET lat = -7.0100, lng = 109.5150
WHERE name = 'Curug Sibedil';

UPDATE tourist_places SET lat = -7.2289, lng = 109.4339
WHERE name LIKE '%LAS%Lembah Asri%';

UPDATE tourist_places SET lat = -7.0200, lng = 109.4700
WHERE name = 'Bukit Mendelem';

UPDATE tourist_places SET lat = -6.9500, lng = 109.4650
WHERE name = 'Telaga Silating';

-- =============================================
-- 9. FIX KENDAL COORDINATES
-- =============================================
UPDATE tourist_places SET lat = -7.0400, lng = 110.1200
WHERE name = 'Curug Sewu';

UPDATE tourist_places SET lat = -6.9100, lng = 110.0400
WHERE name = 'Pantai Sendang Sikucing';

UPDATE tourist_places SET lat = -6.9150, lng = 110.0500
WHERE name = 'Pantai Cahaya';

UPDATE tourist_places SET lat = -7.0800, lng = 110.1800
WHERE name = 'Kampung Jawa Sekatul';

UPDATE tourist_places SET lat = -7.0700, lng = 110.1900
WHERE name = 'Curug Penglebur';

UPDATE tourist_places SET lat = -7.1000, lng = 110.2100
WHERE name = 'Bukit Cinta Kendal';

UPDATE tourist_places SET lat = -7.1500, lng = 110.1400
WHERE name = 'Goa Kiskendo';

UPDATE tourist_places SET lat = -6.9000, lng = 110.0250
WHERE name = 'Pantai Muara Kencan';

UPDATE tourist_places SET lat = -7.1800, lng = 110.1700
WHERE name = 'Air Terjun Lawe';

-- =============================================
-- 10. FIX YOGYAKARTA COORDINATES (verify)
-- =============================================
UPDATE tourist_places SET lat = -7.7929, lng = 110.3658
WHERE name = 'Jalan Malioboro';

UPDATE tourist_places SET lat = -7.8053, lng = 110.3641
WHERE name = 'Keraton Ngayogyakarta Hadiningrat';

UPDATE tourist_places SET lat = -7.8101, lng = 110.3597
WHERE name = 'Taman Sari Water Castle';

UPDATE tourist_places SET lat = -7.7831, lng = 110.3669
WHERE name = 'Tugu Yogyakarta';

UPDATE tourist_places SET lat = -7.7520, lng = 110.4915
WHERE name = 'Candi Prambanan';

UPDATE tourist_places SET lat = -8.0247, lng = 110.3331
WHERE name = 'Pantai Parangtritis';

UPDATE tourist_places SET lat = -8.1414, lng = 110.6164
WHERE name = 'Pantai Indrayanti';

UPDATE tourist_places SET lat = -7.9192, lng = 110.6358
WHERE name = 'Goa Pindul';

UPDATE tourist_places SET lat = -7.9326, lng = 110.4458
WHERE name = 'Hutan Pinus Mangunan';

UPDATE tourist_places SET lat = -7.9094, lng = 110.4625
WHERE name = 'Heha Sky View';

UPDATE tourist_places SET lat = -7.8125, lng = 110.3636
WHERE name = 'Alun-Alun Kidul Yogyakarta';

UPDATE tourist_places SET lat = -7.5834, lng = 110.4234
WHERE name = 'Museum Ullen Sentalu';

UPDATE tourist_places SET lat = -7.5923, lng = 110.4292
WHERE name = 'Kaliurang';

SELECT 'All coordinate fixes applied, Tegal removed, outliers cleaned' AS status;

-- =============================================
-- 11. ADD HOTELS NEAR MAJOR TOURIST OBJECTS
-- =============================================
-- Near Borobudur (Magelang, city_id=3)
INSERT IGNORE INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Plataran Borobudur Resort', 3, 1100000, 4.7, 'high', -7.6005, 110.2079, 'https://example.com/plataran-bbd.jpg', 'Luxury resort with direct view of Borobudur temple'),
('Manohara Resort Borobudur', 3, 720000, 4.4, 'high', -7.6079, 110.2058, 'https://example.com/manohara.jpg', 'Resort located inside Borobudur temple complex'),
('Pondok Tingal Borobudur', 3, 320000, 3.7, 'low', -7.6052, 110.2105, 'https://example.com/pondoktingal.jpg', 'Affordable guesthouse 5 minutes from Borobudur');

-- Near Dieng / Wonosobo (city_id=4)
INSERT IGNORE INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Dieng Plateau Homestay', 4, 280000, 3.8, 'low', -7.2050, 109.9100, 'https://example.com/diengplateau.jpg', 'Cozy homestay 1 minute walk to Telaga Warna'),
('Bukit Scooter Hotel Dieng', 4, 380000, 4.0, 'medium', -7.2095, 109.9085, 'https://example.com/bukitscooter.jpg', 'Mountain hotel with sunrise view in Dieng');

-- Near Parangtritis (Yogyakarta, city_id=12)
INSERT IGNORE INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Queen of the South Resort', 12, 880000, 4.4, 'high', -8.0214, 110.3325, 'https://example.com/queensouth.jpg', 'Beachfront luxury resort at Parangtritis'),
('Hotel Parangtritis Sea View', 12, 420000, 3.9, 'medium', -8.0241, 110.3344, 'https://example.com/parangtritis-sv.jpg', 'Mid-range hotel facing Parangtritis beach');

-- Near Goa Pindul (Yogyakarta, city_id=12 - Gunungkidul side)
INSERT IGNORE INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Pindul Cave Lodge', 12, 320000, 3.7, 'low', -7.9215, 110.6362, 'https://example.com/pindullodge.jpg', 'Lodge near Goa Pindul cave tubing');

-- Near Curug Sewu (Kendal, city_id=11)
INSERT IGNORE INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Curug Sewu Hotel & Cottages', 11, 380000, 3.8, 'medium', -7.0388, 110.1198, 'https://example.com/curugsewuhotel.jpg', 'Cottages near Curug Sewu waterfall');

-- Near Pantai Widuri (Pemalang, city_id=10) — already have Pantai Widuri Resort
-- Near D'LAS (Karangreja area, city_id=10)
INSERT IGNORE INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Lembah Asri Karangreja', 10, 450000, 4.0, 'medium', -7.2305, 109.4351, 'https://example.com/lembahasri-htl.jpg', 'Mid-range hotel near D''LAS Lembah Asri Serang');

SELECT 'Hotels near major attractions added' AS status;
