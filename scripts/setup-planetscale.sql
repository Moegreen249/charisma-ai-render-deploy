-- CharismaAI PlanetScale Database Schema
-- Optimized for serverless MySQL with proper indexing

-- Users table with comprehensive profile data
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  isApproved BOOLEAN DEFAULT TRUE,
  requirePasswordChange BOOLEAN DEFAULT FALSE,
  
  -- Profile fields
  bio TEXT,
  avatar VARCHAR(500),
  website VARCHAR(500),
  location VARCHAR(255),
  dateOfBirth DATE,
  phone VARCHAR(50),
  company VARCHAR(255),
  jobTitle VARCHAR(255),
  
  -- JSON fields for complex data
  skills JSON,
  socialLinks JSON,
  preferences JSON,
  settings JSON,
  
  -- Privacy settings
  isPublic BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_isApproved (isApproved),
  INDEX idx_createdAt (createdAt)
);

-- Analyses table for AI analysis results
CREATE TABLE IF NOT EXISTS analyses (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  templateId VARCHAR(255) NOT NULL,
  modelId VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  fileName VARCHAR(500) NOT NULL,
  
  -- Analysis data
  analysisResult JSON NOT NULL,
  status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  durationMs INT DEFAULT 0,
  error TEXT,
  
  -- Timestamps
  analysisDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key and indexes
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_provider (provider),
  INDEX idx_analysisDate (analysisDate),
  INDEX idx_templateId (templateId)
);

-- Stories table for AI-generated stories
CREATE TABLE IF NOT EXISTS stories (
  id VARCHAR(255) PRIMARY KEY,
  analysisId VARCHAR(255) NOT NULL,
  userId VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  
  -- Story content
  content JSON,
  aiProvider VARCHAR(100) DEFAULT 'pending',
  modelId VARCHAR(255) DEFAULT 'pending',
  promptVersion VARCHAR(50) DEFAULT 'v1.0',
  status ENUM('PENDING', 'GENERATING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys and indexes
  FOREIGN KEY (analysisId) REFERENCES analyses(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_analysisId (analysisId),
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_aiProvider (aiProvider),
  INDEX idx_createdAt (createdAt)
);

-- Notifications table for user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
  
  -- Notification data
  actionUrl VARCHAR(1000),
  metadata JSON,
  isRead BOOLEAN DEFAULT FALSE,
  readAt TIMESTAMP NULL,
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key and indexes
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_type (type),
  INDEX idx_createdAt (createdAt)
);

-- Platform errors table for error logging
CREATE TABLE IF NOT EXISTS platform_errors (
  id VARCHAR(255) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  message TEXT NOT NULL,
  description TEXT,
  stackTrace TEXT,
  endpoint VARCHAR(500),
  userId VARCHAR(255),
  
  -- Error resolution
  isResolved BOOLEAN DEFAULT FALSE,
  resolvedAt TIMESTAMP NULL,
  resolvedBy VARCHAR(255),
  resolution TEXT,
  
  -- Metadata
  metadata JSON,
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key and indexes
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_severity (severity),
  INDEX idx_isResolved (isResolved),
  INDEX idx_userId (userId),
  INDEX idx_createdAt (createdAt)
);

-- User activities table for analytics
CREATE TABLE IF NOT EXISTS user_activities (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  resourceId VARCHAR(255),
  
  -- Activity data
  metadata JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  
  -- Timestamps
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key and indexes
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_action (action),
  INDEX idx_resource (resource),
  INDEX idx_timestamp (timestamp)
);

-- Background jobs table for job queue
CREATE TABLE IF NOT EXISTS background_jobs (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(100) NOT NULL,
  status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  priority INT DEFAULT 0,
  
  -- Job data
  payload JSON NOT NULL,
  result JSON,
  error TEXT,
  
  -- Processing info
  attempts INT DEFAULT 0,
  maxAttempts INT DEFAULT 3,
  processedAt TIMESTAMP NULL,
  failedAt TIMESTAMP NULL,
  
  -- Scheduling
  scheduledFor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for job processing
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_priority (priority),
  INDEX idx_scheduledFor (scheduledFor),
  INDEX idx_createdAt (createdAt)
);

-- Blog posts table for content management
CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content LONGTEXT NOT NULL,
  excerpt TEXT,
  
  -- Post metadata
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  coverImage VARCHAR(1000),
  
  -- SEO fields
  metaTitle VARCHAR(500),
  metaDescription TEXT,
  
  -- Author and category
  authorId VARCHAR(255) NOT NULL,
  categoryId VARCHAR(255),
  
  -- Tags as JSON array
  tags JSON,
  
  -- Publishing
  publishedAt TIMESTAMP NULL,
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys and indexes
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_authorId (authorId),
  INDEX idx_categoryId (categoryId),
  INDEX idx_publishedAt (publishedAt),
  INDEX idx_createdAt (createdAt)
);

-- Blog categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_slug (slug),
  INDEX idx_name (name)
);

-- Add foreign key for blog_posts.categoryId
ALTER TABLE blog_posts 
ADD CONSTRAINT fk_blog_posts_category 
FOREIGN KEY (categoryId) REFERENCES blog_categories(id) ON DELETE SET NULL;

-- System settings table for application configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(255) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  value JSON NOT NULL,
  description TEXT,
  
  -- Metadata
  isPublic BOOLEAN DEFAULT FALSE,
  updatedBy VARCHAR(255),
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key and indexes
  FOREIGN KEY (updatedBy) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_category_key (category, key_name),
  INDEX idx_category (category),
  INDEX idx_isPublic (isPublic)
);

-- Performance optimization: Add composite indexes for common queries
ALTER TABLE analyses ADD INDEX idx_user_status (userId, status);
ALTER TABLE analyses ADD INDEX idx_user_date (userId, analysisDate);
ALTER TABLE stories ADD INDEX idx_user_status (userId, status);
ALTER TABLE notifications ADD INDEX idx_user_unread (userId, isRead);
ALTER TABLE user_activities ADD INDEX idx_user_timestamp (userId, timestamp);

-- Create views for common queries
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.createdAt,
  COUNT(DISTINCT a.id) as total_analyses,
  COUNT(DISTINCT s.id) as total_stories,
  COUNT(DISTINCT n.id) as total_notifications,
  COUNT(DISTINCT CASE WHEN n.isRead = FALSE THEN n.id END) as unread_notifications
FROM users u
LEFT JOIN analyses a ON u.id = a.userId
LEFT JOIN stories s ON u.id = s.userId
LEFT JOIN notifications n ON u.id = n.userId
GROUP BY u.id, u.name, u.email, u.role, u.createdAt;

-- Create view for recent activities
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
  ua.id,
  ua.userId,
  u.name as userName,
  ua.action,
  ua.resource,
  ua.resourceId,
  ua.timestamp,
  ua.metadata
FROM user_activities ua
JOIN users u ON ua.userId = u.id
ORDER BY ua.timestamp DESC;

-- Insert default system settings
INSERT IGNORE INTO system_settings (id, category, key_name, value, description, isPublic) VALUES
('setting_1', 'app', 'maintenance_mode', 'false', 'Enable/disable maintenance mode', TRUE),
('setting_2', 'app', 'registration_enabled', 'true', 'Allow new user registrations', TRUE),
('setting_3', 'ai', 'default_provider', '"google"', 'Default AI provider', FALSE),
('setting_4', 'ai', 'default_model', '"gemini-2.5-flash"', 'Default AI model', FALSE),
('setting_5', 'storage', 'max_file_size_mb', '50', 'Maximum file upload size in MB', FALSE),
('setting_6', 'blog', 'posts_per_page', '10', 'Number of blog posts per page', TRUE);

-- Insert default blog categories
INSERT IGNORE INTO blog_categories (id, name, slug, description, color) VALUES
('cat_1', 'AI & Technology', 'ai-technology', 'Articles about AI and technology trends', '#3B82F6'),
('cat_2', 'Communication', 'communication', 'Tips and insights on effective communication', '#10B981'),
('cat_3', 'Analysis', 'analysis', 'Deep dives into communication analysis', '#8B5CF6'),
('cat_4', 'Tutorials', 'tutorials', 'How-to guides and tutorials', '#F59E0B'),
('cat_5', 'News', 'news', 'Latest news and updates', '#EF4444');

-- Create indexes for JSON fields (MySQL 8.0+)
-- These help with queries on JSON data
ALTER TABLE users ADD INDEX idx_settings_theme ((CAST(settings->'$.preferences.theme' AS CHAR(20))));
ALTER TABLE analyses ADD INDEX idx_analysis_provider ((CAST(analysisResult->'$.provider' AS CHAR(50))));

-- Create stored procedures for common operations
DELIMITER //

-- Procedure to get user dashboard stats
CREATE PROCEDURE GetUserDashboardStats(IN user_id VARCHAR(255))
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM analyses WHERE userId = user_id) as total_analyses,
    (SELECT COUNT(*) FROM analyses WHERE userId = user_id AND status = 'COMPLETED') as completed_analyses,
    (SELECT COUNT(*) FROM stories WHERE userId = user_id) as total_stories,
    (SELECT COUNT(*) FROM notifications WHERE userId = user_id AND isRead = FALSE) as unread_notifications,
    (SELECT COUNT(*) FROM user_activities WHERE userId = user_id AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as recent_activities;
END //

-- Procedure to clean up old data
CREATE PROCEDURE CleanupOldData()
BEGIN
  -- Delete old user activities (older than 90 days)
  DELETE FROM user_activities WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
  
  -- Delete resolved errors older than 30 days
  DELETE FROM platform_errors WHERE isResolved = TRUE AND resolvedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
  
  -- Delete completed background jobs older than 7 days
  DELETE FROM background_jobs WHERE status = 'COMPLETED' AND processedAt < DATE_SUB(NOW(), INTERVAL 7 DAY);
  
  -- Delete failed background jobs older than 30 days
  DELETE FROM background_jobs WHERE status = 'FAILED' AND failedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
END //

DELIMITER ;

-- Create triggers for automatic cleanup and logging
DELIMITER //

-- Trigger to log user activities on important actions
CREATE TRIGGER log_user_analysis AFTER INSERT ON analyses
FOR EACH ROW
BEGIN
  INSERT INTO user_activities (id, userId, action, resource, resourceId, metadata)
  VALUES (
    CONCAT('activity_', UNIX_TIMESTAMP(), '_', CONNECTION_ID()),
    NEW.userId,
    'analysis_created',
    'analysis',
    NEW.id,
    JSON_OBJECT('provider', NEW.provider, 'modelId', NEW.modelId)
  );
END //

-- Trigger to log story creation
CREATE TRIGGER log_user_story AFTER INSERT ON stories
FOR EACH ROW
BEGIN
  INSERT INTO user_activities (id, userId, action, resource, resourceId, metadata)
  VALUES (
    CONCAT('activity_', UNIX_TIMESTAMP(), '_', CONNECTION_ID()),
    NEW.userId,
    'story_created',
    'story',
    NEW.id,
    JSON_OBJECT('analysisId', NEW.analysisId, 'aiProvider', NEW.aiProvider)
  );
END //

DELIMITER ;

-- Final optimization: Analyze tables for better query planning
ANALYZE TABLE users, analyses, stories, notifications, platform_errors, user_activities, background_jobs, blog_posts, blog_categories, system_settings;