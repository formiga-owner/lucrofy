// Calculation services - encapsulated business logic

export interface ProductCosts {
  purchasePrice: number;
  additionalCosts: number; // frete, impostos, comissões
}

export interface CalculationResult {
  realMargin: number;
  idealPrice: number;
  expectedProfit: number;
  totalRevenue: number;
  profitPerUnit: number;
  breakEven: number;
  requiredRevenue: number;
}

/**
 * Calculate total cost (purchase price + additional costs)
 */
export const calculateTotalCost = (costs: ProductCosts): number => {
  return costs.purchasePrice + costs.additionalCosts;
};

/**
 * Calculate real margin percentage
 * margemReal = ((precoVenda - custoTotal) / precoVenda) * 100
 */
export const calculateRealMargin = (salePrice: number, totalCost: number): number => {
  if (salePrice <= 0) return 0;
  return ((salePrice - totalCost) / salePrice) * 100;
};

/**
 * Calculate ideal sale price based on desired margin
 * precoIdeal = custoTotal * (1 + margemDesejada/100)
 */
export const calculateIdealPrice = (totalCost: number, desiredMargin: number): number => {
  return totalCost / (1 - desiredMargin / 100);
};

/**
 * Calculate expected profit
 * lucroPrevisto = (precoVenda - custoTotal) * quantidade
 */
export const calculateExpectedProfit = (salePrice: number, totalCost: number, quantity: number): number => {
  return (salePrice - totalCost) * quantity;
};

/**
 * Calculate total revenue
 */
export const calculateTotalRevenue = (salePrice: number, quantity: number): number => {
  return salePrice * quantity;
};

/**
 * Calculate profit per unit
 */
export const calculateProfitPerUnit = (salePrice: number, totalCost: number): number => {
  return salePrice - totalCost;
};

/**
 * Calculate break-even quantity
 * breakEven = metaLucro / (precoVenda - custoTotal)
 */
export const calculateBreakEven = (profitGoal: number, salePrice: number, totalCost: number): number => {
  const profitPerUnit = salePrice - totalCost;
  if (profitPerUnit <= 0) return Infinity;
  return Math.ceil(profitGoal / profitPerUnit);
};

/**
 * Calculate required revenue to reach goal
 * faturamentoNecessario = metaLucro + (quantidade * custoTotal)
 */
export const calculateRequiredRevenue = (profitGoal: number, quantity: number, totalCost: number): number => {
  return profitGoal + (quantity * totalCost);
};

/**
 * Get all calculations for simulation
 */
export const getSimulationResults = (
  salePrice: number,
  totalCost: number,
  quantity: number,
  profitGoal?: number
): CalculationResult => {
  const realMargin = calculateRealMargin(salePrice, totalCost);
  const profitPerUnit = calculateProfitPerUnit(salePrice, totalCost);
  const expectedProfit = calculateExpectedProfit(salePrice, totalCost, quantity);
  const totalRevenue = calculateTotalRevenue(salePrice, quantity);
  
  return {
    realMargin,
    idealPrice: 0,
    expectedProfit,
    totalRevenue,
    profitPerUnit,
    breakEven: profitGoal ? calculateBreakEven(profitGoal, salePrice, totalCost) : 0,
    requiredRevenue: profitGoal ? calculateRequiredRevenue(profitGoal, quantity, totalCost) : 0,
  };
};

/**
 * Format currency (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
