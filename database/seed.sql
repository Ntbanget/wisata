-- Central Java Tourism Travel Planner Seed Data
USE wisata_db;

-- Insert cities
INSERT INTO cities (id, name) VALUES
(1, 'Semarang'),
(2, 'Surakarta (Solo)'),
(3, 'Magelang'),
(4, 'Wonosobo'),
(5, 'Jepara'),
(6, 'Salatiga'),
(7, 'Purwokerto'),
(8, 'Tegal'),
(9, 'Pekalongan');

-- Insert hotels for each city
-- Semarang Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Ciputra Semarang', 1, 850000, 4.5, 'high', -6.9887, 110.4292, 'https://example.com/ciputra.jpg', 'Luxury hotel in heart of Semarang with excellent facilities'),
('Grand Candi Hotel Semarang', 1, 650000, 4.2, 'medium', -6.9922, 110.4206, 'https://example.com/grandcandi.jpg', 'Modern hotel near Simpang Lima shopping district'),
('Hotel Dafam Semarang', 1, 450000, 3.8, 'medium', -6.9765, 110.4321, 'https://example.com/dafam.jpg', 'Comfortable hotel with business facilities'),
('Amaris Hotel Pemuda Semarang', 1, 280000, 3.5, 'low', -6.9885, 110.4278, 'https://example.com/amaris.jpg', 'Budget-friendly hotel near city center'),
('Ibis Budget Semarang Tendean', 1, 250000, 3.6, 'low', -6.9754, 110.4389, 'https://example.com/ibis.jpg', 'Affordable accommodation with basic amenities'),
('Hotel Santika Semarang', 1, 550000, 4.0, 'medium', -6.9876, 110.4234, 'https://example.com/santika.jpg', 'Mid-range hotel with Indonesian hospitality');

-- Surakarta Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Alila Hotel Surakarta', 2, 920000, 4.7, 'high', -7.5595, 110.8294, 'https://example.com/alila.jpg', 'Boutique luxury hotel with Javanese architecture'),
('The Royal Surakarta Heritage', 2, 780000, 4.4, 'high', -7.5621, 110.8312, 'https://example.com/royal.jpg', 'Heritage hotel reflecting Solo culture'),
('Hotel Solo Paragon', 2, 520000, 4.1, 'medium', -7.5654, 110.8234, 'https://example.com/paragon.jpg', 'Modern hotel with shopping mall'),
('Favehotel Solo Baru', 2, 320000, 3.7, 'low', -7.5687, 110.8456, 'https://example.com/fave.jpg', 'Budget hotel with modern design'),
('RedPlanet Surakarta', 2, 290000, 3.6, 'low', -7.5543, 110.8278, 'https://example.com/redplanet.jpg', 'Affordable accommodation near city center');

-- Magelang Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Puri Asri Magelang', 3, 480000, 3.9, 'medium', -7.4672, 110.2198, 'https://example.com/puri.jpg', 'Comfortable hotel near Borobudur'),
('Atria Hotel Magelang', 3, 580000, 4.2, 'medium', -7.4654, 110.2234, 'https://example.com/atria.jpg', 'Modern hotel with business facilities'),
('Plaza Hotel Magelang', 3, 350000, 3.6, 'low', -7.4698, 110.2176, 'https://example.com/plaza.jpg', 'Budget-friendly accommodation'),
('Hotel Artos Magelang', 3, 420000, 3.8, 'medium', -7.4632, 110.2212, 'https://example.com/artos.jpg', 'Mid-range hotel with restaurant');

-- Wonosobo Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Kresna Wonosobo', 4, 380000, 3.7, 'medium', -7.3634, 109.9087, 'https://example.com/kresna.jpg', 'Comfortable hotel near Dieng Plateau'),
('The Alana Hotel Wonosobo', 4, 620000, 4.3, 'medium', -7.3656, 109.9054, 'https://example.com/alana.jpg', 'Modern hotel with mountain views'),
('Hotel Sriti Wonosobo', 4, 280000, 3.4, 'low', -7.3612, 109.9123, 'https://example.com/sriti.jpg', 'Budget accommodation near city center');

-- Jepara Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel New Surya Jepara', 5, 420000, 3.8, 'medium', -6.5892, 110.6587, 'https://example.com/surya.jpg', 'Beach hotel with ocean views'),
('Hotel Grand Queen Jepara', 5, 550000, 4.0, 'medium', -6.5912, 110.6554, 'https://example.com/queen.jpg', 'Mid-range hotel near beach'),
('Hotel Bahari Inn Jepara', 5, 320000, 3.5, 'low', -6.5876, 110.6621, 'https://example.com/bahari.jpg', 'Budget-friendly beach accommodation');

