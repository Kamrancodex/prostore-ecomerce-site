/*
  Warnings:

  - You are about to drop the column `delivererdAt` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "delivererdAt",
ADD COLUMN     "deliveredAt" TIMESTAMP(6);
