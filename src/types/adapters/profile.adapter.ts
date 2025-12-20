import { Profile } from '../domain';
import { Mapper } from './index';

// Tipo local enquanto as tabelas não existem no banco
interface ProfileRow {
    id: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export const ProfileAdapter: Mapper<Profile, ProfileRow> = {
    toDomain(row: ProfileRow): Profile {
        return {
            id: row.id,
            userId: row.id,
            fullName: row.name,
            avatarUrl: row.avatar_url,
            email: row.email,
            businessName: null,
            phone: null,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },

    toPersistence(domain: Partial<Profile>): ProfileRow {
        return {
            id: domain.id!,
            name: domain.fullName || null,
            email: domain.email || null,
            avatar_url: domain.avatarUrl || null,
            created_at: domain.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }
};
