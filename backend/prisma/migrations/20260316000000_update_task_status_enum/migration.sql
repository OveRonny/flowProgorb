-- Replace TaskStatus enum values to match frontend workflow.
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

ALTER TABLE "Task"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Task"
ALTER COLUMN "status" TYPE "TaskStatus_new"
USING (
  CASE
    WHEN "status"::text = 'COMPLETED' THEN 'DONE'::"TaskStatus_new"
    ELSE "status"::text::"TaskStatus_new"
  END
);

DROP TYPE "TaskStatus";

ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";

ALTER TABLE "Task"
ALTER COLUMN "status" SET DEFAULT 'PENDING';