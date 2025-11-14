# Columns Used for Calculations

This document explains which Excel columns are used for calculations in the billing dashboard.

## 📊 OUTBOUND Calculations (Outward MIS)

### Columns Used in Calculations:

#### 1. **Invoice Gross Total Value** (`grossTotal`)
- **Excel Column Names Accepted:**
  - `invoice_gross_total_value`
  - `invoice gross total value`
  - `gross_total`
  - `gross total`
  - `grosstotal`
  - `total_value`
  - `total value`
  - `total`
  - `invoice gross total`
  - `gross`

- **Used For:**
  - ✅ **Gross Sale** - Sum of all `grossTotal` values (PRIMARY CALCULATION)
  - ✅ **Revenue Calculation** - Revenue is calculated based on monthly gross sale
  - ✅ **Average Ticket** - Average per invoice = Gross Sale ÷ Invoice Count
  - ✅ **Gross Per Unit** - Gross Sale ÷ Invoice Quantity

#### 2. **Invoice Quantity** (`invoiceQty`)
- **Excel Column Names Accepted:**
  - `invoice_qty`
  - `invoice qty`
  - `invoiceqty`
  - `quantity`
  - `qty`
  - `invoice quantity`
  - `invoice_quantity`

- **Used For:**
  - ✅ **Total Invoice Quantity** - Sum of all quantities
  - ✅ **Gross Per Unit** - Gross Sale ÷ Invoice Quantity
  - ✅ **KPIs** - Displayed as Invoice Qty metric

#### 3. **No. of Box** (`boxes`)
- **Excel Column Names Accepted:**
  - `boxes`
  - `no_of_box`
  - `no of box`
  - `noofbox`
  - `box_count`
  - `no. of box`
  - `no.of box`
  - `box`
  - `no of boxes`

- **Used For:**
  - ✅ **Total Boxes** - Sum of all boxes
  - ✅ **KPIs** - Displayed as Boxes metric
  - ✅ **Daily aggregations**

#### 4. **Invoice Date** (`invoiceDate`)
- **Excel Column Names Accepted:**
  - `invoice_date`
  - `invoice date`
  - `invoicedate`
  - `date`
  - `inv date`
  - `inv_date`

- **Used For:**
  - ✅ **Date Filtering** - All calculations are filtered by date range
  - ✅ **Daily Aggregation** - Data grouped by day
  - ✅ **Monthly Revenue Calculation** - Monthly gross sale calculation
  - ✅ **Deduplication** - Unique key: `(invoiceNo, invoiceDate)`

#### 5. **Invoice No** (`invoiceNo`)
- **Excel Column Names Accepted:**
  - `invoice_no`
  - `invoice_number`
  - `invoice no`
  - `invoiceno`
  - `invoice no.`
  - `invoice_no.`

- **Used For:**
  - ✅ **Invoice Count** - Count of unique invoices = Number of rows
  - ✅ **Deduplication** - Unique key: `(invoiceNo, invoiceDate)`
  - ✅ **Average Ticket** - Gross Sale ÷ Invoice Count

### Columns NOT Used in Calculations (Information Only):

- ❌ **Dispatched Date** - Stored but not used in calculations
- ❌ **Party Name** - Stored but not used in calculations

---

## 📥 INBOUND Calculations (PIPO & BIBO Inward)

### Columns Used in Calculations:

#### 1. **Invoice Quantity** (`invoiceQty`)
- **Excel Column Names Accepted:**
  - `invoice_qty`
  - `invoice qty`
  - `invoiceqty`
  - `quantity`
  - `qty`
  - `invoice_quantity`
  - `invoice quantity`
  - `invoice`
  - `invoices`

- **Used For:**
  - ✅ **Total Inbound Quantity** - Sum of all quantities
  - ✅ **KPIs** - Displayed in Inbound KPIs
  - ✅ **Daily aggregations**

#### 2. **Bags/Box** (`boxes`)
- **Excel Column Names Accepted:**
  - `boxes`
  - `no_of_boxes`
  - `no of boxes`
  - `noofboxes`
  - `box_count`
  - `no_of_box`
  - `no of box`
  - `bags/box`
  - `bags_box`
  - `bags box`
  - `bags`
  - `bag`

