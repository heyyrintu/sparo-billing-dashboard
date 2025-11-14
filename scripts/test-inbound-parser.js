const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { parseInboundExcel } = require('../lib/parser/parseInbound');

const filePath = path.join(__dirname, '..', 'PIPO  BIBO Inbound MIS Report-Spario 25 (2) (1).xlsx');

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

console.log('Testing inbound parser with actual Excel file...\n');

try {
  const buffer = fs.readFileSync(filePath);
  const result = parseInboundExcel(buffer);
  
  console.log(`✅ Parsed ${result.validRows.length} valid rows`);
  console.log(`❌ Rejected ${result.rejectedRows.length} rows\n`);
  
  if (result.validRows.length > 0) {
    console.log('=== Sample Parsed Data (First 5 rows) ===');
    result.validRows.slice(0, 5).forEach((row, idx) => {
      console.log(`\nRow ${idx + 1}:`);
      console.log(`  Received Date: ${row.receivedDate.toISOString().split('T')[0]}`);
      console.log(`  Invoice No: ${row.invoiceNo || 'N/A'}`);
      console.log(`  Invoice Value: ${row.invoiceValue}`);
      console.log(`  Invoice Qty: ${row.invoiceQty}`);
      console.log(`  Boxes: ${row.boxes}`);
      console.log(`  Type: ${row.type || 'N/A'}`);
    });
    
    console.log('\n=== Summary Totals ===');
    const totals = result.validRows.reduce((acc, row) => ({
      invoiceCount: acc.invoiceCount + (row.invoiceNo ? 1 : 0),
      invoiceValue: acc.invoiceValue + Number(row.invoiceValue),
      invoiceQty: acc.invoiceQty + Number(row.invoiceQty),
      boxes: acc.boxes + Number(row.boxes)
    }), {
      invoiceCount: 0,
      invoiceValue: 0,
      invoiceQty: 0,
      boxes: 0
    });
    
    console.log(`Total Invoice Count: ${totals.invoiceCount}`);
    console.log(`Total Invoice Value: ${totals.invoiceValue.toLocaleString('en-IN')}`);
    console.log(`Total Invoice Qty: ${totals.invoiceQty.toLocaleString('en-IN')}`);
    console.log(`Total Boxes: ${totals.boxes.toLocaleString('en-IN')}`);
  }
  
  if (result.rejectedRows.length > 0) {
    console.log('\n=== Rejected Rows (First 5) ===');
    result.rejectedRows.slice(0, 5).forEach((rejected) => {
      console.log(`Row ${rejected.rowNumber}: ${rejected.reason}`);
    });
  }
  
} catch (error) {
  console.error('Error parsing file:', error.message);
  console.error(error.stack);
}

