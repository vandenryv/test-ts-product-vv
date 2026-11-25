/*
  Warnings:

  - You are about to drop the column `created` on the `authors` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `authors` table. All the data in the column will be lost.
  - You are about to drop the column `created` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `created` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "authors" DROP COLUMN "created",
DROP COLUMN "origin";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "created",
DROP COLUMN "origin";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "created",
DROP COLUMN "origin";
