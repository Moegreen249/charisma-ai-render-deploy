# CharismaAI Project Structure

This document provides a comprehensive overview of the CharismaAI project organization and file structure.

## 📁 Root Directory Overview

```
charisma-ai-render-deploy/
├── 📁 .github/              # GitHub configuration and templates
├── 📁 app/                  # Next.js App Router pages and layouts
├── 📁 components/           # Reusable React components
├── 📁 docs/                 # Project documentation
├── 📁 DOCs/                 # Legacy comprehensive documentation
├── 📁 lib/                  # Utility functions and configurations
├── 📁 node_modules/         # NPM dependencies (ignored in git)
├── 📁 prisma/               # Database schema and migrations
├── 📁 public/               # Static assets
├── 📁 scripts/              # Build and deployment scripts
├── 📁 src/                  # Source code (types and generated files)
├── 📄 .gitignore            # Git ignore patterns
├── 📄 .npmrc                # NPM configuration
├── 📄 CHANGELOG.md          # Version history and changes
├── 📄 README.md             # Project overview and quick start
├── 📄 components.json       # Shadcn/UI component configuration
├── 📄 env-example.txt       # Environment variables template
├── 📄 eslint.config.mjs     # ESLint configuration
├── 📄 middleware.ts         # Next.js middleware
├── 📄 next-env.d.ts         # Next.js TypeScript declarations
├── 📄 next.config.js        # Next.js configuration
├── 📄 package.json          # Project dependencies and scripts
├── 📄 pnpm-lock.yaml        # Package lock file
├── 📄 postcss.config.js     # PostCSS configuration
├── 📄 render.yaml           # Render.com deployment configuration
├── 📄 sample-chat.txt       # Sample chat data for testing
├── 📄 setup.bat             # Windows setup script
├── 📄 setup.js              # Cross-platform setup script
├── 📄 setup.sh              # Unix/Linux setup script
├── 📄 tailwind.config.js    # Tailwind CSS configuration
└── 📄 tsconfig.json         # TypeScript configuration
```

## 📁 Detailed Directory Structure

### `.github/` - GitHub Configuration
```
.github/
├── ISSUE_TEMPLATE/
│   ├── bug_report.md           # Bug report template
│   ├── feature_request.md      # Feature request template
│   └── deployment_issue.md     # Deployment issue template
├── workflows/
│   └── ci.yml                  # GitHub Actions CI/CD workflow
├── CONTRIBUTING.md             # Contributing guidelines
├── REPOSITORY_STATUS.md        # Project status and metrics
├── SECURITY.md                 # Security policy and reporting
└── pull_request_template.md    # Pull request template
```

### `app/` - Next.js Application (App Router)
```
app/
├── (auth)/                     # Authentication route group
├── api/                        # API routes
│   ├── auth/                   # NextAuth.js endpoints
│   ├── chat/                   # Chat analysis endpoints
│   ├── health/                 # Health check endpoint
│   └── templates/              # Template management endpoints
├── dashboard/                  # User dashboard pages
├── globals.css                 # Global styles
├── layout.tsx                  # Root layout component
└── page.tsx                    # Home page component
```

### `components/` - React Components
```
components/
├── ui/                         # Base UI components (Shadcn/UI)
│   ├── button.tsx              # Button component
│   ├── card.tsx                # Card component
│   ├── dialog.tsx              # Dialog/Modal component
│   ├── input.tsx               # Input component
│   ├── select.tsx              # Select dropdown component
│   └── ...                     # Other UI primitives
├── auth/                       # Authentication components
├── charts/                     # Data visualization components
├── forms/                      # Form components
├── layout/                     # Layout components
└── analysis/                   # Analysis-specific components
```

### `docs/` - Current Documentation
```
docs/
├── README.md                           # Documentation index
├── DEPLOYMENT_CHECKLIST.md            # Pre-deployment verification
├── RENDER_DEPLOYMENT.md               # Render.com deployment guide
├── BACKGROUND_PROCESSING_IMPLEMENTATION.md  # Processing details
├── TEMPLATE_STANDARDIZATION_COMPLETE.md     # Template standards
└── UPDATE_SUMMARY.md                  # Recent changes summary
```

### `DOCs/` - Legacy Comprehensive Documentation
```
DOCs/
├── API_REFERENCE.md                    # REST API documentation
├── ARCHITECTURE.md                     # System architecture
├── AUTHENTICATION_SETUP.md            # OAuth setup guide
├── CHANGELOG.md                        # Version history
├── CHART_COMPONENTS.md                 # Visualization guide
├── COMPLETE_SETUP_DOCUMENTATION.md     # Comprehensive setup
├── DEPLOYMENT.md                       # General deployment
├── DEVELOPMENT_GUIDE.md                # Development setup
├── FAQ.md                              # Frequently asked questions
├── GOOGLE_CLOUD_AUTH_INVENTORY.md      # GCP integration
├── INDEX.md                            # Documentation index
├── README.md                           # Legacy project overview
├── SETUP_README.md                     # Setup instructions
├── TEMPLATE_STANDARDIZATION_REPORT.md  # Template compliance
├── UI_UPGRADE_PLAN.md                  # Planned improvements
└── USER_GUIDE.md                       # User documentation
```

### `lib/` - Utility Libraries
```
lib/
├── auth.ts                     # Authentication utilities
├── db.ts                       # Database connection
├── utils.ts                    # General utilities
├── validations.ts              # Input validation schemas
├── ai/                         # AI service integrations
│   ├── gemini.ts               # Google Gemini API
│   ├── openai.ts               # OpenAI API
│   └── anthropic.ts            # Anthropic API
└── analysis/                   # Analysis processing
    ├── processors.ts           # Chat processors
    ├── templates.ts            # Template system
    └── validators.ts           # Template validators
```

