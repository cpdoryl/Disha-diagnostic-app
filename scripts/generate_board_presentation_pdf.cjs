const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { marked } = require('marked');

async function generatePdf() {
  const mdPath = path.join(__dirname, '..', 'DISHA_FIRST_OPINION_BOARD_PRESENTATION.md');
  const pdfPath = path.join(__dirname, '..', 'public', 'DISHA_FIRST_OPINION_BOARD_PRESENTATION.pdf');

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const htmlBody = marked(mdContent);

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Disha First Opinion Engine - Board Presentation</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          padding: 40px;
          max-width: 900px;
          margin: 0 auto;
          background: #ffffff;
        }
        h1 {
          font-size: 26px;
          color: #0f172a;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 12px;
          margin-top: 0;
          font-weight: 800;
        }
        h2 {
          font-size: 20px;
          color: #1e3a8a;
          margin-top: 32px;
          border-bottom: 1.5px solid #e2e8f0;
          padding-bottom: 6px;
          font-weight: 700;
        }
        h3 {
          font-size: 16px;
          color: #2563eb;
          margin-top: 24px;
          font-weight: 700;
        }
        h4 {
          font-size: 14px;
          color: #334155;
          margin-top: 18px;
          font-weight: 600;
        }
        p, li {
          font-size: 13px;
          color: #334155;
        }
        ul, ol {
          padding-left: 20px;
        }
        code {
          font-family: 'JetBrains Mono', monospace;
          background-color: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          color: #0f172a;
        }
        pre {
          background-color: #0f172a;
          color: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          line-height: 1.45;
          border: 1px solid #334155;
        }
        pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f8fafc;
          color: #0f172a;
          font-weight: 700;
        }
        blockquote {
          border-left: 4px solid #2563eb;
          background-color: #eff6ff;
          margin: 16px 0;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
        }
        hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 28px 0;
        }
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      ${htmlBody}
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    printBackground: true
  });
  await browser.close();
  console.log(`[Success] Board presentation PDF generated at ${pdfPath}`);
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
