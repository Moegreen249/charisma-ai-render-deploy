# CharismaAI User Guide

## Getting Started

### Welcome to CharismaAI

CharismaAI is your personal AI-powered communication analyst that helps you understand and improve your communication skills by analyzing chat conversations. Whether you're looking to enhance your professional communication, understand relationship dynamics, or improve your overall conversational skills, CharismaAI provides deep insights and personalized coaching.

### First Steps

1. **Access the Application**: Open your web browser and navigate to the CharismaAI application
2. **Configure Settings**: Before your first analysis, you'll need to set up your AI provider and API keys
3. **Upload Your First Chat**: Start by uploading a chat conversation file to see CharismaAI in action

## Configuration Guide

### Setting Up AI Providers

#### Step 1: Access Settings
- Click the settings icon in the navigation or navigate to `/settings`
- You'll see two main tabs: "AI Configuration" and "Template Management"

#### Step 2: Choose Your AI Provider
CharismaAI supports three major AI providers:

**Google AI (Gemini)**
- **Recommended for**: Most users, good balance of performance and cost
- **Models Available**: Gemini 2.5 Flash, Gemini 2.0 Flash
- **Get API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Cost**: Free tier available, then pay-as-you-go

**OpenAI (GPT)**
- **Recommended for**: Advanced analysis, high-quality insights
- **Models Available**: GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Get API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
- **Cost**: Pay-per-use pricing

