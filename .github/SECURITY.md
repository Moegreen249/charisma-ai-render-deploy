# Security Policy

## Supported Versions

We actively support the following versions of CharismaAI with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at CharismaAI. If you discover a security vulnerability, please follow these guidelines:

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities via:

1. **Email**: Send details to [security@charisma-ai.com](mailto:security@charisma-ai.com)
2. **GitHub Security Advisory**: Use the "Report a vulnerability" button in the Security tab
3. **Private Message**: Contact the maintainers directly through GitHub

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths** of source file(s) related to the manifestation of the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it

### Our Response Process

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
2. **Investigation**: We will investigate and validate the reported vulnerability
3. **Timeline**: We will provide an estimated timeline for addressing the issue
4. **Resolution**: We will develop and test a fix
5. **Disclosure**: We will coordinate disclosure with you after the fix is released
6. **Credit**: We will publicly credit you for the discovery (unless you prefer to remain anonymous)

### Expected Response Times

- **Critical vulnerabilities**: 24-48 hours for initial response, 7 days for fix
- **High severity**: 48-72 hours for initial response, 14 days for fix
- **Medium/Low severity**: 1 week for initial response, 30 days for fix

## Security Features

### Data Protection

- **Encryption**: All data transmission uses HTTPS/TLS
- **Database**: Sensitive data is encrypted at rest
- **Authentication**: Secure OAuth2 implementation with Google
- **Session Management**: Secure session handling with NextAuth.js

### Input Validation

- **Chat Upload**: File type and size validation
- **API Endpoints**: Comprehensive input sanitization
- **SQL Injection**: Parameterized queries via Prisma ORM
- **XSS Protection**: Content Security Policy and input escaping

### Access Controls

- **Authentication Required**: All sensitive operations require authentication
- **Role-Based Access**: User and admin role separation
- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Proper cross-origin resource sharing setup

### AI/ML Security

- **Prompt Injection Protection**: Input sanitization for AI models
- **Data Privacy**: Chat data is processed securely and not stored permanently
- **API Key Security**: Secure management of third-party API keys
- **Model Access**: Controlled access to AI/ML services

## Security Configuration

### Environment Variables

Ensure the following security-related environment variables are properly configured:

```bash
# Authentication
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=<your-production-url>

# Database (use strong credentials)
DATABASE_URL=postgresql://user:password@host:port/db

# API Keys (rotate regularly)
GOOGLE_API_KEY=<your-google-api-key>
OPENAI_API_KEY=<your-openai-api-key>
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

### Database Security

- Use strong, unique passwords for database users
- Enable SSL/TLS for database connections
- Regularly update database software
- Implement proper backup and recovery procedures
- Follow principle of least privilege for database access

### Deployment Security

- Keep all dependencies up to date
- Use secure deployment practices
- Implement proper logging and monitoring
- Regular security scans and audits
- Environment separation (dev/staging/production)

## Known Security Considerations

### Chat Data Processing

- **Data Retention**: Chat data is processed in memory and not permanently stored
- **Anonymization**: Personal identifiers should be removed before analysis
- **Consent**: Users should consent to analysis of their chat data
- **Geographic Compliance**: Consider GDPR, CCPA, and other privacy regulations

### Third-Party Services

- **Google Cloud AI**: Data processed through Google's AI services
- **OpenAI**: Optional integration with OpenAI APIs
- **Anthropic**: Optional integration with Anthropic APIs
- **Database Provider**: Data stored with your chosen database provider

### Recommendations for Users

1. **Remove Personal Information**: Strip personal identifiers from chat data before upload
2. **Use Test Data**: Use anonymized or synthetic data for testing
3. **Regular Audits**: Regularly review access logs and user activities
4. **Environment Variables**: Never commit sensitive environment variables to version control
5. **HTTPS**: Always use HTTPS in production environments

## Security Audits

We recommend regular security audits including:

- **Dependency Scanning**: Regular checks for vulnerable dependencies
- **Code Review**: Security-focused code reviews for all changes
- **Penetration Testing**: Periodic security testing by qualified professionals
- **Access Review**: Regular review of user access and permissions

## Compliance

CharismaAI is designed to help organizations comply with:

- **GDPR**: General Data Protection Regulation
- **CCPA**: California Consumer Privacy Act
- **SOC 2**: Service Organization Control 2
- **HIPAA**: Health Insurance Portability and Accountability Act (with proper configuration)

Note: Compliance requirements vary by organization and use case. Consult with legal and compliance teams for your specific requirements.

## Security Updates

- Security updates are released as soon as possible after discovery
- Critical security updates may be released outside of regular release cycles
- Users are notified of security updates through GitHub releases and security advisories
- We recommend enabling GitHub security alerts for automatic notifications

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we appreciate responsible disclosure of security vulnerabilities. Recognition will be provided for verified security reports.

## Contact

For security-related questions or concerns:

- **Security Team**: [security@charisma-ai.com](mailto:security@charisma-ai.com)
- **General Issues**: Use GitHub issues for non-security related problems
- **Documentation**: Refer to our security documentation in the `docs/` directory

---

**Last Updated**: December 2024  
**Next Review**: March 2025