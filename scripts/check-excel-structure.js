const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'PIPO  BIBO Inbound MIS Report-Spario 25 (2) (1).xlsx');

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

console.log('Reading Excel file:', filePath);
const workbook = XLSX.readFile(filePath);

console.log('\n=== Sheet Names ===');
workbook.SheetNames.forEach((name, idx) => {
  console.log(`${idx + 1}. "${name}"`);
});

// Find the target sheet
const targetSheetName = 'pipo & bibo inward';
const sheetName = workbook.SheetNames.find(
  (name) => name.trim().toLowerCase() === targetSheetName
);

if (!sheetName) {
  console.log('\n❌ Could not find "PIPO & BIBO Inward" sheet');
  console.log('Available sheets:', workbook.SheetNames);
  process.exit(1);
}

console.log(`\n=== Reading sheet: "${sheetName}" ===`);
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

if (jsonData.length < 2) {
  console.error('Excel file must contain at least a header row and one data row');
  process.exit(1);
}

// Get headers
const rawHeaders = jsonData[0];
const headers = rawHeaders.map(h => String(h || '').trim());

console.log('\n=== Column Headers (with positions) ===');
headers.forEach((header, idx) => {
  const colLetter = String.fromCharCode(65 + idx); // A, B, C, etc.
  console.log(`${colLetter.padStart(3)} (${String(idx).padStart(2)}): "${header}"`);
});

console.log('\n=== Expected Columns ===');
console.log('Column C (2): Received Date');
console.log('Column K (10): STN No./Invoice No.');
console.log('Column Q (16): Invoice Value');
console.log('Column R (17): Invoice Qty');
console.log('Column X (23): Bags/Box');

console.log('\n=== Actual Columns at Expected Positions ===');
const expectedPositions = {
  'C (2)': headers[2],
  'K (10)': headers[10],
  'Q (16)': headers[16],
  'R (17)': headers[17],
  'X (23)': headers[23]
};

Object.entries(expectedPositions).forEach(([pos, value]) => {
  console.log(`${pos}: "${value}"`);
});

console.log('\n=== Sample Data Row ===');
if (jsonData.length > 1) {
  const sampleRow = jsonData[1];
  console.log('Row 2 data:');
  headers.forEach((header, idx) => {
    if (sampleRow[idx] !== undefined && sampleRow[idx] !== null && sampleRow[idx] !== '') {
      console.log(`  ${header}: ${sampleRow[idx]}`);
    }
  });
}

console.log('\n=== Column Name Matching Test ===');
function normalizeColumnName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[./]/g, '_');
}

const columnMappings = {
  'received_date': ['grn_date', 'grn date', 'grndate', 'received_date', 'received date', 'receiveddate', 'date', 'received', 'inward date', 'inwarddate'],
  'invoice_no': ['stn_no./invoice_no.', 'stn_no./invoice_no', 'stn_no/invoice_no', 'stn_no_invoice_no', 'stn_no', 'invoice_no', 'invoice no', 'invoice_no.', 'invoice number', 'invoice_number', 'stn_invoice_no', 'stn no./invoice no.', 'stn no./invoice no', 'stn no/invoice no', 'stn no invoice no'],
  'invoice_value': ['invoice_value', 'invoice value', 'invoice_value_(rs)', 'invoice_value_in_inr', 'value', 'total_value', 'total value', 'invoice_total_value', 'invoice total value'],
  'invoice_qty': ['invoice_qty', 'invoice qty', 'invoiceqty', 'quantity', 'qty', 'invoice_quantity', 'invoice quantity', 'invoice', 'invoices'],
  'boxes': ['boxes', 'no_of_boxes', 'no of boxes', 'noofboxes', 'box_count', 'no_of_box', 'no of box', 'bags/box', 'bags_box', 'bags box', 'bags', 'bag']
};

Object.entries(columnMappings).forEach(([key, possibleNames]) => {
  const normalizedHeaders = headers.map(normalizeColumnName);
  let found = false;
  let foundIndex = -1;
  let foundName = '';
  
  for (const name of possibleNames) {
    const normalizedName = normalizeColumnName(name);
    const index = normalizedHeaders.indexOf(normalizedName);
    if (index !== -1) {
      found = true;
      foundIndex = index;
      foundName = headers[index];
      break;
    }
  }
  
  if (found) {
    const colLetter = String.fromCharCode(65 + foundIndex);
    console.log(`✅ ${key}: Found at ${colLetter} (${foundIndex}) as "${foundName}"`);
  } else {
    console.log(`❌ ${key}: NOT FOUND`);
    console.log(`   Looking for: ${possibleNames.slice(0, 3).join(', ')}...`);
  }
});

