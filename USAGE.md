# Guía de Uso - VTEX Context Reader

## 🚀 Cómo Probar la Extensión

### 1. Preparar el Entorno
1. Abre VS Code en la carpeta del proyecto
2. Presiona `F5` para ejecutar la extensión en modo debug
3. Se abrirá una nueva ventana de VS Code con la extensión cargada

### 2. Probar con un Proyecto VTEX
1. En la nueva ventana, abre la carpeta `examples/` de este proyecto
2. La extensión detectará automáticamente el `manifest.json`
3. Verás la sección "VTEX Context" en el explorador

### 3. Funcionalidades a Probar

#### Vista de Contexto VTEX
- **Ubicación**: Panel del explorador → "VTEX Context"
- **Contenido**: 
  - Información del proyecto
  - Archivos de configuración
  - Componentes React
  - Servicios Node.js
  - Schemas GraphQL

#### Comandos Disponibles
- `Ctrl+Shift+P` → "VTEX: Show Context"
- `Ctrl+Shift+P` → "VTEX: Refresh Context"

#### Integración con Copilot
1. Abre cualquier archivo `.tsx` en la carpeta `examples/react/`
2. GitHub Copilot ahora tendrá contexto específico de VTEX
3. Prueba escribir comentarios como:
   ```typescript
   // Create a VTEX component that uses product context
   ```
4. Copilot sugerirá código específico para VTEX

### 4. Archivos de Ejemplo Incluidos

```
examples/
├── manifest.json          # Configuración de app VTEX
├── service.json          # Configuración de servicio
├── react/
│   └── ProductInfo.tsx   # Componente React VTEX
├── node/
│   └── clients/
│       └── index.ts      # Cliente Node.js VTEX
└── graphql/
    └── schema.graphql    # Schema GraphQL
```

### 5. Contexto Proporcionado

#### Para archivos React (`.tsx`, `.jsx`):
```typescript
// VTEX React Component Context
// This is a VTEX IO React component
// Available VTEX hooks: useProduct, useOrderForm, useSession, usePixel
// Use CSS Handles for styling: useCssHandles
// Available VTEX apps: vtex.store, vtex.product-context, vtex.order-manager
```

#### Para archivos Node.js (`.ts`, `.js` en `/node/`):
```typescript
// VTEX Node Service Context
// This is a VTEX IO Node.js service
// Available clients: IOClients (masterdata, checkout, catalog, etc.)
// Use ctx for request context and state
// Service config: memory=256MB, timeout=2000ms
```

#### Para archivos GraphQL (`.gql`, `.graphql`):
```graphql
# VTEX GraphQL Context
# This is a VTEX IO GraphQL schema/resolver
# Use @cacheControl for query optimization
# Available directives: @cacheControl, @deprecated
```

### 6. Desarrollo y Debug

#### Ver Logs de la Extensión
1. `Ctrl+Shift+P` → "Developer: Show Running Extensions"
2. Buscar "VTEX Context Reader"
3. Click en el icono de terminal para ver logs

#### Output Channels
- `View` → `Output` → Seleccionar:
  - "VTEX Context Reader"
  - "VTEX Context Provider"

### 7. Características Avanzadas

#### Detección Automática de Proyecto
- La extensión detecta automáticamente si estás en un proyecto VTEX
- Se activa cuando encuentra `manifest.json` o `service.json`
- Actualiza el contexto cuando modificas archivos de configuración

#### Actualización en Tiempo Real
- Los cambios en `manifest.json`, `service.json` o `schema.json` refrescan automáticamente el contexto
- No necesitas reiniciar VS Code

#### Soporte para Múltiples Builders
- **React**: Contexto para componentes y hooks VTEX
- **Node**: Contexto para servicios backend y clients
- **GraphQL**: Contexto para schemas y resolvers
- **Store**: Contexto para temas de tienda

---

## 🛠️ Para Desarrolladores

### Modificar la Extensión
1. Edita los archivos en `src/`
2. El modo watch compilará automáticamente
3. Presiona `Ctrl+R` en la ventana de extensión para recargar

### Agregar Nuevos Tipos de Contexto
1. Modifica `types.ts` para nuevos tipos
2. Actualiza `parser.ts` para detectar nuevos archivos
3. Modifica `contextProvider.ts` para el nuevo contexto

### Testing
```bash
npm test              # Ejecutar tests
npm run watch-tests   # Watch mode para tests
```

---

¡Disfruta desarrollando con VTEX y GitHub Copilot! 🎉
