// LocalStorage-based data persistence

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  purchasePrice: number;
  salePrice?: number;
  desiredMargin?: number;
  additionalCosts: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  USER: 'lucrofacil_user',
  PRODUCTS: 'lucrofacil_products',
};

// User functions
export const getUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Product functions
export const getProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const getProductsByUser = (userId: string): Product[] => {
  return getProducts().filter(p => p.userId === userId);
};

export const getProductById = (id: string): Product | undefined => {
  return getProducts().find(p => p.id === id);
};

export const saveProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(newProduct);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
  return true;
};

// Auth simulation
export const simulateLogin = (email: string, password: string): User | null => {
  // Simple validation
  if (!email || !password || password.length < 6) return null;
  
  const existingUser = getUser();
  if (existingUser && existingUser.email === email) {
    return existingUser;
  }
  
  // Create new user session
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name: email.split('@')[0],
    createdAt: new Date().toISOString(),
  };
  setUser(user);
  return user;
};

export const simulateRegister = (email: string, password: string, name: string): User | null => {
  if (!email || !password || password.length < 6 || !name) return null;
  
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date().toISOString(),
  };
  setUser(user);
  return user;
};

export const logout = (): void => {
  removeUser();
};
