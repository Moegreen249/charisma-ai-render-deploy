# Story Feature Setup Guide

The AI Story Generation feature transforms analysis results into engaging narrative timelines. This guide covers setup and troubleshooting.

## Quick Setup

### 1. Database Migration
First, ensure the database schema is up to date:
```bash
# Run database migrations
npx prisma migrate deploy
```

### 2. Initialize Story Settings
Run the story initialization script:
```bash
# Initialize story settings with defaults
npm run init:story
```

### 3. Enable Story Feature
1. Login as admin
2. Go to `/admin/modules`
3. Find "Story Generation" module
4. Enable the feature
5. Configure AI provider settings

## Configuration

### Environment Variables Required
```bash
# At least one AI provider API key
GOOGLE_GEMINI_API_KEY="your-google-api-key"    # Recommended
OPENAI_API_KEY="your-openai-api-key"           # Optional
ANTHROPIC_API_KEY="your-anthropic-api-key"     # Optional
```

### Default Settings
- **Provider**: Google Gemini (gemini-1.5-flash)
- **Free Trial**: 7 days, 3 stories
- **Pro Feature**: Enabled
- **Timeout**: 120 seconds

## Troubleshooting

### 500 Error on `/api/admin/story-settings`
**Cause**: Database tables not created or migration not run.

**Solution**:
1. Run database migration: `npx prisma migrate deploy`
2. Initialize story settings: `npm run init:story`
3. Restart the application

### Story Generation Fails
**Cause**: Missing AI provider API key or invalid configuration.

**Solution**:
1. Check environment variables are set
2. Verify API keys are valid
3. Check admin panel for provider settings
4. Review error logs in admin error management

### Story Button Not Appearing
**Cause**: Feature disabled or user doesn't have access.

**Solution**:
1. Enable story feature in admin modules
2. Check user has pro subscription or free trial
3. Verify analysis exists and is completed

## Database Models

### StorySettings
Stores global configuration for story generation.

### Story
Individual story records linked to analysis results.

### UserStoryUsage
Tracks user story generation usage and trial status.

## API Endpoints

- `GET /api/admin/story-settings` - Get story configuration
- `POST /api/admin/story-settings` - Update story settings
- `POST /api/story/generate` - Generate story from analysis
- `GET /api/story/[id]` - Get story content

## Production Deployment

1. **Database Migration**: Run `npx prisma migrate deploy` in production
2. **Story Initialization**: Run `npm run init:story` after migration
3. **Environment Variables**: Ensure AI provider keys are set
4. **Admin Setup**: Enable and configure through admin panel

## Feature Access

- **Free Users**: Limited trial access (configurable)
- **Pro Users**: Unlimited story generation
- **Admins**: Full configuration control

## Support

If issues persist:
1. Check application logs
2. Review admin error management panel
3. Verify database connection and schema
4. Confirm AI provider API quotas and limits