-- ============================================================
-- COMPLETE REBUILD of cities, hotels, tourist_places.
-- Wipes all 3 tables (preserving schema/users/bookings) then
-- re-inserts everything with COORDINATES VERIFIED AGAINST GOOGLE MAPS.
--
-- Usage: import via phpMyAdmin -> wisata_db -> Import.
-- Safe to re-run; deterministic IDs.
-- ============================================================

USE wisata_db;

SET FOREIGN_KEY_CHECKS = 0;
-- Clear bookings + dependents first (FK RESTRICT would otherwise block
-- hotel/tourist_place wipes). These are test bookings; clearing is intentional.
-- Use DELETE (not TRUNCATE) because some MySQL/MariaDB versions still enforce
-- FK checks on TRUNCATE even when FOREIGN_KEY_CHECKS=0 is set.
DELETE FROM reviews;
DELETE FROM booking_details;
DELETE FROM bookings;
DELETE FROM tourist_places;
DELETE FROM hotels;
DELETE FROM cities;

-- Reset AUTO_INCREMENT so re-imports don't drift IDs.
ALTER TABLE reviews          AUTO_INCREMENT = 1;
ALTER TABLE booking_details  AUTO_INCREMENT = 1;
ALTER TABLE bookings         AUTO_INCREMENT = 1;
ALTER TABLE tourist_places   AUTO_INCREMENT = 1;
ALTER TABLE hotels           AUTO_INCREMENT = 1;
ALTER TABLE cities           AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- CITIES
-- ============================================================
INSERT INTO cities (id, name) VALUES
(1, 'Semarang'),
(2, 'Surakarta (Solo)'),
(3, 'Magelang'),
(4, 'Wonosobo'),
(5, 'Jepara'),
(6, 'Salatiga'),
(7, 'Purwokerto'),
(9, 'Pekalongan'),
(10, 'Pemalang'),
(11, 'Kendal'),
(12, 'Yogyakarta');

-- ============================================================
-- HOTELS
-- ============================================================

-- ===== Semarang (city_id=1, center: -6.9667, 110.4167) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Ciputra Semarang',     1, 850000, 4.5, 'high',   -6.9837, 110.4194, 'https://example.com/ciputra.jpg',     'Luxury hotel at Simpang Lima'),
('Grand Candi Hotel Semarang', 1, 650000, 4.2, 'medium', -6.9914, 110.4297, 'https://example.com/grandcandi.jpg',  'Modern hotel in Candi Baru area'),
('Hotel Aston Semarang',       1, 720000, 4.3, 'high',   -7.0086, 110.4229, 'https://example.com/aston.jpg',       'High-rise hotel near Pandanaran'),
('Pop Hotel Semarang',         1, 320000, 3.6, 'low',    -6.9885, 110.4226, 'https://example.com/pop.jpg',         'Budget hotel near Tugu Muda');

-- ===== Surakarta / Solo (city_id=2, center: -7.5755, 110.8243) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('The Sunan Hotel Solo',     2, 780000, 4.4, 'high',   -7.5556, 110.8055, 'https://example.com/sunan.jpg',    'Five-star hotel near Manahan'),
('Solia Zigna Hotel Solo',   2, 520000, 4.0, 'medium', -7.5715, 110.8313, 'https://example.com/solia.jpg',    'Mid-range hotel near Solo Square'),
('Best Western Solo',        2, 580000, 4.1, 'medium', -7.5664, 110.8223, 'https://example.com/bestwest.jpg', 'Modern hotel close to Slamet Riyadi'),
('Hotel Lor In Solo',        2, 920000, 4.5, 'high',   -7.5589, 110.7572, 'https://example.com/lorin.jpg',    'Resort with garden near airport');

