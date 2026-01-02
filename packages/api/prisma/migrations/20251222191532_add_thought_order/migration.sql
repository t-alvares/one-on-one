-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Thought" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL DEFAULT [],
    "userId" TEXT NOT NULL,
    "labelId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "aboutIcId" TEXT,
    CONSTRAINT "Thought_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Thought_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Thought" ("aboutIcId", "content", "createdAt", "id", "labelId", "title", "updatedAt", "userId") SELECT "aboutIcId", "content", "createdAt", "id", "labelId", "title", "updatedAt", "userId" FROM "Thought";
DROP TABLE "Thought";
ALTER TABLE "new_Thought" RENAME TO "Thought";
CREATE INDEX "Thought_userId_idx" ON "Thought"("userId");
CREATE INDEX "Thought_labelId_idx" ON "Thought"("labelId");
CREATE INDEX "Thought_aboutIcId_idx" ON "Thought"("aboutIcId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
