# MovePay Build Predictor Script
# This script emulates the EAS build environment locally to catch errors in minutes instead of hours.

Write-Host "--- MovePay Pre-flight Build Check ---" -ForegroundColor Cyan

$mobilePath = "c:\Users\delci\Desktop\MovePay\mobile"
Set-Location $mobilePath

# 1. Check Expo Status
Write-Host "[1/4] Running Expo Doctor..." -ForegroundColor Yellow
npx expo doctor
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Expo Doctor found issues. Please fix them before building." -ForegroundColor Red
    exit 1
}

# 2. Local Prebuild
Write-Host "[2/4] Running Local Prebuild..." -ForegroundColor Yellow
# This generates the android/ folder. If it fails here, the cloud build will definitely fail.
npx expo prebuild --platform android --no-install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Local Prebuild failed." -ForegroundColor Red
    exit 1
}

# 3. Graduate Check (Debug)
Write-Host "[3/4] Running local Gradle build (Debug)..." -ForegroundColor Yellow
Write-Host "This will catch dependency resolution errors like 'No matching variant'." -ForegroundColor Gray
cd android
.\gradlew assembleDebug --console=plain
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Gradle build failed locally! Catch was successful." -ForegroundColor Red
    cd ..
    exit 1
}

# 4. Success
cd ..
Write-Host "✅ Local checks passed! The cloud build is much more likely to succeed now." -ForegroundColor Green
Write-Host "Note: EAS Build takes long mostly due to the queue. Running this locally saves you time." -ForegroundColor Cyan