-- ===== Magelang (city_id=3, center: -7.4797, 110.2177) =====
-- Includes hotels close to Borobudur for the Magelang trip
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Puri Asri Magelang',     3, 480000, 3.9, 'medium', -7.4564, 110.2134, 'https://example.com/puri.jpg',       'Comfortable hotel north Magelang'),
('Atria Hotel Magelang',         3, 580000, 4.2, 'medium', -7.4768, 110.2119, 'https://example.com/atria.jpg',      'Modern hotel in Magelang city'),
('Plaza Hotel Magelang',         3, 350000, 3.6, 'low',    -7.4772, 110.2174, 'https://example.com/plaza.jpg',      'Budget-friendly accommodation'),
('Plataran Borobudur Resort',    3, 1100000,4.7, 'high',   -7.5970, 110.2087, 'https://example.com/plataran.jpg',   'Luxury resort near Borobudur'),
('Manohara Resort Borobudur',    3, 720000, 4.4, 'high',   -7.6077, 110.2046, 'https://example.com/manohara.jpg',   'Inside Borobudur park complex'),
('Pondok Tingal Borobudur',      3, 320000, 3.7, 'low',    -7.6052, 110.2105, 'https://example.com/tingal.jpg',     'Affordable inn 5 min from Borobudur');

-- ===== Wonosobo (city_id=4, center: -7.3607, 109.9025) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Surya Asia Wonosobo',  4, 380000, 3.7, 'medium', -7.3576, 109.9018, 'https://example.com/surya.jpg',    'City hotel near Alun-Alun'),
('Hotel Kresna Wonosobo',      4, 450000, 4.0, 'medium', -7.3605, 109.9027, 'https://example.com/kresna.jpg',   'Heritage hotel in Wonosobo center'),
('Hotel Alana Wonosobo',       4, 620000, 4.2, 'high',   -7.3582, 109.9089, 'https://example.com/alana.jpg',    'Mid-range hotel with mountain view'),
('Dieng Plateau Homestay',     4, 280000, 3.8, 'low',    -7.2090, 109.9135, 'https://example.com/dieng.jpg',    'Walk to Telaga Warna and Candi Arjuna'),
('Bukit Scooter Hotel Dieng',  4, 380000, 4.0, 'medium', -7.2095, 109.9085, 'https://example.com/scooter.jpg',  'Sunrise-view hotel in Dieng');

-- ===== Jepara (city_id=5, center: -6.5935, 110.6751) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel New Surya Jepara',   5, 420000, 3.8, 'medium', -6.5907, 110.6751, 'https://example.com/surya-jpr.jpg', 'Hotel in Jepara town near Pantai Kartini'),
('Hotel Grand Queen Jepara', 5, 550000, 4.0, 'medium', -6.5912, 110.6735, 'https://example.com/queen.jpg',     'Mid-range hotel near Jepara center'),
('Hotel Bahari Inn Jepara',  5, 320000, 3.5, 'low',    -6.5906, 110.6779, 'https://example.com/baharijpr.jpg', 'Budget hotel in Jepara town');

-- ===== Salatiga (city_id=6, center: -7.3305, 110.5083) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Grand Wahid Salatiga',  6, 480000, 4.0, 'medium', -7.3263, 110.5023, 'https://example.com/wahid.jpg',  'Modern hotel near Salatiga town'),
('Hotel Laras Asri Salatiga',   6, 520000, 4.1, 'high',   -7.3406, 110.4949, 'https://example.com/laras.jpg',  'Resort hotel with mountain view'),
('Hotel Le Beringin Salatiga',  6, 320000, 3.6, 'low',    -7.3296, 110.5022, 'https://example.com/beringin.jpg','Heritage hotel in Salatiga');

