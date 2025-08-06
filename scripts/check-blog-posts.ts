import { prisma } from '../lib/prisma';

async function checkBlogPosts() {
  try {
    console.log('🔍 Checking blog posts in database...');
    
    const posts = await prisma.blogPost.findMany({
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

    console.log(`📊 Found ${posts.length} blog posts:`);
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title}`);
      console.log(`   - Slug: ${post.slug}`);
      console.log(`   - Status: ${post.status}`);
      console.log(`   - Featured: ${post.featured}`);
      console.log(`   - Author: ${post.author.name}`);
      console.log(`   - Category: ${post.category?.name || 'No category'}`);
      console.log(`   - Tags: ${post.tags.join(', ')}`);
      console.log('');
    });

    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    console.log(`📁 Found ${categories.length} categories:`);
    categories.forEach((category) => {
      console.log(`- ${category.name} (${category._count.posts} posts)`);
    });

  } catch (error) {
    console.error('❌ Error checking blog posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBlogPosts();