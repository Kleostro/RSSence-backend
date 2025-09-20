-- CreateTable
CREATE TABLE "post_view_aggregations" (
    "post_id" INTEGER NOT NULL,
    "unique_views" INTEGER NOT NULL DEFAULT 0,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_view_aggregations_pkey" PRIMARY KEY ("post_id")
);

-- AddForeignKey
ALTER TABLE "post_view_aggregations" ADD CONSTRAINT "post_view_aggregations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
