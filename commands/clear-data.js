#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const DB_PATH = path.join("src", 'database/fiscofy_game.db');

console.log('🗑️ Script de Limpeza de Dados - Fiscofy');
console.log('=====================================\n');

// Interface para input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    // Verificar se o banco existe
    if (!fs.existsSync(DB_PATH)) {
        console.log('❌ Banco de dados não encontrado!');
        console.log('💡 Certifique-se de estar no diretório correto do projeto.');
        rl.close();
        return;
    }

    // Conectar ao banco
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ Erro ao conectar com o banco:', err);
            rl.close();
            return;
        }
        console.log('✅ Conectado ao banco SQLite local\n');
    });

    try {
        // Mostrar estatísticas atuais
        await showCurrentStats(db);

        // Menu de opções
        console.log('\n📋 Opções disponíveis:');
        console.log('1) 🔄 Resetar apenas pontuações (manter jogadores)');
        console.log('2) 🗑️ Remover todos os dados');
        console.log('3) 👤 Remover jogador específico');
        console.log('4) 📊 Mostrar estatísticas apenas');
        console.log('0) ❌ Sair\n');

        const choice = await question('Digite sua escolha (0-4): ');

        switch (choice) {
            case '1':
                await resetScores(db);
                break;
            case '2':
                await clearAllData(db);
                break;
            case '3':
                await removeSpecificPlayer(db);
                break;
            case '4':
                await showCurrentStats(db);
                break;
            case '0':
                console.log('👋 Até logo!');
                break;
            default:
                console.log('❌ Opção inválida!');
        }

    } catch (error) {
        console.error('❌ Erro durante a operação:', error);
    } finally {
        db.close();
        rl.close();
    }
}

// Mostrar estatísticas atuais
function showCurrentStats(db) {
    return new Promise((resolve, reject) => {
        console.log('📊 Estatísticas Atuais:');
        console.log('====================');

        const queries = [
            {
                sql: 'SELECT COUNT(*) as total FROM players',
                label: 'Total de jogadores'
            },
            {
                sql: 'SELECT COUNT(*) as completed FROM players WHERE score > 0',
                label: 'Jogos completados'
            },
            {
                sql: 'SELECT MAX(score) as highest FROM players',
                label: 'Maior pontuação'
            },
            {
                sql: 'SELECT AVG(score) as average FROM players WHERE score > 0',
                label: 'Pontuação média'
            }
        ];

        let completed = 0;
        
        queries.forEach(query => {
            db.get(query.sql, (err, row) => {
                if (err) {
                    console.log(`❌ ${query.label}: Erro`);
                } else {
                    const value = Object.values(row)[0];
                    console.log(`📈 ${query.label}: ${value || 0}`);
                }
                
                completed++;
                if (completed === queries.length) {
                    resolve();
                }
            });
        });
    });
}

// Resetar apenas pontuações
async function resetScores(db) {
    console.log('\n🔄 Resetar Pontuações');
    console.log('==================');
    console.log('⚠️ Isso vai resetar todas as pontuações, mas manter os dados de cadastro.');
    
    const confirm = await question('\nTem certeza? Digite "sim" para confirmar: ');
    
    if (confirm.toLowerCase() !== 'sim') {
        console.log('❌ Operação cancelada');
        return;
    }

    return new Promise((resolve, reject) => {
        const sql = `UPDATE players SET 
                     score = 0, moves = 0, time = 0, final_score = 0, 
                     completed_at = NULL`;

        db.run(sql, function(err) {
            if (err) {
                console.error('❌ Erro ao resetar pontuações:', err);
                reject(err);
            } else {
                console.log(`✅ Pontuações resetadas para ${this.changes} jogadores`);
                resolve();
            }
        });
    });
}

// Limpar todos os dados
async function clearAllData(db) {
    console.log('\n🗑️ Limpar Todos os Dados');
    console.log('=======================');
    console.log('⚠️ ATENÇÃO: Isso vai deletar TODOS os jogadores e dados!');
    console.log('⚠️ Esta operação NÃO PODE ser desfeita!');
    
    const confirm1 = await question('\nTem certeza? Digite "DELETAR" (maiúsculo): ');
    
    if (confirm1 !== 'DELETAR') {
        console.log('❌ Operação cancelada');
        return;
    }

    const confirm2 = await question('Última confirmação. Digite "CONFIRMO": ');
    
    if (confirm2 !== 'CONFIRMO') {
        console.log('❌ Operação cancelada');
        return;
    }

    try {
        // Deletar em ordem (foreign keys)
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM player_pain_points', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await new Promise((resolve, reject) => {
            db.run('DELETE FROM players', function(err) {
                if (err) reject(err);
                else {
                    console.log(`✅ ${this.changes} jogadores removidos`);
                    resolve();
                }
            });
        });

        console.log('✅ Todos os dados foram removidos com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao limpar dados:', error);
    }
}

// Remover jogador específico
async function removeSpecificPlayer(db) {
    console.log('\n👤 Remover Jogador Específico');
    console.log('============================');

    // Listar jogadores
    const players = await new Promise((resolve, reject) => {
        db.all('SELECT id, nome, email, score FROM players ORDER BY nome', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    if (players.length === 0) {
        console.log('📭 Nenhum jogador encontrado');
        return;
    }

    console.log('\n📋 Jogadores disponíveis:');
    players.forEach((player, index) => {
        console.log(`${index + 1}) ${player.nome} (${player.email}) - ${player.score} pts`);
    });

    const choice = await question(`\nEscolha um jogador (1-${players.length}) ou 0 para cancelar: `);
    const playerIndex = parseInt(choice) - 1;

    if (choice === '0' || playerIndex < 0 || playerIndex >= players.length) {
        console.log('❌ Operação cancelada');
        return;
    }

    const selectedPlayer = players[playerIndex];
    console.log(`\n⚠️ Remover jogador: ${selectedPlayer.nome} (${selectedPlayer.email})`);
    
    const confirm = await question('Confirmar remoção? Digite "sim": ');
    
    if (confirm.toLowerCase() !== 'sim') {
        console.log('❌ Operação cancelada');
        return;
    }

    try {
        // Remover relacionamentos primeiro
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM player_pain_points WHERE player_id = ?', [selectedPlayer.id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Remover jogador
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM players WHERE id = ?', [selectedPlayer.id], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`✅ Jogador ${selectedPlayer.nome} removido com sucesso!`);

    } catch (error) {
        console.error('❌ Erro ao remover jogador:', error);
    }
}

// Executar script
if (require.main === module) {
    main();
}

module.exports = { showCurrentStats, resetScores, clearAllData, removeSpecificPlayer };