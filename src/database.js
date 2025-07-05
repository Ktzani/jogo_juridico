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
        // Tabela principal de jogadores
        const createPlayersTableSQL = `
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

        // Tabela de tipos de dores/problemas
        const createPainPointsTableSQL = `
            CREATE TABLE IF NOT EXISTS pain_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Tabela de relacionamento many-to-many entre players e pain_points
        const createPlayerPainPointsTableSQL = `
            CREATE TABLE IF NOT EXISTS player_pain_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER NOT NULL,
                pain_point_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players (id) ON DELETE CASCADE,
                FOREIGN KEY (pain_point_id) REFERENCES pain_points (id) ON DELETE CASCADE,
                UNIQUE(player_id, pain_point_id)
            )
        `;

        // Criar tabelas em sequência
        db.run(createPlayersTableSQL, (err) => {
            if (err) {
                console.error('Erro ao criar tabela players:', err);
                reject(err);
                return;
            }
            console.log('✅ Tabela players criada/verificada');

            db.run(createPainPointsTableSQL, (err) => {
                if (err) {
                    console.error('Erro ao criar tabela pain_points:', err);
                    reject(err);
                    return;
                }
                console.log('✅ Tabela pain_points criada/verificada');

                db.run(createPlayerPainPointsTableSQL, (err) => {
                    if (err) {
                        console.error('Erro ao criar tabela player_pain_points:', err);
                        reject(err);
                        return;
                    }
                    console.log('✅ Tabela player_pain_points criada/verificada');

                    // Inserir pain points padrão
                    insertDefaultPainPoints().then(resolve).catch(reject);
                });
            });
        });
    });
}

