---
title: "Fixing Codex Desktop 401 Unauthorized Errors Caused by Stale Authentication State"
description: "A step-by-step troubleshooting and recovery guide for Codex Desktop 401 Unauthorized errors, stale API credentials, broken auth state, and CLI/Desktop mismatches on Windows and macOS."
pubDate: 2026-09-25
tags: ["codex", "openai", "troubleshooting", "authentication", "windows", "macos", "developer-tools"]
# updatedDate: YYYY-MM-DD
# heroImage: ""
---

> **TL;DR:** If Codex Desktop is stuck reconnecting with a `401 Unauthorized` or `Incorrect API key provided` error, the safest fix is to inspect environment and config state, back up `~/.codex/auth.json`, fully terminate Codex, then reauthenticate with ChatGPT and verify the regenerated auth state.

Codex Desktop authentication failures can be deceptively messy because the app, bundled CLI, shell environment, WSL, and local `.codex` state can all participate in credential selection. This guide walks through a surgical troubleshooting process that preserves your sessions and configuration while isolating the actual source of the failure.

# Codex Desktop Authentication Troubleshooting and Reset Guide

## Purpose

Use this guide when Codex Desktop repeatedly fails to connect or returns authentication errors such as:

```text
401 Unauthorized
Incorrect API key provided: sk-...
```

or when Codex repeatedly shows:

```text
Reconnecting...
```

despite apparently being signed in to ChatGPT.

This procedure is designed to distinguish among:

- stale Codex authentication state;
- API-key credentials overriding ChatGPT authentication;
- environment-variable contamination;
- custom provider configuration;
- multiple Codex CLI installations or version mismatches;
- WSL or shell environments supplying different credentials;
- corrupted or stale local Codex state;
- a Codex Desktop-specific authentication failure.

The procedure deliberately avoids deleting the entire `.codex` directory.

---

# Important Security Rule

Do **not** paste or publish:

- `OPENAI_API_KEY` values;
- `CODEX_ACCESS_TOKEN` values;
- access tokens;
- refresh tokens;
- complete `auth.json` contents;
- lines containing strings beginning with `sk-`;
- credentials extracted from SQLite databases or logs.

When searching for a suspicious credential, search using only a short prefix such as:

```text
sk-svcac
```

and display only:

- filename/path;
- line number;
- whether a value exists.

Do not print the matching line itself.

---

# Quick Recovery Procedure

If you want the shortest reasonable recovery path before doing deeper diagnostics:

1. Fully close Codex Desktop.
2. Verify no Codex processes remain.
3. Back up `~/.codex/auth.json`.
4. Start Codex Desktop.
5. Choose **Sign in with ChatGPT**.
6. Confirm the newly generated `auth.json` reports ChatGPT authentication.
7. Test Codex again.

This was sufficient to restore operation in the case from which this guide was derived.

---

# Part 1 — Fully Stop Codex

Closing the window may not necessarily terminate every related process.

## Windows — PowerShell

Check for running Codex processes:

```powershell
Get-Process |
    Where-Object {
        $_.ProcessName -match 'codex'
    } |
    Select-Object Id, ProcessName, Path
```

If anything remains:

```powershell
Get-Process |
    Where-Object {
        $_.ProcessName -match 'codex'
    } |
    Stop-Process -Force
```

Verify:

```powershell
Get-Process |
    Where-Object {
        $_.ProcessName -match 'codex'
    }
```

Expected result:

```text
<no output>
```

---

## macOS — Terminal

Check for processes:

```bash
pgrep -afil codex
```

If Codex processes remain:

```bash
pkill -if codex
```

Verify:

```bash
pgrep -afil codex
```

Expected result:

```text
<no output>
```

If other unrelated programs on your machine happen to contain `codex` in their process names, inspect the results before using `pkill`.

---

# Part 2 — Inspect the Effective Environment

The first question is whether Codex is receiving authentication information from the environment.

Important variables include:

```text
OPENAI_API_KEY
OPENAI_BASE_URL
CODEX_ACCESS_TOKEN
CODEX_HOME
CODEX_CLI_PATH
HTTP_PROXY
HTTPS_PROXY
ALL_PROXY
NO_PROXY
```

A normal ChatGPT-account login should not require you to manually configure `OPENAI_API_KEY`.

