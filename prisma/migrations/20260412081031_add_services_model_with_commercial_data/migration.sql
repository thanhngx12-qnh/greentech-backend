/*
  Warnings:

  - You are about to drop the column `name_i18n` on the `services` table. All the data in the column will be lost.
  - Added the required column `title_i18n` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "services" DROP COLUMN "name_i18n",
ADD COLUMN     "title_i18n" JSONB NOT NULL;
