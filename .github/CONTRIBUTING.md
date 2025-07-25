# Contributing to CharismaAI

Thank you for your interest in contributing to CharismaAI! This document provides guidelines and information for contributors.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

### Expected Behavior
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing private information without permission
- Other conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL 14+
- Git
- Google Cloud Platform account (for AI services)
- Basic knowledge of Next.js, TypeScript, and React

### Areas for Contribution
- **Frontend Development**: React components, UI/UX improvements
- **Backend Development**: API endpoints, database optimization
- **AI/ML Integration**: Analysis templates, model improvements
- **Documentation**: User guides, API documentation, tutorials
- **Testing**: Unit tests, integration tests, quality assurance
- **DevOps**: Deployment optimization, monitoring, CI/CD
- **Security**: Authentication, authorization, data protection

## Development Setup

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR_USERNAME/charisma-ai-render-deploy.git
cd charisma-ai-render-deploy
```

### 2. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp env-example.txt .env.local

# Configure your environment variables
# See docs/DEPLOYMENT_CHECKLIST.md for required variables
```

### 4. Database Setup
```bash
# Run database migrations
npx prisma migrate dev

# Seed the database
npm run seed:modules

# Create admin user
npm run setup-admin
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application running.

## Contributing Process

### 1. Find or Create an Issue
- Check existing issues for bugs or feature requests
- Create a new issue if one doesn't exist
- Use appropriate issue templates
- Get approval before starting work on large features

### 2. Create a Branch
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Your Changes
- Follow our coding standards
- Write tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

### 4. Test Your Changes
```bash
# Run tests
npm run test

# Check for linting errors
npm run lint

# Verify build
npm run build

# Test locally
npm run dev
```

### 5. Submit a Pull Request
- Use our pull request template
- Provide clear description of changes
- Reference related issues
- Ensure all checks pass
- Request review from maintainers

## Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React Components
- Use functional components with hooks
- Follow component composition patterns
- Implement proper error boundaries
- Use TypeScript for prop definitions

### File Organization
```
app/                    # Next.js app router pages
components/            # Reusable React components
lib/                   # Utility functions and configurations
src/types/             # TypeScript type definitions
scripts/               # Build and setup scripts
docs/                  # Documentation files
```

### Naming Conventions
- Files: `kebab-case.tsx` or `camelCase.ts`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`

### Code Style
- Use ESLint and Prettier configurations
- Maximum line length: 100 characters
- Use meaningful comments for complex logic
- Follow DRY (Don't Repeat Yourself) principles

## Testing Guidelines

### Test Types
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **End-to-End Tests**: Test complete user workflows

### Testing Framework
- Jest for unit and integration tests
- React Testing Library for component tests
- Cypress for end-to-end tests (if applicable)

### Test Requirements
- All new features must include tests
- Bug fixes should include regression tests
- Maintain test coverage above 80%
- Test edge cases and error conditions

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

### Types of Documentation
- **Code Comments**: Explain complex logic and algorithms
- **API Documentation**: Document all endpoints and parameters
- **User Guides**: Help users understand features
- **Development Guides**: Help other developers contribute

### Documentation Standards
- Use clear, concise language
- Include code examples where appropriate
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

### Documentation Files
- `README.md`: Project overview and quick start
- `docs/`: Detailed documentation
- `CHANGELOG.md`: Version history and changes
- Inline comments in code

## Deployment

### Deployment Process
1. Changes are tested in development
2. Pull requests are reviewed and approved
3. Changes are merged to main branch
4. Automatic deployment to staging (if configured)
5. Manual deployment to production

### Environment Variables
- Never commit sensitive information
- Use environment variables for configuration
- Document all required variables
- Provide example values where appropriate

### Database Migrations
- Create migration scripts for schema changes
- Test migrations on sample data
- Provide rollback procedures
- Document breaking changes

## Analysis Template Development

### Template Standards
- Follow standardized template structure
- Include proper validation and error handling
- Provide comprehensive documentation
- Test with various input formats

### Template Validation
```bash
# Validate template standards
npm run validate:templates

# Test specific template
npm run test:template -- template-name
```

### Template Guidelines
- Use consistent output format
- Handle edge cases gracefully
- Optimize for performance
- Follow privacy guidelines

## Security Guidelines

### Security Best Practices
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP guidelines
- Regular security audits

### Data Privacy
- Minimize data collection
- Secure data transmission
- Implement data retention policies
- Respect user privacy preferences

## Community

### Communication Channels
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and ideas
- Pull Requests: Code review and collaboration

### Getting Help
- Check existing documentation
- Search through GitHub issues
- Create a new issue with detailed information
- Tag maintainers if urgent

### Recognition
- Contributors will be acknowledged in releases
- Significant contributions may be featured
- Regular contributors may be invited as maintainers

## Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- MAJOR.MINOR.PATCH
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Release Schedule
- Patch releases: As needed for critical fixes
- Minor releases: Monthly feature releases
- Major releases: Quarterly or for significant changes

Thank you for contributing to CharismaAI! Your contributions help make this project better for everyone.