# 🔧 Guia Rápido de Deploy

## ✅ O que foi corrigido?

Os pagamentos, subscriptions e planos agora **são salvos no banco de dados** corretamente!

## 📁 Arquivos Criados/Modificados

1. ✅ `supabase/functions/create-billing/index.ts` - Atualizado
2. ✅ `supabase/functions/abacatepay-webhook/index.ts` - Novo
3. ✅ `supabase/config.toml` - Atualizado
4. ✅ `deploy-functions.sh` - Script de deploy

## 🚀 Como fazer deploy?

### Opção 1: Script Automático (Recomendado)
```bash
./deploy-functions.sh
```

### Opção 2: Manual
```bash
# Deploy create-billing
npx supabase functions deploy create-billing --project-ref splljyokmwsqgczjrvpo

# Deploy webhook
npx supabase functions deploy abacatepay-webhook --project-ref splljyokmwsqgczjrvpo
```

## ⚙️ Configurar Webhook no AbacatePay

1. Acesse o painel do AbacatePay
2. Vá em **Configurações → Webhooks**
3. Adicione a URL:
   ```
   https://splljyokmwsqgczjrvpo.supabase.co/functions/v1/abacatepay-webhook
   ```
4. Selecione os eventos:
   - ✅ `billing.paid`
   - ✅ `billing.confirmed`

## 🧪 Como testar?

1. Faça login na aplicação
2. Vá para a página de pricing
3. Selecione um plano (Pro ou Essential)
4. Preencha os dados do checkout
5. Complete o pagamento PIX
6. Verifique no Supabase:
   - Tabela `payments` deve ter um novo registro
   - Tabela `subscriptions` deve ter um novo registro

## 📊 Verificar no Supabase

### Ver Pagamentos
```sql
SELECT * FROM payments ORDER BY created_at DESC;
```

### Ver Subscriptions
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC;
```

### Ver Logs das Funções
1. Acesse o Supabase Dashboard
2. Vá em **Edge Functions → Logs**
3. Selecione a função desejada

## 📚 Documentação Completa

- **Detalhes técnicos:** `CORRECAO_PAGAMENTOS.md`
- **Resumo executivo:** `RESUMO_CORRECAO.md`

## ❓ Problemas?

### Webhook não está sendo chamado
- Verifique a URL no painel do AbacatePay
- Verifique os logs da função no Supabase

### Pagamento não aparece no banco
- Verifique os logs de `abacatepay-webhook`
- Confirme que o email do cliente corresponde a um usuário

### Erro de autenticação
- Certifique-se de estar logado na aplicação
- Verifique se o token está sendo enviado

## 🎯 Status

- [x] Código corrigido
- [x] Documentação criada
- [ ] Deploy realizado
- [ ] Webhook configurado
- [ ] Teste completo

---

**Última atualização:** 20/12/2025
