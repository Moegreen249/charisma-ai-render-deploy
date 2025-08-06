-- ===================================
-- SEED EMAIL TEMPLATES WITH STYLING
-- ===================================

-- Template 1: Modern Professional (Default)
INSERT INTO "EmailTemplate" (
    "id", "name", "subject", "content", "htmlContent", "category", "isBuiltIn", "isActive", "variables", "styling"
) VALUES (
    gen_random_uuid()::text,
    'Modern Professional',
    'Welcome to CharismaAI - Your Account is Ready',
    'Dear {name},

Welcome to CharismaAI! Your account has been successfully created.

Login Credentials:
Email: {email}
Temporary Password: {tempPassword}

For security reasons, you will be prompted to change your password upon your first login.

{personalMessage}

Please visit: {loginUrl} to get started.

Best regards,
The CharismaAI Team',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CharismaAI</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Inter'', ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CharismaAI</h1>
            <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 16px;">AI-Powered Communication Analysis</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 24px 0; font-size: 24px; font-weight: 600;">Welcome, {name}!</h2>
            
            <p style="color: #475569; margin: 0 0 24px 0; font-size: 16px;">
                We''re excited to have you join CharismaAI. Your account has been successfully created and is ready to use.
            </p>
            
            <!-- Credentials Box -->
            <div style="background-color: #f1f5f9; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <h3 style="color: #334155; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Your Login Credentials</h3>
                <p style="color: #475569; margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> {email}</p>
                <p style="color: #475569; margin: 0 0 8px 0; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 3px; font-family: ''Courier New'', monospace;">{tempPassword}</code></p>
                <p style="color: #64748b; margin: 16px 0 0 0; font-size: 12px; font-style: italic;">
                    For security reasons, you will be prompted to change your password upon your first login.
                </p>
            </div>
            
            {personalMessage}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="{loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                    Access Your Account
                </a>
            </div>
            
            <p style="color: #64748b; margin: 24px 0 0 0; font-size: 14px;">
                If you have any questions, feel free to reach out to our support team.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Best regards,</p>
            <p style="color: #334155; margin: 0 0 16px 0; font-size: 14px; font-weight: 600;">The CharismaAI Team</p>
            <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                © 2024 CharismaAI. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>',
    'welcome',
    true,
    true,
    '["name", "email", "tempPassword", "loginUrl", "personalMessage"]'::jsonb,
    '{
        "primaryColor": "#667eea",
        "secondaryColor": "#764ba2",
        "backgroundColor": "#f8fafc",
        "textColor": "#1e293b",
        "accentColor": "#e2e8f0",
        "fontFamily": "Inter, Segoe UI, sans-serif",
        "buttonStyle": "gradient",
        "layout": "modern"
    }'::jsonb
);

-- Template 2: Executive Dark Theme
INSERT INTO "EmailTemplate" (
    "id", "name", "subject", "content", "htmlContent", "category", "isBuiltIn", "isActive", "variables", "styling"
) VALUES (
    gen_random_uuid()::text,
    'Executive Dark',
    'CharismaAI Executive Access - Welcome Aboard',
    'Dear {name},

Welcome to CharismaAI Executive Suite. Your premium account has been activated.

Login Credentials:
Email: {email}
Temporary Password: {tempPassword}

{personalMessage}

Access your executive dashboard: {loginUrl}

Best regards,
CharismaAI Executive Team',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CharismaAI Executive Access</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Georgia'', ''Times New Roman'', serif; background-color: #0f0f0f; line-height: 1.7;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border: 1px solid #333333;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 50px 40px; text-align: center; border-bottom: 2px solid #d4af37;">
            <h1 style="color: #d4af37; margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase;">CharismaAI</h1>
            <p style="color: #cccccc; margin: 12px 0 0 0; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">Executive Suite</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 50px 40px;">
            <h2 style="color: #ffffff; margin: 0 0 30px 0; font-size: 26px; font-weight: 300; letter-spacing: 1px;">Welcome to Excellence, {name}</h2>
            
            <p style="color: #cccccc; margin: 0 0 30px 0; font-size: 16px;">
                Your executive access to CharismaAI has been activated. Experience premium AI-powered communication analysis with exclusive features designed for leadership.
            </p>
            
            <!-- Credentials Box -->
            <div style="background-color: #262626; border: 1px solid #404040; padding: 30px; margin: 30px 0; border-radius: 2px;">
                <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 18px; font-weight: 400; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #404040; padding-bottom: 10px;">Executive Credentials</h3>
                <div style="margin: 15px 0;">
                    <span style="color: #999999; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Email Address</span>
                    <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 16px; font-family: ''Courier New'', monospace;">{email}</p>
                </div>
                <div style="margin: 15px 0;">
                    <span style="color: #999999; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</span>
                    <p style="color: #d4af37; margin: 5px 0 0 0; font-size: 16px; font-family: ''Courier New'', monospace; background-color: #1f1f1f; padding: 8px 12px; border-radius: 2px;">{tempPassword}</p>
                </div>
                <p style="color: #888888; margin: 20px 0 0 0; font-size: 12px; font-style: italic;">
                    Secure your account by changing your password upon first login.
                </p>
            </div>
            
            {personalMessage}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="{loginUrl}" style="display: inline-block; background-color: #d4af37; color: #000000; text-decoration: none; padding: 18px 40px; border-radius: 2px; font-weight: 600; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; transition: all 0.3s ease;">
                    Access Executive Dashboard
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0d0d0d; padding: 40px; text-align: center; border-top: 1px solid #333333;">
            <p style="color: #666666; margin: 0 0 5px 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Exclusively yours,</p>
            <p style="color: #d4af37; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; letter-spacing: 1px;">CharismaAI Executive Team</p>
            <p style="color: #444444; margin: 0; font-size: 11px; letter-spacing: 0.5px;">
                © 2024 CharismaAI Executive Suite. Confidential and Proprietary.
            </p>
        </div>
    </div>
</body>
</html>',
    'executive',
    true,
    true,
    '["name", "email", "tempPassword", "loginUrl", "personalMessage"]'::jsonb,
    '{
        "primaryColor": "#d4af37",
        "secondaryColor": "#1a1a1a",
        "backgroundColor": "#0f0f0f",
        "textColor": "#ffffff",
        "accentColor": "#333333",
        "fontFamily": "Georgia, Times New Roman, serif",
        "buttonStyle": "solid",
        "layout": "executive"
    }'::jsonb
);

