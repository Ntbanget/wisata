const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const cityRes = await client.query("SELECT id FROM cities WHERE name = $1", ['Semarang']);
    let cityId;
    if (cityRes.rows.length === 0) {
      const insertCity = await client.query(
        `INSERT INTO cities (name, province, latitude, longitude, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['Semarang', 'Jawa Tengah', -7.0051, 110.4381, 'Ibu kota Jawa Tengah', true]
      );
      cityId = insertCity.rows[0].id;
      console.log('CREATED_CITY', cityId);
    } else {
      cityId = cityRes.rows[0].id;
      console.log('EXISTING_CITY', cityId);
    }

    const hotelRes = await client.query('SELECT id FROM hotels WHERE name = $1 AND city_id = $2', ['Hotel Semarang Plaza', cityId]);
    let hotelId;
    if (hotelRes.rows.length === 0) {
      const insertHotel = await client.query(
        `INSERT INTO hotels (name, star_rating, city_id, price_per_night, rating, total_reviews, is_active, category, lat, lng, room_capacity, total_rooms, minimum_nights, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['Hotel Semarang Plaza', 4, cityId, 350000, 4.5, 120, true, 'high', -7.0051, 110.4381, 2, 20, 1, 'Hotel pusat kota']
      );
      hotelId = insertHotel.rows[0].id;
      console.log('CREATED_HOTEL', hotelId);
    } else {
      hotelId = hotelRes.rows[0].id;
      console.log('EXISTING_HOTEL', hotelId);
    }

    const placeRes = await client.query('SELECT id FROM tourist_places WHERE name = $1 AND city_id = $2', ['Lawang Sewu', cityId]);
    let placeId;
    if (placeRes.rows.length === 0) {
      const insertPlace = await client.query(
        `INSERT INTO tourist_places (name, city_id, ticket_price, category, lat, lng, description, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['Lawang Sewu', cityId, 50000, 'history', -6.9834, 110.4105, 'Bangunan bersejarah', true]
      );
      placeId = insertPlace.rows[0].id;
      console.log('CREATED_PLACE', placeId);
    } else {
      placeId = placeRes.rows[0].id;
      console.log('EXISTING_PLACE', placeId);
    }

    console.log('SEED_COMPLETE', { cityId, hotelId, placeId });
  } catch (err) {
    console.error('SEED_FAIL', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();