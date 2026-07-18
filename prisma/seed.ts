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
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('⚠️ WARNING: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Skipping admin user creation.');
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      },
    });
    console.log(`Created new admin user: ${email}`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log(`Updated existing admin user: ${email}`);
  }
}

async function seedAdminProfile() {
  console.log('Seeding admin profile...');
  const whatsappNumber = process.env.ADMIN_WHATSAPP;

  if (!whatsappNumber) {
    console.warn('⚠️ WARNING: ADMIN_WHATSAPP not set in .env. Skipping admin profile creation.');
    return;
  }

  await prisma.adminProfile.upsert({
    where: { id: 'main' },
    create: { whatsappNumber: whatsappNumber },
    update: { whatsappNumber: whatsappNumber },
  });
  console.log('Admin profile seeded with WhatsApp number:', whatsappNumber);
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
