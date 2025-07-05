#!/bin/bash

echo "🎮 Configurando Jogo da Memória Tributária - Fiscofy"
echo "=================================================="

# Verificar se estamos no diretório correto
if [ ! -f "jogo.html" ]; then
    echo "❌ Arquivo jogo.html não encontrado!"
    echo "   Execute este script no diretório onde está o jogo.html"
    exit 1
fi

echo "📁 Criando estrutura de diretórios..."

# Criar pasta public se não existir
mkdir -p public

# Mover jogo.html para public se ainda não estiver lá
if [ -f "jogo.html" ] && [ ! -f "public/jogo.html" ]; then
    cp jogo.html public/jogo.html
    echo "✅ jogo.html copiado para public/"
fi

echo "📄 Criando package.json..."
cat > package.json << 'EOF'
{
  "name": "jogo-memoria-tributaria-backend",
  "version": "1.0.0",
  "description": "Backend para o Jogo da Memória Tributária - Fiscofy",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "keywords": [
    "nodejs",
    "express",
    "sqlite",
    "game",
    "tributario"
  ],
  "author": "Fiscofy",
  "license": "MIT"
}
EOF

echo "📄 Criando database.js..."
cat > database.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const DB_PATH = path.join(__dirname, 'database/fiscofy_game.db');

let db = null;

// Inicializar banco de dados
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Erro ao conectar com o banco de dados:', err);
                reject(err);
            } else {
                console.log('✅ Conectado ao banco SQLite');
                createTables().then(resolve).catch(reject);
            }
        });
    });
}

// Criar tabelas
function createTables() {
    return new Promise((resolve, reject) => {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cnpj TEXT NOT NULL,
                nome TEXT NOT NULL,
                email TEXT NOT NULL,
                telefone TEXT NOT NULL,
                cargo TEXT NOT NULL,
                instagram TEXT NOT NULL,
                regime_tributario TEXT NOT NULL,
                faturamento TEXT NOT NULL,
                maior_dor TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                moves INTEGER DEFAULT 0,
                time INTEGER DEFAULT 0,
                final_score INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                ip_address TEXT,
                user_agent TEXT
            )
        `;

        db.run(createTableSQL, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err);
                reject(err);
            } else {
                console.log('✅ Tabela players criada/verificada');
                resolve();
            }
        });
    });
}

// Salvar jogador
function savePlayer(playerData) {
    return new Promise((resolve, reject) => {
        const {
            cnpj, nome, email, telefone, cargo, instagram,
            regime, faturamento, dor, score = 0, moves = 0, 
            time = 0, finalScore = 0
        } = playerData;

        const insertSQL = `
            INSERT INTO players (
                cnpj, nome, email, telefone, cargo, instagram,
                regime_tributario, faturamento, maior_dor,
                score, moves, time, final_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertSQL, [
            cnpj, nome, email, telefone, cargo, instagram,
            regime, faturamento, dor, score, moves, time, finalScore
        ], function(err) {
            if (err) {
                console.error('Erro ao salvar jogador:', err);
                reject(err);
            } else {
                console.log(`✅ Jogador salvo com ID: ${this.lastID}`);
                resolve(this.lastID);
            }
        });
    });
}

// Buscar todos os jogadores
function getAllPlayers() {
    return new Promise((resolve, reject) => {
        const selectSQL = `
            SELECT 
                id, cnpj, nome, email, telefone, cargo, instagram,
                regime_tributario as regime, faturamento, maior_dor as dor,
                score, moves, time, final_score as finalScore,
                created_at as timestamp,
                DATE(created_at) as date,
                completed_at
            FROM players 
            ORDER BY score DESC, moves ASC, time ASC
        `;

        db.all(selectSQL, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar jogadores:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Buscar estatísticas gerais
function getPlayerStats() {
    return new Promise((resolve, reject) => {
        const statsSQL = `
            SELECT 
                COUNT(*) as total_players,
                COUNT(CASE WHEN score > 0 THEN 1 END) as completed_games,
                MAX(score) as highest_score,
                AVG(score) as average_score,
                MIN(moves) as best_moves,
                AVG(moves) as average_moves,
                MIN(time) as fastest_time,
                AVG(time) as average_time
            FROM players
        `;

        db.get(statsSQL, [], (err, row) => {
            if (err) {
                console.error('Erro ao buscar estatísticas:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Buscar jogador por ID
function getPlayerById(id) {
    return new Promise((resolve, reject) => {
        const select