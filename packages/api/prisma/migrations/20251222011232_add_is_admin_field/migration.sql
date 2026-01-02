-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'IC',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "position" TEXT,
    "yearsOfService" REAL,
    "timeInPosition" REAL,
    "importedAt" DATETIME,
    "importedById" TEXT
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "email", "id", "importedAt", "importedById", "isActive", "name", "password", "position", "role", "timeInPosition", "updatedAt", "yearsOfService") SELECT "avatarUrl", "createdAt", "email", "id", "importedAt", "importedById", "isActive", "name", "password", "position", "role", "timeInPosition", "updatedAt", "yearsOfService" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "User_role_idx" ON "User"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
