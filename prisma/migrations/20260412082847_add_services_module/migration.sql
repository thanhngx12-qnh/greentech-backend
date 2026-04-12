/*
  Warnings:

  - You are about to drop the column `currency` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `desc_i18n` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `gallery` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `services` table. All the data in the column will be lost.
  - Added the required column `content_i18n` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "currency",
DROP COLUMN "desc_i18n",
DROP COLUMN "duration",
DROP COLUMN "gallery",
DROP COLUMN "price",
ADD COLUMN     "content_i18n" JSONB NOT NULL;
