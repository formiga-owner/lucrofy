// Inventory management types and storage functions

export type MovementType = 'entrada' | 'saida';
export type MovementReason = 'compra' | 'venda' | 'perda' | 'ajuste';

export interface StockMovement {
  id: string;
  productId: string;
  userId: string;
  type: MovementType;
  quantity: number;
  reason: MovementReason;
  observation?: string;
  date: string;
  createdAt: string;
}

export interface ProductStock {
  productId: string;
  currentStock: number;
  minimumStock: number;
}

const STORAGE_KEYS = {
  MOVEMENTS: 'lucrofacil_movements',
  STOCK: 'lucrofacil_stock',
};

// Stock functions
export const getProductStocks = (): ProductStock[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STOCK);
  return data ? JSON.parse(data) : [];
};

export const getProductStock = (productId: string): ProductStock | undefined => {
  return getProductStocks().find(s => s.productId === productId);
};

export const setProductStock = (productId: string, currentStock: number, minimumStock: number): ProductStock => {
  const stocks = getProductStocks();
  const existingIndex = stocks.findIndex(s => s.productId === productId);
  
  const stock: ProductStock = { productId, currentStock, minimumStock };
  
  if (existingIndex >= 0) {
    stocks[existingIndex] = stock;
  } else {
    stocks.push(stock);
  }
  
  localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stocks));
  return stock;
};

export const updateStock = (productId: string, quantity: number, type: MovementType): ProductStock => {
  const stock = getProductStock(productId) || { productId, currentStock: 0, minimumStock: 5 };
  
  if (type === 'entrada') {
    stock.currentStock += quantity;
  } else {
    stock.currentStock = Math.max(0, stock.currentStock - quantity);
  }
  
  return setProductStock(productId, stock.currentStock, stock.minimumStock);
};

export const setMinimumStock = (productId: string, minimumStock: number): ProductStock => {
  const stock = getProductStock(productId) || { productId, currentStock: 0, minimumStock: 5 };
  return setProductStock(productId, stock.currentStock, minimumStock);
};

// Movement functions
export const getMovements = (): StockMovement[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
  return data ? JSON.parse(data) : [];
};

export const getMovementsByUser = (userId: string): StockMovement[] => {
  return getMovements().filter(m => m.userId === userId);
};

export const getMovementsByProduct = (productId: string): StockMovement[] => {
  return getMovements().filter(m => m.productId === productId);
};

export const getMovementsByDate = (userId: string, date: string): StockMovement[] => {
  return getMovementsByUser(userId).filter(m => m.date === date);
};

export const getMovementsByPeriod = (userId: string, startDate: string, endDate: string): StockMovement[] => {
  return getMovementsByUser(userId).filter(m => m.date >= startDate && m.date <= endDate);
};

export const saveMovement = (movement: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement => {
  const movements = getMovements();
  const newMovement: StockMovement = {
    ...movement,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  
  movements.push(newMovement);
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  
  // Update stock
  updateStock(movement.productId, movement.quantity, movement.type);
  
  return newMovement;
};

export const deleteMovement = (id: string): boolean => {
  const movements = getMovements();
  const movement = movements.find(m => m.id === id);
  if (!movement) return false;
  
  const filtered = movements.filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(filtered));
  
  // Reverse the stock change
  const reverseType: MovementType = movement.type === 'entrada' ? 'saida' : 'entrada';
  updateStock(movement.productId, movement.quantity, reverseType);
  
  return true;
};

// Summary calculations
export const getDailySummary = (userId: string, date: string) => {
  const movements = getMovementsByDate(userId, date);
  
  const totalEntradas = movements
    .filter(m => m.type === 'entrada')
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const totalSaidas = movements
    .filter(m => m.type === 'saida')
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const saldoDia = totalEntradas - totalSaidas;
  
  const productsMovedIds = [...new Set(movements.map(m => m.productId))];
  
  return {
    totalEntradas,
    totalSaidas,
    saldoDia,
    movimentacoes: movements,
    productsMovedIds,
  };
};

export const getStockStatus = (currentStock: number, minimumStock: number): 'healthy' | 'warning' | 'critical' => {
  if (currentStock <= 0) return 'critical';
  if (currentStock <= minimumStock) return 'warning';
  return 'healthy';
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};
