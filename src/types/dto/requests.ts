// Request DTOs - Data sent from client to server
// These define the shape of data clients can send

import type { MovementType, MovementReason } from '../domain';

// Auth Requests
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  business_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Profile Requests
export interface UpdateProfileRequest {
  full_name?: string;
  business_name?: string;
  phone?: string;
  avatar_url?: string;
}

// Product Requests
export interface CreateProductRequest {
  name: string;
  description?: string;
  purchase_price: number;
  sale_price?: number;
  desired_margin?: number;
  shipping_cost?: number;
  tax_cost?: number;
  commission_cost?: number;
  other_costs?: number;
  sku?: string;
  barcode?: string;
  category?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  purchase_price?: number;
  sale_price?: number;
  desired_margin?: number;
  shipping_cost?: number;
  tax_cost?: number;
  commission_cost?: number;
  other_costs?: number;
  sku?: string;
  barcode?: string;
  category?: string;
  is_active?: boolean;
}

// Stock Requests
export interface SetStockRequest {
  product_id: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  location?: string;
}

export interface UpdateStockRequest {
  current_stock?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  location?: string;
}

// Stock Movement Requests
export interface CreateMovementRequest {
  product_id: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  unit_price?: number;
  notes?: string;
  movement_date?: string;
}

// Sale Requests
export interface CreateSaleRequest {
  product_id: string;
  quantity: number;
  unit_price: number;
  sale_date?: string;
  customer_name?: string;
  notes?: string;
}

// Query/Filter Requests
export interface PaginationRequest {
  page?: number;
  limit?: number;
}

export interface DateRangeRequest {
  start_date: string;
  end_date: string;
}

export interface ProductFilterRequest extends PaginationRequest {
  category?: string;
  is_active?: boolean;
  search?: string;
}

export interface MovementFilterRequest extends PaginationRequest, Partial<DateRangeRequest> {
  product_id?: string;
  type?: MovementType;
  reason?: MovementReason;
}

export interface SaleFilterRequest extends PaginationRequest, Partial<DateRangeRequest> {
  product_id?: string;
}
