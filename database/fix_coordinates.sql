-- Fix coordinates for major landmarks in Central Java
-- Run this once via phpMyAdmin Import tab or via mysql CLI:
--   mysql -u root -p wisata_db < fix_coordinates.sql
-- This updates real-world positions for well-known places so the map matches reality.

USE wisata_db;

-- Semarang
UPDATE tourist_places SET lat = -6.9839, lng = 110.4106 WHERE name = 'Lawang Sewu';
UPDATE tourist_places SET lat = -6.9874, lng = 110.3996 WHERE name = 'Sam Poo Kong Temple';
UPDATE tourist_places SET lat = -6.9847, lng = 110.4107 WHERE name = 'Tugu Muda Semarang';
UPDATE tourist_places SET lat = -6.9839, lng = 110.4486 WHERE name = 'Masjid Agung Jawa Tengah';
UPDATE tourist_places SET lat = -6.9904, lng = 110.4082 WHERE name = 'Kampung Pelangi';
UPDATE tourist_places SET lat = -6.9477, lng = 110.3849 WHERE name = 'Pantai Marina';

-- Surakarta (Solo)
UPDATE tourist_places SET lat = -7.5779, lng = 110.8246 WHERE name = 'Keraton Surakarta';
UPDATE tourist_places SET lat = -7.5775, lng = 110.8243 WHERE name = 'Pasar Klewer';
UPDATE tourist_places SET lat = -7.5708, lng = 110.8124 WHERE name = 'Taman Sriwedari';
UPDATE tourist_places SET lat = -7.5666, lng = 110.8166 WHERE name = 'Museum Batik Danar Hadi';
UPDATE tourist_places SET lat = -7.6275, lng = 111.1283 WHERE name = 'Candi Sukuh';
UPDATE tourist_places SET lat = -7.5969, lng = 111.1547 WHERE name = 'Candi Cetho';
UPDATE tourist_places SET lat = -7.5824, lng = 110.8246 WHERE name = 'Alun-Alun Kidul';

-- Magelang (Borobudur area)
UPDATE tourist_places SET lat = -7.6079, lng = 110.2038 WHERE name = 'Candi Borobudur';
UPDATE tourist_places SET lat = -7.6044, lng = 110.2298 WHERE name = 'Candi Mendut';
UPDATE tourist_places SET lat = -7.6058, lng = 110.2206 WHERE name = 'Candi Pawon';
UPDATE tourist_places SET lat = -7.5119, lng = 110.3833 WHERE name = 'Ketep Pass';

-- Wonosobo / Dieng
UPDATE tourist_places SET lat = -7.2003, lng = 109.9097 WHERE name = 'Dieng Plateau';
UPDATE tourist_places SET lat = -7.2122, lng = 109.9134 WHERE name = 'Telaga Warna';
UPDATE tourist_places SET lat = -7.2089, lng = 109.9098 WHERE name = 'Candi Arjuna';
UPDATE tourist_places SET lat = -7.2150, lng = 109.9118 WHERE name = 'Kawah Sikidang';

-- Jepara
UPDATE tourist_places SET lat = -6.5860, lng = 110.6440 WHERE name = 'Pantai Kartini';
UPDATE tourist_places SET lat = -6.5723, lng = 110.6294 WHERE name = 'Pantai Bandengan';

SELECT 'Coordinate fix applied' AS status;
