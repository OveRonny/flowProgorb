-- AlterTable
ALTER TABLE "User" ADD COLUMN "githubLogin" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_githubLogin_key" ON "User"("githubLogin");
