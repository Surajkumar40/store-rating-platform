require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return console.log(`Admin ${email} already exists, skipping.`);
  await prisma.user.create({
    data: {
      name: 'System Administrator Account',
      email,
      address: 'Head Office',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`Admin created: ${email}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