-- Salatiga Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Graha Santika Salatiga', 6, 450000, 3.9, 'medium', -7.1954, 110.5087, 'https://example.com/graha.jpg', 'Mountain view hotel with cool climate'),
('Hotel Laras Asri Salatiga', 6, 380000, 3.7, 'medium', -7.1976, 110.5054, 'https://example.com/laras.jpg', 'Comfortable hotel near Merbabu'),
('Hotel Amaris Salatiga', 6, 260000, 3.4, 'low', -7.1932, 110.5121, 'https://example.com/amaris-salatiga.jpg', 'Budget hotel with modern amenities');

-- Purwokerto Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel New Purwokerto', 7, 480000, 4.0, 'medium', -7.4254, 109.2345, 'https://example.com/newpurwokerto.jpg', 'Central hotel with business facilities'),
('Hotel Santos Purwokerto', 7, 350000, 3.6, 'low', -7.4232, 109.2378, 'https://example.com/santos.jpg', 'Budget-friendly accommodation'),
('Hotel Dafam Purwokerto', 7, 520000, 4.1, 'medium', -7.4276, 109.2312, 'https://example.com/dafam-purwokerto.jpg', 'Modern hotel with restaurant');

-- Tegal Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Bahari Tegal', 8, 380000, 3.7, 'medium', -6.8776, 109.1345, 'https://example.com/bahari-tegal.jpg', 'Coastal hotel near Pantai Alam'),
('Hotel Karlita Tegal', 8, 420000, 3.8, 'medium', -6.8754, 109.1378, 'https://example.com/karlita.jpg', 'Comfortable hotel in city center'),
('Hotel Primadona Tegal', 8, 280000, 3.3, 'low', -6.8798, 109.1312, 'https://example.com/primadona.jpg', 'Budget accommodation near bus station');

-- Pekalongan Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Dafam Pekalongan', 9, 450000, 3.9, 'medium', -6.8887, 109.6723, 'https://example.com/dafam-pekalongan.jpg', 'Modern hotel near batik center'),
('Hotel Santika Pekalongan', 9, 520000, 4.2, 'medium', -6.8865, 109.6756, 'https://example.com/santika-pekalongan.jpg', 'Mid-range hotel with batik theme'),
('Hotel Horizon Pekalongan', 9, 320000, 3.5, 'low', -6.8909, 109.6690, 'https://example.com/horizon.jpg', 'Budget hotel near train station');

-- Insert tourist places for each city
-- Semarang Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Lawang Sewu', 1, 10000, 'Historical', -6.9885, 110.4278, 'https://example.com/lawangsewu.jpg', 'Historic colonial building with thousand doors'),
('Sam Poo Kong Temple', 1, 15000, 'Religious', -6.9765, 110.4321, 'https://example.com/sampookong.jpg', 'Chinese temple with historical significance'),
('Masjid Agung Jawa Tengah', 1, 0, 'Religious', -6.9922, 110.4206, 'https://example.com/masjidagung.jpg', 'Grand central mosque with unique architecture'),
('Tugu Muda Semarang', 1, 0, 'Monument', -6.9876, 110.4234, 'https://example.com/tugumuda.jpg', 'Youth monument commemorating battle of Semarang'),
('Kampung Pelangi', 1, 5000, 'Cultural', -6.9754, 110.4389, 'https://example.com/kampungpelangi.jpg', 'Colorful village with artistic murals'),
('Pantai Marina', 1, 10000, 'Beach', -6.9654, 110.4456, 'https://example.com/marina.jpg', 'Beach recreation area with seafood restaurants'),
('Gedung Sate', 1, 0, 'Historical', -6.9787, 110.4290, 'https://example.com/gedungsate.jpg', 'Historic government building'),
('Museum Ronggowarsito', 1, 5000, 'Museum', -6.9821, 110.4256, 'https://example.com/ronggowarsito.jpg', 'Central Java cultural museum');

