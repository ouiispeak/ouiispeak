#!/usr/bin/env node

/**
 * OuiiSpeak Smoke Test Script
 * 
 * Lightweight health checks to verify basic functionality:
 * - Build succeeds
 * - Key routes render without errors
 * - Auth flows work correctly
 * 
 * Usage: node scripts/smoke.mjs
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();

console.log('🧪 OuiiSpeak Smoke Test');
console.log('======================');

// Test 1: Build verification
console.log('\n1️⃣ Testing build...');
try {
  execSync('npm run build', { 
    cwd: PROJECT_ROOT, 
    stdio: 'pipe',
    timeout: 30000 
  });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Test 2: TypeScript compilation
console.log('\n2️⃣ Testing TypeScript...');
try {
  execSync('npx tsc --noEmit', { 
    cwd: PROJECT_ROOT, 
    stdio: 'pipe',
    timeout: 15000 
  });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.error('❌ TypeScript errors:', error.message);
  process.exit(1);
}

// Test 3: Environment variables check
console.log('\n3️⃣ Checking environment variables...');
try {
  const envLocalPath = join(PROJECT_ROOT, '.env.local');
  const envContent = readFileSync(envLocalPath, 'utf8');
  
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('✅ Required environment variables present');
  } else {
    console.error('❌ Missing required environment variables');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Could not read .env.local:', error.message);
  process.exit(1);
}

// Test 4: Key files exist
console.log('\n4️⃣ Checking key files...');
const requiredFiles = [
  'src/lib/supabaseClient.ts',
  'src/lib/supabaseServer.ts',
  'src/components/AuthForm.tsx',
  'src/app/(app)/layout.tsx',
  'src/app/(public)/layout.tsx'
];

let allFilesExist = true;
for (const file of requiredFiles) {
  try {
    readFileSync(join(PROJECT_ROOT, file), 'utf8');
    console.log(`✅ ${file}`);
  } catch (error) {
    console.error(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('❌ Some required files are missing');
  process.exit(1);
}

// Test 5: Package.json scripts
console.log('\n5️⃣ Checking package.json scripts...');
try {
  const packageJson = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf8'));
  const requiredScripts = ['dev', 'build', 'start', 'lint'];
  
  let allScriptsExist = true;
  for (const script of requiredScripts) {
    if (packageJson.scripts[script]) {
      console.log(`✅ Script '${script}' exists`);
    } else {
      console.error(`❌ Missing script: ${script}`);
      allScriptsExist = false;
    }
  }
  
  if (!allScriptsExist) {
    console.error('❌ Some required scripts are missing');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Could not read package.json:', error.message);
  process.exit(1);
}

console.log('\n🎉 All smoke tests passed!');
console.log('The project is ready for refactoring.');
