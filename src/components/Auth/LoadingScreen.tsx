import React, { useEffect, useState } from 'react';
import { Sparkles, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoadingScreenProps {
  language: 'es' | 'en';
  connectionError?: boolean;
  onRetry?: () => void;
}

export function LoadingScreen({ language, connectionError = false, onRetry }: LoadingScreenProps) {
  const { manualReconnect } = useAuth();
  const [dots, setDots] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await manualReconnect();
      if (result.success && onRetry) {
        onRetry();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-6 shadow-lg">
            <WifiOff className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            FinanceApp
          </h1>
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <WifiOff className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">
                {language === 'es' ? 'Problema de Conexión' : 'Connection Issue'}
              </p>
            </div>
            <p className="text-sm text-red-700 mb-4">
              {language === 'es' 
                ? 'No se puede conectar con el servidor. Verifica tu conexión a internet.'
                : 'Cannot connect to server. Please check your internet connection.'
              }
            </p>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>
                {isRetrying 
                  ? (language === 'es' ? 'Reconectando...' : 'Reconnecting...')
                  : (language === 'es' ? 'Reintentar' : 'Retry')
                }
              </span>
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {language === 'es' 
              ? 'La aplicación intentará reconectar automáticamente'
              : 'The app will try to reconnect automatically'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          FinanceApp
        </h1>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 min-w-[120px] text-left">
            {language === 'es' ? 'Cargando' : 'Loading'}{dots}
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          {language === 'es' ? 'Verificando autenticación...' : 'Verifying authentication...'}
        </p>
      </div>
    </div>
  );
}