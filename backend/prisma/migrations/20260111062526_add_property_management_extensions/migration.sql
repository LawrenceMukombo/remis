-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "description" TEXT,
ADD COLUMN     "floor_count" INTEGER,
ADD COLUMN     "landArea" DOUBLE PRECISION,
ADD COLUMN     "parking_spaces" INTEGER,
ADD COLUMN     "yearBuilt" INTEGER;

-- CreateTable
CREATE TABLE "property_valuations" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "valuation_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "valuation_type" TEXT NOT NULL,
    "valued_by" TEXT,
    "notes" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_tags" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "color" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_features" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "description" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "property_valuations_property_id_idx" ON "property_valuations"("property_id");

-- CreateIndex
CREATE INDEX "property_valuations_tenant_id_idx" ON "property_valuations"("tenant_id");

-- CreateIndex
CREATE INDEX "property_tags_property_id_idx" ON "property_tags"("property_id");

-- CreateIndex
CREATE INDEX "property_tags_tenant_id_idx" ON "property_tags"("tenant_id");

-- CreateIndex
CREATE INDEX "property_features_property_id_idx" ON "property_features"("property_id");

-- CreateIndex
CREATE INDEX "property_features_tenant_id_idx" ON "property_features"("tenant_id");

-- AddForeignKey
ALTER TABLE "property_valuations" ADD CONSTRAINT "property_valuations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_valuations" ADD CONSTRAINT "property_valuations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_tags" ADD CONSTRAINT "property_tags_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_tags" ADD CONSTRAINT "property_tags_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_features" ADD CONSTRAINT "property_features_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_features" ADD CONSTRAINT "property_features_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