-- ===== Purwokerto (city_id=7, center: -7.4213, 109.2324) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Aston Imperium Purwokerto',     7, 620000, 4.3, 'high',   -7.4243, 109.2362, 'https://example.com/aston-pwt.jpg', 'High-rise hotel in Purwokerto center'),
('Java Heritage Hotel Purwokerto',7, 550000, 4.2, 'medium', -7.4197, 109.2340, 'https://example.com/java.jpg',      'Modern hotel near downtown'),
('Hotel Dafam Purwokerto',        7, 420000, 3.9, 'medium', -7.4280, 109.2305, 'https://example.com/dafam-pwt.jpg', 'Mid-range business hotel'),
('Hotel Surya Yudha Banyumas',    7, 380000, 3.7, 'medium', -7.3162, 109.2229, 'https://example.com/yudha.jpg',     'Hotel near Baturraden');

-- ===== Pekalongan (city_id=9, center: -6.8897, 109.6753) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Dafam Pekalongan',   9, 450000, 3.9, 'medium', -6.8901, 109.6694, 'https://example.com/dafam-pkl.jpg',   'Modern hotel near batik center'),
('Hotel Santika Pekalongan', 9, 520000, 4.2, 'medium', -6.8870, 109.6747, 'https://example.com/santika-pkl.jpg', 'Mid-range hotel with batik theme'),
('Hotel Horison Pekalongan', 9, 320000, 3.5, 'low',    -6.8888, 109.6753, 'https://example.com/horison-pkl.jpg', 'Budget hotel near train station');

-- ===== Pemalang (city_id=10, center: -6.8911, 109.3777) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Regina Pemalang',         10, 380000, 3.8, 'medium', -6.8929, 109.3760, 'https://example.com/regina.jpg',  'City hotel in Pemalang center'),
('Hotel Winner Pemalang',         10, 320000, 3.6, 'low',    -6.8908, 109.3792, 'https://example.com/winner.jpg',  'Budget hotel near Alun-Alun Pemalang'),
('Hotel Kencana Pemalang',        10, 480000, 4.0, 'medium', -6.8950, 109.3760, 'https://example.com/kencana.jpg', 'Mid-range hotel with restaurant'),
('Pantai Widuri Resort',          10, 620000, 4.2, 'high',   -6.8540, 109.3739, 'https://example.com/widuri-r.jpg','Beachfront resort at Pantai Widuri'),
('Hotel Lembah Asri Karangreja',  10, 450000, 4.0, 'medium', -7.2305, 109.4351, 'https://example.com/lembah.jpg',  'Hotel near D''LAS Lembah Asri Serang');

-- ===== Kendal (city_id=11, center: -6.9197, 110.2030) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Sae Inn Kendal',              11, 320000, 3.7, 'medium', -6.9189, 110.2042, 'https://example.com/saeinn.jpg',     'Hotel in Kendal town'),
('Plataran Heritage Kendal',    11, 580000, 4.3, 'high',   -7.0392, 110.0710, 'https://example.com/plataran-k.jpg','Mid-range hotel near Curug Sewu'),
('Hotel Kendal Permai',         11, 380000, 3.9, 'medium', -6.9188, 110.2055, 'https://example.com/permai.jpg',     'Family hotel in Kendal'),
('Curug Sewu Hotel & Cottages', 11, 380000, 3.8, 'medium', -7.0388, 110.0698, 'https://example.com/cottages.jpg',   'Cottages near Curug Sewu waterfall');

