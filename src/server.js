const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { 
    initDatabase, 
    savePlayer, 
    getAllPlayers, 
    getPlayerStats, 
    clearAllData, 
    resetScores, 
    removePlayer 
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações para produção
if (process.env.NODE_ENV === 'production') {
    // Trust proxy headers (para HTTPS)
    app.set('trust proxy', 1);
    
    // Security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
}

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar banco de dados
initDatabase();

// Rota principal - servir o jogo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jogo.html'));
});

// Rota para painel admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});

// API Routes

// Salvar dados do jogador
app.post('/api/players', async (req, res) => {
    try {
        const playerData = req.body;
        
        // Validação básica dos campos obrigatórios
        if (!playerData.nome || !playerData.email || !playerData.cnpj || !playerData.telefone || !playerData.instagram) {
            return res.status(400).json({ 
                error: 'Dados obrigatórios não fornecidos (nome, email, cnpj, telefone, instagram)' 
            });
        }

        // Salvar no banco
        const playerId = await savePlayer(playerData);
        
        res.status(201).json({ 
            success: true, 
            message: 'Jogador salvo com sucesso!',
            playerId: playerId 
        });
    } catch (error) {
        console.error('Erro ao salvar jogador:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao salvar jogador' 
        });
    }
});

// Buscar todos os jogadores
app.get('/api/players', async (req, res) => {
    try {
        const players = await getAllPlayers();
        res.json({ 
            success: true, 
            players: players 
        });
    } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao buscar jogadores' 
        });
    }
});

// Buscar estatísticas
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await getPlayerStats();
        res.json({ 
            success: true, 
            stats: stats 
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao buscar estatísticas' 
        });
    }
});

// Buscar ranking (jogadores ordenados por pontuação)
app.get('/api/ranking', async (req, res) => {
    try {
        const players = await getAllPlayers();
        // Filtrar apenas jogadores que completaram o jogo e ordenar por pontuação
        const ranking = players
            .filter(player => player.score && player.score > 0)
            .sort((a, b) => b.score - a.score);
        
        res.json({ 
            success: true, 
            ranking: ranking 
        });
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao buscar ranking' 
        });
    }
});

// Atualizar pontuação do jogador
app.put('/api/players/:id/score', async (req, res) => {
    try {
        const playerId = req.params.id;
        const { score, moves, time, finalScore } = req.body;
        
        const db = require('./database').getDatabase();
        
        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE players SET 
                 score = ?, moves = ?, time = ?, final_score = ?, 
                 completed_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [score, moves, time, finalScore, playerId],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
        
        res.json({ 
            success: true, 
            message: 'Pontuação atualizada com sucesso!' 
        });
    } catch (error) {
        console.error('Erro ao atualizar pontuação:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao atualizar pontuação' 
        });
    }
});

// ADMIN ENDPOINTS - Para gerenciar dados

// Limpar todos os dados (CUIDADO!)
app.delete('/api/admin/clear-all', async (req, res) => {
    try {
        const { confirmToken } = req.body;
        
        // Token de segurança simples
        if (confirmToken !== 'FISCOFY_CLEAR_2025') {
            return res.status(401).json({ 
                error: 'Token de confirmação inválido' 
            });
        }

        const deletedCount = await clearAllData();
        console.log('🗑️ Todos os dados foram removidos via API admin');
        
        res.json({ 
            success: true, 
            message: `${deletedCount} jogadores foram removidos com sucesso!` 
        });
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao limpar dados' 
        });
    }
});

// Remover jogador específico
app.delete('/api/admin/player/:id', async (req, res) => {
    try {
        const playerId = req.params.id;
        const deletedCount = await removePlayer(playerId);

        if (deletedCount > 0) {
            console.log(`🗑️ Jogador ${playerId} removido via API admin`);
            res.json({ 
                success: true, 
                message: `Jogador removido com sucesso!` 
            });
        } else {
            res.status(404).json({ 
                error: 'Jogador não encontrado' 
            });
        }
    } catch (error) {
        console.error('Erro ao remover jogador:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao remover jogador' 
        });
    }
});

// Resetar pontuações (manter jogadores, limpar apenas scores)
app.patch('/api/admin/reset-scores', async (req, res) => {
    try {
        const { confirmToken } = req.body;
        
        if (confirmToken !== 'FISCOFY_RESET_2025') {
            return res.status(401).json({ 
                error: 'Token de confirmação inválido' 
            });
        }

        const updatedCount = await resetScores();
        console.log('🔄 Pontuações resetadas via API admin');
        
        res.json({ 
            success: true, 
            message: `Pontuações resetadas para ${updatedCount} jogadores!` 
        });
    } catch (error) {
        console.error('Erro ao resetar pontuações:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao resetar pontuações' 
        });
    }
});

// Middleware para tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware para tratamento de erros gerais
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🎮 Acesse o jogo em: http://localhost:${PORT}`);
    console.log(`📊 API disponível em: http://localhost:${PORT}/api/`);
});