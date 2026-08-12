<#
    Prepara e pubblica. PowerShell, Windows.

        .\push.ps1                     commit e push
        .\push.ps1 "messaggio"         con un messaggio tuo

    Il remote va impostato una volta sola:
        git remote add origin https://github.com/<utente>/norvegia2026.git
#>

param([string]$Messaggio = "")

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if ([string]::IsNullOrWhiteSpace($Messaggio)) {
    $Messaggio = "Aggiornamento itinerario " + (Get-Date -Format "dd/MM/yyyy")
}

Write-Host "-> Allineo la cache del service worker e rigenero il file singolo" -ForegroundColor Cyan
python build.py
if ($LASTEXITCODE -ne 0) { throw "build.py ha segnalato un problema" }

if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "-> Controllo la sintassi dei moduli" -ForegroundColor Cyan
    foreach ($f in @("data.js","store.js","ui.js","weather.js","views.js","app.js","sw.js")) {
        node --check $f
        if ($LASTEXITCODE -ne 0) { throw "Errore di sintassi in $f" }
    }
} else {
    Write-Host "-> Node non installato: il controllo di sintassi lo fa la GitHub Action" -ForegroundColor DarkGray
}

# rete di sicurezza: secrets.js non deve mai entrare nell'indice
$tracciati = git ls-files
if ($tracciati -contains "secrets.js") {
    throw "secrets.js risulta tracciato da git. Togli con: git rm --cached secrets.js"
}

if (-not (Test-Path ".git")) {
    Write-Host "-> Primo avvio: inizializzo il repository" -ForegroundColor Cyan
    git init -b main
    Write-Host "   Ora imposta il remote e rilancia:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/<utente>/norvegia2026.git" -ForegroundColor Yellow
}

git add -A
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "-> Niente da committare" -ForegroundColor DarkGray
} else {
    git commit -m $Messaggio
    Write-Host "-> Commit fatto: $Messaggio" -ForegroundColor Green
}

git remote get-url origin 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    git push -u origin main
    Write-Host "-> Pubblicato. Pages aggiorna in un minuto circa." -ForegroundColor Green
} else {
    Write-Host "-> Nessun remote impostato: push saltato" -ForegroundColor DarkGray
}
