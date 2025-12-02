# Job Navigator App - Testing Guide

## 🚀 Your prototype is running at http://localhost:3000

### Quick Start Testing

1. **Open the Application**
   - Open your browser and go to: http://localhost:3000
   - You should see the Job Navigator landing page

2. **Upload Sample Data**
   - Click "Upload CSV" button on the homepage
   - Select the `sample-leads.csv` file (already in your project folder)
   - The file contains 10 test leads with various connection degrees:
     - 3 First-degree connections (green badges)
     - 5 Second-degree connections (yellow badges)  
     - 2 Third-degree connections (gray badges)

3. **View Dashboard**
   - After upload, click "Go to Dashboard" or navigate to http://localhost:3000/dashboard
   - You'll see the enriched leads table with:
     - Color-coded connection badges
     - Lead information (name, title, company, location)
     - Enrichment status indicators

### Features to Test

#### 📊 Lead Table Features
- **Sorting**: Click column headers to sort by connection degree, name, company, etc.
- **Filtering**: Use the connection degree filter dropdown
- **Search**: Type in the search box to filter leads
- **Connection Stats**: View the breakdown of 1st/2nd/3rd connections

#### 📧 Lead Actions
- **View Details**: Click on a lead to see full details
- **Add Notes**: Click "Add Note" button to track outreach progress
- **Email Preview**: View generated email templates (mock data if APIs not configured)
- **Copy Email**: Copy generated emails to clipboard

#### 🔗 API Integration (Optional)
If you want to test with real API data:

1. **Configure Ciro API** (for email/phone enrichment):
   ```bash
   # Add to .env file:
   CIRO_API_KEY="your-ciro-api-key"
   ```

2. **Configure Claude API** (for hierarchy inference & email generation):
   ```bash
   # Add to .env file:
   CLAUDE_API_KEY="your-claude-api-key"
   ```

3. **Restart the server** after adding API keys:
   ```bash
   # Stop server (Ctrl+C) then:
   npm run dev
   ```

### Sample Test Flow

1. Upload `sample-leads.csv`
2. Go to Dashboard
3. Filter by "1st degree" connections (should show 3 leads)
4. Click on "Sarah Johnson" (VP of Sales)
5. Add a note: "Initial outreach sent"
6. View the generated email template
7. Copy email to clipboard
8. Return to dashboard and check enrichment status

### Database Check

View your data in the SQLite database:
```bash
# Check lead count
sqlite3 dev.db "SELECT COUNT(*) FROM Lead;"

# View all leads
sqlite3 dev.db "SELECT name, connectionDegree, enrichmentStatus FROM Lead;"

# View notes
sqlite3 dev.db "SELECT * FROM Note;"
```

### Troubleshooting

**If upload fails:**
- Check browser console for errors (F12)
- Ensure CSV format matches the sample
- Check server logs in terminal

**If enrichment shows "pending":**
- This is normal without API keys
- Mock data is used when APIs aren't configured

**To reset database:**
```bash
rm dev.db
npm run dev
# This will recreate an empty database
```

### What's Working

✅ CSV file upload and parsing
✅ Lead storage in SQLite database  
✅ Dashboard with connection degree visualization
✅ Color-coded badges (1st=green, 2nd=yellow, 3rd=gray)
✅ Note-taking functionality
✅ Mock data generation when APIs not configured
✅ Responsive UI with Tailwind CSS
✅ TypeScript type safety throughout

### Next Steps

1. Configure real API keys for production enrichment
2. Deploy to Vercel with PostgreSQL
3. Add authentication if needed
4. Customize email templates
5. Add bulk actions for multiple leads

---

**Server is running at:** http://localhost:3000
**Sample data:** `/job-navigator/sample-leads.csv` (10 test leads)
**Database:** SQLite (`dev.db`) for local testing