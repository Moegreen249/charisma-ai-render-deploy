# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server (with migrations)
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
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
npm run db:reset     # Reset database only
npm run db:reset-seed # Reset database and seed with demo data
npm run db:diagnose  # Run database diagnostics
npm run db:maintenance # Run database maintenance tasks
npm run update-models # Update AI models to latest versions
```

### Quality & Verification Commands
```bash
npm run verify-env    # Verify environment variables
npm run verify-setup  # Verify setup completion
npm run list-users    # List all users
npm run quality       # Run comprehensive code quality checks
npm run quality:quick # Run quick quality checks
npm run quality:fix   # Auto-fix linting and formatting issues
npm run test:quality  # Run typecheck, lint, and format checks
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

### Testing
```bash
npm run test         # Run Vitest tests
npm run test:run     # Run tests once (no watch mode)
npm run test:ui      # Run tests with Vitest UI
npm run test:quality # Run typecheck, lint, and format checks
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: Zustand for client state, React hooks
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Prisma adapter
- **AI Providers**: Google Gemini/GenAI, OpenAI, Anthropic Claude, Google Vertex AI
- **Analytics**: Vercel Analytics and Speed Insights
- **Email**: Resend for transactional emails
- **Animations**: Framer Motion
- **Testing**: Vitest with Node.js environment

### Key Architectural Patterns

1. **Server Components & Actions**
   - Uses Next.js App Router for server-side rendering
   - Server Actions in `app/actions/` for backend operations
   - API routes in `app/api/` for streaming and data operations

2. **Multi-Provider AI System**
   - Abstracted provider interface in `lib/ai-providers.ts`
   - Template-based analysis system in `lib/analysis-templates.ts`
   - Streaming response support
   - Provider switching capabilities

3. **Authentication & Authorization**
   - NextAuth.js configuration in `app/api/auth/[...nextauth]/route.ts`
   - Role-based access control (USER/ADMIN)
   - Middleware protection for admin routes (`/admin/*`, `/api/admin/*`)
   - Prisma adapter for session persistence

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
   - Provider modules in `lib/ai-providers.ts`
   - Template validation in `lib/template-standards.ts`
   - Streaming utilities in API routes

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
- Automated database migrations on production start
- Health check endpoints at `/api/health`

## Important Workflow Patterns

### Development Workflow
1. Always run `npm run typecheck` and `npm run lint` before committing
2. Use `npm run quality:fix` to auto-resolve formatting issues
3. Database changes require running `npx prisma migrate dev` locally
4. Test admin functionality with `npm run setup-admin` after database resets
5. Run tests with `npm run test` - focused test files are in `lib/__tests__/`

### Testing Strategy
- **Test Framework**: Vitest with Node.js environment for server-side testing
- **Test Location**: Primary tests in `lib/__tests__/` directory
- **Test Types**: Integration tests for services (admin, subscription, task queue)
- **Test Setup**: Global setup file at `lib/__tests__/setup.ts`
- **Key Test Areas**: Admin services, API error handling, subscription management, task queue processing

### AI Provider Integration
- New providers must implement the `AIProviderConfig` interface
- Models are configured in `lib/ai-providers.ts` with availability flags
- Streaming responses handled via `/api/story/generate` endpoint
- Provider selection is dynamic based on available API keys

### Database Migrations
- Development: Use `npx prisma migrate dev` with descriptive names
- Production: Migrations run automatically on `npm start`
- Reset workflows: Use `npm run db:reset-seed` for clean development state
- Diagnostics: Run `npm run db:diagnose` for connection/schema issues

### Admin System Access
- Admin routes protected by middleware at `middleware.ts`
- Admin user creation via `npm run setup-admin` script
- Role validation happens at both middleware and API levels
- Admin API endpoints follow `/api/admin/*` pattern

## Important Development Guidelines

### File Management
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested