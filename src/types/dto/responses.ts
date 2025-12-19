// Response DTOs - Data sent from server to client
// These exclude sensitive data and internal fields

import type { MovementType, MovementReason, StockStatus, AppRole } from '../domain';

// Base response with pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Success/Error responses
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Responses
export interface AuthResponse {
  user: UserProfileResponse;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// User Profile Response - No internal IDs or sensitive data
export interface UserProfileResponse {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  business_name: string | null;
  phone: string | null;
  role: AppRole;
  created_at: string;
}

// Product Response - With calculated fields
export interface ProductResponse {
  id: string;
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
  created_at: string;
  updated_at: string;
  // Calculated fields
  total_cost: number;
  real_margin: number | null;
  ideal_price: number | null;
}

// Product with Stock Response
export interface ProductWithStockResponse extends ProductResponse {
  stock: StockResponse | null;
}

// Stock Response
export interface StockResponse {
  product_id: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number | null;
  location: string | null;
  status: StockStatus;
  updated_at: string;
}

// Stock Movement Response
export interface MovementResponse {
  id: string;
  product_id: string;
  product_name: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  unit_price: number | null;
  notes: string | null;
  movement_date: string;
  created_at: string;
}

// Sale Response
export interface SaleResponse {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  profit: number;
  margin: number;
  sale_date: string;
  customer_name: string | null;
  notes: string | null;
  created_at: string;
}

// Dashboard/Summary Responses
export interface DashboardSummaryResponse {
  total_products: number;
  active_products: number;
  average_margin: number;
  estimated_monthly_profit: number;
  low_stock_count: number;
  recent_sales_count: number;
}

export interface StockSummaryResponse {
  total_products: number;
  healthy_count: number;
  warning_count: number;
  critical_count: number;
  total_stock_value: number;
}

export interface DailySummaryResponse {
  date: string;
  total_entries: number;
  total_exits: number;
  entry_value: number;
  exit_value: number;
  balance: number;
  movements_count: number;
}

// Insights Responses
export interface ProductInsightResponse {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  average_margin: number;
  status: 'good' | 'warning' | 'danger';
}

export interface InsightsSummaryResponse {
  period: '7days' | '30days' | '90days';
  total_revenue: number;
  total_profit: number;
  total_cost: number;
  average_margin: number;
  best_seller: ProductInsightResponse | null;
  most_profitable: ProductInsightResponse | null;
  lowest_margin: ProductInsightResponse | null;
  products: ProductInsightResponse[];
  alerts: ProductAlertResponse[];
}

export interface ProductAlertResponse {
  product_id: string;
  product_name: string;
  type: 'loss' | 'low_margin' | 'low_stock' | 'no_sales';
  message: string;
  severity: 'warning' | 'critical';
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  createdAt: string;
}