-- Template 3: Creative Gradient
INSERT INTO "EmailTemplate" (
    "id", "name", "subject", "content", "htmlContent", "category", "isBuiltIn", "isActive", "variables", "styling"
) VALUES (
    gen_random_uuid()::text,
    'Creative Gradient',
    '🎨 Welcome to CharismaAI - Let''s Create Magic Together!',
    'Hey {name}! 👋

Welcome to the CharismaAI creative community! 🚀

Your account is ready:
📧 Email: {email}
🔑 Password: {tempPassword}

{personalMessage}

Ready to dive in? {loginUrl}

Let''s create something amazing together!
The CharismaAI Creative Team ✨',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CharismaAI</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Poppins'', ''Arial'', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%); padding: 40px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);"></div>
            <div style="position: relative; z-index: 1;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">CharismaAI</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; font-weight: 500; opacity: 0.9;">✨ Creative Communication Analysis ✨</p>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; font-size: 28px; font-weight: 700;">Hey {name}! 👋</h2>
            </div>
            
            <p style="color: #2c3e50; margin: 0 0 25px 0; font-size: 16px; text-align: center;">
                🎉 Welcome to the CharismaAI creative community! We''re absolutely thrilled to have you join us on this exciting journey.
            </p>
            
            <!-- Credentials Card -->
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 2px; border-radius: 15px; margin: 30px 0;">
                <div style="background-color: #ffffff; padding: 25px; border-radius: 13px;">
                    <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">🚀 Your Launch Credentials</h3>
                    
                    <div style="display: flex; align-items: center; margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #f8f9ff, #f0f4ff); border-radius: 10px;">
                        <span style="font-size: 20px; margin-right: 10px;">📧</span>
                        <div style="flex: 1;">
                            <p style="color: #666; margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                            <p style="color: #2c3e50; margin: 5px 0 0 0; font-size: 14px; font-family: ''Courier New'', monospace;">{email}</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: center; margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #fff8f0, #fff0e6); border-radius: 10px;">
                        <span style="font-size: 20px; margin-right: 10px;">🔑</span>
                        <div style="flex: 1;">
                            <p style="color: #666; margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</p>
                            <p style="color: #e74c3c; margin: 5px 0 0 0; font-size: 16px; font-family: ''Courier New'', monospace; font-weight: 700;">{tempPassword}</p>
                        </div>
                    </div>
                    
                    <p style="color: #7f8c8d; margin: 20px 0 0 0; font-size: 12px; text-align: center; font-style: italic;">
                        🔒 Don''t forget to change your password after logging in!
                    </p>
                </div>
            </div>
            
            {personalMessage}
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="{loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #feca57); color: #ffffff; text-decoration: none; padding: 18px 35px; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 30px rgba(255, 107, 107, 0.4); transform: translateY(0); transition: all 0.3s ease;">
                    🚀 Launch My Account
                </a>
            </div>
            
            <div style="text-align: center; margin: 30px 0 0 0;">
                <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
                    Need help? We''re here for you! 💪
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 30px; text-align: center;">
            <p style="color: #6c757d; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Let''s create something amazing together! ✨</p>
            <p style="color: #2c3e50; margin: 0 0 15px 0; font-size: 15px; font-weight: 700;">The CharismaAI Creative Team</p>
            <p style="color: #adb5bd; margin: 0; font-size: 11px;">
                © 2024 CharismaAI. Made with 💜 for creative minds.
            </p>
        </div>
    </div>
</body>
</html>',
    'creative',
    true,
    true,
    '["name", "email", "tempPassword", "loginUrl", "personalMessage"]'::jsonb,
    '{
        "primaryColor": "#ff6b6b",
        "secondaryColor": "#feca57",
        "backgroundColor": "#667eea",
        "textColor": "#2c3e50",
        "accentColor": "#48dbfb",
        "fontFamily": "Poppins, Arial, sans-serif",
        "buttonStyle": "gradient-rounded",
        "layout": "creative"
    }'::jsonb
);

