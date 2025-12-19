import { Profile } from '../domain';
import { Tables } from '../../integrations/supabase/types';
import { Mapper } from './index';

type ProfileRow = Tables<'profiles'>;

export const ProfileAdapter: Mapper<Profile, ProfileRow> = {
    toDomain(row: ProfileRow): Profile {
        return {
            id: row.id,
            userId: row.id, // In this schema, profile.id IS the user_id (1:1)
            fullName: row.name,
            avatarUrl: row.avatar_url,
            email: row.email,
            businessName: null, // Not in DB schema yet
            phone: null, // Not in DB schema yet
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    },

    toPersistence(domain: Partial<Profile>): ProfileRow {
        // Note: We can only persist what's in the schema
        return {
            id: domain.id!, // Required for Updates usually, or derived from context
            name: domain.fullName || '',
            avatar_url: domain.avatarUrl || null,
            created_at: domain.createdAt!, // distinct from updated_at
            updated_at: new Date().toISOString(),
        } as ProfileRow; // Cast because some fields might be mandatory but missing in partial
    }
};
