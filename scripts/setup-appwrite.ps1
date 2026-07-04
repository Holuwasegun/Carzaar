$ENDPOINT = "https://nyc.cloud.appwrite.io/v1"
$PROJECT = "6a485ce20010aa81820a"
$API_KEY = "standard_9e9a9dc5da2ff4216c1c786c61c62c522a3332767d0a9dd30ee6731d3a2783d1ba6455efcaf5a128a867e878d2358d29e80bec4137485e0dda55d10e87ed0f82cd4cb44fe5eb3c8a28ee0c75c4aa1c624f321f26b043b1195959f1c1ff484748721c186544814bdf3afa3901526635601d775afbf1210d4a78b5c3caba698b48"
$DATABASE = "carzaar"

$headers = @{
  "X-Appwrite-Project" = $PROJECT
  "X-Appwrite-Key" = $API_KEY
  "Content-Type" = "application/json"
}

function Invoke-Apw {
  param($Method, $Path, $BodyObj)
  $url = "$ENDPOINT$Path"
  $jsonBody = $null
  if ($BodyObj) { $jsonBody = ($BodyObj | ConvertTo-Json -Depth 10 -Compress) }
  try {
    $params = @{ Method = $Method; Uri = $url; Headers = $headers }
    if ($jsonBody) { $params["Body"] = $jsonBody }
    return Invoke-RestMethod @params
  } catch {
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    $reader.Close()
    Write-Host "  ERROR ($Method $Path): $body" -ForegroundColor Red
    return $null
  }
}

# ============================================================
# 1. Create collections
# ============================================================
Write-Host "=== Creating collections ===" -ForegroundColor Cyan

$collections = @(
  @{collectionId = "listings"; name = "listings"; permission = "document"},
  @{collectionId = "listing_images"; name = "listing_images"; permission = "document"},
  @{collectionId = "features"; name = "features"; permission = "document"},
  @{collectionId = "admin_profile"; name = "admin_profile"; permission = "document"}
)

foreach ($c in $collections) {
  Write-Host "  Creating $($c.collectionId)..." -ForegroundColor Yellow
  Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections" -BodyObj $c
}

Start-Sleep -Seconds 3

# ============================================================
# 2. Create attributes
# ============================================================
Write-Host "`n=== Creating attributes ===" -ForegroundColor Cyan

function New-Attr {
  param($Col, $Key, $Type, $Required, $Size, $Default, $Min, $Max, $Array, $Elements)
  $body = @{key = $Key; required = $Required}
  if ($Size) { $body["size"] = $Size }
  if ($Default -ne $null) { $body["default"] = $Default }
  if ($Min -ne $null) { $body["min"] = $Min }
  if ($Max -ne $null) { $body["max"] = $Max }
  if ($Array) { $body["array"] = $true }
  if ($Elements) { $body["elements"] = $Elements }

  Write-Host "  $Col.$Key ($Type)" -ForegroundColor Gray
  $result = Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/$Col/attributes/$Type" -BodyObj $body
  if ($result) { Start-Sleep -Milliseconds 500 }
}

# --- listings ---
$col = "listings"
New-Attr -Col $col -Key "make" -Type "string" -Required $true -Size 100
New-Attr -Col $col -Key "model" -Type "string" -Required $true -Size 100
New-Attr -Col $col -Key "year" -Type "integer" -Required $true -Min 1980 -Max 2027
New-Attr -Col $col -Key "price" -Type "integer" -Required $true -Min 1
New-Attr -Col $col -Key "condition" -Type "string" -Required $true -Size 50 -Elements @("Brand New","Nigerian Used","Foreign Used (Tokunbo)")
New-Attr -Col $col -Key "location" -Type "string" -Required $true -Size 200
New-Attr -Col $col -Key "description" -Type "string" -Required $true -Size 5000
New-Attr -Col $col -Key "mileage" -Type "integer" -Required $true -Min 0
New-Attr -Col $col -Key "bodyType" -Type "string" -Required $true -Size 30 -Elements @("sedan","suv","hatchback","coupe","pickup","van","wagon","convertible")
New-Attr -Col $col -Key "color" -Type "string" -Required $true -Size 50
New-Attr -Col $col -Key "transmission" -Type "string" -Required $true -Size 20 -Elements @("automatic","manual")
New-Attr -Col $col -Key "fuel" -Type "string" -Required $true -Size 20 -Elements @("petrol","diesel","hybrid","electric")
New-Attr -Col $col -Key "drivetrain" -Type "string" -Required $true -Size 10 -Elements @("fwd","rwd","awd","4wd")
New-Attr -Col $col -Key "engineCapacity" -Type "double" -Required $false
New-Attr -Col $col -Key "numberOfDoors" -Type "integer" -Required $false -Min 2 -Max 6
New-Attr -Col $col -Key "numberOfSeats" -Type "integer" -Required $false -Min 2 -Max 9
New-Attr -Col $col -Key "vin" -Type "string" -Required $false -Size 17
New-Attr -Col $col -Key "plateNumber" -Type "string" -Required $false -Size 20
New-Attr -Col $col -Key "numberOfPreviousOwners" -Type "integer" -Required $true -Default 0 -Min 0
New-Attr -Col $col -Key "accidentHistory" -Type "string" -Required $true -Default "unknown" -Size 20 -Elements @("none","minor","major","unknown")
New-Attr -Col $col -Key "serviceHistoryAvailable" -Type "boolean" -Required $true -Default $false
New-Attr -Col $col -Key "hasSpareKey" -Type "boolean" -Required $true -Default $true
New-Attr -Col $col -Key "documentationStatus" -Type "string" -Required $true -Default "registered_valid_papers" -Size 50 -Elements @("registered_valid_papers","registered_papers_pending","unregistered")
New-Attr -Col $col -Key "warrantyRemaining" -Type "boolean" -Required $true -Default $false
New-Attr -Col $col -Key "features" -Type "string" -Required $false -Array $true
New-Attr -Col $col -Key "status" -Type "string" -Required $true -Default "available" -Size 20 -Elements @("available","reserved","sold")
New-Attr -Col $col -Key "viewCount" -Type "integer" -Required $true -Default 0 -Min 0
New-Attr -Col $col -Key "whatsappClickCount" -Type "integer" -Required $true -Default 0 -Min 0
New-Attr -Col $col -Key "soldAt" -Type "datetime" -Required $false

