@echo off
echo 🚀 Iniciando apenas o Servidor API...
echo.

REM Configurar variáveis de ambiente
IF "%OPENAI_API_KEY%"=="" (
  echo [ERRO] OPENAI_API_KEY não definida. set OPENAI_API_KEY=... antes de rodar.
  exit /b 1
)
set SUPABASE_URL=https://iyqrjgwqjmsnhtxbywme.supabase.co
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA
set PORT=3001

echo ⚡ Iniciando API Server em http://localhost:3001...
cd api-server
npm start 