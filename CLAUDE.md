# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run setup      # Initial setup
npm run setup-admin # Create admin user
npm run seed:modules # Seed analysis modules/templates
```

### Database Commands
```bash
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Run migrations in development
npx prisma migrate deploy # Run migrations in production
npx prisma studio    # Open Prisma Studio GUI
```

### Verification Commands
```bash
npm run verify-env    # Verify environment variables
npm run verify-setup  # Verify setup completion
npm run list-users    # List all users
```

### Testing
```bash
# Check for test script in package.json or common patterns
npm test            # If available
npm run test        # Alternative
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Providers**: Google Gemini, OpenAI, Anthropic Claude

### Key Architectural Patterns

1. **Server Components & Actions**
   - Uses Next.js App Router for server-side rendering
   - Server Actions in `app/actions/` for backend operations
   - API routes in `app/api/` for streaming and data operations

2. **Multi-Provider AI System**
   - Abstracted provider interface in `lib/ai/`
   - Template-based analysis system
   - Streaming response support
   - Provider switching capabilities

3. **Authentication & Authorization**
   - NextAuth.js configuration in `app/api/auth/[...nextauth]/route.ts`
   - Role-based access control (USER/ADMIN)
   - Protected routes with middleware

4. **Database Architecture**
   - Comprehensive Prisma schema with models for:
     - User management with roles
     - Analysis history tracking
     - Custom templates
     - Background jobs
     - Error tracking
     - Platform metrics

5. **Component Structure**
   - Feature-based organization in `components/`
   - Reusable UI components in `components/ui/`
   - Server/Client component separation

### Important Implementation Notes

1. **AI Integration**
   - Provider modules in `lib/ai/providers/`
   - Template validation in `lib/templates/`
   - Streaming utilities in `lib/ai/stream.ts`

2. **State Management**
   - Server state with Prisma
   - Client state with React hooks
   - Session management with NextAuth

3. **Error Handling**
   - Centralized error tracking in database
   - API error responses standardized
   - Client-side error boundaries

4. **Performance Considerations**
   - Turbopack for fast development builds
   - Server Components for reduced client bundle
   - Database query optimization with Prisma

5. **Security**
   - Environment-based API key management
   - Role-based route protection
   - Input validation with Zod schemas

### Deployment Configuration
- Render.com deployment with `render.yaml`
- Environment-specific settings
- Automated database migrations
- Health check endpoints at `/api/health`