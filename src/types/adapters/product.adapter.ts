import { Product } from '../domain';
import { Mapper } from './index';

// Tipo local enquanto as tabelas não existem no banco
interface ProductRow {
    id: string;
    user_id: string;
    name: string;
    purchase_price: number;
    sale_price: number | null;
    desired_margin: number | null;
    additional_costs: number | null;
    created_at: string;
    updated_at: string;
}

export const ProductAdapter: Mapper<Product, ProductRow> = {
    toDomain(row: ProductRow): Product {
        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            description: null,
            purchasePrice: Number(row.purchase_price),
            salePrice: row.sale_price ? Number(row.sale_price) : null,
            desiredMargin: row.desired_margin ? Number(row.desired_margin) : null,
            shippingCost: 0,
            taxCost: 0,
            commissionCost: 0,
            otherCosts: row.additional_costs ? Number(row.additional_costs) : 0,
            sku: null,
            barcode: null,
            category: null,
            isActive: true,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },

    toPersistence(domain: Partial<Product>): ProductRow {
        const additionalCosts = (domain.shippingCost || 0) +
            (domain.taxCost || 0) +
            (domain.commissionCost || 0) +
            (domain.otherCosts || 0);

        return {
            id: domain.id!,
            user_id: domain.userId!,
            name: domain.name || '',
            purchase_price: domain.purchasePrice || 0,
            sale_price: domain.salePrice ?? null,
            desired_margin: domain.desiredMargin ?? null,
            additional_costs: additionalCosts,
            created_at: domain.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }
};
