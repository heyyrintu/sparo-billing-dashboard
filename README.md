# Drona Logitech Billing Dashboard

A production-ready billing dashboard for processing Inbound and Outbound MIS Excel files, calculating tiered revenue, and visualizing KPIs with real-time analytics.

## Features

- **Excel File Processing**: Upload and parse Inbound/Outbound MIS files with automatic validation
- **Tiered Revenue Calculation**: Supports both marginal (progressive) and flat slab modes
- **Real-time KPIs**: Gross Sale, Revenue, Invoice Count, Quantities with delta calculations
- **Interactive Charts**: Daily trends with Recharts visualization
- **Data Freshness**: Track upload history and data currency
- **Secure Authentication**: NextAuth with admin role management
- **Production Ready**: Built for production deployment
- **Indian Formatting**: Currency and number formatting for Indian locale

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Charts**: Recharts
- **Authentication**: NextAuth.js
- **File Processing**: SheetJS (xlsx)
- **Deployment**: Vercel, Railway, or any Node.js hosting

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or remote)

### Environment Setup

1. Copy the environment file:
```bash
cp env.example .env.local
```

2. Update the environment variables in `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/spario_dashboard"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@dronalogitech.cloud"
ADMIN_PASSWORD="drona@12345"
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database and update `DATABASE_URL` in `.env.local`

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

5. Access the application at `http://localhost:3000`

## Default Credentials

- **Email**: admin@dronalogitech.cloud
- **Password**: drona@12345

## Excel File Format

### Outbound MIS (Required Sheet: "Outward MIS")

| Column | Description | Required |
|--------|-------------|----------|
| Invoice No | Invoice number | Yes |
| Invoice Date | Invoice date | Yes |
| Invoice Qty | Quantity | Yes |
| No. of Box | Number of boxes | Yes |
| Invoice Gross Total Value | Gross sale amount | Yes |
| Dispatched Date | Dispatch date | No |
| Party Name | Customer name | No |

### Inbound MIS (Required Sheet: "PIPO & BIBO Inward")

| Column | Description | Required |
|--------|-------------|----------|
| Received Date | Date of receipt | Yes |
| Invoice Quantity | Quantity received | Yes |
| No. of Boxes | Number of boxes | Yes |
| Party Name | Supplier name | No |
| Type | Item type | No |
| Article No | Article number | No |

## Revenue Calculation

The system supports two revenue calculation modes:

### Marginal Mode (Progressive)
Applies different rates to different portions of monthly gross sale:

- 0-5 cr → 1.75%
- 5-8 cr → 1.65%
- 8-11 cr → 1.55%
- 11-14 cr → 1.45%
- 14-17 cr → 1.35%
- 17-20 cr → 1.25%
- >20 cr → 1.15%

### Flat Mode
Applies a single rate based on the total monthly gross sale bracket.

## API Endpoints

- `POST /api/upload/inbound` - Upload inbound MIS file
- `POST /api/upload/outbound` - Upload outbound MIS file
- `GET /api/kpi` - Get KPI data for date range
- `GET /api/daily` - Get daily time series data
- `GET /api/healthz` - Health check endpoint

## Database Schema

The application uses PostgreSQL with the following main tables:

- `outbound_fact` - Outbound invoice data
- `inbound_fact` - Inbound receipt data
- `daily_summary` - Aggregated daily metrics
- `monthly_revenue` - Monthly revenue calculations
- `upload_log` - Upload history and audit trail
- `users` - User authentication

## Development

### Running Tests

```bash
npm test
```

### Code Formatting

```bash
npm run format
```

### Linting

```bash
npm run lint
```

## Production Deployment

1. Update environment variables for production
2. Use a production PostgreSQL database
3. Set up proper SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging
6. Configure automated backups

## Sample Data

The repository includes sample Excel files in the `sample-data/` directory for testing:

- `outbound-sample.xlsx` - Sample outbound MIS data
- `inbound-sample.xlsx` - Sample inbound MIS data

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and `DATABASE_URL` is correct
2. **File Upload**: Check file permissions and disk space
3. **Authentication**: Verify `NEXTAUTH_SECRET` is set
4. **Database Connection**: Ensure PostgreSQL is running and accessible

### Health Checks

- Application: `http://localhost:3000/api/healthz`
- Database: Check PostgreSQL connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.
