# Job Navigator - AI-Powered Lead Enrichment Platform

A Next.js application for enriching LinkedIn leads with contact information, inferring organizational hierarchies, and generating personalized outreach emails using AI.

## Features

- 📊 **CSV Upload**: Import LinkedIn leads from CSV files
- 🔍 **Lead Enrichment**: Automatically find emails, phone numbers, and company information via Ciro API
- 🤖 **AI Hierarchy Analysis**: Infer organizational structures and seniority levels using Claude AI
- 📧 **Email Generation**: Create personalized outreach emails for each lead
- 📈 **Visualization**: Interactive D3.js hierarchy maps showing company structure
- 📝 **Notes Management**: Add and track notes for each lead
- 🎯 **Outreach Tracking**: Monitor email status and engagement

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Anthropic Claude API
- **Enrichment**: Ciro API
- **Visualization**: D3.js
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- API keys for:
  - Claude API
  - Ciro API (optional - will use mock data if not provided)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-navigator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/job_navigator"
CLAUDE_API_KEY="your-claude-api-key"
CIRO_API_KEY="your-ciro-api-key" # Optional
```

4. Set up the database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Upload Leads**: Go to the home page and upload a CSV file with LinkedIn leads
2. **View Dashboard**: Navigate to the dashboard to see all uploaded leads
3. **Enrich Leads**: Click "Enrich" or "Enrich All" to fetch contact information
4. **View Hierarchy**: Select a lead to see the organizational hierarchy visualization
5. **Generate Emails**: Click "Generate Email" to create personalized outreach
6. **Add Notes**: Track your interactions and add notes for each lead

## CSV Format

The CSV file should include the following columns:
- First Name / firstName
- Last Name / lastName
- Title / Position (optional)
- Company / Organization
- LinkedIn URL (optional)

See `sample-leads.csv` for an example.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Database Setup

For production, use Vercel Postgres or Supabase:

**Vercel Postgres:**
```bash
npm i @vercel/postgres
```

Update `DATABASE_URL` in Vercel environment variables.

**Supabase:**
1. Create a project at [supabase.com](https://supabase.com)
2. Copy the connection string
3. Update `DATABASE_URL` in your environment

## API Endpoints

- `POST /api/uploadCSV` - Upload and parse CSV file
- `POST /api/enrichLead` - Enrich a single lead
- `GET /api/enrichLead` - Batch enrich multiple leads
- `GET /api/leads` - Fetch all leads
- `POST /api/sendEmail` - Generate email for a lead
- `GET /api/notes` - Get notes for a lead
- `POST /api/notes` - Add a note

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `CLAUDE_API_KEY` | Claude API key for AI features | Yes |
| `CIRO_API_KEY` | Ciro API key for lead enrichment | No |

## Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
