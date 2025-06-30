import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile, checkConnection, reconnect } from '../lib/supabase';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  needsProfileSetup: boolean;
  connectionError: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  username: string;
  alias: string;
  age: number;
}

interface SignInData {
  email: string;
  password: string;
}

interface ProfileSetupData {
  username: string;
  alias: string;
  age: number;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    needsProfileSetup: false,
    connectionError: false
  });

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    let reconnectTimeoutId: NodeJS.Timeout;

    const initAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        
        // Verificar conectividad primero
        const isConnected = await checkConnection();
        if (!isConnected) {
          console.warn('⚠️ No connection to Supabase, will retry...');
          setAuthState(prev => ({ ...prev, connectionError: true, loading: false }));
          
          // Intentar reconectar después de 3 segundos
          reconnectTimeoutId = setTimeout(() => {
            if (mounted) {
              initAuth();
            }
          }, 3000);
          return;
        }

        setAuthState(prev => ({ ...prev, connectionError: false }));
        
        // Timeout de seguridad - máximo 8 segundos
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⏰ Auth timeout reached, stopping loading');
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        }, 8000);
        
        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (mounted) {
            clearTimeout(timeoutId);
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              needsProfileSetup: false,
              connectionError: true
            });
          }
          return;
        }

        if (!mounted) return;

        if (session?.user) {
          console.log('✅ Session found, loading profile...');
          
          try {
            // Cargar perfil con timeout
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (!mounted) return;
            clearTimeout(timeoutId);

            if (profileError && profileError.code !== 'PGRST116') {
              // Error real, no solo "no rows"
              console.error('❌ Profile error:', profileError);
              setAuthState({
                user: session.user,
                profile: null,
                session: session,
                loading: false,
                needsProfileSetup: true,
                connectionError: false
              });
              return;
            }

            if (profile) {
              console.log('✅ Profile loaded successfully');
              setAuthState({
                user: session.user,
                profile: profile,
                session: session,
                loading: false,
                needsProfileSetup: false,
                connectionError: false
              });
            } else {
              console.log('👤 User exists but no profile found, needs setup');
              setAuthState({
                user: session.user,
                profile: null,
                session: session,
                loading: false,
                needsProfileSetup: true,
                connectionError: false
              });
            }
          } catch (profileError) {
            console.error('❌ Profile loading error:', profileError);
            if (mounted) {
              clearTimeout(timeoutId);
              setAuthState({
                user: session.user,
                profile: null,
                session: session,
                loading: false,
                needsProfileSetup: true,
                connectionError: false
              });
            }
          }
        } else {
          console.log('📭 No session found');
          if (mounted) {
            clearTimeout(timeoutId);
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              needsProfileSetup: false,
              connectionError: false
            });
          }
        }
      } catch (error) {
        console.error('❌ Auth init error:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            needsProfileSetup: false,
            connectionError: true
          });
        }
      }
    };

    // Función para manejar cambios de visibilidad
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authState.connectionError) {
        console.log('🔄 Page became visible, checking connection...');
        initAuth();
      }
    };

    // Función para manejar reconexión automática
    const handleReconnect = async () => {
      if (authState.connectionError) {
        console.log('🔄 Attempting to reconnect...');
        const success = await reconnect();
        if (success && mounted) {
          console.log('✅ Reconnection successful');
          initAuth();
        }
      }
    };

    initAuth();

    // Event listeners para cambios de visibilidad y conectividad
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleReconnect);
    window.addEventListener('focus', handleReconnect);

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event);

        if (event === 'SIGNED_OUT' || !session) {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            needsProfileSetup: false,
            connectionError: false
          });
        } else if (session?.user) {
          setAuthState(prev => ({ ...prev, loading: true }));
          
          try {
            // Cargar perfil
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (mounted) {
              setAuthState({
                user: session.user,
                profile: profile || null,
                session: session,
                loading: false,
                needsProfileSetup: !profile,
                connectionError: false
              });
            }
          } catch (error) {
            console.error('❌ Profile loading error in listener:', error);
            if (mounted) {
              setAuthState({
                user: session.user,
                profile: null,
                session: session,
                loading: false,
                needsProfileSetup: true,
                connectionError: false
              });
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleReconnect);
      window.removeEventListener('focus', handleReconnect);
    };
  }, [authState.connectionError]);

  const signUp = async (data: SignUpData) => {
    setActionLoading(true);
    try {
      console.log('📝 Signing up user:', data.email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if (authError) {
        // More flexible error checking for existing users
        const errorMessage = authError.message.toLowerCase();
        if (errorMessage.includes('already registered') || 
            errorMessage.includes('already exists') ||
            authError.code === 'user_already_exists') {
          return { 
            success: false, 
            message: 'User already registered',
            code: 'user_already_registered'
          };
        }
        throw authError;
      }

      if (authData.user) {
        console.log('✅ User created, creating profile...');
        
        // Crear perfil inmediatamente después del registro
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            username: data.username,
            alias: data.alias,
            age: data.age
          });

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
          throw profileError;
        }

        console.log('✅ Profile created successfully');
        return { success: true, message: 'Usuario registrado exitosamente' };
      }

      return { success: false, message: 'Error al crear usuario' };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      return { 
        success: false, 
        message: error.message || 'Error al registrar usuario' 
      };
    } finally {
      setActionLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setActionLoading(true);
    try {
      console.log('🔑 Signing in user:', data.email);

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) throw error;

      return { success: true, message: 'Inicio de sesión exitoso' };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      return { 
        success: false, 
        message: error.message || 'Error al iniciar sesión' 
      };
    } finally {
      setActionLoading(false);
    }
  };

  const signOut = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      return { 
        success: false, 
        message: error.message || 'Error al cerrar sesión' 
      };
    } finally {
      setActionLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'username' | 'alias' | 'age'>>) => {
    setActionLoading(true);
    try {
      if (!authState.user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', authState.user.id);

      if (error) throw error;

      // Actualizar estado local
      setAuthState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null
      }));
      
      return { success: true, message: 'Perfil actualizado exitosamente' };
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      return { 
        success: false, 
        message: error.message || 'Error al actualizar perfil' 
      };
    } finally {
      setActionLoading(false);
    }
  };

  const setupProfile = async (data: ProfileSetupData) => {
    setActionLoading(true);
    try {
      if (!authState.user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: authState.user.id,
          username: data.username,
          alias: data.alias,
          age: data.age
        });

      if (error) throw error;

      // Actualizar estado local
      const newProfile: UserProfile = {
        id: authState.user.id,
        username: data.username,
        alias: data.alias,
        age: data.age,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setAuthState(prev => ({
        ...prev,
        profile: newProfile,
        needsProfileSetup: false
      }));
      
      return { success: true, message: 'Perfil configurado exitosamente' };
    } catch (error: any) {
      console.error('❌ Profile setup error:', error);
      return { 
        success: false, 
        message: error.message || 'Error al configurar perfil' 
      };
    } finally {
      setActionLoading(false);
    }
  };

  // Función para reconexión manual
  const manualReconnect = async () => {
    setActionLoading(true);
    try {
      console.log('🔄 Manual reconnection attempt...');
      const success = await reconnect();
      if (success) {
        console.log('✅ Manual reconnection successful');
        // Reinicializar auth después de reconexión exitosa
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthState(prev => ({ ...prev, loading: true }));
          // El useEffect se encargará de cargar el perfil
        }
      }
      return { success, message: success ? 'Reconexión exitosa' : 'Error en reconexión' };
    } catch (error: any) {
      console.error('❌ Manual reconnection error:', error);
      return { success: false, message: error.message || 'Error en reconexión' };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    setupProfile,
    manualReconnect,
    loading: authState.loading || actionLoading, // Combinar ambos estados de carga
    isAuthenticated: !!authState.user && !!authState.profile && !authState.needsProfileSetup
  };
}