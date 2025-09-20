-- CreateIndex
CREATE INDEX "post_views_post_id_user_id_idx" ON "post_views"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "post_views_user_id_post_id_idx" ON "post_views"("user_id", "post_id");
