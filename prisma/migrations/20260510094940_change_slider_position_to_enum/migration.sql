-- CreateEnum
CREATE TYPE "SliderPosition" AS ENUM ('HOME_TOP', 'HOME_MIDDLE', 'SERVICES_TOP', 'NEWS_TOP', 'CONTACT_TOP');

-- CreateTable
CREATE TABLE "sliders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" "SliderPosition" NOT NULL DEFAULT 'HOME_TOP',
    "image_desktop" TEXT NOT NULL,
    "image_mobile" TEXT,
    "title_i18n" JSONB,
    "subtitle_i18n" JSONB,
    "link_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sliders_pkey" PRIMARY KEY ("id")
);
