import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FEATURES = [
  'Air Conditioning', 'Sunroof', 'Reverse Camera', 'Bluetooth',
  'Navigation System', 'Leather Seats', 'Cruise Control', 'Alloy Wheels',
  'Parking Sensors', 'Push Start', 'Keyless Entry', 'Climate Control',
  'Fog Lights', 'Third Row Seats', 'Tow Package', 'Moonroof',
  'Heated Seats', 'Apple CarPlay', 'Android Auto', '360 Camera',
  'Blind Spot Monitor', 'Lane Departure Warning', 'Adaptive Cruise Control', 'Premium Audio'
];

async function seedAdminUser() {
  console.log('Seeding admin user...');
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@carzaar.com' },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        email: 'admin@carzaar.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

async function seedAdminProfile() {
  console.log('Seeding admin profile...');
  await prisma.adminProfile.upsert({
    where: { id: 'main' },
    create: { whatsappNumber: '2349158461502' },
    update: { whatsappNumber: '2349158461502' },
  });
  console.log('Admin profile seeded');
}

async function main() {
  try {
    console.log('Starting database seed...\n');

    await seedAdminUser();
    await seedAdminProfile();

    console.log('\nSeed completed successfully!');
    console.log('Features will be displayed from a hardcoded list in the admin form.');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
