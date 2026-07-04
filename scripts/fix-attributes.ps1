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
    Write-Host "  ERROR: $body" -ForegroundColor Red
    return $null
  }
}

function Wait-Attr {
  param($Col, $Key)
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    $col = Invoke-Apw -Method Get -Path "/databases/$DATABASE/collections/$Col"
    $attr = $col.attributes | Where-Object { $_.key -eq $Key }
    if ($attr -and $attr.status -eq "available") { return $true }
    if ($attr -and $attr.status -eq "failed") { return $false }
  }
  return $false
}

function New-Attr {
  param($Col, $Key, $Type, $Required, $Size, $Default, $Min, $Max, $Array, $Elements)
  $body = @{key = $Key; required = $Required}
  if ($Size) { $body["size"] = $Size }
  if ($Default -ne $null) { $body["default"] = $Default }
  if ($Min -ne $null) { $body["min"] = $Min }
  if ($Max -ne $null) { $body["max"] = $Max }
  if ($Array) { $body["array"] = $true }
  if ($Elements) { $body["elements"] = $Elements }

  Write-Host "  Creating $Col.$Key ($Type)..." -ForegroundColor Gray
  $result = Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/$Col/attributes/$Type" -BodyObj $body
  if ($result) {
    Write-Host "    Waiting for processing..." -ForegroundColor Gray
    $ok = Wait-Attr -Col $Col -Key $Key
    if ($ok) { Write-Host "    Done" -ForegroundColor Green }
    else { Write-Host "    Failed or timed out" -ForegroundColor Red }
  }
}

Write-Host "=== Creating missing attributes for 'listings' ===" -ForegroundColor Cyan

# engineCapacity uses 'float' type (not 'double')
New-Attr -Col "listings" -Key "engineCapacity" -Type "float" -Required $false

New-Attr -Col "listings" -Key "numberOfPreviousOwners" -Type "integer" -Required $true -Default 0 -Min 0

New-Attr -Col "listings" -Key "accidentHistory" -Type "string" -Required $true -Default "unknown" -Size 20 -Elements @("none","minor","major","unknown")

New-Attr -Col "listings" -Key "serviceHistoryAvailable" -Type "boolean" -Required $true -Default $false

New-Attr -Col "listings" -Key "hasSpareKey" -Type "boolean" -Required $true -Default $true

New-Attr -Col "listings" -Key "documentationStatus" -Type "string" -Required $true -Default "registered_valid_papers" -Size 50 -Elements @("registered_valid_papers","registered_papers_pending","unregistered")

New-Attr -Col "listings" -Key "warrantyRemaining" -Type "boolean" -Required $true -Default $false

New-Attr -Col "listings" -Key "features" -Type "string" -Required $false -Array $true

New-Attr -Col "listings" -Key "status" -Type "string" -Required $true -Default "available" -Size 20 -Elements @("available","reserved","sold")

New-Attr -Col "listings" -Key "viewCount" -Type "integer" -Required $true -Default 0 -Min 0

New-Attr -Col "listings" -Key "whatsappClickCount" -Type "integer" -Required $true -Default 0 -Min 0

# Also need to wait and then create the indexes again
Write-Host "`n=== Creating indexes ===" -ForegroundColor Cyan

Start-Sleep -Seconds 5

Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listings/indexes" -BodyObj @{key = "status_idx"; type = "key"; attributes = @("status"); orders = @("ASC")}

# Create the $createdAt index
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listings/indexes" -BodyObj @{key = "created_idx"; type = "key"; attributes = @("`$createdAt"); orders = @("DESC")}

# Create listing_images indexes
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listing_images/indexes" -BodyObj @{key = "listingId_idx"; type = "key"; attributes = @("listingId"); orders = @("ASC")}

Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/listing_images/indexes" -BodyObj @{key = "sortOrder_idx"; type = "key"; attributes = @("sortOrder"); orders = @("ASC")}

# Create admin_profile document
Write-Host "`n=== Creating admin_profile/main ===" -ForegroundColor Cyan

$adminDoc = @{
  documentId = "main"
  data = @{whatsappNumber = "2349158461502"}
}
Invoke-Apw -Method Post -Path "/databases/$DATABASE/collections/admin_profile/documents" -BodyObj $adminDoc

Write-Host "`n=== Done ===" -ForegroundColor Green
