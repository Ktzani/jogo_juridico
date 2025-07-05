# 🎮 Jogo da Memória Tributária - Fiscofy

Um jogo interativo de memória com temas tributários, desenvolvido para eventos da Fiscofy. O projeto inclui cadastro de jogadores, ranking e persistência em banco de dados local.

## 🚀 Características

- **Jogo da Memória**: 8 pares de cartas com temas tributários
- **Cadastro Completo**: Coleta dados dos participantes
- **Ranking em Tempo Real**: Pontuação baseada em velocidade e eficiência
- **Banco de Dados Local**: SQLite para persistência
- **Interface Responsiva**: Funciona em desktop e mobile
- **API RESTful**: Backend organizado com endpoints claros

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn

## 🛠️ Instalação

1. **Clone ou baixe os arquivos do projeto**

2. **Instale as dependências:**
```bash
npm install
```

3. **Estrutura de pastas:**
```
projeto/
├── server.js
├── database.js
├── package.json
├── public/
│   └── jogo.html
└── fiscofy_game.db (será criado automaticamente)
```

4. **Mova o arquivo HTML:**
```bash
mkdir public
# Mova o arquivo jogo.html para a pasta public/
```

## 🚀 Executar o Projeto

### Modo Desenvolvimento
```bash
npm run dev
```

### Modo Produção
```bash
npm start
```

O servidor será iniciado na porta 3000 por padrão.

**Acesse:** http://localhost:3000

## 📊 API Endpoints

### Jogadores
- `POST /api/players` - Cadastrar novo jogador
- `GET /api/players` - Listar todos os jogadores
- `PUT /api/players/:id/score` - Atualizar pontuação

### Ranking e Estatísticas
- `GET /api/ranking` - Buscar ranking ordenado
- `GET /api/stats` - Estatísticas gerais

### Pain Points (Análise de Dores)
- `GET /api/pain-points` - Listar todos os pain points disponíveis
- `GET /api/pain-points/analysis` - Análise completa de pain points
- `GET /api/pain-points/top/:limit?` - Top N pain points mais selecionados

### Exemplo de Cadastro
```json
{
  "cnpj": "00.000.000/0000-00",
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "telefone": "(11) 99999-9999",
  "cargo": "Gerente",
  "instagram": "@joaosilva",
  "regime": "Simples Nacional",
  "faturamento": "100K - 500K",
  "dor": "Planejamento tributário, Recuperação de créditos"
}
```

## 🎯 Funcionalidades do Jogo

### Para Jogadores
- **Cadastro obrigatório** com dados comerciais
- **Jogo de memória** com 8 pares de cartas
- **Dicas tributárias** a cada par encontrado
- **Pontuação baseada** em tempo e eficiência
- **Ranking geral** com todos os participantes

### Para Administradores
- **Modo Admin**: Toque 5x no título ou Ctrl+Shift+F
- **Visualização completa** dos dados dos jogadores
- **Ranking com informações detalhadas**
- **Exportação de dados** (interface preparada)

## 🗃️ Banco de Dados

O sistema usa SQLite com uma estrutura normalizada para múltiplas seleções:

### Tabelas:

**players** - Dados básicos dos jogadores:
```sql
CREATE TABLE players (
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
    completed_at DATETIME
);
```

**pain_points** - Tipos de dores/problemas disponíveis:
```sql
CREATE TABLE pain_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**player_pain_points** - Relacionamento many-to-many:
```sql
CREATE TABLE player_pain_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    pain_point_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players (id),
    FOREIGN KEY (pain_point_id) REFERENCES pain_points (id),
    UNIQUE(player_id, pain_point_id)
);
```

### Migração de Dados:

Se você já tinha dados na estrutura antiga, execute:
```bash
npm run migrate
```

## 🔧 Personalização

### Modificar Cartas do Jogo
Edite o array `cards` no arquivo `jogo.html`:

```javascript
const cards = [
    { id: 1, icon: "🏪", title: "Seu Tema", info: "Sua dica aqui!" },
    // ... adicione mais cartas
];
```

### Modificar Campos do Formulário
Edite a seção do formulário no arquivo `jogo.html` e ajuste os campos no `database.js` conforme necessário.

### Configurar Porta
```javascript
const PORT = process.env.PORT || 3000;
```

## 📱 Compatibilidade

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablets
- ✅ Modo offline (após carregamento inicial)

## 🔒 Segurança

- Validação de dados no frontend e backend
- Sanitização de inputs
- Headers de segurança básicos
- Validação de email e campos obrigatórios

## 📈 Análise de Dados

O sistema coleta:
- **Dados comerciais**: CNPJ, regime tributário, faturamento
- **Dados de contato**: Email, telefone, Instagram
- **Perfil profissional**: Cargo, principais dores (estruturada)
- **Performance no jogo**: Pontuação, tempo, número de jogadas

### Relatórios Disponíveis:

**Análise de Pain Points:**
- Frequência de cada dor selecionada
- Percentual de jogadores por tipo de dor
- Ranking das dores mais comuns
- Correlação entre dores e perfil da empresa

**Exemplos de consultas analíticas:**
```bash
# Top 3 dores mais comuns
curl http://localhost:3000/api/pain-points/top/3

# Análise completa
curl http://localhost:3000/api/pain-points/analysis
```

## 🐛 Solução de Problemas

### Erro de Porta em Uso
```bash
# Windows
netstat -ano | findstr :3000
# Linux/Mac
lsof -i :3000
```

### Recriar Banco de Dados
```bash
rm fiscofy_game.db
npm start
```

### Problemas de CORS
O CORS está configurado para permitir todas as origens em desenvolvimento.

## 🤝 Contribuição

Para contribuir:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 💡 Próximas Funcionalidades

- [ ] Dashboard administrativo
- [ ] Exportação de dados em CSV/Excel
- [ ] Integração com email marketing
- [ ] Sistema de sorteio automático
- [ ] Relatórios analíticos
- [ ] Multiple themes/brands support

---

**Desenvolvido com ❤️ para a Fiscofy**