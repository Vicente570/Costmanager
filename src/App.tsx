import React, { Suspense, lazy } from 'react';

// Lazy loading de componentes para evitar errores de importación
const AuthForm = lazy(() => import('./components/Auth/AuthForm').then(module => ({ default: module.AuthForm })));
const ProfileSetupForm = lazy(() => import('./components/Auth/ProfileSetupForm').then(module => ({ default: module.ProfileSetupForm })));
const LoadingScreen = lazy(() => import('./components/Auth/LoadingScreen').then(module => ({ default: module.LoadingScreen })));
const Header = lazy(() => import('./components/Layout/Header').then(module => ({ default: module.Header })));
const Sidebar = lazy(() => import('./components/Layout/Sidebar').then(module => ({ default: module.Sidebar })));
const SectionRenderer = lazy(() => import('./components/Sections/SectionRenderer').then(module => ({ default: module.SectionRenderer })));

// Lazy loading del contexto
const AppProvider = lazy(() => import('./context/AppContext').then(module => ({ default: module.AppProvider })));

// Hook de autenticación con manejo de errores
function useAuthWithErrorHandling() {
  try {
    const { useAuth } = require('./hooks/useAuth');
    return useAuth();
  } catch (error) {
    console.error('Error loading auth hook:', error);
    return {
      user: null,
      profile: null,
      loading: false,
      needsProfileSetup: false,
      connectionError: 'Error loading authentication'
    };
  }
}

// Componente de fallback para errores
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl mb-8 shadow-lg">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">
          Error Detectado
        </h1>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <p className="text-gray-600 mb-6">
            Se ha detectado un error en la aplicación. Aquí están los detalles:
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700 font-mono text-sm mb-2">{error.message}</p>
            <details className="text-red-600 text-xs">
              <summary className="cursor-pointer hover:text-red-800">Ver stack trace</summary>
              <pre className="mt-2 whitespace-pre-wrap overflow-x-auto">{error.stack}</pre>
            </details>
          </div>

          <div className="space-y-4">
            <button
              onClick={resetErrorBoundary}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mr-4"
            >
              Intentar de Nuevo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Recargar Página
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Información de Debug:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• URL: {window.location.href}</li>
              <li>• User Agent: {navigator.userAgent}</li>
              <li>• Timestamp: {new Date().toISOString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error!}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  console.log('🚀 App starting...');
  
  try {
    const { user, profile, loading, needsProfileSetup, connectionError } = useAuthWithErrorHandling();

    console.log('🔍 App render state:', { 
      hasUser: !!user, 
      hasProfile: !!profile, 
      loading, 
      needsProfileSetup,
      connectionError
    });

    // Verificar si las variables de entorno están configuradas
    const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
    console.log('🔧 Supabase config check:', { 
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      hasConfig: hasSupabaseConfig 
    });

    // Si no hay configuración de Supabase, mostrar versión demo
    if (!hasSupabaseConfig) {
      console.log('📋 Showing demo version (no Supabase config)');
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <AppProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
              <div className="text-center max-w-2xl mx-auto px-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-8 shadow-lg">
                  <span className="text-3xl">💰</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  FinanceApp MVP
                </h1>
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    🚀 ¡Aplicación Desplegada Exitosamente!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Tu aplicación está funcionando correctamente en Vercel. Para activar todas las funcionalidades, necesitas configurar Supabase.
                  </p>
                  
                  <div className="space-y-4 text-left">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">✓</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Despliegue Completado</h3>
                        <p className="text-sm text-gray-600">La aplicación está en línea y accesible</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-600 text-sm">!</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Configuración Pendiente</h3>
                        <p className="text-sm text-gray-600">Variables de entorno de Supabase no configuradas</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Próximos pasos:</h3>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Crear proyecto en Supabase.com</li>
                      <li>2. Configurar variables de entorno en Vercel</li>
                      <li>3. ¡Disfrutar de tu app completa!</li>
                    </ol>
                  </div>

                  <div className="mt-6">
                    <a 
                      href="https://supabase.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Configurar Supabase →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AppProvider>
        </Suspense>
      );
    }

    // Mostrar loading solo mientras se verifica auth
    if (loading) {
      console.log('⏳ Showing loading screen');
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <LoadingScreen language="es" connectionError={connectionError} />
        </Suspense>
      );
    }

    // No hay usuario - mostrar login
    if (!user) {
      console.log('🔐 No user, showing auth form');
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <AuthForm language="es" />
        </Suspense>
      );
    }

    // Usuario sin perfil - mostrar setup
    if (needsProfileSetup || !profile) {
      console.log('👤 User needs profile setup');
      return (
        <Suspense fallback={<div>Loading...</div>}>
          <ProfileSetupForm language="es" />
        </Suspense>
      );
    }

    // Usuario completo - mostrar app
    console.log('✅ User authenticated with profile, showing main app');
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AppProvider>
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-16">
              <Header />
              <main className="flex-1 p-6 overflow-y-auto">
                <SectionRenderer />
              </main>
            </div>
          </div>
        </AppProvider>
      </Suspense>
    );
  } catch (error) {
    console.error('Error in AppContent:', error);
    throw error; // Re-throw para que ErrorBoundary lo capture
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;