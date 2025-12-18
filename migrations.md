# Plano de Migração - LucroFácil para Supabase

## 📋 Visão Geral

Este documento descreve o plano de migração do sistema LucroFácil, atualmente baseado em localStorage, para o Supabase como backend.

---

## 🗂️ Entidades Identificadas

### 1. **Users (auth.users)** - Gerenciado pelo Supabase Auth
- Autenticação nativa do Supabase
- Email/senha como método principal
- Dados sensíveis protegidos pelo sistema de auth

### 2. **Profiles (profiles)**
- Dados públicos do usuário
- Vinculado ao auth.users via trigger
- Nome, avatar, preferências

### 3. **User Roles (user_roles)**
- Controle de permissões separado (princípio de menor privilégio)
- Roles: `admin`, `user`, `premium`
- Evita escalação de privilégios

### 4. **Products (products)**
- Produtos cadastrados pelo usuário
- Preço de compra, venda, margem desejada
- Custos adicionais (frete, impostos, comissões)

### 5. **Product Stock (product_stocks)**
- Estoque atual de cada produto
- Estoque mínimo para alertas
- Vinculado ao produto

### 6. **Stock Movements (stock_movements)**
- Histórico de movimentações
- Entradas e saídas
- Motivo: compra, venda, perda, ajuste

### 7. **Sales (sales)** - Nova entidade
- Registro de vendas reais (substituindo dados simulados)
- Quantidade, receita, lucro
- Data da venda

---

## 🏗️ Modelagem do Banco de Dados

### Diagrama ER (Entidade-Relacionamento)

```
┌──────────────────┐      ┌──────────────────┐
│   auth.users     │      │   user_roles     │
│──────────────────│      │──────────────────│
│ id (PK)          │◄────►│ user_id (FK)     │
│ email            │      │ role             │
│ created_at       │      │ id (PK)          │
└────────┬─────────┘      └──────────────────┘
         │
         │ 1:1
         ▼
┌──────────────────┐
│    profiles      │
│──────────────────│
│ id (PK/FK)       │
│ name             │
│ avatar_url       │
│ created_at       │
│ updated_at       │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐      ┌──────────────────┐
│    products      │      │  product_stocks  │
│──────────────────│      │──────────────────│
│ id (PK)          │◄────►│ product_id (FK)  │
│ user_id (FK)     │      │ current_stock    │
│ name             │      │ minimum_stock    │
│ purchase_price   │      │ updated_at       │
│ sale_price       │      └──────────────────┘
│ desired_margin   │
│ additional_costs │      ┌──────────────────┐
│ created_at       │      │ stock_movements  │
│ updated_at       │◄────►│──────────────────│
└────────┬─────────┘      │ id (PK)          │
         │                │ product_id (FK)  │
         │ 1:N            │ user_id (FK)     │
         ▼                │ type             │
┌──────────────────┐      │ reason           │
│     sales        │      │ quantity         │
│──────────────────│      │ notes            │
│ id (PK)          │      │ created_at       │
│ product_id (FK)  │      └──────────────────┘
│ user_id (FK)     │
│ quantity         │
│ unit_price       │
│ total_revenue    │
│ total_profit     │
│ sale_date        │
│ created_at       │
└──────────────────┘
```

---

## 🔐 Estratégia de Segurança (Princípio do Menor Privilégio)

### Níveis de Acesso

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | Próprio usuário | Sistema (trigger) | Próprio usuário | ❌ |
| user_roles | Próprio usuário | Apenas admin | Apenas admin | Apenas admin |
| products | Próprio usuário | Próprio usuário | Próprio usuário | Próprio usuário |
| product_stocks | Próprio usuário | Sistema | Sistema | ❌ |
| stock_movements | Próprio usuário | Próprio usuário | ❌ | Próprio usuário |
| sales | Próprio usuário | Próprio usuário | ❌ | Próprio usuário |

### Políticas RLS (Row Level Security)

Todas as tabelas terão RLS habilitado com políticas específicas:
- **Isolamento de dados**: Usuário só acessa seus próprios dados
- **Funções Security Definer**: Para verificação de roles sem recursão
- **Triggers**: Para atualização automática de estoque

---

## 📝 Scripts de Migração

### Migration 001: Tipos Enum

```sql
-- Tipos para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'premium');

-- Tipos para movimentação de estoque
CREATE TYPE public.movement_type AS ENUM ('entrada', 'saida');
CREATE TYPE public.movement_reason AS ENUM ('compra', 'venda', 'perda', 'ajuste');
```

