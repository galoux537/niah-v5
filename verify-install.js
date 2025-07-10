#!/usr/bin/env node

/**
 * Installation verification script for NIAH! project
 * Run with: node verify-install.js
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 NIAH! Installation Verification\n');

// Check package.json
const packagePath = join(__dirname, 'package.json');
if (existsSync(packagePath)) {
  console.log('✅ package.json found');
  try {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    console.log(`   - Project: ${pkg.name}`);
    console.log(`   - Version: ${pkg.version}`);
    console.log(`   - Dependencies: ${Object.keys(pkg.dependencies || {}).length}`);
  } catch (e) {
    console.log('❌ package.json is invalid');
  }
} else {
  console.log('❌ package.json not found');
}

// Check node_modules
const nodeModulesPath = join(__dirname, 'node_modules');
if (existsSync(nodeModulesPath)) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('❌ node_modules not found - run: npm install');
}

// Check essential files
const essentialFiles = [
  'App.tsx',
  'main.tsx',
  'index.html',
  'vite.config.ts',
  'tsconfig.json',
  '.env'
];

console.log('\n📁 Essential Files:');
essentialFiles.forEach(file => {
  if (existsSync(join(__dirname, file))) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Check environment variables
const envPath = join(__dirname, '.env');
if (existsSync(envPath)) {
  console.log('\n🔧 Environment Variables:');
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
    
    console.log(`   ${hasSupabaseUrl ? '✅' : '❌'} VITE_SUPABASE_URL`);
    console.log(`   ${hasSupabaseKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY`);
  } catch (e) {
    console.log('   ❌ Error reading .env file');
  }
} else {
  console.log('\n❌ .env file missing - copy from .env.example');
}

// Check components directory
const componentsPath = join(__dirname, 'components');
if (existsSync(componentsPath)) {
  console.log('\n📦 Components Directory:');
  console.log('   ✅ components/ exists');
  
  // Check for essential components
  const essentialComponents = ['DashboardPage.tsx', 'LoginPage.tsx', 'Header.tsx'];
  essentialComponents.forEach(comp => {
    if (existsSync(join(componentsPath, comp))) {
      console.log(`   ✅ ${comp}`);
    } else {
      console.log(`   ❌ ${comp} missing`);
    }
  });
} else {
  console.log('\n❌ components/ directory missing');
}

console.log('\n🚀 Next Steps:');
console.log('   1. If any files are missing, check the repository');
console.log('   2. Run: npm install');
console.log('   3. Run: npm run dev');
console.log('   4. Open: http://localhost:3000');

console.log('\n📞 Need help? Check QUICK_START.md or README.md');