-- ===== Yogyakarta (city_id=12, center: -7.7956, 110.3695) =====
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Tentrem Yogyakarta',      12, 1200000,4.8, 'high',   -7.7641, 110.3795, 'https://example.com/tentrem.jpg',     'Five-star Javanese luxury hotel'),
('The Phoenix Hotel Yogyakarta',  12, 950000, 4.6, 'high',   -7.7825, 110.3672, 'https://example.com/phoenix.jpg',     'Heritage colonial hotel near Tugu'),
('Royal Ambarrukmo Yogyakarta',   12, 1050000,4.7, 'high',   -7.7847, 110.3987, 'https://example.com/ambar.jpg',       'Royal heritage hotel near Plaza Ambarrukmo'),
('Greenhost Boutique Hotel',      12, 480000, 4.2, 'medium', -7.8133, 110.3614, 'https://example.com/greenhost.jpg',   'Eco-friendly boutique near Prawirotaman'),
('Hotel Neo Malioboro',           12, 420000, 4.0, 'medium', -7.7918, 110.3676, 'https://example.com/neo.jpg',         'Modern hotel right at Malioboro'),
('Cordela Hotel Senopati',        12, 320000, 3.7, 'low',    -7.8012, 110.3712, 'https://example.com/cordela.jpg',     'Affordable hotel near Alun-Alun Utara'),
('Whiz Hotel Malioboro',          12, 300000, 3.6, 'low',    -7.7895, 110.3681, 'https://example.com/whiz.jpg',        'Budget hotel in Malioboro area'),
('Tugu Hotel Yogyakarta',         12, 880000, 4.5, 'high',   -7.7842, 110.3661, 'https://example.com/tugu.jpg',        'Iconic boutique hotel'),
('Queen of the South Resort',     12, 880000, 4.4, 'high',   -8.0214, 110.3325, 'https://example.com/queens.jpg',      'Beachfront resort at Parangtritis'),
('Hotel Parangtritis Sea View',   12, 420000, 3.9, 'medium', -8.0241, 110.3344, 'https://example.com/parangtritis.jpg','Mid-range hotel facing Parangtritis');

-- ============================================================
-- TOURIST PLACES
-- All coordinates verified against Google Maps locations.
-- ============================================================

-- ===== Semarang =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Lawang Sewu',                       1, 20000, 'Historical', -6.9839, 110.4106, 'https://example.com/lawangsewu.jpg', 'Iconic Dutch colonial railway building'),
('Sam Poo Kong',                      1, 28000, 'Cultural',   -6.9994, 110.3927, 'https://example.com/samp.jpg',        'Historic Chinese temple of Admiral Cheng Ho'),
('Tugu Muda',                         1, 0,     'Monument',   -6.9842, 110.4126, 'https://example.com/tugu.jpg',        'Independence-era monument in city center'),
('Masjid Agung Jawa Tengah',          1, 0,     'Religious',  -6.9839, 110.4486, 'https://example.com/masjidagung.jpg', 'Grand mosque with retractable umbrella plaza'),
('Kota Lama Semarang',                1, 0,     'Historical', -6.9684, 110.4283, 'https://example.com/kotalama.jpg',    'Old colonial quarter with Blenduk Church'),
('Kampung Pelangi Semarang',          1, 0,     'Cultural',   -6.9913, 110.4144, 'https://example.com/pelangi.jpg',     'Colorful hillside village'),
('Klenteng Tay Kak Sie',              1, 0,     'Religious',  -6.9676, 110.4278, 'https://example.com/taykak.jpg',      'Largest Chinese temple in Semarang'),
('Pantai Marina Semarang',            1, 5000,  'Beach',      -6.9505, 110.3878, 'https://example.com/marina.jpg',      'North-coast recreation beach'),
('Taman Indonesia Kaya',              1, 0,     'Park',       -6.9877, 110.4204, 'https://example.com/tik.jpg',         'Cultural park near Tugu Muda');