---

# Windows Environment Diagnostics

## Current Process Environment

Run in PowerShell:

```powershell
Write-Host "`n=== Codex/OpenAI environment ==="

Get-ChildItem Env: |
    Where-Object {
        $_.Name -match 'OPENAI|CODEX|AZURE|PROXY'
    } |
    Sort-Object Name |
    Select-Object Name, Value
```

No output is acceptable if none of these variables are currently defined.

---

## Persistent User Environment

```powershell
Write-Host "`n=== Persistent USER variables ==="

'OPENAI_API_KEY',
'OPENAI_BASE_URL',
'CODEX_ACCESS_TOKEN',
'CODEX_HOME',
'CODEX_CLI_PATH',
'HTTP_PROXY',
'HTTPS_PROXY',
'ALL_PROXY',
'NO_PROXY' |
ForEach-Object {
    [PSCustomObject]@{
        Name  = $_
        Value = [Environment]::GetEnvironmentVariable($_, 'User')
    }
} | Format-Table -AutoSize
```

---

## Persistent Machine Environment

```powershell
Write-Host "`n=== Persistent MACHINE variables ==="

'OPENAI_API_KEY',
'OPENAI_BASE_URL',
'CODEX_ACCESS_TOKEN',
'CODEX_HOME',
'CODEX_CLI_PATH',
'HTTP_PROXY',
'HTTPS_PROXY',
'ALL_PROXY',
'NO_PROXY' |
ForEach-Object {
    [PSCustomObject]@{
        Name  = $_
        Value = [Environment]::GetEnvironmentVariable($_, 'Machine')
    }
} | Format-Table -AutoSize
```

Blank values are generally what you want when authenticating through your ChatGPT account.

---

## Check Individual Variables

```powershell
[Environment]::GetEnvironmentVariable('CODEX_ACCESS_TOKEN','User')
[Environment]::GetEnvironmentVariable('CODEX_ACCESS_TOKEN','Machine')

[Environment]::GetEnvironmentVariable('OPENAI_API_KEY','User')
[Environment]::GetEnvironmentVariable('OPENAI_API_KEY','Machine')

[Environment]::GetEnvironmentVariable('OPENAI_BASE_URL','User')
[Environment]::GetEnvironmentVariable('OPENAI_BASE_URL','Machine')

[Environment]::GetEnvironmentVariable('CODEX_HOME','User')
[Environment]::GetEnvironmentVariable('CODEX_HOME','Machine')
```

A non-empty `CODEX_HOME` is important because Codex may then be reading configuration from somewhere other than:

```text
%USERPROFILE%\.codex
```

---

# macOS Environment Diagnostics

## Current Shell Environment

```bash
env | grep -Ei '^(OPENAI|CODEX|AZURE|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY)='
```

---

## Check Individual Variables

```bash
printf 'OPENAI_API_KEY=%s\n' "${OPENAI_API_KEY:+SET}"
printf 'OPENAI_BASE_URL=%s\n' "${OPENAI_BASE_URL:-}"
printf 'CODEX_ACCESS_TOKEN=%s\n' "${CODEX_ACCESS_TOKEN:+SET}"
printf 'CODEX_HOME=%s\n' "${CODEX_HOME:-}"
printf 'CODEX_CLI_PATH=%s\n' "${CODEX_CLI_PATH:-}"
printf 'HTTP_PROXY=%s\n' "${HTTP_PROXY:-}"
printf 'HTTPS_PROXY=%s\n' "${HTTPS_PROXY:-}"
printf 'ALL_PROXY=%s\n' "${ALL_PROXY:-}"
printf 'NO_PROXY=%s\n' "${NO_PROXY:-}"
```

This intentionally reports whether secret variables are set without displaying the secret itself.

---

## Check launchd Environment

GUI applications on macOS may inherit environment information differently from your interactive shell.

Run:

```bash
for var in \
    OPENAI_API_KEY \
    OPENAI_BASE_URL \
    CODEX_ACCESS_TOKEN \
    CODEX_HOME \
    CODEX_CLI_PATH \
    HTTP_PROXY \
    HTTPS_PROXY \
    ALL_PROXY \
    NO_PROXY
