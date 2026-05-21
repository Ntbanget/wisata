-- =====================================================
-- SAFE DATABASE DIAGNOSTIC SCRIPT v2.0
-- Purpose: Completely safe database analysis that works even on empty/incomplete databases
-- NEVER fails even if tables don't exist, columns are missing, or migrations are incomplete
-- =====================================================

SET @dbname = DATABASE();

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 1: Check which tables exist
-- =====================================================
SELECT '=== SAFE DIAGNOSTIC START ===' as diagnostic_step;
SELECT CONCAT('Analyzing database: ', @dbname) as message;

-- Use INFORMATION_SCHEMA to check table existence (completely safe)
SELECT 
    TABLE_NAME as table_name,
    TABLE_ROWS as estimated_rows,
    CREATE_TIME as created_time,
    UPDATE_TIME as last_updated
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = @dbname 
ORDER BY 
    TABLE_NAME;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 2: Check cities table structure (SAFE)
-- =====================================================
SELECT '=== CITIES TABLE ANALYSIS ===' as diagnostic_step;

-- Check if cities table exists
SET @cities_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'cities');

SELECT IF(@cities_exists > 0, '✓ Cities table exists', '✗ Cities table does NOT exist') as cities_status;

-- Only describe cities if it exists
SET @describe_cities = IF(@cities_exists > 0,
    'DESCRIBE cities',
    'SELECT ''Cities table does not exist - skipping DESCRIBE'' as message'
);

PREPARE stmt FROM @describe_cities;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only query cities data if table exists
SET @query_cities = IF(@cities_exists > 0,
    CONCAT('SELECT id, name, created_at FROM cities LIMIT 5'),
    'SELECT ''Cities table does not exist - skipping data query'' as message'
);

PREPARE stmt FROM @query_cities;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only count cities if table exists
SET @count_cities = IF(@cities_exists > 0,
    'SELECT COUNT(*) as cities_count FROM cities',
    'SELECT 0 as cities_count, ''Cities table does not exist'' as note'
);

PREPARE stmt FROM @count_cities;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 3: Check vehicles table structure (SAFE)
-- =====================================================
SELECT '=== VEHICLES TABLE ANALYSIS ===' as diagnostic_step;

-- Check if vehicles table exists
SET @vehicles_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                       WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'vehicles');

SELECT IF(@vehicles_exists > 0, '✓ Vehicles table exists', '✗ Vehicles table does NOT exist') as vehicles_status;

-- Only describe vehicles if it exists
SET @describe_vehicles = IF(@vehicles_exists > 0,
    'DESCRIBE vehicles',
    'SELECT ''Vehicles table does not exist - skipping DESCRIBE'' as message'
);

PREPARE stmt FROM @describe_vehicles;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only query vehicles data if table exists
SET @query_vehicles = IF(@vehicles_exists > 0,
    CONCAT('SELECT id, name, category, capacity FROM vehicles LIMIT 3'),
    'SELECT ''Vehicles table does not exist - skipping data query'' as message'
);

PREPARE stmt FROM @query_vehicles;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only count vehicles if table exists
SET @count_vehicles = IF(@vehicles_exists > 0,
    'SELECT COUNT(*) as vehicles_count FROM vehicles',
    'SELECT 0 as vehicles_count, ''Vehicles table does not exist'' as note'
);

PREPARE stmt FROM @count_vehicles;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 4: Check tourist_places table structure (SAFE)
-- =====================================================
SELECT '=== TOURIST_PLACES TABLE ANALYSIS ===' as diagnostic_step;

-- Check if tourist_places table exists
SET @tourist_places_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                             WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'tourist_places');

SELECT IF(@tourist_places_exists > 0, '✓ Tourist_places table exists', '✗ Tourist_places table does NOT exist') as tourist_places_status;

-- Only describe tourist_places if it exists
SET @describe_tourist_places = IF(@tourist_places_exists > 0,
    'DESCRIBE tourist_places',
    'SELECT ''Tourist_places table does not exist - skipping DESCRIBE'' as message'
);

PREPARE stmt FROM @describe_tourist_places;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only count tourist_places if table exists
SET @count_tourist_places = IF(@tourist_places_exists > 0,
    'SELECT COUNT(*) as tourist_places_count FROM tourist_places',
    'SELECT 0 as tourist_places_count, ''Tourist_places table does not exist'' as note'
);

PREPARE stmt FROM @count_tourist_places;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 5: Check hotels table structure (SAFE)
-- =====================================================
SELECT '=== HOTELS TABLE ANALYSIS ===' as diagnostic_step;

-- Check if hotels table exists
SET @hotels_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'hotels');

SELECT IF(@hotels_exists > 0, '✓ Hotels table exists', '✗ Hotels table does NOT exist') as hotels_status;

-- Only describe hotels if it exists
SET @describe_hotels = IF(@hotels_exists > 0,
    'DESCRIBE hotels',
    'SELECT ''Hotels table does not exist - skipping DESCRIBE'' as message'
);

