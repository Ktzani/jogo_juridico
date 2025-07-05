#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('🔧 Corrigindo problemas do npm...');
console.log('=================================\n');

// Verificar se está no diretório correto
if (!fs.existsSync('package.json')) {
    console.log('❌ package.json não encontrado!');
    console.log('   Execute este script na raiz do projeto.');
    process.exit(1);
}

function runCommand(command, description, ignoreError = false) {
    try {
        console.log(`🔄 ${description}...`);
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} - Concluído\n`);
        return true;
    } catch (error) {
        if (ignoreError) {
            console.log(`⚠️ ${description} - Ignorado\n`);
            return false;
        } else {
            console.log(`❌ Erro em: ${description}`);
            console.log(error.message);
            return false;
        }
    }
}

function fixPackageJson() {
    console.log('📝 Verificando package.json...');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        // Remover node-fetch das devDependencies se existir
        if (packageJson.devDependencies && packageJson.devDependencies['node-fetch']) {
            delete packageJson.devDependencies['node-fetch'];
            console.log('🗑️ Removido node-fetch das devDependencies');
        }
        
        // Garantir que as dependências essenciais estejam corretas
        packageJson.dependencies = {
            "express": "^4.18.2",
            "sqlite3": "^5.1.6",
            "cors": "^2.8.5",
            "body-parser": "^1.20.2"
        };
        
        packageJson.devDependencies = {
            "nodemon": "^3.0.1"
        };
        
        // Atualizar engines
        packageJson.engines = {
            "node": "18.x",
            "npm": "9.x"
        };
        
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ package.json corrigido\n');
        
    } catch (error) {
        console.log('⚠️ Erro ao corrigir package.json:', error.message);
    }
}

function cleanFiles() {
    console.log('🧹 Limpando arquivos antigos...');
    
    // Remover node_modules
    if (fs.existsSync('node_modules')) {
        console.log('🗑️ Removendo node_modules...');
        try {
            if (os.platform() === 'win32') {
                execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
            } else {
                execSync('rm -rf node_modules', { stdio: 'inherit' });
            }
            console.log('✅ node_modules removido');
        } catch (error) {
            console.log('⚠️ Erro ao remover node_modules (continue assim mesmo)');
        }
    }
    
    // Remover package-lock.json
    if (fs.existsSync('package-lock.json')) {
        console.log('🗑️ Removendo package-lock.json...');
        fs.unlinkSync('package-lock.json');
        console.log('✅ package-lock.json removido');
    }
    
    // Remover yarn.lock se existir
    if (fs.existsSync('yarn.lock')) {
        console.log('🗑️ Removendo yarn.lock...');
        fs.unlinkSync('yarn.lock');
        console.log('✅ yarn.lock removido');
    }
    
    console.log('');
}

function showSystemInfo() {
    console.log('📋 Informações do sistema:');
    console.log(`SO: ${os.platform()} ${os.arch()}`);
    
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(`Node.js: ${nodeVersion}`);
    } catch (error) {
        console.log('Node.js: ❌ Não encontrado');
    }
    
    try {
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        console.log(`npm: ${npmVersion}`);
    } catch (error) {
        console.log('npm: ❌ Não encontrado');
    }
    
    console.log('');
}

function main() {
    showSystemInfo();
    
    // Corrigir package.json primeiro
    fixPackageJson();
    
    // Limpar arquivos
    cleanFiles();
    
    // Limpar cache
    runCommand('npm cache clean --force', 'Limpando cache do npm', true);
    
    // Reinstalar dependências
    console.log('📦 Instalando dependências...');
    const installSuccess = runCommand('npm install', 'Instalando dependências');
    
    if (installSuccess) {
        console.log('🎉 Problemas corrigidos com sucesso!\n');
        
        console.log('🧪 Para testar a aplicação:');
        console.log('   npm start');
        console.log('   Acesse: http://localhost:3000\n');
        
        console.log('🚀 Para fazer deploy:');
        console.log('   npm run deploy\n');
        
        // Perguntar se quer testar (simulado - seria melhor com readline)
        console.log('✅ Pronto para usar!');
        
    } else {
        console.log('❌ Erro ao instalar dependências!\n');
        
        console.log('💡 Possíveis soluções:');
        console.log('1. Verificar conexão com internet');
        console.log('2. Atualizar npm: npm install -g npm@latest');
        console.log('3. Usar Node.js versão 18 ou superior');
        console.log('4. Tentar com yarn: npm install -g yarn && yarn install\n');
        
        console.log('🔧 Para debug detalhado:');
        console.log('   npm config list');
        console.log('   npm doctor');
    }
}

// Executar correção
main();