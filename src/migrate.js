#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database/fiscofy_game.db');

console.log('🔄 Iniciando migração do banco de dados...\n');

// Verificar se o banco existe
const fs = require('fs');
if (!fs.existsSync(DB_PATH)) {
    console.log('📄 Banco de dados não existe ainda. Nenhuma migração necessária.');
    console.log('✅ Execute npm start para criar o banco com a nova estrutura.');
    process.exit(0);
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar com o banco:', err);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco SQLite');
});

async function runMigration() {
    try {
        // Verificar se já tem a nova estrutura
        const hasNewStructure = await checkNewStructure();
        
        if (hasNewStructure) {
            console.log('✅ Banco já está na nova estrutura. Nenhuma migração necessária.');
            process.exit(0);
        }

        console.log('🔄 Iniciando migração para a nova estrutura...');

        // Fazer backup dos dados antigos
        const oldPlayers = await getOldPlayers();
        console.log(`📊 Encontrados ${oldPlayers.length} jogadores para migrar`);

        // Criar novas tabelas
        await createNewTables();
        
        // Migrar dados
        await migrateData(oldPlayers);
        
        // Remover coluna antiga (opcional)
        await removeOldColumn();
        
        console.log('✅ Migração concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

function checkNewStructure() {
    return new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='pain_points'", (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
}

function getOldPlayers() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM players WHERE maior_dor IS NOT NULL", (err, rows) => {
            if (err) {
                // Se der erro, provavelmente a coluna não existe
                resolve([]);
            } else {
                resolve(rows || []);
            }
        });
    });
}

function createNewTables() {
    return new Promise((resolve, reject) => {
        // Tabela de tipos de dores/problemas
        const createPainPointsTableSQL = `
            CREATE TABLE IF NOT EXISTS pain_points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Tabela de relacionamento many-to-many
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

        db.run(createPainPointsTableSQL, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('✅ Tabela pain_points criada');

            db.run(createPlayerPainPointsTableSQL, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('✅ Tabela player_pain_points criada');

                // Inserir pain points padrão
                insertDefaultPainPoints().then(resolve).catch(reject);
            });
        });
    });
}

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

        defaultPainPoints.forEach(painPoint => {
            db.run(insertSQL, [painPoint], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                completed++;
                if (completed === total) {
                    console.log('✅ Pain points padrão inseridos');
                    resolve();
                }
            });
        });
    });
}

async function migrateData(oldPlayers) {
    console.log('🔄 Migrando dados dos jogadores...');
    
    for (const player of oldPlayers) {
        if (player.maior_dor && player.maior_dor.trim()) {
            const painPointNames = player.maior_dor
                .split(',')
                .map(p => p.trim())
                .filter(p => p);
            
            await savePainPointsForPlayer(player.id, painPointNames);
        }
    }
    
    console.log('✅ Dados migrados com sucesso');
}

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
                reject(err);
                return;
            }

            if (painPoints.length === 0) {
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
                        reject(err);
                        return;
                    }

                    completed++;
                    if (completed === total) {
                        resolve();
                    }
                });
            });
        });
    });
}

function removeOldColumn() {
    return new Promise((resolve, reject) => {
        console.log('🔄 Removendo coluna antiga (maior_dor)...');
        
        // SQLite não suporta DROP COLUMN diretamente, então vamos criar uma nova tabela
        const createNewPlayersTableSQL = `
            CREATE TABLE players_new (
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

        db.run(createNewPlayersTableSQL, (err) => {
            if (err) {
                reject(err);
                return;
            }

            // Copiar dados (exceto maior_dor)
            const copyDataSQL = `
                INSERT INTO players_new 
                SELECT id, cnpj, nome, email, telefone, cargo, instagram, 
                       regime_tributario, faturamento, score, moves, time, 
                       final_score, created_at, completed_at, ip_address, user_agent
                FROM players
            `;

            db.run(copyDataSQL, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Remover tabela antiga e renomear nova
                db.run('DROP TABLE players', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    db.run('ALTER TABLE players_new RENAME TO players', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('✅ Coluna maior_dor removida');
                            resolve();
                        }
                    });
                });
            });
        });
    });
}

// Executar migração
runMigration();