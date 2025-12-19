import { Sale } from '../domain';
import { Tables } from '../../integrations/supabase/types';
import { Mapper } from './index';

type SaleRow = Tables<'sales'>;

export const SaleAdapter: Mapper<Sale, SaleRow> = {
    toDomain(row: SaleRow): Sale {
        // Re-calculating fields that might not be in DB but are in domain
        // DB has: total_revenue, total_profit.
        // Domain has: costAtSale, margin.

        return {
            id: row.id,
            userId: row.user_id,
            productId: row.product_id,
            quantity: row.quantity,
            unitPrice: Number(row.unit_price),
            totalPrice: Number(row.total_revenue),
            // Derived fields
            profit: Number(row.total_profit),
            costAtSale: Number(row.total_revenue) - Number(row.total_profit), // approximate
            margin: Number(row.total_revenue) > 0 ? (Number(row.total_profit) / Number(row.total_revenue)) * 100 : 0,

            saleDate: row.sale_date,
            customerName: null, // Missing in DB
            notes: null, // Missing in DB

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
            created_at: domain.createdAt,
        } as SaleRow;
    }
};
