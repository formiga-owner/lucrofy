import { ProductStock } from '../domain';
import { Tables } from '../../integrations/supabase/types';
import { Mapper } from './index';

type StockRow = Tables<'product_stocks'>;

export const StockAdapter: Mapper<ProductStock, StockRow> = {
    toDomain(row: StockRow): ProductStock {
        return {
            id: row.id,
            productId: row.product_id,
            currentStock: row.current_stock,
            minimumStock: row.minimum_stock,
            maximumStock: null, // Not in DB
            location: null, // Not in DB
            createdAt: row.updated_at, // Using updated_at as proxy for base entity requirements
            updatedAt: row.updated_at,
        };
    },

    toPersistence(domain: Partial<ProductStock>): StockRow {
        return {
            id: domain.id!,
            product_id: domain.productId!,
            current_stock: domain.currentStock || 0,
            minimum_stock: domain.minimumStock || 0,
            updated_at: new Date().toISOString(),
        } as StockRow;
    }
};
