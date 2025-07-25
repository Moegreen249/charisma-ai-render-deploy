# CharismaAI Documentation

Welcome to the comprehensive documentation for CharismaAI - an AI-powered communication analysis platform that provides deep insights into chat conversations, personality traits, emotional dynamics, and interpersonal relationships.

## 📚 Documentation Overview

This documentation is organized into several sections to help you understand, deploy, and contribute to CharismaAI.

## 🚀 Getting Started

### Quick Links
- **[Main README](../README.md)** - Project overview and quick deployment guide
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Complete pre-deployment verification
- **[Render.com Deployment](RENDER_DEPLOYMENT.md)** - Platform-specific deployment guide

### For Users
- **[User Guide](../DOCs/USER_GUIDE.md)** - How to use CharismaAI features
- **[FAQ](../DOCs/FAQ.md)** - Frequently asked questions
- **[API Reference](../DOCs/API_REFERENCE.md)** - REST API documentation

### For Developers
- **[Development Guide](../DOCs/DEVELOPMENT_GUIDE.md)** - Local development setup
- **[Architecture](../DOCs/ARCHITECTURE.md)** - System architecture overview
- **[Contributing](../.github/CONTRIBUTING.md)** - How to contribute to the project

## 🏗️ Architecture & Development

### System Design
- **[Architecture Overview](../DOCs/ARCHITECTURE.md)** - High-level system design
- **[Chart Components](../DOCs/CHART_COMPONENTS.md)** - Visualization components guide
- **[Authentication Setup](../DOCs/AUTHENTICATION_SETUP.md)** - OAuth and security configuration

### Technical Implementation
- **[Background Processing](BACKGROUND_PROCESSING_IMPLEMENTATION.md)** - Async processing implementation
- **[Template Standardization](TEMPLATE_STANDARDIZATION_COMPLETE.md)** - Analysis template standards
- **[Update Summary](UPDATE_SUMMARY.md)** - Recent changes and improvements

## 🚀 Deployment & Operations

### Deployment Guides
- **[Deployment Guide](../DOCs/DEPLOYMENT.md)** - General deployment instructions
- **[Render.com Specific](RENDER_DEPLOYMENT.md)** - Render.com deployment details
- **[Complete Setup](../DOCs/COMPLETE_SETUP_DOCUMENTATION.md)** - Comprehensive setup guide

### Configuration
- **[Environment Variables](../env-example.txt)** - Required environment configuration
- **[Google Cloud Setup](../DOCs/GOOGLE_CLOUD_AUTH_INVENTORY.md)** - GCP integration guide
- **[Database Setup](../DOCs/SETUP_README.md)** - Database configuration

## 🤖 AI & Analysis

### Analysis Features
CharismaAI provides 10 standardized analysis templates:

1. **Emotional Arc Tracking** - Emotional journey analysis
2. **Key Topic Identification** - Main conversation themes
3. **Communication Pattern Analysis** - Communication style patterns
4. **Personality Trait Assessment** - Big Five personality analysis
5. **Engagement Level Measurement** - Participation and involvement metrics
6. **Decision Making Analysis** - Decision-making process insights
7. **Relationship Dynamics** - Interpersonal relationship analysis
8. **Conflict Resolution** - Conflict identification and resolution patterns
9. **Leadership Assessment** - Leadership qualities and influence
10. **Cultural Context Analysis** - Cultural communication patterns

### Template Standards
- **[Template Standardization Report](../DOCs/TEMPLATE_STANDARDIZATION_REPORT.md)** - Template compliance details
- **[Validation Process](TEMPLATE_STANDARDIZATION_COMPLETE.md)** - Quality assurance process

## 🛠️ Development Resources

### Code Structure
```
charisma-ai-render-deploy/
├── app/                    # Next.js app router pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── src/types/             # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── scripts/              # Build and deployment scripts
├── docs/                 # Documentation (this directory)
├── DOCs/                 # Legacy documentation
└── .github/              # GitHub templates and workflows
```