-- Surakarta Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Keraton Surakarta', 2, 15000, 'Historical', -7.5621, 110.8312, 'https://example.com/keraton.jpg', 'Royal palace of Surakarta Sultanate'),
('Pasar Klewer', 2, 0, 'Market', -7.5654, 110.8234, 'https://example.com/klewer.jpg', 'Famous batik market'),
('Taman Sriwedari', 2, 8000, 'Park', -7.5595, 110.8294, 'https://example.com/sriwedari.jpg', 'Cultural park with traditional performances'),
('Museum Batik Danar Hadi', 2, 25000, 'Museum', -7.5687, 110.8456, 'https://example.com/danarhadi.jpg', 'Premier batik museum and gallery'),
('Candi Sukuh', 2, 15000, 'Historical', -7.6234, 110.9123, 'https://example.com/sukuh.jpg', 'Ancient Hindu temple with fertility carvings'),
('Candi Cetho', 2, 15000, 'Historical', -7.6456, 110.9345, 'https://example.com/cetho.jpg', 'Ancient temple on Lawu mountain slope'),
('Alun-Alun Kidul', 2, 0, 'Cultural', -7.5543, 110.8278, 'https://example.com/alunkidul.jpg', 'Southern square with traditional games'),
('Galeri Batik Laweyan', 2, 0, 'Cultural', -7.5712, 110.8567, 'https://example.com/laweyan.jpg', 'Traditional batik village and galleries');

-- Magelang Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Candi Borobudur', 3, 50000, 'Historical', -7.6079, 110.2038, 'https://example.com/borobudur.jpg', 'UNESCO World Heritage Buddhist temple'),
('Candi Mendut', 3, 15000, 'Historical', -7.6045, 110.2245, 'https://example.com/mendut.jpg', 'Ancient Buddhist temple near Borobudur'),
('Candi Pawon', 3, 10000, 'Historical', -7.6023, 110.2089, 'https://example.com/pawon.jpg', 'Small Buddhist temple in Borobudur complex'),
('Ketep Pass', 3, 20000, 'Nature', -7.6345, 110.2234, 'https://example.com/ketep.jpg', 'Mountain viewpoint with Merapi and Merbabu'),
('Museum Karmawibhangga', 3, 5000, 'Museum', -7.6087, 110.2021, 'https://example.com/karmawibhangga.jpg', 'Borobudur relief museum'),
('Elo River Rafting', 3, 150000, 'Adventure', -7.5987, 110.1876, 'https://example.com/elorafting.jpg', 'White water rafting adventure'),
('Taman Kyai Langgeng', 3, 10000, 'Park', -7.4672, 110.2198, 'https://example.com/kyailanggeng.jpg', 'City park with playground and zoo'),
('Candi Selogriyo', 3, 10000, 'Historical', -7.5234, 110.1456, 'https://example.com/selogriyo.jpg', 'Remote temple with rice terrace views');

-- Wonosobo Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Dieng Plateau', 4, 15000, 'Nature', -7.2068, 109.9087, 'https://example.com/dieng.jpg', 'Highland plateau with ancient temples'),
('Telaga Warna', 4, 10000, 'Nature', -7.2123, 109.9123, 'https://example.com/telagawarna.jpg', 'Colorful crater lake'),
('Candi Arjuna', 4, 10000, 'Historical', -7.2098, 109.9056, 'https://example.com/arjuna.jpg', 'Ancient Hindu temple complex'),
('Kawah Sikidang', 4, 8000, 'Nature', -7.2156, 109.9156, 'https://example.com/sikidang.jpg', 'Active volcanic crater'),
('Telaga Menjer', 4, 5000, 'Nature', -7.1987, 109.8987, 'https://example.com/menjer.jpg', 'Beautiful mountain lake'),
('Gua Semar', 4, 5000, 'Nature', -7.2045, 109.9023, 'https://example.com/guasemar.jpg', 'Sacred cave with meditation site'),
('Puncak Gunung Prau', 4, 0, 'Nature', -7.1876, 109.8876, 'https://example.com/prau.jpg', 'Mountain peak with sunrise views'),
('Sikunir Hill', 4, 10000, 'Nature', -7.2212, 109.9187, 'https://example.com/sikunir.jpg', 'Golden sunrise viewpoint');

