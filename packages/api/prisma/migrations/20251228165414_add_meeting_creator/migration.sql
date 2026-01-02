/*
  Warnings:

  - Added the required column `createdById` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meeting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relationshipId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meeting_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meeting_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meeting" ("createdAt", "id", "relationshipId", "scheduledAt", "status", "title", "updatedAt") SELECT "createdAt", "id", "relationshipId", "scheduledAt", "status", "title", "updatedAt" FROM "Meeting";
DROP TABLE "Meeting";
ALTER TABLE "new_Meeting" RENAME TO "Meeting";
CREATE INDEX "Meeting_relationshipId_idx" ON "Meeting"("relationshipId");
CREATE INDEX "Meeting_createdById_idx" ON "Meeting"("createdById");
CREATE INDEX "Meeting_scheduledAt_idx" ON "Meeting"("scheduledAt");
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