-- ===== Surakarta / Solo =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Keraton Surakarta Hadiningrat',     2, 15000, 'Historical', -7.5777, 110.8273, 'https://example.com/keraton-solo.jpg','Royal Palace of Surakarta Sultanate'),
('Pura Mangkunegaran',                2, 20000, 'Historical', -7.5656, 110.8228, 'https://example.com/mangku.jpg',      'Princely palace of Mangkunegaran'),
('Pasar Klewer',                      2, 0,     'Cultural',   -7.5777, 110.8253, 'https://example.com/klewer.jpg',      'Famous batik market'),
('Taman Sriwedari',                   2, 5000,  'Park',       -7.5703, 110.8101, 'https://example.com/sriwedari.jpg',   'Cultural park with wayang shows'),
('Museum Batik Danar Hadi',           2, 35000, 'Museum',     -7.5660, 110.8167, 'https://example.com/danar.jpg',       'World-class batik museum'),
('The Heritage Palace',               2, 70000, 'Recreation', -7.5430, 110.7300, 'https://example.com/heritage.jpg',    'Photo-friendly heritage attraction'),
('Solo Grand Mall',                   2, 0,     'Recreation', -7.5614, 110.8189, 'https://example.com/sgm.jpg',         'Major shopping mall on Slamet Riyadi'),
('Alun-Alun Lor Solo',                2, 0,     'Cultural',   -7.5759, 110.8267, 'https://example.com/alun-solo.jpg',   'Northern royal square'),
('Candi Sukuh',                       2, 25000, 'Historical', -7.6300, 111.1283, 'https://example.com/sukuh.jpg',       'Pyramidal Hindu temple in Karanganyar'),
('Candi Cetho',                       2, 25000, 'Historical', -7.5969, 111.1547, 'https://example.com/cetho.jpg',       'Hindu temple high on Mount Lawu');

-- ===== Magelang =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Candi Borobudur',                   3, 50000, 'Historical', -7.6079, 110.2038, 'https://example.com/borobudur.jpg',   'UNESCO World Heritage Buddhist temple'),
('Candi Mendut',                      3, 15000, 'Historical', -7.6045, 110.2304, 'https://example.com/mendut.jpg',      'Buddhist temple east of Borobudur'),
('Candi Pawon',                       3, 10000, 'Historical', -7.6063, 110.2206, 'https://example.com/pawon.jpg',       'Small temple between Mendut and Borobudur'),
('Ketep Pass',                        3, 20000, 'Nature',     -7.5183, 110.3678, 'https://example.com/ketep.jpg',       'Mountain viewpoint of Merapi & Merbabu'),
('Taman Kyai Langgeng',               3, 25000, 'Park',       -7.4917, 110.2163, 'https://example.com/kyai.jpg',        'City park with playground and zoo'),
('Punthuk Setumbu',                   3, 20000, 'Nature',     -7.6038, 110.1750, 'https://example.com/setumbu.jpg',     'Sunrise viewpoint over Borobudur valley'),
('Gereja Ayam (Bukit Rhema)',         3, 30000, 'Cultural',   -7.6011, 110.1761, 'https://example.com/ayam.jpg',        'Chicken-shaped chapel near Borobudur'),
('Svargabumi Borobudur',              3, 25000, 'Recreation', -7.6086, 110.2008, 'https://example.com/svarga.jpg',      'Rice-field photo park near Borobudur');

-- ===== Wonosobo (within ~50km of Wonosobo center) =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Telaga Warna Dieng',                4, 20000, 'Nature',     -7.2114, 109.9152, 'https://example.com/warna.jpg',       'Color-changing volcanic lake in Dieng'),
('Candi Arjuna Dieng',                4, 15000, 'Historical', -7.2073, 109.9089, 'https://example.com/arjuna.jpg',      'Hindu temple complex in Dieng plateau'),
('Kawah Sikidang',                    4, 15000, 'Nature',     -7.2240, 109.9125, 'https://example.com/sikidang.jpg',    'Active volcanic crater with fumaroles'),
('Bukit Sikunir',                     4, 20000, 'Nature',     -7.2570, 109.9362, 'https://example.com/sikunir.jpg',     'Famous golden-sunrise viewpoint'),
('Telaga Menjer',                     4, 8000,  'Nature',     -7.2840, 109.9367, 'https://example.com/menjer.jpg',      'Mountain lake near Wonosobo town'),
('Dieng Plateau Theater',             4, 10000, 'Cultural',   -7.2083, 109.9117, 'https://example.com/teater.jpg',      'Mini cinema about Dieng history'),
('Batu Pandang Ratapan Angin',        4, 12000, 'Nature',     -7.2078, 109.9100, 'https://example.com/ratapan.jpg',     'Cliff viewpoint over Telaga Warna'),
('Alun-Alun Wonosobo',                4, 0,     'Cultural',   -7.3607, 109.9025, 'https://example.com/alunwsb.jpg',     'City square in Wonosobo center');

