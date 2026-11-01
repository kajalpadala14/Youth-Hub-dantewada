const fs = require('fs');
const content = fs.readFileSync('admin.html', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('data-tab=') || line.includes('nav-tab') || line.includes('switchTab') || line.includes('id="tab-')) {
    console.log((idx + 1) + ': ' + line.trim());
  }
});
