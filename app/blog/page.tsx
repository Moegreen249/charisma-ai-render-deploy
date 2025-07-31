import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { 
  Calendar, 
  User, 
  ArrowRight, 
  BookOpen,
  Tag,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Blog & Newsletter - CharismaAI',
  description: 'Latest insights, updates, and articles about AI-powered communication analysis',
};

async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        category: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 12,
    });

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

async function getFeaturedPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'PUBLISHED',
        featured: true,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        category: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 3,
    });

    return posts;
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'PUBLISHED',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function BlogPage() {
  const [posts, featuredPosts, categories] = await Promise.all([
    getBlogPosts(),
    getFeaturedPosts(),
    getCategories(),
  ]);

  return (
    <UnifiedLayout variant="default">
      <div className="text-white py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 border border-white/20 mb-6">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <span className="text-white font-medium">Blog & Newsletter</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Latest Insights &
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Updates
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay updated with the latest developments in AI-powered communication analysis, 
              industry insights, and platform updates.
            </p>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center space-x-2 mb-8">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Featured Articles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <Card key={post.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-white/30 transition-all duration-300">
                    {post.coverImage && (
                      <div className="aspect-video bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg"></div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        {post.category && (
                          <Badge 
                            className="text-xs"
                            style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
                          >
                            {post.category.name}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      </div>
                      <CardTitle className="text-white hover:text-purple-300 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="text-gray-300">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog/category/${category.slug}`}
                    className="group"
                  >
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:border-white/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {category._count.posts} articles
                          </p>
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Posts */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-8">All Articles</h2>
            
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No articles yet</h3>
                <p className="text-gray-400">Check back soon for the latest insights and updates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-white/30 transition-all duration-300">
                    {post.coverImage && (
                      <div className="aspect-video bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg"></div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        {post.category && (
                          <Badge 
                            className="text-xs"
                            style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
                          >
                            {post.category.name}
                          </Badge>
                        )}
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>5 min read</span>
                        </div>
                      </div>
                      <CardTitle className="text-white hover:text-purple-300 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="text-gray-300">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{post.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                          </span>
                        </div>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                      >
                        Read more
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-20">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/30 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-gray-300 mb-6">
                Subscribe to our newsletter for the latest insights, updates, and exclusive content.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}