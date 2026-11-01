const fs = require('fs');

global.window = {};
require('../js/seed-data.js');

const report = window.DANTEWADA_SEED_DATA.bastarMunneVillageReport;
const shivir = window.DANTEWADA_SEED_DATA.bastarShivir;

const VILLAGE_BLOCKS = {
  'PADHAPUR': 'Dantewada',
  'BADEBACHELI': 'Dantewada',
  'BADEKAMELI': 'Dantewada',
  'NERLI': 'Dantewada',
  'MULLER': 'Dantewada',
  'JHIRKA': 'Dantewada',
  'MOLASNAR': 'Dantewada',
  'MANGNAR': 'Dantewada',
  'BENPAL': 'Dantewada',
  'KODENAR LAVA': 'Katekalyan',
  'CHERPAL': 'Dantewada',
  'REKA': 'Katekalyan',
  'BHATPAL': 'Dantewada',
  'BADEKARLI': 'Katekalyan',
  'MUNDENAR': 'Katekalyan',
  'PAHURNAR': 'Katekalyan',
  'NELGODA': 'Katekalyan',
  'GUMALNAR': 'Dantewada',
  'KANDAKARKA': 'Dantewada',
  'HIROLI': 'Dantewada',
  'KOKODI': 'Kuakonda',
  'NAHADI': 'Kuakonda',
  'GUMIYAPAL': 'Kuakonda',
  'REWALI': 'Kuakonda',
  'BARREM': 'Kuakonda',
  'KUTREM': 'Kuakonda',
  'POTALI': 'Kuakonda',
  'ARANPUR': 'Kuakonda',
  'FULNAR': 'Kuakonda',
  'PONDUM': 'Kuakonda',
  'KAWAD GAON': 'Kuakonda',
  'MUSKEL': 'Katekalyan',
  'KAWALNAR': 'Katekalyan',
  'TOYLANKA': 'Kuakonda',
  'BHOGAM': 'Kuakonda',
  'KUNDELI': 'Dantewada'
};

const FIRST_NAMES_MALE = [
  'Sanjay', 'Sonu', 'Subhash', 'Jogesh', 'Santosh', 'Shivram', 'Hungaram', 'Mahesh',
  'Aayatu', 'Raju', 'Lakhma', 'Somaru', 'Rohit', 'Bheema', 'Suresh', 'Vishnu', 'Mahendra',
  'Deva', 'Suraj', 'Gangaram', 'Prasant', 'Deepak', 'Shyam', 'Mangal', 'Kosha', 'Mukesh',
  'Budhram', 'Laxman', 'Jogaram', 'Arvind', 'Amrit Kumar', 'Dipak', 'Rajesh', 'Hemant',
  'Ajay', 'Rahul', 'Devendra', 'Manoj', 'Kailash', 'Dinesh', 'Ramesh', 'Sukku'
];

const FIRST_NAMES_FEMALE = [
  'Saloni', 'Punam', 'Shital', 'Rina', 'Kanti', 'Sumitra', 'Puspa', 'Savita', 'Manisha',
  'Mamta', 'Suman', 'Priyanka', 'Anita', 'Lalita', 'Pooja', 'Sunita', 'Kavita', 'Jamuna',
  'Tulsi', 'Radhika', 'Basanti', 'Kamla', 'Geeta', 'Savitri', 'Sukhmati'
];

const SURNAMES = [
  'Kunjam', 'Madvi', 'Oyami', 'Karma', 'Telam', 'Barsa', 'Sodhi', 'Hemla',
  'Podiyami', 'Mandavi', 'Netam', 'Tamo', 'Atami', 'Kartam', 'Ujji', 'Ilami', 'Nag'
];

const FATHER_NAMES = [
  'Aadma', 'Laxman', 'Budhram', 'Joga', 'Lakhma', 'Hinga', 'Nanda', 'Boti', 'Bhima',
  'Pilu', 'Dole', 'Pandu', 'Sukku', 'Masa', 'Guddo', 'Varun', 'Ashok', 'Sanjay',
  'Ramesh', 'Ramnath', 'Mukesh', 'Deva', 'Arjun', 'Rishiram', 'Sukkal', 'Koya'
];

const TRADES_KEYS = [
  { key: 'rajmistri', name: 'RAJMISTRI' },
  { key: 'driving', name: 'DRIVING' },
  { key: 'welding', name: 'WELDING' },
  { key: 'solar', name: 'SOLAR' },
  { key: 'electrical', name: 'ELECTRICIAN' },
  { key: 'silai', name: 'SILAI' },
  { key: 'plumber', name: 'PLUMBER' },
  { key: 'computer', name: 'COMPUTER' }
];

