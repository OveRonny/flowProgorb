/*
  Warnings:

  - You are about to drop the column `orderIndex` on the `Module` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Module` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,moduleId,name]` on the table `Feature` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Module` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[featureId,title]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `Feature` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_projectId_fkey";

-- DropIndex
DROP INDEX "Module_projectId_orderIndex_key";

-- AlterTable
ALTER TABLE "Feature" ADD COLUMN     "orderIndex" INTEGER,
ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "orderIndex",
DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "orderIndex" INTEGER;

-- CreateTable
CREATE TABLE "ProjectModule" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "orderIndex" INTEGER,

    CONSTRAINT "ProjectModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectModule_projectId_moduleId_key" ON "ProjectModule"("projectId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_projectId_moduleId_name_key" ON "Feature"("projectId", "moduleId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Module_name_key" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Task_featureId_title_key" ON "Task"("featureId", "title");

-- AddForeignKey
ALTER TABLE "ProjectModule" ADD CONSTRAINT "ProjectModule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectModule" ADD CONSTRAINT "ProjectModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feature" ADD CONSTRAINT "Feature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
