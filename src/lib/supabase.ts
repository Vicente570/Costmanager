import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Función para crear el cliente de Supabase de manera segura
function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Supabase client will not be available.');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Persistir sesión en localStorage
        persistSession: true,
        // Auto-refresh de tokens
        autoRefreshToken: true,
        // Detectar cambios de conectividad
        detectSessionInUrl: true,
        // Configuración de storage
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Configuración de storage key
        storageKey: 'supabase-auth-token',
      },
      // Configuración de realtime
      realtime: {
        // Reconexión automática
        params: {
          eventsPerSecond: 10,
        },
      },
      // Configuración global
      global: {
        // Headers por defecto
        headers: {
          'X-Client-Info': 'finance-app-mvp',
        },
      },
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Crear el cliente de Supabase
export const supabase = createSupabaseClient();

// Función para verificar conectividad
export const checkConnection = async () => {
  if (!supabase) {
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Función para reconectar
export const reconnect = async () => {
  if (!supabase) {
    return false;
  }
  
  try {
    await supabase.auth.refreshSession();
    return true;
  } catch {
    return false;
  }
};

// Función para obtener el cliente de Supabase
export const getSupabaseClient = () => {
  return supabase;
};

// Función para verificar si Supabase está disponible
export const isSupabaseAvailable = () => {
  return supabase !== null;
};

// Tipos para la base de datos
export interface UserProfile {
  id: string;
  username: string;
  alias: string;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface UserAppData {
  id: string;
  user_id: string;
  data_type: string;
  data: any;
  created_at: string;
  updated_at: string;
}