from pathlib import Path
import re

sql_path = Path(r'c:/xampp/htdocs/wisata/database/master_data_postgres.sql')
text = sql_path.read_text(encoding='utf-8', errors='ignore')

hotel_pattern = re.compile(r"INSERT INTO hotels\s*\(.*?\)\s*VALUES\s*\('([^']+)'", re.S)
destination_pattern = re.compile(r"INSERT INTO tourist_places\s*\(.*?\)\s*VALUES\s*\('([^']+)'", re.S)

hotels = []
for match in hotel_pattern.finditer(text):
    hotels.append(match.group(1))

# remove duplicates while preserving order
seen = set()
unique_hotels = []
for name in hotels:
    if name not in seen:
        seen.add(name)
        unique_hotels.append(name)

seen.clear()
destinations = []
for match in destination_pattern.finditer(text):
    destinations.append(match.group(1))

unique_destinations = []
for name in destinations:
    if name not in seen:
        seen.add(name)
        unique_destinations.append(name)

out_path = Path(r'c:/xampp/htdocs/wisata/hotel_destinations.txt')
out_path.write_text(
    'HOTELS\n' + '\n'.join(unique_hotels) + '\n\nDESTINATIONS\n' + '\n'.join(unique_destinations),
    encoding='utf-8'
)

print(out_path)
print('Hotels:', len(unique_hotels))
print('Destinations:', len(unique_destinations))
