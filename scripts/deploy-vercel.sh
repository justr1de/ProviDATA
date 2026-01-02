#!/bin/bash

# Script de Deploy Automatizado para Vercel
# ProviDATA - Sistema de Gestão de Gabinetes

set -e  # Exit on error

echo "🚀 Iniciando processo de deploy para Vercel..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Erro: package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

print_success "Diretório do projeto validado"

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    print_error "Erro: Arquivo .env.local não encontrado!"
    print_warning "Crie o arquivo .env.local com as variáveis necessárias antes de fazer deploy."
    exit 1
fi

print_success "Arquivo .env.local encontrado"

# Verificar se as variáveis necessárias estão definidas
print_step "Verificando variáveis de ambiente..."

if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    print_error "NEXT_PUBLIC_SUPABASE_URL não encontrada em .env.local"
    exit 1
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada em .env.local"
    exit 1
fi

print_success "Variáveis de ambiente validadas"

# Verificar se existem mudanças não commitadas
print_step "Verificando status do Git..."

if [ -n "$(git status --porcelain)" ]; then
    print_warning "Existem mudanças não commitadas!"
    read -p "Deseja commitar as mudanças? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git add .
        read -p "Digite a mensagem do commit: " commit_message
        git commit -m "$commit_message"
        print_success "Mudanças commitadas"
        
        read -p "Deseja fazer push? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            git push
            print_success "Push realizado"
        fi
    else
        print_warning "Continuando sem commitar as mudanças..."
    fi
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado. Instale o Node.js primeiro."
    exit 1
fi

print_success "npm encontrado: $(npm --version)"

# Instalar dependências
print_step "Instalando dependências..."
npm install
print_success "Dependências instaladas"

# Executar lint (opcional)
print_step "Executando lint..."
if npm run lint; then
    print_success "Lint passou sem erros"
else
    print_warning "Lint encontrou problemas, mas continuando..."
fi

# Build local para testar
print_step "Executando build local para teste..."
if npm run build; then
    print_success "Build local concluído com sucesso!"
else
    print_error "Build falhou! Corrija os erros antes de fazer deploy."
    exit 1
fi

# Verificar se Vercel CLI está instalada
print_step "Verificando Vercel CLI..."

if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI não está instalada."
    read -p "Deseja instalar? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        npm install -g vercel
        print_success "Vercel CLI instalada"
    else
        print_error "Vercel CLI é necessária para deploy via linha de comando."
        print_warning "Você pode fazer deploy manualmente pelo dashboard: https://vercel.com"
        exit 1
    fi
fi

print_success "Vercel CLI encontrada"

# Verificar se está logado na Vercel
print_step "Verificando autenticação Vercel..."
if ! vercel whoami &> /dev/null; then
    print_warning "Você não está logado na Vercel."
    print_step "Iniciando login..."
    vercel login
fi

print_success "Autenticado na Vercel: $(vercel whoami)"

# Perguntar tipo de deploy
echo ""
echo "Escolha o tipo de deploy:"
echo "1) Preview (teste)"
echo "2) Production"
read -p "Opção [1-2]: " deploy_type

case $deploy_type in
    1)
        print_step "Iniciando deploy de PREVIEW..."
        vercel
        ;;
    2)
        print_step "Iniciando deploy de PRODUCTION..."
        print_warning "Este deploy será publicado em produção!"
        read -p "Tem certeza? (s/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            vercel --prod
        else
            print_warning "Deploy cancelado."
            exit 0
        fi
        ;;
    *)
        print_error "Opção inválida!"
        exit 1
        ;;
esac

echo ""
print_success "Deploy concluído com sucesso! 🎉"
echo ""
print_step "Próximos passos:"
echo "1. Acesse a URL fornecida pela Vercel"
echo "2. Teste a autenticação"
echo "3. Verifique se as variáveis de ambiente estão corretas"
echo "4. Configure o domínio customizado (se necessário)"
echo ""
print_warning "Não esqueça de adicionar a URL da Vercel no Supabase!"
echo "Supabase Dashboard > Settings > API > Site URL"
echo ""
