-- CreateEnum
CREATE TYPE "ReleaseChannel" AS ENUM ('DEVELOPMENT', 'RELEASE');

-- CreateEnum
CREATE TYPE "ReleaseStatus" AS ENUM ('PLANNED', 'APPROVED', 'RELEASED');

-- CreateTable
CREATE TABLE "ReleaseVersion" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "versionTag" TEXT NOT NULL,
    "name" TEXT,
    "channel" "ReleaseChannel" NOT NULL DEFAULT 'DEVELOPMENT',
    "status" "ReleaseStatus" NOT NULL DEFAULT 'PLANNED',
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReleaseVersion_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Requirement" ADD COLUMN "targetVersionId" INTEGER;

-- CreateIndex
CREATE INDEX "ReleaseVersion_projectId_idx" ON "ReleaseVersion"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseVersion_projectId_versionTag_key" ON "ReleaseVersion"("projectId", "versionTag");

-- CreateIndex
CREATE INDEX "Requirement_targetVersionId_idx" ON "Requirement"("targetVersionId");

-- AddForeignKey
ALTER TABLE "ReleaseVersion" ADD CONSTRAINT "ReleaseVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_targetVersionId_fkey" FOREIGN KEY ("targetVersionId") REFERENCES "ReleaseVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