do
    value="$(launchctl getenv "$var" 2>/dev/null)"
    if [ -n "$value" ]; then
        printf '%-20s SET\n' "$var"
    else
        printf '%-20s <not set>\n' "$var"
    fi
done
```

---

## Search Shell Startup Files

Do not display secret values unnecessarily.

Search for variable names:

```bash
grep -RniE \
'OPENAI_API_KEY|CODEX_ACCESS_TOKEN|OPENAI_BASE_URL|CODEX_HOME|CODEX_CLI_PATH' \
~/.zshrc \
~/.zprofile \
~/.zshenv \
~/.bashrc \
~/.bash_profile \
~/.profile \
~/.config \
2>/dev/null
```

If a file contains one of these variables, inspect it locally rather than pasting the credential elsewhere.

---

# Part 3 — Inspect the Codex State Directory

The default location is:

## Windows

```text
C:\Users\<username>\.codex
```

or:

```text
%USERPROFILE%\.codex
```

## macOS

```text
~/.codex
```

Files of particular interest include:

```text
auth.json
config.toml
.codex-global-state.json
models_cache.json
*.sqlite
*.sqlite-wal
sessions/
archived_sessions/
```

---

# Windows — List Codex State

```powershell
Get-ChildItem "$HOME\.codex" -Force -ErrorAction SilentlyContinue |
    Select-Object Name, Length, LastWriteTime
```

---

# macOS — List Codex State

```bash
ls -lah ~/.codex
```

For timestamps:

```bash
find ~/.codex -maxdepth 1 -print0 |
while IFS= read -r -d '' f; do
    stat -f '%Sm %z %N' -t '%Y-%m-%d %H:%M:%S' "$f" 2>/dev/null
done
```

---

# Part 4 — Inspect `auth.json` Without Exposing Tokens

Do **not** simply run:

```text
cat ~/.codex/auth.json
```

because it may contain credentials.

Useful fields include:

```text
auth_mode
OPENAI_API_KEY
tokens
last_refresh
```

---

# Windows — Safe Structural Inspection

```powershell
$auth = "$HOME\.codex\auth.json"

if (Test-Path $auth) {
    $j = Get-Content $auth -Raw | ConvertFrom-Json

    $j.PSObject.Properties | ForEach-Object {
        $v = $_.Value

        [PSCustomObject]@{
            Property = $_.Name
            Present  = $null -ne $v
            Type     = if ($null -ne $v) {
                $v.GetType().Name
            } else {
                'null'
            }
        }
    } | Format-Table -AutoSize
}
```

A more focused check:

```powershell
$auth = Get-Content "$HOME\.codex\auth.json" -Raw | ConvertFrom-Json

[PSCustomObject]@{
    auth_mode       = $auth.auth_mode
    api_key_present = -not [string]::IsNullOrWhiteSpace($auth.OPENAI_API_KEY)
    tokens_present  = $null -ne $auth.tokens
    last_refresh    = $auth.last_refresh
}
```

For a ChatGPT-account login, a healthy result should resemble:

```text
auth_mode       chatgpt
api_key_present False
tokens_present  True
```

Exact fields may change between Codex versions.

---

# macOS — Safe Structural Inspection with `jq`

If `jq` is installed:

```bash
jq '{
  auth_mode,
  api_key_present:
    (.OPENAI_API_KEY != null and .OPENAI_API_KEY != ""),
  tokens_present:
    (.tokens != null),
  last_refresh
}' ~/.codex/auth.json
```

Expected general shape:

```json
{
  "auth_mode": "chatgpt",
  "api_key_present": false,
  "tokens_present": true,
  "last_refresh": "..."
}
```

Do not run:

```bash
jq '.' ~/.codex/auth.json
```

if you intend to copy the output somewhere, because that may expose token contents.

---

## macOS Without `jq`

If `python3` is available:

```bash
python3 <<'PY'
import json
from pathlib import Path

p = Path.home() / ".codex" / "auth.json"

with p.open() as f:
    j = json.load(f)

print("auth_mode       =", j.get("auth_mode"))
print("api_key_present =", bool(j.get("OPENAI_API_KEY")))
print("tokens_present  =", j.get("tokens") is not None)
print("last_refresh    =", j.get("last_refresh"))
PY
```

---

# Part 5 — Inspect `config.toml`

A custom model provider, base URL, environment-key configuration, or obsolete configuration value can change Codex behavior.

Look for:

```text
model_provider
model_providers
base_url
env_key
requires_openai_auth
OPENAI
provider
```

---

# Windows

```powershell
$config = "$HOME\.codex\config.toml"

