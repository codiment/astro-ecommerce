# AstroShop Frontend

Un e-commerce moderno desarrollado con Astro, TypeScript y Tailwind CSS.

## 🚀 Características

- **Framework**: Astro con TypeScript estricto
- **Estilos**: Tailwind CSS para un diseño moderno y responsivo
- **Autenticación**: Sistema completo de login y registro
- **Productos**: Catálogo con filtros, búsqueda y ordenamiento
- **Carrito**: Gestión completa del carrito de compras
- **Componentes**: Arquitectura modular y reutilizable
- **API**: Conexión segura con el backend

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── AuthNav.astro   # Navegación con autenticación
├── layouts/            # Layouts de página
│   └── Layout.astro    # Layout principal
├── pages/              # Páginas de la aplicación
│   ├── index.astro     # Página de inicio
│   ├── login.astro     # Página de login
│   ├── register.astro  # Página de registro
│   ├── products.astro  # Catálogo de productos
│   └── cart.astro      # Carrito de compras
├── services/           # Servicios de API
│   └── api.ts          # Cliente de API
├── styles/             # Estilos globales
│   └── global.css      # Estilos de Tailwind
├── types/              # Definiciones de tipos
│   └── index.ts        # Tipos TypeScript
└── env.d.ts           # Tipos de entorno
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Backend ejecutándose en `http://localhost:3000`

### Instalación

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   
   Edita el archivo `.env` con la URL de tu backend:
   ```env
   PUBLIC_API_URL=http://localhost:3000
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:4321
   ```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run astro` - Ejecuta comandos de Astro CLI

## 🎨 Funcionalidades Implementadas

### 🏠 Página de Inicio
- Hero section atractivo
- Secciones de características
- Call-to-action para productos y registro
- Diseño responsivo

### 🔐 Sistema de Autenticación

#### Login (`/login`)
- Formulario de inicio de sesión
- Validación en tiempo real
- Manejo de errores
- Redirección automática

#### Registro (`/register`)
- Formulario de registro completo
- Validación de contraseñas
- Confirmación de términos y condiciones
- Validación de email

### 🛍️ Catálogo de Productos (`/products`)
- Grid responsivo de productos
- Búsqueda por nombre y descripción
- Filtros por categoría
- Ordenamiento por precio, nombre y fecha
- Estados de carga, error y vacío
- Agregar productos al carrito

### 🛒 Carrito de Compras (`/cart`)
- Visualización de productos agregados
- Actualización de cantidades
- Eliminación de productos
- Cálculo automático de totales
- Resumen del pedido con impuestos y envío

### 🧭 Navegación Inteligente
- Navegación que cambia según el estado de autenticación
- Badge del carrito con contador de productos
- Menú desplegable de usuario
- Logout funcional

## 🔌 Integración con Backend

### Servicio de API (`src/services/api.ts`)

El proyecto incluye un cliente de API completo que maneja:

- **Autenticación**: Login, registro, obtener usuario actual
- **Productos**: Listar productos, obtener producto individual
- **Carrito**: Obtener carrito, agregar/actualizar/eliminar items
- **Tokens**: Gestión automática de tokens JWT
- **Errores**: Manejo centralizado de errores

### Endpoints Utilizados

```typescript
// Autenticación
POST /auth/login
POST /auth/register
GET  /auth/me

// Productos
GET  /products
GET  /products/:id

// Carrito
GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id
```

## 🎯 Tipos TypeScript

El proyecto utiliza TypeScript estricto con tipos bien definidos:

- `User` - Información del usuario
- `Product` - Datos del producto
- `Cart` y `CartItem` - Estructura del carrito
- `ApiResponse<T>` - Respuestas de API tipadas
- `LoginCredentials` y `RegisterData` - Datos de autenticación

## 🎨 Diseño y UX

### Tailwind CSS
- Diseño completamente responsivo
- Componentes con estados hover y focus
- Paleta de colores consistente
- Animaciones y transiciones suaves

### Experiencia de Usuario
- Estados de carga con spinners
- Mensajes de error claros
- Validación en tiempo real
- Feedback visual inmediato
- Navegación intuitiva

## 🔒 Seguridad

- Tokens JWT almacenados de forma segura
- Validación tanto en cliente como servidor
- Sanitización de inputs
- Manejo seguro de errores
- Headers de autorización automáticos

## 📱 Responsividad

El diseño es completamente responsivo con breakpoints:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

## 🚀 Despliegue

Para construir para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/` y pueden ser servidos desde cualquier servidor web estático.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Verifica que el backend esté ejecutándose
3. Comprueba las variables de entorno
4. Revisa la consola del navegador para errores

---

**Desarrollado con ❤️ usando Astro, TypeScript y Tailwind CSS**
