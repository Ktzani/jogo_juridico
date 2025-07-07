# 🚀 Guia Completo de Deploy Gratuito

## 🏆 Melhores Opções Gratuitas (2025)

| Plataforma | RAM | Storage | Banco | Facilidade | Uptime |
|------------|-----|---------|-------|------------|--------|
| **Railway** ⭐ | 512MB | 1GB | SQLite ✅ | ⭐⭐⭐⭐⭐ | 99.9% |
| **Render** | 512MB | - | PostgreSQL | ⭐⭐⭐⭐ | 99% |
| **Vercel** | - | - | Serverless | ⭐⭐⭐ | 99.9% |
| **Glitch** | 512MB | 200MB | SQLite ✅ | ⭐⭐⭐⭐ | 95% |

---

## 🚂 MÉTODO 1: Railway.app (RECOMENDADO)

### ✅ Por que Railway?
- SQLite funciona perfeitamente
- Deploy em 2 minutos
- 500 horas grátis/mês
- HTTPS automático
- Logs em tempo real

### 📋 Passo a Passo Rápido:

1. **Preparar arquivos** (já criados nos artefatos acima)
2. **Subir para GitHub:**
```bash
git init
git add .
git commit -m "Deploy inicial"
# Criar repo no GitHub primeiro
git remote add origin https://github.com/SEU_USUARIO/jogo-tributario.git
git push -u origin main
```

3. **Deploy no Railway:**
   - Acesse: https://railway.app
   - "Start a New Project" → "Deploy from GitHub repo"
   - Selecione seu repositório
   - Deploy automático! 🎉

### 🔗 URL Final:
`https://jogo-tributario-production.up.railway.app`

---

## 🎨 MÉTODO 2: Render.com

### ✅ Vantagens:
- Interface bonita
- Deploy fácil
- SSL grátis

### ⚠️ Limitação:
- App "hiberna" após 15min
- Primeiro acesso pode ser lento

### 📋 Passo a Passo:

1. **Mesmo processo Git** do Railway

2. **Deploy no Render:**
   - Acesse: https://render.com
   - "New" → "Web Service"
   - Conecte GitHub → Selecione repo
   - Configure:
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Plan:** Free

---

## ⚡ MÉTODO 3: Vercel (Serverless)

### 📋 Para aplicações mais complexas:

1. **Instalar Vercel CLI:**
```bash
npm i -g vercel
```

2. **Configurar:**
```bash
vercel
```

3. **Seguir prompts do CLI**

---

## 🎮 MÉTODO 4: Glitch.com

### ✅ Mais simples possível:

1. Acesse: https://glitch.com
2. "New Project" → "Import from GitHub"
3. Cole a URL do seu repositório
4. Pronto! 

### 🔗 URL automática:
`https://seu-projeto.glitch.me`

---

## 🔧 Configurações Importantes

### 1. **Variáveis de Ambiente:**
```bash
NODE_ENV=production
PORT=3000  # Automático na maioria das plataformas
```

### 2. **package.json engines:**
```json
{
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### 3. **Healthcheck endpoint:**
Já configurado no `server.js`:
```javascript
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'jogo.html'));
});
```

---

## 🚨 Troubleshooting

### Problema: "Application Error"
**Solução:**
1. Verificar logs da plataforma
2. Conferir se `PORT` está correto:
```javascript
const PORT = process.env.PORT || 3000;
```

### Problema: "Cannot find module"
**Solução:**
1. Verificar `package.json` dependencies
2. Executar `npm install` localmente

### Problema: Banco não funciona
**Solução:**
1. Para SQLite: usar Railway ou Glitch
2. Para PostgreSQL: usar Render + banco grátis

---

## 🎯 Checklist Final

- [ ] ✅ Código funciona localmente (`npm start`)
- [ ] ✅ Arquivos de configuração criados
- [ ] ✅ Código no GitHub
- [ ] ✅ Plataforma escolhida
- [ ] ✅ Deploy realizado
- [ ] ✅ URL funcionando
- [ ] ✅ Testado cadastro + jogo

---

## 💰 Limites Gratuitos

### Railway:
- 500 horas/mês
- 512MB RAM
- 1GB Storage

### Render:
- 750 horas/mês
- 512MB RAM
- App hiberna após 15min

### Vercel:
- 100GB bandwidth/mês
- Função serverless

---

## 🔄 Deploy Automático

Para atualizações futuras:
1. Modifique código localmente
2. `git add . && git commit -m "Update"`
3. `git push`
4. Deploy automático! ✨

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs da plataforma
2. Testar localmente primeiro
3. Conferir documentação oficial:
   - Railway: https://docs.railway.app
   - Render: https://render.com/docs