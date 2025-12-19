// Domain Entities - Backend/Internal Use Only
// These represent the database schema and should not be exposed directly to the client

export type AppRole = 'admin' | 'moderator' | 'user';

export type MovementType = 'entrada' | 'saida';

export type MovementReason = 'compra' | 'venda' | 'perda' | 'ajuste';

export type StockStatus = 'saudavel' | 'alerta' | 'critico';

// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User Profile - Internal representation
export interface Profile extends BaseEntity {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  email: string;
  businessName: string | null;
  phone: string | null;
}

// User Role - Internal representation
export interface UserRole {
  id: string;
  userId: string;
  role: AppRole;
}

// Product - Internal representation
export interface Product extends BaseEntity {
  userId: string;
  name: string;
  description: string | null;
  purchasePrice: number;
  salePrice: number | null;
  desiredMargin: number | null;
  shippingCost: number;
  taxCost: number;
  commissionCost: number;
  otherCosts: number;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  isActive: boolean;
}

// Product Stock - Internal representation
export interface ProductStock extends BaseEntity {
  productId: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number | null;
  location: string | null;
}

// Stock Movement - Internal representation
export interface StockMovement extends BaseEntity {
  productId: string;
  userId: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  unitPrice: number | null;
  notes: string | null;
  referenceId: string | null;
  movementDate: string;
}

// Sale - Internal representation
export interface Sale extends BaseEntity {
  userId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costAtSale: number;
  profit: number;
  margin: number;
  saleDate: string;
  customerName: string | null;
  notes: string | null;
}
