# API Integration Guide - CharismaAI

**Developed by Mohamed Abdelrazig - MAAM**

## Overview

The CharismaAI API provides programmatic access to our AI-powered communication analysis platform. This guide covers everything you need to integrate CharismaAI into your applications, workflows, and systems.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Format](#requestresponse-format)
5. [Analysis Templates](#analysis-templates)
6. [Code Examples](#code-examples)
7. [SDKs and Libraries](#sdks-and-libraries)
8. [Webhooks](#webhooks)
9. [Rate Limiting](#rate-limiting)
10. [Error Handling](#error-handling)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- CharismaAI account (Free or Premium)
- API access enabled in your account
- Basic understanding of REST APIs
- Development environment setup

### Quick Start
1. **Get API Key**: Generate API key from your account settings
2. **Test Connection**: Make a simple API call to verify access
3. **Choose Template**: Select appropriate analysis template
4. **Send Request**: Submit conversation for analysis
5. **Retrieve Results**: Get analysis results and insights

### Base URL
```
https://your-charisma-ai-domain.com/api
```

---

## Authentication

### API Key Authentication

All API requests require authentication using an API key in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
```

### Getting Your API Key

1. **Login to CharismaAI**: Access your account dashboard
2. **Navigate to Settings**: Go to Account Settings > API Access
3. **Generate Key**: Click "Generate New API Key"
4. **Copy Key**: Securely store your API key
5. **Set Permissions**: Configure API key permissions and restrictions

### Security Best Practices

#### Key Management
- **Secure Storage**: Store API keys in environment variables
- **Regular Rotation**: Rotate keys periodically for security
- **Scope Limitation**: Use minimum required permissions
- **Monitor Usage**: Track API key usage and access patterns

#### Example Environment Setup
```bash
# .env file
CHARISMA_AI_API_KEY=your_api_key_here
CHARISMA_AI_BASE_URL=https://your-domain.com/api
```

---

## API Endpoints

### Core Analysis Endpoints

#### Start Analysis
```http
POST /api/analyze
```
Submit conversation text for analysis

#### Get Analysis Status
```http
GET /api/analysis/{analysisId}
```
Check analysis progress and retrieve results

#### List Analyses
```http
GET /api/history
```
Get list of your previous analyses

#### Delete Analysis
```http
DELETE /api/analysis/{analysisId}
```
Remove analysis and associated data

### Template Management

#### Get Templates
```http
GET /api/templates
```
List available analysis templates

#### Get Template Details
```http
GET /api/templates/{templateId}
```
Get detailed information about specific template

### Account Management

#### Get Account Info
```http
GET /api/account
```
Retrieve account information and usage statistics

#### Get Usage Statistics
```http
GET /api/account/usage
```
Get API usage metrics and limits

### Health and Status

#### Health Check
```http
GET /api/health
```
Check API service status and availability

#### System Status
```http
GET /api/status
```
Get detailed system status information

---

## Request/Response Format

### Content Type
All requests should use JSON format:
```http
Content-Type: application/json
```

### Standard Request Structure
```json
{
  "text": "conversation text here",
  "templateId": "template-identifier",
  "settings": {
    "provider": "google",
    "privacy": "private",
    "retention": "30days"
  },
  "metadata": {
    "title": "Analysis Title",
    "description": "Optional description",
    "tags": ["tag1", "tag2"]
  }
}
```

### Standard Response Structure
```json
{
  "success": true,
  "data": {
    "id": "analysis_123456",
    "status": "completed",
    "results": { /* analysis results */ },
    "metadata": { /* analysis metadata */ }
  },
  "error": null,
  "timestamp": "2025-01-25T10:30:00Z"
}
```

### Error Response Structure
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Detailed error message",
    "details": {
      "field": "text",
      "issue": "Text content is required"
    }
  },
  "timestamp": "2025-01-25T10:30:00Z"
}
```

---

## Analysis Templates

### Available Templates

#### 1. Communication Analysis (`communication-analysis`)
```json
{
  "id": "communication-analysis",
  "name": "Communication Analysis",
  "description": "General communication pattern analysis",
  "category": "general",
  "parameters": {
    "focus_areas": ["patterns", "effectiveness", "engagement"],
    "depth": "standard"
  }
}
```

#### 2. Relationship Analysis (`relationship-analysis`)
```json
{
  "id": "relationship-analysis",
  "name": "Relationship Analysis",
  "description": "Understanding relationship dynamics",
  "category": "personal",
  "parameters": {
    "focus_areas": ["dynamics", "emotional_connection", "compatibility"],
    "depth": "deep"
  }
}
```

#### 3. Business Meeting Analysis (`business-meeting-analysis`)
```json
{
  "id": "business-meeting-analysis",
  "name": "Business Meeting Analysis",
  "description": "Professional meeting effectiveness",
  "category": "business",
  "parameters": {
    "focus_areas": ["productivity", "participation", "outcomes"],
    "depth": "standard"
  }
}
```

### Template Parameters

#### Common Parameters
- **focus_areas**: Array of specific analysis focuses
- **depth**: Analysis depth ("basic", "standard", "deep")
- **language**: Primary language of conversation
- **context**: Additional context information

#### Custom Parameters
```json
{
  "templateId": "communication-analysis",
  "parameters": {
    "focus_areas": ["emotional_intelligence", "persuasion"],
    "depth": "deep",
    "include_recommendations": true,
    "confidence_threshold": 0.8
  }
}
```

---

## Code Examples

### JavaScript/Node.js

#### Basic Analysis Request
```javascript
const axios = require('axios');

const analyzeConversation = async (conversationText) => {
  try {
    const response = await axios.post(
      'https://your-domain.com/api/analyze',
      {
        text: conversationText,
        templateId: 'communication-analysis',
        settings: {
          provider: 'google',
          privacy: 'private'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHARISMA_AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Analysis failed:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const conversation = `
John: Hi Sarah, how was your weekend?
Sarah: It was great! I went hiking with some friends. How about you?
John: I stayed home and worked on my project. It's coming along well.
Sarah: That sounds productive. What kind of project is it?
`;

analyzeConversation(conversation)
  .then(result => {
    console.log('Analysis ID:', result.data.id);
    console.log('Status:', result.data.status);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

#### Polling for Results
```javascript
const pollForResults = async (analysisId, maxAttempts = 30) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.get(
        `https://your-domain.com/api/analysis/${analysisId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CHARISMA_AI_API_KEY}`
          }
        }
      );
      
      const analysis = response.data.data;
      
      if (analysis.status === 'completed') {
        return analysis;
      } else if (analysis.status === 'failed') {
        throw new Error('Analysis failed');
      }
      
      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Polling error:', error);
      throw error;
    }
  }
  
  throw new Error('Analysis timeout');
};
```

### Python

#### Basic Analysis Request
```python
import requests
import os
import time
import json

class CharismaAIClient:
    def __init__(self, api_key, base_url):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def analyze_conversation(self, text, template_id='communication-analysis', settings=None):
        """Start conversation analysis"""
        payload = {
            'text': text,
            'templateId': template_id,
            'settings': settings or {'provider': 'google', 'privacy': 'private'}
        }
        
        response = requests.post(
            f'{self.base_url}/analyze',
            headers=self.headers,
            json=payload
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'Analysis failed: {response.text}')
    
    def get_analysis_results(self, analysis_id):
        """Get analysis results"""
        response = requests.get(
            f'{self.base_url}/analysis/{analysis_id}',
            headers=self.headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'Failed to get results: {response.text}')
    
    def wait_for_completion(self, analysis_id, max_attempts=30):
        """Poll for analysis completion"""
        for attempt in range(max_attempts):
            result = self.get_analysis_results(analysis_id)
            analysis = result['data']
            
            if analysis['status'] == 'completed':
                return analysis
            elif analysis['status'] == 'failed':
                raise Exception('Analysis failed')
            
            time.sleep(2)  # Wait 2 seconds
        
        raise Exception('Analysis timeout')

# Usage example
client = CharismaAIClient(
    api_key=os.getenv('CHARISMA_AI_API_KEY'),
    base_url='https://your-domain.com/api'
)

conversation = """
John: Hi Sarah, how was your weekend?
Sarah: It was great! I went hiking with some friends. How about you?
John: I stayed home and worked on my project. It's coming along well.
Sarah: That sounds productive. What kind of project is it?
"""

try:
    # Start analysis
    result = client.analyze_conversation(conversation)
    analysis_id = result['data']['id']
    print(f'Analysis started: {analysis_id}')
    
    # Wait for completion
    completed_analysis = client.wait_for_completion(analysis_id)
    print('Analysis completed!')
    print(json.dumps(completed_analysis['results'], indent=2))
    
except Exception as e:
    print(f'Error: {e}')
```

### cURL Examples

#### Start Analysis
```bash
curl -X POST https://your-domain.com/api/analyze \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "John: Hello! Sarah: Hi there, how are you?",
    "templateId": "communication-analysis",
    "settings": {
      "provider": "google",
      "privacy": "private"
    }
  }'
```

#### Get Results
```bash
curl -X GET https://your-domain.com/api/analysis/analysis_123456 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### List Templates
```bash
curl -X GET https://your-domain.com/api/templates \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### PHP

#### Basic Implementation
```php
<?php

class CharismaAIClient {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey, $baseUrl) {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }
    
    public function analyzeConversation($text, $templateId = 'communication-analysis') {
        $data = [
            'text' => $text,
            'templateId' => $templateId,
            'settings' => [
                'provider' => 'google',
                'privacy' => 'private'
            ]
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/analyze');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            return json_decode($response, true);
        } else {
            throw new Exception('Analysis failed: ' . $response);
        }
    }
    
    public function getAnalysisResults($analysisId) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/analysis/' . $analysisId);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            return json_decode($response, true);
        } else {
            throw new Exception('Failed to get results: ' . $response);
        }
    }
}

