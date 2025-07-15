// Teste para verificar se o regex está detectando URLs corretamente
const testKeys = [
  'audioUrls_0',
  'audioUris_0', 
  'audioUrl0',
  'audioUri0',
  'audioFiles_0',
  'metadata_0',
  'phone_number_0',
  'batch_name',
  'criteria',
  'webhook'
];

console.log('🧪 Testando detecção de URLs...');

const patterns = [
  /^audioUris?_(\d+)$/,  // audioUrls_ ou audioUris_
  /^audioUrls_(\d+)$/,   // apenas audioUrls_
  /^audioUris_(\d+)$/,   // apenas audioUris_
  /^audioUrl(\d+)$/,     // audioUrl sem underscore
  /^audioUri(\d+)$/      // audioUri sem underscore
];

testKeys.forEach(key => {
  console.log(`\n🔍 Testando chave: "${key}"`);
  
  let matched = false;
  for (let i = 0; i < patterns.length; i++) {
    const urlMatch = key.match(patterns[i]);
    if (urlMatch) {
      const index = parseInt(urlMatch[1]);
      console.log(`✅ URL ${index} encontrada com padrão ${i}: ${patterns[i]}`);
      matched = true;
      break;
    }
  }
  
  if (!matched) {
    console.log(`❌ Chave "${key}" não corresponde a nenhum padrão de URL`);
  }
});

console.log('\n📋 Resumo dos padrões:');
patterns.forEach((pattern, i) => {
  console.log(`  ${i}: ${pattern}`);
}); 