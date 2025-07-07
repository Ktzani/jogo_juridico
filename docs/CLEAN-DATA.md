# 🗑️ Como Remover Dados do Banco

## 🎯 Visão Geral

Existem **3 maneiras** de remover dados do seu jogo no Railway:

1. **🌐 Via Painel Admin Web** (Mais fácil)
2. **🔌 Via APIs Diretas** (Para desenvolvedores)
3. **🛠️ Via Railway CLI** (Para banco remoto)

---

## 🌐 MÉTODO 1: Painel Admin Web (Recomendado)

### 1. **Criar página admin:**
- Coloque o arquivo `admin.html` na pasta `public/`
- Faça deploy (`git add . && git commit -m "Add admin panel" && git push`)

### 2. **Acessar painel:**
```
https://sua-url.up.railway.app/admin.html
```

### 3. **Opções disponíveis:**
- **🔄 Resetar Pontuações**: Mantém jogadores, zera apenas scores
- **🗑️ Limpar Todos os Dados**: Remove tudo (irreversível!)
- **📊 Exportar Dados**: Backup antes de limpar

---

## 🔌 MÉTODO 2: Via APIs Diretas

### **Resetar apenas pontuações:**
```bash
curl -X PATCH https://sua-url.up.railway.app/api/admin/reset-scores \
  -H "Content-Type: application/json" \
  -d '{"confirmToken":"FISCOFY_RESET_2025"}'
```

### **Limpar todos os dados:**
```bash
curl -X DELETE https://sua-url.up.railway.app/api/admin/clear-all \
  -H "Content-Type: application/json" \
  -d '{"confirmToken":"FISCOFY_CLEAR_2025"}'
```

### **Remover jogador específico:**
```bash
curl -X DELETE https://sua-url.up.railway.app/api/admin/player/123
```

---

## 🛠️ MÉTODO 3: Via Railway CLI

### **1. Instalar Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

### **2. Conectar ao projeto:**
```bash
railway link
# Selecione seu projeto
```

### **3. Executar comandos no banco remoto:**

#### **Opção A: Comando SQL direto**
```bash
railway run sqlite3 fiscofy_game.db "DELETE FROM player_pain_points; DELETE FROM players;"
```

#### **Opção B: Shell interativo**
```bash
railway shell
# Agora você está no container do Railway

# Ver dados
sqlite3 fiscofy_game.db "SELECT COUNT(*) FROM players;"

# Resetar pontuações
sqlite3 fiscofy_game.db "UPDATE players SET score=0, moves=0, time=0, final_score=0, completed_at=NULL;"

# Limpar tudo
sqlite3 fiscofy_game.db "DELETE FROM player_pain_points; DELETE FROM players;"
```

#### **Opção C: Upload de script**
```bash
# No seu computador
railway run node clear-data.js
```

---

## 📊 Comandos SQL Úteis

### **Ver estatísticas:**
```sql
SELECT COUNT(*) as total_players FROM players;
SELECT COUNT(*) as completed_games FROM players WHERE score > 0;
SELECT MAX(score) as highest_score FROM players;
```

### **Resetar apenas pontuações:**
```sql
UPDATE players SET 
  score = 0, 
  moves = 0, 
  time = 0, 
  final_score = 0, 
  completed_at = NULL;
```

### **Remover tudo (ordem importa!):**
```sql
DELETE FROM player_pain_points;
DELETE FROM players;
```

### **Remover jogador específico:**
```sql
-- Primeiro encontrar o ID
SELECT id, nome, email FROM players WHERE nome LIKE '%João%';

-- Remover (substitua 123 pelo ID real)
DELETE FROM player_pain_points WHERE player_id = 123;
DELETE FROM players WHERE id = 123;
```

---

## ⚠️ Cuidados Importantes

### **1. Backup antes de limpar:**
```bash
# Via API
curl https://sua-url.up.railway.app/api/players > backup.json

# Via Railway CLI
railway run sqlite3 fiscofy_game.db ".dump" > backup.sql
```

### **2. Ordem das operações:**
Sempre remover `player_pain_points` ANTES de `players` (foreign keys)

### **3. Confirmações de segurança:**
- APIs exigem tokens específicos
- Painel web tem dupla confirmação
- CLI pede confirmação manual

---

## 🎯 Cenários Comuns

### **🔄 "Quero zerar pontuações para novo evento"**
```bash
# Método mais fácil - Painel Admin
https://sua-url.up.railway.app/admin.html
# Clique "Resetar Pontuações"
```

### **🗑️ "Quero remover dados de teste"**
```bash
# API direta
curl -X DELETE https://sua-url.up.railway.app/api/admin/clear-all \
  -H "Content-Type: application/json" \
  -d '{"confirmToken":"FISCOFY_CLEAR_2025"}'
```

### **👤 "Quero remover um jogador específico"**
1. Acesse: `https://sua-url.up.railway.app/admin.html`
2. Veja lista de jogadores
3. Use API para remover por ID

### **📊 "Quero só ver os dados"**
```bash
# Ver estatísticas
curl https://sua-url.up.railway.app/api/stats

# Ver todos os jogadores
curl https://sua-url.up.railway.app/api/players

# Ver ranking
curl https://sua-url.up.railway.app/api/ranking
```

---

## 🚨 Troubleshooting

### **Erro: "Token inválido"**
- Verifique se está usando os tokens corretos:
  - Reset: `FISCOFY_RESET_2025`
  - Clear: `FISCOFY_CLEAR_2025`

### **Erro: "Railway command not found"**
```bash
npm install -g @railway/cli
railway --version
```

### **Erro: "Database is locked"**
- Pare a aplicação temporariamente no Railway
- Execute comando de limpeza
- Reinicie a aplicação

### **Erro: "Foreign key constraint"**
- Sempre deletar `player_pain_points` antes de `players`
- Usar as APIs que fazem isso automaticamente

---

## 💡 Dicas Extras

1. **Sempre fazer backup** antes de operações destrutivas
2. **Usar painel admin** para operações visuais
3. **Usar APIs** para automação
4. **Usar Railway CLI** para debugging
5. **Testar localmente** antes de aplicar na produção

---

## 🎮 Para Começar Rapidamente

**Resetar apenas pontuações (mais comum):**
1. Acesse: `https://sua-url.up.railway.app/admin.html`
2. Clique "🗑️ Gerenciar Dados"
3. Clique "🔄 Resetar Apenas Pontuações"
4. Confirme

**Limpar tudo:**
1. Faça backup: `curl https://sua-url.up.railway.app/api/players > backup.json`
2. Acesse painel admin
3. Clique "🗑️ Limpar Todos os Dados"
4. Digite "CONFIRMAR EXCLUSAO"