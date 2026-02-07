/**
 * Simple script to add admin user
 */

import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('➕ Adding admin user...');
    
    const password = await hash('Aa234311Aa@@@', 12);

    const admin = await prisma.user.create({
      data: {
        name: 'أحمد الوكيل',
        email: 'ahmadalwakai76@gmail.com',
        password: password,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
        bio: 'مدير منصة موحسن',
        location: 'موحسن سيتي',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: ahmadalwakai76@gmail.com');
    console.log('🔐 Password: Aa234311Aa@@@');
    console.log('👤 Name: أحمد الوكيل');
    console.log('🛡️ Role: ADMIN');
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️ User already exists with this email');
      console.log('Trying to update role to ADMIN...');
      
      const updated = await prisma.user.update({
        where: { email: 'ahmadalwakai76@gmail.com' },
        data: { role: Role.ADMIN },
      });
      
      console.log('✅ User role updated to ADMIN');
      console.log('📧 Email: ahmadalwakai76@gmail.com');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
