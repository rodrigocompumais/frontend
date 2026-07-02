# Deploy do frontend sem derrubar o site (Windows / PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Deploy frontend (zero downtime)"
npm run build:live

Write-Host ""
Write-Host "==> Deploy concluído."
Write-Host "    O serve deve apontar para build-live:"
Write-Host "      serve -s build-live -l 3001"
Write-Host ""
Write-Host "    Rollback: npm run build:rollback"
