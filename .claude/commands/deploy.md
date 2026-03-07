# Deploy Workflow — np-kompass

## Deployment Target

- **Frontend**: Vercel (Next.js 16)
- **Database**: Supabase (PostgreSQL)
- **Domain**: Custom domain on Vercel

## Deploy Steps

### 1. Build Check
```bash
npm run build
```
Ensure no TypeScript or build errors before deploying.

### 2. Database Migrations
If there are new migrations in `supabase/migrations/`:
```bash
npx supabase db push
```
This applies all pending migrations to the remote Supabase database.

**Important**: Always push migrations BEFORE deploying frontend code, as new code may depend on schema changes.

### 3. Deploy to Vercel
```bash
npx vercel --prod
```
This deploys to production. The command will:
- Build the Next.js application
- Deploy to the production URL
- Apply environment variables from Vercel dashboard

### 4. Verify
After deployment:
- Check the live site loads correctly
- Verify new features work
- Check Supabase logs for any errors: `npx supabase inspect db logs`

## Environment Variables (Vercel Dashboard)

Required on Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_EMAILS=admin@example.com,user2@example.com,...
```

## Full Deploy Sequence (with migrations)

```bash
# 1. Ensure clean build
npm run build

# 2. Push database migrations first
npx supabase db push

# 3. Deploy frontend
npx vercel --prod
```

## Rollback

### Frontend
Vercel keeps all deployments. Rollback via Vercel dashboard or:
```bash
npx vercel rollback
```

### Database
Database migrations are **not easily reversible**. For critical issues:
1. Write a new migration that reverts changes
2. Apply with `npx supabase db push`
3. Redeploy frontend if needed

For data recovery, Supabase Pro plan offers Point-in-Time Recovery (PITR).

## Common Issues

### Build fails with type errors
```bash
npm run lint    # Check for lint issues
npm run build   # Full build with type checking
```

### Migration fails
Check the Supabase dashboard SQL editor for the current schema state. Migrations are idempotent if they use `IF NOT EXISTS` / `IF EXISTS` patterns.

### Vercel deploy fails
- Check that all env variables are set in Vercel dashboard
- Verify Node.js version (22+) in Vercel project settings
- Check build logs in Vercel dashboard