-- Template 4: Minimalist Clean
INSERT INTO "EmailTemplate" (
    "id", "name", "subject", "content", "htmlContent", "category", "isBuiltIn", "isActive", "variables", "styling"
) VALUES (
    gen_random_uuid()::text,
    'Minimalist Clean',
    'CharismaAI Account Created',
    '{name},

Your CharismaAI account is ready.

Email: {email}
Password: {tempPassword}

{personalMessage}

Login: {loginUrl}

CharismaAI',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CharismaAI Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Helvetica Neue'', Helvetica, Arial, sans-serif; background-color: #ffffff; line-height: 1.5;">
    <div style="max-width: 500px; margin: 60px auto; padding: 0 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 60px;">
            <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 3px;">CHARISMA</h1>
            <div style="width: 40px; height: 1px; background-color: #000000; margin: 20px auto;"></div>
        </div>
        
        <!-- Content -->
        <div style="margin-bottom: 60px;">
            <h2 style="color: #000000; margin: 0 0 40px 0; font-size: 18px; font-weight: 400; letter-spacing: 1px;">{name},</h2>
            
            <p style="color: #666666; margin: 0 0 40px 0; font-size: 14px; line-height: 1.6;">
                Your CharismaAI account has been created and is ready for use.
            </p>
            
            <!-- Credentials -->
            <div style="margin: 40px 0;">
                <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-bottom: 20px;">
                    <p style="color: #999999; margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                    <p style="color: #000000; margin: 8px 0 0 0; font-size: 14px; font-family: ''Courier New'', monospace;">{email}</p>
                </div>
                
                <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-bottom: 20px;">
                    <p style="color: #999999; margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</p>
                    <p style="color: #000000; margin: 8px 0 0 0; font-size: 14px; font-family: ''Courier New'', monospace; background-color: #f8f8f8; padding: 8px 0; letter-spacing: 2px;">{tempPassword}</p>
                </div>
                
                <div style="border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 20px 0;">
                    <p style="color: #cccccc; margin: 0; font-size: 11px; font-style: italic;">
                        Change your password after first login.
                    </p>
                </div>
            </div>
            
            {personalMessage}
            
            <!-- CTA -->
            <div style="margin: 50px 0;">
                <a href="{loginUrl}" style="display: inline-block; color: #000000; text-decoration: none; padding: 12px 0; border-bottom: 2px solid #000000; font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">
                    Access Account
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #f0f0f0; padding-top: 40px;">
            <p style="color: #000000; margin: 0 0 20px 0; font-size: 12px; font-weight: 300; letter-spacing: 1px;">CHARISMAAI</p>
            <p style="color: #cccccc; margin: 0; font-size: 10px; letter-spacing: 0.5px;">
                © 2024 All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>',
    'minimal',
    true,
    true,
    '["name", "email", "tempPassword", "loginUrl", "personalMessage"]'::jsonb,
    '{
        "primaryColor": "#000000",
        "secondaryColor": "#666666",
        "backgroundColor": "#ffffff",
        "textColor": "#000000",
        "accentColor": "#f0f0f0",
        "fontFamily": "Helvetica Neue, Helvetica, Arial, sans-serif",
        "buttonStyle": "underline",
        "layout": "minimal"
    }'::jsonb
);

