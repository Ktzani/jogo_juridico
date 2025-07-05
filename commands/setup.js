#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎮 Configurando Jogo da Memória Tributária - Fiscofy\n');

// Criar diretório public se não existir
const publicDir = path.join('src', 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
    console.log('✅ Diretório public/ criado');
} else {
    console.log('📁 Diretório public/ já existe');
}

// Verificar se o arquivo jogo.html existe
const jogoHtmlPath = path.join(__dirname, 'jogo.html');
const publicJogoHtmlPath = path.join(publicDir, 'jogo.html');

if (fs.existsSync(jogoHtmlPath)) {
    // Mover jogo.html para public/
    fs.copyFileSync(jogoHtmlPath, publicJogoHtmlPath);
    console.log('✅ jogo.html copiado para public/');
    
    // Remover arquivo original (opcional)
    // fs.unlinkSync(jogoHtmlPath);
    // console.log('🗑️ jogo.html original removido');
} else if (fs.existsSync(publicJogoHtmlPath)) {
    console.log('📄 jogo.html já está em public/');
} else {
    console.log('⚠️ Arquivo jogo.html não encontrado!');
    console.log('   Por favor, coloque o arquivo jogo.html na pasta public/');
}

// Verificar dependências
console.log('\n📦 Verificando dependências...');
const packageJsonPath = path.join(__dirname, 'package.json');

if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredDeps = ['express', 'sqlite3', 'cors', 'body-parser'];
    const installedDeps = Object.keys(packageJson.dependencies || {});
    
    const missingDeps = requiredDeps.filter(dep => !installedDeps.includes(dep));
    
    if (missingDeps.length === 0) {
        console.log('✅ Todas as dependências estão instaladas');
    } else {
        console.log('⚠️ Dependências faltando:', missingDeps.join(', '));
        console.log('   Execute: npm install');
    }
} else {
    console.log('⚠️ package.json não encontrado!');
}

// Verificar estrutura de arquivos
console.log('\n📋 Verificando estrutura do projeto...');
const requiredFiles = [
    'server.js',
    'database.js',
    'package.json'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - FALTANDO!`);
    }
});

// Informações de como executar
console.log('\n🚀 Como executar o projeto:');
console.log('   1. npm install (se ainda não executou)');
console.log('   2. npm start ou npm run dev');
console.log('   3. Acesse: http://localhost:3000');

console.log('\n🎯 Funcionalidades:');
console.log('   • Cadastro de jogadores');
console.log('   • Jogo da memória tributária');
console.log('   • Ranking em tempo real');
console.log('   • Modo administrador (toque 5x no título)');

console.log('\n💡 Dicas:');
console.log('   • Para modo admin: Toque 5x no título ou Ctrl+Shift+F');
console.log('   • O banco SQLite será criado automaticamente');
console.log('   • Logs do servidor aparecem no terminal');

console.log('\n✨ Setup concluído! Boa sorte com o projeto!');