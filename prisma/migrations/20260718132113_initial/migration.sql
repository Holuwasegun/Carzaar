-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "legacyId" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mileage" INTEGER NOT NULL,
    "bodyType" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "drivetrain" TEXT NOT NULL,
    "engineCapacity" DOUBLE PRECISION,
    "numberOfDoors" INTEGER,
    "numberOfSeats" INTEGER,
    "vin" TEXT,
    "plateNumber" TEXT,
    "numberOfPreviousOwners" INTEGER NOT NULL DEFAULT 0,
    "accidentHistory" TEXT NOT NULL,
    "serviceHistoryAvailable" BOOLEAN NOT NULL,
    "hasSpareKey" BOOLEAN NOT NULL DEFAULT true,
    "documentationStatus" TEXT NOT NULL,
    "warrantyRemaining" BOOLEAN NOT NULL,
    "features" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'available',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "whatsappClickCount" INTEGER NOT NULL DEFAULT 0,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "r2Key" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "whatsappNumber" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_legacyId_key" ON "Listing"("legacyId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingImage_listingId_r2Key_key" ON "ListingImage"("listingId", "r2Key");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