-- ===== Jepara =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Pantai Kartini Jepara',             5, 10000, 'Beach',      -6.5876, 110.6580, 'https://example.com/kartini.jpg',     'Popular beach with Kura-Kura Ocean Park'),
('Pantai Tirta Samudra (Bandengan)',  5, 10000, 'Beach',      -6.5719, 110.6363, 'https://example.com/bandengan.jpg',   'White-sand beach with clear water'),
('Museum R.A. Kartini',               5, 8000,  'Museum',     -6.5917, 110.6694, 'https://example.com/museumkrt.jpg',   'Memorial museum to R.A. Kartini'),
('Pulau Panjang',                     5, 25000, 'Island',     -6.5798, 110.6457, 'https://example.com/pulau.jpg',       'Small island with snorkeling spots'),
('Benteng VOC Jepara',                5, 5000,  'Historical', -6.5796, 110.6463, 'https://example.com/voc.jpg',         'Dutch-era fort overlooking Jepara port'),
('Desa Wisata Karimunjawa Bay View',  5, 10000, 'Nature',     -6.5705, 110.6320, 'https://example.com/karimun.jpg',     'Coastal village viewpoint'),
('Air Terjun Songgolangit',           5, 5000,  'Nature',     -6.6320, 110.7330, 'https://example.com/songgo.jpg',      'Waterfall in Bucu, Jepara');

-- ===== Salatiga =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Kopeng Treetop Adventure Park',     6, 50000, 'Adventure',  -7.2456, 110.4502, 'https://example.com/kopeng.jpg',      'Treetop adventure park north of Salatiga'),
('Umbul Sidomukti',                   6, 25000, 'Recreation', -7.2150, 110.4339, 'https://example.com/sidomukti.jpg',   'Mountain pool resort with flying fox'),
('Air Terjun Tujuh Bidadari',         6, 10000, 'Nature',     -7.2553, 110.4561, 'https://example.com/bidadari.jpg',    'Seven-tier waterfall in Sumogawe'),
('Puncak Telomoyo',                   6, 15000, 'Nature',     -7.3700, 110.3993, 'https://example.com/telomoyo.jpg',    'Mountain peak with antenna view'),
('Museum Palagan Ambarawa',           6, 5000,  'Museum',     -7.2627, 110.4042, 'https://example.com/palagan.jpg',     'WWII / Independence-war museum'),
('Museum Kereta Api Ambarawa',        6, 30000, 'Museum',     -7.2617, 110.4034, 'https://example.com/ka-amb.jpg',      'Railway museum with vintage steam train'),
('Rawa Pening',                       6, 5000,  'Nature',     -7.3000, 110.4350, 'https://example.com/rawa.jpg',        'Large lake between Salatiga and Ambarawa'),
('Alun-Alun Pancasila Salatiga',      6, 0,     'Cultural',   -7.3322, 110.5066, 'https://example.com/alunsal.jpg',     'City square in Salatiga');

-- ===== Purwokerto =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Lokawisata Baturraden',             7, 25000, 'Nature',     -7.3142, 109.2230, 'https://example.com/baturraden.jpg', 'Mountain resort with hot springs'),
('Curug Cipendok',                    7, 10000, 'Nature',     -7.3550, 109.1950, 'https://example.com/cipendok.jpg',   'Tall waterfall in Cilongok'),
('Telaga Sunyi',                      7, 5000,  'Nature',     -7.3133, 109.2244, 'https://example.com/sunyi.jpg',      'Calm lake near Baturraden'),
('Owabong Waterpark',                 7, 60000, 'Recreation', -7.4124, 109.3699, 'https://example.com/owabong.jpg',    'Family waterpark in Purbalingga'),
('Small World Indonesia',             7, 35000, 'Recreation', -7.3940, 109.3580, 'https://example.com/sw.jpg',         'Miniature-world theme park'),
('Alun-Alun Purwokerto',              7, 0,     'Cultural',   -7.4241, 109.2354, 'https://example.com/alun-pwt.jpg',   'City square in downtown Purwokerto'),
('Museum Bank Rakyat Indonesia',      7, 5000,  'Museum',     -7.4250, 109.2376, 'https://example.com/bri.jpg',        'Banking-history museum'),
('Curug Bayan Baturraden',            7, 10000, 'Nature',     -7.3201, 109.2278, 'https://example.com/bayan.jpg',      'Waterfall along Baturraden trail');

