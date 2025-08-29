import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!url) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
if (!anon) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const supabase = createClient(url, anon);

console.log('SB URL:', (url ?? '').slice(0, 28) + '...');
console.log('SB KEY starts with:', (anon ?? '').slice(0, 10) + '...');
