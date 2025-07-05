# 🎨 Deploy no Render.com

## Passo a Passo Completo

### 1. **Preparar Projeto para Render**

**render.yaml** (opcional, mas recomendado):
```yaml
services:
  - type: web
    name: jogo-memoria-tributaria
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
```

### 2. **Fazer Deploy**

1. **Subir para GitHub** (mesmo processo do Railway)

2. **No Render.com:**
   - Acesse: https://render.com
   - "New" → "Web Service"
   - Conecte GitHub
   - Selecione repositório
   - Configure:
     - **Name:** jogo-memoria-tributaria
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Plan:** Free

3. **Deploy automático!**

### 3. **Limitações do Render Free:**

⚠️ **IMPORTANTE:**
- App "hiberna" após 15 min de inatividade
- Primeiro acesso pode ser lento (30s)
- 750 horas grátis/mês

### 4. **URL Final:**

`https://jogo-memoria-tributaria.onrender.com`

## ✅ Vantagens do Render

- Interface mais amigável
- Logs detalhados
- SSL automático
- Git integração automática