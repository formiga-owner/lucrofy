import { Product } from './storage';
import { calculateTotalCost, calculateRealMargin } from './calculations';

export type PeriodFilter = '7days' | '30days' | '90days';

export interface SimulatedSale {
  productId: string;
  quantity: number;
  date: Date;
  revenue: number;
  profit: number;
}

export interface ProductInsight {
  id: string;
  name: string;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  margin: number;
  status: 'good' | 'warning' | 'danger';
}

export interface InsightsSummary {
  mostProfitableProduct: ProductInsight | null;
  bestSellingProduct: ProductInsight | null;
  lowestMarginProduct: ProductInsight | null;
  totalProfit: number;
  totalRevenue: number;
  averageMargin: number;
}

// Generate simulated sales data based on products
export const generateSimulatedSales = (products: Product[], period: PeriodFilter): SimulatedSale[] => {
  const sales: SimulatedSale[] = [];
  const now = new Date();
  
  const daysMap: Record<PeriodFilter, number> = {
    '7days': 7,
    '30days': 30,
    '90days': 90,
  };
  
  const days = daysMap[period];
  
  products.forEach(product => {
    if (!product.salePrice) return;
    
    const totalCost = calculateTotalCost({
      purchasePrice: product.purchasePrice,
      additionalCosts: product.additionalCosts,
    });
    
    // Generate random sales for each product based on period
    const salesCount = Math.floor(Math.random() * (days / 3)) + 1;
    
    for (let i = 0; i < salesCount; i++) {
      const daysAgo = Math.floor(Math.random() * days);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      
      const quantity = Math.floor(Math.random() * 10) + 1;
      const revenue = product.salePrice * quantity;
      const profit = (product.salePrice - totalCost) * quantity;
      
      sales.push({
        productId: product.id,
        quantity,
        date,
        revenue,
        profit,
      });
    }
  });
  
  return sales;
};

// Calculate product insights from sales data
export const calculateProductInsights = (
  products: Product[],
  sales: SimulatedSale[],
  marginThreshold: number = 15
): ProductInsight[] => {
  const productMap = new Map<string, Product>();
  products.forEach(p => productMap.set(p.id, p));
  
  const insightsMap = new Map<string, ProductInsight>();
  
  // Initialize insights for products with sales
  sales.forEach(sale => {
    const product = productMap.get(sale.productId);
    if (!product) return;
    
    const existing = insightsMap.get(sale.productId);
    
    if (existing) {
      existing.quantitySold += sale.quantity;
      existing.totalRevenue += sale.revenue;
      existing.totalProfit += sale.profit;
    } else {
      const totalCost = calculateTotalCost({
        purchasePrice: product.purchasePrice,
        additionalCosts: product.additionalCosts,
      });
      const margin = product.salePrice 
        ? calculateRealMargin(product.salePrice, totalCost) 
        : 0;
      
      insightsMap.set(sale.productId, {
        id: product.id,
        name: product.name,
        quantitySold: sale.quantity,
        totalRevenue: sale.revenue,
        totalProfit: sale.profit,
        margin,
        status: getMarginStatus(margin, marginThreshold),
      });
    }
  });
  
  // Recalculate margin status based on final values
  insightsMap.forEach(insight => {
    if (insight.totalRevenue > 0) {
      insight.margin = (insight.totalProfit / insight.totalRevenue) * 100;
      insight.status = getMarginStatus(insight.margin, marginThreshold);
    }
  });
  
  return Array.from(insightsMap.values());
};

// Get status based on margin
export const getMarginStatus = (margin: number, threshold: number = 15): 'good' | 'warning' | 'danger' => {
  if (margin < 0) return 'danger';
  if (margin < threshold) return 'warning';
  return 'good';
};

// Calculate summary from insights
export const calculateInsightsSummary = (insights: ProductInsight[]): InsightsSummary => {
  if (insights.length === 0) {
    return {
      mostProfitableProduct: null,
      bestSellingProduct: null,
      lowestMarginProduct: null,
      totalProfit: 0,
      totalRevenue: 0,
      averageMargin: 0,
    };
  }
  
  const sortedByProfit = [...insights].sort((a, b) => b.totalProfit - a.totalProfit);
  const sortedByQuantity = [...insights].sort((a, b) => b.quantitySold - a.quantitySold);
  const sortedByMargin = [...insights].sort((a, b) => a.margin - b.margin);
  
  const totalProfit = insights.reduce((sum, i) => sum + i.totalProfit, 0);
  const totalRevenue = insights.reduce((sum, i) => sum + i.totalRevenue, 0);
  const averageMargin = insights.reduce((sum, i) => sum + i.margin, 0) / insights.length;
  
  return {
    mostProfitableProduct: sortedByProfit[0] || null,
    bestSellingProduct: sortedByQuantity[0] || null,
    lowestMarginProduct: sortedByMargin[0] || null,
    totalProfit,
    totalRevenue,
    averageMargin,
  };
};

// Get products with alerts
export const getProductAlerts = (
  insights: ProductInsight[],
  marginThreshold: number = 15
): { product: ProductInsight; message: string }[] => {
  const alerts: { product: ProductInsight; message: string }[] = [];
  
  insights.forEach(insight => {
    if (insight.totalProfit < 0) {
      alerts.push({
        product: insight,
        message: `Este produto está gerando prejuízo de ${formatCurrency(Math.abs(insight.totalProfit))}. Revise os custos ou preço de venda.`,
      });
    } else if (insight.margin < marginThreshold && insight.quantitySold > 0) {
      alerts.push({
        product: insight,
        message: `Este produto vende bem, mas gera pouco lucro (margem de ${insight.margin.toFixed(1)}%). Considere revisar o preço ou custos.`,
      });
    }
  });
  
  return alerts;
};

// Generate automatic insight text
export const generateInsightText = (summary: InsightsSummary, period: PeriodFilter): string => {
  const periodText: Record<PeriodFilter, string> = {
    '7days': 'nos últimos 7 dias',
    '30days': 'nos últimos 30 dias',
    '90days': 'nos últimos 90 dias',
  };
  
  if (!summary.mostProfitableProduct) {
    return `Nenhuma venda encontrada ${periodText[period]}.`;
  }
  
  const parts: string[] = [];
  
  if (summary.mostProfitableProduct) {
    parts.push(
      `${periodText[period].charAt(0).toUpperCase() + periodText[period].slice(1)}, o produto "${summary.mostProfitableProduct.name}" foi responsável pela maior parte do lucro (${formatCurrency(summary.mostProfitableProduct.totalProfit)}).`
    );
  }
  
  if (summary.bestSellingProduct && summary.bestSellingProduct.id !== summary.mostProfitableProduct?.id) {
    parts.push(
      `O produto mais vendido foi "${summary.bestSellingProduct.name}" com ${summary.bestSellingProduct.quantitySold} unidades.`
    );
  }
  
  if (summary.lowestMarginProduct && summary.lowestMarginProduct.margin < 15) {
    parts.push(
      `Atenção: "${summary.lowestMarginProduct.name}" tem a menor margem (${summary.lowestMarginProduct.margin.toFixed(1)}%).`
    );
  }
  
  return parts.join(' ');
};

// Format currency helper
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Get period label
export const getPeriodLabel = (period: PeriodFilter): string => {
  const labels: Record<PeriodFilter, string> = {
    '7days': 'Últimos 7 dias',
    '30days': 'Últimos 30 dias',
    '90days': 'Últimos 90 dias',
  };
  return labels[period];
};