-- Jepara Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Pantai Kartini', 5, 10000, 'Beach', -6.5892, 110.6587, 'https://example.com/kartini.jpg', 'Popular beach with Kartini statue'),
('Pulau Panjang', 5, 25000, 'Island', -6.5956, 110.6623, 'https://example.com/pulau panjang.jpg', 'Small island with snorkeling spots'),
('Museum R.A. Kartini', 5, 8000, 'Museum', -6.5912, 110.6554, 'https://example.com/museumkartini.jpg', 'Kartini memorial museum'),
('Pantai Bandengan', 5, 10000, 'Beach', -6.5834, 110.6456, 'https://example.com/bandengan.jpg', 'White sand beach with clear water'),
('Benteng VOC', 5, 5000, 'Historical', -6.5876, 110.6621, 'https://example.com/voc.jpg', 'Historic Dutch fort'),
('Pantai Teluk Awur', 5, 8000, 'Beach', -6.5787, 110.6389, 'https://example.com/telukawur.jpg', 'Quiet beach with mangrove forest'),
('Makam Sunan Muria', 5, 0, 'Religious', -6.6123, 110.6789, 'https://example.com/muria.jpg', 'Sacred tomb on Muria mountain'),
('Desa Ukir Jepara', 5, 0, 'Cultural', -6.5987, 110.6687, 'https://example.com/ukir.jpg', 'Traditional wood carving village');

-- Salatiga Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Kopeng Treetop Adventure', 6, 50000, 'Adventure', -7.1954, 110.5087, 'https://example.com/kopeng.jpg', 'Treetop adventure park and flying fox'),
('Umbul Sidomukti', 6, 15000, 'Nature', -7.1876, 110.4987, 'https://example.com/umbul.jpg', 'Natural spring pool with mountain view'),
('Gunung Merbabu', 6, 0, 'Nature', -7.4545, 110.4345, 'https://example.com/merbabu.jpg', 'Active volcano for hiking'),
('Museum Satwa Satwani', 6, 10000, 'Museum', -7.1976, 110.5054, 'https://example.com/satwani.jpg', 'Animal and nature museum'),
('Taman Kota Salatiga', 6, 0, 'Park', -7.1932, 110.5121, 'https://example.com/tamankota.jpg', 'City park with jogging track'),
('Air Terjun Kali Pancur', 6, 8000, 'Nature', -7.1789, 110.4876, 'https://example.com/kalipancur.jpg', 'Beautiful waterfall in forest'),
('Candi Temple', 6, 5000, 'Historical', -7.2012, 110.5156, 'https://example.com/candi.jpg', 'Small ancient temple'),
('Puncak Gunung Telomoyo', 6, 0, 'Nature', -7.2876, 110.4123, 'https://example.com/telomoyo.jpg', 'Mountain peak with panoramic views');

-- Purwokerto Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Baturraden', 7, 25000, 'Nature', -7.4254, 109.2345, 'https://example.com/baturraden.jpg', 'Mountain resort with hot springs'),
('Owabong Waterpark', 7, 60000, 'Recreation', -7.4232, 109.2378, 'https://example.com/owabong.jpg', 'Large waterpark with various slides'),
('Museum Bank Rakyat Indonesia', 7, 5000, 'Museum', -7.4276, 109.2312, 'https://example.com/bri.jpg', 'Banking history museum'),
('Alun-Alun Purwokerto', 7, 0, 'Cultural', -7.4298, 109.2289, 'https://example.com/alun.jpg', 'City square with local food stalls'),
('Curug Cipendok', 7, 10000, 'Nature', -7.3876, 109.1987, 'https://example.com/cipendok.jpg', 'Beautiful waterfall with cave'),
('Small World', 7, 35000, 'Recreation', -7.4123, 109.2456, 'https://example.com/smallworld.jpg', 'Miniature world landmarks park'),
('Pantai Menganti', 7, 10000, 'Beach', -7.6789, 109.1234, 'https://example.com/menganti.jpg', 'Scenic beach with cliffs'),
('Waduk Sempor', 7, 5000, 'Nature', -7.3456, 109.1876, 'https://example.com/sempor.jpg', 'Reservoir with fishing and boating');

-- Tegal Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Pantai Alam Indah', 8, 10000, 'Beach', -6.8776, 109.1345, 'https://example.com/pantai alam.jpg', 'Popular city beach with seafood'),
('Alun-Alun Tegal', 8, 0, 'Cultural', -6.8754, 109.1378, 'https://example.com/aluntegal.jpg', 'Historic city square'),
('Museum Purbakala Tegal', 8, 5000, 'Museum', -6.8798, 109.1312, 'https://example.com/purbakala.jpg', 'Archaeological museum'),
('Waduk Cacaban', 8, 8000, 'Nature', -6.9123, 109.0987, 'https://example.com/cacaban.jpg', 'Large reservoir for recreation'),
('Pantai Suradita', 8, 8000, 'Beach', -6.8654, 109.1456, 'https://example.com/suradita.jpg', 'Quiet beach with fishing boats'),
('Gua Jatijajar', 8, 15000, 'Nature', -7.7434, 109.3456, 'https://example.com/jatijajar.jpg', 'Stalactite cave with legend'),
('Pantai Purwahamba', 8, 10000, 'Beach', -6.8567, 109.1567, 'https://example.com/purwahamba.jpg', 'Beach resort with cottages'),
('Situngging Hill', 8, 5000, 'Nature', -6.8876, 109.1234, 'https://example.com/situngging.jpg', 'Hilltop with city views');

