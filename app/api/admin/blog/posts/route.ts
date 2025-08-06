import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// GET - Fetch all blog posts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category?.name || 'Uncategorized',
      tags: post.tags || [],
      status: post.status.toLowerCase(),
      coverImage: post.coverImage,
      author: post.author,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      featured: post.featured,
      views: 0,
      likes: 0
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, excerpt, category, tags, status } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Find or create category
    let categoryRecord = null;
    if (category) {
      categoryRecord = await prisma.blogCategory.findFirst({
        where: { slug: category }
      });
    }

    // Create the blog post
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        status: (status || 'draft').toUpperCase(),
        authorId: user.id,
        categoryId: categoryRecord?.id,
        publishedAt: (status || '').toLowerCase() === 'published' ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    // Handle tags if provided (tags are String[] in schema)
    if (tags && Array.isArray(tags)) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { tags }
      });
    }

    const formattedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category?.name || 'Uncategorized',
      tags: tags || [],
      status: post.status.toLowerCase(),
      coverImage: post.coverImage,
      author: post.author,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      views: 0,
      likes: 0
    };

    return NextResponse.json({ post: formattedPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