-- Template 5: Tech Cyberpunk
INSERT INTO "EmailTemplate" (
    "id", "name", "subject", "content", "htmlContent", "category", "isBuiltIn", "isActive", "variables", "styling"
) VALUES (
    gen_random_uuid()::text,
    'Tech Cyberpunk',
    '[CHARISMA.AI] >>> ACCESS GRANTED >>> {name}',
    '>>> SYSTEM MESSAGE <<<
USER: {name}
STATUS: ACCOUNT ACTIVATED
EMAIL: {email}
TEMP_PASS: {tempPassword}

{personalMessage}

>>> CONNECT_TO_MATRIX: {loginUrl}

CHARISMA.AI_SYSTEM
>>> END TRANSMISSION <<<',
    '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CharismaAI System Access</title>
</head>
<body style="margin: 0; padding: 0; font-family: ''Courier New'', ''Consolas'', monospace; background-color: #0a0a0a; color: #00ff41; line-height: 1.4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 2px solid #00ff41; box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);">
        <!-- Header -->
        <div style="background-color: #000000; padding: 20px; border-bottom: 2px solid #00ff41; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px);"></div>
            <div style="position: relative; z-index: 1;">
                <p style="color: #00ff41; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">>> SYSTEM BOOT SEQUENCE INITIATED <<<</p>
                <h1 style="color: #00ff41; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);">CHARISMA.AI</h1>
                <p style="color: #00ff41; margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">[NEURAL_NETWORK_INTERFACE_v2.0.24]</p>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0, 255, 65, 0.02) 20px, rgba(0, 255, 65, 0.02) 21px);">
            <div style="margin-bottom: 25px;">
                <p style="color: #00ff41; margin: 0; font-size: 14px; font-weight: bold;">>> SYSTEM MESSAGE <<<</p>
                <p style="color: #ffffff; margin: 10px 0 0 20px; font-size: 12px;">ACCESS GRANTED FOR USER: <span style="color: #ff6b35; font-weight: bold;">{name}</span></p>
            </div>
            
            <div style="background-color: #001100; border: 1px solid #00ff41; padding: 20px; margin: 20px 0; position: relative;">
                <div style="position: absolute; top: 5px; right: 10px; color: #00ff41; font-size: 10px;">ENCRYPTED</div>
                
                <p style="color: #00ff41; margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">>>> USER CREDENTIALS <<<</p>
                
                <div style="margin: 15px 0;">
                    <span style="color: #ffff00; font-size: 11px;">EMAIL_ADDRESS:</span>
                    <p style="color: #ffffff; margin: 5px 0 0 20px; font-size: 13px; background-color: #002200; padding: 5px 10px; border-left: 3px solid #00ff41;">{email}</p>
                </div>
                
                <div style="margin: 15px 0;">
                    <span style="color: #ffff00; font-size: 11px;">TEMP_PASSWORD:</span>
                    <p style="color: #ff6b35; margin: 5px 0 0 20px; font-size: 13px; background-color: #002200; padding: 5px 10px; border-left: 3px solid #ff6b35; letter-spacing: 1px; font-weight: bold;">{tempPassword}</p>
                </div>
                
                <div style="margin: 20px 0 0 0; padding-top: 15px; border-top: 1px solid #003300;">
                    <p style="color: #888888; margin: 0; font-size: 10px;">
                        [WARNING] CHANGE PASSWORD ON FIRST LOGIN FOR SECURITY PROTOCOL COMPLIANCE
                    </p>
                </div>
            </div>
            
            {personalMessage}
            
            <div style="margin: 30px 0; text-align: center;">
                <p style="color: #00ff41; margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">>> INITIATE CONNECTION <<<</p>
                <a href="{loginUrl}" style="display: inline-block; background-color: #000000; color: #00ff41; text-decoration: none; padding: 15px 30px; border: 2px solid #00ff41; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 0 15px rgba(0, 255, 65, 0.3); transition: all 0.3s ease;">
                    [CONNECT_TO_MATRIX]
                </a>
            </div>
            
            <div style="margin: 25px 0 0 0; padding: 15px; background-color: #001100; border-left: 4px solid #00ff41;">
                <p style="color: #888888; margin: 0; font-size: 11px;">
                    SYSTEM_STATUS: All neural pathways operational. Ready for cognitive enhancement protocols.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #000000; padding: 20px; border-top: 2px solid #00ff41; text-align: center;">
            <p style="color: #00ff41; margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">CHARISMA.AI_NEURAL_NETWORK</p>
            <p style="color: #666666; margin: 0 0 10px 0; font-size: 10px;">
                [SYSTEM_BUILD: v2.0.24] [UPTIME: 99.97%] [STATUS: OPERATIONAL]
            </p>
            <p style="color: #333333; margin: 0; font-size: 9px;">
                >>> END TRANSMISSION <<< © 2024 CHARISMA.AI CORPORATION
            </p>
        </div>
    </div>
</body>
</html>',
    'tech',
    true,
    true,
    '["name", "email", "tempPassword", "loginUrl", "personalMessage"]'::jsonb,
    '{
        "primaryColor": "#00ff41",
        "secondaryColor": "#ff6b35",
        "backgroundColor": "#0a0a0a",
        "textColor": "#00ff41",
        "accentColor": "#ffff00",
        "fontFamily": "Courier New, Consolas, monospace",
        "buttonStyle": "terminal",
        "layout": "cyberpunk"
    }'::jsonb
);
