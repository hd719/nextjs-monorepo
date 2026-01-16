-- CreateTable
CREATE TABLE "barcode_scans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "food_item_id" TEXT,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barcode_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barcode_scans_user_id_idx" ON "barcode_scans"("user_id");

-- CreateIndex
CREATE INDEX "barcode_scans_barcode_idx" ON "barcode_scans"("barcode");

-- CreateIndex
CREATE INDEX "barcode_scans_user_id_scanned_at_idx" ON "barcode_scans"("user_id", "scanned_at");

-- AddForeignKey
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcode_scans" ADD CONSTRAINT "barcode_scans_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