# --- listing_images ---
$col = "listing_images"
New-Attr -Col $col -Key "listingId" -Type "string" -Required $true -Size 100
New-Attr -Col $col -Key "storageFileId" -Type "string" -Required $true -Size 100
New-Attr -Col $col -Key "sortOrder" -Type "integer" -Required $true -Default 0 -Min 0

# --- features ---
$col = "features"
New-Attr -Col $col -Key "label" -Type "string" -Required $true -Size 200

# --- admin_profile ---
$col = "admin_profile"
New-Attr -Col $col -Key "whatsappNumber" -Type "string" -Required $true -Default "2349158461502" -Size 50

# ============================================================
# 3. Wait for attributes
# ============================================================
Write-Host "`n=== Waiting for attribute processing ===" -ForegroundColor Cyan
Start-Sleep -Seconds 10

# ============================================================
# 4. Create indexes
# ============================================================
Write-Host "`n=== Creating indexes ===" -ForegroundColor Cyan

$idxListings1 = @{key = "status_idx"; type = "key"; attributes = @("status"); orders = @("ASC")}
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listings/indexes" -BodyObj $idxListings1
Start-Sleep -Milliseconds 300

$idxListings2 = @{key = "created_idx"; type = "key"; attributes = @("`$createdAt"); orders = @("DESC")}
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listings/indexes" -BodyObj $idxListings2
Start-Sleep -Milliseconds 300

$idxImages1 = @{key = "listingId_idx"; type = "key"; attributes = @("listingId"); orders = @("ASC")}
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listing_images/indexes" -BodyObj $idxImages1
Start-Sleep -Milliseconds 300

$idxImages2 = @{key = "sortOrder_idx"; type = "key"; attributes = @("sortOrder"); orders = @("ASC")}
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listing_images/indexes" -BodyObj $idxImages2

# ============================================================
# 5. Create storage bucket
# ============================================================
Write-Host "`n=== Creating storage bucket ===" -ForegroundColor Cyan

$bucket = @{
  bucketId = "car-images"
  name = "Car Images"
  permission = "document"
  maximumFileSize = 5000000
  allowedFileExtensions = @("jpg", "jpeg", "png", "webp")
  enabled = $true
}
Invoke-Apw -Method Post -Path "/storage/buckets" -BodyObj $bucket

# ============================================================
# 6. Seed features
# ============================================================
Write-Host "`n=== Seeding features ===" -ForegroundColor Cyan

$featureLabels = @(
  "Air Conditioning","Sunroof","Reverse Camera","Bluetooth",
  "Navigation System","Leather Seats","Cruise Control","Alloy Wheels",
  "Parking Sensors","Push Start","Keyless Entry","Climate Control",
  "Fog Lights","Third Row Seats","Tow Package","Moonroof",
  "Heated Seats","Apple CarPlay","Android Auto","360 Camera",
  "Blind Spot Monitor","Lane Departure Warning","Adaptive Cruise Control","Premium Audio"
)

$i = 0
foreach ($label in $featureLabels) {
  $i++
  $doc = @{
    documentId = "feat_$i"
    data = @{label = $label}
  }
  Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/features/documents" -BodyObj $doc
  Write-Host "  $label" -ForegroundColor Gray
  Start-Sleep -Milliseconds 200
}

# ============================================================
# 7. Create admin_profile document
# ============================================================
Write-Host "`n=== Creating admin_profile/main ===" -ForegroundColor Cyan

$adminDoc = @{
  documentId = "main"
  data = @{whatsappNumber = "2349158461502"}
}
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/admin_profile/documents" -BodyObj $adminDoc

Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "`nRemaining manual steps:" -ForegroundColor Yellow
Write-Host "1. Create an admin user in Approve Console > Auth > Users (email/password)" -ForegroundColor Yellow
Write-Host "2. Set collection permissions in Console > Databases > carzaar:" -ForegroundColor Yellow
Write-Host "   - listings: Read=any, Create/Update/Delete=User(<adminUserId>)" -ForegroundColor Yellow
Write-Host "   - listing_images: Read=any, Create/Update/Delete=User(<adminUserId>)" -ForegroundColor Yellow
Write-Host "   - features: Read=any, Create/Update/Delete=User(<adminUserId>)" -ForegroundColor Yellow
Write-Host "   - admin_profile: Read=any, Create/Update/Delete=User(<adminUserId>)" -ForegroundColor Yellow
Write-Host "3. Set bucket permissions in Console > Storage > car-images:" -ForegroundColor Yellow
Write-Host "   - Read=any, Create/Update/Delete=User(<adminUserId>)" -ForegroundColor Yellow
Write-Host "4. Deploy the increment-counter function" -ForegroundColor Yellow
Write-Host "5. Set counterFunctionUrl in js/appwrite-config.js" -ForegroundColor Yellow
