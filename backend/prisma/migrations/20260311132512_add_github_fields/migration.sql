/*
  Warnings:

  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD');

-- DropIndex
DROP INDEX "Task_featureId_status_idx";

-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "githubIssueId" INTEGER,
ADD COLUMN     "githubIssueState" TEXT,
ADD COLUMN     "githubIssueUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "githubDefaultBranch" TEXT,
ADD COLUMN     "githubRepoId" INTEGER,
ADD COLUMN     "githubRepoUrl" TEXT,
ADD COLUMN     "priority" INTEGER,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "githubCommentId" INTEGER,
ADD COLUMN     "githubPRId" INTEGER,
ADD COLUMN     "githubUrl" TEXT;
