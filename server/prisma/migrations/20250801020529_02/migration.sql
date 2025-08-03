-- AlterTable
ALTER TABLE "boards" ALTER COLUMN "archivedAt" DROP NOT NULL,
ALTER COLUMN "bookMarkedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lists" ALTER COLUMN "archivedAt" DROP NOT NULL,
ALTER COLUMN "bookMarkedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "archivedAt" DROP NOT NULL,
ALTER COLUMN "bookMarkedAt" DROP NOT NULL;