**Anthropic (Claude)**
- **Recommended for**: Detailed analysis, safety-focused
- **Models Available**: Claude 3.5 Sonnet, Claude 3.5 Haiku
- **Get API Key**: Visit [Anthropic Console](https://console.anthropic.com/settings/keys)
- **Cost**: Pay-per-use pricing

#### Step 3: Add Your API Key
1. Select your preferred provider from the dropdown
2. Click "Get API Key" to open the provider's website
3. Create an account and generate an API key
4. Copy the API key and paste it into the input field
5. Click "Save" to store your key securely

#### Step 4: Select Your Model
- Choose from the available models for your selected provider
- Consider the trade-offs:
  - **Faster models**: Lower cost, quicker responses
  - **More capable models**: Higher cost, better analysis quality

### Choosing Analysis Templates

#### Built-in Templates

**Communication Analysis** 💬
- **Best for**: General conversation analysis
- **What it analyzes**: Personality traits, communication patterns, emotional dynamics
- **Use case**: Understanding your general communication style

**Relationship Analysis** 💕
- **Best for**: Personal relationships and dating conversations
- **What it analyzes**: Relationship dynamics, emotional connections, intimacy levels
- **Use case**: Improving relationship communication

**Business Meeting Analysis** 💼
- **Best for**: Professional meetings and work conversations
- **What it analyzes**: Leadership qualities, meeting effectiveness, professional patterns
- **Use case**: Enhancing professional communication skills

#### Custom Templates
You can create your own analysis templates for specific use cases:
- **Clinical Analysis**: For therapeutic or counseling contexts
- **Educational Analysis**: For learning and teaching conversations
- **Sales Analysis**: For sales and negotiation conversations

> **Note:** Template management now uses server actions. Deprecated client-side template management functions are no longer supported.

## Using CharismaAI

### Uploading Chat Files

#### Supported Formats
- **Text files (.txt)**: Plain text chat conversations
- **Chat exports**: From various messaging platforms
- **Conversation logs**: Any text-based conversation format

#### File Requirements
- **Size limit**: Up to 10MB per file
- **Format**: UTF-8 encoded text
- **Content**: Should contain a back-and-forth conversation

#### Upload Process
1. **Drag and Drop**: Simply drag your chat file onto the upload area
2. **Click to Browse**: Click the upload area to open file browser
3. **File Validation**: The system will validate your file format and size
4. **Confirmation**: Once valid, you'll see the file name and can proceed

### Running Analysis

#### Step 1: Select Analysis Type
- Choose from your configured analysis templates
- The template determines what aspects of the conversation will be analyzed
- You can change templates between analyses

#### Step 2: Start Analysis
- Click the "Analyze" button to begin processing
- The system will show a loading indicator with progress
- Analysis typically takes 30 seconds to 2 minutes depending on conversation length

#### Step 3: Review Results
Once analysis is complete, you'll see a comprehensive results page with:

**Overview Section**
- **Detected Language**: The language of your conversation
- **Overall Summary**: High-level insights about the conversation
- **Key Metrics**: Important statistics and measurements

**Detailed Analysis**
- **Personality Traits**: Identified characteristics and communication styles
- **Emotional Arc**: How emotions changed throughout the conversation
- **Topics**: Main discussion points and their relevance
- **Communication Patterns**: Recurring patterns and their impact

**Insights**
- **Text Insights**: Written observations and recommendations
- **Score Metrics**: Numerical ratings and assessments
- **Visual Charts**: Graphical representations of data
- **Timeline Views**: Chronological analysis of the conversation

### Using the AI Coach

#### Accessing the Coach
- Click the "Get Coaching" button on the analysis results page
- The coach will open in a chat interface overlay

#### Coach Features
- **Context-Aware**: The coach knows your analysis results and can reference specific insights
- **Template-Specific**: Coaching advice is tailored to your selected analysis type
- **Interactive**: Ask follow-up questions and get detailed explanations
- **Real-time**: Responses stream in real-time for a natural conversation feel

#### Suggested Questions
The coach provides suggested questions to get you started:
- "What are my main communication strengths?"
- "How can I improve my communication style?"
- "What patterns did you notice in my conversation?"
- "What emotions were most prominent in our chat?"
- "How can I be more effective in similar conversations?"

#### Getting the Most from Coaching
1. **Be Specific**: Ask about particular aspects you want to improve
2. **Provide Context**: Mention specific situations or challenges
3. **Ask for Examples**: Request concrete examples of improvements
4. **Follow Up**: Ask clarifying questions to deepen your understanding

## Understanding Your Results

### Personality Analysis

#### Personality Traits
- **Identified Traits**: Key characteristics observed in your communication
- **Trait Summary**: Overall personality profile based on conversation patterns
- **Context**: How these traits manifest in your conversations

#### Communication Style
- **Direct vs. Indirect**: How straightforward your communication is
- **Formal vs. Informal**: Your level of formality in conversations
- **Active vs. Passive**: Your engagement level in discussions

### Emotional Analysis

#### Emotional Arc
- **Timeline**: How emotions evolved throughout the conversation
- **Intensity Levels**: Strength of emotions at different points
- **Triggers**: What caused emotional changes
- **Patterns**: Recurring emotional themes

#### Emotional Intelligence
- **Self-Awareness**: Recognition of your own emotions
- **Empathy**: Understanding of others' emotions
- **Regulation**: How you manage emotional responses

### Topic Analysis

#### Topic Relevance
- **Primary Topics**: Main subjects discussed
- **Relevance Scores**: How important each topic was to the conversation
- **Topic Flow**: How topics transitioned and connected

#### Discussion Quality
- **Depth**: How thoroughly topics were explored
- **Engagement**: Level of interest and participation
- **Clarity**: How clearly topics were communicated

### Communication Patterns

#### Positive Patterns
- **Active Listening**: Signs of attentive listening
- **Empathetic Responses**: Understanding and supportive communication
- **Clear Expression**: Well-articulated thoughts and feelings

#### Areas for Improvement
- **Interruptions**: Frequency of interrupting others
- **Defensiveness**: Signs of defensive communication
- **Vagueness**: Unclear or ambiguous expressions

## Advanced Features

### Custom Templates

#### Creating Custom Templates
1. **Access Template Manager**: Go to Settings → Template Management
2. **Create New Template**: Click "Create New Template"
3. **Define Parameters**:
   - **Name**: Give your template a descriptive name
   - **Category**: Choose from general, business, personal, clinical, or custom
   - **Description**: Explain what this template analyzes
   - **System Prompt**: Define the AI's role and approach
   - **Analysis Prompt**: Specify what aspects to analyze
4. **Save Template**: Your template will be available for future analyses

#### Template Categories
- **General**: Broad communication analysis
- **Business**: Professional and workplace communication
- **Personal**: Personal relationships and social interactions
- **Clinical**: Therapeutic or counseling contexts
- **Custom**: Specialized analysis frameworks

> **Deprecated:** PaLM (text-bison) and legacy models are no longer supported. All template management is now handled via server actions.

### Batch Analysis

#### Multiple File Processing
- Upload multiple chat files for comparison
- Analyze conversations across different contexts
- Track communication patterns over time
- Identify trends and improvements

> **Planned Feature:** Batch analysis, export, team collaboration, mobile app, and API integrations are planned for future releases. See the Roadmap in the README for details.

#### Comparative Analysis
- Compare communication styles across different relationships
- Analyze professional vs. personal communication
- Track improvement over time
- Identify context-specific patterns

## Tips for Best Results

### Preparing Your Chat Files

#### Quality Considerations
- **Complete Conversations**: Include full conversations rather than excerpts
- **Natural Language**: Use authentic, unedited conversations
- **Context**: Include relevant context about the relationship or situation
- **Length**: Longer conversations provide more comprehensive analysis

#### Formatting Tips
- **Clear Speaker Identification**: Make sure it's clear who is speaking
- **Timestamps**: Include timestamps if available for temporal analysis
- **Clean Text**: Remove unnecessary formatting or artifacts
- **Consistent Format**: Use consistent formatting throughout

### Interpreting Results

#### Understanding Scores
- **0-1 Scale**: Most metrics use a 0-1 scale where 1 is optimal
- **Context Matters**: Scores should be interpreted in context
- **Comparative Analysis**: Compare scores across different conversations
- **Trends Over Time**: Look for patterns across multiple analyses

#### Actionable Insights
- **Specific Recommendations**: Focus on concrete, actionable advice
- **Practice Opportunities**: Identify situations to practice improvements
- **Progress Tracking**: Use insights to track improvement over time
- **Goal Setting**: Use analysis to set specific communication goals

### Privacy and Security

#### Data Protection
- **Local Processing**: Chat files are processed locally and not stored
- **Temporary Analysis**: Results are temporary and not saved
- **Secure Transmission**: All data is transmitted securely
- **No Sharing**: Your conversations are never shared with third parties

#### Best Practices
- **Sensitive Information**: Be mindful of sharing sensitive personal information
- **Consent**: Ensure all participants consent to analysis
- **Anonymization**: Consider removing identifying information
- **Regular Cleanup**: Clear browser data regularly for additional privacy

## Troubleshooting

### Common Issues

#### File Upload Problems
- **File Too Large**: Ensure your file is under 10MB
- **Invalid Format**: Check that your file is a valid text format
- **Encoding Issues**: Ensure your file uses UTF-8 encoding
- **Empty File**: Make sure your file contains conversation content

#### Analysis Errors
- **API Key Issues**: Verify your API key is correct and has sufficient credits
- **Network Problems**: Check your internet connection
- **Provider Limits**: Some providers have rate limits or usage quotas
- **Model Availability**: Ensure your selected model is available

#### Coach Problems
- **No Response**: Check your internet connection and API key
- **Slow Responses**: Some models may be slower than others
- **Context Loss**: The coach maintains context for the current session only

### Getting Help

#### Self-Service
- **Documentation**: Review this user guide for detailed information
- **Settings**: Check your configuration in the settings page
- **Templates**: Try different analysis templates for varied insights

#### Support Resources
- **Error Messages**: Read error messages carefully for specific guidance
- **Provider Documentation**: Check your AI provider's documentation
- **Community**: Look for community forums or support channels

## Advanced Usage

### Professional Applications

#### Business Communication
- **Meeting Analysis**: Analyze team meetings for effectiveness
- **Client Interactions**: Improve customer communication skills
- **Leadership Development**: Enhance leadership communication
- **Sales Training**: Improve sales conversation techniques

#### Personal Development
- **Relationship Improvement**: Better communication with partners and family
- **Social Skills**: Enhance general social interaction abilities
- **Conflict Resolution**: Improve conflict communication patterns
- **Emotional Intelligence**: Develop better emotional awareness

#### Educational Use
- **Language Learning**: Analyze conversations in different languages
- **Communication Courses**: Use as a teaching tool
- **Research**: Study communication patterns and trends
- **Self-Assessment**: Regular communication self-evaluation

### Integration Ideas

#### Workflow Integration
- **Regular Reviews**: Schedule regular communication analysis sessions
- **Goal Tracking**: Use insights to set and track communication goals
- **Team Development**: Analyze team communication patterns
- **Performance Reviews**: Include communication analysis in evaluations

#### Personal Growth
- **Journal Integration**: Combine with personal journaling
- **Meditation Practice**: Use insights to guide mindfulness practices
- **Therapy Support**: Supplement therapeutic work with communication analysis
- **Relationship Counseling**: Use in couples or family therapy

## Conclusion

CharismaAI is a powerful tool for understanding and improving your communication skills. By following this guide and regularly using the application, you can:

- **Gain Self-Awareness**: Understand your communication patterns and tendencies
- **Identify Strengths**: Recognize and leverage your communication strengths
- **Address Weaknesses**: Identify areas for improvement and growth
- **Track Progress**: Monitor your communication development over time
- **Get Personalized Guidance**: Receive tailored advice for your specific situation

Remember that communication is a skill that improves with practice and reflection. Use CharismaAI as part of a broader commitment to personal and professional development, and you'll see meaningful improvements in your communication effectiveness.

Happy analyzing! 