# local-release.ps1
$ErrorActionPreference = "Stop"
$releaseTag = "quiz-backend:release-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

Write-Host "=== ЛОКАЛЬНЫЙ РЕЛИЗ ===" -ForegroundColor Green
Write-Host "Тег: $releaseTag"

Write-Host ""
Write-Host "[1/4] Сборка образа..." -ForegroundColor Yellow
docker build -t $releaseTag .

Write-Host ""
Write-Host "[2/4] Остановка текущего стека..." -ForegroundColor Yellow
docker compose down

Write-Host ""
Write-Host "[3/4] Запуск с новым образом..." -ForegroundColor Yellow
docker compose up -d

Write-Host ""
Write-Host "[4/4] Smoke-check..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    $response = curl.exe -s http://localhost:3000/health
    if ($response -like '*"status":"ok"*') {
        Write-Host "✓ Health check OK" -ForegroundColor Green
        $releaseTag | Out-File -FilePath .last-release-tag -Encoding utf8
        Write-Host ""
        Write-Host "✓ Релиз успешен!" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Health check FAILED!" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "✗ Health check FAILED!" -ForegroundColor Red
    exit 1
}