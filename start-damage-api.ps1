# Start Damage Assessment API
Write-Host "Starting Damage Assessment API..." -ForegroundColor Green
Write-Host "API will be available at http://localhost:5001" -ForegroundColor Cyan
Write-Host ""

Set-Location "E:\Programming Files\C programs and Files\survive.exe\backend"
python damage_assessment_api.py