if (Test-Path $config) {
    Select-String -Path $config `
        -Pattern 'model_provider|model_providers|base_url|env_key|requires_openai_auth|OPENAI|provider' `
        -CaseSensitive:$false
}
```

---

# macOS

```bash
grep -niE \
'model_provider|model_providers|base_url|env_key|requires_openai_auth|OPENAI|provider' \
~/.codex/config.toml 2>/dev/null
```

Potentially relevant custom configuration could resemble:

```toml
model_provider = "custom"
```

or:

```toml
[model_providers.custom]
base_url = "..."
env_key = "OPENAI_API_KEY"
requires_openai_auth = true
```

Do not modify configuration simply because a provider-related line exists. First determine whether it is intentional.

---

# Part 6 — Back Up and Reset Only `auth.json`

This is the least destructive useful authentication reset.

Do not delete the entire `.codex` directory.

---

# Windows

First ensure Codex is completely closed.

Then:

```powershell
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

if (Test-Path "$HOME\.codex\auth.json") {
    Rename-Item `
        "$HOME\.codex\auth.json" `
        "auth.json.backup-$stamp"
}
```

Confirm:

```powershell
Get-ChildItem "$HOME\.codex\auth.json*" |
    Select-Object Name, Length, LastWriteTime
```

---

# macOS

First ensure Codex is completely closed.

Then:

```bash
stamp="$(date '+%Y%m%d-%H%M%S')"

if [ -f "$HOME/.codex/auth.json" ]; then
    mv \
      "$HOME/.codex/auth.json" \
      "$HOME/.codex/auth.json.backup-$stamp"
fi
```

Confirm:

```bash
ls -lah ~/.codex/auth.json*
```

---

# Part 7 — Reauthenticate

Launch Codex Desktop again.

Choose:

```text
Sign in with ChatGPT
```

if your intention is to use Codex through your ChatGPT account.

Do not restore the previous `auth.json`.

Once authentication finishes, Codex should create a new:

```text
~/.codex/auth.json
```

Immediately inspect it using the safe commands above.

The desired condition is approximately:

```text
auth_mode       = chatgpt
api_key_present = false
tokens_present  = true
```

If this state is present, test a new Codex request.

---

# Part 8 — Check CLI Authentication

Run:

```bash
codex login status
```

On Windows PowerShell:

```powershell
codex login status
```

Expected output for ChatGPT authentication is similar to:

```text
Logged in using ChatGPT
```

---

# Important: Detect Multiple Codex Installations

A particularly useful diagnostic is comparing different Codex executables.

In the resolved Windows case, running:

```powershell
codex login status
```

returned:

```text
Error loading configuration:
C:\Users\<user>\.codex\config.toml:5:16:
unknown variant `default`, expected `fast` or `flex`
```

while explicitly running the Codex executable bundled with the Desktop application returned:

```text
Logged in using ChatGPT
```

This indicates that the shell command and Desktop application may be using different Codex versions or executables.

That is a separate problem from the authentication failure and should be diagnosed rather than treated as proof that authentication itself failed.

---

# Windows — Find Every `codex` Command

```powershell
Get-Command codex -All |
    Select-Object CommandType, Name, Source, Version
```

Also:

```powershell
where.exe codex
```

Inspect each returned path.

---

## Find Desktop-Bundled Codex Executables on Windows

```powershell
Get-ChildItem `
    "$env:LOCALAPPDATA\OpenAI\Codex\bin" `
    -Recurse `
    -Filter codex.exe `
    -ErrorAction SilentlyContinue |
    Select-Object FullName, Length, LastWriteTime
```

If one is found, test it directly:

```powershell
& 'FULL\PATH\TO\codex.exe' login status
```

Do not hard-code an old version directory because the generated path may change after updates.

---

# macOS — Find Every `codex`

```bash
type -a codex
```

and:

```bash
which -a codex
```

For each path:

```bash
/path/to/codex --version
/path/to/codex login status
```

If different executables behave differently, investigate the older installation or PATH precedence.

---

# Part 9 — Validate `config.toml` Against the CLI Version

A configuration parser error such as:

```text
unknown variant `default`, expected `fast` or `flex`
```

means that particular Codex executable does not accept the value present in the current configuration.

Check the relevant line.

---

# Windows

Example for line 5:

```powershell
Get-Content "$HOME\.codex\config.toml" |
    Select-Object -First 10
