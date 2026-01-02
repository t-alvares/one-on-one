-- AlterTable
ALTER TABLE "User" ADD COLUMN "positionType" TEXT;
ALTER TABLE "User" ADD COLUMN "teamDisplayOrder" INTEGER;

-- CreateTable
CREATE TABLE "PositionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "leaderId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PositionType_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PositionType_leaderId_idx" ON "PositionType"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "PositionType_leaderId_code_key" ON "PositionType"("leaderId", "code");

-- CreateIndex
CREATE INDEX "User_positionType_idx" ON "User"("positionType");
