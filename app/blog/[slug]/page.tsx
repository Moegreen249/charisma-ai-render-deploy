import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Clock,
  Tag,
  Share2,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShareButton } from '@/components/blog/ShareButton';
import { themeConfig } from '@/lib/theme-config';
import { cn } from '@/lib/utils';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getBlogPost(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        slug: slug,
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
    });

    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

async function getRelatedPosts(categoryId: string, currentPostId: string) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        categoryId: categoryId,
        status: 'PUBLISHED',
        id: {
          not: currentPostId,
        },
      },
      include: {
        author: {
          select: {
            name: true,
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
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found - CharismaAI',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${post.title} - CharismaAI Blog`,
    description: post.excerpt || 'Read the latest insights about AI-powered communication analysis',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name || 'CharismaAI Team'],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.categoryId ? await getRelatedPosts(post.categoryId, post.id) : [];

  return (
    <UnifiedLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/blog"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-white/10 backdrop-blur-md border border-white/20",
              "text-purple-400 hover:text-purple-300 hover:bg-white/20",
              "transition-all duration-300"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto">
          <header className={cn(
            "mb-8 p-8 rounded-xl",
            themeConfig.colors.glass.background,
            themeConfig.colors.glass.border,
            themeConfig.colors.glass.shadow,
            "border"
          )}>
            {/* Category Badge */}
            {post.category && (
              <Badge 
                className={cn("mb-4", themeConfig.colors.glass.background, themeConfig.colors.glass.border)}
                style={{ backgroundColor: post.category.color + '20', color: post.category.color }}
              >
                {post.category.name}
              </Badge>
            )}

            {/* Title */}
            <h1 className={cn("text-4xl md:text-5xl font-bold mb-6 leading-tight", themeConfig.typography.gradient)}>
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Draft'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>5 min read</span>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className={cn("text-xs", themeConfig.colors.glass.border)}>
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Cover Image */}
            {post.coverImage && (
              <div className="aspect-video bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mb-8"></div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg prose-invert max-w-none mb-12">
            {post.content ? (
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Content Coming Soon</h3>
                <p className="text-gray-400">
                  This article is being prepared. Please check back soon for the full content.
                </p>
              </div>
            )}
          </div>

          {/* Share Section */}
          <div className="border-t border-white/20 pt-8 mb-12">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Share this article</h3>
                <p className="text-gray-400">Help others discover this content</p>
              </div>
              <ShareButton 
                title={post.title}
                url={`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog/${post.slug}`}
                description={post.excerpt || undefined}
              />
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-white/30 transition-all duration-300">
                  {relatedPost.coverImage && (
                    <div className="aspect-video bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg"></div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {relatedPost.category && (
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: relatedPost.category.color + '20', color: relatedPost.category.color }}
                        >
                          {relatedPost.category.name}
                        </Badge>
                      )}
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>5 min read</span>
                      </div>
                    </div>
                    <CardTitle className="text-white hover:text-purple-300 transition-colors">
                      <Link href={`/blog/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </CardTitle>
                    {relatedPost.excerpt && (
                      <CardDescription className="text-gray-300">
                        {relatedPost.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{relatedPost.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {relatedPost.publishedAt ? new Date(relatedPost.publishedAt).toLocaleDateString() : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </UnifiedLayout>
  );
}
