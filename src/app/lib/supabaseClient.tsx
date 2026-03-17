import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const missingSupabaseEnvMessage =
	'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
	if (!supabaseUrl || !supabaseAnonKey) {
		return null;
	}

	if (!supabaseClient) {
		supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
	}

	return supabaseClient;
};
