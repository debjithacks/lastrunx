-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Ad_isHidden_idx" ON "Ad"("isHidden");
