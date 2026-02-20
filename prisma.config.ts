/**
 * Prisma config (replaces package.json "prisma" – works on Windows, Mac, Linux, Docker).
 * See: https://pris.ly/prisma-config
 */
import 'dotenv-flow/config';

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
};
