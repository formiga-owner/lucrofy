import { useState, useEffect, useCallback } from 'react';
import { Product, getProductsByUser, saveProduct, updateProduct, deleteProduct } from '@/lib/storage';
import { useAuth } from './useAuth';
import { calculateTotalCost, calculateRealMargin, calculateIdealPrice } from '@/lib/calculations';

export interface ProductWithCalculations extends Product {
  totalCost: number;
  realMargin?: number;
  idealPrice?: number;
}

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductWithCalculations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const enrichProduct = (product: Product): ProductWithCalculations => {
    const totalCost = calculateTotalCost({
      purchasePrice: product.purchasePrice,
      additionalCosts: product.additionalCosts,
    });

    return {
      ...product,
      totalCost,
      realMargin: product.salePrice ? calculateRealMargin(product.salePrice, totalCost) : undefined,
      idealPrice: product.desiredMargin ? calculateIdealPrice(totalCost, product.desiredMargin) : undefined,
    };
  };

  const loadProducts = useCallback(() => {
    if (!user) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    
    const userProducts = getProductsByUser(user.id);
    setProducts(userProducts.map(enrichProduct));
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = (productData: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;
    
    const newProduct = saveProduct({
      ...productData,
      userId: user.id,
    });
    
    const enrichedProduct = enrichProduct(newProduct);
    setProducts(prev => [...prev, enrichedProduct]);
    return enrichedProduct;
  };

  const editProduct = (id: string, updates: Partial<Product>) => {
    const updated = updateProduct(id, updates);
    if (updated) {
      const enrichedProduct = enrichProduct(updated);
      setProducts(prev => prev.map(p => p.id === id ? enrichedProduct : p));
      return enrichedProduct;
    }
    return null;
  };

  const removeProduct = (id: string) => {
    const success = deleteProduct(id);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
    return success;
  };

  // Dashboard calculations
  const averageMargin = products.length > 0
    ? products.reduce((acc, p) => acc + (p.realMargin || 0), 0) / products.filter(p => p.realMargin !== undefined).length || 0
    : 0;

  const totalProducts = products.length;

  const estimatedMonthlyProfit = products.reduce((acc, p) => {
    if (p.salePrice && p.totalCost) {
      return acc + (p.salePrice - p.totalCost) * 10; // Assuming 10 units/month placeholder
    }
    return acc;
  }, 0);

  return {
    products,
    isLoading,
    addProduct,
    editProduct,
    removeProduct,
    refreshProducts: loadProducts,
    stats: {
      averageMargin,
      totalProducts,
      estimatedMonthlyProfit,
    },
  };
};
