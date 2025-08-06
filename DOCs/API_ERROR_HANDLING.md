# Enhanced API Error Handling

This document describes the enhanced API error handling system implemented for the CharismaAI story management features.

## Overview

The enhanced error handling system provides:
- Standardized error response format
- Comprehensive error codes with HTTP status mapping
- Detailed logging and debugging information
- Request tracking and performance monitoring
- Integration with existing error management system
- Security headers and proper error sanitization

## Core Components

### 1. Error Response Interface

All API errors now follow a standardized format:

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
    retryable: boolean;
    retryAfter?: number; // seconds for rate limiting
  };
}
```

### 2. Success Response Interface

All API successes follow this format:

```typescript
interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}
```

### 3. Error Codes

Comprehensive error codes are available:

#### Authentication & Authorization
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `TOKEN_EXPIRED` - Session expired

#### Resource Errors
- `NOT_FOUND` - Resource not found
- `RESOURCE_EXISTS` - Resource already exists

#### Validation Errors
- `VALIDATION_ERROR` - General validation failure
- `INVALID_INPUT` - Invalid input data
- `MISSING_REQUIRED_FIELD` - Required fields missing

#### Business Logic Errors
- `STORY_NOT_COMPLETED` - Story not ready for operation
- `STORY_GENERATION_FAILED` - Story generation failed
- `OPERATION_NOT_ALLOWED` - Operation not permitted

#### System Errors
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - External service unavailable
- `INTERNAL_SERVER_ERROR` - General server error
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `TIMEOUT` - Request timeout
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

## Usage

### 1. Creating Error Responses

```typescript
import { createApiErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

// Basic error
return createApiErrorResponse(ApiErrorCode.NOT_FOUND);

// Error with custom message
return createApiErrorResponse(
  ApiErrorCode.VALIDATION_ERROR,
  'Email format is invalid'
);

// Error with details (development only)
return createApiErrorResponse(
  ApiErrorCode.DATABASE_ERROR,
  undefined,
  { query: 'SELECT * FROM stories', error: 'Connection timeout' }
);
```

### 2. Creating Success Responses

```typescript
import { createApiSuccessResponse } from '@/lib/api-error-handler';

// Basic success
return createApiSuccessResponse({ message: 'Story deleted successfully' });

// Success with custom status
return createApiSuccessResponse({ created: true }, 201);
```

### 3. Using the Error Handler Wrapper

```typescript
import { withApiErrorHandler } from '@/lib/api-error-handler';

export const GET = withApiErrorHandler(async (request: NextRequest) => {
  // Your API logic here
  // Errors are automatically caught and standardized
  
  const data = await someOperation();
  return createApiSuccessResponse(data);
}, '/api/stories');
```

### 4. Validation Utilities

```typescript
import { validateRequiredFields, validatePaginationParams } from '@/lib/api-error-handler';

// Validate required fields
const validation = validateRequiredFields(requestBody, ['name', 'email']);
if (!validation.isValid) {
  return createApiErrorResponse(
    ApiErrorCode.MISSING_REQUIRED_FIELD,
    `Missing required fields: ${validation.missingFields.join(', ')}`
  );
}

// Validate pagination
const { page, limit, offset } = validatePaginationParams(
  searchParams.get('page'),
  searchParams.get('limit')
);
```

## Logging and Monitoring

### Request Tracking

Every request gets a unique ID for tracking:
- Logged at request start and completion
- Included in error responses
- Available in response headers as `X-Request-ID`

### Performance Monitoring

The system tracks:
- Request duration
- Database operation timing
- Error frequency and patterns
- API endpoint performance

### Error Reporting

Errors are automatically:
- Logged to console with structured format
- Reported to the error management system
- Sent to external monitoring services (production)
- Categorized by type and severity

## Error Handler Features

### Automatic Error Classification

The error handler automatically detects and classifies:
- Database errors (Prisma-related)
- Validation errors
- Network/timeout errors
- Authentication errors

### Security Features

- Sensitive error details hidden in production
- Security headers added to all responses
- Request sanitization and validation
- Rate limiting support

### Retry Logic

Errors are marked as retryable or non-retryable:
- Retryable: Database errors, timeouts, service unavailable
- Non-retryable: Validation errors, authentication errors, not found

## Integration with Existing Systems

### Error Management System

Integrates with `lib/error-management.ts`:
- Reports errors for monitoring
- Categorizes by type and severity
- Provides error statistics

### Security System

Uses `lib/security.ts`:
- Adds security headers to responses
- Sanitizes error details in production

### Logging System

Uses `lib/api-logger.ts`:
- Structured logging with request context
- Performance monitoring
- Error tracking and analysis

## Best Practices

### 1. Use Specific Error Codes

```typescript
// Good
return createApiErrorResponse(ApiErrorCode.STORY_NOT_COMPLETED);

// Avoid
return createApiErrorResponse(ApiErrorCode.VALIDATION_ERROR);
```

### 2. Provide Helpful Messages

```typescript
// Good
return createApiErrorResponse(
  ApiErrorCode.INVALID_INPUT,
  'Story ID must be a valid UUID format'
);

// Avoid
return createApiErrorResponse(ApiErrorCode.INVALID_INPUT);
```

### 3. Use the Error Handler Wrapper

```typescript
// Good
export const GET = withApiErrorHandler(async (request) => {
  // API logic
}, '/api/stories');

// Avoid manual try-catch everywhere
export async function GET(request) {
  try {
    // API logic
  } catch (error) {
    // Manual error handling
  }
}
```

### 4. Validate Input Early

```typescript
// Validate at the start of your handler
const validation = validateRequiredFields(data, ['title', 'content']);
if (!validation.isValid) {
  return createApiErrorResponse(
    ApiErrorCode.MISSING_REQUIRED_FIELD,
    `Missing: ${validation.missingFields.join(', ')}`
  );
}
```

## Migration Guide

### Updating Existing API Routes

1. Import the new utilities:
```typescript
import { 
  createApiErrorResponse, 
  createApiSuccessResponse, 
  withApiErrorHandler, 
  ApiErrorCode 
} from '@/lib/api-error-handler';
```

2. Wrap your handler:
```typescript
export const GET = withApiErrorHandler(async (request) => {
  // Your existing logic
}, '/api/your-endpoint');
```

3. Replace error responses:
```typescript
// Old
return NextResponse.json({ error: "Not found" }, { status: 404 });

// New
return createApiErrorResponse(ApiErrorCode.NOT_FOUND);
```

4. Replace success responses:
```typescript
// Old
return NextResponse.json({ data: result });

// New
return createApiSuccessResponse(result);
```

## Testing

The error handling system includes comprehensive tests covering:
- Error response formatting
- Success response formatting
- Validation utilities
- Error classification
- Request tracking

Run tests with:
```bash
npm test lib/__tests__/api-error-handler.test.ts
```

## Monitoring and Debugging

### Request Tracking

Use the request ID to track requests across logs:
```bash
grep "req_1234567890_abc123" logs/
```

### Error Analysis

Monitor error patterns:
- Check error frequency by type
- Identify performance bottlenecks
- Track retry success rates

### Performance Monitoring

The system provides metrics for:
- Average response times
- Error rates by endpoint
- Database operation performance
- 95th percentile response times

## Future Enhancements

Planned improvements:
- Circuit breaker pattern for external services
- Advanced rate limiting with user-specific limits
- Error recovery suggestions
- Automated error pattern detection
- Integration with APM tools (DataDog, New Relic)