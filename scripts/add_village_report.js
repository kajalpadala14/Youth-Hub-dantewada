const fs = require('fs');

const villageData = [
  { sr: 1, village: 'PADHAPUR', total: 10, rajmistri: 10, driving: 4, welding: 3, solar: 1, electrical: 0, silai: 0, plumber: 0, computer: 2 },
  { sr: 2, village: 'BADEBACHELI', total: 6, rajmistri: 6, driving: 0, welding: 2, solar: 0, electrical: 0, silai: 2, plumber: 2, computer: 0 },
  { sr: 3, village: 'BADEKAMELI', total: 2, rajmistri: 2, driving: 0, welding: 0, solar: 0, electrical: 0, silai: 1, plumber: 0, computer: 1 },
  { sr: 4, village: 'NERLI', total: 8, rajmistri: 2, driving: 2, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 5, village: 'MULLER', total: 11, rajmistri: 7, driving: 0, welding: 0, solar: 0, electrical: 0, silai: 2, plumber: 2, computer: 0 },
  { sr: 6, village: 'JHIRKA', total: 9, rajmistri: 3, driving: 0, welding: 0, solar: 0, electrical: 0, silai: 6, plumber: 0, computer: 0 },
  { sr: 7, village: 'MOLASNAR', total: 14, rajmistri: 9, driving: 0, welding: 0, solar: 0, electrical: 2, silai: 3, plumber: 0, computer: 0 },
  { sr: 8, village: 'MANGNAR', total: 4, rajmistri: 4, driving: 2, welding: 0, solar: 0, electrical: 0, silai: 2, plumber: 0, computer: 0 },
  { sr: 9, village: 'BENPAL', total: 2, rajmistri: 2, driving: 0, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 10, village: 'KODENAR LAVA', total: 10, rajmistri: 10, driving: 0, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 11, village: 'CHERPAL', total: 3, rajmistri: 3, driving: 0, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 12, village: 'REKA', total: 22, rajmistri: 1, driving: 12, welding: 0, solar: 0, electrical: 0, silai: 5, plumber: 0, computer: 4 },
  { sr: 13, village: 'BHATPAL', total: 8, rajmistri: 4, driving: 1, welding: 0, solar: 0, electrical: 0, silai: 1, plumber: 0, computer: 2 },
  { sr: 14, village: 'BADEKARLI', total: 11, rajmistri: 1, driving: 3, welding: 1, solar: 0, electrical: 2, silai: 2, plumber: 0, computer: 2 },
  { sr: 15, village: 'MUNDENAR', total: 24, rajmistri: 7, driving: 3, welding: 2, solar: 0, electrical: 3, silai: 5, plumber: 0, computer: 4 },
  { sr: 16, village: 'PAHURNAR', total: 15, rajmistri: 8, driving: 4, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 3 },
  { sr: 17, village: 'NELGODA', total: 13, rajmistri: 2, driving: 6, welding: 0, solar: 0, electrical: 2, silai: 3, plumber: 0, computer: 0 },
  { sr: 18, village: 'GUMALNAR', total: 9, rajmistri: 4, driving: 0, welding: 0, solar: 0, electrical: 2, silai: 2, plumber: 0, computer: 1 },
  { sr: 19, village: 'KANDAKARKA', total: 4, rajmistri: 1, driving: 2, welding: 0, solar: 0, electrical: 0, silai: 1, plumber: 0, computer: 0 },
  { sr: 20, village: 'HIROLI', total: 1, rajmistri: 0, driving: 1, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 21, village: 'KOKODI', total: 21, rajmistri: 15, driving: 3, welding: 0, solar: 0, electrical: 3, silai: 0, plumber: 0, computer: 0 },
  { sr: 22, village: 'NAHADI', total: 8, rajmistri: 8, driving: 5, welding: 0, solar: 0, electrical: 1, silai: 0, plumber: 0, computer: 0 },
  { sr: 23, village: 'GUMIYAPAL', total: 11, rajmistri: 8, driving: 1, welding: 0, solar: 0, electrical: 2, silai: 0, plumber: 0, computer: 0 },
  { sr: 24, village: 'REWALI', total: 21, rajmistri: 15, driving: 6, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 25, village: 'BARREM', total: 18, rajmistri: 11, driving: 2, welding: 0, solar: 0, electrical: 3, silai: 0, plumber: 0, computer: 2 },
  { sr: 26, village: 'KUTREM', total: 33, rajmistri: 29, driving: 2, welding: 2, solar: 0, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 27, village: 'POTALI', total: 29, rajmistri: 10, driving: 7, welding: 2, solar: 0, electrical: 0, silai: 8, plumber: 0, computer: 2 },
  { sr: 28, village: 'ARANPUR', total: 50, rajmistri: 20, driving: 6, welding: 0, solar: 0, electrical: 5, silai: 19, plumber: 0, computer: 0 },
  { sr: 29, village: 'FULNAR', total: 9, rajmistri: 9, driving: 10, welding: 2, solar: 2, electrical: 0, silai: 0, plumber: 0, computer: 0 },
  { sr: 30, village: 'PONDUM', total: 29, rajmistri: 9, driving: 5, welding: 5, solar: 0, electrical: 1, silai: 1, plumber: 0, computer: 2 },
  { sr: 31, village: 'KAWAD GAON', total: 2, rajmistri: 2, driving: 5, welding: 2, solar: 0, electrical: 3, silai: 0, plumber: 0, computer: 3 },
  { sr: 32, village: 'MUSKEL', total: 3, rajmistri: 3, driving: 1, welding: 0, solar: 0, electrical: 1, silai: 1, plumber: 1, computer: 3 },
  { sr: 33, village: 'KAWALNAR', total: 15, rajmistri: 2, driving: 5, welding: 0, solar: 0, electrical: 2, silai: 3, plumber: 1, computer: 0 },
  { sr: 34, village: 'TOYLANKA', total: 8, rajmistri: 5, driving: 1, welding: 0, solar: 0, electrical: 0, silai: 1, plumber: 1, computer: 0 },
  { sr: 35, village: 'BHOGAM', total: 8, rajmistri: 2, driving: 2, welding: 0, solar: 0, electrical: 0, silai: 4, plumber: 0, computer: 0 },
  { sr: 36, village: 'KUNDELI', total: 3, rajmistri: 2, driving: 0, welding: 0, solar: 0, electrical: 0, silai: 0, plumber: 1, computer: 0 },
  { sr: 'TOTAL', village: 'TOTAL (कुल योग)', total: 441, rajmistri: 236, driving: 101, welding: 21, solar: 3, electrical: 32, silai: 71, plumber: 9, computer: 30 }
];

// Append to seed-data.js before the last closing bracket
let seedStr = fs.readFileSync('js/seed-data.js', 'utf8');
const searchMarker = '"metadata":';
const idx = seedStr.indexOf(searchMarker);

if (!seedStr.includes('"bastarMunneVillageReport":')) {
  const insertStr = '"bastarMunneVillageReport": ' + JSON.stringify(villageData, null, 2) + ',\n  ';
  seedStr = seedStr.substring(0, idx) + insertStr + seedStr.substring(idx);
  fs.writeFileSync('js/seed-data.js', seedStr, 'utf8');
  console.log('Appended bastarMunneVillageReport to seed-data.js successfully!');
} else {
  console.log('bastarMunneVillageReport already exists in seed-data.js');
}
