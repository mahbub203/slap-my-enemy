Write-Host "=== Starting SLAP MY ENEMY Backend (Django REST) ===" -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\backend"
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
