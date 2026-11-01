const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const tables = content.matchAll(/<table[^>]*>[\s\S]*?<\/table>/g);
let count = 0;
for (const t of tables) {
  count++;
  const idMatch = t[0].match(/id="([^"]+)"/);
  const theadMatch = t[0].match(/<thead[^>]*>([\s\S]*?)<\/thead>/);
  console.log(`Table #${count}: id=${idMatch ? idMatch[1] : 'none'}`);
  if (theadMatch) {
    const ths = Array.from(theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)).map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log(`  Headers: ${ths.join(' | ')}`);
  }
}
