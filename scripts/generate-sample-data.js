const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Generate sample outbound data
function generateOutboundData() {
  const data = [];
  const parties = ['ABC Corp', 'XYZ Ltd', 'DEF Industries', 'GHI Trading', 'JKL Enterprises'];
  const transporters = ['FastTrack Logistics', 'QuickMove Transport', 'Reliable Cargo'];
  const destinations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-03-31');
  
  for (let i = 1; i <= 100; i++) {
    const invoiceDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    const dispatchedDate = new Date(invoiceDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000); // 0-3 days later
    
    const invoiceQty = Math.floor(Math.random() * 1000) + 10;
    const boxes = Math.floor(invoiceQty / 10) + Math.floor(Math.random() * 5);
    const grossTotal = invoiceQty * (Math.random() * 500 + 100); // 100-600 per unit
    
    data.push({
      'Invoice No.': `INV${String(i).padStart(6, '0')}`,
      'Invoice Date': invoiceDate.toISOString().split('T')[0],
      'Dispatched Date': dispatchedDate.toISOString().split('T')[0],
      'Party Name': parties[Math.floor(Math.random() * parties.length)],
      'Invoice Qty': invoiceQty,
      'No. of Box': boxes,
      'Invoice Gross Total Value': Math.round(grossTotal),
      'Transporter': transporters[Math.floor(Math.random() * transporters.length)],
      'Destination': destinations[Math.floor(Math.random() * destinations.length)]
    });
  }
  
  return data;
}

// Generate sample inbound data
function generateInboundData() {
  const data = [];
  const parties = ['Supplier A', 'Supplier B', 'Supplier C', 'Vendor X', 'Vendor Y'];
  const types = ['Raw Material', 'Finished Goods', 'Components', 'Packaging'];
  const articleNos = ['ART001', 'ART002', 'ART003', 'ART004', 'ART005'];
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-03-31');
  
  for (let i = 1; i <= 80; i++) {
    const receivedDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    
    const invoiceQty = Math.floor(Math.random() * 500) + 5;
    const boxes = Math.floor(invoiceQty / 8) + Math.floor(Math.random() * 3);
    
    data.push({
      'Received Date': receivedDate.toISOString().split('T')[0],
      'Party Name': parties[Math.floor(Math.random() * parties.length)],
      'Invoice Quantity': invoiceQty,
      'Bags/Box': boxes,
      'Type': types[Math.floor(Math.random() * types.length)],
      'Article No': articleNos[Math.floor(Math.random() * articleNos.length)]
    });
  }
  
  return data;
}

// Create sample data directory
const sampleDataDir = path.join(__dirname, '..', 'sample-data');
if (!fs.existsSync(sampleDataDir)) {
  fs.mkdirSync(sampleDataDir, { recursive: true });
}

// Generate outbound Excel file
const outboundData = generateOutboundData();
const outboundWorkbook = XLSX.utils.book_new();
const outboundWorksheet = XLSX.utils.json_to_sheet(outboundData);
XLSX.utils.book_append_sheet(outboundWorkbook, outboundWorksheet, 'Outward MIS');
XLSX.writeFile(outboundWorkbook, path.join(sampleDataDir, 'outbound-sample.xlsx'));

// Generate inbound Excel file
const inboundData = generateInboundData();
const inboundWorkbook = XLSX.utils.book_new();
const inboundWorksheet = XLSX.utils.json_to_sheet(inboundData);
XLSX.utils.book_append_sheet(inboundWorkbook, inboundWorksheet, 'PIPO & BIBO Inward');
XLSX.writeFile(inboundWorkbook, path.join(sampleDataDir, 'inbound-sample.xlsx'));

console.log('Sample Excel files generated successfully!');
console.log('Outbound sample:', path.join(sampleDataDir, 'outbound-sample.xlsx'));
console.log('Inbound sample:', path.join(sampleDataDir, 'inbound-sample.xlsx'));
