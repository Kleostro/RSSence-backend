-- CreateTable
CREATE TABLE "post_view_daily_stats" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "total_views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "post_view_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_view_daily_stats_post_id_date_idx" ON "post_view_daily_stats"("post_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "post_view_daily_stats_post_id_date_key" ON "post_view_daily_stats"("post_id", "date");

-- AddForeignKey
ALTER TABLE "post_view_daily_stats" ADD CONSTRAINT "post_view_daily_stats_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