- **Used For:**
  - ✅ **Total Inbound Boxes** - Sum of all boxes
  - ✅ **KPIs** - Displayed in Inbound KPIs
  - ✅ **Daily aggregations**

#### 3. **Received Date** (`receivedDate`)
- **Excel Column Names Accepted:**
  - `grn_date`
  - `grn date`
  - `grndate`
  - `received_date`
  - `received date`
  - `receiveddate`
  - `date`
  - `received`
  - `inward date`
  - `inwarddate`

- **Used For:**
  - ✅ **Date Filtering** - All calculations are filtered by date range
  - ✅ **Daily Aggregation** - Data grouped by day

### Columns NOT Used in Calculations (Information Only):

- ❌ **Party Name** - Stored but not used in calculations
- ❌ **Type** - Stored but not used in calculations
- ❌ **Article No** - Stored but not used in calculations

---

## 🧮 Calculation Formulas

### Revenue Calculation (PRIMARY)

Revenue is calculated **ONLY from Outbound Gross Sale**:

```
Revenue = f(Monthly Gross Sale)

Where Monthly Gross Sale = Sum of all grossTotal for the month
```

#### Marginal Mode (Progressive):
- 0-5 cr → 1.75%
- 5-8 cr → 1.65%
- 8-11 cr → 1.55%
- 11-14 cr → 1.45%
- 14-17 cr → 1.35%
- 17-20 cr → 1.25%
- >20 cr → 1.15%

Applied progressively to each slab.

#### Flat Mode:
Single rate based on total monthly gross sale bracket.

### KPI Metrics Calculation

#### Gross Sale
```
Gross Sale = Sum of all outbound grossTotal (gross_total column)
```

#### Revenue
```
Revenue = Revenue Calculation Function(Monthly Gross Sale)
```

#### Invoice Count
```
Invoice Count = Count of outbound rows (number of invoices)
```

#### Invoice Qty
```
Invoice Qty = Sum of all outbound invoiceQty (quantity column)
```

#### Boxes
```
Boxes = Sum of all outbound boxes (boxes column)
```

#### Average Ticket
```
Average Ticket = Gross Sale ÷ Invoice Count
```

#### Gross Per Unit
```
Gross Per Unit = Gross Sale ÷ Invoice Qty
```

---

## 📋 Summary

### Outbound (REVENUE CALCULATIONS):
1. ✅ **Invoice Gross Total Value** → Gross Sale → Revenue
2. ✅ **Invoice Quantity** → Total Qty, Gross Per Unit
3. ✅ **No. of Box** → Total Boxes
4. ✅ **Invoice Date** → Date filtering, grouping
5. ✅ **Invoice No** → Invoice Count, Deduplication

### Inbound (DISPLAY ONLY):
1. ✅ **Invoice Quantity** → Total Inbound Qty
2. ✅ **Bags/Box** → Total Inbound Boxes
3. ✅ **Received Date** → Date filtering

### **IMPORTANT NOTES:**

- ⚠️ **Revenue is ONLY calculated from Outbound data**
- ⚠️ **Inbound data is NOT used for revenue calculations**
- ⚠️ **Gross Sale = Sum of `grossTotal` column from Outbound**
- ⚠️ **All calculations are date-filtered based on Invoice Date (Outbound) or Received Date (Inbound)**
- ⚠️ **Duplicate invoices (same Invoice No + Date) are deduplicated (latest row wins)**

---

## 🔍 Column Mapping Reference

### Outbound Required Columns:
| Database Field | Excel Column Name Variations | Used For Calculation? |
|---------------|------------------------------|----------------------|
| `grossTotal` | invoice_gross_total_value, gross_total, total | ✅ Yes - PRIMARY |
| `invoiceQty` | invoice_qty, quantity, qty | ✅ Yes |
| `boxes` | boxes, no_of_box, box_count | ✅ Yes |
| `invoiceDate` | invoice_date, date | ✅ Yes - Filtering |
| `invoiceNo` | invoice_no, invoice_number | ✅ Yes - Counting |

### Inbound Required Columns:
| Database Field | Excel Column Name Variations | Used For Calculation? |
|---------------|------------------------------|----------------------|
| `invoiceQty` | invoice_qty, quantity, qty | ✅ Yes |
| `boxes` | boxes, bags/box, box_count | ✅ Yes |
| `receivedDate` | grn_date, received_date, date | ✅ Yes - Filtering |

