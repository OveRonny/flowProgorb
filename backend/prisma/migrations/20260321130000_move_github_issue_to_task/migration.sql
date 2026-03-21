ALTER TABLE "Task"
ADD COLUMN     "githubIssueId" INTEGER,
ADD COLUMN     "githubIssueUrl" TEXT,
ADD COLUMN     "githubIssueState" TEXT,
ADD COLUMN     "githubIssueSyncedAt" TIMESTAMP(3);

WITH first_task_per_feature AS (
  SELECT DISTINCT ON (t."featureId")
    t.id,
    t."featureId"
  FROM "Task" t
  ORDER BY t."featureId", t."orderIndex" NULLS LAST, t.id
)
UPDATE "Task" t
SET
  "githubIssueId" = f."githubIssueId",
  "githubIssueUrl" = f."githubIssueUrl",
  "githubIssueState" = f."githubIssueState",
  "githubIssueSyncedAt" = f."githubSyncedAt"
FROM first_task_per_feature ft
JOIN "Feature" f ON f.id = ft."featureId"
WHERE t.id = ft.id
  AND f."githubIssueId" IS NOT NULL;

ALTER TABLE "Feature"
DROP COLUMN "githubIssueId",
DROP COLUMN "githubIssueUrl",
DROP COLUMN "githubIssueState";