```

Or number the lines:

```powershell
$i = 0

Get-Content "$HOME\.codex\config.toml" |
ForEach-Object {
    $i++
    "{0,4}: {1}" -f $i, $_
}
```

---

# macOS

```bash
nl -ba ~/.codex/config.toml | sed -n '1,20p'
```

Do not blindly replace values until you know which setting the parser is complaining about.

A config parse error affecting one CLI binary does not necessarily mean the Desktop application's authentication is invalid.

---

# Part 10 — Search Local Codex State for the Suspicious API-Key Prefix

If the error exposes a redacted key such as:

```text
Incorrect API key provided: sk-svcac********
```

search only for:

```text
sk-svcac
```

Do not search and print the complete secret.

---

# Windows

With Codex closed:

```powershell
Get-ChildItem "$HOME\.codex" -Recurse -Force -File -ErrorAction SilentlyContinue |
    Where-Object {
        $_.Length -lt 50MB
    } |
    Select-String `
        -Pattern 'sk-svcac' `
        -SimpleMatch `
        -ErrorAction SilentlyContinue |
    Select-Object Path, LineNumber
```

Do **not** add:

```text
Line
```

to the selected fields because that could reveal the credential.

---

# macOS

This prints filenames only:

```bash
grep -RIl \
    --binary-files=without-match \
    'sk-svcac' \
    ~/.codex \
    2>/dev/null
```

To include line numbers in text files without printing matching content, use:

```bash
grep -RIn \
    --binary-files=without-match \
    'sk-svcac' \
    ~/.codex \
    2>/dev/null |
awk -F: '{print $1 ":" $2}'
```

---

# Interpreting Matches

Matches in files such as:

```text
sessions/
archived_sessions/
logs_*.sqlite-wal
```

do **not automatically mean those files are actively supplying the credential**.

Logs and archived sessions may simply contain copies of the error message returned by the server.

For example, if the application logged:

```text
Incorrect API key provided: sk-svcac...
```

then searching the logs later will naturally find that string.

The distinction is:

```text
Credential stored as active configuration
        versus
Credential mentioned in diagnostic/history data
```

Do not delete logs merely because the failed credential appears in them.

---

# Part 11 — Inspect `.codex-global-state.json`

First search for authentication-related property names without printing their values.

---

# Windows

```powershell
Select-String `
    -Path "$HOME\.codex\.codex-global-state.json" `
    -Pattern '"[^"]*(auth|token|api.?key|credential|provider)[^"]*"\s*:' `
    -CaseSensitive:$false |
    ForEach-Object {
        $_.Matches.Value
    } |
    Sort-Object -Unique
```

Search for the suspicious prefix:

```powershell
Select-String `
    -Path "$HOME\.codex\.codex-global-state.json" `
    -Pattern 'sk-svcac' `
    -SimpleMatch |
    Select-Object Path, LineNumber
```

---

# macOS

Property-name search:

```bash
grep -Eo \
'"[^"]*(auth|token|api.?key|credential|provider)[^"]*"[[:space:]]*:' \
~/.codex/.codex-global-state.json \
2>/dev/null |
sort -u
```

Suspicious-prefix search:

```bash
grep -n \
    'sk-svcac' \
    ~/.codex/.codex-global-state.json \
    2>/dev/null |
cut -d: -f1
```

If there is no match, the global-state file is less likely to be the source.

---

# Part 12 — Understand SQLite and WAL Matches

Codex may maintain databases such as:

```text
logs_*.sqlite
state_*.sqlite
thread_history_*.sqlite
queue_*.sqlite
```

with associated files:

```text
.sqlite-wal
.sqlite-shm
```

A plain text search against a WAL file may find readable fragments, but that is not equivalent to querying the database schema.

A match in:

```text
logs_2.sqlite-wal
```

may simply indicate that the authentication error itself was logged.

Do not delete SQLite or WAL files merely because the rejected key prefix appears there.