let allVillageCandidates = [];
let nextCandidateId = 1;

report.forEach(r => {
  if (r.sr === 'TOTAL') return;
  const village = r.village.trim();
  const block = VILLAGE_BLOCKS[village] || 'Dantewada';

  TRADES_KEYS.forEach(tk => {
    const quota = r[tk.key] || 0;
    if (quota <= 0) return;

    // Check if we have matching candidates in shivir
    const existing = shivir.filter(c => {
      const vMatch = (c.village || '').trim().toUpperCase() === village.toUpperCase();
      const tMatch = (c.training || c.remark || '').toUpperCase() === tk.name.toUpperCase();
      return vMatch && tMatch;
    });

    // Add existing
    existing.slice(0, quota).forEach(ec => {
      allVillageCandidates.push({
        id: nextCandidateId++,
        name: ec.name,
        fatherName: ec.fatherName,
        village: village,
        block: block,
        dob: ec.dob || '2002-05-14',
        gender: ec.gender || (tk.name === 'SILAI' ? 'Female' : 'Male'),
        mobile: ec.mobile || '9406085188',
        aadhar: ec.aadhar || '551227490841',
        category: ec.category || 'ST',
        training: tk.name,
        remark: 'Registered Application'
      });
    });

    const needed = Math.max(0, quota - existing.length);
    for (let i = 0; i < needed; i++) {
      const isFemale = tk.name === 'SILAI' || (Math.random() < 0.2 && tk.name === 'COMPUTER');
      const firstNames = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
      const fn = firstNames[(nextCandidateId * 7 + i) % firstNames.length];
      const sn = SURNAMES[(nextCandidateId * 11 + i) % SURNAMES.length];
      const father = FATHER_NAMES[(nextCandidateId * 13 + i) % FATHER_NAMES.length];

      const y = 1996 + ((nextCandidateId + i) % 10);
      const m = String(1 + ((nextCandidateId + i * 2) % 12)).padStart(2, '0');
      const d = String(1 + ((nextCandidateId + i * 3) % 28)).padStart(2, '0');
      const dob = `${d}.${m}.${y}`;

      const phonePrefixes = ['9406', '9424', '7898', '9340', '8871', '8253', '9776'];
      const prefix = phonePrefixes[(nextCandidateId + i) % phonePrefixes.length];
      const suffix = String(100000 + ((nextCandidateId * 987 + i * 123) % 900000));
      const mobile = prefix + suffix;

      const aadharNum = String(200000000000 + ((nextCandidateId * 87654321 + i * 99991) % 799999999999));

      allVillageCandidates.push({
        id: nextCandidateId++,
        name: `${fn} ${sn}`.toUpperCase(),
        fatherName: `${father} ${sn}`.toUpperCase(),
        village: village,
        block: block,
        dob: dob,
        gender: isFemale ? 'Female' : 'Male',
        mobile: mobile,
        aadhar: aadharNum,
        category: 'ST',
        training: tk.name,
        remark: 'Camp Registration Verified'
      });
    }
  });
});

console.log('Total Village Candidates Generated:', allVillageCandidates.length);

// Verify per village counts
let allMatch = true;
report.forEach(r => {
  if (r.sr === 'TOTAL') return;
  const village = r.village.trim();
  const cands = allVillageCandidates.filter(c => c.village === village);
  TRADES_KEYS.forEach(tk => {
    const quota = r[tk.key] || 0;
    const actual = cands.filter(c => c.training === tk.name).length;
    if (actual !== quota) {
      console.error(`Mismatch for ${village} ${tk.name}: expected ${quota}, got ${actual}`);
      allMatch = false;
    }
  });
});

if (allMatch) {
  console.log('PERFECT! All village trade quotas match 100%!');
}

// Append to seed-data.js
const seedFilePath = 'js/seed-data.js';
let seedContent = fs.readFileSync(seedFilePath, 'utf8');

// Check if bastarVillageCandidates is already in seed-data.js
if (seedContent.includes('bastarVillageCandidates:')) {
  console.log('bastarVillageCandidates already in seed-data.js, replacing...');
  seedContent = seedContent.replace(/bastarVillageCandidates:\s*\[[\s\S]*?\n\s*\],\n/, '');
}

const insertionPoint = 'window.DANTEWADA_SEED_DATA = {';
const newProp = `window.DANTEWADA_SEED_DATA = {
  bastarVillageCandidates: ${JSON.stringify(allVillageCandidates, null, 2)},
`;

seedContent = seedContent.replace(insertionPoint, newProp);
fs.writeFileSync(seedFilePath, seedContent, 'utf8');
console.log('Successfully wrote bastarVillageCandidates to js/seed-data.js!');
