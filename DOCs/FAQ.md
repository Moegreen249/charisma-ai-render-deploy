# CharismaAI Frequently Asked Questions (FAQ)

## General Questions

### What is CharismaAI?

CharismaAI is an AI-powered communication analysis tool that helps you understand and improve your communication skills by analyzing chat conversations. It provides deep insights into personality traits, emotional dynamics, communication patterns, and offers personalized coaching to enhance your conversational abilities.

### How does CharismaAI work?

1. **Upload**: You upload a chat conversation file (text format)
2. **Analysis**: Our AI models analyze the conversation using specialized templates
3. **Insights**: You receive comprehensive insights about communication patterns, personality traits, and emotional dynamics
4. **Coaching**: You can interact with an AI coach for personalized guidance and improvement strategies

### What types of conversations can I analyze?

CharismaAI can analyze any text-based conversation, including:
- Personal chat conversations
- Business meetings and discussions
- Customer service interactions
- Dating and relationship conversations
- Team collaboration chats
- Educational discussions
- Any other text-based communication

### Is my data private and secure?

Yes, CharismaAI is designed with privacy and security in mind:
- **No Storage**: Chat files are processed in memory and not stored permanently
- **Local Processing**: Analysis happens on secure servers with no persistent storage
- **Secure Transmission**: All data is transmitted using HTTPS encryption
- **No Sharing**: Your conversations are never shared with third parties
- **API Key Security**: Your API keys are stored securely in your browser

## Technical Questions

### What file formats are supported?

Currently, CharismaAI supports:
- **Text files (.txt)**: Plain text chat conversations
- **Chat exports**: Text files exported from messaging platforms
- **Conversation logs**: Any UTF-8 encoded text format

**File Requirements:**
- Maximum size: 10MB
- Encoding: UTF-8
- Format: Text-based conversations

### Which AI providers are supported?

CharismaAI supports three major AI providers:

**Google AI (Gemini)**
- Models: Gemini 2.5 Flash, Gemini 2.0 Flash
- Cost: Free tier available, then pay-as-you-go
- Best for: Most users, good balance of performance and cost

**OpenAI (GPT)**
- Models: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- Cost: Pay-per-use pricing
- Best for: Advanced analysis, high-quality insights

**Anthropic (Claude)**
- Models: Claude 3.5 Sonnet, Claude 3.5 Haiku
- Cost: Pay-per-use pricing
- Best for: Detailed analysis, safety-focused

### How do I get API keys?

**Google AI (Gemini)**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

**OpenAI**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated key

