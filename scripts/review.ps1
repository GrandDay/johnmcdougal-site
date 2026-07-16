param(
    [ValidateSet('refresh', 'status', 'stop')]
    [string]$Command = 'refresh',
    [string]$HostName = '127.0.0.1',
    [int]$Port = 4326,
    [string]$StatePath
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$StateDirectory = Join-Path $RepoRoot '.tmp'
if (-not $StatePath) {
    $StatePath = Join-Path $StateDirectory 'review-server.json'
}
$LogPath = Join-Path $StateDirectory 'review-server.log'
$ErrorLogPath = Join-Path $StateDirectory 'review-server.err.log'
$Url = "http://$HostName`:$Port/"

function Ensure-StateDirectory {
    if (-not (Test-Path -LiteralPath $StateDirectory)) {
        New-Item -ItemType Directory -Path $StateDirectory | Out-Null
    }
}

function Get-State {
    if (-not (Test-Path -LiteralPath $StatePath)) {
        return $null
    }

    return Get-Content -Raw -LiteralPath $StatePath | ConvertFrom-Json
}

function Save-State($State) {
    Ensure-StateDirectory
    $State | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $StatePath -Encoding UTF8
}

function Get-ProcessInfo([int]$ProcessId) {
    Get-CimInstance Win32_Process -Filter "ProcessId = $ProcessId" -ErrorAction SilentlyContinue
}

function Test-OwnedProcess($State) {
    if (-not $State -or -not $State.pid) {
        return @{ ok = $false; reason = 'no recorded PID'; process = $null }
    }

    $process = Get-ProcessInfo -ProcessId ([int]$State.pid)
    if (-not $process) {
        return @{ ok = $false; reason = 'recorded PID is not running'; process = $null }
    }

    $commandLine = [string]$process.CommandLine
    $expectedRepo = [string]$State.repoRoot
    $expectedHost = [string]$State.host
    $expectedPort = [string]$State.port

    if ($expectedRepo -ne $RepoRoot) {
        return @{ ok = $false; reason = 'state repository root does not match current repository'; process = $process }
    }
    if ($expectedHost -ne $HostName -or $expectedPort -ne [string]$Port) {
        return @{ ok = $false; reason = 'state host or port does not match requested target'; process = $process }
    }
    if ($commandLine -notmatch 'astro\.mjs' -or $commandLine -notmatch '\bpreview\b' -or $commandLine -notmatch "--host\s+$([regex]::Escape($HostName))" -or $commandLine -notmatch "--port\s+$Port") {
        return @{ ok = $false; reason = 'recorded PID does not look like this script-owned Astro preview'; process = $process }
    }

    return @{ ok = $true; reason = 'owned'; process = $process }
}

function Test-Url {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
        return [int]$response.StatusCode
    } catch {
        return $null
    }
}

function Get-PortOwners {
    try {
        @(Get-NetTCPConnection -LocalAddress $HostName -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
    } catch {
        @()
    }
}

function Stop-Owned($State, [switch]$AllowStale) {
    if (-not $State) {
        return 'no state file'
    }

    $owned = Test-OwnedProcess -State $State
    if (-not $owned.ok) {
        if ($owned.reason -eq 'recorded PID is not running' -and $AllowStale) {
            $State.status = 'stale'
            $State | Add-Member -NotePropertyName staleAt -NotePropertyValue ((Get-Date).ToString('o')) -Force
            Save-State $State
            return 'stale state marked'
        }

        throw "Refusing to stop process: $($owned.reason)."
    }

    Stop-Process -Id ([int]$State.pid) -Force
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Milliseconds 250
        if (-not (Get-ProcessInfo -ProcessId ([int]$State.pid))) {
            $State.status = 'stopped'
            $State | Add-Member -NotePropertyName stoppedAt -NotePropertyValue ((Get-Date).ToString('o')) -Force
            Save-State $State
            return 'stopped'
        }
    }

    throw "Process $($State.pid) did not stop within the timeout."
}

