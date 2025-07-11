import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Copy, Webhook, BarChart3, CheckCircle, XCircle, X, Upload, Activity, Globe, Settings, Zap, Target, Shield, AlertCircle, Code } from 'lucide-react';
import { BatchAnalysisPage } from './BatchAnalysisPage';
import { Card } from './ui/card';
import { supabase } from '../src/lib/supabase';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
// URL base da API (Render ou relativa em dev)
const API_BASE = (import.meta as any).env.VITE_API_URL || '';

// Nova documentação interativa da API
const BatchAnalysisDocumentation: React.FC = () => {
  const [formData, setFormData] = useState({
    batch_name: 'NOME_DO_LOTE_AQUI',
    criteria: '{"criteria_name":"critério 4","criteriaId":"e270f185-0e87-48a5-8c12-e2cd526fe041"}',
    webhook: 'https://webhook.site/seu-id-unico',
    audioFiles_0: null as File | null,
    phone_number_0: '5511999999999',
    metadata_0: '{"name":"Ana Oliveira","email":"ana.oliveira@empresaabc.com","phone":"11987654321"}',
    audioFiles_1: null as File | null,
    phone_number_1: '5511888888888',
    metadata_1: '{"name":"Carlos Batista","email":"carlos@empresa.com","phone":"11999887766"}'
  });
  
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'javascript' | 'php'>('curl');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [exampleTab, setExampleTab] = useState<'success' | 'error400' | 'error404'>('success');

  // refs para inputs de arquivo (áudio)
  const audioInput0Ref = useRef<HTMLInputElement | null>(null);
  const audioInput1Ref = useRef<HTMLInputElement | null>(null);
  
  const batchApiUrl = `${API_BASE}/api/v1/analyze-batch-proxy`;
  
  const [userToken, setUserToken] = useState<string>('');
  
  // Obter token do usuário logado
  useEffect(() => {
    const getToken = () => {
      try {
        // 1. Primeiro: Tentar pegar token JWT personalizado
        const jwtToken = localStorage.getItem('niah_token');
        if (jwtToken) {
          setUserToken(jwtToken);
          console.log('✅ Token JWT encontrado:', jwtToken.slice(0, 20) + '...');
          return;
        }
        
        // 2. Segundo: Tentar pegar token do auth service
        const authToken = localStorage.getItem('auth_token');
        if (authToken) {
          setUserToken(authToken);
          console.log('✅ Token Auth Service encontrado:', authToken.slice(0, 20) + '...');
          return;
        }
        
        // 3. Terceiro: Tentar pegar token do Supabase (fallback)
        const supabaseToken = localStorage.getItem('supabase.auth.token');
        if (supabaseToken) {
          try {
            const parsedToken = JSON.parse(supabaseToken);
            if (parsedToken.access_token) {
              setUserToken(parsedToken.access_token);
              console.log('✅ Token Supabase encontrado:', parsedToken.access_token.slice(0, 20) + '...');
              return;
            }
          } catch (e) {
            console.error('❌ Erro ao parsear token Supabase:', e);
          }
        }
        
        console.log('❌ Nenhum token encontrado');
        setUserToken('');
      } catch (error) {
        console.error('❌ Erro ao obter token:', error);
        setUserToken('');
      }
    };
    
    // Obter token inicial
    getToken();
    
    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'niah_token' || e.key === 'auth_token') {
        console.log('🔄 Token alterado no localStorage');
        getToken();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Função para mascarar token apenas no display
  const getDisplayToken = (token: string) => {
    if (!token) return 'Faça login para ver seu token';
    if (token.length < 10) return token;
    return `${token.slice(0, 8)}${'*'.repeat(12)}${token.slice(-8)}`;
  };
  
  // Função para copiar o token completo (incluindo "Bearer ")
  const copyTokenWithBearer = async (token: string) => {
    try {
      await navigator.clipboard.writeText(`Bearer ${token}`);
      setCopiedText('token_copied');
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };
  
  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };
  
  // Função para gerar amostras de código com token mascarado para exibição
  const generateCodeSample = (forCopy = false) => {
    // Use token completo para cópia, mascarado para exibição
    const displayToken = forCopy ? userToken : getDisplayToken(userToken);
    
    const samples = {
      curl: `curl -X POST "${batchApiUrl}" \\
  -H "Authorization: Bearer ${displayToken}" \\
  -F 'batch_name=${formData.batch_name}' \\
  -F 'criteria=${formData.criteria}' \\
  -F 'webhook=${formData.webhook}' \\${formData.audioFiles_0 ? `
  -F "audioFiles_0=@${formData.audioFiles_0.name}" \\` : ''}
  -F 'phone_number_0=${formData.phone_number_0}' \\
  -F 'metadata_0=${formData.metadata_0}'${formData.audioFiles_1 ? ` \\
  -F "audioFiles_1=@${formData.audioFiles_1.name}" \\
  -F 'phone_number_1=${formData.phone_number_1}' \\
  -F 'metadata_1=${formData.metadata_1}'` : ''}`,
      
      python: `import requests

url = "${batchApiUrl}"
headers = {"Authorization": "Bearer ${displayToken}"}

files = {${formData.audioFiles_0 ? `
    "audioFiles_0": open("${formData.audioFiles_0.name}", "rb"),` : ''}${formData.audioFiles_1 ? `
    "audioFiles_1": open("${formData.audioFiles_1.name}", "rb"),` : ''}
}

data = {
    "batch_name": "${formData.batch_name}",
    "criteria": "${formData.criteria}",
    "webhook": "${formData.webhook}",
    "phone_number_0": "${formData.phone_number_0}",
    "metadata_0": "${formData.metadata_0}"${formData.audioFiles_1 ? `,
    "phone_number_1": "${formData.phone_number_1}",
    "metadata_1": "${formData.metadata_1}"` : ''}
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())`,
      
      javascript: `const formData = new FormData();

formData.append('batch_name', '${formData.batch_name}');
formData.append('criteria', '${formData.criteria}');
formData.append('webhook', '${formData.webhook}');${formData.audioFiles_0 ? `
formData.append('audioFiles_0', document.querySelector('#file0').files[0]);` : ''}
formData.append('phone_number_0', '${formData.phone_number_0}');
formData.append('metadata_0', '${formData.metadata_0}');${formData.audioFiles_1 ? `
formData.append('audioFiles_1', document.querySelector('#file1').files[0]);
formData.append('phone_number_1', '${formData.phone_number_1}');
formData.append('metadata_1', '${formData.metadata_1}');` : ''}

fetch('${batchApiUrl}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${displayToken}'
  },
  body: formData
}).then(r => r.json()).then(console.log);`,
      
      php: `$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "${batchApiUrl}");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer ${displayToken}'
]);

$postFields = [
  'batch_name' => '${formData.batch_name}',
  'criteria' => '${formData.criteria}',
  'webhook' => '${formData.webhook}',${formData.audioFiles_0 ? `
  'audioFiles_0' => new CURLFile('${formData.audioFiles_0.name}'),` : ''}
  'phone_number_0' => '${formData.phone_number_0}',
  'metadata_0' => '${formData.metadata_0}'${formData.audioFiles_1 ? `,
  'audioFiles_1' => new CURLFile('${formData.audioFiles_1.name}'),
  'phone_number_1' => '${formData.phone_number_1}',
  'metadata_1' => '${formData.metadata_1}'` : ''}
];

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;`
    };
    
    return samples[activeLang];
  };
  
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText('copied');
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('batch_name', formData.batch_name);
      formDataToSend.append('criteria', formData.criteria);
      formDataToSend.append('webhook', formData.webhook);
      
      if (formData.audioFiles_0) {
        formDataToSend.append('audioFiles_0', formData.audioFiles_0);
      }
      formDataToSend.append('phone_number_0', formData.phone_number_0);
      formDataToSend.append('metadata_0', formData.metadata_0);
      
      if (formData.audioFiles_1) {
        formDataToSend.append('audioFiles_1', formData.audioFiles_1);
        formDataToSend.append('phone_number_1', formData.phone_number_1);
        formDataToSend.append('metadata_1', formData.metadata_1);
      }
      
      const response = await fetch(batchApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formDataToSend
      });
      
      const result = await response.json();
      setApiResponse({ status: response.status, data: result });
      
    } catch (error) {
      setApiResponse({ 
        status: 500, 
        data: { error: 'Network error', message: error instanceof Error ? error.message : 'Unknown error' } 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="Lista1DasAvaliaEs bg-gray-50 flex flex-col gap-6 w-full">
      <div className="Frame1321317122 flex flex-col gap-4">
        <div className="Post bg-white rounded-[10px] shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)] outline outline-1 outline-slate-200 self-stretch flex flex-col gap-6 pb-6">
      {/* Header */}
      <div className="Frame48096219 pl-6 pr-4 py-4 border-b border-slate-200 flex items-center gap-4">
        <div>
          <h1 className="AnaliseEmLote text-gray-700 text-lg font-medium">Análise em Lote</h1>
              </div>
        </div>

      {/* POST Box Full width */}
      <div className="px-6">
        <div className="Frame1321317070 outline outline-4 outline-blue-200 rounded-[10px] flex items-start gap-4 w-full">
          <div className="flex-1 flex items-center">
            <div className="h-10 pl-3 pr-5 py-2 bg-blue-200 rounded-tl-[10px] rounded-bl-[10px] flex items-center gap-2">
              <span className="text-blue-900 text-sm font-medium font-['Cerebri_Sans_Pro']">POST</span>
            </div>
            <div className="flex-1 h-10 px-4 bg-white rounded-tr-[10px] rounded-br-[10px] outline outline-1 outline-slate-200 flex items-center justify-between">
              <code className="text-gray-700 text-sm font-medium font-mono break-all">{batchApiUrl}</code>
              <button onClick={() => handleCopy(batchApiUrl)} className="p-1 text-slate-400 hover:text-slate-600">
                <Copy className="w-5 h-5" />
              </button>
            </div>
            </div>
          </div>
        </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 px-6">
        {/* Left Column - Token + Form */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-6">
          {/* Token User */}
          <div>
            <div className="text-gray-700 text-sm mb-1">Seu token de usuário</div>
            <div className="flex items-center gap-4">
              <div className="w-40 flex"><span className="inline-flex h-7 px-2 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">token_user</span></div>
              <div className="flex-1 h-10 px-4 bg-gray-50 border border-[#E1E9F4] rounded-[10px] flex items-center justify-between">
                <code className="flex-1 text-slate-600 text-base truncate">{getDisplayToken(userToken)}</code>
                <button 
                  onClick={() => copyTokenWithBearer(userToken)} 
                  className={`p-1 transition-colors ${
                    copiedText === 'token_copied' 
                      ? 'text-green-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Copiar token completo com Bearer"
                >
                  {copiedText === 'token_copied' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Parâmetros */}
          <Card className="bg-white border border-[#e1e9f4] rounded-xl shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
            <div className="pt-4 px-4 sm:px-6 pb-6">
              <div className="-mx-4 sm:-mx-6 px-4 sm:px-6 mb-4 pb-4 border-b border-[#e1e9f4]">
                <h3 className="text-[#373753] text-lg font-semibold">Parâmetros</h3>
              </div>
              
              <div className="space-y-4">
                {/* batch_name */}
                <div className="flex items-center gap-4">
                  <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">batch_name</span></div>
                  <Input
                    value={formData.batch_name}
                    onChange={(e) => handleInputChange('batch_name', e.target.value)}
                    placeholder="NOME_DO_LOTE_AQUI"
                    className="flex-1 h-10 px-3 bg-white border border-[#E1E9F4] rounded-[10px]"
                  />
                </div>
                
                {/* criteria */}
                <div className="flex items-start gap-4">
                  <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">criteria*</span></div>
                  <div className="relative flex-1" style={{height:'31.5px',minHeight:'31.5px'}}>
                  <Textarea
                    value={formData.criteria}
                    onChange={(e) => handleInputChange('criteria', e.target.value)}
                      placeholder="{...}"
                      style={{height:'31.5px',minHeight:'31.5px',whiteSpace:'nowrap',overflow:'hidden'}}
                      onFocus={(e)=>{
                        const t=e.currentTarget;
                        t.style.position='absolute';
                        t.style.zIndex='50';
                        t.style.left='0';
                        t.style.right='0';
                        t.style.height='150px';
                        t.style.whiteSpace='pre-wrap';
                        t.style.overflow='auto';
                      }}
                      onBlur={(e)=>{
                        const t=e.currentTarget;
                        t.style.position='static';
                        t.style.height='31.5px';
                        t.style.whiteSpace='nowrap';
                        t.style.overflow='hidden';
                      }}
                      className="w-full resize-none bg-white rounded-[10px]"
                  />
                  </div>
                </div>
                
                {/* webhook */}
                <div className="flex items-center gap-4">
                  <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">webhook</span></div>
                  <Input
                    value={formData.webhook}
                    onChange={(e) => handleInputChange('webhook', e.target.value)}
                    placeholder="https://webhook.site/seu-id-unico"
                    className="flex-1 h-10 px-3 bg-white border border-[#E1E9F4] rounded-[10px]"
                  />
                </div>
                
                {/* Arquivo 1 */}
                <div className="border-t border-[#e1e9f4] pt-4">
                  <h4 className="text-[#373753] font-medium mb-3">Arquivo 1</h4>
                  <div className="space-y-3">
                    {/* audioFiles_0 */}
                    <div className="flex items-center gap-4">
                      <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">audioFiles_0*</span></div>
                      <div className="relative flex-1">
                        <input
                          id="file0"
                          ref={audioInput0Ref}
                        type="file"
                        accept="audio/*"
                          className="hidden"
                        onChange={(e) => handleFileUpload('audioFiles_0', e.target.files?.[0] || null)}
                        />
                        {formData.audioFiles_0 ? (
                          <div
                            className="h-10 px-3 bg-[#F0F4FA] border border-[#E1E9F4] rounded-[10px] flex items-center justify-between cursor-pointer"
                            onClick={() => audioInput0Ref.current?.click()}
                          >
                            <span className="text-gray-700 text-sm truncate">{formData.audioFiles_0.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (audioInput0Ref.current) audioInput0Ref.current.value = '';
                                handleFileUpload('audioFiles_0', null);
                              }}
                              className="ml-2"
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="h-10 px-3 bg-gray-50 border border-[#E1E9F4] rounded-[10px] flex items-center justify-between cursor-pointer"
                            onClick={() => audioInput0Ref.current?.click()}
                          >
                            <span className="text-gray-500 text-sm">Escolher arquivo</span>
                            <Upload className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* phone_number_0 */}
                    <div className="flex items-center gap-4">
                      <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">phone_number_0*</span></div>
                      <Input
                        value={formData.phone_number_0}
                        onChange={(e) => handleInputChange('phone_number_0', e.target.value)}
                        placeholder="5511999999999"
                        className="flex-1 h-10 px-3 bg-white border border-[#E1E9F4] rounded-[10px]"
                      />
                    </div>
                    
                    {/* metadata_0 */}
                    <div className="flex items-start gap-4">
                      <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">metadata_0</span></div>
                      <div className="relative flex-1" style={{height:'31.5px',minHeight:'31.5px'}}>
                      <Textarea
                        value={formData.metadata_0}
                        onChange={(e) => handleInputChange('metadata_0', e.target.value)}
                          placeholder="{...}"
                          style={{height:'31.5px',minHeight:'31.5px',whiteSpace:'nowrap',overflow:'hidden'}}
                          onFocus={(e)=>{
                            const t=e.currentTarget;
                            t.style.position='absolute';
                            t.style.zIndex='50';
                            t.style.left='0';
                            t.style.right='0';
                            t.style.height='150px';
                            t.style.whiteSpace='pre-wrap';
                            t.style.overflow='auto';
                          }}
                          onBlur={(e)=>{
                            const t=e.currentTarget;
                            t.style.position='static';
                            t.style.height='31.5px';
                            t.style.whiteSpace='nowrap';
                            t.style.overflow='hidden';
                          }}
                          className="w-full resize-none bg-white rounded-[10px]"
                      />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Arquivo 2 */}
                <div className="border-t border-[#e1e9f4] pt-4">
                  <h4 className="text-[#373753] font-medium mb-3">Arquivo 2 (Opcional)</h4>
                  <div className="space-y-3">
                    {/* audioFiles_1 */}
                    <div className="flex items-center gap-4">
                      <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">audioFiles_1</span></div>
                      <div className="relative flex-1">
                        <input
                          id="file1"
                          ref={audioInput1Ref}
                        type="file"
                        accept="audio/*"
                          className="hidden"
                        onChange={(e) => handleFileUpload('audioFiles_1', e.target.files?.[0] || null)}
                        />
                        {formData.audioFiles_1 ? (
                          <div
                            className="h-10 px-3 bg-[#F0F4FA] border border-[#E1E9F4] rounded-[10px] flex items-center justify-between cursor-pointer"
                            onClick={() => audioInput1Ref.current?.click()}
                          >
                            <span className="text-gray-700 text-sm truncate">{formData.audioFiles_1.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (audioInput1Ref.current) audioInput1Ref.current.value = '';
                                handleFileUpload('audioFiles_1', null);
                              }}
                              className="ml-2"
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="h-10 px-3 bg-gray-50 border border-[#E1E9F4] rounded-[10px] flex items-center justify-between cursor-pointer"
                            onClick={() => audioInput1Ref.current?.click()}
                          >
                            <span className="text-gray-500 text-sm">Escolher arquivo</span>
                            <Upload className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* phone_number_1 */}
                    <div className="flex items-center gap-4">
                      <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">phone_number_1</span></div>
                      <Input
                        value={formData.phone_number_1}
                        onChange={(e) => handleInputChange('phone_number_1', e.target.value)}
                        placeholder="5511999999999"
                        className="flex-1 h-10 px-3 bg-white border border-[#E1E9F4] rounded-[10px]"
                      />
                    </div>
                    
                    {/* metadata_1 */}
                    <div className="flex items-start gap-4">
                      <div className="w-40 flex"><span className="inline-flex px-2 h-7 bg-slate-200 rounded-md items-center text-slate-500 text-sm font-mono">metadata_1</span></div>
                      <div className="relative flex-1" style={{height:'31.5px',minHeight:'31.5px'}}>
                      <Textarea
                        value={formData.metadata_1}
                        onChange={(e) => handleInputChange('metadata_1', e.target.value)}
                          placeholder="{...}"
                          style={{height:'31.5px',minHeight:'31.5px',whiteSpace:'nowrap',overflow:'hidden'}}
                          onFocus={(e)=>{
                            const t=e.currentTarget;
                            t.style.position='absolute';
                            t.style.zIndex='50';
                            t.style.left='0';
                            t.style.right='0';
                            t.style.height='150px';
                            t.style.whiteSpace='pre-wrap';
                            t.style.overflow='auto';
                          }}
                          onBlur={(e)=>{
                            const t=e.currentTarget;
                            t.style.position='static';
                            t.style.height='31.5px';
                            t.style.whiteSpace='nowrap';
                            t.style.overflow='hidden';
                          }}
                          className="w-full resize-none bg-white rounded-[10px]"
                      />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#e1e9f4]">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#3057f2] hover:bg-[#2547d9] text-white font-medium"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar teste'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Column - Code & Response */}
        <div className="col-span-12 xl:col-span-6 flex flex-col space-y-2">
          {/* Code Generation */}
          <h3 className="text-[#373753] text-lg font-semibold">Requisição</h3>
          <Card className="bg-[#24272D] border border-[#33353D] rounded-xl shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
            <div className="p-4 sm:p-2">
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(['curl', 'python', 'javascript', 'php'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`h-14 px-4 text-base font-medium transition-colors ${
                      activeLang === lang
                        ? 'text-[#EBEBEB] border-b-2 border-[#5F87FF]'
                        : 'text-[#C7C7C7]'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <pre className="bg-[#1E1F25] text-[#69DE74] p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap break-words">
                  {generateCodeSample(false)}
                </pre>
                <Button
                  onClick={() => handleCopy(generateCodeSample(true))}
                  variant="outline"
                  size="icon"
                  className={`absolute top-2 right-2 border-white/20 text-white hover:bg-white/20 p-1 transition-colors ${
                    copiedText === 'copied' 
                      ? 'bg-green-600/20 text-green-300' 
                      : 'bg-white/10'
                  }`}
                  title="Copiar código completo com token real"
                >
                  {copiedText === 'copied' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Example Response */}
          <h3 className="text-[#373753] text-lg font-semibold">Possiveis respostas da API</h3>
          <Card className="bg-[#24272D] border border-[#33353D] rounded-xl shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
            <div className="p-4 sm:p-2 space-y-4">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-2">
                {['success','error400','error404'].map(tab=> (
                  <button
                    key={tab}
                    onClick={()=>setExampleTab(tab as 'success'|'error400'|'error404')}
                    className={`h-14 px-4 text-base font-medium transition-colors ${
                      exampleTab===tab ? 'text-white border-b-2 border-[#5F87FF]' : 'text-[#C7C7C7]'
                    }`}
                  >
                    {tab==='success' ? 'Sucesso (200)' : tab==='error400' ? 'Erro (400)' : 'Erro (404)'}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div className="bg-[#1E1F25] rounded-lg p-3 sm:p-4 max-h-96 overflow-y-auto overflow-x-auto">
                <pre className="text-[#69DE74] text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">
{exampleTab==='success' ? `{
  "success": true,
  "batch_id": "batch_1751553398519",
  "batch_name": "NOME_DO_LOTE_AQUI",
  "message": "Análise em lote iniciada com sucesso",
  "files_count": 2,
  "files_valid": 2,
  "files_invalid": 0,
  "status": "processing",
  "webhook_url": "https://webhook.site/seu-id-unico",
  "validation_summary": {
    "total_files": 2,
    "valid_files": 2,
    "invalid_files": 0
  }
}` : exampleTab==='error400' ? `{
  "success": false,
  "error": "Parâmetros obrigatórios ausentes",
  "missing_fields": ["criteria", "audioFiles_0", "phone_number_0"],
  "message": "Falha na validação dos parâmetros",
  "status": 400
}` : `{
  "success": false,
  "error": "Recurso não encontrado",
  "message": "Endpoint não encontrado",
  "status": 404
}`}
                </pre>
              </div>
            </div>
          </Card>
          
          {/* API Response - moved to bottom */}
          {apiResponse && (
            <>
              <h3 className="text-[#373753] text-lg font-semibold">Resposta da API</h3>
              <Card className="bg-[#24272D] border border-[#33353D] rounded-xl shadow-[0px_12px_24px_0px_rgba(18,38,63,0.03)]">
                <div className="p-4 sm:p-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#C7C7C7]">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      apiResponse.status === 200 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {apiResponse.status}
                    </span>
                  </div>
                  
                  <div className="bg-[#1E1F25] rounded-lg p-3 sm:p-4 max-h-96 overflow-y-auto overflow-x-auto">
                    <pre className="text-[#69DE74] text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(apiResponse.data, null, 2)}
                    </pre>
                </div>
              </div>
            </Card>
            </>
          )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export function ConfiguracoesPage() {
  return (
    <div className="bg-[#f9fafc] min-h-screen w-full overflow-x-hidden">
      <div className="px-4 sm:px-6 pt-0 pb-6 space-y-6 w-full max-w-full">
        <BatchAnalysisDocumentation />
      </div>
    </div>
  );
}
