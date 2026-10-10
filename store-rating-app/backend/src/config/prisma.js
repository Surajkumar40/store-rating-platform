const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Prisma 6 "client" engine: talks to Postgres through the pg driver (no native engine binary needed).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
module.exports = new PrismaClient({ adapter });
