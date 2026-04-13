$ErrorActionPreference = "Stop"
Start-Process "http://localhost:5173/admin" | Out-Null
Write-Host "Opened: http://localhost:5173/admin"