function Invoke-Step([string]$Label, [string]$FilePath, [string[]]$Arguments) {
    Write-Output "== $Label =="
    Push-Location $RepoRoot
    try {
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "$Label failed with exit code $LASTEXITCODE."
        }
    } finally {
        Pop-Location
    }
}

function Get-Version([string]$Expression) {
    try {
        (& node -p $Expression 2>$null).Trim()
    } catch {
        'unavailable'
    }
}

function Get-StatusObject {
    $state = Get-State
    $owned = Test-OwnedProcess -State $state
    $gitStatus = (& git -C $RepoRoot status --short)
    $buildFreshness = if (Test-Path -LiteralPath (Join-Path $RepoRoot 'dist')) { 'present' } else { 'missing' }

    [ordered]@{
        repoRoot = $RepoRoot
        branch = (& git -C $RepoRoot rev-parse --abbrev-ref HEAD).Trim()
        head = (& git -C $RepoRoot rev-parse --short HEAD).Trim()
        worktree = if ($gitStatus) { 'dirty' } else { 'clean' }
        node = (& node -v).Trim()
        npm = (& npm -v).Trim()
        astro = Get-Version "require('./node_modules/astro/package.json').version"
        astroCheck = if (Test-Path -LiteralPath (Join-Path $RepoRoot 'node_modules\.bin\astro-check.cmd')) { 'available' } else { 'missing' }
        build = $buildFreshness
        url = $Url
        reachableStatus = Test-Url
        ownedServer = [ordered]@{
            statePath = $StatePath
            logPath = $LogPath
            errorLogPath = $ErrorLogPath
            pid = if ($state) { $state.pid } else { $null }
            status = if ($owned.ok) { 'running' } elseif ($state) { $owned.reason } else { 'no state' }
            command = if ($state) { $state.command } else { $null }
        }
    }
}

function Start-ReviewServer {
    Ensure-StateDirectory
    $astroBin = Join-Path $RepoRoot 'node_modules\astro\bin\astro.mjs'
    if (-not (Test-Path -LiteralPath $astroBin)) {
        throw "Missing Astro binary at $astroBin. Run npm ci first."
    }

    $nodePath = (Get-Command node).Source
    $arguments = @($astroBin, 'preview', '--host', $HostName, '--port', [string]$Port)
    $process = Start-Process -FilePath $nodePath -ArgumentList $arguments -WorkingDirectory $RepoRoot -RedirectStandardOutput $LogPath -RedirectStandardError $ErrorLogPath -WindowStyle Hidden -PassThru

    $state = [ordered]@{
        status = 'running'
        pid = $process.Id
        repoRoot = $RepoRoot
        host = $HostName
        port = $Port
        url = $Url
        command = "node $astroBin preview --host $HostName --port $Port"
        statePath = $StatePath
        logPath = $LogPath
        errorLogPath = $ErrorLogPath
        startedAt = (Get-Date).ToString('o')
    }
    Save-State $state

    for ($i = 0; $i -lt 30; $i++) {
        $statusCode = Test-Url
        if ($statusCode -ge 200 -and $statusCode -lt 500) {
            return Get-StatusObject
        }
        Start-Sleep -Milliseconds 500
    }

    throw "Preview server did not become reachable at $Url."
}

if ($Command -eq 'status') {
    Write-Output (Get-StatusObject | ConvertTo-Json -Depth 8)
    exit 0
}

if ($Command -eq 'stop') {
    $result = Stop-Owned -State (Get-State)
    $status = Get-StatusObject
    $status['stopResult'] = $result
    Write-Output ($status | ConvertTo-Json -Depth 8)
    exit 0
}

$state = Get-State
if ($state) {
    Stop-Owned -State $state -AllowStale | Out-Null
}

$owners = Get-PortOwners
if (@($owners).Count -gt 0) {
    throw "Port $Port on $HostName is already listening and is not owned by this review state. Refusing to kill or reuse it."
}

Invoke-Step -Label 'Canonical validation' -FilePath 'npm.cmd' -Arguments @('run', 'validate')
$status = Start-ReviewServer
Write-Output ($status | ConvertTo-Json -Depth 8)
