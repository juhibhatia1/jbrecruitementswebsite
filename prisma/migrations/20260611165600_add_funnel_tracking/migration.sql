-- CreateTable
CREATE TABLE "FunnelEvent" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FunnelEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FunnelEvent_serviceName_idx" ON "FunnelEvent"("serviceName");

-- CreateIndex
CREATE INDEX "FunnelEvent_eventType_idx" ON "FunnelEvent"("eventType");

-- CreateIndex
CREATE INDEX "FunnelEvent_createdAt_idx" ON "FunnelEvent"("createdAt");
