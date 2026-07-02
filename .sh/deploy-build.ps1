# Deploy do frontend sem derrubar o site (Windows / PowerShell)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Deploy frontend (zero downtime)"
npm run build:live

Write-Host "==> Deploy concluído."
Write-Host "    Se algo falhar: npm run build:rollback"