---

# Check Whether `sqlite3` Is Available

## Windows

```powershell
Get-Command sqlite3 -ErrorAction SilentlyContinue
```

If installed:

```powershell
sqlite3 "$HOME\.codex\logs_2.sqlite" ".tables"
```

---

## macOS

```bash
command -v sqlite3
```

macOS normally includes SQLite tooling.

Then:

```bash
sqlite3 ~/.codex/logs_2.sqlite '.tables'
```

Do not begin dumping entire tables because logs may contain authentication information.

Schema inspection is safer:

```bash
sqlite3 ~/.codex/logs_2.sqlite '.schema'
```

or on Windows:

```powershell
sqlite3 "$HOME\.codex\logs_2.sqlite" ".schema"
```

---

# Part 13 — Windows + WSL Diagnostics

If Codex is configured to use WSL, Windows environment variables are only half of the picture.

Open the WSL distribution used by Codex.

Check relevant environment variables:

```bash
env | grep -Ei \
'^(OPENAI|CODEX|AZURE|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY)='
```

Then search common configuration locations:

```bash
grep -RniE \
'OPENAI_API_KEY|CODEX_ACCESS_TOKEN|OPENAI_BASE_URL|CODEX_HOME|sk-[A-Za-z0-9_-]+' \
~/.bashrc \
~/.profile \
~/.bash_profile \
~/.zshrc \
~/.config \
~/.codex \
2>/dev/null
```

Do not paste matching credentials.

If WSL contains an API key that Windows does not, the effective Codex runtime may still be seeing credentials you did not find in Windows.

---

# Part 14 — Optional CLI Diagnostics

If supported by the installed Codex version:

```bash
codex doctor
```

On Windows:

```powershell
codex doctor
```

If the command fails while parsing `config.toml`, resolve the configuration/version mismatch first.

Codex currently provides diagnostic tooling on Windows, and current OpenAI documentation identifies `codex doctor` as a diagnostic command for startup, connectivity, and performance issues.

---

# Diagnostic Decision Tree

## Case A — Environment Contains `OPENAI_API_KEY`

Example:

```text
OPENAI_API_KEY = SET
```

and you intend to use ChatGPT-account authentication.

Investigate where that variable is being defined.

Possible sources include:

```text
Windows User environment
Windows Machine environment
PowerShell profile
macOS shell profile
launchd environment
WSL shell configuration
development environment
IDE
credential-management scripts
```

Remove or correct the unintended definition, start a fresh shell/session, restart Codex, and test again.

---

## Case B — `CODEX_ACCESS_TOKEN` Is Defined

Investigate it first.

A stale token can conflict with newly established authentication.

Determine:

```text
where it is set
whether it is intentional
whether Codex Desktop should be using it
```

Do not simply publish or copy the token during troubleshooting.

---

## Case C — `CODEX_HOME` Is Defined

You may have been inspecting the wrong configuration directory.

For example:

```text
CODEX_HOME=D:\something\codex
```

would mean:

```text
~/.codex
```

may not be the state directory actually in use.

Inspect the configured location instead.

---

## Case D — `auth.json` Says API-Key Authentication

Example:

```text
auth_mode       = apikey
api_key_present = true
```

If you intend to use ChatGPT authentication:

1. close Codex;
2. back up `auth.json`;
3. relaunch;
4. select **Sign in with ChatGPT**;
5. verify the regenerated file.

---

## Case E — `auth.json` Says ChatGPT and Has Tokens

Example:

```text
auth_mode       = chatgpt
api_key_present = false
tokens_present  = true
```

This strongly suggests that the primary persisted login state is correct.

Next investigate:

```text
environment overrides
multiple Codex binaries
custom provider configuration
Desktop-specific state
WSL environment
version/config incompatibility
```

---

## Case F — CLI Says `Logged in using ChatGPT`, Desktop Still Returns 401

This isolates the problem further.

Possible interpretation:

```text
auth.json = healthy
CLI       = healthy
Desktop   = unhealthy
```

Focus on Desktop-specific state rather than repeatedly regenerating API keys.

Before taking destructive action:

```text
restart all Codex processes
refresh auth.json once
check Desktop version
check CLI version mismatch
inspect config.toml
check WSL selection/environment
```

---

