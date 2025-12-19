import { Product } from '../domain';
import { Tables } from '../../integrations/supabase/types';
import { Mapper } from './index';

type ProductRow = Tables<'products'>;

export const ProductAdapter: Mapper<Product, ProductRow> = {
    toDomain(row: ProductRow): Product {
        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            description: null, // Not in DB
            purchasePrice: Number(row.purchase_price),
            salePrice: row.sale_price ? Number(row.sale_price) : null,
            desiredMargin: row.desired_margin ? Number(row.desired_margin) : null,

            // Aggregating back from single field 'additional_costs'
            shippingCost: 0,
            taxCost: 0,
            commissionCost: 0,
            otherCosts: row.additional_costs ? Number(row.additional_costs) : 0,

            sku: null,
            barcode: null,
            category: null,
            isActive: true, // Defaulting to true as no status column

            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },

    toPersistence(domain: Partial<Product>): ProductRow {
        // Summing costs into additional_costs
        const additionalCosts = (domain.shippingCost || 0) +
            (domain.taxCost || 0) +
            (domain.commissionCost || 0) +
            (domain.otherCosts || 0);

        return {
            id: domain.id!,
            user_id: domain.userId!,
            name: domain.name || '',
            purchase_price: domain.purchasePrice || 0,
            sale_price: domain.salePrice,
            desired_margin: domain.desiredMargin,
            additional_costs: additionalCosts,
            created_at: domain.createdAt,
            updated_at: new Date().toISOString(),
        } as ProductRow;
    }
};
