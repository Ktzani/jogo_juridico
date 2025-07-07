# 🚂 Deploy no Railway.app

## Passo a Passo Completo

### 1. **Preparar o Projeto**

Adicione estes arquivos na raiz do projeto:

**Procfile:**
```
web: node server.js
```

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node src/server.js",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. **Atualizar package.json**

Adicione a versão do Node:
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

### 3. **Modificar server.js para Railway**

Adicione no início do server.js:
```javascript
const PORT = process.env.PORT || 3000;
```

### 4. **Fazer Deploy**

#### Opção A: Via GitHub (Recomendado)

1. **Subir código para GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/jogo-tributario.git
git push -u origin main
```

2. **No Railway:**
- Acesse: https://railway.app
- Clique "Start a New Project"
- Conecte sua conta GitHub
- Selecione o repositório
- Deploy automático! 🎉

#### Opção B: Via Railway CLI

1. **Instalar CLI:**
```bash
npm install -g @railway/cli
```

2. **Fazer login:**
```bash
railway login
```

3. **Deploy:**
```bash
railway init
railway up
```

### 5. **Configurar Variáveis (Se necessário)**

No dashboard do Railway:
- Settings → Variables
- Adicionar: `NODE_ENV=production`

### 6. **Acessar Aplicação**

- URL será gerada automaticamente
- Exemplo: `https://jogo-tributario-production.up.railway.app`

## ✅ Vantagens do Railway

- Deploy em 2 minutos
- SQLite funciona perfeitamente
- HTTPS automático
- Logs em tempo real
- 500 horas grátis/mês
