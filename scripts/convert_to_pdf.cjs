const fs = require('fs');
const puppeteer = require('puppeteer');
const { marked } = require('marked');
const path = require('path');

async function convert() {
  const mdPath = path.join(__dirname, '..', 'DISHA_FIRST_OPINION_METHODOLOGY.md');
  const pdfPath = path.join(__dirname, '..', 'public', 'DISHA_FIRST_OPINION_METHODOLOGY.pdf');
  
  console.log('Reading markdown...');
  const mdContent = fs.readFileSync(mdPath, 'utf8');
  
  console.log('Converting to HTML...');
  const htmlContent = marked(mdContent);
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>DISHA_FIRST_OPINION_METHODOLOGY</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          padding: 2rem;
          color: #333;
        }
        h1, h2, h3, h4, h5 {
          color: #111;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        pre {
          background-color: #f6f8fa;
          padding: 16px;
          overflow: auto;
          border-radius: 6px;
          font-family: monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }
        code {
          background-color: #f6f8fa;
          padding: 0.2em 0.4em;
          border-radius: 6px;
          font-family: monospace;
          font-size: 85%;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 1rem;
        }
        table, th, td {
          border: 1px solid #ddd;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  
  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  console.log('Successfully generated PDF at', pdfPath);
}

convert().catch(console.error);
