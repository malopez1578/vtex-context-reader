# Cómo Verificar que GitHub Copilot Tiene el Contexto de VTEX

## 🔍 Métodos de Verificación

### 1. **Verificación Directa en VS Code**

#### A. Revisar el Output Channel
1. Ve a **View > Output** (o `Ctrl+Shift+U`)
2. En el dropdown, selecciona **"VTEX Context Provider"**
3. Deberías ver logs como:
   ```
   Initialized VTEX context for 1 project(s): vtex-context-demo
   VTEX context available for file: /path/to/your/file.tsx
   ```

#### B. Usar los Comandos de la Extensión
1. Abre Command Palette (`Ctrl+Shift+P`)
2. Ejecuta: `VTEX: Show Context`
3. Deberías ver información del contexto actual

### 2. **Pruebas Prácticas con Copilot**

#### A. Test en Componente React de VTEX
Crea un archivo `test-component.tsx` en una carpeta `/react/` de tu proyecto VTEX:

```tsx
import React from 'react';
import { useCssHandles } from 'vtex.css-handles';

const TestComponent = () => {
  // Escribe este comentario y presiona Tab para que Copilot complete:
  // Create a VTEX component that displays product information
  
  return (
    <div>
      {/* Copilot debería sugerir código específico de VTEX aquí */}
    </div>
  );
};

export default TestComponent;
```

#### B. Test en Service de Node.js
Crea un archivo `test-service.ts` en `/node/`:

```typescript
import { IOClients } from '@vtex/api';

export class TestService {
  constructor(private clients: IOClients) {}
  
  // Escribe: "async getProduct" y deja que Copilot complete
  // Debería sugerir métodos específicos de VTEX
}
```

#### C. Test en GraphQL Schema
Crea un archivo en `/graphql/`:

```graphql
# Escribe: "type Product" y deja que Copilot complete
# Debería sugerir campos típicos de productos VTEX
```

### 3. **Indicadores Visuales**

#### A. Tree View de VTEX
- En el Explorer de VS Code, deberías ver una sección **"VTEX Context"**
- Debe mostrar la estructura de tu proyecto VTEX

#### B. Comportamiento de Copilot
- Las sugerencias deberían incluir imports específicos de VTEX
- Debe reconocer patrones como `useCssHandles`, `IOClients`, etc.
- Sugerencias contextuales basadas en el tipo de archivo

### 4. **Comando de Diagnóstico**

Ejecuta este comando en la terminal para verificar el contexto:
```bash
# Comando de diagnóstico rápido
code --list-extensions | grep vtex
```

## 5. **Comandos de Verificación Integrados**

La extensión incluye comandos específicos para verificar el contexto:

### A. **VTEX: Test Copilot Context**
- Abre Command Palette (`Ctrl+Shift+P`)
- Ejecuta: `VTEX: Test Copilot Context`
- Este comando:
  - ✅ Verifica proyectos VTEX detectados
  - ✅ Muestra contexto del archivo activo
  - ✅ Crea un archivo de prueba automáticamente
  - ✅ Proporciona instrucciones específicas

### B. **VTEX: Verify Copilot Context**
- Ejecuta: `VTEX: Verify Copilot Context`
- Proporciona instrucciones paso a paso para verificación manual

## 6. **Señales de que el Contexto Está Funcionando**

### ✅ **Indicadores Positivos**
- Copilot sugiere imports específicos de VTEX: `from 'vtex.css-handles'`
- Reconoce patrones como `useCssHandles`, `IOClients`
- Sugiere estructuras típicas de componentes VTEX
- Propone nombres de variables comunes en VTEX (`CSS_HANDLES`, `productQuery`)
- Autocompleta con APIs y métodos específicos de VTEX

### ❌ **Indicadores de Problemas**
- Sugerencias son completamente genéricas
- No reconoce imports de VTEX
- No sugiere patrones específicos del framework
- Contexto no aparece en Output Channel

## 7. **Troubleshooting**

### Problema: "No VTEX projects detected"
**Solución:**
1. Verifica que tienes `manifest.json` en tu workspace
2. Ejecuta `VTEX: Refresh Context`
3. Revisa el Output Channel para errores

### Problema: "Context no aparece para archivo activo"
**Solución:**
1. Asegúrate de que el archivo está dentro de un proyecto VTEX
2. Verifica la estructura de carpetas (`/react/`, `/node/`)
3. Cambia a otro archivo y regresa

### Problema: "Copilot no sugiere código VTEX"
**Solución:**
1. Ejecuta `VTEX: Test Copilot Context`
2. Verifica que estás en un archivo con extensión correcta (`.tsx`, `.ts`)
3. Intenta escribir comentarios descriptivos antes del código

## 8. **Ejemplos de Prueba Específicos**

### Test 1: Componente React VTEX
```tsx
// En un archivo .tsx dentro de /react/
import React from 'react';
// Escribe: "import { useCssHandles }" - Copilot debería completar con "from 'vtex.css-handles'"

const MyComponent = () => {
  // Escribe: "const CSS_HANDLES = [" - Debería sugerir handles típicos
  
  // Escribe: "const handles = useCssHandles(" - Debería usar CSS_HANDLES
  
  return (
    // Escribe: "<div className={handles." - Debería sugerir los handles
  );
};
```

### Test 2: Service Node.js VTEX
```typescript
// En un archivo .ts dentro de /node/
import { IOClients } from '@vtex/api';

export class MyService {
  constructor(private clients: IOClients) {}
  
  // Escribe: "async getProduct(" - Debería sugerir parámetros típicos de VTEX
  
  // Escribe: "this.clients." - Debería sugerir clientes disponibles
}
```

### Test 3: GraphQL VTEX
```graphql
# En un archivo .graphql
# Escribe: "type Product" - Debería sugerir campos típicos de productos VTEX
```

## 9. **Verificación Avanzada**

### Copilot Chat
Si tienes Copilot Chat habilitado:
1. Pregunta: "How do I create a VTEX component?"
2. Debería reconocer el contexto VTEX y dar respuestas específicas

### IntelliSense
- Al escribir código VTEX, IntelliSense debería mostrar autocompletado contextual
- Las sugerencias deberían priorizar patrones VTEX

---

## 🎯 **Resumen de Verificación**

**✅ El contexto está funcionando si:**
- Los comandos de prueba muestran proyectos detectados
- Output Channel muestra logs de contexto
- Copilot sugiere código específico de VTEX
- Tree view muestra estructura del proyecto

**❌ Necesita ajustes si:**
- No se detectan proyectos VTEX
- Sugerencias de Copilot son genéricas
- No aparecen logs en Output Channel
- Tree view está vacío

**💡 Siguiente paso:** Ejecuta `VTEX: Test Copilot Context` para una verificación completa automatizada.
