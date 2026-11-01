const fs = require('fs');

// 1. Parse raw_bastar_munne_shivir.csv
const content = fs.readFileSync('raw_bastar_munne_shivir.csv', 'utf8');
const lines = content.split(/\r?\n/);
const records = [];

const blockMap = {
  'PADHAPUR': 'Dantewada',
  'BENPAL': 'Dantewada',
  'NERLI': 'Dantewada',
  'MULLER': 'Kuakonda',
  'LOHAGAON': 'Kuakonda',
  'JHIRKA': 'Geedam',
  'MOLASNAR': 'Geedam',
  'CHERPAL': 'Dantewada',
  'BHATPAL': 'Geedam',
  'BADEKARLI': 'Katekalyan',
  'MUNDENAR': 'Katekalyan',
  'MUNDER': 'Katekalyan',
  'PAHURNAR': 'Geedam',
  'NELGODA': 'Geedam',
  'NELGUDA': 'Geedam',
  'GUMALNAR': 'Geedam',
  'KANDAKARKA': 'Geedam',
  'BADE BACHELI': 'Dantewada',
  'BADEBACHELI': 'Dantewada',
  'BADE KAMELI': 'Dantewada',
  'BADEKAMELI': 'Dantewada',
  'MANGNAR': 'Geedam',
  'REKA': 'Geedam',
  'HIROLI': 'Dantewada',
  'BALOOD': 'Dantewada',
  'POTALI': 'Kuakonda',
  'ARANPUR': 'Kuakonda',
  'KODENAR LAVA': 'Dantewada',
  'KOKODI': 'Kuakonda',
  'NAHADI': 'Kuakonda',
  'GUMIYAPAL': 'Kuakonda',
  'REWALI': 'Kuakonda',
  'BARREM': 'Kuakonda',
  'KUTREM': 'Kuakonda',
  'FULNAR': 'Kuakonda',
  'PONDUM': 'Kuakonda',
  'KAWAD GAON': 'Katekalyan',
  'MUSKEL': 'Katekalyan',
  'KAWALNAR': 'Katekalyan',
  'TOYLANKA': 'Katekalyan',
  'BHOGAM': 'Katekalyan',
  'KUNDELI': 'Katekalyan'
};

for (const line of lines) {
  const parts = line.split(',').map(p => p.trim());
  if (parts.length >= 8) {
    const sr = parts[1];
    const name = parts[2];
    const father = parts[3];
    const dob = parts[4];
    const aadhar = parts[5];
    const mobile = parts[6];
    const village = parts[7] ? parts[7].toUpperCase() : '';
    const training = parts[8] ? parts[8].toUpperCase() : '';

    if (sr && !isNaN(parseInt(sr)) && name && name !== 'NAME' && training && training !== 'TRAINING') {
      const isFemale = training === 'SILAI' || ['POJJE', 'SUNDARI', 'MASO', 'SITO', 'SANDYA', 'AASHO', 'SHANTI', 'LAXMI', 'ANITA', 'PRITI', 'GANGOTRI', 'SANGEETA', 'SUNITA', 'RAMBATI', 'SAMBATI', 'JYOTI', 'MANIMA', 'RAIMATI', 'LALITA', 'MUNNI', 'LALBATI', 'SHILO', 'MANITA', 'SUSHILA', 'FULMATI', 'SUNDRI', 'SHILPA', 'SOMARI', 'SARITA', 'RANJITA', 'SAVITRI', 'SALONI', 'PUNAM', 'SHITAL', 'RINA', 'CHAMPA', 'ROSHNI', 'PUSPA', 'LATA', 'NEELA'].some(n => name.toUpperCase().includes(n));
      const gender = isFemale ? 'Female' : 'Male';
      const block = blockMap[village] || 'Dantewada';

      records.push({
        id: parseInt(sr),
        name: name,
        fatherName: father || 'N/A',
        village: village || 'Dantewada',
        block: block,
        dob: dob || '2001-01-01',
        gender: gender,
        mobile: mobile || 'N/A',
        aadhar: aadhar || 'XXXXXXXX7890',
        category: 'ST',
        training: training,
        remark: training
      });
    }
  }
}

// 2. Read seed-data.js and replace bastarShivir
let seedStr = fs.readFileSync('js/seed-data.js', 'utf8');
const startIdx = seedStr.indexOf('"bastarShivir":');
const endIdx = seedStr.indexOf('"trainingConducted":', startIdx);

const newBastarStr = '"bastarShivir": ' + JSON.stringify(records, null, 2) + ',\n  ';
seedStr = seedStr.substring(0, startIdx) + newBastarStr + seedStr.substring(endIdx);
fs.writeFileSync('js/seed-data.js', seedStr, 'utf8');
console.log('Successfully updated seed-data.js with ' + records.length + ' Bastar Munne Shivir records!');