## Case G — One `codex` Binary Fails but Another Works

Example:

```text
codex login status
    -> config parsing failure

Desktop-bundled codex.exe login status
    -> Logged in using ChatGPT
```

This usually points to:

```text
multiple Codex versions
PATH precedence
configuration syntax supported by one version but not another
```

Run:

### Windows

```powershell
Get-Command codex -All
where.exe codex
```

### macOS

```bash
type -a codex
which -a codex
```

Then compare:

```text
path
version
login status
```

Do not assume the first `codex` executable in PATH is the one used by Desktop.

---

# Part 15 — What Fixed the Example Incident

The failing Windows installation initially showed:

```text
401 Unauthorized:
Incorrect API key provided: sk-svcac...
```

The following were verified first:

```text
OPENAI_API_KEY       absent
OPENAI_BASE_URL      absent
CODEX_ACCESS_TOKEN   absent
CODEX_HOME           absent
HTTP_PROXY           absent
HTTPS_PROXY          absent
```

`auth.json` initially existed and structurally contained:

```text
auth_mode
tokens
last_refresh
```

with:

```text
OPENAI_API_KEY = null
```

The recovery procedure was:

```text
1. Fully terminate Codex.
2. Rename ~/.codex/auth.json to a timestamped backup.
3. Relaunch Codex.
4. Sign in with ChatGPT.
5. Allow Codex to create a new auth.json.
6. Verify:
      auth_mode       = chatgpt
      api_key_present = false
      tokens_present  = true
7. Test the previously failing request.
```

The regenerated authentication state reported:

```text
auth_mode       chatgpt
api_key_present False
tokens_present  True
```

and the Desktop application resumed normal operation.

The bundled Desktop Codex CLI also reported:

```text
Logged in using ChatGPT
```

The rejected key prefix remained searchable in:

```text
logs_2.sqlite-wal
archived_sessions/
sessions/
```

but not in:

```text
.codex-global-state.json
```

Those later matches were consistent with diagnostic/history records containing the previous 401 error and were not evidence by themselves that the key remained active.

---

# Part 16 — Secondary Finding: CLI Configuration Version Mismatch

During validation, the shell-resolved command:

```powershell
codex login status
```

returned:

```text
Error loading configuration:
C:\Users\<user>\.codex\config.toml:5:16:
unknown variant `default`, expected `fast` or `flex`
```

However, the Codex executable bundled with Desktop returned:

```text
Logged in using ChatGPT
```

This should be treated as a second issue:

```text
Authentication problem       -> resolved
CLI/config version mismatch  -> still worth cleaning up
```

Recommended follow-up:

```powershell
Get-Command codex -All |
    Select-Object CommandType, Name, Source, Version

where.exe codex
```

Compare each installation's version:

```powershell
& 'PATH\TO\FIRST\codex.exe' --version
& 'PATH\TO\SECOND\codex.exe' --version
```

Then identify which installation is stale or incompatible with the current `config.toml`.

---

# Part 17 — What Not to Do First

Avoid these as initial troubleshooting steps:

```text
Delete the entire ~/.codex directory
Delete all SQLite databases
Delete all session history
Delete worktrees
Delete plugins
Delete browser state
Regenerate random API keys
Reinstall Windows/macOS
Repeatedly reinstall Codex without inspecting state
Publish auth.json for troubleshooting
```

Your `.codex` directory can contain:

```text
sessions
archived sessions
plugins
attachments
worktrees
rules
browser state
local databases
configuration
authentication state
```

Deleting the entire directory is disproportionate when the authentication problem may be isolated to one file.

Prefer:

```text
rename auth.json
```

over:

```text
delete ~/.codex
```

---

# Part 18 — Escalation Procedure

If the authentication reset does not work, collect the following **without secrets**.

## Windows

### Codex processes

```powershell
Get-Process |
    Where-Object {
        $_.ProcessName -match 'codex'
    } |
    Select-Object Id, ProcessName, Path
```

### CLI installations

```powershell
Get-Command codex -All |
    Select-Object CommandType, Name, Source, Version
```

```powershell
where.exe codex
```

### CLI version

```powershell
codex --version
```

### Login status

```powershell
codex login status
```

### Auth structure

