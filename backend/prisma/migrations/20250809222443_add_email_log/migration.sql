-- CreateTable
CREATE TABLE "EmailLog" (
    "id" SERIAL NOT NULL,
    "recipient" TEXT NOT NULL,
    "emailType" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "relatedEntityId" INTEGER,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailLog_idempotencyKey_idx" ON "EmailLog"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_recipient_emailType_relatedEntityId_key" ON "EmailLog"("recipient", "emailType", "relatedEntityId");
