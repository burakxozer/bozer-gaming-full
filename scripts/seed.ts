import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Mandatory hidden test account
  const passwordHash = await bcrypt.hash('8zKvwnB$7A', 10);

  await prisma.user.upsert({
    where: { email: 'abacus-3756c24e@example.com' },
    update: {},
    create: {
      username: 'testadmin',
      email: 'abacus-3756c24e@example.com',
      passwordHash,
      emailVerified: true,
      theme: 'steel',
    },
  });

  // Admin account: bozer / Bozerx123
  const adminHash = await bcrypt.hash('Bozerx123', 10);
  await prisma.user.upsert({
    where: { username: 'bozer' },
    update: { role: 'admin', emailVerified: true, passwordHash: adminHash },
    create: {
      username: 'bozer',
      email: 'bozer@bozergaming.com',
      passwordHash: adminHash,
      emailVerified: true,
      theme: 'steel',
      role: 'admin',
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
