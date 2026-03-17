/*
  Warnings:

  - You are about to drop the column `progress` on the `Feature` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `ProjectModule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId,name]` on the table `Module` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `Module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TASK_CREATED', 'TASK_COMPLETED', 'FEATURE_CREATED', 'FEATURE_COMPLETED', 'PROJECT_UPDATED');

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectModule" DROP CONSTRAINT "ProjectModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectModule" DROP CONSTRAINT "ProjectModule_projectId_fkey";

-- DropIndex
DROP INDEX "Module_name_key";

-- DropIndex
DROP INDEX "Project_userId_name_key";

-- AlterTable
ALTER TABLE "Feature" DROP COLUMN "progress",
ADD COLUMN     "githubBranchName" TEXT,
ADD COLUMN     "githubSyncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orderIndex" INTEGER,
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "progress",
DROP COLUMN "userId",
ADD COLUMN     "githubOwner" TEXT,
ADD COLUMN     "githubRepoName" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignedToId" INTEGER;

-- DropTable
DROP TABLE "ProjectModule";

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,
    "role" "ProjectRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "type" "ActivityType" NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "ProjectMember"("userId", "projectId");

-- CreateIndex
CREATE INDEX "Feature_projectId_idx" ON "Feature"("projectId");

-- CreateIndex
CREATE INDEX "Feature_moduleId_idx" ON "Feature"("moduleId");

-- CreateIndex
CREATE INDEX "Module_projectId_idx" ON "Module"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_projectId_name_key" ON "Module"("projectId", "name");

-- CreateIndex
CREATE INDEX "Task_featureId_idx" ON "Task"("featureId");

-- CreateIndex
CREATE INDEX "TaskTimeLog_taskId_idx" ON "TaskTimeLog"("taskId");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
