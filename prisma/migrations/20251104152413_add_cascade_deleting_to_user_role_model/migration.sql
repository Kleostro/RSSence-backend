-- DropForeignKey
ALTER TABLE "users_roles" DROP CONSTRAINT "users_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users_roles" DROP CONSTRAINT "users_roles_user_id_fkey";

-- AddForeignKey
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
