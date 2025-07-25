# CharismaAI - AI-Powered Communication Analysis Platform

## Overview

CharismaAI is a production-ready web application that leverages artificial intelligence to analyze chat conversations and provide deep insights into communication patterns, personality traits, emotional dynamics, and interpersonal relationships. Built with Next.js 15, TypeScript, and modern AI models, it features a comprehensive standardized template system with 100% compliance validation for consistent, reliable analysis across all communication types.

## 🚀 Key Features

### Core Functionality
- **Multi-Format Chat Analysis**: Upload and analyze chat conversations in various formats
- **AI-Powered Insights**: Leverage state-of-the-art AI models (Google Gemini, Vertex AI, OpenAI GPT, Anthropic Claude) for deep analysis
- **Standardized Analysis Templates**: 10 professionally crafted templates with 100% compliance validation
- **Template Standardization Framework**: Automated quality assurance and compliance checking
- **Real-time AI Coaching**: Interactive chat interface for personalized communication guidance
- **Multi-language Support**: Automatic language detection and analysis in the conversation's native language
- **Production Ready**: Deployment-ready with health checks and monitoring

### Standardized Template System
CharismaAI features a comprehensive template standardization framework with 100% compliance validation ensuring consistent, reliable results:

#### **10 Professional Analysis Templates (100% Compliant)**
1. **Communication Analysis** - General communication patterns and effectiveness
2. **Relationship Analysis** - Emotional dynamics and interpersonal connections
3. **Business Meeting Analysis** - Professional leadership and meeting effectiveness
4. **Coaching Session Analysis** - Development insights and goal progress
5. **Advanced Communication Analysis** - Sophisticated linguistic and psychological frameworks
6. **Deep Relationship Dynamics** - Advanced attachment theory and intimacy models
7. **Executive Leadership Analysis** - Business strategy and team dynamics
8. **Advanced Coaching Analysis** - Comprehensive development and behavioral change
9. **Clinical Therapeutic Assessment** - Mental health and therapeutic progress frameworks
10. **Deep Forensic Analysis** - Multi-layered psychological profiling and relationship dynamics

#### **Template Standards Framework (Validated)**
- **Unified Metadata Schema**: Consistent priority (1-5), confidence (0.0-1.0), and category systems
- **Standardized Color Mapping**: Semantic category-based color schemes with 18 standardized categories
- **Required Core Insights**: Every template includes effectiveness scores, emotional timelines, and pattern analysis
- **Core Metrics**: All templates provide communicationEffectiveness, emotionalStability, and relationshipHealth scores
- **Automated Validation**: Continuous compliance checking with 100% compliance rate achieved
- **Quality Assurance**: Zero template errors, build-time validation, and TypeScript safety

### Analysis Capabilities
- **Personality Profiling**: Identify key personality traits and communication styles
- **Emotional Arc Tracking**: Monitor emotional changes throughout conversations with standardized metrics
- **Topic Analysis**: Extract and categorize discussion topics by relevance
- **Communication Pattern Recognition**: Identify recurring patterns and their impact
- **Standardized Insights**: Consistent insight system across all templates (text, scores, charts, tables)

### User Experience
- **Modern UI/UX**: Beautiful, responsive interface built with Tailwind CSS and Radix UI
- **Interactive Visualizations**: Dynamic charts and graphs with standardized data formats
- **Template Management**: Access to all 10 standardized templates plus custom template creation
- **Settings Management**: Comprehensive configuration for AI providers and models

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: Google Vertex AI (Gemini, Gemma), Google AI Studio, OpenAI, Anthropic
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Validation**: Zod schema validation
- **Template Standards**: Custom standardization framework

### Project Structure
```
charisma-ai/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions for analysis and templates
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard
│   ├── settings/         # Settings page
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── admin/           # Admin-specific components
│   └── *.tsx            # Feature components
├── lib/                 # Utility libraries
│   ├── analysis-templates.ts    # Standardized templates
│   ├── template-standards.ts   # Template validation framework
│   ├── enhanced-templates.ts   # Advanced analysis templates
│   └── *.ts             # Other utilities
├── scripts/             # Setup and maintenance scripts
│   ├── validate-template-standards.ts
│   ├── update-template-standards.ts
│   └── *.ts             # Other scripts
├── DOCs/               # Comprehensive documentation
└── prisma/             # Database schema and migrations
```

## 🚀 Getting Started

### Quick Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd charisma-ai
   ```

2. **Run the automated setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   The setup script will:
   - Check system requirements
   - Install dependencies
   - Configure environment variables
   - Set up database schema
   - Deploy all 10 standardized templates
   - Validate 100% template compliance
   - Create admin account
   - Start development server

   **Alternative methods:**
   ```bash
   # Windows:
   setup.bat
   
   # Direct Node.js:
   node setup.js
   ```

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp env-example.txt .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/charisma_ai"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # AI Providers
   GOOGLE_API_KEY="your-google-ai-api-key"
   OPENAI_API_KEY="your-openai-api-key"
   ANTHROPIC_API_KEY="your-anthropic-api-key"
   
   # Google Cloud (Optional)
   GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   GOOGLE_CLOUD_LOCATION="us-central1"
   ```

3. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Deploy standardized templates**
   ```bash
   npx tsx scripts/seedModules.ts
   npx tsx scripts/deploy-all-enhanced-templates.ts
   npx tsx scripts/validate-template-standards.ts
   ```

5. **Verify template compliance (should show 100%)**
   ```bash
   npx tsx scripts/validate-template-standards.ts
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📖 Usage Guide

### Basic Workflow

1. **Upload Chat File**: Drag and drop or select a chat conversation file
2. **Select Analysis Template**: Choose from 10 standardized templates
3. **Run Analysis**: Click "Analyze" to process your conversation
4. **Review Standardized Results**: Explore consistent insights, patterns, and metrics
5. **Get AI Coaching**: Use the interactive coach for personalized guidance

### Template Selection Guide

#### **General Purpose**
- **Communication Analysis**: Best for everyday conversations and general patterns
- **Relationship Analysis**: Ideal for personal relationships and emotional dynamics

#### **Professional Use**
- **Business Meeting Analysis**: Perfect for professional meetings and leadership assessment
- **Executive Leadership Analysis**: Advanced business strategy and team dynamics

#### **Personal Development**
- **Coaching Session Analysis**: Great for development conversations and goal tracking
- **Advanced Coaching Analysis**: Comprehensive behavioral change and learning frameworks

#### **Specialized Analysis**
- **Deep Relationship Dynamics**: Advanced attachment theory and intimacy assessment
- **Clinical Therapeutic Assessment**: Mental health and therapeutic progress evaluation
- **Advanced Communication Analysis**: Sophisticated linguistic and psychological analysis
- **Deep Forensic Analysis**: Multi-layered psychological profiling and relationship forensics

### Understanding Results

All templates provide standardized results including:
- **Overall Summary**: Comprehensive analysis overview
- **Standardized Insights**: Consistent insight types (scores, charts, text analysis)
- **Core Metrics**: Universal metrics (communicationEffectiveness, emotionalStability, relationshipHealth)
- **Specialized Metrics**: Template-specific measurements
- **Visual Charts**: Standardized data visualizations

## 🔧 Development & Maintenance

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Template System Scripts
- `npx tsx scripts/validate-template-standards.ts` - Validate template compliance (100% expected)
- `npx tsx scripts/update-template-standards.ts` - Apply standardization updates
- `npx tsx scripts/seedModules.ts` - Deploy all basic templates
- `npx tsx scripts/deploy-all-enhanced-templates.ts` - Deploy all 10 standardized templates

### Quality Assurance & Validation

The template system includes comprehensive quality assurance:
- **100% Compliance Rate**: All 10 templates meet standardization requirements
- **Zero Template Errors**: Complete error elimination achieved
- **Automated Validation**: Continuous compliance checking with validation scripts
- **Type Safety**: Full TypeScript integration with standardized interfaces
- **Build-time Validation**: Prevents regressions and ensures consistency
- **Health Checks**: Production monitoring and validation endpoints

### Adding New Templates

When creating new templates:
1. Use the standardization framework in `lib/template-standards.ts`
2. Follow the established metadata schema
3. Include required core insights and metrics
4. Run validation script to ensure compliance
5. Update documentation accordingly

## 🚀 Deployment

### Render.com Deployment (Recommended)

1. **Fork this repository**
2. **Connect to Render.com**
3. **Set environment variables** in Render dashboard
4. **Deploy automatically** - Render will build and deploy with template validation

**Features for Production:**
- Automated template deployment and validation
- Health check endpoints at `/api/health`
- 100% template compliance verification
- Production-ready configuration

### Other Platforms

The application is compatible with:
- Vercel
- Netlify
- Railway
- Heroku
- Docker deployment

See `RENDER_DEPLOYMENT.md` and `DOCs/DEPLOYMENT.md` for detailed platform-specific instructions.

## 📚 Documentation

### Complete Documentation Suite
- **[Template Standardization Report](TEMPLATE_STANDARDIZATION_REPORT.md)** - Comprehensive standardization details
- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[User Guide](USER_GUIDE.md)** - Detailed usage instructions
- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Contributor guidelines
- **[Architecture](ARCHITECTURE.md)** - System design and structure
- **[Deployment](DEPLOYMENT.md)** - Platform deployment guides
- **[FAQ](FAQ.md)** - Frequently asked questions

## 🎯 Project Status

### Current Version: 2.0 (Template Standardization Complete) ✅

#### ✅ **Production Ready Features**
- 10 standardized analysis templates (100% compliance validated)
- Template validation and quality assurance framework (zero errors)
- Comprehensive automated setup with health checks
- Full TypeScript integration with standardized interfaces
- Modern UI/UX with responsive design
- Multi-AI provider support (Google, OpenAI, Anthropic)
- Real-time coaching interface
- Database integration with Prisma
- Admin dashboard and user management
- Render.com deployment ready with automated validation

#### 🚀 **Production Capabilities**
- Health check endpoints for monitoring
- Automated template deployment and validation
- Build-time error prevention
- Production environment configuration
- Template compliance monitoring

#### 📋 **Future Enhancements**
- Batch analysis capabilities
- Export functionality (PDF, CSV, JSON)
- Team collaboration features
- Mobile application
- API for third-party integrations
- Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the standardization guidelines
4. Ensure template compliance
5. Add tests if applicable
6. Submit a pull request

See `DOCs/DEVELOPMENT_GUIDE.md` for detailed contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the comprehensive documentation in `DOCs/`
- Review template standardization guidelines
- Run validation scripts for troubleshooting
- Open an issue on the repository

## 🏆 Key Achievements

- **100% Template Compliance**: All 10 templates meet standardization requirements with validation
- **Zero Template Errors**: Comprehensive validation framework ensures complete reliability
- **Consistent User Experience**: Standardized outputs and metadata across all analysis types
- **Production Ready**: Successfully built, tested, and deployed with health monitoring
- **Quality Assurance**: Automated validation prevents regressions and ensures consistency
- **Future-Proof Architecture**: Scalable template system with standardization framework

---

**CharismaAI** - Transforming conversations into insights with standardized, reliable analysis.

*Version 2.0 - Template Standardization Complete | Production Deployment Ready | 100% Compliance Validated*

---

### References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)