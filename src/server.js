const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initDatabase, savePlayer, getAllPlayers, getPlayerStats, getPainPointsAnalysis, getAllPainPoints, getTopPainPoints } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar banco de dados
initDatabase();

// Rota principal - servir o jogo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jogo.html'));
});

// API Routes

// Salvar dados do jogador
app.post('/api/players', async (req, res) => {
    try {
        const playerData = req.body;
        
        // Validação básica
        if (!playerData.nome || !playerData.email || !playerData.cnpj) {
            return res.status(400).json({ 
                error: 'Dados obrigatórios não fornecidos (nome, email, cnpj)' 
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

// Buscar análise de pain points
app.get('/api/pain-points/analysis', async (req, res) => {
    try {
        const analysis = await getPainPointsAnalysis();
        res.json({ 
            success: true, 
            analysis: analysis 
        });
    } catch (error) {
        console.error('Erro ao buscar análise de pain points:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao buscar análise' 
        });
    }
});

// Buscar todos os pain points disponíveis
app.get('/api/pain-points', async (req, res) => {
    try {
        const painPoints = await getAllPainPoints();
        res.json({ 
            success: true, 
            painPoints: painPoints 
        });
    } catch (error) {
        console.error('Erro ao buscar pain points:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao buscar pain points' 
        });
    }
});

// Buscar top pain points mais selecionados
app.get('/api/pain-points/top/:limit?', async (req, res) => {
    try {
        const limit = parseInt(req.params.limit) || 5;
        const topPainPoints = await getTopPainPoints(limit);
        res.json({ 
            success: true, 
            topPainPoints: topPainPoints 
        });
    } catch (error) {
        console.error('Erro ao buscar top pain points:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor ao buscar top pain points' 
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