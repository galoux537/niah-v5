@echo off
REM A variável OPENAI_API_KEY deve estar definida no ambiente antes de rodar este script.
REM Exemplo (PowerShell):  $Env:OPENAI_API_KEY="sua_chave"
REM Exemplo (CMD):        set OPENAI_API_KEY=sua_chave
IF "%OPENAI_API_KEY%"=="" (
  echo [ERRO] OPENAI_API_KEY não encontrada. Defina no ambiente ou arquivo .env.
  exit /b 1
)
set SUPABASE_URL=https://iyqrjgwqjmsnhtxbywme.supabase.co
set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXJqZ3dxam1zbmh0eGJ5d21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxODM0NDYsImV4cCI6MjA2NTc1OTQ0Nn0.-CJCcKDV3AxNuEjfOuv7hyYZMypXIMwin8HW-ROvlEA
set PORT=3001
node server.js 