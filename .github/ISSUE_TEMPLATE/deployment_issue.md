---
name: Deployment Issue
about: Report issues related to deployment on Render.com or other platforms
title: '[DEPLOY] '
labels: 'deployment'
assignees: ''

---

## Deployment Issue Description
A clear and concise description of the deployment issue you're experiencing.

## Deployment Platform
- [ ] Render.com
- [ ] Vercel
- [ ] Netlify
- [ ] Heroku
- [ ] AWS
- [ ] Google Cloud Platform
- [ ] Other: ___________

## Deployment Stage
Where in the deployment process is the issue occurring?
- [ ] Repository connection
- [ ] Environment variable setup
- [ ] Build process
- [ ] Database migration
- [ ] Application startup
- [ ] Runtime/Post-deployment

## Error Information

### Build Logs
If you're experiencing build issues, please paste the relevant build logs:
```
Paste build logs here
```

### Runtime Logs
If the application builds but fails at runtime, please paste runtime logs:
```
Paste runtime logs here
```

### Error Messages
Any specific error messages you're seeing:
```
Paste error messages here
```

## Environment Configuration

### Environment Variables Set
Please confirm which environment variables you have configured:
- [ ] DATABASE_URL
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GOOGLE_API_KEY
- [ ] OPENAI_API_KEY
- [ ] ANTHROPIC_API_KEY
- [ ] GOOGLE_CLOUD_PROJECT_ID
- [ ] GOOGLE_CLOUD_LOCATION

### Database Configuration
- Database Type: [e.g. PostgreSQL, MySQL]
- Database Version: [e.g. PostgreSQL 14]
- Connection Status: [Working/Not Working/Unknown]

## Deployment Configuration

### render.yaml Status
- [ ] Using the provided render.yaml without modifications
- [ ] Modified render.yaml (please describe changes)
- [ ] Not using render.yaml (using platform UI instead)

### Build Command Used
```
Paste your build command here
```

### Start Command Used
```
Paste your start command here
```

## Steps Taken
What steps have you already tried to resolve this issue?
1. 
2. 
3. 

## Expected Behavior
What should happen when the deployment is successful?

## Additional Context

### Repository Information
- Branch being deployed: [e.g. main, deploy]
- Last working deployment: [Date/commit if known]
- Recent changes made: [Describe any recent changes]

### Platform-Specific Details
If using Render.com:
- Service type: [Web Service/Background Worker]
- Plan: [Free/Starter/Standard/Pro]
- Region: [e.g. Oregon, Frankfurt]

### Related Documentation
Have you consulted the following documentation?
- [ ] README.md deployment instructions
- [ ] docs/RENDER_DEPLOYMENT.md
- [ ] docs/DEPLOYMENT_CHECKLIST.md
- [ ] Platform-specific documentation

## Urgency Level
- [ ] Critical - Production is down
- [ ] High - Deployment is blocked
- [ ] Medium - Deployment works but with issues
- [ ] Low - Questions/optimization

## Screenshots
If applicable, add screenshots of error messages, configuration screens, or logs.

## Checklist
- [ ] I have reviewed the deployment documentation
- [ ] I have verified all required environment variables are set
- [ ] I have checked that the database is accessible
- [ ] I have included relevant logs and error messages
- [ ] I have described the exact steps that lead to the issue