-- Pekalongan Tourist Places
INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, image_url, description) VALUES
('Museum Batik Pekalongan', 9, 15000, 'Museum', -6.8887, 109.6723, 'https://example.com/museumbatik.jpg', 'Comprehensive batik museum'),
('Alun-Alun Pekalongan', 9, 0, 'Cultural', -6.8865, 109.6756, 'https://example.com/alunpekalongan.jpg', 'City center with batik market'),
('Pantai Pekalongan', 9, 8000, 'Beach', -6.8956, 109.6654, 'https://example.com/pantaipkl.jpg', 'City beach for recreation'),
('Kampung Batik Kauman', 9, 0, 'Cultural', -6.8823, 109.6789, 'https://example.com/kauman.jpg', 'Traditional batik village'),
('Pantai Wonokerto', 9, 5000, 'Beach', -6.9123, 109.6456, 'https://example.com/wonokerto.jpg', 'Fishing village beach'),
('Museum UMKM Pekalongan', 9, 5000, 'Museum', -6.8909, 109.6690, 'https://example.com/umkm.jpg', 'Small and medium enterprise museum'),
('Pantai Slamaran', 9, 8000, 'Beach', -6.8787, 109.6823, 'https://example.com/slamaran.jpg', 'Beach with local food stalls'),
('Wisata Bahari Pekalongan', 9, 10000, 'Recreation', -6.8987, 109.6587, 'https://example.com/bahari.jpg', 'Marine tourism complex');

-- Apply coordinate fixes for major landmarks (real-world positions)
UPDATE tourist_places SET lat = -6.9839, lng = 110.4106 WHERE name = 'Lawang Sewu';
UPDATE tourist_places SET lat = -6.9874, lng = 110.3996 WHERE name = 'Sam Poo Kong Temple';
UPDATE tourist_places SET lat = -6.9847, lng = 110.4107 WHERE name = 'Tugu Muda Semarang';
UPDATE tourist_places SET lat = -6.9839, lng = 110.4486 WHERE name = 'Masjid Agung Jawa Tengah';
UPDATE tourist_places SET lat = -6.9904, lng = 110.4082 WHERE name = 'Kampung Pelangi';
UPDATE tourist_places SET lat = -6.9477, lng = 110.3849 WHERE name = 'Pantai Marina';
UPDATE tourist_places SET lat = -7.5779, lng = 110.8246 WHERE name = 'Keraton Surakarta';
UPDATE tourist_places SET lat = -7.5775, lng = 110.8243 WHERE name = 'Pasar Klewer';
UPDATE tourist_places SET lat = -7.5708, lng = 110.8124 WHERE name = 'Taman Sriwedari';
UPDATE tourist_places SET lat = -7.5666, lng = 110.8166 WHERE name = 'Museum Batik Danar Hadi';
UPDATE tourist_places SET lat = -7.6275, lng = 111.1283 WHERE name = 'Candi Sukuh';
UPDATE tourist_places SET lat = -7.5969, lng = 111.1547 WHERE name = 'Candi Cetho';
UPDATE tourist_places SET lat = -7.5824, lng = 110.8246 WHERE name = 'Alun-Alun Kidul';
UPDATE tourist_places SET lat = -7.6044, lng = 110.2298 WHERE name = 'Candi Mendut';
UPDATE tourist_places SET lat = -7.6058, lng = 110.2206 WHERE name = 'Candi Pawon';
UPDATE tourist_places SET lat = -7.5119, lng = 110.3833 WHERE name = 'Ketep Pass';
UPDATE tourist_places SET lat = -7.2003, lng = 109.9097 WHERE name = 'Dieng Plateau';
UPDATE tourist_places SET lat = -7.2122, lng = 109.9134 WHERE name = 'Telaga Warna';
UPDATE tourist_places SET lat = -7.2089, lng = 109.9098 WHERE name = 'Candi Arjuna';
UPDATE tourist_places SET lat = -7.2150, lng = 109.9118 WHERE name = 'Kawah Sikidang';
UPDATE tourist_places SET lat = -6.5860, lng = 110.6440 WHERE name = 'Pantai Kartini';
UPDATE tourist_places SET lat = -6.5723, lng = 110.6294 WHERE name = 'Pantai Bandengan';

