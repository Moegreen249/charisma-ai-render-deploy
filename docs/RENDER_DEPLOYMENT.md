# CharismaAI - Render.com Deployment Guide

## Overview

This guide will walk you through deploying CharismaAI to Render.com with all 10 standardized analysis templates and automated setup.

## Prerequisites

- GitHub repository with CharismaAI code
- Render.com account
- AI provider API keys (Google AI, OpenAI, or Anthropic)

## 🚀 Quick Deployment

### Step 1: Fork the Repository

1. Fork this repository to your GitHub account
2. Clone your fork locally if you want to make customizations

### Step 2: Create Render.com Services

#### Database Setup

1. **Go to Render Dashboard** → **New** → **PostgreSQL**
2. **Configure Database:**
   - Name: `charisma-ai-db`
   - Database Name: `charisma_ai`
   - User: `charisma_ai_user`
   - Plan: `Starter` (free tier available)
3. **Create Database**
4. **Copy the Database URL** (you'll need it for the web service)

#### Web Service Setup

1. **Go to Render Dashboard** → **New** → **Web Service**
2. **Connect Repository:**
   - Select your forked repository
   - Branch: `main`
3. **Configure Service:**
   - Name: `charisma-ai`
   - Runtime: `Node.js`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Plan: `Starter` (free tier available)

### Step 3: Configure Environment Variables

In your Render web service settings, add the following environment variables:

#### Required Variables
```env
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL connection string from Step 2]
NEXTAUTH_SECRET=[Generate a secure random string]
NEXTAUTH_URL=[Your Render app URL - will be provided after deployment]
```

#### AI Provider API Keys (at least one required)
```env
# Google AI (Recommended)
GOOGLE_API_KEY=your_google_ai_api_key

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key

# Anthropic (Optional)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

#### Google Cloud (Optional - for Vertex AI)
```env
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1
```

#### OAuth (Optional)
```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (usually 5-10 minutes)
3. **Render will automatically:**
   - Install dependencies
   - Build the application
   - Generate Prisma client
   - Apply database migrations
   - Seed standardized templates
   - Validate template compliance
   - Start the application

### Step 5: Post-Deployment Setup

1. **Update NEXTAUTH_URL:**
   - Copy your Render app URL (e.g., `https://charisma-ai-abc123.onrender.com`)
   - Update the `NEXTAUTH_URL` environment variable
   - Trigger a redeploy

2. **Create Admin Account:**
   - Access your deployed app
   - Go to `/admin` or click the admin link
   - Create your first admin account

3. **Verify Template Installation:**
   - Check that all 10 templates are available
   - Verify 100% compliance status
   - Test analysis functionality

## 🔧 Advanced Configuration

### Custom Domain

1. **In Render Dashboard:**
   - Go to your web service
   - Click "Settings" → "Custom Domains"
   - Add your domain and configure DNS

2. **Update Environment Variables:**
   ```env
   NEXTAUTH_URL=https://your-custom-domain.com
   ```

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

#### Staging
```env
NODE_ENV=staging
NEXTAUTH_URL=https://charisma-ai-staging.onrender.com
```

#### Production
```env
NODE_ENV=production
NEXTAUTH_URL=https://your-production-domain.com
```

### Scaling Options

- **Free Tier:** Good for testing and small usage
- **Starter Plan:** Recommended for production use
- **Standard/Pro:** For high-traffic applications

## 📊 Monitoring & Health Checks

### Health Check Endpoint

The application includes a health check endpoint at `/api/health`:

```json
{
  "status": "healthy",
  "timestamp": "2024-07-24T12:00:00Z",
  "version": "2.0.0",
  "database": "connected",
  "templates": {
    "count": 10,
    "status": "ready"
  },
  "services": {
    "api": "operational",
    "authentication": "operational",
    "analysis": "operational"
  }
}
```

### Render Monitoring

- **Logs:** Available in Render dashboard
- **Metrics:** CPU, memory, and response time monitoring
- **Alerts:** Configure alerts for downtime or errors

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check DATABASE_URL format
postgresql://username:password@host:port/database

# Ensure database is created and accessible
```

#### Template Deployment Issues
```bash
# Check build logs for template seeding errors
# Verify all scripts ran successfully:
# - npx prisma generate
# - npx prisma migrate deploy
# - npx tsx scripts/seedModules.ts
# - npx tsx scripts/deploy-all-enhanced-templates.ts
# - npx tsx scripts/validate-template-standards.ts
```

#### Authentication Issues
```bash
# Verify NEXTAUTH_SECRET is set
# Ensure NEXTAUTH_URL matches your deployed URL
# Check OAuth provider configuration if using
```

### Build Failures

1. **Check Build Logs** in Render dashboard
2. **Common Solutions:**
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility
   - Check for TypeScript errors
   - Ensure environment variables are set

### Runtime Errors

1. **Check Application Logs** in Render dashboard
2. **Test Health Endpoint:** `https://your-app.onrender.com/api/health`
3. **Verify Database Connection**
4. **Check Template Compliance:** Should show 100% compliance

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Repository forked and configured
- [ ] Environment variables prepared
- [ ] AI provider API keys obtained
- [ ] Database plan selected

### During Deployment
- [ ] PostgreSQL database created
- [ ] Web service configured
- [ ] Environment variables set
- [ ] Build completed successfully
- [ ] Templates seeded and validated

### Post-Deployment
- [ ] NEXTAUTH_URL updated with actual domain
- [ ] Admin account created
- [ ] Health check endpoint responding
- [ ] All 10 templates available
- [ ] Analysis functionality tested
- [ ] Custom domain configured (if applicable)

## 📚 Additional Resources

### Render.com Documentation
- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Render Custom Domains](https://render.com/docs/custom-domains)

### CharismaAI Documentation
- [Main README](DOCs/README.md) - Complete project overview
- [Template Standardization Report](DOCs/TEMPLATE_STANDARDIZATION_REPORT.md) - Template system details
- [API Reference](DOCs/API_REFERENCE.md) - API documentation
- [User Guide](DOCs/USER_GUIDE.md) - How to use all 10 templates

## 🎉 Success!

Your CharismaAI platform is now deployed to Render.com with:

- **10 Standardized Templates** (100% compliance)
- **Automated Quality Assurance**
- **Production-Ready Configuration**
- **Health Monitoring**
- **Scalable Infrastructure**

Visit your deployed application and start analyzing conversations with AI-powered insights!

---

**Deployment Complete** ✅  
*CharismaAI v2.0 - Template Standardization Complete*