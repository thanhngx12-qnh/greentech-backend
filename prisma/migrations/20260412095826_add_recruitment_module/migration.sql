/*
  Warnings:

  - You are about to drop the column `cover_letter` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `job_posting_id` on the `job_applications` table. All the data in the column will be lost.
  - The `status` column on the `job_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `job_postings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `job_id` to the `job_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `job_applications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');

-- AlterEnum
ALTER TYPE "CategoryType" ADD VALUE 'JOB';

-- DropForeignKey
ALTER TABLE "job_applications" DROP CONSTRAINT "job_applications_job_posting_id_fkey";

-- DropForeignKey
ALTER TABLE "job_postings" DROP CONSTRAINT "job_postings_author_id_fkey";

-- AlterTable
ALTER TABLE "job_applications" DROP COLUMN "cover_letter",
DROP COLUMN "job_posting_id",
ADD COLUMN     "job_id" TEXT NOT NULL,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NEW';

-- DropTable
DROP TABLE "job_postings";

-- DropEnum
DROP TYPE "EmploymentType";

-- DropEnum
DROP TYPE "JobApplicationStatus";

-- DropEnum
DROP TYPE "JobPostingStatus";

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "author_id" TEXT NOT NULL,
    "slug_i18n" JSONB NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "description_i18n" JSONB NOT NULL,
    "requirements_i18n" JSONB NOT NULL,
    "benefits_i18n" JSONB NOT NULL,
    "type" "JobType" NOT NULL DEFAULT 'FULL_TIME',
    "location" TEXT NOT NULL,
    "salary_range" TEXT,
    "deadline" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "seo_i18n" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
