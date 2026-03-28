const fs = require('fs');
const PDFParser = require('pdf2json');

async function extractPDFs() {
  const files = [
    'f:/Downloads/bot_telegram/documentacao/DOCUMENTAÇÃO API WIINPAY.pdf',
    'f:/Downloads/bot_telegram/documentacao/Frame 39.pdf',
    'f:/Downloads/bot_telegram/documentacao/documentação.pdf'
  ];

  for(let file of files) {
      if(!fs.existsSync(file)) continue;
      
      const pdfParser = new PDFParser(this, 1);
      
      pdfParser.on("pdfParser_dataError", errData => console.error(`Error parsing ${file}: ${errData.parserError}`) );
      pdfParser.on("pdfParser_dataReady", pdfData => {
          let text = pdfParser.getRawTextContent().replace(/\r\n/g, "\n");
          let outFileName = file.split('/').pop() + '.txt';
          fs.writeFileSync(outFileName, text, 'utf8');
          console.log(`Saved ${outFileName}`);
      });
  
      pdfParser.loadPDF(file);
  }
}

extractPDFs();
