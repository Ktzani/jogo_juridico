#!/usr/bin/env node

// Script para testar as APIs do jogo
const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Testando APIs do Jogo da Memória Tributária\n');

    try {
        // Teste 1: Cadastrar um jogador
        console.log('1️⃣ Testando cadastro de jogador...');
        const playerData = {
            cnpj: '12.345.678/0001-90',
            nome: 'João Silva Teste',
            email: 'joao.teste@empresa.com',
            telefone: '(11) 99999-9999',
            cargo: 'Gerente Financeiro',
            instagram: '@joaoteste',
            regime: 'Simples Nacional',
            faturamento: '100K - 500K',
            dor: 'Planejamento tributário, Recuperação de tributos pagos indevidamente, Outro'
        };

        const createResponse = await fetch(`${API_BASE}/players`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playerData)
        });

        const createResult = await createResponse.json();
        console.log('✅ Jogador criado:', createResult);
        const playerId = createResult.playerId;

        // Teste 2: Atualizar pontuação
        console.log('\n2️⃣ Testando atualização de pontuação...');
        const scoreData = {
            score: 8500,
            moves: 12,
            time: 45,
            finalScore: 9200
        };

        const scoreResponse = await fetch(`${API_BASE}/players/${playerId}/score`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData)
        });

        const scoreResult = await scoreResponse.json();
        console.log('✅ Pontuação atualizada:', scoreResult);

        // Teste 3: Buscar ranking
        console.log('\n3️⃣ Testando busca de ranking...');
        const rankingResponse = await fetch(`${API_BASE}/ranking`);
        const rankingResult = await rankingResponse.json();
        console.log('✅ Ranking (primeiros 3):');
        rankingResult.ranking.slice(0, 3).forEach((player, index) => {
            console.log(`   ${index + 1}º ${player.nome} - ${player.score} pts`);
        });

        // Teste 4: Análise de pain points
        console.log('\n4️⃣ Testando análise de pain points...');
        const painAnalysisResponse = await fetch(`${API_BASE}/pain-points/analysis`);
        const painAnalysisResult = await painAnalysisResponse.json();
        console.log('✅ Análise de Pain Points:');
        painAnalysisResult.analysis.forEach(pain => {
            if (pain.count > 0) {
                console.log(`   ${pain.name}: ${pain.count} jogadores (${pain.percentage}%)`);
            }
        });

        // Teste 5: Top pain points
        console.log('\n5️⃣ Testando top 3 pain points...');
        const topPainResponse = await fetch(`${API_BASE}/pain-points/top/3`);
        const topPainResult = await topPainResponse.json();
        console.log('✅ Top 3 Pain Points:');
        topPainResult.topPainPoints.forEach((pain, index) => {
            console.log(`   ${index + 1}º ${pain.name}: ${pain.count} seleções (${pain.percentage}%)`);
        });

        // Teste 6: Estatísticas gerais
        console.log('\n6️⃣ Testando estatísticas gerais...');
        const statsResponse = await fetch(`${API_BASE}/stats`);
        const statsResult = await statsResponse.json();
        console.log('✅ Estatísticas Gerais:');
        console.log(`   Total de jogadores: ${statsResult.stats.total_players}`);
        console.log(`   Jogos completados: ${statsResult.stats.completed_games}`);
        console.log(`   Maior pontuação: ${statsResult.stats.highest_score || 'N/A'}`);
        console.log(`   Média de pontuação: ${Math.round(statsResult.stats.average_score || 0)}`);

        console.log('\n🎉 Todos os testes concluídos com sucesso!');

    } catch (error) {
        console.error('\n❌ Erro durante os testes:', error.message);
        console.log('💡 Certifique-se de que o servidor está rodando: npm start');
    }
}

// Função helper para fetch (se não estiver disponível)
if (typeof fetch === 'undefined') {
    console.log('📦 Instalando node-fetch para testes...');
    try {
        const fetch = require('node-fetch');
        global.fetch = fetch;
    } catch (e) {
        console.log('⚠️  Para executar os testes, instale node-fetch:');
        console.log('   npm install node-fetch');
        process.exit(1);
    }
}

// Executar testes
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };