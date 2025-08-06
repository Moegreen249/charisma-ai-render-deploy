import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFailedStories() {
  try {
    console.log('Finding stories with JSON parsing errors...');
    
    // Find all stories to inspect their current state
    const allStories = await prisma.story.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        errorMessage: true,
        content: true,
        generatedAt: true
      }
    });

    console.log(`Found ${allStories.length} total stories in database`);
    
    // Show details of all stories for debugging
    for (const story of allStories) {
      console.log(`\n--- Story ${story.id} ---`);
      console.log(`Title: ${story.title}`);
      console.log(`Status: ${story.status}`);
      console.log(`Error Message: ${story.errorMessage || 'None'}`);
      console.log(`Generated At: ${story.generatedAt}`);
      if (story.content && typeof story.content === 'object') {
        const contentStr = JSON.stringify(story.content);
        console.log(`Content Preview: ${contentStr.substring(0, 200)}...`);
      }
    }
    
    // Filter stories that might have JSON parsing issues
    const stories = allStories.filter(story => {
      // Check if title contains error indicators
      const hasErrorInTitle = story.title && (
        story.title.includes('unexpected token') ||
        story.title.includes('is not valid JSON') ||
        story.title.includes('SyntaxError') ||
        story.title.includes('JSON.parse')
      );
      
      // Check if content looks like an error message rather than proper story content
      const hasErrorContent = story.content && typeof story.content === 'object' && 
        JSON.stringify(story.content).includes('unexpected token');
      
      // Check if error message contains JSON parsing issues
      const hasErrorInMessage = story.errorMessage && (
        story.errorMessage.includes('unexpected token') ||
        story.errorMessage.includes('is not valid JSON') ||
        story.errorMessage.includes('JSON.parse')
      );
      
      return hasErrorInTitle || hasErrorContent || hasErrorInMessage;
    });

    // Also get stories with detailed info
    const detailedStories = await prisma.story.findMany({
      where: {
        id: { in: stories.map(s => s.id) }
      },
      select: {
        id: true,
        title: true,
        status: true,
        errorMessage: true,
        content: true
      }
    });

    console.log(`Found ${stories.length} stories with potential JSON parsing errors`);

    if (stories.length === 0) {
      console.log('No stories found with JSON parsing errors.');
      return;
    }

    // Show details of problematic stories
    for (const story of stories) {
      console.log(`\nStory ID: ${story.id}`);
      console.log(`Title: ${story.title}`);
      console.log(`Status: ${story.status}`);
      console.log(`Error Message: ${story.errorMessage || 'None'}`);
    }

    // Update these stories to have proper failed status
    const updateResult = await prisma.story.updateMany({
      where: {
        id: {
          in: stories.map(s => s.id)
        }
      },
      data: {
        status: 'FAILED',
        errorMessage: 'Story generation failed due to JSON parsing error',
        title: 'Story Generation Failed'
      }
    });

    console.log(`\nUpdated ${updateResult.count} stories to FAILED status`);
    
    // Also look for any stories with GENERATING status that might be stuck
    const stuckStories = await prisma.story.findMany({
      where: {
        status: 'GENERATING',
        generatedAt: {
          lt: new Date(Date.now() - 10 * 60 * 1000) // More than 10 minutes ago
        }
      }
    });

    if (stuckStories.length > 0) {
      console.log(`\nFound ${stuckStories.length} stuck stories in GENERATING status`);
      
      const stuckUpdateResult = await prisma.story.updateMany({
        where: {
          id: {
            in: stuckStories.map(s => s.id)
          }
        },
        data: {
          status: 'FAILED',
          errorMessage: 'Story generation timed out'
        }
      });
      
      console.log(`Updated ${stuckUpdateResult.count} stuck stories to FAILED status`);
    }

    console.log('\nDone fixing failed stories!');

  } catch (error) {
    console.error('Error fixing failed stories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixFailedStories();
}

export { fixFailedStories };