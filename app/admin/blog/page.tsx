'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Plus, Trash2, Eye, Save, X, Calendar, User, Tag, Sparkles, RefreshCw } from "lucide-react";
import Edit from "lucide-react/dist/esm/icons/edit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

export default function BlogManagementPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/signin';
    }
  }, [status]);

  // Fetch blog posts and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch blog posts
        const postsResponse = await fetch('/api/admin/blog');
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData.posts || []);
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/blog/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch blog data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load blog data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const handleCreatePost = async () => {
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts(prev => [newPost.post, ...prev]);
        setIsCreateDialogOpen(false);
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          category: '',
          tags: '',
          status: 'draft'
        });
        setMessage({
          type: 'success',
          text: 'Blog post created successfully!'
        });
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to create blog post. Please try again.'
      });
    }
  };

  const handleEditPost = async () => {
    if (!selectedPost) return;

    try {
      const response = await fetch(`/api/admin/blog/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(prev => prev.map(post => 
          post.id === selectedPost.id ? updatedPost.post : post
        ));
        setIsEditDialogOpen(false);
        setSelectedPost(null);
        setMessage({
          type: 'success',
          text: 'Blog post updated successfully!'
        });
      } else {
        throw new Error('Failed to update post');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update blog post. Please try again.'
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post.id !== postId));
        setMessage({
          type: 'success',
          text: 'Blog post deleted successfully!'
        });
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete blog post. Please try again.'
      });
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags.join(', '),
      status: post.status
    });
    setIsEditDialogOpen(true);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white/70">Loading blog management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6 relative overflow-hidden">
      {/* Neural background particles - blog theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 left-8 sm:left-20 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse motion-reduce:animate-none"></div>
        <div className="absolute top-48 right-12 sm:right-32 w-1 h-1 bg-cyan-400/25 rounded-full animate-ping motion-reduce:animate-none"></div>
        <div className="absolute bottom-32 left-6 sm:left-16 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-12 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-ping motion-reduce:animate-none" style={{animationDelay: '2.3s'}}></div>
        <div className="absolute top-1/3 left-32 w-2 h-2 bg-indigo-300/15 rounded-full animate-pulse motion-reduce:animate-none" style={{animationDelay: '0.8s'}}></div>
      </div>
      
      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <FileText className="mr-3 h-6 w-6" />
                Blog Management
              </h1>
              <p className="text-white/70 mt-1">
                Create, edit, and manage blog posts and categories
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {posts.length} Posts
              </Badge>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.location.href = '/admin/blog/editor'}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Professional Editor
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300">
                      <Plus className="w-4 h-4 mr-2" />
                      Quick Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Blog Post</DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Fill in the details to create a new blog post.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-white">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter blog post title"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief description of the post"
                        className="bg-gray-800 border-gray-600 text-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="content" className="text-white">Content</Label>
                      <div className="mt-2">
                        <RichTextEditor
                          value={formData.content}
                          onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                          placeholder="Write your blog post content here..."
                          height="400px"
                          features={{
                            aiAssistant: true,
                            templates: true,
                            export: false,
                            fullscreen: true,
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="category" className="text-white">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
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
                        <Label htmlFor="tags" className="text-white">Tags</Label>
                        <Input
                          id="tags"
                          value={formData.tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="tag1, tag2, tag3"
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status" className="text-white">Status</Label>
                        <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreatePost} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300">
                        <Save className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </div>
                  </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <Alert className={`${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          } backdrop-blur-md`}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-white">Filter Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-white">Search</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search posts..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div>
                <Label htmlFor="status-filter" className="text-white">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category-filter" className="text-white">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/[0.15] hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-white">Blog Posts ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white">Title</TableHead>
                    <TableHead className="text-white">Category</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Author</TableHead>
                    <TableHead className="text-white">Created</TableHead>
                    <TableHead className="text-white">Views</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id} className="border-white/10">
                      <TableCell className="text-white">
                        <div>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-white/60">{post.excerpt}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">{post.category}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          post.status === 'published' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : post.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/70">{post.author.name}</TableCell>
                      <TableCell className="text-white/70">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-white/70">{post.views}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/admin/blog/editor?id=${post.id}`}
                            className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30 touch-manipulation hover:scale-105 transition-all duration-300"
                            title="Edit in Professional Editor"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePost(post.id)}
                            className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30 touch-manipulation hover:scale-105 transition-all duration-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Blog Post</DialogTitle>
              <DialogDescription className="text-gray-300">
                Update the blog post details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="text-white">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-excerpt" className="text-white">Excerpt</Label>
                <Textarea
                  id="edit-excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-content" className="text-white">Content</Label>
                <div className="mt-2">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    placeholder="Edit your blog post content..."
                    height="400px"
                    features={{
                      aiAssistant: true,
                      templates: true,
                      export: true,
                      fullscreen: true,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-category" className="text-white">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
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
                  <Label htmlFor="edit-tags" className="text-white">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status" className="text-white">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditPost} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 touch-manipulation hover:scale-[1.02] transition-all duration-300">
                  <Save className="w-4 h-4 mr-2" />
                  Update Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
