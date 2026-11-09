Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "       🥊 SLAP MY ENEMY - Virtual Stress Relief          " -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Magenta

$rootDir = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; Write-Host 'Starting Django Backend on http://127.0.0.1:8000...' -ForegroundColor Cyan; python manage.py migrate; python manage.py runserver 127.0.0.1:8000"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; Write-Host 'Starting Vite Frontend on http://localhost:5173...' -ForegroundColor Green; npm run dev"

Write-Host "Backend and Frontend launched successfully!" -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor Cyan
