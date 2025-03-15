/*
  Warnings:

  - You are about to drop the column `isDeliverd` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isDeliverd",
ADD COLUMN     "isDelivered" BOOLEAN NOT NULL DEFAULT false;
