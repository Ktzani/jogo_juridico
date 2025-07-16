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
        // Tabela simplificada de jogadores
        const createPlayersTableSQL = `
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cnpj TEXT NOT NULL,
                nome TEXT NOT NULL,
                email TEXT NOT NULL,
                telefone TEXT NOT NULL,
                instagram TEXT NOT NULL,
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

        db.run(createPlayersTableSQL, (err) => {
            if (err) {
                console.error('Erro ao criar tabela players:', err);
                reject(err);
                return;
            }
            console.log('✅ Tabela players criada/verificada');
            resolve();
        });
    });
}

// Salvar jogador
function savePlayer(playerData) {
    return new Promise((resolve, reject) => {
        const {
            cnpj, nome, email, telefone, instagram,
            score = 0, moves = 0, time = 0, finalScore = 0
        } = playerData;

        const insertPlayerSQL = `
            INSERT INTO players (
                cnpj, nome, email, telefone, instagram,
                score, moves, time, final_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertPlayerSQL, [
            cnpj, nome, email, telefone, instagram,
            score, moves, time, finalScore
        ], function(err) {
            if (err) {
                console.error('Erro ao salvar jogador:', err);
                reject(err);
                return;
            }

            const playerId = this.lastID;
            console.log(`✅ Jogador salvo com ID: ${playerId}`);
            resolve(playerId);
        });
    });
}

// Buscar todos os jogadores
function getAllPlayers() {
    return new Promise((resolve, reject) => {
        const selectSQL = `
            SELECT 
                id, cnpj, nome, email, telefone, instagram,
                score, moves, time, final_score as finalScore,
                created_at as timestamp,
                DATE(created_at) as date,
                completed_at
            FROM players 
            ORDER BY score DESC, moves ASC, time ASC
        `;

        db.all(selectSQL, [], (err, players) => {
            if (err) {
                console.error('Erro ao buscar jogadores:', err);
                reject(err);
                return;
            }

            resolve(players);
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
        const selectSQL = `
            SELECT * FROM players WHERE id = ?
        `;

        db.get(selectSQL, [id], (err, row) => {
            if (err) {
                console.error('Erro ao buscar jogador:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Atualizar pontuação do jogador
function updatePlayerScore(id, scoreData) {
    return new Promise((resolve, reject) => {
        const { score, moves, time, finalScore } = scoreData;
        
        const updateSQL = `
            UPDATE players 
            SET score = ?, moves = ?, time = ?, final_score = ?, 
                completed_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;

        db.run(updateSQL, [score, moves, time, finalScore, id], function(err) {
            if (err) {
                console.error('Erro ao atualizar pontuação:', err);
                reject(err);
            } else {
                console.log(`✅ Pontuação atualizada para jogador ID: ${id}`);
                resolve(this.changes);
            }
        });
    });
}

// Exportar instância do banco para uso direto se necessário
function getDatabase() {
    return db;
}

// Fechar conexão com banco
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Erro ao fechar banco:', err);
                    reject(err);
                } else {
                    console.log('✅ Conexão com banco fechada');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

// Tratamento de encerramento do processo
process.on('SIGINT', () => {
    console.log('\n🔄 Encerrando aplicação...');
    closeDatabase().then(() => {
        process.exit(0);
    });
});

// Limpar todos os dados (função admin)
function clearAllData() {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM players', function(err) {
            if (err) {
                reject(err);
            } else {
                console.log(`✅ ${this.changes} jogadores removidos`);
                resolve(this.changes);
            }
        });
    });
}

// Resetar pontuações (manter jogadores, limpar apenas scores)
function resetScores() {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE players SET 
                     score = 0, moves = 0, time = 0, final_score = 0, 
                     completed_at = NULL`;

        db.run(sql, function(err) {
            if (err) {
                reject(err);
            } else {
                console.log(`✅ Pontuações resetadas para ${this.changes} jogadores`);
                resolve(this.changes);
            }
        });
    });
}

// Remover jogador específico
function removePlayer(playerId) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM players WHERE id = ?', [playerId], function(err) {
            if (err) {
                reject(err);
            } else {
                console.log(`✅ Jogador ${playerId} removido`);
                resolve(this.changes);
            }
        });
    });
}

module.exports = {
    initDatabase,
    savePlayer,
    getAllPlayers,
    getPlayerStats,
    getPlayerById,
    updatePlayerScore,
    getDatabase,
    closeDatabase,
    clearAllData,
    resetScores,
    removePlayer
};