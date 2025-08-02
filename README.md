# CharismaAI - Advanced AI Platform with Complete Admin Suite

This is the production-ready deployment of CharismaAI - a comprehensive AI-powered conversation analysis platform with advanced admin management, subscription handling, and centralized AI configuration system.

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

#### AI Providers (Configure via Admin Panel or Environment)
```env
# Primary AI Provider Keys (can be managed via admin panel)
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key  
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_VERTEX_AI_CREDENTIALS=your_vertex_ai_credentials

# Optional: Email Service (for notifications)
RESEND_API_KEY=your_resend_api_key

# Optional: Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
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

## 🎯 Major Features

### 🛠️ Advanced Admin Management Suite
- **Complete User Management** - User roles, permissions, suspension, deletion
- **Subscription Management** - Full lifecycle management for FREE/PRO/ENTERPRISE tiers
- **Usage Analytics** - Detailed tracking and reporting across all user activities
- **System Metrics** - Real-time platform health and performance monitoring
- **Error Management** - Centralized error tracking and resolution tools
- **Background Jobs** - Task queue management and monitoring

### 🤖 Centralized AI Configuration System
- **Multi-Provider Support** - Google Gemini, OpenAI, Anthropic, Vertex AI
- **Hybrid API Key Management** - Environment variables + Admin panel configuration
- **Feature-Based AI Control** - Configure AI providers per feature (stories, analysis, etc.)
- **Automatic Fallback** - Seamless provider switching on failures
- **Testing & Validation** - Built-in AI provider testing tools
- **Priority Management** - Configure provider preference and fallback order

### 💳 Complete Subscription System
- **Multi-Tier Plans** - FREE (3 stories/month), PRO (unlimited), ENTERPRISE (white-label)
- **Usage Tracking** - Stories, API calls, file processing with real-time limits
- **Billing Integration** - Stripe-ready with customer and subscription management
- **Admin Controls** - Full subscription lifecycle management from admin panel
- **Usage Analytics** - Historical usage patterns and billing insights
- **Cancellation Management** - Immediate or end-of-period cancellation options

### 📊 Advanced Analytics & Reporting
- **Template System** - 10 standardized analysis templates (100% compliant)
- **Story Generation** - AI-powered interactive story creation
- **Conversation Analysis** - Multi-provider AI analysis with comprehensive insights
- **Activity Tracking** - Complete user activity logging and audit trails
- **Performance Metrics** - System-wide performance and usage analytics

### 🔒 Enterprise Security Features
- **Role-Based Access Control** - USER/ADMIN roles with granular permissions
- **Activity Logging** - Comprehensive audit trails for all admin actions
- **Error Tracking** - Centralized error management and resolution
- **API Security** - Secure endpoints with proper authentication
- **Data Protection** - Secure handling of user data and API keys

### 🎨 Modern User Experience
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Dark Theme** - Professional dark theme with glassmorphism effects
- **Interactive Components** - Smooth animations and transitions with Framer Motion
- **Real-time Updates** - Live data updates and notifications
- **Skeleton Loading** - Professional loading states and error handling
- **Accessibility** - WCAG compliant design patterns

### ⚡ Production-Ready Infrastructure
- **Health Monitoring** - Comprehensive health checks and status reporting
- **Database Management** - PostgreSQL with Prisma ORM and migrations
- **Background Processing** - Task queue system for heavy operations
- **Email Integration** - Transactional emails with Resend
- **Analytics Integration** - Vercel Analytics and Speed Insights
- **Environment Management** - Multi-environment configuration support

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

## 🚀 What's New in v3.0

### Major Updates
- **🛠️ Complete Admin Suite** - Full platform management capabilities
- **🤖 Centralized AI System** - Unified AI provider management with hybrid key system
- **💳 Subscription Management** - Enterprise-grade subscription and billing system
- **📊 Advanced Analytics** - Comprehensive usage tracking and reporting
- **🔒 Enhanced Security** - Role-based access control and audit logging
- **🎨 Modern UI/UX** - Professional design with enhanced user experience

### New Admin Features
- User management with roles and permissions
- Subscription lifecycle management
- AI provider configuration and testing
- System metrics and health monitoring
- Error tracking and resolution tools
- Background job management

### Enhanced AI Capabilities
- Multi-provider AI support (Google Gemini, OpenAI, Anthropic, Vertex AI)
- Intelligent fallback system
- Feature-specific AI configuration
- Admin-configurable API keys
- Real-time provider testing

### Enterprise Features
- Multi-tier subscription plans (FREE/PRO/ENTERPRISE)
- Usage limits and tracking
- Billing integration with Stripe
- Activity audit trails
- Advanced analytics and reporting

---

**CharismaAI v3.0** - Enterprise AI Platform | Complete Admin Suite | Advanced Subscription Management

**Developed by Mohamed Abdelrazig - MAAM**