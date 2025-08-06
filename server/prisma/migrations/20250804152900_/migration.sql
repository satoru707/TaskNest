/*
  Warnings:

  - You are about to drop the column `bookMarkedAt` on the `lists` table. All the data in the column will be lost.
  - You are about to drop the column `isBookMarked` on the `lists` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'BOARD_UNARCHIVED';
ALTER TYPE "ActivityType" ADD VALUE 'BOARD_UNBOOKMARKED';
ALTER TYPE "ActivityType" ADD VALUE 'LIST_UNARCHIVED';
ALTER TYPE "ActivityType" ADD VALUE 'LIST_UNBOOKMARKED';
ALTER TYPE "ActivityType" ADD VALUE 'TASK_UNARCHIVED';
ALTER TYPE "ActivityType" ADD VALUE 'TASK_UNBOOKMARKED';

-- AlterTable
ALTER TABLE "lists" DROP COLUMN "bookMarkedAt",
DROP COLUMN "isBookMarked";
