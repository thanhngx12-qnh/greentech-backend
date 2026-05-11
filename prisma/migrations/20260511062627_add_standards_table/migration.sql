-- CreateTable
CREATE TABLE "standards" (
    "id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "author_id" TEXT,
    "code" TEXT NOT NULL,
    "slug_i18n" JSONB NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "content_i18n" JSONB,
    "file_url" TEXT,
    "seo_i18n" JSONB,
    "status" "NewsStatus" NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "standards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "standards_code_key" ON "standards"("code");

-- AddForeignKey
ALTER TABLE "standards" ADD CONSTRAINT "standards_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standards" ADD CONSTRAINT "standards_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
