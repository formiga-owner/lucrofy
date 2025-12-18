// Domain Entities - Backend/Internal Use Only
// These represent the database schema and should not be exposed directly to the client

export type AppRole = 'admin' | 'moderator' | 'user';

export type MovementType = 'entrada' | 'saida';

export type MovementReason = 'compra' | 'venda' | 'perda' | 'ajuste';

export type StockStatus = 'healthy' | 'warning' | 'critical';

// Base entity with common fields
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User Profile - Internal representation
export interface Profile extends BaseEntity {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  business_name: string | null;
  phone: string | null;
}

// User Role - Internal representation
export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

// Product - Internal representation
export interface Product extends BaseEntity {
  user_id: string;
  name: string;
  description: string | null;
  purchase_price: number;
  sale_price: number | null;
  desired_margin: number | null;
  shipping_cost: number;
  tax_cost: number;
  commission_cost: number;
  other_costs: number;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  is_active: boolean;
}

// Product Stock - Internal representation
export interface ProductStock extends BaseEntity {
  product_id: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number | null;
  location: string | null;
}

// Stock Movement - Internal representation
export interface StockMovement extends BaseEntity {
  product_id: string;
  user_id: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  unit_price: number | null;
  notes: string | null;
  reference_id: string | null;
  movement_date: string;
}

// Sale - Internal representation
export interface Sale extends BaseEntity {
  user_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_at_sale: number;
  profit: number;
  margin: number;
  sale_date: string;
  customer_name: string | null;
  notes: string | null;
}
