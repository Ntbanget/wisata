-- =====================================================
-- DATABASE DIAGNOSTIC SCRIPT
-- Purpose: Analyze current database structure before migration
-- =====================================================

USE wisata_db;

-- =====================================================
-- STEP 1: Check which tables exist
-- =====================================================
SELECT '=== EXISTING TABLES ===' as diagnostic_step;
SHOW TABLES;

-- =====================================================
-- STEP 2: Check cities table structure
-- =====================================================
SELECT '=== CITIES TABLE STRUCTURE ===' as diagnostic_step;
DESCRIBE cities;
SELECT COUNT(*) as cities_count FROM cities;
SELECT * FROM cities LIMIT 5;

-- =====================================================
-- STEP 3: Check vehicles table structure  
-- =====================================================
SELECT '=== VEHICLES TABLE STRUCTURE ===' as diagnostic_step;
DESCRIBE vehicles;
SELECT COUNT(*) as vehicles_count FROM vehicles;
SELECT * FROM vehicles LIMIT 3;

-- =====================================================
-- STEP 4: Check tourist_places table structure
-- =====================================================
SELECT '=== TOURIST_PLACES TABLE STRUCTURE ===' as diagnostic_step;
DESCRIBE tourist_places;
SELECT COUNT(*) as tourist_places_count FROM tourist_places;

-- =====================================================
-- STEP 5: Check hotels table structure
-- =====================================================
SELECT '=== HOTELS TABLE STRUCTURE ===' as diagnostic_step;
DESCRIBE hotels;
SELECT COUNT(*) as hotels_count FROM hotels;

-- =====================================================
-- STEP 6: Check for existing views
-- =====================================================
SELECT '=== EXISTING VIEWS ===' as diagnostic_step;
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';

-- =====================================================
-- STEP 7: Check for any foreign key constraints
-- =====================================================
SELECT '=== FOREIGN KEY CONSTRAINTS ===' as diagnostic_step;
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    CONSTRAINT_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME 
FROM 
    information_schema.KEY_COLUMN_USAGE 
WHERE 
    TABLE_SCHEMA = 'wisata_db' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- =====================================================
-- STEP 8: Check for any duplicate data issues
-- =====================================================
SELECT '=== POTENTIAL DUPLICATES CHECK ===' as diagnostic_step;
SELECT name, COUNT(*) as count FROM cities GROUP BY name HAVING count > 1;
SELECT name, COUNT(*) as count FROM vehicles GROUP BY name HAVING count > 1;

SELECT '=== DIAGNOSTIC COMPLETE ===' as message;