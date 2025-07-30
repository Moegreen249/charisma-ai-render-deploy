# 🚀 CharismaAI Quick Setup Guide

This guide will help you set up your CharismaAI platform with standardized templates in just a few minutes. We've created automated setup scripts that handle everything from environment configuration to template deployment with 100% compliance validation.

## 📋 Prerequisites

Before running the setup, make sure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **PostgreSQL database** running (local or cloud)
- **Git** installed for version control
- **AI API keys** (optional but recommended):
  - Google AI API key
  - OpenAI API key
  - Anthropic API key

## 🎯 Quick Setup (Recommended)

### Option 1: Automated Setup Script

Choose your platform and run the appropriate command:

#### Windows
```bash
# Double-click setup.bat file, or run in Command Prompt:
setup.bat
```

#### macOS/Linux
```bash
# Make script executable and run:
chmod +x setup.sh
./setup.sh
```

#### Alternative (All Platforms)
```bash
# Run directly with Node.js:
node setup.js
```

#### Using npm/pnpm
```bash
# Using npm:
npm run setup

# Using pnpm:
pnpm setup
```

### What the Setup Script Does

The automated setup will:

1. ✅ **Check System Requirements** - Verify Node.js and package managers
2. ✅ **Install Dependencies** - Install all required npm packages
3. ✅ **Configure Environment** - Set up `.env` file with your settings
4. ✅ **Setup Database** - Generate Prisma client and create database schema
5. ✅ **Deploy Standardized Templates** - Deploy all 10 templates with validation
6. ✅ **Validate Template Compliance** - Ensure 100% compliance standards
7. ✅ **Create Admin Account** - Set up your administrator account
8. ✅ **Start Development Server** - Launch the application with health checks

## 📝 Setup Process Details

### Step 1: System Requirements Check
The script will verify you have Node.js installed and detect your package manager (npm or pnpm).

### Step 2: Environment Configuration
You'll be prompted to enter:

- **Database URL** (PostgreSQL connection string)
- **NextAuth Secret** (auto-generated if not provided)
- **NextAuth URL** (defaults to http://localhost:3000)
- **AI Provider API Keys** (optional):
  - Google AI API Key
  - OpenAI API Key
  - Anthropic API Key
- **Google Cloud Configuration** (optional):
  - Project ID
  - Location (defaults to us-central1)
- **OAuth Configuration** (optional):
  - Google Client ID & Secret
  - GitHub Client ID & Secret

### Step 3: Admin Account Creation
You'll create your admin account with:

- **Admin Name** (full name)
- **Admin Email** (login email)
- **Admin Password** (minimum 8 characters)

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or the automated script fails:

### 1. Install Dependencies
```bash
# Using npm:
npm install

# Using pnpm:
pnpm install
```

### 2. Create Environment File
Copy `env-example.txt` to `.env` and fill in your configuration:
```bash
cp env-example.txt .env
```

Edit `.env` with your settings:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/charisma_ai"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_API_KEY="your-google-ai-api-key"
# ... other settings
```

### 3. Setup Database & Templates
```bash
# Generate Prisma client:
npx prisma generate

# Create database schema:
npx prisma db push

# Deploy standardized templates:
npx tsx scripts/seedModules.ts
npx tsx scripts/deploy-all-enhanced-templates.ts

# Validate template compliance (should show 100%):
npx tsx scripts/validate-template-standards.ts
```

### 4. Create Admin Account
```bash
# Follow the interactive prompts during setup
# Or create manually if needed
```

### 5. Start Development Server
```bash
npm run dev
```

## 🎊 After Setup

Once setup is complete:

1. **Open your browser** and go to: `http://localhost:3000`
2. **Sign in** with your admin account
3. **Explore the features**:
   - Upload and analyze conversation files with 10 standardized templates
   - View analysis results with consistent charts and insights
   - Access all templates with 100% compliance validation
   - Manage users and analysis modules (admin only)
   - Export results and reports

## 🔑 Default Admin Access

After setup, you can sign in with:
- **Email**: The email you provided during setup
- **Password**: The password you provided during setup
- **Role**: Administrator (full access)

## 🎯 Template System

CharismaAI v2.0 features:
- **10 Standardized Templates** with 100% compliance
- **Automated Validation** ensuring consistency
- **Template Standards Framework** for quality assurance
- **Health Check Endpoints** for production monitoring

## 📊 AI Provider Configuration

### Google AI (Gemini)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env`: `GOOGLE_API_KEY="your-key"`

### OpenAI (GPT)
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env`: `OPENAI_API_KEY="your-key"`

### Anthropic (Claude)
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Add to `.env`: `ANTHROPIC_API_KEY="your-key"`

### Google Cloud Vertex AI
1. Set up Google Cloud project with Vertex AI enabled
2. Configure authentication (service account or gcloud)
3. Add to `.env`:
   ```env
   GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   GOOGLE_CLOUD_LOCATION="us-central1"
   ```

## 🗄️ Database Configuration

### Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/charisma_ai"
```

### Cloud Providers

#### Supabase
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

#### Railway
```env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/railway"
```

#### Neon
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

## 🔐 OAuth Configuration (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Add to `.env`:
   ```env
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

## 🛠️ Troubleshooting

### Common Issues

#### "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists

#### "AI API key invalid"
- Verify API keys are correct
- Check API key permissions
- Ensure sufficient credits/quota

#### "Node.js version error"
- Update to Node.js 18 or later
- Clear npm cache: `npm cache clean --force`

#### "Permission denied"
- On Unix systems: `chmod +x setup.sh`
- Run as administrator on Windows if needed

### Manual Recovery

If setup fails partway through:

1. **Reset database**: `npx prisma db push --force-reset`
2. **Regenerate client**: `npx prisma generate`
3. **Clear dependencies**: `rm -rf node_modules && npm install`
4. **Re-deploy templates**: 
   ```bash
   npx tsx scripts/seedModules.ts
   npx tsx scripts/deploy-all-enhanced-templates.ts
   npx tsx scripts/validate-template-standards.ts
   ```
5. **Re-run setup**: `node setup.js`

## 📞 Support

If you encounter issues:

1. Check the **troubleshooting section** above
2. Review the **setup logs** for specific error messages
3. Run **template validation**: `npx tsx scripts/validate-template-standards.ts`
4. Consult the **documentation** in the `DOCs/` folder:
   - `TEMPLATE_STANDARDIZATION_REPORT.md` - Template system details
   - `DEVELOPMENT_GUIDE.md` - Development setup and workflow
   - `API_REFERENCE.md` - API documentation
   - `FAQ.md` - Frequently asked questions
   - `RENDER_DEPLOYMENT.md` - Production deployment guide

## 🎉 Success!

Your CharismaAI platform with standardized templates is now ready! You can:

- **Analyze conversations** with 10 standardized AI-powered templates
- **Generate consistent reports** with validated charts and visualizations
- **Access 100% compliant templates** with automated quality assurance
- **Manage users and permissions** through the admin panel
- **Deploy to production** with Render.com using the deployment guide
- **Monitor system health** with built-in health check endpoints

Welcome to CharismaAI v2.0 - Production Ready! 🚀