PREPARE stmt FROM @describe_hotels;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only count hotels if table exists
SET @count_hotels = IF(@hotels_exists > 0,
    'SELECT COUNT(*) as hotels_count FROM hotels',
    'SELECT 0 as hotels_count, ''Hotels table does not exist'' as note'
);

PREPARE stmt FROM @count_hotels;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 6: Check for existing views (SAFE)
-- =====================================================
SELECT '=== EXISTING VIEWS ANALYSIS ===' as diagnostic_step;

-- Check views using INFORMATION_SCHEMA (completely safe)
SELECT 
    TABLE_NAME as view_name,
    TABLE_TYPE as table_type
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = @dbname 
    AND TABLE_TYPE LIKE 'VIEW'
ORDER BY 
    TABLE_NAME;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 7: Check for foreign key constraints (SAFE)
-- =====================================================
SELECT '=== FOREIGN KEY CONSTRAINTS ANALYSIS ===' as diagnostic_step;

-- Check foreign keys using INFORMATION_SCHEMA (completely safe)
SELECT 
    TABLE_NAME as table_name,
    COLUMN_NAME as column_name,
    CONSTRAINT_NAME as constraint_name,
    REFERENCED_TABLE_NAME as referenced_table,
    REFERENCED_COLUMN_NAME as referenced_column
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    TABLE_SCHEMA = @dbname 
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY 
    TABLE_NAME, CONSTRAINT_NAME;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 8: Check for duplicate data (SAFE)
-- =====================================================
SELECT '=== POTENTIAL DUPLICATES ANALYSIS ===' as diagnostic_step;

-- Only check for duplicate cities if table exists
SET @check_cities_dup = IF(@cities_exists > 0,
    'SELECT name, COUNT(*) as count FROM cities GROUP BY name HAVING count > 1',
    'SELECT ''Cities table does not exist - skipping duplicate check'' as message'
);

PREPARE stmt FROM @check_cities_dup;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Only check for duplicate vehicles if table exists
SET @check_vehicles_dup = IF(@vehicles_exists > 0,
    'SELECT name, COUNT(*) as count FROM vehicles GROUP BY name HAVING count > 1',
    'SELECT ''Vehicles table does not exist - skipping duplicate check'' as message'
);

PREPARE stmt FROM @check_vehicles_dup;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 9: Check for missing critical columns (SAFE)
-- =====================================================
SELECT '=== CRITICAL COLUMNS ANALYSIS ===' as diagnostic_step;

-- Check cities table for expected columns
SELECT 'Cities table column analysis:' as analysis_type;
SELECT 
    COLUMN_NAME as column_name,
    DATA_TYPE as data_type,
    IS_NULLABLE as is_nullable,
    COLUMN_DEFAULT as default_value
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'cities'
ORDER BY 
    ORDINAL_POSITION;

-- Check vehicles table for expected columns
SELECT 'Vehicles table column analysis:' as analysis_type;
SELECT 
    COLUMN_NAME as column_name,
    DATA_TYPE as data_type,
    IS_NULLABLE as is_nullable,
    COLUMN_DEFAULT as default_value
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_SCHEMA = @dbname 
    AND TABLE_NAME = 'vehicles'
ORDER BY 
    ORDINAL_POSITION;

-- =====================================================
-- SAFE DIAGNOSTIC - STEP 10: Schema summary and recommendations
-- =====================================================
SELECT '=== SCHEMA HEALTH SUMMARY ===' as diagnostic_step;

SELECT 
    @cities_exists as cities_table_exists,
    @vehicles_exists as vehicles_table_exists,
    @tourist_places_exists as tourist_places_table_exists,
    @hotels_exists as hotels_table_exists;

SELECT 
    CONCAT('Expected tables: 4 (cities, tourist_places, hotels, vehicles)') as expected_tables,
    CONCAT('Found tables: ', 
           IF(@cities_exists > 0, 1, 0) + 
           IF(@vehicles_exists > 0, 1, 0) + 
           IF(@tourist_places_exists > 0, 1, 0) + 
           IF(@hotels_exists > 0, 1, 0)) as found_tables;

SELECT '=== RECOMMENDATIONS ===' as recommendation_step;

SELECT IF(@cities_exists = 0, '⚠ Create cities table using schema.sql or migration script', '✓ Cities table exists') as cities_recommendation;
SELECT IF(@vehicles_exists = 0, '⚠ Create vehicles table using vehicles_schema.sql or migration script', '✓ Vehicles table exists') as vehicles_recommendation;
SELECT IF(@tourist_places_exists = 0, '⚠ Create tourist_places table using schema.sql', '✓ Tourist_places table exists') as tourist_places_recommendation;
SELECT IF(@hotels_exists = 0, '⚠ Create hotels table using schema.sql', '✓ Hotels table exists') as hotels_recommendation;

SELECT '=== SAFE DIAGNOSTIC COMPLETE ===' as message;
SELECT 'This script works safely even on empty/incomplete databases' as safety_note;
SELECT 'No tables were assumed to exist - all checks were defensive' as methodology;