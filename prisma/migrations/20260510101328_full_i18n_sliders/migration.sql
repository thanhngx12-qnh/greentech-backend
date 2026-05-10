/*
  Warnings:

  - You are about to drop the column `image_desktop` on the `sliders` table. All the data in the column will be lost.
  - You are about to drop the column `image_mobile` on the `sliders` table. All the data in the column will be lost.
  - You are about to drop the column `link_url` on the `sliders` table. All the data in the column will be lost.
  - You are about to drop the column `subtitle_i18n` on the `sliders` table. All the data in the column will be lost.
  - You are about to drop the column `title_i18n` on the `sliders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sliders" DROP COLUMN "image_desktop",
DROP COLUMN "image_mobile",
DROP COLUMN "link_url",
DROP COLUMN "subtitle_i18n",
DROP COLUMN "title_i18n",
ADD COLUMN     "content_i18n" JSONB NOT NULL DEFAULT '{}';
