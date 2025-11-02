import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // Clear existing data
  console.log('[Seed] Clearing existing blocks...');
  await prisma.block.deleteMany({});
  
  console.log('[Seed] Clearing existing streams...');
  await prisma.stream.deleteMany({});

  // Create sample stream
  console.log('[Seed] Creating sample stream...');
  const stream = await prisma.stream.create({
    data: {
      name: 'Welcome to Papyrus Lite',
      blocks: {
        create: [
          {
            type: 'markdown',
            content: '# Welcome to Papyrus Lite!\n\nThis is a sample markdown block. You can:\n- Add new blocks\n- Reorder blocks using the up/down arrows\n- Toggle blocks in/out of AI context\n- Delete blocks\n\nTry creating your own blocks!',
            order: 0,
            inContext: true
          },
          {
            type: 'prompt',
            content: 'This is a placeholder prompt block. In future modules, this will allow you to send prompts to AI models.',
            order: 1,
            inContext: true
          }
        ]
      }
    },
    include: {
      blocks: true
    }
  });

  console.log('[Seed] Created stream:', stream.name);
  console.log('[Seed] Created', stream.blocks.length, 'blocks');
  console.log('[Seed] Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