### `prisma/` - Database Configuration
```
prisma/
├── migrations/                 # Database migration files
│   ├── 20241201_init/          # Initial migration
│   ├── 20241215_templates/     # Template system migration
│   └── migration_lock.toml     # Migration lock file
└── schema.prisma               # Database schema definition
```

### `scripts/` - Automation Scripts
```
scripts/
├── create-all-enhanced-modules.ts      # Template creation
├── create-forensic-modules.ts          # Forensic templates
├── create-forensic-template.ts         # Forensic template setup
├── deploy-all-enhanced-templates.ts    # Template deployment
├── prepare-deployment.ts               # Deployment preparation
├── seed-analytics-demo.ts              # Demo data seeding
├── seedModules.ts                      # Module seeding
├── setup-admin.ts                      # Admin user creation
├── update-genai-models.js              # AI model updates
├── update-measurement-scales.ts        # Measurement updates
├── update-template-standards.ts        # Template standards
├── update-vertex-models.js             # Vertex AI models
├── validate-template-standards.ts      # Template validation
├── verify-env.ts                       # Environment verification
└── verify-setup.ts                     # Setup verification
```

### `src/` - Source Code
```
src/
├── generated/                  # Generated files (gitignored)
│   └── prisma/                 # Prisma client
└── types/                      # TypeScript type definitions
    ├── analysis.ts             # Analysis types
    ├── chat.ts                 # Chat data types
    ├── index.ts                # Exported types
    ├── metrics.ts              # Metrics types
    ├── next-auth.d.ts          # NextAuth type extensions
    └── visualization.ts        # Chart types
```

## 🔧 Configuration Files

### Build and Development
- **`package.json`** - Dependencies, scripts, and project metadata
- **`tsconfig.json`** - TypeScript compiler configuration
- **`next.config.js`** - Next.js framework configuration
- **`tailwind.config.js`** - Tailwind CSS styling configuration
- **`postcss.config.js`** - PostCSS processing configuration
- **`eslint.config.mjs`** - ESLint linting rules

### Environment and Deployment
- **`env-example.txt`** - Environment variables template
- **`render.yaml`** - Render.com deployment configuration
- **`.gitignore`** - Git ignore patterns
- **`.npmrc`** - NPM registry configuration

### UI and Components
- **`components.json`** - Shadcn/UI component configuration
- **`middleware.ts`** - Next.js middleware for auth and routing

## 📊 Analysis Templates Structure

The system includes 10 standardized analysis templates:

1. **Communication Analysis** - Basic communication patterns
2. **Relationship Analysis** - Interpersonal dynamics
3. **Business Meeting Analysis** - Professional interactions
4. **Coaching Session Analysis** - Coaching effectiveness
5. **Advanced Communication Analysis** - Deep patterns
6. **Deep Relationship Dynamics** - Comprehensive relationships
7. **Executive Leadership Analysis** - Leadership assessment
8. **Advanced Coaching Analysis** - Advanced coaching evaluation
9. **Clinical Therapeutic Assessment** - Therapeutic interactions
10. **Deep Forensic Analysis** - Detailed forensic analysis

### Template Compliance Framework
- **Validation System** - Automated template validation
- **Quality Assurance** - 100% compliance verification
- **Standard Enforcement** - Consistent template structure
- **Performance Monitoring** - Processing time optimization

## 🔒 Security and Privacy

### Authentication Flow
```
User → Google OAuth → NextAuth.js → JWT Session → Protected Routes
```

### Data Protection
- **Encryption**: TLS for transmission, encrypted storage
- **Privacy**: Chat data processed in memory, not permanently stored
- **Validation**: Comprehensive input sanitization
- **Access Control**: Role-based permissions (User/Admin)

## 🚀 Deployment Architecture

### Build Process
```
1. Install Dependencies (npm ci)
2. Generate Prisma Client
3. Apply Database Migrations
4. Build Next.js Application
5. Start Production Server
```

### Environment Layers
- **Development** - Local development with hot reload
- **Staging** - Pre-production testing environment
- **Production** - Live application on Render.com

## 📈 Performance Optimization

### Code Splitting
- **Route-based** - Automatic code splitting by page
- **Component-based** - Lazy loading of heavy components
- **Library chunking** - Vendor libraries separated

### Database Optimization
- **Indexed Queries** - Optimized database indexes
- **Connection Pooling** - Efficient connection management
- **Query Optimization** - Prisma query optimization

### AI Processing
- **Streaming Results** - Real-time analysis updates
- **Model Fallbacks** - Multiple AI provider support
- **Token Optimization** - Efficient prompt engineering

## 🧪 Testing Strategy

### Test Types
- **Unit Tests** - Individual function testing
- **Integration Tests** - API endpoint testing
- **Component Tests** - React component testing
- **E2E Tests** - Full workflow testing

### Test Files Location
```
__tests__/                      # Test files
├── components/                 # Component tests
├── pages/                      # Page tests
├── api/                        # API tests
└── utils/                      # Utility tests
```

## 📚 Documentation Philosophy

### Documentation Types
- **Getting Started** - Quick deployment guides
- **Reference** - Comprehensive API documentation
- **Tutorials** - Step-by-step learning guides
- **Explanations** - Conceptual understanding

### Maintenance
- **Living Documentation** - Updated with code changes
- **Version Control** - Documentation versioning
- **Review Process** - Regular documentation audits
- **User Feedback** - Community-driven improvements

---

**Project Structure Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Development Team