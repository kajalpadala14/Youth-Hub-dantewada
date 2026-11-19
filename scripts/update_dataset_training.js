const fs = require('fs');
const datasetPath = 'js/dataset.js';
let content = fs.readFileSync(datasetPath, 'utf8');
const trainingData = JSON.parse(fs.readFileSync('scripts/training_conducted_data.json', 'utf8'));

const target = '  "metadata": {';
const replacement = '  "trainingConducted": ' + JSON.stringify(trainingData, null, 2) + ',\n  "metadata": {';

if (content.includes('"trainingConducted":')) {
  console.log('Already present in dataset.js');
} else {
  content = content.replace(target, replacement);
  fs.writeFileSync(datasetPath, content, 'utf8');
  console.log('Updated dataset.js with 52 trainingConducted records!');
}
