# CharismaAI Authentication Setup Guide

This guide covers the complete setup of the NextAuth.js authentication system for CharismaAI, including database configuration, admin user creation, and testing.

## 🚀 Quick Start

### 1. Environment Configuration

Copy the environment variables to your `.env.local` file:

```env
# NextAuth.js Configuration
NEXTAUTH_SECRET=56a71793be6f91db09d0c3e28c617c6f3516ba3fd80a1da2c14d904ffbf7d09c
NEXTAUTH_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/charisma_ai?schema=public"

# AI Provider Keys (existing)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Vertex AI (Google Cloud)
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
GOOGLE_CLOUD_REGION=us-central1
# Authenticate with: gcloud auth application-default login

> **Note:** Use Application Default Credentials (ADC) for Google Cloud authentication. Legacy service account key files and manual credential file handling are no longer supported. See ENVIRONMENT_SETUP.md for details.

> **Deprecated:** Legacy authentication flows and manual credential file handling have been removed. Use ADC and the modern Vertex AI SDK for all deployments.
```

### 2. Database Setup

The Prisma schema is already configured with NextAuth.js models. Run the migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 3. Create Admin User

Use the provided script to create an admin user:

```bash
npm run setup-admin admin@charisma-ai.com admin123 "Admin User"
```

### 4. Test Authentication

1. Start the development server: `npm run dev`
2. Navigate to `/auth/signin`
3. Sign in with your admin credentials
4. You should be redirected to `/admin` dashboard

## 📁 File Structure

```
charisma-ai/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth.js API route
│   ├── auth/
│   │   ├── signin/page.tsx              # Sign-in page
│   │   └── error/page.tsx               # Auth error page
│   ├── admin/
│   │   └── page.tsx                     # Admin dashboard
│   └── layout.tsx                       # Root layout with SessionProvider
├── components/
│   └── Providers.tsx                    # SessionProvider wrapper
├── lib/
│   ├── prisma.ts                        # Prisma client singleton
│   ├── auth.ts                          # Password utilities
│   ├── admin-setup.ts                   # Admin user management
│   └── hooks/
│       └── useAuth.ts                   # Authentication hooks
├── src/types/
│   └── next-auth.d.ts                   # NextAuth.js type extensions
├── middleware.ts                        # Route protection
├── prisma/
│   └── schema.prisma                    # Database schema
└── scripts/
    └── setup-admin.ts                   # Admin user creation script
```

## 🔧 Configuration Details

### NextAuth.js Configuration

The authentication is configured in `app/api/auth/[...nextauth]/route.ts`:

- **Provider**: Credentials provider for email/password authentication
- **Adapter**: PrismaAdapter for database integration
- **Session Strategy**: JWT for stateless sessions
- **Callbacks**: Include user roles in JWT and session
- **Pages**: Custom sign-in and error pages

### Database Schema

The Prisma schema includes:

- **User Model**: Extended with role field (USER/ADMIN)
- **NextAuth Models**: Account, Session, VerificationToken
- **Role Enum**: USER and ADMIN roles

### TypeScript Types

Extended NextAuth.js types in `src/types/next-auth.d.ts`:

- Session includes user role
- User object includes role
- JWT includes role and user ID

## 🛡️ Security Features

### Password Security
- **Hashing**: bcryptjs with 12 salt rounds
- **Verification**: Secure password comparison
- **Generation**: Secure random password generation

### Route Protection
- **Middleware**: Protects admin routes
- **Hooks**: Custom authentication hooks
- **Role-based Access**: Admin-only routes

### Session Management
- **JWT Strategy**: Stateless sessions
- **Secure Cookies**: HTTP-only, secure cookies
- **Session Validation**: Server-side validation

## 🔐 User Management

### Creating Users

#### Admin User
```bash
npm run setup-admin admin@example.com password123 "Admin Name"
```

#### Programmatic Creation
```typescript
import { createAdminUser, createUser } from '@/lib/admin-setup'

// Create admin user
await createAdminUser('admin@example.com', 'password123', 'Admin User')

// Create regular user
await createUser('user@example.com', 'password123', 'Regular User')
```

### User Operations

```typescript
import { listUsers, updateUserRole, deleteUser } from '@/lib/admin-setup'

// List all users
const users = await listUsers()

// Update user role
await updateUserRole('user-id', 'ADMIN')

// Delete user
await deleteUser('user-id')
```

## 🧪 Testing

### Manual Testing

1. **Sign In Flow**:
   - Navigate to `/auth/signin`
   - Enter valid credentials
   - Verify redirect to appropriate page

2. **Admin Access**:
   - Sign in as admin user
   - Access `/admin` dashboard
   - Verify admin-only features

3. **Role Protection**:
   - Sign in as regular user
   - Try to access `/admin`
   - Verify redirect to home page

4. **Error Handling**:
   - Enter invalid credentials
   - Verify error messages
   - Test error page at `/auth/error`

### Automated Testing

Create test files for authentication:

```typescript
// __tests__/auth.test.ts
import { createAdminUser, verifyPassword } from '@/lib/auth'

describe('Authentication', () => {
  it('should create admin user', async () => {
    const user = await createAdminUser('test@example.com', 'password123')
    expect(user.role).toBe('ADMIN')
  })

  it('should verify password', async () => {
    const isValid = await verifyPassword('password123', hashedPassword)
    expect(isValid).toBe(true)
  })
})
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check database connection
npx prisma db push

# Reset database (development only)
npx prisma migrate reset
```

#### NextAuth Configuration
```bash
# Check environment variables
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL

# Regenerate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### TypeScript Errors
```bash
# Check types
npx tsc --noEmit

# Regenerate Prisma client
npx prisma generate
```

### Debug Mode

Enable NextAuth.js debug mode:

```env
NEXTAUTH_DEBUG=true
```

### Logs

Check console logs for authentication errors:

```typescript
// In NextAuth configuration
callbacks: {
  async signIn({ user, account, profile, email, credentials }) {
    console.log('Sign in attempt:', { user, account, credentials })
    return true
  }
}
```

## 🔄 Production Deployment

### Environment Variables

Update for production:

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
DATABASE_URL=your-production-database-url
```

### Security Headers

Add security headers in `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}
```

### Database

For production database:

1. **PostgreSQL**: Use managed PostgreSQL service
2. **Connection Pooling**: Configure connection pooling
3. **Backups**: Set up automated backups
4. **Monitoring**: Monitor database performance

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js/)

## 🤝 Contributing

When contributing to authentication features:

1. **Security First**: Always prioritize security
2. **Test Thoroughly**: Test all authentication flows
3. **Document Changes**: Update this guide
4. **Follow Patterns**: Use existing authentication patterns

---

**Authentication Setup Complete!** 🎉

Your CharismaAI application now has a secure, role-based authentication system ready for production use. 