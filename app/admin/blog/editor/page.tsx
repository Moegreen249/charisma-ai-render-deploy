'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Save, Eye, FileText, Settings, Globe, Clock, Tag, Sparkles, ArrowLeft, Send, Trash2, Copy, RefreshCw,  } from "lucide-react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BlogPost {
  id?: string;
  title: string;
  slug?: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  likes?: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export default function BlogEditorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const isEdit = Boolean(postId);

  const [post, setPost] = useState<BlogPost>({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [] as string[],
    status: 'draft'
  });
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Check authentication and role
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
      redirect("/");
    }
  }, [session, status]);

  // Load post data and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        const categoriesResponse = await fetch('/api/admin/blog/categories', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }

        // Load post if editing
        if (isEdit && postId) {
          console.log('Loading post with ID:', postId);
          const postResponse = await fetch(`/api/admin/blog/posts/${postId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          if (postResponse.ok) {
            const postData = await postResponse.json();
            console.log('Post data loaded:', postData);
            setPost({
              ...postData.post,
              tags: postData.post.tags || []
            });
          } else {
            console.error('Failed to load post:', postResponse.status, postResponse.statusText);
            const errorData = await postResponse.text();
            console.error('Error response:', errorData);
            setMessage({
              type: 'error',
              text: `Failed to load post: ${postResponse.status} ${postResponse.statusText}`
            });
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load editor data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadData();
    }
  }, [status, isEdit, postId]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (hasUnsavedChanges && post.title && post.content) {
        await handleSave('draft', true);
      }
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [hasUnsavedChanges, post.title, post.content]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePostChange = (field: keyof BlogPost, value: any) => {
    setPost(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleSave = async (status: 'draft' | 'published' | 'archived' = 'draft', isAutoSave = false) => {
    try {
      setSaving(true);
      
      const postData = {
        ...post,
        status,
        slug: post.slug || generateSlug(post.title),
        tags: Array.isArray(post.tags) ? post.tags : [],
      };

      const url = isEdit ? `/api/admin/blog/posts/${postId}` : '/api/admin/blog';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        setPost(result.post);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        
        if (!isAutoSave) {
          showMessage('success', `Post ${isEdit ? 'updated' : 'created'} successfully!`);
          
          // Redirect to edit mode if creating new post
          if (!isEdit && result.post.id) {
            router.push(`/admin/blog/editor?id=${result.post.id}`);
          }
        }
      } else {
        throw new Error('Failed to save post');
      }
    } catch (error) {
      if (!isAutoSave) {
        showMessage('error', 'Failed to save post. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    if (!post.title || !post.content || !post.excerpt) {
      showMessage('error', 'Please fill in the title, content, and excerpt before publishing.');
      return;
    }
    handleSave('published');
  };

  const handleDelete = async () => {
    if (!isEdit || !postId) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Post deleted successfully!');
        setTimeout(() => router.push('/admin/blog'), 1000);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete post. Please try again.');
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading blog editor...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Neural background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-16 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-400/25 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-12 w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-pulse" style={{animationDelay: '1.2s'}}></div>
        <div className="absolute bottom-16 right-28 w-1 h-1 bg-green-400/25 rounded-full animate-ping" style={{animationDelay: '2.1s'}}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/admin/blog')}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  {isEdit ? 'Edit Article' : 'Create New Article'}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                  {lastSaved && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      Unsaved changes
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                onClick={() => handleSave('draft')}
                disabled={saving}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                onClick={handlePublish}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className={`${
                message.type === 'success' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                  : 'bg-red-500/20 border-red-500/30 text-red-300'
              } backdrop-blur-md mb-4`}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>

        {/* Editor Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
              {/* Title and Basic Info */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white text-lg font-medium">Article Title</Label>
                    <Input
                      id="title"
                      value={post.title}
                      onChange={(e) => handlePostChange('title', e.target.value)}
                      placeholder="Enter your article title..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-lg mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt" className="text-white font-medium">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={post.excerpt}
                      onChange={(e) => handlePostChange('excerpt', e.target.value)}
                      placeholder="Brief description of your article..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-2"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rich Text Editor */}
              <div>
                {isPreviewMode ? (
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <article className="prose prose-invert max-w-none">
                        <h1>{post.title}</h1>
                        {post.excerpt && <p className="lead text-white/70 text-lg">{post.excerpt}</p>}
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                      </article>
                    </CardContent>
                  </Card>
                ) : (
                  <RichTextEditor
                    value={post.content}
                    onChange={(value) => handlePostChange('content', value)}
                    placeholder="Start writing your article..."
                    height="600px"
                    features={{
                      aiAssistant: true,
                      templates: true,
                      export: true,
                      fullscreen: true,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status and Actions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Post Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Status</Label>
                    <Select value={post.status} onValueChange={(value: 'draft' | 'published' | 'archived') => handlePostChange('status', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Category</Label>
                    <Select value={post.category} onValueChange={(value) => handlePostChange('category', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Tags</Label>
                    <Input
                      value={Array.isArray(post.tags) ? post.tags.join(', ') : (typeof post.tags === 'string' ? post.tags : '')}
                      onChange={(e) => handlePostChange('tags', e.target.value.split(',').map((tag: string) => tag.trim()).filter(Boolean))}
                      placeholder="tag1, tag2, tag3"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-2"
                    />
                  </div>

                  {isEdit && (
                    <div className="pt-4 border-t border-white/20">
                      <Button
                        onClick={handleDelete}
                        variant="destructive"
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">SEO Title</Label>
                    <Input
                      value={post.seoTitle || ''}
                      onChange={(e) => handlePostChange('seoTitle', e.target.value)}
                      placeholder="SEO optimized title"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">SEO Description</Label>
                    <Textarea
                      value={post.seoDescription || ''}
                      onChange={(e) => handlePostChange('seoDescription', e.target.value)}
                      placeholder="SEO meta description"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 mt-2"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Analytics (if editing existing post) */}
              {isEdit && post.views !== undefined && (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Views</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {post.views || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Likes</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {post.likes || 0}
                      </Badge>
                    </div>
                    {post.publishedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Published</span>
                        <span className="text-white/60 text-sm">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}