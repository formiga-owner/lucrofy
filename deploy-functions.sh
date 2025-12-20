#!/bin/bash

# Script de Deploy - Sistema de Pagamentos Corrigido
# Execute este script para fazer deploy das funções atualizadas

echo "🚀 Iniciando deploy das funções Supabase..."
echo ""

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI não encontrado!"
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Deploy da função create-billing atualizada
echo "📤 Fazendo deploy da função create-billing..."
npx supabase functions deploy create-billing --project-ref splljyokmwsqgczjrvpo

if [ $? -eq 0 ]; then
    echo "✅ create-billing deployed com sucesso!"
else
    echo "❌ Erro ao fazer deploy de create-billing"
    exit 1
fi

echo ""

# Deploy da nova função webhook
echo "📤 Fazendo deploy da função abacatepay-webhook..."
npx supabase functions deploy abacatepay-webhook --project-ref splljyokmwsqgczjrvpo

if [ $? -eq 0 ]; then
    echo "✅ abacatepay-webhook deployed com sucesso!"
else
    echo "❌ Erro ao fazer deploy de abacatepay-webhook"
    exit 1
fi

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o webhook no painel do AbacatePay:"
echo "   URL: https://splljyokmwsqgczjrvpo.supabase.co/functions/v1/abacatepay-webhook"
echo "   Eventos: billing.paid, billing.confirmed"
echo ""
echo "2. Teste o fluxo de pagamento:"
echo "   - Faça login na aplicação"
echo "   - Selecione um plano"
echo "   - Complete o pagamento"
echo "   - Verifique as tabelas payments e subscriptions"
echo ""
echo "📚 Documentação completa: CORRECAO_PAGAMENTOS.md"