// Inserir pain points padrão se não existirem
function insertDefaultPainPoints() {
    return new Promise((resolve, reject) => {
        const defaultPainPoints = [
            'Dívidas com a Receita/PGFN',
            'Execuções fiscais em andamento',
            'Recuperação de tributos pagos indevidamente',
            'Planejamento tributário',
            'Registrar minha marca',
            'Abertura ou reestruturação societária',
            'Holding Familiar',
            'Outro'
        ];

        const insertSQL = `INSERT OR IGNORE INTO pain_points (name) VALUES (?)`;
        
        let completed = 0;
        const total = defaultPainPoints.length;

        if (total === 0) {
            resolve();
            return;
        }

        defaultPainPoints.forEach(painPoint => {
            db.run(insertSQL, [painPoint], (err) => {
                if (err) {
                    console.error('Erro ao inserir pain point:', err);
                    reject(err);
                    return;
                }
                
                completed++;
                if (completed === total) {
                    console.log('✅ Pain points padrão inseridos/verificados');
                    resolve();
                }
            });
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

        // Primeiro, inserir o jogador
        const insertPlayerSQL = `
            INSERT INTO players (
                cnpj, nome, email, telefone, cargo, instagram,
                regime_tributario, faturamento,
                score, moves, time, final_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertPlayerSQL, [
            cnpj, nome, email, telefone, cargo, instagram,
            regime, faturamento, score, moves, time, finalScore
        ], function(err) {
            if (err) {
                console.error('Erro ao salvar jogador:', err);
                reject(err);
                return;
            }

            const playerId = this.lastID;
            console.log(`✅ Jogador salvo com ID: ${playerId}`);

            // Processar as dores selecionadas
            if (dor && dor.trim()) {
                const selectedPains = dor.split(',').map(p => p.trim()).filter(p => p);
                savePainPointsForPlayer(playerId, selectedPains)
                    .then(() => resolve(playerId))
                    .catch(reject);
            } else {
                resolve(playerId);
            }
        });
    });
}

// Salvar pain points para um jogador específico
function savePainPointsForPlayer(playerId, painPointNames) {
    return new Promise((resolve, reject) => {
        if (!painPointNames || painPointNames.length === 0) {
            resolve();
            return;
        }

        // Buscar IDs dos pain points pelo nome
        const placeholders = painPointNames.map(() => '?').join(',');
        const selectPainPointsSQL = `SELECT id, name FROM pain_points WHERE name IN (${placeholders})`;

        db.all(selectPainPointsSQL, painPointNames, (err, painPoints) => {
            if (err) {
                console.error('Erro ao buscar pain points:', err);
                reject(err);
                return;
            }

            if (painPoints.length === 0) {
                console.log('Nenhum pain point encontrado');
                resolve();
                return;
            }

            // Inserir relacionamentos
            const insertRelationSQL = `INSERT OR IGNORE INTO player_pain_points (player_id, pain_point_id) VALUES (?, ?)`;
            let completed = 0;
            const total = painPoints.length;

            painPoints.forEach(painPoint => {
                db.run(insertRelationSQL, [playerId, painPoint.id], (err) => {
                    if (err) {
                        console.error('Erro ao salvar relacionamento:', err);
                        reject(err);
                        return;
                    }

                    completed++;
                    if (completed === total) {
                        console.log(`✅ ${total} pain points salvos para jogador ${playerId}`);
                        resolve();
                    }
                });
            });
        });
    });
}

// Buscar todos os jogadores
function getAllPlayers() {
    return new Promise((resolve, reject) => {
        const selectSQL = `
            SELECT 
                p.id, p.cnpj, p.nome, p.email, p.telefone, p.cargo, p.instagram,
                p.regime_tributario as regime, p.faturamento,
                p.score, p.moves, p.time, p.final_score as finalScore,
                p.created_at as timestamp,
                DATE(p.created_at) as date,
                p.completed_at
            FROM players p 
            ORDER BY p.score DESC, p.moves ASC, p.time ASC
        `;

        db.all(selectSQL, [], async (err, players) => {
            if (err) {
                console.error('Erro ao buscar jogadores:', err);
                reject(err);
                return;
            }

            try {
                // Para cada jogador, buscar suas dores
                const playersWithPainPoints = await Promise.all(
                    players.map(player => getPainPointsForPlayer(player))
                );
                
                resolve(playersWithPainPoints);
            } catch (error) {
                console.error('Erro ao buscar pain points dos jogadores:', error);
                reject(error);
            }
        });
    });
}

// Buscar pain points para um jogador específico
function getPainPointsForPlayer(player) {
    return new Promise((resolve, reject) => {
        const selectPainPointsSQL = `
            SELECT pp.name 
            FROM pain_points pp
            INNER JOIN player_pain_points ppp ON pp.id = ppp.pain_point_id
            WHERE ppp.player_id = ?
            ORDER BY pp.name
        `;

        db.all(selectPainPointsSQL, [player.id], (err, painPoints) => {
            if (err) {
                console.error('Erro ao buscar pain points do jogador:', err);
                reject(err);
                return;
            }

            // Adicionar as dores ao objeto do jogador
            player.dor = painPoints.map(pp => pp.name).join(', ');
            player.painPoints = painPoints.map(pp => pp.name);
            
            resolve(player);
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

// Exportar funções e adicionar novas funções analíticas
module.exports = {
    initDatabase,
    savePlayer,
    getAllPlayers,
    getPlayerStats,
    getPlayerById,
    updatePlayerScore,
    getDatabase,
    closeDatabase,
    getPainPointsAnalysis,
    getAllPainPoints,
    getTopPainPoints
};

// Buscar análise das dores mais comuns
function getPainPointsAnalysis() {
    return new Promise((resolve, reject) => {
        const analysisSQL = `
            SELECT 
                pp.name,
                COUNT(ppp.player_id) as count,
                ROUND(COUNT(ppp.player_id) * 100.0 / (SELECT COUNT(DISTINCT player_id) FROM player_pain_points), 2) as percentage
            FROM pain_points pp
            LEFT JOIN player_pain_points ppp ON pp.id = ppp.pain_point_id
            GROUP BY pp.id, pp.name
            ORDER BY count DESC, pp.name
        `;

        db.all(analysisSQL, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar análise de pain points:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Buscar todos os pain points disponíveis
function getAllPainPoints() {
    return new Promise((resolve, reject) => {
        const selectSQL = `SELECT id, name, description FROM pain_points ORDER BY name`;

        db.all(selectSQL, [], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar pain points:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Buscar top N pain points mais selecionados
function getTopPainPoints(limit = 5) {
    return new Promise((resolve, reject) => {
        const topSQL = `
            SELECT 
                pp.name,
                COUNT(ppp.player_id) as count,
                ROUND(COUNT(ppp.player_id) * 100.0 / (SELECT COUNT(DISTINCT player_id) FROM player_pain_points), 2) as percentage
            FROM pain_points pp
            INNER JOIN player_pain_points ppp ON pp.id = ppp.pain_point_id
            GROUP BY pp.id, pp.name
            ORDER BY count DESC
            LIMIT ?
        `;

        db.all(topSQL, [limit], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar top pain points:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}