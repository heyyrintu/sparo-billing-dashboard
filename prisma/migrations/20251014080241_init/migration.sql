-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "outbound_fact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNo" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "dispatchedDate" DATETIME,
    "partyName" TEXT,
    "invoiceQty" DECIMAL NOT NULL,
    "boxes" DECIMAL NOT NULL,
    "grossTotal" DECIMAL NOT NULL,
    "sourceFile" TEXT NOT NULL,
    "sourceChecksum" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "inbound_fact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receivedDate" DATETIME NOT NULL,
    "partyName" TEXT,
    "invoiceQty" DECIMAL NOT NULL,
    "boxes" DECIMAL NOT NULL,
    "type" TEXT,
    "articleNo" TEXT,
    "sourceFile" TEXT NOT NULL,
    "sourceChecksum" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "daily_summary" (
    "day" DATETIME NOT NULL PRIMARY KEY,
    "outboundInvoices" INTEGER NOT NULL,
    "outboundQty" DECIMAL NOT NULL,
    "outboundBoxes" DECIMAL NOT NULL,
    "grossSale" DECIMAL NOT NULL,
    "inboundQty" DECIMAL NOT NULL,
    "inboundBoxes" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "monthly_revenue" (
    "month" DATETIME NOT NULL PRIMARY KEY,
    "grossSale" DECIMAL NOT NULL,
    "revenueMarginal" DECIMAL NOT NULL,
    "revenueFlat" DECIMAL NOT NULL,
    "calcMode" TEXT NOT NULL DEFAULT 'marginal',
    "lastRecalcAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "upload_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "outbound_fact_invoiceNo_invoiceDate_key" ON "outbound_fact"("invoiceNo", "invoiceDate");