// Usage
$client = new CharismaAIClient(
    getenv('CHARISMA_AI_API_KEY'),
    'https://your-domain.com/api'
);

$conversation = "John: Hello! Sarah: Hi there, how are you?";

try {
    $result = $client->analyzeConversation($conversation);
    echo "Analysis started: " . $result['data']['id'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

---

## SDKs and Libraries

### Official SDKs

#### JavaScript/TypeScript SDK
```bash
npm install @charisma-ai/sdk
```

```typescript
import { CharismaAI } from '@charisma-ai/sdk';

const client = new CharismaAI({
  apiKey: process.env.CHARISMA_AI_API_KEY,
  baseURL: 'https://your-domain.com/api'
});

// Analyze conversation
const analysis = await client.analyze({
  text: conversationText,
  template: 'communication-analysis',
  settings: {
    provider: 'google',
    privacy: 'private'
  }
});

// Wait for completion
const results = await client.waitForCompletion(analysis.id);
console.log(results);
```

#### Python SDK
```bash
pip install charisma-ai
```

```python
from charisma_ai import CharismaAI

client = CharismaAI(
    api_key=os.getenv('CHARISMA_AI_API_KEY'),
    base_url='https://your-domain.com/api'
)

# Analyze conversation
analysis = client.analyze(
    text=conversation_text,
    template='communication-analysis'
)

# Wait for completion
results = client.wait_for_completion(analysis.id)
print(results)
```

### Community Libraries

#### Ruby Gem
```ruby
gem 'charisma_ai'
```

#### Go Package
```go
go get github.com/charisma-ai/go-sdk
```

#### Java Library
```xml
<dependency>
    <groupId>com.charisma-ai</groupId>
    <artifactId>charisma-ai-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Webhooks

### Setting Up Webhooks

#### Configuration
1. **Navigate to Settings**: Go to Account Settings > Webhooks
2. **Add Webhook URL**: Enter your endpoint URL
3. **Select Events**: Choose which events to receive
4. **Set Secret**: Configure webhook secret for verification
5. **Test Webhook**: Verify webhook is working correctly

#### Webhook Events
- **analysis.started**: Analysis processing began
- **analysis.completed**: Analysis finished successfully
- **analysis.failed**: Analysis encountered an error
- **analysis.progress**: Analysis progress updates (optional)

### Webhook Payload

#### Analysis Completed Event
```json
{
  "event": "analysis.completed",
  "timestamp": "2025-01-25T10:30:00Z",
  "data": {
    "analysisId": "analysis_123456",
    "status": "completed",
    "userId": "user_789",
    "template": "communication-analysis",
    "processingTime": "45s",
    "results": {
      "overall_score": 85,
      "confidence": 0.92
    }
  },
  "signature": "sha256=webhook_signature_here"
}
```

### Webhook Verification

#### Verifying Webhook Signatures (Node.js)
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Express.js webhook handler
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-charisma-signature'];
  const payload = req.body;
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  switch (event.event) {
    case 'analysis.completed':
      handleAnalysisCompleted(event.data);
      break;
    case 'analysis.failed':
      handleAnalysisFailed(event.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## Rate Limiting

### Rate Limits

#### Free Tier
- **Requests per minute**: 10
- **Requests per hour**: 100
- **Requests per day**: 500
- **Concurrent analyses**: 2

#### Premium Tier
- **Requests per minute**: 60
- **Requests per hour**: 1000
- **Requests per day**: 10000
- **Concurrent analyses**: 10

### Rate Limit Headers

API responses include rate limit information:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1643723400
X-RateLimit-Retry-After: 60
```

### Handling Rate Limits

#### Exponential Backoff (JavaScript)
```javascript
async function makeRequestWithRetry(requestFn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['x-ratelimit-retry-after'] || 60;
        const delay = Math.min(1000 * Math.pow(2, attempt), retryAfter * 1000);
        
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## Error Handling

### Error Codes

#### Client Errors (4xx)
- **400 Bad Request**: Invalid request format or parameters
- **401 Unauthorized**: Invalid or missing API key
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Valid request but processing failed
- **429 Too Many Requests**: Rate limit exceeded

#### Server Errors (5xx)
- **500 Internal Server Error**: Unexpected server error
- **502 Bad Gateway**: Upstream service error
- **503 Service Unavailable**: Service temporarily unavailable
- **504 Gateway Timeout**: Request timeout

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TEXT_FORMAT",
    "message": "The conversation text format is invalid",
    "details": {
      "field": "text",
      "issue": "Text must contain at least two speakers",
      "suggestion": "Format text with clear speaker labels (e.g., 'John: Hello')"
    },
    "documentation": "https://docs.charisma-ai.com/api/text-format"
  },
  "timestamp": "2025-01-25T10:30:00Z"
}
```

### Error Handling Best Practices

#### Comprehensive Error Handling (JavaScript)
```javascript
async function handleAnalysisRequest(conversationText) {
  try {
    const response = await axios.post('/api/analyze', {
      text: conversationText,
      templateId: 'communication-analysis'
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(`Invalid request: ${data.error.message}`);
        case 401:
          throw new Error('Authentication failed. Check your API key.');
        case 403:
          throw new Error('Access denied. Insufficient permissions.');
        case 422:
          throw new Error(`Processing failed: ${data.error.details.suggestion}`);
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again or contact support.');
        default:
          throw new Error(`Unexpected error: ${data.error.message}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}
```

---

## Best Practices

### API Usage Best Practices

#### Request Optimization
- **Batch Requests**: Group multiple analyses when possible
- **Appropriate Templates**: Choose the most suitable template for your use case
- **Text Preprocessing**: Clean and format text before sending
- **Caching**: Cache results to avoid duplicate requests

#### Performance Optimization
- **Async Processing**: Use webhooks for long-running analyses
- **Connection Pooling**: Reuse HTTP connections
- **Compression**: Enable gzip compression for large requests
- **Timeout Handling**: Set appropriate request timeouts

#### Security Best Practices
- **API Key Security**: Store keys securely, never in client-side code
- **HTTPS Only**: Always use HTTPS for API requests
- **Input Validation**: Validate data before sending to API
- **Error Logging**: Log errors without exposing sensitive data

### Integration Patterns

#### Synchronous Analysis
```javascript
// For short conversations requiring immediate results
async function quickAnalysis(text) {
  const result = await client.analyze({
    text: text,
    template: 'communication-analysis'
  });
  
  // Poll for results
  return await client.waitForCompletion(result.id, { timeout: 60000 });
}
```

#### Asynchronous Analysis with Webhooks
```javascript
// For longer conversations or batch processing
async function asyncAnalysis(text, callbackUrl) {
  const result = await client.analyze({
    text: text,
    template: 'deep-forensic-analysis',
    webhook: callbackUrl
  });
  
  return result.id; // Return analysis ID for tracking
}
```

#### Batch Processing
```javascript
// Process multiple conversations efficiently
async function batchAnalysis(conversations) {
  const analyses = await Promise.all(
    conversations.map(conv => client.analyze({
      text: conv.text,
      template: conv.template || 'communication-analysis',
      metadata: { id: conv.id }
    }))
  );
  
  return analyses.map(a => a.id);
}
```

---

## Troubleshooting

### Common Issues

#### Authentication Problems
**Issue**: 401 Unauthorized responses
**Solutions**:
1. Verify API key is correct and active
2. Check Authorization header format
3. Ensure API key has required permissions
4. Regenerate API key if necessary

#### Request Format Issues
**Issue**: 400 Bad Request responses
**Solutions**:
1. Validate JSON format
2. Check required fields are present
3. Verify data types match API specification
4. Review request examples in documentation

#### Rate Limiting
**Issue**: 429 Too Many Requests
**Solutions**:
1. Implement exponential backoff
2. Respect rate limit headers
3. Consider upgrading to higher tier
4. Optimize request frequency

#### Timeout Issues
**Issue**: Requests timing out
**Solutions**:
1. Increase request timeout values
2. Use webhooks for long analyses
3. Break large texts into smaller segments
4. Check network connectivity

### Debugging Tools

#### Request Logging
```javascript
// Log all API requests for debugging
axios.interceptors.request.use(request => {
  console.log('API Request:', {
    method: request.method,
    url: request.url,
    headers: request.headers,
    data: request.data
  });
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

#### Health Check Utility
```javascript
async function checkAPIHealth() {
  try {
    const response = await axios.get('/api/health', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    
    console.log('API Health:', response.data);
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}
```

### Getting Help

#### Support Resources
- **Documentation**: Comprehensive API documentation
- **Code Examples**: Working examples in multiple languages
- **Community Forum**: Developer community discussions
- **GitHub Issues**: Report bugs and request features

#### Contact Support
- **Technical Support**: api@charisma-ai.com
- **Developer Relations**: developers@charisma-ai.com
- **Emergency Support**: Available for Premium customers

---

## Conclusion

The CharismaAI API provides powerful capabilities for integrating AI-powered communication analysis into your applications. This guide covers all essential aspects of API integration, from basic usage to advanced patterns.

### Key Takeaways
- **Start Simple**: Begin with basic analysis requests and gradually add complexity
- **Handle Errors Gracefully**: Implement comprehensive error handling and retry logic
- **Optimize Performance**: Use appropriate patterns for your use case (sync vs async)
- **Follow Best Practices**: Secure API key management and efficient request patterns
- **Monitor Usage**: Track API usage and optimize based on patterns

### Next Steps
1. **Get API Access**: Enable API access in your CharismaAI account
2. **Try Examples**: Test the provided code examples
3. **Build Integration**: Implement API calls in your application
4. **Test Thoroughly**: Validate error handling and edge cases
5. **Deploy Confidently**: Launch your integration with monitoring

---

**Developed by Mohamed Abdelrazig - MAAM**

*This API Integration Guide ensures successful integration of CharismaAI's powerful communication analysis capabilities into your applications and workflows.*

---

*Last Updated: January 2025 - Version 2.0*