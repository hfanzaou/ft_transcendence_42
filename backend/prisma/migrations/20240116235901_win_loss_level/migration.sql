-- AlterTable
ALTER TABLE "User" ADD COLUMN     "level" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
ADD COLUMN     "loss" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "win" INTEGER NOT NULL DEFAULT 0;