```powershell
$auth = Get-Content "$HOME\.codex\auth.json" -Raw | ConvertFrom-Json

[PSCustomObject]@{
    auth_mode       = $auth.auth_mode
    api_key_present = -not [string]::IsNullOrWhiteSpace($auth.OPENAI_API_KEY)
    tokens_present  = $null -ne $auth.tokens
    last_refresh    = $auth.last_refresh
}
```

### Relevant environment variable names

```powershell
Get-ChildItem Env: |
    Where-Object {
        $_.Name -match 'OPENAI|CODEX|AZURE|PROXY'
    } |
    Select-Object Name
```

### Config-related lines

```powershell
Select-String `
    -Path "$HOME\.codex\config.toml" `
    -Pattern 'model_provider|model_providers|base_url|env_key|requires_openai_auth|OPENAI|provider' `
    -CaseSensitive:$false
```

---

# macOS

### Processes

```bash
pgrep -afil codex
```

### CLI locations

```bash
type -a codex
which -a codex
```

### Version

```bash
codex --version
```

### Login status

```bash
codex login status
```

### Relevant environment variable names

```bash
env |
grep -Ei '^(OPENAI|CODEX|AZURE|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY)=' |
sed 's/=.*$/=<redacted>/'
```

### Config-related lines

```bash
grep -niE \
'model_provider|model_providers|base_url|env_key|requires_openai_auth|OPENAI|provider' \
~/.codex/config.toml 2>/dev/null
```

Provide those outputs along with:

```text
Operating system/version
Codex Desktop version
Codex CLI version
Exact error text
Whether auth reset changed anything
Whether CLI requests work
Whether Desktop requests work
Whether WSL is involved
```

---

# Part 19 — Compact Troubleshooting Checklist

```text
[ ] Update Codex Desktop
[ ] Log out/in once normally
[ ] Fully terminate every Codex process
[ ] Check OPENAI_API_KEY
[ ] Check CODEX_ACCESS_TOKEN
[ ] Check OPENAI_BASE_URL
[ ] Check CODEX_HOME
[ ] Check proxy variables
[ ] Check WSL environment if applicable
[ ] Inspect ~/.codex directory
[ ] Inspect auth.json structurally without printing tokens
[ ] Inspect config.toml
[ ] Back up auth.json
[ ] Relaunch Codex
[ ] Sign in with ChatGPT
[ ] Verify auth_mode = chatgpt
[ ] Verify api_key_present = false
[ ] Verify tokens_present = true
[ ] Run codex login status
[ ] Check for multiple codex executables
[ ] Compare CLI versions
[ ] Search only the rejected key prefix
[ ] Treat log/history matches as evidence, not necessarily active configuration
[ ] Test a fresh Codex request
```

---

# Part 20 — Recommended Troubleshooting Order

For future incidents, use this order:

```text
1. Observe exact error
        ↓
2. Stop Codex completely
        ↓
3. Inspect environment
        ↓
4. Inspect auth.json safely
        ↓
5. Inspect config.toml
        ↓
6. Check CLI executable/version
        ↓
7. Back up auth.json
        ↓
8. Reauthenticate with ChatGPT
        ↓
9. Verify regenerated auth state
        ↓
10. Test Desktop
        ↓
11. Search local state for rejected credential prefix
        ↓
12. Inspect WSL/macOS launch environment if relevant
        ↓
13. Inspect SQLite/log state only if still necessary
        ↓
14. Escalate with sanitized diagnostics
```

This sequence preserves user state while progressively isolating the source of the authentication failure.

---

# Result Criteria

Authentication can be considered restored when all of the following are true:

```text
Codex Desktop can successfully submit prompts
auth_mode reports ChatGPT authentication
OPENAI_API_KEY is not unexpectedly populated
tokens are present
the desired Codex executable reports ChatGPT login
the previous 401 no longer occurs
```

A historical occurrence of the rejected key inside session files, archived sessions, logs, or SQLite WAL data does not invalidate the recovery if new requests are succeeding.

---

# References

Current OpenAI documentation confirms that Codex is available through the ChatGPT desktop app and Codex CLI, that Windows installations include Codex diagnostic tooling such as `codex doctor`, and that Codex configuration is stored under `%USERPROFILE%\.codex\config.toml` on Windows or `~/.codex/config.toml` on macOS/Linux.
