#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Quick Deploy - Jogo da Memória Tributária');
console.log('===========================================\n');

// Verificar se está no diretório correto
if (!fs.existsSync('package.json')) {
    console.log('❌ Execute este script na raiz do projeto!');
    process.exit(1);
}

// Função para executar comandos
function runCommand(command, description) {
    try {
        console.log(`🔄 ${description}...`);
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} - Concluído\n`);
    } catch (error) {
        console.log(`❌ Erro em: ${description}`);
        console.log(error.message);
        process.exit(1);
    }
}

// Criar arquivos necessários para deploy
function createDeployFiles() {
    console.log('📄 Criando arquivos de configuração...');

    // Procfile
    fs.writeFileSync('Procfile', 'web: node server.js');

    // railway.json
    const railwayConfig = {
        "$schema": "https://railway.app/railway.schema.json",
        "build": {
            "builder": "NIXPACKS"
        },
        "deploy": {
            "startCommand": "node src/server.js",
            "healthcheckPath": "/health",
            "healthcheckTimeout": 100,
            "restartPolicyType": "ON_FAILURE",
            "restartPolicyMaxRetries": 10
        }
    };
    fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));

    // render.yaml
    const renderConfig = `services:
  - type: web
    name: jogo-memoria-tributaria
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node src/server.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production`;
    fs.writeFileSync('render.yaml', renderConfig);

    // Atualizar package.json com engines
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.engines) {
        packageJson.engines = {
            "node": "18.x",
            "npm": "9.x"
        };
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ package.json atualizado com engines');
    }

    // .gitignore
    if (!fs.existsSync('.gitignore')) {
        const gitignore = `node_modules/
*.db
*.sqlite
*.sqlite3
.env
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vercel`;
        fs.writeFileSync('.gitignore', gitignore);
    }

    console.log('✅ Arquivos de configuração criados!\n');
}

// Menu principal
function showMenu() {
    console.log('📋 Escolha uma opção:');
    console.log('1) 🚂 Railway.app (Recomendado)');
    console.log('2) 🎨 Render.com');
    console.log('3) ⚡ Vercel');
    console.log('4) 📦 Apenas preparar arquivos');
    console.log('5) 🧪 Testar localmente');
    console.log('0) ❌ Sair\n');

    // Simular input em Node.js
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Digite sua escolha (0-5): ', (choice) => {
        rl.close();
        handleChoice(choice);
    });
}

function handleChoice(choice) {
    createDeployFiles();

    switch (choice) {
        case '1':
            deployRailway();
            break;
        case '2':
            deployRender();
            break;
        case '3':
            deployVercel();
            break;
        case '4':
            prepareOnly();
            break;
        case '5':
            testLocally();
            break;
        case '0':
            console.log('👋 Até logo!');
            break;
        default:
            console.log('❌ Opção inválida!');
            showMenu();
    }
}

function deployRailway() {
    console.log('🚂 Preparando deploy para Railway...\n');

    try {
        // Verificar se o Git está inicializado
        if (!fs.existsSync('.git')) {
            runCommand('git init', 'Inicializando Git');
        }

        runCommand('git add .', 'Adicionando arquivos ao Git');
        runCommand('git commit -m "Prepare for Railway deployment"', 'Fazendo commit');

        console.log('📝 Próximos passos para Railway:');
        console.log('1. Acesse: https://railway.app');
        console.log('2. Conecte sua conta GitHub');
        console.log('3. Clique "New Project" → "Deploy from GitHub repo"');
        console.log('4. Selecione este repositório');
        console.log('5. Deploy automático!\n');

        console.log('💡 Ou instale o Railway CLI:');
        console.log('   npm install -g @railway/cli');
        console.log('   railway login');
        console.log('   railway init');
        console.log('   railway up\n');

        console.log('🔗 URL esperada: https://jogo-tributario-production.up.railway.app');

    } catch (error) {
        console.log('⚠️ Configuração manual necessária');
    }
}

function deployRender() {
    console.log('🎨 Preparando deploy para Render...\n');

    try {
        if (!fs.existsSync('.git')) {
            runCommand('git init', 'Inicializando Git');
        }

        runCommand('git add .', 'Adicionando arquivos ao Git');
        runCommand('git commit -m "Prepare for Render deployment"', 'Fazendo commit');

        console.log('📝 Próximos passos para Render:');
        console.log('1. Acesse: https://render.com');
        console.log('2. Clique "New" → "Web Service"');
        console.log('3. Conecte GitHub e selecione este repo');
        console.log('4. Configure:');
        console.log('   - Build Command: npm install');
        console.log('   - Start Command: node server.js');
        console.log('   - Plan: Free');
        console.log('5. Deploy!\n');

        console.log('🔗 URL esperada: https://jogo-memoria-tributaria.onrender.com');

    } catch (error) {
        console.log('⚠️ Configuração manual necessária');
    }
}

function deployVercel() {
    console.log('⚡ Preparando deploy para Vercel...\n');

    try {
        // Instalar Vercel CLI se não estiver instalado
        try {
            execSync('vercel --version', { stdio: 'ignore' });
        } catch {
            console.log('📦 Instalando Vercel CLI...');
            runCommand('npm install -g vercel', 'Instalando Vercel CLI');
        }

        runCommand('vercel', 'Fazendo deploy no Vercel');

        console.log('✅ Deploy no Vercel concluído!');

    } catch (error) {
        console.log('⚠️ Erro no deploy automático do Vercel');
        console.log('💡 Tente manualmente:');
        console.log('   npm install -g vercel');
        console.log('   vercel');
    }
}

function prepareOnly() {
    console.log('📦 Arquivos preparados para deploy manual!\n');

    console.log('📝 Arquivos criados:');
    console.log('   ✅ Procfile');
    console.log('   ✅ railway.json');
    console.log('   ✅ render.yaml');
    console.log('   ✅ .gitignore');
    console.log('   ✅ package.json (atualizado)\n');

    console.log('🚀 Você pode agora:');
    console.log('1. Fazer upload manual para qualquer plataforma');
    console.log('2. Usar Git para deploy automático');
    console.log('3. Seguir os guias específicos de cada plataforma');
}

function testLocally() {
    console.log('🧪 Testando aplicação localmente...\n');

    try {
        // Verificar se dependências estão instaladas
        if (!fs.existsSync('node_modules')) {
            runCommand('npm install', 'Instalando dependências');
        }

        console.log('🎮 Iniciando servidor local...');
        console.log('📱 Acesse: http://localhost:3000');
        console.log('⏹️  Pressione Ctrl+C para parar\n');

        runCommand('npm start', 'Servidor rodando');

    } catch (error) {
        console.log('❌ Erro ao iniciar servidor local');
        console.log('💡 Verifique se todas as dependências estão instaladas');
    }
}

// Executar menu principal
showMenu();