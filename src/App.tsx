import React from 'react';

function App() {
  return (
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
  );
}

export default App;