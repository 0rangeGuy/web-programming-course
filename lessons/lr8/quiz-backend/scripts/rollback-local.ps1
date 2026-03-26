# rollback-local.ps1
$ErrorActionPreference = "Stop"

if (Test-Path .last-release-tag) {
    $prevTag = Get-Content .last-release-tag
    Write-Host "Откат на $prevTag" -ForegroundColor Yellow
    
    Write-Host "Остановка текущего стека..." -ForegroundColor Yellow
    docker compose down
    
    Write-Host "Запуск с предыдущим образом..." -ForegroundColor Yellow
    docker run -d --name quiz-backend --rm -p 3000:3000 --env-file .env $prevTag
    
    Start-Sleep -Seconds 5
    
    $response = curl.exe -s http://localhost:3000/health
    if ($response -like '*"status":"ok"*') {
        Write-Host "✓ Откат успешен" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Откат не удался" -ForegroundColor Red
    }
}
else {
    Write-Host "Нет сохранённого тега для отката" -ForegroundColor Red
}