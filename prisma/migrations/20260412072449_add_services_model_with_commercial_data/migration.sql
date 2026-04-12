-- AlterTable
ALTER TABLE "services" ADD COLUMN     "author_id" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'VND',
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "gallery" JSONB,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "price" DECIMAL(12,2);

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
