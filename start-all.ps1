Write-Host "🚀 Iniciando NIAH! - Sistema Completo" -ForegroundColor Green
Write-Host ""

# Configurar variáveis de ambiente
if (-not $Env:OPENAI_API_KEY) {
  Write-Host "[ERRO] OPENAI_API_KEY não definido. Use `$Env:OPENAI_API_KEY='sua_chave' antes de executar." -ForegroundColor Red
  exit 1
}
$env:SUPABASE_URL = "https://rtcboicxytdsbqxgtfey.supabase.co"
$env:SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Y2JvaWN4eXRkc2JxeGd0ZmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNDUwOTEsImV4cCI6MjA0NjkyMTA5MX0.VmyqkgZ_k8EL1lPQD4jNcOYmPfpYJRNqrUVyWQ-7Q-s"
$env:PORT = "3001"

Write-Host "⚡ Iniciando API Server (Backend)..." -ForegroundColor Yellow

# Iniciar API Server em background
$apiJob = Start-Job -ScriptBlock {
    Set-Location "api-server"
    $env:OPENAI_API_KEY = $using:env:OPENAI_API_KEY
    $env:SUPABASE_URL = $using:env:SUPABASE_URL
    $env:SUPABASE_ANON_KEY = $using:env:SUPABASE_ANON_KEY
    $env:PORT = $using:env:PORT
    node server.js
}

Write-Host "⚡ Aguardando API inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Testar se API está rodando
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
    Write-Host "✅ API Server iniciado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar API Server" -ForegroundColor Red
    Stop-Job $apiJob
    Remove-Job $apiJob
    exit 1
}

Write-Host "⚡ Iniciando Frontend React..." -ForegroundColor Yellow

# Iniciar Frontend
$frontendJob = Start-Job -ScriptBlock {
    npm run dev
}

Write-Host ""
Write-Host "✅ Sistema iniciado com sucesso!" -ForegroundColor Green
Write-Host "📡 API Server: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar os serviços..." -ForegroundColor Yellow

# Aguardar sinal de interrupção
try {
    # Monitorar jobs
    while ($apiJob.State -eq "Running" -or $frontendJob.State -eq "Running") {
        Start-Sleep -Seconds 1
        
        # Mostrar output dos jobs se houver
        Receive-Job $apiJob -Keep | ForEach-Object { Write-Host "[API] $_" -ForegroundColor Blue }
        Receive-Job $frontendJob -Keep | ForEach-Object { Write-Host "[Frontend] $_" -ForegroundColor Magenta }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Parando serviços..." -ForegroundColor Yellow
    
    # Parar jobs
    Stop-Job $apiJob -ErrorAction SilentlyContinue
    Remove-Job $apiJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    
    # Matar processos Node.js se necessário
    Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Serviços parados!" -ForegroundColor Green
} 