const fs = require('fs');
const pdf = require('pdf-parse');

async function extractPDFs() {
  const files = [
    'f:/Downloads/bot_telegram/documentacao/DOCUMENTAÇÃO API WIINPAY.pdf',
    'f:/Downloads/bot_telegram/documentacao/Frame 39.pdf',
    'f:/Downloads/bot_telegram/documentacao/documentação.pdf'
  ];

  let output = '';
  for (const file of files) {
    output += '\n--- FILE: ' + file.split('/').pop() + ' ---\n';
    try {
      const dataBuffer = fs.readFileSync(file);
      const data = await pdf(dataBuffer);
      output += data.text + '\n';
    } catch (e) {
      output += 'Error reading file: ' + e.message + '\n';
    }
  }
  fs.writeFileSync('pdf-output-utf8.txt', output, 'utf8');
}

extractPDFs();
