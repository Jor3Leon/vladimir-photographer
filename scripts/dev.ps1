$ErrorActionPreference = "Stop"

function Test-PortOpen {
    param([int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect("127.0.0.1", $Port, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(500)
        if ($ok -and $tcp.Connected) {
            $tcp.EndConnect($iar)
            $tcp.Close()
            return $true
        }
        $tcp.Close()
        return $false
    } catch {
        return $false
    }
}

function Stop-ProjectNodeProcesses {
    param([string]$Reason = "cleanup")

    try {
        $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
        $processes = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
            Where-Object { $_.CommandLine -and $_.CommandLine -like "*$projectRoot*" }

        if ($processes) {
            $ids = $processes.ProcessId -join ", "
            Write-Host "Stopping project node processes ($Reason): $ids"
            $processes | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
            Start-Sleep -Seconds 1
        } else {
            Write-Host "No project node processes to stop ($Reason)."
        }
    } catch {
        Write-Host "Failed to stop project node processes ($Reason): $($_.Exception.Message)"
    }
}

$baseUrl = "http://127.0.0.1"
$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

if (-not (Test-Path (Join-Path $backendDir "package.json"))) {
    throw "Missing backend/package.json"
}
if (-not (Test-Path (Join-Path $frontendDir "package.json"))) {
    throw "Missing frontend/package.json"
}

# Clean up previous project node processes to avoid port conflicts.
Stop-ProjectNodeProcesses -Reason "preflight"

function Start-Backend {
    Write-Host "Starting backend..."
    Start-Process -FilePath node -ArgumentList "index.js" -WorkingDirectory $backendDir | Out-Null
}

function Start-Frontend {
    Write-Host "Starting frontend..."
    Start-Process -FilePath npm.cmd -ArgumentList "run","dev" -WorkingDirectory $frontendDir | Out-Null
}

if (-not (Test-PortOpen -Port 5000)) {
    Start-Backend
    Write-Host "Backend starting on ${baseUrl}:5000 ..."
} else {
    Write-Host "Backend already running on port 5000."
}

if (-not (Test-PortOpen -Port 5173)) {
    Start-Frontend
    Write-Host "Frontend starting on ${baseUrl}:5173 ..."
} else {
    Write-Host "Frontend already running on port 5173."
}

for ($i = 0; $i -lt 10; $i++) {
    if ((Test-PortOpen -Port 5000) -and (Test-PortOpen -Port 5173)) {
        break
    }
    Start-Sleep -Seconds 1
}

try {
    $api = Invoke-WebRequest -Uri "${baseUrl}:5000/api/content" -UseBasicParsing -TimeoutSec 4
    if ($api.StatusCode -ne 200) {
        Write-Host "Backend health check failed: HTTP $($api.StatusCode)"
        Stop-ProjectNodeProcesses -Reason "backend restart"
        Start-Backend
        Start-Sleep -Seconds 2
    } else {
        Write-Host "Backend OK."
    }
} catch {
    Write-Host "Backend health check failed: $($_.Exception.Message)"
    Stop-ProjectNodeProcesses -Reason "backend restart"
    Start-Backend
    Start-Sleep -Seconds 2
}

Start-Process "${baseUrl}:5173" | Out-Null
Write-Host "Opened ${baseUrl}:5173"
