export interface Mapper<Domain, Persistence> {
    toDomain(raw: Persistence): Domain;
    toPersistence(domain: Partial<Domain>): Persistence;
}

export * from './profile.adapter';
export * from './product.adapter';
export * from './stock.adapter';
export * from './sale.adapter';
