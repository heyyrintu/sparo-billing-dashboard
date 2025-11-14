# Rejected Rows - Reasons and Solutions

This document explains why rows are rejected during Excel file uploads and how to fix them.

## Overview

Rows can be rejected for several reasons during upload validation. Rejected rows are stored in the database and can be downloaded as an Excel file for review.

## Common Rejection Reasons

### 1. **Empty or Blank Rows**

**Reason:**
- `Empty row` - Row has no data at all
- `Blank row (all cells empty)` - Row exists but all cells are empty

**Solution:**
- Remove empty rows from your Excel file before uploading
- Ensure there are no blank rows between data rows

---

### 2. **Missing Required Columns**

**Reason:**
- `Required column not found: [column_name]`

**For OUTBOUND files, required columns are:**
- **Invoice No** (also accepts: Invoice Number, Invoice No.)
- **Invoice Qty** (also accepts: Quantity, Qty, Invoice Quantity)
- **No. of Box** (also accepts: Boxes, Box Count, No of Boxes)
- **Invoice Gross Total Value** (also accepts: Gross Total, Total Value, Total, Invoice Gross Total)

**For INBOUND files, required columns are:**
- **Invoice Qty** (also accepts: Quantity, Qty, Invoice Quantity)
- **Bags/Box** (also accepts: Boxes, No of Boxes, Box Count)

**Solution:**
- Ensure your Excel file has the correct sheet name:
  - Outbound: Sheet should contain "Outward" or "MIS" in the name
  - Inbound: Sheet should contain "Inward", "Inbound", "PIPO", "BIBO", or "Received" in the name
- Check that column names match exactly (case-insensitive) or use the alternate names listed above
- Ensure headers are in the first row

---

### 3. **Missing Required Fields**

**Reason:**
- `Missing required fields (Invoice No, Invoice Qty, Boxes, or Gross Total)` - For Outbound
- `Missing required fields (Invoice Qty or Boxes)` - For Inbound

**Solution:**
- Ensure all required fields have values (cannot be empty or null)
- Check that cells are not empty, contain only spaces, or have formulas returning empty values

---

### 4. **Validation Errors**

**Reason:**
- `Validation error: [specific error message]`

**Common validation errors:**

#### For OUTBOUND Files:
- `Invoice No is required` - Invoice Number field is empty or missing
- `Invoice Qty must be non-negative` - Quantity is negative number
- `Boxes must be non-negative` - Box count is negative number
- `Gross Total must be non-negative` - Gross total amount is negative

#### For INBOUND Files:
- `Invoice Qty must be non-negative` - Quantity is negative number
- `Boxes must be non-negative` - Box count is negative number

**Solution:**
- Ensure all numeric fields contain valid numbers (not text)
- Remove negative values or fix data entry errors
- Check for hidden characters or formatting issues in cells
- Ensure dates are in valid format (Excel date format is automatically handled)

---

### 5. **Duplicate Invoices (Outbound Only)**

**Reason:**
- `Duplicate invoice (replaced by row [row_number])` - Same invoice number and date already exists

**Solution:**
- Remove duplicate invoice entries from your Excel file
- Note: If duplicates exist, only the latest row (by position in file) is kept

---

### 6. **Invalid Data Types**

**Reason:**
- Numbers stored as text
- Dates in invalid format
- Empty cells that should contain numbers

**Solution:**
- Convert text numbers to actual numbers in Excel
- Use Excel's date format for date columns
- Fill in all required numeric fields

---

### 7. **Column Mapping Errors**

**Reason:**
- Column names don't match expected variations

**Solution:**
- Use these exact column name variations:

**Outbound Column Name Variations:**
- Invoice No: `invoice_no`, `invoice_number`, `invoice no`, `invoiceno`, `invoice no.`
- Invoice Date: `invoice_date`, `invoice date`, `invoicedate`, `date`, `inv date`
- Invoice Qty: `invoice_qty`, `invoice qty`, `invoiceqty`, `quantity`, `qty`
- No. of Box: `boxes`, `no_of_box`, `no of box`, `noofbox`, `box_count`
- Gross Total: `invoice_gross_total_value`, `invoice gross total value`, `gross_total`, `gross total`, `total`

**Inbound Column Name Variations:**
- Received Date: `grn_date`, `grn date`, `received_date`, `received date`, `date`, `received`
- Invoice Qty: `invoice_qty`, `invoice qty`, `quantity`, `qty`, `invoice_quantity`
- Boxes: `boxes`, `no_of_boxes`, `no of boxes`, `box_count`, `bags/box`, `bags`

---

## How to View Rejected Rows

1. After uploading a file, check the upload status
2. If rows were rejected, you'll see the count in the upload log
3. Access rejected rows via:
   - API: `GET /api/rejected-rows?uploadId=[upload_id]`
   - Download Excel: `GET /api/rejected-rows/[upload_id]` (returns Excel file)

## Best Practices to Avoid Rejections

1. **Template Check:**
   - Use the standard template format
   - Ensure first row contains headers
   - Remove empty rows

2. **Data Validation:**
   - Verify all required columns exist
   - Check that numeric fields contain actual numbers
   - Ensure dates are in valid Excel date format

3. **File Preparation:**
   - Remove formulas and paste as values if needed
   - Clear any formatting that might affect parsing
   - Ensure sheet names match expected patterns

4. **Testing:**
   - Upload a small test file first
   - Review rejected rows to understand format issues
   - Fix issues and re-upload

## Example Error Messages

```
"Validation error: Invoice Qty must be non-negative"
"Missing required fields (Invoice No, Invoice Qty, Boxes, or Gross Total)"
"Empty row"
"Blank row (all cells empty)"
"Duplicate invoice (replaced by row 45)"
"Required column not found: invoice_qty. Available columns: Invoice No, Date, Qty"
```

## Troubleshooting

If you're seeing unexpected rejections:

1. **Check the row data** - Download rejected rows Excel to see actual data
2. **Verify column names** - Ensure they match expected variations
3. **Check data types** - Numbers should be numbers, not text
4. **Review validation rules** - See validation.ts for exact rules
5. **Check file encoding** - Use UTF-8 encoded Excel files

## Support

For additional help with rejected rows:
- Review the rejected rows Excel download
- Check server logs for detailed error messages
- Ensure your file format matches the documented requirements

