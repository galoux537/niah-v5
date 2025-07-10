# Script para corrigir imports após migração para nova estrutura

Write-Host "Corrigindo imports de supabase..."

# Corrigir imports do supabase
$files = Get-ChildItem -Recurse -Include "*.tsx","*.ts" | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*api-server*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "from '\.\./lib/supabase'") {
        $content = $content -replace "from '\.\./lib/supabase'", "from '../src/lib/supabase'"
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Corrigido: $($file.Name)"
    }
    if ($content -match "from '\.\./lib/auth'") {
        $content = $content -replace "from '\.\./lib/auth'", "from '../src/lib/auth'"
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Corrigido auth: $($file.Name)"
    }
}

Write-Host "Imports corrigidos!" 
 
 