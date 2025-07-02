import React from 'react';
import { useCssHandles } from 'vtex.css-handles';

// 🧪 ARCHIVO DE PRUEBA PARA VERIFICAR CONTEXTO DE COPILOT
// Usa este archivo para verificar que Copilot está recibiendo contexto de VTEX

const CSS_HANDLES = [
  'container',
  'productTitle',
  'productPrice',
  'addToCartButton'
] as const;

interface ProductDemoProps {
  productName: string;
  price: number;
}

const ProductDemo: React.FC<ProductDemoProps> = ({ productName, price }) => {
  const handles = useCssHandles(CSS_HANDLES);

  // 🔍 PRUEBA 1: Escribe "const handleClick" y presiona Tab
  // Copilot debería sugerir una función relacionada con VTEX
  

  // 🔍 PRUEBA 2: Escribe "// Add product to cart" y presiona Tab
  // Copilot debería sugerir código específico de VTEX para agregar al carrito
  

  // 🔍 PRUEBA 3: En el return, escribe "<div className={handles." y presiona Tab
  // Copilot debería sugerir los handles definidos arriba
  
  return (
    <div className={handles.container}>
      <h1 className={handles.productTitle}>{productName}</h1>
      <span className={handles.productPrice}>${price}</span>
      
      {/* 🔍 PRUEBA 4: Escribe un botón y observa si Copilot sugiere patrones VTEX */}
      
    </div>
  );
};

// 🔍 PRUEBA 5: Escribe "export default" y observa si completa correctamente
export default ProductDemo;

/* 
📋 INSTRUCCIONES PARA VERIFICAR CONTEXTO:

1. ✅ Abre este archivo en VS Code
2. ✅ Ejecuta el comando: "VTEX: Test Copilot Context"
3. ✅ Revisa el Output Channel "VTEX Context Provider"
4. ✅ Prueba las sugerencias en las líneas marcadas con 🔍
5. ✅ Observa si Copilot sugiere:
   - Imports específicos de VTEX
   - Patterns de componentes VTEX
   - Uso correcto de CSS Handles
   - Funciones relacionadas con productos

✅ SEÑALES DE ÉXITO:
- Copilot sugiere "from 'vtex.css-handles'" al importar
- Reconoce patrones como useCssHandles
- Sugiere nombres típicos de VTEX (CSS_HANDLES, productQuery, etc.)
- Propone código específico para ecommerce

❌ SEÑALES DE PROBLEMAS:
- Sugerencias completamente genéricas
- No reconoce imports de VTEX
- No sugiere patrones específicos del framework
*/
