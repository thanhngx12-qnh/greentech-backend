// -----------------------------------------------------------------------------
// File: prisma.config.ts
// Chức năng: Cấu hình cho Prisma CLI (Đã fix lỗi TypeScript)
// -----------------------------------------------------------------------------
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'] as string, // Khẳng định với TS đây là string
  },
});