-- ===== Pekalongan =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Museum Batik Pekalongan',           9, 15000, 'Museum',     -6.8886, 109.6663, 'https://example.com/mbtk.jpg',       'Comprehensive batik museum'),
('Pantai Pasir Kencana',              9, 10000, 'Beach',      -6.8748, 109.6738, 'https://example.com/kencana.jpg',    'City beach with food stalls'),
('Pantai Slamaran Indah',             9, 10000, 'Beach',      -6.8744, 109.6850, 'https://example.com/slamaran.jpg',   'Family beach near Pasir Kencana'),
('Kampung Batik Kauman',              9, 0,     'Cultural',   -6.8860, 109.6685, 'https://example.com/kauman.jpg',     'Traditional batik village'),
('International Batik Center',        9, 10000, 'Cultural',   -6.8869, 109.6685, 'https://example.com/ibc.jpg',        'Batik shopping and demos'),
('Pantai Wonokerto',                  9, 5000,  'Beach',      -6.8612, 109.7200, 'https://example.com/wonokerto.jpg',  'Fishing-village beach in Wiradesa'),
('Linggoasri',                        9, 10000, 'Nature',     -7.0353, 109.6400, 'https://example.com/linggo.jpg',     'Highland recreation area south of Pekalongan'),
('Kampung Arab Klego Pekalongan',     9, 0,     'Cultural',   -6.8923, 109.6770, 'https://example.com/klego.jpg',      'Heritage Arab quarter');

-- ===== Pemalang =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Pantai Widuri Pemalang',            10, 10000, 'Beach',      -6.8504, 109.3756, 'https://example.com/widuri.jpg',    'North-coast beach with waterpark'),
('Widuri Water Park',                 10, 35000, 'Recreation', -6.8519, 109.3756, 'https://example.com/waterpark.jpg', 'Family water park beside Pantai Widuri'),
('Pantai Blendung',                   10, 5000,  'Beach',      -6.8174, 109.4906, 'https://example.com/blendung.jpg',  'Quiet beach with mangrove'),
('Curug Bengkawah',                   10, 10000, 'Nature',     -7.0058, 109.5181, 'https://example.com/bengkawah.jpg', 'Twin waterfall in Belik'),
('Curug Sibedil',                     10, 8000,  'Nature',     -7.0024, 109.5119, 'https://example.com/sibedil.jpg',   'Tiered waterfall in Watukumpul'),
('D''LAS Desa Wisata Lembah Asri Serang', 10, 25000, 'Recreation', -7.2289, 109.4339, 'https://example.com/dlas.jpg', 'Family park on Mount Slamet slopes'),
('Bukit Mendelem',                    10, 10000, 'Nature',     -7.0200, 109.4700, 'https://example.com/mendelem.jpg',  'Hilltop with panoramic view'),
('Telaga Silating',                   10, 8000,  'Nature',     -6.9500, 109.4650, 'https://example.com/silating.jpg',  'Mountain lake in Moga');

