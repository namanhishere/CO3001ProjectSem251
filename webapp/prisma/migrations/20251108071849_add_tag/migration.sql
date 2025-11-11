-- CreateTable
CREATE TABLE "SessionTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#a9a9a9',

    CONSTRAINT "SessionTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SessionTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SessionTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionTag_name_key" ON "SessionTag"("name");

-- CreateIndex
CREATE INDEX "_SessionTags_B_index" ON "_SessionTags"("B");

-- AddForeignKey
ALTER TABLE "_SessionTags" ADD CONSTRAINT "_SessionTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SessionTags" ADD CONSTRAINT "_SessionTags_B_fkey" FOREIGN KEY ("B") REFERENCES "SessionTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
