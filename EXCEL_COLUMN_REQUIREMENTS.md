# Excel File Column Requirements

## Inbound MIS (PIPO & BIBO Inward Sheet)

### Required Columns (Must be present):
1. **Invoice Qty** - Total invoice quantity
   - Accepted column names: "Invoice Qty", "Invoice Quantity", "Quantity", "Qty", "Invoice", "Invoices"
   
2. **Bags/Box** - Number of bags or boxes
   - Accepted column names: "Bags/Box", "Bags Box", "Boxes", "No of Boxes", "No. of Box", "Box Count", "Bags", "Bag", "Box"

### Important Columns for Sorting:
- **GRN Date** - Date for sorting and grouping records (IMPORTANT!)
  - Accepted column names: "GRN Date", "GRN_Date", "Received Date", "Date", "Received", "Inward Date"
  - Accepted date formats: "19-10-2024" (DD-MM-YYYY), "10/19/2024" (MM/DD/YYYY), or Excel date numbers
  - Defaults to current date if not found

### Optional Columns:
- **Party Name** - Customer/Supplier name
- **Type** - Item type or category
- **Article No** - SKU or item code

---

## Outbound MIS (Outward MIS Sheet)

### Required Columns (Must be present):
1. **Invoice No.** - Unique invoice number
   - Accepted column names: "Invoice No.", "Invoice No", "Invoice Number", "Invoice_No"
   
2. **Invoice Qty** - Total invoice quantity
   - Accepted column names: "Invoice Qty", "Invoice Quantity", "Quantity", "Qty"
   
3. **No. of Box** - Number of boxes
   - Accepted column names: "No. of Box", "No of Box", "Boxes", "Box", "No of Boxes", "Box Count"
   
4. **Invoice Gross Total Value** - Total invoice amount for revenue calculation
   - Accepted column names: "Invoice Gross Total Value", "Invoice Gross Total", "Gross Total", "Total Value", "Total", "Gross"

### Important Columns for Sorting:
- **Invoice Date** - Date for sorting and grouping records (IMPORTANT!)
  - Accepted column names: "Invoice Date", "Date", "Inv Date"
  - Accepted date formats: "19-10-2024" (DD-MM-YYYY), "10/19/2024" (MM/DD/YYYY), or Excel date numbers
  - Defaults to current date if not found

### Optional Columns:
- **Dispatched Date** - Date of dispatch
- **Party Name** - Customer name

---

## KPI Card Calculations

### Inbound Card:
- **Invoice Qty**: Sum of all "Invoice Qty" values in the date range
- **Boxes**: Sum of all "Bags/Box" values in the date range

### Outbound Card:
- **Unique Invoices**: Count of unique "Invoice No." values in the date range
- **Invoice Qty**: Sum of all "Invoice Qty" values in the date range
- **Boxes**: Sum of all "No. of Box" values in the date range

### Revenue Card:
- **Total Revenue**: Sum of all "Invoice Gross Total Value" from Outbound MIS in the date range

---

## Important Notes:

1. **Column name matching is case-insensitive** - "Invoice Qty", "invoice qty", and "INVOICE QTY" will all work
2. **Spaces and special characters are flexible** - "Invoice Qty" and "Invoice_Qty" will both work
3. **The parser will log available columns** in the console if it can't find required columns
4. **Blank rows are automatically skipped**
5. **If a date column is missing**, the system will use the current date as default
6. **Duplicate invoice numbers** in Outbound will be deduplicated (latest entry wins)

## Troubleshooting:

If you get "No valid data rows found in Excel file":
1. Check the server console - it will show all available column names
2. Make sure your Excel headers match one of the accepted column names above
3. Ensure your Excel file has the correct sheet name:
   - Inbound: Sheet name should contain "inward", "inbound", "pipo", or "bibo"
   - Outbound: Sheet name should contain "outward", "outbound", or "mis"