### Migration 002: Tabela profiles

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para performance
CREATE INDEX idx_profiles_id ON public.profiles(id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Migration 003: Tabela user_roles

```sql
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Índice
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função Security Definer para verificar roles (evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para atribuir role padrão
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();
```

### Migration 004: Tabela products

```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL CHECK (purchase_price >= 0),
  sale_price DECIMAL(10, 2) CHECK (sale_price >= 0),
  desired_margin DECIMAL(5, 2) CHECK (desired_margin >= 0 AND desired_margin <= 100),
  additional_costs DECIMAL(10, 2) DEFAULT 0 CHECK (additional_costs >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_name ON public.products(name);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
```

### Migration 005: Tabela product_stocks

```sql
CREATE TABLE public.product_stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INTEGER DEFAULT 0 CHECK (minimum_stock >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice
CREATE INDEX idx_product_stocks_product_id ON public.product_stocks(product_id);

-- RLS
ALTER TABLE public.product_stocks ENABLE ROW LEVEL SECURITY;

-- Política usando JOIN com products
CREATE POLICY "Users can view own product stocks"
  ON public.product_stocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_stocks.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own product stocks"
  ON public.product_stocks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_stocks.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Trigger para criar estoque ao criar produto
CREATE OR REPLACE FUNCTION public.handle_new_product_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.product_stocks (product_id, current_stock, minimum_stock)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_product_created_stock
  AFTER INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_product_stock();
```

### Migration 006: Tabela stock_movements

```sql
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.movement_type NOT NULL,
  reason public.movement_reason NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_user_id ON public.stock_movements(user_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);

-- RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own stock movements"
  ON public.stock_movements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock movements"
  ON public.stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stock movements"
  ON public.stock_movements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION public.update_stock_on_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'entrada' THEN
      UPDATE public.product_stocks
      SET current_stock = current_stock + NEW.quantity,
          updated_at = NOW()
      WHERE product_id = NEW.product_id;
    ELSE
      UPDATE public.product_stocks
      SET current_stock = GREATEST(0, current_stock - NEW.quantity),
          updated_at = NOW()
      WHERE product_id = NEW.product_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Reverter a movimentação ao deletar
    IF OLD.type = 'entrada' THEN
      UPDATE public.product_stocks
      SET current_stock = GREATEST(0, current_stock - OLD.quantity),
          updated_at = NOW()
      WHERE product_id = OLD.product_id;
    ELSE
      UPDATE public.product_stocks
      SET current_stock = current_stock + OLD.quantity,
          updated_at = NOW()
      WHERE product_id = OLD.product_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_stock_movement_change
  AFTER INSERT OR DELETE ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stock_on_movement();
```

### Migration 007: Tabela sales

```sql
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_revenue DECIMAL(10, 2) NOT NULL CHECK (total_revenue >= 0),
  total_profit DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX idx_sales_product_id ON public.sales(product_id);
CREATE INDEX idx_sales_user_id ON public.sales(user_id);
CREATE INDEX idx_sales_sale_date ON public.sales(sale_date);

-- RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own sales"
  ON public.sales FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON public.sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON public.sales FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para criar movimentação de saída ao registrar venda
CREATE OR REPLACE FUNCTION public.handle_sale_stock_movement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.stock_movements (product_id, user_id, type, reason, quantity, notes)
  VALUES (NEW.product_id, NEW.user_id, 'saida', 'venda', NEW.quantity, 'Venda automática');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_sale_created
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sale_stock_movement();
```

---

## 🚀 Passo a Passo da Migração

### Fase 1: Preparação (Pré-migração)

1. **Backup dos dados atuais**
   - Exportar localStorage para JSON
   - Documentar estrutura atual

2. **Configurar Supabase**
   - Criar projeto no Supabase
   - Conectar ao Lovable Cloud
   - Configurar autenticação por email

### Fase 2: Execução das Migrations

1. **Executar migrations na ordem**
   - 001_enums.sql
   - 002_profiles.sql
   - 003_user_roles.sql
   - 004_products.sql
   - 005_product_stocks.sql
   - 006_stock_movements.sql
   - 007_sales.sql

2. **Validar triggers e políticas**
   - Testar criação de usuário
   - Verificar RLS policies
   - Testar isolamento de dados

### Fase 3: Adaptação do Código

1. **Criar cliente Supabase**
   - Configurar integrations/supabase/client.ts
   - Adicionar tipos TypeScript

2. **Migrar funções de storage.ts**
   - Substituir localStorage por queries Supabase
   - Manter interface existente

3. **Migrar funções de inventory.ts**
   - Adaptar para tabelas Supabase
   - Utilizar triggers automáticos

4. **Atualizar hooks**
   - useAuth.tsx → Supabase Auth
   - useProducts.tsx → Queries Supabase

### Fase 4: Testes e Validação

1. **Testes de segurança**
   - Verificar RLS em todas as tabelas
   - Testar isolamento entre usuários
   - Validar que admin não tem acesso indevido

2. **Testes funcionais**
   - CRUD de produtos
   - Movimentações de estoque
   - Registro de vendas

3. **Migração de dados existentes**
   - Script para importar dados do localStorage
   - Validar integridade

---

## 🛡️ Checklist de Segurança

- [ ] RLS habilitado em todas as tabelas
- [ ] Roles separados da tabela de profiles
- [ ] Funções SECURITY DEFINER com search_path definido
- [ ] Constraints de validação (CHECK) em todas as colunas numéricas
- [ ] Índices para queries frequentes
- [ ] Triggers para automação segura
- [ ] Nenhum dado sensível exposto publicamente
- [ ] Foreign keys com ON DELETE CASCADE
- [ ] Políticas específicas por operação (SELECT, INSERT, UPDATE, DELETE)

---

## 📊 Resumo das Tabelas

| Tabela | Colunas | RLS | Triggers |
|--------|---------|-----|----------|
| profiles | 5 | ✅ | Auto-create |
| user_roles | 4 | ✅ | Auto-assign default |
| products | 8 | ✅ | updated_at |
| product_stocks | 5 | ✅ | Auto-create on product |
| stock_movements | 7 | ✅ | Update stock |
| sales | 8 | ✅ | Create movement |

---

## 🔄 Ordem de Dependências

```
auth.users
    ├── profiles (1:1)
    ├── user_roles (1:N)
    └── products (1:N)
            ├── product_stocks (1:1)
            ├── stock_movements (1:N)
            └── sales (1:N)
```

---

*Documento criado em: Dezembro 2025*
*Versão: 1.0*
