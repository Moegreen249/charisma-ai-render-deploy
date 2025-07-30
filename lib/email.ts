import { prisma } from '@/lib/prisma';

const brevoApiKey = process.env.BREVO_API_KEY!;

// Initialize Brevo API
const sendEmail = async (to: string[], subject: string, htmlContent: string, textContent: string) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'CharismaAI', email: 'noreply@charismaai.vercel.app' },
      to: to.map(email => ({ email })),
      subject,
      htmlContent,
      textContent,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return response.json();
};

// Email service now uses Prisma for database operations

interface EmailTemplate {
  subject: string;
  content: string;
}

interface TemplateVariables {
  name: string;
  email: string;
  tempPassword?: string;
  loginUrl?: string;
  personalMessage?: string;
}

// Default email templates
const DEFAULT_TEMPLATES: Record<string, EmailTemplate> = {
  default: {
    subject: 'Welcome to CharismaAI - Your Account Details',
    content: `Dear {name},

Welcome to CharismaAI! Your account has been successfully created.

Login Credentials:
Email: {email}
Temporary Password: {tempPassword}

For security reasons, you will be prompted to change your password upon your first login.

{personalMessage}

Please visit: {loginUrl} to get started.

Best regards,
The CharismaAI Team`
  },
  admin: {
    subject: 'CharismaAI Admin Access - Account Created',
    content: `Dear {name},

You have been granted administrative access to CharismaAI.

Login Credentials:
Email: {email}
Temporary Password: {tempPassword}

As an administrator, you will have access to:
- User management
- System analytics
- Platform configuration
- Invitation management

{personalMessage}

Please visit: {loginUrl} to access your admin dashboard.

Best regards,
The CharismaAI Team`
  }
};

function replaceTemplateVariables(template: string, variables: TemplateVariables): string {
  let result = template;

  // Replace all template variables
  result = result.replace(/{name}/g, variables.name);
  result = result.replace(/{email}/g, variables.email);
  result = result.replace(/{tempPassword}/g, variables.tempPassword || '');
  result = result.replace(/{loginUrl}/g, variables.loginUrl || '');

  // Handle personal message - if empty, remove the line
  if (variables.personalMessage) {
    result = result.replace(/{personalMessage}/g, `Personal Message:\n${variables.personalMessage}\n`);
  } else {
    result = result.replace(/{personalMessage}\n*/g, '');
  }

  // Handle login button placeholder
  const loginButtonHtml = variables.loginUrl
    ? `<a href="${variables.loginUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Login to CharismaAI</a>`
    : '';
  result = result.replace(/{loginButton}/g, loginButtonHtml);

  return result;
}

export async function sendWelcomeEmail(
  to: string,
  templateId: string = 'Modern Professional',
  variables: TemplateVariables,
  customTemplate?: EmailTemplate
) {
  try {
    let template: EmailTemplate;

    if (customTemplate) {
      template = customTemplate;
    } else {
      // Try to fetch template from database first using Prisma
      try {
        const dbTemplate = await prisma.emailTemplate.findFirst({
          where: {
            name: templateId,
            isActive: true
          },
          select: {
            subject: true,
            content: true,
            htmlContent: true
          }
        });

        if (dbTemplate) {
          template = {
            subject: dbTemplate.subject,
            content: dbTemplate.htmlContent || dbTemplate.content
          };
        } else {
          // Fallback to built-in templates
          template = DEFAULT_TEMPLATES[templateId.toLowerCase()] || DEFAULT_TEMPLATES.default;
        }
      } catch (error) {
        console.error('Error fetching email template from database:', error);
        // Fallback to built-in templates
        template = DEFAULT_TEMPLATES[templateId.toLowerCase()] || DEFAULT_TEMPLATES.default;
      }
    }

    // Replace template variables
    const subject = replaceTemplateVariables(template.subject, variables);
    const content = replaceTemplateVariables(template.content, variables);

    // Check if content is HTML or plain text
    const isHtml = content.includes('<html>') || content.includes('<!DOCTYPE');
    const htmlContent = isHtml ? content : content.replace(/\n/g, '<br>');
    const textContent = isHtml ? content.replace(/<[^>]*>/g, '') : content;

    if (!brevoApiKey) {
      console.warn('BREVO_API_KEY not configured, skipping email send');
      return { success: true, result: 'Email skipped - no API key' };
    }

    const result = await sendEmail([to], subject, htmlContent, textContent);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

// Legacy function for backward compatibility
export async function sendWelcomeEmailLegacy(to: string, message: string) {
  try {
    if (!brevoApiKey) {
      console.warn('BREVO_API_KEY not configured, skipping email send');
      return { success: true, result: 'Email skipped - no API key' };
    }

    const result = await sendEmail(
      [to],
      'Welcome to CharismaAI - Your Account Details',
      message.replace(/\n/g, '<br>'),
      message
    );

    return { success: true, result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}
