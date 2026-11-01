const fs = require('fs');
const files = fs.readdirSync('js').filter(f => f.endsWith('.js'));
const actions = new Set();
for (const file of files) {
  const content = fs.readFileSync('js/' + file, 'utf8');
  const apiCallMatches = content.matchAll(/API\.call\(\s*['"]([^'"]+)['"]/g);
  for (const m of apiCallMatches) actions.add(m[1] + ' (' + file + ')');
  const actionObjMatches = content.matchAll(/action:\s*['"]([^'"]+)['"]/g);
  for (const m of actionObjMatches) actions.add(m[1] + ' (' + file + ')');
}
console.log(Array.from(actions));
