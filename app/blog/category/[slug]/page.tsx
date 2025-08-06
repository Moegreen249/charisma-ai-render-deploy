import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Calendar, User, ArrowLeft, ArrowRight, Clock, Tag, BookOpen } from "lucide-react";
import Filter from "lucide-react/dist/esm/icons/filter";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCategory(slug: string) {
  try {
    const category = await prisma.blogCategory.findUnique({
      where: {
        slug: slug,
      },
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
    });

    return category;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

async function getCategoryPosts(categoryId: string) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        categoryId: categoryId,
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
    });

    return posts;
  } catch (error) {
    console.error('Error fetching category posts:', error);
    return [];
  }
}

async function getAllCategories() {
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found - CharismaAI Blog',
      description: 'The requested blog category could not be found.',
    };
  }

  return {
    title: `${category.name} Articles - CharismaAI Blog`,
    description: category.description || `Browse all articles in the ${category.name} category`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const posts = await getCategoryPosts(category.id);
  const allCategories = await getAllCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Category Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            ></div>
            <Badge 
              className="text-sm"
              style={{ backgroundColor: category.color + '20', color: category.color }}
            >
              <Filter className="h-3 w-3 mr-1" />
              {category.name}
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {category.name} Articles
          </h1>
          
          {category.description && (
            <p className="text-xl text-gray-300 mb-6 max-w-3xl">
              {category.description}
            </p>
          )}
          
          <div className="text-gray-400">
            <span className="font-medium">{category._count.posts}</span> articles in this category
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Posts */}
          <div className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No articles in this category yet</h3>
                <p className="text-gray-400">Check back soon for new content in {category.name}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <Card key={post.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-white/30 transition-all duration-300">
                    {post.coverImage && (
                      <div className="aspect-video bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg"></div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          {category.name}
                        </Badge>
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

          {/* Sidebar - Other Categories */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6">Browse Categories</h3>
              <div className="space-y-3">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog/category/${cat.slug}`}
                    className={`block group ${cat.id === category.id ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:border-white/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          ></div>
                          <div>
                            <h4 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                              {cat.name}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {cat._count.posts} articles
                            </p>
                          </div>
                        </div>
                        {cat.id !== category.id && (
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-300 transition-colors" />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
