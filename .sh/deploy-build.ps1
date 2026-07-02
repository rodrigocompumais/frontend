# Deploy do frontend sem derrubar o site (Windows / PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Deploy frontend (zero downtime)"
npm run build:live

Write-Host ""
Write-Host "==> Deploy concluído."
Write-Host "    Compila em build-staging; publica ao final em build e build-live."
Write-Host "    PM2 pode continuar com: serve -s build -l 3001"
Write-Host ""
Write-Host "    Rollback: npm run build:rollback"
