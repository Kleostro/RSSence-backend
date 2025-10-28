-- CreateTable
CREATE TABLE "comment_daily_stats" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "total_comments" INTEGER NOT NULL DEFAULT 0,
    "active_comments" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "comment_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comment_daily_stats_post_id_date_idx" ON "comment_daily_stats"("post_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "comment_daily_stats_post_id_date_key" ON "comment_daily_stats"("post_id", "date");

-- AddForeignKey
ALTER TABLE "comment_daily_stats" ADD CONSTRAINT "comment_daily_stats_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