### Development Workflow
1. **Setup**: Follow the [Development Guide](../DOCs/DEVELOPMENT_GUIDE.md)
2. **Coding**: Adhere to [Contributing Guidelines](../.github/CONTRIBUTING.md)
3. **Testing**: Run comprehensive tests before submitting
4. **Documentation**: Update relevant documentation
5. **Deployment**: Use [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 📋 API Documentation

### Core Endpoints
- `GET /api/health` - Health check endpoint
- `POST /api/chat/upload` - Upload chat file for analysis
- `GET /api/chat/analysis/:id` - Retrieve analysis results
- `POST /api/auth/signin` - User authentication
- `GET /api/templates` - List available analysis templates

### Authentication
- OAuth2 with Google
- JWT session management
- Role-based access control

## 🔒 Security & Privacy

### Security Features
- **Data Encryption**: All data transmission uses HTTPS/TLS
- **Input Validation**: Comprehensive sanitization and validation
- **Authentication**: Secure OAuth2 implementation
- **Privacy**: Chat data processed in memory, not permanently stored

### Compliance
- GDPR compliance ready
- CCPA compliance ready
- Configurable data retention policies
- Audit logging capabilities

### Security Policies
- **[Security Policy](../.github/SECURITY.md)** - Vulnerability reporting and security practices
- **[Privacy Guidelines](../DOCs/USER_GUIDE.md#privacy-considerations)** - Data handling practices

## 🎯 Use Cases

### Business Applications
- **Team Communication Analysis** - Improve team collaboration
- **Customer Service Optimization** - Enhance customer interactions
- **Leadership Development** - Assess and develop leadership skills
- **Conflict Resolution** - Identify and resolve communication issues

### Research Applications
- **Communication Studies** - Academic research on communication patterns
- **Psychology Research** - Personality and behavioral analysis
- **Organizational Behavior** - Workplace communication analysis
- **Social Network Analysis** - Relationship dynamics research

## 📊 Features

### Analysis Capabilities
- **Multi-format Support** - WhatsApp, Discord, Slack, plain text
- **Real-time Processing** - Fast analysis with streaming results
- **Visualization** - Interactive charts and graphs
- **Export Options** - PDF reports, CSV data, JSON format

### Platform Features
- **Responsive Design** - Works on desktop and mobile
- **Dark/Light Themes** - User preference support
- **Multi-language** - Internationalization ready
- **Accessibility** - WCAG 2.1 compliant

## 🔄 Updates & Changelog

### Recent Updates
- **[Update Summary](UPDATE_SUMMARY.md)** - Latest changes and improvements
- **[Changelog](../DOCs/CHANGELOG.md)** - Version history
- **[UI Upgrade Plan](../DOCs/UI_UPGRADE_PLAN.md)** - Planned improvements

### Version Information
- **Current Version**: 0.1.0
- **Release Date**: December 2024
- **Next Release**: Planned for Q1 2025

## 🆘 Support & Community

### Getting Help
- **[FAQ](../DOCs/FAQ.md)** - Common questions and answers
- **[GitHub Issues](https://github.com/your-repo/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/your-repo/discussions)** - Community discussions

### Contributing
- **[Contributing Guide](../.github/CONTRIBUTING.md)** - How to contribute
- **[Code of Conduct](../.github/CONTRIBUTING.md#code-of-conduct)** - Community guidelines
- **[Development Setup](../DOCs/DEVELOPMENT_GUIDE.md)** - Local development environment

### Issue Templates
- **[Bug Report](../.github/ISSUE_TEMPLATE/bug_report.md)** - Report bugs
- **[Feature Request](../.github/ISSUE_TEMPLATE/feature_request.md)** - Request new features
- **[Deployment Issue](../.github/ISSUE_TEMPLATE/deployment_issue.md)** - Deployment problems

## 📝 Documentation Standards

### Writing Guidelines
- Use clear, concise language
- Include code examples where appropriate
- Maintain up-to-date screenshots and diagrams
- Follow markdown best practices
- Include table of contents for long documents

### Document Types
- **Guides**: Step-by-step instructions
- **References**: Comprehensive technical documentation
- **Tutorials**: Learning-oriented content
- **Explanations**: Understanding-oriented content

## 🔗 External Resources

### Third-Party Services
- **[Google Cloud AI Platform](https://cloud.google.com/ai-platform)** - AI/ML services
- **[Render.com](https://render.com/)** - Deployment platform
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication
- **[Prisma](https://www.prisma.io/)** - Database ORM

### Learning Resources
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript guide
- **[React Documentation](https://react.dev/)** - React framework
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Styling framework

---

## Quick Navigation

| Category | Documents |
|----------|-----------|
| **Getting Started** | [README](../README.md), [Setup](../DOCs/COMPLETE_SETUP_DOCUMENTATION.md), [FAQ](../DOCs/FAQ.md) |
| **Deployment** | [Checklist](DEPLOYMENT_CHECKLIST.md), [Render.com](RENDER_DEPLOYMENT.md), [Guide](../DOCs/DEPLOYMENT.md) |
| **Development** | [Contributing](../.github/CONTRIBUTING.md), [Architecture](../DOCs/ARCHITECTURE.md), [Dev Guide](../DOCs/DEVELOPMENT_GUIDE.md) |
| **API** | [Reference](../DOCs/API_REFERENCE.md), [Auth Setup](../DOCs/AUTHENTICATION_SETUP.md) |
| **Security** | [Policy](../.github/SECURITY.md), [User Guide](../DOCs/USER_GUIDE.md) |

---

*This documentation is continuously updated. For the latest information, please check the repository's main branch.*

**Last Updated**: December 2024  
**Documentation Version**: 1.0.0