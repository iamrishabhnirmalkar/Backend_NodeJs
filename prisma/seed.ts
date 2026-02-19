/**
 * Prisma seed script – runs with: pnpm prisma:seed (or prisma db seed)
 * Works with MySQL, MariaDB, and PostgreSQL (same Prisma API).
 * Load DATABASE_URL from .env (or .env.development, etc.) before running.
 */
import 'dotenv-flow/config';
import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Permissions (idempotent: create if not exists)
  const permissionData = [
    { name: 'user:create', resource: 'user', action: 'create', description: 'Create users' },
    { name: 'user:read', resource: 'user', action: 'read', description: 'Read users' },
    { name: 'user:update', resource: 'user', action: 'update', description: 'Update users' },
    { name: 'user:delete', resource: 'user', action: 'delete', description: 'Delete users' },
    { name: 'role:create', resource: 'role', action: 'create', description: 'Create roles' },
    { name: 'role:read', resource: 'role', action: 'read', description: 'Read roles' },
    { name: 'role:update', resource: 'role', action: 'update', description: 'Update roles' },
    { name: 'role:delete', resource: 'role', action: 'delete', description: 'Delete roles' },
  ];

  for (const p of permissionData) {
    await prisma.permission.upsert({
      where: { name: p.name },
      create: p,
      update: { description: p.description },
    });
  }
  console.log(`  ✓ ${permissionData.length} permissions`);

  // 2. Roles (idempotent)
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    create: { name: 'admin', description: 'Administrator', isActive: true },
    update: {},
  });
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    create: { name: 'user', description: 'Regular user', isActive: true },
    update: {},
  });
  console.log('  ✓ roles: admin, user');

  // 3. Assign all permissions to admin role
  const permissions = await prisma.permission.findMany();
  for (const perm of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id },
      },
      create: { roleId: adminRole.id, permissionId: perm.id },
      update: {},
    });
  }
  console.log('  ✓ admin role has all permissions');

  // 4. Optional: seed admin user (set SEED_ADMIN_PASSWORD in .env to create)
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminPassword) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      create: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
      update: { password: hashedPassword },
    });
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: adminUser.id, roleId: adminRole.id },
      },
      create: { userId: adminUser.id, roleId: adminRole.id },
      update: {},
    });
    console.log('  ✓ admin user: admin@example.com (role: admin)');
  } else {
    console.log('  ○ skip admin user (set SEED_ADMIN_PASSWORD in .env to create)');
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
