import { Sale } from '../domain';
import { Mapper } from './index';

// Tipo local enquanto as tabelas não existem no banco
interface SaleRow {
    id: string;
    user_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_revenue: number;
    total_profit: number;
    sale_date: string;
    created_at: string;
}

export const SaleAdapter: Mapper<Sale, SaleRow> = {
    toDomain(row: SaleRow): Sale {
        return {
            id: row.id,
            userId: row.user_id,
            productId: row.product_id,
            quantity: row.quantity,
            unitPrice: Number(row.unit_price),
            totalPrice: Number(row.total_revenue),
            profit: Number(row.total_profit),
            costAtSale: Number(row.total_revenue) - Number(row.total_profit),
            margin: Number(row.total_revenue) > 0 ? (Number(row.total_profit) / Number(row.total_revenue)) * 100 : 0,
            saleDate: row.sale_date,
            customerName: null,
            notes: null,
            createdAt: row.created_at,
            updatedAt: row.created_at,
        };
    },

    toPersistence(domain: Partial<Sale>): SaleRow {
        return {
            id: domain.id!,
            product_id: domain.productId!,
            user_id: domain.userId!,
            quantity: domain.quantity || 1,
            unit_price: domain.unitPrice || 0,
            total_revenue: domain.totalPrice || 0,
            total_profit: domain.profit || 0,
            sale_date: domain.saleDate || new Date().toISOString().split('T')[0],
            created_at: domain.createdAt || new Date().toISOString(),
        };
    }
};
