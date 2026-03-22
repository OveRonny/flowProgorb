-- CreateTable
CREATE TABLE "ProjectEmail" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT,
    "recipients" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectEmail_projectId_idx" ON "ProjectEmail"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectEmail" ADD CONSTRAINT "ProjectEmail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
