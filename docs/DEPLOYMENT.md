# CharismaAI Deployment Guide

## Overview

This guide covers deploying CharismaAI to various platforms and environments. The application is built with Next.js 15 and can be deployed to any platform that supports Node.js applications.

## Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (or yarn)
- **Git**: For version control
- **API Keys**: Valid API keys for AI providers

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# AI Provider API Keys
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Analytics and Monitoring
NEXT_PUBLIC_GA_ID=your_google_analytics_id
SENTRY_DSN=your_sentry_dsn
```

## Local Development Deployment

### Development Server
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build (Local)
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Cloud Platform Deployment

### Vercel (Recommended)

Vercel is the recommended platform for Next.js applications due to its seamless integration and optimized performance.

#### Automatic Deployment

1. **Connect Repository**
   - Push your code to GitHub, GitLab, or Bitbucket
   - Sign up at [vercel.com](https://vercel.com)
   - Import your repository

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Set environment to "Production"

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Preview deployments are created for pull requests

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration

Create a `vercel.json` file for custom configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/coach/route.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Netlify

Netlify provides excellent support for Next.js applications with automatic deployments.

#### Setup

1. **Connect Repository**
   - Push code to Git repository
   - Sign up at [netlify.com](https://netlify.com)
   - Import your repository

2. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all required environment variables

4. **Deploy**
   - Netlify will automatically deploy on every push
   - Preview deployments for pull requests

#### Netlify Configuration

Create a `netlify.toml` file:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Railway

Railway provides simple deployment with automatic scaling.

#### Setup

1. **Connect Repository**
   - Push code to Git repository
   - Sign up at [railway.app](https://railway.app)
   - Deploy from GitHub

2. **Environment Variables**
   - Add environment variables in Railway dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   - Railway will automatically deploy and provide a URL

### Render

Render offers free hosting with automatic deployments.

#### Setup

1. **Create Service**
   - Sign up at [render.com](https://render.com)
   - Create new Web Service
   - Connect your Git repository

2. **Configuration**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   Environment: Node
   ```

3. **Environment Variables**
   - Add all required environment variables
   - Set `NODE_ENV=production`

## Self-Hosted Deployment

### Docker Deployment

#### Dockerfile

Create a `Dockerfile` in the root directory:

```dockerfile
# Use the official Node.js runtime as the base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  charisma-ai:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Build and Run

```bash
# Build the Docker image
docker build -t charisma-ai .

# Run with Docker Compose
docker-compose up -d

# Or run directly with Docker
docker run -p 3000:3000 \
  -e GOOGLE_GEMINI_API_KEY=your_key \
  -e OPENAI_API_KEY=your_key \
  -e ANTHROPIC_API_KEY=your_key \
  charisma-ai
```

### Traditional Server Deployment

#### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Node.js 18+
- Nginx
- PM2 (for process management)

#### Server Setup

1. **Install Node.js**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd charisma-ai
   ```

4. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

5. **Configure Environment**
   ```bash
   cp env-example.txt .env.local
   # Edit .env.local with your API keys
   ```

6. **Start with PM2**
   ```bash
   pm2 start npm --name "charisma-ai" -- start
   pm2 save
   pm2 startup
   ```

#### Nginx Configuration

Create `/etc/nginx/sites-available/charisma-ai`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for streaming responses
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Static files
    location /_next/static/ {
        alias /path/to/charisma-ai/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/charisma-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL Configuration

Install Certbot for Let's Encrypt SSL:

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Environment-Specific Configurations

### Development Environment

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging Environment

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
```

### Production Environment

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Monitoring and Logging

### Application Monitoring

#### Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add health check logic here
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

#### Logging Configuration

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

### Performance Monitoring

#### Vercel Analytics

Add to `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Sentry Integration

Install Sentry:

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## Security Considerations

### Environment Variables

- Never commit API keys to version control
- Use environment-specific configuration files
- Rotate API keys regularly
- Use secrets management services in production

### HTTPS Configuration

- Always use HTTPS in production
- Configure HSTS headers
- Use secure cookies
- Implement CSP headers

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map();

export function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // requests per window

  const requestCount = rateLimit.get(ip) || 0;
  
  if (requestCount >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  rateLimit.set(ip, requestCount + 1);
  
  // Clean up old entries
  setTimeout(() => {
    rateLimit.delete(ip);
  }, windowMs);

  return null;
}
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variable Issues
- Verify all required environment variables are set
- Check for typos in variable names
- Ensure variables are set for the correct environment

#### Performance Issues
- Enable Next.js production optimizations
- Use CDN for static assets
- Implement caching strategies
- Monitor bundle size

#### API Key Issues
- Verify API keys are valid and have sufficient credits
- Check rate limits and quotas
- Test API keys independently

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check build output
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Check bundle size
npm run build && npx @next/bundle-analyzer

# Check environment variables
echo $NODE_ENV
echo $GOOGLE_GEMINI_API_KEY
```

## Backup and Recovery

### Database Backup (Future)
When database integration is added:

```bash
# Backup user data
pg_dump -h localhost -U username -d charisma_ai > backup.sql

# Restore from backup
psql -h localhost -U username -d charisma_ai < backup.sql
```

### Configuration Backup
```bash
# Backup environment configuration
cp .env.local .env.local.backup

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.backup
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancers for multiple instances
- Implement session management
- Use shared storage for user data
- Configure auto-scaling policies

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize application performance
- Use caching strategies
- Implement database optimization

### CDN Configuration
- Configure CDN for static assets
- Use edge caching for API responses
- Implement cache invalidation strategies
- Monitor CDN performance

## Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Update Node.js version
# Use nvm or similar version manager
```

### Monitoring Tasks
- Monitor application performance
- Check error rates and logs
- Monitor API usage and costs
- Review security updates

### Backup Schedule
- Daily: Configuration backups
- Weekly: Full system backups
- Monthly: Security audits
- Quarterly: Performance reviews

---

This deployment guide covers the essential aspects of deploying CharismaAI to various platforms. Choose the deployment method that best fits your requirements and infrastructure. For additional support, refer to the platform-specific documentation or community resources. 