-- ============================================================
-- New cities added: Pemalang, Kendal, Yogyakarta
-- ============================================================

INSERT IGNORE INTO cities (id, name) VALUES
(10, 'Pemalang'),
(11, 'Kendal'),
(12, 'Yogyakarta');

-- Pemalang Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Regina Pemalang', 10, 380000, 3.8, 'medium', -6.8910, 109.3782, 'https://example.com/regina.jpg', 'Comfortable hotel in Pemalang city center'),
('Hotel Winner Pemalang', 10, 320000, 3.6, 'low', -6.8895, 109.3768, 'https://example.com/winner.jpg', 'Budget-friendly hotel near Alun-Alun Pemalang'),
('Hotel Kencana Pemalang', 10, 480000, 4.0, 'medium', -6.8924, 109.3815, 'https://example.com/kencana.jpg', 'Mid-range hotel with restaurant and pool'),
('Pantai Widuri Resort', 10, 620000, 4.2, 'high', -6.8537, 109.3791, 'https://example.com/widuri-resort.jpg', 'Beachfront resort at Pantai Widuri');

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

-- Kendal Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Sae Inn Kendal', 11, 320000, 3.7, 'medium', -6.9181, 110.2042, 'https://example.com/saeinn.jpg', 'Comfortable hotel in Kendal city'),
('Hotel Sendang Kalimas', 11, 280000, 3.5, 'low', -6.9156, 110.2089, 'https://example.com/sendang.jpg', 'Budget hotel near Alun-Alun Kendal'),
('Plataran Heritage Kendal', 11, 580000, 4.3, 'medium', -7.0341, 110.1158, 'https://example.com/plataran.jpg', 'Mid-range hotel near Curug Sewu'),
('Hotel Kendal Permai', 11, 380000, 3.9, 'medium', -6.9203, 110.2087, 'https://example.com/kendalpermai.jpg', 'Family-oriented hotel in Kendal');

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

-- Yogyakarta Hotels
INSERT INTO hotels (name, city_id, price_per_night, rating, category, lat, lng, image_url, description) VALUES
('Hotel Tentrem Yogyakarta', 12, 1200000, 4.8, 'high', -7.7641, 110.3795, 'https://example.com/tentrem.jpg', 'Five-star luxury hotel with Javanese touches'),
('The Phoenix Hotel Yogyakarta', 12, 950000, 4.6, 'high', -7.7884, 110.3669, 'https://example.com/phoenix.jpg', 'Heritage colonial hotel near Tugu Jogja'),
('Royal Ambarrukmo Yogyakarta', 12, 1050000, 4.7, 'high', -7.7847, 110.3987, 'https://example.com/ambarrukmo.jpg', 'Royal heritage hotel with Mataram architecture'),
('Greenhost Boutique Hotel', 12, 480000, 4.2, 'medium', -7.8133, 110.3614, 'https://example.com/greenhost.jpg', 'Eco-friendly boutique hotel near Prawirotaman'),
('Hotel Neo Malioboro', 12, 420000, 4.0, 'medium', -7.7918, 110.3676, 'https://example.com/neomalioboro.jpg', 'Modern hotel right at Jalan Malioboro'),
('Cordela Hotel Senopati', 12, 320000, 3.7, 'low', -7.8012, 110.3712, 'https://example.com/cordela.jpg', 'Affordable hotel near Alun-Alun Utara'),
('Whiz Hotel Malioboro', 12, 300000, 3.6, 'low', -7.7895, 110.3681, 'https://example.com/whiz.jpg', 'Budget chain hotel in Malioboro area'),
('Tugu Hotel Yogyakarta', 12, 880000, 4.5, 'high', -7.7842, 110.3661, 'https://example.com/tuguhotel.jpg', 'Iconic boutique hotel with art collection');

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
('Alun-Alun Kidul Yogyakarta', 12, 0, 'Cultural', -7.8125, 110.3636, 'https://example.com/alunkidul-jogja.jpg', 'South square with twin banyan trees'),
('Museum Ullen Sentalu', 12, 50000, 'Museum', -7.5834, 110.4234, 'https://example.com/ullensentalu.jpg', 'Java cultural and history museum in Kaliurang'),
('Kaliurang', 12, 8000, 'Nature', -7.5923, 110.4292, 'https://example.com/kaliurang.jpg', 'Mountain resort area on Mount Merapi slopes');
