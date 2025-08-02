#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultEmailTemplates = [
  {
    name: 'default',
    subject: 'Welcome to CharismaAI - Your Account is Ready!',
    content: `Hello {{name}},

Welcome to CharismaAI! Your account has been created and you can now start analyzing conversations with our AI-powered platform.

**Your Login Details:**
Email: {{email}}
Temporary Password: {{tempPassword}}

**Getting Started:**
1. Visit our platform: {{loginUrl}}
2. Sign in with your email and temporary password
3. You'll be prompted to change your password on first login
4. Start analyzing conversations with our 10 standardized templates!

**What You Can Do:**
- Analyze communication patterns and effectiveness
- Understand relationship dynamics
- Get insights into business meetings and coaching sessions
- Access professional-grade analysis templates

{{#if personalMessage}}
**Personal Message from Your Administrator:**
{{personalMessage}}
{{/if}}

If you have any questions, please don't hesitate to reach out to our support team.

Best regards,
The CharismaAI Team

---
Developed by Mohamed Abdelrazig - MAAM`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to CharismaAI</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .login-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 10px 0; padding: 10px; background: #f0f4ff; border-radius: 4px; }
        .personal-message { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to CharismaAI!</h1>
            <p>Your AI-powered communication analysis platform</p>
        </div>
        <div class="content">
            <p>Hello <strong>{{name}}</strong>,</p>
            
            <p>Welcome to CharismaAI! Your account has been created and you can now start analyzing conversations with our AI-powered platform.</p>
            
            <div class="login-box">
                <h3>Your Login Details:</h3>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Temporary Password:</strong> <code>{{tempPassword}}</code></p>
                <a href="{{loginUrl}}" class="button">Sign In Now</a>
            </div>
            
            <div class="steps">
                <h3>Getting Started:</h3>
                <div class="step">1. Visit our platform and sign in with your credentials</div>
                <div class="step">2. You'll be prompted to change your password on first login</div>
                <div class="step">3. Start analyzing conversations with our 10 standardized templates!</div>
            </div>
            
            <h3>What You Can Do:</h3>
            <ul>
                <li>Analyze communication patterns and effectiveness</li>
                <li>Understand relationship dynamics</li>
                <li>Get insights into business meetings and coaching sessions</li>
                <li>Access professional-grade analysis templates</li>
            </ul>
            
            {{#if personalMessage}}
            <div class="personal-message">
                <h3>Personal Message from Your Administrator:</h3>
                <p>{{personalMessage}}</p>
            </div>
            {{/if}}
            
            <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
            
            <div class="footer">
                <p>Best regards,<br>The CharismaAI Team</p>
                <p><em>Developed by Mohamed Abdelrazig - MAAM</em></p>
            </div>
        </div>
    </div>
</body>
</html>`,
    category: 'invitation',
    isBuiltIn: true,
    isActive: true,
    variables: ['name', 'email', 'tempPassword', 'loginUrl', 'personalMessage'],
    styling: {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      backgroundColor: '#f9f9f9',
      textColor: '#333333'
    }
  },
  {
    name: 'admin',
    subject: 'Welcome to CharismaAI - Admin Account Created',
    content: `Hello {{name}},

Welcome to CharismaAI! Your administrator account has been created with full access to our AI-powered communication analysis platform.

**Your Login Details:**
Email: {{email}}
Temporary Password: {{tempPassword}}

**Admin Privileges:**
As an administrator, you have access to:
- All analysis templates and features
- User management and invitation system
- Email template management
- System analytics and monitoring
- Platform configuration settings

**Getting Started:**
1. Visit our platform: {{loginUrl}}
2. Sign in with your email and temporary password
3. Change your password on first login
4. Access the admin dashboard to manage users and settings

{{#if personalMessage}}
**Personal Message:**
{{personalMessage}}
{{/if}}

**Security Note:**
As an admin, please ensure you use a strong password and keep your credentials secure.

If you have any questions about your admin privileges, please contact the system administrator.

Best regards,
The CharismaAI Team

---
Developed by Mohamed Abdelrazig - MAAM`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CharismaAI Admin Account</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .login-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
        .admin-privileges { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 10px 0; padding: 10px; background: #ffe6e6; border-radius: 4px; }
        .personal-message { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .security-note { background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .admin-badge { background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to CharismaAI!</h1>
            <p>Administrator Account <span class="admin-badge">ADMIN</span></p>
        </div>
        <div class="content">
            <p>Hello <strong>{{name}}</strong>,</p>
            
            <p>Welcome to CharismaAI! Your administrator account has been created with full access to our AI-powered communication analysis platform.</p>
            
            <div class="login-box">
                <h3>Your Login Details:</h3>
                <p><strong>Email:</strong> {{email}}</p>
                <p><strong>Temporary Password:</strong> <code>{{tempPassword}}</code></p>
                <a href="{{loginUrl}}" class="button">Access Admin Dashboard</a>
            </div>
            
            <div class="admin-privileges">
                <h3>Admin Privileges:</h3>
                <p>As an administrator, you have access to:</p>
                <ul>
                    <li>All analysis templates and features</li>
                    <li>User management and invitation system</li>
                    <li>Email template management</li>
                    <li>System analytics and monitoring</li>
                    <li>Platform configuration settings</li>
                </ul>
            </div>
            
            <div class="steps">
                <h3>Getting Started:</h3>
                <div class="step">1. Visit our platform and sign in with your credentials</div>
                <div class="step">2. Change your password on first login</div>
                <div class="step">3. Access the admin dashboard to manage users and settings</div>
            </div>
            
            {{#if personalMessage}}
            <div class="personal-message">
                <h3>Personal Message:</h3>
                <p>{{personalMessage}}</p>
            </div>
            {{/if}}
            
            <div class="security-note">
                <h3>Security Note:</h3>
                <p>As an admin, please ensure you use a strong password and keep your credentials secure.</p>
            </div>
            
            <p>If you have any questions about your admin privileges, please contact the system administrator.</p>
            
            <div class="footer">
                <p>Best regards,<br>The CharismaAI Team</p>
                <p><em>Developed by Mohamed Abdelrazig - MAAM</em></p>
            </div>
        </div>
    </div>
</body>
</html>`,
    category: 'invitation',
    isBuiltIn: true,
    isActive: true,
    variables: ['name', 'email', 'tempPassword', 'loginUrl', 'personalMessage'],
    styling: {
      primaryColor: '#ff6b6b',
      secondaryColor: '#ee5a24',
      backgroundColor: '#f9f9f9',
      textColor: '#333333'
    }
  }
];

async function seedEmailTemplates() {
  try {
    console.log('🌱 Starting email template seeding...');

    // Check if templates already exist
    const existingTemplates = await prisma.emailTemplate.findMany();
    
    if (existingTemplates.length > 0) {
      console.log(`⚠️  Found ${existingTemplates.length} existing email templates. Skipping seed.`);
      return;
    }

    // Create templates
    for (const templateData of defaultEmailTemplates) {
      const template = await prisma.emailTemplate.create({
        data: templateData,
      });
      console.log(`✅ Created email template: ${template.name}`);
    }

    console.log('🎉 Email template seeding completed successfully!');
    console.log(`📧 Created ${defaultEmailTemplates.length} email templates:`);
    defaultEmailTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedEmailTemplates()
  .then(() => {
    console.log('✅ Email template seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Email template seed script failed:', error);
    process.exit(1);
  });