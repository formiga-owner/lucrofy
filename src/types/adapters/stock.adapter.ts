import { ProductStock } from '../domain';
import { Mapper } from './index';

// Tipo local enquanto as tabelas não existem no banco
interface StockRow {
    id: string;
    product_id: string;
    current_stock: number;
    minimum_stock: number;
    updated_at: string;
}

export const StockAdapter: Mapper<ProductStock, StockRow> = {
    toDomain(row: StockRow): ProductStock {
        return {
            id: row.id,
            productId: row.product_id,
            currentStock: row.current_stock,
            minimumStock: row.minimum_stock,
            maximumStock: null,
            location: null,
            createdAt: row.updated_at,
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
        };
    }
};
