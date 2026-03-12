-- CreateEnum
CREATE TYPE "TechnologyType" AS ENUM ('LANGUAGE', 'FRAMEWORK', 'LIBRARY');

-- CreateTable
CREATE TABLE "Technology" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TechnologyType" NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FeatureToTechnology" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FeatureToTechnology_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Technology_name_key" ON "Technology"("name");

-- CreateIndex
CREATE INDEX "_FeatureToTechnology_B_index" ON "_FeatureToTechnology"("B");

-- AddForeignKey
ALTER TABLE "_FeatureToTechnology" ADD CONSTRAINT "_FeatureToTechnology_A_fkey" FOREIGN KEY ("A") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToTechnology" ADD CONSTRAINT "_FeatureToTechnology_B_fkey" FOREIGN KEY ("B") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;
