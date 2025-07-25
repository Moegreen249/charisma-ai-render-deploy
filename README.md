# CharismaAI - Render.com Deployment Ready

This is the production-ready deployment copy of CharismaAI specifically configured for Render.com with all 10 standardized analysis templates and 100% compliance validation.

## 🚀 Quick Deployment to Render.com

### Step 1: Fork This Repository
1. Fork this repository to your GitHub account
2. Clone your fork (optional for local testing)

### Step 2: Create Render Services

#### Database
1. Go to Render Dashboard → New → PostgreSQL
2. Name: `charisma-ai-db`
3. Plan: Starter (free tier available)
4. Create and copy the connection string

#### Web Service  
1. Go to Render Dashboard → New → Web Service
2. Connect your forked repository
3. Runtime: Node.js
4. Build Command: `npm ci && npm run build`
5. Start Command: `npm start`
6. Plan: Starter (recommended)

### Step 3: Configure Environment Variables

Add these environment variables in Render:

#### Required
```env
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL connection string]
NEXTAUTH_SECRET=[Generate a secure random string]
NEXTAUTH_URL=[Your Render app URL]
```

#### AI Providers (at least one required)
```env
GOOGLE_API_KEY=your_google_ai_api_key
OPENAI_API_KEY=your_openai_api_key  
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Step 4: Deploy
Click "Create Web Service" and Render will automatically:
- ✅ Install dependencies
- ✅ Build the application  
- ✅ Generate Prisma client
- ✅ Apply database migrations
- ✅ Deploy all 10 standardized templates
- ✅ Validate 100% template compliance
- ✅ Start with health monitoring

### Step 5: Verify Deployment
1. Check health endpoint: `https://your-app.onrender.com/api/health`
2. Should show 100% template compliance
3. Create admin account via the interface
4. Start analyzing conversations!

## 🎯 Features Included

### Template System (100% Compliant)
- ✅ 10 standardized analysis templates
- ✅ Template validation framework
- ✅ Automated quality assurance
- ✅ Zero template errors

### Production Ready
- ✅ Health check endpoints
- ✅ Automated deployment scripts
- ✅ Template compliance monitoring
- ✅ Environment-specific configuration

### Analysis Templates
1. Communication Analysis
2. Relationship Analysis  
3. Business Meeting Analysis
4. Coaching Session Analysis
5. Advanced Communication Analysis
6. Deep Relationship Dynamics
7. Executive Leadership Analysis
8. Advanced Coaching Analysis
9. Clinical Therapeutic Assessment
10. Deep Forensic Analysis

## 📊 Health Monitoring

Check deployment status at `/api/health`:
```json
{
  "status": "healthy",
  "templates": {
    "count": 10,
    "compliance": "100.0%",
    "status": "fully_compliant"
  },
  "standardization": {
    "framework": "active",
    "validation": "enabled",
    "quality_assurance": "passed"
  }
}
```

## 🔧 Configuration Files

- `render.yaml` - Render-specific deployment configuration
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `scripts/` - Deployment and validation scripts

## 📚 Documentation

### Quick Links
- **[Complete Documentation](docs/README.md)** - Comprehensive documentation index
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Render.com Guide](docs/RENDER_DEPLOYMENT.md)** - Platform-specific deployment
- **[Contributing Guidelines](.github/CONTRIBUTING.md)** - How to contribute
- **[Security Policy](.github/SECURITY.md)** - Security and vulnerability reporting

### Developer Resources
- **[Development Guide](DOCs/DEVELOPMENT_GUIDE.md)** - Local development setup
- **[Architecture Overview](DOCs/ARCHITECTURE.md)** - System design
- **[API Reference](DOCs/API_REFERENCE.md)** - REST API documentation
- **[User Guide](DOCs/USER_GUIDE.md)** - Features and usage

### GitHub Templates
- **[Issue Templates](.github/ISSUE_TEMPLATE/)** - Bug reports, feature requests, deployment issues
- **[Pull Request Template](.github/pull_request_template.md)** - Contribution workflow
- **[Security Reporting](.github/SECURITY.md)** - Vulnerability disclosure process

## 🆘 Troubleshooting

### Build Issues
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure Node.js version compatibility

### Template Issues  
- Check health endpoint for compliance status
- Verify all 10 templates are deployed
- Run validation script if needed

### Runtime Issues
- Check application logs
- Verify database connection
- Test health endpoint

## ✅ Deployment Checklist

- [ ] Repository forked and connected to Render
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Web service deployed successfully
- [ ] Health check shows "healthy" status
- [ ] Template compliance at 100%
- [ ] Admin account created
- [ ] Analysis functionality tested

## 🎊 Success!

Your CharismaAI platform is now live with:
- 10 standardized templates (100% compliant)
- Production monitoring and health checks
- Automated quality assurance
- Template validation framework

Start analyzing conversations with AI-powered insights!

---

**CharismaAI v2.0** - Production Ready | Template Standardization Complete

**Developed by Mohamed Abdelrazig - MAAM**