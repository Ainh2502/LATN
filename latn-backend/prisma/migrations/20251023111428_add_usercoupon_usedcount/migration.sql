/*
  Warnings:

  - You are about to drop the column `obtainedAt` on the `UserCoupon` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,couponCode]` on the table `UserCoupon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserCoupon" DROP COLUMN "obtainedAt",
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "UserCoupon_userId_couponCode_key" ON "UserCoupon"("userId", "couponCode");
