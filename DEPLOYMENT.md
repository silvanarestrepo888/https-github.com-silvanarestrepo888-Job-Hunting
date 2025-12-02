# Deployment Guide

## Vercel Deployment

This application is configured to deploy on Vercel without requiring any external API keys.

### Features Without API Keys

When deployed without API keys, the app will:
- ✅ Store and manage lead data
- ✅ Import CSV files
- ✅ Display lead information in tables and maps
- ✅ Add and view notes
- ✅ Generate mock email templates
- ✅ Provide mock contact enrichment data

### Optional API Keys

If you want to enable real data enrichment and AI features, you can add these environment variables in Vercel:

1. **CIRO_API_KEY** - For real contact enrichment
2. **ANTHROPIC_API_KEY** or **CLAUDE_API_KEY** - For AI-powered email generation
3. **RESEND_API_KEY** - For sending actual emails

### How to Add Environment Variables (Optional)

1. Go to your Vercel project dashboard
2. Click on "Settings" → "Environment Variables"
3. Add any of the optional API keys
4. Redeploy your application

### Database

The application uses SQLite by default, which works perfectly for Vercel deployment without any configuration needed.

## The App Works Without API Keys!

You don't need to add any API keys for the app to function. It will automatically use mock data when API keys are not present.