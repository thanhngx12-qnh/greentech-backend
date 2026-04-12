-- AlterTable
ALTER TABLE "services" ADD COLUMN     "currency" TEXT DEFAULT 'VND',
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "price" DECIMAL(18,2);
