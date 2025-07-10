@echo off
echo 🚀 Iniciando NIAH! - Sistema Completo
echo.

REM Configurar variáveis de ambiente
REM A variável OPENAI_API_KEY deve estar definida no ambiente antes de rodar.
IF "%OPENAI_API_KEY%"=="" (
  echo [ERRO] OPENAI_API_KEY não encontrada. Use set OPENAI_API_KEY=... antes de executar.
  pause
  exit /b 1
)
set SUPABASE_URL=https://iyqrjgwqjmsnhtxbywme.supabase.co
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA
set PORT=3001

echo ⚡ Iniciando API Server (Backend)...
cd api-server
start "NIAH! API Server" cmd /k "npm start"

echo ⚡ Aguardando API inicializar...
timeout /t 5 /nobreak >nul

echo ⚡ Iniciando Frontend React...
cd ..
start "NIAH! Frontend" cmd /k "npm run dev"

echo.
echo ✅ Sistema iniciado com sucesso!
echo 📡 API Server: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo.
echo ✅ Ambos os serviços estão rodando em janelas separadas!
echo ✅ Feche as janelas do terminal para parar os serviços.
echo.
echo ✅ Pronto para usar! Acesse http://localhost:5173 