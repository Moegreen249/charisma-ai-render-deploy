# Google Cloud Authentication Inventory

## Overview
This document provides a comprehensive inventory of all Google Cloud authentication references found in the charisma-ai codebase to guide the refactoring from legacy authentication methods to modern Vertex AI API setup.

## Current Authentication Pattern
- **Primary Method**: `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to service account JSON file
- **Service Account Key File**: `gcp-sa-key.json` (present in root directory)
- **Legacy Package**: `@google-cloud/aiplatform` v4.3.0

## Environment Variables & Configuration Files

### .env.local (Development)
```
GOOGLE_APPLICATION_CREDENTIALS=D:\projects\Gemini Agent\charisma-ai\gcp-sa-key.json
GOOGLE_CLOUD_PROJECT_ID=ambient-catcher-465513-g2
GOOGLE_CLOUD_REGION=us-central1
```

### .env (Shared)
```
# References in comments:
# - GOOGLE_APPLICATION_CREDENTIALS (line 22)
# - GOOGLE_CLOUD_PROJECT_ID (line 23)
# - GOOGLE_CLOUD_REGION (line 24)
```

### gcp-sa-key.json (Service Account Key)
- **Location**: Root directory
- **Type**: service_account
- **Project ID**: ambient-catcher-465513-g2
- **Client Email**: 764701250817-compute@developer.gserviceaccount.com
- **Status**: 🔴 SECURITY RISK - Contains private key in plaintext

## Source Code References

### Core Application Files

#### app/actions/analyze.ts
- **Lines 19, 366-370**: Import and usage of `@google-cloud/aiplatform.PredictionServiceClient`
- **Lines 478**: Error handling mentioning `GOOGLE_APPLICATION_CREDENTIALS`
- **Function**: `getVertexAiClient()` - Sets `process.env.GOOGLE_APPLICATION_CREDENTIALS`

#### app/actions/coach.ts
- **Lines 10, 112**: Import and error handling for `@google-cloud/aiplatform.PredictionServiceClient`
- **Lines 17-28**: `getVertexAiClient()` function using environment variables

#### app/actions/vertexModels.ts
- **Lines 3, 10, 18, 78**: Import and usage of `@google-cloud/aiplatform.ModelServiceClient`
- **Lines 22, 81**: Direct usage of `GOOGLE_APPLICATION_CREDENTIALS` for client configuration

#### lib/ai-providers.ts
- **Lines 167-192**: Vertex AI provider configuration
- **Line 169**: `apiKeyName: "VERTEX_AI_CONFIGURED"` (placeholder)

### Configuration & Setup Files

#### package.json
- **Lines 18-19**: Dependencies on `@google-cloud/aiplatform` and `@google-cloud/common`

#### scripts/setup-admin.ts
- **Line 12**: `GOOGLE_APPLICATION_CREDENTIALS` in required environment variables list

#### scripts/verify-env.ts
- **Line 11**: `GOOGLE_APPLICATION_CREDENTIALS` in validation list

### Test Files

#### test-updated-vertex-ai.js
- **Lines 21**: References to vertexModels.ts for testing

#### test-vertex-ai.js
- **Lines 20, 25, 48**: Multiple references to `GOOGLE_APPLICATION_CREDENTIALS`
- **Lines 44, 59**: Usage of `@google-cloud/aiplatform.ModelServiceClient`

#### test-vertex-ai-detailed.js
- **Lines 20, 24, 80, 83**: Multiple references to credential paths and ModelServiceClient

#### test-vertex-ai-fixed.js
- **Lines 20, 24**: References to ModelServiceClient and credentials

#### test-vertex-ai-paths.js
- **Lines 20, 23**: References to ModelServiceClient and credentials

#### test-vertex-ai-publishers.js
- **Lines 20, 23**: References to ModelServiceClient and credentials

### Documentation Files

#### ENVIRONMENT_SETUP.md
- **Lines 12, 29, 53, 75**: Multiple references to `GOOGLE_APPLICATION_CREDENTIALS`
- **Lines 13-14**: Project ID and region configuration

## Legacy Authentication Patterns Identified

### 1. Service Account Key File Authentication
- **Pattern**: JSON key file on filesystem
- **Files**: `gcp-sa-key.json`
- **Risk**: High - Private keys in plaintext

### 2. Environment Variable Based Authentication
- **Pattern**: `GOOGLE_APPLICATION_CREDENTIALS` pointing to key file
- **Usage**: All Vertex AI client instantiations
- **Scope**: Application-wide

### 3. Legacy @google-cloud/* Package Usage
- **Package**: `@google-cloud/aiplatform` v4.3.0
- **Client Types**: `PredictionServiceClient`, `ModelServiceClient`
- **Pattern**: Direct client instantiation with key file

## Security Vulnerabilities

### 🔴 Critical Issues
1. **Service Account Key Exposure**: `gcp-sa-key.json` contains private key
2. **Hardcoded Paths**: Absolute paths to credentials in `.env.local`
3. **Version Control Risk**: Risk of committing sensitive credentials

### 🟡 Configuration Issues
1. **Environment Variable Dependency**: Heavy reliance on `GOOGLE_APPLICATION_CREDENTIALS`
2. **Legacy Package Usage**: Using older authentication patterns
3. **Manual Client Management**: Manual client instantiation and configuration

## Refactoring Recommendations

### 1. Remove Legacy Files
- [ ] Delete `gcp-sa-key.json`
- [ ] Remove hardcoded credential paths from `.env.local`
- [ ] Update `.env` file comments

### 2. Update Dependencies
- [ ] Replace `@google-cloud/aiplatform` with modern Vertex AI SDK
- [ ] Remove `@google-cloud/common` if unused

### 3. Modernize Authentication
- [ ] Implement Application Default Credentials (ADC)
- [ ] Use Workload Identity for production
- [ ] Remove manual credential file handling

### 4. Update Code References
- [ ] Refactor `getVertexAiClient()` functions
- [ ] Update error handling messages
- [ ] Remove `GOOGLE_APPLICATION_CREDENTIALS` environment variable usage

### 5. Update Tests
- [ ] Modify all test files to use new authentication
- [ ] Remove credential file dependencies
- [ ] Update test patterns

## Files Requiring Modification

### High Priority (Core Functionality)
1. `app/actions/analyze.ts`
2. `app/actions/coach.ts`
3. `app/actions/vertexModels.ts`
4. `lib/ai-providers.ts`

### Medium Priority (Configuration)
5. `scripts/setup-admin.ts`
6. `scripts/verify-env.ts`
7. `package.json`

### Low Priority (Testing & Documentation)
8. `test-*.js` files (6 files)
9. `ENVIRONMENT_SETUP.md`
10. Environment files (`.env`, `.env.local`)

## Next Steps

1. **Backup Current Configuration**: Save working configuration before changes
2. **Update Dependencies**: Install modern Vertex AI SDK
3. **Refactor Core Files**: Start with high-priority files
4. **Test Authentication**: Verify new authentication works
5. **Remove Legacy Files**: Clean up old credential files
6. **Update Documentation**: Revise setup instructions

---

**Total Files Identified**: 15 core files + 6 test files + 3 config files = 24 files requiring modification
**Security Risk Level**: 🔴 High (due to exposed private keys)
**Refactoring Complexity**: Medium (straightforward API migration)
