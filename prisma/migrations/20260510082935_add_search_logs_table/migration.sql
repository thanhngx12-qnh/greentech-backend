-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'vi',
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);
