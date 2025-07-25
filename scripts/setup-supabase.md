# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `charisma-ai`
5. Enter database password (save this!)
6. Select region closest to your users
7. Click "Create new project"

## 2. Get Connection Details

Once your project is created:

1. Go to **Settings > Database**
2. Copy the connection string under "Connection string"
3. Go to **Settings > API**
4. Copy the Project URL
5. Copy the `Publishable key` (safe to use in browser)
6. Copy the `Secret key` (for server-side operations)

## 3. Update Environment Variables

Replace the placeholders in your `.env` file:

```env
# Replace [YOUR-PASSWORD] with your database password
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.ygcwemzthczwwvrojebt.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.ygcwemzthczwwvrojebt.supabase.co:5432/postgres"

# Replace with your actual values from Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://ygcwemzthczwwvrojebt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-PUBLISHABLE-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SECRET-KEY]
```

## 4. Run Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Optional: Seed your database
npm run seed:modules
```

## 5. Verify Connection

```bash
npm run verify-setup
```

## 6. Deploy to Vercel

Add the same environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all the environment variables from your `.env` file

## Notes

- The `DATABASE_URL` uses pgbouncer for connection pooling (recommended for serverless)
- The `DIRECT_URL` is used for migrations and schema changes
- Keep your `Secret key` secret - it has admin privileges
- The `Publishable key` is safe to use in client-side code