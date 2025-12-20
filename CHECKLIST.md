# ✅ Checklist de Implementação - Sistema de Pagamentos

## 📋 Status Geral: 🟡 Em Progresso

---

## 1️⃣ Correção do Código

### Backend (Edge Functions)
- [x] ✅ Função `create-billing` atualizada
  - [x] Autenticação de usuário implementada
  - [x] Validação de plano no banco
  - [x] Criação de pagamento pendente
  - [x] Metadados incluídos no payload
  - [x] Quantidade corrigida (1 em vez de 2)

- [x] ✅ Função `abacatepay-webhook` criada
  - [x] Processamento de eventos de pagamento
  - [x] Criação de registros de pagamento
  - [x] Criação/renovação de subscriptions
  - [x] Tratamento de erros

### Configuração
- [x] ✅ `supabase/config.toml` atualizado
  - [x] Configuração de `create-billing`
  - [x] Configuração de `abacatepay-webhook`

### Documentação
- [x] ✅ Documentação completa criada
  - [x] `CORRECAO_PAGAMENTOS.md` - Detalhes técnicos
  - [x] `RESUMO_CORRECAO.md` - Resumo executivo
  - [x] `GUIA_DEPLOY.md` - Guia de deploy
  - [x] `deploy-functions.sh` - Script de deploy

---

## 2️⃣ Deploy

### Preparação
- [ ] 🔲 Verificar se Supabase CLI está instalado
  ```bash
  supabase --version
  ```
  Se não estiver: `npm install -g supabase`

### Deploy das Funções
- [ ] 🔲 Deploy de `create-billing`
  ```bash
  npx supabase functions deploy create-billing --project-ref splljyokmwsqgczjrvpo
  ```

- [ ] 🔲 Deploy de `abacatepay-webhook`
  ```bash
  npx supabase functions deploy abacatepay-webhook --project-ref splljyokmwsqgczjrvpo
  ```

**OU use o script automático:**
- [ ] 🔲 Executar `./deploy-functions.sh`

### Verificação do Deploy
- [ ] 🔲 Verificar logs no Supabase Dashboard
- [ ] 🔲 Confirmar que ambas as funções aparecem em Edge Functions

---

## 3️⃣ Configuração do Webhook

### No Painel do AbacatePay
- [ ] 🔲 Acessar painel do AbacatePay
- [ ] 🔲 Ir em Configurações → Webhooks
- [ ] 🔲 Adicionar nova URL de webhook:
  ```
  https://splljyokmwsqgczjrvpo.supabase.co/functions/v1/abacatepay-webhook
  ```
- [ ] 🔲 Selecionar eventos:
  - [ ] `billing.paid`
  - [ ] `billing.confirmed`
- [ ] 🔲 Salvar configuração

### Verificação
- [ ] 🔲 Webhook aparece na lista de webhooks ativos
- [ ] 🔲 Status do webhook está "ativo"

---

## 4️⃣ Testes

### Teste Básico
- [ ] 🔲 Fazer login na aplicação
- [ ] 🔲 Navegar para página de pricing
- [ ] 🔲 Selecionar plano "Essential" ou "Pro"
- [ ] 🔲 Preencher dados do checkout
- [ ] 🔲 Verificar redirecionamento para pagamento PIX

### Teste de Pagamento (Ambiente de Teste)
- [ ] 🔲 Completar pagamento de teste
- [ ] 🔲 Aguardar confirmação do AbacatePay
- [ ] 🔲 Verificar redirecionamento para dashboard

### Verificação no Banco de Dados
- [ ] 🔲 Abrir Supabase Dashboard
- [ ] 🔲 Ir em Table Editor → `payments`
- [ ] 🔲 Verificar se há registro com:
  - [ ] `user_id` correto
  - [ ] `plan_id` correto
  - [ ] `status` = "completed"
  - [ ] `amount` correto
  - [ ] `external_payment_id` preenchido

- [ ] 🔲 Ir em Table Editor → `subscriptions`
- [ ] 🔲 Verificar se há registro com:
  - [ ] `user_id` correto
  - [ ] `plan_id` correto
  - [ ] `status` = "active"
  - [ ] `start_at` preenchido
  - [ ] `end_at` = start_at + 1 mês

### Verificação de Logs
- [ ] 🔲 Verificar logs de `create-billing`:
  ```
  ✅ "Authenticated user: [user_id]"
  ✅ "Creating billing for: ..."
  ✅ "Billing created successfully: [billing_id]"
  ✅ "Payment record created: [payment_id]"
  ```

- [ ] 🔲 Verificar logs de `abacatepay-webhook`:
  ```
  ✅ "Webhook received: ..."
  ✅ "Payment created: [payment_id]"
  ✅ "Subscription created: [subscription_id]"
  ```

---

## 5️⃣ Testes de Renovação

### Teste de Renovação de Subscription
- [ ] 🔲 Fazer segundo pagamento com mesmo usuário e plano
- [ ] 🔲 Verificar que subscription foi estendida (não duplicada)
- [ ] 🔲 Verificar que `end_at` foi atualizado (+1 mês)

---

## 6️⃣ Testes de Erro

### Teste de Usuário Não Autenticado
- [ ] 🔲 Fazer logout
- [ ] 🔲 Tentar acessar checkout
- [ ] 🔲 Verificar que retorna erro 401

### Teste de Plano Inexistente
- [ ] 🔲 Tentar criar billing com slug inválido
- [ ] 🔲 Verificar que retorna erro 404

---

## 7️⃣ Monitoramento

### Configurar Alertas (Opcional)
- [ ] 🔲 Configurar alertas no Supabase para erros em Edge Functions
- [ ] 🔲 Configurar monitoramento de webhooks no AbacatePay

---

## 📊 Progresso Total

```
Código:        ████████████████████ 100% (5/5)
Deploy:        ░░░░░░░░░░░░░░░░░░░░   0% (0/3)
Configuração:  ░░░░░░░░░░░░░░░░░░░░   0% (0/5)
Testes:        ░░░░░░░░░░░░░░░░░░░░   0% (0/15)
```

**Total:** 5/28 tarefas concluídas (18%)

---

## 🎯 Próxima Ação

**Execute agora:**
```bash
./deploy-functions.sh
```

Depois configure o webhook no painel do AbacatePay.

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs das Edge Functions no Supabase
2. Consulte `CORRECAO_PAGAMENTOS.md` para detalhes técnicos
3. Verifique a seção "Possíveis Problemas e Soluções"

---

**Última atualização:** 20/12/2025  
**Status:** 🟡 Aguardando deploy
