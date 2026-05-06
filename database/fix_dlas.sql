-- Rename "Desa Wisata Banjardawa (Dlas)" -> "D'LAS Desa Wisata Lembah Asri Serang"
-- with correct Karangreja, Purbalingga coordinates and details.
-- Run this only if you imported the previous version of add_new_cities.sql.
-- Idempotent: re-running has no further effect.

USE wisata_db;

UPDATE tourist_places
SET
  name = 'D''LAS Desa Wisata Lembah Asri Serang',
  category = 'Recreation',
  ticket_price = 25000,
  lat = -7.2289,
  lng = 109.4339,
  image_url = 'https://example.com/dlas.jpg',
  description = 'D''LAS in Karangreja: family park on the slopes of Mount Slamet with rides, mini-zoo, pine forest and viewpoint'
WHERE name = 'Desa Wisata Banjardawa (Dlas)';

SELECT CONCAT('DLAS entries updated: ', ROW_COUNT()) AS status;
