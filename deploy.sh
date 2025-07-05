#!/bin/bash

echo "🚀 Script de Deploy - Jogo da Memória Tributária"
echo "================================================"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto!"
    exit 1
fi

# Verificar se tem Git instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git não encontrado! Instale o Git primeiro."
    exit 1
fi

echo "📋 Escolha a plataforma de deploy:"
echo "1) Railway.app (Recomendado)"
echo "2) Render.com"
echo "3) Preparar apenas os arquivos"

read -p "Digite sua escolha (1-3): " choice

# Criar arquivos necessários
echo "📄 Criando arquivos de configuração..."

# Procfile
echo "web: node server.js" > Procfile

# railway.json
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# render.yaml
cat > render.yaml << 'EOF'
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
EOF

# .gitignore se não existir
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
node_modules/
*.db
*.sqlite
*.sqlite3
.env
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF
fi

echo "✅ Arquivos de configuração criados!"

case $choice in
    1)
        echo "🚂 Configurando para Railway..."
        echo ""
        echo "📝 Próximos passos:"
        echo "1. Acesse: https://railway.app"
        echo "2. Conecte sua conta GitHub"
        echo "3. Clique 'New Project' → 'Deploy from GitHub repo'"
        echo "4. Selecione este repositório"
        echo "5. Deploy automático!"
        echo ""
        echo "💡 Ou use o Railway CLI:"
        echo "   npm install -g @railway/cli"
        echo "   railway login"
        echo "   railway init"
        echo "   railway up"
        ;;
    2)
        echo "🎨 Configurando para Render..."
        echo ""
        echo "📝 Próximos passos:"
        echo "1. Acesse: https://render.com"
        echo "2. Clique 'New' → 'Web Service'"
        echo "3. Conecte GitHub e selecione este repo"
        echo "4. Configure:"
        echo "   - Build Command: npm install"
        echo "   - Start Command: node server.js"
        echo "5. Deploy!"
        ;;
    3)
        echo "📦 Arquivos preparados!"
        echo "Você pode fazer upload manual ou usar Git."
        ;;
    *)
        echo "❌ Opção inválida!"
        exit 1
        ;;
esac

# Configurar Git se ainda não foi configurado
if [ ! -d ".git" ]; then
    echo ""
    read -p "🔧 Inicializar repositório Git? (y/n): " init_git
    
    if [ "$init_git" = "y" ] || [ "$init_git" = "Y" ]; then
        git init
        git add .
        git commit -m "Initial commit - Jogo da Memória Tributária"
        
        echo ""
        echo "📤 Para conectar ao GitHub:"
        echo "1. Crie um repositório em: https://github.com/new"
        echo "2. Execute:"
        echo "   git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
    fi
fi

echo ""
echo "🎉 Configuração de deploy concluída!"
echo "📱 Sua aplicação estará disponível em uma URL como:"
echo "   Railway: https://jogo-tributario-production.up.railway.app"
echo "   Render:  https://jogo-memoria-tributaria.onrender.com"
echo ""
echo "⏱️  Tempo estimado de deploy: 2-5 minutos"