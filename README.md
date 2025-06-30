# FinanceApp MVP

Una aplicación completa de gestión de finanzas personales construida con React, TypeScript y Supabase.

## Características

- ✅ Autenticación completa con Supabase
- ✅ Gestión de perfiles de usuario
- ✅ Dashboard de finanzas personales
- ✅ Secciones: Cuentas, Inversiones, Estadísticas, Configuración
- ✅ Interfaz moderna y responsive
- ✅ Despliegue automático en Vercel

## Tecnologías

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Auth + Database)
- Vercel (Deployment)

## Configuración

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Configura variables de entorno
4. Ejecuta: `npm run dev`

## Despliegue

La aplicación está configurada para desplegarse automáticamente en Vercel.

---

**Última actualización:** $(date)

## 🚀 Características

- **Autenticación segura** con Supabase
- **Gestión de cuentas y presupuestos**
- **Seguimiento de inversiones y activos**
- **Estadísticas detalladas** con gráficos
- **Interfaz moderna** y responsive
- **Sincronización en tiempo real**
- **Multiidioma** (Español/Inglés)

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + Vite
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **APIs**: Finnhub (acciones), Exchange Rate API

## 📦 Instalación Local

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd project-supabase
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🌐 Despliegue en Vercel (Gratuito)

### Opción 1: Despliegue Automático desde GitHub

1. **Sube tu código a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
git push -u origin main
```

2. **Conecta con Vercel**
- Ve a [vercel.com](https://vercel.com)
- Crea una cuenta gratuita
- Haz clic en "New Project"
- Importa tu repositorio de GitHub
- Configura las variables de entorno:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

3. **¡Listo!** Tu app estará disponible en `https://tu-app.vercel.app`

### Opción 2: Despliegue Manual

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Desplegar**
```bash
vercel
```

3. **Configurar variables de entorno**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto
- Ve a [supabase.com](https://supabase.com)
- Crea una cuenta gratuita
- Crea un nuevo proyecto

### 2. Configurar Base de Datos

Ejecuta este SQL en el editor SQL de Supabase:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  alias TEXT,
  age INTEGER DEFAULT 18,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Obtener Credenciales
- Ve a Settings > API
- Copia la URL y la anon key
- Configúralas en tus variables de entorno

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting del código
```

## 📱 Uso de la Aplicación

1. **Registro/Login**: Crea una cuenta o inicia sesión
2. **Configuración de Perfil**: Completa tu información personal
3. **Dashboard**: Navega por las diferentes secciones:
   - 📊 **Cuentas**: Gestiona presupuestos y gastos
   - 💰 **Inversiones**: Seguimiento de activos
   - 📈 **Estadísticas**: Gráficos y análisis
   - ⚙️ **Configuración**: Preferencias y perfil

## 🆘 Solución de Problemas

### Error de Conexión
- Verifica las variables de entorno
- Asegúrate de que Supabase esté configurado correctamente
- Revisa la consola del navegador para errores

### Problemas de Build
```bash
npm run build
```
Si hay errores, verifica:
- Todas las dependencias están instaladas
- Las variables de entorno están configuradas
- No hay errores de TypeScript

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas:
1. Revisa la documentación de Supabase
2. Verifica los logs en la consola del navegador
3. Abre un issue en GitHub

---

**¡Disfruta gestionando tus finanzas! 💰**

---

**🚀 ¡Aplicación lista para producción! - Desplegada en Vercel con variables de entorno configuradas.** 