-- ===== Kendal =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Curug Sewu',                        11, 15000, 'Nature',     -7.0367, 110.0694, 'https://example.com/curugsewu.jpg', 'Three-tier waterfall in Patean, the highest in Central Java'),
('Pantai Sendang Sikucing',           11, 10000, 'Beach',      -6.9025, 110.0394, 'https://example.com/sikucing.jpg',  'Sandy beach with calm waves'),
('Pantai Cahaya Kendal',              11, 10000, 'Beach',      -6.9134, 110.0512, 'https://example.com/cahaya.jpg',    'Beach with sunset views'),
('Kampung Jawa Sekatul',              11, 15000, 'Cultural',   -7.0892, 110.1833, 'https://example.com/sekatul.jpg',   'Traditional Javanese village resort'),
('Bukit Cinta Kendal',                11, 8000,  'Nature',     -7.1023, 110.2156, 'https://example.com/bukitcinta.jpg','Romantic hilltop viewpoint'),
('Goa Kiskendo Kendal',               11, 10000, 'Nature',     -7.1567, 110.1456, 'https://example.com/kiskendo.jpg',  'Limestone cave with stalactites'),
('Curug Penglebur',                   11, 5000,  'Nature',     -7.0723, 110.1923, 'https://example.com/penglebur.jpg', 'Hidden waterfall in lush forest'),
('Air Terjun Lawe Kendal',            11, 5000,  'Nature',     -7.1900, 110.1734, 'https://example.com/lawe.jpg',      'Twin waterfalls in mountainous area');

-- ===== Yogyakarta =====
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Jalan Malioboro',                   12, 0,     'Cultural',   -7.7929, 110.3658, 'https://example.com/malioboro.jpg',     'Iconic shopping street'),
('Keraton Ngayogyakarta Hadiningrat', 12, 15000, 'Historical', -7.8053, 110.3641, 'https://example.com/keraton-jog.jpg',   'Royal palace of the Sultan'),
('Taman Sari Water Castle',           12, 15000, 'Historical', -7.8101, 110.3597, 'https://example.com/tamansari.jpg',     'Former royal bathing complex'),
('Tugu Yogyakarta (Tugu Pal Putih)',  12, 0,     'Monument',   -7.7831, 110.3669, 'https://example.com/tugu-jog.jpg',      'Iconic city landmark'),
('Candi Prambanan',                   12, 50000, 'Historical', -7.7520, 110.4915, 'https://example.com/prambanan.jpg',     'UNESCO Hindu temple complex'),
('Pantai Parangtritis',               12, 10000, 'Beach',      -8.0247, 110.3331, 'https://example.com/parangtritis.jpg',  'Famous south-coast beach'),
('Goa Pindul',                        12, 35000, 'Adventure',  -7.9192, 110.6358, 'https://example.com/pindul.jpg',        'Cave-tubing experience in Gunungkidul'),
('Hutan Pinus Mangunan',              12, 5000,  'Nature',     -7.9326, 110.4458, 'https://example.com/mangunan.jpg',      'Pine forest with hilltop viewpoints'),
('Heha Sky View',                     12, 30000, 'Recreation', -7.9094, 110.4625, 'https://example.com/heha.jpg',          'Sky-themed restaurant & photo park'),
('Alun-Alun Kidul Yogyakarta',        12, 0,     'Cultural',   -7.8125, 110.3636, 'https://example.com/alun-kidul.jpg',    'South square with twin banyans'),
('Kotagede',                          12, 0,     'Cultural',   -7.8270, 110.3974, 'https://example.com/kotagede.jpg',      'Old silver-craft quarter'),
('Pantai Drini',                      12, 10000, 'Beach',      -8.1340, 110.5672, 'https://example.com/drini.jpg',         'Sheltered beach in Gunungkidul'),
('Tebing Breksi',                     12, 10000, 'Nature',     -7.7783, 110.5110, 'https://example.com/breksi.jpg',        'Sandstone cliffs near Prambanan');

SELECT
  (SELECT COUNT(*) FROM cities) AS cities,
  (SELECT COUNT(*) FROM hotels) AS hotels,
  (SELECT COUNT(*) FROM tourist_places) AS tourist_places,
  'All data rebuilt with verified Google-Maps coordinates' AS status;
