ALTER TABLE "Bookmark" ADD COLUMN "stage" TEXT NOT NULL DEFAULT '';
UPDATE "Bookmark" SET "stage" = 'SITUATION' WHERE "targetType" = 'LESSON';
DROP INDEX "Bookmark_userId_targetType_targetId_key";
CREATE UNIQUE INDEX "Bookmark_userId_targetType_targetId_stage_key"
ON "Bookmark"("userId", "targetType", "targetId", "stage");
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_stage_target_check" CHECK (
  ("targetType" = 'LESSON' AND "stage" IN ('SITUATION', 'WHY', 'CONCEPT', 'COMMAND', 'PRACTICE', 'RESULT'))
  OR ("targetType" <> 'LESSON' AND "stage" = '')
);
