# Vercel Deployment Guide

## Prerequisites
- A [Vercel account](https://vercel.com/signup)
- A [Supabase account](https://supabase.com/) (for the PostgreSQL database)
- [Privy account](https://privy.io/) for authentication
- [OpenAI API key](https://platform.openai.com/)
- [Solana RPC URL](https://docs.solana.com/cluster/rpc-endpoints) from providers like Helius, QuickNode, etc.

## Step 1: Set Up Supabase Database
1. Create a new Supabase project
2. Get your PostgreSQL connection string from Supabase dashboard
3. Run database migrations on your local machine:
   ```
   pnpm db:generate
   pnpm db:migrate
   ```

## Step 2: Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

## Step 3: Deploy to Vercel
### Option 1: Using the Vercel Dashboard
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" > "Project"
4. Import your Git repository
5. Configure the project:
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
6. Set up environment variables (see below)
7. Click "Deploy"

### Option 2: Using Vercel CLI
```bash
vercel
```

### Option 3: Using GitHub Actions (Automated Deployment)
This project includes a GitHub Actions workflow file (`.github/workflows/deploy.yml`) that automatically deploys to Vercel when you push to the main branch.

To set up automated deployments:

1. Create a Vercel API token:
   - Go to your Vercel account settings
   - Navigate to "Tokens"
   - Create a new token with "Full Account" scope
   - Copy the token

2. Add the token to your GitHub repository:
   - Go to your GitHub repository
   - Navigate to "Settings" > "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `VERCEL_TOKEN`
   - Value: [paste your Vercel API token]
   - Click "Add secret"

3. Push to the main branch to trigger a deployment

## Step 4: Environment Variables
Add these environment variables in Vercel:

| Variable               | Description                        |
|------------------------|------------------------------------|
| OPENAI_API_KEY         | Your OpenAI API key                |
| VITE_OPENAI_API_KEY    | Same OpenAI API key for client     |
| VITE_PRIVY_CLIENT_ID   | Privy client ID                    |
| VITE_PRIVY_APP_ID      | Privy app ID                      |
| PRIVY_APP_SECRET       | Privy app secret                  |
| POSTGRES_URL           | Supabase PostgreSQL connection URL |
| VITE_RPC_URL           | Solana RPC URL (from Helius, QuickNode, etc.) |

## Step 5: Solana-Specific Considerations
1. **RPC Endpoint Configuration**:
   - Ensure your VITE_RPC_URL points to a reliable Solana RPC provider with sufficient rate limits
   - For production, consider paid RPC providers like Helius, QuickNode, or Alchemy for better reliability

2. **Node Polyfills**:
   - This project already has the necessary Node.js polyfills configured in app.config.ts
   - The vercel.json configuration handles this correctly with the existing buildCommand

3. **CORS Considerations**:
   - If you're making cross-domain RPC requests, ensure your RPC provider allows CORS from your Vercel domain

4. **Client-Side Security**:
   - Remember that all client-side secrets (including RPC URLs) will be visible to users
   - Use Privy for secure wallet connections as already implemented in this project

## Step 6: Verify Deployment
1. After deployment completes, Vercel will provide a URL to your deployed application
2. Test the application functionality to ensure everything works correctly
3. Verify Solana transactions are working correctly on the deployed version

## Troubleshooting
- If you encounter any build errors, check the Vercel deployment logs
- Ensure all environment variables are correctly set
- Check that the database connection is working properly
- Verify that your Privy and OpenAI configurations are correct
- For Solana-specific issues, check browser console for any RPC connection errors
