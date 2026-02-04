/*
  Warnings:

  - A unique constraint covering the columns `[integration_id]` on the table `integration_token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "integration_token_integration_id_key" ON "integration_token"("integration_id");