**Anthropic**
1. Visit [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Sign in or create an account
3. Click "Create Key"
4. Copy the generated key

### How much do API calls cost?

Costs vary by provider and model:

**Google AI (Gemini)**
- Free tier: 15 requests per minute, 50 requests per day
- Paid: $0.00025 per 1K characters (input) + $0.0005 per 1K characters (output)

**OpenAI**
- GPT-4o: $0.005 per 1K tokens (input) + $0.015 per 1K tokens (output)
- GPT-4o Mini: $0.00015 per 1K tokens (input) + $0.0006 per 1K tokens (output)

**Anthropic**
- Claude 3.5 Sonnet: $0.003 per 1K tokens (input) + $0.015 per 1K tokens (output)
- Claude 3.5 Haiku: $0.00025 per 1K tokens (input) + $0.00125 per 1K tokens (output)

*Note: Costs are approximate and may vary. Check provider websites for current pricing.*

## Usage Questions

### How long does analysis take?

Analysis time depends on:
- **Conversation length**: Longer conversations take more time
- **AI model**: More capable models may be slower
- **Server load**: Peak times may be slower

**Typical times:**
- Short conversations (< 1000 words): 30-60 seconds
- Medium conversations (1000-5000 words): 1-2 minutes
- Long conversations (> 5000 words): 2-5 minutes

### What analysis templates are available?

**Built-in Templates:**

**Communication Analysis** 💬
- Analyzes general communication patterns
- Identifies personality traits and communication styles
- Tracks emotional dynamics throughout conversations

**Relationship Analysis** 💕
- Focuses on relationship dynamics and emotional connections
- Analyzes intimacy levels and communication patterns
- Provides insights for improving relationship communication

**Business Meeting Analysis** 💼
- Evaluates professional communication effectiveness
- Analyzes leadership qualities and meeting dynamics
- Identifies areas for professional development

**Custom Templates:**
You can create your own templates for specific use cases like:
- Clinical analysis for therapeutic contexts
- Educational analysis for learning environments
- Sales analysis for business development

### How do I create a custom analysis template?

1. **Access Template Manager**: Go to Settings → Template Management
2. **Create New Template**: Click "Create New Template"
3. **Define Parameters**:
   - **Name**: Give your template a descriptive name
   - **Category**: Choose from available categories
   - **Description**: Explain what this template analyzes
   - **System Prompt**: Define the AI's role and approach
   - **Analysis Prompt**: Specify what aspects to analyze
4. **Save Template**: Your template will be available for future analyses

> **Note:** Template management now uses server actions. Deprecated client-side template management functions are no longer supported.

> **Deprecated:** PaLM (text-bison) and legacy models are no longer supported. All template management is now handled via server actions.

### How does the AI coach work?

The AI coach provides personalized guidance based on your analysis results:

**Features:**
- **Context-Aware**: Knows your analysis results and can reference specific insights
- **Template-Specific**: Provides advice tailored to your selected analysis type
- **Interactive**: Allows follow-up questions and detailed explanations
- **Real-time**: Responses stream in real-time for natural conversation

**Usage:**
1. Click "Get Coaching" on your analysis results
2. Ask questions about your communication patterns
3. Get personalized advice and improvement strategies
4. Ask follow-up questions for deeper understanding

### Can I analyze conversations in different languages?

Yes! CharismaAI supports multiple languages:

**Automatic Detection**: The system automatically detects the language of your conversation
**Multi-language Analysis**: Analysis is performed in the same language as your conversation
**Supported Languages**: Most major languages including English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, and more

## Troubleshooting

### My file upload failed. What should I do?

**Common Issues and Solutions:**

**File Too Large**
- **Problem**: File exceeds 10MB limit
- **Solution**: Split the conversation into smaller files or compress the text

**Invalid Format**
- **Problem**: File is not in supported text format
- **Solution**: Convert to plain text (.txt) format

**Encoding Issues**
- **Problem**: Special characters not displaying correctly
- **Solution**: Ensure file is saved in UTF-8 encoding

**Empty File**
- **Problem**: File contains no conversation content
- **Solution**: Check that the file contains actual conversation text

### The analysis failed. What went wrong?

**Common Causes:**

**API Key Issues**
- **Problem**: Invalid or expired API key
- **Solution**: Check your API key in Settings and ensure it's valid

**Rate Limits**
- **Problem**: Exceeded API rate limits
- **Solution**: Wait a few minutes and try again, or switch to a different model

**Network Issues**
- **Problem**: Internet connection problems
- **Solution**: Check your internet connection and try again

**File Content**
- **Problem**: File contains inappropriate or problematic content
- **Solution**: Review your file content and ensure it's appropriate for analysis

### The AI coach isn't responding. What should I do?

**Troubleshooting Steps:**

1. **Check Internet Connection**: Ensure you have a stable internet connection
2. **Verify API Key**: Check that your API key is valid and has sufficient credits
3. **Try Different Model**: Switch to a different AI model in Settings
4. **Clear Browser Cache**: Clear your browser cache and cookies
5. **Refresh Page**: Refresh the page and try again

### How do I get better analysis results?

**Tips for Better Results:**

**File Quality**
- Use complete conversations rather than excerpts
- Include natural, unedited conversations
- Provide context about the relationship or situation
- Use longer conversations for more comprehensive analysis

**Formatting**
- Ensure clear speaker identification
- Include timestamps if available
- Use consistent formatting throughout
- Remove unnecessary formatting or artifacts

**Content**
- Use authentic conversations
- Include diverse communication patterns
- Provide sufficient context
- Avoid heavily edited or artificial content

## Advanced Questions

### Can I analyze multiple conversations at once?

Currently, CharismaAI analyzes one conversation at a time. However, you can:
- Analyze multiple files sequentially
- Compare results manually
- Use the insights to track patterns across conversations

> **Planned Feature:** Batch analysis capabilities are planned for future releases.

### Can I save my analysis results?

Currently, analysis results are temporary and not saved. However, you can:
- Take screenshots of important insights
- Copy and paste key findings
- Use the coaching feature to get detailed explanations

> **Planned Feature:** Analysis history and result storage are planned for future releases.

### Can I export my analysis results?

Currently, export functionality is not available. However, you can:
- Copy text from the analysis results
- Take screenshots of visualizations
- Use browser print functionality

> **Planned Feature:** Export functionality in various formats is planned for future releases.

### Is there a mobile app?

Currently, CharismaAI is a web application that works on mobile browsers. The interface is responsive and optimized for mobile devices.

> **Planned Feature:** Native mobile applications are planned for future releases.

### Can I use CharismaAI for team analysis?

Currently, CharismaAI is designed for individual use. However, you can:
- Analyze team conversations as a group
- Share insights with team members
- Use the coaching feature for team communication guidance

> **Planned Feature:** Team collaboration features are planned for future releases.

## Privacy and Security

### What data does CharismaAI collect?

CharismaAI collects minimal data:
- **Analysis Results**: Temporary processing of your conversation content
- **Settings**: Your API keys and preferences (stored locally)
- **Usage Analytics**: Basic usage statistics (optional)

**What We Don't Collect:**
- Your actual conversation content (not stored)
- Personal identifying information
- Chat history or conversation logs

### How is my data protected?

**Security Measures:**
- **Encryption**: All data is transmitted using HTTPS
- **No Storage**: Chat content is processed in memory only
- **Local Settings**: Your preferences are stored locally in your browser
- **API Security**: API keys are stored securely and not exposed

### Can I delete my data?

Yes, you can clear your data:
- **Settings**: Clear API keys and preferences in Settings
- **Browser Data**: Clear browser cache and local storage
- **No Server Data**: No conversation data is stored on our servers

### Is CharismaAI compliant with privacy regulations?

CharismaAI is designed with privacy in mind:
- **GDPR Compliant**: Follows GDPR principles for data protection
- **Privacy by Design**: Built with privacy as a core principle
- **Minimal Data**: Collects only necessary data for functionality
- **User Control**: Users have full control over their data

## Support and Help

### Where can I get help?

**Support Resources:**
- **Documentation**: Check the documentation in the DOCs folder
- **User Guide**: Review the comprehensive user guide
- **Settings**: Check your configuration in the settings page
- **Community**: Look for community forums or support channels

### How do I report a bug?

To report bugs or issues:
1. **Check Documentation**: Review relevant documentation first
2. **Gather Information**: Note the steps to reproduce the issue
3. **Error Messages**: Copy any error messages you see
4. **Contact Support**: Use the appropriate support channel

### Can I contribute to CharismaAI?

Yes! CharismaAI is open to contributions:
1. **Fork the Repository**: Create your own fork
2. **Make Changes**: Implement your improvements
3. **Test Thoroughly**: Ensure your changes work correctly
4. **Submit Pull Request**: Create a pull request with your changes

**Areas for Contribution:**
- Bug fixes and improvements
- New features and enhancements
- Documentation updates
- Performance optimizations
- Accessibility improvements

### Is there a roadmap for future features?

Yes! CharismaAI has an active development roadmap:

**Short Term (Next 3 Months)**
- Enhanced visualization options
- Export functionality
- User authentication
- Analysis history
- Mobile responsiveness improvements

**Medium Term (3-6 Months)**
- Batch analysis capabilities
- Team collaboration features
- Advanced AI model integration
- API for third-party integrations
- Real-time collaboration

**Long Term (6+ Months)**
- Mobile application
- Enterprise features
- Advanced analytics
- Machine learning improvements
- Internationalization

---

For additional questions or support, please refer to the main documentation or contact the development team through the appropriate channels. 