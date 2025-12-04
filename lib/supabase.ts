import { createClient } from '@supabase/supabase-js';
import { OnboardingData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials. Data will not be saved to the database.');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

export async function saveBusiness(data: OnboardingData, status: 'draft' | 'onboarded' = 'onboarded') {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Skipping Supabase save: Missing credentials.');
        return { error: 'Missing credentials' };
    }

    try {
        const payload = {
            business_name: data.businessName,
            google_place_id: data.googlePlaceId,
            raw_data: data,
            status: status
        };

        let query = supabase.from('businesses');

        if (data.id) {
            // Update existing
            const { data: result, error } = await query
                .update(payload)
                .eq('id', data.id)
                .select()
                .maybeSingle();
            
            if (error) throw error;

            if (!result) {
                console.warn('Update returned no rows (record deleted or permission denied). Creating new record instead.');
                // Fallback to insert
                const { data: newResult, error: insertError } = await query
                    .insert([payload])
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                return { data: newResult };
            }

            return { data: result };
        } else {
            // Insert new
            const { data: result, error } = await query
                .insert([payload])
                .select()
                .single();
            
            if (error) throw error;
            return { data: result };
        }

    } catch (err) {
        console.error('Error saving to Supabase:', err);
        return { error: err };
    }
}

export async function getBusinesses() {
    if (!supabaseUrl || !supabaseAnonKey) return { data: [] };
    
    const { data, error } = await supabase
        .from('businesses')
        .select('id, business_name, status, created_at, google_place_id')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching businesses:', error);
        return { error };
    }
    return { data };
}

export async function getBusiness(id: number) {
    if (!supabaseUrl || !supabaseAnonKey) return { error: 'No credentials' };

    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching business:', error);
        return { error };
    }
    return { data };
}
